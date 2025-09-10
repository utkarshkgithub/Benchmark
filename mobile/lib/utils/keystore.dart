import 'package:flutter/services.dart';

class Keystore {
  static const _channel = MethodChannel('com.iiitbh.benchmark/keystore');

  /// Get the public key (Base64-encoded)
  static Future<String> getPublicKey() async {
    try {
      final pubKey = await _channel.invokeMethod<String>('getPublicKey');
      return pubKey!;
    } catch (e) {
      throw Exception('Failed to get public key: $e');
    }
  }

  /// Sign a nonce (input and output are Base64-encoded)
  static Future<String> sign(String base64Nonce) async {
    try {
      final signature = await _channel.invokeMethod<String>('sign', {
        "nonce": base64Nonce,
      });
      return signature!;
    } catch (e) {
      throw Exception('Failed to sign nonce: $e');
    }
  }

  /// Generate attestation key with server challenge
  static Future<Map<String, dynamic>> generateAttestationKey(
    String challengeBase64,
  ) async {
    try {
      final result = await _channel.invokeMethod<Map<Object?, Object?>>(
        'generateAttestationKey',
        {"challenge": challengeBase64},
      );
      return Map<String, dynamic>.from(result!);
    } catch (e) {
      throw Exception('Failed to generate attestation key: $e');
    }
  }

  /// Get device fingerprint
  static Future<String> getDeviceFingerprint() async {
    try {
      final fingerprint = await _channel.invokeMethod<String>(
        'getDeviceFingerprint',
      );
      return fingerprint!;
    } catch (e) {
      throw Exception('Failed to get device fingerprint: $e');
    }
  }

  /// Get hardware identifiers string
  static Future<String> getHardwareIdentifiers() async {
    try {
      final identifiers = await _channel.invokeMethod<String>(
        'getHardwareIdentifiers',
      );
      return identifiers!;
    } catch (e) {
      throw Exception('Failed to get hardware identifiers: $e');
    }
  }

  /// Get enhanced device identification
  static Future<Map<String, dynamic>> getEnhancedDeviceId() async {
    try {
      final publicKey = await getPublicKey();
      final deviceFingerprint = await getDeviceFingerprint();
      final hardwareIdentifiers = await getHardwareIdentifiers();

      return {
        'enhancedDeviceId': hardwareIdentifiers,
        'publicKey': publicKey,
        'deviceFingerprint': deviceFingerprint,
        'timestamp': DateTime.now().toIso8601String(),
      };
    } catch (e) {
      throw Exception('Failed to get enhanced device ID: $e');
    }
  }
}
