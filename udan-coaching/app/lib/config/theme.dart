import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  static const Color indigo = Color(0xFF1F3C88);
  static const Color indigoDark = Color(0xFF14285E);
  static const Color saffron = Color(0xFFFF8A00);
  static const Color sky = Color(0xFF3FA9F5);
  static const Color success = Color(0xFF1B9E5A);
  static const Color danger = Color(0xFFD64545);

  static const LinearGradient brandGradient = LinearGradient(
    colors: [indigoDark, indigo, sky],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  /// Gradients for batch cards that have no thumbnail image.
  static const List<List<Color>> cardGradients = [
    [Color(0xFF1F3C88), Color(0xFF3FA9F5)],
    [Color(0xFFFF8A00), Color(0xFFFFC14D)],
    [Color(0xFF6A3FC8), Color(0xFFB07CFF)],
    [Color(0xFF0F8A6B), Color(0xFF48C9A1)],
    [Color(0xFFC0392B), Color(0xFFFF7A6B)],
  ];
}

ThemeData buildTheme() {
  final scheme = ColorScheme.fromSeed(
    seedColor: AppColors.indigo,
    primary: AppColors.indigo,
    secondary: AppColors.saffron,
    brightness: Brightness.light,
  );
  return ThemeData(
    useMaterial3: true,
    colorScheme: scheme,
    scaffoldBackgroundColor: const Color(0xFFF5F7FB),
    appBarTheme: const AppBarTheme(
      backgroundColor: Colors.white,
      foregroundColor: AppColors.indigoDark,
      elevation: 0,
      scrolledUnderElevation: 1,
      centerTitle: false,
      titleTextStyle: TextStyle(
        color: AppColors.indigoDark,
        fontSize: 19,
        fontWeight: FontWeight.w700,
      ),
    ),
    cardTheme: CardThemeData(
      color: Colors.white,
      elevation: 0,
      margin: EdgeInsets.zero,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFFE3E8F2)),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: Colors.white,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size(64, 50),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(64, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: Colors.white,
      indicatorColor: AppColors.indigo.withValues(alpha: 0.12),
      labelTextStyle: WidgetStateProperty.all(
        const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
      ),
    ),
  );
}
