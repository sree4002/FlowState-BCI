/**
 * FlowState BCI - Dark Theme Color Palette
 * Calming blues and purples designed for focus and relaxation
 */

export const Colors = {
  // Primary colors - Deep calming blues
  primary: {
    main: '#4A90E2', // Soft blue
    light: '#6BA3E8', // Lighter blue
    dark: '#2E5F8F', // Deeper blue
    muted: '#5A7A9F', // Muted blue
  },

  // Secondary colors - Soothing purples
  secondary: {
    main: '#7B68EE', // Medium purple
    light: '#9B88F8', // Light purple
    dark: '#5B48CE', // Deep purple
    muted: '#6B5AA0', // Muted purple
  },

  // Background colors - Dark theme
  background: {
    primary: '#0F1419', // Very dark blue-black
    secondary: '#1A1F2E', // Dark blue-gray
    tertiary: '#252B3B', // Lighter dark blue
    elevated: '#2A3142', // Elevated surface
  },

  // Surface colors - Card and component backgrounds
  surface: {
    primary: '#1E2433', // Primary surface
    secondary: '#262D3D', // Secondary surface
    elevated: '#2F3647', // Elevated surface (modals, etc.)
    overlay: '#353C4F', // Overlay backgrounds
  },

  // Text colors
  text: {
    primary: '#E8ECF1', // High emphasis text
    secondary: '#B8BFC9', // Medium emphasis text
    tertiary: '#8891A0', // Low emphasis text
    disabled: '#5A6070', // Disabled text
    inverse: '#0F1419', // Text on light backgrounds
  },

  // Status colors - Theta zone indicators
  status: {
    // Red zone - Below target
    red: '#E74C3C',
    redLight: '#F08080',
    redDark: '#C0392B',

    // Yellow zone - Approaching target
    yellow: '#F39C12',
    yellowLight: '#F5B041',
    yellowDark: '#D68910',

    // Green zone - Target range
    green: '#2ECC71',
    greenLight: '#58D68D',
    greenDark: '#27AE60',

    // Blue zone - Above target
    blue: '#3498DB',
    blueLight: '#5DADE2',
    blueDark: '#2874A6',
  },

  // Signal quality indicators
  signal: {
    excellent: '#2ECC71', // Green
    good: '#3498DB', // Blue
    fair: '#F39C12', // Yellow
    poor: '#E67E22', // Orange
    critical: '#E74C3C', // Red
  },

  // Accent colors
  accent: {
    info: '#4A90E2', // Info messages
    success: '#2ECC71', // Success states
    warning: '#F39C12', // Warning states
    error: '#E74C3C', // Error states
    focus: '#7B68EE', // Focus/meditation
  },

  // Interactive elements
  interactive: {
    normal: '#4A90E2', // Normal state
    hover: '#6BA3E8', // Hover state
    active: '#2E5F8F', // Active/pressed state
    disabled: '#3A4658', // Disabled state
  },

  // Border colors
  border: {
    primary: '#3A4658', // Primary borders
    secondary: '#2F3647', // Secondary borders
    focus: '#4A90E2', // Focus borders
    error: '#E74C3C', // Error borders
  },

  // Chart colors - For data visualization
  chart: {
    line1: '#4A90E2', // Primary line
    line2: '#7B68EE', // Secondary line
    line3: '#2ECC71', // Tertiary line
    grid: '#2F3647', // Grid lines
    axis: '#5A6070', // Axis labels
  },

  // Overlay colors - Semi-transparent overlays
  overlay: {
    dark: 'rgba(15, 20, 25, 0.9)', // Dark overlay
    medium: 'rgba(15, 20, 25, 0.7)', // Medium overlay
    light: 'rgba(15, 20, 25, 0.5)', // Light overlay
  },

  // Gradient definitions
  gradients: {
    primary: ['#2E5F8F', '#4A90E2', '#6BA3E8'],
    secondary: ['#5B48CE', '#7B68EE', '#9B88F8'],
    theta: ['#E74C3C', '#F39C12', '#2ECC71', '#3498DB'],
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999,
};

export const Typography = {
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
};

export const Opacity = {
  disabled: 0.4,
  hover: 0.8,
  pressed: 0.6,
};

// Export as a complete theme object
export const Theme = {
  colors: Colors,
  spacing: Spacing,
  borderRadius: BorderRadius,
  typography: Typography,
  shadows: Shadows,
  opacity: Opacity,
};

export default Theme;
