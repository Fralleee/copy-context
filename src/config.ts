import { workspace, type ExtensionContext } from "vscode";
import { updateFiltersForWorkspace } from "./shared/filter";

export interface CopyContextSettings {
	respectVSCodeExplorerExclude: boolean;
	respectGitIgnore: boolean;
	includeGlobs: string[];
	excludeGlobs: string[];
	maxContentSize: number;
}

export function initializeConfig(ctx: ExtensionContext) {
	loadSettings();

	ctx.subscriptions.push(
		workspace.onDidChangeConfiguration((e) => {
			if (e.affectsConfiguration("copyContext")) {
				loadSettings();
				updateFiltersForWorkspace();
			}
		}),
	);
}

let settings: CopyContextSettings;

export function getSettings(): CopyContextSettings {
	return settings;
}

function loadSettings() {
	const cfg = workspace.getConfiguration("copyContext");
	settings = {
		respectVSCodeExplorerExclude: cfg.get("respectVSCodeExplorerExclude", true),
		respectGitIgnore: cfg.get("respectGitIgnore", false),
		includeGlobs: cfg.get<string[]>("includeGlobs") ?? [],
		excludeGlobs: cfg.get<string[]>("excludeGlobs") ?? [],
		maxContentSize: cfg.get<number>("maxContentSize", 500_000),
	};
}
