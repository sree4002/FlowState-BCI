# FlowState BCI Privacy Policy

**Last Updated:** January 24, 2026

**Effective Date:** January 24, 2026

---

## 1. Introduction

FlowState BCI ("FlowState," "the App," "we," "us," or "our") is a brain-computer interface application designed to help users monitor and enhance their cognitive focus through EEG-based theta wave monitoring and audio entrainment. This Privacy Policy explains how we collect, use, store, and protect your personal information when you use our mobile application.

We are committed to protecting your privacy and ensuring transparency about our data practices. This policy is designed to comply with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable privacy laws.

By using FlowState BCI, you acknowledge that you have read and understood this Privacy Policy.

---

## 2. Data Collection

### 2.1 EEG and Brainwave Data

FlowState BCI collects electroencephalography (EEG) data from compatible BLE (Bluetooth Low Energy) headband and earpiece devices. This data includes:

- **Raw EEG signals** sampled at 250-500 Hz
- **Processed theta wave power** (4-8 Hz frequency band)
- **Alpha wave power** (8-13 Hz frequency band)
- **Beta wave power** (13-30 Hz frequency band)
- **Z-score normalized values** relative to your personal baseline
- **Signal quality metrics**

**Important:** All EEG data processing occurs locally on your device. Raw brainwave data is never transmitted to external servers.

### 2.2 Session History

We store information about your entrainment sessions locally on your device, including:

- Session date, time, and duration
- Entrainment frequency and volume settings
- Average and maximum theta z-scores achieved
- Signal quality averages
- Subjective ratings you provide (1-5 scale)
- Optional session notes

### 2.3 Calibration Data

When you calibrate the app, we collect and store:

- Baseline theta, alpha, and beta mean values
- Standard deviation measurements
- Peak theta frequency
- Optimal entrainment frequency
- Calibration quality score
- Calibration timestamp

### 2.4 Device Information

To ensure proper functionality, we collect:

- BLE device identifiers (for pairing purposes)
- Device battery level
- Connection quality (RSSI values)
- Firmware version of connected devices

### 2.5 App Usage Data

The App collects basic usage information stored locally:

- Onboarding completion status
- Feature preferences and settings
- Session scheduling preferences
- Notification preferences

### 2.6 Analytics Data (Optional)

If you opt in to anonymous analytics, we may collect:

- App crash reports and error logs
- General usage patterns (feature usage frequency)
- Performance metrics

This data is anonymized and cannot be used to identify you personally. You can disable analytics at any time in Settings.

---

## 3. Data Storage

### 3.1 Local Storage

All user data is stored locally on your device using:

- **SQLite Database:** Session history, calibration baselines, and circadian patterns
- **AsyncStorage:** User preferences, device pairing information, and app settings

### 3.2 Data Retention

Your data remains on your device until you choose to delete it. We do not automatically delete your historical data unless you:

- Manually clear your session history
- Use the "Clear all data" option in Settings
- Uninstall the application

### 3.3 No Cloud Storage

FlowState BCI does not upload your EEG data, session history, or personal information to cloud servers. Your brainwave data stays on your device.

---

## 4. Data Sharing

### 4.1 Default Behavior

By default, FlowState BCI does **not** share any of your personal data, EEG recordings, or session history with third parties.

### 4.2 User-Initiated Exports

You may choose to export your data in the following formats:

- **CSV:** Session summaries for spreadsheet analysis
- **JSON:** Complete profile data including settings and history
- **EDF (European Data Format):** Raw EEG data for research or medical purposes

When you export data, you control where it is shared. FlowState is not responsible for data once it leaves the application through user-initiated exports.

### 4.3 Third-Party Integrations (Optional)

If you choose to connect third-party services (such as Todoist or Notion), limited data may be shared according to those services' privacy policies. You can disconnect integrations at any time.

---

## 5. Third-Party Services

### 5.1 Crash Reporting (Sentry)

We use Sentry for crash reporting and error monitoring to improve app stability. Sentry may collect:

- Device type and operating system version
- App version
- Crash stack traces and error messages
- Anonymous session identifiers

