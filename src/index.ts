#!/usr/bin/env node
import { Command } from "commander";
import { addComponent } from "./commands/add.js";
import { createProject } from "./commands/create.js";
import { initProject } from "./commands/init.js";
import { listComponents } from "./commands/list.js";
import { runNativeWindSetup } from "./commands/setup.js";
import { handleError } from "./utils/errors.js";
import { prompts } from "./utils/prompts.js";
import { checkUpdates } from "./utils/update.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("../package.json");

const program = new Command();

program
	.name("kibra")
	.description(
		"The high-performance component registry for Expo and React Native",
	)
	.version(pkg.version);

program.hook("postAction", () => {
	checkUpdates();
});

program
	.command("list")
	.description("List available components from the registry")
	.option("-r, --registry <url>", "registry URL or local path")
	.action(async (options) => {
		try {
			await listComponents(options);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("init")
	.description("Initialize project configuration (kibra.json)")
	.action(async () => {
		try {
			await initProject();
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("create <project-name>", { isDefault: true })
	.description("Create a new production-ready Expo project")
	.option("-t, --template <template>", "project template (minimal or full)")
	.option("-c, --clean", "skip pre-installing components (button, utils)")
	.option("-n, --no-icons", "skip icon library installation")
	.action(async (projectName, options) => {
		try {
			await createProject(projectName, options);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("setup-nativewind")
	.description("Setup NativeWind in the current Expo project")
	.action(async () => {
		try {
			const iconLibrary = await prompts.select({
				message: "Which icon library do you want to use?",
				choices: [
					{ value: "expo-symbols", name: "Expo Symbols" },
					{ value: "lucide", name: "Lucide Icons" },
				],
				default: "expo-symbols",
			});

			const packageManager = await prompts.select({
				message: "Which package manager do you want to use for installation?",
				choices: [
					{ value: "pnpm", name: "pnpm" },
					{ value: "npm", name: "npm" },
					{ value: "yarn", name: "yarn" },
					{ value: "bun", name: "bun" },
					{ value: "none", name: "None (Skip Installation)" },
				],
				default: "pnpm",
			});

			await runNativeWindSetup(process.cwd(), packageManager, iconLibrary);
		} catch (error) {
			handleError(error);
		}
	});

program
	.command("add <component>")
	.description("Add a new component to your project")
	.option("-r, --registry <url>", "Registry URL or local path")
	.option("-d, --dry-run", "Show what files will be created without writing them")
	.action(async (component, options) => {
		try {
			await addComponent(component, options);
		} catch (error) {
			handleError(error);
		}
	});

program.parse(process.argv);
