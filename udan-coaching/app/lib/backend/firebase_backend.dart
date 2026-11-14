import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../models/models.dart';
import 'backend.dart';

/// Real backend: Firebase phone login, Firestore data, Razorpay through the
/// Cloud Functions in firebase/functions.
class FirebaseBackend implements AppBackend {
  FirebaseBackend()
    : _auth = FirebaseAuth.instance,
      _db = FirebaseFirestore.instance,
      _functions = FirebaseFunctions.instanceFor(
        region: AppConfig.functionsRegion,
      );

  final FirebaseAuth _auth;
  final FirebaseFirestore _db;
  final FirebaseFunctions _functions;

  bool? _isAdminCache;
  String? _isAdminUid;

  @override
  bool get isDemo => false;

  String get _uid {
    final u = _auth.currentUser;
    if (u == null) throw StateError('Please log in again.');
    return u.uid;
  }

  /// Firestore Timestamps -> DateTime, recursively.
  static dynamic _plain(dynamic v) {
    if (v is Timestamp) return v.toDate();
    if (v is Map) return v.map((k, val) => MapEntry(k.toString(), _plain(val)));
    if (v is List) return v.map(_plain).toList();
    return v;
  }

  static Map<String, dynamic> _data(DocumentSnapshot<Map<String, dynamic>> d) =>
      Map<String, dynamic>.from(
        _plain(d.data() ?? const <String, dynamic>{}) as Map,
      );

  Future<T> _call<T>(String name, Map<String, dynamic> data) async {
    try {
      final result = await _functions.httpsCallable(name).call<dynamic>(data);
      return result.data as T;
    } on FirebaseFunctionsException catch (e) {
      throw StateError(e.message ?? 'Something went wrong. Please try again.');
    }
  }

  // ---------------- Login ----------------
  AppUser? _toAppUser(User? u) =>
      u == null ? null : AppUser(uid: u.uid, phone: u.phoneNumber ?? '');

  @override
  Stream<AppUser?> authChanges() => _auth.authStateChanges().map(_toAppUser);

  @override
  AppUser? get currentUser => _toAppUser(_auth.currentUser);

  int? _resendToken;

  @override
  Future<void> sendOtp(
    String phoneE164, {
    required void Function(String verificationId) onCodeSent,
    required void Function(String message) onError,
    required VoidCallback onAutoVerified,
  }) {
    return _auth.verifyPhoneNumber(
      phoneNumber: phoneE164,
      forceResendingToken: _resendToken,
      timeout: const Duration(seconds: 60),
      verificationCompleted: (credential) async {
        // Android can read the SMS by itself and log in without typing.
        try {
          await _auth.signInWithCredential(credential);
          onAutoVerified();
        } catch (e) {
          onError(friendlyError(e));
        }
      },
      verificationFailed: (e) {
        final message = switch (e.code) {
          'invalid-phone-number' => 'This phone number is not valid.',
          'too-many-requests' =>
            'Too many attempts. Please try again after some time.',
          'quota-exceeded' =>
            'SMS limit reached for today. Please try again later.',
          _ => e.message ?? 'Could not send OTP. Please try again.',
        };
        onError(message);
      },
      codeSent: (verificationId, resendToken) {
        _resendToken = resendToken;
        onCodeSent(verificationId);
      },
      codeAutoRetrievalTimeout: (_) {},
    );
  }

