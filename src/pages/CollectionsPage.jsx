import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { categories, products } from "../data/products";

const sortOptions = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price-low-high" },
  { label: "Price: High to Low", value: "price-high-low" }
];

const relevanceOrder = [
  "elite-dress",
  "koa-dress",
  "lumi-dress",
  "moka-midi-dress",
  "aria-dress",
  "aria-top-with-scarf",
  "aria-skirt",
  "vela-top",
  "crest-top"
];

const relevanceRank = new Map(relevanceOrder.map((slug, index) => [slug, index + 1]));

function compareByRelevance(a, b) {
  const rankA =
    relevanceRank.get(a.slug) ??
    (a.category === "Curated Sets" ? 100 : a.category === "Dresses" ? 200 : 300);
  const rankB =
    relevanceRank.get(b.slug) ??
    (b.category === "Curated Sets" ? 100 : b.category === "Dresses" ? 200 : 300);

  if (rankA !== rankB) return rankA - rankB;
  return a.name.localeCompare(b.name);
}

export default function CollectionsPage() {
  const [params, setParams] = useSearchParams();
  const defaultCategory = params.get("category") || "All";
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(defaultCategory);
  const [sortBy, setSortBy] = useState("relevance");

  const filteredProducts = useMemo(() => {
    const matched = products.filter((product) => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory ||
        product.collection === activeCategory;
      return matchesSearch && matchesCategory;
    });

    const next = [...matched];
    if (sortBy === "price-low-high") {
      next.sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
      return next;
    }
    if (sortBy === "price-high-low") {
      next.sort((a, b) => b.price - a.price || a.name.localeCompare(b.name));
      return next;
    }
    next.sort(compareByRelevance);
    return next;
  }, [search, activeCategory, sortBy]);

  function onCategorySelect(category) {
    setActiveCategory(category);
    if (category === "All") {
      const next = new URLSearchParams(params);
      next.delete("category");
      setParams(next);
      return;
    }
    setParams({ category });
  }

  return (
    <div className="container-pad section-space">
      <div className="mb-10">
        <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">Collections</h1>
        <p className="mt-3 max-w-2xl text-sm text-brand-charcoal/75 sm:text-base">
          Browse all products with quick search and category filters.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products..."
          className="w-full rounded-full border border-brand-sand px-4 py-2 outline-none focus:border-brand-wine md:max-w-sm"
        />
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            className="rounded-md border border-brand-sand px-3 py-2 text-xs font-semibold text-brand-wine sm:text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategorySelect(category)}
              className={`rounded-md px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${
                activeCategory === category
                  ? "bg-brand-wine text-white"
                  : "border border-brand-wine text-brand-wine"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} compactMobile />
        ))}
      </div>
      {!filteredProducts.length && (
        <p className="rounded-2xl bg-white p-6 text-center text-brand-charcoal/70">
          No products found for your search.
        </p>
      )}
    </div>
  );
}
