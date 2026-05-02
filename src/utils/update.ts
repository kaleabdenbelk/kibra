import updateNotifier from "update-notifier";
import fs from "fs";
import path from "path";

export function checkUpdates() {
	try {
		const pkgPath = path.resolve(import.meta.dirname, "../../package.json");
		if (!fs.existsSync(pkgPath)) return;

		const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

		const notifier = updateNotifier({
			pkg,
			updateCheckInterval: 1000 * 60 * 60 * 24, // 24 hours
		});

		if (notifier.update) {
			// We use a custom, subtle message as requested
			console.log(
				`\n 💡 A new version of Kibra is available: ${notifier.update.latest} (current: ${notifier.update.current})`,
			);
			console.log(`    Run "npm install -g kibra" to update.\n`);
		}
	} catch (error) {
		// Fail silently to not annoy user
	}
}
