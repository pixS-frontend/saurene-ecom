const trustItems = [
  {
    title: "Free Shipping On Domestic Orders",
    text: "Applicable on prepaid orders.",
    icon: "truck"
  },
  {
    title: "Crafted With Care",
    text: "Every piece is made thoughtfully with patience and precision.",
    icon: "heart"
  },
  {
    title: "Top-Notch Support",
    text: "Got a question? Our team is here to help.",
    icon: "support"
  },
  {
    title: "Secure Payments",
    text: "Shop with peace of mind through encrypted checkout.",
    icon: "card"
  }
];

function Icon({ type }) {
  if (type === "truck") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 6h11v9H3z" />
        <path d="M14 9h3l4 3v3h-7z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    );
  }
  if (type === "heart") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 20s-7-4.35-7-10a4 4 0 0 1 7-2.64A4 4 0 0 1 19 10c0 5.65-7 10-7 10z" />
      </svg>
    );
  }
  if (type === "support") {
    return (
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20a8 8 0 0 1 16 0" />
        <path d="M4 13v2M20 13v2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
      <path d="M7 14h4" />
    </svg>
  );
}

export default function TrustStrip() {
  return (
    <section className="container-pad mb-6 mt-10 sm:mb-8 sm:mt-12">
      <div className="grid gap-3 rounded-2xl border border-brand-sand/70 bg-[#ece8e2] p-4 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-4">
        {trustItems.map((item) => (
          <article
            key={item.title}
            className="rounded-xl bg-white/70 px-3 py-4 text-center text-brand-charcoal sm:px-4 sm:py-5"
          >
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center text-brand-wine">
              <Icon type={item.icon} />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-charcoal/85">
              {item.title}
            </h3>
            <p className="mt-2 text-xs leading-5 text-brand-charcoal/70">{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
