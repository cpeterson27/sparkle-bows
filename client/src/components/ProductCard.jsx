import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Star } from "lucide-react";
import Confetti from "./Confetti";
import { SparkleIcon } from "./ChristmasEffects";
import { DEFAULT_MADE_TO_ORDER_DAYS, OCCASIONS } from "../config/shop";

function formatPrice(price) {
  return `$${Number(price || 0).toFixed(2)}`;
}

// Princess "gift tag" product card used on every page.
export function ProductCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  const firstImageUrl = product.images?.[0]?.url;
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
      <article
        onClick={() => navigate(`/product/${product._id}`)}
        className="royal-card group flex w-full max-w-[320px] cursor-pointer flex-col overflow-hidden rounded-[30px] bg-white shadow-[0_18px_40px_-22px_rgba(91,33,182,0.45)] ring-1 ring-royal-100 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_26px_50px_-20px_rgba(255,45,135,0.45)]"
      >
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-candy-50 via-white to-royal-50">
          <img
            src={firstImageUrl || "/logo.svg"}
            alt={product.images?.[0]?.alt || product.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
          />
          <SparkleIcon size={18} className="twinkle-star right-4 top-4 text-white drop-shadow" />
          <SparkleIcon size={12} className="twinkle-star bottom-6 left-5 text-gold-200 drop-shadow" style={{ animationDelay: "1.1s" }} />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {product.bestseller && (
              <span className="rounded-full bg-gold-300 px-2.5 py-1 text-[11px] font-extrabold text-royal-900 shadow">👑 Favorite</span>
            )}
            {product.newArrival && (
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-extrabold text-candy-600 shadow">New</span>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-royal-500">
            <span>{occasion ? `${occasion.emoji} ${occasion.label}` : "✨ Sparkle Bows"}</span>
            {reviewCount > 0 && (
              <span className="inline-flex items-center gap-1 text-royal-700">
                <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                {averageRating.toFixed(1)}
              </span>
            )}
          </div>
          <h3 className="font-display text-xl font-semibold leading-tight text-royal-950">{product.name}</h3>
          <p className="text-xs font-semibold text-royal-500">Tied to order · ships in {product.madeToOrderDays || DEFAULT_MADE_TO_ORDER_DAYS} days</p>
          <div className="mt-auto flex items-center justify-between gap-2 pt-2">
            <span className="rounded-full bg-candy-50 px-3 py-1.5 font-display text-lg font-semibold text-candy-600 ring-1 ring-candy-200">
              {formatPrice(product.price)}
            </span>
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
      </article>
    </>
  );
}
