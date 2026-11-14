/// Everything that is specific to Udan Coaching lives here, so it is easy
/// to change names, contact numbers and links without touching the screens.
class AppConfig {
  AppConfig._();

  static const String brandName = 'Udan Coaching';
  static const String teacherName = 'Satyam Sir';
  static const String tagline = 'Sapno ko do nayi udaan';

  /// Country code used for phone login.
  static const String countryCode = '+91';

  /// Shown on the Profile -> Help screen. Replace with real numbers.
  static const String supportPhone = '+910000000000';
  static const String supportWhatsApp = '910000000000';
  static const String supportEmail = 'support@example.com';

  /// Public pages (host them with Firebase Hosting, see firebase/hosting).
  static const String privacyPolicyUrl = 'https://REPLACE-ME.web.app/privacy';
  static const String deleteAccountUrl =
      'https://REPLACE-ME.web.app/delete-account';

  /// Must match the region in firebase/functions/index.js.
  static const String functionsRegion = 'asia-south1';

  /// Hex colour used by the Razorpay checkout sheet.
  static const String razorpayThemeColor = '#1F3C88';

  /// Batch categories offered in the admin editor.
  static const List<String> categories = [
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
    'JEE',
    'NEET',
    'Foundation',
    'Other',
  ];

  /// Classes a student can pick during sign up.
  static const List<String> studentClasses = [
    'Class 6',
    'Class 7',
    'Class 8',
    'Class 9',
    'Class 10',
    'Class 11',
    'Class 12',
    'Dropper',
    'Other',
  ];
}
