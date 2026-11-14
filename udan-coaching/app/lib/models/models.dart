// Plain data classes used by the whole app.
//
// They read and write simple maps (String keys, DateTime for dates) so they
// do not depend on Firebase. The Firebase backend converts Firestore
// Timestamps to DateTime before calling fromMap.

DateTime? _date(dynamic v) {
  if (v == null) return null;
  if (v is DateTime) return v;
  if (v is int) return DateTime.fromMillisecondsSinceEpoch(v);
  return null;
}

num _num(dynamic v, [num fallback = 0]) {
  if (v is num) return v;
  if (v is String) return num.tryParse(v) ?? fallback;
  return fallback;
}

int _int(dynamic v, [int fallback = 0]) => _num(v, fallback).round();

String _str(dynamic v) => v is String ? v : (v == null ? '' : v.toString());

List<String> _strList(dynamic v) => v is List
    ? v.map(_str).where((s) => s.trim().isNotEmpty).toList()
    : <String>[];

class AppUser {
  const AppUser({required this.uid, required this.phone});
  final String uid;
  final String phone;
}

class StudentProfile {
  const StudentProfile({
    required this.uid,
    required this.name,
    required this.phone,
    this.className = '',
    this.city = '',
  });

  final String uid;
  final String name;
  final String phone;
  final String className;
  final String city;

  bool get isComplete => name.trim().isNotEmpty;

  factory StudentProfile.fromMap(String uid, Map<String, dynamic> m) =>
      StudentProfile(
        uid: uid,
        name: _str(m['name']),
        phone: _str(m['phone']),
        className: _str(m['className']),
        city: _str(m['city']),
      );

  Map<String, dynamic> toMap() => {
    'name': name.trim(),
    'phone': phone,
    'className': className,
    'city': city.trim(),
  };
}

/// One way to buy a batch, e.g. "Full batch - 1 year" for 2999.
class CoursePlan {
  const CoursePlan({
    required this.id,
    required this.name,
    required this.price,
    required this.mrp,
    required this.validityDays,
  });

  final String id;
  final String name;
  final num price;
  final num mrp;
  final int validityDays;

  bool get isFree => price <= 0;

  int get discountPercent {
    if (mrp <= 0 || mrp <= price) return 0;
    return (((mrp - price) / mrp) * 100).round();
  }

  factory CoursePlan.fromMap(Map<String, dynamic> m) => CoursePlan(
    id: _str(m['id']),
    name: _str(m['name']),
    price: _num(m['price']),
    mrp: _num(m['mrp']),
    validityDays: _int(m['validityDays'], 365),
  );

  Map<String, dynamic> toMap() => {
    'id': id,
    'name': name,
    'price': price,
    'mrp': mrp,
    'validityDays': validityDays,
  };

  CoursePlan copyWith({
    String? name,
    num? price,
    num? mrp,
    int? validityDays,
  }) => CoursePlan(
    id: id,
    name: name ?? this.name,
    price: price ?? this.price,
    mrp: mrp ?? this.mrp,
    validityDays: validityDays ?? this.validityDays,
  );
}

/// A batch / course that students can buy.
class Course {
  const Course({
    required this.id,
    required this.title,
    this.subtitle = '',
    this.description = '',
    this.thumbnailUrl = '',
    this.category = '',
    this.language = 'Hinglish',
    this.features = const [],
    this.plans = const [],
    this.published = false,
    this.sortOrder = 0,
    this.startDate,
  });

  final String id;
  final String title;
  final String subtitle;
  final String description;
  final String thumbnailUrl;
  final String category;
  final String language;
  final List<String> features;
  final List<CoursePlan> plans;
  final bool published;
  final int sortOrder;
  final DateTime? startDate;

  /// The plan shown on the batch card ("starting at").
  CoursePlan? get cheapestPlan {
    if (plans.isEmpty) return null;
    return plans.reduce((a, b) => a.price <= b.price ? a : b);
  }

  CoursePlan? planById(String id) {
    for (final p in plans) {
      if (p.id == id) return p;
    }
    return null;
  }

  factory Course.fromMap(String id, Map<String, dynamic> m) => Course(
    id: id,
    title: _str(m['title']),
    subtitle: _str(m['subtitle']),
    description: _str(m['description']),
    thumbnailUrl: _str(m['thumbnailUrl']),
    category: _str(m['category']),
    language: _str(m['language']).isEmpty ? 'Hinglish' : _str(m['language']),
    features: _strList(m['features']),
    plans: m['plans'] is List
        ? (m['plans'] as List)
              .whereType<Map>()
              .map((p) => CoursePlan.fromMap(Map<String, dynamic>.from(p)))
              .toList()
        : const [],
    published: m['published'] == true,
    sortOrder: _int(m['sortOrder']),
    startDate: _date(m['startDate']),
  );

