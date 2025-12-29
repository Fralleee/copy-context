import * as path from "node:path";
import * as vscode from "vscode";
import { getSettings } from "../../config";
import { track } from "../../monitoring/analytics";
import { languageMap } from "./language-map";
import { headerForLanguage } from "./markdown";

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

	if (doc.uri.scheme !== "file" && !doc.isUntitled) {
		vscode.window.showErrorMessage("Only file scheme documents are supported.");
		return;
	}

	const selectedText = doc.getText(selection);
	const startLine = selection.start.line + 1;
	const endLine = selection.end.line + 1;

	let relPath: string;
	if (doc.isUntitled) {
		relPath = "untitled";
	} else {
		const ws = vscode.workspace.getWorkspaceFolder(doc.uri);
		const root = ws?.uri.fsPath ?? path.dirname(doc.uri.fsPath);
		relPath = path.relative(root, doc.uri.fsPath).split(path.sep).join("/");
	}

	const { maxContentSize, pathOutsideCodeBlock = false } = getSettings();
	if (Buffer.byteLength(selectedText, "utf8") > maxContentSize) {
		throw new Error(`Exceeded maximum content size of ${maxContentSize} bytes`);
	}

	const ext = path.extname(relPath).replace(".", "").toLowerCase();
	const language = languageMap[ext] || "plaintext";
	const pathWithLines = `${relPath}:${startLine}-${endLine}`;
	const header = headerForLanguage(language, pathWithLines);
	const content = pathOutsideCodeBlock
		? selectedText
		: `${header}\n${selectedText}`;
	const prefix = pathOutsideCodeBlock ? `${pathWithLines}\n` : "";
	const snippet = `${prefix}\`\`\`${language}\n${content}\n\`\`\`\n`;

	await vscode.env.clipboard.writeText(snippet);
	outputChannel?.appendLine(
		`Copy Selection: ${relPath}:${startLine}-${endLine}`,
	);
	track("copy_selection", { command: "editor_context" });
	vscode.window.setStatusBarMessage("Selection context copied!", 3000);
}
