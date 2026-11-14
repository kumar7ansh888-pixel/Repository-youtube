import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../backend/backend.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';

/// Find a student by mobile number and unlock a batch for them
/// (for fees paid in cash / offline at the coaching centre).
class StudentsScreen extends StatefulWidget {
  const StudentsScreen({super.key});

  @override
  State<StudentsScreen> createState() => _StudentsScreenState();
}

class _StudentsScreenState extends State<StudentsScreen> {
  final _phone = TextEditingController();
  List<StudentProfile>? _results;
  bool _searching = false;

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  Future<void> _search() async {
    final phone = normalizeIndianPhone(_phone.text);
    if (phone == null) {
      showSnack(context, 'Enter a valid 10 digit mobile number');
      return;
    }
    setState(() => _searching = true);
    try {
      final results = await backend.findStudentsByPhone(phone);
      if (mounted) setState(() => _results = results);
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    } finally {
      if (mounted) setState(() => _searching = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final results = _results;
    return Scaffold(
      appBar: AppBar(title: const Text('Students')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Give batch access to a student who paid offline. The student must have logged in to the app once.',
            style: TextStyle(color: Colors.black54),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: TextField(
                  key: const Key('student-phone'),
                  controller: _phone,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(10),
                  ],
                  decoration: const InputDecoration(
                    prefixText: '${AppConfig.countryCode}  ',
                    labelText: 'Mobile number',
                  ),
                  onSubmitted: (_) => _search(),
                ),
              ),
              const SizedBox(width: 10),
              IconButton.filled(
                key: const Key('student-search'),
                onPressed: _searching ? null : _search,
                icon: const Icon(Icons.search_rounded),
              ),
            ],
          ),
          const SizedBox(height: 16),
          if (_searching) const LoadingView(),
          if (results != null && results.isEmpty && !_searching)
            const MessageView(
              icon: Icons.person_search_rounded,
              title: 'No student found',
              message: 'Ask the student to open the app and log in with this number first.',
            ),
          if (results != null)
            for (final s in results)
              Card(
                margin: const EdgeInsets.only(bottom: 8),
                child: ListTile(
                  leading: const CircleAvatar(
                    child: Icon(Icons.person_rounded),
                  ),
                  title: Text(
                    s.name,
                    style: const TextStyle(fontWeight: FontWeight.w700),
                  ),
                  subtitle: Text(
                    [
                      s.phone,
                      if (s.className.isNotEmpty) s.className,
                    ].join(' • '),
                  ),
                  trailing: FilledButton.tonal(
                    key: Key('grant-${s.uid}'),
                    onPressed: () => showDialog<void>(
                      context: context,
                      builder: (_) => GrantAccessDialog(student: s),
                    ),
                    child: const Text('Give access'),
                  ),
                ),
              ),
        ],
      ),
    );
  }
}

class GrantAccessDialog extends StatefulWidget {
  const GrantAccessDialog({super.key, required this.student});
  final StudentProfile student;

  @override
  State<GrantAccessDialog> createState() => _GrantAccessDialogState();
}

class _GrantAccessDialogState extends State<GrantAccessDialog> {
  late final Stream<List<Course>> _courses = backend.allCourses();
  final _days = TextEditingController(text: '365');
  String? _courseId;
  bool _saving = false;