  Map<String, dynamic> toMap() => {
    'title': title.trim(),
    'subtitle': subtitle.trim(),
    'description': description.trim(),
    'thumbnailUrl': thumbnailUrl.trim(),
    'category': category,
    'language': language,
    'features': features,
    'plans': plans.map((p) => p.toMap()).toList(),
    'published': published,
    'sortOrder': sortOrder,
    'startDate': startDate,
  };

  Course copyWith({String? id}) => Course(
    id: id ?? this.id,
    title: title,
    subtitle: subtitle,
    description: description,
    thumbnailUrl: thumbnailUrl,
    category: category,
    language: language,
    features: features,
    plans: plans,
    published: published,
    sortOrder: sortOrder,
    startDate: startDate,
  );
}

class Subject {
  const Subject({required this.id, required this.name, this.sortOrder = 0});

  final String id;
  final String name;
  final int sortOrder;

  factory Subject.fromMap(String id, Map<String, dynamic> m) =>
      Subject(id: id, name: _str(m['name']), sortOrder: _int(m['sortOrder']));

  Map<String, dynamic> toMap() => {'name': name.trim(), 'sortOrder': sortOrder};
}

enum ContentType { video, pdf, test, live }

extension ContentTypeX on ContentType {
  String get label => switch (this) {
    ContentType.video => 'Lecture',
    ContentType.pdf => 'Notes / PDF',
    ContentType.test => 'Test / DPP',
    ContentType.live => 'Live class',
  };

  static ContentType parse(String? v) => ContentType.values.firstWhere(
    (t) => t.name == v,
    orElse: () => ContentType.video,
  );
}

/// A multiple choice question inside a test.
class Question {
  const Question({
    required this.text,
    required this.options,
    required this.answerIndex,
    this.explanation = '',
  });

  final String text;
  final List<String> options;
  final int answerIndex;
  final String explanation;

  factory Question.fromMap(Map<String, dynamic> m) => Question(
    text: _str(m['text']),
    options: m['options'] is List
        ? (m['options'] as List).map(_str).toList()
        : const [],
    answerIndex: _int(m['answerIndex']),
    explanation: _str(m['explanation']),
  );

  Map<String, dynamic> toMap() => {
    'text': text,
    'options': options,
    'answerIndex': answerIndex,
    'explanation': explanation,
  };
}

/// A lecture, PDF, test or live class inside a subject.
class ContentItem {
  const ContentItem({
    required this.id,
    required this.type,
    required this.title,
    this.chapter = '',
    this.sortOrder = 0,
    this.isFree = false,
    this.url = '',
    this.startsAt,
    this.durationMinutes = 30,
    this.marksCorrect = 4,
    this.marksWrong = 1,
    this.questions = const [],
  });

  final String id;
  final ContentType type;
  final String title;
  final String chapter;
  final int sortOrder;
  final bool isFree;

  /// Video (YouTube or .mp4/.m3u8), PDF, or live class link.
  final String url;

  /// Live classes only.
  final DateTime? startsAt;

  /// Tests only.
  final int durationMinutes;
  final num marksCorrect;

  /// Marks taken away for a wrong answer (0 = no negative marking).
  final num marksWrong;
  final List<Question> questions;

  factory ContentItem.fromMap(String id, Map<String, dynamic> m) => ContentItem(
    id: id,
    type: ContentTypeX.parse(m['type'] as String?),
    title: _str(m['title']),
    chapter: _str(m['chapter']),
    sortOrder: _int(m['sortOrder']),
    isFree: m['isFree'] == true,
    url: _str(m['url']),
    startsAt: _date(m['startsAt']),
    durationMinutes: _int(m['durationMinutes'], 30),
    marksCorrect: _num(m['marksCorrect'], 4),
    marksWrong: _num(m['marksWrong'], 1),
    questions: m['questions'] is List
        ? (m['questions'] as List)
              .whereType<Map>()
              .map((q) => Question.fromMap(Map<String, dynamic>.from(q)))
              .toList()
        : const [],
  );

  Map<String, dynamic> toMap() => {
    'type': type.name,
    'title': title.trim(),
    'chapter': chapter.trim(),
    'sortOrder': sortOrder,
    'isFree': isFree,
    'url': url.trim(),
    'startsAt': startsAt,
    'durationMinutes': durationMinutes,
    'marksCorrect': marksCorrect,
    'marksWrong': marksWrong,
    'questions': questions.map((q) => q.toMap()).toList(),
  };
}

/// A student's access to a batch.
class Enrollment {
  const Enrollment({
    required this.id,
    required this.uid,
    required this.courseId,
    this.courseTitle = '',
    this.planName = '',
    this.amountPaid = 0,
    this.source = '',
    this.studentName = '',
    this.studentPhone = '',
    this.startedAt,
    this.expiresAt,
  });

