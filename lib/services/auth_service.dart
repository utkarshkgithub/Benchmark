import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../utils/logger.dart';
import '../utils/network_logger.dart';
import '../models/user_models.dart';

class AuthService {
  // Get the backend URL from the environment variables
  static final String? _backendUrl = dotenv.env['BACKEND_URL'];

  // Store the current session token
  static String? _currentSessionToken;

  /// Set the current session token (to be called after login)
  static void setSessionToken(String token) {
    _currentSessionToken = token;
  }

  /// Get the current session token
  static String? getSessionToken() {
    return _currentSessionToken;
  }

  /// Registers a new user by sending data to the signup endpoint.
  /// Returns SignupResponse with user data on success.
  static Future<SignupResponse> signup({
    required String firstName,
    required String lastName,
    required String email,
    required String accountType,
    required String password,
    required String otp,
    required String rollNumber,
    required String branch,
    required String semester,
    required String deviceId,
    List<String>? subjects,
    // Enhanced device data (optional)
    String? deviceType,
    String? platform,
    String? enhancedDeviceId,
    String? legacyDeviceId,
    String? publicKey,
    String? deviceFingerprint,
    String? additionalDeviceInfo,
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final signupUrl = Uri.parse('$_backendUrl/api/v2/auth/signup');

    final Map<String, dynamic> body = {
      "firstName": firstName,
      "lastName": lastName,
      "email": email,
      "accountType": accountType,
      "password": password,
      "otp": otp,
      "rollNumber": rollNumber,
      "branch": branch,
      "semester": semester,
      "deviceId": deviceId,
      "subjects": subjects ?? [],
    };

    // Add enhanced device data if available
    // if (deviceType != null) {
    //   body["deviceType"] = deviceType;
    // }
    if (additionalDeviceInfo != null) {
      body["additionaldeviceId"] = additionalDeviceInfo;
    }

    try {
      AppLogger.auth('Attempting to register user: $email');

      // Add debug logging
      print('DEBUG: Signup attempt for email: $email');
      print('DEBUG: Device ID: $deviceId');
      print('DEBUG: Roll Number: $rollNumber');
      print('DEBUG: Branch: $branch, Semester: $semester');
      print('DEBUG: Signup request body: $body');

      final headers = {'Content-Type': 'application/json; charset=UTF-8'};
      NetworkLogger.logRequest(
        method: 'POST',
        url: signupUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      final start = DateTime.now();
      final response = await http.post(
        signupUrl,
        headers: headers,
        body: jsonEncode(body),
      );

      print('DEBUG: Signup response status: ${response.statusCode}');
      print('DEBUG: Signup response body: ${response.body}');

      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);

        // Validate that user data is properly returned
        if (responseData['user'] == null) {
          print('DEBUG: Registration succeeded but user data is missing');
          throw Exception(
            'Registration succeeded but user data is missing. Please contact support.',
          );
        }

        final signupResponse = SignupResponse.fromJson(responseData);

        // // Additional validation
        // if (signupResponse.user.email != email) {
        //   print(
        //     'DEBUG: Registration data mismatch - requested: $email, received: ${signupResponse.user.email}',
        //   );
        //   throw Exception(
        //     'Registration data mismatch. Please try again or contact support.',
        //   );
        // }

        print(
          'DEBUG: Signup successful for user: ${signupResponse.user.email}',
        );
        print('DEBUG: User ID: ${signupResponse.user.userId}');
        print('DEBUG: Roll Number: ${signupResponse.user.rollNumber}');
        print('DEBUG: Device ID in response: ${signupResponse.user.deviceId}');

        AppLogger.success(
          'User registered successfully: ${signupResponse.userDetails.fullName}',
        );
        AppLogger.auth('User ID: ${signupResponse.user.userId}');
        AppLogger.auth('Roll Number: ${signupResponse.user.rollNumber}');
        AppLogger.auth('Branch: ${signupResponse.user.branch}');
        AppLogger.auth('Semester: ${signupResponse.user.semester}');

        return signupResponse;
      } else {
        AppLogger.error(
          'Signup failed with status code: ${response.statusCode}',
        );
        AppLogger.error('Response body: ${response.body}');

        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';

        print(
          'DEBUG: Signup failed - Status: ${response.statusCode}, Message: $errorMessage',
        );

        // Better error handling for specific cases
        if (errorMessage.toLowerCase().contains('device') &&
            errorMessage.toLowerCase().contains('assigned')) {
          print('DEBUG: Device ID conflict detected');
          throw Exception(
            'This device is already registered with another account. Each device can only be used for one account.',
          );
        }

        if (errorMessage.toLowerCase().contains('email') &&
            errorMessage.toLowerCase().contains('exists')) {
          print('DEBUG: Email already exists');
          throw Exception(
            'An account with this email already exists. Please use the login page instead.',
          );
        }

        AppLogger.error('Failed to sign up user: $email', errorMessage);
        throw Exception(errorMessage);
      }
    } catch (e) {
      print('DEBUG: Signup exception: $e');
      AppLogger.error('Error occurred during signup', e);

      if (e.toString().contains('ClientException') ||
          e.toString().contains('SocketException') ||
          e.toString().contains('Failed host lookup')) {
        throw Exception(
          'No internet connection. Please check your network and try again.',
        );
      }

      // Re-throw the original exception if it's already formatted
      if (e.toString().startsWith('Exception: ')) {
        rethrow;
      }

      throw Exception('An error occurred during signup: $e');
    }
  }

