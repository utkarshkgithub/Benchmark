import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import '../utils/network_logger.dart';
import '../utils/logger.dart';
import '../providers/auth_provider.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  static final String? _backendUrl = dotenv.env['BACKEND_URL'];
  MobileScannerController cameraController = MobileScannerController();
  bool _isProcessing = false;

  @override
  void dispose() {
    cameraController.dispose();
    super.dispose();
  }

  Future<void> _sendQRDataToEndpoint(String qrData) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);

    try {
      // Get the auth token from the provider
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;

      if (token == null) {
        throw Exception('No authentication token found. Please log in again.');
      }

      // Parse QR data as JSON
      Map<String, dynamic> qrJson;
      try {
        qrJson = jsonDecode(qrData);
        AppLogger.info('QR Code parsed successfully', qrJson);
      } catch (e) {
        // If not valid JSON, wrap it in a JSON object
        qrJson = {'qr_data': qrData, 'raw': true};
        AppLogger.warning('QR Code is not valid JSON, wrapping it', qrJson);
      }

      // Send POST request to backend with auth header
      final uri = Uri.parse('$_backendUrl/api/v1/subject/verifyqrcode');
      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      };

      NetworkLogger.logRequest(
        method: 'POST',
        url: uri,
        headers: headers,
        body: jsonEncode(qrJson),
      );

      final start = DateTime.now();
      final response = await http.post(
        uri,
        headers: headers,
        body: jsonEncode(qrJson),
      );

      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (mounted) {
        // Show response in dialog
        _showResponseDialog(response);
      }
    } catch (e) {
      AppLogger.error('Error sending QR data to endpoint', e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  void _showResponseDialog(http.Response response) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Response (${response.statusCode})'),
        content: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Status: ${response.statusCode}',
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              const Text(
                'Response Body:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.grey[100],
                  borderRadius: BorderRadius.circular(4),
                ),
                child: SelectableText(
                  response.body,
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                ),
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Close'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              // Restart scanner
              cameraController.start();
            },
            child: const Text('Scan Again'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('QR Code Scanner'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.flash_on),
            onPressed: () => cameraController.toggleTorch(),
            tooltip: 'Toggle Flash',
          ),
          IconButton(
            icon: const Icon(Icons.flip_camera_ios),
            onPressed: () => cameraController.switchCamera(),
            tooltip: 'Switch Camera',
          ),
        ],
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: cameraController,
            onDetect: (capture) {
              if (_isProcessing) return;

              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                final String? qrData = barcode.rawValue;
                if (qrData != null && qrData.isNotEmpty) {
                  AppLogger.info('QR Code detected', qrData);
                  cameraController.stop();
                  _sendQRDataToEndpoint(qrData);
                  break;
                }
              }
            },
          ),
          // Overlay with scanning instructions
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.symmetric(horizontal: 24),
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Text(
                    'Point your camera at a QR code',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'The QR data will be sent to the backend for verification',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                    textAlign: TextAlign.center,
                  ),
                  if (_isProcessing) ...[
                    const SizedBox(height: 16),
                    const CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'Processing...',
                      style: TextStyle(color: Colors.white),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}