  final String id;
  final String uid;
  final String courseId;
  final String courseTitle;
  final String planName;
  final num amountPaid;

  /// razorpay, free or manual.
  final String source;
  final String studentName;
  final String studentPhone;
  final DateTime? startedAt;
  final DateTime? expiresAt;

  bool get isActive => expiresAt != null && expiresAt!.isAfter(DateTime.now());

  static String idFor(String uid, String courseId) => '${uid}_$courseId';

  factory Enrollment.fromMap(String id, Map<String, dynamic> m) => Enrollment(
    id: id,
    uid: _str(m['uid']),
    courseId: _str(m['courseId']),
    courseTitle: _str(m['courseTitle']),
    planName: _str(m['planName']),
    amountPaid: _num(m['amountPaid']),
    source: _str(m['source']),
    studentName: _str(m['studentName']),
    studentPhone: _str(m['studentPhone']),
    startedAt: _date(m['startedAt']),
    expiresAt: _date(m['expiresAt']),
  );

  Map<String, dynamic> toMap() => {
    'uid': uid,
    'courseId': courseId,
    'courseTitle': courseTitle,
    'planName': planName,
    'amountPaid': amountPaid,
    'source': source,
    'studentName': studentName,
    'studentPhone': studentPhone,
    'startedAt': startedAt,
    'expiresAt': expiresAt,
  };
}

/// What the server returns when the student taps "Buy".
class OrderInfo {
  const OrderInfo({
    required this.orderId,
    required this.free,
    this.amountPaise = 0,
    this.keyId = '',
    this.courseTitle = '',
    this.planName = '',
    this.name = '',
    this.phone = '',
    this.isDemo = false,
  });

  final String orderId;
  final bool free;
  final int amountPaise;
  final String keyId;
  final String courseTitle;
  final String planName;
  final String name;
  final String phone;

  /// Demo mode: no real payment gateway.
  final bool isDemo;
}

/// One submission of a test.
class TestAttempt {
  const TestAttempt({
    required this.id,
    required this.courseId,
    required this.itemId,
    required this.itemTitle,
    required this.score,
    required this.maxScore,
    required this.correct,
    required this.wrong,
    required this.skipped,
    required this.answers,
    required this.submittedAt,
  });

  final String id;
  final String courseId;
  final String itemId;
  final String itemTitle;
  final num score;
  final num maxScore;
  final int correct;
  final int wrong;
  final int skipped;

  /// Chosen option per question, -1 when skipped.
  final List<int> answers;
  final DateTime submittedAt;

  factory TestAttempt.fromMap(String id, Map<String, dynamic> m) => TestAttempt(
    id: id,
    courseId: _str(m['courseId']),
    itemId: _str(m['itemId']),
    itemTitle: _str(m['itemTitle']),
    score: _num(m['score']),
    maxScore: _num(m['maxScore']),
    correct: _int(m['correct']),
    wrong: _int(m['wrong']),
    skipped: _int(m['skipped']),
    answers: m['answers'] is List
        ? (m['answers'] as List).map((e) => _int(e, -1)).toList()
        : const [],
    submittedAt: _date(m['submittedAt']) ?? DateTime.now(),
  );

  Map<String, dynamic> toMap() => {
    'courseId': courseId,
    'itemId': itemId,
    'itemTitle': itemTitle,
    'score': score,
    'maxScore': maxScore,
    'correct': correct,
    'wrong': wrong,
    'skipped': skipped,
    'answers': answers,
    'submittedAt': submittedAt,
  };

  /// Scores a test. [answers] holds the chosen option index or -1.
  static TestAttempt grade({
    required String courseId,
    required ContentItem test,
    required List<int> answers,
    DateTime? at,
  }) {
    var correct = 0;
    var wrong = 0;
    var skipped = 0;
    for (var i = 0; i < test.questions.length; i++) {
      final a = i < answers.length ? answers[i] : -1;
      if (a < 0) {
        skipped++;
      } else if (a == test.questions[i].answerIndex) {
        correct++;
      } else {
        wrong++;
      }
    }
    final score = correct * test.marksCorrect - wrong * test.marksWrong;
    return TestAttempt(
      id: '',
      courseId: courseId,
      itemId: test.id,
      itemTitle: test.title,
      score: score,
      maxScore: test.questions.length * test.marksCorrect,
      correct: correct,
      wrong: wrong,
      skipped: skipped,
      answers: List<int>.generate(
        test.questions.length,
        (i) => i < answers.length ? answers[i] : -1,
      ),
      submittedAt: at ?? DateTime.now(),
    );
  }
}
