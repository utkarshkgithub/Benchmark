import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:http/http.dart' as http;
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:convert';
import 'dart:async';

import '../utils/logger.dart';
import '../providers/auth_provider.dart';
import '../services/enhanced_device_service.dart';

class ReusableQRScanner extends StatefulWidget {
  final String endpoint;
  final String title;
  final VoidCallback? onSuccess;
  final VoidCallback? onError;

  const ReusableQRScanner({
    super.key,
    required this.endpoint,
    this.title = 'QR Code Scanner',
    this.onSuccess,
    this.onError,
  });

  @override
  State<ReusableQRScanner> createState() => _ReusableQRScannerState();
}

class _ReusableQRScannerState extends State<ReusableQRScanner> {
  static final String? _backendUrl = dotenv.env['BACKEND_URL'];
  final MobileScannerController cameraController = MobileScannerController();
  bool _isProcessing = false;
  bool _isSecurityValidating = true;
  bool _isSecurityValid = false;
  String? _securityError;

  // Target coordinates for location validation (same as student screen)
  //target location
  static const double targetLatitude = 25.259149; 
  static const double targetLongitude = 87.040193;
  static const double maxDistanceAllowed = 2060.0; 

  // Zoom-related variables
  static const double _minZoom = 0.0;
  static const double _maxZoom = 1.0;
  double _currentZoom = _minZoom;
  Timer? _zoomDebounceTimer;
  bool _isZoomInitialized = false;

  @override
  void initState() {
    super.initState();
    _validateLocationSecurity();
  }

