import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { hasConfig } from "../services/firebase";
import { ensureUserProfile, getUserProfile, updateUserActivity } from "../services/userProfiles";

const WishlistContext = createContext(null);
const WISHLIST_KEY = "saurene_wishlist";
const WISHLIST_BY_USER_KEY = "saurene_wishlist_by_user_v1";

function normalizeUserStorageKey(user) {
  const email = user?.email?.trim().toLowerCase();
  if (email) return email;
  const username = user?.username?.trim().toLowerCase();
  if (username) return username;
  const uid = user?.uid?.trim().toLowerCase();
  if (uid) return uid;
  return "guest";
}

function readWishlistMap() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_BY_USER_KEY) || "{}");
  } catch {
    return {};
  }
}

function readLegacyWishlist() {
  try {
    return JSON.parse(localStorage.getItem(WISHLIST_KEY) || "[]");
  } catch {
    return [];
  }
}

function hasStoredWishlistMapData(wishlistMap) {
  return Boolean(wishlistMap && typeof wishlistMap === "object" && Object.keys(wishlistMap).length);
}

function mergeWishlistItems(baseItems = [], incomingItems = []) {
  const map = new Map();
  [...baseItems, ...incomingItems].forEach((item) => {
    if (!item?.id) return;
    if (!map.has(item.id)) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userStorageKey = normalizeUserStorageKey(user);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function hydrateWishlist() {
      const wishlistMap = readWishlistMap();
      const legacyWishlist = readLegacyWishlist();

      // One-time migration from legacy key only when map is truly empty.
      if (!hasStoredWishlistMapData(wishlistMap) && !Array.isArray(wishlistMap.guest)) {
        if (legacyWishlist.length) {
          wishlistMap.guest = legacyWishlist;
        }
      }

      const currentItems = Array.isArray(wishlistMap[userStorageKey]) ? wishlistMap[userStorageKey] : [];
      const guestItems = Array.isArray(wishlistMap.guest) ? wishlistMap.guest : [];

      if (hasConfig && user?.uid && userStorageKey !== "guest") {
        try {
          const profile = await getUserProfile(user.uid);
          const cloudItems = Array.isArray(profile?.wishlistItems) ? profile.wishlistItems : [];
          const baseItems = cloudItems.length ? cloudItems : currentItems;
          const nextItems = guestItems.length ? mergeWishlistItems(baseItems, guestItems) : baseItems;

          if (!isMounted) return;
          setWishlistItems(nextItems);
          wishlistMap[userStorageKey] = nextItems;
          wishlistMap.guest = [];
          localStorage.setItem(WISHLIST_BY_USER_KEY, JSON.stringify(wishlistMap));
          localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistMap.guest || []));
          await ensureUserProfile(user);
          await updateUserActivity(user, { wishlistItems: nextItems });
          setIsHydrated(true);
          return;
        } catch {
          // Fall back to local behavior if Firestore read fails.
        }
      }

      let nextItems = currentItems;
      if (userStorageKey !== "guest" && guestItems.length) {
        nextItems = mergeWishlistItems(currentItems, guestItems);
        wishlistMap[userStorageKey] = nextItems;
        wishlistMap.guest = [];
        localStorage.setItem(WISHLIST_BY_USER_KEY, JSON.stringify(wishlistMap));
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistMap.guest || []));
      } else {
        localStorage.setItem(WISHLIST_BY_USER_KEY, JSON.stringify(wishlistMap));
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistMap.guest || []));
      }

      if (!isMounted) return;
      setWishlistItems(nextItems);
      setIsHydrated(true);
    }

    setIsHydrated(false);
    hydrateWishlist();
    return () => {
      isMounted = false;
    };
  }, [userStorageKey]);

  useEffect(() => {
    if (!isHydrated) return;
    const wishlistMap = readWishlistMap();
    wishlistMap[userStorageKey] = wishlistItems;
    localStorage.setItem(WISHLIST_BY_USER_KEY, JSON.stringify(wishlistMap));
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlistMap.guest || []));

    if (hasConfig && user?.uid && userStorageKey !== "guest") {
      ensureUserProfile(user).catch(() => {});
      updateUserActivity(user, { wishlistItems }).catch(() => {});
    }
  }, [wishlistItems, isHydrated, user, userStorageKey]);

  function toggleWishlist(product) {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      return [...prev, product];
    });
  }

  function isWishlisted(productId) {
    return wishlistItems.some((item) => item.id === productId);
  }

  const value = useMemo(
    () => ({
      wishlistItems,
      wishlistCount: wishlistItems.length,
      toggleWishlist,
      isWishlisted
    }),
    [wishlistItems]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
}
