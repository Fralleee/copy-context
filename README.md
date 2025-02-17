# Copy Code Context - VS Code Extension

## Overview

**Copy Code Context** is a Visual Studio Code extension that allows you to quickly copy one or more files—or entire folders—as Markdown-formatted code snippets. The generated Markdown includes file paths and syntax highlighting, making it ideal for sharing code context in documentation, AI prompts (e.g. ChatGPT), or anywhere you need to present code.

## Features

- **Copy Code Context**

  - Select one or more files or folders in the VS Code Explorer.
  - Right-click and choose **Copy Code Context**.
  - Automatically includes the file path, code content, and language syntax in a Markdown code block.
  - Respects your configured include/exclude globs and file size limits.

- **Copy Folder Structure**

  - Right-click any folder in the Explorer.
  - Choose **Copy Folder Structure**.
  - Generates a Markdown-formatted tree of the folder’s contents, ignoring excluded files and folders.

- **Built-in Language Detection**

  - Based on the file extension (e.g., `.ts`, `.js`, `.tsx`, `.html`), the snippet is wrapped with the appropriate syntax highlighting.

- **Configurable**
  - Adjust `copyContext.includeGlobs`, `copyContext.excludeGlobs`, and `copyContext.maxContentSize` in the extension settings to fine-tune what gets copied.

## Installation

### From a VSIX File (Local Install)

1. Download the `.vsix` file from the [GitHub Releases](https://github.com/Fralleee/copy-code-context/releases) (if available).
2. In VS Code, open the Extensions view (<kbd>Ctrl+Shift+X</kbd> on Windows/Linux or <kbd>Cmd+Shift+X</kbd> on macOS).
3. Click the **...** button in the top-right corner and select **Install from VSIX...**.
4. Select the downloaded `.vsix` file and install the extension.

### From the VS Code Marketplace

1. Open VS Code.
2. Go to the Extensions view (<kbd>Ctrl+Shift+X</kbd> or <kbd>Cmd+Shift+X</kbd>).
3. Search for **Copy Context Extension** by `fralle`.
4. Click **Install**.

## Usage

### Copy Code Context

1. In the VS Code Explorer, select one or more files or an entire folder.
2. Right-click on your selection and choose **Copy Code Context**.
3. The extension gathers the content of the selected files (recursively for folders), respecting your include/exclude globs and maximum content size.
4. Paste the resulting Markdown in your documentation, AI prompt, or wherever you need it.

### Copy Folder Structure

1. In the VS Code Explorer, right-click on any folder.
2. Choose **Copy Folder Structure**.
3. The extension generates a tree structure representing the folder’s contents (excluding items based on your settings).
4. Paste the result in a Markdown file or any other location.

#### Example Output

**Copy Code Context:**

`````markdown
### src/utils/helpers.js

````javascript
export function greeting(name) {
  return `Hello, ${name}!`;
}


**Copy Folder Structure:**

```markdown
# Folder Structure

Name: my-project

├── 📁 src
│   ├── 📁 utils
│   │   └── 📄 helpers.js
│   └── 📄 index.ts
└── 📄 package.json
````
`````

## Configuration

You can configure the extension in **File → Preferences → Settings → Extensions → "Copy Context Extension"**. The available settings are:

- **`copyContext.includeGlobs`** (Array)  
  **Default:** `["**/*.js", "**/*.ts", "**/*.jsx", "**/*.tsx"]`  
  Files matching these patterns will be considered for copying.

- **`copyContext.excludeGlobs`** (Array)  
  **Default:** `["**/node_modules/**", "**/.vscode/**"]`  
  Files and folders matching these patterns are excluded from copying or folder structure generation.

- **`copyContext.maxContentSize`** (Number)  
  **Default:** `500000` (bytes)  
  If the total content size exceeds this limit, the extension stops copying to prevent excessive memory usage.

You can adjust these settings directly in your `.vscode/settings.json` or through the VS Code GUI.

## License

This project is released under the [MIT License](LICENSE).

## Support

For issues, questions, or feature requests, please [open an issue on GitHub](https://github.com/Fralleee/copy-code-context/issues).

## Development

To set up the extension for development:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Fralleee/copy-code-context.git
   cd copy-code-context
   ```

2. **Compile the extension:**

   ```bash
   npm run compile
   ```

3. **Lint the code:**

   ```bash
   npm run lint
   ```

4. **Run tests:**

   ```bash
   npm test
   ```

5. **Debug:**

   Press <kbd>F5</kbd> in VS Code to launch a new Extension Host window for debugging.
