import 'package:flutter_test/flutter_test.dart';
import 'package:udan_coaching/models/models.dart';
import 'package:udan_coaching/utils/format.dart';

void main() {
  group('rupees', () {
    test('uses Indian digit grouping', () {
      expect(rupees(0), '₹0');
      expect(rupees(999), '₹999');
      expect(rupees(2499), '₹2,499');
      expect(rupees(123456), '₹1,23,456');
      expect(rupees(12345678), '₹1,23,45,678');
      expect(rupees(1499.5), '₹1,499.50');
    });
  });

  group('normalizeIndianPhone', () {
    test('accepts common ways of writing a number', () {
      expect(normalizeIndianPhone('9876543210'), '+919876543210');
      expect(normalizeIndianPhone('+91 98765 43210'), '+919876543210');
      expect(normalizeIndianPhone('09876543210'), '+919876543210');
    });
    test('rejects invalid numbers', () {
      expect(normalizeIndianPhone('12345'), isNull);
      expect(normalizeIndianPhone('1234567890'), isNull); // must start with 6-9
      expect(normalizeIndianPhone(''), isNull);
    });
  });

  test('Google Drive links become direct PDF links', () {
    expect(
      directPdfUrl(
        'https://drive.google.com/file/d/abc123XYZ/view?usp=sharing',
      ),
      'https://drive.google.com/uc?export=download&id=abc123XYZ',
    );
    expect(
      directPdfUrl('https://example.com/notes.pdf'),
      'https://example.com/notes.pdf',
    );
  });

  test('validity text', () {
    expect(validityText(365), '1 year');
    expect(validityText(730), '2 years');
    expect(validityText(30), '1 month');
    expect(validityText(90), '3 months');
    expect(validityText(45), '45 days');
  });

  test('plan discount', () {
    const plan = CoursePlan(
      id: 'p',
      name: 'x',
      price: 2499,
      mrp: 4999,
      validityDays: 365,
    );
    expect(plan.discountPercent, 50);
    expect(
      const CoursePlan(
        id: 'p',
        name: 'x',
        price: 0,
        mrp: 0,
        validityDays: 1,
      ).isFree,
      isTrue,
    );
  });

  test('course survives a save/load round trip', () {
    final course = Course(
      id: 'c1',
      title: 'Class 10',
      category: 'Class 10',
      features: const ['Notes', 'Tests'],
      plans: const [
        CoursePlan(
          id: 'a',
          name: 'Year',
          price: 2999,
          mrp: 4999,
          validityDays: 365,
        ),
        CoursePlan(
          id: 'b',
          name: 'Month',
          price: 399,
          mrp: 0,
          validityDays: 30,
        ),
      ],
      published: true,
      startDate: DateTime(2026, 4, 1),
    );
    final back = Course.fromMap('c1', course.toMap());
    expect(back.title, 'Class 10');
    expect(back.plans.length, 2);
    expect(back.cheapestPlan!.id, 'b');
    expect(back.planById('a')!.price, 2999);
    expect(back.startDate, DateTime(2026, 4, 1));
    expect(back.published, isTrue);
  });

  test('test grading with negative marking', () {
    const test = ContentItem(
      id: 't',
      type: ContentType.test,
      title: 'DPP',
      marksCorrect: 4,
      marksWrong: 1,
      questions: [
        Question(text: 'a', options: ['1', '2'], answerIndex: 0),
        Question(text: 'b', options: ['1', '2'], answerIndex: 1),
        Question(text: 'c', options: ['1', '2'], answerIndex: 1),
        Question(text: 'd', options: ['1', '2'], answerIndex: 0),
      ],
    );
    final attempt = TestAttempt.grade(
      courseId: 'c',
      test: test,
      answers: [0, 1, 0, -1],
    );
    expect(attempt.correct, 2);
    expect(attempt.wrong, 1);
    expect(attempt.skipped, 1);
    expect(attempt.score, 7);
    expect(attempt.maxScore, 16);
    expect(attempt.answers, [0, 1, 0, -1]);
  });

  test('enrollment is active only before expiry', () {
    final active = Enrollment(
      id: 'u_c',
      uid: 'u',
      courseId: 'c',
      expiresAt: DateTime.now().add(const Duration(days: 1)),
    );
    final expired = Enrollment(
      id: 'u_c',
      uid: 'u',
      courseId: 'c',
      expiresAt: DateTime.now().subtract(const Duration(days: 1)),
    );
    expect(active.isActive, isTrue);
    expect(expired.isActive, isFalse);
    expect(
      const Enrollment(id: 'x', uid: 'u', courseId: 'c').isActive,
      isFalse,
    );
  });
}
