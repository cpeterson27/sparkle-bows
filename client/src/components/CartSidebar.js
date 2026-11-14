import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import {
  ArrowRight,
  Gift,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  X,
} from "lucide-react";
import StripeCheckoutForm from "./StripeCheckoutForm";
import ConfirmModal from "./ConfirmModal";
import api from "../api/axios.config";
import { trackBeginCheckout } from "../lib/analytics";
import { BUNDLE, FREE_SHIPPING_THRESHOLD, bundleSavings, cartLineKey, linePrice } from "../config/shop";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
const DEFAULT_SHIPPING_POLICY =
  `Free U.S. shipping on orders over $${FREE_SHIPPING_THRESHOLD}. International shipping is calculated at checkout.`;
const DEFAULT_SAFETY_WARNING =
  "WARNING: Contains small parts. Not intended for children under 3. Use with adult supervision. Remove before sleeping.";

function formatCurrency(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

// Customers see at most two choices: Standard (cheapest) and Faster (quickest one that actually arrives sooner).
function arrivesText(rate) {
  const days = Number(rate?.estimatedDays || 0);
  return days ? `Arrives in about ${days} business day${days === 1 ? "" : "s"} after it ships` : "Tracked delivery";
}

function pickShippingChoices(rates) {
  const sorted = [...rates].sort((a, b) => Number(a.amount || 0) - Number(b.amount || 0));
  const standard = sorted[0];
  if (!standard) return [];
  const choices = [{ ...standard, label: standard.freeShipping ? "Free shipping" : "Standard shipping", arrives: arrivesText(standard) }];
  const standardDays = Number(standard.estimatedDays || 99);
  const faster = sorted.find((rate) => rate !== standard && Number(rate.estimatedDays || 99) < standardDays);
  if (faster && !standard.freeShipping) choices.push({ ...faster, label: "Faster shipping", arrives: arrivesText(faster) });
  return choices;
}

function ShippingRatePrice({ rate }) {
  if (rate?.freeShipping) {
    return (
      <span className="text-right">
        {Number(rate.actualAmount || 0) > 0 ? (
          <span className="mr-2 text-xs font-medium text-royal-400 line-through">
            {formatCurrency(rate.actualAmount)}
          </span>
        ) : null}
        <span className="font-semibold text-emerald-600">FREE</span>
      </span>
    );
  }

  return <span>{formatCurrency(rate?.amount)}</span>;
}

export default function CartSidebar({
  cart,
  cartTotal = 0,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  cartItemCount,
  user,
}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [checkoutTotals, setCheckoutTotals] = useState(null);
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [shippingRates, setShippingRates] = useState([]);
  const [selectedShippingRate, setSelectedShippingRate] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [, setRatesSubtotal] = useState(null);
  const [shippingPolicy, setShippingPolicy] = useState(DEFAULT_SHIPPING_POLICY);
  const [safetyWarning, setSafetyWarning] = useState(DEFAULT_SAFETY_WARNING);
  const [guestEmail, setGuestEmail] = useState("");
  const [shippingForm, setShippingForm] = useState({
    name: user?.name || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "US",
    phone: user?.phone || "",
  });

  const defaultAddress =
    user?.addresses?.find((address) => address.isDefault) ||
    user?.addresses?.[0];
  const validCartItems = cart.filter((item) => item?.productId?._id);
  const selectedShippingAmount = Number(selectedShippingRate?.amount || 0);
  const bundle = bundleSavings(validCartItems);
  const discountedSubtotal = Math.max(0, cartTotal - bundle.savings);
  const toFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - discountedSubtotal);
  const estimatedTotal = discountedSubtotal + selectedShippingAmount;
  const stripeOptions = useMemo(
    () => (clientSecret ? { clientSecret } : null),
    [clientSecret],
  );
  const cartRateSignature = useMemo(
    () =>
      validCartItems
        .map((item) => `${cartLineKey(item)}:${item.quantity}`)
        .sort()
        .join("|"),
    [validCartItems],
  );
  const addressRateSignature = useMemo(
    () =>
      [
        shippingForm.name,
        shippingForm.line1,
        shippingForm.line2,
        shippingForm.city,
        shippingForm.state,
        shippingForm.postalCode,
        shippingForm.country,
        shippingForm.phone,
      ]
        .map((value) => String(value || "").trim().toUpperCase())
        .join("|"),
    [shippingForm],
  );

  useEffect(() => {
    setShippingForm({
      name: defaultAddress?.name || user?.name || "",
      line1: defaultAddress?.line1 || "",
      line2: defaultAddress?.line2 || "",
      city: defaultAddress?.city || "",
      state: defaultAddress?.state || "",
      postalCode: defaultAddress?.postalCode || "",
      country: defaultAddress?.country || "US",
      phone: user?.phone || "",
    });
  }, [defaultAddress, user?.name, user?.phone]);

  const clearShippingRates = useCallback(() => {
    setShippingRates([]);
    setSelectedShippingRate(null);
    setRatesSubtotal(null);
    setCheckoutTotals(null);
    setClientSecret(null);
    setOrderId(null);
    setShowPayment(false);
  }, []);

  useEffect(() => {
    clearShippingRates();
  }, [cartRateSignature, clearShippingRates]);

  const updateShippingField = (field, value) => {
    clearShippingRates();
    setShippingForm((current) => ({ ...current, [field]: value }));
  };

  const buildShippingInfo = useCallback(() => ({
    name: shippingForm.name.trim(),
    line1: shippingForm.line1.trim(),
    line2: shippingForm.line2.trim(),
    city: shippingForm.city.trim(),
    state: shippingForm.state.trim(),
    postalCode: shippingForm.postalCode.trim(),
    country: (shippingForm.country || "US").trim().toUpperCase(),
    phone: shippingForm.phone.trim(),
  }), [shippingForm]);

  const validateCheckoutDetails = useCallback(() => {
    const country = (shippingForm.country || "US").trim().toUpperCase();

    if (!user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail.trim())) {
      return "Enter your email so we can send your receipt and tracking.";
    }

    if (
      !shippingForm.name ||
      !shippingForm.line1 ||
      !shippingForm.city ||
      !shippingForm.postalCode ||
      !country
    ) {
      return "Enter the full shipping details for the recipient before checkout.";
    }

    if ((country === "US" || country === "CA") && !shippingForm.state) {
      return "Enter the state or province before loading shipping options.";
    }

    if (country !== "US" && !shippingForm.phone) {
      return "Enter a phone number for international shipping.";
    }

    return "";
  }, [shippingForm, user, guestEmail]);

  const canQuoteShipping = useCallback(() =>
    validCartItems.length > 0 &&
    !validateCheckoutDetails(), [validCartItems.length, validateCheckoutDetails]);

  const customerName = user?.name || shippingForm.name.trim();
  const customerEmail = user?.email || guestEmail.trim();

  const handleLoadShippingRates = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setError("");
    const validationError = validateCheckoutDetails();

    if (validationError) {
      if (!silent) setError(validationError);
      return;
    }

    setRatesLoading(true);
    clearShippingRates();

    try {
      const res = await api.post("/api/stripe/shipping-rates", {
        customerName,
        customerEmail,
        shippingInfo: buildShippingInfo(),
      });
      const rates = Array.isArray(res.data?.rates) ? res.data.rates : [];

      if (!rates.length) {
        setError("No shipping options were returned for this address.");
        return;
      }

      const choices = pickShippingChoices(rates);
      setShippingRates(choices);
      setSelectedShippingRate(choices[0]);
      setRatesSubtotal(Number(res.data?.subtotal || cartTotal));
      setShippingPolicy(res.data?.shippingPolicy || DEFAULT_SHIPPING_POLICY);
      setSafetyWarning(res.data?.safetyWarning || DEFAULT_SAFETY_WARNING);
    } catch (ratesError) {
      console.error("Shipping rates error:", ratesError);
      setError(
        ratesError.response?.data?.error ||
          "Could not load shipping options. Please review the address and try again.",
      );
    } finally {
      setRatesLoading(false);
    }
  }, [
    buildShippingInfo,
    cartTotal,
    clearShippingRates,
    customerEmail,
    customerName,
    validateCheckoutDetails,
  ]);

  useEffect(() => {
    if (showPayment || !canQuoteShipping()) return undefined;

    const timeoutId = window.setTimeout(() => {
      handleLoadShippingRates({ silent: true });
    }, 800);

    return () => window.clearTimeout(timeoutId);
  }, [
    addressRateSignature,
    cartRateSignature,
    canQuoteShipping,
    handleLoadShippingRates,
    showPayment,
    user?.email,
  ]);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    const validationError = validateCheckoutDetails();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    if (!selectedShippingRate) {
      setError("Choose a shipping option before continuing to payment.");
      setLoading(false);
      return;
    }

    try {
      trackBeginCheckout(cart, {
        total: estimatedTotal,
        cartTotal,
        shipping: selectedShippingAmount,
      });

      const res = await api.post("/api/stripe/create-payment-intent", {
        customerName,
        customerEmail,
        shippingInfo: buildShippingInfo(),
        selectedShippingRateId: selectedShippingRate.id,
        selectedShippingRateKey: selectedShippingRate.rateKey,
        isGift,
        giftMessage: giftMessage.trim(),
      });

      if (!res.data?.clientSecret) {
        setError("Failed to start checkout. Please try again.");
        return;
      }

      setClientSecret(res.data.clientSecret);
      setOrderId(res.data.orderId || null);
      setCheckoutTotals({
        subtotal: Number(res.data.subtotal || cartTotal),
        bundleDiscount: Number(res.data.bundleDiscount || 0),
        shippingCost: Number(res.data.shippingCost || 0),
        tax: Number(res.data.tax || 0),
        total: Number(res.data.total || estimatedTotal),
        shippingRate: res.data.shippingRate || selectedShippingRate,
        shippingPolicy: res.data.shippingPolicy || shippingPolicy,
        safetyWarning: res.data.safetyWarning || safetyWarning,
      });
      setShippingPolicy(res.data.shippingPolicy || shippingPolicy);
      setSafetyWarning(res.data.safetyWarning || safetyWarning);
      setShowPayment(true);
    } catch (checkoutError) {
      console.error("Checkout error:", checkoutError);
      setError(
        checkoutError.response?.data?.error ||
          "Checkout failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100000] bg-royal-950/50 backdrop-blur-sm">
      <div className="ml-auto flex h-full w-full max-w-lg flex-col bg-gradient-to-b from-royal-50 to-candy-50 shadow-2xl">
        <div className="bg-gradient-to-r from-royal-800 via-royal-700 to-candy-600 px-5 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 font-display text-3xl font-semibold text-white">
                <ShoppingBag className="h-6 w-6 text-gold-300" /> Your bag
              </h2>
              <p className="mt-1 text-sm font-semibold text-royal-100">
                {cartItemCount} bow{cartItemCount === 1 ? "" : "s"} ✨
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-full bg-white/15 p-2.5 text-white ring-1 ring-white/30 transition hover:bg-white/25"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          {validCartItems.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-royal-200 bg-white p-10 text-center">
              <ShoppingBag className="mx-auto h-12 w-12 text-royal-200" />
              <h3 className="mt-4 font-display text-3xl text-royal-950">
                Your cart is empty
              </h3>
              <p className="mt-3 text-sm leading-7 text-royal-600">
                Pick a few sparkly bows to fill it up! 🎀
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
              >
                Continue shopping
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : showPayment && clientSecret && stripeOptions ? (
            <div className="space-y-6">
              <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_-24px_rgba(91,33,182,0.5)] ring-1 ring-royal-100">
                <p className="font-display text-lg font-semibold text-royal-950">
                  Shipping to
                </p>
                <p className="mt-3 text-sm leading-7 text-royal-700">
                  {shippingForm.name}
                  <br />
                  {shippingForm.line1}
                  {shippingForm.line2 ? `, ${shippingForm.line2}` : ""}
                  <br />
                  {shippingForm.city}, {shippingForm.state}{" "}
                  {shippingForm.postalCode}
                  <br />
                  {(shippingForm.country || "US").toUpperCase()}
                </p>
              </div>

              {isGift && giftMessage ? (
                <div className="rounded-[28px] bg-gold-200/40 p-5 ring-1 ring-gold-300">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-700">
                    Gift message
                  </p>
                  <p className="mt-3 text-sm leading-7 text-royal-800">
                    {giftMessage}
                  </p>
                </div>
              ) : null}

              {checkoutTotals ? (
                <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_-24px_rgba(91,33,182,0.5)] ring-1 ring-royal-100">
                  <p className="font-display text-lg font-semibold text-royal-950">
                    Final total
                  </p>
                  <div className="mt-5 space-y-3 text-sm text-royal-700">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(Number(checkoutTotals.subtotal || 0) + Number(checkoutTotals.bundleDiscount || 0))}</span>
                    </div>
                    {Number(checkoutTotals.bundleDiscount || 0) > 0 ? (
                      <div className="flex items-center justify-between font-medium text-emerald-700">
                        <span>Bundle savings</span>
                        <span>−{formatCurrency(checkoutTotals.bundleDiscount)}</span>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between">
                      <span>Shipping</span>
                      <span className="text-right">
                        <span className="block">
                          <ShippingRatePrice
                            rate={
                              checkoutTotals.shippingRate || {
                                amount: checkoutTotals.shippingCost,
                              }
                            }
                          />
                        </span>
                        {checkoutTotals.shippingRate ? (
                          <span className="block text-xs text-royal-400">
                            {checkoutTotals.shippingRate.label || selectedShippingRate?.label || "Shipping"}
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Sales tax</span>
                      <span>{formatCurrency(checkoutTotals.tax)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-royal-100 pt-3 text-base font-semibold text-royal-950">
                      <span>Total due</span>
                      <span>{formatCurrency(checkoutTotals.total)}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-xs leading-6 text-royal-600">
                    {checkoutTotals.shippingPolicy || shippingPolicy}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-royal-600">
                    {checkoutTotals.safetyWarning || safetyWarning}
                  </p>
                </div>
              ) : null}

              <Elements stripe={stripePromise} options={stripeOptions}>
                <StripeCheckoutForm
                  clientSecret={clientSecret}
                  onSuccess={() => {
                    onClose();
                    if (orderId) {
                      navigate(`/thank-you/${orderId}`);
                    }
                  }}
                />
              </Elements>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-4">
                {validCartItems.map((item) => (
                  <article
                    key={cartLineKey(item)}
                    className="rounded-[24px] bg-white p-3 shadow-[0_14px_34px_-24px_rgba(91,33,182,0.5)] ring-1 ring-royal-100"
                  >
                    <div className="flex gap-4">
                      <img
                        src={item.productId.images?.[0]?.url}
                        alt={item.productId.images?.[0]?.alt || item.productId.name}
                        className="h-20 w-20 rounded-2xl bg-royal-50 object-contain"
                      />
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-display text-base font-semibold text-royal-950">
                              {item.productId.name}
                            </h3>
                            {item.personalization ? (
                              <p className="mt-1 text-xs font-medium text-candy-600">
                                Personalized: “{item.personalization}”
                              </p>
                            ) : null}
                            <p className="mt-0.5 text-xs font-semibold text-royal-500">
                              ${linePrice(item).toFixed(2)} each
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setItemToRemove({
                                id: cartLineKey(item),
                                name: item.productId.name,
                              })
                            }
                            className="rounded-full border border-royal-100 p-2 text-royal-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <div className="inline-flex items-center rounded-full border border-royal-100 bg-royal-50 p-1">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(cartLineKey(item), item.quantity - 1)
                              }
                              className="rounded-full p-2 text-royal-800 transition hover:bg-white"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-10 text-center text-sm font-semibold text-royal-950">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(cartLineKey(item), item.quantity + 1)
                              }
                              className="rounded-full p-2 text-royal-800 transition hover:bg-white"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-base font-semibold text-royal-950">
                            ${(Number(item.productId.price || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_-24px_rgba(91,33,182,0.5)] ring-1 ring-royal-100">
                <p className="font-display text-lg font-semibold text-royal-950">
                  Order summary
                </p>
                <div className="mt-5 space-y-3 text-sm text-royal-700">
                  <div className="flex items-center justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(cartTotal)}</span>
                  </div>
                  {bundle.savings > 0 ? (
                    <div className="flex items-center justify-between font-medium text-emerald-700">
                      <span>Bundle savings ({BUNDLE.size} for ${BUNDLE.price})</span>
                      <span>−{formatCurrency(bundle.savings)}</span>
                    </div>
                  ) : null}
                  {bundle.toNextBundle > 0 && bundle.eligibleCount > 0 ? (
                    <p className="rounded-xl bg-candy-50 px-3 py-2 text-xs font-medium text-candy-700">
                      🎀 Add {bundle.toNextBundle} more bow{bundle.toNextBundle === 1 ? "" : "s"} to get {BUNDLE.size} for ${BUNDLE.price}!
                    </p>
                  ) : null}
                  <div className={`rounded-2xl px-3 py-2.5 text-xs font-bold ${toFreeShipping > 0 ? "bg-royal-50 text-royal-700" : "bg-gradient-to-r from-candy-100 to-gold-200/60 text-royal-900"}`}>
                    <p>
                      {toFreeShipping > 0
                        ? `🚚 Just ${formatCurrency(toFreeShipping)} more for free shipping!`
                        : "🎉 Yay! You unlocked free shipping!"}
                    </p>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-candy-400 to-royal-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.round((discountedSubtotal / FREE_SHIPPING_THRESHOLD) * 100))}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Shipping</span>
                    <span className="text-right">
                      {selectedShippingRate ? (
                        <>
                          <span className="block">
                            <ShippingRatePrice rate={selectedShippingRate} />
                          </span>
                          <span className="block text-xs text-royal-400">{selectedShippingRate.label}</span>
                        </>
                      ) : (
                        "Add address"
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-royal-100 pt-3 text-base font-semibold text-royal-950">
                    <span>Total <span className="text-xs font-semibold text-royal-500">(tax added at payment)</span></span>
                    <span>
                      {selectedShippingRate
                        ? formatCurrency(estimatedTotal)
                        : formatCurrency(discountedSubtotal)}
                    </span>
                  </div>
                </div>


              </div>
              <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_-24px_rgba(91,33,182,0.5)] ring-1 ring-royal-100">
                <p className="font-display text-lg font-semibold text-royal-950">
                  Ship to
                </p>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {!user ? (
                    <label className="block sm:col-span-2">
                      <span className="mb-1.5 block text-xs font-bold text-royal-700">
                        Your email <span className="font-semibold text-royal-400">(for your receipt and tracking; no account needed)</span>
                      </span>
                      <input
                        type="email"
                        value={guestEmail}
                        onChange={(event) => setGuestEmail(event.target.value)}
                        className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                        placeholder="you@example.com"
                        autoComplete="email"
                      />
                    </label>
                  ) : null}
                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-royal-700">
                      Recipient name
                    </span>
                    <input
                      type="text"
                      value={shippingForm.name}
                      onChange={(event) =>
                        updateShippingField("name", event.target.value)
                      }
                      className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                      placeholder="Recipient full name"
                      autoComplete="shipping name"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-royal-700">
                      Address line 1
                    </span>
                    <input
                      type="text"
                      value={shippingForm.line1}
                      onChange={(event) =>
                        updateShippingField("line1", event.target.value)
                      }
                      className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                      placeholder="Street address"
                      autoComplete="shipping address-line1"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-royal-700">
                      Address line 2
                    </span>
                    <input
                      type="text"
                      value={shippingForm.line2}
                      onChange={(event) =>
                        updateShippingField("line2", event.target.value)
                      }
                      className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                      placeholder="Apartment, suite, unit, etc. (optional)"
                      autoComplete="shipping address-line2"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-royal-700">
                      City
                    </span>
                    <input
                      type="text"
                      value={shippingForm.city}
                      onChange={(event) =>
                        updateShippingField("city", event.target.value)
                      }
                      className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                      placeholder="City"
                      autoComplete="shipping address-level2"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-royal-700">
                      State / province
                    </span>
                    <input
                      type="text"
                      value={shippingForm.state}
                      onChange={(event) =>
                        updateShippingField("state", event.target.value)
                      }
                      className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                      placeholder="State or province"
                      autoComplete="shipping address-level1"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-royal-700">
                      Postal code
                    </span>
                    <input
                      type="text"
                      value={shippingForm.postalCode}
                      onChange={(event) =>
                        updateShippingField("postalCode", event.target.value)
                      }
                      className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                      placeholder="Postal code"
                      autoComplete="shipping postal-code"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-bold text-royal-700">
                      Country
                    </span>
                    <input
                      type="text"
                      value={shippingForm.country}
                      onChange={(event) =>
                        updateShippingField("country", event.target.value)
                      }
                      className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                      placeholder="US"
                      autoComplete="shipping country"
                    />
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-1.5 block text-xs font-bold text-royal-700">
                      Phone
                    </span>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(event) =>
                        updateShippingField("phone", event.target.value)
                      }
                      className="w-full rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                      placeholder="Required for international shipping"
                      autoComplete="shipping tel"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_-24px_rgba(91,33,182,0.5)] ring-1 ring-royal-100">
                <p className="flex items-center gap-2 font-display text-lg font-semibold text-royal-950">
                  <Truck className="h-5 w-5 text-candy-500" /> Shipping
                </p>
                {ratesLoading ? (
                  <p className="mt-3 flex items-center gap-2 rounded-2xl bg-royal-50 px-4 py-3 text-sm font-semibold text-royal-700">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-candy-400 border-t-transparent" />
                    Finding shipping options...
                  </p>
                ) : shippingRates.length ? (
                  <div className="mt-3 space-y-2.5">
                    {shippingRates.map((rate) => {
                      const isSelected =
                        selectedShippingRate?.rateKey === rate.rateKey ||
                        selectedShippingRate?.id === rate.id;
                      return (
                        <label
                          key={rate.rateKey || rate.id}
                          className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 px-4 py-3 transition ${
                            isSelected ? "border-candy-400 bg-candy-50" : "border-royal-100 bg-white hover:border-candy-200"
                          }`}
                        >
                          <input
                            type="radio"
                            name="shipping-rate"
                            checked={isSelected}
                            onChange={() => setSelectedShippingRate(rate)}
                            className="h-4 w-4 border-royal-300 text-candy-500 focus:ring-candy-400"
                          />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-extrabold text-royal-950">{rate.label}</span>
                            <span className="block text-xs text-royal-500">{rate.arrives}</span>
                          </span>
                          <span className="text-sm font-extrabold text-royal-950">
                            <ShippingRatePrice rate={rate} />
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 rounded-2xl bg-royal-50 px-4 py-3 text-sm text-royal-600">
                    Fill in the address above and shipping prices will show up here.
                    {error && canQuoteShipping() ? (
                      <button type="button" onClick={() => handleLoadShippingRates()} className="ml-1 font-bold text-candy-600 underline">
                        Try again
                      </button>
                    ) : null}
                  </p>
                )}
              </div>

              <div className="rounded-[28px] bg-white p-5 shadow-[0_14px_34px_-24px_rgba(91,33,182,0.5)] ring-1 ring-royal-100">
                <div className="flex items-start gap-3">
                  <input
                    id="gift-order"
                    type="checkbox"
                    checked={isGift}
                    onChange={(event) => setIsGift(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-royal-200 text-candy-500 focus:ring-candy-400"
                  />
                  <div>
                    <label
                      htmlFor="gift-order"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-royal-950"
                    >
                      <Gift className="h-4 w-4 text-candy-500" />
                      This order is a gift
                    </label>
                    <p className="mt-2 text-sm leading-7 text-royal-600">
                      We can ship straight to them with a note.
                    </p>
                  </div>
                </div>

                {isGift ? (
                  <div className="mt-5">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-bold text-royal-700">
                        Gift note
                      </span>
                      <textarea
                        value={giftMessage}
                        onChange={(event) => setGiftMessage(event.target.value)}
                        maxLength={250}
                        className="h-28 w-full resize-none rounded-2xl border-2 border-royal-100 bg-royal-50/40 px-4 py-2.5 text-sm text-royal-950 outline-none transition focus:border-candy-300 focus:bg-white focus:ring-0"
                        placeholder="Add a short message for the recipient."
                      />
                    </label>
                  </div>
                ) : null}
              </div>

              <div>
                {error ? (
                  <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={loading || !selectedShippingRate}
                  className="w-full rounded-full bg-gradient-to-r from-candy-500 to-royal-600 px-6 py-4 text-base font-extrabold text-white shadow-lg shadow-candy-500/30 transition hover:scale-[1.01] disabled:opacity-50"
                >
                  {loading
                    ? "Preparing checkout..."
                    : selectedShippingRate
                      ? "🔒 Continue to payment"
                      : "Add your address to continue"}
                </button>

              </div>
                <p className="mt-3 text-center text-[11px] leading-5 text-royal-400">{safetyWarning}</p>
            </div>
          )}
        </div>
      </div>

      {itemToRemove ? (
        <ConfirmModal
          title="Remove Item?"
          message={`Remove "${itemToRemove.name}" from this order?`}
          confirmText="Remove"
          cancelText="Keep item"
          confirmVariant="danger"
          onConfirm={() => {
            onRemoveItem(itemToRemove.id);
            setItemToRemove(null);
          }}
          onCancel={() => setItemToRemove(null)}
        />
      ) : null}
    </div>
  );
}
