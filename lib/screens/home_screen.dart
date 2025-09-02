import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../providers/auth_provider.dart';
import '../utils/device_id_helper.dart';
import 'login_screen.dart';
import 'qr_scanner_screen.dart';
import 'classroom_benches.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _deviceId = 'Loading...';
  Map<String, dynamic>? _deviceInfo;
  bool _isLoading = true;

  // GPS and distance tracking
  String _currentLocation = 'Loading...';
  String _distanceFromTarget = 'Calculating...';
  bool _isLocationLoading = true;

  // Target coordinates (25.259032, 87.040244)
  static const double targetLatitude = 25.259032;
  static const double targetLongitude = 87.040244;

  @override
  void initState() {
    super.initState();
    _loadDeviceInfo();
    _loadLocationAndDistance();
  }

  Future<void> _loadDeviceInfo() async {
    try {
      final deviceId = await DeviceIdHelper.getDeviceId();
      final deviceInfo = await DeviceIdHelper.getDeviceInfo();

      if (mounted) {
        setState(() {
          _deviceId = deviceId;
          _deviceInfo = deviceInfo;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _deviceId = 'Error: $e';
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _loadLocationAndDistance() async {
    try {
      // Check location permissions
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Location permissions are denied');
        }
      }

      if (permission == LocationPermission.deniedForever) {
        throw Exception('Location permissions are permanently denied');
      }

      // Get current position
      Position position = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      // Calculate distance to target coordinates
      double distanceInMeters = Geolocator.distanceBetween(
        position.latitude,
        position.longitude,
        targetLatitude,
        targetLongitude,
      );

      // Format location and distance
      String locationText =
          '${position.latitude.toStringAsFixed(6)}, ${position.longitude.toStringAsFixed(6)}';
      String distanceText = _formatDistance(distanceInMeters);

      if (mounted) {
        setState(() {
          _currentLocation = locationText;
          _distanceFromTarget = distanceText;
          _isLocationLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _currentLocation = 'Error: ${e.toString()}';
          _distanceFromTarget = 'Unable to calculate';
          _isLocationLoading = false;
        });
      }
    }
  }

  String _formatDistance(double distanceInMeters) {
    if (distanceInMeters < 1000) {
      return '${distanceInMeters.toStringAsFixed(1)} m';
    } else {
      double distanceInKm = distanceInMeters / 1000;
      return '${distanceInKm.toStringAsFixed(2)} km';
    }
  }

  Future<void> _handleLogout(BuildContext context) async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    await authProvider.logout();

    if (context.mounted) {
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        // Get user data
        final user = authProvider.user;
        String userName = 'Student';

        if (user != null) {
          final firstName = user['firstName'] ?? '';
          final lastName = user['lastName'] ?? '';
          if (firstName.isNotEmpty || lastName.isNotEmpty) {
            userName = '$firstName $lastName'.trim();
          }
        }

        return Scaffold(
          appBar: AppBar(
            title: const Text('Student Dashboard'),
            backgroundColor: Colors.deepPurple,
            foregroundColor: Colors.white,
            automaticallyImplyLeading: false,
            actions: [
              IconButton(
                icon: const Icon(Icons.logout),
                onPressed: () => _handleLogout(context),
                tooltip: 'Logout',
              ),
            ],
          ),
          body: SingleChildScrollView(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              children: [
                const Icon(Icons.school, size: 80, color: Colors.deepPurple),
                const SizedBox(height: 24),
                Text(
                  'Welcome $userName',
                  style: const TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Colors.deepPurple,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                const Text(
                  'Student Dashboard',
                  style: TextStyle(fontSize: 16, color: Colors.grey),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 32),

                // Location and Distance Card
                Card(
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Icon(
                              Icons.location_on,
                              color: Colors.deepPurple,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Location & Distance',
                              style: Theme.of(context).textTheme.titleLarge
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.deepPurple,
                                  ),
                            ),
                          ],
                        ),
                        const Divider(),
                        const SizedBox(height: 8),

                        if (_isLocationLoading)
                          const Center(child: CircularProgressIndicator())
                        else ...[
                          _buildInfoRow('Current Location', _currentLocation),
                          _buildInfoRow(
                            'Target Location',
                            '${targetLatitude.toStringAsFixed(6)}, ${targetLongitude.toStringAsFixed(6)}',
                          ),
                          _buildInfoRow(
                            'Distance from Target',
                            _distanceFromTarget,
                          ),
                        ],

                        const SizedBox(height: 16),
                        Center(
                          child: ElevatedButton.icon(
                            onPressed: _loadLocationAndDistance,
                            icon: const Icon(Icons.my_location),
                            label: const Text('Update Location'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.deepPurple,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Device Information Card
                Card(
                  elevation: 4,
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
                                  ?.copyWith(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.deepPurple,
                                  ),
                            ),
                          ],
                        ),
                        const Divider(),
                        const SizedBox(height: 8),

                        if (_isLoading)
                          const Center(child: CircularProgressIndicator())
                        else ...[
                          _buildInfoRow('Device ID', _deviceId),
                          if (_deviceInfo != null) ...[
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
                            if (_deviceInfo!['version'] != null)
                              _buildInfoRow('Version', _deviceInfo!['version']),
                            if (_deviceInfo!['error'] != null)
                              _buildErrorRow('Error', _deviceInfo!['error']),
                          ],
                        ],

                        const SizedBox(height: 16),
                        Center(
                          child: ElevatedButton.icon(
                            onPressed: _loadDeviceInfo,
                            icon: const Icon(Icons.refresh),
                            label: const Text('Refresh Device Info'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.deepPurple,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Classroom Seating Card
                // Card(
                //   elevation: 4,
                //   child: Padding(
                //     padding: const EdgeInsets.all(16.0),
                //     child: Column(
                //       children: [
                //         const Icon(
                //           Icons.event_seat,
                //           size: 48,
                //           color: Colors.deepPurple,
                //         ),
                //         const SizedBox(height: 16),
                //         Text(
                //           'Classroom Seating',
                //           style: Theme.of(context).textTheme.titleLarge
                //               ?.copyWith(
                //                 fontWeight: FontWeight.bold,
                //                 color: Colors.deepPurple,
                //               ),
                //         ),
                //         const SizedBox(height: 8),
                //         const Text(
                //           'Select seats in the classroom layout',
                //           textAlign: TextAlign.center,
                //           style: TextStyle(color: Colors.grey),
                //         ),
                //         const SizedBox(height: 16),
                //         ElevatedButton.icon(
                //           onPressed: () {
                //             Navigator.of(context).push(
                //               MaterialPageRoute(
                //                 builder: (context) =>
                //                     const ClassroomBenchesScreen(),
                //               ),
                //             );
                //           },
                //           icon: const Icon(Icons.event_seat),
                //           label: const Text('View Seating'),
                //           style: ElevatedButton.styleFrom(
                //             backgroundColor: Colors.deepPurple,
                //             foregroundColor: Colors.white,
                //             padding: const EdgeInsets.symmetric(
                //               horizontal: 24,
                //               vertical: 12,
                //             ),
                //           ),
                //         ),
                //       ],
                //     ),
                //   ),
                // ),

                const SizedBox(height: 16),

                // QR Scanner Button
                Card(
                  elevation: 4,
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      children: [
                        const Icon(
                          Icons.qr_code_scanner,
                          size: 48,
                          color: Colors.deepPurple,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          'QR Code Scanner',
                          style: Theme.of(context).textTheme.titleLarge
                              ?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.deepPurple,
                              ),
                        ),
                        const SizedBox(height: 8),
                        const Text(
                          'Scan QR codes and send data to httpbin.org',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.grey),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => const QRScannerScreen(),
                              ),
                            );
                          },
                          icon: const Icon(Icons.qr_code_scanner),
                          label: const Text('Scan QR Code'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.deepPurple,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 24,
                              vertical: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.grey,
              ),
            ),
          ),
          Expanded(
            child: SelectableText(
              value,
              style: const TextStyle(fontFamily: 'monospace'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildErrorRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 80,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w600,
                color: Colors.red,
              ),
            ),
          ),
          Expanded(
            child: SelectableText(
              value,
              style: const TextStyle(
                fontFamily: 'monospace',
                color: Colors.red,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
