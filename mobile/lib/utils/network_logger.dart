import 'dart:convert';
import 'package:http/http.dart' as http;

import 'logger.dart';

/// Centralized network logger to capture exact request/response payloads.
class NetworkLogger {
  /// Logs an outgoing HTTP request.
  static void logRequest({
    required String method,
    required Uri url,
    Map<String, String>? headers,
    Object? body,
  }) {
    AppLogger.network('HTTP Request → $method ${url.toString()}');
    if (headers != null && headers.isNotEmpty) {
      AppLogger.network('Request Headers', headers);
    }
    if (body != null) {
      if (body is String) {
        AppLogger.network('Request Body (raw)', body);
      } else {
        // Fallback to JSON encode for non-string body
        try {
          AppLogger.network('Request Body (json)', jsonEncode(body));
        } catch (_) {
          AppLogger.network('Request Body (object)', body.toString());
        }
      }
    }
  }

  /// Logs an incoming HTTP response.
  static void logResponse({
    required http.Response response,
    Duration? duration,
  }) {
    final req = response.request;
    final method = req?.method ?? 'UNKNOWN';
    final url = req?.url.toString() ?? 'UNKNOWN_URL';
    final took = duration != null ? ' in ${duration.inMilliseconds}ms' : '';
    AppLogger.network(
      'HTTP Response ← $method $url → ${response.statusCode}$took',
    );
    if (response.headers.isNotEmpty) {
      AppLogger.network('Response Headers', response.headers);
    }
    AppLogger.network('Response Body', response.body);
  }
}
