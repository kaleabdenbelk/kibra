export interface KibraConfig {
	aliases: {
		components: string;
		utils: string;
	};
	registries: Record<string, string>;
}

export interface RegistryFile {
	path: string;
	content?: string;
	target: string;
	type:
		| "registry:component"
		| "registry:lib"
		| "registry:ui"
		| "registry:story"
		| "registry:hook";
}

export interface RegistryItem {
	name: string;
	type: string;
	dependencies?: string[];
	registryDependencies?: string[];
	files: RegistryFile[];
}

export interface ComponentIndexItem {
	name: string;
	type: string;
	dependencies: string[];
}
