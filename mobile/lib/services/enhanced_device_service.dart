import 'dart:developer';
import 'dart:io';
import 'dart:async';
import 'package:geolocator/geolocator.dart';
import 'package:safe_device/safe_device.dart';
import 'package:app_security/app_security.dart';
import '../utils/keystore.dart';
import '../utils/device_id_helper.dart';

class EnhancedDeviceService {
  /// Get a comprehensive device identification using both legacy and enhanced methods
  static Future<Map<String, dynamic>> getComprehensiveDeviceId() async {
    try {
      log(
        'EnhancedDeviceService: Getting comprehensive device identification...',
      );

      // Get legacy device ID (fallback)
      final legacyDeviceId = await DeviceIdHelper.getDeviceId();
      final deviceInfo = await DeviceIdHelper.getDeviceInfo();

      Map<String, dynamic> result = {
        'legacyDeviceId': legacyDeviceId,
        'platform': Platform.operatingSystem,
        'deviceInfo': deviceInfo,
        'enhancementAvailable': false,
      };

      // Try to get enhanced device identification (Android only for now)
      if (Platform.isAndroid) {
        try {
          final enhancedData = await Keystore.getEnhancedDeviceId();
          result.addAll({
            'enhancedDeviceId': enhancedData['enhancedDeviceId'],
            'publicKey': enhancedData['publicKey'],
            'deviceFingerprint': enhancedData['deviceFingerprint'],
            'enhancementAvailable': true,
            'timestamp': enhancedData['timestamp'],
          });
          log('EnhancedDeviceService: Enhanced device ID available');
        } catch (e) {
          log(
            'EnhancedDeviceService: Enhanced features not available, using legacy: $e',
          );
          // Enhanced features not available, continue with legacy
        }
      } else {
        log(
          'EnhancedDeviceService: Platform ${Platform.operatingSystem} - using legacy device ID',
        );
      }

      return result;
    } catch (e) {
      log('EnhancedDeviceService: Error in comprehensive device ID: $e');
      rethrow;
    }
  }

  /// Get the best available device ID (enhanced if available, otherwise legacy)
  static Future<String> getBestDeviceId() async {
    try {
      final comprehensive = await getComprehensiveDeviceId();

      if (comprehensive['enhancementAvailable'] == true) {
        log('EnhancedDeviceService: Using enhanced device ID');
        return comprehensive['enhancedDeviceId'] as String;
      } else {
        log('EnhancedDeviceService: Using legacy device ID');
        return comprehensive['legacyDeviceId'] as String;
      }
    } catch (e) {
      log('EnhancedDeviceService: Error getting best device ID: $e');
      rethrow;
    }
  }

  /// Generate attestation for server challenge (Android only)
  static Future<Map<String, dynamic>?> generateAttestation(
    String serverChallenge,
  ) async {
    if (!Platform.isAndroid) {
      log('EnhancedDeviceService: Attestation only available on Android');
      return null;
    }

    try {
      log(
        'EnhancedDeviceService: Generating attestation for server challenge...',
      );
      final attestationData = await Keystore.generateAttestationKey(
        serverChallenge,
      );
      log('EnhancedDeviceService: Attestation generated successfully');
      return attestationData;
    } catch (e) {
      log('EnhancedDeviceService: Error generating attestation: $e');
      return null;
    }
  }

  /// Get device registration payload for signup/login
  static Future<Map<String, dynamic>> getDeviceRegistrationPayload({
    String? serverChallenge,
  }) async {
    try {
      log('EnhancedDeviceService: Creating device registration payload...');

      final comprehensive = await getComprehensiveDeviceId();
      final additionalDeviceInfo =
          await DeviceIdHelper.getAdditionalDeviceInfo();

      Map<String, dynamic> payload = {
        'deviceId':
            comprehensive['legacyDeviceId'], // Always use legacy device ID as deviceId
        'platform': comprehensive['platform'],
        'deviceType': comprehensive['enhancementAvailable'] == true
            ? 'enhanced'
            : 'legacy',
        'deviceInfo': comprehensive['deviceInfo'],
        'AdditionalDeviceInfo': additionalDeviceInfo,
      };

      // Add enhanced data if available
      if (comprehensive['enhancementAvailable'] == true) {
        payload.addAll({
          'enhancedDeviceId': comprehensive['enhancedDeviceId'],
          'legacyDeviceId': comprehensive['legacyDeviceId'],
          'publicKey': comprehensive['publicKey'],
          'deviceFingerprint': comprehensive['deviceFingerprint'],
        });

        // Add attestation if server challenge is provided
        if (serverChallenge != null && serverChallenge.isNotEmpty) {
          final attestation = await generateAttestation(serverChallenge);
          if (attestation != null) {
            payload['attestation'] = attestation;
          }
        }
      }

      log('EnhancedDeviceService: Device registration payload created');
      return payload;
    } catch (e) {
      log('EnhancedDeviceService: Error creating registration payload: $e');
      rethrow;
    }
  }

