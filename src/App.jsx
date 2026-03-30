import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const HomePage = lazy(() => import("./pages/HomePage"));
const CollectionsPage = lazy(() => import("./pages/CollectionsPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const AccountPage = lazy(() => import("./pages/AccountPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const InfoPage = lazy(() => import("./pages/InfoPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const AdminOrdersPage = lazy(() => import("./pages/AdminOrdersPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

function AppFallback() {
  return (
    <div className="container-pad section-space">
      <div className="grid gap-4">
        <div className="skeleton-shimmer h-10 w-56 rounded" />
        <div className="skeleton-shimmer h-48 w-full rounded-2xl" />
        <div className="skeleton-shimmer h-48 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<AppFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/product/:slug" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/order-success" element={<OrderSuccessPage />} />
          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrdersPage />
              </AdminRoute>
            }
          />
          <Route path="/info/:slug" element={<InfoPage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
