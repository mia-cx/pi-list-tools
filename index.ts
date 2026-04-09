import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

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
}
