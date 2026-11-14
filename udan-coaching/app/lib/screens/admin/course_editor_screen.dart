import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../config/app_config.dart';
import '../../models/models.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';

/// Create or edit a batch: title, description, price plans, publish switch.
class CourseEditorScreen extends StatefulWidget {
  const CourseEditorScreen({super.key, this.course});
  final Course? course;

  @override
  State<CourseEditorScreen> createState() => _CourseEditorScreenState();
}

class _PlanDraft {
  _PlanDraft(CoursePlan p)
    : id = p.id,
      name = TextEditingController(text: p.name),
      price = TextEditingController(
        text: p.price == 0 && p.name.isEmpty ? '' : _n(p.price),
      ),
      mrp = TextEditingController(text: p.mrp == 0 ? '' : _n(p.mrp)),
      days = TextEditingController(text: '${p.validityDays}');

  static String _n(num v) =>
      v == v.roundToDouble() ? v.round().toString() : v.toString();

  final String id;
  final TextEditingController name;
  final TextEditingController price;
  final TextEditingController mrp;
  final TextEditingController days;

  CoursePlan toPlan() => CoursePlan(
    id: id,
    name: name.text.trim(),
    price: num.tryParse(price.text.trim()) ?? 0,
    mrp: num.tryParse(mrp.text.trim()) ?? 0,
    validityDays: int.tryParse(days.text.trim()) ?? 365,
  );

  void dispose() {
    name.dispose();
    price.dispose();
    mrp.dispose();
    days.dispose();
  }
}

class _CourseEditorScreenState extends State<CourseEditorScreen> {
  final _form = GlobalKey<FormState>();
  late final Course? _c = widget.course;
  late final _title = TextEditingController(text: _c?.title ?? '');
  late final _subtitle = TextEditingController(text: _c?.subtitle ?? '');
  late final _description = TextEditingController(text: _c?.description ?? '');
  late final _thumbnail = TextEditingController(text: _c?.thumbnailUrl ?? '');
  late final _language = TextEditingController(
    text: _c?.language ?? 'Hinglish',
  );
  late final _features = TextEditingController(
    text: (_c?.features ?? const []).join('\n'),
  );
  late final _sortOrder = TextEditingController(text: '${_c?.sortOrder ?? 0}');
  late String? _category = (_c?.category.isNotEmpty ?? false)
      ? _c!.category
      : null;
  late DateTime? _startDate = _c?.startDate;
  late bool _published = _c?.published ?? false;
  late final List<_PlanDraft> _plans = (_c?.plans.isNotEmpty ?? false)
      ? _c!.plans.map(_PlanDraft.new).toList()
      : [_PlanDraft(_newPlan('Full batch'))];
  bool _saving = false;

  CoursePlan _newPlan(String name) => CoursePlan(
    id: 'p${DateTime.now().microsecondsSinceEpoch}',
    name: name,
    price: 0,
    mrp: 0,
    validityDays: 365,
  );

