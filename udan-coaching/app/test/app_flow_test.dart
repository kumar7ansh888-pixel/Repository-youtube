import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:udan_coaching/app.dart';
import 'package:udan_coaching/backend/backend.dart';
import 'package:udan_coaching/backend/demo_backend.dart';
import 'package:udan_coaching/widgets/common.dart';

/// Walks through the app on the in-memory demo backend.
void main() {
  setUp(() => backend = DemoBackend());

  // Fixed number of frames (spinners would make pumpAndSettle wait forever).
  Future<void> settle(WidgetTester tester) async {
    for (var i = 0; i < 12; i++) {
      await tester.pump(const Duration(milliseconds: 150));
    }
  }

  Finder courseCard(String title) =>
      find.byWidgetPredicate((w) => w is CourseCard && w.course.title == title);

  Future<void> phoneSize(WidgetTester tester) async {
    tester.view.physicalSize = const Size(1080, 2340);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
  }

  Future<void> login(WidgetTester tester, String phone, String name) async {
    await tester.pumpWidget(const UdanApp());
    await settle(tester);
    expect(find.text('Login with mobile number'), findsOneWidget);
    await tester.enterText(find.byKey(const Key('phone-field')), phone);
    await tester.tap(find.byKey(const Key('login-continue')));
    await settle(tester);
    expect(find.text('Enter OTP'), findsOneWidget);

    await tester.enterText(find.byKey(const Key('otp-field')), '000000');
    await tester.tap(find.byKey(const Key('login-continue')));
    await settle(tester);
    expect(find.textContaining('Wrong OTP'), findsOneWidget);

    await tester.enterText(
      find.byKey(const Key('otp-field')),
      DemoBackend.demoOtp,
    );
    await tester.tap(find.byKey(const Key('login-continue')));
    await settle(tester);
    expect(find.text('Tell us about you'), findsOneWidget);

    await tester.enterText(find.byKey(const Key('name-field')), name);
    await tester.tap(find.byKey(const Key('profile-save')));
    await settle(tester);
  }

  testWidgets(
    'student logs in, sees only free demo content, buys a batch and takes a test',
    (tester) async {
      await phoneSize(tester);
      await login(tester, '9876543210', 'Riya Sharma');

      // Home
      expect(find.text('Namaste, Riya 👋'), findsOneWidget);
      expect(find.text('Explore batches'), findsOneWidget);
      expect(find.text('Udaan Class 10 Board Batch 2027'), findsWidgets);

      // Students do not get the admin panel.
      await tester.tap(find.text('Profile'));
      await settle(tester);
      expect(find.byKey(const Key('admin-panel')), findsNothing);
      await tester.tap(find.text('Home'));
      await settle(tester);

      // Batch details
      await tester.tap(find.text('Udaan Class 10 Board Batch 2027').first);
      await settle(tester);
      expect(find.text('Buy now'), findsOneWidget);
      await tester.scrollUntilVisible(
        find.text('Choose a plan'),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      expect(find.text('Choose a plan'), findsOneWidget);

      // Free demo: free items visible, paid items hidden.
      await tester.ensureVisible(find.byKey(const Key('free-demo')));
      await tester.tap(find.byKey(const Key('free-demo')));
      await settle(tester);
      expect(
        find.text('Real Numbers - Lecture 1 (Introduction)'),
        findsOneWidget,
      );
      expect(find.text('Polynomials - Lecture 1'), findsNothing);
      expect(find.textContaining('free demo content'), findsOneWidget);
      await tester.pageBack();
      await settle(tester);

      // Buy (demo payment sheet)
      await tester.tap(find.byKey(const Key('buy-button')));
      await settle(tester);
      expect(find.text('Demo payment'), findsOneWidget);
      expect(find.text('₹2,499'), findsWidgets);
      await tester.tap(find.byKey(const Key('demo-pay')));
      await settle(tester);
      expect(find.text('Batch unlocked!'), findsOneWidget);
      await tester.tap(find.byKey(const Key('start-learning')));
      await settle(tester);

      // Everything is unlocked now.
      expect(find.text('Mathematics'), findsOneWidget);
      expect(find.text('Science'), findsOneWidget);
      expect(find.text('Polynomials - Lecture 1'), findsOneWidget);
      expect(find.textContaining('free demo content'), findsNothing);

      // Take the DPP: 2 correct (+8), 1 wrong (-1) = 7 / 12
      await tester.tap(find.text('DPP 1 - Real Numbers'));
      await settle(tester);
      await tester.tap(find.byKey(const Key('start-test')));
      await settle(tester);
      expect(find.text('Q 1 of 3'), findsOneWidget);
      await tester.tap(find.byKey(const Key('option-2')));
      await tester.tap(find.byKey(const Key('next-question')));
      await settle(tester);
      await tester.tap(find.byKey(const Key('option-1')));
      await tester.tap(find.byKey(const Key('next-question')));
      await settle(tester);
      await tester.tap(find.byKey(const Key('option-0')));
      await tester.tap(
        find.byKey(const Key('next-question')),
      ); // last question -> submit
      await settle(tester);
      await tester.tap(
        find.descendant(
          of: find.byType(AlertDialog),
          matching: find.widgetWithText(FilledButton, 'Submit'),
        ),
      );
      await settle(tester);
      expect(find.byKey(const Key('test-score')), findsOneWidget);
      expect(find.text('7 / 12'), findsOneWidget);
      expect(find.text('Solutions'), findsOneWidget);

      // Back to the test intro: the attempt is listed.
      await tester.pageBack();
      await settle(tester);
      expect(find.text('Your attempts'), findsOneWidget);

      // My Batches shows the purchase.
      await tester.pageBack(); // test intro -> content
      await settle(tester);
      await tester.pageBack(); // content -> home
      await settle(tester);
      await tester.tap(find.text('My Batches'));
      await settle(tester);
      expect(find.textContaining('days left'), findsOneWidget);
    },
  );

  testWidgets('free batch enrolls without payment', (tester) async {
    await phoneSize(tester);
    await login(tester, '9123456780', 'Aman');
    final card = courseCard('Class 9 Maths Crash Course');
    await tester.scrollUntilVisible(
      card,
      300,
      scrollable: find.byType(Scrollable).first,
    );
    await tester.ensureVisible(card);
    await settle(tester);
    await tester.tap(find.descendant(of: card, matching: find.text('Explore')));
    await settle(tester);
    expect(find.text('Enroll free'), findsOneWidget);
    await tester.tap(find.byKey(const Key('buy-button')));
    await settle(tester);
    expect(find.text('Batch unlocked!'), findsOneWidget);
  });

  testWidgets(
    'teacher creates a batch with a plan and it appears for students',
    (tester) async {
      await phoneSize(tester);
      await login(tester, '9999999999', 'Satyam');

      await tester.tap(find.text('Profile'));
      await settle(tester);
      await tester.tap(find.byKey(const Key('admin-panel')));
      await settle(tester);
      expect(find.text('Admin panel'), findsOneWidget);

      await tester.tap(find.byKey(const Key('new-batch')));
      await settle(tester);
      await tester.tap(find.byType(Switch).first); // Published
      await tester.enterText(
        find.byKey(const Key('batch-title')),
        'NEET Crash Course 2027',
      );
      await tester.scrollUntilVisible(
        find.byKey(const Key('plan-price-0')),
        300,
        scrollable: find.byType(Scrollable).first,
      );
      await tester.enterText(find.byKey(const Key('plan-price-0')), '1999');
      await tester.tap(find.byKey(const Key('save-batch')));
      await settle(tester);
      expect(find.text('NEET Crash Course 2027'), findsOneWidget);
      expect(find.textContaining('₹1,999'), findsOneWidget);

      // Add a subject and a free lecture.
      final newCard = find.ancestor(
        of: find.text('NEET Crash Course 2027'),
        matching: find.byType(Card),
      );
      await tester.tap(
        find.descendant(of: newCard, matching: find.text('Content')),
      );
      await settle(tester);
      await tester.tap(find.byKey(const Key('add-subject')));
      await settle(tester);
      await tester.enterText(find.byKey(const Key('subject-name')), 'Biology');
      await tester.tap(find.byKey(const Key('subject-save')));
      await settle(tester);
      await tester.tap(find.text('Biology'));
      await settle(tester);
      await tester.tap(find.byKey(const Key('add-item')));
      await settle(tester);
      await tester.enterText(
        find.byKey(const Key('item-title')),
        'Cell - Lecture 1',
      );
      await tester.enterText(
        find.byKey(const Key('item-url')),
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      );
      await tester.tap(find.byKey(const Key('save-item')));
      await settle(tester);
      expect(find.text('Cell - Lecture 1'), findsOneWidget);

      // Back to the student home: the new batch is listed.
      await tester.pageBack();
      await settle(tester);
      await tester.pageBack();
      await settle(tester);
      await tester.pageBack();
      await settle(tester);
      await tester.tap(find.text('Home'));
      await settle(tester);
      final studentCard = courseCard('NEET Crash Course 2027');
      await tester.scrollUntilVisible(
        studentCard,
        300,
        scrollable: find.byType(Scrollable).first,
      );
      expect(studentCard, findsOneWidget);
    },
  );
}
