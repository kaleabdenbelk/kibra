import chalk from "chalk";
import ora from "ora";
import path from "path";
import {
	DEFAULT_REGISTRY_URL,
	STABLE_VERSIONS,
} from "../constants/versions.js";
import type { KibraConfig, RegistryItem } from "../types/index.js";
import { KibraError } from "../utils/errors.js";
import { runCommand } from "../utils/exec.js";
import { fsUtils } from "../utils/fs.js";
import { prompts } from "../utils/prompts.js";

async function fetchComponent(
	componentName: string,
	registryUrl: string,
): Promise<RegistryItem> {
	const cleanUrl = registryUrl.replace(/\/$/, "");

	if (cleanUrl.startsWith("http")) {
		const response = await fetch(
			`${cleanUrl}/${componentName.toLowerCase()}.json`,
		);
		if (!response.ok) {
			throw new Error(`Component "${componentName}" not found at ${cleanUrl}`);
		}
		return (await response.json()) as RegistryItem;
	} else {
		const localPath = path.resolve(
			cleanUrl,
			`${componentName.toLowerCase()}.json`,
		);
		if (!(await fsUtils.pathExists(localPath))) {
			throw new Error(`Component "${componentName}" not found at ${localPath}`);
		}
		return (await fsUtils.readJson(localPath)) as RegistryItem;
	}
}

