import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/auth_service.dart';
import '../utils/device_id_helper.dart';
import 'signup_screen.dart';
import 'forgot_password_screen.dart';
import 'home_screen.dart';
import 'instructor_screen.dart';
import 'dart:developer';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (_formKey.currentState!.validate()) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);

      authProvider.clearError();
      authProvider.setLoading(true);

      try {
        // Get device ID dynamically
        log('Login: Starting device ID fetch...');
        final String deviceId = await DeviceIdHelper.getDeviceId();
        log('Login: Device ID retrieved: $deviceId');

        log('Login: Calling AuthService.mobileLogin with device ID: $deviceId');
        final loginResponse = await AuthService.mobileLogin(
          email: _emailController.text.trim(),
          password: _passwordController.text,
          deviceId: deviceId,
        );
        log('Login: Successfully got login response.');

        // Debug: Log the actual response structure
        log('Login: Raw user data: ${loginResponse.user.toJson()}');
        log('Login: User account type: "${loginResponse.user.accountType}"');

        // Set token and user data in the provider
        await authProvider.setToken(loginResponse.token);
        await authProvider.setUser(loginResponse.user.toJson());

        // Ensure widget is still mounted before navigating
        if (!mounted) return;

        // Redirect based on the accountType from the login response
        log("Checking account type for navigation...");
        log("Account type value: '${loginResponse.user.accountType}'");
        log("Is Instructor? ${loginResponse.user.accountType == "Instructor"}");

        if (loginResponse.user.accountType == "Instructor") {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(
              builder: (context) => InstructorPage(user: loginResponse.user),
            ),
          );
        } else {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (context) => const HomeScreen()),
          );
        }
      } catch (e) {
        log('Login: Error occurred: $e');
        // Extract clean error message
        String errorMessage = _extractCleanErrorMessage(e.toString());
        authProvider.setError(errorMessage);
      } finally {
        authProvider.setLoading(false);
      }
    }
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
    if (errorString.contains('Invalid credentials') ||
        errorString.contains('Email or password is incorrect')) {
      return 'Invalid email or password';
    }
    if (errorString.contains('User not found') ||
        errorString.contains('No user found')) {
      return 'No account found with this email';
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Padding(
              padding: const EdgeInsets.all(24.0),
              child: Consumer<AuthProvider>(
                builder: (context, authProvider, child) {
                  return Form(
                    key: _formKey,
                    child: SingleChildScrollView(
                      keyboardDismissBehavior:
                          ScrollViewKeyboardDismissBehavior.onDrag,
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          const Icon(
                            Icons.account_circle,
                            size: 80,
                            color: Colors.deepPurple,
                          ),
                          const SizedBox(height: 24),
                          Text(
                            'Welcome',
                            style: Theme.of(context).textTheme.headlineMedium
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Colors.deepPurple,
                                ),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'Sign in to your account',
                            style: Theme.of(context).textTheme.bodyLarge
                                ?.copyWith(color: Colors.grey[600]),
                            textAlign: TextAlign.center,
                          ),
                          const SizedBox(height: 48),

                          // Email Field
                          TextFormField(
                            controller: _emailController,
                            keyboardType: TextInputType.emailAddress,
                            decoration: const InputDecoration(
                              labelText: 'Email',
                              prefixIcon: Icon(Icons.email),
                              border: OutlineInputBorder(),
                            ),
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Please enter your email';
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
                              labelText: 'Password',
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
                                return 'Please enter your password';
                              }
                              if (value.length < 6) {
                                return 'Password must be at least 6 characters';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 8),

                          // Forgot Password Link
                          Align(
                            alignment: Alignment.centerRight,
                            child: TextButton(
                              onPressed: () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (context) =>
                                        const ForgotPasswordScreen(),
                                  ),
                                );
                              },
                              child: const Text('Forgot Password?'),
                            ),
                          ),
                          const SizedBox(height: 24),

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

                          ElevatedButton(
                            onPressed: authProvider.isLoading
                                ? null
                                : _handleLogin,
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
                                    'Sign In',
                                    style: TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                          ),
                          const SizedBox(height: 24),

                          // Debug Device ID Button - Commented out for production
                          // Container(
                          //   margin: const EdgeInsets.only(bottom: 16),
                          //   child: OutlinedButton.icon(
                          //     onPressed: () async {
                          //       final localContext = context;
                          //       final scaffoldMessenger = ScaffoldMessenger.of(
                          //         context,
                          //       );
                          //       try {
                          //         final deviceId =
                          //             await DeviceIdHelper.getDeviceId();
                          //         final deviceInfo =
                          //             await DeviceIdHelper.getDeviceInfo();
                          //
                          //         if (!localContext.mounted) return;
                          //
                          //         showDialog(
                          //           context: localContext,
                          //           builder: (dialogContext) => AlertDialog(
                          //             title: const Text('Device Information'),
                          //             content: SingleChildScrollView(
                          //               child: Column(
                          //                 crossAxisAlignment:
                          //                     CrossAxisAlignment.start,
                          //                 mainAxisSize: MainAxisSize.min,
                          //                 children: [
                          //                   Text('Device ID: $deviceId'),
                          //                   const SizedBox(height: 8),
                          //                   Text(
                          //                     'Platform: ${deviceInfo['platform']}',
                          //                   ),
                          //                   if (deviceInfo['model'] != null)
                          //                     Text(
                          //                       'Model: ${deviceInfo['model']}',
                          //                     ),
                          //                   if (deviceInfo['brand'] != null)
                          //                     Text(
                          //                       'Brand: ${deviceInfo['brand']}',
                          //                     ),
                          //                   if (deviceInfo['error'] != null)
                          //                     Text(
                          //                       'Error: ${deviceInfo['error']}',
                          //                       style: const TextStyle(
                          //                         color: Colors.red,
                          //                       ),
                          //                     ),
                          //                 ],
                          //               ),
                          //             ),
                          //             actions: [
                          //               TextButton(
                          //                 onPressed: () =>
                          //                     Navigator.pop(dialogContext),
                          //                 child: const Text('Close'),
                          //               ),
                          //             ],
                          //           ),
                          //         );
                          //       } catch (e) {
                          //         if (!localContext.mounted) return;
                          //         scaffoldMessenger.showSnackBar(
                          //           SnackBar(
                          //             content: Text(
                          //               'Error getting device ID: $e',
                          //             ),
                          //             backgroundColor: Colors.red,
                          //           ),
                          //         );
                          //       }
                          //     },
                          //     icon: const Icon(Icons.phone_android),
                          //     label: const Text('Test Device ID'),
                          //     style: OutlinedButton.styleFrom(
                          //       foregroundColor: Colors.deepPurple,
                          //     ),
                          //   ),
                          // ),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                "Don't have an account? ",
                                style: TextStyle(color: Colors.grey[600]),
                              ),
                              TextButton(
                                onPressed: () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (context) =>
                                          const SignUpScreen(),
                                    ),
                                  );
                                },
                                child: const Text(
                                  'Sign Up',
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
        ),
      ),
    );
  }
}
