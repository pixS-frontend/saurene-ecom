import { useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { RecaptchaVerifier, auth, hasConfig } from "../services/firebase";

function mapAuthError(error, fallbackMessage) {
  const code = error?.code || "";
  const map = {
    "auth/invalid-email": "Invalid email format.",
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password is too weak. Use at least 6 characters.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/popup-closed-by-user": "Google login popup was closed.",
    "auth/network-request-failed": "Network error. Check your connection and try again."
  };
  return map[code] || error?.message || fallbackMessage;
}

export default function LoginPage() {
  const { login, register, loginWithGoogle, loginWithPhone, resetPassword } = useAuth();
  const isPhoneOtpEnabled = import.meta.env.VITE_ENABLE_PHONE_OTP === "true";
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [signupPhone, setSignupPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpPhone, setOtpPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const verifierRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const redirectPath = location.state?.from || "/account";

  async function handleEmailAuth(event) {
    event.preventDefault();
    setError("");
    setInfo("");
    if (mode === "login") {
      if (!identifier.trim()) {
        setError("Please enter your email.");
        return;
      }
    } else {
      if (name.trim().length < 2) {
        setError("Please enter your name.");
        return;
      }
      if (!/^\d{10}$/.test(signupPhone)) {
        setError("Signup mobile number must be exactly 10 digits.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && password !== confirmPassword) {
      setError("Password and confirm password must match.");
      return;
    }
    setIsLoading(true);
    try {
      if (mode === "login") {
        await login(identifier, password);
        setInfo("");
        navigate(redirectPath, { replace: true });
      } else {
        await register(name, email, password, signupPhone);
        setInfo("Account created successfully. Please login.");
        setMode("login");
        setIdentifier(email.trim());
        setPassword("");
        setConfirmPassword("");
        setSignupPhone("");
        return;
      }
    } catch (authError) {
      setError(mapAuthError(authError, "Authentication failed."));
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setError("");
    setInfo("");
    setIsLoading(true);
    try {
      await loginWithGoogle();
      navigate(redirectPath, { replace: true });
    } catch (authError) {
      setError(mapAuthError(authError, "Google login failed."));
    } finally {
      setIsLoading(false);
    }
  }

  async function sendOtp() {
    setError("");
    setInfo("");
    try {
      if (!isPhoneOtpEnabled) {
        throw new Error("Phone OTP login is temporarily disabled.");
      }
      if (!/^\d{10}$/.test(otpPhone)) {
        throw new Error("Mobile number must be exactly 10 digits.");
      }
      if (!hasConfig || !auth) {
        throw new Error("Phone OTP requires Firebase setup.");
      }
      if (!verifierRef.current) {
        verifierRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible"
        });
      }
      const result = await loginWithPhone(`+91${otpPhone}`, verifierRef.current);
      setConfirmationResult(result);
    } catch (otpError) {
      setError(mapAuthError(otpError, "Unable to send OTP."));
    }
  }

  async function verifyOtp() {
    setError("");
    setInfo("");
    try {
      if (!isPhoneOtpEnabled) {
        throw new Error("Phone OTP login is temporarily disabled.");
      }
      if (!/^\d{6}$/.test(otp)) {
        throw new Error("OTP must be 6 digits.");
      }
      if (!confirmationResult) return;
      await confirmationResult.confirm(otp);
      navigate(redirectPath, { replace: true });
    } catch (verifyError) {
      setError(mapAuthError(verifyError, "Invalid OTP."));
    }
  }

  async function handleForgotPassword() {
    setError("");
    setInfo("");
    try {
      const resetEmail = mode === "signup" ? email.trim() : identifier.trim();
      if (!resetEmail) {
        throw new Error("Enter your email address first.");
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetEmail)) {
        throw new Error("Please enter a valid email address.");
      }
      await resetPassword(resetEmail);
      setInfo("Password reset email sent. Please check your inbox.");
    } catch (resetError) {
      setError(mapAuthError(resetError, "Unable to send password reset email."));
    }
  }

  return (
    <div className="container-pad section-space">
      <div className="mx-auto max-w-lg rounded-3xl bg-white p-5 shadow-lg sm:p-8">
        <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="mt-2 text-sm text-brand-charcoal/70">
          Guest checkout is disabled. Please sign in to continue.
        </p>

        <div className="mt-6 flex rounded-md bg-brand-sand/40 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${
              mode === "login" ? "bg-brand-wine text-white" : "text-brand-wine"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-semibold ${
              mode === "signup" ? "bg-brand-wine text-white" : "text-brand-wine"
            }`}
          >
            Sign up
          </button>
        </div>

        <form onSubmit={handleEmailAuth} className="mt-6 space-y-3">
          {mode === "signup" ? (
            <>
              <input
                required
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-brand-sand px-4 py-3"
              />
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email"
                className="w-full rounded-xl border border-brand-sand px-4 py-3"
              />
              <input
                required
                type="text"
                value={signupPhone}
                onChange={(event) => setSignupPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="Mobile number (10 digits)"
                inputMode="numeric"
                maxLength={10}
                className="w-full rounded-xl border border-brand-sand px-4 py-3"
              />
            </>
          ) : (
            <input
              required
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Email address"
              className="w-full rounded-xl border border-brand-sand px-4 py-3"
            />
          )}
          <div className="relative">
            <input
              required
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-brand-sand px-4 py-3 pr-16"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-wine"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {mode === "signup" ? (
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                className="w-full rounded-xl border border-brand-sand px-4 py-3 pr-16"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((current) => !current)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-wine"
              >
                {showConfirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          ) : null}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-brand-wine px-4 py-3 text-sm font-semibold text-white disabled:opacity-70"
          >
            {isLoading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
          {mode === "login" ? (
            <button
              type="button"
              onClick={handleForgotPassword}
              className="w-full rounded-md border border-brand-wine px-4 py-3 text-sm font-semibold text-brand-wine"
            >
              Forgot password
            </button>
          ) : null}
        </form>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-3 w-full rounded-md border border-brand-wine px-4 py-3 text-sm font-semibold text-brand-wine"
        >
          Continue with Google
        </button>

        <div className="mt-6 rounded-2xl border border-brand-sand/70 p-4">
          <p className="text-sm font-semibold text-brand-charcoal/75">Phone OTP login</p>
          {!isPhoneOtpEnabled ? (
            <p className="mt-1 text-xs text-brand-charcoal/60">
              Phone OTP is temporarily unavailable. Please use email or Google login.
            </p>
          ) : null}
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <span className="inline-flex items-center rounded-xl border border-brand-sand bg-brand-ivory/70 px-4 py-2 text-sm font-semibold text-brand-charcoal/70">
              +91
            </span>
            <input
              value={otpPhone}
              onChange={(event) => setOtpPhone(event.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              maxLength={10}
              placeholder="10-digit mobile number"
              disabled={!isPhoneOtpEnabled}
              className="flex-1 rounded-xl border border-brand-sand px-4 py-2 disabled:cursor-not-allowed disabled:bg-brand-sand/20 disabled:text-brand-charcoal/50"
            />
            <button
              type="button"
              onClick={sendOtp}
              disabled={!isPhoneOtpEnabled}
              className="rounded-xl bg-brand-wine px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-brand-wine/45"
            >
              Send OTP
            </button>
          </div>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              placeholder="Enter OTP"
              disabled={!isPhoneOtpEnabled}
              className="flex-1 rounded-xl border border-brand-sand px-4 py-2 disabled:cursor-not-allowed disabled:bg-brand-sand/20 disabled:text-brand-charcoal/50"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={!isPhoneOtpEnabled}
              className="rounded-xl border border-brand-wine px-4 py-2 text-sm font-semibold text-brand-wine disabled:cursor-not-allowed disabled:border-brand-wine/40 disabled:text-brand-wine/45"
            >
              Verify
            </button>
          </div>
          <div id="recaptcha-container" />
        </div>

        {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
        {info ? <p className="mt-3 text-sm text-emerald-700">{info}</p> : null}
      </div>
    </div>
  );
}
