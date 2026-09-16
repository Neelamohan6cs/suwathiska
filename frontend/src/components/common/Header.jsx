import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  HiOutlineShoppingCart,
  HiOutlineUser,
  HiBars3,
  HiXMark,
  HiOutlineClipboardDocumentList,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import Logo from "./Logo";
import SearchBar from "../customer/SearchBar";
import NotificationBell from "./NotificationBell";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useLanguage } from "../../context/LanguageContext";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/products", label: "Products" },
  { to: "/#categories", label: "Categories" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { lang, toggleLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleSearch = (query) => {
    setDrawerOpen(false);
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-dairy-100 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center gap-4 sm:h-[72px]">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full text-dairy-700 lg:hidden"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <HiBars3 className="h-6 w-6" />
        </button>

        <Logo />

        <nav className="ml-4 hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `text-sm font-medium transition hover:text-dairy-700 ${
                  isActive ? "text-dairy-700" : "text-ink/60"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden flex-1 justify-center px-6 md:flex">
          <SearchBar onSearch={handleSearch} className="max-w-md" />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={toggleLang}
            className="hidden h-10 items-center rounded-full border border-dairy-200 px-3 text-xs font-bold text-dairy-700 transition hover:bg-dairy-50 sm:flex"
            aria-label="Toggle language"
          >
            <span className={lang === "en" ? "text-dairy-700" : "text-ink/30"}>EN</span>
            <span className="mx-1 text-ink/20">|</span>
            <span className={lang === "ta" ? "text-dairy-700" : "text-ink/30"}>தமிழ்</span>
          </button>

          <NotificationBell />

          <Link
            to="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-dairy-700 transition hover:bg-dairy-50"
            aria-label="Cart"
          >
            <HiOutlineShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-dairy-600 text-[10px] font-bold text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative hidden sm:block">
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="flex h-10 items-center gap-2 rounded-full border border-dairy-200 pl-1 pr-3 text-sm font-medium text-dairy-700 hover:bg-dairy-50"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dairy-100 font-display text-dairy-700">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </span>
                {user?.name?.split(" ")[0]}
              </button>
              {profileOpen && (
                <div className="absolute right-0 top-12 w-52 rounded-xl2 border border-dairy-100 bg-white p-1.5 shadow-card">
                  <Link to="/profile" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-dairy-50">
                    <HiOutlineUser className="h-4 w-4" /> Profile
                  </Link>
                  <Link to="/my-orders" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink/80 hover:bg-dairy-50">
                    <HiOutlineClipboardDocumentList className="h-4 w-4" /> My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-clay-600 hover:bg-clay-500/5"
                  >
                    <HiOutlineArrowRightOnRectangle className="h-4 w-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary hidden sm:inline-flex">
              Login
            </Link>
          )}
        </div>
      </div>

      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-ink/40" onClick={() => setDrawerOpen(false)} />
          <div className="animate-fadeIn absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-white p-5 shadow-card">
            <div className="flex items-center justify-between">
              <Logo />
              <button
                onClick={() => setDrawerOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-dairy-50"
                aria-label="Close menu"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5">
              <SearchBar onSearch={handleSearch} />
            </div>

            <nav className="mt-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.label}
                  to={link.to}
                  end={link.end}
                  onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2.5 text-sm font-medium ${
                      isActive ? "bg-dairy-50 text-dairy-700" : "text-ink/70"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-4 border-t border-dairy-100 pt-4">
              {isAuthenticated ? (
                <div className="flex flex-col gap-1">
                  <Link to="/profile" onClick={() => setDrawerOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-ink/70">
                    Profile
                  </Link>
                  <Link to="/my-orders" onClick={() => setDrawerOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-ink/70">
                    My Orders
                  </Link>
                  <Link to="/notifications" onClick={() => setDrawerOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-ink/70">
                    Notifications
                  </Link>
                  <button onClick={handleLogout} className="rounded-lg px-3 py-2.5 text-left text-sm text-clay-600">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link to="/login" onClick={() => setDrawerOpen(false)} className="btn-primary flex-1">
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setDrawerOpen(false)} className="btn-secondary flex-1">
                    Register
                  </Link>
                </div>
              )}
            </div>

            <button
              onClick={toggleLang}
              className="mt-auto flex h-10 items-center justify-center rounded-full border border-dairy-200 text-xs font-bold text-dairy-700"
            >
              <span className={lang === "en" ? "text-dairy-700" : "text-ink/30"}>EN</span>
              <span className="mx-1 text-ink/20">|</span>
              <span className={lang === "ta" ? "text-dairy-700" : "text-ink/30"}>தமிழ்</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
