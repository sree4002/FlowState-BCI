// Components export
// Export reusable components here as they are created
export { DeviceStatusWidget } from './DeviceStatusWidget';
export type { DeviceStatusWidgetProps } from './DeviceStatusWidget';

export { ThetaNumericDisplay } from './ThetaNumericDisplay';
export type {
  ThetaNumericDisplayProps,
  ThetaNumericDisplaySize,
  ThetaZone,
} from './ThetaNumericDisplay';
export {
  getThetaZoneColor,
  getThetaZoneLabel,
  categorizeZScoreZone,
  formatZScore,
} from './ThetaNumericDisplay';

export { PauseResumeButton } from './PauseResumeButton';
export type { PauseResumeButtonProps } from './PauseResumeButton';
export {
  getButtonLabel,
  getButtonColor,
  getAccessibilityLabel,
  getAccessibilityHint,
  getButtonIcon,
} from './PauseResumeButton';

export { StopButton } from './StopButton';
export type { StopButtonProps } from './StopButton';
export {
  canStopSession,
  getStopButtonLabel,
  getStopButtonColor,
  getStopAccessibilityLabel,
  getStopAccessibilityHint,
  getStopButtonIcon,
  getStopConfirmationMessage,
} from './StopButton';

export { SignalQualityIndicator } from './SignalQualityIndicator';
export type {
  SignalQualityIndicatorProps,
  SignalQualityLevel,
} from './SignalQualityIndicator';
export {
  getSignalQualityLevel,
  getSignalQualityColor,
  getSignalQualityLabel,
  getSignalQualityIcon,
  getSignalBars,
  getSignalAccessibilityLabel,
  getSignalAccessibilityHint,
  getSignalQualityDetails,
  getPositionStyles,
} from './SignalQualityIndicator';

export { EntrainmentStateDisplay } from './EntrainmentStateDisplay';
export type {
  EntrainmentStateDisplayProps,
  EntrainmentStateDisplaySize,
  EntrainmentState,
} from './EntrainmentStateDisplay';
export {
  formatFrequency,
  getEntrainmentState,
  getEntrainmentStateColor,
  getEntrainmentStateLabel,
  getEntrainmentStateIcon,
  getFrequencyColor,
  getEntrainmentAccessibilityLabel,
  getFrequencyBandLabel,
  isValidThetaFrequency,
} from './EntrainmentStateDisplay';

export { SessionCompletionHandler } from './SessionCompletionHandler';
export type {
  SessionCompletionHandlerProps,
  SessionCompletionData,
} from './SessionCompletionHandler';
export {
  formatDuration,
  formatDurationClock,
  getCompletionMessage,
  getThetaPerformanceLevel,
  getSignalQualityLevel as getCompletionSignalQualityLevel,
  formatZScore as formatCompletionZScore,
  getSessionTypeLabel,
  getRatingAccessibilityLabel,
  RATING_LABELS,
} from './SessionCompletionHandler';

export { SessionListItem } from './SessionListItem';
export type { SessionListItemProps } from './SessionListItem';
export {
  SESSION_TYPE_LABELS,
  SESSION_TYPE_COLORS,
  getSessionTypeLabel as getListSessionTypeLabel,
  getSessionTypeBadgeColor,
  formatSessionDuration,
  formatSessionDate,
  formatSessionTime,
  formatThetaZScore,
  getThetaColor,
  getSessionAccessibilityLabel,
  getRelativeDateLabel,
  getStarRating,
} from './SessionListItem';

export { SessionListView } from './SessionListView';
export type { SessionListViewProps } from './SessionListView';
export { isSameDay } from './SessionListView';

export { SessionFilterControls } from './SessionFilterControls';
export type {
  SessionFilterControlsProps,
  DateRangePreset,
  DateRangeFilter,
  SessionTypeFilter,
  SessionFilters,
} from './SessionFilterControls';
export {
  DATE_RANGE_PRESET_LABELS,
  ALL_SESSION_TYPES,
  DEFAULT_FILTERS,
  getPresetStartDate,
  getPresetEndDate,
  createDateRangeFromPreset,
  formatFilterDate,
  getDateRangeSummary,
  getSessionTypeSummary,
  isDefaultFilters,
  filterSessions,
  getActiveFilterCount,
} from './SessionFilterControls';

export { SimulatedModeDebugView } from './SimulatedModeDebugView';
export type { SimulatedModeDebugViewProps } from './SimulatedModeDebugView';

export { CalibrateButton } from './CalibrateButton';
export type { CalibrateButtonProps } from './CalibrateButton';
