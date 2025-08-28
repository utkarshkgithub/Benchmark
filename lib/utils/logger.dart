// lib/utils/logger.dart
import 'package:logger/logger.dart';

// Create a configured logger instance for the entire app
final logger = Logger(
  printer: PrettyPrinter(
    methodCount: 2, // Number of method calls to display
    errorMethodCount: 8, // Number of method calls if error
    lineLength: 120, // Width of the output
    colors: true, // Colorful log messages
    printEmojis: true, // Print an emoji for each log message
    // printTime: false, // Should each log print contain a timestamp
  ),
  // You can set different log levels for different environments
  level: Level.debug, // Set to Level.info for production
);

// Convenience methods for common logging patterns
class AppLogger {
  // Log successful operations
  static void success(String message, [dynamic data]) {
    if (data != null) {
      logger.i('✅ $message\nData: $data');
    } else {
      logger.i('✅ $message');
    }
  }

  // Log informational messages
  static void info(String message, [dynamic data]) {
    if (data != null) {
      logger.i('ℹ️ $message\nData: $data');
    } else {
      logger.i('ℹ️ $message');
    }
  }

  // Log debug information (only in debug mode)
  static void debug(String message, [dynamic data]) {
    if (data != null) {
      logger.d('🐛 $message\nData: $data');
    } else {
      logger.d('🐛 $message');
    }
  }

  // Log warnings
  static void warning(String message, [dynamic data]) {
    if (data != null) {
      logger.w('⚠️ $message\nData: $data');
    } else {
      logger.w('⚠️ $message');
    }
  }

  // Log errors with optional error object and stack trace
  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    logger.e('❌ $message', error: error, stackTrace: stackTrace);
  }

  // Log device-related operations
  static void device(String message, [dynamic data]) {
    if (data != null) {
      logger.i('📱 Device: $message\nData: $data');
    } else {
      logger.i('📱 Device: $message');
    }
  }

  // Log location-related operations
  static void location(String message, [dynamic data]) {
    if (data != null) {
      logger.i('📍 Location: $message\nData: $data');
    } else {
      logger.i('📍 Location: $message');
    }
  }

  // Log attendance-related operations
  static void attendance(String message, [dynamic data]) {
    if (data != null) {
      logger.i('✔️ Attendance: $message\nData: $data');
    } else {
      logger.i('✔️ Attendance: $message');
    }
  }

  // Log authentication-related operations
  static void auth(String message, [dynamic data]) {
    if (data != null) {
      logger.i('🔐 Auth: $message\nData: $data');
    } else {
      logger.i('🔐 Auth: $message');
    }
  }

  // Log network-related operations
  static void network(String message, [dynamic data]) {
    if (data != null) {
      logger.i('🌐 Network: $message\nData: $data');
    } else {
      logger.i('🌐 Network: $message');
    }
  }
}
