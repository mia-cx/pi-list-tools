import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

function formatToolList(tools: Array<{ name: string; description: string }>) {
	if (tools.length === 0) {
		return "- (none)";
	}

	return tools.map((tool) => `- ${tool.name}: ${tool.description.replace(/\s+/g, " ").trim()}`).join("\n");
}

export function registerListTools(pi: ExtensionAPI) {
	pi.registerTool({
		name: "list_tools",
		label: "List Tools",
		description: "List the currently available tools, including built-in and dynamically installed tools.",
		promptSnippet: "List the current tool inventory, including built-in and dynamically installed tools.",
		parameters: Type.Object({}),
		async execute() {
			const allTools = pi.getAllTools();
			const payload = `Available tools:\n${formatToolList(allTools)}`;

			return {
				content: [{ type: "text", text: payload }],
				details: undefined,
			};
		},
	});
}
