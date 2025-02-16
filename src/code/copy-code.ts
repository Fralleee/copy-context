import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs/promises";
import { minimatch } from "minimatch";

export async function copyCode(uris: vscode.Uri[]) {
  const config = vscode.workspace.getConfiguration("copyContext");
  const includeGlobs: string[] = config.get("includeGlobs") ?? [];
  const excludeGlobs: string[] = config.get("excludeGlobs") ?? [];
  const maxContentSize: number = config.get("maxContentSize") ?? 500000;

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders || workspaceFolders.length === 0) {
    vscode.window.showErrorMessage("No workspace folder found.");
    return;
  }

  const rootPath = workspaceFolders[0].uri.fsPath;
  const visitedFiles = new Set<string>();
  let totalSize = 0;
  let resultText = "";

  for (const uri of uris) {
    const stat = await vscode.workspace.fs.stat(uri);
    if (stat.type === vscode.FileType.Directory) {
      resultText += await processDirectory(
        uri.fsPath,
        rootPath,
        includeGlobs,
        excludeGlobs,
        visitedFiles,
        maxContentSize,
        (size) => {
          totalSize += size;
          if (totalSize > maxContentSize) {
            throw new Error(
              `Exceeded maximum content size of ${maxContentSize} bytes`
            );
          }
        }
      );
    } else {
      const relPath = path.relative(rootPath, uri.fsPath);
      if (!shouldIncludeFile(relPath, includeGlobs, excludeGlobs)) {
        continue;
      }
      if (!visitedFiles.has(relPath)) {
        visitedFiles.add(relPath);
        const fileContents = await fs.readFile(uri.fsPath, "utf8");
        totalSize += fileContents.length;
        if (totalSize > maxContentSize) {
          throw new Error(
            `Exceeded maximum content size of ${maxContentSize} bytes`
          );
        }
        resultText += formatAsMarkdown(relPath, fileContents);
      }
    }
  }

  await vscode.env.clipboard.writeText(resultText.trim());
  vscode.window.showInformationMessage("Code context copied to clipboard!");
}

async function processDirectory(
  dirPath: string,
  rootPath: string,
  includeGlobs: string[],
  excludeGlobs: string[],
  visitedFiles: Set<string>,
  maxContentSize: number,
  addSizeCallback: (size: number) => void
): Promise<string> {
  let result = "";
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relPath = path.relative(rootPath, fullPath);

    if (entry.isDirectory()) {
      result += await processDirectory(
        fullPath,
        rootPath,
        includeGlobs,
        excludeGlobs,
        visitedFiles,
        maxContentSize,
        addSizeCallback
      );
    } else if (entry.isFile()) {
      if (shouldIncludeFile(relPath, includeGlobs, excludeGlobs)) {
        if (!visitedFiles.has(relPath)) {
          visitedFiles.add(relPath);
          const fileContents = await fs.readFile(fullPath, "utf8");
          addSizeCallback(fileContents.length);
          result += formatAsMarkdown(relPath, fileContents);
        }
      }
    }
  }

  return result;
}

function shouldIncludeFile(
  relPath: string,
  includeGlobs: string[],
  excludeGlobs: string[]
): boolean {
  const included = includeGlobs.some((glob) => minimatch(relPath, glob));
  if (!included) {
    return false;
  }

  const excluded = excludeGlobs.some((glob) => minimatch(relPath, glob));
  if (excluded) {
    return false;
  }

  return true;
}

function formatAsMarkdown(relativePath: string, content: string): string {
  const ext = path.extname(relativePath).toLowerCase().replace(".", "");
  const lang = guessLanguageFromExtension(ext);

  return (
    `### ${relativePath}\n` + `\`\`\`${lang}\n` + `${content}\n` + `\`\`\`\n\n`
  );
}

function guessLanguageFromExtension(ext: string): string {
  switch (ext) {
    case "js":
    case "cjs":
    case "mjs":
      return "javascript";
    case "ts":
      return "typescript";
    case "jsx":
      return "javascriptreact";
    case "tsx":
      return "typescriptreact";
    case "json":
      return "json";
    case "css":
      return "css";
    case "html":
      return "html";
    default:
      return "";
  }
}