  @override
  void dispose() {
    _days.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Course>>(
      stream: _courses,
      builder: (context, snap) {
        final courses = snap.data ?? const <Course>[];
        Course? selected;
        for (final c in courses) {
          if (c.id == _courseId) selected = c;
        }
        return AlertDialog(
          title: Text('Give access to ${widget.student.name}'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              DropdownButtonFormField<String>(
                key: const Key('grant-course'),
                initialValue: _courseId,
                isExpanded: true,
                decoration: const InputDecoration(labelText: 'Batch'),
                items: [
                  for (final c in courses)
                    DropdownMenuItem(
                      value: c.id,
                      child: Text(c.title, overflow: TextOverflow.ellipsis),
                    ),
                ],
                onChanged: (v) => setState(() => _courseId = v),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _days,
                keyboardType: TextInputType.number,
                inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                decoration: const InputDecoration(
                  labelText: 'Number of days',
                  helperText: 'Adds to any days left',
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            FilledButton(
              key: const Key('grant-confirm'),
              onPressed: _saving || selected == null
                  ? null
                  : () async {
                      final days = int.tryParse(_days.text) ?? 0;
                      if (days <= 0) {
                        showSnack(context, 'Enter the number of days');
                        return;
                      }
                      setState(() => _saving = true);
                      try {
                        await backend.grantAccess(
                          student: widget.student,
                          course: selected!,
                          days: days,
                        );
                        if (!context.mounted) return;
                        Navigator.pop(context);
                        showSnack(
                          context,
                          'Access given to ${widget.student.name}',
                        );
                      } catch (e) {
                        if (context.mounted) {
                          showSnack(context, friendlyError(e));
                        }
                      } finally {
                        if (mounted) setState(() => _saving = false);
                      }
                    },
              child: const Text('Give access'),
            ),
          ],
        );
      },
    );
  }
}

/// Everyone who has (or had) access to one batch.
class CourseStudentsScreen extends StatefulWidget {
  const CourseStudentsScreen({super.key, required this.course});
  final Course course;

  @override
  State<CourseStudentsScreen> createState() => _CourseStudentsScreenState();
}

class _CourseStudentsScreenState extends State<CourseStudentsScreen> {
  late final Stream<List<Enrollment>> _enrollments = backend.courseEnrollments(
    widget.course.id,
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Enrolled • ${widget.course.title}',
          overflow: TextOverflow.ellipsis,
        ),
      ),
      body: StreamBuilder<List<Enrollment>>(
        stream: _enrollments,
        builder: (context, snap) {
          if (snap.hasError) return ErrorView(error: snap.error!);
          if (!snap.hasData) return const LoadingView();
          final list = snap.data!;
          if (list.isEmpty) {
            return const MessageView(
              icon: Icons.groups_outlined,
              title: 'No students yet',
            );
          }
          final active = list.where((e) => e.isActive).length;
          final revenue = list.fold<num>(0, (sum, e) => sum + e.amountPaid);
          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Row(
                children: [
                  Expanded(
                    child: _StatCard(
                      label: 'Active students',
                      value: '$active',
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _StatCard(
                      label: 'Collected online',
                      value: rupees(revenue),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              for (final e in list)
                Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    title: Text(
                      e.studentName.isEmpty ? e.studentPhone : e.studentName,
                      style: const TextStyle(fontWeight: FontWeight.w700),
                    ),
                    subtitle: Text(
                      [
                        if (e.studentPhone.isNotEmpty) e.studentPhone,
                        e.planName,
                        if (e.amountPaid > 0) rupees(e.amountPaid),
                        if (e.expiresAt != null)
                          e.isActive
                              ? 'till ${formatDate(e.expiresAt!)}'
                              : 'expired ${formatDate(e.expiresAt!)}',
                      ].join(' • '),
                    ),
                    trailing: PopupMenuButton<String>(
                      onSelected: (_) async {
                        final ok = await confirm(
                          context,
                          title: 'Remove access?',
                          message:
                              '${e.studentName} will lose access to this batch.',
                          confirmText: 'Remove',
                          destructive: true,
                        );
                        if (!ok) return;
                        try {
                          await backend.revokeAccess(e.id);
                        } catch (err) {
                          if (context.mounted) {
                            showSnack(context, friendlyError(err));
                          }
                        }
                      },
                      itemBuilder: (_) => const [
                        PopupMenuItem(
                          value: 'revoke',
                          child: Text('Remove access'),
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _StatCard extends StatelessWidget {
  const _StatCard({required this.label, required this.value});
  final String label;
  final String value;

  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w900,
              color: AppColors.indigoDark,
            ),
          ),
          const SizedBox(height: 2),
          Text(label, style: const TextStyle(color: Colors.black54)),
        ],
      ),
    ),
  );
}
