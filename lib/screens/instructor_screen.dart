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
class PresentStudent {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String? rollNumber;

  PresentStudent({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    this.rollNumber,
  });

  factory PresentStudent.fromJson(Map<String, dynamic> json) {
    String email = json['email'] ?? '';
    String rollNumber = '';
    if (email.contains('.') && email.contains('@')) {
      rollNumber = email.split('@').first.split('.').last;
    }
    return PresentStudent(
      id: json['_id'] ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      rollNumber: rollNumber,
    );
  }

  String get fullName => '$firstName $lastName';
}

class AttendanceRecord {
  final String id;
  final DateTime date;
  final String branch;
  final int totalStudents;
  final List<PresentStudent> presentStudents;

  AttendanceRecord({
    required this.id,
    required this.date,
    required this.branch,
    required this.totalStudents,
    required this.presentStudents,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      id: json['_id'] ?? '',
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      branch: json['branch'] ?? '',
      totalStudents: json['totalStudents'] ?? 0,
      presentStudents: (json['presentStudent'] as List<dynamic>? ?? [])
          .map((student) => PresentStudent.fromJson(student))
          .toList(),
    );
  }
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
  bool _showQr = false;
  SubjectInfo? _selectedSubject; // Changed to SubjectInfo object
  List<SubjectInfo> _subjects = []; // Changed to SubjectInfo list
  Timer? _countdownTimer;
  int _remainingSeconds = 120; // 2 minutes countdown
  bool _showAttendance = false;
  List<AttendanceRecord> _attendanceData = [];
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
        setState(() {
          _subjects = updatedSubjects;
          // Update selected subject by finding it with the same subject id
          if (selectedSubjectId != null) {
            _selectedSubject = updatedSubjects.firstWhere(
              (subject) => subject.id == selectedSubjectId,
              orElse: () => updatedSubjects.isNotEmpty ? updatedSubjects.first : _selectedSubject!,
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

    setState(() {
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
        _selectedSubject!.subjectCode,
        token,
      );

      // Check different possible response keys
      String? qrToken;
      if (response['qrtoken'] != null) {
        qrToken = response['qrtoken'].toString();
      } else if (response['token'] != null) {
        qrToken = response['token'].toString();
      } else if (response['data'] != null &&
          response['data']['qrtoken'] != null) {
        qrToken = response['data']['qrtoken'].toString();
      }

      print('Debug: Extracted QR Token: $qrToken');

      if (qrToken == null || qrToken.isEmpty) {
        throw Exception(
          'No QR token received from server. Response: $response',
        );
      }

      setState(() {
        _qrToken = qrToken;
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
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _startCountdown() {
    _countdownTimer?.cancel();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      setState(() {
        if (_remainingSeconds > 0) {
          _remainingSeconds--;
        } else {
          _closeQR();
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
    _countdownTimer?.cancel();
    setState(() {
      _showQr = false;
      _qrToken = null;
      _remainingSeconds = 120;
    });
  }

  Future<void> _fetchAttendanceData() async {
    if (_selectedSubject == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a subject first')),
      );
      return;
    }

    setState(() {
      _isLoadingAttendance = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final token = authProvider.token;

      if (token == null) {
        throw Exception('No authentication token found');
      }

      final url =
          'https://benchmark-official.onrender.com/api/v1/subject/fetch-by-subject/${_selectedSubject!.id}';

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['success'] == true) {
          final attendanceList = data['attendance'] as List<dynamic>? ?? [];
          final records = attendanceList
              .map((record) => AttendanceRecord.fromJson(record))
              .toList();

          // Sort by date and keep only the latest record
          records.sort((a, b) => b.date.compareTo(a.date));
          final latestRecord = records.isNotEmpty
              ? [records.first]
              : <AttendanceRecord>[];

          setState(() {
            _attendanceData = latestRecord;
            _showAttendance = true;
          });
        } else {
          throw Exception('Failed to fetch attendance data');
        }
      } else {
        throw Exception('HTTP ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to fetch attendance: $e')),
        );
      }
    } finally {
      setState(() {
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
      onPopInvoked: (didPop) {
        if (!didPop) {
          // Handle back gesture when pop is prevented
          if (_showQr) {
            _closeQR();
          } else if (_showAttendance) {
            setState(() {
              _showAttendance = false;
              _attendanceData.clear();
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
                          setState(() {
                            _showAttendance = false;
                            _attendanceData.clear();
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
              // Logo/Title
              const Icon(
                Icons.account_circle,
                size: 80,
                color: Colors.deepPurple,
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
                    setState(() {
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

                // // Branch selection
                // if (_selectedSubject != null) ...[
                //   if (_selectedSubject!.branches.isNotEmpty) ...[
                //     Text(
                //       'Select Branches:',
                //       style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                //         fontWeight: FontWeight.w600,
                //       ),
                //     ),
                //     const SizedBox(height: 8),
                //     Container(
                //       padding: const EdgeInsets.all(12),
                //       decoration: BoxDecoration(
                //         border: Border.all(color: Colors.grey[400]!),
                //         borderRadius: BorderRadius.circular(8),
                //       ),
                //       child: Column(
                //         children: [
                //           for (String branch in _selectedSubject!.branches)
                //             CheckboxListTile(
                //               title: Text(
                //                 branch,
                //                 style: const TextStyle(fontSize: 16),
                //               ),
                //               value: _selectedBranches[branch] ?? false,
                //               onChanged: (bool? value) {
                //                 setState(() {
                //                   _selectedBranches[branch] = value ?? false;

                //                   // Ensure at least one branch is selected
                //                   if (!_selectedBranches.values.any(
                //                     (selected) => selected,
                //                   )) {
                //                     // If trying to uncheck the last selected branch, prevent it
                //                     _selectedBranches[branch] = true;
                //                     ScaffoldMessenger.of(context).showSnackBar(
                //                       const SnackBar(
                //                         content: Text(
                //                           'At least one branch must be selected',
                //                         ),
                //                         duration: Duration(seconds: 2),
                //                       ),
                //                     );
                //                   }
                //                 });
                //               },
                //               controlAffinity: ListTileControlAffinity.leading,
                //               dense: true,
                //               activeColor: Colors.deepPurple,
                //               contentPadding: EdgeInsets.zero,
                //             ),
                //         ],
                //       ),
                //     ),
                //     const SizedBox(height: 8),
                //     Text(
                //       '${_getSelectedBranches.length} of ${_selectedSubject!.branches.length} branches selected',
                //       style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                //     ),
                //     const SizedBox(height: 24),
                //   ] else ...[
                //     // Show loading or message when branches are not available
                //     Container(
                //       padding: const EdgeInsets.all(16),
                //       decoration: BoxDecoration(
                //         color: Colors.orange[50],
                //         border: Border.all(color: Colors.orange[200]!),
                //         borderRadius: BorderRadius.circular(8),
                //       ),
                //       child: Row(
                //         children: [
                //           const SizedBox(
                //             width: 16,
                //             height: 16,
                //             child: CircularProgressIndicator(
                //               strokeWidth: 2,
                //               valueColor: AlwaysStoppedAnimation<Color>(
                //                 Colors.orange,
                //               ),
                //             ),
                //           ),
                //           const SizedBox(width: 12),
                //           Expanded(
                //             child: Text(
                //               'Loading branch information...',
                //               style: TextStyle(
                //                 color: Colors.orange[700],
                //                 fontSize: 14,
                //               ),
                //             ),
                //           ),
                //         ],
                //       ),
                //     ),
                //     const SizedBox(height: 24),
                //   ],
                // ] else ...[
                //   const SizedBox(height: 24),
                // ],
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
                    : const Text('Generate QR Code'),
              ),
              const SizedBox(height: 16),

              // Show Present Students Button
              ElevatedButton(
                onPressed: _isLoadingAttendance || _selectedSubject == null
                    ? null
                    : _fetchAttendanceData,
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
                    : const Text('Show Present Students'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildAttendanceContent() {
    return _attendanceData.isEmpty
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
            child: _buildAttendanceCard(_attendanceData.first),
          );
  }

  Widget _buildAttendanceCard(AttendanceRecord record) {
    // Sort students by roll number
    final sortedStudents = List<PresentStudent>.from(record.presentStudents);
    sortedStudents.sort((a, b) {
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
            // Date and Summary Info
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.deepPurple[50],
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.deepPurple[200]!),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today, color: Colors.deepPurple),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Latest Attendance',
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                            color: Colors.deepPurple,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _formatDate(record.date),
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          'Branch: ${record.branch}',
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey[600],
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
                      '${record.presentStudents.length} Present',
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
                ],
              ),
            ),
            const SizedBox(height: 8),

            // Students List
            if (sortedStudents.isEmpty)
              Container(
                padding: const EdgeInsets.all(32),
                child: const Center(
                  child: Text(
                    'No students marked present',
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
                itemCount: sortedStudents.length,
                itemBuilder: (context, studentIndex) {
                  final student = sortedStudents[studentIndex];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 2),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
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
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          flex: 2,
                          child: Text(
                            student.fullName,
                            style: const TextStyle(fontSize: 14),
                            textAlign: TextAlign.center,
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

  String _formatDate(DateTime date) {
    final months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${date.day} ${months[date.month - 1]} ${date.year} at ${date.hour.toString().padLeft(2, '0')}:${date.minute.toString().padLeft(2, '0')}';
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
