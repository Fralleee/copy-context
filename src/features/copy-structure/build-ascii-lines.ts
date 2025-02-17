import { FileTreeNode } from "../../shared/file-tree";

export function buildAsciiLines(
  nodes: FileTreeNode[],
  prefix: string
): string[] {
  const lines: string[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const isLast = i === nodes.length - 1;
    const branch = isLast ? "└──" : "├──";
    const icon = node.isDirectory ? "📁" : "📄";
    lines.push(`${prefix}${branch} ${icon} ${node.name}`);

    if (node.isDirectory && node.children) {
      const newPrefix = prefix + (isLast ? "    " : "│   ");
      const childLines = buildAsciiLines(node.children, newPrefix);
      lines.push(...childLines);
    }
  }

  return lines;
}
