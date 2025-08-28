import 'package:flutter/material.dart';

class AuthUtils {
  // Email validation regex
  static final RegExp _emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');

  /// Validates email format
  static bool isValidEmail(String email) {
    return _emailRegex.hasMatch(email.trim());
  }

  /// Validates password strength
  static bool isValidPassword(String password) {
    return password.length >= 6;
  }

  /// Validates name format
  static bool isValidName(String name) {
    return name.trim().length >= 2;
  }

  /// Email validation for forms
  static String? validateEmail(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your email';
    }
    if (!isValidEmail(value)) {
      return 'Please enter a valid email';
    }
    return null;
  }

  /// Password validation for forms
  static String? validatePassword(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your password';
    }
    if (!isValidPassword(value)) {
      return 'Password must be at least 6 characters';
    }
    return null;
  }

  /// Name validation for forms
  static String? validateName(String? value) {
    if (value == null || value.isEmpty) {
      return 'Please enter your full name';
    }
    if (!isValidName(value)) {
      return 'Name must be at least 2 characters';
    }
    return null;
  }

  /// Confirm password validation
  static String? validateConfirmPassword(String? value, String password) {
    if (value == null || value.isEmpty) {
      return 'Please confirm your password';
    }
    if (value != password) {
      return 'Passwords do not match';
    }
    return null;
  }

  /// Show error snackbar
  static void showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Show success snackbar
  static void showSuccessSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  /// Format authentication errors for user display
  static String formatAuthError(dynamic error) {
    String errorMessage = error.toString();

    // Remove "Exception: " prefix if present
    if (errorMessage.startsWith('Exception: ')) {
      errorMessage = errorMessage.substring(11);
    }

    // Common error mappings
    switch (errorMessage.toLowerCase()) {
      case 'invalid credentials':
        return 'Invalid email or password. Please try again.';
      case 'user not found':
        return 'No account found with this email address.';
      case 'email already exists':
        return 'An account with this email already exists.';
      case 'weak password':
        return 'Password is too weak. Please choose a stronger password.';
      case 'network error':
        return 'Network connection failed. Please check your internet connection.';
      case 'server error':
        return 'Server error occurred. Please try again later.';
      default:
        return errorMessage.isEmpty
            ? 'An unexpected error occurred.'
            : errorMessage;
    }
  }

  /// Sanitize input strings
  static String sanitizeInput(String input) {
    return input.trim();
  }

  /// Generate secure display name from email
  static String getDisplayNameFromEmail(String email) {
    final parts = email.split('@');
    if (parts.isNotEmpty) {
      final username = parts[0];
      // Capitalize first letter
      return username.isNotEmpty
          ? '${username[0].toUpperCase()}${username.substring(1)}'
          : 'User';
    }
    return 'User';
  }

  /// Check if token is expired (basic JWT check)
  static bool isTokenExpired(String token) {
    // TODO: Implement actual JWT token expiration check
    // This is a placeholder implementation
    try {
      // Basic check - you should implement proper JWT decoding
      final parts = token.split('.');
      if (parts.length != 3) return true;

      // For now, consider mock tokens as valid for 1 hour
      if (token.startsWith('mock_user_token_')) {
        final timestamp = int.tryParse(token.split('_').last) ?? 0;
        final now = DateTime.now().millisecondsSinceEpoch;
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

        return (now - timestamp) > oneHour;
      }

      return false;
    } catch (e) {
      return true; // Consider invalid tokens as expired
    }
  }
}
