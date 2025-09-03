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
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final signupUrl = Uri.parse('$_backendUrl/api/v1/auth/signup');

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

    try {
      AppLogger.auth('Attempting to register user: $email');
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
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        final signupResponse = SignupResponse.fromJson(responseData);

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
        AppLogger.error('Failed to sign up user: $email', errorMessage);
        throw Exception(
          'Failed to sign up: $errorMessage (Status: ${response.statusCode})',
        );
      }
    } catch (e) {
      AppLogger.error('Error occurred during signup', e);
      throw Exception('An error occurred during signup: $e');
    }
  }

  /// Authenticates a user with email, password, and deviceId.
  /// Returns LoginResponse (token + user data) on success.
  static Future<LoginResponse> mobileLogin({
    required String email,
    required String password,
    required String deviceId,
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final loginUrl = Uri.parse('$_backendUrl/api/v1/auth/mob-login');

    final Map<String, String> body = {
      "email": email,
      "password": password,
      "deviceId": deviceId,
    };

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
        throw Exception(
          'Failed to log in: ${errorData['message'] ?? 'Unknown error'}',
        );
      }
    } catch (e) {
      throw Exception('An error occurred during login: $e');
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
      '$_backendUrl/api/v1/auth/changepassword',
    );

    final Map<String, String> body = {
      "email": email,
      "currentpassword": currentPassword,
      "newpassword": newPassword,
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

  static Future<String> sendOTP({required String email}) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final sendOTPUrl = Uri.parse('$_backendUrl/api/v1/auth/sendOTP');

    final Map<String, String> body = {"email": email};

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

  static Future<String> forgotPassword({required String email}) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final forgotPasswordUrl = Uri.parse(
      '$_backendUrl/api/v1/auth/reset-password-token',
    );

    final Map<String, String> body = {"email": email};

    try {
      AppLogger.auth('Attempting to send magic link for email: $email');

      final headers = {'Content-Type': 'application/json; charset=UTF-8'};
      NetworkLogger.logRequest(
        method: 'POST',
        url: forgotPasswordUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      final start = DateTime.now();
      final response = await http.post(
        forgotPasswordUrl,
        headers: headers,
        body: jsonEncode(body),
      );
      NetworkLogger.logResponse(
        response: response,
        duration: DateTime.now().difference(start),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        AppLogger.success('Magic link sent successfully for email: $email');
        return responseData['message'] ?? 'Magic link sent successfully';
      } else {
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error(
          'Failed to send magic link for email: $email',
          errorMessage,
        );
        throw Exception('Failed to send magic link: $errorMessage');
      }
    } catch (e) {
      AppLogger.error('Error occurred during magic link sending', e);
      throw Exception('An error occurred during magic link sending: $e');
    }
  }

  static Future<Map<String, dynamic>> generateQRToken(
    String subjectCode,
    String token,
  ) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final qrTokenUrl = Uri.parse('$_backendUrl/api/v1/subject/qrcode');

    final Map<String, String> body = {"subjectCode": subjectCode};

    try {
      AppLogger.auth(
        'Attempting to generate QR token for subject: $subjectCode',
      );

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
          'QR token generated successfully for subject: $subjectCode',
        );
        return responseData;
      } else {
        print(
          'Debug: QR Token API Error - Status: ${response.statusCode}, Body: ${response.body}',
        );
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error(
          'Failed to generate QR token for subject: $subjectCode',
          errorMessage,
        );
        throw Exception('Failed to generate QR token: $errorMessage');
      }
    } catch (e) {
      AppLogger.error('Error occurred during QR token generation', e);
      throw Exception('An error occurred during QR token generation: $e');
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
