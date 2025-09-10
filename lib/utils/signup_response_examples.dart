// Example usage of the updated signup API with proper response handling
// This demonstrates how to work with the new SignupResponse structure

import '../services/auth_service.dart';
import '../models/user_models.dart';
import '../utils/logger.dart';

class SignupAPIExamples {
  // Example 1: Complete signup flow with response handling
  static Future<void> completeSignupExample() async {
    try {
      // Call the signup API
      final signupResponse = await AuthService.signup(
        firstName: 'Amit',
        lastName: 'usara',
        email: 'usaraamit200756@gmail.com',
        accountType: 'Student',
        password: 'yourpassword',
        otp: '123456',
        rollNumber: '230101024',
        branch: 'CSE',
        semester: 'V',
        deviceId: 'qw2ert',
      );

      // Log the successful response
      AppLogger.success('Signup successful!');
      AppLogger.info('Response message: ${signupResponse.message}');

      // Access user data
      AppLogger.auth('User Details:');
      AppLogger.auth('- User ID: ${signupResponse.user.userId}');
      AppLogger.auth('- Full Name: ${signupResponse.userDetails.fullName}');
      AppLogger.auth('- Email: ${signupResponse.userDetails.email}');
      AppLogger.auth('- Roll Number: ${signupResponse.user.rollNumber}');
      AppLogger.auth('- Branch: ${signupResponse.user.branch}');
      AppLogger.auth('- Semester: ${signupResponse.user.semester}');
      AppLogger.auth('- Device ID: ${signupResponse.user.deviceId}');
      AppLogger.auth(
        '- Account Type: ${signupResponse.userDetails.accountType}',
      );
      AppLogger.auth('- Profile Image: ${signupResponse.userDetails.image}');
      AppLogger.auth('- Account Active: ${signupResponse.userDetails.active}');
      AppLogger.auth(
        '- Account Approved: ${signupResponse.userDetails.approved}',
      );

      // Create user session for app state management
      final userSession = UserSession.fromSignupResponse(signupResponse);
      AppLogger.success('User session created successfully');
      AppLogger.info('Session data: ${userSession.toJson()}');
    } catch (e, stackTrace) {
      AppLogger.error('Signup failed', e, stackTrace);
    }
  }

  // Example 2: Validate response structure
  static void validateResponseStructure() {
    AppLogger.info('=== Expected Signup Response Structure ===');
    AppLogger.network('''
{
  "success": true,
  "user": {
    "userId": "68b056457b39e1011f94011f",
    "deviceId": "qw2ert",
    "rollNumber": "230101024",
    "branch": "CSE",
    "semester": "V",
    "subjects": [],
    "_id": "68b056467b39e1011f940121",
    "createdAt": "2025-08-28T13:14:46.034Z",
    "updatedAt": "2025-08-28T13:14:46.034Z",
    "__v": 0
  },
  "userDetails": {
    "firstName": "Amit",
    "lastName": "usara",
    "email": "usaraamit200756@gmail.com",
    "password": "\$2b\$10\$3cbibUM1XSW1VzvGC8Vgn.h1hKYwIdj.WvNtHKLec8kaRsnw1Bh5u",
    "accountType": "Student",
    "active": true,
    "approved": true,
    "image": "https://api.dicebear.com/5.x/initials/svg?seed=Amit%20usara",
    "_id": "68b056457b39e1011f94011f",
    "createdAt": "2025-08-28T13:14:45.926Z",
    "updatedAt": "2025-08-28T13:14:45.926Z",
    "__v": 0
  },
  "message": "User registered successfully."
}''');

    AppLogger.info('=== Response Parsing ===');
    AppLogger.network('- Parses into SignupResponse model');
    AppLogger.network('- Extracts User and UserDetails objects');
    AppLogger.network('- Creates UserSession for app state');
    AppLogger.network('- Handles DateTime parsing for timestamps');
    AppLogger.network('- Provides helper methods like fullName');
  }

