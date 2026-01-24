/**
 * Tests for History Screen components
 * Verifies session list and history functionality
 */

import * as fs from 'fs';
import * as path from 'path';

describe('History Screen Components', () => {
  describe('SessionListView Component', () => {
    const sessionListViewPath = path.join(
      __dirname,
      '../src/components/SessionListView.tsx'
    );

    it('should exist', () => {
      expect(fs.existsSync(sessionListViewPath)).toBe(true);
    });

    it('should export SessionListView component', () => {
      const content = fs.readFileSync(sessionListViewPath, 'utf8');
      expect(content).toContain('export const SessionListView');
    });
  });

  describe('SessionListItem Component', () => {
    const sessionListItemPath = path.join(
      __dirname,
      '../src/components/SessionListItem.tsx'
    );

    it('should exist', () => {
      expect(fs.existsSync(sessionListItemPath)).toBe(true);
    });

    it('should export SessionListItem component', () => {
      const content = fs.readFileSync(sessionListItemPath, 'utf8');
      expect(content).toContain('export const SessionListItem');
    });
  });

  describe('SessionFilterControls Component', () => {
    const sessionFilterControlsPath = path.join(
      __dirname,
      '../src/components/SessionFilterControls.tsx'
    );

    it('should exist', () => {
      expect(fs.existsSync(sessionFilterControlsPath)).toBe(true);
    });

    it('should export SessionFilterControls component', () => {
      const content = fs.readFileSync(sessionFilterControlsPath, 'utf8');
      expect(content).toContain('export const SessionFilterControls');
    });
  });

  describe('ThetaTrendWidget Component', () => {
    const thetaTrendWidgetPath = path.join(
      __dirname,
      '../src/components/ThetaTrendWidget.tsx'
    );

    it('should exist', () => {
      expect(fs.existsSync(thetaTrendWidgetPath)).toBe(true);
    });

    it('should export ThetaTrendWidget component', () => {
      const content = fs.readFileSync(thetaTrendWidgetPath, 'utf8');
      expect(content).toContain('export const ThetaTrendWidget');
    });
  });

  describe('Component Index Exports', () => {
    const componentsIndexPath = path.join(
      __dirname,
      '../src/components/index.ts'
    );

    it('should export SessionListView', () => {
      const content = fs.readFileSync(componentsIndexPath, 'utf8');
      expect(content).toContain('SessionListView');
    });

    it('should export SessionListItem', () => {
      const content = fs.readFileSync(componentsIndexPath, 'utf8');
      expect(content).toContain('SessionListItem');
    });

    it('should export SessionFilterControls', () => {
      const content = fs.readFileSync(componentsIndexPath, 'utf8');
      expect(content).toContain('SessionFilterControls');
    });
  });
});
