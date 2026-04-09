import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { registerCurrentModel } from "./tools/current-model.ts";
import { registerListGuidelines } from "./tools/list-guidelines.ts";
import { registerListTools } from "./tools/list-tools.ts";
import { registerRuntimeDocs } from "./tools/runtime-docs.ts";

export default function listToolsExtension(pi: ExtensionAPI) {
	registerListTools(pi);
	registerListGuidelines(pi);
	registerCurrentModel(pi);
	registerRuntimeDocs(pi);
}