  // Example 3: Error handling scenarios
  static Future<void> handleSignupErrors() async {
    try {
      // This will fail due to invalid OTP
      await AuthService.signup(
        firstName: 'Test',
        lastName: 'User',
        email: 'test@iiitbh.com',
        accountType: 'Student',
        password: 'password123',
        otp: '000000', // Invalid OTP
        rollNumber: '123456',
        branch: 'CSE',
        semester: 'I',
        deviceId: 'test_device',
      );
    } catch (e) {
      AppLogger.warning('Expected error caught: $e');
      AppLogger.info('Error handling working correctly');
    }
  }

  // Example 4: Compare old vs new response handling
  static void compareResponseHandling() {
    AppLogger.info('=== Response Handling Comparison ===');

    AppLogger.warning('OLD (Token-based):');
    AppLogger.network('- Expected: {"token": "jwt_token_string"}');
    AppLogger.network('- Returned: String token');
    AppLogger.network('- Usage: authProvider.setToken(token)');

    AppLogger.success('NEW (User Data-based):');
    AppLogger.network('- Returns: Complete user and profile data');
    AppLogger.network(
      '- Models: SignupResponse, User, UserDetails, UserSession',
    );
    AppLogger.network('- Usage: authProvider.setUser(userSession.toJson())');
    AppLogger.network('- Benefits: Rich user data immediately available');
    AppLogger.network('- Session: Uses userId as session identifier');
  }

  // Example 5: UserSession usage in app
  static void demonstrateUserSessionUsage() {
    AppLogger.info('=== UserSession Usage Examples ===');

    // Mock signup response for demonstration
    final mockResponse = {
      "success": true,
      "user": {
        "userId": "68b056457b39e1011f94011f",
        "deviceId": "qw2ert",
        "rollNumber": "230101024",
        "branch": "CSE",
        "semester": "V",
        "subjects": [],
        "_id": "68b056467b39e1011f940121",
        "createdAt": "2025-08-28T13:14:46.034Z",
        "updatedAt": "2025-08-28T13:14:46.034Z",
        "__v": 0,
      },
      "userDetails": {
        "firstName": "Amit",
        "lastName": "usara",
        "email": "usaraamit200756@gmail.com",
        "password":
            "\$2b\$10\$3cbibUM1XSW1VzvGC8Vgn.h1hKYwIdj.WvNtHKLec8kaRsnw1Bh5u",
        "accountType": "Student",
        "active": true,
        "approved": true,
        "image": "https://api.dicebear.com/5.x/initials/svg?seed=Amit%20usara",
        "_id": "68b056457b39e1011f94011f",
        "createdAt": "2025-08-28T13:14:45.926Z",
        "updatedAt": "2025-08-28T13:14:45.926Z",
        "__v": 0,
      },
      "message": "User registered successfully.",
    };

    try {
      final signupResponse = SignupResponse.fromJson(mockResponse);
      final userSession = UserSession.fromSignupResponse(signupResponse);

      AppLogger.info('UserSession Properties:');
      AppLogger.info('- userId: ${userSession.userId}');
      AppLogger.info('- email: ${userSession.email}');
      AppLogger.info('- fullName: ${userSession.fullName}');
      AppLogger.info('- rollNumber: ${userSession.rollNumber}');
      AppLogger.info('- branch: ${userSession.branch}');
      AppLogger.info('- semester: ${userSession.semester}');
      AppLogger.info('- deviceId: ${userSession.deviceId}');
      AppLogger.info('- accountType: ${userSession.accountType}');
      AppLogger.info('- profileImage: ${userSession.profileImage}');
      AppLogger.info('- isActive: ${userSession.isActive}');
      AppLogger.info('- isApproved: ${userSession.isApproved}');

      AppLogger.success('UserSession can be used throughout the app for:');
      AppLogger.info('- Displaying user profile information');
      AppLogger.info('- Attendance tracking with rollNumber');
      AppLogger.info('- Device verification with deviceId');
      AppLogger.info('- Academic info display (branch, semester)');
      AppLogger.info('- Account status checking (active, approved)');
    } catch (e, stackTrace) {
      AppLogger.error('Error in UserSession demonstration', e, stackTrace);
    }
  }
}
