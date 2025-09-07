import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:developer';
import '../providers/auth_provider.dart';
import '../services/auth_service.dart';
import '../utils/device_id_helper.dart';
import 'login_screen.dart';

// Subject model
class Subject {
  final String id;
  final String subjectName;
  final String subjectCode;
  final String semester;
  final List<String> branches;
  final bool isMinor;

  Subject({
    required this.id,
    required this.subjectName,
    required this.subjectCode,
    required this.semester,
    required this.branches,
    required this.isMinor,
  });

  factory Subject.fromJson(Map<String, dynamic> json) {
    return Subject(
      id: json['_id'] ?? '',
      subjectName: json['subjectName'] ?? '',
      subjectCode: json['subjectCode'] ?? '',
      semester: json['semester'] ?? '',
      branches: List<String>.from(json['branches'] ?? []),
      isMinor: json['isMinor'] ?? false,
    );
  }
}

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
  bool _hasMinorSubject = false;
  List<String> _selectedMinorSubjects = [];
  List<Subject> _allSubjects = [];
  bool _isLoadingSubjects = false;
  bool _subjectsFetched = false;

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

  void safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  void _nextPage() async {
    // Add bounds checking
    if (_currentPage < 0) _currentPage = 0;
    if (_currentPage >= 3) _currentPage = 2;

    if (_currentPage < 2) {
      if (_formKeys[_currentPage].currentState!.validate()) {
        if (_currentPage == 0) {
          try {
            // Use post-frame callback to avoid animation conflicts
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) {
                safeSetState(() {
                  _currentPage++;
                });
                _pageController.nextPage(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              }
            });

            await AuthService.sendOTP(
              email: _emailController.text.trim(),
              isForgotPassword: false,
            );

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
            // Use post-frame callback for error handling too
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted) {
                safeSetState(() {
                  _currentPage--;
                  // Ensure page doesn't go below 0
                  if (_currentPage < 0) _currentPage = 0;
                });
                _pageController.previousPage(
                  duration: const Duration(milliseconds: 300),
                  curve: Curves.easeInOut,
                );
              }
            });

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
          // Use post-frame callback for other page transitions too
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              safeSetState(() {
                _currentPage++;
              });
              _pageController.nextPage(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              );

              if (_currentPage == 2) {
                _fetchSubjects();
              }
            }
          });
        }
      }
    }
  }

  Future<Position> _getCurrentLocation() async {
    bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) throw Exception('Location services are disabled.');

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

  Future<void> _fetchSubjects() async {
    if (_subjectsFetched || _isLoadingSubjects) return;

    safeSetState(() => _isLoadingSubjects = true);

    try {
      final response = await http.get(
        Uri.parse(
          'https://benchmark-official.onrender.com/api/v2/subject/fetch-subjects',
        ),
        headers: {'Content-Type': 'application/json'},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final List<dynamic> subjectsData = data['data'] ?? [];
          final List<Subject> subjects = subjectsData
              .map((subjectJson) => Subject.fromJson(subjectJson))
              .toList();

          safeSetState(() {
            _allSubjects = subjects;
            _subjectsFetched = true;
            _selectedMinorSubjects.clear();
          });
        }
      }
    } catch (e) {
      log('Error fetching subjects: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to load subjects: $e'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } finally {
      safeSetState(() => _isLoadingSubjects = false);
    }
  }

  List<Subject> get _availableMinorSubjects {
    return _allSubjects
        .where(
          (subject) =>
              subject.isMinor &&
              subject.semester == _semester &&
              subject.branches.contains(_branch),
        )
        .toList();
  }

  Future<void> _handleRegistration() async {
    if (_hasMinorSubject && _selectedMinorSubjects.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please select at least one minor subject'),
          backgroundColor: Colors.red,
        ),
      );
      return;
    }

    if (_formKeys[_currentPage].currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      authProvider.clearError();
      authProvider.setLoading(true);

      try {
        // Get device ID with better error handling and debugging
        final String deviceId = await DeviceIdHelper.getDeviceId();
        print('DEBUG: Generated Device ID: $deviceId'); // Debug log

        // Check if device ID is properly generated
        if (deviceId.isEmpty || deviceId == 'unknown') {
          throw Exception(
            'Failed to generate device ID. Please restart the app and try again.',
          );
        }

        final Position position = await _getCurrentLocation();
        print(
          'DEBUG: Location obtained: ${position.latitude}, ${position.longitude}',
        ); // Debug log

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
          'hasMinorSubject': _hasMinorSubject,
          'minorSubjectIds': _hasMinorSubject ? _selectedMinorSubjects : [],
        };

        print('DEBUG: Signup data prepared for email: ${userData['email']}');
        print('DEBUG: Device ID: ${userData['deviceId']}');
        print('DEBUG: Roll Number: ${userData['rollNumber']}');
        print(
          'DEBUG: Branch: ${userData['branch']}, Semester: ${userData['semester']}',
        );

        log('Signup: User data to be sent: $userData');

        print('DEBUG: Calling AuthService.signup...');
        final signupResponse = await AuthService.signup(
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
          subjects: _allSubjects
              .where(
                (subject) =>
                    subject.semester == _semester &&
                    subject.branches.contains(_branch),
              )
              .map((subject) => subject.id)
              .toList(),
        );

        print(
          'DEBUG: Signup successful! Response user ID: ${signupResponse.user.userId}',
        );
        print('DEBUG: Response user email: ${signupResponse.user.email}');
        print(
          'DEBUG: Response user roll number: ${signupResponse.user.rollNumber}',
        );

        await authProvider.logout();

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(
                'Registration successful for ${signupResponse.user.email}! Please login to continue.',
              ),
              backgroundColor: Colors.green,
            ),
          );

          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const LoginScreen()),
          );
        }
      } catch (e) {
        print('DEBUG: Signup error occurred: $e');
        String errorMessage = _extractCleanErrorMessage(e.toString());

        // Show detailed error dialog for device ID and registration issues
        if (errorMessage.toLowerCase().contains('device') &&
            errorMessage.toLowerCase().contains('assigned')) {
          _showHelpDialog(errorMessage);
        } else if (errorMessage.toLowerCase().contains('student') &&
            errorMessage.toLowerCase().contains('not found')) {
          _showHelpDialog(errorMessage);
        } else {
          authProvider.setError(errorMessage);
        }
      } finally {
        authProvider.setLoading(false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (bool didPop, Object? result) {
        if (didPop) return;
        if (_currentPage > 0) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) {
              safeSetState(() {
                _currentPage--;
                if (_currentPage < 0) _currentPage = 0;
              });
              _pageController.previousPage(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOut,
              );
            }
          });
        } else {
          Navigator.of(context).pop();
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(_getPageTitle()),
          backgroundColor: Colors.transparent,
          elevation: 0,
          foregroundColor: Colors.deepPurple,
        ),
        body: SafeArea(
          child: Column(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 16,
                ),
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

  // === KEEP YOUR ORIGINAL PAGES ===
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
                          labelText: 'College Email ID *',
                          prefixIcon: Icon(Icons.email),
                          border: OutlineInputBorder(),
                          // helperText: 'Use your college email (@iiitbh.ac.in)',
                        ),
                        validator: (value) {
                          if (value == null || value.isEmpty) {
                            return 'College email is required';
                          }
                          if (!RegExp(
                            r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
                          ).hasMatch(value)) {
                            return 'Please enter a valid email format';
                          }
                          if (!value.toLowerCase().endsWith('@iiitbh.ac.in')) {
                            return 'Please use college email ID (@iiitbh.ac.in)';
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
                              safeSetState(() {
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
                              safeSetState(() {
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
                      // DropdownButtonFormField<String>(
                      //   initialValue: _accountType,
                      //   decoration: const InputDecoration(
                      //     labelText: 'Account Type',
                      //     prefixIcon: Icon(Icons.account_circle),
                      //     border: OutlineInputBorder(),
                      //   ),
                      //   items: const [
                      //     DropdownMenuItem(
                      //       value: 'Student',
                      //       child: Text('Student'),
                      //     ),
                      //     DropdownMenuItem(
                      //       value: 'Faculty',
                      //       child: Text('Faculty'),
                      //     ),
                      //     // DropdownMenuItem(
                      //     //   value: 'Admin',
                      //     //   child: Text('Admin'),
                      //     // ),
                      //   ],
                      //   onChanged: (value) {
                      //     safeSetState(() {
                      //       _accountType = value!;
                      //     });
                      //   },
                      // ),
                      // const SizedBox(height: 32),

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
                          isForgotPassword: false,
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
                            value: 'MAE',
                            child: Text(
                              'Mechatronics and Automation Engineering (MAE)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          DropdownMenuItem(
                            value: 'PG',
                            child: Text(
                              'PG (Post Graduation)',
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                        onChanged: (value) {
                          safeSetState(() {
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
                          safeSetState(() {
                            _semester = value!;
                            // Reset minor subject selections when semester changes
                            _selectedMinorSubjects.clear();
                            _hasMinorSubject = false;
                          });
                        },
                      ),
                      const SizedBox(height: 16),

                      // Minor Subject Checkbox
                      Row(
                        children: [
                          Checkbox(
                            value: _hasMinorSubject,
                            onChanged: (value) {
                              safeSetState(() {
                                _hasMinorSubject = value ?? false;
                                if (!_hasMinorSubject) {
                                  _selectedMinorSubjects.clear();
                                } else {
                                  // Fetch subjects when checkbox is checked (if not already fetched)
                                  _fetchSubjects();
                                }
                              });
                            },
                          ),
                          const Expanded(
                            child: Text(
                              'Opted for Minor Subject',
                              style: TextStyle(fontSize: 16),
                            ),
                          ),
                        ],
                      ),

                      // Minor Subject Dropdown (show only when checkbox is checked)
                      if (_hasMinorSubject) ...[
                        const SizedBox(height: 16),
                        if (_isLoadingSubjects)
                          const Card(
                            child: Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Row(
                                children: [
                                  SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                    ),
                                  ),
                                  SizedBox(width: 12),
                                  Text('Loading minor subjects...'),
                                ],
                              ),
                            ),
                          )
                        else if (_availableMinorSubjects.isEmpty)
                          Card(
                            color: Colors.orange[50],
                            child: const Padding(
                              padding: EdgeInsets.all(16.0),
                              child: Row(
                                children: [
                                  Icon(Icons.info, color: Colors.orange),
                                  SizedBox(width: 12),
                                  Expanded(
                                    child: Text(
                                      'No minor subjects available for your semester and branch.',
                                      style: TextStyle(color: Colors.orange),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          )
                        else
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Select Minor Subject(s):',
                                style: TextStyle(
                                  fontSize: 16,
                                  fontWeight: FontWeight.w500,
                                ),
                              ),
                              const SizedBox(height: 12),
                              Container(
                                decoration: BoxDecoration(
                                  border: Border.all(color: Colors.grey[300]!),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Column(
                                  children: _availableMinorSubjects.map((
                                    subject,
                                  ) {
                                    final isSelected = _selectedMinorSubjects
                                        .contains(subject.id);
                                    return CheckboxListTile(
                                      title: Text(
                                        subject.subjectName,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.w500,
                                        ),
                                      ),
                                      subtitle: Text(
                                        'Code: ${subject.subjectCode}',
                                        style: TextStyle(
                                          color: Colors.grey[600],
                                        ),
                                      ),
                                      value: isSelected,
                                      onChanged: (bool? value) {
                                        safeSetState(() {
                                          if (value == true) {
                                            _selectedMinorSubjects.add(
                                              subject.id,
                                            );
                                          } else {
                                            _selectedMinorSubjects.remove(
                                              subject.id,
                                            );
                                          }
                                        });
                                      },
                                      controlAffinity:
                                          ListTileControlAffinity.trailing,
                                      dense: true,
                                    );
                                  }).toList(),
                                ),
                              ),
                              if (_hasMinorSubject &&
                                  _selectedMinorSubjects.isEmpty)
                                Padding(
                                  padding: const EdgeInsets.only(top: 8.0),
                                  child: Text(
                                    'Please select at least one minor subject',
                                    style: TextStyle(
                                      color: Colors.red[600],
                                      fontSize: 12,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                      ],
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
    if (errorString.startsWith('Exception: ')) {
      errorString = errorString.substring(11);
    }
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
    final parts = errorString.split('(Status:');
    if (parts.isNotEmpty) {
      return parts[0].trim();
    }
    return errorString;
  }

  void _showHelpDialog(String error) {
    String title;
    String content;

    if (error.toLowerCase().contains('device') &&
        error.toLowerCase().contains('assigned')) {
      title = 'Device Already Registered';
      content =
          'This device appears to be already registered with another account. '
          'Each device can only be used for one student account.\n\n'
          'If this is your first time registering:\n'
          '• Try restarting the app\n'
          '• Clear app data if the problem persists\n'
          '• Contact support if you believe this is an error\n\n'
          'Device ID: ${error.contains('ID:') ? error.split('ID:').last.trim() : 'Not available'}';
    } else if (error.toLowerCase().contains('student') &&
        error.toLowerCase().contains('not found')) {
      title = 'Registration Issue';
      content =
          'Your registration was completed but there was an issue retrieving your details.\n\n'
          'Please try:\n'
          '• Wait a few minutes and try logging in\n'
          '• Check your internet connection\n'
          '• Contact support if the problem continues\n\n'
          'Error: $error';
    } else {
      title = 'Registration Error';
      content = error;
    }

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: SingleChildScrollView(child: Text(content)),
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
