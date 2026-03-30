import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="container-pad section-space text-center">
      <h1 className="font-heading text-6xl text-brand-wine">404</h1>
      <p className="mt-3 text-brand-charcoal/70">Page not found.</p>
      <Link to="/" className="mt-4 inline-block text-brand-wine underline">
        Return home
      </Link>
    </div>
  );
}
