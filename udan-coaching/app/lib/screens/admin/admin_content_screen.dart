import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../models/models.dart';
import '../../widgets/common.dart';
import 'item_editor_screen.dart';

/// Subjects of a batch. Tap a subject to manage its lectures, notes and tests.
class AdminContentScreen extends StatefulWidget {
  const AdminContentScreen({super.key, required this.course});
  final Course course;

  @override
  State<AdminContentScreen> createState() => _AdminContentScreenState();
}

class _AdminContentScreenState extends State<AdminContentScreen> {
  late final Stream<List<Subject>> _subjects = backend.subjects(
    widget.course.id,
  );

  Future<void> _editSubject([Subject? subject, int nextOrder = 0]) async {
    final result = await showDialog<Subject>(
      context: context,
      builder: (_) => _SubjectDialog(subject: subject, nextOrder: nextOrder),
    );
    if (result == null) return;
    try {
      await backend.saveSubject(widget.course.id, result);
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    }
  }

  Future<void> _deleteSubject(Subject s) async {
    final ok = await confirm(
      context,
      title: 'Delete ${s.name}?',
      message:
          'All lectures, notes and tests inside this subject will be deleted.',
      confirmText: 'Delete',
      destructive: true,
    );
    if (!ok) return;
    try {
      await backend.deleteSubject(widget.course.id, s.id);
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    }
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<Subject>>(
      stream: _subjects,
      builder: (context, snap) {
        final subjects = snap.data ?? const <Subject>[];
        final nextOrder = subjects.isEmpty
            ? 1
            : subjects.map((s) => s.sortOrder).reduce((a, b) => a > b ? a : b) +
                  1;
        return Scaffold(
          appBar: AppBar(
            title: Text(widget.course.title, overflow: TextOverflow.ellipsis),
          ),
          floatingActionButton: FloatingActionButton.extended(
            key: const Key('add-subject'),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Add subject'),
            onPressed: () => _editSubject(null, nextOrder),
          ),
          body: snap.hasError
              ? ErrorView(error: snap.error!)
              : !snap.hasData
              ? const LoadingView()
              : subjects.isEmpty
              ? const MessageView(
                  icon: Icons.library_books_outlined,
                  title: 'Add your first subject',
                  message: 'For example Mathematics, Science or Physics. Then add lectures inside it.',
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                  itemCount: subjects.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, i) {
                    final s = subjects[i];
                    return Card(
                      child: ListTile(
                        leading: const Icon(Icons.folder_rounded),
                        title: Text(
                          s.name,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        subtitle: Text('Position ${s.sortOrder}'),
                        trailing: PopupMenuButton<String>(
                          onSelected: (v) =>
                              v == 'edit' ? _editSubject(s) : _deleteSubject(s),
                          itemBuilder: (_) => const [
                            PopupMenuItem(value: 'edit', child: Text('Rename')),
                            PopupMenuItem(
                              value: 'delete',
                              child: Text('Delete'),
                            ),
                          ],
                        ),
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute<void>(
                            builder: (_) => AdminItemsScreen(
                              course: widget.course,
                              subject: s,
                            ),
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

class _SubjectDialog extends StatefulWidget {
  const _SubjectDialog({this.subject, required this.nextOrder});
  final Subject? subject;
  final int nextOrder;

  @override
  State<_SubjectDialog> createState() => _SubjectDialogState();
}

class _SubjectDialogState extends State<_SubjectDialog> {
  late final _name = TextEditingController(text: widget.subject?.name ?? '');
  late final _order = TextEditingController(
    text: '${widget.subject?.sortOrder ?? widget.nextOrder}',
  );

  @override
  void dispose() {
    _name.dispose();
    _order.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.subject == null ? 'Add subject' : 'Edit subject'),
      scrollable: true,
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          TextField(
            key: const Key('subject-name'),
            controller: _name,
            autofocus: true,
            textCapitalization: TextCapitalization.words,
            decoration: const InputDecoration(
              labelText: 'Subject name',
              hintText: 'Mathematics',
            ),
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _order,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(
              labelText: 'Position (1 = first)',
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
          key: const Key('subject-save'),
          onPressed: () {
            if (_name.text.trim().isEmpty) return;
            Navigator.pop(
              context,
              Subject(
                id: widget.subject?.id ?? '',
                name: _name.text,
                sortOrder: int.tryParse(_order.text.trim()) ?? 0,
              ),
            );
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}

/// Lectures, notes, tests and live classes inside one subject.
class AdminItemsScreen extends StatefulWidget {
  const AdminItemsScreen({
    super.key,
    required this.course,
    required this.subject,
  });
  final Course course;
  final Subject subject;

  @override
  State<AdminItemsScreen> createState() => _AdminItemsScreenState();
}

class _AdminItemsScreenState extends State<AdminItemsScreen> {
  late final Stream<List<ContentItem>> _items = backend.items(
    widget.course.id,
    widget.subject.id,
    freeOnly: false,
  );

  void _openEditor({
    ContentItem? item,
    int nextOrder = 1,
    String lastChapter = '',
  }) {
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (_) => ItemEditorScreen(
          courseId: widget.course.id,
          subjectId: widget.subject.id,
          item: item,
          defaultOrder: nextOrder,
          defaultChapter: lastChapter,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<List<ContentItem>>(
      stream: _items,
      builder: (context, snap) {
        final items = snap.data ?? const <ContentItem>[];
        final nextOrder = items.isEmpty
            ? 1
            : items.map((i) => i.sortOrder).reduce((a, b) => a > b ? a : b) + 1;
        final lastChapter = items.isEmpty ? '' : items.last.chapter;
        return Scaffold(
          appBar: AppBar(title: Text(widget.subject.name)),
          floatingActionButton: FloatingActionButton.extended(
            key: const Key('add-item'),
            icon: const Icon(Icons.add_rounded),
            label: const Text('Add content'),
            onPressed: () =>
                _openEditor(nextOrder: nextOrder, lastChapter: lastChapter),
          ),
          body: snap.hasError
              ? ErrorView(error: snap.error!)
              : !snap.hasData
              ? const LoadingView()
              : items.isEmpty
              ? const MessageView(
                  icon: Icons.video_call_outlined,
                  title: 'Nothing here yet',
                  message: 'Add a lecture (YouTube or video link), PDF notes, a test or a live class.',
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 16, 16, 96),
                  itemCount: items.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 8),
                  itemBuilder: (context, i) {
                    final item = items[i];
                    return Card(
                      child: ListTile(
                        leading: Icon(
                          iconFor(item.type),
                          color: colorFor(item.type),
                        ),
                        title: Text(
                          item.title,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        subtitle: Text(
                          [
                            '#${item.sortOrder}',
                            item.type.label,
                            if (item.chapter.isNotEmpty) item.chapter,
                            if (item.isFree) 'FREE demo',
                          ].join(' • '),
                        ),
                        trailing: const Icon(Icons.edit_rounded),
                        onTap: () => _openEditor(item: item),
                      ),
                    );
                  },
                ),
        );
      },
    );
  }
}
