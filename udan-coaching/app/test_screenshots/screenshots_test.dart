// Renders app screens to PNG files using the demo data, e.g. for the
// Play Store listing. Not part of the normal test run. From the app folder:
//
//   flutter test test_screenshots/screenshots_test.dart --dart-define=OUT=$PWD/screenshots
//
// Images are 720x1560 (phone, 2x). Emoji show as boxes here only.
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:udan_coaching/app.dart';
import 'package:udan_coaching/backend/backend.dart';
import 'package:udan_coaching/backend/demo_backend.dart';
import 'package:udan_coaching/widgets/common.dart';

const out = String.fromEnvironment('OUT', defaultValue: 'screenshots');
final fontDir =
    '${Platform.environment['FLUTTER_ROOT']}/bin/cache/artifacts/material_fonts';

Future<void> loadFonts() async {
  Future<ByteData> f(String name) async =>
      ByteData.sublistView(await File('$fontDir/$name').readAsBytes());
  final roboto = FontLoader('Roboto')
    ..addFont(f('Roboto-Regular.ttf'))
    ..addFont(f('Roboto-Medium.ttf'))
    ..addFont(f('Roboto-Bold.ttf'))
    ..addFont(f('Roboto-Black.ttf'));
  await roboto.load();
  // flutter_test draws text in a box font called FlutterTest; replace it.
  for (final family in ['FlutterTest', 'Ahem']) {
    final fallback = FontLoader(family)
      ..addFont(f('Roboto-Regular.ttf'))
      ..addFont(f('Roboto-Medium.ttf'))
      ..addFont(f('Roboto-Bold.ttf'));
    await fallback.load();
  }
  final icons = FontLoader('MaterialIcons')
    ..addFont(f('MaterialIcons-Regular.otf'));
  await icons.load();
}

void main() {
  final key = GlobalKey();

  Future<void> settle(WidgetTester t) async {
    for (var i = 0; i < 12; i++) {
      await t.pump(const Duration(milliseconds: 150));
    }
  }

  Future<void> shot(WidgetTester t, String name) async {
    await t.runAsync(() async {
      final boundary =
          key.currentContext!.findRenderObject()! as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 2);
      final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
      await Directory(out).create(recursive: true);
      await File('$out/$name.png').writeAsBytes(bytes!.buffer.asUint8List());
    });
  }

  testWidgets('screens', (t) async {
    debugDisableShadows = false;
    await t.runAsync(loadFonts);
    t.view.physicalSize = const Size(1080, 2340);
    t.view.devicePixelRatio = 3;
    backend = DemoBackend();

    await t.pumpWidget(RepaintBoundary(key: key, child: const UdanApp()));
    await settle(t);
    await t.enterText(find.byKey(const Key('phone-field')), '9876543210');
    await settle(t);
    await shot(t, '01_login');
    await t.tap(find.byKey(const Key('login-continue')));
    await settle(t);
    await t.enterText(find.byKey(const Key('otp-field')), '123456');
    await t.tap(find.byKey(const Key('login-continue')));
    await settle(t);
    await t.enterText(find.byKey(const Key('name-field')), 'Riya Sharma');
    await t.tap(find.byKey(const Key('profile-save')));
    await settle(t);
    await shot(t, '02_home');

    await t.tap(
      find.byWidgetPredicate((w) => w is CourseCard && w.course.id == 'c10'),
    );
    await settle(t);
    await shot(t, '03_batch');
    await t.drag(find.byType(Scrollable).first, const Offset(0, -700));
    await settle(t);
    await shot(t, '04_plans');

    await t.tap(find.byKey(const Key('buy-button')));
    await settle(t);
    await shot(t, '05_payment');
    await t.tap(find.byKey(const Key('demo-pay')));
    await settle(t);
    await t.tap(find.byKey(const Key('start-learning')));
    await settle(t);
    await shot(t, '06_content');

    await t.tap(find.text('DPP 1 - Real Numbers'));
    await settle(t);
    await t.tap(find.byKey(const Key('start-test')));
    await settle(t);
    await t.tap(find.byKey(const Key('option-2')));
    await settle(t);
    await shot(t, '07_test');
    await t.tap(find.byKey(const Key('next-question')));
    await settle(t);
    await t.tap(find.byKey(const Key('option-1')));
    await t.tap(find.byKey(const Key('next-question')));
    await settle(t);
    await t.tap(find.byKey(const Key('option-0')));
    await t.tap(find.byKey(const Key('next-question')));
    await settle(t);
    await t.tap(
      find.descendant(
        of: find.byType(AlertDialog),
        matching: find.widgetWithText(FilledButton, 'Submit'),
      ),
    );
    await settle(t);
    await shot(t, '08_result');
    debugDisableShadows = true;
  });

  testWidgets('admin screens', (t) async {
    debugDisableShadows = false;
    await t.runAsync(loadFonts);
    t.view.physicalSize = const Size(1080, 2340);
    t.view.devicePixelRatio = 3;
    backend = DemoBackend();
    await t.pumpWidget(RepaintBoundary(key: key, child: const UdanApp()));
    await settle(t);
    await t.enterText(find.byKey(const Key('phone-field')), '9999999999');
    await t.tap(find.byKey(const Key('login-continue')));
    await settle(t);
    await t.enterText(find.byKey(const Key('otp-field')), '123456');
    await t.tap(find.byKey(const Key('login-continue')));
    await settle(t);
    await t.enterText(find.byKey(const Key('name-field')), 'Satyam');
    await t.tap(find.byKey(const Key('profile-save')));
    await settle(t);
    await t.tap(find.text('Profile'));
    await settle(t);
    await shot(t, '09_profile');
    await t.tap(find.byKey(const Key('admin-panel')));
    await settle(t);
    await shot(t, '10_admin');
    await t.tap(find.text('Content').first);
    await settle(t);
    await t.tap(find.text('Mathematics'));
    await settle(t);
    await t.tap(find.byKey(const Key('add-item')));
    await settle(t);
    await t.enterText(
      find.byKey(const Key('item-title')),
      'Polynomials - Lecture 2',
    );
    await t.enterText(
      find.byKey(const Key('item-url')),
      'https://youtu.be/xxxxxxxxxxx',
    );
    await settle(t);
    await shot(t, '11_add_lecture');
    debugDisableShadows = true;
  });
}
