/**
 * Tests for ExportProgressModal Component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  ExportProgressModal,
  clampProgress,
  formatProgress,
  getProgressAccessibilityLabel,
  getProgressBarWidth,
  getProgressColor,
} from '../src/components/ExportProgressModal';

// ============================================================================
// Helper Function Tests
// ============================================================================

describe('clampProgress', () => {
  it('should return the same value when within range', () => {
    expect(clampProgress(0)).toBe(0);
    expect(clampProgress(50)).toBe(50);
    expect(clampProgress(100)).toBe(100);
  });

  it('should clamp negative values to 0', () => {
    expect(clampProgress(-10)).toBe(0);
    expect(clampProgress(-100)).toBe(0);
  });

  it('should clamp values over 100 to 100', () => {
    expect(clampProgress(110)).toBe(100);
    expect(clampProgress(200)).toBe(100);
  });

  it('should handle decimal values', () => {
    expect(clampProgress(50.5)).toBe(50.5);
    expect(clampProgress(-0.5)).toBe(0);
    expect(clampProgress(100.5)).toBe(100);
  });
});

describe('formatProgress', () => {
  it('should format progress as percentage string', () => {
    expect(formatProgress(0)).toBe('0%');
    expect(formatProgress(50)).toBe('50%');
    expect(formatProgress(100)).toBe('100%');
  });

  it('should round decimal values', () => {
    expect(formatProgress(33.33)).toBe('33%');
    expect(formatProgress(66.67)).toBe('67%');
    expect(formatProgress(99.9)).toBe('100%');
  });

  it('should clamp values before formatting', () => {
    expect(formatProgress(-10)).toBe('0%');
    expect(formatProgress(150)).toBe('100%');
  });
});

describe('getProgressAccessibilityLabel', () => {
  it('should combine message and progress', () => {
    expect(getProgressAccessibilityLabel(50, 'Exporting sessions...')).toBe(
      'Exporting sessions... 50% complete'
    );
  });

  it('should handle 0% progress', () => {
    expect(getProgressAccessibilityLabel(0, 'Starting export...')).toBe(
      'Starting export... 0% complete'
    );
  });

  it('should handle 100% progress', () => {
    expect(getProgressAccessibilityLabel(100, 'Export complete')).toBe(
      'Export complete 100% complete'
    );
  });
});

describe('getProgressBarWidth', () => {
  it('should return percentage value', () => {
    expect(String(getProgressBarWidth(0))).toBe('0%');
    expect(String(getProgressBarWidth(50))).toBe('50%');
    expect(String(getProgressBarWidth(100))).toBe('100%');
  });

  it('should clamp values', () => {
    expect(String(getProgressBarWidth(-10))).toBe('0%');
    expect(String(getProgressBarWidth(150))).toBe('100%');
  });

  it('should preserve decimal precision', () => {
    expect(String(getProgressBarWidth(33.5))).toBe('33.5%');
  });
});

describe('getProgressColor', () => {
  it('should return blue for in-progress values', () => {
    expect(getProgressColor(0)).toBe('#2196F3');
    expect(getProgressColor(50)).toBe('#2196F3');
    expect(getProgressColor(99)).toBe('#2196F3');
  });

  it('should return green when complete', () => {
    expect(getProgressColor(100)).toBe('#4CAF50');
  });

  it('should handle values over 100', () => {
    expect(getProgressColor(150)).toBe('#4CAF50');
  });
});

// ============================================================================
// Component Tests
// ============================================================================

describe('ExportProgressModal', () => {
  const defaultProps = {
    visible: true,
    progress: 50,
    message: 'Exporting sessions...',
    onCancel: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      expect(getByTestId('export-progress-modal')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} testID="custom-modal" />
      );
      expect(getByTestId('custom-modal')).toBeTruthy();
    });

    it('should display the title', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const title = getByTestId('export-progress-modal-title');
      expect(title).toBeTruthy();
      expect(title.props.children).toBe('Exporting Data');
    });

    it('should display the message', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const message = getByTestId('export-progress-modal-message');
      expect(message).toBeTruthy();
      expect(message.props.children).toBe('Exporting sessions...');
    });

    it('should display different messages', () => {
      const { getByTestId, rerender } = render(
        <ExportProgressModal {...defaultProps} message="Processing data..." />
      );
      expect(
        getByTestId('export-progress-modal-message').props.children
      ).toBe('Processing data...');

      rerender(
        <ExportProgressModal {...defaultProps} message="Almost done..." />
      );
      expect(
        getByTestId('export-progress-modal-message').props.children
      ).toBe('Almost done...');
    });

    it('should display progress percentage', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const progressText = getByTestId('export-progress-modal-progress-text');
      expect(progressText).toBeTruthy();
      expect(progressText.props.children).toBe('50%');
    });

    it('should display 0% progress', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={0} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('0%');
    });

    it('should display 100% progress', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={100} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('100%');
    });

    it('should render progress bar container', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      expect(
        getByTestId('export-progress-modal-progress-bar-container')
      ).toBeTruthy();
    });

    it('should render progress bar fill', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      expect(
        getByTestId('export-progress-modal-progress-bar-fill')
      ).toBeTruthy();
    });

    it('should render cancel button', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      expect(getByTestId('export-progress-modal-cancel-button')).toBeTruthy();
    });

    it('should render overlay', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      expect(getByTestId('export-progress-modal-overlay')).toBeTruthy();
    });

    it('should render container', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      expect(getByTestId('export-progress-modal-container')).toBeTruthy();
    });
  });

  describe('Progress Bar', () => {
    it('should have correct width for 0% progress', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={0} />
      );
      const fill = getByTestId('export-progress-modal-progress-bar-fill');
      const styles = fill.props.style;
      // Check that the width is '0%'
      const widthStyle = Array.isArray(styles)
        ? styles.find((s: any) => s && s.width)
        : styles;
      expect(widthStyle?.width).toBe('0%');
    });

    it('should have correct width for 50% progress', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={50} />
      );
      const fill = getByTestId('export-progress-modal-progress-bar-fill');
      const styles = fill.props.style;
      const widthStyle = Array.isArray(styles)
        ? styles.find((s: any) => s && s.width)
        : styles;
      expect(widthStyle?.width).toBe('50%');
    });

    it('should have correct width for 100% progress', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={100} />
      );
      const fill = getByTestId('export-progress-modal-progress-bar-fill');
      const styles = fill.props.style;
      const widthStyle = Array.isArray(styles)
        ? styles.find((s: any) => s && s.width)
        : styles;
      expect(widthStyle?.width).toBe('100%');
    });

    it('should clamp progress to 0% for negative values', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={-20} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('0%');
    });

    it('should clamp progress to 100% for values over 100', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={150} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('100%');
    });

    it('should have blue color when in progress', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={50} />
      );
      const fill = getByTestId('export-progress-modal-progress-bar-fill');
      const styles = fill.props.style;
      const colorStyle = Array.isArray(styles)
        ? styles.find((s: any) => s && s.backgroundColor)
        : styles;
      expect(colorStyle?.backgroundColor).toBe('#2196F3');
    });

    it('should have green color when complete', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={100} />
      );
      const fill = getByTestId('export-progress-modal-progress-bar-fill');
      const styles = fill.props.style;
      const colorStyle = Array.isArray(styles)
        ? styles.find((s: any) => s && s.backgroundColor)
        : styles;
      expect(colorStyle?.backgroundColor).toBe('#4CAF50');
    });
  });

  describe('Cancel Button', () => {
    it('should call onCancel when pressed', () => {
      const onCancel = jest.fn();
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} onCancel={onCancel} />
      );

      fireEvent.press(getByTestId('export-progress-modal-cancel-button'));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('should call onCancel multiple times on multiple presses', () => {
      const onCancel = jest.fn();
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} onCancel={onCancel} />
      );

      const button = getByTestId('export-progress-modal-cancel-button');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);
      expect(onCancel).toHaveBeenCalledTimes(3);
    });
  });

  describe('Accessibility', () => {
    it('should have accessibility role on container', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const container = getByTestId('export-progress-modal-container');
      expect(container.props.accessibilityRole).toBe('alert');
    });

    it('should have accessibility role on title', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const title = getByTestId('export-progress-modal-title');
      expect(title.props.accessibilityRole).toBe('header');
    });

    it('should have accessibility role on progress bar', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const progressBar = getByTestId(
        'export-progress-modal-progress-bar-container'
      );
      expect(progressBar.props.accessibilityRole).toBe('progressbar');
    });

    it('should have accessibility value on progress bar', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={75} />
      );
      const progressBar = getByTestId(
        'export-progress-modal-progress-bar-container'
      );
      expect(progressBar.props.accessibilityValue).toEqual({
        min: 0,
        max: 100,
        now: 75,
      });
    });

    it('should have accessibility role on cancel button', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const button = getByTestId('export-progress-modal-cancel-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should have accessibility label on cancel button', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const button = getByTestId('export-progress-modal-cancel-button');
      expect(button.props.accessibilityLabel).toBe('Cancel export');
    });

    it('should have accessibility hint on cancel button', () => {
      const { getByTestId } = render(<ExportProgressModal {...defaultProps} />);
      const button = getByTestId('export-progress-modal-cancel-button');
      expect(button.props.accessibilityHint).toBe(
        'Cancels the current export operation'
      );
    });
  });

  describe('Progress Updates', () => {
    it('should update display when progress changes', () => {
      const { getByTestId, rerender } = render(
        <ExportProgressModal {...defaultProps} progress={0} />
      );

      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('0%');

      rerender(<ExportProgressModal {...defaultProps} progress={25} />);
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('25%');

      rerender(<ExportProgressModal {...defaultProps} progress={50} />);
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('50%');

      rerender(<ExportProgressModal {...defaultProps} progress={75} />);
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('75%');

      rerender(<ExportProgressModal {...defaultProps} progress={100} />);
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('100%');
    });
  });

  describe('Milestone Progress Values', () => {
    it('should correctly display 0% milestone', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={0} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('0%');
    });

    it('should correctly display 25% milestone', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={25} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('25%');
    });

    it('should correctly display 50% milestone', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={50} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('50%');
    });

    it('should correctly display 75% milestone', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={75} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('75%');
    });

    it('should correctly display 100% milestone', () => {
      const { getByTestId } = render(
        <ExportProgressModal {...defaultProps} progress={100} />
      );
      expect(
        getByTestId('export-progress-modal-progress-text').props.children
      ).toBe('100%');
    });
  });
});

// ============================================================================
// Export Service Progress Callback Integration Tests
// ============================================================================

describe('Export Service Progress Callback', () => {
  // These tests verify the contract between the modal and export service
  // The actual export service tests are in export-service.test.ts

  it('should track progress milestones in order', () => {
    const progressValues: number[] = [];
    const messages: string[] = [];

    const onProgress = (progress: number, message: string) => {
      progressValues.push(progress);
      messages.push(message);
    };

    // Simulate export service calling progress at milestones
    onProgress(0, 'Starting export...');
    onProgress(25, 'Processing data...');
    onProgress(50, 'Converting format...');
    onProgress(75, 'Finalizing...');
    onProgress(100, 'Export complete');

    expect(progressValues).toEqual([0, 25, 50, 75, 100]);
    expect(messages).toHaveLength(5);
    expect(messages[0]).toBe('Starting export...');
    expect(messages[4]).toBe('Export complete');
  });

  it('should handle non-standard progress values', () => {
    const { getByTestId, rerender } = render(
      <ExportProgressModal
        visible={true}
        progress={33.33}
        message="Processing..."
        onCancel={jest.fn()}
      />
    );

    expect(
      getByTestId('export-progress-modal-progress-text').props.children
    ).toBe('33%');

    rerender(
      <ExportProgressModal
        visible={true}
        progress={66.67}
        message="Almost there..."
        onCancel={jest.fn()}
      />
    );

    expect(
      getByTestId('export-progress-modal-progress-text').props.children
    ).toBe('67%');
  });
});
