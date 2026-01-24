/**
 * Tests for Tooltip System
 */

import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Tooltip,
  SpotlightTooltip,
  useTooltipDismissed,
  resetAllTooltips,
  getDismissedTooltips,
} from '../src/components/Tooltip';
import { renderHook } from '@testing-library/react';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Tooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  describe('Rendering', () => {
    it('should render children', () => {
      const { getByText } = render(
        <Tooltip
          id="dashboard-quick-boost"
          message="Test message"
          testID="test-tooltip"
        >
          <Text>Child Content</Text>
        </Tooltip>
      );

      expect(getByText('Child Content')).toBeTruthy();
    });

    it('should show tooltip when controlled visible', () => {
      const { getByTestId } = render(
        <Tooltip
          id="dashboard-quick-boost"
          message="Test message"
          visible={true}
          testID="test-tooltip"
        >
          <Text>Child Content</Text>
        </Tooltip>
      );

      expect(getByTestId('test-tooltip-tooltip')).toBeTruthy();
    });

    it('should display message when visible', () => {
      const { getByText } = render(
        <Tooltip
          id="dashboard-quick-boost"
          message="This is a test message"
          visible={true}
          testID="test-tooltip"
        >
          <Text>Child</Text>
        </Tooltip>
      );

      expect(getByText('This is a test message')).toBeTruthy();
    });

    it('should display title when provided', () => {
      const { getByText } = render(
        <Tooltip
          id="dashboard-quick-boost"
          message="Message"
          title="Test Title"
          visible={true}
          testID="test-tooltip"
        >
          <Text>Child</Text>
        </Tooltip>
      );

      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should render dismiss button', () => {
      const { getByText } = render(
        <Tooltip
          id="dashboard-quick-boost"
          message="Message"
          visible={true}
          testID="test-tooltip"
        >
          <Text>Child</Text>
        </Tooltip>
      );

      expect(getByText('Got it')).toBeTruthy();
    });
  });

  describe('Dismiss Behavior', () => {
    it('should call onDismiss when button pressed', async () => {
      const mockOnDismiss = jest.fn();
      const { getByTestId } = render(
        <Tooltip
          id="dashboard-quick-boost"
          message="Message"
          visible={true}
          onDismiss={mockOnDismiss}
          showOnce={false}
          testID="test-tooltip"
        >
          <Text>Child</Text>
        </Tooltip>
      );

      await act(async () => {
        fireEvent.press(getByTestId('test-tooltip-dismiss'));
      });
      expect(mockOnDismiss).toHaveBeenCalled();
    });

    it('should persist dismissal to AsyncStorage when showOnce is true', async () => {
      const { getByTestId } = render(
        <Tooltip
          id="dashboard-quick-boost"
          message="Message"
          visible={true}
          showOnce={true}
          testID="test-tooltip"
        >
          <Text>Child</Text>
        </Tooltip>
      );

      await act(async () => {
        fireEvent.press(getByTestId('test-tooltip-dismiss'));
      });

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should not show if already dismissed and showOnce is true', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(['dashboard-quick-boost'])
      );

      const { queryByTestId } = render(
        <Tooltip
          id="dashboard-quick-boost"
          message="Message"
          showOnce={true}
          testID="test-tooltip"
        >
          <Text>Child</Text>
        </Tooltip>
      );

      await waitFor(() => {
        // Should not show because already dismissed
        expect(queryByTestId('test-tooltip-tooltip')).toBeNull();
      });
    });
  });

  describe('Position', () => {
    it('should accept different positions', () => {
      const positions = ['top', 'bottom', 'left', 'right'] as const;

      for (const position of positions) {
        const { getByTestId, unmount } = render(
          <Tooltip
            id="dashboard-quick-boost"
            message="Message"
            position={position}
            visible={true}
            testID={`tooltip-${position}`}
          >
            <Text>Child</Text>
          </Tooltip>
        );

        expect(getByTestId(`tooltip-${position}-tooltip`)).toBeTruthy();
        unmount();
      }
    });
  });
});

