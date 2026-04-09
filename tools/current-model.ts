import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

export function registerCurrentModel(pi: ExtensionAPI) {
	pi.registerTool({
		name: "current_model",
		label: "Current Model",
		description: "Get the currently active model.",
		promptSnippet: "Get the currently active model.",
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			const model = ctx.model ? `${ctx.model.provider}/${ctx.model.id}` : "(none)";

			return {
				content: [{ type: "text", text: `Current model:\n- ${model}` }],
				details: undefined,
			};
		},
	});
}
