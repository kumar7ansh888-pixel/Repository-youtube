"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const {
  DAY_MS,
  isValidPaymentSignature,
  isValidWebhookSignature,
  newExpiryMillis,
  rupeesToPaise,
  razorpayRequest,
} = require("../lib/razorpay");

const SECRET = "test_secret_123";

function sign(text, secret = SECRET) {
  return crypto.createHmac("sha256", secret).update(text).digest("hex");
}

test("accepts a correct checkout signature", () => {
  const signature = sign("order_ABC|pay_XYZ");
  assert.equal(
    isValidPaymentSignature({ orderId: "order_ABC", paymentId: "pay_XYZ", signature, keySecret: SECRET }),
    true,
  );
});

test("rejects a signature for a different payment or secret", () => {
  const signature = sign("order_ABC|pay_XYZ");
  assert.equal(
    isValidPaymentSignature({ orderId: "order_ABC", paymentId: "pay_OTHER", signature, keySecret: SECRET }),
    false,
  );
  assert.equal(
    isValidPaymentSignature({ orderId: "order_ABC", paymentId: "pay_XYZ", signature, keySecret: "wrong" }),
    false,
  );
  assert.equal(
    isValidPaymentSignature({ orderId: "order_ABC", paymentId: "pay_XYZ", signature: "short", keySecret: SECRET }),
    false,
  );
  assert.equal(
    isValidPaymentSignature({ orderId: "order_ABC", paymentId: "pay_XYZ", signature: undefined, keySecret: SECRET }),
    false,
  );
});

test("checks webhook signatures over the raw body", () => {
  const rawBody = Buffer.from('{"event":"payment.captured"}');
  const signature = sign(rawBody);
  assert.equal(isValidWebhookSignature({ rawBody, signature, webhookSecret: SECRET }), true);
  assert.equal(
    isValidWebhookSignature({ rawBody: Buffer.from('{"event":"x"}'), signature, webhookSecret: SECRET }),
    false,
  );
});

test("new purchase starts today", () => {
  const now = Date.UTC(2026, 0, 1);
  assert.equal(newExpiryMillis({ nowMillis: now, currentExpiryMillis: 0, validityDays: 30 }), now + 30 * DAY_MS);
});

test("renewal while still active adds on top of remaining days", () => {
  const now = Date.UTC(2026, 0, 1);
  const current = now + 10 * DAY_MS;
  assert.equal(
    newExpiryMillis({ nowMillis: now, currentExpiryMillis: current, validityDays: 30 }),
    now + 40 * DAY_MS,
  );
});

test("renewal after expiry starts from today", () => {
  const now = Date.UTC(2026, 0, 1);
  const expired = now - 5 * DAY_MS;
  assert.equal(
    newExpiryMillis({ nowMillis: now, currentExpiryMillis: expired, validityDays: 30 }),
    now + 30 * DAY_MS,
  );
});

test("validity must be positive", () => {
  assert.throws(() => newExpiryMillis({ nowMillis: 0, currentExpiryMillis: 0, validityDays: 0 }));
  assert.throws(() => newExpiryMillis({ nowMillis: 0, currentExpiryMillis: 0, validityDays: "abc" }));
});

test("converts rupees to paise", () => {
  assert.equal(rupeesToPaise(999), 99900);
  assert.equal(rupeesToPaise("1499.50"), 149950);
  assert.equal(rupeesToPaise(0), 0);
  assert.ok(Number.isNaN(rupeesToPaise(-1)));
  assert.ok(Number.isNaN(rupeesToPaise("abc")));
});

test("razorpayRequest sends basic auth and surfaces API errors", async () => {
  let seen;
  const okFetch = async (url, init) => {
    seen = { url, init };
    return { ok: true, status: 200, json: async () => ({ id: "order_1" }) };
  };
  const result = await razorpayRequest({
    keyId: "rzp_test_k",
    keySecret: "s",
    method: "POST",
    path: "/v1/orders",
    body: { amount: 100 },
    fetchImpl: okFetch,
  });
  assert.equal(result.id, "order_1");
  assert.equal(seen.url, "https://api.razorpay.com/v1/orders");
  assert.equal(seen.init.headers.Authorization, `Basic ${Buffer.from("rzp_test_k:s").toString("base64")}`);
  assert.equal(seen.init.body, JSON.stringify({ amount: 100 }));

  const badFetch = async () => ({
    ok: false,
    status: 400,
    json: async () => ({ error: { description: "The amount must be at least INR 1.00" } }),
  });
  await assert.rejects(
    razorpayRequest({ keyId: "k", keySecret: "s", method: "POST", path: "/v1/orders", fetchImpl: badFetch }),
    /at least INR 1.00/,
  );
});