describe('SpotlightTooltip', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
  });

  it('should render children', () => {
    const { getByText } = render(
      <SpotlightTooltip
        id="dashboard-quick-boost"
        message="Test message"
        testID="spotlight"
      >
        <Text>Child Content</Text>
      </SpotlightTooltip>
    );

    expect(getByText('Child Content')).toBeTruthy();
  });

  it('should show content when visible is true', () => {
    const { getByText } = render(
      <SpotlightTooltip
        id="dashboard-quick-boost"
        message="Spotlight message"
        title="Spotlight Title"
        visible={true}
        testID="spotlight"
      >
        <Text>Child</Text>
      </SpotlightTooltip>
    );

    expect(getByText('Spotlight Title')).toBeTruthy();
    expect(getByText('Spotlight message')).toBeTruthy();
    expect(getByText('Got it!')).toBeTruthy();
  });

  it('should render dismiss button with correct testID', () => {
    const { getByTestId } = render(
      <SpotlightTooltip
        id="dashboard-quick-boost"
        message="Message"
        visible={true}
        testID="spotlight"
      >
        <Text>Child</Text>
      </SpotlightTooltip>
    );

    expect(getByTestId('spotlight-dismiss')).toBeTruthy();
  });

  it('should call onDismiss when dismiss button is pressed', async () => {
    const mockOnDismiss = jest.fn();
    const { getByTestId } = render(
      <SpotlightTooltip
        id="dashboard-quick-boost"
        message="Message"
        visible={true}
        onDismiss={mockOnDismiss}
        showOnce={false}
        testID="spotlight"
      >
        <Text>Child</Text>
      </SpotlightTooltip>
    );

    await act(async () => {
      fireEvent.press(getByTestId('spotlight-dismiss'));
    });

    expect(mockOnDismiss).toHaveBeenCalled();
  });
});

describe('useTooltipDismissed hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  it('should return isDismissed as false initially', async () => {
    const { result } = renderHook(() =>
      useTooltipDismissed('dashboard-quick-boost')
    );

    await waitFor(() => {
      expect(result.current.isDismissed).toBe(false);
    });
  });

  it('should return isDismissed as true if tooltip was dismissed', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify(['dashboard-quick-boost'])
    );

    const { result } = renderHook(() =>
      useTooltipDismissed('dashboard-quick-boost')
    );

    await waitFor(() => {
      expect(result.current.isDismissed).toBe(true);
    });
  });

  it('should dismiss tooltip', async () => {
    const { result } = renderHook(() =>
      useTooltipDismissed('dashboard-quick-boost')
    );

    await act(async () => {
      await result.current.dismiss();
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    expect(result.current.isDismissed).toBe(true);
  });

  it('should reset tooltip', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(
      JSON.stringify(['dashboard-quick-boost'])
    );

    const { result } = renderHook(() =>
      useTooltipDismissed('dashboard-quick-boost')
    );

    await act(async () => {
      await result.current.reset();
    });

    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    expect(result.current.isDismissed).toBe(false);
  });
});

describe('Utility Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue();
    mockAsyncStorage.removeItem.mockResolvedValue();
  });

  describe('resetAllTooltips', () => {
    it('should remove dismissed tooltips from storage', async () => {
      const result = await resetAllTooltips();

      expect(result).toBe(true);
      expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should return false on error', async () => {
      mockAsyncStorage.removeItem.mockRejectedValue(new Error('Test error'));

      const result = await resetAllTooltips();

      expect(result).toBe(false);
    });
  });

  describe('getDismissedTooltips', () => {
    it('should return empty array when no tooltips dismissed', async () => {
      const result = await getDismissedTooltips();

      expect(result).toEqual([]);
    });

    it('should return array of dismissed tooltip IDs', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(
        JSON.stringify(['dashboard-quick-boost', 'session-visualization-toggle'])
      );

      const result = await getDismissedTooltips();

      expect(result).toEqual([
        'dashboard-quick-boost',
        'session-visualization-toggle',
      ]);
    });
  });
});