  @override
  void dispose() {
    for (final c in [
      _title,
      _subtitle,
      _description,
      _thumbnail,
      _language,
      _features,
      _sortOrder,
    ]) {
      c.dispose();
    }
    for (final p in _plans) {
      p.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    if (!_form.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      final course = Course(
        id: _c?.id ?? '',
        title: _title.text,
        subtitle: _subtitle.text,
        description: _description.text,
        thumbnailUrl: _thumbnail.text,
        category: _category ?? '',
        language: _language.text.trim().isEmpty
            ? 'Hinglish'
            : _language.text.trim(),
        features: _features.text
            .split('\n')
            .map((s) => s.trim())
            .where((s) => s.isNotEmpty)
            .toList(),
        plans: _plans.map((p) => p.toPlan()).toList(),
        published: _published,
        sortOrder: int.tryParse(_sortOrder.text.trim()) ?? 0,
        startDate: _startDate,
      );
      await backend.saveCourse(course);
      if (!mounted) return;
      showSnack(context, 'Batch saved');
      Navigator.pop(context);
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _delete() async {
    final c = _c;
    if (c == null) return;
    final ok = await confirm(
      context,
      title: 'Delete "${c.title}"?',
      message:
          'All subjects, lectures, notes and tests of this batch will be deleted. '
          'Students who bought it will lose access to its content. Tip: switch off "Published" instead to hide it.',
      confirmText: 'Delete',
      destructive: true,
    );
    if (!ok) return;
    try {
      await backend.deleteCourse(c.id);
      if (mounted) Navigator.pop(context);
    } catch (e) {
      if (mounted) showSnack(context, friendlyError(e));
    }
  }

  String? _required(String? v) =>
      (v == null || v.trim().isEmpty) ? 'Required' : null;

  String? _number(String? v, {bool allowZero = true}) {
    final n = num.tryParse((v ?? '').trim());
    if (n == null) return 'Enter a number';
    if (n < 0 || (!allowZero && n == 0)) return 'Must be more than 0';
    return null;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_c == null ? 'New batch' : 'Edit batch'),
        actions: [
          if (_c != null)
            IconButton(
              tooltip: 'Delete batch',
              icon: const Icon(Icons.delete_outline_rounded),
              onPressed: _delete,
            ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: FilledButton(
            key: const Key('save-batch'),
            onPressed: _saving ? null : _save,
            child: Text(_saving ? 'Saving…' : 'Save batch'),
          ),
        ),
      ),
      body: Form(
        key: _form,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text(
                'Published',
                style: TextStyle(fontWeight: FontWeight.w700),
              ),
              subtitle: const Text(
                'Students can see and buy this batch only when it is published.',
              ),
              value: _published,
              onChanged: (v) => setState(() => _published = v),
            ),
            const SizedBox(height: 8),
            TextFormField(
              key: const Key('batch-title'),
              controller: _title,
              decoration: const InputDecoration(
                labelText: 'Batch name *',
                hintText: 'e.g. Class 10 Board Batch 2027',
              ),
              validator: _required,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _subtitle,
              decoration: const InputDecoration(
                labelText: 'Short line',
                hintText: 'e.g. Maths + Science, CBSE',
              ),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _category,
              decoration: const InputDecoration(labelText: 'Category'),
              items: [
                for (final c in AppConfig.categories)
                  DropdownMenuItem(value: c, child: Text(c)),
              ],
              onChanged: (v) => setState(() => _category = v),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _language,
              decoration: const InputDecoration(labelText: 'Language'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _description,
              minLines: 3,
              maxLines: 8,
              decoration: const InputDecoration(
                labelText: 'About this batch',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _features,
              minLines: 3,
              maxLines: 8,
              decoration: const InputDecoration(
                labelText: 'What students get (one per line)',
                hintText: 'Live classes\nPDF notes\nWeekly tests',
                alignLabelWithHint: true,
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _thumbnail,
              keyboardType: TextInputType.url,
              decoration: const InputDecoration(
                labelText: 'Banner image link (optional)',
                hintText: 'https://… (leave empty for a coloured banner)',
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: InputDecorator(
                    decoration: const InputDecoration(labelText: 'Start date'),
                    child: Text(
                      _startDate == null ? 'Not set' : formatDate(_startDate!),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                IconButton.filledTonal(
                  icon: const Icon(Icons.calendar_month_rounded),
                  onPressed: () async {
                    final now = DateTime.now();
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _startDate ?? now,
                      firstDate: DateTime(now.year - 2),
                      lastDate: DateTime(now.year + 3),
                    );
                    if (picked != null) setState(() => _startDate = picked);
                  },
                ),
                if (_startDate != null)
                  IconButton(
                    icon: const Icon(Icons.clear_rounded),
                    onPressed: () => setState(() => _startDate = null),
                  ),
              ],
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _sortOrder,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Position in list (1 = first)',
              ),
              validator: (v) => int.tryParse((v ?? '').trim()) == null
                  ? 'Enter a whole number'
                  : null,
            ),
            const SizedBox(height: 24),
            Row(
              children: [
                const Expanded(
                  child: Text(
                    'Plans & price',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
                  ),
                ),
                TextButton.icon(
                  icon: const Icon(Icons.add_rounded),
                  label: const Text('Add plan'),
                  onPressed: () =>
                      setState(() => _plans.add(_PlanDraft(_newPlan('')))),
                ),
              ],
            ),
            const Text(
              'Price 0 makes the plan free. MRP is the crossed-out price (optional).',
              style: TextStyle(color: Colors.black54),
            ),
            const SizedBox(height: 8),
            for (var i = 0; i < _plans.length; i++)
              Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              key: Key('plan-name-$i'),
                              controller: _plans[i].name,
                              decoration: const InputDecoration(
                                labelText: 'Plan name',
                                hintText: 'Full batch / Monthly',
                              ),
                              validator: _required,
                            ),
                          ),
                          if (_plans.length > 1)
                            IconButton(
                              icon: const Icon(
                                Icons.remove_circle_outline_rounded,
                              ),
                              onPressed: () =>
                                  setState(() => _plans.removeAt(i).dispose()),
                            ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              key: Key('plan-price-$i'),
                              controller: _plans[i].price,
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                    decimal: true,
                                  ),
                              decoration: const InputDecoration(
                                labelText: 'Price ₹',
                              ),
                              validator: (v) {
                                final err = _number(v);
                                if (err != null) return err;
                                final n = num.parse(v!.trim());
                                if (n > 0 && n < 1) return 'Min ₹1';
                                return null;
                              },
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextFormField(
                              controller: _plans[i].mrp,
                              keyboardType:
                                  const TextInputType.numberWithOptions(
                                    decimal: true,
                                  ),
                              decoration: const InputDecoration(
                                labelText: 'MRP ₹',
                              ),
                              validator: (v) => (v == null || v.trim().isEmpty)
                                  ? null
                                  : _number(v),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextFormField(
                              controller: _plans[i].days,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'Days',
                              ),
                              validator: (v) => _number(v, allowZero: false),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
