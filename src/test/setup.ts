import { vi } from "vitest";

const mockVscode = {
	CancellationToken: {
		isCancellationRequested: false,
	},
	commands: {
		registerCommand: vi.fn(),
	},
	env: {
		clipboard: {
			writeText: vi.fn(),
		},
		language: "en",
		machineId: "test-machine-id",
		sessionId: "test-session-id",
		uiKind: 1,
	},
	FileType: {
		Directory: 2,
		File: 1,
	},
	ProgressLocation: {
		Notification: 15,
	},
	UIKind: {
		Desktop: 1,
		Web: 2,
	},
	Uri: {
		file: vi.fn((path: string) => ({ fsPath: path, scheme: "file" })),
		parse: vi.fn((path: string) => ({ fsPath: path, scheme: "file" })),
	},
	window: {
		activeTextEditor: null,
		createOutputChannel: vi.fn(() => ({
			appendLine: vi.fn(),
			show: vi.fn(),
		})),
		setStatusBarMessage: vi.fn(),
		showErrorMessage: vi.fn(),
		showInformationMessage: vi.fn(),
		tabGroups: {
			all: [],
		},
		withProgress: vi.fn(),
	},
	workspace: {
		getConfiguration: vi.fn(() => ({
			get: vi.fn((key: string, defaultValue?: unknown) => {
				const defaults: Record<string, unknown> = {
					enableAnalytics: false,
					excludeGlobs: [],
					includeGlobs: [],
					maxContentSize: 500000,
					respectGitIgnore: false,
					respectVSCodeExplorerExclude: true,
					template: "// {path}\n{content}",
				};
				return defaults[key] ?? defaultValue;
			}),
		})),
		getWorkspaceFolder: vi.fn(),
		workspaceFolders: [],
	},
};

vi.mock("vscode", () => mockVscode);

vi.mock("node:fs/promises", () => ({
	readdir: vi.fn(),
	readFile: vi.fn(),
	stat: vi.fn(),
}));

vi.mock("file-type", () => ({
	fromFile: vi.fn(),
}));

vi.mock("istextorbinary", () => ({
	isText: vi.fn(() => true),
}));

vi.mock("posthog-node", () => ({
	PostHog: vi.fn(() => ({
		capture: vi.fn(),
		shutdown: vi.fn(),
	})),
}));
