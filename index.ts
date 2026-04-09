import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";
import { createRequire } from "node:module";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const require = createRequire(import.meta.url);
const packageEntry = require.resolve("@mariozechner/pi-coding-agent");

function getRuntimeDocsPaths() {
	let dir = dirname(packageEntry);

	while (dir !== dirname(dir)) {
		if (existsSync(join(dir, "package.json"))) {
			return {
				readmePath: resolve(join(dir, "README.md")),
				docsPath: resolve(join(dir, "docs")),
			};
		}

		dir = dirname(dir);
	}

	return {
		readmePath: resolve(join(dirname(packageEntry), "README.md")),
		docsPath: resolve(join(dirname(packageEntry), "docs")),
	};
}

function extractGuidelines(systemPrompt: string): string[] {
	const match = systemPrompt.match(/Guidelines:\n([\s\S]*?)(?:\n\nPi documentation:|\n\nCurrent date:|\nCurrent working directory:|$)/);
	if (!match) {
		return [];
	}

	return match[1]
		.split("\n")
		.map((line) => line.trim())
		.filter((line) => line.startsWith("- "))
		.map((line) => line.slice(2).trim())
		.filter((line) => line.length > 0);
}

export default function listToolsExtension(pi: ExtensionAPI) {
	pi.registerTool({
		name: "list_tools",
		label: "List Tools",
		description: "List the currently available tools, including built-in and dynamically installed tools.",
		promptSnippet: "List the current tool inventory, including built-in and dynamically installed tools.",
		parameters: Type.Object({}),
		async execute() {
			const allTools = pi.getAllTools();
			const builtinTools = allTools.filter((tool) => tool.sourceInfo.source === "builtin");
			const dynamicTools = allTools.filter((tool) => tool.sourceInfo.source !== "builtin");

			const payload = {
				builtin: builtinTools,
				dynamic: dynamicTools,
			};

			return {
				content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
				details: payload,
			};
		},
	});

	pi.registerTool({
		name: "list_guidelines",
		label: "List Guidelines",
		description: "List the current effective system prompt guidelines at runtime.",
		promptSnippet: "List the current system prompt guidelines at runtime.",
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const systemPrompt = ctx.getSystemPrompt();
			const guidelines = extractGuidelines(systemPrompt);

			const payload = {
				guidelines,
			};

			return {
				content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
				details: payload,
			};
		},
	});

	pi.registerTool({
		name: "runtime_docs",
		label: "Runtime Docs",
		description: "Get the current runtime README and docs paths.",
		promptSnippet: "Get the current runtime README and docs paths.",
		parameters: Type.Object({}),
		async execute() {
			const payload = getRuntimeDocsPaths();

			return {
				content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
				details: payload,
			};
		},
	});
}
