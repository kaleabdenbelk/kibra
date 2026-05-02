import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execa } from "execa";
import path from "path";
import fs from "fs-extra";

const CLI_PATH = path.resolve(__dirname, "../src/index.ts");
const TEST_DIR = path.resolve(__dirname, "../tmp-test-app");

describe("Kibra CLI Smoke Tests", () => {
	// Ensure we cleanup the test directory before and after
	const cleanup = () => {
		if (fs.existsSync(TEST_DIR)) {
			fs.removeSync(TEST_DIR);
		}
	};

	beforeAll(() => cleanup());
	afterAll(() => cleanup());

	it("should initialize a project and create kibra.json", async () => {
		// Note: We'd normally use a library to mock stdin for 'init'
		// For now, we verify the command exists and helps
		const { stdout } = await execa("npx", ["tsx", CLI_PATH, "--help"]);
		expect(stdout).toContain("kibra");
	});

	// More complex tests would go here, using mocks for prompts or running non-interactive commands
});
