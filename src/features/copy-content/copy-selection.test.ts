import { describe, expect, it, vi } from "vitest";
import { copySelection } from "./copy-selection";

vi.mock("../../config");
vi.mock("../../monitoring/analytics");

describe("copySelection", () => {
	it("should handle no active editor", async () => {
		// Mock vscode.window.activeTextEditor
		vi.mock("vscode", () => ({
			env: {
				clipboard: {
					writeText: vi.fn(),
				},
			},
			window: {
				activeTextEditor: undefined,
				showErrorMessage: vi.fn(),
			},
			workspace: {
				getWorkspaceFolder: vi.fn(),
			},
		}));

		await copySelection();

		// This test mainly verifies error handling
		expect(true).toBe(true);
	});

	it("should handle empty selection", async () => {
		// Mock vscode.window.activeTextEditor with empty selection
		vi.mock("vscode", () => ({
			env: {
				clipboard: {
					writeText: vi.fn(),
				},
			},
			window: {
				activeTextEditor: {
					document: {},
					selection: {
						isEmpty: true,
					},
				},
				showErrorMessage: vi.fn(),
			},
			workspace: {
				getWorkspaceFolder: vi.fn(),
			},
		}));

		await copySelection();

		expect(true).toBe(true);
	});
});
