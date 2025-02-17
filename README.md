# Copy Code Context - VS Code Extension

## Overview

Copy Code Context is a Visual Studio Code extension that helps you quickly copy one or more files—or entire folders—as Markdown-formatted code snippets, complete with file paths and syntax highlighting. It’s perfect for sharing context in documentation or when working with AI tools like ChatGPT or other large language models.

## Features

1. Copy Code Context

   - Select files/folders in the VS Code Explorer, then right-click → CCC: Copy Code Context.
   - Automatically includes the file path, code content, and language syntax in a Markdown code block.
   - Respects your configured include/exclude globs and file size limits.

2. Copy Folder Structure

   - Right-click any folder in the Explorer → CCC: Copy Folder Structure.
   - Generates a Markdown-formatted tree of the folder’s contents, ignoring excluded folders/files.

3. Built-in Language Detection

   - Based on file extension (.ts, .js, .tsx, .html, etc.), the snippet is wrapped with the correct syntax highlight language.

4. Configurable
   - Adjust includeGlobs, excludeGlobs, and maxContentSize in the extension settings to fine-tune what gets copied.

## Installation

### From VSIX File (Local Install)

1. Download the .vsix file from the GitHub Releases (if available).
2. In VS Code, open the Extensions view (Ctrl+Shift+X or Cmd+Shift+X on macOS).
3. Click on the ... at the top-right of the Extensions view, then choose Install from VSIX....
4. Select the downloaded .vsix file and install.

### From VS Code Marketplace

1. Open VS Code.
2. Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X on macOS).
3. Search for “Copy Context Extension” by fralle.
4. Click Install.

## Usage

1. Copy Code Context
   - In the VS Code Explorer, select one or more files or an entire folder.
   - Right-click on your selection and choose “CCC: Copy Code Context”.
   - The extension gathers the contents of the selected files (recursively if you chose a folder), respecting your include/exclude globs and maxContentSize.
   - Paste the Markdown result in your AI prompt, documentation, or wherever you need it.
2. Copy Folder Structure
   - In the VS Code Explorer, right-click on any folder.
   - Choose “CCC: Copy Folder Structure”.
   - The extension generates a tree structure showing the folder’s contents (only including files/folders not excluded by your settings).
   - Paste the result in a text/markdown file or anywhere else you want to show your project structure.

### Example Output

Copy Code Context might produce something like:

````markdown
### src/utils/helpers.js

```javascript
export function greeting(name) {
  return `Hello, ${name}!`;
}
```
````

Copy Folder Structure might produce something like:

```markdown
# Folder Structure

Name: my-project

├── 📁 src
│ ├── 📁 utils
│ │ └── 📄 helpers.js
│ └── 📄 index.ts
└── 📄 package.json
```

## Configuration

In Settings (File → Preferences → Settings → Extensions → “Copy Context Extension”), you can configure:

- `copyContext.includeGlobs` (Array)
  Default: ["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]
  Files matching these patterns will be considered for copying.

- `copyContext.excludeGlobs` (Array)
  Default: ["**/node_modules/**", "**/.vscode/**"]
  Files/folders matching these patterns are excluded from copying or folder structure generation.

- `copyContext.maxContentSize` (Number)
  Default: 500000 (bytes)
  If copying exceeds this size, the extension stops to prevent overly large memory usage.

You can adjust these settings directly in your `.vscode/settings.json` or through the VS Code GUI settings.

## License

This project is released under the MIT License.

## Support

For issues, questions, or feature requests, please open a GitHub issue.

## Development

1. Clone the repo.
2. Compile: npm run compile.
3. Lint: npm run lint.
4. Test: npm test (if tests are set up).
5. Debug: Press F5 in VS Code to run the extension in a new Extension Host window.
