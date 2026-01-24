# FlowState BCI Release Checklist

This document provides a comprehensive checklist for deploying FlowState BCI to TestFlight (iOS) and Google Play Store (Android).

---

## Table of Contents

1. [Pre-Release Preparation](#1-pre-release-preparation)
2. [Testing Requirements](#2-testing-requirements)
3. [iOS Release (TestFlight)](#3-ios-release-testflight)
4. [Android Release (Play Store)](#4-android-release-play-store)
5. [Post-Release](#5-post-release)

---

## 1. Pre-Release Preparation

### Version Number Update

- [ ] Update version number in `package.json`
- [ ] Update version number in `app.json` (Expo config)
- [ ] Update `CFBundleShortVersionString` in `ios/FlowState/Info.plist`
- [ ] Update `CFBundleVersion` (build number) in `ios/FlowState/Info.plist`
- [ ] Update `versionCode` in `android/app/build.gradle`
- [ ] Update `versionName` in `android/app/build.gradle`
- [ ] Verify version follows semantic versioning (MAJOR.MINOR.PATCH)
- [ ] Ensure build numbers are incremented from previous release

### Changelog Update

- [ ] Create/update `CHANGELOG.md` with new version entry
- [ ] Document all new features with descriptions
- [ ] Document all bug fixes with issue references
- [ ] Document any breaking changes prominently
- [ ] Document any known issues or limitations
- [ ] Include migration notes if applicable
- [ ] Review changelog for clarity and completeness
- [ ] Add release date to changelog entry

### Feature Freeze

- [ ] Announce feature freeze to development team
- [ ] Merge all approved feature branches to `main`
- [ ] Create release branch (`release/vX.Y.Z`)
- [ ] Lock release branch from new features
- [ ] Only allow critical bug fixes on release branch
- [ ] Update project board/tracking to reflect freeze
- [ ] Notify stakeholders of feature cutoff

### Code Review Completion

- [ ] All PRs for release have been reviewed and approved
- [ ] No outstanding merge conflicts
- [ ] All review comments addressed
- [ ] Security review completed for sensitive features
- [ ] Performance review completed for critical paths
- [ ] Accessibility review completed
- [ ] Code follows project style guidelines
- [ ] No TODO comments blocking release
- [ ] Dependencies are up to date and audited
- [ ] Run `npm audit` and address vulnerabilities

---

## 2. Testing Requirements

### Unit Tests Passing

- [ ] Run full test suite: `npm test`
- [ ] All unit tests passing (0 failures)
- [ ] Code coverage meets minimum threshold (e.g., 80%)
- [ ] No skipped tests without documented reason
- [ ] BLE service tests passing
- [ ] Signal processing tests passing
- [ ] Session management tests passing
- [ ] Database/storage tests passing
- [ ] Component tests passing
- [ ] Navigation tests passing

### E2E Tests Passing

- [ ] Set up E2E test environment
- [ ] Run Detox tests for iOS: `detox test --configuration ios.sim.release`
- [ ] Run Detox tests for Android: `detox test --configuration android.emu.release`
- [ ] Onboarding flow completes successfully
- [ ] Device pairing flow works correctly
- [ ] Calibration flow completes without errors
- [ ] Session start/pause/resume/stop works
- [ ] Data export functions correctly
- [ ] Settings persistence verified
- [ ] Navigation between all screens works

### Manual QA Checklist

#### Core Functionality
- [ ] App launches without crash
- [ ] Onboarding flow is intuitive and complete
- [ ] BLE device discovery works
- [ ] BLE device pairing successful
- [ ] BLE reconnection works after disconnect
- [ ] Calibration process completes
- [ ] Session can be started
- [ ] Session can be paused and resumed
- [ ] Session can be stopped
- [ ] Session data is saved correctly
- [ ] Historical sessions display correctly
- [ ] Data export works (CSV, JSON)

#### UI/UX Testing
- [ ] All screens render correctly
- [ ] No layout issues or overlapping elements
- [ ] Text is readable and properly sized
- [ ] Touch targets are appropriately sized (min 44x44pt)
- [ ] Animations are smooth (60fps)
- [ ] Loading states display correctly
- [ ] Error states display helpful messages
- [ ] Empty states are handled gracefully
- [ ] Dark mode displays correctly (if supported)
- [ ] Orientation changes handled (if supported)

#### Edge Cases
- [ ] App behavior with no internet connection
- [ ] App behavior when BLE is disabled
- [ ] App behavior when permissions denied
- [ ] App behavior on low battery
- [ ] App recovery after backgrounding
- [ ] App recovery after force quit
- [ ] Handling of corrupted local data
- [ ] Behavior with very long session durations
- [ ] Behavior with rapid user interactions

### Device Compatibility Testing

#### iOS Devices
- [ ] iPhone 15 Pro Max (latest)
- [ ] iPhone 15 (current generation)
- [ ] iPhone 14 (previous generation)
- [ ] iPhone 13 (2 generations back)
- [ ] iPhone SE (smallest supported screen)
- [ ] iPad Pro (if tablet supported)
- [ ] iPad Air (if tablet supported)

#### iOS Versions
- [ ] iOS 17.x (latest)
- [ ] iOS 16.x (previous major)
- [ ] iOS 15.x (minimum supported, if applicable)

#### Android Devices
- [ ] Google Pixel 8 (latest Pixel)
- [ ] Samsung Galaxy S24 (latest Samsung flagship)
- [ ] Samsung Galaxy A54 (mid-range)
- [ ] OnePlus 12 (alternative flagship)
- [ ] Older device with minimum specs

#### Android Versions
- [ ] Android 14 (API 34)
- [ ] Android 13 (API 33)
- [ ] Android 12 (API 31)
- [ ] Android 11 (API 30, if minimum supported)

#### Screen Sizes
- [ ] Small phones (< 5.5")
- [ ] Standard phones (5.5" - 6.5")
- [ ] Large phones (> 6.5")
- [ ] Tablets (if supported)

---

## 3. iOS Release (TestFlight)

### Apple Developer Account Setup

- [ ] Active Apple Developer Program membership ($99/year)
- [ ] Team Agent/Admin access confirmed
- [ ] Two-factor authentication enabled
- [ ] App-specific password generated (for CI/CD)
- [ ] Team members added with appropriate roles
- [ ] Agreements and tax forms up to date in App Store Connect

### Certificates and Provisioning Profiles

#### Development
- [ ] iOS Development certificate created/valid
- [ ] Development provisioning profile created
- [ ] Profile includes all test devices

#### Distribution
- [ ] iOS Distribution certificate created/valid
- [ ] App Store provisioning profile created
- [ ] Push notification certificate configured (if applicable)
- [ ] Certificates exported and backed up securely
- [ ] Certificates added to CI/CD secrets

#### Keychain Setup
- [ ] Certificates imported to local keychain
- [ ] Private keys available
- [ ] `security unlock-keychain` configured for CI

### App Store Connect Configuration

#### App Information
- [ ] App created in App Store Connect
- [ ] Bundle ID registered and matches Xcode project
- [ ] App name finalized (30 character limit)
- [ ] Primary language set
- [ ] Primary and secondary categories selected
- [ ] Content rights declarations completed

#### App Privacy
- [ ] Privacy policy URL provided
- [ ] App Privacy questionnaire completed
- [ ] Data collection types declared
- [ ] Data usage purposes specified
- [ ] Third-party data sharing disclosed

#### App Store Listing (prepare for future release)
- [ ] App description written (4000 character limit)
- [ ] Keywords optimized (100 character limit)
- [ ] What's New text prepared
- [ ] Support URL provided
- [ ] Marketing URL provided (optional)
- [ ] Screenshots prepared for all required sizes
  - [ ] 6.7" (iPhone 15 Pro Max) - Required
  - [ ] 6.5" (iPhone 14 Plus) - Required
  - [ ] 5.5" (iPhone 8 Plus) - Required
  - [ ] 12.9" iPad Pro (if universal)
- [ ] App preview videos prepared (optional)
- [ ] App icon uploaded (1024x1024)

### Build Submission Steps

#### Pre-build
- [ ] Clean build folder: `xcodebuild clean`
- [ ] Clear derived data: `rm -rf ~/Library/Developer/Xcode/DerivedData`
- [ ] Pod install: `cd ios && pod install`
- [ ] Verify scheme is set to Release
- [ ] Verify correct provisioning profile selected

#### Build Archive
```bash
# Using Expo/EAS (recommended)
eas build --platform ios --profile production

# Or using Xcode
xcodebuild -workspace ios/FlowState.xcworkspace \
  -scheme FlowState \
  -configuration Release \
  -archivePath build/FlowState.xcarchive \
  archive
```
- [ ] Archive builds successfully
- [ ] No compiler warnings in release build
- [ ] Archive size is reasonable (< 200MB recommended)

#### Upload to App Store Connect
```bash
# Using EAS
eas submit --platform ios

# Or using Xcode Organizer
# Window > Organizer > Distribute App > App Store Connect
```
- [ ] Binary uploaded successfully
- [ ] No upload errors or warnings
- [ ] Build appears in App Store Connect

### TestFlight Review

#### Internal Testing
- [ ] Build available for internal testers (automatic)
- [ ] Internal testers invited (up to 100)
- [ ] Test notes/instructions provided
- [ ] Internal testing completed

#### External Testing
- [ ] Beta App Review information completed
- [ ] Test information provided:
  - [ ] Contact email
  - [ ] Test account credentials (if needed)
  - [ ] Testing instructions
- [ ] Submit for Beta App Review
- [ ] Beta App Review passed (usually < 24 hours)
- [ ] External tester groups created
- [ ] External testers invited (up to 10,000)
- [ ] Public link enabled (optional)
- [ ] Build expiration noted (90 days)

#### TestFlight Feedback
- [ ] Feedback email configured
- [ ] Crash reports monitored
- [ ] Screenshots from testers reviewed
- [ ] Beta feedback addressed

---

## 4. Android Release (Play Store)

### Google Play Console Setup

- [ ] Google Play Developer account active ($25 one-time)
- [ ] Account identity verification completed
- [ ] Developer contact information updated
- [ ] Team members added with appropriate permissions
- [ ] Payment profile set up (for paid apps/IAP)

### App Creation in Play Console

- [ ] Create new app in Play Console
- [ ] App name set (30 character limit)
- [ ] Default language selected
- [ ] App or game type selected
- [ ] Free or paid status set
- [ ] Declarations completed:
  - [ ] App access (login required?)
  - [ ] Ads declaration
  - [ ] Content rating questionnaire
  - [ ] Target audience and content
  - [ ] News app declaration
  - [ ] COVID-19 app declaration (if applicable)
  - [ ] Data safety form completed

### Signing Key Generation

#### Option A: Google-managed signing (Recommended)
- [ ] Opt into Play App Signing
- [ ] Upload key generated by Google
- [ ] Download upload key certificate
- [ ] Store upload keystore securely

#### Option B: Self-managed signing
```bash
# Generate keystore
keytool -genkey -v -keystore flowstate-release.keystore \
  -alias flowstate -keyalg RSA -keysize 2048 -validity 10000
```
- [ ] Release keystore generated
- [ ] Keystore password stored securely (password manager)
- [ ] Key alias and password documented
- [ ] Keystore backed up in secure location
- [ ] Keystore NEVER committed to version control

#### Configure Gradle Signing
- [ ] `android/gradle.properties` configured (for local builds):
```properties
MYAPP_UPLOAD_STORE_FILE=flowstate-release.keystore
MYAPP_UPLOAD_KEY_ALIAS=flowstate
MYAPP_UPLOAD_STORE_PASSWORD=*****
MYAPP_UPLOAD_KEY_PASSWORD=*****
```
- [ ] `android/app/build.gradle` signing config added
- [ ] CI/CD environment variables configured

### Store Listing Preparation

#### Main Store Listing
- [ ] Short description (80 characters)
- [ ] Full description (4000 characters)
- [ ] Screenshots uploaded:
  - [ ] Phone screenshots (min 2, max 8)
  - [ ] 7-inch tablet (if applicable)
  - [ ] 10-inch tablet (if applicable)
- [ ] Feature graphic (1024x500)
- [ ] App icon (512x512) - auto-pulled from APK
- [ ] Video URL (optional, YouTube)

#### Categorization
- [ ] Application type selected
- [ ] Category selected
- [ ] Tags added (up to 5)
- [ ] Contact email provided
- [ ] Contact phone provided (optional)
- [ ] Contact website provided

### Internal/Closed Testing Track

#### Internal Testing (up to 100 testers)
- [ ] Create internal testing track
- [ ] Add internal testers by email
- [ ] Or create Google Group for testers

#### Closed Testing (unlimited testers)
- [ ] Create closed testing track
- [ ] Configure tester access:
  - [ ] Email list upload, or
  - [ ] Google Groups link
- [ ] Set up feedback channel
- [ ] Enable pre-registration (optional)

### Build Submission Steps

#### Pre-build
- [ ] Clean project: `cd android && ./gradlew clean`
- [ ] Verify versionCode incremented
- [ ] Verify versionName updated
- [ ] Verify minimum SDK version correct

#### Build AAB (Android App Bundle)
```bash
# Using Expo/EAS (recommended)
eas build --platform android --profile production

# Or using Gradle
cd android && ./gradlew bundleRelease
```
- [ ] Build completes successfully
- [ ] AAB file generated at `android/app/build/outputs/bundle/release/`
- [ ] AAB size is reasonable

#### Build APK (for direct distribution)
```bash
cd android && ./gradlew assembleRelease
```
- [ ] APK generated (optional, for testing)

#### Upload to Play Console
- [ ] Navigate to Release > Testing > Internal testing
- [ ] Create new release
- [ ] Upload AAB file
- [ ] Release name set (usually version number)
- [ ] Release notes added
- [ ] Review release summary
- [ ] Roll out to internal testing

### Play Store Review

#### Pre-launch Report
- [ ] Review pre-launch report (automatic testing)
- [ ] Address any crashes found
- [ ] Address any accessibility issues
- [ ] Review screenshots on various devices
- [ ] Check for security vulnerabilities

#### Staged Rollout (for production)
- [ ] Start with limited rollout (5-10%)
- [ ] Monitor crash rate
- [ ] Monitor ANR rate
- [ ] Gradually increase rollout percentage
- [ ] Full rollout after stability confirmed

#### Promote to Production
- [ ] All testing tracks validated
- [ ] Production release created
- [ ] Review pending (usually 1-3 days for new apps)
- [ ] Review approved
- [ ] App live on Play Store

---

## 5. Post-Release

### Monitoring Crash Reports

#### iOS (Xcode Organizer / App Store Connect)
- [ ] Monitor Crashes section in App Store Connect
- [ ] Set up crash alerts
- [ ] Review crash logs daily for first week
- [ ] Symbolicate crash reports
- [ ] Prioritize crashes by frequency
- [ ] Document and triage critical crashes

#### Android (Play Console)
- [ ] Monitor Android Vitals dashboard
- [ ] Review crash clusters
- [ ] Check ANR (Application Not Responding) rate
- [ ] Target: < 1.09% crash rate
- [ ] Target: < 0.47% ANR rate
- [ ] Set up email alerts for crash spikes

#### Third-party Monitoring (Recommended)
- [ ] Set up Sentry/Bugsnag/Crashlytics
- [ ] Configure source maps for JavaScript errors
- [ ] Configure dSYMs upload for iOS native crashes
- [ ] Configure ProGuard mapping for Android
- [ ] Set up Slack/email alerts
- [ ] Create dashboard for key metrics

### User Feedback Collection

#### In-App Feedback
- [ ] Implement in-app feedback mechanism
- [ ] Add "Rate this app" prompt (after positive interactions)
- [ ] Provide "Report a bug" option
- [ ] Include contact support option

#### App Store Reviews
- [ ] Monitor App Store reviews daily
- [ ] Respond to negative reviews promptly (< 24 hours)
- [ ] Thank positive reviewers
- [ ] Track review sentiment over time
- [ ] Document common complaints for backlog

#### Play Store Reviews
- [ ] Monitor Play Store reviews daily
- [ ] Use Play Console reply feature
- [ ] Track rating changes
- [ ] Address common issues in updates

#### External Channels
- [ ] Monitor support email
- [ ] Monitor social media mentions
- [ ] Track community forum discussions
- [ ] Collect feedback from beta testers

### Hotfix Procedures

#### Hotfix Criteria
- [ ] Define severity levels:
  - **P0**: App crash on launch, data loss - immediate hotfix
  - **P1**: Major feature broken - hotfix within 24-48 hours
  - **P2**: Minor feature issue - next regular release
  - **P3**: Cosmetic issue - backlog

#### Hotfix Process
- [ ] Create hotfix branch from release tag: `git checkout -b hotfix/vX.Y.Z`
- [ ] Implement minimal fix (avoid feature changes)
- [ ] Run full test suite
- [ ] Code review (expedited but required)
- [ ] Increment patch version (X.Y.Z+1)
- [ ] Update changelog with hotfix notes
- [ ] Build and submit to stores
- [ ] Request expedited review (if critical):
  - iOS: Use "Request Expedited Review" in App Store Connect
  - Android: Contact Play Console support

#### Post-Hotfix
- [ ] Merge hotfix branch to main
- [ ] Tag release in git
- [ ] Communicate fix to affected users
- [ ] Document root cause for postmortem

### Analytics Review

#### Key Metrics to Track
- [ ] Daily/Weekly/Monthly Active Users (DAU/WAU/MAU)
- [ ] Session count and duration
- [ ] Feature adoption rates
- [ ] Retention rates (Day 1, Day 7, Day 30)
- [ ] Conversion funnels (onboarding completion)
- [ ] Crash-free users percentage
- [ ] App load time
- [ ] BLE connection success rate
- [ ] Session completion rate

#### Analytics Tools
- [ ] Firebase Analytics configured
- [ ] Custom events tracked for key actions
- [ ] User properties set for segmentation
- [ ] Funnels defined for critical paths
- [ ] Dashboards created for daily review

#### Weekly Review Process
- [ ] Review analytics dashboard
- [ ] Compare metrics to previous release
- [ ] Identify any negative trends
- [ ] Document insights for product team
- [ ] Plan improvements based on data

---

## Release Sign-off

### Final Approval Checklist

| Role | Name | Sign-off Date | Signature |
|------|------|---------------|-----------|
| Engineering Lead | | | [ ] |
| QA Lead | | | [ ] |
| Product Manager | | | [ ] |
| Design Lead | | | [ ] |

### Release Information

| Field | Value |
|-------|-------|
| Version | |
| Build Number (iOS) | |
| Version Code (Android) | |
| Release Date | |
| Release Branch | |
| Release Tag | |

---

## Appendix

### Useful Commands

```bash
# Check current version
node -p "require('./package.json').version"

# Bump version (using npm)
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Build iOS (Expo/EAS)
eas build --platform ios --profile production

# Build Android (Expo/EAS)
eas build --platform android --profile production

# Submit iOS
eas submit --platform ios

# Submit Android
eas submit --platform android

# Run tests
npm test
npm run test:e2e

# Generate changelog (if using conventional commits)
npx conventional-changelog -p angular -i CHANGELOG.md -s
```

### Reference Links

- [Apple App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy Center](https://play.google.com/about/developer-content-policy/)
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Release Documentation](https://reactnative.dev/docs/publishing-to-app-store)
- [TestFlight Documentation](https://developer.apple.com/testflight/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

### Emergency Contacts

| Role | Contact | Phone/Slack |
|------|---------|-------------|
| Engineering On-call | | |
| DevOps/Release Engineer | | |
| Product Manager | | |

---

*Last Updated: January 2025*
*Document Version: 1.0*
