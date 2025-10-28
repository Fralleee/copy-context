import * as path from "node:path";
import * as vscode from "vscode";
import { getSettings } from "../../config";
import { track } from "../../monitoring/analytics";
import { formatCodeAsMarkdown } from "./markdown";

/**
 * Copy the current editor selection to clipboard in copy-context style.
 *
 * Output format:
 * <relative/path>:<start>-<end>
 * ```<language>
 * // <relative/path>:<start>-<end>
 * <selected content>
 * ```
 *
 * This keeps copy-context's fenced block style, but combines the location info
 * in the header comment to avoid duplication.
 */
export async function copySelection(outputChannel?: vscode.OutputChannel) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		vscode.window.showErrorMessage("No active editor to copy selection from.");
		return;
	}

	const doc = editor.document;
	const selection = editor.selection;

	if (selection.isEmpty) {
		vscode.window.showErrorMessage("No text selected.");
		return;
	}

	// For untitled files, we'll use a default name instead of requiring save
	if (doc.uri.scheme !== "file" && !doc.isUntitled) {
		vscode.window.showErrorMessage(
			"Only file scheme documents are supported.",
		);
		return;
	}

	const selectedText = doc.getText(selection);
	const startLine = selection.start.line + 1;
	const endLine = selection.end.line + 1;

	let relPath: string;
	if (doc.isUntitled) {
		// Use default name for untitled files
		relPath = "untitled";
	} else {
		const ws = vscode.workspace.getWorkspaceFolder(doc.uri);
		const root = ws?.uri.fsPath ?? path.dirname(doc.uri.fsPath);
		relPath = path.relative(root, doc.uri.fsPath).split(path.sep).join("/");
	}

	// Respect existing copy-context size limit
	const { maxContentSize } = getSettings();
	if (Buffer.byteLength(selectedText, "utf8") > maxContentSize) {
		vscode.window.showErrorMessage(
			`Selected text exceeds maxContentSize (${maxContentSize} bytes).`,
		);
		return;
	}

	// Create a custom format that includes line info in the header to avoid duplication
	const ext = path.extname(relPath).replace(".", "").toLowerCase();
	const language = ext ? ext : "plaintext";
	const header = `// ${relPath}:${startLine}-${endLine}`;
	const snippet = `\`\`\`${language}\n${header}\n${selectedText}\n\`\`\`\n`;

	try {
		await vscode.env.clipboard.writeText(snippet);
		outputChannel?.appendLine(
			`Copy Selection: ${relPath}:${startLine}-${endLine}`,
		);
		track("copy_selection", { command: "editor_context" });
		vscode.window.setStatusBarMessage("Selection context copied!", 3000);
	} catch (err) {
		outputChannel?.appendLine(`Copy Selection failed: ${String(err)}`);
		track("error", { error: err, operation: "copy_selection" });
		vscode.window.showErrorMessage(`Failed to copy selection: ${String(err)}`);
	}
}
