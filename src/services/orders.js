import {
  addDoc,
  collection,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db, hasConfig } from "./firebase";

const ORDER_KEY = "saurene_orders";
export const ORDER_STATUSES = [
  "Order Placed",
  "Order Accepted",
  "Order Ready to Ship",
  "Order Shipped",
  "Order Delivered"
];

function toIsoString(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value?.toDate === "function") return value.toDate().toISOString();
  return String(value);
}

function normalizeOrderFromFirestore(id, data = {}) {
  return {
    ...data,
    firestoreDocId: id,
    createdAt: toIsoString(data.createdAt),
    statusUpdatedAt: toIsoString(data.statusUpdatedAt)
  };
}

function readOrders() {
  try {
    const parsed = JSON.parse(localStorage.getItem(ORDER_KEY) || "[]");
    const cleaned = Array.isArray(parsed)
      ? parsed.filter(
          (order) =>
            !String(order?.id || "").startsWith("test_order_") &&
            !String(order?.paymentId || "").startsWith("test_payment_")
        )
      : [];
    if (cleaned.length !== (Array.isArray(parsed) ? parsed.length : 0)) {
      localStorage.setItem(ORDER_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function writeOrders(orders) {
  localStorage.setItem(ORDER_KEY, JSON.stringify(Array.isArray(orders) ? orders : []));
}

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
}

function createInvoiceId() {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `INV-${Date.now()}-${random}`;
}

function sortOrdersDesc(orders) {
  return [...orders].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });
}

export async function saveOrder(order) {
  const now = new Date();
  const normalizedEmail = normalizeEmail(order.userEmail);
  const normalizedOrder = {
    ...order,
    userEmail: normalizedEmail || "unknown",
    createdAt: now.toISOString(),
    deliveryWindow: "7-8 working days",
    invoiceId: order.invoiceId || createInvoiceId(),
    orderStatus: order.orderStatus || "Order Placed",
    trackingId: order.trackingId || "",
    statusUpdatedAt: now.toISOString()
  };

  const localOrders = readOrders();
  writeOrders([normalizedOrder, ...localOrders]);

  if (hasConfig && db) {
    const docRef = await addDoc(collection(db, "orders"), {
      ...normalizedOrder,
      createdAt: serverTimestamp(),
      statusUpdatedAt: serverTimestamp(),
      deliveryWindow: "7-8 working days"
    });
    return { ...normalizedOrder, firestoreDocId: docRef.id };
  }

  return normalizedOrder;
}

export async function getOrdersForUser(userEmail = "") {
  const normalizedEmail = normalizeEmail(userEmail);
  if (!normalizedEmail) return [];

  if (hasConfig && db) {
    try {
      const orderQuery = query(collection(db, "orders"), where("userEmail", "==", normalizedEmail));
      const snapshot = await getDocs(orderQuery);
      const orders = snapshot.docs.map((entry) =>
        normalizeOrderFromFirestore(entry.id, entry.data())
      );
      const sorted = sortOrdersDesc(orders);
      writeOrders(sorted);
      return sorted;
    } catch {
      // Fall back to local storage.
    }
  }

  return sortOrdersDesc(readOrders().filter((order) => normalizeEmail(order.userEmail) === normalizedEmail));
}

export async function getAllOrders() {
  if (hasConfig && db) {
    try {
      const snapshot = await getDocs(collection(db, "orders"));
      const orders = snapshot.docs.map((entry) =>
        normalizeOrderFromFirestore(entry.id, entry.data())
      );
      const sorted = sortOrdersDesc(orders);
      writeOrders(sorted);
      return sorted;
    } catch {
      // Fall back to local storage.
    }
  }
  return sortOrdersDesc(readOrders());
}

export function getLocalOrders(userEmail = "") {
  const orders = sortOrdersDesc(readOrders());
  const normalizedEmail = normalizeEmail(userEmail);
  if (!normalizedEmail) return orders;
  return orders.filter((order) => normalizeEmail(order.userEmail) === normalizedEmail);
}

export async function updateOrder(invoiceId, updates) {
  if (!invoiceId) return null;
  const nextStatusUpdatedAt = new Date().toISOString();
  const mergedUpdates = {
    ...updates,
    statusUpdatedAt: nextStatusUpdatedAt
  };

  const localOrders = readOrders();
  let updatedLocalOrder = null;
  const nextLocalOrders = localOrders.map((order) => {
    if ((order.invoiceId || "") !== (invoiceId || "")) return order;
    updatedLocalOrder = {
      ...order,
      ...mergedUpdates
    };
    return updatedLocalOrder;
  });
  writeOrders(nextLocalOrders);

  if (hasConfig && db) {
    try {
      const orderQuery = query(
        collection(db, "orders"),
        where("invoiceId", "==", invoiceId),
        limit(1)
      );
      const snapshot = await getDocs(orderQuery);
      if (!snapshot.empty) {
        const orderDoc = snapshot.docs[0];
        await updateDoc(orderDoc.ref, {
          ...updates,
          statusUpdatedAt: serverTimestamp()
        });
        const latest = normalizeOrderFromFirestore(orderDoc.id, {
          ...orderDoc.data(),
          ...mergedUpdates
        });
        return latest;
      }
    } catch {
      // Fall back to local update result.
    }
  }

  return updatedLocalOrder;
}

export async function updateLocalOrder(invoiceId, updates) {
  return updateOrder(invoiceId, updates);
}
