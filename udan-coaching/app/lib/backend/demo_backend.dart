import 'dart:async';

import 'package:flutter/foundation.dart';

import '../models/models.dart';
import 'backend.dart';

/// In-memory backend with sample batches.
///
/// Login: any 10 digit number, OTP 123456. Log in with [demoAdminPhone]
/// (9999999999) to see the teacher's admin panel; any other number is a
/// student. Nothing is saved after the app closes.
class DemoBackend implements AppBackend {
  DemoBackend({bool withSampleData = true}) {
    if (withSampleData) _seed();
  }

  static const demoOtp = '123456';
  static const demoAdminPhone = '+919999999999';

  final _changes = StreamController<void>.broadcast();
  AppUser? _user;
  final Map<String, StudentProfile> _profiles = {};
  final Map<String, Course> _courses = {};
  final Map<String, List<Subject>> _subjects = {}; // courseId -> subjects
  final Map<String, List<ContentItem>> _items =
      {}; // courseId/subjectId -> items
  final Map<String, Enrollment> _enrollments = {};
  final List<TestAttempt> _attempts = [];
  final Map<String, ({String courseId, String planId})> _orders = {};
  int _nextId = 1;

  String _id(String prefix) => '$prefix${_nextId++}';

  void _notify() => _changes.add(null);

  Stream<T> _watch<T>(T Function() read) async* {
    yield read();
    await for (final _ in _changes.stream) {
      yield read();
    }
  }

  String get _uid {
    final u = _user;
    if (u == null) throw StateError('Please log in again.');
    return u.uid;
  }

  @override
  bool get isDemo => true;

  // ---------------- Login ----------------
  @override
  Stream<AppUser?> authChanges() => _watch(() => _user);

  @override
  AppUser? get currentUser => _user;

  String? _pendingPhone;

