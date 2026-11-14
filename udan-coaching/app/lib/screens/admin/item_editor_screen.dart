import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';

/// Add or edit one lecture / PDF / test / live class.
class ItemEditorScreen extends StatefulWidget {
  const ItemEditorScreen({
    super.key,
    required this.courseId,
    required this.subjectId,
    this.item,
    this.defaultOrder = 1,
    this.defaultChapter = '',
  });

  final String courseId;
  final String subjectId;
  final ContentItem? item;
  final int defaultOrder;
  final String defaultChapter;

  @override
  State<ItemEditorScreen> createState() => _ItemEditorScreenState();
}

class _ItemEditorScreenState extends State<ItemEditorScreen> {
  final _form = GlobalKey<FormState>();
  late final ContentItem? _i = widget.item;
  late ContentType _type = _i?.type ?? ContentType.video;
  late final _title = TextEditingController(text: _i?.title ?? '');
  late final _chapter = TextEditingController(
    text: _i?.chapter ?? widget.defaultChapter,
  );
  late final _order = TextEditingController(
    text: '${_i?.sortOrder ?? widget.defaultOrder}',
  );
  late final _url = TextEditingController(text: _i?.url ?? '');
  late final _duration = TextEditingController(
    text: '${_i?.durationMinutes ?? 30}',
  );
  late final _marksCorrect = TextEditingController(
    text: _fmt(_i?.marksCorrect ?? 4),
  );
  late final _marksWrong = TextEditingController(
    text: _fmt(_i?.marksWrong ?? 1),
  );
  late bool _isFree = _i?.isFree ?? false;
  late DateTime? _startsAt = _i?.startsAt;
  late final List<Question> _questions = List.of(
    _i?.questions ?? const <Question>[],
  );
  bool _saving = false;

  static String _fmt(num v) =>
      v == v.roundToDouble() ? v.round().toString() : v.toString();

