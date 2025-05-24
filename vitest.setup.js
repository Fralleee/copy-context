import { vi } from "vitest";

vi.mock("vscode", () => ({
	window: {
		showErrorMessage: vi.fn(),
	},
	workspace: {
		getConfiguration: () => ({ get: () => ({}) }),
		workspaceFolders: [{ uri: { fsPath: process.cwd() } }],
	},
}));
