import 'package:device_info_plus/device_info_plus.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:uuid/uuid.dart';
import 'dart:convert';
import 'dart:io';
import '../utils/network_logger.dart';

class DeviceService {
  static final DeviceInfoPlugin _deviceInfo = DeviceInfoPlugin();

  // Secure storage instance for persistent UUID storage
  static const FlutterSecureStorage _secureStorage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true, // Use encrypted shared preferences
      keyCipherAlgorithm: KeyCipherAlgorithm.RSA_ECB_PKCS1Padding,
      storageCipherAlgorithm: StorageCipherAlgorithm.AES_GCM_NoPadding,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock_this_device,
      groupId: null, // Use default keychain group
      synchronizable: false, // Don't sync across devices
    ),
  );

  // Storage key for the persistent device UUID
  static const String _deviceUuidKey = 'device_persistent_uuid';
  static const String _deviceRegistrationKey = 'device_registration_info';

  // UUID generator instance
  static const Uuid _uuid = Uuid();

  /// Get or generate a persistent unique device identifier
  /// This is the RECOMMENDED approach for device identification
  ///
  /// This method:
  /// - First checks if a UUID already exists in secure storage
  /// - If not found, generates a new UUID v4 and stores it securely
  /// - On iOS: Stored in Keychain (survives app deletion)
  /// - On Android: Stored in encrypted preferences (survives app deletion with Auto Backup)
  /// - Returns the same UUID across app sessions and reinstalls
  static Future<String> getDeviceId() async {
    try {
      // Try to get existing UUID from secure storage
      String? existingUuid = await _secureStorage.read(key: _deviceUuidKey);

      if (existingUuid != null && existingUuid.isNotEmpty) {
        // UUID already exists, return it
        return existingUuid;
      }

      // No existing UUID found, generate a new one
      String newUuid = _uuid.v4();

      // Store the new UUID securely
      await _secureStorage.write(key: _deviceUuidKey, value: newUuid);

      // Also store device registration info for reference
      final deviceInfo = await getDeviceInfo();
      await _secureStorage.write(
        key: _deviceRegistrationKey,
        value: jsonEncode({
          'uuid': newUuid,
          'createdAt': DateTime.now().toIso8601String(),
          'platform': deviceInfo['platform'],
          'model': deviceInfo['model'],
          'systemVersion':
              deviceInfo['systemVersion'] ?? deviceInfo['androidVersion'],
        }),
      );

      return newUuid;
    } catch (e) {
      throw Exception('Failed to get or generate device UUID: $e');
    }
  }

  /// Get the legacy platform-specific device identifier (for comparison/migration)
  /// This method is kept for backward compatibility but NOT recommended for new implementations
  static Future<String> getLegacyDeviceId() async {
    try {
      if (Platform.isAndroid) {
        final AndroidDeviceInfo androidInfo = await _deviceInfo.androidInfo;
        return androidInfo.id; // This is the ANDROID_ID
      } else if (Platform.isIOS) {
        final IosDeviceInfo iosInfo = await _deviceInfo.iosInfo;
        return iosInfo.identifierForVendor ?? 'unknown_ios_device';
      } else {
        return 'unknown_platform';
      }
    } catch (e) {
      throw Exception('Failed to get legacy device ID: $e');
    }
  }

  /// Reset device UUID (useful for testing or manual device reset)
  /// WARNING: This will generate a new UUID, effectively "unregistering" the device
  static Future<String> resetDeviceId() async {
    try {
      // Delete existing UUID
      await _secureStorage.delete(key: _deviceUuidKey);
      await _secureStorage.delete(key: _deviceRegistrationKey);

      // Generate and return new UUID
      return await getDeviceId();
    } catch (e) {
      throw Exception('Failed to reset device UUID: $e');
    }
  }

  /// Get device registration information from secure storage
  static Future<Map<String, dynamic>?> getDeviceRegistrationInfo() async {
    try {
      String? registrationData = await _secureStorage.read(
        key: _deviceRegistrationKey,
      );
      if (registrationData != null) {
        return jsonDecode(registrationData) as Map<String, dynamic>;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  /// Check if this device has been initialized (has a UUID)
  static Future<bool> isDeviceInitialized() async {
    try {
      String? existingUuid = await _secureStorage.read(key: _deviceUuidKey);
      return existingUuid != null && existingUuid.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  /// Get detailed device information
  static Future<Map<String, dynamic>> getDeviceInfo() async {
    try {
      // Get the persistent device UUID
      final String deviceUuid = await getDeviceId();
      final Map<String, dynamic>? registrationInfo =
          await getDeviceRegistrationInfo();

      if (Platform.isAndroid) {
        final AndroidDeviceInfo androidInfo = await _deviceInfo.androidInfo;
        return {
          'platform': 'Android',
          'deviceId': deviceUuid, // Use persistent UUID
          'legacyDeviceId': androidInfo.id, // Keep legacy ID for reference
          'model': androidInfo.model,
          'brand': androidInfo.brand,
          'manufacturer': androidInfo.manufacturer,
          'androidVersion': androidInfo.version.release,
          'sdkInt': androidInfo.version.sdkInt,
          'isPhysicalDevice': androidInfo.isPhysicalDevice,
          'systemVersion': androidInfo.version.release,
          'registrationInfo': registrationInfo,
        };
      } else if (Platform.isIOS) {
        final IosDeviceInfo iosInfo = await _deviceInfo.iosInfo;
        return {
          'platform': 'iOS',
          'deviceId': deviceUuid, // Use persistent UUID
          'legacyDeviceId':
              iosInfo.identifierForVendor ??
              'unknown', // Keep legacy ID for reference
          'model': iosInfo.model,
          'name': iosInfo.name,
          'systemName': iosInfo.systemName,
          'systemVersion': iosInfo.systemVersion,
          'isPhysicalDevice': iosInfo.isPhysicalDevice,
          'registrationInfo': registrationInfo,
        };
      } else {
        return {
          'platform': 'Unknown',
          'deviceId': deviceUuid,
          'registrationInfo': registrationInfo,
        };
      }
    } catch (e) {
      throw Exception('Failed to get device info: $e');
    }
  }

  /// Check if location services are enabled and request permissions
  static Future<bool> checkLocationPermissions() async {
    try {
      // Check if location services are enabled
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception(
          'Location services are disabled. Please enable location services.',
        );
      }

      // Check location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception(
          'Location permissions are permanently denied. Please enable them in app settings.',
        );
      }

      return true;
    } catch (e) {
      rethrow;
    }
  }

  /// Get current location with high accuracy
  static Future<Position> getCurrentLocation() async {
    try {
      await checkLocationPermissions();

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
        timeLimit: const Duration(seconds: 10),
      );
    } catch (e) {
      throw Exception('Failed to get current location: $e');
    }
  }

  /// Get location with custom settings
  static Future<Position> getLocationWithSettings({
    LocationAccuracy accuracy = LocationAccuracy.high,
    Duration? timeLimit,
  }) async {
    try {
      await checkLocationPermissions();

      return await Geolocator.getCurrentPosition(
        desiredAccuracy: accuracy,
        timeLimit: timeLimit ?? const Duration(seconds: 15),
      );
    } catch (e) {
      throw Exception('Failed to get location: $e');
    }
  }

  /// Mark attendance with device and location data
  static Future<bool> markAttendance({
    required String username,
    required String password,
    String? backendUrl,
  }) async {
    try {
      // Get device ID and location
      final String deviceId = await getDeviceId();
      final Position position = await getCurrentLocation();
      final Map<String, dynamic> deviceInfo = await getDeviceInfo();

      // Prepare data for backend
      final attendanceData = {
        'username': username,
        'password': password,
        'deviceId': deviceId,
        'latitude': position.latitude,
        'longitude': position.longitude,
        'accuracy': position.accuracy,
        'timestamp': DateTime.now().toIso8601String(),
        'deviceInfo': deviceInfo,
        'altitude': position.altitude,
        'heading': position.heading,
        'speed': position.speed,
        'speedAccuracy': position.speedAccuracy,
      };

      // Send to backend (replace with your actual backend URL)
      final String apiUrl =
          backendUrl ?? 'https://your-backend.com/mark-attendance';

      final uri = Uri.parse(apiUrl);
      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      NetworkLogger.logRequest(
        method: 'POST',
        url: uri,
        headers: headers,
        body: jsonEncode(attendanceData),
      );
      final start = DateTime.now();
      final response = await http.post(
        uri,
        headers: headers,
        body: jsonEncode(attendanceData),
      );
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      } else {
        throw Exception(
          'Failed to mark attendance: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      throw Exception('Attendance marking failed: $e');
    }
  }

  /// Validate device for attendance (check if device is registered)
  static Future<bool> validateDevice({
    required String deviceId,
    required String userId,
    String? backendUrl,
  }) async {
    try {
      final String apiUrl =
          backendUrl ?? 'https://your-backend.com/validate-device';

      final uri = Uri.parse(apiUrl);
      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      final body = jsonEncode({'deviceId': deviceId, 'userId': userId});
      NetworkLogger.logRequest(
        method: 'POST',
        url: uri,
        headers: headers,
        body: body,
      );
      final start = DateTime.now();
      final response = await http.post(uri, headers: headers, body: body);
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        return responseData['isValid'] ?? false;
      } else {
        return false;
      }
    } catch (e) {
      throw Exception('Device validation failed: $e');
    }
  }

  /// Register device for a user
  static Future<bool> registerDevice({
    required String userId,
    required String deviceName,
    String? backendUrl,
  }) async {
    try {
      final String deviceId = await getDeviceId();
      final Map<String, dynamic> deviceInfo = await getDeviceInfo();

      final String apiUrl =
          backendUrl ?? 'https://your-backend.com/register-device';

      final uri = Uri.parse(apiUrl);
      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      final body = jsonEncode({
        'userId': userId,
        'deviceId': deviceId,
        'deviceName': deviceName,
        'deviceInfo': deviceInfo,
        'registrationTime': DateTime.now().toIso8601String(),
      });
      NetworkLogger.logRequest(
        method: 'POST',
        url: uri,
        headers: headers,
        body: body,
      );
      final start = DateTime.now();
      final response = await http.post(uri, headers: headers, body: body);
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return true;
      } else {
        throw Exception(
          'Failed to register device: ${response.statusCode} - ${response.body}',
        );
      }
    } catch (e) {
      throw Exception('Device registration failed: $e');
    }
  }

  /// Calculate distance between two coordinates
  static double calculateDistance(
    double lat1,
    double lon1,
    double lat2,
    double lon2,
  ) {
    return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
  }

  /// Check if user is within allowed location for attendance
  static bool isWithinAllowedLocation({
    required Position currentPosition,
    required double allowedLatitude,
    required double allowedLongitude,
    double radiusInMeters = 100.0,
  }) {
    final double distance = calculateDistance(
      currentPosition.latitude,
      currentPosition.longitude,
      allowedLatitude,
      allowedLongitude,
    );

    return distance <= radiusInMeters;
  }
}
