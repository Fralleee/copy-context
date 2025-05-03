# Copy Code Context - VS Code Extension

**Copy Code Context** lets you quickly **copy** one or more files or entire folders **directly to your clipboard** as Markdown-formatted code snippets or folder structures.

## Features

- **Copy Code Context (Explorer)**

  - Select one or more files or folders in the VS Code Explorer.
  - Right-click and choose **Copy Code Context**.
  - **Copies** the file path, code content, and language syntax **to your clipboard** in a Markdown code block.

  ![413995470-ee8d29c0-f9c6-41d1-8ca8-aba432a88b3f](https://github.com/user-attachments/assets/df9f0912-eaba-4fab-8962-a311ae39c2c6)

- **Copy Code Context (Editor Tab)**

  - Right-click any open editor tab.
  - Choose **Copy Code Context (This Tab)** to copy the current file, or **Copy Code Context (All Open Tabs)** to copy all files you have open.
  - **Copies** each file’s path and content **directly to your clipboard** as Markdown.
  - **Note:** Only works for files saved on disk, unsaved (Untitled) buffers are not supported.

- **Copy Folder Structure**

  - Right-click any folder in the Explorer.
  - Choose **Copy Folder Structure**.
  - **Copies** a Markdown-formatted tree of the folder’s contents **to your clipboard**, ignoring excluded files and folders.

  ![413995553-a2340345-8bd9-4a24-91d7-1c0d5eb05a2c](https://github.com/user-attachments/assets/ac74e4d3-d6f0-41b9-9f2b-ed76d642e19a)

- **Configurable**
  - Adjust `copyContext.includeGlobs`, `copyContext.excludeGlobs`, and `copyContext.maxContentSize` in the extension settings to fine-tune what gets copied.

## Filtering Behavior

- `excludeGlobs` have highest priority and will always be excluded.
- `includeGlobs` next, ensuring matches are always included unless explicitly excluded.
- **VS Code Explorer excludes** are on by default, hiding files/folders marked in `files.exclude`.
- `.gitignore` excludes are off by default (opt-in via settings).

## Usage

1. Select files or folders in the Explorer.
2. Right‑click and choose **Copy Code Context** or **Copy Folder Structure**.
3. **Paste** anywhere (editor, chat, notes) — your Markdown is now on the clipboard, ready to use.