# App Assets Guide

This document describes the required app icons and splash screen assets for the FlowState BCI app.

## Overview

The FlowState BCI app uses Expo's asset management system for app icons and splash screens. All image assets should be placed in the `/assets` directory at the project root.

## Required Assets

### App Icon

| Asset | Path | Dimensions | Format | Description |
|-------|------|------------|--------|-------------|
| Main Icon | `assets/icon.png` | 1024x1024 px | PNG | Primary app icon used for iOS and fallback |

**Icon Guidelines:**
- Use a square image with no transparency for best results
- Keep important content within the center 80% (safe zone)
- Avoid text smaller than 20pt equivalent
- Use simple, recognizable imagery
- Consider how it looks at small sizes (29x29 px)

### iOS-Specific Icons

Expo automatically generates all required iOS icon sizes from the main icon. The following sizes are generated:

| Size | Usage |
|------|-------|
| 20x20 | Notification (iPad) |
| 29x29 | Settings |
| 40x40 | Spotlight |
| 60x60 | iPhone App Icon (@2x) |
| 76x76 | iPad App Icon |
| 83.5x83.5 | iPad Pro App Icon |
| 1024x1024 | App Store |

**iOS-Specific Configuration:**
```json
{
  "ios": {
    "icon": "./assets/icon.png"
  }
}
```

### Android Adaptive Icons

Android 8.0+ uses adaptive icons with separate foreground and background layers.

| Asset | Path | Dimensions | Format | Description |
|-------|------|------------|--------|-------------|
| Foreground | `assets/adaptive-icon.png` | 1024x1024 px | PNG | Icon foreground (with transparency) |
| Background | `assets/adaptive-icon-background.png` | 1024x1024 px | PNG | Optional background image |

**Adaptive Icon Guidelines:**
- Foreground should have transparent background
- Keep logo/content within inner 66% (safe zone) - the outer area may be cropped
- Background can be a solid color (configured in app.json) or an image
- The system applies various masks (circle, squircle, rounded square, etc.)

**Android Configuration:**
```json
{
  "android": {
    "adaptiveIcon": {
      "foregroundImage": "./assets/adaptive-icon.png",
      "backgroundImage": "./assets/adaptive-icon-background.png",
      "backgroundColor": "#1A1A2E"
    }
  }
}
```

**Note:** If `backgroundImage` is not provided, `backgroundColor` will be used as a solid color.

### Splash Screen

| Asset | Path | Dimensions | Format | Description |
|-------|------|------------|--------|-------------|
| Splash | `assets/splash.png` | 1284x2778 px | PNG | Splash/launch screen image |