  /// Validate location security before allowing QR scanner
  static Future<Map<String, dynamic>> validateLocationSecurity() async {
    try {
      // Use the secure location service with additional timeout wrapper
      Position
      position = await SecureLocationService.getCurrentLocation().timeout(
        Duration(seconds: 45),
        onTimeout: () {
          throw Exception(
            'Location request timed out: Please ensure GPS is enabled and try in an open area',
          );
        },
      );

      // Check location accuracy (if too inaccurate, might be spoofed)
      if (position.accuracy > 100) {
        // More than 100 meters accuracy is suspicious
        return {
          'isValid': false,
          'error':
              'Location accuracy too low. Please ensure GPS is enabled and you\'re in an open area.',
          'errorCode': 'LOW_ACCURACY',
          'accuracy': position.accuracy,
        };
      }

      return {
        'isValid': true,
        'position': position,
        'accuracy': position.accuracy,
        'message': 'Location security validation passed',
      };
    } catch (e) {
      // Debug logging to see what error we're getting
      print('DEBUG: Location validation error: $e');
      print('DEBUG: Error type: ${e.runtimeType}');

      if (e is LocationSecurityException) {
        return {
          'isValid': false,
          'error': e.message,
          'errorCode': 'SECURITY_THREAT',
        };
      }

      // Handle specific location timeout errors
      String errorMessage = e.toString().toLowerCase();
      print('DEBUG: Error message lowercase: $errorMessage');

      if (errorMessage.contains('timeout') ||
          errorMessage.contains('future not completed') ||
          errorMessage.contains('location request timed out') ||
          errorMessage.contains('gps signal not available')) {
        print('DEBUG: Detected as timeout error');
        return {
          'isValid': false,
          'error':
              'Location request timed out. Please ensure GPS is enabled and try again in an open area.',
          'errorCode': 'LOCATION_TIMEOUT',
        };
      }

      return {
        'isValid': false,
        'error': 'Failed to validate location security: $e',
        'errorCode': 'VALIDATION_ERROR',
      };
    }
  }

  /// Get secure current location
  static Future<Position> getCurrentLocation() async {
    try {
      return await SecureLocationService.getCurrentLocation();
    } catch (e) {
      throw Exception('Failed to get current location: $e');
    }
  }

  /// Check if app is cloned using app_security package
  static Future<bool> isAppCloned() async {
    try {
      bool isCloned = await AppSecurity.isClonedApp();
      print('Is app cloned? $isCloned');
      return isCloned;
    } catch (e) {
      print('Clone detection failed: $e');
      return false; // Assume not cloned if detection fails
    }
  }

  /// Comprehensive security validation (combines location and clone detection)
  static Future<Map<String, dynamic>> validateComprehensiveSecurity() async {
    try {
      // Check for cloned app first
      bool isCloned = await isAppCloned();
      if (isCloned) {
        return {
          'isValid': false,
          'error': 'App appears to be running in a cloned environment',
          'errorCode': 'APP_CLONED',
        };
      }

      // If not cloned, proceed with location security validation
      return await validateLocationSecurity();
    } catch (e) {
      return {
        'isValid': false,
        'error': 'Security validation failed: $e',
        'errorCode': 'VALIDATION_ERROR',
      };
    }
  }
}

/// Custom exception for location security issues
class LocationSecurityException implements Exception {
  final String message;
  LocationSecurityException(this.message);

