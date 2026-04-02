export default function PromoBar() {
  const promoItems = [
    "10% OFF for new users with code SAURENE10",
    "Free shipping on all orders",
    "Made-to-order pieces crafted with care"
  ];

  return (
    <div className="promo-wrap border-b border-brand-sand/40 bg-brand-wine text-white">
      <div className="promo-fade-left" />
      <div className="promo-fade-right" />
      <div className="promo-marquee">
        {[...promoItems, ...promoItems].map((item, index) => (
          <span key={item + "-" + index} className="promo-item">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
