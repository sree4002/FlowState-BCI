import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
  Opacity,
  Theme,
} from '../src/constants/theme';

describe('Theme - Color Palette', () => {
  describe('Primary Colors', () => {
    it('should have all primary color variants', () => {
      expect(Colors.primary).toHaveProperty('main');
      expect(Colors.primary).toHaveProperty('light');
      expect(Colors.primary).toHaveProperty('dark');
      expect(Colors.primary).toHaveProperty('muted');
    });

    it('should have valid hex color values for primary colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/;
      expect(Colors.primary.main).toMatch(hexColorRegex);
      expect(Colors.primary.light).toMatch(hexColorRegex);
      expect(Colors.primary.dark).toMatch(hexColorRegex);
      expect(Colors.primary.muted).toMatch(hexColorRegex);
    });
  });

  describe('Secondary Colors', () => {
    it('should have all secondary color variants', () => {
      expect(Colors.secondary).toHaveProperty('main');
      expect(Colors.secondary).toHaveProperty('light');
      expect(Colors.secondary).toHaveProperty('dark');
      expect(Colors.secondary).toHaveProperty('muted');
    });

    it('should have valid hex color values for secondary colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(Colors.secondary.main).toMatch(hexColorRegex);
      expect(Colors.secondary.light).toMatch(hexColorRegex);
      expect(Colors.secondary.dark).toMatch(hexColorRegex);
      expect(Colors.secondary.muted).toMatch(hexColorRegex);
    });
  });

  describe('Background Colors', () => {
    it('should have all background color variants', () => {
      expect(Colors.background).toHaveProperty('primary');
      expect(Colors.background).toHaveProperty('secondary');
      expect(Colors.background).toHaveProperty('tertiary');
      expect(Colors.background).toHaveProperty('elevated');
    });

    it('should have valid hex color values for background colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(Colors.background.primary).toMatch(hexColorRegex);
      expect(Colors.background.secondary).toMatch(hexColorRegex);
      expect(Colors.background.tertiary).toMatch(hexColorRegex);
      expect(Colors.background.elevated).toMatch(hexColorRegex);
    });
  });

  describe('Surface Colors', () => {
    it('should have all surface color variants', () => {
      expect(Colors.surface).toHaveProperty('primary');
      expect(Colors.surface).toHaveProperty('secondary');
      expect(Colors.surface).toHaveProperty('elevated');
      expect(Colors.surface).toHaveProperty('overlay');
    });
  });

  describe('Text Colors', () => {
    it('should have all text color variants', () => {
      expect(Colors.text).toHaveProperty('primary');
      expect(Colors.text).toHaveProperty('secondary');
      expect(Colors.text).toHaveProperty('tertiary');
      expect(Colors.text).toHaveProperty('disabled');
      expect(Colors.text).toHaveProperty('inverse');
    });
  });

  describe('Status Colors - Theta Zones', () => {
    it('should have all theta zone colors', () => {
      expect(Colors.status).toHaveProperty('red');
      expect(Colors.status).toHaveProperty('redLight');
      expect(Colors.status).toHaveProperty('redDark');
      expect(Colors.status).toHaveProperty('yellow');
      expect(Colors.status).toHaveProperty('yellowLight');
      expect(Colors.status).toHaveProperty('yellowDark');
      expect(Colors.status).toHaveProperty('green');
      expect(Colors.status).toHaveProperty('greenLight');
      expect(Colors.status).toHaveProperty('greenDark');
      expect(Colors.status).toHaveProperty('blue');
      expect(Colors.status).toHaveProperty('blueLight');
      expect(Colors.status).toHaveProperty('blueDark');
    });

    it('should have valid hex color values for all status colors', () => {
      const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
      expect(Colors.status.red).toMatch(hexColorRegex);
      expect(Colors.status.yellow).toMatch(hexColorRegex);
      expect(Colors.status.green).toMatch(hexColorRegex);
      expect(Colors.status.blue).toMatch(hexColorRegex);
    });
  });

  describe('Signal Quality Colors', () => {
    it('should have all signal quality levels', () => {
      expect(Colors.signal).toHaveProperty('excellent');
      expect(Colors.signal).toHaveProperty('good');
      expect(Colors.signal).toHaveProperty('fair');
      expect(Colors.signal).toHaveProperty('poor');
      expect(Colors.signal).toHaveProperty('critical');
    });
  });

  describe('Accent Colors', () => {
    it('should have all accent color types', () => {
      expect(Colors.accent).toHaveProperty('info');
      expect(Colors.accent).toHaveProperty('success');
      expect(Colors.accent).toHaveProperty('warning');
      expect(Colors.accent).toHaveProperty('error');
      expect(Colors.accent).toHaveProperty('focus');
    });
  });

  describe('Interactive Colors', () => {
    it('should have all interactive states', () => {
      expect(Colors.interactive).toHaveProperty('normal');
      expect(Colors.interactive).toHaveProperty('hover');
      expect(Colors.interactive).toHaveProperty('active');
      expect(Colors.interactive).toHaveProperty('disabled');
    });
  });

  describe('Border Colors', () => {
    it('should have all border types', () => {
      expect(Colors.border).toHaveProperty('primary');
      expect(Colors.border).toHaveProperty('secondary');
      expect(Colors.border).toHaveProperty('focus');
      expect(Colors.border).toHaveProperty('error');
    });
  });

  describe('Chart Colors', () => {
    it('should have all chart color types', () => {
      expect(Colors.chart).toHaveProperty('line1');
      expect(Colors.chart).toHaveProperty('line2');
      expect(Colors.chart).toHaveProperty('line3');
      expect(Colors.chart).toHaveProperty('grid');
      expect(Colors.chart).toHaveProperty('axis');
    });
  });

  describe('Overlay Colors', () => {
    it('should have all overlay variants', () => {
      expect(Colors.overlay).toHaveProperty('dark');
      expect(Colors.overlay).toHaveProperty('medium');
      expect(Colors.overlay).toHaveProperty('light');
    });

    it('should have valid rgba values for overlays', () => {
      const rgbaRegex = /^rgba\(\d+,\s*\d+,\s*\d+,\s*[0-9.]+\)$/;
      expect(Colors.overlay.dark).toMatch(rgbaRegex);
      expect(Colors.overlay.medium).toMatch(rgbaRegex);
      expect(Colors.overlay.light).toMatch(rgbaRegex);
    });
  });

  describe('Gradients', () => {
    it('should have all gradient types', () => {
      expect(Colors.gradients).toHaveProperty('primary');
      expect(Colors.gradients).toHaveProperty('theta');
    });

    it('should have arrays of colors for gradients', () => {
      expect(Array.isArray(Colors.gradients.primary)).toBe(true);
      expect(Array.isArray(Colors.gradients.theta)).toBe(true);
    });

    it('should have at least 2 colors in each gradient', () => {
      expect(Colors.gradients.primary.length).toBeGreaterThanOrEqual(2);
      expect(Colors.gradients.theta.length).toBeGreaterThanOrEqual(2);
    });
  });
});

