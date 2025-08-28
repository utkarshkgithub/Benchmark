import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_dotenv/flutter_dotenv.dart';
import '../utils/logger.dart';
import '../models/user_models.dart';

class AuthService {
  // Get the backend URL from the environment variables
  static final String? _backendUrl = dotenv.env['BACKEND_URL'];

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
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final signupUrl = Uri.parse('$_backendUrl/api/v1/auth/signup');

    // The data to be sent in the request body
    final Map<String, String> body = {
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
    };

    try {
      AppLogger.auth('Attempting to register user: $email');

      final response = await http.post(
        signupUrl,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode(body),
      );

      // Check if the request was successful
      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = jsonDecode(response.body);

        // Parse the response into our SignupResponse model
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
        // Handle server errors
        final errorData = jsonDecode(response.body);
        final errorMessage = errorData['message'] ?? 'Unknown error';
        AppLogger.error('Failed to sign up user: $email', errorMessage);
        throw Exception('Failed to sign up: $errorMessage');
      }
    } catch (e) {
      AppLogger.error('Error occurred during signup', e);
      throw Exception('An error occurred during signup: $e');
    }
  }

  /// Authenticates a user with email, password, and deviceId.
  /// Returns a user token on success.
  static Future<String> mobileLogin({
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
      final response = await http.post(
        loginUrl,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        final String token = responseData['token'];
        return token;
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

  /// Changes user password with current password verification
  /// Returns success message on completion
  static Future<String> changePassword({
    required String email,
    required String currentPassword,
    required String newPassword,
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

    try {
      AppLogger.auth('Attempting to change password for email: $email');

      final response = await http.post(
        changePasswordUrl,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode(body),
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

  /// Sends OTP to the user's email address
  /// Returns success message on completion
  static Future<String> sendOTP({required String email}) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final sendOTPUrl = Uri.parse('$_backendUrl/api/v1/auth/sendOTP');

    final Map<String, String> body = {"email": email};

    try {
      AppLogger.auth('Attempting to send OTP to email: $email');

      final response = await http.post(
        sendOTPUrl,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode(body),
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

  /// Resets user password using email, OTP, and new password
  /// Returns success message on completion
  static Future<String> forgotPassword({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    if (_backendUrl == null) {
      throw Exception("BACKEND_URL is not set in the .env file");
    }

    final forgotPasswordUrl = Uri.parse(
      '$_backendUrl/api/v1/auth/forgotpassword',
    );

    final Map<String, String> body = {
      "email": email,
      "otp": otp,
      "newpassword": newPassword,
    };

    try {
      AppLogger.auth('Attempting forgot password reset for email: $email');

      final response = await http.post(
        forgotPasswordUrl,
        headers: {'Content-Type': 'application/json; charset=UTF-8'},
        body: jsonEncode(body),
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
      AppLogger.error('Error occurred during password reset', e);
      throw Exception('An error occurred during password reset: $e');
    }
  }

  // --- Other methods from your original class can be implemented similarly ---

  /// Logs out the current user
  static Future<void> logout(String token) async {
    // TODO: Implement backend API call for logout
  }

  /// Validates if the current token is still valid
  static Future<bool> validateToken(String token) async {
    // TODO: Implement backend API call for token validation
    return true;
  }

  /// Gets current user profile
  static Future<Map<String, dynamic>> getUserProfile(String token) async {
    // TODO: Implement backend API call to get user profile
    return {};
  }
}
