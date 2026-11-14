import React, { useEffect } from "react";
import { BUNDLE, FREE_SHIPPING_THRESHOLD, bundleSavings, linePrice } from "../config/shop";
import { SparkleIcon } from "./ChristmasEffects";

// What the cart is worth after the 3-for deal (same math the server uses).
export function cartDealState(items = []) {
  const bundle = bundleSavings(items);
  const full = items.reduce((sum, item) => sum + linePrice(item) * Number(item.quantity || 0), 0);
  return { savings: bundle.savings, toNextBundle: bundle.eligibleCount ? bundle.toNextBundle : 0, subtotal: Math.max(0, full - bundle.savings) };
}

// Pick the happiest message for what just changed when a bow was added.
export function dealMessage(before, after) {
  if (before.subtotal < FREE_SHIPPING_THRESHOLD && after.subtotal >= FREE_SHIPPING_THRESHOLD) {
    return { emoji: "🚚", title: "Yay! Free shipping unlocked!", text: "Your bows ship free." };
  }
  if (after.savings > before.savings) {
    return { emoji: "🎁", title: `${BUNDLE.size} for $${BUNDLE.price} unlocked!`, text: `You're saving $${after.savings.toFixed(2)}.` };
  }
  if (after.toNextBundle > 0) {
    return { emoji: "🎀", title: "Added to your bag!", text: `Add ${after.toNextBundle} more for ${BUNDLE.size} for $${BUNDLE.price}.` };
  }
  if (after.subtotal < FREE_SHIPPING_THRESHOLD) {
    return { emoji: "🎀", title: "Added to your bag!", text: `$${(FREE_SHIPPING_THRESHOLD - after.subtotal).toFixed(2)} more for free shipping.` };
  }
  return { emoji: "🎀", title: "Added to your bag!", text: "So sparkly! ✨" };
}

export default function DealToast({ message, onClose, onOpenCart }) {
  useEffect(() => {
    if (!message) return undefined;
    const id = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(id);
  }, [message, onClose]);

  if (!message) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[99999] flex justify-center px-4" role="status" aria-live="polite">
      <button
        type="button"
        onClick={() => {
          onOpenCart();
          onClose();
        }}
        key={message.id}
        className="deal-toast pointer-events-auto relative flex max-w-sm items-center gap-3 rounded-full bg-gradient-to-r from-candy-500 via-candy-400 to-royal-600 py-2.5 pl-3 pr-5 text-left text-white shadow-[0_18px_40px_-12px_rgba(255,45,135,0.6)] ring-4 ring-white"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-2xl">{message.emoji}</span>
        <span>
          <span className="block font-display text-base font-semibold leading-tight">{message.title}</span>
          <span className="block text-xs font-semibold text-white/90">{message.text} · View bag</span>
        </span>
        <SparkleIcon size={16} className="twinkle-star -right-1 -top-2 text-gold-300" />
        <SparkleIcon size={12} className="twinkle-star -left-1 bottom-0 text-gold-200" style={{ animationDelay: "0.7s" }} />
      </button>
    </div>
  );
}
