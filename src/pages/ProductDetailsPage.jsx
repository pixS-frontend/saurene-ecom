import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { products } from "../data/products";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import { calculateDiscountedPrice, formatPrice } from "../utils/format";

const detailHighlights = [
  "Designed with timeless feminine lines for elevated everyday wear.",
  "Crafted in premium fabrics for comfort, fall, and structure.",
  "Thoughtfully tailored to flatter Indian body shapes.",
  "Hand-finished details for long-lasting elegance."
];

const careInstructions = [
  "Dry clean preferred for best shape retention.",
  "Steam or low-heat iron on reverse side.",
  "Store on a broad hanger away from direct sunlight."
];

function HomegrownIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M9 21v-5h6v5" />
      <path d="M12 13.5c1.5 0 2.5-1 2.5-2.2A2.4 2.4 0 0 0 12 9a2.4 2.4 0 0 0-2.5 2.3c0 1.2 1 2.2 2.5 2.2z" />
    </svg>
  );
}

function FabricIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15 2c-2 4-1 7 1.6 9.6C19.2 14.2 20 17 18 22" />
      <path d="M9 22c1.7-3.4 3-5.8 6.2-8.8" />
      <path d="M7.2 17.2 11 21" />
    </svg>
  );
}

function FitIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 5h10l-1.3 4.3L18 20H6l2.3-10.7z" />
      <path d="M9 5V3h6v2" />
      <path d="m8.5 10 3.5 2 3.5-2" />
    </svg>
  );
}

function ExchangeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="12" rx="2" />
      <path d="M8 20h8" />
      <path d="M8 10h8" />
      <path d="m10 8-2 2 2 2" />
      <path d="m14 12 2-2-2-2" />
    </svg>
  );
}

const productBadges = [
  {
    title: "Homegrown Love",
    text: "Crafted with passion, rooted in India.",
    icon: HomegrownIcon
  },
  {
    title: "Premium Fabrics",
    text: "Luxe textures, timeless comfort.",
    icon: FabricIcon
  },
  {
    title: "Flattering Fits",
    text: "Thoughtfully made to flatter Indian body shapes.",
    icon: FitIcon
  },
  {
    title: "Size Exchange",
    text: "Hassle-free size swaps for the same outfit.",
    icon: ExchangeIcon
  }
];

