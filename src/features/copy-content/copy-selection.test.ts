/** biome-ignore-all lint/suspicious/noExplicitAny: allow any for tests */

import { beforeEach, describe, expect, it, vi } from "vitest";
import * as vscode from "vscode";
import { copySelection } from "./copy-selection";

vi.mock("../../config");
vi.mock("../../monitoring/analytics");

describe("copySelection", () => {
	const mockClipboard = {
		writeText: vi.fn(),
	};
	const mockShowErrorMessage = vi.fn();
	const mockSetStatusBarMessage = vi.fn();
	const mockGetWorkspaceFolder = vi.fn();
	const mockOutputChannel = {
		appendLine: vi.fn(),
	};

	beforeEach(async () => {
		vi.clearAllMocks();

		// Reset clipboard mock to resolved state
		mockClipboard.writeText.mockResolvedValue(undefined);

		(vscode.env as any).clipboard = mockClipboard;
		(vscode.window as any).showErrorMessage = mockShowErrorMessage;
		(vscode.window as any).setStatusBarMessage = mockSetStatusBarMessage;
		(vscode.workspace as any).getWorkspaceFolder = mockGetWorkspaceFolder;

		vi.mocked((await import("../../config")).getSettings).mockReturnValue({
			maxContentSize: 10000,
			pathOutsideCodeBlock: false,
		} as any);
	});

	it("should show error when no active editor", async () => {
		(vscode.window as any).activeTextEditor = undefined;

		await copySelection();

		expect(mockShowErrorMessage).toHaveBeenCalledWith(
			"No active editor to copy selection from.",
		);
		expect(mockClipboard.writeText).not.toHaveBeenCalled();
	});

	it("should show error when selection is empty", async () => {
		(vscode.window as any).activeTextEditor = {
			document: {
				uri: vscode.Uri.file("/project/test.ts"),
			},
			selection: {
				isEmpty: true,
			},
		};

		await copySelection();

		expect(mockShowErrorMessage).toHaveBeenCalledWith("No text selected.");
		expect(mockClipboard.writeText).not.toHaveBeenCalled();
	});

	it("should show error for non-file scheme documents", async () => {
		(vscode.window as any).activeTextEditor = {
			document: {
				isUntitled: false,
				uri: { fsPath: "/project/test.ts", scheme: "http" },
			},
			selection: {
				isEmpty: false,
			},
		};

		await copySelection();

		expect(mockShowErrorMessage).toHaveBeenCalledWith(
			"Only file scheme documents are supported.",
		);
		expect(mockClipboard.writeText).not.toHaveBeenCalled();
	});

	it("should copy selection with correct format for TypeScript file", async () => {
		const mockDocument = {
			getText: vi.fn().mockReturnValue("const x = 1;"),
			isUntitled: false,
			uri: vscode.Uri.file("/project/src/test.ts"),
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 4 },
				isEmpty: false,
				start: { line: 4 },
			},
		};

		mockGetWorkspaceFolder.mockReturnValue({
			uri: vscode.Uri.file("/project"),
		});

		await copySelection(mockOutputChannel as any);

		expect(mockClipboard.writeText).toHaveBeenCalledWith(
			"```ts\n// src/test.ts:5-5\nconst x = 1;\n```\n",
		);
		expect(mockSetStatusBarMessage).toHaveBeenCalledWith(
			"Selection context copied!",
			3000,
		);
		expect(mockOutputChannel.appendLine).toHaveBeenCalledWith(
			"Copy Selection: src/test.ts:5-5",
		);
	});

	it("should place path outside the code block when configured", async () => {
		const mockDocument = {
			getText: vi.fn().mockReturnValue("const x = 1;"),
			isUntitled: false,
			uri: vscode.Uri.file("/project/src/test.ts"),
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 4 },
				isEmpty: false,
				start: { line: 4 },
			},
		};

		mockGetWorkspaceFolder.mockReturnValue({
			uri: vscode.Uri.file("/project"),
		});

		const { getSettings } = await import("../../config");
		vi.mocked(getSettings).mockReturnValue({
			maxContentSize: 10000,
			pathOutsideCodeBlock: true,
		} as any);

		await copySelection();

		expect(mockClipboard.writeText).toHaveBeenCalledWith(
			"src/test.ts:5-5\n```ts\nconst x = 1;\n```\n",
		);
	});

	it("should use correct comment style for Python files", async () => {
		const mockDocument = {
			getText: vi.fn().mockReturnValue("print('hello')"),
			isUntitled: false,
			uri: vscode.Uri.file("/project/script.py"),
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 0 },
				isEmpty: false,
				start: { line: 0 },
			},
		};

		mockGetWorkspaceFolder.mockReturnValue({
			uri: vscode.Uri.file("/project"),
		});

		await copySelection();

		expect(mockClipboard.writeText).toHaveBeenCalledWith(
			"```python\n# script.py:1-1\nprint('hello')\n```\n",
		);
	});

	it("should use correct comment style for HTML files", async () => {
		const mockDocument = {
			getText: vi.fn().mockReturnValue("<div>test</div>"),
			isUntitled: false,
			uri: vscode.Uri.file("/project/index.html"),
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 12 },
				isEmpty: false,
				start: { line: 10 },
			},
		};

		mockGetWorkspaceFolder.mockReturnValue({
			uri: vscode.Uri.file("/project"),
		});

		await copySelection();

		expect(mockClipboard.writeText).toHaveBeenCalledWith(
			"```html\n<!-- index.html:11-13 -->\n<div>test</div>\n```\n",
		);
	});

	it("should handle untitled files", async () => {
		const mockDocument = {
			getText: vi.fn().mockReturnValue("temp code"),
			isUntitled: true,
			uri: { fsPath: "", scheme: "untitled" },
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 2 },
				isEmpty: false,
				start: { line: 0 },
			},
		};

		await copySelection();

		expect(mockClipboard.writeText).toHaveBeenCalledWith(
			"```plaintext\n// untitled:1-3\ntemp code\n```\n",
		);
	});

	it("should use parent directory as root when no workspace folder", async () => {
		const mockDocument = {
			getText: vi.fn().mockReturnValue("console.log('test');"),
			isUntitled: false,
			uri: vscode.Uri.file("/home/user/projects/standalone/file.js"),
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 0 },
				isEmpty: false,
				start: { line: 0 },
			},
		};

		mockGetWorkspaceFolder.mockReturnValue(undefined);

		await copySelection();

		expect(mockClipboard.writeText).toHaveBeenCalledWith(
			"```js\n// file.js:1-1\nconsole.log('test');\n```\n",
		);
	});

	it("should throw error when selection exceeds maxContentSize", async () => {
		const largeText = "x".repeat(10001);
		const mockDocument = {
			getText: vi.fn().mockReturnValue(largeText),
			isUntitled: false,
			uri: vscode.Uri.file("/project/large.txt"),
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 100 },
				isEmpty: false,
				start: { line: 0 },
			},
		};

		mockGetWorkspaceFolder.mockReturnValue({
			uri: vscode.Uri.file("/project"),
		});

		await expect(copySelection()).rejects.toThrow(
			"Exceeded maximum content size of 10000 bytes",
		);
		expect(mockClipboard.writeText).not.toHaveBeenCalled();
	});

	it("should throw error on clipboard write failure", async () => {
		const mockDocument = {
			getText: vi.fn().mockReturnValue("const x = 1;"),
			isUntitled: false,
			uri: vscode.Uri.file("/project/test.ts"),
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 0 },
				isEmpty: false,
				start: { line: 0 },
			},
		};

		mockGetWorkspaceFolder.mockReturnValue({
			uri: vscode.Uri.file("/project"),
		});

		const error = new Error("Clipboard access denied");
		mockClipboard.writeText.mockRejectedValue(error);

		await expect(copySelection(mockOutputChannel as any)).rejects.toThrow(
			"Clipboard access denied",
		);
	});

	it("should normalize paths to forward slashes", async () => {
		const mockDocument = {
			getText: vi.fn().mockReturnValue("export const Button = () => {}"),
			isUntitled: false,
			uri: vscode.Uri.file("/project/src/components/Button.tsx"),
		};

		(vscode.window as any).activeTextEditor = {
			document: mockDocument,
			selection: {
				end: { line: 0 },
				isEmpty: false,
				start: { line: 0 },
			},
		};

		mockGetWorkspaceFolder.mockReturnValue({
			uri: vscode.Uri.file("/project"),
		});

		await copySelection();

		const call = mockClipboard.writeText.mock.calls[0][0];
		// Verify the path uses forward slashes and includes line numbers
		expect(call).toContain("src/components/Button.tsx:1-1");
		// Verify it's properly formatted as TSX
		expect(call).toMatch(/^```tsx\n\/\/ src\/components\/Button\.tsx:1-1\n/);
	});

	it("should use correct language mapping for extensions", async () => {
		const testCases = [
			{ expectedLang: "js", file: "test.js" },
			{ expectedLang: "ts", file: "test.ts" },
			{ expectedLang: "tsx", file: "test.tsx" },
			{ expectedLang: "jsx", file: "test.jsx" },
			{ expectedLang: "python", file: "test.py" },
			{ expectedLang: "markdown", file: "test.md" },
			{ expectedLang: "rust", file: "test.rs" },
			{ expectedLang: "go", file: "test.go" },
			{ expectedLang: "java", file: "test.java" },
			{ expectedLang: "plaintext", file: "test.unknown" },
		];

		for (const { file, expectedLang } of testCases) {
			// Only clear the mocks we need to reset, not the vscode mocks
			mockClipboard.writeText.mockClear();
			mockGetWorkspaceFolder.mockClear();

			const mockDocument = {
				getText: vi.fn().mockReturnValue("test"),
				isUntitled: false,
				uri: vscode.Uri.file(`/project/${file}`),
			};

			(vscode.window as any).activeTextEditor = {
				document: mockDocument,
				selection: {
					end: { line: 0 },
					isEmpty: false,
					start: { line: 0 },
				},
			};

			mockGetWorkspaceFolder.mockReturnValue({
				uri: vscode.Uri.file("/project"),
			});

			await copySelection();

			const call = mockClipboard.writeText.mock.calls[0][0];
			expect(call).toMatch(new RegExp(`^\`\`\`${expectedLang}\n`));
		}
	});
});
