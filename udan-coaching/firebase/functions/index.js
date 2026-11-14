"use strict";

// Cloud Functions for the Udan Coaching app.
//
//  createOrder      - app asks for a Razorpay order for a batch + plan
//  verifyPayment    - app sends Razorpay's success response; we verify the
//                     signature and unlock the batch for the student
//  razorpayWebhook  - Razorpay calls this directly, so the batch is unlocked
//                     even if the app was closed right after paying
//  deleteAccount    - "Delete my account" button (Play Store requirement)
//
// Money never decides access on the phone: only these functions (or an admin)
// can write /enrollments, and the Firestore rules check that collection.

const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { defineSecret, defineString } = require("firebase-functions/params");
const logger = require("firebase-functions/logger");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue, Timestamp } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");

const {
  isValidPaymentSignature,
  isValidWebhookSignature,
  newExpiryMillis,
  rupeesToPaise,
  razorpayRequest,
} = require("./lib/razorpay");

initializeApp();
// Mumbai region: closest to students in India. Must match
// AppConfig.functionsRegion in the Flutter app.
setGlobalOptions({ region: "asia-south1", maxInstances: 10 });

const RAZORPAY_KEY_ID = defineString("RAZORPAY_KEY_ID", {
  description: "Razorpay Key Id (starts with rzp_test_ or rzp_live_)",
});
const RAZORPAY_KEY_SECRET = defineSecret("RAZORPAY_KEY_SECRET");
const RAZORPAY_WEBHOOK_SECRET = defineSecret("RAZORPAY_WEBHOOK_SECRET");

const db = getFirestore();

function requireAuth(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Please log in again.");
  }
  return request.auth.uid;
}

function rzp(method, path, body) {
  return razorpayRequest({
    keyId: RAZORPAY_KEY_ID.value(),
    keySecret: RAZORPAY_KEY_SECRET.value(),
    method,
    path,
    body,
  });
}

/**
 * Marks an order as paid and gives (or extends) the student's access.
 * Safe to call more than once for the same order (app + webhook both call it).
 */
