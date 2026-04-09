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
	const match = systemPrompt.match(/Pi documentation:\n([\s\S]*?)(?:\n\nCurrent date:|\n\n# Project Context|\nCurrent working directory:|$)/);
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

function formatToolSection(title: string, tools: Array<{ name: string; description: string }>) {
	if (tools.length === 0) {
		return `## ${title}\n- (none)`;
	}

	return `## ${title}\n${tools.map((tool) => `- \`${tool.name}\` — ${tool.description}`).join("\n")}`;
}

function formatGuidelineSection(guidelines: string[]) {
	if (guidelines.length === 0) {
		return "## Guidelines\n- (none)";
	}

	return `## Guidelines\n${guidelines.map((guideline) => `- ${guideline}`).join("\n")}`;
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
			const payload = `${formatToolSection("Built-in tools", builtinTools)}\n\n${formatToolSection("Dynamic tools", dynamicTools)}`;

			return {
				content: [{ type: "text", text: payload }],
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
			const payload = formatGuidelineSection(guidelines);

			return {
				content: [{ type: "text", text: payload }],
			};
		},
	});

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
			};
		},
	});
}