Sentry does **not** have access to your EEG data, session history, or personal information. For more information, see [Sentry's Privacy Policy](https://sentry.io/privacy/).

### 5.2 BLE Device Manufacturers

When you connect a compatible EEG device, data transmission occurs directly between your device and the FlowState app via Bluetooth. We do not share data with device manufacturers.

---

## 6. User Rights

### 6.1 Right to Access

You can view all data collected by FlowState BCI within the app:

- Session history in the History tab
- Calibration data in Settings
- All stored preferences in Settings

### 6.2 Right to Export (Data Portability)

You have the right to export your data at any time:

1. Navigate to **Settings > Data Management**
2. Select your preferred export format (CSV, JSON, or EDF)
3. Choose a destination for your exported file

### 6.3 Right to Delete (Right to Erasure)

You can delete your data at any time:

1. **Delete individual sessions:** Swipe to delete in the History tab
2. **Clear all session history:** Settings > Data Management > Clear History
3. **Delete all data:** Settings > Data Management > Clear All Data
4. **Complete removal:** Uninstalling the app removes all locally stored data

### 6.4 Right to Rectification

You can edit session notes and subjective ratings through the session detail view.

### 6.5 Right to Restrict Processing

You can disable specific features:

- Disable analytics in Settings > Privacy
- Disable notifications in Settings > Notifications
- Disconnect third-party integrations in Settings > Integrations

### 6.6 CCPA-Specific Rights (California Residents)

California residents have additional rights under CCPA:

- **Right to Know:** Request information about data collection practices
- **Right to Delete:** Request deletion of personal information
- **Right to Opt-Out:** We do not sell personal information
- **Right to Non-Discrimination:** We do not discriminate against users who exercise their privacy rights

To exercise these rights, contact us using the information provided in Section 10.

---

## 7. Children's Privacy

FlowState BCI is **not intended for use by children under the age of 13** (or 16 in the European Economic Area).

We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately so we can take appropriate action.

If we discover that we have inadvertently collected information from a child under the applicable age, we will promptly delete such information.

---

## 8. Security

### 8.1 Data Protection Measures

We implement appropriate technical and organizational measures to protect your data:

- **Local Storage Encryption:** Data stored on your device is protected by your device's native encryption (when enabled)
- **Secure BLE Communication:** Bluetooth connections use standard BLE security protocols
- **No Network Transmission:** EEG data is processed locally and never transmitted over networks
- **Minimal Data Collection:** We only collect data necessary for app functionality

### 8.2 Your Responsibilities

To help protect your data:

- Enable device passcode/biometric authentication
- Keep your device's operating system updated
- Be cautious when exporting and sharing data files
- Review permissions granted to third-party integrations

### 8.3 Security Incident Response

In the unlikely event of a security incident affecting your data, we will:

- Investigate the incident promptly
- Notify affected users within 72 hours (as required by GDPR)
- Take appropriate measures to prevent future incidents

---

## 9. Changes to This Policy

We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors.

### 9.1 Notification of Changes

When we make material changes to this policy:

- We will update the "Last Updated" date at the top of this document
- We will display an in-app notification alerting you to the changes
- For significant changes, we may require you to review and acknowledge the updated policy

### 9.2 Continued Use

Your continued use of FlowState BCI after changes to this Privacy Policy constitutes acceptance of the updated terms.

### 9.3 Previous Versions

You may request previous versions of this Privacy Policy by contacting us.

---

## 10. Contact Information

If you have questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:

**FlowState BCI Privacy Team**

- **Email:** privacy@flowstate-bci.com
- **Address:** [Company Address Placeholder]
- **Website:** [Website URL Placeholder]

### 10.1 Data Protection Officer

For GDPR-related inquiries, you may contact our Data Protection Officer:

- **Email:** dpo@flowstate-bci.com

### 10.2 Supervisory Authority

If you are located in the European Economic Area and believe we have not adequately addressed your concerns, you have the right to lodge a complaint with your local data protection supervisory authority.

### 10.3 Response Time

We will respond to privacy-related inquiries within:

- **30 days** for general inquiries
- **30 days** for GDPR data subject requests (extendable by 60 days for complex requests)
- **45 days** for CCPA requests (extendable by 45 days when necessary)

---

## 11. Additional Information

### 11.1 Legal Basis for Processing (GDPR)

We process your data based on the following legal grounds:

- **Consent:** For optional analytics and third-party integrations
- **Contract Performance:** For providing core app functionality
- **Legitimate Interests:** For improving app stability and user experience

### 11.2 International Data Transfers

As all data is stored locally on your device, international data transfers do not apply to core app functionality. If you enable crash reporting, anonymized data may be processed by Sentry's servers, which comply with applicable data protection requirements.

### 11.3 Automated Decision-Making

FlowState BCI uses automated processing to:

- Calculate optimal entrainment frequencies based on your calibration data
- Suggest session times based on circadian patterns
- Adjust entrainment parameters based on real-time theta levels

These automated processes are designed to enhance your experience and do not produce legal effects or similarly significant effects on you.

---

*This Privacy Policy is provided in accordance with GDPR Article 13 and 14, CCPA Section 1798.100, and other applicable privacy regulations.*

**FlowState BCI - Empowering Your Focus**
