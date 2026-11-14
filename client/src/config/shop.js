// Shop-wide offers shown on the site. The server enforces the same numbers at checkout
// (BUNDLE_SIZE / BUNDLE_PRICE / FREE_SHIPPING_THRESHOLD on Render); keep them in sync.
export const BUNDLE = { size: 3, price: 25 };
export const FREE_SHIPPING_THRESHOLD = 35;
export const DEFAULT_MADE_TO_ORDER_DAYS = 7;
export const PERSONALIZATION_FEE = 3;

// A cart line is one bow + one personalization (the same bow with two names is two lines).
export const cartLineKey = (item) => `${item?.productId?._id || item?.productId}|${item?.personalization || ""}`;
export const linePrice = (item) => Number(item?.productId?.price || 0) + (item?.personalization && item?.productId?.personalizable ? PERSONALIZATION_FEE : 0);

// Christmas order-by date (orders placed by the end of this day arrive before Christmas).
export const HOLIDAY_ORDER_BY = "2026-12-12";
export function holidayDeadline(now = new Date()) {
  const end = new Date(`${HOLIDAY_ORDER_BY}T23:59:59`);
  const msLeft = end - now;
  return { open: msLeft > 0, daysLeft: Math.max(0, Math.ceil(msLeft / 86400000)), label: end.toLocaleDateString("en-US", { month: "long", day: "numeric" }) };
}

// Christmas look (snow, lights, holiday wording) runs from November 1 through December 26.
export function isChristmasSeason(now = new Date()) {
  const month = now.getMonth(), day = now.getDate();
  return month === 10 || (month === 11 && day <= 26);
}

// Kept to four so the shop is simple to browse (an 8-year-old runs it!). Valentine's / Back to School can return in season.
export const OCCASIONS = [
  { id: "christmas", label: "Christmas", emoji: "🎄" },
  { id: "birthday", label: "Birthday", emoji: "🎂" },
  { id: "team-spirit", label: "Cheer & Team", emoji: "📣" },
  { id: "everyday", label: "Everyday", emoji: "🌸" },
];

export const STYLES = [
  { id: "sparkle", label: "Glitter & Sparkle" },
  { id: "classic", label: "Classic" },
  { id: "long", label: "Long Ribbon" },
  { id: "cheer", label: "Cheer" },
  { id: "pigtails", label: "Pigtail Sets" },
  { id: "baby", label: "Baby & Headbands" },
  { id: "seasonal", label: "Seasonal" },
  { id: "other", label: "Other" },
];

export const madeToOrderLabel = (product) => `Made to order · ships in ${product?.madeToOrderDays || DEFAULT_MADE_TO_ORDER_DAYS} days`;
export const styleLabel = (id) => STYLES.find((style) => style.id === id)?.label || "Signature bow";

// Same rule as server/utils/bundlePricing.js: every full group of BUNDLE.size eligible bows (cheapest first) costs BUNDLE.price.
export function bundleSavings(cartItems = []) {
  const units = [];
  for (const item of cartItems) {
    const product = item?.productId || {};
    if (product.bundleEligible === false) continue;
    for (let i = 0; i < Number(item.quantity || 0); i += 1) units.push(Number(product.price || 0));
  }
  units.sort((a, b) => a - b);
  let savings = 0;
  for (let start = 0; start + BUNDLE.size <= units.length; start += BUNDLE.size) {
    savings += Math.max(0, units.slice(start, start + BUNDLE.size).reduce((sum, value) => sum + value, 0) - BUNDLE.price);
  }
  return { savings: Math.round(savings * 100) / 100, eligibleCount: units.length, toNextBundle: units.length % BUNDLE.size === 0 ? 0 : BUNDLE.size - (units.length % BUNDLE.size) };
}
