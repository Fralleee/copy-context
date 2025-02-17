import * as vscode from "vscode";
import * as path from "path";
import { fileTree } from "../../shared/file-tree";
import { buildAsciiLines } from "./build-ascii-lines";

export async function copyStructure(uri: vscode.Uri) {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }

  const config = vscode.workspace.getConfiguration("copyContext");
  const excludeGlobs: string[] = config.get("excludeGlobs") || [];
  const folderName = path.basename(uri.fsPath);
  const tree = await fileTree(
    uri.fsPath,
    workspaceFolders[0].uri.fsPath,
    ["**"],
    excludeGlobs,
    true
  );

  const lines = buildAsciiLines(tree, "");
  const output = [
    "# Project Structure",
    `Name: ${folderName}`,
    "",
    ...lines,
  ].join("\n");

  await vscode.env.clipboard.writeText(output);
  vscode.window.setStatusBarMessage("Folder structure copied!", 3000);
}
