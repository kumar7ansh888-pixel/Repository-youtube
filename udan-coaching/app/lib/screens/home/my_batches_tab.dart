import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';
import '../course/course_content_screen.dart';
import '../course/course_detail_screen.dart';

class MyBatchesTab extends StatefulWidget {
  const MyBatchesTab({super.key});

  @override
  State<MyBatchesTab> createState() => _MyBatchesTabState();
}

class _MyBatchesTabState extends State<MyBatchesTab> {
  late final Stream<List<Enrollment>> _enrollments = backend.myEnrollments();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Batches')),
      body: StreamBuilder<List<Enrollment>>(
        stream: _enrollments,
        builder: (context, snap) {
          if (snap.hasError) return ErrorView(error: snap.error!);
          if (!snap.hasData) return const LoadingView();
          final list = snap.data!.toList()
            ..sort((a, b) {
              if (a.isActive != b.isActive) return a.isActive ? -1 : 1;
              return (b.expiresAt ?? DateTime(0)).compareTo(
                a.expiresAt ?? DateTime(0),
              );
            });
          if (list.isEmpty) {
            return const MessageView(
              icon: Icons.menu_book_outlined,
              title: 'No batches yet',
              message: 'Batches you buy will show up here. Explore batches on the Home tab.',
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: list.length,
            separatorBuilder: (_, _) => const SizedBox(height: 12),
            itemBuilder: (context, i) => _EnrollmentTile(enrollment: list[i]),
          );
        },
      ),
    );
  }
}

class _EnrollmentTile extends StatelessWidget {
  const _EnrollmentTile({required this.enrollment});
  final Enrollment enrollment;

  @override
  Widget build(BuildContext context) {
    final active = enrollment.isActive;
    final expires = enrollment.expiresAt;
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute<void>(
            builder: (_) => active
                ? CourseContentScreen(courseId: enrollment.courseId)
                : CourseDetailScreen(courseId: enrollment.courseId),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: (active ? AppColors.indigo : Colors.grey).withValues(
                    alpha: 0.1,
                  ),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  Icons.menu_book_rounded,
                  color: active ? AppColors.indigo : Colors.grey,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      enrollment.courseTitle.isEmpty
                          ? 'Batch'
                          : enrollment.courseTitle,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      expires == null
                          ? enrollment.planName
                          : active
                          ? 'Valid till ${formatDate(expires)} • ${daysLeft(expires)} days left'
                          : 'Expired on ${formatDate(expires)} • Tap to renew',
                      style: TextStyle(
                        color: active ? Colors.black54 : AppColors.danger,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                active ? Icons.play_circle_fill_rounded : Icons.refresh_rounded,
                color: active ? AppColors.indigo : AppColors.saffron,
                size: 30,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
