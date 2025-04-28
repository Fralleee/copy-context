import { vi } from "vitest";

console.log("vitest.setup.ts: running setup file");
vi.mock("vscode", () => ({
	workspace: {
		workspaceFolders: [{ uri: { fsPath: process.cwd() } }],
		getConfiguration: () => ({ get: () => ({}) }),
	},
	window: {
		showErrorMessage: vi.fn(),
	},
}));
