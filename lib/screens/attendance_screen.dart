import 'package:flutter/material.dart';
import '../services/device_service.dart';
import 'package:geolocator/geolocator.dart';

class AttendanceScreen extends StatefulWidget {
  const AttendanceScreen({super.key});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  bool _isLoading = false;
  String? _deviceId;
  String? _legacyDeviceId;
  Position? _currentLocation;
  Map<String, dynamic>? _deviceInfo;
  Map<String, dynamic>? _registrationInfo;
  String? _error;
  bool _isDeviceInitialized = false;

  @override
  void initState() {
    super.initState();
    _initializeDeviceInfo();
  }

  /// Safe setState that checks if widget is still mounted before calling setState
  void safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  Future<void> _initializeDeviceInfo() async {
    safeSetState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Check if device is already initialized
      final isInitialized = await DeviceService.isDeviceInitialized();

      // Get device ID (will generate new UUID if not exists)
      final deviceId = await DeviceService.getDeviceId();

      // Get legacy device ID for comparison
      final legacyDeviceId = await DeviceService.getLegacyDeviceId();

      // Get device info
      final deviceInfo = await DeviceService.getDeviceInfo();

      // Get registration info
      final registrationInfo = await DeviceService.getDeviceRegistrationInfo();

      // Get current location
      final location = await DeviceService.getCurrentLocation();

      safeSetState(() {
        _isDeviceInitialized = isInitialized;
        _deviceId = deviceId;
        _legacyDeviceId = legacyDeviceId;
        _deviceInfo = deviceInfo;
        _registrationInfo = registrationInfo;
        _currentLocation = location;
        _isLoading = false;
      });
    } catch (e) {
      safeSetState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _markAttendance() async {
    safeSetState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      // Example: Mark attendance using device service
      final success = await DeviceService.markAttendance(
        username: 'student_username', // Replace with actual username
        password: 'student_password', // Replace with actual password
        // backendUrl: 'https://your-backend.com/mark-attendance', // Optional custom URL
      );

      if (success) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Attendance marked successfully!'),
              backgroundColor: Colors.green,
            ),
          );
        }
      }
    } catch (e) {
      safeSetState(() {
        _error = 'Failed to mark attendance: $e';
      });
    } finally {
      safeSetState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _resetDeviceId() async {
    // Show confirmation dialog
    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Reset Device ID'),
          content: const Text(
            'This will generate a new device UUID. The device will need to be re-registered. Are you sure?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text('Reset'),
            ),
          ],
        );
      },
    );

    if (confirmed == true) {
      safeSetState(() {
        _isLoading = true;
        _error = null;
      });

      try {
        final newDeviceId = await DeviceService.resetDeviceId();
        await _initializeDeviceInfo(); // Refresh all data

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Device UUID reset successfully: ${newDeviceId.substring(0, 8)}...',
              ),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } catch (e) {
        safeSetState(() {
          _error = 'Failed to reset device ID: $e';
        });
      } finally {
        safeSetState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _refreshLocation() async {
    safeSetState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final location = await DeviceService.getCurrentLocation();
      safeSetState(() {
        _currentLocation = location;
        _isLoading = false;
      });
    } catch (e) {
      safeSetState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Attendance & Device Info'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Error Display
            if (_error != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  border: Border.all(color: Colors.red[300]!),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(_error!, style: TextStyle(color: Colors.red[700])),
              ),

            // Device Information Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(
                          Icons.phone_android,
                          color: Colors.deepPurple,
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Device Information',
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (_isLoading)
                      const Center(child: CircularProgressIndicator())
                    else if (_deviceInfo != null) ...[
                      // Modern UUID Device ID
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.green[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.green[200]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.verified,
                                  color: Colors.green[600],
                                  size: 16,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Persistent Device UUID',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.green[800],
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _deviceId ?? 'Unknown',
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                              ),
                            ),
                            if (_registrationInfo != null) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Created: ${DateTime.parse(_registrationInfo!['createdAt']).toLocal().toString().split(' ')[0]}',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: Colors.green[600],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),

                      // Legacy Device ID for comparison
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.orange[50],
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.orange[200]!),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Icon(
                                  Icons.warning,
                                  color: Colors.orange[600],
                                  size: 16,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Legacy Device ID (for reference)',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.orange[800],
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(
                              _legacyDeviceId ?? 'Unknown',
                              style: const TextStyle(
                                fontFamily: 'monospace',
                                fontSize: 11,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Device Information
                      _buildInfoRow(
                        'Platform',
                        _deviceInfo!['platform'] ?? 'Unknown',
                      ),
                      _buildInfoRow(
                        'Model',
                        _deviceInfo!['model'] ?? 'Unknown',
                      ),
                      if (_deviceInfo!['brand'] != null)
                        _buildInfoRow('Brand', _deviceInfo!['brand']),
                      if (_deviceInfo!['manufacturer'] != null)
                        _buildInfoRow(
                          'Manufacturer',
                          _deviceInfo!['manufacturer'],
                        ),
                      _buildInfoRow(
                        'Physical Device',
                        _deviceInfo!['isPhysicalDevice']?.toString() ??
                            'Unknown',
                      ),
                      _buildInfoRow(
                        'Initialized',
                        _isDeviceInitialized ? 'Yes' : 'No (New Device)',
                      ),
                    ] else
                      const Text('Device information not available'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Location Information Card
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.location_on, color: Colors.green),
                        const SizedBox(width: 8),
                        Text(
                          'Location Information',
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.refresh),
                          onPressed: _isLoading ? null : _refreshLocation,
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    if (_currentLocation != null) ...[
                      _buildInfoRow(
                        'Latitude',
                        _currentLocation!.latitude.toStringAsFixed(6),
                      ),
                      _buildInfoRow(
                        'Longitude',
                        _currentLocation!.longitude.toStringAsFixed(6),
                      ),
                      _buildInfoRow(
                        'Accuracy',
                        '${_currentLocation!.accuracy.toStringAsFixed(1)} meters',
                      ),
                      _buildInfoRow(
                        'Altitude',
                        '${_currentLocation!.altitude.toStringAsFixed(1)} meters',
                      ),
                      _buildInfoRow(
                        'Speed',
                        '${_currentLocation!.speed.toStringAsFixed(1)} m/s',
                      ),
                    ] else
                      const Text('Location information not available'),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 24),

            // Action Buttons
            ElevatedButton.icon(
              onPressed: _isLoading ? null : _markAttendance,
              icon: _isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.check_circle),
              label: Text(_isLoading ? 'Marking...' : 'Mark Attendance'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),

            const SizedBox(height: 12),

            Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isLoading ? null : _initializeDeviceInfo,
                    icon: const Icon(Icons.refresh),
                    label: const Text('Refresh All'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: _isLoading ? null : _resetDeviceId,
                    icon: const Icon(Icons.restart_alt),
                    label: const Text('Reset UUID'),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      foregroundColor: Colors.orange,
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // Modern UUID Information
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.green[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.green[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.security, color: Colors.green[600]),
                      const SizedBox(width: 8),
                      Text(
                        'Modern UUID Approach',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.green[800],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '✓ Persistent across app reinstalls\n'
                    '✓ Stored in iOS Keychain / Android Keystore\n'
                    '✓ Unique per physical device\n'
                    '✓ More reliable than platform IDs\n'
                    '✓ Privacy-friendly (not tied to device hardware)',
                    style: TextStyle(color: Colors.green[700], height: 1.4),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Information Note
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.blue[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.blue[200]!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(Icons.info, color: Colors.blue[600]),
                      const SizedBox(width: 8),
                      Text(
                        'How UUID + Secure Storage Works:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          color: Colors.blue[800],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '1. App generates unique UUID on first run\n'
                    '2. UUID stored in secure device storage\n'
                    '3. Same UUID retrieved on subsequent launches\n'
                    '4. Survives app deletion and reinstallation\n'
                    '5. Perfect for attendance tracking systems',
                    style: TextStyle(color: Colors.blue[700], height: 1.4),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(value, style: TextStyle(color: Colors.grey[700])),
          ),
        ],
      ),
    );
  }
}
