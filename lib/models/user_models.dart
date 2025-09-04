// User data models for handling API responses

class SubjectInfo {
  final String id;
  final String subjectName;
  final String subjectCode;
  final String semester;
  final List<String> branches; // Changed from String to List<String>
  final String instructor;
  final List<dynamic> students;
  final int version;

  SubjectInfo({
    required this.id,
    required this.subjectName,
    required this.subjectCode,
    required this.semester,
    required this.branches,
    required this.instructor,
    required this.students,
    required this.version,
  });

  factory SubjectInfo.fromJson(Map<String, dynamic> json) {
    // Handle both single branch (old format) and multiple branches (new format)
    List<String> branches = [];

    try {
      if (json['branches'] != null && json['branches'] is List) {
        branches = List<String>.from(json['branches']);
      } else if (json['branch'] != null &&
          json['branch'].toString().isNotEmpty) {
        // Fallback for old format
        branches = [json['branch'].toString()];
      }
    } catch (e) {
      print('SubjectInfo.fromJson - Error parsing branches: $e');
      branches = [];
    }

    return SubjectInfo(
      id: json['_id']?.toString() ?? '',
      subjectName: json['subjectName']?.toString() ?? '',
      subjectCode: json['subjectCode']?.toString() ?? '',
      semester: json['semester']?.toString() ?? '',
      branches: branches,
      instructor: json['instructor']?.toString() ?? '',
      students: json['students'] ?? [],
      version: json['__v'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'subjectName': subjectName,
      'subjectCode': subjectCode,
      'semester': semester,
      'branches': branches,
      'instructor': instructor,
      'students': students,
      '__v': version,
    };
  }

  // Helper getter for backward compatibility
  String get branch => branches.isNotEmpty ? branches.first : '';
}

class LoginResponse {
  final String token;
  final User user;

  LoginResponse({required this.token, required this.user});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'],
      user: User.fromJson(json['user']),
    );
  }
}

class SignupResponse {
  final bool success;
  final User user;
  final UserDetails userDetails;
  final String message;

  SignupResponse({
    required this.success,
    required this.user,
    required this.userDetails,
    required this.message,
  });

  factory SignupResponse.fromJson(Map<String, dynamic> json) {
    return SignupResponse(
      success: json['success'] ?? false,
      user: User.fromJson(json['user']),
      userDetails: UserDetails.fromJson(json['userDetails']),
      message: json['message'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'user': user.toJson(),
      'userDetails': userDetails.toJson(),
      'message': message,
    };
  }
}

class User {
  final String userId;
  final String deviceId;
  final String rollNumber;
  final String branch;
  final String semester;
  final List<dynamic> subjects;
  final String id;
  final String accountType;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int version;
  final List<SubjectInfo> subjectsTaught; // Changed to SubjectInfo objects
  final String firstName;
  final String lastName;
  final String email;
  final String image;

  User({
    required this.userId,
    required this.deviceId,
    required this.rollNumber,
    required this.branch,
    required this.semester,
    required this.subjects,
    required this.id,
    required this.accountType,
    required this.createdAt,
    required this.updatedAt,
    required this.version,
    required this.subjectsTaught,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.image,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    // Debug logging
    print('User.fromJson - Raw JSON: $json');

    // Handle subjectsTaught field for instructors
    List<SubjectInfo> subjectsTaught = [];
    if (json['subjectsTaught'] != null && json['subjectsTaught'] is List) {
      for (var subject in json['subjectsTaught']) {
        if (subject is Map<String, dynamic>) {
          try {
            subjectsTaught.add(SubjectInfo.fromJson(subject));
          } catch (e) {
            print('User.fromJson - Error parsing subject: $e');
          }
        }
      }
    }

    // Extract required fields with fallbacks
    String accountType = json['accountType']?.toString() ?? '';
    String firstName = json['firstName']?.toString() ?? '';
    String lastName = json['lastName']?.toString() ?? '';
    String email = json['email']?.toString() ?? '';
    String image = json['image']?.toString() ?? '';
    String userId = json['userId']?.toString() ?? '';
    String deviceId = json['deviceId']?.toString() ?? '';
    String rollNumber = json['rollNumber']?.toString() ?? '';
    String branch = json['branch']?.toString() ?? '';
    String semester = json['semester']?.toString() ?? '';
    String id = json['_id']?.toString() ?? '';

    // Handle DateTime parsing safely
    DateTime createdAt = DateTime.now();
    DateTime updatedAt = DateTime.now();

    try {
      if (json['createdAt'] != null) {
        createdAt = DateTime.parse(json['createdAt'].toString());
      }
    } catch (e) {
      print('Error parsing createdAt: $e');
    }

    try {
      if (json['updatedAt'] != null) {
        updatedAt = DateTime.parse(json['updatedAt'].toString());
      }
    } catch (e) {
      print('Error parsing updatedAt: $e');
    }

    print('User.fromJson - Found accountType: "$accountType"');
    print('User.fromJson - Found subjectsTaught: $subjectsTaught');

    return User(
      userId: userId,
      deviceId: deviceId,
      rollNumber: rollNumber,
      branch: branch,
      semester: semester,
      subjects: json['subjects'] ?? [],
      id: id,
      accountType: accountType,
      createdAt: createdAt,
      updatedAt: updatedAt,
      version: json['__v'] ?? 0,
      subjectsTaught: subjectsTaught,
      firstName: firstName,
      lastName: lastName,
      email: email,
      image: image,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'deviceId': deviceId,
      'rollNumber': rollNumber,
      'branch': branch,
      'semester': semester,
      'subjects': subjects,
      '_id': id,
      'accountType': accountType,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      '__v': version,
      'subjectsTaught': subjectsTaught.map((s) => s.toJson()).toList(),
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'image': image,
    };
  }

  // Helper method to get full name
  String get fullName => '$firstName $lastName';
}

class UserDetails {
  final String firstName;
  final String lastName;
  final String email;
  final String password; // This is hashed, so we won't use it
  final String accountType;
  final bool active;
  final bool approved;
  final String image;
  final String id;
  final DateTime createdAt;
  final DateTime updatedAt;
  final int version;

