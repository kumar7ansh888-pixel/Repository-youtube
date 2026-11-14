"use strict";

// Checks the promises made by ../firestore.rules against the Firestore
// emulator. Run with:  npm test   (inside this folder)

const test = require("node:test");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  collection,
  query,
  where,
  Timestamp,
} = require("firebase/firestore");

const DAY = 24 * 60 * 60 * 1000;
let env;

test.before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-udan",
    firestore: { rules: readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8") },
  });
});

test.after(async () => {
  await env.cleanup();
});

test.beforeEach(async () => {
  await env.clearFirestore();
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore();
    await setDoc(doc(db, "admins/teacher"), {});
    await setDoc(doc(db, "courses/c10"), { title: "Class 10", published: true, plans: [] });
    await setDoc(doc(db, "courses/draft"), { title: "Draft", published: false, plans: [] });
    await setDoc(doc(db, "courses/c10/subjects/maths"), { name: "Maths", sortOrder: 1 });
    await setDoc(doc(db, "courses/c10/subjects/maths/items/free1"), { title: "Demo", isFree: true });
    await setDoc(doc(db, "courses/c10/subjects/maths/items/paid1"), { title: "Paid", isFree: false });
    await setDoc(doc(db, "courses/draft/subjects/s/items/x"), { title: "x", isFree: true });
    await setDoc(doc(db, "courses/hidden"), { title: "Old batch", published: false, plans: [] });
    await setDoc(doc(db, "courses/hidden/subjects/s"), { name: "Maths" });
    await setDoc(doc(db, "courses/hidden/subjects/s/items/paid"), { title: "Paid", isFree: false });
    await setDoc(doc(db, "enrollments/paidstudent_hidden"), {
      uid: "paidstudent",
      courseId: "hidden",
      expiresAt: Timestamp.fromMillis(Date.now() + 30 * DAY),
    });
    await setDoc(doc(db, "users/riya"), { name: "Riya", phone: "+919876543210" });
    await setDoc(doc(db, "enrollments/paidstudent_c10"), {
      uid: "paidstudent",
      courseId: "c10",
      expiresAt: Timestamp.fromMillis(Date.now() + 30 * DAY),
    });
    await setDoc(doc(db, "enrollments/expiredstudent_c10"), {
      uid: "expiredstudent",
      courseId: "c10",
      expiresAt: Timestamp.fromMillis(Date.now() - DAY),
    });
    await setDoc(doc(db, "orders/order_1"), { uid: "riya", courseId: "c10", status: "created" });
  });
});

const as = (uid) => env.authenticatedContext(uid).firestore();
const guest = () => env.unauthenticatedContext().firestore();
const items = (db) => collection(db, "courses/c10/subjects/maths/items");

test("anyone can see published batches, only admins see drafts", async () => {
  await assertSucceeds(getDoc(doc(guest(), "courses/c10")));
  await assertSucceeds(getDocs(query(collection(guest(), "courses"), where("published", "==", true))));
  await assertFails(getDoc(doc(guest(), "courses/draft")));
  await assertFails(getDocs(collection(as("riya"), "courses")));
  await assertSucceeds(getDocs(collection(as("teacher"), "courses")));
});

test("students cannot change batches or content", async () => {
  await assertFails(setDoc(doc(as("riya"), "courses/c10"), { title: "hacked", published: true }));
  await assertFails(setDoc(doc(as("riya"), "courses/c10/subjects/maths/items/new"), { isFree: true }));
  await assertSucceeds(setDoc(doc(as("teacher"), "courses/new"), { title: "New", published: false }));
  await assertSucceeds(setDoc(doc(as("teacher"), "courses/c10/subjects/maths/items/new"), { isFree: false }));
});

test("without buying, a student only gets free demo items", async () => {
  const db = as("riya");
  await assertSucceeds(getDocs(query(items(db), where("isFree", "==", true))));
  await assertSucceeds(getDoc(doc(db, "courses/c10/subjects/maths/items/free1")));
  await assertFails(getDocs(items(db)));
  await assertFails(getDoc(doc(db, "courses/c10/subjects/maths/items/paid1")));
  await assertFails(getDocs(query(items(guest()), where("isFree", "==", true))));
});

