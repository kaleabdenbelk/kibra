import type { KibraConfig } from "../types/index.js";

export function interpolateTemplate(
	content: string,
	config: KibraConfig,
): string {
	let interpolated = content;

	// Replace standard tokens
	interpolated = interpolated.replace(/{{UTILS_ALIAS}}/g, config.aliases.utils);
	interpolated = interpolated.replace(
		/{{COMPONENTS_ALIAS}}/g,
		config.aliases.components,
	);

	// High-compatibility: also replace the default "@" aliases if the user hasn't updated their registry yet
	// but we prefer templates. The reviewer said "Template Interpolation wins".
	// So we will prioritize the tokens, but this acts as a safety net.
	interpolated = interpolated.replace(
		/['"]@\/lib\/utils['"]/g,
		`'${config.aliases.utils}'`,
	);
	interpolated = interpolated.replace(
		/['"]@\/components\/ui['"]/g,
		`'${config.aliases.components}'`,
	);

	return interpolated;
}
