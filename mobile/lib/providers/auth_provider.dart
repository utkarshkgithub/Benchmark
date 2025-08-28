import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  Map<String, dynamic>? _user;
  bool _isLoading = false;
  String? _error;

  static const String _tokenKey = 'auth_token';
  static const String _userKey = 'user_data';

  // Getters
  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _token != null;

  /// Initialize the auth provider and load stored data
  Future<void> init() async {
    await _loadStoredData();
  }

  /// Load token and user data from storage
  Future<void> _loadStoredData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString(_tokenKey);

      final userJson = prefs.getString(_userKey);
      if (userJson != null) {
        // Note: You might want to use json.decode here if storing as JSON
        // For now, treating as simple string storage
      }

      notifyListeners();
    } catch (e) {
      _error = 'Failed to load stored authentication data';
      notifyListeners();
    }
  }

  /// Store token in persistent storage
  Future<void> _storeToken(String? token) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (token != null) {
        await prefs.setString(_tokenKey, token);
      } else {
        await prefs.remove(_tokenKey);
      }
    } catch (e) {
      _error = 'Failed to store authentication token';
      notifyListeners();
    }
  }

  /// Store user data in persistent storage
  Future<void> _storeUser(Map<String, dynamic>? user) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      if (user != null) {
        // Convert to JSON string if needed
        // await prefs.setString(_userKey, json.encode(user));
        // For now, just remove when null
      } else {
        await prefs.remove(_userKey);
      }
    } catch (e) {
      _error = 'Failed to store user data';
      notifyListeners();
    }
  }

  /// Get stored token from storage
  Future<String?> getStoredToken() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      return prefs.getString(_tokenKey);
    } catch (e) {
      return null;
    }
  }

  // Setters
  Future<void> setToken(String? token) async {
    _token = token;
    await _storeToken(token);
    notifyListeners();
  }

  Future<void> setUser(Map<String, dynamic>? user) async {
    _user = user;
    await _storeUser(user);
    notifyListeners();
  }

  void setLoading(bool loading) {
    _isLoading = loading;
    notifyListeners();
  }

  void setError(String? error) {
    _error = error;
    notifyListeners();
  }

  void clearError() {
    _error = null;
    notifyListeners();
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    _error = null;
    await _storeToken(null);
    await _storeUser(null);
    notifyListeners();
  }
}
