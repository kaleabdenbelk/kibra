import { buildRegistry } from "../src/commands/build.js";

buildRegistry({
	input: "registry",
	output: "dist-registry",
}).catch(console.error);
