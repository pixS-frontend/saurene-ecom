import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import { getInstagramPosts } from "../services/instagram";

const homeImages = [
  "/home_img_1.jpg",
  "/home_img_2.jpg",
  "/home_img_3.jpg",
  "/home_img_4.jpg",
  "/home_img_5.jpeg",
  "/home_img_6.jpeg"
];

export default function HomePage() {
  const featured = useMemo(
    () => [...products].sort(() => Math.random() - 0.5).slice(0, 3),
    []
  );
  const [instaPosts, setInstaPosts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroLoaded, setIsHeroLoaded] = useState(false);
  const [isInstaLoading, setIsInstaLoading] = useState(true);

  useEffect(() => {
    setIsInstaLoading(true);
    getInstagramPosts()
      .then(setInstaPosts)
      .catch(() => setInstaPosts([]))
      .finally(() => setIsInstaLoading(false));
  }, []);

  useEffect(() => {
    setIsHeroLoaded(false);
    const timer = setInterval(() => {
      setHeroIndex((current) => (current + 1) % homeImages.length);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <section className="container-pad grid items-center gap-8 pb-12 pt-8 sm:pb-16 sm:pt-12 md:grid-cols-2">
        <div className="order-2 animate-fadeUp md:order-1">
          <h1 className="mt-4 font-heading text-4xl leading-tight text-brand-wine sm:text-5xl lg:text-6xl">
            Elegance, made with intention.
          </h1>
          <p className="mt-5 max-w-xl text-sm text-brand-charcoal/80 sm:text-base">
            A woman’s fashion label built with care, patience, and purpose. Inspired by
            vintage femininity and timeless silhouettes.
          </p>
          <p className="mt-5 max-w-xl text-sm text-brand-charcoal/80 sm:text-base">
            Unfold slowly - fashion was never meant to rush
            <br />
            <span className="rush-tag mt-1 inline-block">NO RUSH SS'26</span>
          </p>
          <div className="mt-7 flex flex-wrap gap-2 sm:gap-3">
            <Link
              to="/collections"
              className="btn-like rounded-md bg-brand-wine px-5 py-2.5 text-xs font-semibold text-white sm:px-6 sm:py-3 sm:text-sm"
            >
              Explore the Collection
            </Link>
            <Link
              to="/collections?category=Birthday%20edits"
              className="btn-like rounded-md border border-brand-wine px-5 py-2.5 text-xs font-semibold text-brand-wine sm:px-6 sm:py-3 sm:text-sm"
            >
              Birthday Edit
            </Link>
          </div>
        </div>
        <div className="order-1 animate-floatIn overflow-hidden rounded-3xl border border-brand-sand/50 bg-brand-ivory/45 md:order-2">
          <div className="grid h-[360px] place-items-center sm:h-[440px] lg:h-[520px]">
            {!isHeroLoaded ? <div className="skeleton-shimmer h-full w-full" /> : null}
            <img
              src={homeImages[heroIndex]}
              alt="Saurene collection highlight"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setIsHeroLoaded(true)}
              onError={(event) => {
                event.currentTarget.src = "/home_img_1.jpg";
              }}
              className={`h-full w-full object-contain transition-opacity duration-500 ${
                isHeroLoaded ? "opacity-100" : "opacity-0"
              }`}
            />
          </div>
        </div>
      </section>

      <section className="container-pad section-space">
        <div className="feature-tagline-wrap">
          <p className="feature-tagline-line">Unfold slowly - fashion was never meant to rush</p>
          <p className="feature-tagline-badge">NO RUSH SS'26</p>
        </div>

        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <h2 className="font-heading text-3xl text-brand-wine sm:text-4xl">Featured now</h2>
          <Link to="/collections" className="text-xs font-semibold uppercase tracking-wider sm:text-sm">
            View all
          </Link>
        </div>
        <div className="mobile-scroll-row flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0">
          {featured.map((product) => (
            <div key={product.id} className="min-w-[82%] snap-start sm:min-w-[48%] md:min-w-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <section className="container-pad section-space">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <h2 className="font-heading text-3xl text-brand-wine sm:text-4xl">Gram</h2>
          <a
            href="https://www.instagram.com/saurene.official?igsh=MmZ1eTFpaHhhbmc5"
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold uppercase tracking-wider sm:text-sm"
          >
            Follow on Instagram
          </a>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isInstaLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`insta-skeleton-${index}`}
                  className="overflow-hidden rounded-2xl border border-brand-sand/50 bg-white"
                >
                  <div className="skeleton-shimmer h-80 w-full" />
                  <div className="space-y-2 p-4">
                    <div className="skeleton-shimmer h-4 w-full rounded" />
                    <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                  </div>
                </div>
              ))
            : instaPosts.map((post, index) => (
                <a
                  key={post.id}
                  href={post.permalink || "https://www.instagram.com/saurene.official"}
                  target="_blank"
                  rel="noreferrer"
                  className="overflow-hidden rounded-2xl border border-brand-sand/50 bg-white"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <img loading="lazy" decoding="async" src={post.image} alt={post.caption} className="h-80 w-full object-cover" />
                  <p className="line-clamp-2 p-4 text-sm text-brand-charcoal/75">{post.caption}</p>
                </a>
              ))}
        </div>
      </section>
    </div>
  );
}