test("an active enrollment unlocks everything, an expired one does not", async () => {
  await assertSucceeds(getDocs(items(as("paidstudent"))));
  await assertSucceeds(getDoc(doc(as("paidstudent"), "courses/c10/subjects/maths/items/paid1")));
  await assertFails(getDocs(items(as("expiredstudent"))));
  await assertFails(getDoc(doc(as("expiredstudent"), "courses/c10/subjects/maths/items/paid1")));
  await assertSucceeds(getDocs(items(as("teacher"))));
});

test("students who paid keep access after the batch is hidden", async () => {
  const db = as("paidstudent");
  await assertSucceeds(getDoc(doc(db, "courses/hidden")));
  await assertSucceeds(getDocs(collection(db, "courses/hidden/subjects")));
  await assertSucceeds(getDocs(collection(db, "courses/hidden/subjects/s/items")));
  await assertFails(getDoc(doc(as("riya"), "courses/hidden")));
  await assertFails(getDocs(collection(as("riya"), "courses/hidden/subjects")));
});

test("subjects of published batches are visible to logged-in students", async () => {
  await assertSucceeds(getDocs(collection(as("riya"), "courses/c10/subjects")));
  await assertFails(getDocs(collection(guest(), "courses/c10/subjects")));
  await assertFails(getDocs(collection(as("riya"), "courses/draft/subjects")));
});

test("students can never give themselves access", async () => {
  const db = as("riya");
  const forever = Timestamp.fromMillis(Date.now() + 3650 * DAY);
  await assertFails(setDoc(doc(db, "enrollments/riya_c10"), { uid: "riya", courseId: "c10", expiresAt: forever }));
  await assertFails(updateDoc(doc(as("expiredstudent"), "enrollments/expiredstudent_c10"), { expiresAt: forever }));
  await assertFails(setDoc(doc(db, "orders/order_1"), { status: "paid" }));
  await assertFails(setDoc(doc(db, "admins/riya"), {}));
  await assertSucceeds(
    setDoc(doc(as("teacher"), "enrollments/riya_c10"), { uid: "riya", courseId: "c10", expiresAt: forever }),
  );
});

test("students read only their own enrollments and orders", async () => {
  // Own enrollment that does not exist yet must not be a permission error.
  await assertSucceeds(getDoc(doc(as("riya"), "enrollments/riya_c10")));
  await assertSucceeds(getDoc(doc(as("paidstudent"), "enrollments/paidstudent_c10")));
  await assertSucceeds(getDocs(query(collection(as("paidstudent"), "enrollments"), where("uid", "==", "paidstudent"))));
  await assertFails(getDoc(doc(as("riya"), "enrollments/paidstudent_c10")));
  await assertFails(getDocs(collection(as("riya"), "enrollments")));
  await assertSucceeds(getDocs(query(collection(as("teacher"), "enrollments"), where("courseId", "==", "c10"))));
  await assertSucceeds(getDoc(doc(as("riya"), "orders/order_1")));
  await assertFails(getDoc(doc(as("paidstudent"), "orders/order_1")));
});

test("profiles: own profile only, no extra fields", async () => {
  await assertSucceeds(setDoc(doc(as("aman"), "users/aman"), { name: "Aman", phone: "+919000000000", className: "Class 10" }));
  await assertFails(setDoc(doc(as("aman"), "users/aman"), { name: "Aman", role: "admin" }));
  await assertFails(setDoc(doc(as("aman"), "users/aman"), { name: "" }));
  await assertFails(setDoc(doc(as("aman"), "users/riya"), { name: "Riya" }));
  await assertFails(getDoc(doc(as("aman"), "users/riya")));
  await assertSucceeds(getDoc(doc(as("teacher"), "users/riya")));
  await assertSucceeds(getDocs(query(collection(as("teacher"), "users"), where("phone", "==", "+919876543210"))));
  await assertFails(deleteDoc(doc(as("riya"), "users/riya")));
});

test("test attempts: create and read own, never edit", async () => {
  const db = as("riya");
  await assertSucceeds(setDoc(doc(db, "users/riya/attempts/a1"), { itemId: "t1", score: 7 }));
  await assertSucceeds(getDoc(doc(db, "users/riya/attempts/a1")));
  await assertFails(updateDoc(doc(db, "users/riya/attempts/a1"), { score: 100 }));
  await assertFails(setDoc(doc(as("aman"), "users/riya/attempts/a2"), { itemId: "t1", score: 0 }));
});