  /// Validate location security before allowing QR scanning
  Future<void> _validateLocationSecurity() async {
    try {
      // Add timeout to prevent hanging - but preserve all existing logic
      await Future.any([
        _performSecurityValidation(),
        Future.delayed(Duration(seconds: 30)).then((_) => throw TimeoutException('Security validation timed out', Duration(seconds: 30))),
      ]);
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Failed to validate security: $e';
        if (e is TimeoutException) {
          errorMessage = 'Location validation timed out. Please check your GPS signal and try again.';
        }
        
        safeSetState(() {
          _isSecurityValidating = false;
          _isSecurityValid = false;
          _securityError = errorMessage;
        });

        _showSecurityErrorDialog({
          'error': errorMessage,
          'errorCode': e is TimeoutException ? 'TIMEOUT_ERROR' : 'VALIDATION_ERROR',
        });
      }
    }
  }

  /// Perform the actual security validation (extracted to add timeout wrapper)
  Future<void> _performSecurityValidation() async {
    // First, validate comprehensive security (clone detection, GPS spoofing, etc.)
    final securityResult =
        await EnhancedDeviceService.validateComprehensiveSecurity();

    if (!securityResult['isValid']) {
      if (mounted) {
        safeSetState(() {
          _isSecurityValidating = false;
          _isSecurityValid = false;
          _securityError = securityResult['error'];
        });
        _showSecurityErrorDialog(securityResult);
      }
      return;
    }

    // If security validation passed, check location distance
    await _checkLocationDistance(securityResult);
  }

  /// Check if user is within allowed distance from target coordinates
  Future<void> _checkLocationDistance(
    Map<String, dynamic> securityResult,
  ) async {
    try {
      // Add timeout to location distance check - preserve existing logic
      await Future.any([
        _performLocationDistanceCheck(securityResult),
        Future.delayed(Duration(seconds: 15)).then((_) => throw TimeoutException('Location distance check timed out', Duration(seconds: 15))),
      ]);
    } catch (e) {
      if (mounted) {
        String errorMessage = 'Failed to check location distance: $e';
        if (e is TimeoutException) {
          errorMessage = 'Location check timed out. Please ensure GPS is enabled and try again.';
        }
        
        safeSetState(() {
          _isSecurityValidating = false;
          _isSecurityValid = false;
          _securityError = errorMessage;
        });

        _showSecurityErrorDialog({
          'error': errorMessage,
          'errorCode': e is TimeoutException ? 'TIMEOUT_ERROR' : 'LOCATION_ERROR',
        });
      }
    }
  }

  /// Perform the actual location distance check (extracted to add timeout wrapper)
  Future<void> _performLocationDistanceCheck(
    Map<String, dynamic> securityResult,
  ) async {
    // Get current position from security result (already validated and secure)
    final position = securityResult['position'];

    if (position == null) {
      throw Exception('Unable to get current location');
    }

    // Calculate distance to target coordinates
    double distanceInMeters = Geolocator.distanceBetween(
      position.latitude,
      position.longitude,
      targetLatitude,
      targetLongitude,
    );

    if (mounted) {
      safeSetState(() {
        _isSecurityValidating = false;
      });

      if (distanceInMeters <= maxDistanceAllowed) {
        // User is within allowed range
        safeSetState(() {
          _isSecurityValid = true;
        });
        // Initialize camera listener after all validations pass
        cameraController.addListener(_onCameraStateChanged);
      } else {
        // User is too far away
        safeSetState(() {
          _isSecurityValid = false;
          _securityError = 'You are too far from the allowed location';
        });

        _showLocationErrorDialog(distanceInMeters);
      }
    }
  }

  /// Show location distance error dialog
  void _showLocationErrorDialog(double distanceInMeters) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Row(
            children: [
              Icon(Icons.location_off, color: Colors.orange),
              SizedBox(width: 8),
              Text('Location Alert'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'You are too far from the required location:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              // SizedBox(height: 8),
              // Text('Distance: ${distanceInMeters.toStringAsFixed(0)} meters'),
              // Text(
              //   'Maximum allowed: ${maxDistanceAllowed.toStringAsFixed(0)} meters',
              // ),
              SizedBox(height: 12),
              Text('Please come within the class premises to scan QR codes.'),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
                Navigator.of(context).pop(); // Close scanner screen
              },
              child: Text('Close Scanner'),
            ),
          ],
        );
      },
    );
  }

  /// Show security error dialog and close scanner
  void _showSecurityErrorDialog(Map<String, dynamic> securityResult) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Row(
            children: [
              Icon(Icons.security, color: Colors.red),
              SizedBox(width: 8),
              Text('Security Alert'),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'QR Scanner cannot be used due to security concerns:',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              SizedBox(height: 8),
              Text(securityResult['error'] ?? 'Unknown security error'),
              if (securityResult['errorCode'] == 'SECURITY_THREAT') ...[
                SizedBox(height: 12),
                Text(
                  'Possible causes:',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                Text('• Mock location/GPS spoofing detected'),
                Text('• Rooted/jailbroken device'),
                Text('• Developer mode enabled'),
                Text('• Running in cloned app environment'),
              ],
              if (securityResult['errorCode'] == 'LOW_ACCURACY') ...[
                SizedBox(height: 12),
                Text('Please:', style: TextStyle(fontWeight: FontWeight.bold)),
                Text('• Enable GPS/Location services'),
                Text('• Move to an open area'),
                Text('• Restart the app and try again'),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(context).pop(); // Close dialog
                Navigator.of(context).pop(); // Close scanner screen
              },
              child: Text('Close Scanner'),
            ),
          ],
        );
      },
    );
  }

  @override
  void dispose() {
    cameraController.removeListener(_onCameraStateChanged);
    _zoomDebounceTimer?.cancel();
    cameraController.dispose();
    super.dispose();
  }

  void safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  void _onCameraStateChanged() {
    final scannerState = cameraController.value;

    if (scannerState.isRunning && !_isZoomInitialized) {
      if (mounted) {
        safeSetState(() {
          _isZoomInitialized = true;
        });
        cameraController.removeListener(_onCameraStateChanged);
      }
    }
  }

  void _updateZoom(double zoomValue) {
    if (!_isZoomInitialized) return;
    safeSetState(() {
      _currentZoom = zoomValue;
    });

    _zoomDebounceTimer?.cancel();
    _zoomDebounceTimer = Timer(const Duration(milliseconds: 100), () {
      cameraController.setZoomScale(zoomValue);
    });
  }

  Future<void> _sendQRDataToEndpoint(String qrData) async {
    if (_isProcessing) return;
    safeSetState(() => _isProcessing = true);

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

      // Fix double slash issue while preserving protocol slashes
      String cleanUrl = '$_backendUrl/${widget.endpoint}';
      // Only replace double slashes that are not part of https://
      cleanUrl = cleanUrl.replaceAll(RegExp(r'(?<!:)//'), '/');
      final uri = Uri.parse(cleanUrl);
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
      AppLogger.error('QR validation failed', e);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Invalid QR Code'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );

        cameraController.start();
      }
    } finally {
      await Future.delayed(const Duration(seconds: 2));
      if (mounted) {
        safeSetState(() => _isProcessing = false);
      }
    }
  }

  void _showResponseDialog(http.Response response) {
    try {
      // Check if response is JSON by checking content type or trying to parse
      if (response.headers['content-type']?.contains('application/json') == true) {
        final responseData = jsonDecode(response.body);
        final bool isSuccess = responseData['success'] ?? false;
        final String message = responseData['message'] ?? 'Unknown response';

        if (isSuccess) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: Colors.green,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 3),
              margin: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          );

          // Call success callback if provided
          widget.onSuccess?.call();

          // Navigate back after a short delay
          Future.delayed(const Duration(seconds: 2), () {
            if (mounted) {
              Navigator.of(context).pop();
            }
          });
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              backgroundColor: Colors.red,
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 3),
              margin: const EdgeInsets.all(16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
          );

          // Call error callback if provided
          widget.onError?.call();

          // Restart camera for another scan attempt
          cameraController.start();
        }
      } else {
        // Non-JSON response (HTML error page, etc.) - treat as invalid QR
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Invalid QR Code'),
            backgroundColor: Colors.red,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
            margin: const EdgeInsets.all(16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );

        widget.onError?.call();
        cameraController.start();
      }
    } catch (e) {
      // Fallback for any parsing errors - treat as invalid QR
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Invalid QR Code'),
          backgroundColor: Colors.red,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 3),
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        ),
      );

      widget.onError?.call();
      cameraController.start();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.title),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        actions: _isSecurityValid
            ? [
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
              ]
            : null,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    if (_isSecurityValidating) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Colors.deepPurple),
            ),
            SizedBox(height: 16),
            Text(
              'Validating Location Security...',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w500),
            ),
            SizedBox(height: 8),
            Text(
              'Please wait while we verify location integrity',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    if (!_isSecurityValid) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.security, size: 64, color: Colors.red),
            SizedBox(height: 16),
            Text(
              'Security Validation Failed',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.red,
              ),
            ),
            SizedBox(height: 8),
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 32),
              child: Text(
                _securityError ?? 'Unknown security error',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 14, color: Colors.grey[600]),
              ),
            ),
            SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text('Go Back'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      );
    }

    return _buildScanner();
  }

  Widget _buildScanner() {
    return Stack(
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
                color: Colors.black.withValues(alpha: 0.3),
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
              color: Colors.black.withValues(alpha: 0.3),
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
    );
  }
}
