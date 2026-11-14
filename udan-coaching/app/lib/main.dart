import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'app.dart';
import 'backend/backend.dart';
import 'backend/demo_backend.dart';
import 'backend/firebase_backend.dart';
import 'firebase_options.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  backend = await createBackend();
  runApp(const UdanApp());
}

/// Uses Firebase when lib/firebase_options.dart has real values, otherwise
/// demo mode. Build with --dart-define=DEMO=true to force demo mode.
Future<AppBackend> createBackend() async {
  const forceDemo = bool.fromEnvironment('DEMO');
  if (!forceDemo) {
    try {
      final options = DefaultFirebaseOptions.currentPlatform;
      if (!options.apiKey.startsWith('REPLACE')) {
        await Firebase.initializeApp(options: options);
        return FirebaseBackend();
      }
    } catch (e) {
      debugPrint('Firebase is not set up, starting in demo mode: $e');
    }
  }
  return DemoBackend();
}
