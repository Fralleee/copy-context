# Copy Code Context

Copy files or folder trees into your clipboard as Markdown—ready to paste into chats, docs, or code reviews.

---

## 🚀 Usage

1. **Explorer**  
   Select one or more **files** → right-click → **Copy Code Context**  
   Select one or more **folders** → right-click → **Copy Folder Structure**

2. **Editor Tab**  
   Right-click a tab title → **Copy Code Context (This Tab)** or **… (All Open Tabs)**.

3. **Paste** anywhere and your Markdown snippet or tree is on the clipboard

---

## ✨ Features

### 📄 Copy Code Context  

- _Explorer_: grab paths + syntax-highlighted code blocks  
- _Tabs_: copy the active file or all open files at once (_Unsaved buffers (Untitled)_ are skipped)
- Respects include/exclude globs, VS Code Explorer excludes & (opt-in) `.gitignore` 

![413995470-ee8d29c0-f9c6-41d1-8ca8-aba432a88b3f](https://github.com/user-attachments/assets/df9f0912-eaba-4fab-8962-a311ae39c2c6)

### 📂 Copy Folder Structure

- Generates a Markdown tree of your folder’s contents  
- Respects the same filters (globs, Explorer excludes, `.gitignore`)

![413995553-a2340345-8bd9-4a24-91d7-1c0d5eb05a2c](https://github.com/user-attachments/assets/ac74e4d3-d6f0-41b9-9f2b-ed76d642e19a)

---

## 🔧 Settings

| Setting                                   | Default    | Description                                                                                           |
| ----------------------------------------- | ---------- | ----------------------------------------------------------------------------------------------------- |
| `copyContext.template`                    | <code>```${language}\n// ${path}\n${content}\n```\n\n</code> | Markdown template for text files (`{language}`, `{path}`, `{content}`).               |
| `copyContext.excludeGlobs`                | `[]`       | **Always exclude** these glob patterns (highest priority).                                             |
| `copyContext.includeGlobs`                | `[]`       | **Always include** these glob patterns, even if Explorer or `.gitignore` would skip them.             |
| `copyContext.maxContentSize`              | `500000`   | Max total size (bytes) of all file contents to copy.                                                  |
| `copyContext.respectVSCodeExplorerExclude`| `true`     | Skip files/folders hidden by your VS Code `files.exclude` settings.                                    |
| `copyContext.respectGitIgnore`            | `false`    | Skip files matching your project’s `.gitignore` (opt-in).                                              |

---

## 🔍 Filtering Behavior

1. **excludeGlobs** — highest priority, always skipped  
2. **includeGlobs** — next, always kept (unless excluded above)  
3. **Explorer excludes** (`files.exclude`) — on by default  
4. **.gitignore** — off by default (opt-in via setting)

---

## 📜 License

This extension is released under the [MIT License](./LICENSE).
