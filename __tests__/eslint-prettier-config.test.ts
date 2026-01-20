import * as fs from 'fs';
import * as path from 'path';

describe('ESLint and Prettier Configuration', () => {
  const rootDir = path.resolve(__dirname, '..');

  describe('Prettier Configuration', () => {
    test('.prettierrc.json file exists', () => {
      const prettierConfigPath = path.join(rootDir, '.prettierrc.json');
      expect(fs.existsSync(prettierConfigPath)).toBe(true);
    });

    test('.prettierrc.json has valid JSON', () => {
      const prettierConfigPath = path.join(rootDir, '.prettierrc.json');
      const content = fs.readFileSync(prettierConfigPath, 'utf8');
      expect(() => JSON.parse(content)).not.toThrow();
    });

    test('.prettierrc.json contains required configuration', () => {
      const prettierConfigPath = path.join(rootDir, '.prettierrc.json');
      const content = fs.readFileSync(prettierConfigPath, 'utf8');
      const config = JSON.parse(content);

      expect(config).toHaveProperty('semi');
      expect(config).toHaveProperty('trailingComma');
      expect(config).toHaveProperty('singleQuote');
      expect(config).toHaveProperty('printWidth');
      expect(config).toHaveProperty('tabWidth');
    });

    test('.prettierignore file exists', () => {
      const prettierIgnorePath = path.join(rootDir, '.prettierignore');
      expect(fs.existsSync(prettierIgnorePath)).toBe(true);
    });

    test('.prettierignore contains node_modules', () => {
      const prettierIgnorePath = path.join(rootDir, '.prettierignore');
      const content = fs.readFileSync(prettierIgnorePath, 'utf8');
      expect(content).toContain('node_modules');
    });

    test('prettier package is installed in node_modules', () => {
      const prettierPath = path.join(
        rootDir,
        'node_modules',
        'prettier',
        'package.json'
      );
      expect(fs.existsSync(prettierPath)).toBe(true);
    });
  });

  describe('ESLint Configuration', () => {
    test('eslint.config.mjs file exists', () => {
      const eslintConfigPath = path.join(rootDir, 'eslint.config.mjs');
      expect(fs.existsSync(eslintConfigPath)).toBe(true);
    });

    test('eslint.config.mjs contains prettier plugin import', () => {
      const eslintConfigPath = path.join(rootDir, 'eslint.config.mjs');
      const content = fs.readFileSync(eslintConfigPath, 'utf8');
      expect(content).toContain('eslint-plugin-prettier');
      expect(content).toContain('eslint-config-prettier');
    });

    test('eslint.config.mjs contains prettier rule', () => {
      const eslintConfigPath = path.join(rootDir, 'eslint.config.mjs');
      const content = fs.readFileSync(eslintConfigPath, 'utf8');
      expect(content).toContain('prettier/prettier');
    });

    test('eslint-plugin-prettier is installed in node_modules', () => {
      const pluginPath = path.join(
        rootDir,
        'node_modules',
        'eslint-plugin-prettier',
        'package.json'
      );
      expect(fs.existsSync(pluginPath)).toBe(true);
    });

    test('eslint-config-prettier is installed in node_modules', () => {
      const configPath = path.join(
        rootDir,
        'node_modules',
        'eslint-config-prettier',
        'package.json'
      );
      expect(fs.existsSync(configPath)).toBe(true);
    });
  });

  describe('package.json Scripts', () => {
    test('package.json exists', () => {
      const packagePath = path.join(rootDir, 'package.json');
      expect(fs.existsSync(packagePath)).toBe(true);
    });

    test('package.json contains format script', () => {
      const packagePath = path.join(rootDir, 'package.json');
      const content = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      expect(packageJson.scripts).toHaveProperty('format');
      expect(packageJson.scripts.format).toContain('prettier');
      expect(packageJson.scripts.format).toContain('--write');
    });

    test('package.json contains format:check script', () => {
      const packagePath = path.join(rootDir, 'package.json');
      const content = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      expect(packageJson.scripts).toHaveProperty('format:check');
      expect(packageJson.scripts['format:check']).toContain('prettier');
      expect(packageJson.scripts['format:check']).toContain('--check');
    });

    test('package.json contains lint script', () => {
      const packagePath = path.join(rootDir, 'package.json');
      const content = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      expect(packageJson.scripts).toHaveProperty('lint');
      expect(packageJson.scripts.lint).toContain('eslint');
    });
  });

  describe('DevDependencies', () => {
    test('prettier is in devDependencies', () => {
      const packagePath = path.join(rootDir, 'package.json');
      const content = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      expect(packageJson.devDependencies).toHaveProperty('prettier');
    });

    test('eslint-config-prettier is in devDependencies', () => {
      const packagePath = path.join(rootDir, 'package.json');
      const content = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      expect(packageJson.devDependencies).toHaveProperty(
        'eslint-config-prettier'
      );
    });

    test('eslint-plugin-prettier is in devDependencies', () => {
      const packagePath = path.join(rootDir, 'package.json');
      const content = fs.readFileSync(packagePath, 'utf8');
      const packageJson = JSON.parse(content);

      expect(packageJson.devDependencies).toHaveProperty(
        'eslint-plugin-prettier'
      );
    });
  });
});
