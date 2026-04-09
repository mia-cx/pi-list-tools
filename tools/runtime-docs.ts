import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageEntry = fileURLToPath(import.meta.resolve("@mariozechner/pi-coding-agent"));

function getRuntimeDocsPaths() {
	let dir = dirname(packageEntry);

	while (dir !== dirname(dir)) {
		if (existsSync(join(dir, "package.json"))) {
			return {
				readmePath: resolve(join(dir, "README.md")),
				docsPath: resolve(join(dir, "docs")),
				examplesPath: resolve(join(dir, "examples")),
			};
		}

		dir = dirname(dir);
	}

	return {
		readmePath: resolve(join(dirname(packageEntry), "README.md")),
		docsPath: resolve(join(dirname(packageEntry), "docs")),
		examplesPath: resolve(join(dirname(packageEntry), "examples")),
	};
}

function extractDocsSection(systemPrompt: string) {
	const match = systemPrompt.match(/Pi documentation[^\n]*:\n([\s\S]*?)(?:\nCurrent date:|\n# Project Context|\nCurrent working directory:|$)/);
	if (!match) {
		return "";
	}

	const { readmePath, docsPath, examplesPath } = getRuntimeDocsPaths();

	return `Pi documentation:\n${match[1]
		.trim()
		.replace(/\$\{readmePath\}/g, readmePath)
		.replace(/\$\{docsPath\}/g, docsPath)
		.replace(/\$\{examplesPath\}/g, examplesPath)}`;
}

export function registerRuntimeDocs(pi: ExtensionAPI) {
	pi.registerTool({
		name: "runtime_docs",
		label: "Runtime Docs",
		description: "Get the default runtime docs section with resolved paths.",
		promptSnippet: "Get the default runtime docs section with resolved paths.",
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const systemPrompt = ctx.getSystemPrompt();
			const docsSection = extractDocsSection(systemPrompt);

			return {
				content: [{ type: "text", text: docsSection }],
				details: undefined,
			};
		},
	});
}
