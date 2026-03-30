import { Link } from "react-router-dom";
import { formatPrice } from "../utils/format";

function getSelectedColorLabel(item) {
  const selectedColorId = item.selectedOptions?.color;
  if (!selectedColorId) return "";
  const colorValues = item.extraOptions?.color?.values || [];
  return colorValues.find((value) => value.id === selectedColorId)?.label || selectedColorId;
}

export default function OrderSuccessPage() {
  const order = JSON.parse(sessionStorage.getItem("saurene_last_order") || "null");

  if (!order) {
    return (
      <div className="container-pad section-space">
        <p>No recent order found.</p>
        <Link to="/collections" className="text-brand-wine underline">
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="container-pad section-space">
      <div className="mx-auto max-w-3xl rounded-3xl bg-white p-5 shadow-sm sm:p-8">
        <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">Order Confirmed</h1>
        <p className="mt-3 text-brand-charcoal/75">
          Thank you for shopping with Saurene. Your order invoice is generated below.
        </p>
        <div className="mt-8 rounded-2xl border border-brand-sand/70 p-6">
          <p className="text-sm">
            Invoice ID: <span className="font-semibold">{order.invoiceId || order.id}</span>
          </p>
          <p className="mt-1 text-sm">
            Order ID: <span className="font-semibold">{order.id}</span>
          </p>
          <p className="mt-1 text-sm">
            Payment ID: <span className="font-semibold">{order.paymentId}</span>
          </p>
          <p className="mt-1 text-sm">
            Customer: <span className="font-semibold">{order.userEmail}</span>
          </p>
          <p className="mt-1 text-sm">
            Date:{" "}
            <span className="font-semibold">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : new Date().toLocaleString()}
            </span>
          </p>
          <p className="mt-4 font-semibold">Items</p>
          <ul className="mt-2 space-y-1 text-sm">
            {order.items.map((item) => (
              <li key={item.variantKey || `${item.id}-${item.size}`}>
                {item.name} x {item.quantity} ({item.size}
                {item.selectedOptions?.sleeve ? `, ${item.selectedOptions.sleeve === "no-sleeve" ? "No Sleeve" : "Sleeve"}` : ""}
                {item.selectedOptions?.color ? `, ${getSelectedColorLabel(item)}` : ""}
                )
              </li>
            ))}
          </ul>
          <p className="mt-4 text-lg font-semibold text-brand-wine">
            Total Paid: {formatPrice(order.total)}
          </p>
          <p className="mt-1 text-sm text-brand-charcoal/75">
            Subtotal: {formatPrice(order.subtotal || order.total)}
          </p>
          <p className="mt-1 text-sm text-brand-charcoal/75">
            Discount: -{formatPrice(order.discountAmount || 0)}
          </p>
          {order.couponCode ? (
            <p className="mt-1 text-sm text-emerald-700">Coupon applied: {order.couponCode}</p>
          ) : null}
          <p className="mt-1 text-sm text-brand-charcoal/75">
            Estimated delivery: within 7-8 working days.
          </p>
          {order.address ? (
            <div className="mt-4 rounded-xl bg-brand-ivory/45 p-4 text-sm">
              <p className="font-semibold text-brand-wine">Shipping Address</p>
              <p className="mt-1">{order.address.fullName}</p>
              <p>{order.address.line1}</p>
              <p>
                {order.address.city}, {order.address.state} - {order.address.pincode}
              </p>
              <p>Phone: {order.address.phone}</p>
            </div>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/account" className="btn-like rounded-md bg-brand-wine px-5 py-2.5 text-sm font-semibold text-white">
            View account
          </Link>
          <Link
            to="/collections"
            className="btn-like rounded-md border border-brand-wine px-5 py-2.5 text-sm font-semibold text-brand-wine"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
