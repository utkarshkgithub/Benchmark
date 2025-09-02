import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/home_screen.dart';
import 'screens/instructor_screen.dart';
import 'models/user_models.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables
  await dotenv.load(fileName: ".env");

  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late AuthProvider _authProvider;
  bool _isInitialized = false;

  @override
  void initState() {
    super.initState();
    _authProvider = AuthProvider();
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    await _authProvider.init();
    setState(() {
      _isInitialized = true;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (!_isInitialized) {
      return MaterialApp(
        title: 'Benchmark App',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
          useMaterial3: true,
        ),
        home: const Scaffold(body: Center(child: CircularProgressIndicator())),
        debugShowCheckedModeBanner: false,
      );
    }

    return ChangeNotifierProvider.value(
      value: _authProvider,
      child: MaterialApp(
        title: 'Benchmark App',
        theme: ThemeData(
          colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
          useMaterial3: true,
        ),
        home: Consumer<AuthProvider>(
          builder: (context, authProvider, child) {
            // Check if user is authenticated
            if (authProvider.isAuthenticated && authProvider.user != null) {
              // Check account type and route accordingly
              final accountType = authProvider.user!['accountType'];
              if (accountType == 'Instructor') {
                // Convert user data to User object for instructor page
                final user = User.fromJson(authProvider.user!);
                return InstructorPage(user: user);
              } else {
                return const HomeScreen();
              }
            } else {
              return const LoginScreen();
            }
          },
        ),
        debugShowCheckedModeBanner: false,
      ),
    );
  }
}
