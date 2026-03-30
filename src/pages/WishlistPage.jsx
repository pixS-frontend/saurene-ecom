import { Link } from "react-router-dom";
import { useWishlist } from "../contexts/WishlistContext";
import ProductCard from "../components/ProductCard";

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();

  return (
    <div className="container-pad section-space">
      <h1 className="font-heading text-4xl text-brand-wine sm:text-5xl">Wishlist</h1>
      {wishlistItems.length ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl bg-white p-8 text-center">
          <p>No saved products yet.</p>
          <Link to="/collections" className="mt-3 inline-block text-brand-wine underline">
            Browse collections
          </Link>
        </div>
      )}
    </div>
  );
}
