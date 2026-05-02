import ts from "typescript";

export function getDependencies(content: string): {
	dependencies: string[];
	registryDependencies: string[];
} {
	const dependencies = new Set<string>();
	const registryDependencies = new Set<string>();

	const sourceFile = ts.createSourceFile(
		"temp.ts",
		content,
		ts.ScriptTarget.Latest,
		true,
	);

	function visit(node: ts.Node) {
		if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
			if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
				const importPath = node.moduleSpecifier.text;

				// Skip relative imports or registry-internal imports
				if (
					importPath.startsWith("@/lib/") ||
					importPath.startsWith("@/components/") ||
					importPath.startsWith("@/registry/")
				) {
					// Detect specific registry dependencies (e.g., utils)
					if (importPath.includes("/utils")) {
						registryDependencies.add("utils");
					}
					// We could make this more exhaustive by mapping @/ components to registry items
				} else if (
					!importPath.startsWith(".") &&
					!importPath.startsWith("/") &&
					!importPath.startsWith("react")
				) {
					// It's likely an NPM dependency
					// Exclude 'react' and 'react-native' if desired, or keep them to be explicit
					if (importPath !== "react" && importPath !== "react-native") {
						dependencies.add(importPath.split("/")[0]); // Get base package name
					}
				}
			}
		}
		ts.forEachChild(node, visit);
	}

	visit(sourceFile);

	return {
		dependencies: Array.from(dependencies),
		registryDependencies: Array.from(registryDependencies),
	};
}
