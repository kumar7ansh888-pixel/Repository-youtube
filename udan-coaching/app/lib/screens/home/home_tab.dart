import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../widgets/common.dart';
import '../course/course_detail_screen.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({
    super.key,
    required this.profile,
    required this.onOpenMyBatches,
  });
  final StudentProfile profile;
  final VoidCallback onOpenMyBatches;

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  late final Stream<List<Course>> _courses = backend.publishedCourses();
  late final Stream<List<Enrollment>> _enrollments = backend.myEnrollments();
  String _category = 'All';

  @override
  Widget build(BuildContext context) {
    final firstName = widget.profile.name.trim().split(' ').first;
    return StreamBuilder<List<Enrollment>>(
      stream: _enrollments,
      builder: (context, enrollSnap) {
        final enrollments = {
          for (final e in enrollSnap.data ?? const <Enrollment>[])
            e.courseId: e,
        };
        return StreamBuilder<List<Course>>(
          stream: _courses,
          builder: (context, snap) {
            final courses = snap.data ?? const <Course>[];
            final categories = <String>{
              'All',
              ...courses.map((c) => c.category).where((c) => c.isNotEmpty),
            };
            final visible = _category == 'All'
                ? courses
                : courses.where((c) => c.category == _category).toList();
            final activeCount = enrollments.values
                .where((e) => e.isActive)
                .length;

            return CustomScrollView(
              slivers: [
                SliverToBoxAdapter(
                  child: _Header(
                    name: firstName,
                    activeCount: activeCount,
                    onOpenMyBatches: widget.onOpenMyBatches,
                  ),
                ),
                if (categories.length > 2)
                  SliverToBoxAdapter(
                    child: SizedBox(
                      height: 56,
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        children: [
                          for (final c in categories)
                            Padding(
                              padding: const EdgeInsets.only(right: 8),
                              child: ChoiceChip(
                                label: Text(c),
                                selected: _category == c,
                                onSelected: (_) =>
                                    setState(() => _category = c),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                const SliverPadding(
                  padding: EdgeInsets.fromLTRB(16, 8, 16, 8),
                  sliver: SliverToBoxAdapter(
                    child: Text(
                      'Explore batches',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.indigoDark,
                      ),
                    ),
                  ),
                ),
                if (snap.hasError)
                  SliverFillRemaining(
                    hasScrollBody: false,
                    child: ErrorView(error: snap.error!),
                  )
                else if (!snap.hasData)
                  const SliverFillRemaining(
                    hasScrollBody: false,
                    child: LoadingView(),
                  )
                else if (visible.isEmpty)
                  const SliverFillRemaining(
                    hasScrollBody: false,
                    child: MessageView(
                      icon: Icons.school_outlined,
                      title: 'New batches are coming soon',
                      message: 'Check back in a little while.',
                    ),
                  )
                else
                  SliverPadding(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                    sliver: SliverList.separated(
                      itemCount: visible.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 16),
                      itemBuilder: (context, i) {
                        final course = visible[i];
                        return CourseCard(
                          course: course,
                          enrollment: enrollments[course.id],
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute<void>(
                              builder: (_) =>
                                  CourseDetailScreen(courseId: course.id),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
              ],
            );
          },
        );
      },
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({
    required this.name,
    required this.activeCount,
    required this.onOpenMyBatches,
  });
  final String name;
  final int activeCount;
  final VoidCallback onOpenMyBatches;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.brandGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(28)),
      ),
      padding: EdgeInsets.fromLTRB(
        20,
        MediaQuery.of(context).padding.top + 16,
        20,
        24,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              BrandLogo(size: 40),
              SizedBox(width: 10),
              Text(
                AppConfig.brandName,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Text(
            'Namaste, $name 👋',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 4),
          const Text(
            'Aaj kya padhenge? Learn with ${AppConfig.teacherName}.',
            style: TextStyle(color: Colors.white70, fontSize: 15),
          ),
          if (activeCount > 0) ...[
            const SizedBox(height: 16),
            Material(
              color: Colors.white,
              borderRadius: BorderRadius.circular(14),
              child: InkWell(
                borderRadius: BorderRadius.circular(14),
                onTap: onOpenMyBatches,
                child: Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 12,
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.play_lesson_rounded,
                        color: AppColors.indigo,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'Continue learning • $activeCount ${activeCount == 1 ? 'batch' : 'batches'}',
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            color: AppColors.indigoDark,
                          ),
                        ),
                      ),
                      const Icon(
                        Icons.chevron_right_rounded,
                        color: AppColors.indigo,
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
