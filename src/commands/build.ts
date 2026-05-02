import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import fg from "fast-glob";
import { getDependencies } from "../utils/ast.js";
import { RegistryItem } from "../types/index.js";

export async function buildRegistry(options: {
	input: string;
	output: string;
}) {
	const REGISTRY_DIR = path.resolve(process.cwd(), options.input);
	const OUTPUT_DIR = path.resolve(process.cwd(), options.output);

	if (!(await fs.pathExists(REGISTRY_DIR))) {
		console.error(
			chalk.red(`❌ Error: Input directory not found: ${REGISTRY_DIR}`),
		);
		process.exit(1);
	}

	await fs.ensureDir(OUTPUT_DIR);

	const registryIndex: any[] = [];

	console.log(chalk.cyan(`\n 🏗️ Building registry from: ${REGISTRY_DIR}...`));

	// Recursive scan for all .ts/.tsx files, excluding stories and tests
	const files = await fg("**/*.{ts,tsx}", {
		cwd: REGISTRY_DIR,
		ignore: ["**/*.stories.tsx", "**/*.test.ts", "**/*.test.tsx"],
	});

	let uiCount = 0;
	let libCount = 0;
	let hookCount = 0;

	for (const relativePath of files) {
		const sourcePath = path.join(REGISTRY_DIR, relativePath);
		const content = await fs.readFile(sourcePath, "utf8");

		// AST Dependency Detection
		const { dependencies, registryDependencies } = getDependencies(content);

		// Determine type based on folder
		let type = "registry:ui";
		if (relativePath.startsWith("lib/")) {
			type = "registry:lib";
			libCount++;
		} else if (relativePath.startsWith("hooks/")) {
			type = "registry:hook";
			hookCount++;
		} else {
			uiCount++;
		}

		const name = path.parse(relativePath).name.toLowerCase();

		const registryItem: RegistryItem = {
			name,
			type: type as any,
			dependencies,
			registryDependencies,
			files: [
				{
					path: relativePath,
					target: relativePath.replace("registry/", ""), // Fallback
					type: type as any,
				},
			],
		};

		// Fix target paths based on standard structure
		if (type === "registry:ui") {
			registryItem.files[0].target = `components/ui/${path.parse(relativePath).base}`;
		} else if (type === "registry:lib") {
			registryItem.files[0].target = `lib/${path.parse(relativePath).base}`;
		}

		// Check for associated stories
		const storyPath = relativePath.replace(".tsx", ".stories.tsx");
		if (await fs.pathExists(path.join(REGISTRY_DIR, storyPath))) {
			registryItem.files.push({
				path: storyPath,
				target: registryItem.files[0].target.replace(".tsx", ".stories.tsx"),
				type: "registry:story" as any,
				content: await fs.readFile(path.join(REGISTRY_DIR, storyPath), "utf8"),
			});
		}

		// Inject content
		for (const file of registryItem.files) {
			if (!file.content) {
				file.content = await fs.readFile(
					path.join(REGISTRY_DIR, file.path),
					"utf8",
				);
			}
		}

		await fs.writeJson(
			path.join(OUTPUT_DIR, `${registryItem.name}.json`),
			registryItem,
			{ spaces: 2 },
		);

		registryIndex.push({
			name: registryItem.name,
			type: registryItem.type,
			dependencies: registryItem.dependencies,
			registryDependencies: registryItem.registryDependencies,
		});

		console.log(chalk.dim(`   ✔ Processed ${chalk.white(registryItem.name)}`));
	}

	await fs.writeJson(path.join(OUTPUT_DIR, "index.json"), registryIndex, {
		spaces: 2,
	});

	console.log(chalk.blue("\n 📊 Registry Summary:"));
	console.log(chalk.dim(`   ├─ UI Components: ${chalk.white(uiCount)}`));
	console.log(chalk.dim(`   ├─ Hooks:         ${chalk.white(hookCount)}`));
	console.log(chalk.dim(`   └─ Lib/Utils:     ${chalk.white(libCount)}`));

	console.log(
		chalk.green.bold(`\n ✨ Registry built successfully in: ${OUTPUT_DIR}`),
	);
	console.log(chalk.dim(`    Ready for distribution. Total items: ${registryIndex.length}\n`));
}
