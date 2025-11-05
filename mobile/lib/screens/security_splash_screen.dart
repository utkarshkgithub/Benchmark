import 'dart:async';
import 'package:flutter/material.dart';
import '../utils/security_guard.dart';

class SecuritySplashScreen extends StatefulWidget {
  final Widget nextScreen;
  const SecuritySplashScreen({super.key, required this.nextScreen});

  @override
  State<SecuritySplashScreen> createState() => _SecuritySplashScreenState();
}

class _SecuritySplashScreenState extends State<SecuritySplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  bool _isAuthenticating = false;
  String _statusMessage = 'Loading...';

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );

    _fadeAnimation = CurvedAnimation(parent: _controller, curve: Curves.easeIn);

    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.6,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutBack));

    _controller.forward();

    // Start authentication after animation
    Timer(const Duration(seconds: 1), () {
      _performSecurityCheck();
    });
  }

  Future<void> _performSecurityCheck() async {
    if (!mounted) return;

    setState(() {
      _isAuthenticating = true;
      _statusMessage = 'Checking device security...';
    });

    try {
      // Check if biometric is available
      final bool biometricAvailable =
          await SecurityGuard.isBiometricAvailable();

      if (biometricAvailable) {
        setState(() {
          _statusMessage = 'Biometric authentication required...';
        });
      } else {
        setState(() {
          _statusMessage = 'Device authentication required...';
        });
      }

      // Perform authentication with retries
      final bool authenticated = await SecurityGuard.checkAndAuthenticate(
        context,
      );

      if (mounted) {
        if (authenticated) {
          // Authentication successful - navigate to next screen
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => widget.nextScreen),
          );
        } else {
          // Authentication failed - show error
          setState(() {
            _statusMessage = 'Authentication failed';
          });
        }
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _statusMessage = 'Security check failed';
        });
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            // Logo with animation
            FadeTransition(
              opacity: _fadeAnimation,
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: Image.asset(
                  "assets/icons/BENCHMARK.png",
                  width: 160,
                  fit: BoxFit.contain,
                ),
              ),
            ),

            const SizedBox(height: 40),

            // Status message
            if (_isAuthenticating)
              Column(
                children: [
                  Text(
                    _statusMessage,
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      color: Colors.grey[600],
                      fontWeight: FontWeight.w500,
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Loading indicator
                  SizedBox(
                    width: 30,
                    height: 30,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Theme.of(context).primaryColor,
                      ),
                    ),
                  ),

                  const SizedBox(height: 16),

                  Text(
                    'Please complete authentication',
                    style: Theme.of(
                      context,
                    ).textTheme.bodySmall?.copyWith(color: Colors.grey[500]),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
