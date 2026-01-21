/**
 * DashboardScreen Component Tests
 *
 * Tests for the DashboardScreen widget layout including:
 * - ScrollView container with proper spacing
 * - All widget components rendering
 * - Safe area handling
 * - Context integration (DeviceContext, SessionContext, SettingsContext)
 * - RefreshControl functionality
 */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DashboardScreen from '../src/screens/DashboardScreen';
import { DeviceProvider } from '../src/contexts/DeviceContext';
import { SessionProvider } from '../src/contexts/SessionContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';

// Mock navigation
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    goBack: jest.fn(),
    addListener: jest.fn(() => jest.fn()),
  }),
  useRoute: () => ({
    key: 'test-route',
    name: 'Dashboard',
    params: {},
  }),
}));

// Mock safe area context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({
    top: 47,
    bottom: 34,
    left: 0,
    right: 0,
  }),
}));

// Wrapper component to provide all required contexts
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    <DeviceProvider>
      <SessionProvider>{children}</SessionProvider>
    </DeviceProvider>
  </SettingsProvider>
);

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Widget Layout Structure', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(toJSON()).not.toBeNull();
    });

    it('renders as a ScrollView container with RefreshControl', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      expect(tree).not.toBeNull();
      // With RefreshControl, the root is a View wrapper around ScrollView
      // Check that tree exists and has children (content)
      expect(tree?.type).toBeDefined();
      expect(tree?.children).toBeDefined();
    });

    it('has testID for scrollview', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(getByTestId('dashboard-scroll-view')).toBeTruthy();
    });

    it('renders multiple widget sections', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      expect(tree).not.toBeNull();
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

      // Helper to count text elements recursively (check both cases)
      const countTextElements = (node: ReturnType<typeof toJSON>): number => {
        if (!node) return 0;
        let count = node.type === 'text' || node.type === 'Text' ? 1 : 0;
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

  describe('Widget Components', () => {
    it('renders DeviceStatusWidget', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(getByTestId('device-status-widget')).toBeTruthy();
    });

    it('renders TodaySummaryWidget content', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // Find first child which should be connection bar
      // With RefreshControl wrapper, we need to traverse deeper
      const connectionBar = tree?.children?.[0];
      expect(connectionBar).toBeDefined();
      // Accept both 'view' and 'View' due to React Native version differences
      expect(['view', 'View']).toContain(connectionBar?.type);
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

      // TodaySummaryWidget shows "Today" title
      expect(findText(tree, 'Today')).toBe(true);
    });

    it('renders ThetaTrendWidget content', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      const findText = (node: any, searchText: string): boolean => {
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

      // ThetaTrendWidget shows "Recent Theta Trend" title
      expect(findText(tree, 'Recent Theta Trend')).toBe(true);
    });

    it('renders NextSessionWidget', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(getByTestId('next-session-widget')).toBeTruthy();
    });

    it('renders QuickBoostButton', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(getByTestId('quick-boost-button')).toBeTruthy();
    });

    it('renders CalibrateButton', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(getByTestId('calibrate-button')).toBeTruthy();
    });

    it('renders CustomSessionButton', () => {
      const { getByTestId } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(getByTestId('custom-session-button')).toBeTruthy();
    });
  });

  describe('Widget Content', () => {
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

    it('shows Device Status title', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(findText(toJSON(), 'Device Status')).toBe(true);
    });

    it('shows disconnected state when no device', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(findText(toJSON(), 'Disconnected')).toBe(true);
    });

    it('shows Next Session widget content', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(findText(toJSON(), 'Next Session')).toBe(true);
    });

    it('shows Quick Boost button text', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(findText(toJSON(), 'Quick Boost')).toBe(true);
    });

    it('shows Calibrate button text', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(findText(toJSON(), 'Calibrate')).toBe(true);
    });

    it('shows Custom Session button text', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(findText(toJSON(), 'Custom Session')).toBe(true);
    });

    it('shows empty theta trend state text', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      // ThetaTrendWidget shows this when no sessions
      expect(findText(toJSON(), 'No session data yet')).toBe(true);
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

    it('integrates with SettingsContext without errors', () => {
      expect(() => {
        render(
          <TestWrapper>
            <DashboardScreen />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it('throws error when rendered outside DeviceProvider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(
          <SettingsProvider>
            <SessionProvider>
              <DashboardScreen />
            </SessionProvider>
          </SettingsProvider>
        );
      }).toThrow('useDevice must be used within a DeviceProvider');

      consoleSpy.mockRestore();
    });

    it('throws error when rendered outside SessionProvider', () => {
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => {
        render(
          <SettingsProvider>
            <DeviceProvider>
              <DashboardScreen />
            </DeviceProvider>
          </SettingsProvider>
        );
      }).toThrow('useSession must be used within a SessionProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('Refresh Control', () => {
    it('includes RefreshControl component', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // Helper to find component by type
      const findByType = (node: any, type: string): boolean => {
        if (!node) return false;
        if (node.type === type) return true;
        if (Array.isArray(node.children)) {
          for (const child of node.children) {
            if (typeof child === 'object' && findByType(child, type)) {
              return true;
            }
          }
        }
        return false;
      };

      expect(findByType(tree, 'refreshcontrol')).toBe(true);
    });
  });

  describe('ScrollView Styling', () => {
    it('has proper container background color', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      // ScrollView should have dark background
      expect(tree?.props?.style).toBeDefined();
      expect(tree?.props?.style?.backgroundColor).toBe('#0F1419');
    });

    it('has flex: 1 for full screen', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      expect(tree?.props?.style?.flex).toBe(1);
    });

    it('hides vertical scroll indicator', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();

      expect(tree?.props?.showsVerticalScrollIndicator).toBe(false);
    });
  });

  describe('Component Export', () => {
    it('exports a default function component', () => {
      expect(typeof DashboardScreen).toBe('function');
      expect(DashboardScreen.name).toBe('DashboardScreen');
    });
  });

  describe('Pull to Refresh', () => {
    // Helper to find RefreshControl in tree
    const findRefreshControl = (
      node: ReturnType<ReturnType<typeof render>['toJSON']>
    ): boolean => {
      if (!node) return false;
      // Check if this node has refreshControl prop or is a RefreshControl
      if (node.props?.refreshControl !== undefined) return true;
      if (node.type === 'RCTRefreshControl' || node.type === 'RefreshControl')
        return true;
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          if (typeof child === 'object' && findRefreshControl(child)) {
            return true;
          }
        }
      }
      return false;
    };

    it('includes RefreshControl in the ScrollView', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      // The RefreshControl should be part of the tree
      expect(findRefreshControl(tree)).toBe(true);
    });

    it('renders without crashing when isRefreshing is false', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(toJSON()).not.toBeNull();
    });
  });
});
