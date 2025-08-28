# Multi-Page Registration System with Modern Device UUID & Location Tracking

This Flutter application implements a comprehensive 3-page user registration system with OTP verification, **modern persistent device identification**, and location tracking capabilities.

## 🆕 **Modern Device Identification Approach**

### Why UUID + flutter_secure_storage?

This implementation uses the **most reliable and modern approach** for device identification:

#### ✅ **Persistent Across App Lifecycle**
- **iOS**: Stored in **iOS Keychain** - survives app deletion and reinstallation
- **Android**: Stored in **Android Keystore** with encrypted preferences - often restored via Auto Backup
- **Cross-Platform**: Same UUID persists regardless of platform differences

#### ✅ **Privacy-Friendly**
- Generated UUID is **not tied to device hardware**
- No access to sensitive device identifiers required
- Complies with privacy regulations (GDPR, CCPA)
- User controls the identifier (can be reset if needed)

#### ✅ **Reliable & Unique**
- **UUID v4** ensures uniqueness across millions of devices
- Not affected by factory resets or OS updates
- Independent of platform-specific identifier limitations
- Works consistently across all device types

### Technical Implementation

```dart
// Modern UUID approach - RECOMMENDED
static Future<String> getDeviceId() async {
  // Check if UUID already exists in secure storage
  String? existingUuid = await _secureStorage.read(key: _deviceUuidKey);
  
  if (existingUuid != null && existingUuid.isNotEmpty) {
    return existingUuid; // Return existing UUID
  }
  
  // Generate new UUID and store securely
  String newUuid = _uuid.v4();
  await _secureStorage.write(key: _deviceUuidKey, value: newUuid);
  
  return newUuid;
}
```

### Storage Security Details

#### iOS - Keychain Integration
```dart
iOptions: IOSOptions(
  accessibility: KeychainAccessibility.first_unlock_this_device,
  synchronizable: false, // Don't sync across devices
)
```

#### Android - Keystore Integration  
```dart
aOptions: AndroidOptions(
  encryptedSharedPreferences: true,
  keyCipherAlgorithm: KeyCipherAlgorithm.RSA_ECB_PKCS1Padding,
  storageCipherAlgorithm: StorageCipherAlgorithm.AES_GCM_NoPadding,
)
```

## Features Implemented

### 📱 Page 1: User Registration Form
- **First Name** - Text input (mandatory)
- **Last Name** - Text input (mandatory) 
- **Email ID** - Text input with email validation (mandatory, unique)
- **Password** - Masked password input (mandatory)
- **Confirm Password** - Must match the password field
- **Account Type** - Dropdown with options: Student, Faculty, Admin
- **Next Button** - Validates form and moves to OTP verification

### 🔐 Page 2: OTP Verification
- **OTP Field** - 6-digit numeric input (mandatory)
- **Verify Button** - Validates OTP and proceeds to student details
- **Resend OTP** - Option to resend verification code

### 🎓 Page 3: Student Details
- **Roll Number** - Text input (mandatory, unique for each student)
- **Branch** - Dropdown with options:
  - CSE (Computer Science & Engineering)
  - ECE (Electronics & Communication Engineering) 
  - MNC (Mathematics & Computing)
  - Mechatronics Engineering
- **Semester** - Dropdown with options 1-8
- **Submit Button** - Completes registration and redirects to home page

## 🔧 Technical Implementation

### Dependencies Added
```yaml
dependencies:
  device_info_plus: ^10.1.0        # For device hardware information
  geolocator: ^12.0.0              # For GPS location tracking
  http: ^1.2.1                     # For backend API calls
  flutter_secure_storage: ^9.2.2   # For secure persistent UUID storage
  uuid: ^4.5.1                     # For generating unique device identifiers
```

### Modern Device & Location Services

#### Persistent Device UUID Generation
```dart
// Get or generate persistent device UUID
final String deviceId = await DeviceService.getDeviceId();

// Check if device is already initialized
final bool isInitialized = await DeviceService.isDeviceInitialized();

// Get registration information
final Map<String, dynamic>? regInfo = await DeviceService.getDeviceRegistrationInfo();

// Reset UUID if needed (for testing or manual reset)
final String newUuid = await DeviceService.resetDeviceId();
```

#### Legacy Device ID Support
```dart
// Get platform-specific device ID (for comparison/migration)
final String legacyId = await DeviceService.getLegacyDeviceId();
```

#### GPS Location Tracking
```dart
// Get current location with permissions
Position position = await Geolocator.getCurrentPosition();
double latitude = position.latitude;
double longitude = position.longitude;
double accuracy = position.accuracy;
```

#### Backend Integration
```dart
// Send attendance data to backend
final response = await http.post(
  Uri.parse('https://your-backend.com/mark-attendance'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'username': 'student_username',
    'password': 'student_password', 
    'deviceId': deviceId,
    'latitude': latitude,
    'longitude': longitude,
    'accuracy': accuracy,
  }),
);
```

## 📁 File Structure

