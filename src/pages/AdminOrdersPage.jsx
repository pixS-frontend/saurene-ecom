import { useCallback, useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { getAllOrders, ORDER_STATUSES, updateOrder } from "../services/orders";
import { getCustomerActivityProfiles } from "../services/userProfiles";
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

function normalizeEmail(email) {
  return (email || "").trim().toLowerCase();
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

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [lastSyncedAt, setLastSyncedAt] = useState("");

  const customerActivity = useMemo(() => {
    const customerMap = new Map();

    profiles.forEach((profile) => {
      const email = normalizeEmail(profile.email);
      if (!email) return;
      customerMap.set(email, {
        email,
        name: profile.name || "Customer",
        phone: profile.phone || "N/A",
        cartItems: Array.isArray(profile.cartItems) ? profile.cartItems : [],
        wishlistItems: Array.isArray(profile.wishlistItems) ? profile.wishlistItems : []
      });
    });

    orders.forEach((order) => {
      const email = normalizeEmail(order.userEmail);
      if (!email || email === "unknown") return;
      const existing = customerMap.get(email);
      const phoneFromOrder = order.address?.phone || "N/A";
      if (!existing) {
        customerMap.set(email, {
          email,
          name: order.address?.fullName || "Customer",
          phone: phoneFromOrder,
          cartItems: [],
          wishlistItems: []
        });
        return;
      }
      if ((existing.phone === "N/A" || !existing.phone) && phoneFromOrder !== "N/A") {
        existing.phone = phoneFromOrder;
      }
      customerMap.set(email, existing);
    });

    return Array.from(customerMap.values()).sort((a, b) => a.email.localeCompare(b.email));
  }, [orders, profiles]);

  const loadAdminData = useCallback(async (options = {}) => {
    const { silent = false } = options;
    if (!silent) setIsLoadingOrders(true);

    const [ordersResult, profilesResult] = await Promise.allSettled([
      getAllOrders(),
      getCustomerActivityProfiles()
    ]);

    if (ordersResult.status === "fulfilled") {
      setOrders(ordersResult.value);
    } else {
      setOrders([]);
    }

    if (profilesResult.status === "fulfilled") {
      setProfiles(profilesResult.value);
    } else {
      setProfiles([]);
    }

    if (ordersResult.status === "rejected" && profilesResult.status === "rejected") {
      setMessage("Could not load admin data right now.");
    } else if (ordersResult.status === "rejected") {
      setMessage("Could not load orders right now.");
    } else if (profilesResult.status === "rejected") {
      setMessage("Could not load customer activity right now.");
    } else {
      setMessage("");
      setLastSyncedAt(new Date().toLocaleTimeString());
    }

    if (!silent) setIsLoadingOrders(false);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initialLoad() {
      if (!isMounted) return;
      await loadAdminData();
    }

    initialLoad();
    const intervalId = setInterval(() => {
      loadAdminData({ silent: true });
    }, 8000);
    const onFocus = () => loadAdminData({ silent: true });
    window.addEventListener("focus", onFocus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
    };
  }, [loadAdminData]);

  async function handleUpdateOrder(invoiceId, updates) {
    const updated = await updateOrder(invoiceId, updates);
    if (!updated) {
      setMessage("Could not update order right now.");
      return;
    }
    setOrders((current) =>
      current.map((order) =>
        (order.invoiceId || "") === (invoiceId || "")
          ? {
              ...order,
              ...updated
            }
          : order
      )
    );
    setMessage(`Updated ${updated.invoiceId}`);
  }

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
      `Customer Email: ${order.userEmail || "N/A"}`,
      `Customer Name: ${order.address?.fullName || "N/A"}`
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

  function printInvoice(order) {
    if (!order) return;
    const lineItems = (order.items || [])
      .map((item) => {
        const qty = Number(item.quantity || 1);
        const amount = getItemPrice(item) * qty;
        return `
          <tr>
            <td>${escapeHtml(`${item.name} - ${item.size}${getItemOptionLabel(item)}`)}</td>
            <td style="text-align:center;">${qty}</td>
            <td style="text-align:right;">${escapeHtml(formatPdfPrice(getItemPrice(item)))}</td>
            <td style="text-align:right;">${escapeHtml(formatPdfPrice(amount))}</td>
          </tr>
        `;
      })
      .join("");

    const printWindow = window.open("", "_blank", "width=980,height=760");
    if (!printWindow) {
      setMessage("Please allow pop-ups to print invoice.");
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>${escapeHtml(order.invoiceId || "Invoice")}</title>
          <style>
            body { font-family: Arial, sans-serif; color: #202020; padding: 28px; }
            .head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
            .logo { height: 38px; }
            .title { font-size: 26px; color: #67343c; font-weight: 700; }
            .meta p { margin: 4px 0; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #e2d4c5; padding: 8px; font-size: 12px; vertical-align: top; }
            th { background: #f7f1eb; text-align: left; }
            .totals { margin-top: 16px; font-size: 13px; line-height: 1.7; }
            .section-title { margin-top: 14px; font-weight: 700; color: #67343c; font-size: 14px; }
            .address { font-size: 13px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="head">
            <img src="/logo-saurene.png" alt="Saurene" class="logo" />
            <div class="title">Invoice</div>
          </div>

          <div class="meta">
            <p><strong>Invoice ID:</strong> ${escapeHtml(order.invoiceId || "N/A")}</p>
            <p><strong>Order ID:</strong> ${escapeHtml(order.id || "N/A")}</p>
            <p><strong>Payment ID:</strong> ${escapeHtml(order.paymentId || "N/A")}</p>
            <p><strong>Date:</strong> ${escapeHtml(getOrderDate(order.createdAt))}</p>
            <p><strong>Customer Email:</strong> ${escapeHtml(order.userEmail || "N/A")}</p>
            <p><strong>Customer Name:</strong> ${escapeHtml(order.address?.fullName || "N/A")}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align:center;">Qty</th>
                <th style="text-align:right;">Price</th>
                <th style="text-align:right;">Amount</th>
              </tr>
            </thead>
            <tbody>${lineItems}</tbody>
          </table>

          <div class="totals">
            <div><strong>Subtotal:</strong> ${escapeHtml(formatPdfPrice(order.subtotal || order.total || 0))}</div>
            <div><strong>Discount:</strong> -${escapeHtml(formatPdfPrice(order.discountAmount || 0))}</div>
            <div><strong>Total Paid:</strong> ${escapeHtml(formatPdfPrice(order.total || 0))}</div>
            <div><strong>Coupon:</strong> ${escapeHtml(order.couponCode || "N/A")}</div>
            <div><strong>Order Status:</strong> ${escapeHtml(order.orderStatus || "Order Placed")}</div>
            <div><strong>Tracking ID:</strong> ${escapeHtml(order.trackingId || "N/A")}</div>
          </div>

          ${
            order.address
              ? `
                <div class="section-title">Shipping Address</div>
                <div class="address">
                  ${escapeHtml(order.address.fullName || "")}<br/>
                  ${escapeHtml(order.address.line1 || "")}<br/>
                  ${escapeHtml(`${order.address.city || ""}, ${order.address.state || ""} - ${order.address.pincode || ""}`)}<br/>
                  Phone: ${escapeHtml(order.address.phone || "")}
                </div>
              `
              : ""
          }
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  return (
    <div className="container-pad section-space">
      <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">Admin Orders</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => loadAdminData()}
          className="rounded-md border border-brand-wine px-3 py-1.5 text-xs font-semibold text-brand-wine"
        >
          Refresh Data
        </button>
        {lastSyncedAt ? (
          <p className="text-xs text-brand-charcoal/70">Last synced: {lastSyncedAt}</p>
        ) : null}
      </div>

      {message ? <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p> : null}

      <section className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-heading text-2xl text-brand-wine">Customer Activity</h2>
        {!customerActivity.length ? (
          <p className="mt-3 text-sm text-brand-charcoal/70">No customer activity found yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {customerActivity.map((customer) => (
              <article key={customer.email} className="rounded-xl border border-brand-sand/70 p-4 text-sm">
                <p className="font-semibold text-brand-wine">{customer.name}</p>
                <p className="mt-1">
                  Email: <span className="font-semibold">{customer.email}</span>
                </p>
                <p className="mt-1">
                  Phone: <span className="font-semibold">{customer.phone || "N/A"}</span>
                </p>
                <p className="mt-2 font-semibold text-brand-charcoal/75">
                  Cart items ({customer.cartItems.length})
                </p>
                {customer.cartItems.length ? (
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-brand-charcoal/80">
                    {customer.cartItems.map((item) => (
                      <li key={item.variantKey || `${item.id}-${item.size}`}>
                        {item.name} x {item.quantity} - {item.size}
                        {getItemOptionLabel(item)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-brand-charcoal/70">No items in cart.</p>
                )}

                <p className="mt-3 font-semibold text-brand-charcoal/75">
                  Wishlist items ({customer.wishlistItems.length})
                </p>
                {customer.wishlistItems.length ? (
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-brand-charcoal/80">
                    {customer.wishlistItems.map((item) => (
                      <li key={item.id}>{item.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-brand-charcoal/70">No wishlist items.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {isLoadingOrders ? (
        <p className="mt-4 rounded-xl bg-white p-5 text-brand-charcoal/70">Loading orders...</p>
      ) : !orders.length ? (
        <p className="mt-4 rounded-xl bg-white p-5 text-brand-charcoal/70">No orders found yet.</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => (
            <article key={order.invoiceId || order.id} className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">
                  Invoice: <span className="font-semibold">{order.invoiceId || "Pending"}</span>
                </p>
                <p className="font-semibold">{formatPrice(order.total)}</p>
              </div>
              <p className="mt-1 text-sm">
                Order ID: <span className="font-semibold">{order.id}</span>
              </p>
              <p className="mt-1 text-sm">
                Payment ID: <span className="font-semibold">{order.paymentId || "N/A"}</span>
              </p>
              <p className="mt-1 text-sm">
                Customer: <span className="font-semibold">{order.userEmail || "unknown"}</span>
              </p>
              <p className="mt-1 text-sm">
                Placed on:{" "}
                <span className="font-semibold">
                  {getOrderDate(order.createdAt)}
                </span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => downloadInvoice(order)}
                  className="rounded-md bg-brand-wine px-4 py-2 text-xs font-semibold text-white"
                >
                  Download Invoice
                </button>
                <button
                  type="button"
                  onClick={() => printInvoice(order)}
                  className="rounded-md border border-brand-wine px-4 py-2 text-xs font-semibold text-brand-wine"
                >
                  Print Invoice
                </button>
              </div>
              <div className="mt-4 rounded-xl border border-brand-sand/70 p-3">
                <p className="text-sm font-semibold text-brand-wine">Order Tracking</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                  <select
                    value={order.orderStatus || "Order Placed"}
                    onChange={(event) =>
                      handleUpdateOrder(order.invoiceId, { orderStatus: event.target.value })
                    }
                    className="rounded-xl border border-brand-sand px-3 py-2 text-sm"
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <input
                    value={order.trackingId || ""}
                    onChange={(event) =>
                      setOrders((current) =>
                        current.map((entry) =>
                          (entry.invoiceId || "") === (order.invoiceId || "")
                            ? { ...entry, trackingId: event.target.value }
                            : entry
                        )
                      )
                    }
                    placeholder="Tracking ID"
                    className="rounded-xl border border-brand-sand px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleUpdateOrder(order.invoiceId, {
                        trackingId: order.trackingId || ""
                      })
                    }
                    className="rounded-md bg-brand-wine px-4 py-2 text-sm font-semibold text-white"
                  >
                    Save
                  </button>
                </div>
                <p className="mt-2 text-xs text-brand-charcoal/70">
                  Current status: {order.orderStatus || "Order Placed"}
                  {order.statusUpdatedAt ? ` | Updated: ${new Date(order.statusUpdatedAt).toLocaleString()}` : ""}
                </p>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-brand-charcoal/80">
                {(order.items || []).map((item) => (
                  <li key={item.variantKey || `${item.id}-${item.size}`}>
                    {item.name} x {item.quantity} - {item.size}
                    {getItemOptionLabel(item)}
                  </li>
                ))}
              </ul>
              {order.address ? (
                <div className="mt-4 rounded-xl bg-brand-ivory/45 p-3 text-sm">
                  <p className="font-semibold text-brand-wine">Shipping</p>
                  <p>{order.address.fullName}</p>
                  <p>{order.address.line1}</p>
                  <p>
                    {order.address.city}, {order.address.state} - {order.address.pincode}
                  </p>
                  <p>Phone: {order.address.phone}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
