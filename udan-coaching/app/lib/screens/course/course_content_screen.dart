import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../backend/backend.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';
import '../player/pdf_viewer_screen.dart';
import '../player/video_player_screen.dart';
import '../test/test_screen.dart';
import 'course_detail_screen.dart';

/// Subjects -> chapters -> lectures, notes, tests and live classes.
/// Students who have not bought the batch only see the free demo items.
class CourseContentScreen extends StatefulWidget {
  const CourseContentScreen({super.key, required this.courseId});
  final String courseId;

  @override
  State<CourseContentScreen> createState() => _CourseContentScreenState();
}

class _CourseContentScreenState extends State<CourseContentScreen> {
  late final Stream<Course?> _course = backend.course(widget.courseId);
  late final Stream<Enrollment?> _enrollment = backend.myEnrollment(
    widget.courseId,
  );
  late final Stream<List<Subject>> _subjects = backend.subjects(
    widget.courseId,
  );
  late final Future<bool> _isAdmin = backend.isAdmin();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Course?>(
      stream: _course,
      builder: (context, courseSnap) {
        final course = courseSnap.data;
        return FutureBuilder<bool>(
          future: _isAdmin,
          builder: (context, adminSnap) => StreamBuilder<Enrollment?>(
            stream: _enrollment,
            builder: (context, enrollSnap) {
              final hasAccess =
                  (enrollSnap.data?.isActive ?? false) ||
                  adminSnap.data == true;
              final waiting =
                  enrollSnap.connectionState == ConnectionState.waiting ||
                  adminSnap.connectionState == ConnectionState.waiting;
              return StreamBuilder<List<Subject>>(
                stream: _subjects,
                builder: (context, subSnap) {
                  final title = course?.title ?? 'Batch';
                  if (subSnap.hasError) {
                    return Scaffold(
                      appBar: AppBar(title: Text(title)),
                      body: ErrorView(error: subSnap.error!),
                    );
                  }
                  if (!subSnap.hasData || waiting) {
                    return Scaffold(
                      appBar: AppBar(title: Text(title)),
                      body: const LoadingView(),
                    );
                  }
                  final subjects = subSnap.data!;
                  if (subjects.isEmpty) {
                    return Scaffold(
                      appBar: AppBar(title: Text(title)),
                      body: const MessageView(
                        icon: Icons.hourglass_empty_rounded,
                        title: 'Content is being added',
                        message: 'Lectures will appear here as soon as they are uploaded.',
                      ),
                    );
                  }
                  return DefaultTabController(
                    length: subjects.length,
                    child: Scaffold(
                      appBar: AppBar(
                        title: Text(title, overflow: TextOverflow.ellipsis),
                        bottom: TabBar(
                          isScrollable: subjects.length > 3,
                          tabAlignment: subjects.length > 3
                              ? TabAlignment.start
                              : TabAlignment.fill,
                          tabs: [for (final s in subjects) Tab(text: s.name)],
                        ),
                      ),
                      body: Column(
                        children: [
                          if (!hasAccess && course != null)
                            _LockedBanner(course: course),
                          Expanded(
                            child: TabBarView(
                              children: [
                                for (final s in subjects)
                                  _SubjectItems(
                                    key: PageStorageKey(
                                      'subject-${s.id}-$hasAccess',
                                    ),
                                    courseId: widget.courseId,
                                    subject: s,
                                    hasAccess: hasAccess,
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              );
            },
          ),
        );
      },
    );
  }
}

class _LockedBanner extends StatelessWidget {
  const _LockedBanner({required this.course});
  final Course course;

  @override
  Widget build(BuildContext context) => Material(
    color: AppColors.saffron.withValues(alpha: 0.12),
    child: InkWell(
      onTap: () => Navigator.pushReplacement(
        context,
        MaterialPageRoute<void>(
          builder: (_) => CourseDetailScreen(courseId: course.id),
        ),
      ),
      child: const Padding(
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Icon(Icons.lock_open_rounded, color: AppColors.saffron),
            SizedBox(width: 10),
            Expanded(
              child: Text(
                'You are watching free demo content. Buy the batch to unlock all lectures, notes and tests.',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            ),
            Icon(Icons.chevron_right_rounded),
          ],
        ),
      ),
    ),
  );
}

class _SubjectItems extends StatefulWidget {
  const _SubjectItems({
    super.key,
    required this.courseId,
    required this.subject,
    required this.hasAccess,
  });
  final String courseId;
  final Subject subject;
  final bool hasAccess;

  @override
  State<_SubjectItems> createState() => _SubjectItemsState();
}

class _SubjectItemsState extends State<_SubjectItems>
    with AutomaticKeepAliveClientMixin {
  late Stream<List<ContentItem>> _items = _load();
  ContentType? _filter;

  Stream<List<ContentItem>> _load() => backend.items(
    widget.courseId,
    widget.subject.id,
    freeOnly: !widget.hasAccess,
  );

  @override
  void didUpdateWidget(covariant _SubjectItems oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.hasAccess != widget.hasAccess) _items = _load();
  }

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return StreamBuilder<List<ContentItem>>(
      stream: _items,
      builder: (context, snap) {
        if (snap.hasError) return ErrorView(error: snap.error!);
        if (!snap.hasData) return const LoadingView();
        final all = snap.data!;
        if (all.isEmpty) {
          return MessageView(
            icon: widget.hasAccess
                ? Icons.hourglass_empty_rounded
                : Icons.lock_rounded,
            title: widget.hasAccess
                ? 'Nothing here yet'
                : 'No free content in ${widget.subject.name}',
            message: widget.hasAccess
                ? 'New lectures will appear here.'
                : 'Buy the batch to unlock everything.',
          );
        }
        final types = all.map((i) => i.type).toSet();
        final items = _filter == null
            ? all
            : all.where((i) => i.type == _filter).toList();

        // Group by chapter, keeping the order of first appearance.
        final chapters = <String, List<ContentItem>>{};
        for (final item in items) {
          chapters
              .putIfAbsent(
                item.chapter.isEmpty ? 'Other' : item.chapter,
                () => [],
              )
              .add(item);
        }

        return ListView(
          padding: const EdgeInsets.only(bottom: 24),
          children: [
            if (types.length > 1)
              SizedBox(
                height: 52,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
                  children: [
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: const Text('All'),
                        selected: _filter == null,
                        onSelected: (_) => setState(() => _filter = null),
                      ),
                    ),
                    for (final t in ContentType.values.where(types.contains))
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          avatar: Icon(
                            iconFor(t),
                            size: 18,
                            color: colorFor(t),
                          ),
                          label: Text(t.label),
                          selected: _filter == t,
                          onSelected: (_) => setState(() => _filter = t),
                        ),
                      ),
                  ],
                ),
              ),
            for (final entry in chapters.entries) ...[
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Text(
                  entry.key,
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: AppColors.indigoDark,
                  ),
                ),
              ),
              for (final item in entry.value)
                Padding(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 4,
                  ),
                  child: ContentTile(courseId: widget.courseId, item: item),
                ),
            ],
          ],
        );
      },
    );
  }
}

