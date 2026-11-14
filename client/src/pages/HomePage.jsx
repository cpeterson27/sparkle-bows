import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Gift, Heart, Scissors, Truck } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import { useProducts } from "../hooks/use-products";
import { ProductCard } from "../components/ProductCard";
import VipSignupSection from "../components/VipSignupSection";
import Seo from "../components/Seo";
import api from "../api/axios.config";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { BUNDLE, FREE_SHIPPING_THRESHOLD, OCCASIONS, holidayDeadline, isChristmasSeason } from "../config/shop";
import { Castle, SantaSleigh, Snowfall, SparkleIcon, StringLights, TwinklingStars } from "../components/ChristmasEffects";

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(element);
    const fallback = window.setTimeout(() => setVisible(true), 1200);
    return () => {
      observer.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="inline-flex items-center gap-2 rounded-full bg-candy-100 px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.2em] text-candy-600">
        <SparkleIcon size={12} /> {eyebrow} <SparkleIcon size={12} />
      </p>
      <h2 className="mt-4 font-display text-4xl font-semibold text-royal-950 sm:text-5xl">{title}</h2>
      {children ? <p className="mt-3 text-base leading-7 text-royal-700/80">{children}</p> : null}
    </div>
  );
}

const PRODUCT_GRID = "grid justify-items-center gap-x-4 gap-y-10 [grid-template-columns:repeat(auto-fill,minmax(150px,1fr))] sm:gap-x-6 sm:gap-y-12 sm:[grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]";

