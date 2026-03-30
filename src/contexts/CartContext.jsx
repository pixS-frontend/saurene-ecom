import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { hasConfig } from "../services/firebase";
import { ensureUserProfile, getUserProfile, updateUserActivity } from "../services/userProfiles";

const CartContext = createContext(null);
const CART_KEY = "saurene_cart";
const CART_BY_USER_KEY = "saurene_cart_by_user_v1";

function buildVariantKey(id, size, selectedOptions = {}) {
  const optionParts = Object.entries(selectedOptions)
    .filter(([, value]) => value)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}:${value}`);

  return `${id}|${size}|${optionParts.join("|")}`;
}

function readCartMap() {
  try {
    return JSON.parse(localStorage.getItem(CART_BY_USER_KEY) || "{}");
  } catch {
    return {};
  }
}

function readLegacyCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function hasStoredCartMapData(cartMap) {
  return Boolean(cartMap && typeof cartMap === "object" && Object.keys(cartMap).length);
}

function normalizeUserStorageKey(user) {
  const email = user?.email?.trim().toLowerCase();
  if (email) return email;
  const username = user?.username?.trim().toLowerCase();
  if (username) return username;
  const uid = user?.uid?.trim().toLowerCase();
  if (uid) return uid;
  return "guest";
}

function mergeCartItems(baseItems = [], incomingItems = []) {
  const map = new Map();

  [...baseItems, ...incomingItems].forEach((item) => {
    const variantKey =
      item.variantKey || buildVariantKey(item.id, item.size || "M", item.selectedOptions || {});
    if (!map.has(variantKey)) {
      map.set(variantKey, { ...item, variantKey, quantity: Number(item.quantity || 1) });
      return;
    }
    const existing = map.get(variantKey);
    map.set(variantKey, {
      ...existing,
      quantity: Number(existing.quantity || 1) + Number(item.quantity || 1)
    });
  });

  return Array.from(map.values());
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userStorageKey = normalizeUserStorageKey(user);
  const [cartItems, setCartItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateCart() {
      const cartMap = readCartMap();
      const legacyCart = readLegacyCart();

      // One-time migration from legacy key only when map is truly empty.
      if (!hasStoredCartMapData(cartMap) && !Array.isArray(cartMap.guest)) {
        if (legacyCart.length) {
          cartMap.guest = legacyCart;
        }
      }

      const currentItems = Array.isArray(cartMap[userStorageKey]) ? cartMap[userStorageKey] : [];
      const guestItems = Array.isArray(cartMap.guest) ? cartMap.guest : [];

      if (hasConfig && user?.uid && userStorageKey !== "guest") {
        try {
          const profile = await getUserProfile(user.uid);
          const cloudItems = Array.isArray(profile?.cartItems) ? profile.cartItems : [];
          const baseItems = cloudItems.length ? cloudItems : currentItems;
          const nextItems = guestItems.length ? mergeCartItems(baseItems, guestItems) : baseItems;

          if (!isMounted) return;
          setCartItems(nextItems);
          cartMap[userStorageKey] = nextItems;
          cartMap.guest = [];
          localStorage.setItem(CART_BY_USER_KEY, JSON.stringify(cartMap));
          localStorage.setItem(CART_KEY, JSON.stringify(cartMap.guest || []));
          await ensureUserProfile(user);
          await updateUserActivity(user, { cartItems: nextItems });
          setIsHydrated(true);
          return;
        } catch {
          // Fall back to local behavior if Firestore read fails.
        }
      }

      let nextItems = currentItems;
      if (userStorageKey !== "guest" && guestItems.length) {
        nextItems = mergeCartItems(currentItems, guestItems);
        cartMap[userStorageKey] = nextItems;
        cartMap.guest = [];
        localStorage.setItem(CART_BY_USER_KEY, JSON.stringify(cartMap));
        localStorage.setItem(CART_KEY, JSON.stringify(cartMap.guest || []));
      } else {
        localStorage.setItem(CART_BY_USER_KEY, JSON.stringify(cartMap));
        localStorage.setItem(CART_KEY, JSON.stringify(cartMap.guest || []));
      }

      if (!isMounted) return;
      setCartItems(nextItems);
      setIsHydrated(true);
    }

    setIsHydrated(false);
    hydrateCart();
    return () => {
      isMounted = false;
    };
  }, [userStorageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    const cartMap = readCartMap();
    cartMap[userStorageKey] = cartItems;
    localStorage.setItem(CART_BY_USER_KEY, JSON.stringify(cartMap));
    localStorage.setItem(CART_KEY, JSON.stringify(cartMap.guest || []));

    if (hasConfig && user?.uid && userStorageKey !== "guest") {
      ensureUserProfile(user).catch(() => {});
      updateUserActivity(user, { cartItems }).catch(() => {});
    }
  }, [cartItems, isHydrated, user, userStorageKey]);

  function addToCart(product, size = "M", selectedOptions = {}) {
    setCartItems((prev) => {
      const variantKey = buildVariantKey(product.id, size, selectedOptions);
      const existing = prev.find(
        (item) =>
          (item.variantKey || buildVariantKey(item.id, item.size, item.selectedOptions)) === variantKey
      );
      if (existing) {
        return prev.map((item) =>
          (item.variantKey || buildVariantKey(item.id, item.size, item.selectedOptions)) === variantKey
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, size, selectedOptions, variantKey, quantity: 1 }];
    });
  }

  function removeFromCart(id, size, variantKey) {
    setCartItems((prev) =>
      prev.filter((item) => {
        const itemVariantKey = item.variantKey || buildVariantKey(item.id, item.size, item.selectedOptions);
        return variantKey ? itemVariantKey !== variantKey : !(item.id === id && item.size === size);
      })
    );
  }

  function updateQuantity(id, size, quantity, variantKey) {
    if (quantity <= 0) {
      removeFromCart(id, size, variantKey);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        (variantKey
          ? (item.variantKey || buildVariantKey(item.id, item.size, item.selectedOptions)) === variantKey
          : item.id === id && item.size === size)
          ? { ...item, quantity }
          : item
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);

  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const value = {
    cartItems,
    cartCount,
    cartSubtotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
