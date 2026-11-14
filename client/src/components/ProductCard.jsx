import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import Confetti from "./Confetti";
import { SparkleIcon } from "./ChristmasEffects";
import { DEFAULT_MADE_TO_ORDER_DAYS, OCCASIONS } from "../config/shop";

function formatPrice(price) {
  return `$${Number(price || 0).toFixed(2)}`;
}

// Icicles: tapered, slightly bent, different widths and lengths, some with a drip at the tip.
// Built once from a fixed pattern so every card looks the same.
const ICICLES = (() => {
  const lengths = [8, 22, 12, 40, 16, 6, 30, 52, 14, 9, 26, 44, 11, 18, 7, 34, 20, 10, 46, 15, 8, 28, 12];
  const widths = [14, 18, 13, 22, 15, 11, 19, 24, 15, 12, 18, 23, 13, 16, 11, 20, 16, 12, 23, 15, 12, 19, 14];
  const list = [];
  let x = 4;
  for (let i = 0; x < 296; i += 1) {
    const w = widths[i % widths.length];
    const len = lengths[i % lengths.length];
    const bend = ((i * 7) % 5) - 2; // tip leans a little left or right
    list.push({ x, w: Math.min(w, 296 - x), len, bend, drip: len > 25 && i % 3 !== 1 });
    x += w - 1;
  }
  return list;
})();

function Icicles() {
  return (
    <svg viewBox="0 0 300 64" className="mx-auto -mt-1 block h-auto w-[90%]" aria-hidden="true">
      <defs>
        <linearGradient id="icicle-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8fb1ea" />
          <stop offset="0.3" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#d4e3fc" />
          <stop offset="1" stopColor="#7fa3e0" />
        </linearGradient>
        <linearGradient id="icicle-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.75" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
        </linearGradient>
        <mask id="icicle-mask">
          <rect width="300" height="64" fill="url(#icicle-fade)" />
        </mask>
      </defs>
      <g mask="url(#icicle-mask)">
        {ICICLES.map(({ x, w, len, bend, drip }, index) => {
          const tipX = x + w / 2 + bend;
          return (
            <g key={index}>
              <path
                d={`M${x} 0 C ${x + w * 0.12} ${len * 0.35}, ${tipX - w * 0.14} ${len * 0.8}, ${tipX} ${len} C ${tipX + w * 0.14} ${len * 0.8}, ${x + w * 0.88} ${len * 0.35}, ${x + w} 0 Z`}
                fill="url(#icicle-body)"
                stroke="#a7c0ec"
                strokeWidth="0.6"
              />
              <path d={`M${x + w * 0.3} 1 Q ${x + w * 0.38} ${len * 0.45}, ${tipX - 0.5} ${len * 0.82}`} stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.9" />
              {drip && <ellipse cx={tipX} cy={len + 3.5} rx="1.4" ry="2" fill="#a7c0ec" />}
            </g>
          );
        })}
      </g>
      {/* frosty rim the icicles hang from */}
      <path d="M0 0 H300 V3 Q 150 6 0 3 Z" fill="#eef4ff" />
    </svg>
  );
}

// Snow drift that slopes up from left to right, with soft blue shading underneath.
function SnowDrift() {
  return (
    <svg viewBox="0 0 300 70" preserveAspectRatio="none" className="relative z-[1] block h-14 w-full" aria-hidden="true">
      <defs>
        <linearGradient id="drift-snow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f3f7ff" />
        </linearGradient>
      </defs>
      {/* blue shadow under the drift's edge */}
      <path d="M0 70 V48 C 40 46, 90 40, 140 30 C 190 20, 230 5, 262 3 C 286 2, 300 10, 300 22 V70 Z" fill="#b8cdf2" opacity="0.75" />
      <path d="M0 70 V51 C 40 49, 90 43, 140 33 C 190 23, 230 8, 262 6 C 285 5, 299 13, 300 25 V70 Z" fill="#d6e3fa" />
      {/* the drift */}
      <path d="M0 70 V55 C 40 53, 92 47, 142 37 C 192 27, 232 13, 263 11 C 284 10, 297 17, 300 28 V70 Z" fill="url(#drift-snow)" />
      <path d="M160 33 C 196 25, 228 14, 258 12" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <g fill="#b8cdf2">
        <circle cx="70" cy="60" r="1.3" />
        <circle cx="205" cy="34" r="1.1" />
        <circle cx="120" cy="50" r="0.9" />
      </g>
    </svg>
  );
}

// Product card: the bow photo exactly as uploaded, a snow drift under it, the details panel, and icicles.
export function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const imageUrl = product.images?.[0]?.url || "/logo.svg";
  const reviewCount = product.reviews?.length || 0;
  const averageRating = reviewCount ? product.reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0;
  const occasion = OCCASIONS.find((item) => product.occasions?.includes(item.id));

  const handleAdd = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!onAddToCart) return;
    onAddToCart(product, 1);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  return (
    <>
      <Confetti show={showConfetti} />
      <article onClick={() => navigate(`/product/${product._id}`)} className="group relative flex w-full max-w-[300px] cursor-pointer flex-col">
        <div className="absolute left-1 top-1 z-[4] flex flex-col items-start gap-1.5">
          {product.bestseller && <span className="rounded-full bg-gold-300 px-2.5 py-1 text-[11px] font-extrabold text-royal-900 shadow">👑 Favorite</span>}
          {product.newArrival && <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-candy-600 shadow">New</span>}
        </div>

        {/* The bow, shown just as it was photographed */}
        <div className="relative z-[2] mx-auto -mb-6 flex aspect-square w-[92%] items-end justify-center">
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            loading="lazy"
            className="max-h-full max-w-full object-contain transition duration-500 group-hover:-translate-y-2"
          />
          <SparkleIcon size={16} className="twinkle-star -right-1 top-2 text-gold-400" />
        </div>

        <SnowDrift />

        <div className="relative z-[1] -mt-px rounded-b-[22px] bg-gradient-to-b from-white via-white to-[#eef4ff] px-3 pb-4 pt-0 text-center shadow-[0_18px_30px_-22px_rgba(91,33,182,0.45)] sm:px-5">
          <p className="text-xs font-bold text-royal-500">
            {occasion ? `${occasion.emoji} ${occasion.label}` : "✨ Sparkle Bows"}
            {reviewCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-0.5 text-royal-700">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                {averageRating.toFixed(1)}
              </span>
            )}
          </p>
          <h3 className="mt-1 font-display text-lg font-semibold leading-tight text-royal-950 sm:text-xl">{product.name}</h3>
          <p className="mt-1 text-xs font-semibold text-royal-500">Ships in {product.madeToOrderDays || DEFAULT_MADE_TO_ORDER_DAYS} days</p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="font-display text-xl font-semibold text-candy-600">{formatPrice(product.price)}</span>
            {onAddToCart && (
              <button
                type="button"
                onClick={handleAdd}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-3.5 py-2 text-sm font-bold text-white shadow-md transition hover:scale-105"
              >
                <ShoppingBag className="h-4 w-4" />
                Add
              </button>
            )}
          </div>
        </div>

        <Icicles />
      </article>
    </>
  );
}