export default function HomePage({ addToCart }) {
  const { user } = useContext(AuthContext);
  const { settings } = useSiteSettings();
  const [selected, setSelected] = useState("all");
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const { data: allProducts, isLoading } = useProducts({});

  useEffect(() => {
    api
      .get("/api/reviews/featured")
      .then((res) => setFeaturedReviews(res.data || []))
      .catch(() => {});
  }, []);

  const filters = [{ id: "all", label: "All bows", emoji: "✨" }, ...OCCASIONS];
  const products = (allProducts || []).filter(
    (product) => selected === "all" || (Array.isArray(product.occasions) && product.occasions.includes(selected)),
  );

  const holiday = holidayDeadline();
  const festive = isChristmasSeason();

  const scrollToShop = () => document.getElementById("shop-section")?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <div className="text-royal-950">
      <Seo
        title="Sparkly Hair Bows Fit for a Princess"
        description={settings.defaultDescription}
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Store",
          name: settings.organizationName || settings.siteName || "Sparkle Bows",
          description: settings.defaultDescription || "Sparkly hair bows fit for a princess, tied by hand to order.",
          url: settings.siteUrl || window.location.href,
        }}
      />

      {/* HERO: a night sky over a storybook castle, with Santa flying past in season */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_#7e22ce_0%,_#3b0764_45%,_#1e0533_100%)] text-white">
        {festive && <StringLights />}
        <TwinklingStars count={34} />
        <Snowfall count={36} />
        {festive && <SantaSleigh />}
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-candy-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 top-32 h-80 w-80 rounded-full bg-gold-300/20 blur-3xl" />

        <div className="relative z-[3] mx-auto max-w-4xl px-4 pb-40 pt-16 text-center sm:pb-64 sm:pt-20">
          <FadeIn>
            {festive && holiday.open ? (
              <Link
                to="/collections/christmas"
                className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-gold-200 ring-1 ring-white/25 backdrop-blur transition hover:bg-white/25"
              >
                🎄 Order by {holiday.label} for Christmas
                {holiday.daysLeft <= 14 ? ` · ${holiday.daysLeft} day${holiday.daysLeft === 1 ? "" : "s"} left` : ""}
              </Link>
            ) : (
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-gold-200 ring-1 ring-white/25">
                👑 Tied by hand, one order at a time
              </p>
            )}
            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] sm:text-7xl">
              Bows fit for a <span className="sparkle-text font-script text-6xl sm:text-8xl">princess</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-royal-100">
              Sparkly Christmas bows for photos, parties, and stockings. 
              Each one is tied after you order it. Pick any {BUNDLE.size} for ${BUNDLE.price}!
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={scrollToShop}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-300 via-gold-200 to-gold-300 px-7 py-3.5 text-base font-extrabold text-royal-900 shadow-lg shadow-gold-400/30 transition hover:scale-105"
              >
                Shop the bows <ArrowRight className="h-5 w-5" />
              </button>
              {festive && (
                <Link
                  to="/collections/christmas"
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 px-7 py-3.5 text-base font-bold text-white ring-2 ring-white/40 transition hover:bg-white/20"
                >
                  🎄 Christmas bows
                </Link>
              )}
            </div>
          </FadeIn>
        </div>

        <Castle className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-36 w-full sm:h-52" />
      </section>

      {/* PROMISES: one short strip */}
      <section className="relative z-[3] -mt-8 px-4">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 rounded-[28px] bg-white p-4 shadow-[0_20px_50px_-25px_rgba(91,33,182,0.5)] ring-1 ring-royal-100 sm:grid-cols-4 sm:p-5">
          {[
            { icon: Scissors, text: "Tied by hand" },
            { icon: Gift, text: `${BUNDLE.size} bows for $${BUNDLE.price}` },
            { icon: Truck, text: `Free shipping over $${FREE_SHIPPING_THRESHOLD}` },
            { icon: Heart, text: "Wrapped like a gift" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 rounded-2xl bg-royal-50 px-3 py-2.5 text-sm font-bold text-royal-800">
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-candy-400 to-royal-500 text-white">
                <Icon className="h-4 w-4" />
              </span>
              {text}
            </div>
          ))}
        </div>
      </section>

      {/* THE SHOP: one row of occasion chips + every bow */}
      <section id="shop-section" className="mx-auto max-w-7xl scroll-mt-32 px-4 py-16 sm:px-6 lg:px-8">
        <FadeIn>
          <SectionTitle eyebrow="The bow shop" title={OCCASIONS.length > 1 ? "Pick your sparkle" : "🎄 Christmas bows"}>
            {OCCASIONS.length > 1 ? "Tap a chip to find the perfect bow." : "Tied by hand for Christmas photos, parties, and stockings."}
          </SectionTitle>
          {OCCASIONS.length > 1 && <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {filters.map((filter) => (
              <button
                type="button"
                key={filter.id}
                onClick={() => setSelected(filter.id)}
                className={`rounded-full px-5 py-2.5 text-[15px] font-bold transition ${
                  selected === filter.id
                    ? "bg-gradient-to-r from-candy-500 to-royal-600 text-white shadow-lg shadow-candy-500/30"
                    : "bg-white text-royal-800 ring-2 ring-royal-100 hover:ring-candy-300"
                }`}
              >
                {filter.emoji} {filter.label}
              </button>
            ))}
          </div>}
        </FadeIn>

        {isLoading ? (
          <div className={`mt-10 ${PRODUCT_GRID}`}>
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[4/5.4] w-full max-w-[320px] animate-pulse rounded-[30px] bg-white/80" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-[30px] border-2 border-dashed border-royal-200 bg-white/80 p-10 text-center">
            <p className="text-4xl">🎀</p>
            <p className="mt-3 font-display text-xl text-royal-900">New bows are being tied right now!</p>
            <p className="mt-2 text-sm text-royal-600">Check back soon, or join the list below to hear first.</p>
          </div>
        ) : (
          <div className={`mt-10 ${PRODUCT_GRID}`}>
            {products.map((product, index) => (
              <div key={product._id || product.id} className="flex w-full justify-center">
                <ProductCard product={product} onAddToCart={addToCart} />
              </div>
            ))}
          </div>
        )}

        <FadeIn className="mt-12">
          <Link
            to="/team-orders"
            className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 rounded-[28px] bg-gradient-to-r from-royal-700 to-candy-600 p-6 text-white shadow-lg sm:flex-row"
          >
            <span className="text-center sm:text-left">
              <span className="block font-display text-2xl font-semibold">📣 Bows for the whole squad?</span>
              <span className="block text-sm text-royal-100">Cheer, dance, and class sets in your colors, with team pricing.</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-extrabold text-royal-800">
              Team orders <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        </FadeIn>
      </section>

      {/* MEET THE MAKER (filled in from admin Site Settings) */}
      {settings.makerStory ? (
        <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <FadeIn>
            <div className="relative grid items-center gap-8 overflow-hidden rounded-[36px] bg-white p-8 shadow-[0_20px_50px_-25px_rgba(91,33,182,0.45)] ring-1 ring-royal-100 md:grid-cols-[220px_1fr]">
              <SparkleIcon size={22} className="twinkle-star right-8 top-6 text-gold-400" />
              {settings.makerPhoto ? (
                <img
                  src={settings.makerPhoto}
                  alt={settings.makerName ? `${settings.makerName}, the bow maker` : "The bow maker"}
                  className="mx-auto aspect-square w-full max-w-[220px] rounded-full object-cover ring-8 ring-candy-100"
                />
              ) : null}
              <div className={settings.makerPhoto ? "" : "md:col-span-2"}>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-candy-600">👑 Meet the maker</p>
                {settings.makerName ? <h2 className="mt-2 font-script text-5xl font-bold text-royal-800">{settings.makerName}</h2> : null}
                <p className="mt-4 whitespace-pre-line text-base leading-8 text-royal-800/80">{settings.makerStory}</p>
                <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold">
                  {[
                    ["Instagram", settings.instagramUrl],
                    ["TikTok", settings.tiktokUrl],
                    ["Facebook", settings.facebookUrl],
                  ]
                    .filter(([, url]) => url)
                    .map(([label, url]) => (
                      <a key={label} href={url} target="_blank" rel="noreferrer" className="rounded-full bg-royal-50 px-4 py-2 text-royal-800 ring-1 ring-royal-200 hover:bg-candy-50 hover:ring-candy-300">
                        {label}
                      </a>
                    ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </section>
      ) : null}

      {/* REVIEWS (only once there are some) */}
      {featuredReviews.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <FadeIn>
            <SectionTitle eyebrow="Happy customers" title="Sparkly reviews" />
          </FadeIn>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {featuredReviews.slice(0, 3).map((review, index) => (
              <FadeIn key={review._id} delay={index * 90} className="w-full max-w-sm">
                <article className="rounded-[24px] bg-white px-5 py-4 shadow-[0_14px_34px_-24px_rgba(91,33,182,0.45)] ring-1 ring-royal-100">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display font-semibold text-candy-600">{review.userName}</p>
                    <span className="text-sm text-gold-400">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="mt-1.5 text-[15px] leading-6 text-royal-800/85">“{review.text}”</p>
                </article>
              </FadeIn>
            ))}
          </div>
        </section>
      )}

      {/* VIP SIGNUP */}
      <VipSignupSection user={user} />

      {/* CLOSING CTA */}
      <section className="relative overflow-hidden px-4 py-20 text-center">
        <SparkleIcon size={26} className="twinkle-star left-[12%] top-10 text-gold-400" />
        <SparkleIcon size={18} className="twinkle-star right-[14%] top-16 text-candy-400" style={{ animationDelay: "0.8s" }} />
        <SparkleIcon size={14} className="twinkle-star bottom-12 left-[30%] text-royal-400" style={{ animationDelay: "1.6s" }} />
        <FadeIn>
          <h2 className="font-display text-4xl font-semibold text-royal-950 sm:text-5xl">
            {festive ? "Ready to wrap something sparkly?" : "Ready for a new favorite bow?"}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-royal-700/80">
            {festive
              ? `Order by ${holiday.label} and your bows arrive before Christmas, tied, packed, and ready to give.`
              : "Pick a few favorites and we'll tie them, pack them, and send them your way."}
          </p>
          <button
            type="button"
            onClick={scrollToShop}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-8 py-4 text-base font-extrabold text-white shadow-lg shadow-candy-500/30 transition hover:scale-105"
          >
            Shop all bows <ArrowRight className="h-5 w-5" />
          </button>
        </FadeIn>
      </section>
    </div>
  );
}
