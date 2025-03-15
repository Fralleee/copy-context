# Copy Code Context - VS Code Extension

**Copy Code Context** lets you quickly copy one or more files or entire folders as Markdown-formatted code snippets.

## Features

- **Copy Code Context**

  - Select one or more files or folders in the VS Code Explorer.
  - Right-click and choose **Copy Code Context**.
  - Automatically includes the file path, code content, and language syntax in a Markdown code block.
  - Respects your configured include/exclude globs and file size limits.

  ![413995470-ee8d29c0-f9c6-41d1-8ca8-aba432a88b3f](https://github.com/user-attachments/assets/df9f0912-eaba-4fab-8962-a311ae39c2c6)

- **Copy Folder Structure**

  - Right-click any folder in the Explorer.
  - Choose **Copy Folder Structure**.
  - Generates a Markdown-formatted tree of the folder’s contents, ignoring excluded files and folders.

  ![413995553-a2340345-8bd9-4a24-91d7-1c0d5eb05a2c](https://github.com/user-attachments/assets/ac74e4d3-d6f0-41b9-9f2b-ed76d642e19a)

- **Configurable**
  - Adjust `copyContext.includeGlobs`, `copyContext.excludeGlobs`, and `copyContext.maxContentSize` in the extension settings to fine-tune what gets copied.