  UserDetails({
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.password,
    required this.accountType,
    required this.active,
    required this.approved,
    required this.image,
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.version,
  });

  factory UserDetails.fromJson(Map<String, dynamic> json) {
    return UserDetails(
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      password: json['password'] ?? '',
      accountType: json['accountType'] ?? '',
      active: json['active'] ?? false,
      approved: json['approved'] ?? false,
      image: json['image'] ?? '',
      id: json['_id'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      version: json['__v'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'firstName': firstName,
      'lastName': lastName,
      'email': email,
      'password': password,
      'accountType': accountType,
      'active': active,
      'approved': approved,
      'image': image,
      '_id': id,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      '__v': version,
    };
  }

  // Helper method to get full name
  String get fullName => '$firstName $lastName';
}

// Simple user session data for storing in app state
class UserSession {
  final String userId;
  final String email;
  final String fullName;
  final String rollNumber;
  final String branch;
  final String semester;
  final String deviceId;
  final String accountType;
  final String profileImage;
  final bool isActive;
  final bool isApproved;
  final List<SubjectInfo> subjectsTaught; // Changed to SubjectInfo objects

  UserSession({
    required this.userId,
    required this.email,
    required this.fullName,
    required this.rollNumber,
    required this.branch,
    required this.semester,
    required this.deviceId,
    required this.accountType,
    required this.profileImage,
    required this.isActive,
    required this.isApproved,
    required this.subjectsTaught,
  });

  factory UserSession.fromSignupResponse(SignupResponse response) {
    return UserSession(
      userId: response.user.userId,
      email: response.userDetails.email,
      fullName: response.userDetails.fullName,
      rollNumber: response.user.rollNumber,
      branch: response.user.branch,
      semester: response.user.semester,
      deviceId: response.user.deviceId,
      accountType: response.userDetails.accountType,
      profileImage: response.userDetails.image,
      isActive: response.userDetails.active,
      isApproved: response.userDetails.approved,
      subjectsTaught: response.user.subjectsTaught,
    );
  }

  factory UserSession.fromUser(User user) {
    return UserSession(
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      rollNumber: user.rollNumber,
      branch: user.branch,
      semester: user.semester,
      deviceId: user.deviceId,
      accountType: user.accountType,
      profileImage: user.image,
      isActive: true, // Default value, adjust as needed
      isApproved: true, // Default value, adjust as needed
      subjectsTaught: user.subjectsTaught,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'userId': userId,
      'email': email,
      'fullName': fullName,
      'rollNumber': rollNumber,
      'branch': branch,
      'semester': semester,
      'deviceId': deviceId,
      'accountType': accountType,
      'profileImage': profileImage,
      'isActive': isActive,
      'isApproved': isApproved,
      'subjectsTaught': subjectsTaught.map((s) => s.toJson()).toList(),
    };
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
    List<SubjectInfo> subjectsTaught = [];
    if (json['subjectsTaught'] != null && json['subjectsTaught'] is List) {
      for (var subject in json['subjectsTaught']) {
        if (subject is Map<String, dynamic>) {
          subjectsTaught.add(SubjectInfo.fromJson(subject));
        }
      }
    }

    return UserSession(
      userId: json['userId'] ?? '',
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      rollNumber: json['rollNumber'] ?? '',
      branch: json['branch'] ?? '',
      semester: json['semester'] ?? '',
      deviceId: json['deviceId'] ?? '',
      accountType: json['accountType'] ?? '',
      profileImage: json['profileImage'] ?? '',
      isActive: json['isActive'] ?? false,
      isApproved: json['isApproved'] ?? false,
      subjectsTaught: subjectsTaught,
    );
  }
}
