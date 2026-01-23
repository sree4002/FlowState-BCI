import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import type { Session } from '../types';
import { SESSION_TYPE_LABELS, SESSION_TYPE_COLORS } from './SessionListItem';

/**
 * Date range preset options for filtering sessions
 */
export type DateRangePreset =
  | 'today'
  | 'yesterday'
  | 'last_7_days'
  | 'last_30_days'
  | 'last_90_days'
  | 'all_time'
  | 'custom';

/**
 * Date range filter configuration
 */
export interface DateRangeFilter {
  preset: DateRangePreset;
  startDate: number | null;
  endDate: number | null;
}

/**
 * Session type filter - array of selected session types
 */
export type SessionTypeFilter = Session['session_type'][];

/**
 * Complete filter state
 */
export interface SessionFilters {
  dateRange: DateRangeFilter;
  sessionTypes: SessionTypeFilter;
}

/**
 * Props for the SessionFilterControls component
 */
export interface SessionFilterControlsProps {
  /**
   * Current filter state
   */
  filters: SessionFilters;

  /**
   * Callback when filters change
   */
  onFiltersChange: (filters: SessionFilters) => void;

  /**
   * Whether the filter controls are disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Whether to show the filter controls in a collapsed state initially
   * @default false
   */
  collapsed?: boolean;

  /**
   * Callback when collapsed state changes
   */
  onCollapsedChange?: (collapsed: boolean) => void;

  /**
   * Optional test ID for testing
   */
  testID?: string;
}

/**
 * Preset labels for display
 */
export const DATE_RANGE_PRESET_LABELS: Record<DateRangePreset, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  last_7_days: 'Last 7 Days',
  last_30_days: 'Last 30 Days',
  last_90_days: 'Last 90 Days',
  all_time: 'All Time',
  custom: 'Custom',
};

/**
 * All available session types
 */
export const ALL_SESSION_TYPES: Session['session_type'][] = [
  'calibration',
  'quick_boost',
  'custom',
  'scheduled',
  'sham',
];

/**
 * Default filter state - all time, all types
 */
export const DEFAULT_FILTERS: SessionFilters = {
  dateRange: {
    preset: 'all_time',
    startDate: null,
    endDate: null,
  },
  sessionTypes: [...ALL_SESSION_TYPES],
};

/**
 * Gets the start timestamp for a date range preset
 */
export const getPresetStartDate = (preset: DateRangePreset): number | null => {
  if (preset === 'all_time' || preset === 'custom') {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'today':
      return today.getTime();
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return yesterday.getTime();
    }
    case 'last_7_days': {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
      return sevenDaysAgo.getTime();
    }
    case 'last_30_days': {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29);
      return thirtyDaysAgo.getTime();
    }
    case 'last_90_days': {
      const ninetyDaysAgo = new Date(today);
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 89);
      return ninetyDaysAgo.getTime();
    }
    default:
      return null;
  }
};

/**
 * Gets the end timestamp for a date range preset
 */
