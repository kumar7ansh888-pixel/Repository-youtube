// Small formatting helpers (no extra packages needed).

const _months = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/// 123456.0 -> ₹1,23,456 (Indian digit grouping). Paise are shown only if present.
String rupees(num value) {
  final negative = value < 0;
  final abs = value.abs();
  final whole = abs.floor();
  final paise = ((abs - whole) * 100).round();
  final digits = whole.toString();
  String grouped;
  if (digits.length <= 3) {
    grouped = digits;
  } else {
    final last3 = digits.substring(digits.length - 3);
    var rest = digits.substring(0, digits.length - 3);
    final parts = <String>[];
    while (rest.length > 2) {
      parts.insert(0, rest.substring(rest.length - 2));
      rest = rest.substring(0, rest.length - 2);
    }
    if (rest.isNotEmpty) parts.insert(0, rest);
    grouped = '${parts.join(',')},$last3';
  }
  final paiseText = paise > 0 ? '.${paise.toString().padLeft(2, '0')}' : '';
  return '${negative ? '-' : ''}₹$grouped$paiseText';
}

/// 14 Nov 2026
String formatDate(DateTime d) => '${d.day} ${_months[d.month - 1]} ${d.year}';

/// 14 Nov 2026, 6:30 PM
String formatDateTime(DateTime d) {
  final hour12 = d.hour % 12 == 0 ? 12 : d.hour % 12;
  final minute = d.minute.toString().padLeft(2, '0');
  final ampm = d.hour < 12 ? 'AM' : 'PM';
  return '${formatDate(d)}, $hour12:$minute $ampm';
}

/// 365 -> "1 year", 30 -> "1 month", 45 -> "45 days"
String validityText(int days) {
  if (days % 365 == 0) {
    final y = days ~/ 365;
    return y == 1 ? '1 year' : '$y years';
  }
  if (days % 30 == 0) {
    final m = days ~/ 30;
    return m == 1 ? '1 month' : '$m months';
  }
  return days == 1 ? '1 day' : '$days days';
}

/// Days left until [d], never negative.
int daysLeft(DateTime d) {
  final diff = d.difference(DateTime.now());
  if (diff.isNegative) return 0;
  return (diff.inHours / 24).ceil();
}

/// "9876543210" or "+91 98765 43210" -> "+919876543210". Null if not 10 digits.
String? normalizeIndianPhone(String input) {
  var digits = input.replaceAll(RegExp(r'[^0-9]'), '');
  if (digits.length == 12 && digits.startsWith('91')) {
    digits = digits.substring(2);
  }
  if (digits.length == 11 && digits.startsWith('0')) {
    digits = digits.substring(1);
  }
  if (digits.length != 10 || !RegExp(r'^[6-9]').hasMatch(digits)) return null;
  return '+91$digits';
}

/// Google Drive "view" links do not return the PDF itself; this turns them
/// into direct download links. Other links are returned unchanged.
String directPdfUrl(String url) {
  final match =
      RegExp(r'drive\.google\.com/file/d/([^/?#]+)').firstMatch(url) ??
      RegExp(r'drive\.google\.com/open\?id=([^&#]+)').firstMatch(url);
  if (match != null) {
    return 'https://drive.google.com/uc?export=download&id=${match.group(1)}';
  }
  return url;
}
