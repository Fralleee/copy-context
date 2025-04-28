import { vi } from "vitest";

vi.mock("vscode", () => ({
	workspace: {
		workspaceFolders: [{ uri: { fsPath: process.cwd() } }],
		getConfiguration: () => ({ get: () => ({}) }),
	},
	window: {
		showErrorMessage: vi.fn(),
	},
}));
