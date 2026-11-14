import 'package:flutter/material.dart';

import '../config/app_config.dart';
import '../config/theme.dart';
import '../models/models.dart';
import '../utils/format.dart';

/// Udan logo: a paper plane taking off.
class BrandLogo extends StatelessWidget {
  const BrandLogo({super.key, this.size = 48});
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [AppColors.saffron, Color(0xFFFFB347)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(size * 0.28),
      ),
      child: Transform.rotate(
        angle: -0.5,
        child: Icon(Icons.send_rounded, color: Colors.white, size: size * 0.55),
      ),
    );
  }
}

class LoadingView extends StatelessWidget {
  const LoadingView({super.key});
  @override
  Widget build(BuildContext context) =>
      const Center(child: CircularProgressIndicator());
}

class MessageView extends StatelessWidget {
  const MessageView({
    super.key,
    required this.icon,
    required this.title,
    this.message,
    this.action,
  });

  final IconData icon;
  final String title;
  final String? message;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 56,
              color: AppColors.indigo.withValues(alpha: 0.35),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: Theme.of(context).textTheme.titleMedium
                  ?.copyWith(fontWeight: FontWeight.w700),
            ),
            if (message != null) ...[
              const SizedBox(height: 8),
              Text(
                message!,
                textAlign: TextAlign.center,
                style: const TextStyle(color: Colors.black54),
              ),
            ],
            if (action != null) ...[const SizedBox(height: 20), action!],
          ],
        ),
      ),
    );
  }
}

class ErrorView extends StatelessWidget {
  const ErrorView({super.key, required this.error});
  final Object error;

  @override
  Widget build(BuildContext context) => MessageView(
    icon: Icons.cloud_off_rounded,
    title: 'Something went wrong',
    message: error.toString(),
  );
}

/// Picture at the top of a batch card. Uses the thumbnail URL if there is
/// one, otherwise a coloured gradient with the category.
class CourseThumb extends StatelessWidget {
  const CourseThumb({
    super.key,
    required this.course,
    this.height = 150,
    this.radius = 16,
  });
  final Course course;
  final double height;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final colors = AppColors
        .cardGradients[course.title.length % AppColors.cardGradients.length];
    final fallback = Container(
      height: height,
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: colors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      padding: const EdgeInsets.all(16),
      child: Stack(
        children: [
          Positioned(
            right: -10,
            bottom: -16,
            child: Icon(
              Icons.auto_stories_rounded,
              size: height * 0.75,
              color: Colors.white.withValues(alpha: 0.15),
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (course.category.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.22),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    course.category,
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 12,
                    ),
                  ),
                ),
              const Spacer(),
              Text(
                course.title,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  height: 1.2,
                ),
              ),
              const SizedBox(height: 4),
              const Text(
                'by ${AppConfig.teacherName}',
                style: TextStyle(
                  color: Colors.white70,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );

    return ClipRRect(
      borderRadius: BorderRadius.vertical(
        top: Radius.circular(radius),
        bottom: Radius.circular(radius),
      ),
      child: course.thumbnailUrl.isEmpty
          ? fallback
          : Image.network(
              course.thumbnailUrl,
              height: height,
              width: double.infinity,
              fit: BoxFit.cover,
              errorBuilder: (_, _, _) => fallback,
            ),
    );
  }
}

/// "₹2,499  ₹4,999  50% off"
class PriceTag extends StatelessWidget {
  const PriceTag({
    super.key,
    required this.plan,
    this.large = false,
    this.alignEnd = false,
  });
  final CoursePlan plan;
  final bool large;
  final bool alignEnd;

