import { Navigate, useLocation } from "react-router-dom";
import PromoBar from "./PromoBar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import TrustStrip from "./TrustStrip";
import FirstAffairPopup from "./FirstAffairPopup";
import { useAuth } from "../contexts/AuthContext";

export default function Layout({ children }) {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isProductDetailsPage = location.pathname.startsWith("/product/");
  const isHomePage = location.pathname === "/" || location.pathname === "/home";
  const isAdminRoute = location.pathname.startsWith("/admin");
  const isLoginRoute = location.pathname.startsWith("/login");

  if (isAdmin && !isAdminRoute && !isLoginRoute) {
    return <Navigate to="/admin/orders" replace />;
  }

  return (
    <div className="min-h-screen text-brand-charcoal">
      {!isAdmin && isHomePage ? <FirstAffairPopup /> : null}
      <Navbar />
      {!isAdmin ? <PromoBar /> : null}
      <main>{children}</main>
      {!isAdmin && !isProductDetailsPage ? <TrustStrip /> : null}
      {!isAdmin ? <Footer /> : null}
    </div>
  );
}
