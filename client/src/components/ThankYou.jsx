import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.config";
import { trackPurchase } from "../lib/analytics";
import { SparkleIcon } from "./ChristmasEffects";

// Works for signed-in shoppers and guests (guests get the public, address-free version of the order).
export default function ThankYou() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await api.get(`/api/orders/${orderId}`);
        if (active) setOrder(res.data);
      } catch {
        try {
          const res = await api.get(`/api/orders/public/${orderId}`);
          if (active) setOrder(res.data);
        } catch {
          if (active) setFailed(true);
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [orderId]);

  useEffect(() => {
    if (order) trackPurchase(order);
  }, [order]);

  return (
    <div className="px-4 py-16">
      <div className="relative mx-auto max-w-xl overflow-hidden rounded-[36px] bg-white p-8 text-center shadow-[0_24px_60px_-28px_rgba(91,33,182,0.5)] ring-1 ring-royal-100 sm:p-10">
        <SparkleIcon size={22} className="twinkle-star left-8 top-8 text-gold-400" />
        <SparkleIcon size={16} className="twinkle-star right-10 top-14 text-candy-400" style={{ animationDelay: "0.9s" }} />
        <p className="text-6xl">🎀</p>
        <h1 className="mt-4 font-display text-4xl font-semibold text-royal-950">Thank you!</h1>
        <p className="mt-3 text-base leading-7 text-royal-700/85">
          Your order is in, and we'll start tying your bows. We'll email you when they ship, with tracking.
        </p>
        {order?.items?.length ? (
          <ul className="mx-auto mt-6 max-w-sm space-y-2 text-left">
            {order.items.map((item, index) => (
              <li key={index} className="flex items-center justify-between rounded-2xl bg-royal-50 px-4 py-2.5 text-sm font-semibold text-royal-900">
                <span>{item.name || item.productId?.name || "Bow"}</span>
                <span className="text-royal-500">× {item.quantity}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {order?._id && <p className="mt-5 text-xs font-semibold text-royal-400">Order #{String(order._id).slice(-8).toUpperCase()}</p>}
        {!order && !failed && <p className="mt-6 text-sm font-semibold text-royal-500">Loading your order…</p>}
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg"
        >
          Back to the bow shop
        </Link>
      </div>
    </div>
  );
}
