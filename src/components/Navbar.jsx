import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useWishlist } from "../contexts/WishlistContext";
import BrandLogo from "./BrandLogo";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/collections", label: "Collections" },
  { to: "/about", label: "About" }
];

function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h9.8a1 1 0 0 0 1-.8L21 7H7.4" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.7A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="8" r="3.3" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </svg>
  );
}

function ThemeIcon({ isDark }) {
  if (isDark) {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 1 0 9.8 9.8z" />
    </svg>
  );
}

function IconButton({ to, count, children, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="btn-like relative rounded-md border border-brand-sand bg-white p-2.5 text-brand-wine"
    >
      {children}
      {count > 0 ? (
        <span className="absolute -right-2 -top-2 min-w-5 rounded-md bg-brand-wine px-1 py-0.5 text-center text-[10px] font-bold text-white">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("saurene_theme");
    const dark = savedTheme === "dark";
    setIsDark(dark);
    document.documentElement.classList.toggle("dark-theme", dark);
  }, []);

  function toggleTheme() {
    setIsDark((prev) => {
      const next = prev === false;
      localStorage.setItem("saurene_theme", next ? "dark" : "light");
      document.documentElement.classList.toggle("dark-theme", next);
      return next;
    });
  }

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-brand-sand/60 bg-brand-ivory/95 backdrop-blur">
      <div className="container-pad flex h-16 items-center justify-between sm:h-20">
        <Link to="/" aria-label="Saurene home">
          <BrandLogo />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {isAdmin === false
            ? navLinks.map((item, index) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? "nav-link-active" : ""}`
                  }
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {item.label}
                </NavLink>
              ))
            : (
              <NavLink to="/admin/orders" className={({ isActive }) => `nav-link ${isActive ? "nav-link-active" : ""}`}>
                Admin Orders
              </NavLink>
            )}
        </nav>
        <div className="hidden items-center gap-4 text-sm md:flex">
          <button
            onClick={toggleTheme}
            className="btn-like rounded-md border border-brand-sand bg-white p-2.5 text-brand-wine"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            <ThemeIcon isDark={isDark} />
          </button>
          {isAdmin === false ? (
            <>
              <IconButton to="/wishlist" count={wishlistCount}>
                <HeartIcon />
              </IconButton>
              <IconButton to="/cart" count={cartCount}>
                <CartIcon />
              </IconButton>
            </>
          ) : null}
          {user ? (
            <>
              {isAdmin === false ? (
                <IconButton to="/account">
                  <AccountIcon />
                </IconButton>
              ) : (
                <Link to="/admin/orders" className="font-medium">
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="rounded-md border border-brand-wine px-3 py-1 font-medium text-brand-wine"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="btn-like rounded-md bg-brand-wine px-4 py-1.5 font-medium text-white"
            >
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={toggleTheme}
            className="btn-like rounded-md border border-brand-sand bg-white p-2 text-brand-wine"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Light mode" : "Dark mode"}
          >
            <ThemeIcon isDark={isDark} />
          </button>
          {isAdmin === false ? (
            <>
              <IconButton to="/wishlist" count={wishlistCount}>
                <HeartIcon />
              </IconButton>
              <IconButton to="/cart" count={cartCount}>
                <CartIcon />
              </IconButton>
            </>
          ) : null}
          <button
            onClick={() => setMenuOpen((prev) => prev === false)}
            className="grid h-9 w-9 place-items-center rounded-md border border-brand-wine text-brand-wine"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-brand-sand/60 bg-brand-ivory px-4 py-4 md:hidden">
          <nav className="grid gap-2">
            {isAdmin === false
              ? navLinks.map((item, index) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `rounded-md px-3 py-2.5 text-base font-semibold ${
                        isActive ? "bg-brand-wine text-white" : "text-brand-charcoal/85"
                      }`
                    }
                    style={{ animationDelay: `${index * 0.06}s` }}
                  >
                    {item.label}
                  </NavLink>
                ))
              : (
                <NavLink
                  to="/admin/orders"
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `rounded-md px-3 py-2.5 text-base font-semibold ${
                      isActive ? "bg-brand-wine text-white" : "text-brand-charcoal/85"
                    }`
                  }
                >
                  Admin Orders
                </NavLink>
              )}
          </nav>
          <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {user ? (
              <>
                {isAdmin === false ? (
                  <div className="flex items-center justify-center">
                    <IconButton to="/account" onClick={() => setMenuOpen(false)}>
                      <AccountIcon />
                    </IconButton>
                  </div>
                ) : (
                  <Link
                    to="/admin/orders"
                    onClick={() => setMenuOpen(false)}
                    className="btn-like rounded-md border border-brand-sand px-3 py-2 text-center font-medium"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-brand-wine px-3 py-2 font-medium text-brand-wine"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="btn-like col-span-2 rounded-md bg-brand-wine px-3 py-2 text-center font-medium text-white"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
