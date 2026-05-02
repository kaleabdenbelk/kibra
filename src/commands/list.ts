import chalk from "chalk";
import ora from "ora";
import path from "path";
import { DEFAULT_REGISTRY_URL } from "../constants/versions.js";
import type { ComponentIndexItem } from "../types/index.js";
import { fsUtils } from "../utils/fs.js";

export async function listComponents(options: { registry?: string }) {
	const projectRoot = process.cwd();
	const configPath = path.join(projectRoot, "kibra.json");

	let registries: Record<string, string> = {
		default: DEFAULT_REGISTRY_URL,
	};

	if (await fsUtils.pathExists(configPath)) {
		const config = await fsUtils.readJson(configPath);
		if (config.registries) {
			registries = config.registries;
		}
	}

	if (options.registry) {
		registries = { custom: options.registry };
	}

	console.log(chalk.cyan(`\n 🔍 Fetching components from registries...`));
	const spinner = ora("Loading registries...").start();

	const registryEntries = Object.entries(registries);
	const results = await Promise.allSettled(
		registryEntries.map(async ([alias, url]) => {
			let index: ComponentIndexItem[] = [];
			const cleanUrl = url.replace(/\/$/, "");

			if (cleanUrl.startsWith("http")) {
				const response = await fetch(`${cleanUrl}/index.json`);
				if (!response.ok) {
					throw new Error(
						`Registry [${alias}] at ${cleanUrl} returned ${response.status}`,
					);
				}
				index = (await response.json()) as ComponentIndexItem[];
			} else {
				const localPath = path.resolve(cleanUrl, "index.json");
				if (await fsUtils.pathExists(localPath)) {
					index = await fsUtils.readJson(localPath);
				} else {
					throw new Error(
						`Registry [${alias}] local path not found: ${localPath}`,
					);
				}
			}
			return { alias, url: cleanUrl, index };
		}),
	);

	spinner.stop();

	for (let i = 0; i < results.length; i++) {
		const result = results[i];
		const [alias, url] = registryEntries[i];

		if (result.status === "rejected") {
			console.log(chalk.red(`\n ❌ Registry [${alias}]: ${url}`));
			console.log(chalk.dim(`    Reason: ${result.reason.message}`));
			continue;
		}

		const { index } = result.value;
		console.log(chalk.cyan(`\n 📦 Registry [${alias}]: ${url}`));

		if (index.length === 0) {
			console.log(chalk.yellow("    No components found."));
			continue;
		}

		// Group by type
		const groups: Record<string, ComponentIndexItem[]> = {};
		index.forEach((item) => {
			const type = item.type || "other";
			if (!groups[type]) groups[type] = [];
			groups[type].push(item);
		});

		for (const [type, items] of Object.entries(groups)) {
			console.log(
				chalk.bold(`\n    ${type.replace("registry:", "").toUpperCase()}:`),
			);
			items.forEach((item) => {
				console.log(
					`      - ${chalk.green(item.name.padEnd(15))} ${chalk.dim(item.dependencies.join(", "))}`,
				);
			});
		}
	}

	console.log(chalk.cyan('\n Use "kibra add <component>" to install.'));
}
