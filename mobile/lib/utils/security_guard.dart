import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';

class SecurityGuard {
  static final LocalAuthentication _auth = LocalAuthentication();
  static const _platform = MethodChannel('security_channel');

  /// Check device security and authenticate user with retry logic
  /// Returns true if authentication is successful
  static Future<bool> checkAndAuthenticate(
    BuildContext context, {
    int maxRetries = 3,
  }) async {
    try {
      // First check if device has screen lock (Android native check)
      final bool hasDeviceSecurity = await _isDeviceSecure();

      if (!hasDeviceSecurity) {
        _showSecurityRequiredDialog(context);
        return false;
      }

      // Check if authentication is available
      final bool canCheckBiometrics = await _auth.canCheckBiometrics;
      final bool isDeviceSupported = await _auth.isDeviceSupported();
      final bool canAuthenticate = canCheckBiometrics || isDeviceSupported;

      if (!canAuthenticate) {
        _showSecurityRequiredDialog(context);
        return false;
      }

      // Get available biometrics
      final List<BiometricType> availableBiometrics = await _auth
          .getAvailableBiometrics();

      // Check if biometric authentication is available
      final bool hasBiometrics = availableBiometrics.isNotEmpty;

      // Try biometric authentication first with retries
      if (hasBiometrics) {
        for (int attempt = 0; attempt < maxRetries; attempt++) {
          try {
            final bool authenticated = await _auth.authenticate(
              localizedReason: 'Please authenticate to access the app',
              biometricOnly: true, // Try biometric only first
            );

            if (authenticated) {
              return true;
            }
          } on PlatformException catch (e) {
            if (e.code == 'UserCancel' && attempt < maxRetries - 1) {
              // User canceled, retry
              continue;
            } else if (e.code == 'UserCancel' && attempt == maxRetries - 1) {
              // Max retries reached, fallback to device credentials
              break;
            } else {
              // Other errors, handle normally
              _handlePlatformException(context, e);
              return false;
            }
          }
        }

        // Fallback to device credentials (PIN/Pattern/Password)
        try {
          final bool authenticated = await _auth.authenticate(
            localizedReason:
                'Please use your device PIN, pattern, or password to continue',
            biometricOnly: false, // Allow PIN/pattern/password fallback
          );

          return authenticated;
        } on PlatformException catch (e) {
          _handlePlatformException(context, e);
          return false;
        }
      } else {
        // No biometrics available, use device credentials directly
        try {
          final bool authenticated = await _auth.authenticate(
            localizedReason: 'Please authenticate to access the app',
            biometricOnly: false,
          );

          return authenticated;
        } on PlatformException catch (e) {
          _handlePlatformException(context, e);
          return false;
        }
      }
    } catch (e) {
      _showErrorDialog(context, 'Security check failed: $e');
      return false;
    }
  }

  /// Check if device has secure lock screen (Android specific)
  static Future<bool> _isDeviceSecure() async {
    try {
      final bool isSecure = await _platform.invokeMethod('isDeviceSecure');
      return isSecure;
    } on PlatformException catch (e) {
      // If platform method fails, fall back to local_auth check
      debugPrint("Failed to check device security: ${e.message}");
      return true; // Assume secure to allow fallback auth
    } catch (e) {
      debugPrint("Unexpected error checking device security: $e");
      return true; // Assume secure to allow fallback auth
    }
  }

  /// Handle platform-specific exceptions
  static void _handlePlatformException(
    BuildContext context,
    PlatformException e,
  ) {
    String message;
    switch (e.code) {
      case 'NotAvailable':
        message =
            'Biometric authentication is not available on this device.\nPlease enable device security in Settings.';
        break;
      case 'NotEnrolled':
        message =
            'No biometric credentials are enrolled.\nPlease set up biometric authentication in Settings.';
        break;
      case 'LockedOut':
        message =
            'Biometric authentication is locked due to too many failed attempts.\nPlease try again later.';
        break;
      case 'PermanentlyLockedOut':
        message =
            'Biometric authentication is permanently locked.\nPlease use device credentials.';
        break;
      case 'BiometricOnlyNotSupported':
        message =
            'Biometric-only authentication is not supported on this device.';
        break;
      default:
        message = 'Authentication failed: ${e.message ?? 'Unknown error'}';
    }

    _showErrorDialog(context, message);
  }

  /// Show dialog when device security is required but not available
  static void _showSecurityRequiredDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Device Security Required'),
        content: const Text(
          'This app requires device screen lock (PIN/Pattern/Password/Biometric) to be enabled.\n\n'
          'Please enable it in your device Settings and restart the app.',
        ),
        actions: [
          TextButton(
            onPressed: () => SystemNavigator.pop(),
            child: const Text('Exit App'),
          ),
        ],
      ),
    );
  }

  /// Show generic error dialog
  static void _showErrorDialog(BuildContext context, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Text('Authentication Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => SystemNavigator.pop(),
            child: const Text('Exit App'),
          ),
        ],
      ),
    );
  }

  /// Check if biometric authentication is available
  static Future<bool> isBiometricAvailable() async {
    try {
      final bool canCheckBiometrics = await _auth.canCheckBiometrics;
      if (!canCheckBiometrics) return false;

      final List<BiometricType> availableBiometrics = await _auth
          .getAvailableBiometrics();
      return availableBiometrics.isNotEmpty;
    } catch (e) {
      return false;
    }
  }

  /// Get available biometric types
  static Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } catch (e) {
      return [];
    }
  }
}