  @override
  void dispose() {
    for (final c in [
      _title,
      _chapter,
      _order,
      _url,
      _duration,
      _marksCorrect,
      _marksWrong,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    if (_type == ContentType.test && _questions.isEmpty) {
      showSnack(context, 'Add at least one question.');
      return;
    }
    if (_type == ContentType.live && _startsAt == null) {
      showSnack(context, 'Pick the date and time of the live class.');
      return;
    }
    setState(() => _saving = true);
    try {
      await backend.saveItem(
        widget.courseId,
        widget.subjectId,
        ContentItem(
          id: _i?.id ?? '',
          type: _type,
          title: _title.text,
          chapter: _chapter.text,
          sortOrder: int.tryParse(_order.text.trim()) ?? 0,
          isFree: _isFree,
          url: _type == ContentType.test ? '' : _url.text,
          startsAt: _type == ContentType.live ? _startsAt : null,
          durationMinutes: int.tryParse(_duration.text.trim()) ?? 30,
          marksCorrect: num.tryParse(_marksCorrect.text.trim()) ?? 4,
          marksWrong: num.tryParse(_marksWrong.text.trim()) ?? 0,
          questions: _type == ContentType.test ? _questions : const [],
        ),
      );
      if (!mounted) return;
      showSnack(context, 'Saved');
      Navigator.pop(context);
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _delete() async {
    final item = _i;
    if (item == null) return;
    final ok = await confirm(
      context,
      title: 'Delete "${item.title}"?',
      message: 'This cannot be undone.',
      confirmText: 'Delete',
      destructive: true,
    );
    if (!ok) return;
    try {
      await backend.deleteItem(widget.courseId, widget.subjectId, item.id);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    }
  }

  Future<void> _pickStart() async {
    final now = DateTime.now();
    final initial = _startsAt ?? now.add(const Duration(hours: 1));
    final date = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 2),
    );
    if (date == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(initial),
    );
    if (time == null) return;
    setState(
      () => _startsAt = DateTime(
        date.year,
        date.month,
        date.day,
        time.hour,
        time.minute,
      ),
    );
  }

  Future<void> _editQuestion([int? index]) async {
    final result = await showDialog<Question>(
      context: context,
      builder: (_) =>
          _QuestionDialog(initial: index == null ? null : _questions[index]),
    );
    if (result == null) return;
    setState(() {
      if (index == null) {
        _questions.add(result);
      } else {
        _questions[index] = result;
      }
    });
  }

  String get _urlLabel => switch (_type) {
    ContentType.video => 'Video link *',
    ContentType.pdf => 'PDF link *',
    ContentType.live => 'Class link *',
    ContentType.test => '',
  };

  String get _urlHint => switch (_type) {
    ContentType.video => 'YouTube link (unlisted is fine) or .mp4 / .m3u8 link',
    ContentType.pdf => 'Direct PDF link or Google Drive share link',
    ContentType.live => 'YouTube Live, Zoom or Google Meet link',
    ContentType.test => '',
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_i == null ? 'Add content' : 'Edit content'),
        actions: [
          if (_i != null)
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded),
              onPressed: _delete,
            ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            key: const Key('save-item'),
            onPressed: _saving ? null : _save,
            child: Text(_saving ? 'Saving…' : 'Save'),
          ),
        ),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            SegmentedButton<ContentType>(
              segments: [
                for (final t in ContentType.values)
                  ButtonSegment(
                    value: t,
                    icon: Icon(iconFor(t)),
                    label: Text(t.name == 'pdf' ? 'PDF' : _cap(t.name)),
                  ),
              ],
              selected: {_type},
              showSelectedIcon: false,
              onSelectionChanged: (s) => setState(() => _type = s.first),
            ),
            const SizedBox(height: 16),
            TextFormField(
              key: const Key('item-title'),
              controller: _title,
              decoration: const InputDecoration(
                labelText: 'Title *',
                hintText: 'e.g. Real Numbers - Lecture 1',
              ),
              validator: (v) =>
                  (v == null || v.trim().isEmpty) ? 'Required' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _chapter,
              textCapitalization: TextCapitalization.words,
              decoration: const InputDecoration(
                labelText: 'Chapter',
                hintText: 'Items with the same chapter are grouped',
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _order,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Position (1 = first)',
              ),
            ),
            if (_type != ContentType.test) ...[
              const SizedBox(height: 12),
              TextFormField(
                key: const Key('item-url'),
                controller: _url,
                keyboardType: TextInputType.url,
                decoration: InputDecoration(
                  labelText: _urlLabel,
                  helperText: _urlHint,
                  helperMaxLines: 2,
                ),
                validator: (v) {
                  final uri = Uri.tryParse((v ?? '').trim());
                  if (uri == null ||
                      !(uri.isScheme('http') || uri.isScheme('https'))) {
                    return 'Paste a full link starting with https://';
                  }
                  return null;
                },
              ),
            ],
            if (_type == ContentType.live) ...[
              const SizedBox(height: 12),
              ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.event_rounded),
                title: Text(
                  _startsAt == null
                      ? 'Pick date & time *'
                      : formatDateTime(_startsAt!),
                ),
                trailing: const Icon(Icons.edit_calendar_rounded),
                onTap: _pickStart,
              ),
            ],
            const SizedBox(height: 4),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text(
                'Free demo',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              subtitle: const Text(
                'Students who have not bought the batch can open this.',
              ),
              value: _isFree,
              onChanged: (v) => setState(() => _isFree = v),
            ),
            if (_type == ContentType.test) ..._testFields(),
          ],
        ),
      ),
    );
  }

  static String _cap(String s) => s[0].toUpperCase() + s.substring(1);

  List<Widget> _testFields() => [
    const SizedBox(height: 8),
    Row(
      children: [
        Expanded(
          child: TextFormField(
            controller: _duration,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Minutes'),
            validator: (v) =>
                (int.tryParse((v ?? '').trim()) ?? 0) <= 0 ? 'Min 1' : null,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: TextFormField(
            controller: _marksCorrect,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(labelText: '+ marks'),
            validator: (v) =>
                num.tryParse((v ?? '').trim()) == null ? 'Number' : null,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: TextFormField(
            controller: _marksWrong,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: const InputDecoration(
              labelText: '− marks',
              helperText: '0 = none',
            ),
            validator: (v) =>
                num.tryParse((v ?? '').trim()) == null ? 'Number' : null,
          ),
        ),
      ],
    ),
    const SizedBox(height: 20),
    Row(
      children: [
        Expanded(
          child: Text(
            'Questions (${_questions.length})',
            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
          ),
        ),
        TextButton.icon(
          key: const Key('add-question'),
          icon: const Icon(Icons.add_rounded),
          label: const Text('Add'),
          onPressed: () => _editQuestion(),
        ),
      ],
    ),
    for (var i = 0; i < _questions.length; i++)
      Card(
        margin: const EdgeInsets.only(bottom: 8),
        child: ListTile(
          leading: CircleAvatar(
            radius: 14,
            backgroundColor: AppColors.indigo,
            child: Text(
              '${i + 1}',
              style: const TextStyle(color: Colors.white, fontSize: 12),
            ),
          ),
          title: Text(
            _questions[i].text,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          subtitle: Text(
            'Answer: ${_questions[i].options.length > _questions[i].answerIndex ? _questions[i].options[_questions[i].answerIndex] : '?'}',
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          onTap: () => _editQuestion(i),
          trailing: IconButton(
            icon: const Icon(Icons.delete_outline_rounded),
            onPressed: () => setState(() => _questions.removeAt(i)),
          ),
        ),
      ),
  ];
}

class _QuestionDialog extends StatefulWidget {
  const _QuestionDialog({this.initial});
  final Question? initial;

  @override
  State<_QuestionDialog> createState() => _QuestionDialogState();
}

class _QuestionDialogState extends State<_QuestionDialog> {
  final _form = GlobalKey<FormState>();
  late final _text = TextEditingController(text: widget.initial?.text ?? '');
  late final List<TextEditingController> _options = List.generate(
    4,
    (i) => TextEditingController(
      text: (widget.initial != null && i < widget.initial!.options.length)
          ? widget.initial!.options[i]
          : '',
    ),
  );
  late final _explanation = TextEditingController(
    text: widget.initial?.explanation ?? '',
  );
  late int _answer = widget.initial?.answerIndex ?? 0;

  @override
  void dispose() {
    _text.dispose();
    for (final o in _options) {
      o.dispose();
    }
    _explanation.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: Text(widget.initial == null ? 'Add question' : 'Edit question'),
      scrollable: true,
      content: Form(
        key: _form,
        child: RadioGroup<int>(
          groupValue: _answer,
          onChanged: (v) => setState(() => _answer = v ?? 0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                key: const Key('question-text'),
                controller: _text,
                minLines: 2,
                maxLines: 6,
                decoration: const InputDecoration(labelText: 'Question'),
                validator: (v) =>
                    (v == null || v.trim().isEmpty) ? 'Required' : null,
              ),
              const SizedBox(height: 8),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Options (select the correct one)',
                  style: TextStyle(color: Colors.black54),
                ),
              ),
              for (var i = 0; i < 4; i++)
                Padding(
                  padding: const EdgeInsets.only(top: 8),
                  child: Row(
                    children: [
                      Radio<int>(value: i),
                      Expanded(
                        child: TextFormField(
                          key: Key('option-text-$i'),
                          controller: _options[i],
                          decoration: InputDecoration(
                            labelText: 'Option ${String.fromCharCode(65 + i)}',
                          ),
                          validator: (v) =>
                              (v == null || v.trim().isEmpty) && i < 2
                              ? 'Required'
                              : null,
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _explanation,
                minLines: 1,
                maxLines: 5,
                decoration: const InputDecoration(
                  labelText: 'Explanation (optional)',
                ),
              ),
            ],
          ),
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
        FilledButton(
          key: const Key('question-save'),
          onPressed: () {
            if (!_form.currentState!.validate()) return;
            // Drop empty trailing options (allows 2 or 3 option questions).
            final options = <String>[];
            var answer = _answer;
            for (var i = 0; i < 4; i++) {
              final t = _options[i].text.trim();
              if (t.isEmpty) {
                if (i == _answer) {
                  showSnack(context, 'The correct option cannot be empty.');
                  return;
                }
                if (i < _answer) answer--;
                continue;
              }
              options.add(t);
            }
            Navigator.pop(
              context,
              Question(
                text: _text.text.trim(),
                options: options,
                answerIndex: answer,
                explanation: _explanation.text.trim(),
              ),
            );
          },
          child: const Text('Save'),
        ),
      ],
    );
  }
}
