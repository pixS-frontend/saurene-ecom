import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { formatPrice } from "../utils/format";

const BUY_NOW_KEY = "saurene_buy_now_checkout_v1";
const CART_SELECTED_KEY = "saurene_selected_cart_items_v1";

function getSelectedColorLabel(item) {
  const selectedColorId = item.selectedOptions?.color;
  if (!selectedColorId) return "";
  const colorValues = item.extraOptions?.color?.values || [];
  return colorValues.find((value) => value.id === selectedColorId)?.label || selectedColorId;
}

function getVariantKey(item) {
  return item.variantKey || `${item.id}-${item.size}`;
}

export default function CartPage() {
  const { cartItems, cartSubtotal, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();
  const [selectedKeys, setSelectedKeys] = useState(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CART_SELECTED_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const availableKeys = cartItems.map(getVariantKey);
    setSelectedKeys((current) => {
      const filtered = current.filter((key) => availableKeys.includes(key));
      if (!filtered.length && availableKeys.length) return availableKeys;
      return filtered;
    });
  }, [cartItems]);

  const selectedItems = useMemo(
    () => cartItems.filter((item) => selectedKeys.includes(getVariantKey(item))),
    [cartItems, selectedKeys]
  );

  const selectedSubtotal = useMemo(
    () => selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [selectedItems]
  );

  const allSelected = cartItems.length > 0 && selectedKeys.length === cartItems.length;

  function toggleItemSelection(item) {
    const key = getVariantKey(item);
    setSelectedKeys((current) =>
      current.includes(key) ? current.filter((entry) => entry !== key) : [...current, key]
    );
  }

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedKeys([]);
      return;
    }
    setSelectedKeys(cartItems.map(getVariantKey));
  }

  function proceedToCheckout() {
    if (!selectedKeys.length) return;
    sessionStorage.removeItem(BUY_NOW_KEY);
    sessionStorage.setItem(CART_SELECTED_KEY, JSON.stringify(selectedKeys));
    navigate("/checkout");
  }

  return (
    <div className="container-pad section-space">
      <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">Cart</h1>
      {!cartItems.length ? (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center">
          <p>Your cart is empty.</p>
          <Link to="/collections" className="mt-4 inline-block text-brand-wine underline">
            Continue shopping
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-brand-wine">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} />
                Select all items
              </label>
            </div>
            {cartItems.map((item) => (
              <article
                key={item.variantKey || `${item.id}-${item.size}`}
                className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row"
              >
                <label className="mt-1 inline-flex h-fit cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={selectedKeys.includes(getVariantKey(item))}
                    onChange={() => toggleItemSelection(item)}
                  />
                </label>
                <img src={item.images[0]} alt={item.name} className="h-28 w-24 rounded-xl object-cover" />
                <div className="flex-1">
                  <h2 className="font-heading text-xl text-brand-wine sm:text-2xl">{item.name}</h2>
                  <p className="text-sm text-brand-charcoal/70">Size: {item.size}</p>
                  {item.selectedOptions?.color ? (
                    <p className="text-sm text-brand-charcoal/70">
                      Color: {getSelectedColorLabel(item)}
                    </p>
                  ) : null}
                  {item.selectedOptions?.sleeve ? (
                    <p className="text-sm text-brand-charcoal/70">
                      Sleeve: {item.selectedOptions.sleeve === "no-sleeve" ? "No Sleeve" : "Sleeve"}
                    </p>
                  ) : null}
                  <p className="mt-2 font-semibold">{formatPrice(item.price)}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity - 1, item.variantKey)}
                      className="rounded-md border border-brand-sand px-3 py-1"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.size, item.quantity + 1, item.variantKey)}
                      className="rounded-md border border-brand-sand px-3 py-1"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeFromCart(item.id, item.size, item.variantKey)}
                      className="text-sm text-red-700 underline sm:ml-3"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="font-heading text-3xl text-brand-wine">Summary</h3>
            <div className="mt-2 text-xs text-brand-charcoal/70">
              Selected: {selectedItems.length} of {cartItems.length} items
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(cartSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Selected subtotal</span>
                <span>{formatPrice(selectedSubtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="border-t border-brand-sand pt-2 text-base font-semibold">
                <div className="flex items-center justify-between">
                  <span>Checkout total</span>
                  <span>{formatPrice(selectedSubtotal)}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={!selectedKeys.length}
              onClick={proceedToCheckout}
              className="btn-like mt-6 block w-full rounded-md bg-brand-wine px-4 py-3 text-center text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Checkout Selected
            </button>
            {!selectedKeys.length ? (
              <p className="mt-2 text-xs text-red-700">Please select at least one item to checkout.</p>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
