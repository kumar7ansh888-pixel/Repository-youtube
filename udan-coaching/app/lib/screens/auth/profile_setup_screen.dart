import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../config/app_config.dart';
import '../../models/models.dart';
import '../../widgets/common.dart';

/// Asks for the student's name and class. Used after the first login and
/// from Profile -> Edit profile.
class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({
    super.key,
    required this.user,
    this.existing,
    this.isEditing = false,
  });

  final AppUser user;
  final StudentProfile? existing;
  final bool isEditing;

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  late final _name = TextEditingController(text: widget.existing?.name ?? '');
  late final _city = TextEditingController(text: widget.existing?.city ?? '');
  late String? _className = (widget.existing?.className.isNotEmpty ?? false)
      ? widget.existing!.className
      : null;
  final _formKey = GlobalKey<FormState>();
  bool _saving = false;

  @override
  void dispose() {
    _name.dispose();
    _city.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await backend.saveProfile(
        StudentProfile(
          uid: widget.user.uid,
          name: _name.text,
          phone: widget.user.phone,
          className: _className ?? '',
          city: _city.text,
        ),
      );
      if (widget.isEditing && mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEditing ? 'Edit profile' : 'Tell us about you'),
        actions: [
          if (!widget.isEditing)
            TextButton(
              onPressed: () => backend.signOut(),
              child: const Text('Log out'),
            ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24),
          children: [
            if (!widget.isEditing) ...[
              const Text(
                'Welcome to ${AppConfig.brandName}!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 6),
              const Text(
                'Just a few details so we can show the right batches.',
                style: TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 24),
            ],
            TextFormField(
              key: const Key('name-field'),
              controller: _name,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'Full name'),
              validator: (v) => (v == null || v.trim().isEmpty)
                  ? 'Please enter your name'
                  : (v.trim().length > 80 ? 'Name is too long' : null),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<String>(
              key: const Key('class-field'),
              initialValue: _className,
              decoration: const InputDecoration(labelText: 'Class'),
              items: [
                for (final c in AppConfig.studentClasses)
                  DropdownMenuItem(value: c, child: Text(c)),
              ],
              onChanged: (v) => setState(() => _className = v),
            ),
            const SizedBox(height: 16),
            TextFormField(
              controller: _city,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(labelText: 'City (optional)'),
            ),
            const SizedBox(height: 16),
            InputDecorator(
              decoration: const InputDecoration(labelText: 'Mobile number'),
              child: Text(widget.user.phone),
            ),
            const SizedBox(height: 28),
            FilledButton(
              key: const Key('profile-save'),
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : Text(widget.isEditing ? 'Save' : 'Start learning'),
            ),
          ],
        ),
      ),
    );
  }
}
