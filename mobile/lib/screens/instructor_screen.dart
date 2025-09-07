import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:async';
import '../services/auth_service.dart';
import '../models/user_models.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';

// Attendance data models
class AttendanceStudent {
  final String studentId;
  final String name;
  final String email;
  final String status;
  final String? rollNumber;

  AttendanceStudent({
    required this.studentId,
    required this.name,
    required this.email,
    required this.status,
    this.rollNumber,
  });

  factory AttendanceStudent.fromJson(Map<String, dynamic> json) {
    String email = json['email'] ?? '';
    String rollNumber = '';
    if (email.contains('.') && email.contains('@')) {
      rollNumber = email.split('@').first.split('.').last;
    }
    return AttendanceStudent(
      studentId: json['student'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      status: json['status'] ?? 'Absent',
      rollNumber: rollNumber,
    );
  }

  bool get isPresent => status.toLowerCase() == 'present';
}

class AttendanceDetails {
  final String id;
  final List<AttendanceStudent> students;

  AttendanceDetails({required this.id, required this.students});

  factory AttendanceDetails.fromJson(Map<String, dynamic> json) {
    return AttendanceDetails(
      id: json['_id'] ?? '',
      students: (json['students'] as List<dynamic>? ?? [])
          .map((student) => AttendanceStudent.fromJson(student))
          .toList(),
    );
  }

  List<AttendanceStudent> get presentStudents =>
      students.where((student) => student.isPresent).toList();
}

class InstructorPage extends StatefulWidget {
  final User user;

  const InstructorPage({super.key, required this.user});

  @override
  State<InstructorPage> createState() => _InstructorPageState();
}

class _InstructorPageState extends State<InstructorPage> {
  bool _isLoading = false;
  String? _qrToken;
  String? _attendanceId; // Store attendance ID from QR generation
  bool _showQr = false;
  bool _activeQr = false; // Track if QR is currently active
  SubjectInfo? _selectedSubject; // Changed to SubjectInfo object
  List<SubjectInfo> _subjects = []; // Changed to SubjectInfo list
  Timer? _countdownTimer;
  int _remainingSeconds = 120; // 2 minutes countdown
  bool _showAttendance = false;
  AttendanceDetails? _attendanceData;
  bool _isLoadingAttendance = false;

  // Branch selection state - removed since branch selection was disabled
  // Map<String, bool> _selectedBranches = {};

  @override
  void initState() {
    super.initState();
    // Extract subjects from user data
    _subjects = widget.user.subjectsTaught;

    // Select first subject by default if available
    if (_subjects.isNotEmpty) {
      _selectedSubject = _subjects.first;
    }

    // Fetch complete subject data with branches
    _fetchCompleteSubjectData();
  }

  void safeSetState(VoidCallback fn) {
    if (!mounted) return;
    setState(fn);
  }

  Future<void> _fetchCompleteSubjectData() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;

      if (token == null) {
        return;
      }

      final allSubjects = await AuthService.fetchAllSubjects(token);

      // Update our subjects list with the complete data
      List<SubjectInfo> updatedSubjects = [];
      String? selectedSubjectId = _selectedSubject?.id;

      for (var userSubject in _subjects) {
        // Find the matching subject in the complete data
        var completeSubject = allSubjects.firstWhere(
          (subject) => subject['_id'] == userSubject.id,
          orElse: () => <String, dynamic>{},
        );

        if (completeSubject.isNotEmpty) {
          // Use the complete subject data
          updatedSubjects.add(SubjectInfo.fromJson(completeSubject));
        } else {
          // Keep the original if not found
          updatedSubjects.add(userSubject);
        }
      }

