import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  signInWithPhoneNumber,
  updateProfile
} from "firebase/auth";
import { auth, googleProvider, hasConfig } from "../services/firebase";
import { ensureUserProfile } from "../services/userProfiles";

const AuthContext = createContext(null);
const USER_KEY = "saurene_user_v2";
const ACCOUNTS_KEY = "saurene_accounts_v2";

function readAccounts() {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  useEffect(() => {
    if (!hasConfig || !auth) {
      // Ignore legacy local auth keys from previous builds.
      localStorage.removeItem("saurene_user");
      const localUser = localStorage.getItem(USER_KEY);
      setUser(localUser ? JSON.parse(localUser) : null);
      setIsAdmin(
        Boolean(
          localUser &&
            (() => {
              try {
                const parsed = JSON.parse(localUser);
                const normalizedUserEmail = parsed?.email?.trim?.().toLowerCase?.() || "";
                return (
                  parsed?.role === "admin" ||
                  Boolean(normalizedUserEmail && adminEmails.includes(normalizedUserEmail))
                );
              } catch {
                return false;
              }
            })()
        )
      );
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      if (!nextUser) {
        setUser(null);
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      setUser(nextUser);
      try {
        const normalizedUserEmail = nextUser?.email?.trim().toLowerCase() || "";
        const adminByEnv = Boolean(normalizedUserEmail && adminEmails.includes(normalizedUserEmail));
        const profile = await ensureUserProfile(nextUser, {
          role: adminByEnv ? "admin" : "user"
        });
        setIsAdmin(Boolean(profile?.role === "admin" || adminByEnv));
      } catch {
        const normalizedUserEmail = nextUser?.email?.trim().toLowerCase() || "";
        setIsAdmin(Boolean(normalizedUserEmail && adminEmails.includes(normalizedUserEmail)));
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, [adminEmails]);

  async function register(name, email, password, phone) {
    if (!hasConfig || !auth) {
      const normalizedEmail = email.trim().toLowerCase();
      const accounts = readAccounts();
      if (accounts.some((account) => account.email === normalizedEmail)) {
        throw new Error("This email is already registered.");
      }
      const localAccount = {
        uid: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        phone: (phone || "").trim(),
        password
      };
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([localAccount, ...accounts]));
      return { requiresEmailVerification: false };
    }
    const creds = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(creds.user, { displayName: name.trim() });
    const normalizedEmail = email.trim().toLowerCase();
    const adminByEnv = adminEmails.includes(normalizedEmail);
    await ensureUserProfile(creds.user, {
      name: name.trim(),
      email: email.trim(),
      phone: (phone || "").trim(),
      role: adminByEnv ? "admin" : "user"
    });
    return { requiresEmailVerification: false };
  }

  async function login(identifier, password) {
    if (!hasConfig || !auth) {
      const normalizedIdentifier = identifier.trim().toLowerCase();

      const account = readAccounts().find(
        (saved) => saved.email === normalizedIdentifier && saved.password === password
      );

      if (!account) {
        throw new Error("Invalid credentials.");
      }

      const localUser = {
        uid: account.uid,
        name: account.name,
        email: account.email,
        phone: account.phone || "",
        role: "user"
      };
      localStorage.setItem(USER_KEY, JSON.stringify(localUser));
      setUser(localUser);
      return localUser;
    }
    const creds = await signInWithEmailAndPassword(auth, identifier, password);
    const normalizedUserEmail = creds.user?.email?.trim().toLowerCase() || "";
    const adminByEnv = Boolean(normalizedUserEmail && adminEmails.includes(normalizedUserEmail));
    await ensureUserProfile(creds.user, { role: adminByEnv ? "admin" : "user" });
    return creds.user;
  }

  async function loginWithGoogle() {
    if (!hasConfig || !auth) {
      throw new Error("Google login requires Firebase configuration.");
    }
    const creds = await signInWithPopup(auth, googleProvider);
    const normalizedUserEmail = creds.user?.email?.trim().toLowerCase() || "";
    const adminByEnv = Boolean(normalizedUserEmail && adminEmails.includes(normalizedUserEmail));
    await ensureUserProfile(creds.user, { role: adminByEnv ? "admin" : "user" });
    return creds.user;
  }

  async function loginWithPhone(phoneNumber, verifier) {
    if (!hasConfig || !auth) {
      throw new Error("Phone OTP requires Firebase configuration.");
    }
    return signInWithPhoneNumber(auth, phoneNumber, verifier);
  }

  async function logout() {
    if (!hasConfig || !auth) {
      localStorage.removeItem(USER_KEY);
      setUser(null);
      return;
    }
    await signOut(auth);
  }

  async function resetPassword(email) {
    if (!hasConfig || !auth) {
      throw new Error("Password reset requires Firebase configuration.");
    }
    await sendPasswordResetEmail(auth, email);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        register,
        login,
        loginWithGoogle,
        loginWithPhone,
        resetPassword,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
