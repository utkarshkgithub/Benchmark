import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'dart:async';
import '../services/auth_service.dart';
import '../models/user_models.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';

class InstructorPage extends StatefulWidget {
  final User user;

  const InstructorPage({super.key, required this.user});

  @override
  State<InstructorPage> createState() => _InstructorPageState();
}

class _InstructorPageState extends State<InstructorPage> {
  bool _isLoading = false;
  String? _qrToken;
  bool _showQr = false;
  SubjectInfo? _selectedSubject; // Changed to SubjectInfo object
  List<SubjectInfo> _subjects = []; // Changed to SubjectInfo list
  Timer? _countdownTimer;
  int _remainingSeconds = 120; // 2 minutes countdown

  @override
  void initState() {
    super.initState();
    // Extract subjects from user data
    _subjects = widget.user.subjectsTaught;

    // Select first subject by default if available
    if (_subjects.isNotEmpty) {
      _selectedSubject = _subjects.first;
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  Future<void> _generateQRCode() async {
    if (_selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a subject first')),
      );
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Get the auth token from the provider
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;

      if (token == null) {
        throw Exception('No authentication token found');
      }

      print(
        'Debug: Generating QR for subject: ${_selectedSubject!.subjectName} (${_selectedSubject!.subjectCode})',
      );
      print('Debug: Using token: ${token.substring(0, 20)}...');

      // Call the AuthService to generate QR token with selected subject code and token
      final response = await AuthService.generateQRToken(
        _selectedSubject!.subjectCode,
        token,
      );

      print('Debug: API Response: $response');

      // Check different possible response keys
      String? qrToken;
      if (response['qrtoken'] != null) {
        qrToken = response['qrtoken'].toString();
      } else if (response['token'] != null) {
        qrToken = response['token'].toString();
      } else if (response['data'] != null &&
          response['data']['qrtoken'] != null) {
        qrToken = response['data']['qrtoken'].toString();
      }

      print('Debug: Extracted QR Token: $qrToken');

      if (qrToken == null || qrToken.isEmpty) {
        throw Exception(
          'No QR token received from server. Response: $response',
        );
      }

      setState(() {
        _qrToken = qrToken;
        _showQr = true;
        _remainingSeconds = 120; // Reset to 2 minutes
      });

      // Start countdown timer
      _startCountdown();

      print('Debug: QR Code should now be visible');
    } catch (e) {
      print('Debug: Error generating QR code: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate QR code: $e')),
        );
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_remainingSeconds > 0) {
          _remainingSeconds--;
        } else {
          _closeQR();
          timer.cancel();
        }
      });
    });
  }

  String _formatTime(int seconds) {
    int minutes = seconds ~/ 60;
    int remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  void _closeQR() {
    _countdownTimer?.cancel();
    setState(() {
      _showQr = false;
      _qrToken = null;
      _remainingSeconds = 120;
    });
  }

  Future<void> _logout() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();

      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Logout failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    print(
      'Debug: Building InstructorPage - showQr: $_showQr, qrToken: ${_qrToken?.substring(0, 20) ?? 'null'}',
    );
    return Scaffold(
      appBar: _showQr
          ? null
          : AppBar(
              title: const Text('Instructor Dashboard'),
              backgroundColor: Colors.deepPurple,
              foregroundColor: Colors.white,
              automaticallyImplyLeading: false,
              actions: [
                IconButton(
                  onPressed: _logout,
                  icon: const Icon(Icons.logout),
                  tooltip: 'Logout',
                ),
              ],
            ),
      body: SafeArea(
        child: _showQr && _qrToken != null
            ? _buildQrScreen()
            : _buildMainContent(),
      ),
    );
  }

  Widget _buildMainContent() {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo/Title
              const Icon(
                Icons.account_circle,
                size: 80,
                color: Colors.deepPurple,
              ),
              const SizedBox(height: 24),
              Text(
                'Welcome ${widget.user.firstName} ${widget.user.lastName}',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.deepPurple,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'This is the instructor page',
                style: Theme.of(
                  context,
                ).textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Subject selection dropdown
              if (_subjects.isNotEmpty) ...[
                Text(
                  'Select Subject:',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<SubjectInfo>(
                  value: _selectedSubject,
                  items: _subjects.map((SubjectInfo subject) {
                    return DropdownMenuItem<SubjectInfo>(
                      value: subject,
                      child: Text(
                        '${subject.subjectName} (${subject.subjectCode})',
                      ),
                    );
                  }).toList(),
                  onChanged: (SubjectInfo? newValue) {
                    setState(() {
                      _selectedSubject = newValue;
                    });
                  },
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                ),
                const SizedBox(height: 24),
              ] else ...[
                Text(
                  'No subjects assigned',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
              ],

              ElevatedButton(
                onPressed: _isLoading || _selectedSubject == null
                    ? null
                    : _generateQRCode,
                child: _isLoading
                    ? const CircularProgressIndicator()
                    : const Text('Generate QR Code'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildQrScreen() {
    print(
      'Debug: Building QR Screen with token: ${_qrToken?.substring(0, 20)}...',
    );
    return Stack(
      children: [
        // Background with slight opacity
        Container(color: Colors.black.withValues(alpha: 0.05)),

        // QR Code in the center
        Center(
          child: Container(
            margin: const EdgeInsets.all(16.0),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Subject: ${_selectedSubject?.subjectName ?? 'Unknown'}',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  'Code: ${_selectedSubject?.subjectCode ?? 'Unknown'}',
                  style: Theme.of(
                    context,
                  ).textTheme.titleMedium?.copyWith(color: Colors.grey[600]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),

                // Countdown Timer
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: _remainingSeconds <= 30
                        ? Colors.red[50]
                        : Colors.green[50],
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _remainingSeconds <= 30
                          ? Colors.red
                          : Colors.green,
                      width: 2,
                    ),
                  ),
                  child: Text(
                    'Time remaining: ${_formatTime(_remainingSeconds)}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _remainingSeconds <= 30
                          ? Colors.red[700]
                          : Colors.green[700],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // QR Code - Made much larger
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!, width: 1),
                  ),
                  child: QrImageView(
                    data: _qrToken!,
                    version: 14,
                    size:
                        MediaQuery.of(context).size.width *
                        0.9, // Increased from 0.6 to 0.8
                    backgroundColor: Colors.white,
                    eyeStyle: const QrEyeStyle(
                      eyeShape: QrEyeShape.square,
                      color: Colors.black, // 👀 Color for the eyes
                    ),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square,
                      color: Colors.black, // 🎯 Color for the dots
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Close button at the bottom
        Positioned(
          bottom: 40,
          left: 0,
          right: 0,
          child: Center(
            child: ElevatedButton(
              onPressed: _closeQR,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
              ),
              child: const Text('Close QR'),
            ),
          ),
        ),
      ],
    );
  }
}
