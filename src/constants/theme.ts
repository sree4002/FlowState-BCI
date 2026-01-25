/**
 * FlowState BCI - Premium Dark Theme
 * Modern, minimal design with teal accent
 */

export const Colors = {
  // Backgrounds
  background: {
    primary: '#000000',
    secondary: '#0a0d10',
    tertiary: '#1a1f24',
    card: '#0d1117',
    cardHover: '#1a1f24',
    elevated: '#21262d',
  },

  // Accent - Teal
  accent: {
    primary: '#00d4aa',
    primaryDim: 'rgba(0, 212, 170, 0.1)',
    primaryGlow: 'rgba(0, 212, 170, 0.15)',
    success: '#00d4aa',
    error: '#b56566',
    warning: '#c9a857',
    info: '#00d4aa',
    focus: '#00d4aa',
  },

  // Primary (alias for accent for compatibility)
  primary: {
    main: '#00d4aa',
    light: '#33ddbb',
    dark: '#00a884',
    muted: '#00d4aa80',
  },

  // Secondary
  secondary: {
    main: '#1a1f24',
    light: '#2a3038',
    dark: '#0d1117',
    muted: '#30363d',
  },

  // Text
  text: {
    primary: '#f0f6fc',
    secondary: '#8892b0',
    tertiary: '#6b7280',
    disabled: '#4a5568',
    inverse: '#000000',
  },

  // Theta States
  theta: {
    low: '#b56566',      // Muted red
    normal: '#c9a857',   // Muted gold
    high: '#5d8a6b',     // Muted green
  },

  // Status colors (compatibility)
  status: {
    red: '#b56566',
    redLight: '#c97879',
    redDark: '#944f50',
    yellow: '#c9a857',
    yellowLight: '#d4b96d',
    yellowDark: '#a88c45',
    green: '#5d8a6b',
    greenLight: '#6f9c7d',
    greenDark: '#4b7257',
    blue: '#00d4aa',
    blueLight: '#33ddbb',
    blueDark: '#00a884',
  },

  // Signal quality (using theta colors)
  signal: {
    excellent: '#5d8a6b',
    good: '#5d8a6b',
    fair: '#c9a857',
    poor: '#b56566',
    critical: '#b56566',
  },

  // Surface colors
  surface: {
    primary: '#0d1117',
    secondary: '#1a1f24',
    elevated: '#21262d',
    overlay: '#30363d',
  },

  // Border colors
  border: {
    primary: '#30363d',
    secondary: '#21262d',
    focus: '#00d4aa',
    error: '#b56566',
    active: '#00d4aa',
  },

  // Chart colors
  chart: {
    line1: '#00d4aa',
    line2: '#5d8a6b',
    line3: '#c9a857',
    grid: '#1a1f24',
    axis: '#6b7280',
  },

  // Interactive elements
  interactive: {
    normal: '#00d4aa',
    hover: '#33ddbb',
    active: '#00a884',
    disabled: '#30363d',
  },

  // Overlay colors
  overlay: {
    dark: 'rgba(0, 0, 0, 0.9)',
    medium: 'rgba(0, 0, 0, 0.7)',
    light: 'rgba(0, 0, 0, 0.5)',
  },

  // Button variants
  button: {
    danger: '#b56566',
    dangerBg: 'rgba(181, 101, 102, 0.2)',
  },

  // Gradients
  gradients: {
    primary: ['#00d4aa', '#00a884'],
    theta: ['#b56566', '#c9a857', '#5d8a6b'],
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  screenPadding: 24,
  cardPadding: 18,
};

export const BorderRadius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  round: 50,
};

export const Typography = {
  fontSize: {
    xs: 9,
    sm: 11,
    md: 13,
    lg: 15,
    xl: 17,
    xxl: 22,
    xxxl: 28,
    display: 76,
    timer: 48,
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
  letterSpacing: {
    tight: -3,
    normal: 0,
    wide: 1,
  },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  glow: {
    shadowColor: '#00d4aa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
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
