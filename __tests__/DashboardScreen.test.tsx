/**
 * DashboardScreen Component Tests
 *
 * Tests for the DashboardScreen placeholder component including:
 * - Component rendering
 * - Context integration (DeviceContext, SessionContext)
 * - Component structure verification
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import DashboardScreen from '../src/screens/DashboardScreen';
import { DeviceProvider } from '../src/contexts/DeviceContext';
import { SessionProvider } from '../src/contexts/SessionContext';

// Wrapper component to provide all required contexts
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <DeviceProvider>
    <SessionProvider>{children}</SessionProvider>
  </DeviceProvider>
);

describe('DashboardScreen', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(toJSON()).not.toBeNull();
    });

    it('renders as a ScrollView container', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      expect(tree).not.toBeNull();
      // Root element should be scrollview (our mock renders lowercase)
      expect(tree?.type).toBe('scrollview');
    });

    it('renders multiple view sections (cards)', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      expect(tree).not.toBeNull();
      // ScrollView should contain multiple child views
      expect(tree?.children).toBeDefined();
      expect(Array.isArray(tree?.children)).toBe(true);
      // Should have at least 4 main sections: connection bar + 3 cards
      expect(tree?.children?.length).toBeGreaterThanOrEqual(4);
    });

    it('renders text elements within cards', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // Helper to count text elements recursively
      const countTextElements = (node: ReturnType<typeof toJSON>): number => {
        if (!node) return 0;
        let count = node.type === 'text' ? 1 : 0;
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            if (typeof child === 'object') {
              count += countTextElements(child);
            }
          }
        }
        return count;
      };

      const textCount = countTextElements(tree);
      // Should have multiple text elements for labels, values, etc.
      expect(textCount).toBeGreaterThan(10);
    });
  });

  describe('Component Structure', () => {
    it('exports a default function component', () => {
      expect(typeof DashboardScreen).toBe('function');
      expect(DashboardScreen.name).toBe('DashboardScreen');
    });

    it('uses contexts without errors', () => {
      expect(() => {
        render(
          <TestWrapper>
            <DashboardScreen />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('renders connection status indicator', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // Find first child which should be connection bar
      const connectionBar = tree?.children?.[0];
      expect(connectionBar).toBeDefined();
      expect(connectionBar?.type).toBe('view');
    });

    it('renders current session card section', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // Should have at least 4 sections (connection bar, signal quality may be hidden, then cards)
      expect(tree?.children?.length).toBeGreaterThanOrEqual(4);
    });

    it('renders quick stats section with stat labels', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // Helper to find text content
      const findText = (
        node: ReturnType<typeof toJSON>,
        searchText: string
      ): boolean => {
        if (!node) return false;
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            if (typeof child === 'string' && child.includes(searchText)) {
              return true;
            }
            if (typeof child === 'object' && findText(child, searchText)) {
              return true;
            }
          }
        }
        return false;
      };

      // Verify stats labels exist
      expect(findText(tree, 'Sessions')).toBe(true);
      expect(findText(tree, 'Avg Duration')).toBe(true);
      expect(findText(tree, 'Avg Z-Score')).toBe(true);
    });
  });

  describe('Default State', () => {
    it('does not show signal quality when disconnected', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // Helper to check for "Signal Quality" text
      const containsSignalQuality = (
        node: ReturnType<typeof toJSON>
      ): boolean => {
        if (!node) return false;
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            if (typeof child === 'string' && child.includes('Signal Quality')) {
              return true;
            }
            if (typeof child === 'object' && containsSignalQuality(child)) {
              return true;
            }
          }
        }
        return false;
      };

      // Signal quality should not be shown when device is not connected
      expect(containsSignalQuality(tree)).toBe(false);
    });

    it('shows disconnected state text', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // Helper to find text content
      const findText = (
        node: ReturnType<typeof toJSON>,
        searchText: string
      ): boolean => {
        if (!node) return false;
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            if (typeof child === 'string' && child.includes(searchText)) {
              return true;
            }
            if (typeof child === 'object' && findText(child, searchText)) {
              return true;
            }
          }
        }
        return false;
      };

      expect(findText(tree, 'Not Connected')).toBe(true);
    });

    it('shows no active session text', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      const findText = (
        node: ReturnType<typeof toJSON>,
        searchText: string
      ): boolean => {
        if (!node) return false;
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            if (typeof child === 'string' && child.includes(searchText)) {
              return true;
            }
            if (typeof child === 'object' && findText(child, searchText)) {
              return true;
            }
          }
        }
        return false;
      };

      expect(findText(tree, 'No active session')).toBe(true);
    });

    it('shows no recent sessions text', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      const findText = (
        node: ReturnType<typeof toJSON>,
        searchText: string
      ): boolean => {
        if (!node) return false;
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            if (typeof child === 'string' && child.includes(searchText)) {
              return true;
            }
            if (typeof child === 'object' && findText(child, searchText)) {
              return true;
            }
          }
        }
        return false;
      };

      expect(findText(tree, 'No recent sessions')).toBe(true);
    });
  });

  describe('Context Integration', () => {
    it('integrates with DeviceContext without errors', () => {
      expect(() => {
        render(
          <TestWrapper>
            <DashboardScreen />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('integrates with SessionContext without errors', () => {
      expect(() => {
        render(
          <TestWrapper>
            <DashboardScreen />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('throws error when rendered outside DeviceProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(
          <SessionProvider>
            <DashboardScreen />
          </SessionProvider>
        );
      }).toThrow('useDevice must be used within a DeviceProvider');

      consoleSpy.mockRestore();
    });

    it('throws error when rendered outside SessionProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(
          <DeviceProvider>
            <DashboardScreen />
          </DeviceProvider>
        );
      }).toThrow('useSession must be used within a SessionProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Card Labels', () => {
    // Helper to find text content
    const findText = (
      node: ReturnType<ReturnType<typeof render>['toJSON']>,
      searchText: string
    ): boolean => {
      if (!node) return false;
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          if (typeof child === 'string' && child.includes(searchText)) {
            return true;
          }
          if (typeof child === 'object' && findText(child, searchText)) {
            return true;
          }
        }
      }
      return false;
    };

    it('includes Current Session label', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      expect(findText(tree, 'Current Session')).toBe(true);
    });

    it('includes Recent Sessions label', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      expect(findText(tree, 'Recent Sessions')).toBe(true);
    });

    it('includes Quick Stats label', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      expect(findText(tree, 'Quick Stats')).toBe(true);
    });
  });
});
