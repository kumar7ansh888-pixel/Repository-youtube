import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../backend/backend.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../widgets/common.dart';
import '../admin/admin_home_screen.dart';
import '../auth/profile_setup_screen.dart';

class ProfileTab extends StatefulWidget {
  const ProfileTab({super.key, required this.profile});
  final StudentProfile profile;

  @override
  State<ProfileTab> createState() => _ProfileTabState();
}

class _ProfileTabState extends State<ProfileTab> {
  late final Future<bool> _isAdmin = backend.isAdmin();

  Future<void> _open(BuildContext context, Uri uri) async {
    final ok = await launchUrl(uri, mode: LaunchMode.externalApplication);
    if (!ok && context.mounted) showSnack(context, 'Could not open $uri');
  }

  Future<void> _deleteAccount(BuildContext context) async {
    final sure = await confirm(
      context,
      title: 'Delete account?',
      message:
          'Your profile, test results and access to all batches will be permanently deleted. '
          'This cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
    );
    if (!sure || !context.mounted) return;
    try {
      await backend.deleteAccount();
    } catch (e) {
      if (context.mounted) showSnack(context, friendlyError(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.profile;
    final initials = p.name
        .trim()
        .split(RegExp(r'\s+'))
        .take(2)
        .map((w) => w.isEmpty ? '' : w[0])
        .join()
        .toUpperCase();
    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.indigo,
                    child: Text(
                      initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.name,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          p.phone,
                          style: const TextStyle(color: Colors.black54),
                        ),
                        if (p.className.isNotEmpty)
                          Text(
                            [
                              p.className,
                              if (p.city.isNotEmpty) p.city,
                            ].join(' • '),
                            style: const TextStyle(color: Colors.black54),
                          ),
                      ],
                    ),
                  ),
                  IconButton(
                    tooltip: 'Edit profile',
                    icon: const Icon(Icons.edit_rounded),
                    onPressed: () {
                      final user = backend.currentUser;
                      if (user == null) return;
                      Navigator.push(
                        context,
                        MaterialPageRoute<void>(
                          builder: (_) => ProfileSetupScreen(
                            user: user,
                            existing: p,
                            isEditing: true,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          FutureBuilder<bool>(
            future: _isAdmin,
            builder: (context, snap) {
              if (snap.data != true) return const SizedBox.shrink();
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: Card(
                  color: AppColors.indigo,
                  child: ListTile(
                    key: const Key('admin-panel'),
                    leading: const Icon(
                      Icons.admin_panel_settings_rounded,
                      color: Colors.white,
                    ),
                    title: const Text(
                      'Admin panel',
                      style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    subtitle: const Text(
                      'Batches, lectures, tests and students',
                      style: TextStyle(color: Colors.white70),
                    ),
                    trailing: const Icon(
                      Icons.chevron_right_rounded,
                      color: Colors.white,
                    ),
                    onTap: () => Navigator.push(
                      context,
                      MaterialPageRoute<void>(
                        builder: (_) => const AdminHomeScreen(),
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(
                    Icons.chat_rounded,
                    color: AppColors.success,
                  ),
                  title: const Text('Ask a doubt on WhatsApp'),
                  onTap: () => _open(
                    context,
                    Uri.parse('https://wa.me/${AppConfig.supportWhatsApp}'),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(
                    Icons.call_rounded,
                    color: AppColors.indigo,
                  ),
                  title: const Text('Call support'),
                  onTap: () => _open(
                    context,
                    Uri.parse('tel:${AppConfig.supportPhone}'),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(
                    Icons.email_rounded,
                    color: AppColors.saffron,
                  ),
                  title: const Text('Email us'),
                  onTap: () => _open(
                    context,
                    Uri.parse('mailto:${AppConfig.supportEmail}'),
                  ),
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.privacy_tip_rounded),
                  title: const Text('Privacy policy'),
                  onTap: () =>
                      _open(context, Uri.parse(AppConfig.privacyPolicyUrl)),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.logout_rounded),
                  title: const Text('Log out'),
                  onTap: () async {
                    if (await confirm(
                      context,
                      title: 'Log out?',
                      message: 'You can log in again with your mobile number.',
                    )) {
                      await backend.signOut();
                    }
                  },
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(
                    Icons.delete_forever_rounded,
                    color: AppColors.danger,
                  ),
                  title: const Text(
                    'Delete my account',
                    style: TextStyle(color: AppColors.danger),
                  ),
                  onTap: () => _deleteAccount(context),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const Center(
            child: Text(
              '${AppConfig.brandName} • ${AppConfig.teacherName}',
              style: TextStyle(color: Colors.black38),
            ),
          ),
        ],
      ),
    );
  }
}