  @override
  Future<void> verifyOtp(String verificationId, String smsCode) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode,
      );
      await _auth.signInWithCredential(credential);
    } on FirebaseAuthException catch (e) {
      if (e.code == 'invalid-verification-code') {
        throw StateError('Wrong OTP. Please check and try again.');
      }
      if (e.code == 'session-expired') {
        throw StateError('OTP expired. Please request a new one.');
      }
      throw StateError(e.message ?? 'Login failed. Please try again.');
    }
  }

  @override
  Future<void> signOut() async {
    _isAdminCache = null;
    await _auth.signOut();
  }

  @override
  Future<void> deleteAccount() async {
    await _call<dynamic>('deleteAccount', const {});
    _isAdminCache = null;
    await _auth.signOut();
  }

  // ---------------- Profile ----------------
  @override
  Stream<StudentProfile?> profile(String uid) => _db
      .doc('users/$uid')
      .snapshots()
      .map((d) => d.exists ? StudentProfile.fromMap(d.id, _data(d)) : null);

  @override
  Future<void> saveProfile(StudentProfile profile) async {
    final ref = _db.doc('users/${profile.uid}');
    final exists = (await ref.get()).exists;
    await ref.set({
      ...profile.toMap(),
      'updatedAt': FieldValue.serverTimestamp(),
      if (!exists) 'createdAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  @override
  Future<bool> isAdmin() async {
    final uid = _auth.currentUser?.uid;
    if (uid == null) return false;
    if (_isAdminUid == uid && _isAdminCache != null) return _isAdminCache!;
    try {
      final doc = await _db.doc('admins/$uid').get();
      _isAdminCache = doc.exists;
    } catch (_) {
      _isAdminCache = false;
    }
    _isAdminUid = uid;
    return _isAdminCache!;
  }

  // ---------------- Batches ----------------
  List<Course> _courses(QuerySnapshot<Map<String, dynamic>> s) =>
      s.docs.map((d) => Course.fromMap(d.id, _data(d))).toList()
        ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));

  @override
  Stream<List<Course>> publishedCourses() => _db
      .collection('courses')
      .where('published', isEqualTo: true)
      .snapshots()
      .map(_courses);

  @override
  Stream<Course?> course(String courseId) => _db
      .doc('courses/$courseId')
      .snapshots()
      .map((d) => d.exists ? Course.fromMap(d.id, _data(d)) : null);

  @override
  Stream<List<Subject>> subjects(String courseId) => _db
      .collection('courses/$courseId/subjects')
      .snapshots()
      .map(
        (s) =>
            s.docs.map((d) => Subject.fromMap(d.id, _data(d))).toList()
              ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder)),
      );

  @override
  Stream<List<ContentItem>> items(
    String courseId,
    String subjectId, {
    required bool freeOnly,
  }) {
    Query<Map<String, dynamic>> q = _db.collection(
      'courses/$courseId/subjects/$subjectId/items',
    );
    // Required by the security rules for students who have not bought the batch.
    if (freeOnly) q = q.where('isFree', isEqualTo: true);
    return q.snapshots().map(
      (s) =>
          s.docs.map((d) => ContentItem.fromMap(d.id, _data(d))).toList()
            ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder)),
    );
  }

  // ---------------- Access & payments ----------------
  @override
  Stream<List<Enrollment>> myEnrollments() => _db
      .collection('enrollments')
      .where('uid', isEqualTo: _uid)
      .snapshots()
      .map(
        (s) => s.docs.map((d) => Enrollment.fromMap(d.id, _data(d))).toList(),
      );

  @override
  Stream<Enrollment?> myEnrollment(String courseId) => _db
      .doc('enrollments/${Enrollment.idFor(_uid, courseId)}')
      .snapshots()
      .map((d) => d.exists ? Enrollment.fromMap(d.id, _data(d)) : null);

  @override
  Future<OrderInfo> createOrder(String courseId, String planId) async {
    final raw = await _call<Map>('createOrder', {
      'courseId': courseId,
      'planId': planId,
    });
    final m = Map<String, dynamic>.from(raw);
    return OrderInfo(
      orderId: m['orderId'] as String,
      free: m['free'] == true,
      amountPaise: (m['amount'] as num?)?.toInt() ?? 0,
      keyId: (m['keyId'] as String?) ?? '',
      courseTitle: (m['courseTitle'] as String?) ?? '',
      planName: (m['planName'] as String?) ?? '',
      name: (m['name'] as String?) ?? '',
      phone: (m['phone'] as String?) ?? '',
    );
  }

  @override
  Future<void> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    await _call<dynamic>('verifyPayment', {
      'orderId': orderId,
      'paymentId': paymentId,
      'signature': signature,
    });
  }

  // ---------------- Tests ----------------
  @override
  Future<void> saveAttempt(TestAttempt attempt) async {
    await _db.collection('users/$_uid/attempts').add(attempt.toMap());
  }

  @override
  Stream<List<TestAttempt>> myAttempts(String itemId) => _db
      .collection('users/$_uid/attempts')
      .where('itemId', isEqualTo: itemId)
      .snapshots()
      .map(
        (s) =>
            s.docs.map((d) => TestAttempt.fromMap(d.id, _data(d))).toList()
              ..sort((a, b) => b.submittedAt.compareTo(a.submittedAt)),
      );

  // ---------------- Admin ----------------
  @override
  Stream<List<Course>> allCourses() =>
      _db.collection('courses').snapshots().map(_courses);

  @override
  Future<String> saveCourse(Course course) async {
    final col = _db.collection('courses');
    final ref = course.id.isEmpty ? col.doc() : col.doc(course.id);
    await ref.set({
      ...course.toMap(),
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
    return ref.id;
  }

  @override
  Future<void> deleteCourse(String courseId) async {
    // Delete content first, then the batch itself.
    final subjects = await _db.collection('courses/$courseId/subjects').get();
    for (final s in subjects.docs) {
      await deleteSubject(courseId, s.id);
    }
    await _db.doc('courses/$courseId').delete();
  }

  @override
  Future<String> saveSubject(String courseId, Subject subject) async {
    final col = _db.collection('courses/$courseId/subjects');
    final ref = subject.id.isEmpty ? col.doc() : col.doc(subject.id);
    await ref.set(subject.toMap(), SetOptions(merge: true));
    return ref.id;
  }

  @override
  Future<void> deleteSubject(String courseId, String subjectId) async {
    final items = await _db
        .collection('courses/$courseId/subjects/$subjectId/items')
        .get();
    final batch = _db.batch();
    for (final i in items.docs) {
      batch.delete(i.reference);
    }
    batch.delete(_db.doc('courses/$courseId/subjects/$subjectId'));
    await batch.commit();
  }

  @override
  Future<String> saveItem(
    String courseId,
    String subjectId,
    ContentItem item,
  ) async {
    final col = _db.collection('courses/$courseId/subjects/$subjectId/items');
    final ref = item.id.isEmpty ? col.doc() : col.doc(item.id);
    await ref.set({...item.toMap(), 'updatedAt': FieldValue.serverTimestamp()});
    return ref.id;
  }

  @override
  Future<void> deleteItem(String courseId, String subjectId, String itemId) =>
      _db.doc('courses/$courseId/subjects/$subjectId/items/$itemId').delete();

  @override
  Future<List<StudentProfile>> findStudentsByPhone(String phoneE164) async {
    final s = await _db
        .collection('users')
        .where('phone', isEqualTo: phoneE164)
        .limit(10)
        .get();
    return s.docs.map((d) => StudentProfile.fromMap(d.id, _data(d))).toList();
  }

  @override
  Stream<List<Enrollment>> courseEnrollments(String courseId) => _db
      .collection('enrollments')
      .where('courseId', isEqualTo: courseId)
      .snapshots()
      .map(
        (s) => s.docs.map((d) => Enrollment.fromMap(d.id, _data(d))).toList()
          ..sort(
            (a, b) => (b.startedAt ?? DateTime(0)).compareTo(
              a.startedAt ?? DateTime(0),
            ),
          ),
      );

  @override
  Future<void> grantAccess({
    required StudentProfile student,
    required Course course,
    required int days,
  }) async {
    final ref = _db.doc(
      'enrollments/${Enrollment.idFor(student.uid, course.id)}',
    );
    await _db.runTransaction((tx) async {
      final snap = await tx.get(ref);
      final existing = snap.exists
          ? Enrollment.fromMap(snap.id, _data(snap))
          : null;
      final now = DateTime.now();
      final base = existing != null && existing.isActive
          ? existing.expiresAt!
          : now;
      tx.set(ref, {
        'uid': student.uid,
        'courseId': course.id,
        'courseTitle': course.title,
        'planName': 'Offline / manual',
        'amountPaid': 0,
        'source': 'manual',
        'studentName': student.name,
        'studentPhone': student.phone,
        'startedAt': existing?.startedAt ?? now,
        'expiresAt': base.add(Duration(days: days)),
        'grantedBy': _uid,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    });
  }

  @override
  Future<void> revokeAccess(String enrollmentId) =>
      _db.doc('enrollments/$enrollmentId').delete();
}
