import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';
import 'qr_scanner_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // Target coordinates (25.259149, 87.040193)
  static const double targetLatitude = 25.259149;
  // static const double targetLatitude = 25.259080; //lib
  // static const double targetLatitude = 25.2523147;  //ranitalab
  static const double targetLongitude = 87.040193;
  // static const double targetLongitude = 87.039935;  //lib
  // static const double targetLongitude = 87.03284;  //ranitalab
  static const double maxDistanceAllowed = 58.0; // 60 meters

  @override
  void initState() {
    super.initState();
  }

  Future<bool> _checkLocationDistance() async {
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
        locationSettings: LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10), // prevents hanging forever
        ),
      );

      // Calculate distance to target coordinates
      double distanceInMeters = Geolocator.distanceBetween(
        position.latitude,
        position.longitude,
        targetLatitude,
        targetLongitude,
      );

      return distanceInMeters <= maxDistanceAllowed;
    } catch (e) {
      // If there's an error getting location, deny access for security
      return false;
    }
  }

  Future<void> _handleQRScan() async {
    // Show loading indicator
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(child: CircularProgressIndicator()),
    );

    try {
      bool isWithinRange = await _checkLocationDistance();

      // Get the distance for the message (even if not within range)
      Position position = await Geolocator.getCurrentPosition(
        locationSettings: LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10), // prevents hanging forever
        ),
      );
      double distanceInMeters = Geolocator.distanceBetween(
        position.latitude,
        position.longitude,
        targetLatitude,
        targetLongitude,
      );

      // Close loading dialog
      if (mounted) Navigator.of(context).pop();

      if (isWithinRange) {
        // User is within range, proceed to QR scanner
        if (mounted) {
          Navigator.of(context).push(
            MaterialPageRoute(builder: (context) => const QRScannerScreen()),
          );
        }
      } else {
        // User is too far, show error message with distance
        if (mounted) {
          showDialog(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('You are too far'),
              content: Text(
                // 'You are ${distanceInMeters.toStringAsFixed(0)} meters away. '
                'Please come within the class premises to mark attendance.',
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      // Close loading dialog
      if (mounted) Navigator.of(context).pop();

      // Show error message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error checking location: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
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
    return PopScope(
      canPop: true, // Allow app to close from home screen
      child: Consumer<AuthProvider>(
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
                  // User Profile Image - Circular Design
                  Builder(
                    builder: (context) {
                      final imageUrl = user?['image']?.toString() ?? '';
                      print('Debug: Home Screen - Image URL: "$imageUrl"');

                      return Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Colors.grey[200],
                          border: Border.all(
                            color: Colors.deepPurple.withValues(alpha: 0.3),
                            width: 3,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.15),
                              spreadRadius: 1,
                              blurRadius: 8,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(50),
                          child: imageUrl.isNotEmpty
                              ? Image.network(
                                  imageUrl,
                                  width: 100,
                                  height: 100,
                                  fit: BoxFit.cover,
                                  headers: const {
                                    'User-Agent':
                                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                                    'Accept':
                                        'image/svg+xml,image/png,image/jpeg,image/gif,image/*,*/*;q=0.8',
                                  },
                                  loadingBuilder: (context, child, loadingProgress) {
                                    if (loadingProgress == null) {
                                      print(
                                        'Debug: Home Screen - Image loaded successfully',
                                      );
                                      return child;
                                    }
                                    print(
                                      'Debug: Home Screen - Loading image...',
                                    );
                                    return const Center(
                                      child: CircularProgressIndicator(
                                        color: Colors.deepPurple,
                                        strokeWidth: 2.0,
                                      ),
                                    );
                                  },
                                  errorBuilder: (context, error, stackTrace) {
                                    print(
                                      'Debug: Home Screen - Failed to load image: $error',
                                    );
                                    return Container(
                                      width: 100,
                                      height: 100,
                                      decoration: const BoxDecoration(
                                        shape: BoxShape.circle,
                                        color: Colors.deepPurple,
                                      ),
                                      child: const Icon(
                                        Icons.person,
                                        size: 50,
                                        color: Colors.white,
                                      ),
                                    );
                                  },
                                )
                              : Container(
                                  width: 100,
                                  height: 100,
                                  decoration: const BoxDecoration(
                                    shape: BoxShape.circle,
                                    color: Colors.deepPurple,
                                  ),
                                  child: const Icon(
                                    Icons.person,
                                    size: 50,
                                    color: Colors.white,
                                  ),
                                ),
                        ),
                      );
                    },
                  ),
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

                  // Location and Distance Card - Commented out for production
                  // Card(
                  //   elevation: 4,
                  //   child: Padding(
                  //     padding: const EdgeInsets.all(16.0),
                  //     child: Column(
                  //       crossAxisAlignment: CrossAxisAlignment.start,
                  //       children: [
                  //         Row(
                  //           children: [
                  //             const Icon(
                  //               Icons.location_on,
                  //               color: Colors.deepPurple,
                  //             ),
                  //             const SizedBox(width: 8),
                  //             Text(
                  //               'Location & Distance',
                  //               style: Theme.of(context).textTheme.titleLarge
                  //                   ?.copyWith(
                  //                     fontWeight: FontWeight.bold,
                  //                     color: Colors.deepPurple,
                  //                   ),
                  //             ),
                  //           ],
                  //         ),
                  //         const Divider(),
                  //         const SizedBox(height: 8),
                  //
                  //         if (_isLocationLoading)
                  //           const Center(child: CircularProgressIndicator())
                  //         else ...[
                  //           _buildInfoRow('Current Location', _currentLocation),
                  //           _buildInfoRow(
                  //             'ion',
                  //             '${targetLatitude.toStringAsFixed(6)}, ${targetLongitude.toStringAsFixed(6)}',
                  //           ),
                  //           _buildInfoRow(
                  //             'Distance from Target',
                  //             _distanceFromTarget,
                  //           ),
                  //         ],
                  //
                  //         const SizedBox(height: 16),
                  //         Center(
                  //           child: ElevatedButton.icon(
                  //             onPressed: _loadLocationAndDistance,
                  //             icon: const Icon(Icons.my_location),
                  //             label: const Text('Update Location'),
                  //             style: ElevatedButton.styleFrom(
                  //               backgroundColor: Colors.deepPurple,
                  //               foregroundColor: Colors.white,
                  //             ),
                  //           ),
                  //         ),
                  //       ],
                  //     ),
                  //   ),
                  // ),

                  // const SizedBox(height: 16),

                  // Device Information Card - Commented out for production
                  // Card(
                  //   elevation: 4,
                  //   child: Padding(
                  //     padding: const EdgeInsets.all(16.0),
                  //     child: Column(
                  //       crossAxisAlignment: CrossAxisAlignment.start,
                  //       children: [
                  //         Row(
                  //           children: [
                  //             const Icon(
                  //               Icons.phone_android,
                  //               color: Colors.deepPurple,
                  //             ),
                  //             const SizedBox(width: 8),
                  //             Text(
                  //               'Device Information',
                  //               style: Theme.of(context).textTheme.titleLarge
                  //                   ?.copyWith(
                  //                     fontWeight: FontWeight.bold,
                  //                     color: Colors.deepPurple,
                  //                   ),
                  //             ),
                  //           ],
                  //         ),
                  //         const Divider(),
                  //         const SizedBox(height: 8),
                  //
                  //         if (_isLoading)
                  //           const Center(child: CircularProgressIndicator())
                  //         else ...[
                  //           _buildInfoRow('Device ID', _deviceId),
                  //           if (_deviceInfo != null) ...[
                  //             _buildInfoRow(
                  //               'Platform',
                  //               _deviceInfo!['platform'] ?? 'Unknown',
                  //             ),
                  //             _buildInfoRow(
                  //               'Model',
                  //               _deviceInfo!['model'] ?? 'Unknown',
                  //             ),
                  //             if (_deviceInfo!['brand'] != null)
                  //               _buildInfoRow('Brand', _deviceInfo!['brand']),
                  //             if (_deviceInfo!['version'] != null)
                  //               _buildInfoRow('Version', _deviceInfo!['version']),
                  //             if (_deviceInfo!['error'] != null)
                  //               _buildErrorRow('Error', _deviceInfo!['error']),
                  //           ],
                  //         ],
                  //
                  //         const SizedBox(height: 16),
                  //         Center(
                  //           child: ElevatedButton.icon(
                  //             onPressed: _loadDeviceInfo,
                  //             icon: const Icon(Icons.refresh),
                  //             label: const Text('Refresh Device Info'),
                  //             style: ElevatedButton.styleFrom(
                  //               backgroundColor: Colors.deepPurple,
                  //               foregroundColor: Colors.white,
                  //             ),
                  //           ),
                  //         ),
                  //       ],
                  //     ),
                  //   ),
                  // ),
                  const SizedBox(height: 16),

                  // QR Scanner Button
                  SizedBox(
                    width: double.infinity,
                    child: Card(
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
                              'Scan QR codes to mark attendance',
                              textAlign: TextAlign.center,
                              style: TextStyle(color: Colors.grey),
                            ),
                            const SizedBox(height: 16),
                            ElevatedButton.icon(
                              onPressed: _handleQRScan,
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
                  ),
                ],
              ),
            ),
          );
        }, // Consumer end
      ),
    ); // PopScope end
  }
}
