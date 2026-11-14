import 'dart:async';

import 'package:flutter/material.dart';

import '../../backend/backend.dart';
import '../../config/theme.dart';
import '../../models/models.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';

String _marks(num v) =>
    v == v.roundToDouble() ? v.round().toString() : v.toStringAsFixed(2);

/// Instructions, previous scores and the Start button.
class TestIntroScreen extends StatefulWidget {
  const TestIntroScreen({
    super.key,
    required this.courseId,
    required this.test,
  });
  final String courseId;
  final ContentItem test;

  @override
  State<TestIntroScreen> createState() => _TestIntroScreenState();
}

class _TestIntroScreenState extends State<TestIntroScreen> {
  late final Stream<List<TestAttempt>> _attempts = backend.myAttempts(
    widget.test.id,
  );

  @override
  Widget build(BuildContext context) {
    final t = widget.test;
    return StreamBuilder<List<TestAttempt>>(
      stream: _attempts,
      builder: (context, snap) {
        final attempts = snap.data ?? const <TestAttempt>[];
        return Scaffold(
          appBar: AppBar(title: Text(t.title, overflow: TextOverflow.ellipsis)),
          body: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        t.title,
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 16),
                      _InfoRow(
                        icon: Icons.help_outline_rounded,
                        text: '${t.questions.length} questions',
                      ),
                      _InfoRow(
                        icon: Icons.timer_outlined,
                        text: '${t.durationMinutes} minutes',
                      ),
                      _InfoRow(
                        icon: Icons.add_circle_outline_rounded,
                        text:
                            '+${_marks(t.marksCorrect)} for every correct answer',
                      ),
                      _InfoRow(
                        icon: Icons.remove_circle_outline_rounded,
                        text: t.marksWrong > 0
                            ? '−${_marks(t.marksWrong)} for every wrong answer'
                            : 'No negative marking',
                      ),
                      const _InfoRow(
                        icon: Icons.skip_next_rounded,
                        text: 'Skipped questions get 0',
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                key: const Key('start-test'),
                icon: const Icon(Icons.play_arrow_rounded),
                label: const Text('Start test'),
                onPressed: t.questions.isEmpty
                    ? null
                    : () => Navigator.push(
                        context,
                        MaterialPageRoute<void>(
                          builder: (_) =>
                              TestScreen(courseId: widget.courseId, test: t),
                        ),
                      ),
              ),
              if (t.questions.isEmpty)
                const Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Text(
                    'Questions have not been added yet.',
                    textAlign: TextAlign.center,
                  ),
                ),
              const SizedBox(height: 24),
              if (attempts.isNotEmpty) ...[
                const Text(
                  'Your attempts',
                  style: TextStyle(fontSize: 17, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 8),
                for (final a in attempts)
                  Card(
                    margin: const EdgeInsets.only(bottom: 8),
                    child: ListTile(
                      leading: const Icon(
                        Icons.emoji_events_rounded,
                        color: AppColors.saffron,
                      ),
                      title: Text(
                        '${_marks(a.score)} / ${_marks(a.maxScore)}',
                        style: const TextStyle(fontWeight: FontWeight.w800),
                      ),
                      subtitle: Text(
                        '${a.correct} correct • ${a.wrong} wrong • ${a.skipped} skipped\n${formatDateTime(a.submittedAt)}',
                      ),
                      isThreeLine: true,
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute<void>(
                          builder: (_) => TestResultScreen(test: t, attempt: a),
                        ),
                      ),
                    ),
                  ),
              ],
            ],
          ),
        );
      },
    );
  }
}

class _InfoRow extends StatelessWidget {
  const _InfoRow({required this.icon, required this.text});
  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 5),
    child: Row(
      children: [
        Icon(icon, size: 20, color: AppColors.indigo),
        const SizedBox(width: 10),
        Expanded(child: Text(text, style: const TextStyle(fontSize: 15))),
      ],
    ),
  );
}

/// The test itself: one question at a time, timer, question palette.
class TestScreen extends StatefulWidget {
  const TestScreen({super.key, required this.courseId, required this.test});
  final String courseId;
  final ContentItem test;

  @override
  State<TestScreen> createState() => _TestScreenState();
}

