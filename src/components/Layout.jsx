import { useEffect } from "react";
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  if (isAdmin && isAdminRoute === false && isLoginRoute === false) {
    return <Navigate to="/admin/orders" replace />;
  }

  return (
    <div className="min-h-screen text-brand-charcoal">
      {isAdmin === false && isHomePage ? <FirstAffairPopup /> : null}
      <Navbar />
      {isAdmin === false ? <PromoBar /> : null}
      <main>{children}</main>
      {isAdmin === false && isProductDetailsPage === false ? <TrustStrip /> : null}
      {isAdmin === false ? <Footer /> : null}
    </div>
  );
}