export default function ProductDetailsPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = products.find((item) => item.slug === slug);
  const [size, setSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSleeve, setSelectedSleeve] = useState("");
  const [imageIndex, setImageIndex] = useState(0);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    setSize("");
    setSelectedColor("");
    setSelectedSleeve("");
    setImageIndex(0);
    setIsImageOpen(false);
    setIsSizeChartOpen(false);
  }, [slug]);

  const colorOption = product?.extraOptions?.color;
  const sleeveOption = product?.extraOptions?.sleeve;
  const selectedColorData = colorOption?.values?.find((value) => value.id === selectedColor);
  const activeImages = selectedColorData?.images?.length ? selectedColorData.images : product?.images || [];
  const needsSleeveSelection = Boolean(sleeveOption?.required);
  const isPurchaseBlocked = !size || (needsSleeveSelection && !selectedSleeve);

  useEffect(() => {
    if (!isImageOpen) return undefined;

    function onKeyDown(event) {
      if (event.key === "Escape") setIsImageOpen(false);
      if (event.key === "ArrowRight") {
        setImageIndex((current) => (current + 1) % activeImages.length);
      }
      if (event.key === "ArrowLeft") {
        setImageIndex((current) => (current - 1 + activeImages.length) % activeImages.length);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeImages.length, isImageOpen]);

  useEffect(() => {
    setImageIndex(0);
  }, [selectedColor]);

  if (!product) {
    return (
      <div className="container-pad section-space">
        <p>Product not found.</p>
        <Link to="/collections" className="text-brand-wine underline">
          Back to collections
        </Link>
      </div>
    );
  }

  const discounted = calculateDiscountedPrice(product.price, product.discountPercent);
  const longDescription = useMemo(() => product.description, [product.description]);
  const overview = product.overview || longDescription;
  const details = product.details || [];
  const fit = product.fit || [];
  const whereToWear = product.whereToWear || [];
  const care = product.care || "";
  const disclaimer = product.disclaimer || "";
  const customisation = product.customisation || "";
  const sizeCharts = product.sizeCharts || [];
  const whatsappMessage = `Hi Saurene Stylists, I have a query about ${product.name}.`;
  const whatsappLink = `https://wa.me/919439721131?text=${encodeURIComponent(whatsappMessage)}`;
  const BUY_NOW_KEY = "saurene_buy_now_checkout_v1";
  const CART_SELECTED_KEY = "saurene_selected_cart_items_v1";

  function buildVariantKey(id, selectedSize, selectedOptions = {}) {
    const optionParts = Object.entries(selectedOptions)
      .filter(([, value]) => value)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}:${value}`);
    return `${id}|${selectedSize}|${optionParts.join("|")}`;
  }

  function handleAddToCart() {
    if (isPurchaseBlocked) return;
    addToCart(
      { ...product, price: discounted },
      size,
      {
        ...(colorOption && selectedColor ? { color: selectedColor } : {}),
        ...(sleeveOption ? { sleeve: selectedSleeve } : {})
      }
    );
  }

  function handleBuyNow() {
    if (isPurchaseBlocked) return;
    const selectedOptions = {
      ...(colorOption && selectedColor ? { color: selectedColor } : {}),
      ...(sleeveOption ? { sleeve: selectedSleeve } : {})
    };
    const variantKey = buildVariantKey(product.id, size, selectedOptions);
    const checkoutItem = {
      ...product,
      price: discounted,
      size,
      selectedOptions,
      variantKey,
      quantity: 1
    };
    sessionStorage.removeItem(CART_SELECTED_KEY);
    sessionStorage.setItem(BUY_NOW_KEY, JSON.stringify([checkoutItem]));
    navigate("/checkout");
  }

  return (
    <div className="container-pad section-space">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="grid items-start gap-4 md:grid-cols-[92px_1fr]">
          <div className="order-2 flex items-center gap-3 overflow-x-auto md:order-1 md:flex-col md:items-center md:overflow-visible">
            {activeImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setImageIndex(index)}
                className={`flex-shrink-0 overflow-hidden border transition md:w-[92px] ${
                  imageIndex === index ? "border-brand-wine" : "border-transparent"
                }`}
              >
                <div className="grid h-24 w-[70px] place-items-center overflow-hidden p-1 md:h-28 md:w-[92px]">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsImageOpen(true)}
            className="order-1 block w-full overflow-hidden md:order-2"
            aria-label="Open image in large view"
          >
            <div className="grid h-[460px] place-items-center sm:h-[620px] lg:h-[860px]">
              <img
                src={activeImages[imageIndex]}
                alt={product.name}
                className={"h-full w-full " + (imageIndex === activeImages.length - 1 ? "object-contain" : "object-cover")}
              />
            </div>
          </button>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-brand-wine/75">{product.category}</p>
          <h1 className="mt-2 font-heading text-4xl text-brand-wine sm:text-5xl">{product.name}</h1>

          <div className="mt-5 flex items-center gap-3">
            <span className="text-2xl font-semibold text-brand-wine sm:text-3xl">{formatPrice(discounted)}</span>
            {product.discountPercent > 0 && (
              <span className="text-lg text-brand-charcoal/50 line-through sm:text-xl">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-wider">Select size</p>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="text-xs font-semibold uppercase tracking-wider text-brand-wine underline underline-offset-4"
              >
                Size chart + measurement guide
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  onClick={() => setSize(option)}
                  className={`rounded-md px-4 py-2 text-sm font-semibold ${
                    size === option ? "bg-brand-wine text-white" : "border border-brand-wine text-brand-wine"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            {!size ? <p className="mt-3 text-xs font-semibold text-brand-wine">Please select a size to continue.</p> : null}
          </div>

          {colorOption ? (
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wider">{colorOption.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {colorOption.values.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedColor((current) => (current === option.id ? "" : option.id))}
                    className={`rounded-md px-4 py-2 text-sm font-semibold ${
                      selectedColor === option.id
                        ? "bg-brand-wine text-white"
                        : "border border-brand-wine text-brand-wine"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {sleeveOption ? (
            <div className="mt-6">
              <p className="text-sm font-semibold uppercase tracking-wider">{sleeveOption.label}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sleeveOption.values.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedSleeve(option.id)}
                    className={`rounded-md px-4 py-2 text-sm font-semibold ${
                      selectedSleeve === option.id
                        ? "bg-brand-wine text-white"
                        : "border border-brand-wine text-brand-wine"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              {!selectedSleeve ? (
                <p className="mt-3 text-xs font-semibold text-brand-wine">Please select sleeve option to continue.</p>
              ) : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-2 sm:gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isPurchaseBlocked}
              className="rounded-md bg-brand-wine px-5 py-2.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3 sm:text-sm"
            >
              Add to cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={isPurchaseBlocked}
              className="btn-like rounded-md border border-brand-wine px-5 py-2.5 text-xs font-semibold text-brand-wine disabled:cursor-not-allowed disabled:opacity-50 sm:px-6 sm:py-3 sm:text-sm"
            >
              Buy now
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className="rounded-md border border-brand-wine px-5 py-2.5 text-xs font-semibold text-brand-wine sm:px-6 sm:py-3 sm:text-sm"
            >
              {isWishlisted(product.id) ? "Remove wishlist" : "Add wishlist"}
            </button>
          </div>

          <div className="mt-10 rounded-2xl border border-brand-sand/60 bg-white p-6">
            <h2 className="font-heading text-3xl text-brand-wine">Product Overview</h2>
            <p className="mt-4 text-sm leading-7 text-brand-charcoal/80 sm:text-base">{overview}</p>

            {details.length ? (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-wine/85">Details</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-brand-charcoal/80">
                  {details.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {fit.length ? (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-wine/85">Fit</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-brand-charcoal/80">
                  {fit.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {whereToWear.length ? (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-wine/85">Where to wear</h3>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-brand-charcoal/80">
                  {whereToWear.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            ) : null}

            {care ? (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-wine/85">Care</h3>
                <p className="mt-3 text-sm text-brand-charcoal/80">{care}</p>
              </>
            ) : null}

            {disclaimer ? (
              <>
                <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-brand-wine/85">
                  Disclaimer
                </h3>
                <p className="mt-3 text-sm text-brand-charcoal/80">{disclaimer}</p>
              </>
            ) : null}

            {customisation ? <p className="mt-4 text-sm text-brand-charcoal/80">{customisation}</p> : null}
          </div>
          <section className="mt-8 rounded-2xl border border-brand-sand/70 bg-[#ece8e2] p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {productBadges.map((item) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="rounded-lg bg-white/80 px-3 py-4 text-center">
                    <div className="mx-auto mb-2 inline-flex text-brand-charcoal">
                      <Icon />
                    </div>
                    <h3 className="font-heading text-2xl text-brand-charcoal">{item.title}</h3>
                    <p className="mt-1 text-xs text-brand-charcoal/80 sm:text-sm">{item.text}</p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-[120] flex max-w-[220px] flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        <p className="rounded-xl bg-white/95 px-3 py-2 text-right text-xs font-semibold leading-5 text-brand-wine shadow-md sm:text-sm">
          For any queries, contact to our stylists
        </p>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          aria-label="Contact Saurene stylists on WhatsApp"
          className="grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105"
        >
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden="true">
            <path d="M12 2a9.9 9.9 0 0 0-8.59 14.83L2 22l5.33-1.39A10 10 0 1 0 12 2Zm0 18.19a8.2 8.2 0 0 1-4.16-1.13l-.3-.18-3.14.82.84-3.06-.2-.31A8.2 8.2 0 1 1 12 20.19Zm4.52-6.24c-.25-.12-1.46-.72-1.69-.8-.22-.08-.38-.12-.54.12s-.61.8-.74.96c-.14.15-.28.17-.53.06a6.7 6.7 0 0 1-1.97-1.2 7.34 7.34 0 0 1-1.35-1.68c-.14-.24-.02-.37.1-.48.11-.11.25-.28.38-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42s-.54-1.3-.74-1.78c-.2-.48-.4-.4-.54-.41h-.46c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2 0 1.17.86 2.3.98 2.46.12.16 1.69 2.57 4.08 3.6.57.25 1.01.4 1.36.51.57.18 1.08.16 1.49.1.45-.07 1.46-.6 1.67-1.18.2-.58.2-1.07.14-1.18-.05-.1-.22-.16-.47-.28Z" />
          </svg>
        </a>
      </div>

      {isImageOpen ? (
        <div
          className="fixed inset-0 z-[140] bg-black/95 p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Large product image preview"
        >
          <button
            type="button"
            onClick={() => setIsImageOpen(false)}
            className="absolute right-4 top-4 rounded-md border border-white/40 bg-black/45 p-2 text-white"
            aria-label="Close image preview"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>

          <div className="mx-auto grid h-full w-full max-w-[1320px] gap-4 md:grid-cols-[110px_1fr]">
            <div className="order-2 flex items-center gap-3 overflow-x-auto md:order-1 md:flex-col md:items-center md:overflow-y-auto">
              {activeImages.map((image, index) => (
                <button
                  key={`full-${image}`}
                  type="button"
                  onClick={() => setImageIndex(index)}
                  className={`overflow-hidden border transition ${
                    imageIndex === index ? "border-white" : "border-white/35"
                  }`}
                >
                <div className="grid h-24 w-[80px] place-items-center overflow-hidden p-1 md:h-28 md:w-[96px]">
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              </button>
            ))}
          </div>

            <div className="order-1 grid place-items-center md:order-2">
              <img
                src={activeImages[imageIndex]}
                alt={product.name}
                className="max-h-[88vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}

      {isSizeChartOpen ? (
        <div
          className="fixed inset-0 z-[125] grid place-items-center overflow-y-auto bg-black/80 p-3 sm:p-5"
          onClick={() => setIsSizeChartOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Size chart and measurement guide"
        >
          <div
            className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="border-b border-brand-sand/60 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-charcoal/60">
                    Size Charts
                  </p>
                  <h2 className="mt-2 font-heading text-2xl text-brand-wine sm:text-3xl">{product.name}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSizeChartOpen(false)}
                  className="rounded-full border border-brand-sand/60 p-2 text-brand-wine"
                  aria-label="Close size chart popup"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 6 12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] text-brand-charcoal/60">
                <span className="text-brand-wine">Inches</span>
                <span className="h-3 w-px bg-brand-sand/70" />
                <span>CM</span>
              </div>
            </div>
            <div className="grid max-h-[calc(92vh-170px)] gap-4 overflow-y-auto px-4 py-4 sm:gap-6 sm:px-6 sm:py-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4 sm:space-y-5">
                {sizeCharts.map((chart) => (
                  <div key={chart.src} className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-charcoal/60">
                      {chart.label}
                    </p>
                    <figure className="flex h-full flex-col rounded-2xl border border-brand-sand/60 bg-[#f8f3ec]">
                      <div className="grid min-h-[14rem] place-items-center px-3 py-3 sm:min-h-[18rem] sm:px-4 sm:py-4">
                        <img
                          src={chart.src}
                          alt={chart.label}
                          className="max-h-[48vh] w-auto max-w-full object-contain sm:max-h-[24rem] lg:max-h-[26rem]"
                        />
                      </div>
                    </figure>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-brand-charcoal/60">
                  Measurement Guide
                </p>
                <figure className="flex h-full flex-col rounded-2xl border border-brand-sand/60 bg-white">
                  <div className="grid min-h-[14rem] place-items-center px-3 py-3 sm:min-h-[18rem] sm:px-4 sm:py-4">
                    <img
                      src="/mesure.jpg"
                      alt="Measurement guide"
                      className="max-h-[48vh] w-auto max-w-full object-contain sm:max-h-[24rem] lg:max-h-[26rem]"
                    />
                  </div>
                </figure>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