  @override
  Future<void> sendOtp(
    String phoneE164, {
    required void Function(String verificationId) onCodeSent,
    required void Function(String message) onError,
    required VoidCallback onAutoVerified,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    _pendingPhone = phoneE164;
    onCodeSent('demo-verification');
  }

  @override
  Future<void> verifyOtp(String verificationId, String smsCode) async {
    await Future<void>.delayed(const Duration(milliseconds: 300));
    if (smsCode != demoOtp) {
      throw StateError('Wrong OTP. In demo mode the OTP is $demoOtp.');
    }
    final phone = _pendingPhone ?? '+910000000000';
    _user = AppUser(uid: 'demo_${phone.replaceAll('+', '')}', phone: phone);
    _notify();
  }

  @override
  Future<void> signOut() async {
    _user = null;
    _notify();
  }

  @override
  Future<void> deleteAccount() async {
    final uid = _uid;
    _profiles.remove(uid);
    _enrollments.removeWhere((_, e) => e.uid == uid);
    _attempts.clear();
    _user = null;
    _notify();
  }

  // ---------------- Profile ----------------
  @override
  Stream<StudentProfile?> profile(String uid) => _watch(() => _profiles[uid]);

  @override
  Future<void> saveProfile(StudentProfile profile) async {
    _profiles[profile.uid] = profile;
    _notify();
  }

  @override
  Future<bool> isAdmin() async => _user?.phone == demoAdminPhone;

  // ---------------- Batches ----------------
  List<Course> _sorted(Iterable<Course> list) =>
      list.toList()..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));

  @override
  Stream<List<Course>> publishedCourses() =>
      _watch(() => _sorted(_courses.values.where((c) => c.published)));

  @override
  Stream<Course?> course(String courseId) => _watch(() => _courses[courseId]);

  @override
  Stream<List<Subject>> subjects(String courseId) => _watch(
    () =>
        List<Subject>.of(_subjects[courseId] ?? const [])
          ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder)),
  );

  @override
  Stream<List<ContentItem>> items(
    String courseId,
    String subjectId, {
    required bool freeOnly,
  }) => _watch(() {
    final list =
        (_items['$courseId/$subjectId'] ?? const <ContentItem>[])
            .where((i) => !freeOnly || i.isFree)
            .toList()
          ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
    return list;
  });

  // ---------------- Access & payments ----------------
  @override
  Stream<List<Enrollment>> myEnrollments() => _watch(() {
    final uid = _user?.uid;
    return _enrollments.values.where((e) => e.uid == uid).toList();
  });

  @override
  Stream<Enrollment?> myEnrollment(String courseId) => _watch(() {
    final uid = _user?.uid;
    if (uid == null) return null;
    return _enrollments[Enrollment.idFor(uid, courseId)];
  });

  @override
  Future<OrderInfo> createOrder(String courseId, String planId) async {
    final course = _courses[courseId];
    final plan = course?.planById(planId);
    if (course == null || plan == null) {
      throw StateError('This plan is not available.');
    }
    final orderId = _id('order_demo_');
    _orders[orderId] = (courseId: courseId, planId: planId);
    if (plan.isFree) {
      _grant(course, plan.name, plan.validityDays, 0, 'free');
      return OrderInfo(orderId: orderId, free: true, isDemo: true);
    }
    return OrderInfo(
      orderId: orderId,
      free: false,
      amountPaise: (plan.price * 100).round(),
      courseTitle: course.title,
      planName: plan.name,
      isDemo: true,
    );
  }

  @override
  Future<void> verifyPayment({
    required String orderId,
    required String paymentId,
    required String signature,
  }) async {
    await Future<void>.delayed(const Duration(milliseconds: 400));
    final order = _orders.remove(orderId);
    if (order == null) throw StateError('Order not found.');
    final course = _courses[order.courseId]!;
    final plan = course.planById(order.planId)!;
    _grant(course, plan.name, plan.validityDays, plan.price, 'razorpay');
  }

  void _grant(
    Course course,
    String planName,
    int days,
    num amount,
    String source,
  ) {
    final uid = _uid;
    final id = Enrollment.idFor(uid, course.id);
    final existing = _enrollments[id];
    final now = DateTime.now();
    final base = existing != null && existing.isActive
        ? existing.expiresAt!
        : now;
    final profile = _profiles[uid];
    _enrollments[id] = Enrollment(
      id: id,
      uid: uid,
      courseId: course.id,
      courseTitle: course.title,
      planName: planName,
      amountPaid: amount,
      source: source,
      studentName: profile?.name ?? '',
      studentPhone: profile?.phone ?? _user!.phone,
      startedAt: existing?.startedAt ?? now,
      expiresAt: base.add(Duration(days: days)),
    );
    _notify();
  }

  // ---------------- Tests ----------------
  @override
  Future<void> saveAttempt(TestAttempt attempt) async {
    _attempts.add(TestAttempt.fromMap(_id('attempt'), attempt.toMap()));
    _notify();
  }

  @override
  Stream<List<TestAttempt>> myAttempts(String itemId) => _watch(
    () =>
        _attempts.where((a) => a.itemId == itemId).toList()
          ..sort((a, b) => b.submittedAt.compareTo(a.submittedAt)),
  );

  // ---------------- Admin ----------------
  @override
  Stream<List<Course>> allCourses() => _watch(() => _sorted(_courses.values));

  @override
  Future<String> saveCourse(Course course) async {
    final id = course.id.isEmpty ? _id('course') : course.id;
    _courses[id] = course.copyWith(id: id);
    _notify();
    return id;
  }

  @override
  Future<void> deleteCourse(String courseId) async {
    _courses.remove(courseId);
    _subjects.remove(courseId);
    _items.removeWhere((k, _) => k.startsWith('$courseId/'));
    _notify();
  }

  @override
  Future<String> saveSubject(String courseId, Subject subject) async {
    final list = _subjects.putIfAbsent(courseId, () => []);
    final id = subject.id.isEmpty ? _id('subject') : subject.id;
    list.removeWhere((s) => s.id == id);
    list.add(Subject(id: id, name: subject.name, sortOrder: subject.sortOrder));
    _notify();
    return id;
  }

  @override
  Future<void> deleteSubject(String courseId, String subjectId) async {
    _subjects[courseId]?.removeWhere((s) => s.id == subjectId);
    _items.remove('$courseId/$subjectId');
    _notify();
  }

  @override
  Future<String> saveItem(
    String courseId,
    String subjectId,
    ContentItem item,
  ) async {
    final list = _items.putIfAbsent('$courseId/$subjectId', () => []);
    final id = item.id.isEmpty ? _id('item') : item.id;
    list.removeWhere((i) => i.id == id);
    list.add(ContentItem.fromMap(id, item.toMap()));
    _notify();
    return id;
  }

  @override
  Future<void> deleteItem(
    String courseId,
    String subjectId,
    String itemId,
  ) async {
    _items['$courseId/$subjectId']?.removeWhere((i) => i.id == itemId);
    _notify();
  }

  @override
  Future<List<StudentProfile>> findStudentsByPhone(String phoneE164) async =>
      _profiles.values.where((p) => p.phone == phoneE164).toList();

  @override
  Stream<List<Enrollment>> courseEnrollments(String courseId) => _watch(
    () => _enrollments.values.where((e) => e.courseId == courseId).toList(),
  );

  @override
  Future<void> grantAccess({
    required StudentProfile student,
    required Course course,
    required int days,
  }) async {
    final id = Enrollment.idFor(student.uid, course.id);
    final existing = _enrollments[id];
    final now = DateTime.now();
    final base = existing != null && existing.isActive
        ? existing.expiresAt!
        : now;
    _enrollments[id] = Enrollment(
      id: id,
      uid: student.uid,
      courseId: course.id,
      courseTitle: course.title,
      planName: 'Offline / manual',
      source: 'manual',
      studentName: student.name,
      studentPhone: student.phone,
      startedAt: existing?.startedAt ?? now,
      expiresAt: base.add(Duration(days: days)),
    );
    _notify();
  }

  @override
  Future<void> revokeAccess(String enrollmentId) async {
    _enrollments.remove(enrollmentId);
    _notify();
  }

  // ---------------- Sample data ----------------
  void _seed() {
    const sampleVideo =
        'https://flutter.github.io/assets-for-api-docs/assets/videos/butterfly.mp4';
    const sampleVideo2 =
        'https://flutter.github.io/assets-for-api-docs/assets/videos/bee.mp4';
    const samplePdf =
        'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
    final now = DateTime.now();

    void addCourse(Course c, Map<String, List<ContentItem>> content) {
      _courses[c.id] = c;
      var order = 0;
      for (final entry in content.entries) {
        final subjectId = '${c.id}_s$order';
        (_subjects[c.id] ??= []).add(
          Subject(id: subjectId, name: entry.key, sortOrder: order),
        );
        _items['${c.id}/$subjectId'] = entry.value;
        order++;
      }
    }

    final mathTest = ContentItem(
      id: 'c10_test1',
      type: ContentType.test,
      title: 'DPP 1 - Real Numbers',
      chapter: 'Real Numbers',
      sortOrder: 3,
      isFree: true,
      durationMinutes: 10,
      marksCorrect: 4,
      marksWrong: 1,
      questions: const [
        Question(
          text: 'What is the HCF of 12 and 18?',
          options: ['2', '3', '6', '36'],
          answerIndex: 2,
          explanation:
              '12 = 2² × 3 and 18 = 2 × 3². Common factors: 2 × 3 = 6.',
        ),
        Question(
          text: 'Which of these is an irrational number?',
          options: ['√4', '√2', '0.25', '22/7'],
          answerIndex: 1,
          explanation: '√2 cannot be written as p/q, so it is irrational.',
        ),
        Question(
          text: 'HCF(a, b) × LCM(a, b) is equal to…',
          options: ['a + b', 'a × b', 'a − b', 'a ÷ b'],
          answerIndex: 1,
          explanation: 'For any two positive integers, HCF × LCM = product of the numbers.',
        ),
      ],
    );

    addCourse(
      Course(
        id: 'c10',
        title: 'Udaan Class 10 Board Batch 2027',
        subtitle: 'Complete Maths & Science for CBSE / State Board',
        description:
            'Live and recorded classes by Satyam Sir covering the full Class 10 syllabus. '
            'Daily practice problems (DPP), chapter tests, PDF notes and board-pattern mock tests.',
        category: 'Class 10',
        language: 'Hinglish',
        features: const [
          'Live + recorded lectures',
          'PDF notes for every chapter',
          'DPP and chapter-wise tests',
          'Doubt support on WhatsApp',
        ],
        plans: const [
          CoursePlan(
            id: 'p1',
            name: 'Full batch (1 year)',
            price: 2499,
            mrp: 4999,
            validityDays: 365,
          ),
          CoursePlan(
            id: 'p2',
            name: 'Monthly',
            price: 399,
            mrp: 599,
            validityDays: 30,
          ),
        ],
        published: true,
        sortOrder: 1,
        startDate: now.subtract(const Duration(days: 20)),
      ),
      {
        'Mathematics': [
          const ContentItem(
            id: 'c10_v1',
            type: ContentType.video,
            title: 'Real Numbers - Lecture 1 (Introduction)',
            chapter: 'Real Numbers',
            sortOrder: 1,
            isFree: true,
            url: sampleVideo,
          ),
          const ContentItem(
            id: 'c10_n1',
            type: ContentType.pdf,
            title: 'Real Numbers - Class Notes',
            chapter: 'Real Numbers',
            sortOrder: 2,
            isFree: true,
            url: samplePdf,
          ),
          mathTest,
          const ContentItem(
            id: 'c10_v2',
            type: ContentType.video,
            title: 'Polynomials - Lecture 1',
            chapter: 'Polynomials',
            sortOrder: 4,
            url: sampleVideo2,
          ),
          ContentItem(
            id: 'c10_live1',
            type: ContentType.live,
            title: 'Polynomials - Live doubt class',
            chapter: 'Polynomials',
            sortOrder: 5,
            url: sampleVideo,
            startsAt: now.add(const Duration(days: 1, hours: 2)),
          ),
        ],
        'Science': [
          const ContentItem(
            id: 'c10_v3',
            type: ContentType.video,
            title: 'Chemical Reactions - Lecture 1',
            chapter: 'Chemical Reactions and Equations',
            sortOrder: 1,
            isFree: true,
            url: sampleVideo2,
          ),
          const ContentItem(
            id: 'c10_n2',
            type: ContentType.pdf,
            title: 'Chemical Reactions - Notes',
            chapter: 'Chemical Reactions and Equations',
            sortOrder: 2,
            url: samplePdf,
          ),
        ],
      },
    );

    addCourse(
      Course(
        id: 'c12',
        title: 'Udaan Class 12 Physics',
        subtitle: 'Boards + JEE/NEET foundation',
        description: 'Concept-first Physics for Class 12 with numericals, PYQs and weekly tests.',
        category: 'Class 12',
        features: const ['120+ lectures', 'Weekly tests', 'PYQ practice'],
        plans: const [
          CoursePlan(
            id: 'p1',
            name: 'Full batch (1 year)',
            price: 2999,
            mrp: 5999,
            validityDays: 365,
          ),
        ],
        published: true,
        sortOrder: 2,
        startDate: now.add(const Duration(days: 10)),
      ),
      {
        'Physics': [
          const ContentItem(
            id: 'c12_v1',
            type: ContentType.video,
            title: 'Electric Charges - Lecture 1',
            chapter: 'Electric Charges and Fields',
            sortOrder: 1,
            isFree: true,
            url: sampleVideo,
          ),
          const ContentItem(
            id: 'c12_v2',
            type: ContentType.video,
            title: 'Coulomb\'s Law',
            chapter: 'Electric Charges and Fields',
            sortOrder: 2,
            url: sampleVideo2,
          ),
        ],
      },
    );

    addCourse(
      Course(
        id: 'free9',
        title: 'Class 9 Maths Crash Course',
        subtitle: 'Free for all students',
        description:
            'A free crash course to get you started with Udan Coaching.',
        category: 'Class 9',
        features: const ['Free forever', 'Short lectures'],
        plans: const [
          CoursePlan(
            id: 'free',
            name: 'Free',
            price: 0,
            mrp: 0,
            validityDays: 365,
          ),
        ],
        published: true,
        sortOrder: 3,
      ),
      {
        'Mathematics': [
          const ContentItem(
            id: 'free9_v1',
            type: ContentType.video,
            title: 'Number Systems in 20 minutes',
            chapter: 'Number Systems',
            sortOrder: 1,
            url: sampleVideo,
          ),
        ],
      },
    );
  }
}
