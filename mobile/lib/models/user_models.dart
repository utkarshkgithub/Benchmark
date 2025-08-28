// User data models for handling API responses

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
  final DateTime createdAt;
  final DateTime updatedAt;
  final int version;

  User({
    required this.userId,
    required this.deviceId,
    required this.rollNumber,
    required this.branch,
    required this.semester,
    required this.subjects,
    required this.id,
    required this.createdAt,
    required this.updatedAt,
    required this.version,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      userId: json['userId'] ?? '',
      deviceId: json['deviceId'] ?? '',
      rollNumber: json['rollNumber'] ?? '',
      branch: json['branch'] ?? '',
      semester: json['semester'] ?? '',
      subjects: json['subjects'] ?? [],
      id: json['_id'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
      version: json['__v'] ?? 0,
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
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      '__v': version,
    };
  }
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
    };
  }

  factory UserSession.fromJson(Map<String, dynamic> json) {
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
    );
  }
}
