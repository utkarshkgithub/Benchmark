import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'dart:convert';
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';

import '../utils/logger.dart';
import '../providers/auth_provider.dart';

class QRScannerScreen extends StatefulWidget {
  const QRScannerScreen({super.key});

  @override
  State<QRScannerScreen> createState() => _QRScannerScreenState();
}

class _QRScannerScreenState extends State<QRScannerScreen> {
  static final String? _backendUrl = dotenv.env['BACKEND_URL'];
  final MobileScannerController cameraController = MobileScannerController();
  bool _isProcessing = false;

  // Zoom-related variables
  // FIXED: Set a default zoom range since the API no longer provides it.
  static const double _minZoom = 0.0;
  static const double _maxZoom = 1.0;
  double _currentZoom = _minZoom;
  Timer? _zoomDebounceTimer;
  bool _isZoomInitialized = false;

  @override
  void initState() {
    super.initState();
    // This listener will check when the camera is ready to enable the zoom slider.
    cameraController.addListener(_onCameraStateChanged);
  }

  @override
  void dispose() {
    cameraController.removeListener(_onCameraStateChanged);
    _zoomDebounceTimer?.cancel();
    cameraController.dispose();
    super.dispose();
  }

  // CORRECTED: This listener now just checks if the camera is ready.
  void _onCameraStateChanged() {
    // FIXED: Type is non-nullable as per the warning.
    final scannerState = cameraController.value;

    // Once the camera is running and we haven't initialized, show the slider.
    if (scannerState.isRunning && !_isZoomInitialized) {
      if (mounted) {
        setState(() {
          _isZoomInitialized = true;
        });
        // Important: Remove the listener after we're done to avoid unnecessary rebuilds.
        cameraController.removeListener(_onCameraStateChanged);
      }
    }
  }

  void _updateZoom(double zoomValue) {
    if (!_isZoomInitialized) return;
    setState(() {
      _currentZoom = zoomValue;
    });

    _zoomDebounceTimer?.cancel();
    _zoomDebounceTimer = Timer(const Duration(milliseconds: 100), () {
      cameraController.setZoomScale(zoomValue);
    });
  }

  Future<void> _sendQRDataToEndpoint(String qrData) async {
    if (_isProcessing) return;
    setState(() => _isProcessing = true);

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;

      if (token == null) {
        throw Exception('No authentication token found. Please log in again.');
      }

      Map<String, dynamic> qrJson;
      try {
        qrJson = jsonDecode(qrData);
      } catch (e) {
        qrJson = {'qr_data': qrData, 'raw': true};
      }

      final uri = Uri.parse('$_backendUrl/api/v1/subject/verifyqrcode');
      final headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer $token',
      };

      final response = await http.post(
        uri,
        headers: headers,
        body: jsonEncode(qrJson),
      );

      if (mounted) {
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
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        setState(() => _isProcessing = false);
      }
    }
  }

  void _showResponseDialog(http.Response response) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text('Response (${response.statusCode})'),
        content: SingleChildScrollView(
          child: SelectableText(
            'Status: ${response.statusCode}\n\n${response.body}',
            style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
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

              final String? qrData = capture.barcodes.first.rawValue;
              if (qrData != null && qrData.isNotEmpty) {
                cameraController.stop();
                _sendQRDataToEndpoint(qrData);
              }
            },
          ),
          if (_isZoomInitialized)
            Positioned(
              right: 16,
              top: MediaQuery.of(context).size.height * 0.2,
              bottom: MediaQuery.of(context).size.height * 0.3,
              child: Container(
                width: 60,
                padding: const EdgeInsets.symmetric(vertical: 8),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.6),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.zoom_in, color: Colors.white, size: 20),
                    Expanded(
                      child: RotatedBox(
                        quarterTurns: 3,
                        child: Slider(
                          value: _currentZoom,
                          min: _minZoom,
                          max: _maxZoom,
                          onChanged: _updateZoom,
                          activeColor: Colors.deepPurple,
                          inactiveColor: Colors.grey,
                          thumbColor: Colors.white,
                        ),
                      ),
                    ),
                    const Icon(Icons.zoom_out, color: Colors.white, size: 20),
                  ],
                ),
              ),
            ),
          Positioned(
            bottom: 100,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              margin: const EdgeInsets.symmetric(horizontal: 24),
              decoration: BoxDecoration(
                color: Colors.black.withOpacity(0.7),
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
                  if (_isProcessing) ...[
                    const SizedBox(height: 16),
                    const CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
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