export async function addComponent(
	componentName: string,
	options: { registry?: string; dryRun?: boolean },
) {
	const projectRoot = process.cwd();
	const configPath = path.join(projectRoot, "kibra.json");
	const fsOptions = { dryRun: options.dryRun };

	let config: KibraConfig = {
		aliases: {
			components: "@/components/ui",
			utils: "@/lib/utils",
		},
		registries: {
			default: DEFAULT_REGISTRY_URL,
		},
	};

	if (await fsUtils.pathExists(configPath)) {
		config = await fsUtils.readJson(configPath);
	}

	let targetRegistryUrl = options.registry;
	let actualComponentName = componentName;

	// Use specific registry if specified via alias: registryAlias/componentName
	if (componentName.includes("/")) {
		const [alias, name] = componentName.split("/");
		if (config.registries[alias]) {
			targetRegistryUrl = config.registries[alias];
			actualComponentName = name;
		}
	}

	const registries = targetRegistryUrl
		? [targetRegistryUrl]
		: Object.values(config.registries);

	if (registries.length === 1 && registries[0] === DEFAULT_REGISTRY_URL && !options.registry) {
		console.log(chalk.yellow(`\n ⚠️ Note: Using default public registry (${DEFAULT_REGISTRY_URL})`));
	}

	const resolvedComponents = new Map<string, RegistryItem>();
	const allNpmDeps = new Set<string>();

	async function collect(name: string) {
		if (resolvedComponents.has(name.toLowerCase())) return;

		let component: RegistryItem | null = null;
		let lastError: Error | null = null;

		for (const url of registries) {
			try {
				component = await fetchComponent(name, url);
				if (component) break;
			} catch (e: any) {
				lastError = e;
			}
		}

		if (!component) {
			throw new KibraError(
				`Component "${name}" not found in any registry.`,
				lastError?.message,
			);
		}

		resolvedComponents.set(name.toLowerCase(), component);

		if (component.dependencies) {
			component.dependencies.forEach((dep) => allNpmDeps.add(dep));
		}

		if (component.registryDependencies) {
			for (const depName of component.registryDependencies) {
				await collect(depName);
			}
		}
	}

	const spinner = ora(`Resolving ${actualComponentName}...`).start();
	try {
		await collect(actualComponentName);
		spinner.stop();

		const componentsToCreate: string[] = [];
		const componentsToUpdate: string[] = [];
		const missingNpmDeps: string[] = [];

		const pkgPath = fsUtils.join(projectRoot, "package.json");
		let existingPkgDeps: Record<string, string> = {};
		if (await fsUtils.pathExists(pkgPath)) {
			const pkg = await fsUtils.readJson(pkgPath);
			existingPkgDeps = { ...pkg.dependencies, ...pkg.devDependencies };
		}

		// Determine what needs installation
		for (const [name, component] of resolvedComponents) {
			let alreadyExists = false;
			for (const file of component.files) {
				let target = file.target;
				if (file.type === "registry:component") {
					target = file.target.replace(
						"components/ui/",
						config.aliases.components.replace("@/", "") + "/",
					);
				} else if (file.type === "registry:lib") {
					target = file.target.replace(
						"lib/utils.ts",
						config.aliases.utils.replace("@/", "") + ".ts",
					);
				}

				if (await fsUtils.pathExists(fsUtils.join(projectRoot, target))) {
					alreadyExists = true;
				}
			}
			if (alreadyExists) componentsToUpdate.push(name);
			else componentsToCreate.push(name);
		}

		for (const dep of allNpmDeps) {
			if (!existingPkgDeps[dep]) missingNpmDeps.push(dep);
		}

		if (
			componentsToCreate.length === 0 &&
			componentsToUpdate.length === 0 &&
			missingNpmDeps.length === 0
		) {
			console.log(chalk.green("\n ✨ Everything is already up to date!"));
			return;
		}

		console.log(chalk.bold("\n Summary:"));
		if (componentsToCreate.length > 0)
			console.log(chalk.cyan(`   Create: ${componentsToCreate.join(", ")}`));
		if (componentsToUpdate.length > 0)
			console.log(chalk.yellow(`   Update: ${componentsToUpdate.join(", ")}`));
		if (missingNpmDeps.length > 0)
			console.log(chalk.magenta(`   Install: ${missingNpmDeps.join(", ")}`));

		const confirm = await prompts.confirm({
			message: "Proceed with installation?",
			default: true,
		});
		if (!confirm) return;

		// Execution Phase
		if (missingNpmDeps.length > 0) {
			if (options.dryRun) {
				console.log(chalk.dim(` [DRY RUN] Would install dependencies: ${missingNpmDeps.join(", ")}`));
			} else {
				const pmSpinner = ora("Installing dependencies...").start();
				const pkg = await fsUtils.readJson(pkgPath);
				const pm = pkg.packageManager
					? pkg.packageManager.split("@")[0]
					: (await fsUtils.pathExists(path.join(projectRoot, "pnpm-lock.yaml")))
						? "pnpm"
						: "npm";
				const installCmd = pm === "npm" ? "install" : "add";

				const depsWithVersions = missingNpmDeps.map((dep) => {
					const version = (STABLE_VERSIONS as any)[dep] || "latest";
					return `${dep}@${version}`;
				});

				await runCommand(pm, [installCmd, ...depsWithVersions], {
					cwd: projectRoot,
				});
				pmSpinner.succeed("Dependencies installed.");
			}
		}

		const writeSpinner = ora(options.dryRun ? "Simulating file writes..." : "Writing component files...").start();
		for (const [name, component] of resolvedComponents) {
			for (const file of component.files) {
				let finalTarget = file.target;
				if (file.type === "registry:component") {
					finalTarget = file.target.replace(
						"components/ui/",
						config.aliases.components.replace("@/", "") + "/",
					);
				} else if (file.type === "registry:lib") {
					finalTarget = file.target.replace(
						"lib/utils.ts",
						config.aliases.utils.replace("@/", "") + ".ts",
					);
				}

				const targetPath = fsUtils.join(projectRoot, finalTarget);

				// Template Interpolation
				let content = file.content || "";
				content = content.replace(/{{UTILS_ALIAS}}/g, config.aliases.utils);
				content = content.replace(
					/{{COMPONENTS_ALIAS}}/g,
					config.aliases.components,
				);

				// Fallback for legacy templates (Reviewer was right about this)
				content = content.replace(
					/['"]@\/lib\/utils['"]/g,
					`'${config.aliases.utils}'`,
				);

				await fsUtils.writeFile(targetPath, content, fsOptions);
			}
		}
		writeSpinner.succeed(options.dryRun ? "Simulation complete." : "Files written.");
		console.log(
			chalk.green(`\n ✨ ${options.dryRun ? "Simulated addition" : "Successfully added"} ${actualComponentName}!`),
		);
	} catch (error) {
		spinner.stop();
		throw error;
	}
}
