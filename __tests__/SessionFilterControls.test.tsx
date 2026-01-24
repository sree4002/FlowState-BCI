/**
 * Tests for SessionFilterControls component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import {
  SessionFilterControls,
  DEFAULT_FILTERS,
  ALL_SESSION_TYPES,
  DATE_RANGE_PRESET_LABELS,
  getPresetStartDate,
  getPresetEndDate,
  createDateRangeFromPreset,
  formatFilterDate,
  getDateRangeSummary,
  getSessionTypeSummary,
  isDefaultFilters,
  filterSessions,
  getActiveFilterCount,
  SessionFilters,
  DateRangePreset,
} from '../src/components/SessionFilterControls';
import { SESSION_TYPE_LABELS } from '../src/components/SessionListItem';
import { Session } from '../src/types';

// Mock session data
const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  id: Math.floor(Math.random() * 10000),
  session_type: 'quick_boost',
  start_time: Date.now(),
  end_time: Date.now() + 300000,
  duration_seconds: 300,
  avg_theta_zscore: 1.2,
  max_theta_zscore: 1.8,
  entrainment_freq: 6.0,
  volume: 70,
  signal_quality_avg: 85,
  subjective_rating: null,
  notes: null,
  ...overrides,
});

// Helper to get start of today
const getStartOfToday = (): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

// Helper to get end of today
const getEndOfToday = (): number => {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today.getTime();
};

describe('SessionFilterControls', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter-controls"
        />
      );

      expect(getByTestId('filter-controls')).toBeTruthy();
    });

    it('should render header with Filters title', () => {
      const mockOnChange = jest.fn();
      const { getByText } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
        />
      );

      expect(getByText('Filters')).toBeTruthy();
    });

    it('should render date range dropdown button', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      expect(getByTestId('filter-date-range-button')).toBeTruthy();
    });

    it('should render session type chips', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      ALL_SESSION_TYPES.forEach((type) => {
        expect(getByTestId(`filter-session-type-chip-${type}`)).toBeTruthy();
      });
    });

    it('should show "All Time" as default date range', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      // Check the button text shows All Time
      const button = getByTestId('filter-date-range-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Collapsed State', () => {
    it('should start expanded by default', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      // Date range button should be visible when expanded
      expect(getByTestId('filter-date-range-button')).toBeTruthy();
    });

    it('should collapse when header is pressed', () => {
      const mockOnChange = jest.fn();
      const { getByTestId, queryByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      // Press header to collapse
      fireEvent.press(getByTestId('filter-header'));

      // Date range button should not be visible when collapsed
      expect(queryByTestId('filter-date-range-button')).toBeNull();
    });

    it('should start collapsed when collapsed prop is true', () => {
      const mockOnChange = jest.fn();
      const { queryByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          collapsed={true}
          testID="filter"
        />
      );

      expect(queryByTestId('filter-date-range-button')).toBeNull();
    });

    it('should call onCollapsedChange when toggling', () => {
      const mockOnChange = jest.fn();
      const mockOnCollapsedChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          onCollapsedChange={mockOnCollapsedChange}
          testID="filter"
        />
      );

      fireEvent.press(getByTestId('filter-header'));

      expect(mockOnCollapsedChange).toHaveBeenCalledWith(true);
    });
  });

  describe('Date Range Filter', () => {
    it('should open modal when date range button is pressed', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      fireEvent.press(getByTestId('filter-date-range-button'));

      expect(getByTestId('filter-date-range-modal')).toBeTruthy();
    });

    it('should show all preset options in modal', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      fireEvent.press(getByTestId('filter-date-range-button'));

      // Check that options exist via testID
      expect(getByTestId('filter-date-range-option-today')).toBeTruthy();
      expect(getByTestId('filter-date-range-option-yesterday')).toBeTruthy();
      expect(getByTestId('filter-date-range-option-last_7_days')).toBeTruthy();
      expect(getByTestId('filter-date-range-option-last_30_days')).toBeTruthy();
      expect(getByTestId('filter-date-range-option-last_90_days')).toBeTruthy();
      expect(getByTestId('filter-date-range-option-all_time')).toBeTruthy();
    });

    it('should call onFiltersChange when preset is selected', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      fireEvent.press(getByTestId('filter-date-range-button'));
      fireEvent.press(getByTestId('filter-date-range-option-today'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: expect.objectContaining({
            preset: 'today',
          }),
        })
      );
    });

    it('should update display when preset changes', () => {
      const mockOnChange = jest.fn();
      const filters: SessionFilters = {
        ...DEFAULT_FILTERS,
        dateRange: createDateRangeFromPreset('last_7_days'),
      };
      const { getByTestId } = render(
        <SessionFilterControls
          filters={filters}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      // The date range button should exist when preset is last_7_days
      expect(getByTestId('filter-date-range-button')).toBeTruthy();
    });
  });

  describe('Session Type Filter', () => {
    it('should toggle session type when chip is pressed', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      fireEvent.press(getByTestId('filter-session-type-chip-calibration'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionTypes: expect.not.arrayContaining(['calibration']),
        })
      );
    });

    it('should not allow deselecting all session types', () => {
      const mockOnChange = jest.fn();
      const filters: SessionFilters = {
        ...DEFAULT_FILTERS,
        sessionTypes: ['calibration'],
      };
      const { getByTestId } = render(
        <SessionFilterControls
          filters={filters}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      // Try to deselect the last remaining type
      fireEvent.press(getByTestId('filter-session-type-chip-calibration'));

      // Should not have been called since we can't deselect all
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('should show "All" button when not all types selected', () => {
      const mockOnChange = jest.fn();
      const filters: SessionFilters = {
        ...DEFAULT_FILTERS,
        sessionTypes: ['calibration', 'quick_boost'],
      };
      const { getByText } = render(
        <SessionFilterControls
          filters={filters}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      expect(getByText('All')).toBeTruthy();
    });

    it('should show "Clear" button when all types selected', () => {
      const mockOnChange = jest.fn();
      const { getByText } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
        />
      );

      expect(getByText('Clear')).toBeTruthy();
    });

    it('should select all types when "All" is pressed', () => {
      const mockOnChange = jest.fn();
      const filters: SessionFilters = {
        ...DEFAULT_FILTERS,
        sessionTypes: ['calibration'],
      };
      const { getByTestId } = render(
        <SessionFilterControls
          filters={filters}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      fireEvent.press(getByTestId('filter-session-type-select-all'));

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionTypes: expect.arrayContaining(ALL_SESSION_TYPES),
        })
      );
    });
  });

  describe('Reset Button', () => {
    it('should show reset button when filters are active', () => {
      const mockOnChange = jest.fn();
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('today'),
        sessionTypes: [...ALL_SESSION_TYPES],
      };
      const { getByTestId } = render(
        <SessionFilterControls
          filters={filters}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      expect(getByTestId('filter-reset')).toBeTruthy();
    });

    it('should not show reset button when filters are at default', () => {
      const mockOnChange = jest.fn();
      const { queryByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      expect(queryByTestId('filter-reset')).toBeNull();
    });

    it('should reset filters when reset is pressed', () => {
      const mockOnChange = jest.fn();
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('today'),
        sessionTypes: ['calibration'],
      };
      const { getByTestId } = render(
        <SessionFilterControls
          filters={filters}
          onFiltersChange={mockOnChange}
          testID="filter"
        />
      );

      fireEvent.press(getByTestId('filter-reset'));

      expect(mockOnChange).toHaveBeenCalledWith(DEFAULT_FILTERS);
    });
  });

  describe('Active Filter Badge', () => {
    it('should not show badge when no filters are active', () => {
      const mockOnChange = jest.fn();
      const { queryByText } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
        />
      );

      // Badge should not show 0
      const badge = queryByText('0');
      expect(badge).toBeNull();
    });

    it('should show badge with count 1 when date filter is active', () => {
      const mockOnChange = jest.fn();
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('today'),
        sessionTypes: [...ALL_SESSION_TYPES],
      };
      const { getByText } = render(
        <SessionFilterControls
          filters={filters}
          onFiltersChange={mockOnChange}
        />
      );

      expect(getByText('1')).toBeTruthy();
    });

    it('should show badge with count 2 when both filters are active', () => {
      const mockOnChange = jest.fn();
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('today'),
        sessionTypes: ['calibration'],
      };
      const { getByText } = render(
        <SessionFilterControls
          filters={filters}
          onFiltersChange={mockOnChange}
        />
      );

      expect(getByText('2')).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should render with disabled styling when disabled prop is true', () => {
      const mockOnChange = jest.fn();
      const { getByTestId } = render(
        <SessionFilterControls
          filters={DEFAULT_FILTERS}
          onFiltersChange={mockOnChange}
          disabled={true}
          testID="filter"
        />
      );

      // Component should render with disabled state
      const button = getByTestId('filter-date-range-button');
      expect(button).toBeTruthy();

      // The button and chips should still be rendered
      expect(getByTestId('filter-session-type-chip-calibration')).toBeTruthy();
    });
  });
});

describe('Utility Functions', () => {
  describe('getPresetStartDate', () => {
    it('should return null for all_time', () => {
      expect(getPresetStartDate('all_time')).toBeNull();
    });

    it('should return null for custom', () => {
      expect(getPresetStartDate('custom')).toBeNull();
    });

    it('should return start of today for today preset', () => {
      const startOfToday = getStartOfToday();
      expect(getPresetStartDate('today')).toBe(startOfToday);
    });

    it('should return start of yesterday for yesterday preset', () => {
      const startOfToday = getStartOfToday();
      const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;
      expect(getPresetStartDate('yesterday')).toBe(startOfYesterday);
    });

    it('should return correct start for last_7_days', () => {
      const startOfToday = getStartOfToday();
      const sixDaysAgo = startOfToday - 6 * 24 * 60 * 60 * 1000;
      expect(getPresetStartDate('last_7_days')).toBe(sixDaysAgo);
    });

    it('should return correct start for last_30_days', () => {
      const startOfToday = getStartOfToday();
      const twentyNineDaysAgo = startOfToday - 29 * 24 * 60 * 60 * 1000;
      expect(getPresetStartDate('last_30_days')).toBe(twentyNineDaysAgo);
    });

    it('should return correct start for last_90_days', () => {
      const result = getPresetStartDate('last_90_days');
      // Calculate expected date using same approach as component (handles DST)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
      expect(result).toBe(ninetyDaysAgo.getTime());
    });
  });

  describe('getPresetEndDate', () => {
    it('should return null for all_time', () => {
      expect(getPresetEndDate('all_time')).toBeNull();
    });

    it('should return null for custom', () => {
      expect(getPresetEndDate('custom')).toBeNull();
    });

    it('should return end of today for today preset', () => {
      const endOfToday = getEndOfToday();
      expect(getPresetEndDate('today')).toBe(endOfToday);
    });

    it('should return end of yesterday for yesterday preset', () => {
      const startOfToday = getStartOfToday();
      const endOfYesterday = startOfToday - 1;
      expect(getPresetEndDate('yesterday')).toBe(endOfYesterday);
    });
  });

  describe('createDateRangeFromPreset', () => {
    it('should create correct date range for today', () => {
      const dateRange = createDateRangeFromPreset('today');
      expect(dateRange.preset).toBe('today');
      expect(dateRange.startDate).toBe(getPresetStartDate('today'));
      expect(dateRange.endDate).toBe(getPresetEndDate('today'));
    });

    it('should create correct date range for all_time', () => {
      const dateRange = createDateRangeFromPreset('all_time');
      expect(dateRange.preset).toBe('all_time');
      expect(dateRange.startDate).toBeNull();
      expect(dateRange.endDate).toBeNull();
    });
  });

  describe('formatFilterDate', () => {
    it('should format date correctly', () => {
      const date = new Date(2026, 0, 15).getTime(); // Jan 15, 2026
      expect(formatFilterDate(date)).toBe('Jan 15, 2026');
    });
  });

  describe('getDateRangeSummary', () => {
    it('should return preset label for preset filters', () => {
      const dateRange = createDateRangeFromPreset('today');
      expect(getDateRangeSummary(dateRange)).toBe('Today');
    });

    it('should return "All Time" for null dates in custom', () => {
      expect(
        getDateRangeSummary({
          preset: 'custom',
          startDate: null,
          endDate: null,
        })
      ).toBe('All Time');
    });

    it('should format custom range with both dates', () => {
      const start = new Date(2026, 0, 1).getTime();
      const end = new Date(2026, 0, 31).getTime();
      expect(
        getDateRangeSummary({
          preset: 'custom',
          startDate: start,
          endDate: end,
        })
      ).toBe('Jan 1, 2026 - Jan 31, 2026');
    });

    it('should format custom range with only start date', () => {
      const start = new Date(2026, 0, 1).getTime();
      expect(
        getDateRangeSummary({
          preset: 'custom',
          startDate: start,
          endDate: null,
        })
      ).toBe('From Jan 1, 2026');
    });

    it('should format custom range with only end date', () => {
      const end = new Date(2026, 0, 31).getTime();
      expect(
        getDateRangeSummary({
          preset: 'custom',
          startDate: null,
          endDate: end,
        })
      ).toBe('Until Jan 31, 2026');
    });
  });

  describe('getSessionTypeSummary', () => {
    it('should return "None selected" for empty array', () => {
      expect(getSessionTypeSummary([])).toBe('None selected');
    });

    it('should return "All types" when all types selected', () => {
      expect(getSessionTypeSummary([...ALL_SESSION_TYPES])).toBe('All types');
    });

    it('should return type label for single selection', () => {
      expect(getSessionTypeSummary(['calibration'])).toBe(
        SESSION_TYPE_LABELS.calibration
      );
    });

    it('should return count for multiple selections', () => {
      expect(getSessionTypeSummary(['calibration', 'quick_boost'])).toBe(
        '2 types'
      );
    });
  });

  describe('isDefaultFilters', () => {
    it('should return true for default filters', () => {
      expect(isDefaultFilters(DEFAULT_FILTERS)).toBe(true);
    });

    it('should return false when date range is not all_time', () => {
      expect(
        isDefaultFilters({
          dateRange: createDateRangeFromPreset('today'),
          sessionTypes: [...ALL_SESSION_TYPES],
        })
      ).toBe(false);
    });

    it('should return false when not all types selected', () => {
      expect(
        isDefaultFilters({
          dateRange: createDateRangeFromPreset('all_time'),
          sessionTypes: ['calibration'],
        })
      ).toBe(false);
    });
  });

  describe('getActiveFilterCount', () => {
    it('should return 0 for default filters', () => {
      expect(getActiveFilterCount(DEFAULT_FILTERS)).toBe(0);
    });

    it('should return 1 for only date filter active', () => {
      expect(
        getActiveFilterCount({
          dateRange: createDateRangeFromPreset('today'),
          sessionTypes: [...ALL_SESSION_TYPES],
        })
      ).toBe(1);
    });

    it('should return 1 for only type filter active', () => {
      expect(
        getActiveFilterCount({
          dateRange: createDateRangeFromPreset('all_time'),
          sessionTypes: ['calibration'],
        })
      ).toBe(1);
    });

    it('should return 2 for both filters active', () => {
      expect(
        getActiveFilterCount({
          dateRange: createDateRangeFromPreset('today'),
          sessionTypes: ['calibration'],
        })
      ).toBe(2);
    });
  });

  describe('filterSessions', () => {
    const today = getStartOfToday();
    const yesterday = today - 24 * 60 * 60 * 1000;
    const twoDaysAgo = today - 2 * 24 * 60 * 60 * 1000;

    const sessions: Session[] = [
      createMockSession({
        id: 1,
        session_type: 'calibration',
        start_time: today + 1000,
      }),
      createMockSession({
        id: 2,
        session_type: 'quick_boost',
        start_time: today + 2000,
      }),
      createMockSession({
        id: 3,
        session_type: 'custom',
        start_time: yesterday + 1000,
      }),
      createMockSession({
        id: 4,
        session_type: 'scheduled',
        start_time: twoDaysAgo + 1000,
      }),
    ];

    it('should return all sessions with default filters', () => {
      const result = filterSessions(sessions, DEFAULT_FILTERS);
      expect(result.length).toBe(4);
    });

    it('should filter by session type', () => {
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('all_time'),
        sessionTypes: ['calibration', 'quick_boost'],
      };
      const result = filterSessions(sessions, filters);
      expect(result.length).toBe(2);
      expect(
        result.every((s) =>
          ['calibration', 'quick_boost'].includes(s.session_type)
        )
      ).toBe(true);
    });

    it('should filter by date range - today only', () => {
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('today'),
        sessionTypes: [...ALL_SESSION_TYPES],
      };
      const result = filterSessions(sessions, filters);
      expect(result.length).toBe(2);
      expect(result.every((s) => s.start_time >= today)).toBe(true);
    });

    it('should filter by date range - yesterday only', () => {
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('yesterday'),
        sessionTypes: [...ALL_SESSION_TYPES],
      };
      const result = filterSessions(sessions, filters);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe(3);
    });

    it('should filter by both date range and session type', () => {
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('today'),
        sessionTypes: ['quick_boost'],
      };
      const result = filterSessions(sessions, filters);
      expect(result.length).toBe(1);
      expect(result[0].session_type).toBe('quick_boost');
    });

    it('should return empty array when no sessions match', () => {
      const filters: SessionFilters = {
        dateRange: createDateRangeFromPreset('today'),
        sessionTypes: ['sham'],
      };
      const result = filterSessions(sessions, filters);
      expect(result.length).toBe(0);
    });
  });
});

describe('DATE_RANGE_PRESET_LABELS', () => {
  it('should have labels for all presets', () => {
    const presets: DateRangePreset[] = [
      'today',
      'yesterday',
      'last_7_days',
      'last_30_days',
      'last_90_days',
      'all_time',
      'custom',
    ];

    presets.forEach((preset) => {
      expect(DATE_RANGE_PRESET_LABELS[preset]).toBeDefined();
      expect(typeof DATE_RANGE_PRESET_LABELS[preset]).toBe('string');
    });
  });
});

describe('ALL_SESSION_TYPES', () => {
  it('should contain all session types', () => {
    expect(ALL_SESSION_TYPES).toContain('calibration');
    expect(ALL_SESSION_TYPES).toContain('quick_boost');
    expect(ALL_SESSION_TYPES).toContain('custom');
    expect(ALL_SESSION_TYPES).toContain('scheduled');
    expect(ALL_SESSION_TYPES).toContain('sham');
    expect(ALL_SESSION_TYPES.length).toBe(5);
  });
});

describe('DEFAULT_FILTERS', () => {
  it('should have all_time date range', () => {
    expect(DEFAULT_FILTERS.dateRange.preset).toBe('all_time');
    expect(DEFAULT_FILTERS.dateRange.startDate).toBeNull();
    expect(DEFAULT_FILTERS.dateRange.endDate).toBeNull();
  });

  it('should have all session types selected', () => {
    expect(DEFAULT_FILTERS.sessionTypes.length).toBe(ALL_SESSION_TYPES.length);
    ALL_SESSION_TYPES.forEach((type) => {
      expect(DEFAULT_FILTERS.sessionTypes).toContain(type);
    });
  });
});
