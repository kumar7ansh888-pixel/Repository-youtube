import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../backend/backend.dart';
import '../../backend/demo_backend.dart';
import '../../config/app_config.dart';
import '../../config/theme.dart';
import '../../utils/format.dart';
import '../../widgets/common.dart';

/// Phone number + OTP login. Both steps live in this one screen so nothing
/// is left on the navigation stack after the student logs in.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _phone = TextEditingController();
  final _otp = TextEditingController();
  String? _verificationId;
  String? _phoneE164;
  String? _error;
  bool _busy = false;
  int _resendIn = 0;
  Timer? _timer;

  @override
  void dispose() {
    _timer?.cancel();
    _phone.dispose();
    _otp.dispose();
    super.dispose();
  }

  void _startResendTimer() {
    _timer?.cancel();
    setState(() => _resendIn = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return t.cancel();
      setState(() => _resendIn--);
      if (_resendIn <= 0) t.cancel();
    });
  }

  Future<void> _sendOtp() async {
    final phone = normalizeIndianPhone(_phone.text);
    if (phone == null) {
      setState(() => _error = 'Enter a valid 10 digit mobile number.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
      _phoneE164 = phone;
    });
    try {
      await backend.sendOtp(
        phone,
        onCodeSent: (id) {
          if (!mounted) return;
          setState(() {
            _verificationId = id;
            _busy = false;
          });
          _startResendTimer();
        },
        onError: (message) {
          if (!mounted) return;
          setState(() {
            _error = message;
            _busy = false;
          });
        },
        onAutoVerified: () {},
      );
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = friendlyError(e);
          _busy = false;
        });
      }
    }
  }

  Future<void> _verify() async {
    final code = _otp.text.trim();
    if (code.length != 6) {
      setState(() => _error = 'Enter the 6 digit OTP.');
      return;
    }
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await backend.verifyOtp(_verificationId!, code);
      // AuthGate switches to the next screen by itself.
    } catch (e) {
      if (mounted) setState(() => _error = friendlyError(e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final otpStep = _verificationId != null;
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Column(
          children: [
            if (backend.isDemo) const DemoBanner(),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.fromLTRB(24, 32, 24, 24),
                children: [
                  const Center(child: BrandLogo(size: 84)),
                  const SizedBox(height: 20),
                  const Text(
                    AppConfig.brandName,
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: AppColors.indigoDark,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'with ${AppConfig.teacherName} • ${AppConfig.tagline}',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.black54,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 40),
                  Text(
                    otpStep ? 'Enter OTP' : 'Login with mobile number',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    otpStep
                        ? 'We sent a 6 digit code to $_phoneE164'
                        : 'We will send you a one time password (OTP) by SMS.',
                    style: const TextStyle(color: Colors.black54),
                  ),
                  if (backend.isDemo)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        otpStep ? 'Demo OTP: ${DemoBackend.demoOtp}' : 'Demo: any number logs in as a student. Use 9999999999 to open the teacher\'s admin panel.',
                        style: const TextStyle(
                          color: AppColors.saffron,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  const SizedBox(height: 20),
                  if (!otpStep)
                    TextField(
                      key: const Key('phone-field'),
                      controller: _phone,
                      keyboardType: TextInputType.phone,
                      autofillHints: const [AutofillHints.telephoneNumber],
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(10),
                      ],
                      decoration: const InputDecoration(
                        prefixText: '${AppConfig.countryCode}  ',
                        labelText: 'Mobile number',
                      ),
                      onSubmitted: (_) => _busy ? null : _sendOtp(),
                    )
                  else
                    TextField(
                      key: const Key('otp-field'),
                      controller: _otp,
                      keyboardType: TextInputType.number,
                      autofillHints: const [AutofillHints.oneTimeCode],
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(6),
                      ],
                      style: const TextStyle(
                        fontSize: 22,
                        letterSpacing: 8,
                        fontWeight: FontWeight.w700,
                      ),
                      decoration: const InputDecoration(labelText: 'OTP'),
                      onSubmitted: (_) => _busy ? null : _verify(),
                    ),
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      style: const TextStyle(color: AppColors.danger),
                    ),
                  ],
                  const SizedBox(height: 20),
                  FilledButton(
                    key: const Key('login-continue'),
                    onPressed: _busy ? null : (otpStep ? _verify : _sendOtp),
                    child: _busy
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : Text(otpStep ? 'Verify & continue' : 'Get OTP'),
                  ),
                  if (otpStep) ...[
                    const SizedBox(height: 8),
                    Wrap(
                      alignment: WrapAlignment.spaceBetween,
                      children: [
                        TextButton(
                          onPressed: _busy
                              ? null
                              : () => setState(() {
                                  _verificationId = null;
                                  _otp.clear();
                                  _error = null;
                                }),
                          child: const Text('Change number'),
                        ),
                        TextButton(
                          onPressed: _busy || _resendIn > 0 ? null : _sendOtp,
                          child: Text(
                            _resendIn > 0
                                ? 'Resend in ${_resendIn}s'
                                : 'Resend OTP',
                          ),
                        ),
                      ],
                    ),
                  ],
                  const SizedBox(height: 32),
                  const Text(
                    'By continuing you agree to our Terms and Privacy Policy.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.black45, fontSize: 12),
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
