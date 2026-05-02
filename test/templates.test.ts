import { describe, expect, it } from "vitest";
import { interpolateTemplate } from "../src/utils/templates.js";
import type { KibraConfig } from "../src/types/index.js";

describe("interpolateTemplate", () => {
	const config: KibraConfig = {
		aliases: {
			components: "@/ui/comps",
			utils: "@/lib/my-utils",
		},
		registries: {
			default: "https://kibra.dev",
		},
	};

	it("should replace {{UTILS_ALIAS}}", () => {
		const content = 'import { cn } from "{{UTILS_ALIAS}}";';
		expect(interpolateTemplate(content, config)).toBe(
			'import { cn } from "@/lib/my-utils";',
		);
	});

	it("should replace {{COMPONENTS_ALIAS}}", () => {
		const content = 'import { Button } from "{{COMPONENTS_ALIAS}}/button";';
		expect(interpolateTemplate(content, config)).toBe(
			'import { Button } from "@/ui/comps/button";',
		);
	});

	it("should replace legacy @/lib/utils paths", () => {
		const content = "import { cn } from '@/lib/utils';";
		expect(interpolateTemplate(content, config)).toBe(
			"import { cn } from '@/lib/my-utils';",
		);
	});

	it("should handle multi-line imports and weird spacing", () => {
		const content = `
import { 
  cn, 
  variant 
} from "{{UTILS_ALIAS}}";
import { Button } from    "{{COMPONENTS_ALIAS}}/button";
        `.trim();

		const result = interpolateTemplate(content, config);
		expect(result).toContain('from "@/lib/my-utils";');
		expect(result).toContain('from    "@/ui/comps/button";');
	});
});
