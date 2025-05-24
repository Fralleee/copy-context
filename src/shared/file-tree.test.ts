import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fileTree } from './file-tree';
import type { FilterContext } from './make-filter-context';

vi.mock('node:fs/promises', () => ({
  readdir: vi.fn(),
}));

vi.mock('./filter', () => ({
  shouldIncludePath: vi.fn(() => true),
}));

describe('fileTree', () => {
  const mockFilterContext: FilterContext = {
    includeGlobs: [],
    excludeGlobs: [],
    gitIgnore: null,
    vscodeExcludes: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build a simple file tree', async () => {
    const { readdir } = await import('node:fs/promises');
    const mockReaddir = vi.mocked(readdir);
    
    // Mock directory structure:
    // /root
    //   ├── file1.txt
    //   ├── file2.js
    //   └── subfolder/
    //       └── nested.ts

    mockReaddir
      .mockResolvedValueOnce([
        { name: 'file1.txt', isDirectory: () => false, isFile: () => true } as any,
        { name: 'file2.js', isDirectory: () => false, isFile: () => true } as any,
        { name: 'subfolder', isDirectory: () => true, isFile: () => false } as any,
      ])
      .mockResolvedValueOnce([
        { name: 'nested.ts', isDirectory: () => false, isFile: () => true } as any,
      ]);

    const result = await fileTree('/root', '/root', mockFilterContext);

    expect(result).toHaveLength(3);
    
    expect(result[0].name).toBe('subfolder');
    expect(result[0].isDirectory).toBe(true);
    expect(result[0].children).toHaveLength(1);
    expect(result[0].children![0].name).toBe('nested.ts');
    
    expect(result[1].name).toBe('file1.txt');
    expect(result[1].isDirectory).toBe(false);
    
    expect(result[2].name).toBe('file2.js');
    expect(result[2].isDirectory).toBe(false);
  });

  it('should handle empty directories', async () => {
    const { readdir } = await import('node:fs/promises');
    const mockReaddir = vi.mocked(readdir);
    
    mockReaddir.mockResolvedValueOnce([]);

    const result = await fileTree('/empty', '/root', mockFilterContext);

    expect(result).toHaveLength(0);
  });

  it('should handle directory read errors', async () => {
    const { readdir } = await import('node:fs/promises');
    const mockReaddir = vi.mocked(readdir);
    
    mockReaddir.mockRejectedValueOnce(new Error('Permission denied'));

    const result = await fileTree('/forbidden', '/root', mockFilterContext);

    expect(result).toHaveLength(0);
  });

  it('should filter out excluded paths', async () => {
    const { readdir } = await import('node:fs/promises');
    const mockReaddir = vi.mocked(readdir);
    const { shouldIncludePath } = await import('./filter');
    const mockShouldIncludePath = vi.mocked(shouldIncludePath);
    
    mockShouldIncludePath.mockImplementation((path: string) => {
      return !path.includes('node_modules');
    });

    mockReaddir.mockResolvedValueOnce([
      { name: 'src', isDirectory: () => true, isFile: () => false } as any,
      { name: 'node_modules', isDirectory: () => true, isFile: () => false } as any,
      { name: 'package.json', isDirectory: () => false, isFile: () => true } as any,
    ]);

    mockReaddir.mockResolvedValueOnce([]);

    const result = await fileTree('/project', '/project', mockFilterContext);

    expect(result).toHaveLength(1);
    expect(result.find(node => node.name === 'node_modules')).toBeUndefined();
    expect(result.find(node => node.name === 'src')).toBeUndefined();
    expect(result.find(node => node.name === 'package.json')).toBeDefined();
  });
});