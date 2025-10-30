import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../utils/security_guard.dart';
import 'splash_screen.dart';

class SecurityScreen extends StatefulWidget {
  final Widget nextScreen;
  
  const SecurityScreen({
    super.key,
    required this.nextScreen,
  });

  @override
  State<SecurityScreen> createState() => _SecurityScreenState();
}

class _SecurityScreenState extends State<SecurityScreen> {
  bool _isLoading = true;
  bool _isAuthenticating = false;
  String _statusMessage = 'Checking device security...';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _performSecurityCheck();
    });
  }

  Future<void> _performSecurityCheck() async {
    try {
      setState(() {
        _isLoading = true;
        _isAuthenticating = false;
        _statusMessage = 'Checking device security...';
      });

      // Check if biometric is available
      final bool biometricAvailable = await SecurityGuard.isBiometricAvailable();
      
      if (biometricAvailable) {
        setState(() {
          _statusMessage = 'Biometric authentication required...';
          _isAuthenticating = true;
        });
      } else {
        setState(() {
          _statusMessage = 'Device authentication required...';
          _isAuthenticating = true;
        });
      }

      // Perform authentication
      final bool authenticated = await SecurityGuard.checkAndAuthenticate(context);
      
      if (authenticated) {
        // Authentication successful - navigate to next screen
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (_) => SplashScreen(nextScreen: widget.nextScreen),
            ),
          );
        }
      } else {
        // Authentication failed - stay on security screen
        setState(() {
          _isLoading = false;
          _isAuthenticating = false;
          _statusMessage = 'Authentication required to continue';
        });
      }
    } catch (e) {
      // Handle unexpected errors
      setState(() {
        _isLoading = false;
        _isAuthenticating = false;
        _statusMessage = 'Security check failed';
      });
      
      if (mounted) {
        _showErrorDialog('Security Error', 'An unexpected error occurred: $e');
      }
    }
  }

  void _showErrorDialog(String title, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => SystemNavigator.pop(),
            child: const Text('Exit App'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // App logo or icon
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    color: Theme.of(context).primaryColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Icon(
                    Icons.security,
                    size: 60,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Title
                Text(
                  'Security Check',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).primaryColor,
                  ),
                ),
                
                const SizedBox(height: 16),
                
                // Status message
                Text(
                  _statusMessage,
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                    color: Colors.grey[600],
                  ),
                ),
                
                const SizedBox(height: 32),
                
                // Loading indicator
                if (_isLoading || _isAuthenticating)
                  Column(
                    children: [
                      SizedBox(
                        width: 40,
                        height: 40,
                        child: CircularProgressIndicator(
                          strokeWidth: 3,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Theme.of(context).primaryColor,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      if (_isAuthenticating)
                        Text(
                          'Please complete authentication',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[500],
                          ),
                        ),
                    ],
                  ),
                
                // Show message when authentication fails
                if (!_isLoading && !_isAuthenticating)
                  Column(
                    children: [
                      Text(
                        'Authentication is required to continue',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.red[600],
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      
                      const SizedBox(height: 16),
                      
                      TextButton(
                        onPressed: () => SystemNavigator.pop(),
                        child: const Text('Exit App'),
                      ),
                    ],
                  ),
                
                const SizedBox(height: 32),
                
                // Info text
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.blue.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.info_outline,
                        color: Colors.blue[700],
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'This app requires device security to be enabled for your protection.',
                          style: TextStyle(
                            color: Colors.blue[700],
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}