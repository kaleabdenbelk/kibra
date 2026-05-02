import { describe, expect, it, afterAll, beforeAll } from "vitest";
import { buildRegistry } from "../src/commands/build.js";
import fs from "fs-extra";
import path from "path";

describe("buildRegistry", () => {
	const testInput = path.resolve(process.cwd(), "test-registry-input");
	const testOutput = path.resolve(process.cwd(), "test-registry-output");

	beforeAll(async () => {
		await fs.ensureDir(testInput);
		await fs.ensureDir(path.join(testInput, "ui"));
		await fs.writeFile(
			path.join(testInput, "ui/button.tsx"),
			'import { cn } from "@/lib/utils";\nexport const Button = () => null;',
		);
	});

	afterAll(async () => {
		await fs.remove(testInput);
		await fs.remove(testOutput);
	});

	it("should build a valid registry index and component files", async () => {
		await buildRegistry({ input: testInput, output: testOutput });

		const indexExists = await fs.pathExists(path.join(testOutput, "index.json"));
		const componentExists = await fs.pathExists(path.join(testOutput, "button.json"));

		expect(indexExists).toBe(true);
		expect(componentExists).toBe(true);

		const index = await fs.readJson(path.join(testOutput, "index.json"));
		expect(Array.isArray(index)).toBe(true);
		expect(index[0].name).toBe("button");

		const button = await fs.readJson(path.join(testOutput, "button.json"));
		expect(button.name).toBe("button");
		expect(button.files[0].target).toBe("components/ui/button.tsx");
	});
});