describe('Theme - Spacing', () => {
  it('should have all spacing variants', () => {
    expect(Spacing).toHaveProperty('xs');
    expect(Spacing).toHaveProperty('sm');
    expect(Spacing).toHaveProperty('md');
    expect(Spacing).toHaveProperty('lg');
    expect(Spacing).toHaveProperty('xl');
    expect(Spacing).toHaveProperty('xxl');
  });

  it('should have numeric values for all spacing', () => {
    expect(typeof Spacing.xs).toBe('number');
    expect(typeof Spacing.sm).toBe('number');
    expect(typeof Spacing.md).toBe('number');
    expect(typeof Spacing.lg).toBe('number');
    expect(typeof Spacing.xl).toBe('number');
    expect(typeof Spacing.xxl).toBe('number');
  });

  it('should have ascending spacing values', () => {
    expect(Spacing.xs).toBeLessThan(Spacing.sm);
    expect(Spacing.sm).toBeLessThan(Spacing.md);
    expect(Spacing.md).toBeLessThan(Spacing.lg);
    expect(Spacing.lg).toBeLessThan(Spacing.xl);
    expect(Spacing.xl).toBeLessThan(Spacing.xxl);
  });
});

describe('Theme - Border Radius', () => {
  it('should have all border radius variants', () => {
    expect(BorderRadius).toHaveProperty('sm');
    expect(BorderRadius).toHaveProperty('md');
    expect(BorderRadius).toHaveProperty('lg');
    expect(BorderRadius).toHaveProperty('xl');
    expect(BorderRadius).toHaveProperty('round');
  });

  it('should have numeric values for all border radius', () => {
    expect(typeof BorderRadius.sm).toBe('number');
    expect(typeof BorderRadius.md).toBe('number');
    expect(typeof BorderRadius.lg).toBe('number');
    expect(typeof BorderRadius.xl).toBe('number');
    expect(typeof BorderRadius.round).toBe('number');
  });
});

