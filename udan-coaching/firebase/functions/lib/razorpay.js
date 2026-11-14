"use strict";

// Small helpers around the Razorpay REST API and signature checks.
// Kept free of Firebase imports so they can be unit tested on their own.

const crypto = require("node:crypto");

const RAZORPAY_API = "https://api.razorpay.com";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Constant-time comparison of two hex strings. */
function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Checks the signature Razorpay Checkout returns after a successful payment.
 * signature = HMAC_SHA256(order_id + "|" + payment_id, key_secret)
 */
function isValidPaymentSignature({ orderId, paymentId, signature, keySecret }) {
  const expected = crypto
    .createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

/**
 * Checks the X-Razorpay-Signature header of a webhook call.
 * signature = HMAC_SHA256(raw request body, webhook_secret)
 */
function isValidWebhookSignature({ rawBody, signature, webhookSecret }) {
  const expected = crypto
    .createHmac("sha256", webhookSecret)
    .update(rawBody)
    .digest("hex");
  return safeEqualHex(expected, signature);
}

/**
 * New expiry for an enrollment. Buying again while the batch is still active
 * adds the new days on top of the remaining days instead of wasting them.
 */
function newExpiryMillis({ nowMillis, currentExpiryMillis, validityDays }) {
  const days = Number(validityDays);
  if (!Number.isFinite(days) || days <= 0) {
    throw new Error("validityDays must be a positive number");
  }
  const base = Math.max(nowMillis, Number(currentExpiryMillis) || 0);
  return base + Math.round(days) * DAY_MS;
}

/** Rupees (number, may have paise) -> integer paise. */
function rupeesToPaise(rupees) {
  const value = Number(rupees);
  if (!Number.isFinite(value) || value < 0) return NaN;
  return Math.round(value * 100);
}

/** Calls the Razorpay REST API with basic auth. Throws on non-2xx. */
async function razorpayRequest({ keyId, keySecret, method, path, body, fetchImpl = fetch }) {
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
  const res = await fetchImpl(`${RAZORPAY_API}${path}`, {
    method,
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let json = {};
  try {
    json = await res.json();
  } catch (_) {
    json = {};
  }
  if (!res.ok) {
    const description = json && json.error && json.error.description;
    const err = new Error(`Razorpay ${method} ${path} failed (${res.status}): ${description || "unknown error"}`);
    err.status = res.status;
    err.razorpay = json;
    throw err;
  }
  return json;
}

module.exports = {
  DAY_MS,
  safeEqualHex,
  isValidPaymentSignature,
  isValidWebhookSignature,
  newExpiryMillis,
  rupeesToPaise,
  razorpayRequest,
};
