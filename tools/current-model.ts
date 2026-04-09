import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

const PROVIDERS = {
	openai: {
		label: "OpenAI",
		email: "noreply@openai.com",
	},
	anthropic: {
		label: "Anthropic",
		email: "noreply@anthropic.com",
	},
} as const;

function titleCase(segment: string) {
	if (!/^[a-z]+$/.test(segment)) {
		return segment;
	}

	return `${segment[0].toUpperCase()}${segment.slice(1)}`;
}

function formatProvider(provider: string) {
	const providerKey = provider.toLowerCase();
	const knownProvider = providerKey in PROVIDERS ? PROVIDERS[providerKey as keyof typeof PROVIDERS] : undefined;

	return {
		providerKey,
		label: knownProvider?.label ?? titleCase(providerKey),
		email: knownProvider?.email ?? `noreply@${providerKey}.com`,
	};
}

function formatOpenAIModel(modelId: string) {
	const parts = modelId.split("-");
	const suffixes = new Set(["mini", "nano", "preview", "latest", "pro"]);
	const suffix = parts.length > 1 && suffixes.has(parts[parts.length - 1]) ? titleCase(parts.pop()!) : undefined;
	const family = parts.shift() ?? modelId;
	const familyLabel = family === "gpt" ? "GPT" : titleCase(family);
	const base = parts.length > 0 ? `${familyLabel}-${parts.join("-")}` : familyLabel;

	return [base, suffix].filter(Boolean).join(" ");
}

function formatAnthropicModel(modelId: string) {
	const parts = modelId.split("-");
	const family = parts.shift() ?? modelId;

	if (parts.length === 0) {
		return titleCase(family);
	}

	const tier = titleCase(parts.shift()!);
	const version = parts.join(".");

	return [titleCase(family), tier, version].filter(Boolean).join(" ");
}

function formatModel(provider: string, modelId: string) {
	const providerInfo = formatProvider(provider);
	const providerKey = providerInfo.providerKey;

	let modelLabel = modelId;
	if (providerKey === "openai") {
		modelLabel = formatOpenAIModel(modelId);
	} else if (providerKey === "anthropic") {
		modelLabel = formatAnthropicModel(modelId);
	} else {
		modelLabel = modelId
			.replace(/[-_]+/g, " ")
			.split(" ")
			.map(titleCase)
			.join(" ");
	}

	return {
		provider: providerKey,
		providerLabel: providerInfo.label,
		attributionEmail: providerInfo.email,
		modelId,
		modelLabel,
		fullModelId: `${providerKey}/${modelId}`,
		formatted: `You're currently running as ${providerInfo.label} ${modelLabel} <${providerInfo.email}>, with the id "${providerKey}/${modelId}".`,
	};
}

export function registerCurrentModel(pi: ExtensionAPI) {
	pi.registerTool({
		name: "current_model",
		label: "Current Model",
		description: "Get the currently active model, formatted with provider attribution.",
		promptSnippet: "Get the currently active model, formatted with provider attribution.",
		parameters: Type.Object({}),
		async execute(_toolCallId, _params, _signal, _onUpdate, ctx) {
			if (!ctx.model) {
				return {
					content: [{ type: "text", text: "You're currently not running a model." }],
					details: undefined,
				};
			}

			const currentModel = formatModel(ctx.model.provider, ctx.model.id);

			return {
				content: [{ type: "text", text: currentModel.formatted }],
				details: currentModel,
			};
		},
	});
}
