import { useEffect, useState } from "react";
import { jsPDF } from "jspdf";
import { useAuth } from "../contexts/AuthContext";
import { getOrdersForUser } from "../services/orders";
import { formatPrice } from "../utils/format";

function getSelectedColorLabel(item) {
  const selectedColorId = item.selectedOptions?.color;
  if (!selectedColorId) return "";
  const colorValues = item.extraOptions?.color?.values || [];
  return colorValues.find((value) => value.id === selectedColorId)?.label || selectedColorId;
}

function getItemOptionLabel(item) {
  const labels = [];
  if (item.selectedOptions?.sleeve) {
    labels.push(item.selectedOptions.sleeve === "no-sleeve" ? "No Sleeve" : "Sleeve");
  }
  const colorLabel = getSelectedColorLabel(item);
  if (colorLabel) labels.push(colorLabel);
  return labels.length ? ` (${labels.join(", ")})` : "";
}

function getOrderDate(dateValue) {
  return dateValue ? new Date(dateValue).toLocaleString() : "N/A";
}

function getItemPrice(item) {
  return Number(item?.price ?? item?.discountedPrice ?? item?.mrp ?? 0);
}

function formatPdfPrice(value) {
  return formatPrice(value).replace("₹", "Rs. ");
}

export default function AccountPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [expandedTrackOrderId, setExpandedTrackOrderId] = useState("");
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      if (!user?.email) {
        setOrders([]);
        setIsLoadingOrders(false);
        return;
      }
      setIsLoadingOrders(true);
      try {
        const nextOrders = await getOrdersForUser(user.email);
        if (!isMounted) return;
        setOrders(nextOrders);
      } catch {
        if (!isMounted) return;
        setOrders([]);
      } finally {
        if (isMounted) setIsLoadingOrders(false);
      }
    }

    loadOrders();
    return () => {
      isMounted = false;
    };
  }, [user?.email]);

  async function loadImageAsDataUrl(src) {
    const response = await fetch(src);
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.readAsDataURL(blob);
    });
  }

  async function downloadInvoice(order) {
    if (!order) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const left = 40;
    const right = pageWidth - 40;
    let y = 48;

    try {
      const logoDataUrl = await loadImageAsDataUrl("/logo-saurene.png");
      doc.addImage(logoDataUrl, "PNG", 40, y, 180, 46);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(103, 52, 60);
      doc.setFontSize(24);
      doc.text("Saurene", 40, y + 30);
    }

    doc.setFont("helvetica", "bold");
    doc.setTextColor(103, 52, 60);
    doc.setFontSize(20);
    doc.text("Invoice", pageWidth - 140, y + 24);

    y += 78;
    doc.setDrawColor(220, 205, 190);
    doc.line(left, y, right, y);
    y += 26;

    doc.setFont("helvetica", "normal");
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(11);
    const meta = [
      `Invoice ID: ${order.invoiceId || "N/A"}`,
      `Order ID: ${order.id || "N/A"}`,
      `Payment ID: ${order.paymentId || "N/A"}`,
      `Date: ${getOrderDate(order.createdAt)}`,
      `Customer: ${user?.displayName || user?.name || "Saurene User"}`,
      `Email/Username: ${user?.email || user?.username || "N/A"}`
    ];
    meta.forEach((line) => {
      doc.text(line, left, y);
      y += 18;
    });

    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Items", left, y);
    y += 20;

    const colItem = left;
    const colQty = pageWidth - 180;
    const colPrice = pageWidth - 120;
    const colTotal = pageWidth - 50;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.text("Item", colItem, y);
    doc.text("Qty", colQty, y, { align: "center" });
    doc.text("Price", colPrice, y, { align: "right" });
    doc.text("Amount", colTotal, y, { align: "right" });
    y += 10;
    doc.setDrawColor(220, 205, 190);
    doc.line(left, y, right, y);
    y += 16;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    (order.items || []).forEach((item) => {
      const qty = Number(item.quantity || 1);
      const unitPrice = getItemPrice(item);
      const total = unitPrice * qty;
      const itemLine = `${item.name} | ${item.size}${getItemOptionLabel(item)}`;
      const wrapped = doc.splitTextToSize(itemLine, 290);
      const rowHeight = Math.max(16, wrapped.length * 12);

      if (y + rowHeight + 120 > pageHeight) {
        doc.addPage();
        y = 50;
      }

      doc.text(wrapped, colItem, y);
      doc.text(String(qty), colQty, y, { align: "center" });
      doc.text(formatPdfPrice(unitPrice), colPrice, y, { align: "right" });
      doc.text(formatPdfPrice(total), colTotal, y, { align: "right" });
      y += rowHeight;
    });

    y += 10;
    doc.setDrawColor(220, 205, 190);
    doc.line(left, y, right, y);
    y += 18;

    const totals = [
      `Subtotal: ${formatPdfPrice(order.subtotal || order.total || 0)}`,
      `Discount: -${formatPdfPrice(order.discountAmount || 0)}`,
      `Total Paid: ${formatPdfPrice(order.total || 0)}`,
      `Coupon: ${order.couponCode || "N/A"}`,
      `Order Status: ${order.orderStatus || "Order Placed"}`,
      `Tracking ID: ${order.trackingId || "N/A"}`,
      `Delivery Window: ${order.deliveryWindow || "7-8 working days"}`
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    totals.forEach((line) => {
      if (y + 18 > pageHeight - 40) {
        doc.addPage();
        y = 50;
      }
      doc.text(line, left, y);
      y += 17;
    });

    if (order.address) {
      y += 8;
      if (y + 80 > pageHeight - 40) {
        doc.addPage();
        y = 50;
      }
      doc.setFont("helvetica", "bold");
      doc.text("Shipping Address", left, y);
      y += 18;
      doc.setFont("helvetica", "normal");
      doc.text(order.address.fullName || "", left, y);
      y += 15;
      doc.text(order.address.line1 || "", left, y);
      y += 15;
      doc.text(`${order.address.city || ""}, ${order.address.state || ""} - ${order.address.pincode || ""}`, left, y);
      y += 15;
      doc.text(`Phone: ${order.address.phone || ""}`, left, y);
    }

    doc.save(`${order.invoiceId || order.id || "invoice"}.pdf`);
  }

  return (
    <div className="container-pad section-space">
      <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">My Account</h1>
      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-sm text-brand-charcoal/70">Logged in user</p>
        <p className="text-base font-semibold sm:text-lg">{user?.displayName || user?.name || "Saurene User"}</p>
        <p className="mt-1 break-all text-sm text-brand-charcoal/70">
          {user?.email || user?.username || "No email/username available"}
        </p>
      </div>

      <div className="mt-8">
        <h2 className="font-heading text-3xl text-brand-wine sm:text-4xl">Recent orders</h2>
        {isLoadingOrders ? (
          <p className="mt-4 rounded-xl bg-white p-5 text-brand-charcoal/70">Loading orders...</p>
        ) : orders.length ? (
          <div className="mt-4 space-y-4">
            {orders.map((order) => (
              <article key={order.invoiceId || order.id} className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm">
                    Order ID: <span className="font-semibold">{order.id}</span>
                  </p>
                  <p className="font-semibold">{formatPrice(order.total)}</p>
                </div>
                <p className="mt-1 text-sm text-brand-charcoal/70">
                  Invoice: <span className="font-semibold">{order.invoiceId || "Pending"}</span>
                </p>
                <p className="mt-1 text-sm text-brand-charcoal/70">
                  Placed on: <span className="font-semibold">{getOrderDate(order.createdAt)}</span>
                </p>
                <p className="mt-1 text-sm text-brand-charcoal/70">
                  Expected delivery: {order.deliveryWindow}
                </p>
                <div className="mt-2 rounded-xl border border-brand-sand/70 bg-brand-ivory/40 p-3 text-sm">
                  <p className="font-semibold text-brand-wine">Track Order</p>
                  <p className="mt-1">
                    Status: <span className="font-semibold">{order.orderStatus || "Order Placed"}</span>
                  </p>
                  {order.trackingId ? (
                    <p className="mt-1">
                      Tracking ID: <span className="font-semibold">{order.trackingId}</span>
                    </p>
                  ) : (
                    <p className="mt-1 text-brand-charcoal/70">Tracking ID will appear once shipped.</p>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTrackOrderId((current) =>
                        current === (order.invoiceId || order.id) ? "" : order.invoiceId || order.id
                      )
                    }
                    className="mt-2 rounded-md border border-brand-wine px-3 py-1 text-xs font-semibold text-brand-wine"
                  >
                    {expandedTrackOrderId === (order.invoiceId || order.id) ? "Hide details" : "Track order details"}
                  </button>
                  {expandedTrackOrderId === (order.invoiceId || order.id) ? (
                    <p className="mt-2 text-xs text-brand-charcoal/70">
                      Last updated: {order.statusUpdatedAt ? new Date(order.statusUpdatedAt).toLocaleString() : "N/A"}
                    </p>
                  ) : null}
                </div>
                {order.couponCode ? (
                  <p className="mt-1 text-sm text-emerald-700">Coupon used: {order.couponCode}</p>
                ) : null}
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brand-charcoal/80">
                  {(order.items || []).map((item) => (
                    <li key={item.variantKey || `${item.id}-${item.size}`}>
                      {item.name} x {item.quantity} - {item.size}
                      {getItemOptionLabel(item)}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setInvoiceOrder(order)}
                    className="rounded-md border border-brand-wine px-3 py-1.5 text-xs font-semibold text-brand-wine"
                  >
                    View invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadInvoice(order)}
                    className="rounded-md bg-brand-wine px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    Download invoice
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-xl bg-white p-5 text-brand-charcoal/70">
            No orders yet. Place your first order from Collections.
          </p>
        )}
      </div>

      {invoiceOrder ? (
        <div
          className="fixed inset-0 z-[140] grid place-items-center bg-black/60 p-4"
          onClick={() => setInvoiceOrder(null)}
        >
          <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-brand-sand/70 bg-brand-ivory/40 px-5 py-4 sm:px-7">
              <div>
                <img src="/logo-saurene.png" alt="Saurene" className="h-11 w-auto object-contain" />
                <p className="mt-2 text-xs uppercase tracking-[0.2em] text-brand-charcoal/60">Invoice</p>
                <p className="mt-1 text-sm font-semibold text-brand-wine">
                  {invoiceOrder.invoiceId || invoiceOrder.id || "N/A"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="grid h-10 w-10 place-items-center rounded-full border border-brand-sand text-brand-wine transition hover:bg-brand-rose/30"
                aria-label="Close invoice"
              >
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>

            <div className="max-h-[72vh] space-y-4 overflow-auto px-5 py-4 sm:px-7">
              <div className="grid gap-3 text-sm lg:grid-cols-2">
                <div className="rounded-xl border border-brand-sand/70 bg-white px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-brand-charcoal/55">Bill To</p>
                  <p className="mt-1 text-base font-semibold text-brand-wine">
                    {user?.displayName || user?.name || "Saurene User"}
                  </p>
                  <p className="mt-1 text-brand-charcoal/70">{user?.email || user?.username || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-brand-sand/70 bg-white px-4 py-3 text-sm">
                  <p>
                    Order ID: <span className="font-semibold">{invoiceOrder.id || "N/A"}</span>
                  </p>
                  <p className="mt-1">
                    Payment ID: <span className="font-semibold">{invoiceOrder.paymentId || "N/A"}</span>
                  </p>
                  <p className="mt-1">
                    Date: <span className="font-semibold">{getOrderDate(invoiceOrder.createdAt)}</span>
                  </p>
                  <p className="mt-1">
                    Order Status: <span className="font-semibold">{invoiceOrder.orderStatus || "Order Placed"}</span>
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-brand-sand/70">
                <div className="grid grid-cols-[1fr_70px_90px_90px] border-b border-brand-sand/70 bg-brand-ivory/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-brand-charcoal/70">
                  <p>Item</p>
                  <p className="text-center">Qty</p>
                  <p className="text-right">Price</p>
                  <p className="text-right">Amount</p>
                </div>
                <div className="divide-y divide-brand-sand/60">
                  {(invoiceOrder.items || []).map((item) => (
                    <div
                      key={item.variantKey || `${item.id}-${item.size}`}
                      className="grid grid-cols-[1fr_70px_90px_90px] items-start px-4 py-3 text-sm"
                    >
                      <p className="pr-2 text-brand-charcoal">
                        {item.name} - {item.size}
                        {getItemOptionLabel(item)}
                      </p>
                      <p className="text-center">{item.quantity || 1}</p>
                      <p className="text-right">{formatPrice(getItemPrice(item))}</p>
                      <p className="text-right font-semibold">
                        {formatPrice(getItemPrice(item) * Number(item.quantity || 1))}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 rounded-xl border border-brand-sand/70 px-4 py-3 text-sm sm:grid-cols-2">
                <p>
                  Subtotal:{" "}
                  <span className="font-semibold">{formatPrice(invoiceOrder.subtotal || invoiceOrder.total || 0)}</span>
                </p>
                <p>
                  Discount: <span className="font-semibold">-{formatPrice(invoiceOrder.discountAmount || 0)}</span>
                </p>
                <p>
                  Total Paid: <span className="font-semibold">{formatPrice(invoiceOrder.total || 0)}</span>
                </p>
                <p>
                  Coupon: <span className="font-semibold">{invoiceOrder.couponCode || "N/A"}</span>
                </p>
                <p>
                  Tracking ID: <span className="font-semibold">{invoiceOrder.trackingId || "N/A"}</span>
                </p>
                <p>
                  Delivery Window:{" "}
                  <span className="font-semibold">{invoiceOrder.deliveryWindow || "7-8 working days"}</span>
                </p>
              </div>

              {invoiceOrder.address ? (
                <div className="rounded-xl border border-brand-sand/70 px-4 py-3 text-sm">
                  <p className="font-semibold text-brand-wine">Shipping Address</p>
                  <p className="mt-1">{invoiceOrder.address.fullName}</p>
                  <p>{invoiceOrder.address.line1}</p>
                  <p>
                    {invoiceOrder.address.city}, {invoiceOrder.address.state} - {invoiceOrder.address.pincode}
                  </p>
                  <p>Phone: {invoiceOrder.address.phone}</p>
                </div>
              ) : null}
            </div>

            <div className="flex justify-end gap-2 border-t border-brand-sand/70 px-5 py-4 sm:px-7">
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="rounded-md border border-brand-sand px-3 py-2 text-xs font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => downloadInvoice(invoiceOrder)}
                className="rounded-md bg-brand-wine px-3 py-2 text-xs font-semibold text-white"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
