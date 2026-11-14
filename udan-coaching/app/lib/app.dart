import 'package:flutter/material.dart';

import 'backend/backend.dart';
import 'config/app_config.dart';
import 'config/theme.dart';
import 'models/models.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/profile_setup_screen.dart';
import 'screens/home/home_shell.dart';
import 'widgets/common.dart';

class UdanApp extends StatelessWidget {
  const UdanApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.brandName,
      debugShowCheckedModeBanner: false,
      theme: buildTheme(),
      home: const AuthGate(),
    );
  }
}

/// Decides the first screen: login -> profile setup -> home.
class AuthGate extends StatefulWidget {
  const AuthGate({super.key});

  @override
  State<AuthGate> createState() => _AuthGateState();
}

class _AuthGateState extends State<AuthGate> {
  late final Stream<AppUser?> _auth = backend.authChanges().distinct(
    (a, b) => a?.uid == b?.uid,
  );
  String? _profileUid;
  Stream<StudentProfile?>? _profile;

  Stream<StudentProfile?> _profileFor(String uid) {
    if (_profileUid != uid || _profile == null) {
      _profileUid = uid;
      _profile = backend.profile(uid);
    }
    return _profile!;
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AppUser?>(
      stream: _auth,
      initialData: backend.currentUser,
      builder: (context, authSnap) {
        final user = authSnap.data;
        if (user == null) return const LoginScreen();
        return StreamBuilder<StudentProfile?>(
          key: ValueKey(user.uid),
          stream: _profileFor(user.uid),
          builder: (context, profileSnap) {
            if (profileSnap.hasError) {
              return Scaffold(body: ErrorView(error: profileSnap.error!));
            }
            if (profileSnap.connectionState == ConnectionState.waiting &&
                !profileSnap.hasData) {
              return const Scaffold(body: LoadingView());
            }
            final profile = profileSnap.data;
            if (profile == null || !profile.isComplete) {
              return ProfileSetupScreen(user: user, existing: profile);
            }
            return HomeShell(profile: profile);
          },
        );
      },
    );
  }
}