describe('Theme - Typography', () => {
  describe('Font Sizes', () => {
    it('should have all font size variants', () => {
      expect(Typography.fontSize).toHaveProperty('xs');
      expect(Typography.fontSize).toHaveProperty('sm');
      expect(Typography.fontSize).toHaveProperty('md');
      expect(Typography.fontSize).toHaveProperty('lg');
      expect(Typography.fontSize).toHaveProperty('xl');
      expect(Typography.fontSize).toHaveProperty('xxl');
      expect(Typography.fontSize).toHaveProperty('xxxl');
    });

    it('should have numeric values for all font sizes', () => {
      expect(typeof Typography.fontSize.xs).toBe('number');
      expect(typeof Typography.fontSize.sm).toBe('number');
      expect(typeof Typography.fontSize.md).toBe('number');
      expect(typeof Typography.fontSize.lg).toBe('number');
      expect(typeof Typography.fontSize.xl).toBe('number');
      expect(typeof Typography.fontSize.xxl).toBe('number');
      expect(typeof Typography.fontSize.xxxl).toBe('number');
    });
  });

  describe('Font Weights', () => {
    it('should have all font weight variants', () => {
      expect(Typography.fontWeight).toHaveProperty('light');
      expect(Typography.fontWeight).toHaveProperty('regular');
      expect(Typography.fontWeight).toHaveProperty('medium');
      expect(Typography.fontWeight).toHaveProperty('semibold');
      expect(Typography.fontWeight).toHaveProperty('bold');
    });

    it('should have string values for all font weights', () => {
      expect(typeof Typography.fontWeight.light).toBe('string');
      expect(typeof Typography.fontWeight.regular).toBe('string');
      expect(typeof Typography.fontWeight.medium).toBe('string');
      expect(typeof Typography.fontWeight.semibold).toBe('string');
      expect(typeof Typography.fontWeight.bold).toBe('string');
    });
  });

  describe('Line Heights', () => {
    it('should have all line height variants', () => {
      expect(Typography.lineHeight).toHaveProperty('tight');
      expect(Typography.lineHeight).toHaveProperty('normal');
      expect(Typography.lineHeight).toHaveProperty('relaxed');
    });

    it('should have numeric values for all line heights', () => {
      expect(typeof Typography.lineHeight.tight).toBe('number');
      expect(typeof Typography.lineHeight.normal).toBe('number');
      expect(typeof Typography.lineHeight.relaxed).toBe('number');
    });
  });
});

describe('Theme - Shadows', () => {
  it('should have all shadow variants', () => {
    expect(Shadows).toHaveProperty('sm');
    expect(Shadows).toHaveProperty('md');
    expect(Shadows).toHaveProperty('lg');
  });

  it('should have all required shadow properties for each variant', () => {
    ['sm', 'md', 'lg'].forEach((size) => {
      const shadow = Shadows[size as keyof typeof Shadows];
      expect(shadow).toHaveProperty('shadowColor');
      expect(shadow).toHaveProperty('shadowOffset');
      expect(shadow).toHaveProperty('shadowOpacity');
      expect(shadow).toHaveProperty('shadowRadius');
      expect(shadow).toHaveProperty('elevation');
    });
  });

  it('should have valid shadow offset objects', () => {
    ['sm', 'md', 'lg'].forEach((size) => {
      const shadow = Shadows[size as keyof typeof Shadows];
      expect(shadow.shadowOffset).toHaveProperty('width');
      expect(shadow.shadowOffset).toHaveProperty('height');
      expect(typeof shadow.shadowOffset.width).toBe('number');
      expect(typeof shadow.shadowOffset.height).toBe('number');
    });
  });
});

describe('Theme - Opacity', () => {
  it('should have all opacity variants', () => {
    expect(Opacity).toHaveProperty('disabled');
    expect(Opacity).toHaveProperty('hover');
    expect(Opacity).toHaveProperty('pressed');
  });

  it('should have numeric values between 0 and 1', () => {
    expect(Opacity.disabled).toBeGreaterThan(0);
    expect(Opacity.disabled).toBeLessThanOrEqual(1);
    expect(Opacity.hover).toBeGreaterThan(0);
    expect(Opacity.hover).toBeLessThanOrEqual(1);
    expect(Opacity.pressed).toBeGreaterThan(0);
    expect(Opacity.pressed).toBeLessThanOrEqual(1);
  });
});

describe('Theme - Complete Theme Object', () => {
  it('should export a complete Theme object', () => {
    expect(Theme).toHaveProperty('colors');
    expect(Theme).toHaveProperty('spacing');
    expect(Theme).toHaveProperty('borderRadius');
    expect(Theme).toHaveProperty('typography');
    expect(Theme).toHaveProperty('shadows');
    expect(Theme).toHaveProperty('opacity');
  });

  it('should have matching references to individual exports', () => {
    expect(Theme.colors).toBe(Colors);
    expect(Theme.spacing).toBe(Spacing);
    expect(Theme.borderRadius).toBe(BorderRadius);
    expect(Theme.typography).toBe(Typography);
    expect(Theme.shadows).toBe(Shadows);
    expect(Theme.opacity).toBe(Opacity);
  });
});

describe('Theme - Export from constants index', () => {
  it('should be exportable from constants index', async () => {
    const constantsModule = await import('../src/constants/index');
    expect(constantsModule).toHaveProperty('Colors');
    expect(constantsModule).toHaveProperty('Theme');
    expect(constantsModule).toHaveProperty('Spacing');
    expect(constantsModule).toHaveProperty('BorderRadius');
    expect(constantsModule).toHaveProperty('Typography');
  });
});
