import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc } from "firebase/firestore";
import { db, hasConfig } from "./firebase";

function normalizeEmail(email = "") {
  return String(email).trim().toLowerCase();
}

function normalizePhone(phone = "") {
  return String(phone).replace(/\D/g, "").slice(0, 10);
}

function normalizeList(items) {
  return Array.isArray(items) ? items : [];
}

function normalizeUserDoc(id, data = {}) {
  return {
    id,
    uid: data.uid || id,
    email: normalizeEmail(data.email || ""),
    name: data.name || "Customer",
    phone: normalizePhone(data.phone || ""),
    role: data.role || "user",
    cartItems: normalizeList(data.cartItems),
    wishlistItems: normalizeList(data.wishlistItems)
  };
}

export async function ensureUserProfile(firebaseUser, extra = {}) {
  if (!hasConfig || !db || !firebaseUser?.uid) return null;

  const userRef = doc(db, "users", firebaseUser.uid);
  const snapshot = await getDoc(userRef);
  const existing = snapshot.exists() ? snapshot.data() : {};

  const email = normalizeEmail(extra.email || firebaseUser.email || existing.email || "");
  const name = String(extra.name || firebaseUser.displayName || existing.name || "Saurene User").trim();
  const phone = normalizePhone(extra.phone || existing.phone || "");
  const role =
    existing.role === "admin" || extra.role === "admin"
      ? "admin"
      : existing.role || extra.role || "user";

  const payload = {
    uid: firebaseUser.uid,
    email,
    name: name || "Saurene User",
    phone,
    role,
    updatedAt: serverTimestamp()
  };

  if (!snapshot.exists()) {
    payload.createdAt = serverTimestamp();
  }

  await setDoc(userRef, payload, { merge: true });

  return normalizeUserDoc(firebaseUser.uid, {
    ...existing,
    ...payload
  });
}

export async function getUserProfile(uid) {
  if (!hasConfig || !db || !uid) return null;
  const snapshot = await getDoc(doc(db, "users", uid));
  if (!snapshot.exists()) return null;
  return normalizeUserDoc(snapshot.id, snapshot.data());
}

export async function updateUserActivity(firebaseUser, updates = {}) {
  if (!hasConfig || !db || !firebaseUser?.uid) return;
  const payload = {
    ...updates,
    updatedAt: serverTimestamp()
  };
  await setDoc(doc(db, "users", firebaseUser.uid), payload, { merge: true });
}

export async function getCustomerActivityProfiles() {
  if (!hasConfig || !db) return [];
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs
    .map((entry) => normalizeUserDoc(entry.id, entry.data()))
    .filter((profile) => profile.role !== "admin")
    .sort((a, b) => a.email.localeCompare(b.email));
}
