import { Link } from "react-router-dom";
import { useState } from "react";
import { useWishlist } from "../contexts/WishlistContext";
import { calculateDiscountedPrice, formatPrice } from "../utils/format";

export default function ProductCard({ product, compactMobile = false }) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const discounted = calculateDiscountedPrice(product.price, product.discountPercent);
  const liked = isWishlisted(product.id);
  const hasExtraOptions = Boolean(product.extraOptions?.color || product.extraOptions?.sleeve);
  const colorLabels = (product.extraOptions?.color?.values || []).map((value) => value.label);
  const optionBadges = [
    ...colorLabels,
    ...(product.extraOptions?.sleeve ? ["Sleeve / No Sleeve"] : [])
  ];
  const badgesToRender = compactMobile ? optionBadges.slice(0, 2) : optionBadges;

  return (
    <article className="group overflow-hidden rounded-2xl border border-brand-sand/35 bg-white/40 shadow-sm backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/product/${product.slug}`} className="relative block overflow-hidden">
        {hasExtraOptions ? (
          <div
            className={`absolute z-10 flex flex-wrap ${
              compactMobile ? "left-2 top-2 max-w-[72%] gap-1" : "left-3 top-3 max-w-[85%] gap-1.5"
            }`}
          >
            {badgesToRender.map((badge) => (
              <span
                key={badge}
                className={`option-chip rounded-md border border-brand-wine/35 bg-[#f7efe8]/95 font-semibold uppercase text-brand-wine shadow-sm backdrop-blur-sm ${
                  compactMobile
                    ? "px-1.5 py-0.5 text-[8px] tracking-[0.08em]"
                    : "px-2.5 py-1 text-[10px] tracking-[0.12em]"
                }`}
              >
                {badge}
              </span>
            ))}
          </div>
        ) : null}
        {compactMobile ? (
          <span
            className="absolute bottom-2 right-2 z-10 grid h-8 w-8 place-items-center rounded-md bg-white/90 text-lg font-semibold text-brand-wine shadow-sm sm:hidden"
            aria-hidden="true"
          >
            +
          </span>
        ) : null}
        <div className="aspect-[4/5] w-full overflow-hidden">
          {!isImageLoaded ? <div className="skeleton-shimmer h-full w-full" /> : null}
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
          />
        </div>
      </Link>
      <div className={`${compactMobile ? "p-3" : "p-4"}`}>
        <p className={`${compactMobile ? "hidden sm:block" : ""} text-xs uppercase tracking-[0.2em] text-brand-wine/75`}>
          {product.category}
        </p>
        <h3 className={`mt-2 font-heading leading-tight text-brand-charcoal ${compactMobile ? "text-lg sm:text-2xl" : "text-xl sm:text-2xl"}`}>
          {product.name}
        </h3>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-lg font-semibold text-brand-wine">{formatPrice(discounted)}</span>
          {product.discountPercent > 0 && (
            <>
              <span className="text-sm text-brand-charcoal/50 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-xs font-bold text-emerald-700">
                {product.discountPercent}% OFF
              </span>
            </>
          )}
        </div>
        <div className={`mt-4 flex flex-wrap gap-2 ${compactMobile ? "hidden sm:flex" : ""}`}>
          <Link
            to={`/product/${product.slug}`}
            className="btn-like rounded-md border border-brand-wine px-3 py-2 text-xs font-semibold text-brand-wine sm:px-4 sm:text-sm"
          >
            Buy now
          </Link>
          <Link
            to={`/product/${product.slug}`}
            className="btn-like flex-1 rounded-md bg-brand-wine px-4 py-2 text-center text-xs font-semibold text-white sm:text-sm"
          >
            Add to cart
          </Link>
          <button
            onClick={() => toggleWishlist(product)}
            className={`rounded-md border px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${
              liked ? "border-brand-wine bg-brand-wine text-white" : "border-brand-wine text-brand-wine"
            }`}
          >
            {liked ? "Saved" : "Wishlist"}
          </button>
        </div>
      </div>
    </article>
  );
}