class ContentTile extends StatelessWidget {
  const ContentTile({super.key, required this.courseId, required this.item});
  final String courseId;
  final ContentItem item;

  String get _subtitle => switch (item.type) {
    ContentType.video => 'Lecture',
    ContentType.pdf => 'PDF notes',
    ContentType.test =>
      '${item.questions.length} questions • ${item.durationMinutes} min',
    ContentType.live =>
      item.startsAt == null
          ? 'Live class'
          : 'Live • ${formatDateTime(item.startsAt!)}',
  };

  Future<void> _open(BuildContext context) async {
    switch (item.type) {
      case ContentType.video:
        await Navigator.push(
          context,
          MaterialPageRoute<void>(
            builder: (_) => VideoPlayerScreen(title: item.title, url: item.url),
          ),
        );
      case ContentType.pdf:
        await Navigator.push(
          context,
          MaterialPageRoute<void>(
            builder: (_) => PdfViewerScreen(title: item.title, url: item.url),
          ),
        );
      case ContentType.test:
        await Navigator.push(
          context,
          MaterialPageRoute<void>(
            builder: (_) => TestIntroScreen(courseId: courseId, test: item),
          ),
        );
      case ContentType.live:
        final startsAt = item.startsAt;
        if (startsAt != null &&
            startsAt.isAfter(DateTime.now().add(const Duration(minutes: 15)))) {
          showSnack(
            context,
            'This class starts on ${formatDateTime(startsAt)}. Come back 15 minutes before.',
          );
          return;
        }
        if (isYoutubeUrl(item.url) || isDirectVideoUrl(item.url)) {
          await Navigator.push(
            context,
            MaterialPageRoute<void>(
              builder: (_) =>
                  VideoPlayerScreen(title: item.title, url: item.url),
            ),
          );
        } else {
          // Zoom / Google Meet / any other link.
          final uri = Uri.tryParse(item.url);
          if (uri == null ||
              !await launchUrl(uri, mode: LaunchMode.externalApplication)) {
            if (context.mounted) {
              showSnack(context, 'Could not open the class link.');
            }
          }
        }
    }
  }

  @override
  Widget build(BuildContext context) {
    final color = colorFor(item.type);
    final upcomingLive =
        item.type == ContentType.live &&
        item.startsAt != null &&
        item.startsAt!.isAfter(DateTime.now());
    return Card(
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        leading: Container(
          width: 44,
          height: 44,
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(iconFor(item.type), color: color),
        ),
        title: Text(
          item.title,
          style: const TextStyle(fontWeight: FontWeight.w700),
        ),
        subtitle: Text(_subtitle),
        trailing: item.isFree
            ? Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'FREE',
                  style: TextStyle(
                    color: AppColors.success,
                    fontWeight: FontWeight.w800,
                    fontSize: 11,
                  ),
                ),
              )
            : upcomingLive
            ? const Icon(Icons.schedule_rounded, color: Colors.black38)
            : const Icon(Icons.chevron_right_rounded),
        onTap: () => _open(context),
      ),
    );
  }
}