  @override
  String toString() => 'LocationSecurityException: $message';
}

/// Secure location service with comprehensive security checks
class SecureLocationService {
  static Future<Position> getCurrentLocation() async {
    try {
      // Ensure location permissions are granted first (required for mock detection)
      await _checkLocationPermissions();

      // Multi-layer security check
      bool isSafeForLocation = await _performSecurityChecks();

      if (!isSafeForLocation) {
        throw LocationSecurityException(
          'Security threat detected: GPS spoofing, rooted device, or developer mode enabled',
        );
      }

      // Get location with high accuracy and longer timeout
      Position position;
      try {
        position = await Geolocator.getCurrentPosition(
          locationSettings: LocationSettings(
            accuracy: LocationAccuracy.high,
            timeLimit: Duration(seconds: 30), // Increased timeout
          ),
        );
      } on TimeoutException catch (e) {
        throw Exception(
          'Location request timed out: ${e.message ?? "GPS signal not available"}',
        );
      } catch (e) {
        // Handle other geolocator exceptions
        String errorMsg = e.toString().toLowerCase();
        if (errorMsg.contains('timeout') ||
            errorMsg.contains('future not completed')) {
          throw Exception(
            'Location request timed out: Please ensure GPS is enabled and try in an open area',
          );
        }
        throw Exception('Failed to get location: $e');
      }

      // Final fallback check using geolocator's built-in detection
      if (position.isMocked) {
        throw LocationSecurityException(
          'Mock location detected in position data',
        );
      }

      return position;
    } catch (e) {
      throw Exception('Failed to get secure location: $e');
    }
  }

  static Future<bool> _performSecurityChecks() async {
    try {
      // First check if app is cloned using app_security package
      bool isCloned = await AppSecurity.isClonedApp();
      if (isCloned) {
        print('🚨 Clone detected by app_security package');
        return false;
      }

      // Check if running on real device first
      bool isRealDevice = await SafeDevice.isRealDevice;

      if (!isRealDevice) {
        // Development mode - bypass some checks for emulators/simulators
        print(
          '⚠️ Running on emulator - bypassing some security checks for development',
        );
        return await _performSecurityChecksWithDevBypass();
      }

      // Full security checks on real devices
      bool isMockLocation = await SafeDevice.isMockLocation;

      // Use the aggregated safety check
      bool isSafeDevice = await SafeDevice.isSafeDevice;

      // Log details for debugging if unsafe
      if (!isSafeDevice) {
        await _logSecurityDetails();
      }

      return isSafeDevice && !isMockLocation && isRealDevice && !isCloned;
    } catch (e) {
      print('Security check failed: $e');
      return false; // Assume unsafe if checks fail
    }
  }

  static Future<bool> _performSecurityChecksWithDevBypass() async {
    try {
      // For development/testing - bypass emulator checks
      bool isRealDevice = await SafeDevice.isRealDevice;

      if (!isRealDevice) {
        print(
          '⚠️ Running on emulator - bypassing some security checks for development',
        );
        // Only check critical security issues, not emulator-related ones
        bool isMockLocation = await SafeDevice.isMockLocation;
        return !isMockLocation;
      }

      // Full security checks on real devices
      return await SafeDevice.isSafeDevice;
    } catch (e) {
      print('Development security check failed: $e');
      return true; // Be lenient in development mode
    }
  }

  static Future<void> _logSecurityDetails() async {
    try {
      // Get detailed breakdown for debugging
      if (Platform.isAndroid) {
        Map<String, dynamic> rootDetails =
            await SafeDevice.rootDetectionDetails;
        print('Root detection details: $rootDetails');
      }

      if (Platform.isIOS) {
        Map<String, dynamic> jailbreakDetails =
            await SafeDevice.jailbreakDetails;
        print('Jailbreak detection details: $jailbreakDetails');
      }
    } catch (e) {
      print('Failed to get security details: $e');
    }
  }

  static Future<void> _checkLocationPermissions() async {
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        throw Exception(
          'Location permissions are required for secure location detection',
        );
      }
    }

    if (permission == LocationPermission.deniedForever) {
      throw Exception('Location permissions are permanently denied');
    }
  }
}
