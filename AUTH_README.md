# Authentication Frontend Documentation

## Overview
This Flutter app provides a complete authentication frontend with login, signup, forgot password, and home screens. The backend functions are defined but not implemented - they contain placeholder code and TODO comments for actual backend integration.

## Features

### 🔐 Authentication Screens
- **Login Screen**: Email/password authentication with validation
- **Sign Up Screen**: User registration with form validation
- **Forgot Password Screen**: Password reset functionality
- **Home Screen**: Protected dashboard with user profile display

### 🛠 Technical Implementation
- **State Management**: Provider pattern for authentication state
- **Form Validation**: Real-time form validation with error messages
- **Loading States**: Loading indicators during API calls
- **Error Handling**: User-friendly error messages
- **Navigation**: Proper screen transitions and routing

## Project Structure

```
lib/
├── main.dart                          # App entry point with Provider setup
├── providers/
│   └── auth_provider.dart            # Authentication state management
├── services/
│   └── auth_service.dart             # Backend API functions (placeholders)
└── screens/
    ├── login_screen.dart             # Login form and validation
    ├── signup_screen.dart            # Registration form
    ├── forgot_password_screen.dart   # Password reset form
    └── home_screen.dart              # Protected dashboard
```

## Backend Integration Guide

### 1. Auth Service Functions

The `AuthService` class in `lib/services/auth_service.dart` contains placeholder functions that need backend implementation:

#### Login Function
```dart
static Future<String> login(String email, String password) async {
  // TODO: Implement backend API call
  // Example: POST /api/auth/login
  // Return: JWT token or session token
}
```

#### Signup Function
```dart
static Future<String> signup(String email, String password, String name) async {
  // TODO: Implement backend API call
  // Example: POST /api/auth/signup
  // Return: JWT token or session token
}
```

#### Reset Password Function
```dart
static Future<String> resetPassword(String email) async {
  // TODO: Implement backend API call
  // Example: POST /api/auth/reset-password
  // Return: Success message
}
```

#### Additional Functions
- `logout(String token)`: Invalidate user session
- `validateToken(String token)`: Check token validity
- `getUserProfile(String token)`: Get user profile data

### 2. API Integration Steps

1. **Replace placeholder implementations** with actual HTTP calls
2. **Add proper error handling** for network and server errors
3. **Implement token storage** (SharedPreferences or secure storage)
4. **Add request/response models** for type safety
5. **Configure base URLs** and API endpoints

### 3. Recommended Backend APIs

```
POST /api/auth/login
POST /api/auth/signup
POST /api/auth/logout
POST /api/auth/reset-password
GET  /api/auth/validate
GET  /api/user/profile
```

## Running the App

1. **Install dependencies**:
   ```bash
   flutter pub get
   ```

2. **Run the app**:
   ```bash
   flutter run
   ```

3. **Test authentication flow**:
   - The app will show the login screen
   - Use any email/password combination (mock authentication)
   - Navigate through signup and forgot password flows

## Form Validation

### Login Screen
- Email: Valid email format required
- Password: Minimum 6 characters

### Signup Screen
- Name: Minimum 2 characters
- Email: Valid email format
- Password: Minimum 6 characters
- Confirm Password: Must match password

### Forgot Password Screen
- Email: Valid email format required

## State Management

The app uses the Provider pattern for state management:

- **AuthProvider**: Manages authentication state (token, user, loading, errors)
- **Consumer widgets**: Listen to state changes and rebuild UI
- **Global state**: Authentication state persists across screens

## UI/UX Features

- **Material Design 3**: Modern Flutter design system
- **Responsive layouts**: Works on different screen sizes
- **Max width constraint**: Auth pages limited to 400px width to prevent over-stretching
- **Loading indicators**: Visual feedback during operations
- **Error messages**: Clear error communication
- **Form validation**: Real-time input validation
- **Password visibility toggle**: Enhanced user experience

## Next Steps for Backend Integration

1. **Choose HTTP client**: Add `http` or `dio` package
2. **Set up models**: Create request/response data models
3. **Configure endpoints**: Set up API base URLs
4. **Add authentication**: Implement JWT or session handling
5. **Error handling**: Add proper exception handling
6. **Local storage**: Implement token persistence
7. **Testing**: Add unit and integration tests

## Dependencies

```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  provider: ^6.1.2  # State management
```

## Contributing

When implementing backend integration:
1. Follow the existing code structure
2. Maintain consistent error handling
3. Add proper documentation
4. Test all authentication flows
5. Ensure security best practices
