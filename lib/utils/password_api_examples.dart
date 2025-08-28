// Example usage of the password-related API endpoints
// This file demonstrates how to use sendOTP, changePassword, and forgotPassword APIs

import '../services/auth_service.dart';
import '../utils/logger.dart';

class PasswordAPIExamples {
  // Example 1: Send OTP to email
  static Future<void> sendOTPExample() async {
    try {
      final result = await AuthService.sendOTP(
        email: 'usaraamit2007@gmail.com',
      );

      AppLogger.success('OTP sent result: $result');
    } catch (e, stackTrace) {
      AppLogger.error('Failed to send OTP', e, stackTrace);
    }
  }

  // Example 2: Change password with current password verification
  static Future<void> changePasswordExample() async {
    try {
      final result = await AuthService.changePassword(
        email: 'usaraamit2007@gmail.com',
        currentPassword: '1111',
        newPassword: '5322',
      );

      AppLogger.success('Password change result: $result');
    } catch (e, stackTrace) {
      AppLogger.error('Failed to change password', e, stackTrace);
    }
  }

  // Example 3: Reset password using OTP
  static Future<void> forgotPasswordExample() async {
    try {
      final result = await AuthService.forgotPassword(
        email: 'usaraamit2007@gmail.com',
        otp: '666666',
        newPassword: 'newPassword123',
      );

      AppLogger.success('Password reset result: $result');
    } catch (e, stackTrace) {
      AppLogger.error('Failed to reset password', e, stackTrace);
    }
  }

  // Example 4: Complete OTP + Password Change flow
  static Future<bool> completeOTPPasswordChangeFlow({
    required String email,
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      AppLogger.info('Starting OTP + password change flow for: $email');

      // Step 1: Send OTP first
      await AuthService.sendOTP(email: email);
      AppLogger.success('OTP sent successfully');

      // Step 2: Validate inputs
      if (email.isEmpty || currentPassword.isEmpty || newPassword.isEmpty) {
        throw Exception('All fields are required');
      }

      if (newPassword.length < 6) {
        throw Exception('New password must be at least 6 characters');
      }

      if (currentPassword == newPassword) {
        throw Exception('New password must be different from current password');
      }

      // Step 3: Change password (assuming OTP is verified separately)
      final result = await AuthService.changePassword(
        email: email,
        currentPassword: currentPassword,
        newPassword: newPassword,
      );

      AppLogger.success('Password changed successfully: $result');
      return true;
    } catch (e, stackTrace) {
      AppLogger.error('OTP + Password change flow failed', e, stackTrace);
      return false;
    }
  }

  // Example 5: Complete Forgot Password flow with OTP
  static Future<bool> completeForgotPasswordFlow({
    required String email,
    required String otp,
    required String newPassword,
  }) async {
    try {
      AppLogger.info('Starting forgot password flow for: $email');

      // Step 1: Send OTP (usually done from UI)
      await AuthService.sendOTP(email: email);
      AppLogger.success('OTP sent for password reset');

      // Step 2: Validate inputs
      if (email.isEmpty || otp.isEmpty || newPassword.isEmpty) {
        throw Exception('All fields are required');
      }

      if (otp.length != 6) {
        throw Exception('OTP must be 6 digits');
      }

      if (newPassword.length < 6) {
        throw Exception('New password must be at least 6 characters');
      }

      // Step 3: Reset password using OTP
      final result = await AuthService.forgotPassword(
        email: email,
        otp: otp,
        newPassword: newPassword,
      );

      AppLogger.success('Password reset successfully: $result');
      return true;
    } catch (e, stackTrace) {
      AppLogger.error('Forgot password flow failed', e, stackTrace);
      return false;
    }
  }

  // Example 6: Registration flow with OTP
  static Future<bool> completeRegistrationWithOTP({
    required String email,
    required String otp,
  }) async {
    try {
      AppLogger.info('Starting registration OTP flow for: $email');

      // Step 1: Send OTP for registration
      await AuthService.sendOTP(email: email);
      AppLogger.success('Registration OTP sent successfully');

      // Step 2: Validate OTP format
      if (otp.length != 6) {
        throw Exception('OTP must be 6 digits');
      }

      AppLogger.success('Registration OTP validation completed');
      return true;
    } catch (e, stackTrace) {
      AppLogger.error('Registration OTP flow failed', e, stackTrace);
      return false;
    }
  }
}

// API endpoint configuration verification
class PasswordAPIEndpointVerification {
  static void logEndpointConfiguration() {
    AppLogger.info('=== Password API Endpoint Configuration ===');
    AppLogger.network('Send OTP Endpoint: {BACKEND_URL}/api/v1/auth/sendOTP');
    AppLogger.network(
      'Change Password Endpoint: {BACKEND_URL}/api/v1/auth/changepassword',
    );
    AppLogger.network(
      'Forgot Password Endpoint: {BACKEND_URL}/api/v1/auth/forgotpassword',
    );

    AppLogger.info('=== Expected Request Bodies ===');
    AppLogger.network('Send OTP Body: {"email": "user@example.com"}');
    AppLogger.network(
      'Change Password Body: {"email": "...", "currentpassword": "...", "newpassword": "..."}',
    );
    AppLogger.network(
      'Forgot Password Body: {"email": "...", "otp": "...", "newpassword": "..."}',
    );

    AppLogger.info('=== Response Handling ===');
    AppLogger.network('Success Status Codes: 200, 201');
    AppLogger.network('Error Handling: Extracts message from response body');
    AppLogger.network('Network Error: Caught and re-thrown with context');
    AppLogger.network(
      'Professional Logging: All operations logged with AppLogger',
    );
  }
}
