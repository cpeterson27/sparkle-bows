import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import Confetti from "./Confetti";
import { SparkleIcon } from "./ChristmasEffects";
import { DEFAULT_MADE_TO_ORDER_DAYS, OCCASIONS } from "../config/shop";

function formatPrice(price) {
  return `$${Number(price || 0).toFixed(2)}`;
}

// A photo with a see-through background (a "cutout") sits right on the snow. We check the four corners of the
// loaded photo: if they're transparent it's a cutout. Other photos get soft, faded edges so they don't look like a box.
function hasTransparentCorners(img) {
  try {
    const size = 24;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, size, size);
    const corners = [[0, 0], [size - 1, 0], [0, size - 1], [size - 1, size - 1]];
    return corners.every(([x, y]) => ctx.getImageData(x, y, 1, 1).data[3] < 40);
  } catch {
    return false; // photo host didn't allow reading pixels
  }
}

// Hanging icicles of different lengths along the bottom of the card.
const ICICLES = [14, 26, 10, 34, 18, 28, 12, 38, 20, 30, 12, 24, 16, 32, 10, 22];

function Icicles() {
  const step = 300 / ICICLES.length;
  return (
    <svg viewBox="0 0 300 42" preserveAspectRatio="none" className="mx-auto -mt-px block h-7 w-[86%]" aria-hidden="true">
      <defs>
        <linearGradient id="icicle-ice" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#cfe0ff" />
          <stop offset="1" stopColor="#a9c6ff" stopOpacity="0.75" />
        </linearGradient>
      </defs>
      {ICICLES.map((length, index) => {
        const x = index * step;
        return (
          <g key={index}>
            <path d={`M${x} 0 L${x + step} 0 L${x + step / 2} ${length} Z`} fill="url(#icicle-ice)" />
            <path d={`M${x + step * 0.35} 1 L${x + step / 2} ${length * 0.7}`} stroke="#ffffff" strokeWidth="1.2" opacity="0.9" />
          </g>
        );
      })}
    </svg>
  );
}

// Snowy-ledge product card: the bow sits on a snow drift, the details sit on a snow-capped panel with icicles below.
export function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const imageUrl = product.images?.[0]?.url || "/logo.svg";
  const [cutout, setCutout] = useState(false);
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
        {/* Badges */}
        <div className="absolute left-2 top-2 z-[4] flex flex-col items-start gap-1.5">
          {product.bestseller && <span className="rounded-full bg-gold-300 px-2.5 py-1 text-[11px] font-extrabold text-royal-900 shadow">👑 Favorite</span>}
          {product.newArrival && <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-candy-600 shadow">New</span>}
        </div>

        {/* The bow, no box */}
        <div className="relative z-[2] mx-auto -mb-9 flex aspect-square w-[90%] items-end justify-center">
          <img
            src={imageUrl}
            alt={product.images?.[0]?.alt || product.name}
            loading="lazy"
            crossOrigin={/^\/|res\.cloudinary\.com/.test(imageUrl) ? "anonymous" : undefined}
            onLoad={(event) => setCutout(hasTransparentCorners(event.currentTarget))}
            className={`transition duration-500 group-hover:-translate-y-2 group-hover:rotate-[-3deg] ${
              cutout
                ? "max-h-full max-w-full object-contain drop-shadow-[0_16px_14px_rgba(91,33,182,0.35)]"
                : "h-full w-full object-cover [mask-image:radial-gradient(ellipse_at_center,#000_52%,transparent_71%)]"
            }`}
          />
          <SparkleIcon size={18} className="twinkle-star right-3 top-4 text-gold-400" />
          <SparkleIcon size={12} className="twinkle-star left-4 top-1/3 text-candy-300" style={{ animationDelay: "1.1s" }} />
        </div>

        {/* Snow cap */}
        <svg viewBox="0 0 300 44" preserveAspectRatio="none" className="relative z-[1] block h-11 w-full drop-shadow-[0_-4px_6px_rgba(91,33,182,0.10)]" aria-hidden="true">
          <path d="M0 44 V30 Q 18 10 48 18 Q 74 2 108 14 Q 140 0 170 12 Q 204 -2 236 14 Q 266 4 286 20 Q 298 26 300 32 V44 Z" fill="#ffffff" />
          <circle cx="62" cy="22" r="1.6" fill="#c7dcff" />
          <circle cx="190" cy="18" r="1.4" fill="#c7dcff" />
          <circle cx="250" cy="24" r="1.8" fill="#e9d5ff" />
        </svg>

        {/* Details panel */}
        <div className="relative z-[1] -mt-px rounded-b-[26px] bg-gradient-to-b from-white via-white to-[#eef4ff] px-3 pb-4 pt-1 text-center sm:px-5 shadow-[0_18px_30px_-20px_rgba(91,33,182,0.45)]">
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
