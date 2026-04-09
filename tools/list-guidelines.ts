import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

function formatGuidelineSection(guidelines: string[]) {
	if (guidelines.length === 0) {
		return "- (none)";
	}

	return guidelines.map((guideline) => `- ${guideline}`).join("\n");
}

function extractGuidelines(systemPrompt: string): string[] {
	const match = systemPrompt.match(/Guidelines:\n([\s\S]*?)(?:\nPi documentation[^\n]*:|\nCurrent date:|\nCurrent working directory:|$)/);
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

export function registerListGuidelines(pi: ExtensionAPI) {
	pi.registerTool({
		name: "list_guidelines",
		label: "List Guidelines",
		description: "List the current effective system prompt guidelines at runtime.",
		promptSnippet: "List the current system prompt guidelines at runtime.",
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const systemPrompt = ctx.getSystemPrompt();
			const guidelines = extractGuidelines(systemPrompt);
			const payload = `Guidelines:\n${formatGuidelineSection(guidelines)}`;

			return {
				content: [{ type: "text", text: payload }],
				details: undefined,
			};
		},
	});
}