**Recommended Splash Screen Sizes:**
- Minimum: 1242x2436 px (iPhone X)
- Recommended: 1284x2778 px (iPhone 14 Pro Max)
- Maximum: 2048x2732 px (12.9" iPad Pro)

**Splash Screen Guidelines:**
- Use `resizeMode: "contain"` to fit the image within the screen
- Use `resizeMode: "cover"` to fill the entire screen (may crop)
- Keep logo/content centered and within safe zones
- Match `backgroundColor` to the image background for seamless appearance

**Splash Configuration:**
```json
{
  "splash": {
    "image": "./assets/splash.png",
    "resizeMode": "contain",
    "backgroundColor": "#1A1A2E"
  }
}
```

### Web Favicon

| Asset | Path | Dimensions | Format | Description |
|-------|------|------------|--------|-------------|
| Favicon | `assets/favicon.png` | 48x48 px | PNG | Web browser favicon |

**Note:** Larger sizes (up to 512x512) can be used and will be scaled down automatically.

## Asset File Structure

```
assets/
  icon.png                    # Main app icon (1024x1024)
  adaptive-icon.png           # Android foreground (1024x1024)
  adaptive-icon-background.png # Android background (1024x1024, optional)
  splash.png                  # Splash screen (1284x2778)
  favicon.png                 # Web favicon (48x48)
  audio/                      # Audio assets
    isochronic_theta6_carrier440.wav
```

## Color Scheme

The FlowState BCI app uses a dark theme. The primary background color is:

- **Hex:** `#1A1A2E`
- **RGB:** `rgb(26, 26, 46)`

This color is used for:
- Splash screen background
- Android adaptive icon background
- App theme background

## Generating Icons with Expo Tools

### Using Expo CLI

Expo provides tools to help generate and validate app icons.

#### 1. Generate Icons from a Source Image

You can use third-party tools like `expo-icon` or online generators:

```bash
# Install expo-cli if not already installed
npm install -g expo-cli

# Use a tool like @expo/image-utils for programmatic generation
npx @expo/image-utils resize ./source-icon.png --output ./assets/icon.png --width 1024 --height 1024
```

#### 2. Using Online Tools

Recommended online generators:
- **Expo Icon Builder:** https://icon.expo.fyi
- **App Icon Generator:** https://appicon.co
- **MakeAppIcon:** https://makeappicon.com

Steps:
1. Upload your source icon (recommended 1024x1024 or larger)
2. Download the generated icon pack
3. Extract the appropriate sizes to the `assets/` directory

#### 3. Using Figma or Sketch Templates

Expo provides design templates:
- [Figma Splash Screen Template](https://www.figma.com/community/file/1155362909441341285)
- Use a 1024x1024 artboard for icons
- Export at 1x scale as PNG

### Validating Assets

After adding assets, validate them:

```bash
# Check that all required assets exist and are valid
npx expo-doctor

# Preview the app with assets
npx expo start
```

## Platform-Specific Considerations

### iOS

- Icons should not include transparency (opaque backgrounds)
- App Store requires a 1024x1024 icon without alpha channel
- iOS automatically applies rounded corners

### Android

- Adaptive icons support various shapes based on device manufacturer
- Legacy icons (pre-Android 8.0) are auto-generated from the foreground
- Consider how your icon looks with different mask shapes

### Web

- Progressive Web Apps (PWA) may require additional manifest icons
- Consider generating icons at 192x192 and 512x512 for PWA support

## Troubleshooting

### "Missing asset" warnings during build

Ensure all paths in `app.json` point to existing files:
```bash
ls -la assets/
```

### Icons look blurry

- Ensure source images are at least 1024x1024 px
- Use PNG format without compression artifacts
- Avoid upscaling smaller images

### Splash screen shows white bars

- Check that `backgroundColor` matches the image background
- Verify `resizeMode` is set appropriately
- Ensure image dimensions are correct for target devices

### Adaptive icon content is cropped

- Move important content to the inner 66% of the image
- Test with different mask shapes using Android Studio preview

## Design Recommendations for FlowState BCI

### Icon Concept Suggestions

The icon should reflect the app's purpose: brain-computer interface for focus and flow states.

Consider incorporating:
- Brain wave patterns (theta/alpha wave visualizations)
- Neural/brain imagery
- Flow state symbolism (water, infinity, curves)
- Technology elements (circuit patterns)

### Color Palette for Assets

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Navy | `#1A1A2E` | Background |
| Electric Blue | `#4A90D9` | Primary accent |
| Cyan | `#00D9FF` | Highlights |
| Purple | `#8B5CF6` | Secondary accent |
| White | `#FFFFFF` | Text/icons on dark |

### Sample Splash Screen Layout

```
+---------------------------+
|                           |
|                           |
|     [FlowState Logo]      |
|                           |
|     FlowState BCI         |
|                           |
|   "Enter your flow state" |
|                           |
|                           |
+---------------------------+
```

## References

- [Expo App Icons Documentation](https://docs.expo.dev/develop/user-interface/app-icons/)
- [Expo Splash Screen Documentation](https://docs.expo.dev/develop/user-interface/splash-screen/)
- [Android Adaptive Icons](https://developer.android.com/guide/practices/ui_guidelines/icon_design_adaptive)
- [Apple Human Interface Guidelines - App Icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)
