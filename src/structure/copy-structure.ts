import * as vscode from "vscode";
import * as path from "path";
import { buildTreeLines } from "./build-tree-lines";

export async function copyStructure(uri: vscode.Uri) {
  const folderName = path.basename(uri.fsPath);
  const lines = await buildTreeLines(uri.fsPath, "");

  const output = [
    "# Project Structure",
    `Name: ${folderName}`,
    "",
    ...lines,
  ].join("\n");

  await vscode.env.clipboard.writeText(output);
  vscode.window.showInformationMessage("Folder structure copied to clipboard!");
}
