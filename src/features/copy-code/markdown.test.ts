import { describe, it, expect, vi, beforeEach } from 'vitest';
import { formatCodeAsMarkdown, formatBinaryAsMarkdown, applyTemplate } from './markdown';
import * as config from '../../config';

vi.mock('../../config');

describe('Markdown Formatting', () => {
  beforeEach(() => {
    vi.mocked(config.getSettings).mockReturnValue({
      includeGlobs: [],
      excludeGlobs: [],
      respectGitIgnore: false,
      respectVSCodeExplorerExclude: true,
      maxContentSize: 500000,
      template: '// {path}\n{content}',
    });
  });

  describe('formatCodeAsMarkdown', () => {
    it('should format JavaScript files correctly', () => {
      const result = formatCodeAsMarkdown('src/test.js', 'console.log("hello");');
      
      expect(result).toContain('```javascript');
      expect(result).toContain('// src/test.js');
      expect(result).toContain('console.log("hello");');
      expect(result).toContain('```');
    });

    it('should format TypeScript files correctly', () => {
      const result = formatCodeAsMarkdown('src/utils.ts', 'const x: number = 42;');
      
      expect(result).toContain('```typescript');
      expect(result).toContain('// src/utils.ts');
      expect(result).toContain('const x: number = 42;');
    });

    it('should handle unknown file extensions', () => {
      const result = formatCodeAsMarkdown('README.xyz', 'Some content');
      
      expect(result).toContain('```plaintext');
      expect(result).toContain('// README.xyz');
      expect(result).toContain('Some content');
    });

    it('should detect language from various extensions', () => {
      const testCases = [
        { file: 'test.py', expectedLang: 'python' },
        { file: 'test.java', expectedLang: 'java' },
        { file: 'test.cpp', expectedLang: 'cpp' },
        { file: 'test.json', expectedLang: 'json' },
        { file: 'test.html', expectedLang: 'html' },
        { file: 'test.css', expectedLang: 'css' },
      ];

      testCases.forEach(({ file, expectedLang }) => {
        const result = formatCodeAsMarkdown(file, 'content');
        expect(result).toContain(`\`\`\`${expectedLang}`);
      });
    });
  });

  describe('formatBinaryAsMarkdown', () => {
    it('should format binary file metadata', () => {
      const meta = { size: 2048, mime: 'image/png' };
      const result = formatBinaryAsMarkdown('assets/logo.png', meta);
      
      expect(result).toContain('```text');
      expect(result).toContain('// assets/logo.png');
      expect(result).toContain('- size: 2.0 KB');
      expect(result).toContain('- mime: image/png');
    });

    it('should format binary file without mime type', () => {
      const meta = { size: 1024 };
      const result = formatBinaryAsMarkdown('data.bin', meta);
      
      expect(result).toContain('- size: 1.0 KB');
      expect(result).not.toContain('- mime:');
    });

    it('should handle very small files', () => {
      const meta = { size: 500 };
      const result = formatBinaryAsMarkdown('tiny.bin', meta);
      
      expect(result).toContain('- size: 0.5 KB');
    });
  });

  describe('applyTemplate', () => {
    it('should apply default template correctly', () => {
      const vars = {
        language: 'javascript',
        path: 'src/test.js',
        content: 'console.log("test");'
      };
      
      const result = applyTemplate(vars);
      
      expect(result).toContain('```javascript');
      expect(result).toContain('// src/test.js');
      expect(result).toContain('console.log("test");');
      expect(result).toContain('```');
    });

    it('should handle custom template', () => {
      vi.mocked(config.getSettings).mockReturnValue({
        includeGlobs: [],
        excludeGlobs: [],
        respectGitIgnore: false,
        respectVSCodeExplorerExclude: true,
        maxContentSize: 500000,
        template: 'File: {path}\\n\\n{content}',
      });

      const vars = {
        language: 'text',
        path: 'test.txt',
        content: 'Hello world'
      };
      
      const result = applyTemplate(vars);
      
      expect(result).toContain('File: test.txt');
      expect(result).toContain('Hello world');
    });

    it('should handle newlines in template', () => {
      vi.mocked(config.getSettings).mockReturnValue({
        includeGlobs: [],
        excludeGlobs: [],
        respectGitIgnore: false,
        respectVSCodeExplorerExclude: true,
        maxContentSize: 500000,
        template: '{path}\\n\\n{content}',
      });

      const result = applyTemplate({
        language: 'text',
        path: 'test.txt',
        content: 'content'
      });
      
      expect(result).toContain('test.txt\n\ncontent');
    });
  });
});