export function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function calculateDiscountedPrice(price, discountPercent = 0) {
  if (!discountPercent) return price;
  return Math.round(price - (price * discountPercent) / 100);
}