  @override
  Widget build(BuildContext context) {
    if (plan.isFree) {
      return Text(
        'FREE',
        style: TextStyle(
          color: AppColors.success,
          fontWeight: FontWeight.w800,
          fontSize: large ? 22 : 18,
        ),
      );
    }
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.center,
      alignment: alignEnd ? WrapAlignment.end : WrapAlignment.start,
      spacing: 8,
      children: [
        Text(
          rupees(plan.price),
          style: TextStyle(
            color: AppColors.indigoDark,
            fontWeight: FontWeight.w800,
            fontSize: large ? 22 : 18,
          ),
        ),
        if (plan.mrp > plan.price)
          Text(
            rupees(plan.mrp),
            style: const TextStyle(
              color: Colors.black45,
              decoration: TextDecoration.lineThrough,
              fontSize: 14,
            ),
          ),
        if (plan.discountPercent > 0)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: AppColors.success.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(6),
            ),
            child: Text(
              '${plan.discountPercent}% off',
              style: const TextStyle(
                color: AppColors.success,
                fontWeight: FontWeight.w700,
                fontSize: 12,
              ),
            ),
          ),
      ],
    );
  }
}

class CourseCard extends StatelessWidget {
  const CourseCard({
    super.key,
    required this.course,
    required this.onTap,
    this.enrollment,
  });
  final Course course;
  final VoidCallback onTap;
  final Enrollment? enrollment;

  @override
  Widget build(BuildContext context) {
    final plan = course.cheapestPlan;
    final owned = enrollment?.isActive ?? false;
    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CourseThumb(course: course, radius: 0),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    course.title,
                    style: const TextStyle(
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                      color: AppColors.indigoDark,
                    ),
                  ),
                  if (course.subtitle.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(
                      course.subtitle,
                      style: const TextStyle(color: Colors.black54),
                    ),
                  ],
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 12,
                    runSpacing: 4,
                    children: [
                      _Meta(
                        icon: Icons.translate_rounded,
                        text: course.language,
                      ),
                      if (course.startDate != null)
                        _Meta(
                          icon: Icons.event_rounded,
                          text: course.startDate!.isAfter(DateTime.now())
                              ? 'Starts ${formatDate(course.startDate!)}'
                              : 'Started ${formatDate(course.startDate!)}',
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: owned
                            ? const Text(
                                'Purchased ✓',
                                style: TextStyle(
                                  color: AppColors.success,
                                  fontWeight: FontWeight.w800,
                                  fontSize: 16,
                                ),
                              )
                            : plan == null
                            ? const Text(
                                'Coming soon',
                                style: TextStyle(fontWeight: FontWeight.w700),
                              )
                            : PriceTag(plan: plan),
                      ),
                      FilledButton.tonal(
                        onPressed: onTap,
                        style: FilledButton.styleFrom(
                          minimumSize: const Size(0, 40),
                        ),
                        child: Text(owned ? 'Study' : 'Explore'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Meta extends StatelessWidget {
  const _Meta({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 16, color: Colors.black45),
      const SizedBox(width: 4),
      Text(text, style: const TextStyle(color: Colors.black54, fontSize: 13)),
    ],
  );
}

/// Yellow strip shown while the app runs on sample data.
class DemoBanner extends StatelessWidget {
  const DemoBanner({super.key});

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    color: const Color(0xFFFFF4D6),
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
    child: const Text(
      'Demo mode: sample data, no real payments. Connect Firebase to go live.',
      style: TextStyle(
        fontSize: 12,
        color: Color(0xFF7A5B00),
        fontWeight: FontWeight.w600,
      ),
    ),
  );
}

IconData iconFor(ContentType type) => switch (type) {
  ContentType.video => Icons.play_circle_fill_rounded,
  ContentType.pdf => Icons.picture_as_pdf_rounded,
  ContentType.test => Icons.quiz_rounded,
  ContentType.live => Icons.sensors_rounded,
};

Color colorFor(ContentType type) => switch (type) {
  ContentType.video => AppColors.indigo,
  ContentType.pdf => AppColors.danger,
  ContentType.test => AppColors.saffron,
  ContentType.live => AppColors.success,
};

void showSnack(BuildContext context, String message) {
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(
      SnackBar(content: Text(message), behavior: SnackBarBehavior.floating),
    );
}

Future<bool> confirm(
  BuildContext context, {
  required String title,
  required String message,
  String confirmText = 'Yes',
  bool destructive = false,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text('Cancel'),
        ),
        FilledButton(
          style: destructive
              ? FilledButton.styleFrom(backgroundColor: AppColors.danger)
              : null,
          onPressed: () => Navigator.pop(ctx, true),
          child: Text(confirmText),
        ),
      ],
    ),
  );
  return result ?? false;
}
