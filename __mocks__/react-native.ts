/**
 * Mock implementation of react-native for testing
 */

// Platform mock
export const Platform = {
  OS: 'ios' as 'ios' | 'android',
  Version: 31,
  select: <T>(specifics: { ios?: T; android?: T; default?: T }): T | undefined =>
    specifics[Platform.OS] || specifics.default,
  isPad: false,
  isTVOS: false,
  isTV: false,
  isTesting: true,
};

// PermissionsAndroid mock
export const PermissionsAndroid = {
  PERMISSIONS: {
    ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
    ACCESS_COARSE_LOCATION: 'android.permission.ACCESS_COARSE_LOCATION',
    BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
    BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
    BLUETOOTH_ADVERTISE: 'android.permission.BLUETOOTH_ADVERTISE',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    NEVER_ASK_AGAIN: 'never_ask_again',
  },
  check: jest.fn().mockResolvedValue(true),
  request: jest.fn().mockResolvedValue('granted'),
  requestMultiple: jest.fn().mockResolvedValue({
    'android.permission.ACCESS_FINE_LOCATION': 'granted',
    'android.permission.BLUETOOTH_SCAN': 'granted',
    'android.permission.BLUETOOTH_CONNECT': 'granted',
  }),
};

// Allow tests to set platform
export function setPlatform(os: 'ios' | 'android', version?: number): void {
  Platform.OS = os;
  if (version !== undefined) {
    Platform.Version = version;
  }
}

// Allow tests to configure permission results
export function setPermissionResult(
  results: Record<string, string>
): void {
  PermissionsAndroid.requestMultiple.mockResolvedValue(results);
}

// Reset mock state
export function resetMocks(): void {
  Platform.OS = 'ios';
  Platform.Version = 31;
  PermissionsAndroid.check.mockReset().mockResolvedValue(true);
  PermissionsAndroid.request.mockReset().mockResolvedValue('granted');
  PermissionsAndroid.requestMultiple.mockReset().mockResolvedValue({
    'android.permission.ACCESS_FINE_LOCATION': 'granted',
    'android.permission.BLUETOOTH_SCAN': 'granted',
    'android.permission.BLUETOOTH_CONNECT': 'granted',
  });
}
