#!/usr/bin/env node
import { Command } from "commander";
import { buildRegistry } from "./commands/build.js";

const program = new Command();

program
	.name("kibra-registry-builder")
	.description("Build a Kibra component registry from a local directory")
	.version("1.0.0")
	.option("-i, --input <path>", "Input registry directory", "./registry")
	.option(
		"-o, --output <path>",
		"Output distribution directory",
		"./dist-registry",
	)
	.action(async (options) => {
		await buildRegistry(options);
	});

program.parse(process.argv);
