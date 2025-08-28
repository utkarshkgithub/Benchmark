import 'package:device_info_plus/device_info_plus.dart';
import 'dart:io';
import 'dart:developer';

class DeviceIdHelper {
  /// Get device ID using device_info_plus for each platform
  static Future<String> getDeviceId() async {
    try {
      log('DeviceIdHelper: Starting device ID retrieval...');
      final DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();

      log('DeviceIdHelper: Platform detected: ${Platform.operatingSystem}');

      if (Platform.isAndroid) {
        log('DeviceIdHelper: Getting Android device info...');
        final AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
        final deviceId = androidInfo.id;
        log('DeviceIdHelper: Android device ID: $deviceId');
        return deviceId;
      } else if (Platform.isIOS) {
        log('DeviceIdHelper: Getting iOS device info...');
        final IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
        final deviceId = iosInfo.identifierForVendor ?? 'unknown-ios-device';
        log('DeviceIdHelper: iOS device ID: $deviceId');
        return deviceId;
      } else if (Platform.isLinux) {
        log('DeviceIdHelper: Getting Linux device info...');
        final LinuxDeviceInfo linuxInfo = await deviceInfo.linuxInfo;
        final deviceId = linuxInfo.machineId ?? 'unknown-linux-device';
        log('DeviceIdHelper: Linux device ID: $deviceId');
        return deviceId;
      } else if (Platform.isMacOS) {
        log('DeviceIdHelper: Getting macOS device info...');
        final MacOsDeviceInfo macInfo = await deviceInfo.macOsInfo;
        final deviceId = macInfo.systemGUID ?? 'unknown-macos-device';
        log('DeviceIdHelper: macOS device ID: $deviceId');
        return deviceId;
      } else if (Platform.isWindows) {
        log('DeviceIdHelper: Getting Windows device info...');
        final WindowsDeviceInfo windowsInfo = await deviceInfo.windowsInfo;
        final deviceId = windowsInfo.deviceId;
        log('DeviceIdHelper: Windows device ID: $deviceId');
        return deviceId;
      } else {
        final deviceId = 'unknown-platform-device';
        log('DeviceIdHelper: Unknown platform, using: $deviceId');
        return deviceId;
      }
    } catch (e, stackTrace) {
      // If all methods fail, generate a fallback ID
      final fallbackId =
          'fallback-device-${DateTime.now().millisecondsSinceEpoch}';
      log('DeviceIdHelper: Error occurred, using fallback ID: $fallbackId');
      log('DeviceIdHelper: Error details: $e');
      log('DeviceIdHelper: Stack trace: $stackTrace');
      return fallbackId;
    }
  }

  /// Get device information for debugging purposes
  static Future<Map<String, dynamic>> getDeviceInfo() async {
    try {
      final DeviceInfoPlugin deviceInfo = DeviceInfoPlugin();
      final String deviceId = await getDeviceId();

      if (Platform.isAndroid) {
        final AndroidDeviceInfo androidInfo = await deviceInfo.androidInfo;
        return {
          'deviceId': deviceId,
          'platform': 'Android',
          'model': androidInfo.model,
          'brand': androidInfo.brand,
          'version': androidInfo.version.release,
          'sdkInt': androidInfo.version.sdkInt,
          'manufacturer': androidInfo.manufacturer,
          'product': androidInfo.product,
        };
      } else if (Platform.isIOS) {
        final IosDeviceInfo iosInfo = await deviceInfo.iosInfo;
        return {
          'deviceId': deviceId,
          'platform': 'iOS',
          'model': iosInfo.model,
          'name': iosInfo.name,
          'systemVersion': iosInfo.systemVersion,
          'localizedModel': iosInfo.localizedModel,
        };
      } else {
        return {
          'deviceId': deviceId,
          'platform': Platform.operatingSystem,
          'model': 'Unknown',
          'version': Platform.operatingSystemVersion,
        };
      }
    } catch (e) {
      return {
        'deviceId': await getDeviceId(),
        'platform': Platform.operatingSystem,
        'error': e.toString(),
      };
    }
  }
}
