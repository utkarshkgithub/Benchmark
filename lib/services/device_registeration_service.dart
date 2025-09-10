import 'dart:convert';
import '../utils/keystore.dart';

class DeviceRegistrationService {
  
  static Future<Map<String, dynamic>> registerDevice({
    required String userId,
    String? serverChallenge,
  }) async {
    try {
      // Get basic device data
      final deviceData = await Keystore.getEnhancedDeviceId();
      
      // Prepare registration payload
      Map<String, dynamic> payload = {
        'userId': userId,
        'deviceId': deviceData['enhancedDeviceId'],
        'publicKey': deviceData['publicKey'],
        'deviceFingerprint': deviceData['deviceFingerprint'],
        'timestamp': deviceData['timestamp'],
      };
      
      // Add attestation if server challenge provided
      if (serverChallenge != null && serverChallenge.isNotEmpty) {
        final attestation = await Keystore.generateAttestationKey(serverChallenge);
        payload['attestation'] = attestation;
      }
      
      return payload;
    } catch (e) {
      throw Exception('Device registration failed: $e');
    }
  }
  
  static Future<String> authenticateWithServer(String nonce) async {
    try {
      // Sign the server nonce
      final signature = await Keystore.sign(nonce);
      return signature;
    } catch (e) {
      throw Exception('Authentication failed: $e');
    }
  }
}