```
lib/
├── main.dart                     # App entry point
├── screens/
│   ├── signup_screen.dart        # 3-page registration flow
│   ├── home_screen.dart          # Home page with welcome message
│   ├── attendance_screen.dart    # Device & location demo
│   ├── login_screen.dart         # Login functionality
│   └── forgot_password_screen.dart
├── services/
│   ├── device_service.dart       # Modern UUID + device & location utilities
│   └── auth_service.dart         # Authentication services
├── providers/
│   └── auth_provider.dart        # State management
└── utils/
    └── auth_utils.dart           # Authentication utilities
```

## 🔑 Key Features

### Multi-Page Navigation
- **Progress Indicator** - Shows current step (1/3, 2/3, 3/3)
- **Form Validation** - Each page validates before proceeding
- **State Persistence** - Form data maintained across pages

### Modern Device Registration
- **Persistent UUID** - Survives app deletion and reinstallation
- **Secure Storage** - iOS Keychain / Android Keystore integration
- **Privacy-Friendly** - Not tied to device hardware identifiers
- **Cross-Platform** - Consistent behavior across iOS and Android
- **Registration Tracking** - Stores creation date and device info

### Location Services
- **Permission Handling** - Requests location permissions
- **High Accuracy GPS** - Gets precise location coordinates
- **Location Validation** - Checks if user is within allowed area

### Security Features
- **Email Validation** - Ensures proper email format
- **Password Matching** - Confirms password consistency
- **OTP Verification** - Two-factor authentication
- **Device Binding** - Associates user with specific device

## 🚀 Getting Started

### 1. Install Dependencies
```bash
flutter pub get
```

### 2. Configure Permissions

#### Android (android/app/src/main/AndroidManifest.xml)
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### iOS (ios/Runner/Info.plist)
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>This app needs location access to mark attendance and verify your location.</string>
```

### 3. Run the Application
```bash
flutter run
```

## 🎯 Usage Flow

1. **Registration**: User fills out 3-page registration form
2. **OTP Verification**: User enters 6-digit verification code
3. **Student Details**: User provides academic information
4. **Device Registration**: App automatically captures device ID and location
5. **Home Page**: User sees welcome message and can access attendance features

## 📍 Home Page Features

After successful registration, users see:
- **Welcome Card** - Personalized greeting with user info
- **Registration Success** - Confirmation message with next steps
- **Feature Grid** - Quick access to:
  - Profile management
  - Attendance tracking (with device/location demo)
  - Analytics dashboard
  - Settings panel

## 🔧 Backend Integration

The app is designed to work with your backend API. Update the following URLs in `DeviceService`:

```dart
// Replace with your actual backend endpoints
static const String attendanceUrl = 'https://your-backend.com/mark-attendance';
static const String deviceValidationUrl = 'https://your-backend.com/validate-device';
static const String deviceRegistrationUrl = 'https://your-backend.com/register-device';
```

## 📊 Attendance Tracking Demo

The app includes a demonstration screen showing:
- **Device Information** - Model, brand, platform details with UUID
- **GPS Coordinates** - Real-time location with accuracy
- **Attendance Marking** - Simulated backend integration with modern UUID
- **Data Refresh** - Update device and location info
- **UUID Management** - Reset device identifier for testing

## 🔄 **UUID vs Legacy Device ID Comparison**

| Feature | Modern UUID Approach | Legacy Device ID |
|---------|---------------------|------------------|
| **Persistence** | ✅ Survives app deletion | ❌ Lost on app deletion |
| **Privacy** | ✅ Generated UUID, privacy-friendly | ⚠️ May use hardware identifiers |
| **Reliability** | ✅ Consistent across platforms | ❌ Platform-dependent behavior |
| **Security** | ✅ Stored in secure system storage | ⚠️ May be accessible to other apps |
| **Control** | ✅ User can reset if needed | ❌ Tied to device hardware |
| **Compliance** | ✅ GDPR/CCPA friendly | ⚠️ May require additional privacy considerations |

## 🔧 **Migration from Legacy IDs**

If you're migrating from legacy device IDs:

```dart
// Check if user has legacy device registration
final String legacyId = await DeviceService.getLegacyDeviceId();
final String modernId = await DeviceService.getDeviceId();

// Migrate user data from legacy ID to modern UUID
await migrateUserData(legacyId, modernId);
```

## 🛡️ Security Considerations

- All sensitive data is transmitted via HTTPS
- Device IDs are unique but not personally identifiable
- Location data is only collected with user permission
- OTP verification adds an extra security layer
- Form validation prevents malformed data submission

## 📱 Platform Support

- ✅ **Android** - Full device ID and location support
- ✅ **iOS** - Full device ID and location support  
- ⚠️ **Web** - Limited device information available
- ⚠️ **Desktop** - Basic functionality without location

## 🔄 Future Enhancements

- **Biometric Authentication** - Fingerprint/Face ID support
- **Offline Mode** - Cache registration data when offline
- **Push Notifications** - Real-time attendance reminders
- **QR Code Scanning** - Alternative attendance marking method
- **Analytics Dashboard** - Detailed attendance statistics

---

**Note**: Replace placeholder URLs and credentials with your actual backend endpoints and authentication system.
