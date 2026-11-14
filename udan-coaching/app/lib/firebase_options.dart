// PLACEHOLDER - replace this file by running, inside the app folder:
//
//   dart pub global activate flutterfire_cli
//   flutterfire configure
//
// flutterfire writes the real settings of your Firebase project here.
// While the values below start with REPLACE, the app runs in demo mode
// with sample data (see lib/backend/demo_backend.dart).
// ignore_for_file: type=lint
import 'package:firebase_core/firebase_core.dart' show FirebaseOptions;

class DefaultFirebaseOptions {
  static FirebaseOptions get currentPlatform => android;

  static const FirebaseOptions android = FirebaseOptions(
    apiKey: 'REPLACE_ME',
    appId: 'REPLACE_ME',
    messagingSenderId: 'REPLACE_ME',
    projectId: 'REPLACE_ME',
  );
}
