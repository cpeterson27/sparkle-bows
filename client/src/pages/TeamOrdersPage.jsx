import React, { useState } from "react";
import { Send, Users } from "lucide-react";
import Seo from "../components/Seo";
import { sendContactMessage } from "../api/contact";
import { trackGenerateLead } from "../lib/analytics";
import { createFormProtectionState, getProtectedFormPayload } from "../lib/formProtection";
import { holidayDeadline } from "../config/shop";

// Team, studio, school, and wholesale requests. Sent through the contact form, so they arrive in the shop inbox.
const GROUP_TYPES = ["Cheer team", "Dance studio", "Sports team", "School or PTA", "Boutique (wholesale)", "Party or event", "Other"];

const empty = { name: "", email: "", phone: "", organization: "", groupType: GROUP_TYPES[0], quantity: "", colors: "", neededBy: "", details: "" };

export default function TeamOrdersPage() {
  const [form, setForm] = useState(empty);
  const [protection, setProtection] = useState(createFormProtectionState);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const holiday = holidayDeadline();
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim() || !form.quantity) {
      setError("Please add your name, email, and about how many bows you need.");
      return;
    }
    const message = [
      `Group: ${form.organization || "(not given)"} (${form.groupType})`,
      `Bows needed: ${form.quantity}`,
      `Colors: ${form.colors || "(not given)"}`,
      `Needed by: ${form.neededBy || "(not given)"}`,
      `Phone: ${form.phone || "(not given)"}`,
      "",
      form.details || "(no other details)",
    ].join("\n");
    setSending(true);
    try {
      await sendContactMessage(getProtectedFormPayload({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: `Team order request: ${form.quantity} bows${form.organization ? ` for ${form.organization}` : ""}`.slice(0, 120),
        message,
      }, protection));
      trackGenerateLead?.({ method: "team_order_form" });
      setSent(true);
      setForm(empty);
      setProtection(createFormProtectionState());
    } catch (submitError) {
      setError(submitError.response?.data?.error || "Your request couldn't be sent. Please try again or email sparklebowshop@gmail.com.");
    } finally {
      setSending(false);
    }
  };

  const input = "w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-3 text-sm text-royal-900 outline-none transition focus:border-candy-300 focus:ring-0";

  return (
    <div >
      <Seo title="Team & Bulk Bow Orders" description="Custom bows in your team, studio, or school colors. Team pricing for 10 or more bows." type="website" />
      <section className="bg-gradient-to-br from-royal-800 via-royal-700 to-candy-600 text-white">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] font-extrabold text-gold-200">📣 Teams · studios · schools · boutiques</p>
          <h1 className="mt-4 font-display text-4xl font-semibold text-white sm:text-5xl">Bows for your whole team</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-royal-100">
            Matching bows in your colors for cheer, dance, sports, school spirit, and parties. Every bow is made by hand
            to order. Ordering 10 or more? Tell us what you need and we'll send team pricing and a ready-by date.
          </p>
          {holiday.open && (
            <p className="mt-4 inline-block rounded-full bg-white/15 px-4 py-2 text-sm font-bold text-gold-200 ring-1 ring-white/25">
              🎄 Need them before Christmas? Send your request by {holiday.label}.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        {sent ? (
          <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-8 text-emerald-900">
            <h2 className="text-xl font-semibold">Thanks! Your request is in.</h2>
            <p className="mt-2 text-sm leading-7">We'll email you team pricing and a ready-by date, usually within 1–2 days.</p>
            <button type="button" onClick={() => setSent(false)} className="mt-4 text-sm font-semibold underline">Send another request</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid gap-5 rounded-[32px] bg-white ring-1 ring-royal-100 shadow-[0_20px_50px_-28px_rgba(91,33,182,0.45)] p-6 shadow-sm sm:grid-cols-2 sm:p-8">
            <input type="text" tabIndex="-1" autoComplete="off" aria-hidden="true" className="hidden"
              value={protection.website} onChange={(event) => setProtection((current) => ({ ...current, website: event.target.value }))} />
            <div className="flex items-center gap-2 sm:col-span-2"><Users className="h-5 w-5 text-candy-500" /><h2 className="text-lg font-semibold text-royal-950">Request team pricing</h2></div>
            <label className="block"><span className="mb-2 block text-sm font-medium text-royal-800">Your name *</span><input id="team-name" className={input} value={form.name} onChange={set("name")} autoComplete="name" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-royal-800">Email *</span><input id="team-email" type="email" className={input} value={form.email} onChange={set("email")} autoComplete="email" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-royal-800">Team, studio, or school</span><input id="team-org" className={input} value={form.organization} onChange={set("organization")} placeholder="e.g. Lincoln Elementary PTA" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-royal-800">Type of group</span>
              <select id="team-type" className={input} value={form.groupType} onChange={set("groupType")}>{GROUP_TYPES.map((type) => <option key={type}>{type}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-royal-800">About how many bows? *</span><input id="team-qty" type="number" min="1" className={input} value={form.quantity} onChange={set("quantity")} placeholder="e.g. 18" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-royal-800">Colors</span><input id="team-colors" className={input} value={form.colors} onChange={set("colors")} placeholder="e.g. navy and gold" /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-royal-800">Needed by</span><input id="team-date" type="date" className={input} value={form.neededBy} onChange={set("neededBy")} /></label>
            <label className="block"><span className="mb-2 block text-sm font-medium text-royal-800">Phone (optional)</span><input id="team-phone" type="tel" className={input} value={form.phone} onChange={set("phone")} autoComplete="tel" /></label>
            <label className="block sm:col-span-2"><span className="mb-2 block text-sm font-medium text-royal-800">Anything else? (style, logo, names, sizes)</span><textarea id="team-details" rows={4} className={input} value={form.details} onChange={set("details")} /></label>
            {error && <p className="rounded-2xl bg-candy-50 px-4 py-3 text-sm text-candy-700 sm:col-span-2" role="alert">{error}</p>}
            <button type="submit" disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-full bg-royal-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-60 sm:col-span-2">
              <Send className="h-4 w-4" />{sending ? "Sending…" : "Send request"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
