import 'dart:async';

import 'package:flutter/material.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';

import '../backend/backend.dart';
import '../config/app_config.dart';
import '../models/models.dart';
import '../utils/format.dart';

enum PurchaseResult { success, cancelled }

/// Buying a batch:
///   1. the server creates a Razorpay order with the real price
///   2. Razorpay Checkout opens (UPI, cards, net banking, wallets)
///   3. the server verifies Razorpay's signature and unlocks the batch
class PaymentService {
  PaymentService._();

  static Future<PurchaseResult> buy(
    BuildContext context,
    Course course,
    CoursePlan plan,
  ) async {
    final order = await backend.createOrder(course.id, plan.id);
    if (order.free) return PurchaseResult.success;

    if (order.isDemo) {
      if (!context.mounted) return PurchaseResult.cancelled;
      final paid = await _demoCheckout(context, order);
      if (!paid) return PurchaseResult.cancelled;
      await backend.verifyPayment(
        orderId: order.orderId,
        paymentId: 'pay_demo',
        signature: 'demo',
      );
      return PurchaseResult.success;
    }

    final response = await _openRazorpay(order);
    if (response == null) return PurchaseResult.cancelled;
    await backend.verifyPayment(
      orderId: response.orderId ?? order.orderId,
      paymentId: response.paymentId ?? '',
      signature: response.signature ?? '',
    );
    return PurchaseResult.success;
  }

  /// Returns null when the student closes the payment sheet.
  static Future<PaymentSuccessResponse?> _openRazorpay(OrderInfo order) {
    final completer = Completer<PaymentSuccessResponse?>();
    final razorpay = Razorpay();

    void finish(PaymentSuccessResponse? value, [Object? error]) {
      if (completer.isCompleted) return;
      razorpay.clear();
      if (error != null) {
        completer.completeError(error);
      } else {
        completer.complete(value);
      }
    }

    razorpay.on(
      Razorpay.EVENT_PAYMENT_SUCCESS,
      (PaymentSuccessResponse r) => finish(r),
    );
    razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, (PaymentFailureResponse r) {
      if (r.code == Razorpay.PAYMENT_CANCELLED) {
        finish(null);
      } else {
        finish(
          null,
          StateError(
            r.message?.isNotEmpty == true
                ? r.message!
                : 'Payment failed. Please try again.',
          ),
        );
      }
    });
    razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, (ExternalWalletResponse r) {
      // External wallets finish the payment outside the app; the webhook
      // unlocks the batch when Razorpay confirms it.
      finish(
        null,
        StateError(
          'Complete the payment in ${r.walletName ?? 'your wallet'}. '
          'The batch unlocks automatically once the payment is confirmed.',
        ),
      );
    });

    razorpay.open({
      'key': order.keyId,
      'amount': order.amountPaise,
      'currency': 'INR',
      'order_id': order.orderId,
      'name': AppConfig.brandName,
      'description': '${order.courseTitle} • ${order.planName}',
      'prefill': {
        if (order.phone.isNotEmpty) 'contact': order.phone,
        if (order.name.isNotEmpty) 'name': order.name,
      },
      'theme': {'color': AppConfig.razorpayThemeColor},
      'retry': {'enabled': true, 'max_count': 2},
    });
    return completer.future;
  }

  static Future<bool> _demoCheckout(
    BuildContext context,
    OrderInfo order,
  ) async {
    final result = await showModalBottomSheet<bool>(
      context: context,
      showDragHandle: true,
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Demo payment',
                style: Theme.of(ctx).textTheme.titleLarge
                    ?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              Text('${order.courseTitle}\n${order.planName}'),
              const SizedBox(height: 16),
              Text(
                rupees(order.amountPaise / 100),
                style: Theme.of(ctx).textTheme.headlineMedium
                    ?.copyWith(fontWeight: FontWeight.w800),
              ),
              const SizedBox(height: 8),
              const Text(
                'This is demo mode. No money is charged. In the live app, '
                'Razorpay opens here with UPI, cards and net banking.',
                style: TextStyle(color: Colors.black54),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  key: const Key('demo-pay'),
                  onPressed: () => Navigator.pop(ctx, true),
                  child: const Text('Pay (demo)'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
    return result ?? false;
  }
}
