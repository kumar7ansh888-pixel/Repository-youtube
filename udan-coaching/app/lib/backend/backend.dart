import 'package:flutter/foundation.dart';

import '../models/models.dart';

/// The app talks to its data only through this interface.
///
/// * [FirebaseBackend] is the real one (phone OTP login, Firestore, Razorpay
///   through Cloud Functions).
/// * [DemoBackend] keeps everything in memory with sample batches. It is used
///   automatically until Firebase is configured, so the app can be tried
///   right away, and it powers the automated tests.
abstract class AppBackend {
  bool get isDemo;

  // ---------------- Login ----------------
  Stream<AppUser?> authChanges();
  AppUser? get currentUser;

  /// Sends an OTP by SMS to [phoneE164] (for example +919876543210).
  Future<void> sendOtp(
    String phoneE164, {
    required void Function(String verificationId) onCodeSent,
    required void Function(String message) onError,
    required VoidCallback onAutoVerified,
  });

  Future<void> verifyOtp(String verificationId, String smsCode);
  Future<void> signOut();

  /// Deletes the account and personal data (Play Store requirement).
  Future<void> deleteAccount();

  // ---------------- Profile ----------------
  Stream<StudentProfile?> profile(String uid);
  Future<void> saveProfile(StudentProfile profile);
  Future<bool> isAdmin();

  // ---------------- Batches ----------------
  Stream<List<Course>> publishedCourses();
  Stream<Course?> course(String courseId);
  Stream<List<Subject>> subjects(String courseId);

  /// [freeOnly] must be true when the student has not bought the batch.
  Stream<List<ContentItem>> items(
    String courseId,
    String subjectId, {
    required bool freeOnly,
  });

  // ---------------- Access & payments ----------------
  Stream<List<Enrollment>> myEnrollments();
  Stream<Enrollment?> myEnrollment(String courseId);
  Future<OrderInfo> createOrder(String courseId, String planId);
  Future<void> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  });

  // ---------------- Tests ----------------
  Future<void> saveAttempt(TestAttempt attempt);
  Stream<List<TestAttempt>> myAttempts(String itemId);

  // ---------------- Admin ----------------
  Stream<List<Course>> allCourses();
  Future<String> saveCourse(Course course);
  Future<void> deleteCourse(String courseId);
  Future<String> saveSubject(String courseId, Subject subject);
  Future<void> deleteSubject(String courseId, String subjectId);
  Future<String> saveItem(String courseId, String subjectId, ContentItem item);
  Future<void> deleteItem(String courseId, String subjectId, String itemId);
  Future<List<StudentProfile>> findStudentsByPhone(String phoneE164);
  Stream<List<Enrollment>> courseEnrollments(String courseId);

  /// Gives a student access without online payment (cash / offline fees).
  Future<void> grantAccess({
    required StudentProfile student,
    required Course course,
    required int days,
  });
  Future<void> revokeAccess(String enrollmentId);
}

/// The backend chosen at start-up (see main.dart).
late AppBackend backend;

/// Turns any error into a short message a student can understand.
String friendlyError(Object error) {
  final text = error.toString();
  const prefixes = ['Exception: ', 'Bad state: '];
  for (final p in prefixes) {
    if (text.startsWith(p)) return text.substring(p.length);
  }
  if (text.contains('permission-denied') ||
      text.contains('PERMISSION_DENIED')) {
    return 'You do not have access to this. Please buy the batch or contact support.';
  }
  if (text.contains('network') || text.contains('unavailable')) {
    return 'No internet connection. Please check your network and try again.';
  }
  return text.length > 160 ? '${text.substring(0, 160)}…' : text;
}
