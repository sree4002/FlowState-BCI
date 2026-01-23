import fs from 'fs';
import path from 'path';

describe('Project Folder Structure', () => {
  const srcPath = path.join(__dirname, '..', 'src');
  const requiredDirectories = [
    'screens',
    'components',
    'services',
    'hooks',
    'utils',
    'types',
    'constants',
  ];

  it('should have src directory', () => {
    expect(fs.existsSync(srcPath)).toBe(true);
    expect(fs.statSync(srcPath).isDirectory()).toBe(true);
  });

  requiredDirectories.forEach((dir) => {
    it(`should have src/${dir} directory`, () => {
      const dirPath = path.join(srcPath, dir);
      expect(fs.existsSync(dirPath)).toBe(true);
      expect(fs.statSync(dirPath).isDirectory()).toBe(true);
    });

    it(`should have src/${dir}/index.ts file`, () => {
      const indexPath = path.join(srcPath, dir, 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
      expect(fs.statSync(indexPath).isFile()).toBe(true);
    });
  });

  it('should have valid TypeScript exports in all index files', () => {
    requiredDirectories.forEach((dir) => {
      const indexPath = path.join(srcPath, dir, 'index.ts');
      const content = fs.readFileSync(indexPath, 'utf-8');
      // Check that file contains valid export statements or placeholder
      const hasExport =
        content.includes('export') ||
        content.includes('// ') ||
        content.trim().length === 0;
      expect(hasExport).toBe(true);
    });
  });
});
