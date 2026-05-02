import chalk from "chalk";
import ora from "ora";
import path from "path";
import {
	DEFAULT_REGISTRY_URL,
	STABLE_VERSIONS,
} from "../constants/versions.js";
import type { KibraConfig } from "../types/index.js";
import { runCommand } from "../utils/exec.js";
import { fsUtils } from "../utils/fs.js";
import { prompts } from "../utils/prompts.js";
import { interpolateTemplate } from "../utils/templates.js";
import { runNativeWindSetup } from "./setup.js";
import { API_PATTERN, THEME_HOOK_PATTERN } from "../utils/patterns.js";

interface CreateOptions {
	template?: "minimal" | "full";
	clean?: boolean;
	noIcons?: boolean;
}

export async function createProject(
	projectName: string,
	options: CreateOptions = {},
) {
	const projectPath = fsUtils.resolve(process.cwd(), projectName);

	if (!options.template) {
		options.template = (await prompts.select({
			message: "Choose a project template:",
			choices: [
				{
					value: "full",
					name: "Full (Includes API patterns, hooks, and core components)",
				},
				{ value: "minimal", name: "Minimal (Only basic NativeWind setup)" },
			],
			default: "full",
		})) as "full" | "minimal";
	}

	const setupNativeWind = await prompts.confirm({
		message: "Do you want to setup NativeWind (Tailwind CSS) automatically?",
		default: true,
	});

	let iconLibrary = options.template === "minimal" || options.noIcons ? "none" : "lucide";
	if (options.template !== "minimal" && !options.noIcons) {
		iconLibrary = await prompts.select({
			message: "Which icon library do you want to use?",
			choices: [
				{ value: "lucide", name: "Lucide Icons (Recommended, cross-platform)" },
				{ value: "expo-symbols", name: "Expo Symbols (Good for iOS-only)" },
				{ value: "none", name: "None (Skip icons)" },
			],
			default: "lucide",
		});
	}

	const packageManager = await prompts.select({
		message: "Which package manager do you want to use?",
		choices: [
			{ value: "pnpm", name: "pnpm" },
			{ value: "npm", name: "npm" },
			{ value: "yarn", name: "yarn" },
			{ value: "bun", name: "bun" },
			{ value: "none", name: "None (Skip Installation)" },
		],
		default: "pnpm",
	});

	const latestDeps = await prompts.confirm({
		message:
			'Use "latest" versions for dependencies instead of pinned stable versions?',
		default: false,
	});

	console.log(
		chalk.blue(
			`\n 🚀 Creating a new Expo project in: ${chalk.bold(projectPath)}`,
		),
	);

	try {
		// 1. Git Initialization
		const gitSpinner = ora("Initializing Git repository...").start();
		await runCommand("git", ["init", projectName]);
		gitSpinner.succeed("Git repository initialized.");

		// 2. Expo App Creation
		const expoSpinner = ora(
			`Creating Expo app using ${packageManager}...`,
		).start();
		const effectivePM = packageManager === "none" ? "npm" : packageManager;
		const createCmd =
			effectivePM === "pnpm" ? "pnpx" : effectivePM === "bun" ? "bunx" : "npx";

		await runCommand(
			createCmd,
			["create-expo-app", projectName, "--template", "tabs", "--no-install"],
			{
				env: { ...process.env, NPM_CONFIG_YES: "true" },
			},
		);
		expoSpinner.succeed("Expo app template created.");

		// 3. Optional NativeWind Setup
		if (setupNativeWind) {
			await runNativeWindSetup(projectPath, "none", iconLibrary);
		}

		// 4. Inject Dependencies
		console.log(
			chalk.cyan("\n 💉 Injecting dependencies into package.json..."),
		);
		const pkgPath = fsUtils.join(projectPath, "package.json");
		const pkg = await fsUtils.readJson(pkgPath);

		const extraDeps: Record<string, string> = {};
		const depList = [
			"nativewind",
			"tailwindcss",
			"react-native-reanimated",
			"react-native-worklets",
			"react-native-safe-area-context",
			"react-native-screens",
			"class-variance-authority",
			"clsx",
			"tailwind-merge",
		];

		for (const dep of depList) {
			extraDeps[dep] = latestDeps ? "latest" : (STABLE_VERSIONS as any)[dep];
		}

		if (iconLibrary === "lucide") {
			extraDeps["lucide-react-native"] = latestDeps
				? "latest"
				: STABLE_VERSIONS["lucide-react-native"];
			extraDeps["react-native-svg"] = latestDeps
				? "latest"
				: STABLE_VERSIONS["react-native-svg"];
		} else if (iconLibrary === "expo-symbols") {
			extraDeps["expo-symbols"] = latestDeps
				? "latest"
				: STABLE_VERSIONS["expo-symbols"];
		}

		pkg.dependencies = { ...pkg.dependencies, ...extraDeps };
		pkg.devDependencies = {
			...pkg.devDependencies,
			"babel-preset-expo": STABLE_VERSIONS["babel-preset-expo"],
		};

		await fsUtils.writeJson(pkgPath, pkg, { spaces: 2 });

		// 4.b Update app.json for path aliases
		const appJsonPath = fsUtils.join(projectPath, "app.json");
		if (await fsUtils.pathExists(appJsonPath)) {
			try {
				const appJson = await fsUtils.readJson(appJsonPath);
				appJson.expo = appJson.expo || {};
				appJson.expo.experiments = appJson.expo.experiments || {};
				appJson.expo.experiments.tsconfigPaths = true;
				await fsUtils.writeJson(appJsonPath, appJson, { spaces: 2 });
			} catch (e) {
				// Non-critical
			}
		}

		// 5. Create default kibra.json
		const config: KibraConfig = {
			aliases: {
				components: "@/components/ui",
				utils: "@/lib/utils",
			},
			registries: {
				default: DEFAULT_REGISTRY_URL,
			},
		};
		await fsUtils.writeJson(fsUtils.join(projectPath, "kibra.json"), config, {
			spaces: 2,
		});

		// 6. Pre-install Core Components (Button & Utils)
		if (!options.clean) {
			console.log(chalk.cyan("\n 🏠 Pre-installing core components..."));

			const componentsDir = fsUtils.join(projectPath, "components/ui");
			const libDir = fsUtils.join(projectPath, "lib");
			const hooksDir = fsUtils.join(projectPath, "hooks");
			const servicesDir = fsUtils.join(projectPath, "services");

			await fsUtils.ensureDir(componentsDir);
			await fsUtils.ensureDir(libDir);

			// Use import.meta.dirname (Node 20+)
			const cliRoot = path.resolve(import.meta.dirname, "../../");
			const registryDir = path.join(cliRoot, "registry");

			// Copy Button & Interpolate
			const buttonSrc = path.join(registryDir, "ui/button.tsx");
			const buttonDest = path.join(componentsDir, "button.tsx");
			if (await fsUtils.pathExists(buttonSrc)) {
				let content = await fsUtils.readFile(buttonSrc, "utf8");
				content = interpolateTemplate(content, config);
				await fsUtils.writeFile(buttonDest, content);
			}

			// Copy Utils
			const utilsSrc = path.join(registryDir, "lib/utils.ts");
			const utilsDest = path.join(libDir, "utils.ts");
			if (await fsUtils.pathExists(utilsSrc)) {
				await fsUtils.copyFile(utilsSrc, utilsDest);
			}

			// 6.b Inject Patterns for Full Template
			if (options.template === "full") {
				await fsUtils.ensureDir(hooksDir);
				await fsUtils.ensureDir(servicesDir);

				await fsUtils.writeFile(
					fsUtils.join(servicesDir, "api.ts"),
					API_PATTERN.trim(),
				);
				await fsUtils.writeFile(
					fsUtils.join(hooksDir, "use-kibra-theme.ts"),
					THEME_HOOK_PATTERN.trim(),
				);

				console.log(
					chalk.dim(
						"    Patterns injected: services/api.ts, hooks/use-kibra-theme.ts",
					),
				);
			}
		}

		// 7. Final Installation
		if (packageManager !== "none") {
			const pmSpinner = ora(
				`Running final installation with ${packageManager}...`,
			).start();
			await runCommand(packageManager, ["install"], { cwd: projectPath });
			pmSpinner.succeed("Dependencies installed.");

			console.log(
				chalk.green(
					`\n ✨ Project ${chalk.bold(projectName)} created successfully!`,
				),
			);
			console.log(chalk.yellow("\n Next steps:"));
			console.log(`   cd ${projectName}`);
			console.log(`   ${packageManager} run start`);
		} else {
			console.log(
				chalk.green(
					`\n ✨ Project ${chalk.bold(projectName)} setup complete (skipping installation).`,
				),
			);
			console.log(chalk.yellow("\n Next steps:"));
			console.log(`   cd ${projectName}`);
			console.log("   [Install dependencies manually]");
			console.log("   npm run start");
		}
	} catch (error: any) {
		console.error(
			chalk.red(`\n ❌ Error during project creation: ${error.message}`),
		);
		process.exit(1);
	}
}
