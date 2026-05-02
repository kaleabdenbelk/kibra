import chalk from "chalk";
import fs from "fs-extra";
import path from "path";

export interface FsOptions {
	dryRun?: boolean;
	verbose?: boolean;
}

export const fsUtils = {
	async writeFile(
		targetPath: string,
		content: string,
		options: FsOptions = {},
	) {
		if (options.dryRun) {
			console.log(chalk.dim(` [DRY RUN] Would write to ${targetPath}`));
			return;
		}

		const dir = path.dirname(targetPath);
		await fs.ensureDir(dir);

		// Atomic-ish write with proper cleanup
		const tempPath = `${targetPath}.kibra-tmp-${Math.random().toString(36).slice(2, 7)}`;
		try {
			await fs.writeFile(tempPath, content, "utf8");
			await fs.rename(tempPath, targetPath);
		} catch (error) {
			// Cleanup temp file if it exists and write failed
			if (await fs.pathExists(tempPath)) {
				await fs.remove(tempPath);
			}
			throw error;
		}

		if (options.verbose) {
			console.log(chalk.dim(`   ✔ Wrote ${targetPath}`));
		}
	},

	async readJson(filePath: string) {
		return fs.readJson(filePath);
	},

	async writeJson(
		filePath: string,
		data: any,
		options: FsOptions & { spaces?: number } = {},
	) {
		if (options.dryRun) {
			console.log(chalk.dim(` [DRY RUN] Would write JSON to ${filePath}`));
			return;
		}
		return fs.writeJson(filePath, data, { spaces: options.spaces || 2 });
	},

	async pathExists(filePath: string) {
		return fs.pathExists(filePath);
	},

	async ensureDir(dirPath: string, options: FsOptions = {}) {
		if (options.dryRun) return;
		return fs.ensureDir(dirPath);
	},

	async emptyDir(dirPath: string, options: FsOptions = {}) {
		if (options.dryRun) {
			console.log(chalk.dim(` [DRY RUN] Would empty directory ${dirPath}`));
			return;
		}
		return fs.emptyDir(dirPath);
	},

	async readFile(filePath: string, encoding: "utf8" = "utf8") {
		return fs.readFile(filePath, encoding);
	},

	async copyFile(src: string, dest: string, options: FsOptions = {}) {
		if (options.dryRun) {
			console.log(chalk.dim(` [DRY RUN] Would copy ${src} to ${dest}`));
			return;
		}
		await fs.ensureDir(path.dirname(dest));
		return fs.copyFile(src, dest);
	},

	join: path.join,
	resolve: path.resolve,
	dirname: path.dirname,
};
