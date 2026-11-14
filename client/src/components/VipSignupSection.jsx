import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { createLead, getVipStatus } from "../api/leads";
import { trackGenerateLead } from "../lib/analytics";
import {
  createFormProtectionState,
  getProtectedFormPayload,
} from "../lib/formProtection";

export default function VipSignupSection({ user }) {
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showSection, setShowSection] = useState(true); // show by default
  const [error, setError] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [formProtection] = useState(createFormProtectionState);

  useEffect(() => {
    if (!user?.email) return;

    setEmail(user.email);

    const checkVip = async () => {
      try {
        const status = await getVipStatus(user.email);
        if (status.vipSubscribed) setShowSection(false); // hide if already VIP
      } catch (err) {
        console.error("VIP status check failed", err);
        // keep section visible on error
      }
    };
    checkVip();
  }, [user]);

  if (!showSection) return null; // hide only if confirmed VIP

  const handleVipClick = async () => {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) {
      setError("Enter your email address to join the VIP list.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      await createLead(
        getProtectedFormPayload(
          {
            email: normalizedEmail,
            firstName: user?.firstName || user?.name || "",
            source: "homepage",
          },
          formProtection,
        ),
      );
      trackGenerateLead({
        formName: "vip_signup",
        leadType: "vip",
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Unable to join VIP list right now. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border-y border-royal-100 bg-gradient-to-r from-candy-500 to-royal-600 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] font-extrabold text-gold-200">
            👑 VIP list
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold">Be the first to know.</h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-white/90">
            New collections, limited restocks, and exclusive offers — straight
            to your inbox. No spam, ever.
          </p>
          <div className="mt-6 space-y-3 text-sm font-bold text-white">
            <p>✦ Early access to new arrivals</p>
            <p>✦ Restock alerts on fan favorites</p>
            <p>✦ Exclusive discounts for subscribers</p>
          </div>
        </div>

        <div className="rounded-[32px] bg-white p-7 text-royal-950 shadow-xl flex flex-col items-center justify-center">
          {success ? (
            <div className="mt-6 flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              <p className="text-lg font-semibold text-royal-950">You're in!</p>
              <p className="text-sm text-royal-600">
                Watch your inbox for early access and exclusive offers.
              </p>
            </div>
          ) : (
            <>
              {error && (
                <p className="mb-4 text-sm text-red-600 text-center">{error}</p>
              )}
              <label htmlFor="vip-email" className="sr-only">
                Email address
              </label>
              <input
                id="vip-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="mb-4 w-full rounded-full border border-royal-100 bg-royal-50 px-5 py-3 text-sm text-royal-950 outline-none transition focus:border-candy-400 focus:bg-white focus:ring-2 focus:ring-candy-100"
              />
              <button
                type="button"
                onClick={handleVipClick}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-6 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {saving ? "Joining..." : "Join the VIP list"}
              </button>
              <p className="mt-4 text-xs text-royal-400 text-center">
                No spam. Unsubscribe any time.
              </p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
