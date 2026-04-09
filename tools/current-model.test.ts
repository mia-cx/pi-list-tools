import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { describe, expect, it } from "vitest";
import { registerCurrentModel } from "./current-model.ts";

function getCurrentModelTool() {
	const tools: Array<{ name: string; execute: (...args: Array<unknown>) => Promise<any> }> = [];
	const pi = {
		registerTool(tool: { name: string; execute: (...args: Array<unknown>) => Promise<any> }) {
			tools.push(tool);
		},
	} as unknown as ExtensionAPI;

	registerCurrentModel(pi);

	const tool = tools.find((entry) => entry.name === "current_model");
	if (!tool) {
		throw new Error("current_model tool was not registered");
	}

	return tool;
}

async function runCurrentModel(model: { provider: string; id: string } | null) {
	const tool = getCurrentModelTool();
	return tool.execute("tool-call-1", {}, new AbortController().signal, () => {}, { model } as never);
}

describe("current_model", () => {
	it.each([
		[
			"openai/gpt-5.4",
			{
				provider: "openai",
				id: "gpt-5.4",
			},
			"GPT-5.4",
			"You're currently running as OpenAI GPT-5.4 <noreply@openai.com>, with the id \"openai/gpt-5.4\".",
		],
		[
			"openai/gpt-5.4-mini",
			{
				provider: "openai",
				id: "gpt-5.4-mini",
			},
			"GPT-5.4 Mini",
			"You're currently running as OpenAI GPT-5.4 Mini <noreply@openai.com>, with the id \"openai/gpt-5.4-mini\".",
		],
		[
			"anthropic/claude-opus-4-6",
			{
				provider: "anthropic",
				id: "claude-opus-4-6",
			},
			"Claude Opus 4.6",
			"You're currently running as Anthropic Claude Opus 4.6 <noreply@anthropic.com>, with the id \"anthropic/claude-opus-4-6\".",
		],
		[
			"anthropic/claude-sonnet-4-6",
			{
				provider: "anthropic",
				id: "claude-sonnet-4-6",
			},
			"Claude Sonnet 4.6",
			"You're currently running as Anthropic Claude Sonnet 4.6 <noreply@anthropic.com>, with the id \"anthropic/claude-sonnet-4-6\".",
		],
		[
			"anthropic/claude-3-7-sonnet-latest",
			{
				provider: "anthropic",
				id: "claude-3-7-sonnet-latest",
			},
			"Claude 3.7 Sonnet Latest",
			"You're currently running as Anthropic Claude 3.7 Sonnet Latest <noreply@anthropic.com>, with the id \"anthropic/claude-3-7-sonnet-latest\".",
		],
	])("formats %s", async (_label, model, modelLabel, expected) => {
		const result = await runCurrentModel(model);

		expect(result.content).toEqual([{ type: "text", text: expected }]);
		expect(result.details).toMatchObject({
			provider: model.provider,
			providerLabel: model.provider === "openai" ? "OpenAI" : "Anthropic",
			attributionEmail: model.provider === "openai" ? "noreply@openai.com" : "noreply@anthropic.com",
			modelId: model.id,
			modelLabel,
			fullModelId: `${model.provider}/${model.id}`,
			formatted: expected,
		});
	});

	it("returns a no-model message when ctx.model is missing", async () => {
		const result = await runCurrentModel(null);

		expect(result.content).toEqual([{ type: "text", text: "You're currently not running a model." }]);
		expect(result.details).toBeUndefined();
	});
});
