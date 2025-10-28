import * as vscode from "vscode";

export type CommandType = "copyContent" | "copyTree";

export function getSettings() {
	const config = vscode.workspace.getConfiguration("copyContext");
	return {
		copyContent: {
			excludeGlobs: config.get<string[]>("copyContent.excludeGlobs", []),
			includeGlobs: config.get<string[]>("copyContent.includeGlobs", []),
		},
		copyTree: {
			excludeGlobs: config.get<string[]>("copyTree.excludeGlobs", []),
			includeGlobs: config.get<string[]>("copyTree.includeGlobs", []),
		},
		enableAnalytics: config.get<boolean>("enableAnalytics", true),
		excludeGlobs: config.get<string[]>("excludeGlobs", []),
		includeEmojis: config.get<boolean>("includeEmojis", true),
		includeGlobs: config.get<string[]>("includeGlobs", []),
		maxContentSize: config.get<number>("maxContentSize", 500_000),
		respectGitIgnore: config.get<boolean>("respectGitIgnore", false),
		respectVSCodeExplorerExclude: config.get<boolean>(
			"respectVSCodeExplorerExclude",
			true,
		),
	};
}

export function getCommandSpecificGlobs(command: CommandType) {
	const settings = getSettings();
	const commandSettings = settings[command];

	return {
		excludeGlobs: [...settings.excludeGlobs, ...commandSettings.excludeGlobs],
		includeGlobs: [...settings.includeGlobs, ...commandSettings.includeGlobs],
	};
}
