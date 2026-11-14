import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../services/payment_service.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';
import 'course_content_screen.dart';

/// Batch details, plans and the Buy button.
class CourseDetailScreen extends StatefulWidget {
  const CourseDetailScreen({super.key, required this.courseId});
  final String courseId;

  @override
  State<CourseDetailScreen> createState() => _CourseDetailScreenState();
}

class _CourseDetailScreenState extends State<CourseDetailScreen> {
  late final Stream<Course?> _course = backend.course(widget.courseId);
  late final Stream<Enrollment?> _enrollment = backend.myEnrollment(
    widget.courseId,
  );
  late final Stream<List<Subject>> _subjects = backend.subjects(
    widget.courseId,
  );
  String? _planId;
  bool _buying = false;

  Future<void> _buy(Course course, CoursePlan plan) async {
    setState(() => _buying = true);
    try {
      final result = await PaymentService.buy(context, course, plan);
      if (!mounted) return;
      setState(() => _buying = false);
      if (result == PurchaseResult.success) {
        await showDialog<void>(
          context: context,
          builder: (ctx) => AlertDialog(
            icon: const Icon(
              Icons.verified_rounded,
              color: AppColors.success,
              size: 48,
            ),
            title: const Text('Batch unlocked!'),
            content: Text(
              'You now have access to ${course.title}. Happy learning!',
            ),
            actions: [
              FilledButton(
                key: const Key('start-learning'),
                onPressed: () => Navigator.pop(ctx),
                child: const Text('Start learning'),
              ),
            ],
          ),
        );
        if (!mounted) return;
        Navigator.pushReplacement(
          context,
          MaterialPageRoute<void>(
            builder: (_) => CourseContentScreen(courseId: course.id),
          ),
        );
      }
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    } finally {
      if (mounted) setState(() => _buying = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Course?>(
      stream: _course,
      builder: (context, snap) {
        if (snap.hasError) {
          return Scaffold(
            appBar: AppBar(),
            body: ErrorView(error: snap.error!),
          );
        }
        if (!snap.hasData && snap.connectionState == ConnectionState.waiting) {
          return Scaffold(appBar: AppBar(), body: const LoadingView());
        }
        final course = snap.data;
        if (course == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const MessageView(
              icon: Icons.search_off_rounded,
              title: 'This batch is not available',
            ),
          );
        }
        final plans = course.plans;
        final selected =
            course.planById(_planId ?? '') ??
            (plans.isEmpty ? null : plans.first);

        return StreamBuilder<List<Subject>>(
          stream: _subjects,
          builder: (context, subjectSnap) => StreamBuilder<Enrollment?>(
            stream: _enrollment,
            builder: (context, enrollSnap) {
              final subjects = subjectSnap.data ?? const <Subject>[];
              final enrollment = enrollSnap.data;
              final active = enrollment?.isActive ?? false;
              return Scaffold(
                appBar: AppBar(
                  title: Text(course.title, overflow: TextOverflow.ellipsis),
                ),
                body: ListView(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
                  children: [
                    CourseThumb(course: course, height: 190),
                    const SizedBox(height: 16),
                    Text(
                      course.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppColors.indigoDark,
                      ),
                    ),
                    if (course.subtitle.isNotEmpty) ...[
                      const SizedBox(height: 4),
                      Text(
                        course.subtitle,
                        style: const TextStyle(
                          color: Colors.black54,
                          fontSize: 15,
                        ),
                      ),
                    ],
                    const SizedBox(height: 12),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _Chip(
                          icon: Icons.person_rounded,
                          text: AppConfig.teacherName,
                        ),
                        _Chip(
                          icon: Icons.translate_rounded,
                          text: course.language,
                        ),
                        if (course.category.isNotEmpty)
                          _Chip(
                            icon: Icons.school_rounded,
                            text: course.category,
                          ),
                        if (course.startDate != null)
                          _Chip(
                            icon: Icons.event_rounded,
                            text: 'Starts ${formatDate(course.startDate!)}',
                          ),
                      ],
                    ),
                    if (active) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.success.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.verified_rounded,
                              color: AppColors.success,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'You have this batch till ${formatDate(enrollment!.expiresAt!)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    if (course.features.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      const _SectionTitle('This batch includes'),
                      for (final f in course.features)
                        Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Icon(
                                Icons.check_circle_rounded,
                                color: AppColors.success,
                                size: 20,
                              ),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Text(
                                  f,
                                  style: const TextStyle(fontSize: 15),
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                    if (course.description.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      const _SectionTitle('About'),
                      Text(
                        course.description,
                        style: const TextStyle(fontSize: 15, height: 1.45),
                      ),
                    ],
                    if (subjects.isNotEmpty) ...[
                      const SizedBox(height: 20),
                      const _SectionTitle('Subjects'),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          for (final sub in subjects)
                            Chip(label: Text(sub.name)),
                        ],
                      ),
                    ],
                    if (!active) ...[
                      const SizedBox(height: 16),
                      OutlinedButton.icon(
                        key: const Key('free-demo'),
                        icon: const Icon(Icons.play_circle_outline_rounded),
                        label: const Text('Watch free demo lectures'),
                        onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute<void>(
                            builder: (_) =>
                                CourseContentScreen(courseId: course.id),
                          ),
                        ),
                      ),
                    ],
                    if (!active && plans.length > 1) ...[
                      const SizedBox(height: 20),
                      const _SectionTitle('Choose a plan'),
                      RadioGroup<String>(
                        groupValue: selected?.id,
                        onChanged: (v) => setState(() => _planId = v),
                        child: Column(
                          children: [
                            for (final p in plans)
                              Padding(
                                padding: const EdgeInsets.only(bottom: 10),
                                child: _PlanTile(
                                  plan: p,
                                  selected: p.id == selected?.id,
                                  onTap: () => setState(() => _planId = p.id),
                                ),
                              ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
                bottomNavigationBar: SafeArea(
                  child: Container(
                    padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      border: Border(top: BorderSide(color: Color(0xFFE3E8F2))),
                    ),
                    child: Row(
                      children: [
                        if (selected != null && !active)
                          Expanded(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                PriceTag(plan: selected),
                                Text(
                                  'Valid for ${validityText(selected.validityDays)}',
                                  style: const TextStyle(
                                    color: Colors.black54,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        if (active) const Spacer(),
                        const SizedBox(width: 12),
                        FilledButton(
                          key: const Key('buy-button'),
                          onPressed: _buying
                              ? null
                              : active
                              ? () => Navigator.push(
                                  context,
                                  MaterialPageRoute<void>(
                                    builder: (_) => CourseContentScreen(
                                      courseId: course.id,
                                    ),
                                  ),
                                )
                              : selected == null
                              ? null
                              : () => _buy(course, selected),
                          style: FilledButton.styleFrom(
                            backgroundColor: active
                                ? AppColors.indigo
                                : AppColors.saffron,
                            minimumSize: const Size(150, 50),
                          ),
                          child: _buying
                              ? const SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
                                    color: Colors.white,
                                  ),
                                )
                              : Text(
                                  active
                                      ? 'Go to batch'
                                      : selected == null
                                      ? 'Coming soon'
                                      : selected.isFree
                                      ? 'Enroll free'
                                      : (enrollment != null
                                            ? 'Renew now'
                                            : 'Buy now'),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        );
      },
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 10),
    child: Text(
      text,
      style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
    ),
  );
}

class _Chip extends StatelessWidget {
  const _Chip({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
    decoration: BoxDecoration(
      color: AppColors.indigo.withValues(alpha: 0.07),
      borderRadius: BorderRadius.circular(20),
    ),
    child: Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: AppColors.indigo),
        const SizedBox(width: 6),
        Text(
          text,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            color: AppColors.indigoDark,
          ),
        ),
      ],
    ),
  );
}

class _PlanTile extends StatelessWidget {
  const _PlanTile({
    required this.plan,
    required this.selected,
    required this.onTap,
  });
  final CoursePlan plan;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.indigo.withValues(alpha: 0.06) : Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: selected ? AppColors.indigo : const Color(0xFFE3E8F2),
          width: selected ? 2 : 1,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(4, 10, 16, 10),
          child: Row(
            children: [
              Radio<String>(value: plan.id),
              Expanded(
                flex: 3,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      plan.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 15,
                      ),
                    ),
                    Text(
                      'Valid for ${validityText(plan.validityDays)}',
                      style: const TextStyle(
                        color: Colors.black54,
                        fontSize: 13,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Flexible(flex: 2, child: PriceTag(plan: plan, alignEnd: true)),
            ],
          ),
        ),
      ),
    );
  }
}