class _TestScreenState extends State<TestScreen> {
  late final List<int> _answers = List<int>.filled(
    widget.test.questions.length,
    -1,
  );
  late int _secondsLeft = widget.test.durationMinutes * 60;
  int _index = 0;
  Timer? _timer;
  bool _submitting = false;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() => _secondsLeft--);
      if (_secondsLeft <= 0) {
        _timer?.cancel();
        _submit(timeUp: true);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _clock {
    final s = _secondsLeft.clamp(0, 1 << 30);
    return '${(s ~/ 60).toString().padLeft(2, '0')}:${(s % 60).toString().padLeft(2, '0')}';
  }

  Future<void> _submit({bool timeUp = false}) async {
    if (_submitting) return;
    if (!timeUp) {
      final unanswered = _answers.where((a) => a < 0).length;
      final ok = await confirm(
        context,
        title: 'Submit test?',
        message: unanswered > 0
            ? 'You have $unanswered unanswered ${unanswered == 1 ? 'question' : 'questions'}.'
            : 'You have answered all questions.',
        confirmText: 'Submit',
      );
      if (!ok || !mounted) return;
    }
    setState(() => _submitting = true);
    _timer?.cancel();
    final attempt = TestAttempt.grade(
      courseId: widget.courseId,
      test: widget.test,
      answers: _answers,
    );
    try {
      await backend.saveAttempt(attempt);
    } catch (e) {
      // The result is still shown even if saving failed (e.g. no internet).
      if (mounted) {
        showSnack(context, 'Result could not be saved: ${friendlyError(e)}');
      }
    }
    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute<void>(
        builder: (_) => TestResultScreen(
          test: widget.test,
          attempt: attempt,
          timeUp: timeUp,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final questions = widget.test.questions;
    final q = questions[_index];
    final lowTime = _secondsLeft <= 60;
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) async {
        if (didPop) return;
        final leave = await confirm(
          context,
          title: 'Leave test?',
          message: 'Your answers will be lost.',
          confirmText: 'Leave',
          destructive: true,
        );
        if (leave && context.mounted) Navigator.pop(context);
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text('Q ${_index + 1} of ${questions.length}'),
          actions: [
            Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: (lowTime ? AppColors.danger : AppColors.indigo)
                    .withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.timer_rounded,
                    size: 18,
                    color: lowTime ? AppColors.danger : AppColors.indigo,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    _clock,
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      color: lowTime ? AppColors.danger : AppColors.indigo,
                      fontFeatures: const [FontFeature.tabularFigures()],
                    ),
                  ),
                ],
              ),
            ),
            TextButton(
              key: const Key('submit-test'),
              onPressed: _submitting ? null : _submit,
              child: const Text('Submit'),
            ),
          ],
        ),
        body: Column(
          children: [
            SizedBox(
              height: 56,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 10,
                ),
                itemCount: questions.length,
                itemBuilder: (context, i) {
                  final answered = _answers[i] >= 0;
                  final current = i == _index;
                  return Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: InkWell(
                      borderRadius: BorderRadius.circular(18),
                      onTap: () => setState(() => _index = i),
                      child: Container(
                        width: 36,
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: answered ? AppColors.success : Colors.white,
                          border: Border.all(
                            color: current
                                ? AppColors.indigo
                                : const Color(0xFFD0D7E5),
                            width: current ? 2.5 : 1,
                          ),
                        ),
                        child: Text(
                          '${i + 1}',
                          style: TextStyle(
                            fontWeight: FontWeight.w700,
                            color: answered ? Colors.white : Colors.black87,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: RadioGroup<int>(
                groupValue: _answers[_index] < 0 ? null : _answers[_index],
                onChanged: (v) => setState(() => _answers[_index] = v ?? -1),
                child: ListView(
                  padding: const EdgeInsets.all(16),
                  children: [
                    Text(
                      q.text,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 16),
                    for (var o = 0; o < q.options.length; o++)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Material(
                          color: _answers[_index] == o
                              ? AppColors.indigo.withValues(alpha: 0.08)
                              : Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: _answers[_index] == o
                                  ? AppColors.indigo
                                  : const Color(0xFFE3E8F2),
                              width: _answers[_index] == o ? 2 : 1,
                            ),
                          ),
                          child: InkWell(
                            key: Key('option-$o'),
                            borderRadius: BorderRadius.circular(12),
                            onTap: () => setState(() => _answers[_index] = o),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(vertical: 6),
                              child: Row(
                                children: [
                                  Radio<int>(value: o),
                                  Expanded(
                                    child: Text(
                                      q.options[o],
                                      style: const TextStyle(fontSize: 16),
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    if (_answers[_index] >= 0)
                      Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton.icon(
                          icon: const Icon(Icons.clear_rounded),
                          label: const Text('Clear answer'),
                          onPressed: () =>
                              setState(() => _answers[_index] = -1),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            SafeArea(
              top: false,
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
                child: Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _index == 0
                            ? null
                            : () => setState(() => _index--),
                        child: const Text('Previous'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        key: const Key('next-question'),
                        onPressed: _submitting
                            ? null
                            : _index == questions.length - 1
                            ? _submit
                            : () => setState(() => _index++),
                        child: Text(
                          _index == questions.length - 1 ? 'Submit' : 'Next',
                        ),
                      ),
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

/// Score and full solutions.
class TestResultScreen extends StatelessWidget {
  const TestResultScreen({
    super.key,
    required this.test,
    required this.attempt,
    this.timeUp = false,
  });
  final ContentItem test;
  final TestAttempt attempt;
  final bool timeUp;

  @override
  Widget build(BuildContext context) {
    final percent = attempt.maxScore > 0
        ? (attempt.score / attempt.maxScore * 100).clamp(0, 100)
        : 0;
    return Scaffold(
      appBar: AppBar(title: const Text('Result')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: AppColors.brandGradient,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              children: [
                if (timeUp)
                  const Padding(
                    padding: EdgeInsets.only(bottom: 8),
                    child: Text(
                      'Time up! Your test was submitted.',
                      style: TextStyle(color: Colors.white70),
                    ),
                  ),
                const Text(
                  'Your score',
                  style: TextStyle(color: Colors.white70, fontSize: 15),
                ),
                const SizedBox(height: 4),
                Text(
                  '${_marks(attempt.score)} / ${_marks(attempt.maxScore)}',
                  key: const Key('test-score'),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  percent >= 80
                      ? 'Excellent! Keep it up 🚀'
                      : percent >= 50
                      ? 'Good effort. Revise and try again 💪'
                      : 'Don\'t worry, practice makes perfect 📚',
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _Stat(
                      label: 'Correct',
                      value: attempt.correct,
                      color: const Color(0xFF7CF0B0),
                    ),
                    _Stat(
                      label: 'Wrong',
                      value: attempt.wrong,
                      color: const Color(0xFFFFA4A4),
                    ),
                    _Stat(
                      label: 'Skipped',
                      value: attempt.skipped,
                      color: Colors.white,
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Solutions',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          for (var i = 0; i < test.questions.length; i++)
            _SolutionCard(
              number: i + 1,
              question: test.questions[i],
              chosen: i < attempt.answers.length ? attempt.answers[i] : -1,
            ),
        ],
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  const _Stat({required this.label, required this.value, required this.color});
  final String label;
  final int value;
  final Color color;

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(
        '$value',
        style: TextStyle(
          color: color,
          fontSize: 22,
          fontWeight: FontWeight.w900,
        ),
      ),
      Text(label, style: const TextStyle(color: Colors.white70)),
    ],
  );
}

class _SolutionCard extends StatelessWidget {
  const _SolutionCard({
    required this.number,
    required this.question,
    required this.chosen,
  });
  final int number;
  final Question question;
  final int chosen;

  @override
  Widget build(BuildContext context) {
    final status = chosen < 0
        ? ('Skipped', Colors.black45)
        : chosen == question.answerIndex
        ? ('Correct', AppColors.success)
        : ('Wrong', AppColors.danger);
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text(
                  'Q$number',
                  style: const TextStyle(
                    fontWeight: FontWeight.w800,
                    color: AppColors.indigo,
                  ),
                ),
                const Spacer(),
                Text(
                  status.$1,
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: status.$2,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              question.text,
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 10),
            for (var o = 0; o < question.options.length; o++)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 8,
                ),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  color: o == question.answerIndex
                      ? AppColors.success.withValues(alpha: 0.12)
                      : o == chosen
                      ? AppColors.danger.withValues(alpha: 0.1)
                      : Colors.transparent,
                ),
                child: Row(
                  children: [
                    Icon(
                      o == question.answerIndex
                          ? Icons.check_circle_rounded
                          : o == chosen
                          ? Icons.cancel_rounded
                          : Icons.radio_button_unchecked_rounded,
                      size: 18,
                      color: o == question.answerIndex
                          ? AppColors.success
                          : o == chosen
                          ? AppColors.danger
                          : Colors.black26,
                    ),
                    const SizedBox(width: 8),
                    Expanded(child: Text(question.options[o])),
                  ],
                ),
              ),
            if (question.explanation.isNotEmpty) ...[
              const SizedBox(height: 6),
              Text(
                'Explanation: ${question.explanation}',
                style: const TextStyle(color: Colors.black54),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
