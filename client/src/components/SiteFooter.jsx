import React from "react";
import { Link } from "react-router-dom";

export default function SiteFooter({ onShowContact }) {
  return (
    <footer className="border-t border-royal-100 bg-royal-950 text-royal-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.25fr_0.9fr_0.9fr] lg:px-8">
        <div>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="" className="h-14 w-14 rounded-2xl" />
            <p className="font-script text-4xl font-bold text-candy-300">Sparkle Bows</p>
          </div>
          <p className="mt-4 max-w-md text-base leading-7 text-royal-200">
            Sparkly hair bows fit for a princess, tied by hand one order at a time. 🎀
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-royal-400">
            Shop
          </p>
          <div className="mt-5 space-y-3 text-sm text-royal-300">
            <Link to="/collections/christmas" className="block transition hover:text-white">
              Christmas bows
            </Link>
            <Link to="/collections/birthday" className="block transition hover:text-white">
              Birthday bows
            </Link>
            <Link to="/collections/everyday" className="block transition hover:text-white">
              Everyday bows
            </Link>
            <Link to="/collections/team-spirit" className="block transition hover:text-white">
              Cheer &amp; team
            </Link>
            <Link to="/team-orders" className="block transition hover:text-white">
              Team &amp; bulk orders
            </Link>
            <Link to="/orders" className="block transition hover:text-white">
              Order history
            </Link>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-royal-400">
            Business
          </p>
          <div className="mt-5 space-y-3 text-sm text-royal-300">
            <Link to="/privacy" className="block transition hover:text-white">
              Privacy policy
            </Link>
            <Link to="/terms" className="block transition hover:text-white">
              Terms of service
            </Link>
            <Link to="/refunds" className="block transition hover:text-white">
              Refund policy
            </Link>
            <Link
              to="/shipping-policy"
              className="block transition hover:text-white"
            >
              Shipping policy
            </Link>
            <Link to="/profile" className="block transition hover:text-white">
              Customer profile
            </Link>
            <Link to="/settings" className="block transition hover:text-white">
              Account settings
            </Link>
            <button
              type="button"
              onClick={onShowContact}
              className="block text-left transition hover:text-white"
            >
              Contact support
            </button>
            <a
              href="mailto:sparklebowshop@gmail.com"
              className="block transition hover:text-white"
            >
              sparklebowshop@gmail.com
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-royal-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-royal-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div className="space-y-1">
                        <p>Sparkle Bows is owned and operated by CASSANDRA N PETERSON.</p>
          </div>
          <p>Copyright {new Date().getFullYear()} Sparkle Bows</p>
        </div>
      </div>
    </footer>
  );
}
