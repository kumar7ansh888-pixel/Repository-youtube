import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';
import 'admin_content_screen.dart';
import 'course_editor_screen.dart';
import 'students_screen.dart';

/// Admin panel home: every batch (published or draft) and student tools.
class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  late final Stream<List<Course>> _courses = backend.allCourses();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin panel'),
        actions: [
          TextButton.icon(
            icon: const Icon(Icons.people_alt_rounded),
            label: const Text('Students'),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute<void>(builder: (_) => const StudentsScreen()),
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        key: const Key('new-batch'),
        icon: const Icon(Icons.add_rounded),
        label: const Text('New batch'),
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute<void>(builder: (_) => const CourseEditorScreen()),
        ),
      ),
      body: StreamBuilder<List<Course>>(
        stream: _courses,
        builder: (context, snap) {
          if (snap.hasError) return ErrorView(error: snap.error!);
          if (!snap.hasData) return const LoadingView();
          final courses = snap.data!;
          if (courses.isEmpty) {
            return const MessageView(
              icon: Icons.add_box_outlined,
              title: 'No batches yet',
              message: 'Tap "New batch" to create your first batch.',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
            itemCount: courses.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, i) => _AdminCourseCard(course: courses[i]),
          );
        },
      ),
    );
  }
}

class _AdminCourseCard extends StatelessWidget {
  const _AdminCourseCard({required this.course});
  final Course course;

  @override
  Widget build(BuildContext context) {
    final plan = course.cheapestPlan;
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    course.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 3,
                  ),
                  decoration: BoxDecoration(
                    color: (course.published ? AppColors.success : Colors.grey)
                        .withValues(alpha: 0.14),
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    course.published ? 'LIVE' : 'DRAFT',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: course.published
                          ? AppColors.success
                          : Colors.black54,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              [
                if (course.category.isNotEmpty) course.category,
                '${course.plans.length} ${course.plans.length == 1 ? 'plan' : 'plans'}',
                if (plan != null)
                  'from ${plan.isFree ? 'FREE' : rupees(plan.price)}',
              ].join(' • '),
              style: const TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                FilledButton.tonalIcon(
                  icon: const Icon(Icons.video_library_rounded, size: 18),
                  label: const Text('Content'),
                  style: FilledButton.styleFrom(minimumSize: const Size(0, 40)),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                      builder: (_) => AdminContentScreen(course: course),
                    ),
                  ),
                ),
                OutlinedButton.icon(
                  icon: const Icon(Icons.edit_rounded, size: 18),
                  label: const Text('Details & price'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 40),
                  ),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                      builder: (_) => CourseEditorScreen(course: course),
                    ),
                  ),
                ),
                OutlinedButton.icon(
                  icon: const Icon(Icons.groups_rounded, size: 18),
                  label: const Text('Enrolled'),
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(0, 40),
                  ),
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute<void>(
                      builder: (_) => CourseStudentsScreen(course: course),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