      if (mounted) {
        safeSetState(() {
          _subjects = updatedSubjects;
          // Update selected subject by finding it with the same subject id
          if (selectedSubjectId != null) {
            _selectedSubject = updatedSubjects.firstWhere(
              (subject) => subject.id == selectedSubjectId,
              orElse: () => updatedSubjects.isNotEmpty
                  ? updatedSubjects.first
                  : _selectedSubject!,
            );
          }
        });
      }
    } catch (e) {
      // Continue with existing data if fetch fails
    }
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    super.dispose();
  }

  Future<void> _generateQRCode() async {
    if (_selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a subject first')),
      );
      return;
    }

    // If QR is already active, just show it instead of generating new one
    if (_activeQr && _qrToken != null && _remainingSeconds > 0) {
      safeSetState(() {
        _showQr = true;
      });
      // Don't restart the countdown timer - it should already be running
      return;
    }

    safeSetState(() {
      _isLoading = true;
    });

    try {
      // Get the auth token from the provider
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;

      if (token == null) {
        throw Exception('No authentication token found');
      }

      // Call the AuthService to generate QR token with selected subject code, branches, and token
      final response = await AuthService.generateQRToken(
        _selectedSubject!.id,
        token,
      );

      // Check different possible response keys
      String? qrToken;
      String? attendanceId;

      if (response['qrtoken'] != null) {
        qrToken = response['qrtoken'].toString();
      } else if (response['token'] != null) {
        qrToken = response['token'].toString();
      } else if (response['data'] != null &&
          response['data']['qrtoken'] != null) {
        qrToken = response['data']['qrtoken'].toString();
      }

      // Extract attendance ID
      if (response['attendenceId'] != null) {
        attendanceId = response['attendenceId'].toString();
      } else if (response['attendanceId'] != null) {
        attendanceId = response['attendanceId'].toString();
      }

      print('Debug: Extracted QR Token: $qrToken');
      print('Debug: Extracted Attendance ID: $attendanceId');

      if (qrToken == null || qrToken.isEmpty) {
        throw Exception(
          'No QR token received from server. Response: $response',
        );
      }

      safeSetState(() {
        _qrToken = qrToken;
        _attendanceId = attendanceId; // Store attendance ID
        _activeQr = true; // Mark QR as active
        _showQr = true;
        _remainingSeconds = 120; // Reset to 2 minutes
      });

      // Start countdown timer
      _startCountdown();

      print('Debug: QR Code should now be visible');
    } catch (e) {
      print('Debug: Error generating QR code: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to generate QR code: $e')),
        );
      }
    } finally {
      safeSetState(() {
        _isLoading = false;
      });
    }
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      safeSetState(() {
        if (_remainingSeconds > 0) {
          _remainingSeconds--;
        } else {
          // When timer expires, only reset QR-related state
          // Keep attendance ID so the attendance button stays enabled
          _showQr = false;
          _qrToken = null;
          _activeQr = false;
          _remainingSeconds = 120;
          timer.cancel();
        }
      });
    });
  }

  String _formatTime(int seconds) {
    int minutes = seconds ~/ 60;
    int remainingSeconds = seconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${remainingSeconds.toString().padLeft(2, '0')}';
  }

  void _closeQR() {
    // Don't cancel the countdown timer - let it continue running in background
    // because the QR expires on the backend in 2 minutes regardless of UI state
    safeSetState(() {
      _showQr = false;
      // Keep all QR data and timer running until it naturally expires
    });
  }

  void _showAttendanceOptions() {
    if (_attendanceId != null) {
      _fetchAttendanceData(_attendanceId!);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No attendance data available')),
      );
    }
  }

  Future<void> _fetchAttendanceData([String? specificAttendanceId]) async {
    final targetAttendanceId = specificAttendanceId ?? _attendanceId;

    if (targetAttendanceId == null || targetAttendanceId.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('No attendance data available')),
      );
      return;
    }

    safeSetState(() {
      _isLoadingAttendance = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final url =
          'https://benchmark-official.onrender.com/api/v2/subject/getAttendanceDetails';

      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
        body: json.encode({'attendanceId': targetAttendanceId}),
      );

      print('Debug: Attendance API Response: ${response.body}');

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true && data['attendance'] != null) {
          final attendanceDetails = AttendanceDetails.fromJson(
            data['attendance'],
          );

          safeSetState(() {
            _attendanceData = attendanceDetails;
            _showAttendance = true;
          });
        } else {
          throw Exception(
            'Failed to fetch attendance data: ${data['message'] ?? 'Unknown error'}',
          );
        }
      } else {
        throw Exception('HTTP ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      print('Debug: Error fetching attendance: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to fetch attendance: $e')),
        );
      }
    } finally {
      safeSetState(() {
        _isLoadingAttendance = false;
      });
    }
  }

  Future<void> _logout() async {
    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout();

      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (context) => const LoginScreen()),
          (route) => false,
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Logout failed: $e')));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    print(
      'Debug: Building InstructorPage - showQr: $_showQr, qrToken: $_qrToken ',
    );
    return PopScope(
      canPop:
          !_showQr && !_showAttendance, // Only allow pop when on main screen
      onPopInvokedWithResult: (didPop, result) {
        if (!didPop) {
          // Handle back gesture when pop is prevented
          if (_showQr) {
            _closeQR();
          } else if (_showAttendance) {
            safeSetState(() {
              _showAttendance = false;
              _attendanceData = null;
            });
          }
        }
      },
      child: Scaffold(
        appBar: _showQr
            ? null
            : AppBar(
                title: _showAttendance
                    ? Text(
                        'Attendance - ${_selectedSubject?.subjectName ?? 'Subject'}',
                      )
                    : const Text('Instructor Dashboard'),
                backgroundColor: _showAttendance
                    ? Colors.white
                    : Colors.deepPurple,
                foregroundColor: _showAttendance ? Colors.black : Colors.white,
                elevation: _showAttendance ? 0 : null,
                automaticallyImplyLeading: _showAttendance,
                leading: _showAttendance
                    ? IconButton(
                        icon: const Icon(Icons.arrow_back, color: Colors.black),
                        onPressed: () {
                          safeSetState(() {
                            _showAttendance = false;
                            _attendanceData = null;
                          });
                        },
                      )
                    : null,
                bottom: _showAttendance
                    ? PreferredSize(
                        preferredSize: const Size.fromHeight(1.0),
                        child: Container(
                          color: Colors.grey.shade300,
                          height: 1.0,
                        ),
                      )
                    : null,
                actions: _showAttendance
                    ? null
                    : [
                        IconButton(
                          onPressed: _logout,
                          icon: const Icon(Icons.logout),
                          tooltip: 'Logout',
                        ),
                      ],
              ),
        body: SafeArea(
          child: _showQr && _qrToken != null
              ? _buildQrScreen()
              : _showAttendance
              ? _buildAttendanceContent()
              : _buildMainContent(),
        ),
      ),
    );
  }

  Widget _buildMainContent() {
    return Center(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 400),
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Logo/Title - User Profile Image
              // User Profile Image - Circular Design
              // User Profile Image - Perfect Circle Design
              // User Profile Image - Perfect Circle Design
              // User Profile Image - Perfect Circle
              CircleAvatar(
                radius: 75, // This creates a perfect circle with diameter 150
                backgroundColor: Colors.grey[200],
                child: Container(
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: Colors.deepPurple.withValues(alpha: 0.3),
                      width: 3,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.15),
                        spreadRadius: 1,
                        blurRadius: 8,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: widget.user.image.isNotEmpty
                      ? ClipOval(
                          child: Image.network(
                            widget.user.image,
                            width: 150,
                            height: 150,
                            fit: BoxFit.cover,
                            headers: const {
                              'User-Agent':
                                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                              'Accept':
                                  'image/svg+xml,image/png,image/jpeg,image/gif,image/*,*/*;q=0.8',
                            },
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) {
                                return child;
                              }
                              return const Center(
                                child: CircularProgressIndicator(
                                  color: Colors.deepPurple,
                                  strokeWidth: 2.0,
                                ),
                              );
                            },
                            errorBuilder: (context, error, stackTrace) {
                              return const Icon(
                                Icons.person,
                                size: 60,
                                color: Colors.deepPurple,
                              );
                            },
                          ),
                        )
                      : const Icon(
                          Icons.person,
                          size: 60,
                          color: Colors.deepPurple,
                        ),
                ),
              ),

              const SizedBox(height: 24),
              Text(
                'Welcome ${widget.user.firstName} ${widget.user.lastName}',
                style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.deepPurple,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'This is the instructor page',
                style: Theme.of(
                  context,
                ).textTheme.bodyLarge?.copyWith(color: Colors.grey[600]),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),

              // Subject selection dropdown
              if (_subjects.isNotEmpty) ...[
                Text(
                  'Select Subject:',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  key: ValueKey(_selectedSubject?.id ?? 'no-subject'),
                  value: _selectedSubject?.id,
                  items: _subjects.map((SubjectInfo subject) {
                    return DropdownMenuItem<String>(
                      value: subject.id,
                      child: Text(
                        '${subject.subjectName} (${subject.subjectCode})',
                      ),
                    );
                  }).toList(),
                  onChanged: (String? newValue) {
                    safeSetState(() {
                      _selectedSubject = _subjects.firstWhere(
                        (subject) => subject.id == newValue,
                        orElse: () => _subjects.first,
                      );
                    });
                  },
                  decoration: const InputDecoration(
                    border: OutlineInputBorder(),
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 8,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ] else ...[
                Text(
                  'No subjects assigned',
                  style: Theme.of(
                    context,
                  ).textTheme.bodyMedium?.copyWith(color: Colors.grey[600]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
              ],

              ElevatedButton(
                onPressed: _isLoading || _selectedSubject == null
                    ? null
                    : _generateQRCode,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepPurple,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : Text(
                        _activeQr && _remainingSeconds > 0
                            ? 'Show QR Code'
                            : 'Generate QR Code',
                      ),
              ),

              // Show active QR status when QR is generated but not displayed
              if (_activeQr && !_showQr && _remainingSeconds > 0) ...[
                const SizedBox(height: 16),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: Colors.green[200]!),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.qr_code, color: Colors.green),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'QR Code Active',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.green,
                              ),
                            ),
                            Text(
                              'Time remaining: ${_formatTime(_remainingSeconds)}',
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.green[700],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 16),

              // Show Present Students Button
              ElevatedButton(
                onPressed: _isLoadingAttendance || _attendanceId == null
                    ? null
                    : _showAttendanceOptions,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.deepPurple[400],
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                ),
                child: _isLoadingAttendance
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(
                            Colors.white,
                          ),
                        ),
                      )
                    : Text(
                        _attendanceId == null
                            ? 'Generate QR First'
                            : 'Show Attendance Records',
                      ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAttendanceContent() {
    return _attendanceData == null
        ? const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.no_accounts, size: 64, color: Colors.grey),
                SizedBox(height: 16),
                Text(
                  'No attendance records found',
                  style: TextStyle(fontSize: 18, color: Colors.grey),
                ),
              ],
            ),
          )
        : SingleChildScrollView(
            padding: const EdgeInsets.all(16),
            child: _buildAttendanceCard(_attendanceData!),
          );
  }

  Widget _buildAttendanceCard(AttendanceDetails attendanceDetails) {
    // Get present students and sort by roll number
    final presentStudents = attendanceDetails.presentStudents;
    presentStudents.sort((a, b) {
      final rollA = a.rollNumber ?? '';
      final rollB = b.rollNumber ?? '';
      return rollA.compareTo(rollB);
    });

    return Card(
      elevation: 4,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Summary Info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.deepPurple[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.deepPurple[200]!),
              ),
              child: Row(
                children: [
                  const Icon(Icons.people, color: Colors.deepPurple),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Attendance Details',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.deepPurple,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Subject: ${_selectedSubject?.subjectName ?? 'Unknown'}',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Total Students: ${attendanceDetails.students.length}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
                          ),
                        ),
                        // Show session type - only current session
                        if (_attendanceId != null &&
                            attendanceDetails.id == _attendanceId)
                          Container(
                            margin: const EdgeInsets.only(top: 4),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green[100],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              'Latest Session',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.green[700],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 8,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.deepPurple,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Text(
                      '${presentStudents.length} Present',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Students List Header
            Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: Colors.deepPurple[100],
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Expanded(
                    flex: 1,
                    child: Text(
                      'Roll No.',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Colors.deepPurple,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Expanded(
                    flex: 2,
                    child: Text(
                      'Student Name',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Colors.deepPurple,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  Expanded(
                    flex: 1,
                    child: Text(
                      'Status',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Colors.deepPurple,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),

            // Students List
            if (attendanceDetails.students.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                child: const Center(
                  child: Text(
                    'No students found',
                    style: TextStyle(
                      fontSize: 16,
                      color: Colors.grey,
                      fontStyle: FontStyle.italic,
                    ),
                  ),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: attendanceDetails.students.length,
                itemBuilder: (context, studentIndex) {
                  final student = attendanceDetails.students[studentIndex];
                  final isPresent = student.isPresent;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 2),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 14,
                      vertical: 12,
                    ),
                    decoration: BoxDecoration(
                      color: studentIndex % 2 == 0
                          ? Colors.white
                          : Colors.deepPurple[25],
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: Colors.deepPurple[100]!,
                        width: 0.5,
                      ),
                    ),
                    child: Row(
                      children: [
                        Expanded(
                          flex: 1,
                          child: Text(
                            student.rollNumber ?? 'N/A',
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Text(
                            student.name,
                            style: const TextStyle(fontSize: 14),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          flex: 1,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: isPresent
                                  ? Colors.green[100]
                                  : Colors.red[100],
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Text(
                              student.status,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: isPresent
                                    ? Colors.green[700]
                                    : Colors.red[700],
                              ),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildQrScreen() {
    print('Debug: Building QR Screen with token: $_qrToken ...');
    return Stack(
      children: [
        // Background with slight opacity
        Container(color: Colors.black.withValues(alpha: 0.05)),

        // QR Code in the center
        Center(
          child: Container(
            margin: const EdgeInsets.all(8.0),
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.1),
                  blurRadius: 10,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  'Subject: ${_selectedSubject?.subjectName ?? 'Unknown'}',
                  style: Theme.of(
                    context,
                  ).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                Text(
                  'Code: ${_selectedSubject?.subjectCode ?? 'Unknown'}',
                  style: Theme.of(
                    context,
                  ).textTheme.titleMedium?.copyWith(color: Colors.grey[600]),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),

                // Countdown Timer
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  decoration: BoxDecoration(
                    color: _remainingSeconds <= 30
                        ? Colors.red[50]
                        : Colors.green[50],
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: _remainingSeconds <= 30
                          ? Colors.red
                          : Colors.green,
                      width: 2,
                    ),
                  ),
                  child: Text(
                    'Time remaining: ${_formatTime(_remainingSeconds)}',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: _remainingSeconds <= 30
                          ? Colors.red[700]
                          : Colors.green[700],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // QR Code - Made much larger
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!, width: 1),
                  ),
                  child: QrImageView(
                    data: _qrToken!,
                    version: 1,
                    size:
                        MediaQuery.of(context).size.width *
                        0.9, // Increased from 0.6 to 0.8
                    backgroundColor: Colors.white,
                    eyeStyle: const QrEyeStyle(
                      eyeShape: QrEyeShape.square,
                      color: Colors.black, // 👀 Color for the eyes
                    ),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square,
                      color: Colors.black, // 🎯 Color for the dots
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),

        // Close button at the bottom
        Positioned(
          bottom: 40,
          left: 0,
          right: 0,
          child: Center(
            child: ElevatedButton(
              onPressed: _closeQR,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
              ),
              child: const Text('Close QR'),
            ),
          ),
        ),
      ],
    );
  }
}
