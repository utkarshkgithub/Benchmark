import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../utils/device_id_helper.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  String _deviceId = 'Loading...';
  Map<String, dynamic>? _deviceInfo;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadDeviceInfo();
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Home'),
        backgroundColor: Colors.deepPurple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => _handleLogout(context),
            tooltip: 'Logout',
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.home, size: 80, color: Colors.deepPurple),
            const SizedBox(height: 24),
            const Text(
              'This is Home Screen',
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.deepPurple,
              ),
            ),
            const SizedBox(height: 32),

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
          ],
        ),
      ),
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