  /// Authenticates a user with email, password, and deviceId.
  /// Returns LoginResponse (token + user data) on success.
  static Future<LoginResponse> mobileLogin({
    required String email,
    required String password,
    required String deviceId,
    String? additionalDeviceInfo,
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final loginUrl = Uri.parse('$_backendUrl/api/v2/auth/mob-login');

    final Map<String, dynamic> body = {
      "email": email,
      "password": password,
      "deviceId": deviceId,
    };

    // Add AdditionalDeviceInfo if available
    if (additionalDeviceInfo != null) {
      body["additionaldeviceId"] = additionalDeviceInfo;
    }

    try {
      final headers = {'Content-Type': 'application/json; charset=UTF-8'};
      NetworkLogger.logRequest(
        method: 'POST',
        url: loginUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      final start = DateTime.now();
      final response = await http.post(
        loginUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);

        // Debug: Log the raw API response
        print('Raw API Response: $responseData');
        if (responseData['user'] != null) {
          print('User object from API: ${responseData['user']}');
        }

        final loginResponse = LoginResponse.fromJson(responseData);

        // Store the session token for future requests
        setSessionToken(loginResponse.token);

        return loginResponse;
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error(
          'Login failed with status code: ${response.statusCode}',
        );
        AppLogger.error('Login error message: $errorMessage');
        throw Exception(errorMessage);
      }
    } catch (e) {
      // Handle specific network exceptions
      if (e.toString().contains('ClientException') ||
          e.toString().contains('SocketException') ||
          e.toString().contains('Failed host lookup')) {
        AppLogger.error('Network connectivity error during login', e);
        throw Exception(
          'No internet connection. Please check your network and try again.',
        );
      }

      // If it's already a formatted error message from the API, throw it as is
      if (e.toString().contains('Exception: ') &&
          !e.toString().contains('An error occurred during login') &&
          !e.toString().contains('Network error:')) {
        rethrow;
      }

      // Otherwise, it's a parsing or other error
      AppLogger.error('Unexpected error during login', e);
      throw Exception('Something went wrong. Please try again.');
    }
  }

  static Future<String> changePassword({
    required String email,
    required String currentPassword,
    required String newPassword,
    String? token,
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final changePasswordUrl = Uri.parse(
      '$_backendUrl/api/v2/auth/changepassword',
    );

    final Map<String, String> body = {
      "email": email,
      "currentpassword": currentPassword,
      "password": newPassword,
    };

    final Map<String, String> headers = {
      'Content-Type': 'application/json; charset=UTF-8',
    };

    if (token != null && token.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    try {
      AppLogger.auth('Attempting to change password for email: $email');

      NetworkLogger.logRequest(
        method: 'POST',
        url: changePasswordUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      final start = DateTime.now();
      final response = await http.post(
        changePasswordUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        AppLogger.success('Password changed successfully for email: $email');
        return responseData['message'] ?? 'Password changed successfully';
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error(
          'Failed to change password for email: $email',
          errorMessage,
        );
        throw Exception('Failed to change password: $errorMessage');
      }
    } catch (e) {
      AppLogger.error('Error occurred during password change', e);
      throw Exception('An error occurred during password change: $e');
    }
  }

  static Future<String> sendOTP({
    required String email,
    bool isForgotPassword = false,
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final sendOTPUrl = Uri.parse('$_backendUrl/api/v2/auth/sendOTP');

    final Map<String, dynamic> body = {"email": email};

    // Add message field for forgot password context
    if (isForgotPassword) {
      body["extra"] = "Forgot-Password";
    }

    try {
      AppLogger.auth('Attempting to send OTP to email: $email');

      final headers = {'Content-Type': 'application/json; charset=UTF-8'};
      NetworkLogger.logRequest(
        method: 'POST',
        url: sendOTPUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      final start = DateTime.now();
      final response = await http.post(
        sendOTPUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        AppLogger.success('OTP sent successfully to email: $email');
        return responseData['message'] ?? 'OTP sent successfully';
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error('Failed to send OTP to email: $email', errorMessage);
        throw Exception('Failed to send OTP: $errorMessage');
      }
    } catch (e) {
      AppLogger.error('Error occurred while sending OTP', e);
      throw Exception('An error occurred while sending OTP: $e');
    }
  }

  // static Future<String> verifyOTP({
  //   required String email,
  //   required String otp,
  // }) async {
  //   if (_backendUrl == null) {
  //     throw Exception("BACKEND_URL is not set in the .env file");
  //   }

  //   final verifyOTPUrl = Uri.parse('$_backendUrl/api/v2/auth/verifyotp');

  //   final Map<String, dynamic> body = {"email": email, "otp": otp};

  //   try {
  //     AppLogger.auth('Attempting to verify OTP for email: $email');

  //     final headers = {'Content-Type': 'application/json; charset=UTF-8'};
  //     NetworkLogger.logRequest(
  //       method: 'POST',
  //       url: verifyOTPUrl,
  //       headers: headers,
  //       body: jsonEncode(body),
  //     );
  //     final start = DateTime.now();
  //     final response = await http.post(
  //       verifyOTPUrl,
  //       headers: headers,
  //       body: jsonEncode(body),
  //     );
  //     NetworkLogger.logResponse(
  //       response: response,
  //       duration: DateTime.now().difference(start),
  //     );

  //     if (response.statusCode == 200 || response.statusCode == 201) {
  //       final responseData = jsonDecode(response.body);
  //       AppLogger.success('OTP verified successfully for email: $email');
  //       return responseData['message'] ?? 'OTP verified successfully';
  //     } else {
  //       final errorData = jsonDecode(response.body);
  //       final errorMessage = errorData['message'] ?? 'Unknown error';
  //       AppLogger.error('Failed to verify OTP for email: $email', errorMessage);
  //       throw Exception('Failed to verify OTP: $errorMessage');
  //     }
  //   } catch (e) {
  //     AppLogger.error('Error occurred while verifying OTP', e);
  //     throw Exception('An error occurred while verifying OTP: $e');
  //   }
  // }

  static Future<String> resetPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final resetPasswordUrl = Uri.parse('$_backendUrl/api/v2/auth/verifyotp');

    final Map<String, dynamic> body = {
      "email": email,
      "otp": otp,
      "password": newPassword,
    };

    try {
      AppLogger.auth('Attempting to reset password for email: $email');

      final headers = {'Content-Type': 'application/json; charset=UTF-8'};
      NetworkLogger.logRequest(
        method: 'POST',
        url: resetPasswordUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      final start = DateTime.now();
      final response = await http.post(
        resetPasswordUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        AppLogger.success('Password reset successfully for email: $email');
        return responseData['message'] ?? 'Password reset successfully';
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error(
          'Failed to reset password for email: $email',
          errorMessage,
        );
        throw Exception('Failed to reset password: $errorMessage');
      }
    } catch (e) {
      AppLogger.error('Error occurred while resetting password', e);
      throw Exception('An error occurred while resetting password: $e');
    }
  }

  static Future<Map<String, dynamic>> generateQRToken(
    String subjectId,
    String token,
  ) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final qrTokenUrl = Uri.parse('$_backendUrl/api/v2/subject/qrcode');

    final Map<String, dynamic> body = {"subjectId": subjectId};

    try {
      final headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer $token',
      };
      NetworkLogger.logRequest(
        method: 'POST',
        url: qrTokenUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      final start = DateTime.now();
      final response = await http.post(
        qrTokenUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        print('Debug: QR Token API Response: $responseData');
        AppLogger.success(
          'QR token generated successfully for subject: $subjectId ',
        );
        return responseData;
      } else {
        print(
          'Debug: QR Token API Error - Status: ${response.statusCode}, Body: ${response.body}',
        );
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error(
          'Failed to generate QR token for subject: $subjectId',
          errorMessage,
        );
        throw Exception('Failed to generate QR token: $errorMessage');
      }
    } catch (e) {
      AppLogger.error('Error occurred during QR token generation', e);
      throw Exception('An error occurred during QR token generation: $e');
    }
  }

  static Future<List<Map<String, dynamic>>> fetchAllSubjects(
    String token,
  ) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final fetchSubjectsUrl = Uri.parse(
      '$_backendUrl/api/v2/subject/fetch-subjects',
    );

    try {
      AppLogger.auth('Attempting to fetch all subjects');

      final headers = {
        'Content-Type': 'application/json; charset=UTF-8',
        'Authorization': 'Bearer $token',
      };

      NetworkLogger.logRequest(
        method: 'GET',
        url: fetchSubjectsUrl,
        headers: headers,
      );

      final start = DateTime.now();
      final response = await http.get(fetchSubjectsUrl, headers: headers);

      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        print('Debug: Fetch Subjects API Response: $responseData');

        if (responseData['success'] == true && responseData['data'] != null) {
          AppLogger.success('Successfully fetched all subjects');
          return List<Map<String, dynamic>>.from(responseData['data']);
        } else {
          throw Exception('Invalid response format');
        }
      } else {
        print(
          'Debug: Fetch Subjects API Error - Status: ${response.statusCode}, Body: ${response.body}',
        );
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error('Failed to fetch subjects', errorMessage);
        throw Exception('Failed to fetch subjects: $errorMessage');
      }
    } catch (e) {
      AppLogger.error('Error occurred during subjects fetch', e);
      throw Exception('An error occurred during subjects fetch: $e');
    }
  }

  static Future<void> logout(String token) async {
    // TODO: Implement backend API call for logout
  }

  static Future<bool> validateToken(String token) async {
    // TODO: Implement backend API call for token validation
    return true;
  }

  static Future<Map<String, dynamic>> getUserProfile(String token) async {
    // TODO: Implement backend API call to get user profile
    return {};
  }
}
