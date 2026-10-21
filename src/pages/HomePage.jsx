import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import { getInstagramPosts } from "../services/instagram";

const homeImages = [
  "/homepage_image_1.png",
  "/homepage_image.png",
  "/homepage_image_2.png"
];

const mobileHomeImages = [
  "/mob_hm_1.png",
  "/mob_hm_2.png",
  "/mobile_hm_3.png"
];

export default function HomePage() {
  const featured = useMemo(
    () => [...products].sort(() => Math.random() - 0.5).slice(0, 3),
    []
  );
  const [instaPosts, setInstaPosts] = useState([]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [isInstaLoading, setIsInstaLoading] = useState(true);

  useEffect(() => {
    setIsInstaLoading(true);
    getInstagramPosts()
      .then(setInstaPosts)
      .catch(() => setInstaPosts([]))
      .finally(() => setIsInstaLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((current) => (current + 1) % homeImages.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div>
      <section className={`home-hero home-hero-active-${heroIndex}`}>
        {homeImages.map((image, index) => (
          <picture key={image} className={`home-hero-slide home-hero-image-${index}`}>
            <source media="(max-width: 900px), (max-width: 1180px) and (orientation: portrait)" srcSet={mobileHomeImages[index]} />
            <img
              src={image}
              alt=""
              aria-hidden="true"
              className={`home-hero-image ${index === heroIndex ? "home-hero-image-active" : ""}`}
            />
          </picture>
        ))}
        <div className="home-hero-shade" aria-hidden="true" />
        <div className="container-pad home-hero-content">
          <div className="home-hero-copy animate-fadeUp">
            <h1 className="home-hero-title font-heading text-4xl leading-tight text-brand-ivory sm:text-5xl lg:text-6xl">
              Elegance, made with intention.
            </h1>
            <p className="home-hero-text max-w-xl text-sm text-brand-ivory/85 sm:text-base">
              A woman’s fashion label built with care, patience, and purpose. Inspired by
              vintage femininity and timeless silhouettes.
            </p>
            <p className="home-hero-kicker max-w-xl text-sm text-brand-ivory/85 sm:text-base">
              Unfold slowly - fashion was never meant to rush
              <br />
              <span className="rush-tag mt-1 inline-block">NO RUSH SS'26</span>
            </p>
            <div className="home-hero-actions flex flex-wrap gap-2 sm:gap-3">
              <Link
                to="/product/agatha-dress"
                className="btn-like rounded-md bg-brand-wine px-5 py-2.5 text-xs font-semibold text-white sm:px-6 sm:py-3 sm:text-sm"
              >
                Shop the Agatha Dress
              </Link>
              <Link
                to="/collections"
                className="btn-like rounded-md border border-brand-ivory/75 px-5 py-2.5 text-xs font-semibold text-brand-ivory sm:px-6 sm:py-3 sm:text-sm"
              >
                Explore the Collection
              </Link>
              <Link
                to="/collections?category=Birthday%20edits"
                className="btn-like rounded-md border border-brand-ivory/75 px-5 py-2.5 text-xs font-semibold text-brand-ivory sm:px-6 sm:py-3 sm:text-sm"
              >
                Birthday Edit
              </Link>
            </div>
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
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {isInstaLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`insta-skeleton-${index}`}
                  className="min-w-[82%] snap-start overflow-hidden rounded-2xl border border-brand-sand/50 bg-white sm:min-w-[48%] lg:min-w-[calc((100%-2rem)/3)]"
                >
                  <div className="skeleton-shimmer h-80 w-full" />
                  <div className="space-y-2 p-4">
                    <div className="skeleton-shimmer h-4 w-full rounded" />
                    <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                  </div>
                </div>
              ))
            : instaPosts.slice(0, 3).map((post, index) => (
                <div
                  key={post.id}
                  className="min-w-[82%] snap-start overflow-hidden rounded-2xl border border-brand-sand/50 bg-white sm:min-w-[48%] lg:min-w-[calc((100%-2rem)/3)]"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <a
                    href={post.permalink}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`View Instagram post ${index + 1} from @saurene.official`}
                    className="group block aspect-[4/5] overflow-hidden"
                  >
                    <img
                      src={post.image}
                      alt={post.alt}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </a>
                </div>
              ))}
        </div>
      </section>
    </div>
  );
}
