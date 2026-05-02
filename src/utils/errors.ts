import chalk from "chalk";

export class KibraError extends Error {
	constructor(
		message: string,
		public hint?: string,
	) {
		super(message);
		this.name = "KibraError";
	}
}

export function handleError(error: unknown) {
	if (error instanceof KibraError) {
		console.error(chalk.red(`\n ❌ Error: ${error.message}`));
		if (error.hint) {
			console.log(chalk.yellow(`\n 💡 Hint: ${error.hint}`));
		}
	} else if (error instanceof Error) {
		console.error(chalk.red(`\n 💥 Unexpected Error: ${error.message}`));
		console.debug(error.stack);
	} else {
		console.error(chalk.red(`\n 💀 An unknown fatal error occurred.`));
	}
	process.exit(1);
}
