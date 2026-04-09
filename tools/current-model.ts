import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Type } from "@sinclair/typebox";

const PROVIDERS = {
	openai: {
		label: "OpenAI",
		email: "noreply@openai.com",
	},
	"openai-codex": {
		label: "OpenAI Codex",
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

function humanizeIdentifier(identifier: string) {
	return identifier
		.replace(/[-_]+/g, " ")
		.split(" ")
		.map(titleCase)
		.join(" ");
}

function formatProvider(provider: string) {
	const providerKey = provider.toLowerCase();
	const knownProvider = providerKey in PROVIDERS ? PROVIDERS[providerKey as keyof typeof PROVIDERS] : undefined;

	return {
		providerKey,
		label: knownProvider?.label ?? humanizeIdentifier(providerKey),
		email: knownProvider?.email ?? `noreply@${providerKey}.com`,
	};
}

function formatOpenAIModel(modelId: string) {
	const parts = modelId.split("-");
	const family = parts.shift() ?? modelId;
	const familyLabel = family === "gpt" ? "GPT" : titleCase(family);

	if (parts.length === 0) {
		return familyLabel;
	}

	return [
		`${familyLabel}-${parts.shift()}`,
		parts.map(titleCase).join(" "),
	]
		.filter(Boolean)
		.join(" ");
}

function isNumericSegment(segment: string) {
	return /^\d+$/.test(segment);
}

function isDatePin(segment: string) {
	return /^\d{8}$/.test(segment);
}

function parseAnthropicVersion(parts: Array<string>) {
	if (parts.length === 0 || !isNumericSegment(parts[0])) {
		return undefined;
	}

	const majorVersion = parts.shift()!;
	const minorVersion = parts[0] && isNumericSegment(parts[0]) && parts[0].length <= 2 ? parts.shift()! : undefined;

	return [majorVersion, minorVersion].filter(Boolean).join(".");
}

function formatAnthropicModel(modelId: string) {
	const parts = modelId.split("-");
	const family = parts.shift() ?? modelId;

	if (parts.length === 0) {
		return titleCase(family);
	}

	const labelParts = [titleCase(family)];

	if (isNumericSegment(parts[0])) {
		const version = parseAnthropicVersion(parts);
		if (version) {
			labelParts.push(version);
		}

		if (parts.length > 0) {
			labelParts.push(titleCase(parts.shift()!));
		}
	} else {
		labelParts.push(titleCase(parts.shift()!));

		const version = parseAnthropicVersion(parts);
		if (version) {
			labelParts.push(version);
		}
	}

	if (parts.length > 0 && isDatePin(parts[parts.length - 1])) {
		parts.pop();
	}

	if (parts.length > 0) {
		labelParts.push(parts.map(titleCase).join(" "));
	}

	return labelParts.join(" ");
}

function formatModel(provider: string, modelId: string) {
	const providerInfo = formatProvider(provider);
	const providerKey = providerInfo.providerKey;

	let modelLabel = modelId;
	if (providerKey.startsWith("openai")) {
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
