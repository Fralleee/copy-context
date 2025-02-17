import * as fs from "fs/promises";
import { FileTreeNode } from "../../shared/file-tree";
import { formatAsMarkdown } from "./markdown";

export async function fileContents(
  nodes: FileTreeNode[],
  visitedFiles: Set<string>,
  maxContentSize: number,
  addSizeCallback: (size: number) => void
): Promise<string> {
  let result = "";
  for (const node of nodes) {
    if (node.isDirectory && node.children) {
      result += await fileContents(
        node.children,
        visitedFiles,
        maxContentSize,
        addSizeCallback
      );
    } else if (!node.isDirectory) {
      if (!visitedFiles.has(node.relativePath)) {
        visitedFiles.add(node.relativePath);
        const content = await fs.readFile(node.fullPath, "utf-8");
        addSizeCallback(content.length);
        result += formatAsMarkdown(node.relativePath, content);
      }
    }
  }
  return result;
}
