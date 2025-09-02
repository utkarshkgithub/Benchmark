import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'dart:developer';
import '../providers/auth_provider.dart';
import '../services/auth_service.dart';
import '../utils/device_id_helper.dart';
import 'login_screen.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  State<SignUpScreen> createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  // Page 1 Controllers
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  String _accountType = 'Student';

  // Page 2 Controllers
  final _otpController = TextEditingController();

  // Page 3 Controllers
  final _rollNumberController = TextEditingController();
  String _branch = 'CSE';
  String _semester = 'I';

  final _formKeys = [
    GlobalKey<FormState>(),
    GlobalKey<FormState>(),
    GlobalKey<FormState>(),
  ];

  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    _otpController.dispose();
    _rollNumberController.dispose();
    _pageController.dispose();
    super.dispose();
  }

  void _nextPage() async {
    if (_currentPage < 2) {
      if (_formKeys[_currentPage].currentState!.validate()) {
        // If moving from page 1 to page 2 (OTP verification), send OTP
        if (_currentPage == 0) {
          try {
            // Show loading state
            setState(() {
              _currentPage++;
            });
            _pageController.nextPage(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
            );

            // Send OTP to user's email
            await AuthService.sendOTP(email: _emailController.text.trim());

            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text(
                    'OTP sent to your email. Please check your inbox.',
                  ),
                  backgroundColor: Colors.green,
                ),
              );
            }
          } catch (e) {
            // If OTP sending fails, go back to previous page
            setState(() {
              _currentPage--;
            });
            _pageController.previousPage(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
            );

            if (mounted) {
              String errorMessage = _extractCleanErrorMessage(e.toString());
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Failed to send OTP: $errorMessage'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        } else {
          // For other page transitions, just move to next page
          setState(() {
            _currentPage++;
          });
          _pageController.nextPage(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
          );
        }
      }
    }
  }

  Future<Position> _getCurrentLocation() async {
    // Check if location services are enabled
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      throw Exception('Location services are disabled.');
    }

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

    return await Geolocator.getCurrentPosition();
  }

  Future<void> _handleRegistration() async {
    if (_formKeys[_currentPage].currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      authProvider.clearError();
      authProvider.setLoading(true);

      try {
        // Get device ID and location
        final String deviceId = await DeviceIdHelper.getDeviceId();
        final Position position = await _getCurrentLocation();

        // Create user data object
        final userData = {
          'firstName': _firstNameController.text.trim(),
          'lastName': _lastNameController.text.trim(),
          'email': _emailController.text.trim(),
          'password': _passwordController.text,
          'accountType': _accountType,
          'otp': _otpController.text,
          'rollNumber': _rollNumberController.text.trim(),
          'branch': _branch,
          'semester': _semester,
          'deviceId': deviceId,
          'latitude': position.latitude,
          'longitude': position.longitude,
          'accuracy': position.accuracy,
        };

        log('Signup: User data to be sent: $userData');

        // Call signup service
        await AuthService.signup(
          email: userData['email'] as String,
          password: userData['password'] as String,
          firstName: userData['firstName'] as String,
          lastName: userData['lastName'] as String,
          accountType: userData['accountType'] as String,
          otp: userData['otp'] as String,
          rollNumber: userData['rollNumber'] as String,
          branch: userData['branch'] as String,
          semester: userData['semester'] as String,
          deviceId: userData['deviceId'] as String,
        );

        // Clear any existing auth data
        await authProvider.logout();

        if (mounted) {
          // Show success message
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text(
                'Registration successful! Please login to continue.',
              ),
              backgroundColor: Colors.green,
            ),
          );

          // Redirect to login screen
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const LoginScreen()),
          );
        }
      } catch (e) {
        // Extract clean error message
        String errorMessage = _extractCleanErrorMessage(e.toString());
        authProvider.setError(errorMessage);
      } finally {
        authProvider.setLoading(false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_getPageTitle()),
        backgroundColor: Colors.transparent,
        elevation: 0,
        foregroundColor: Colors.deepPurple,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Progress Indicator
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
              child: Row(
                children: List.generate(3, (index) {
                  return Expanded(
                    child: Container(
                      height: 4,
                      margin: EdgeInsets.only(right: index < 2 ? 8 : 0),
                      decoration: BoxDecoration(
                        color: index <= _currentPage
                            ? Colors.deepPurple
                            : Colors.grey[300],
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  );
                }),
              ),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                children: [_buildPage1(), _buildPage2(), _buildPage3()],
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _getPageTitle() {
    switch (_currentPage) {
      case 0:
        return 'User Registration';
      case 1:
        return 'OTP Verification';
      case 2:
        return 'Student Details';
      default:
        return 'Registration';
    }
  }

  Widget _buildPage1() {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              return Form(
                key: _formKeys[0],
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Icon(
                        Icons.person_add,
                        size: 80,
                        color: Colors.deepPurple,
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Create Account',
                        style: Theme.of(context).textTheme.headlineMedium
                            ?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.deepPurple,
                            ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 48),

                      // First Name Field
                      TextFormField(
                        controller: _firstNameController,
                        decoration: const InputDecoration(
                          labelText: 'First Name *',
                          prefixIcon: Icon(Icons.person),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'First name is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Last Name Field
                      TextFormField(
                        controller: _lastNameController,
                        decoration: const InputDecoration(
                          labelText: 'Last Name *',
                          prefixIcon: Icon(Icons.person_outline),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Last name is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Email Field
                      TextFormField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: const InputDecoration(
                          labelText: 'Email ID *',
                          prefixIcon: Icon(Icons.email),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Email is required';
                          }
                          if (!RegExp(
                            r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                          ).hasMatch(value)) {
                            return 'Please enter a valid email';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Password Field
                      TextFormField(
                        controller: _passwordController,
                        obscureText: _obscurePassword,
                        decoration: InputDecoration(
                          labelText: 'Password *',
                          prefixIcon: const Icon(Icons.lock),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscurePassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscurePassword = !_obscurePassword;
                              });
                            },
                          ),
                          border: const OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Password is required';
                          }
                          if (value.length < 6) {
                            return 'Password must be at least 6 characters';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Confirm Password Field
                      TextFormField(
                        controller: _confirmPasswordController,
                        obscureText: _obscureConfirmPassword,
                        decoration: InputDecoration(
                          labelText: 'Confirm Password *',
                          prefixIcon: const Icon(Icons.lock_outline),
                          suffixIcon: IconButton(
                            icon: Icon(
                              _obscureConfirmPassword
                                  ? Icons.visibility
                                  : Icons.visibility_off,
                            ),
                            onPressed: () {
                              setState(() {
                                _obscureConfirmPassword =
                                    !_obscureConfirmPassword;
                              });
                            },
                          ),
                          border: const OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Please confirm your password';
                          }
                          if (value != _passwordController.text) {
                            return 'Passwords do not match';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Account Type Field
                      DropdownButtonFormField<String>(
                        initialValue: _accountType,
                        decoration: const InputDecoration(
                          labelText: 'Account Type',
                          prefixIcon: Icon(Icons.account_circle),
                          border: OutlineInputBorder(),
                        ),
                        items: const [
                          DropdownMenuItem(
                            value: 'Student',
                            child: Text('Student'),
                          ),
                          DropdownMenuItem(
                            value: 'Faculty',
                            child: Text('Faculty'),
                          ),
                          // DropdownMenuItem(
                          //   value: 'Admin',
                          //   child: Text('Admin'),
                          // ),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _accountType = value!;
                          });
                        },
                      ),
                      const SizedBox(height: 32),

                      // Error Message
                      if (authProvider.error != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            border: Border.all(color: Colors.red[300]!),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            authProvider.error!,
                            style: TextStyle(color: Colors.red[700]),
                            textAlign: TextAlign.center,
                          ),
                        ),

                      // Next Button
                      ElevatedButton(
                        onPressed: _nextPage,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.deepPurple,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          'Next',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Sign In Link
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Already have an account? ",
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                          TextButton(
                            onPressed: () {
                              Navigator.of(context).pop();
                            },
                            child: const Text(
                              'Sign In',
                              style: TextStyle(fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _buildPage2() {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Form(
            key: _formKeys[1],
            child: SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(
                    Icons.security,
                    size: 80,
                    color: Colors.deepPurple,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'OTP Verification',
                    style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                      color: Colors.deepPurple,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Enter the 6-digit OTP sent to your email',
                    style: Theme.of(
                      context,
                    ).textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 48),

                  // OTP Field
                  TextFormField(
                    controller: _otpController,
                    keyboardType: TextInputType.number,
                    maxLength: 6,
                    decoration: const InputDecoration(
                      labelText: 'Enter OTP *',
                      prefixIcon: Icon(Icons.lock_clock),
                      border: OutlineInputBorder(),
                      counterText: '',
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'OTP is required';
                      }
                      if (value.length != 6) {
                        return 'OTP must be 6 digits';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 32),

                  // Next Button
                  ElevatedButton(
                    onPressed: _nextPage,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.deepPurple,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                    ),
                    child: const Text(
                      'Verify',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Resend OTP
                  TextButton(
                    onPressed: () async {
                      try {
                        await AuthService.sendOTP(
                          email: _emailController.text.trim(),
                        );

                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(
                              content: Text('OTP resent successfully!'),
                              backgroundColor: Colors.green,
                            ),
                          );
                        }
                      } catch (e) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              content: Text('Failed to resend OTP: $e'),
                              backgroundColor: Colors.red,
                            ),
                          );
                        }
                      }
                    },
                    child: const Text('Resend OTP'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPage3() {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              return Form(
                key: _formKeys[2],
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Icon(
                        Icons.school,
                        size: 80,
                        color: Colors.deepPurple,
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Student Details',
                        style: Theme.of(context).textTheme.headlineMedium
                            ?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Colors.deepPurple,
                            ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 48),

                      // Roll Number Field
                      TextFormField(
                        controller: _rollNumberController,
                        decoration: const InputDecoration(
                          labelText: 'Roll Number *',
                          prefixIcon: Icon(Icons.badge),
                          border: OutlineInputBorder(),
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'Roll number is required';
                          }
                          return null;
                        },
                      ),
                      const SizedBox(height: 16),

                      // Branch Field
                      DropdownButtonFormField<String>(
                        initialValue: _branch,
                        decoration: const InputDecoration(
                          labelText: 'Branch',
                          prefixIcon: Icon(Icons.engineering),
                          border: OutlineInputBorder(),
                        ),
                        isExpanded: true,
                        items: const [
                          DropdownMenuItem(
                            value: 'CSE',
                            child: Text(
                              'CSE (Computer Science & Engineering)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          DropdownMenuItem(
                            value: 'ECE',
                            child: Text(
                              'ECE (Electronics & Communication Engineering)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          DropdownMenuItem(
                            value: 'MNC',
                            child: Text(
                              'MNC (Mathematics & Computing)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          DropdownMenuItem(
                            value: 'Mechatronics',
                            child: Text(
                              'Mechatronics Engineering',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _branch = value!;
                          });
                        },
                      ),
                      const SizedBox(height: 16),

                      // Semester Field
                      DropdownButtonFormField<String>(
                        initialValue: _semester,
                        decoration: const InputDecoration(
                          labelText: 'Semester',
                          prefixIcon: Icon(Icons.calendar_today),
                          border: OutlineInputBorder(),
                        ),
                        isExpanded: true,
                        items: [
                          const DropdownMenuItem(
                            value: 'I',
                            child: Text(
                              'Semester I (1st)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const DropdownMenuItem(
                            value: 'II',
                            child: Text(
                              'Semester II (2nd)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const DropdownMenuItem(
                            value: 'III',
                            child: Text(
                              'Semester III (3rd)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const DropdownMenuItem(
                            value: 'IV',
                            child: Text(
                              'Semester IV (4th)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const DropdownMenuItem(
                            value: 'V',
                            child: Text(
                              'Semester V (5th)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const DropdownMenuItem(
                            value: 'VI',
                            child: Text(
                              'Semester VI (6th)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const DropdownMenuItem(
                            value: 'VII',
                            child: Text(
                              'Semester VII (7th)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          const DropdownMenuItem(
                            value: 'VIII',
                            child: Text(
                              'Semester VIII (8th)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                        onChanged: (value) {
                          setState(() {
                            _semester = value!;
                          });
                        },
                      ),
                      const SizedBox(height: 32),

                      // Error Message
                      if (authProvider.error != null)
                        Container(
                          padding: const EdgeInsets.all(12),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            border: Border.all(color: Colors.red[300]!),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            authProvider.error!,
                            style: TextStyle(color: Colors.red[700]),
                            textAlign: TextAlign.center,
                          ),
                        ),

                      // Submit Button
                      ElevatedButton(
                        onPressed: authProvider.isLoading
                            ? null
                            : _handleRegistration,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.deepPurple,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: authProvider.isLoading
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  valueColor: AlwaysStoppedAnimation<Color>(
                                    Colors.white,
                                  ),
                                ),
                              )
                            : const Text(
                                'Complete Registration',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ),
    );
  }

  String _extractCleanErrorMessage(String errorString) {
    // Remove "Exception: " prefix if present
    if (errorString.startsWith('Exception: ')) {
      errorString = errorString.substring(11);
    }

    // Extract clean error messages for common cases
    if (errorString.contains('Device already assigned to other')) {
      return 'Device already assigned to other';
    }
    if (errorString.contains('Email already exists') ||
        errorString.contains('User already exists')) {
      return 'Email already registered';
    }
    if (errorString.contains('Invalid OTP') ||
        errorString.contains('OTP expired')) {
      return 'Invalid or expired OTP';
    }
    if (errorString.contains('Network') || errorString.contains('connection')) {
      return 'Network error. Please check your connection';
    }

    // For other errors, try to extract the main message before any status code
    final parts = errorString.split('(Status:');
    if (parts.isNotEmpty) {
      return parts[0].trim();
    }

    return errorString;
  }
}
