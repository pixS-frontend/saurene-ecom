import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { formatPrice } from "../utils/format";
import { saveOrder } from "../services/orders";

const couponMap = {
  SAURENE10: 10
};
const suggestedCoupons = ["SAURENE10"];
const BUY_NOW_KEY = "saurene_buy_now_checkout_v1";
const CART_SELECTED_KEY = "saurene_selected_cart_items_v1";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function getSelectedColorLabel(item) {
  const selectedColorId = item.selectedOptions?.color;
  if (!selectedColorId) return "";
  const colorValues = item.extraOptions?.color?.values || [];
  return colorValues.find((value) => value.id === selectedColorId)?.label || selectedColorId;
}

function getSelectedOptionsLabel(item) {
  const labels = [];
  if (item.selectedOptions?.sleeve) {
    labels.push(item.selectedOptions.sleeve === "no-sleeve" ? "No Sleeve" : "Sleeve");
  }
  const colorLabel = getSelectedColorLabel(item);
  if (colorLabel) {
    labels.push(colorLabel);
  }
  return labels.length ? ` (${labels.join(", ")})` : "";
}

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cartItems, cartSubtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [buyNowItems, setBuyNowItems] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem(BUY_NOW_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const [selectedCartKeys, setSelectedCartKeys] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CART_SELECTED_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    line1: "",
    city: "",
    state: "",
    pincode: ""
  });
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState("");
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState("");
  const isTestPaymentMode =
    import.meta.env.VITE_ENABLE_TEST_PAYMENT === "true" || !import.meta.env.VITE_RAZORPAY_KEY_ID;

  const selectedCartItems = useMemo(() => {
    if (!selectedCartKeys.length) return cartItems;
    return cartItems.filter((item) => {
      const key = item.variantKey || `${item.id}-${item.size}`;
      return selectedCartKeys.includes(key);
    });
  }, [cartItems, selectedCartKeys]);
  const checkoutItems = buyNowItems.length ? buyNowItems : selectedCartItems;
  const checkoutSubtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [checkoutItems]
  );
  const isBuyNowMode = buyNowItems.length > 0;
  const discountAmount = useMemo(
    () => Math.round((checkoutSubtotal * discountPercent) / 100),
    [checkoutSubtotal, discountPercent]
  );
  const payableTotal = checkoutSubtotal - discountAmount;

  useEffect(() => {
    const savedAddress = localStorage.getItem("saurene_address");
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    }
  }, []);

  useEffect(() => {
    const userName = user?.displayName || user?.name || "";
    if (!userName) return;
    setAddress((current) => {
      if (current.fullName?.trim()) return current;
      return {
        ...current,
        fullName: userName
      };
    });
  }, [user]);

  useEffect(() => {
    localStorage.setItem("saurene_address", JSON.stringify(address));
  }, [address]);

  function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setDiscountPercent(0);
      setAppliedCouponCode("");
      setError("Enter a coupon code to apply.");
      return;
    }
    const discount = couponMap[code] || 0;
    setDiscountPercent(discount);
    if (!discount) {
      setAppliedCouponCode("");
      setError("Invalid coupon code.");
      return;
    }
    setAppliedCouponCode(code);
    setError("");
  }

  function applySuggestedCoupon(code) {
    setCouponCode(code);
    const discount = couponMap[code] || 0;
    setDiscountPercent(discount);
    if (!discount) {
      setAppliedCouponCode("");
      setError("Invalid coupon code.");
      return;
    }
    setAppliedCouponCode(code);
    setError("");
  }

  function validateAddress() {
    if (!address.fullName || !address.phone || !address.line1 || !address.city || !address.pincode) {
      return "Please fill all required address fields.";
    }
    if (!/^[A-Za-z][A-Za-z\s'.-]{1,}$/.test(address.fullName.trim())) {
      return "Please enter a valid full name.";
    }
    if (!/^\d{10}$/.test(address.phone)) {
      return "Mobile number must be exactly 10 digits.";
    }
    if (!/^[A-Za-z][A-Za-z\s'.-]{1,}$/.test(address.city.trim())) {
      return "Please enter a valid city name.";
    }
    if (address.state.trim() && !/^[A-Za-z][A-Za-z\s'.-]{1,}$/.test(address.state.trim())) {
      return "Please enter a valid state name.";
    }
    if (!/^\d{6}$/.test(address.pincode)) {
      return "Pincode must be exactly 6 digits.";
    }
    return "";
  }

  async function placeOrder() {
    if (!checkoutItems.length) {
      setError("No items found for checkout.");
      return;
    }
    const validationError = validateAddress();
    if (validationError) {
      setError(validationError);
      return;
    }
    if (payableTotal <= 0) {
      setError("Order total must be greater than zero.");
      return;
    }
    const typedCoupon = couponCode.trim().toUpperCase();
    if (typedCoupon && appliedCouponCode !== typedCoupon) {
      setError("Please click Apply to use your coupon before payment.");
      return;
    }

    setIsPlacing(true);
    setError("");

    try {
      if (isTestPaymentMode) {
        const order = await saveOrder({
          id: `test_order_${Date.now()}`,
          paymentId: `test_payment_${Date.now()}`,
          userEmail: user?.email || "",
          items: checkoutItems,
          subtotal: checkoutSubtotal,
          discountAmount,
          couponCode: appliedCouponCode || "",
          total: payableTotal,
          address
        });

        sessionStorage.setItem("saurene_last_order", JSON.stringify(order));
        if (isBuyNowMode) {
          sessionStorage.removeItem(BUY_NOW_KEY);
          setBuyNowItems([]);
        } else {
          sessionStorage.removeItem(CART_SELECTED_KEY);
          setSelectedCartKeys([]);
          clearCart();
        }
        navigate("/order-success");
        return;
      }

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load.");
      }

      const orderResponse = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: payableTotal,
          receipt: `saurene_${Date.now()}`
        })
      });

      if (!orderResponse.ok) {
        throw new Error("Unable to create payment order.");
      }

      const orderData = await orderResponse.json();
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Missing VITE_RAZORPAY_KEY_ID in env.");
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: "INR",
        name: "Saurene",
        description: "Fashion store purchase",
        order_id: orderData.id,
        prefill: {
          name: address.fullName,
          email: user?.email,
          contact: address.phone
        },
        theme: { color: "#67343c" },
        modal: {
          ondismiss: function onDismiss() {
            setIsPlacing(false);
          }
        },
        handler: async function handler(paymentResult) {
          try {
            setIsPlacing(true);
            const verifyResponse = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(paymentResult)
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed. Please contact support.");
            }

            const order = await saveOrder({
              id: paymentResult.razorpay_order_id,
              paymentId: paymentResult.razorpay_payment_id,
              userEmail: user?.email || "",
              items: checkoutItems,
              subtotal: checkoutSubtotal,
              discountAmount,
              couponCode: appliedCouponCode || "",
              total: payableTotal,
              address
            });

            sessionStorage.setItem("saurene_last_order", JSON.stringify(order));
            if (isBuyNowMode) {
              sessionStorage.removeItem(BUY_NOW_KEY);
              setBuyNowItems([]);
            } else {
              sessionStorage.removeItem(CART_SELECTED_KEY);
              setSelectedCartKeys([]);
              clearCart();
            }
            navigate("/order-success");
          } catch (verifyError) {
            setError(verifyError.message || "Payment verification failed.");
          } finally {
            setIsPlacing(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function onPaymentFailed() {
        setError("Payment failed or was cancelled. Please try again.");
        setIsPlacing(false);
      });
      rzp.open();
      setIsPlacing(false);
    } catch (apiError) {
      setError(apiError.message || "Something went wrong.");
      setIsPlacing(false);
    }
  }

  return (
    <div className="container-pad section-space">
      <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">Checkout</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.7fr_1fr]">
        <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
          <h2 className="font-heading text-2xl text-brand-wine sm:text-3xl">Shipping address</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              className="rounded-xl border border-brand-sand px-4 py-2"
              placeholder="Full Name"
              value={address.fullName}
              onChange={(event) =>
                setAddress({
                  ...address,
                  fullName: event.target.value.replace(/[^A-Za-z\s'.-]/g, "")
                })
              }
            />
            <input
              className="rounded-xl border border-brand-sand px-4 py-2"
              placeholder="Phone Number"
              value={address.phone}
              inputMode="numeric"
              maxLength={10}
              onChange={(event) =>
                setAddress({
                  ...address,
                  phone: event.target.value.replace(/\D/g, "").slice(0, 10)
                })
              }
            />
            <input
              className="rounded-xl border border-brand-sand px-4 py-2 sm:col-span-2"
              placeholder="Address Line"
              value={address.line1}
              onChange={(event) => setAddress({ ...address, line1: event.target.value })}
            />
            <input
              className="rounded-xl border border-brand-sand px-4 py-2"
              placeholder="City"
              value={address.city}
              onChange={(event) =>
                setAddress({
                  ...address,
                  city: event.target.value.replace(/[^A-Za-z\s'.-]/g, "")
                })
              }
            />
            <input
              className="rounded-xl border border-brand-sand px-4 py-2"
              placeholder="State"
              value={address.state}
              onChange={(event) =>
                setAddress({
                  ...address,
                  state: event.target.value.replace(/[^A-Za-z\s'.-]/g, "")
                })
              }
            />
            <input
              className="rounded-xl border border-brand-sand px-4 py-2"
              placeholder="Pincode"
              value={address.pincode}
              inputMode="numeric"
              maxLength={6}
              onChange={(event) =>
                setAddress({
                  ...address,
                  pincode: event.target.value.replace(/\D/g, "").slice(0, 6)
                })
              }
            />
          </div>

          <div className="mt-8 rounded-xl border border-brand-sand/70 p-4">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-charcoal/70">Coupon</p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input
                value={couponCode}
                onChange={(event) => {
                  setCouponCode(event.target.value);
                  setAppliedCouponCode("");
                  setDiscountPercent(0);
                }}
                placeholder="Enter coupon"
                className="flex-1 rounded-xl border border-brand-sand px-4 py-2"
              />
              <button
                onClick={applyCoupon}
                className="rounded-md bg-brand-wine px-4 py-2 text-sm font-semibold text-white"
              >
                Apply
              </button>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-charcoal/65">
                Suggested
              </p>
              {suggestedCoupons.map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => applySuggestedCoupon(code)}
                  className="rounded-md border border-brand-wine px-3 py-1 text-xs font-semibold text-brand-wine"
                >
                  {code}
                </button>
              ))}
            </div>
            {appliedCouponCode ? (
              <p className="mt-2 text-xs font-semibold text-emerald-700">
                Coupon {appliedCouponCode} applied ({discountPercent}% off)
              </p>
            ) : null}
          </div>
        </section>

        <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-heading text-2xl text-brand-wine sm:text-3xl">Order Summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            {checkoutItems.map((item) => (
              <div key={item.variantKey || `${item.id}-${item.size}`} className="flex items-center justify-between gap-3">
                <span className="max-w-[70%] truncate">
                  {item.name} x {item.quantity}
                  {getSelectedOptionsLabel(item)}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-brand-sand pt-4 text-sm">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(checkoutSubtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Discount</span>
              <span>-{formatPrice(discountAmount)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span>{formatPrice(payableTotal)}</span>
            </div>
          </div>
          {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
          <button
            disabled={isPlacing}
            onClick={placeOrder}
            className="mt-6 w-full rounded-md bg-brand-wine px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isPlacing ? "Processing..." : isTestPaymentMode ? "Place Order" : "Pay with Razorpay"}
          </button>
          {isTestPaymentMode ? (
            <p className="mt-2 text-xs text-brand-charcoal/65">
              Test payment mode is active. Razorpay step is skipped for local testing.
            </p>
          ) : null}
          {isBuyNowMode ? (
            <p className="mt-2 text-xs font-semibold text-brand-wine/85">
              Buy now mode: only this selected product will be ordered.
            </p>
          ) : null}
          <p className="mt-3 text-xs font-semibold text-brand-wine/85">
            Your purchase contributes 2% to Adruta Children's Home.
          </p>
          <p className="mt-4 text-xs text-brand-charcoal/65">
            Delivery timeline: within 7-8 working days.
          </p>
        </aside>
      </div>
    </div>
  );
}
