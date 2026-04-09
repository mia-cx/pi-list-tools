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

function expectedProviderDetails(provider: string) {
	if (provider.startsWith("openai")) {
		return {
			providerLabel: provider === "openai-codex" ? "OpenAI Codex" : "OpenAI",
			attributionEmail: "noreply@openai.com",
		};
	}

	return {
		providerLabel: "Anthropic",
		attributionEmail: "noreply@anthropic.com",
	};
}

const modelCases = [
	{
		label: "openai-codex/gpt-5.1",
		model: { provider: "openai-codex", id: "gpt-5.1" },
		modelLabel: "GPT-5.1",
		expected:
			"You're currently running as OpenAI Codex GPT-5.1 <noreply@openai.com>, with the id \"openai-codex/gpt-5.1\".",
	},
	{
		label: "openai-codex/gpt-5.1-codex-max",
		model: { provider: "openai-codex", id: "gpt-5.1-codex-max" },
		modelLabel: "GPT-5.1 Codex Max",
		expected:
			"You're currently running as OpenAI Codex GPT-5.1 Codex Max <noreply@openai.com>, with the id \"openai-codex/gpt-5.1-codex-max\".",
	},
	{
		label: "openai-codex/gpt-5.1-codex-mini",
		model: { provider: "openai-codex", id: "gpt-5.1-codex-mini" },
		modelLabel: "GPT-5.1 Codex Mini",
		expected:
			"You're currently running as OpenAI Codex GPT-5.1 Codex Mini <noreply@openai.com>, with the id \"openai-codex/gpt-5.1-codex-mini\".",
	},
	{
		label: "openai-codex/gpt-5.2",
		model: { provider: "openai-codex", id: "gpt-5.2" },
		modelLabel: "GPT-5.2",
		expected:
			"You're currently running as OpenAI Codex GPT-5.2 <noreply@openai.com>, with the id \"openai-codex/gpt-5.2\".",
	},
	{
		label: "openai-codex/gpt-5.2-codex",
		model: { provider: "openai-codex", id: "gpt-5.2-codex" },
		modelLabel: "GPT-5.2 Codex",
		expected:
			"You're currently running as OpenAI Codex GPT-5.2 Codex <noreply@openai.com>, with the id \"openai-codex/gpt-5.2-codex\".",
	},
	{
		label: "openai-codex/gpt-5.3-codex",
		model: { provider: "openai-codex", id: "gpt-5.3-codex" },
		modelLabel: "GPT-5.3 Codex",
		expected:
			"You're currently running as OpenAI Codex GPT-5.3 Codex <noreply@openai.com>, with the id \"openai-codex/gpt-5.3-codex\".",
	},
	{
		label: "openai-codex/gpt-5.3-codex-spark",
		model: { provider: "openai-codex", id: "gpt-5.3-codex-spark" },
		modelLabel: "GPT-5.3 Codex Spark",
		expected:
			"You're currently running as OpenAI Codex GPT-5.3 Codex Spark <noreply@openai.com>, with the id \"openai-codex/gpt-5.3-codex-spark\".",
	},
	{
		label: "anthropic/claude-3-5-haiku-20241022",
		model: { provider: "anthropic", id: "claude-3-5-haiku-20241022" },
		modelLabel: "Claude 3.5 Haiku 20241022",
		expected:
			"You're currently running as Anthropic Claude 3.5 Haiku 20241022 <noreply@anthropic.com>, with the id \"anthropic/claude-3-5-haiku-20241022\".",
	},
	{
		label: "anthropic/claude-3-5-haiku-latest",
		model: { provider: "anthropic", id: "claude-3-5-haiku-latest" },
		modelLabel: "Claude 3.5 Haiku Latest",
		expected:
			"You're currently running as Anthropic Claude 3.5 Haiku Latest <noreply@anthropic.com>, with the id \"anthropic/claude-3-5-haiku-latest\".",
	},
	{
		label: "anthropic/claude-3-5-sonnet-20240620",
		model: { provider: "anthropic", id: "claude-3-5-sonnet-20240620" },
		modelLabel: "Claude 3.5 Sonnet 20240620",
		expected:
			"You're currently running as Anthropic Claude 3.5 Sonnet 20240620 <noreply@anthropic.com>, with the id \"anthropic/claude-3-5-sonnet-20240620\".",
	},
	{
		label: "anthropic/claude-3-5-sonnet-20241022",
		model: { provider: "anthropic", id: "claude-3-5-sonnet-20241022" },
		modelLabel: "Claude 3.5 Sonnet 20241022",
		expected:
			"You're currently running as Anthropic Claude 3.5 Sonnet 20241022 <noreply@anthropic.com>, with the id \"anthropic/claude-3-5-sonnet-20241022\".",
	},
	{
		label: "anthropic/claude-3-7-sonnet-20250219",
		model: { provider: "anthropic", id: "claude-3-7-sonnet-20250219" },
		modelLabel: "Claude 3.7 Sonnet 20250219",
		expected:
			"You're currently running as Anthropic Claude 3.7 Sonnet 20250219 <noreply@anthropic.com>, with the id \"anthropic/claude-3-7-sonnet-20250219\".",
	},
	{
		label: "anthropic/claude-3-haiku-20240307",
		model: { provider: "anthropic", id: "claude-3-haiku-20240307" },
		modelLabel: "Claude 3 Haiku 20240307",
		expected:
			"You're currently running as Anthropic Claude 3 Haiku 20240307 <noreply@anthropic.com>, with the id \"anthropic/claude-3-haiku-20240307\".",
	},
	{
		label: "anthropic/claude-3-opus-20240229",
		model: { provider: "anthropic", id: "claude-3-opus-20240229" },
		modelLabel: "Claude 3 Opus 20240229",
		expected:
			"You're currently running as Anthropic Claude 3 Opus 20240229 <noreply@anthropic.com>, with the id \"anthropic/claude-3-opus-20240229\".",
	},
	{
		label: "anthropic/claude-3-sonnet-20240229",
		model: { provider: "anthropic", id: "claude-3-sonnet-20240229" },
		modelLabel: "Claude 3 Sonnet 20240229",
		expected:
			"You're currently running as Anthropic Claude 3 Sonnet 20240229 <noreply@anthropic.com>, with the id \"anthropic/claude-3-sonnet-20240229\".",
	},
	{
		label: "anthropic/claude-haiku-4-5-20251001",
		model: { provider: "anthropic", id: "claude-haiku-4-5-20251001" },
		modelLabel: "Claude Haiku 4.5 20251001",
		expected:
			"You're currently running as Anthropic Claude Haiku 4.5 20251001 <noreply@anthropic.com>, with the id \"anthropic/claude-haiku-4-5-20251001\".",
	},
	{
		label: "anthropic/claude-opus-4-0",
		model: { provider: "anthropic", id: "claude-opus-4-0" },
		modelLabel: "Claude Opus 4.0",
		expected:
			"You're currently running as Anthropic Claude Opus 4.0 <noreply@anthropic.com>, with the id \"anthropic/claude-opus-4-0\".",
	},
	{
		label: "anthropic/claude-opus-4-1",
		model: { provider: "anthropic", id: "claude-opus-4-1" },
		modelLabel: "Claude Opus 4.1",
		expected:
			"You're currently running as Anthropic Claude Opus 4.1 <noreply@anthropic.com>, with the id \"anthropic/claude-opus-4-1\".",
	},
	{
		label: "anthropic/claude-opus-4-1-20250805",
		model: { provider: "anthropic", id: "claude-opus-4-1-20250805" },
		modelLabel: "Claude Opus 4.1 20250805",
		expected:
			"You're currently running as Anthropic Claude Opus 4.1 20250805 <noreply@anthropic.com>, with the id \"anthropic/claude-opus-4-1-20250805\".",
	},
	{
		label: "anthropic/claude-opus-4-20250514",
		model: { provider: "anthropic", id: "claude-opus-4-20250514" },
		modelLabel: "Claude Opus 4 20250514",
		expected:
			"You're currently running as Anthropic Claude Opus 4 20250514 <noreply@anthropic.com>, with the id \"anthropic/claude-opus-4-20250514\".",
	},
	{
		label: "anthropic/claude-opus-4-5",
		model: { provider: "anthropic", id: "claude-opus-4-5" },
		modelLabel: "Claude Opus 4.5",
		expected:
			"You're currently running as Anthropic Claude Opus 4.5 <noreply@anthropic.com>, with the id \"anthropic/claude-opus-4-5\".",
	},
	{
		label: "anthropic/claude-opus-4-5-20251101",
		model: { provider: "anthropic", id: "claude-opus-4-5-20251101" },
		modelLabel: "Claude Opus 4.5 20251101",
		expected:
			"You're currently running as Anthropic Claude Opus 4.5 20251101 <noreply@anthropic.com>, with the id \"anthropic/claude-opus-4-5-20251101\".",
	},
	{
		label: "anthropic/claude-sonnet-4-0",
		model: { provider: "anthropic", id: "claude-sonnet-4-0" },
		modelLabel: "Claude Sonnet 4.0",
		expected:
			"You're currently running as Anthropic Claude Sonnet 4.0 <noreply@anthropic.com>, with the id \"anthropic/claude-sonnet-4-0\".",
	},
	{
		label: "anthropic/claude-sonnet-4-20250514",
		model: { provider: "anthropic", id: "claude-sonnet-4-20250514" },
		modelLabel: "Claude Sonnet 4 20250514",
		expected:
			"You're currently running as Anthropic Claude Sonnet 4 20250514 <noreply@anthropic.com>, with the id \"anthropic/claude-sonnet-4-20250514\".",
	},
	{
		label: "anthropic/claude-sonnet-4-5",
		model: { provider: "anthropic", id: "claude-sonnet-4-5" },
		modelLabel: "Claude Sonnet 4.5",
		expected:
			"You're currently running as Anthropic Claude Sonnet 4.5 <noreply@anthropic.com>, with the id \"anthropic/claude-sonnet-4-5\".",
	},
	{
		label: "anthropic/claude-sonnet-4-5-20250929",
		model: { provider: "anthropic", id: "claude-sonnet-4-5-20250929" },
		modelLabel: "Claude Sonnet 4.5 20250929",
		expected:
			"You're currently running as Anthropic Claude Sonnet 4.5 20250929 <noreply@anthropic.com>, with the id \"anthropic/claude-sonnet-4-5-20250929\".",
	},
] as const;

describe("current_model", () => {
	it.each(modelCases)("formats %s", async ({ model, modelLabel, expected }) => {
		const result = await runCurrentModel(model);

		expect(result.content).toEqual([{ type: "text", text: expected }]);
		const providerDetails = expectedProviderDetails(model.provider);

		expect(result.details).toMatchObject({
			provider: model.provider,
			providerLabel: providerDetails.providerLabel,
			attributionEmail: providerDetails.attributionEmail,
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
