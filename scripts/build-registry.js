import fs from "fs-extra";
import path from "path";

const REGISTRY_DIR = path.join(process.cwd(), "registry");
const OUTPUT_DIR = path.join(process.cwd(), "dist-registry");
async function buildRegistry() {
	await fs.ensureDir(OUTPUT_DIR);
	await fs.ensureDir(path.join(OUTPUT_DIR, "ui"));
	const registryItems = [];
	const components = [
		{
			name: "button",
			type: "registry:ui",
			dependencies: ["class-variance-authority", "clsx", "tailwind-merge"],
			files: [
				{
					path: "ui/button.tsx",
					target: "components/ui/Button.tsx",
					type: "registry:component",
				},
			],
		},
		{
			name: "card",
			type: "registry:ui",
			dependencies: ["clsx", "tailwind-merge"],
			files: [
				{
					path: "ui/card.tsx",
					target: "components/ui/Card.tsx",
					type: "registry:component",
				},
			],
		},
		{
			name: "input",
			type: "registry:ui",
			dependencies: ["clsx", "tailwind-merge"],
			files: [
				{
					path: "ui/input.tsx",
					target: "components/ui/Input.tsx",
					type: "registry:component",
				},
			],
		},
		{
			name: "utils",
			type: "registry:lib",
			dependencies: ["clsx", "tailwind-merge"],
			files: [
				{
					path: "lib/utils.ts",
					target: "lib/utils.ts",
					type: "registry:lib",
				},
			],
		},
	];
	for (const item of components) {
		const registryItem = { ...item, files: [] };
		for (const file of item.files) {
			const sourcePath = path.join(REGISTRY_DIR, file.path);
			const content = await fs.readFile(sourcePath, "utf8");
			registryItem.files.push({
				...file,
				content,
			});
		}
		// Write individual item JSON
		const itemOutputPath = path.join(OUTPUT_DIR, `${item.name}.json`);
		await fs.writeJson(itemOutputPath, registryItem, { spaces: 2 });
		// Add to index
		registryItems.push({
			name: item.name,
			type: item.type,
			dependencies: item.dependencies,
		});
	}
	// Write index.json
	await fs.writeJson(path.join(OUTPUT_DIR, "index.json"), registryItems, {
		spaces: 2,
	});
	console.log("✔ Registry built successfully in dist-registry/");
}
buildRegistry().catch(console.error);
