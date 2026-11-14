import React, { useContext } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShoppingBag, User } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { BUNDLE, FREE_SHIPPING_THRESHOLD, isChristmasSeason } from "../config/shop";
import { SparkleIcon } from "./ChristmasEffects";

const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-[15px] font-semibold transition ${
    isActive ? "bg-candy-100 text-candy-700" : "text-royal-900 hover:bg-royal-100 hover:text-royal-700"
  }`;

export default function Header({ cartItemCount, onShowLogin, onShowCart, onShowContact }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const festive = isChristmasSeason();

  const scrollToShop = () => {
    const go = () => document.getElementById("shop-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (location.pathname !== "/") {
      navigate("/");
      window.setTimeout(go, 150);
      return;
    }
    go();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 shadow-[0_6px_30px_-12px_rgba(91,33,182,0.35)]">
      {/* One short line so the header keeps the same height on phones. */}
      <div className="bg-gradient-to-r from-royal-900 via-royal-700 to-candy-600 text-[12px] font-bold tracking-wide text-gold-200">
        <div className="mx-auto max-w-7xl truncate px-4 py-2 text-center">
          {festive ? "🎄 " : "✨ "}
          {BUNDLE.size} bows for ${BUNDLE.price} · free shipping over ${FREE_SHIPPING_THRESHOLD}
          {festive ? " · order by Dec 12 for Christmas ✨" : ""}
        </div>
      </div>

      <div className="border-b-4 border-candy-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
          <button type="button" onClick={() => navigate("/")} className="group flex items-center gap-3" aria-label="Sparkle Bows home">
            <img src="/logo.svg" alt="" className="h-10 w-10 rounded-2xl sm:h-12 sm:w-12 shadow-md transition group-hover:rotate-[-6deg] group-hover:scale-105" />
            <span className="relative">
              <span className="whitespace-nowrap font-script text-[25px] font-bold leading-none text-candy-600 sm:text-[34px]">Sparkle Bows</span>
              <SparkleIcon size={14} className="twinkle-star -right-4 -top-1 text-gold-400" />
            </span>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" end className={navClass}>Home</NavLink>
            <button type="button" onClick={scrollToShop} className={navClass({ isActive: false })}>Shop</button>
            <NavLink to="/collections/christmas" className={navClass}>🎄 Christmas</NavLink>
            <NavLink to="/team-orders" className={navClass}>Team orders</NavLink>
            <button type="button" onClick={onShowContact} className={navClass({ isActive: false })}>Contact</button>
            {user && <NavLink to="/orders" className={navClass}>Orders</NavLink>}
            {user?.role === "admin" && (
              <NavLink to="/admin/dashboard" className={navClass}>
                <span className="inline-flex items-center gap-1.5"><LayoutDashboard className="h-4 w-4" />Dashboard</span>
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="inline-flex items-center gap-2 rounded-full border-2 border-royal-200 px-3 py-2 text-sm font-bold text-royal-800 transition hover:border-candy-300 hover:bg-candy-50"
                title="Profile"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user.name?.split(" ")[0] || "Account"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onShowLogin}
                className="whitespace-nowrap rounded-full border-2 border-royal-200 px-4 py-2 text-sm font-bold text-royal-800 transition hover:border-candy-300 hover:bg-candy-50"
              >
                Sign in
              </button>
            )}
            <button
              type="button"
              onClick={onShowCart}
              className="relative inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-candy-500/30 transition hover:scale-105"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-300 px-1.5 text-[11px] font-extrabold text-royal-900 ring-2 ring-white">
                  {cartItemCount > 99 ? "99+" : cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