export const getPresetEndDate = (preset: DateRangePreset): number | null => {
  if (preset === 'all_time' || preset === 'custom') {
    return null;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (preset) {
    case 'yesterday': {
      // End of yesterday
      const endOfYesterday = new Date(today);
      endOfYesterday.setMilliseconds(-1);
      return endOfYesterday.getTime();
    }
    default:
      // End of today for all other presets
      const endOfToday = new Date(today);
      endOfToday.setDate(endOfToday.getDate() + 1);
      endOfToday.setMilliseconds(-1);
      return endOfToday.getTime();
  }
};

/**
 * Creates a date range filter from a preset
 */
export const createDateRangeFromPreset = (
  preset: DateRangePreset
): DateRangeFilter => {
  return {
    preset,
    startDate: getPresetStartDate(preset),
    endDate: getPresetEndDate(preset),
  };
};

/**
 * Formats a date for display (e.g., "Jan 15, 2026")
 */
export const formatFilterDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Gets a summary label for the current date range filter
 */
export const getDateRangeSummary = (dateRange: DateRangeFilter): string => {
  if (dateRange.preset !== 'custom') {
    return DATE_RANGE_PRESET_LABELS[dateRange.preset];
  }

  if (dateRange.startDate === null && dateRange.endDate === null) {
    return 'All Time';
  }

  if (dateRange.startDate !== null && dateRange.endDate !== null) {
    return `${formatFilterDate(dateRange.startDate)} - ${formatFilterDate(dateRange.endDate)}`;
  }

  if (dateRange.startDate !== null) {
    return `From ${formatFilterDate(dateRange.startDate)}`;
  }

  if (dateRange.endDate !== null) {
    return `Until ${formatFilterDate(dateRange.endDate)}`;
  }

  return 'All Time';
};

/**
 * Gets a summary label for the session type filter
 */
export const getSessionTypeSummary = (
  sessionTypes: SessionTypeFilter
): string => {
  if (sessionTypes.length === 0) {
    return 'None selected';
  }

  if (sessionTypes.length === ALL_SESSION_TYPES.length) {
    return 'All types';
  }

  if (sessionTypes.length === 1) {
    return SESSION_TYPE_LABELS[sessionTypes[0]];
  }

  return `${sessionTypes.length} types`;
};

/**
 * Checks if filters are at their default state
 */
export const isDefaultFilters = (filters: SessionFilters): boolean => {
  return (
    filters.dateRange.preset === 'all_time' &&
    filters.sessionTypes.length === ALL_SESSION_TYPES.length
  );
};

/**
 * Filters sessions based on the provided filter criteria
 */
export const filterSessions = (
  sessions: Session[],
  filters: SessionFilters
): Session[] => {
  return sessions.filter((session) => {
    // Check session type filter
    if (!filters.sessionTypes.includes(session.session_type)) {
      return false;
    }

    // Check date range filter
    const { startDate, endDate } = filters.dateRange;

    if (startDate !== null && session.start_time < startDate) {
      return false;
    }

    if (endDate !== null && session.start_time > endDate) {
      return false;
    }

    return true;
  });
};

/**
 * Gets the count of active filters (non-default settings)
 */
export const getActiveFilterCount = (filters: SessionFilters): number => {
  let count = 0;

  if (filters.dateRange.preset !== 'all_time') {
    count++;
  }

  if (filters.sessionTypes.length !== ALL_SESSION_TYPES.length) {
    count++;
  }

  return count;
};

/**
 * DateRangePicker component for selecting date range presets
 */
const DateRangePicker: React.FC<{
  value: DateRangeFilter;
  onChange: (value: DateRangeFilter) => void;
  disabled?: boolean;
  testID?: string;
}> = ({ value, onChange, disabled = false, testID }) => {
  const [showModal, setShowModal] = useState(false);

  const presets: DateRangePreset[] = [
    'today',
    'yesterday',
    'last_7_days',
    'last_30_days',
    'last_90_days',
    'all_time',
  ];

  const handlePresetSelect = useCallback(
    (preset: DateRangePreset) => {
      onChange(createDateRangeFromPreset(preset));
      setShowModal(false);
    },
    [onChange]
  );

  return (
    <View testID={testID}>
      <Text style={styles.filterLabel}>Date Range</Text>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          disabled && styles.dropdownButtonDisabled,
        ]}
        onPress={() => setShowModal(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={`Date range filter: ${getDateRangeSummary(value)}`}
        accessibilityHint="Double tap to change date range"
        testID={`${testID}-button`}
      >
        <Text
          style={[
            styles.dropdownButtonText,
            disabled && styles.dropdownButtonTextDisabled,
          ]}
        >
          {getDateRangeSummary(value)}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
        testID={`${testID}-modal`}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Date Range</Text>
            {presets.map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.modalOption,
                  value.preset === preset && styles.modalOptionSelected,
                ]}
                onPress={() => handlePresetSelect(preset)}
                accessibilityRole="radio"
                accessibilityState={{ selected: value.preset === preset }}
                testID={`${testID}-option-${preset}`}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    value.preset === preset && styles.modalOptionTextSelected,
                  ]}
                >
                  {DATE_RANGE_PRESET_LABELS[preset]}
                </Text>
                {value.preset === preset && (
                  <Text style={styles.checkIcon}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

/**
 * SessionTypePicker component for selecting session types
 */
const SessionTypePicker: React.FC<{
  value: SessionTypeFilter;
  onChange: (value: SessionTypeFilter) => void;
  disabled?: boolean;
  testID?: string;
}> = ({ value, onChange, disabled = false, testID }) => {
  const handleToggle = useCallback(
    (sessionType: Session['session_type']) => {
      if (value.includes(sessionType)) {
        // Don't allow deselecting all types
        if (value.length > 1) {
          onChange(value.filter((t) => t !== sessionType));
        }
      } else {
        onChange([...value, sessionType]);
      }
    },
    [value, onChange]
  );

  const handleSelectAll = useCallback(() => {
    if (value.length === ALL_SESSION_TYPES.length) {
      // If all selected, select only the first type
      onChange([ALL_SESSION_TYPES[0]]);
    } else {
      onChange([...ALL_SESSION_TYPES]);
    }
  }, [value, onChange]);

  const allSelected = value.length === ALL_SESSION_TYPES.length;

  return (
    <View testID={testID}>
      <View style={styles.filterLabelRow}>
        <Text style={styles.filterLabel}>Session Type</Text>
        <TouchableOpacity
          onPress={handleSelectAll}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={
            allSelected ? 'Deselect all types' : 'Select all types'
          }
          testID={`${testID}-select-all`}
        >
          <Text
            style={[
              styles.selectAllText,
              disabled && styles.selectAllTextDisabled,
            ]}
          >
            {allSelected ? 'Clear' : 'All'}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.typeChipsContainer}
        testID={`${testID}-chips`}
      >
        {ALL_SESSION_TYPES.map((sessionType) => {
          const isSelected = value.includes(sessionType);
          const badgeColor = SESSION_TYPE_COLORS[sessionType];
          return (
            <TouchableOpacity
              key={sessionType}
              style={[
                styles.typeChip,
                isSelected && { backgroundColor: badgeColor },
                disabled && styles.typeChipDisabled,
              ]}
              onPress={() => handleToggle(sessionType)}
              disabled={disabled}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`${SESSION_TYPE_LABELS[sessionType]} session type`}
              testID={`${testID}-chip-${sessionType}`}
            >
              <Text
                style={[
                  styles.typeChipText,
                  isSelected && styles.typeChipTextSelected,
                ]}
              >
                {SESSION_TYPE_LABELS[sessionType]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

/**
 * SessionFilterControls Component
 *
 * Provides filter controls for filtering session history:
 * - Date range filter with preset options (Today, Last 7 Days, etc.)
 * - Session type filter with multi-select toggle chips
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useState(DEFAULT_FILTERS);
 *
 * <SessionFilterControls
 *   filters={filters}
 *   onFiltersChange={setFilters}
 * />
 * ```
 */
export const SessionFilterControls: React.FC<SessionFilterControlsProps> = ({
  filters,
  onFiltersChange,
  disabled = false,
  collapsed = false,
  onCollapsedChange,
  testID = 'session-filter-controls',
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const activeFilterCount = useMemo(
    () => getActiveFilterCount(filters),
    [filters]
  );

  const handleCollapsedToggle = useCallback(() => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapsedChange?.(newCollapsed);
  }, [isCollapsed, onCollapsedChange]);

  const handleDateRangeChange = useCallback(
    (dateRange: DateRangeFilter) => {
      onFiltersChange({ ...filters, dateRange });
    },
    [filters, onFiltersChange]
  );

  const handleSessionTypesChange = useCallback(
    (sessionTypes: SessionTypeFilter) => {
      onFiltersChange({ ...filters, sessionTypes });
    },
    [filters, onFiltersChange]
  );

  const handleReset = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS);
  }, [onFiltersChange]);

  return (
    <View style={styles.container} testID={testID}>
      <TouchableOpacity
        style={styles.header}
        onPress={handleCollapsedToggle}
        accessibilityRole="button"
        accessibilityLabel={`Filters${activeFilterCount > 0 ? `, ${activeFilterCount} active` : ''}`}
        accessibilityHint={isCollapsed ? 'Double tap to expand' : 'Double tap to collapse'}
        testID={`${testID}-header`}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.headerIcon}>⚙️</Text>
          <Text style={styles.headerTitle}>Filters</Text>
          {activeFilterCount > 0 && (
            <View style={styles.activeFilterBadge}>
              <Text style={styles.activeFilterBadgeText}>
                {activeFilterCount}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.collapseIcon}>{isCollapsed ? '▼' : '▲'}</Text>
      </TouchableOpacity>

      {!isCollapsed && (
        <View style={styles.content}>
          <DateRangePicker
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            disabled={disabled}
            testID={`${testID}-date-range`}
          />

          <View style={styles.filterDivider} />

          <SessionTypePicker
            value={filters.sessionTypes}
            onChange={handleSessionTypesChange}
            disabled={disabled}
            testID={`${testID}-session-type`}
          />

          {activeFilterCount > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={handleReset}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel="Reset all filters"
              testID={`${testID}-reset`}
            >
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  activeFilterBadge: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.round,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  activeFilterBadgeText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  collapseIcon: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  filterLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
  },
  filterLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  selectAllText: {
    color: Colors.primary.main,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  selectAllTextDisabled: {
    color: Colors.text.disabled,
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dropdownButtonDisabled: {
    backgroundColor: Colors.surface.primary,
    borderColor: Colors.border.secondary,
  },
  dropdownButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
  },
  dropdownButtonTextDisabled: {
    color: Colors.text.disabled,
  },
  dropdownIcon: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
  },
  filterDivider: {
    height: 1,
    backgroundColor: Colors.border.secondary,
    marginVertical: Spacing.md,
  },
  typeChipsContainer: {
    flexDirection: 'row',
    paddingRight: Spacing.md,
  },
  typeChip: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  typeChipDisabled: {
    opacity: 0.5,
  },
  typeChipText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  typeChipTextSelected: {
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.semibold,
  },
  resetButton: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  resetButtonText: {
    color: Colors.accent.error,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '80%',
    maxWidth: 320,
    ...Shadows.lg,
  },
  modalTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalOptionSelected: {
    backgroundColor: Colors.primary.dark,
  },
  modalOptionText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
  },
  modalOptionTextSelected: {
    color: Colors.primary.light,
    fontWeight: Typography.fontWeight.medium,
  },
  checkIcon: {
    color: Colors.primary.light,
    fontSize: Typography.fontSize.lg,
  },
});

export default SessionFilterControls;