async function fulfilOrder(orderId, paymentId) {
  return db.runTransaction(async (tx) => {
    const orderRef = db.collection("orders").doc(orderId);
    const orderSnap = await tx.get(orderRef);
    if (!orderSnap.exists) {
      throw new HttpsError("not-found", "Order not found.");
    }
    const order = orderSnap.data();
    const enrollmentRef = db.collection("enrollments").doc(`${order.uid}_${order.courseId}`);
    const enrollmentSnap = await tx.get(enrollmentRef);

    if (order.status === "paid") {
      // Already handled (by the webhook or an earlier call).
      return {
        courseId: order.courseId,
        expiresAt: enrollmentSnap.exists ? enrollmentSnap.get("expiresAt") : null,
      };
    }

    const nowMillis = Date.now();
    const current = enrollmentSnap.exists ? enrollmentSnap.get("expiresAt") : null;
    const expiresAt = Timestamp.fromMillis(
      newExpiryMillis({
        nowMillis,
        currentExpiryMillis: current ? current.toMillis() : 0,
        validityDays: order.validityDays,
      }),
    );

    tx.set(
      enrollmentRef,
      {
        uid: order.uid,
        courseId: order.courseId,
        courseTitle: order.courseTitle || "",
        planId: order.planId,
        planName: order.planName || "",
        amountPaid: order.amount / 100,
        orderId,
        paymentId: paymentId || null,
        source: order.amount > 0 ? "razorpay" : "free",
        studentName: order.studentName || "",
        studentPhone: order.studentPhone || "",
        startedAt:
          enrollmentSnap.exists && enrollmentSnap.get("startedAt")
            ? enrollmentSnap.get("startedAt")
            : Timestamp.fromMillis(nowMillis),
        expiresAt,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    tx.update(orderRef, {
      status: "paid",
      paymentId: paymentId || null,
      paidAt: FieldValue.serverTimestamp(),
    });
    return { courseId: order.courseId, expiresAt };
  });
}

/**
 * Makes sure the Razorpay payment really belongs to this order, has the right
 * amount and is captured (captures it if the account does not auto-capture).
 */
async function ensureCaptured(orderId, paymentId) {
  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists) throw new HttpsError("not-found", "Order not found.");
  const order = orderSnap.data();

  let payment = await rzp("GET", `/v1/payments/${encodeURIComponent(paymentId)}`);
  if (payment.order_id !== orderId) {
    throw new HttpsError("permission-denied", "Payment does not match this order.");
  }
  if (Number(payment.amount) !== Number(order.amount)) {
    throw new HttpsError("permission-denied", "Payment amount does not match.");
  }
  if (payment.status === "authorized") {
    payment = await rzp("POST", `/v1/payments/${encodeURIComponent(paymentId)}/capture`, {
      amount: order.amount,
      currency: order.currency || "INR",
    });
  }
  if (payment.status !== "captured") {
    throw new HttpsError(
      "failed-precondition",
      `Payment is ${payment.status}. If money was deducted it will be refunded automatically by your bank.`,
    );
  }
  return order;
}

exports.createOrder = onCall({ secrets: [RAZORPAY_KEY_SECRET] }, async (request) => {
  const uid = requireAuth(request);
  const { courseId, planId } = request.data || {};
  if (typeof courseId !== "string" || !courseId || typeof planId !== "string" || !planId) {
    throw new HttpsError("invalid-argument", "courseId and planId are required.");
  }

  const courseSnap = await db.collection("courses").doc(courseId).get();
  if (!courseSnap.exists || courseSnap.get("published") !== true) {
    throw new HttpsError("not-found", "This batch is not available right now.");
  }
  const course = courseSnap.data();
  const plan = (course.plans || []).find((p) => p && p.id === planId);
  if (!plan) {
    throw new HttpsError("not-found", "This plan is not available any more.");
  }

  const amount = rupeesToPaise(plan.price);
  if (!Number.isFinite(amount) || (amount > 0 && amount < 100)) {
    throw new HttpsError("failed-precondition", "This plan does not have a valid price.");
  }
  const validityDays = Math.round(Number(plan.validityDays) || 365);

  const userSnap = await db.collection("users").doc(uid).get();
  const studentName = (userSnap.exists && userSnap.get("name")) || "";
  const studentPhone = (request.auth.token && request.auth.token.phone_number) || "";

  const orderData = {
    uid,
    courseId,
    courseTitle: course.title || "",
    planId,
    planName: plan.name || "",
    validityDays,
    amount,
    currency: "INR",
    studentName,
    studentPhone,
    status: "created",
    createdAt: FieldValue.serverTimestamp(),
  };

  // Free plan: no payment needed, unlock straight away.
  if (amount === 0) {
    const ref = db.collection("orders").doc();
    await ref.set(orderData);
    const result = await fulfilOrder(ref.id, null);
    return {
      free: true,
      orderId: ref.id,
      courseId,
      expiresAt: result.expiresAt ? result.expiresAt.toMillis() : null,
    };
  }

  let order;
  try {
    order = await rzp("POST", "/v1/orders", {
      amount,
      currency: "INR",
      // Razorpay allows max 40 characters here.
      receipt: `u_${Date.now().toString(36)}_${uid.slice(0, 10)}`,
      notes: { uid, courseId, planId },
    });
  } catch (err) {
    logger.error("Razorpay order creation failed", err);
    throw new HttpsError("unavailable", "Payment service is not reachable. Please try again.");
  }

  await db.collection("orders").doc(order.id).set(orderData);

  return {
    free: false,
    orderId: order.id,
    amount,
    currency: "INR",
    keyId: RAZORPAY_KEY_ID.value(),
    courseTitle: course.title || "",
    planName: plan.name || "",
    name: studentName,
    phone: studentPhone,
  };
});

exports.verifyPayment = onCall({ secrets: [RAZORPAY_KEY_SECRET] }, async (request) => {
  const uid = requireAuth(request);
  const { orderId, paymentId, signature } = request.data || {};
  const allStrings = [orderId, paymentId, signature].every((v) => typeof v === "string" && v.length > 0);
  if (!allStrings) {
    throw new HttpsError("invalid-argument", "orderId, paymentId and signature are required.");
  }

  if (!isValidPaymentSignature({ orderId, paymentId, signature, keySecret: RAZORPAY_KEY_SECRET.value() })) {
    logger.warn("Bad payment signature", { uid, orderId, paymentId });
    throw new HttpsError("permission-denied", "Payment could not be verified.");
  }

  const orderSnap = await db.collection("orders").doc(orderId).get();
  if (!orderSnap.exists || orderSnap.get("uid") !== uid) {
    throw new HttpsError("not-found", "Order not found.");
  }

  if (orderSnap.get("status") !== "paid") {
    try {
      await ensureCaptured(orderId, paymentId);
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      logger.error("Could not confirm payment with Razorpay", err);
      throw new HttpsError(
        "unavailable",
        "We received your payment but could not confirm it yet. It will be unlocked automatically in a few minutes.",
      );
    }
  }

  const result = await fulfilOrder(orderId, paymentId);
  return {
    courseId: result.courseId,
    expiresAt: result.expiresAt ? result.expiresAt.toMillis() : null,
  };
});

// Set this URL as a webhook in Razorpay Dashboard -> Settings -> Webhooks,
// with events: payment.captured, order.paid (and payment.authorized if you
// turned off auto-capture).
exports.razorpayWebhook = onRequest(
  { secrets: [RAZORPAY_KEY_SECRET, RAZORPAY_WEBHOOK_SECRET] },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method not allowed");
      return;
    }
    const signature = req.get("x-razorpay-signature") || "";
    if (!isValidWebhookSignature({ rawBody: req.rawBody, signature, webhookSecret: RAZORPAY_WEBHOOK_SECRET.value() })) {
      logger.warn("Webhook with bad signature rejected");
      res.status(400).send("Bad signature");
      return;
    }

    const event = req.body || {};
    const payment = event.payload && event.payload.payment && event.payload.payment.entity;
    const orderId = payment && payment.order_id;
    if (!payment || !orderId) {
      res.status(200).send("Ignored");
      return;
    }

    try {
      const orderSnap = await db.collection("orders").doc(orderId).get();
      if (!orderSnap.exists) {
        // Not an order created by this app (e.g. a payment link). Ignore.
        res.status(200).send("Unknown order");
        return;
      }
      if (orderSnap.get("status") !== "paid") {
        if (["payment.captured", "order.paid", "payment.authorized"].includes(event.event)) {
          await ensureCaptured(orderId, payment.id);
          await fulfilOrder(orderId, payment.id);
          logger.info("Order fulfilled from webhook", { orderId, event: event.event });
        }
      }
      res.status(200).send("OK");
    } catch (err) {
      logger.error("Webhook processing failed", err);
      // Non-2xx makes Razorpay retry later.
      res.status(500).send("Error");
    }
  },
);

exports.deleteAccount = onCall(async (request) => {
  const uid = requireAuth(request);

  // Profile and test attempts.
  await db.recursiveDelete(db.collection("users").doc(uid));

  // Access records.
  const enrollments = await db.collection("enrollments").where("uid", "==", uid).get();
  const writer = db.bulkWriter();
  enrollments.forEach((doc) => writer.delete(doc.ref));
  await writer.close();

  // Payment records in /orders are kept: invoices must be retained by law.
  // They are not linked to a login any more once the auth user is removed.
  await getAuth().deleteUser(uid);
  logger.info("Account deleted", { uid });
  return { deleted: true };
});
