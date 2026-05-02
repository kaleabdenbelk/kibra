import chalk from "chalk";
import path from "path";
import { DEFAULT_REGISTRY_URL } from "../constants/versions.js";
import type { KibraConfig } from "../types/index.js";
import { fsUtils } from "../utils/fs.js";
import { prompts } from "../utils/prompts.js";

const DEFAULT_CONFIG: KibraConfig = {
	aliases: {
		components: "@/components/ui",
		utils: "@/lib/utils",
	},
	registries: {
		default: DEFAULT_REGISTRY_URL,
	},
};

export async function initProject() {
	const projectRoot = process.cwd();
	const configPath = path.join(projectRoot, "kibra.json");

	if (await fsUtils.pathExists(configPath)) {
		const overwrite = await prompts.confirm({
			message: "kibra.json already exists. Overwrite with default settings?",
			default: false,
		});
		if (!overwrite) {
			console.log(chalk.yellow("\n Initialization cancelled."));
			return;
		}
	}

	console.log(chalk.cyan("\n 🛠️ Initializing Kibra configuration..."));

	const componentsAlias = await prompts.input({
		message: "Where should components be installed? (Alias or relative path)",
		default: DEFAULT_CONFIG.aliases.components,
	});

	const utilsAlias = await prompts.input({
		message: "Where is your utils file located? (Alias or relative path)",
		default: DEFAULT_CONFIG.aliases.utils,
	});

	const config: KibraConfig = {
		aliases: {
			components: componentsAlias,
			utils: utilsAlias,
		},
		registries: DEFAULT_CONFIG.registries,
	};

	await fsUtils.writeJson(configPath, config, { spaces: 2 });

	console.log(chalk.green("\n ✨ kibra.json created successfully!"));
	console.log(
		chalk.dim(' You can now add components using "kibra add <component>".'),
	);
}
