// "Any N bows for $X": every full group of N bundle-eligible bows costs X. Groups are made from the lowest-priced
// eligible bows first, so a premium bow never gets discounted below what it costs to make. Returns dollars off.
const BUNDLE_SIZE = Number(process.env.BUNDLE_SIZE || 3);
const BUNDLE_PRICE = Number(process.env.BUNDLE_PRICE || 25);

function bundleDiscount(items = [], { size = BUNDLE_SIZE, price = BUNDLE_PRICE } = {}) {
  if (!(size >= 2) || !(price > 0)) return 0;
  const units = [];
  for (const item of items) {
    if (item.bundleEligible === false) continue;
    for (let i = 0; i < Number(item.quantity || 0); i += 1) units.push(Number(item.price || 0));
  }
  units.sort((a, b) => a - b);
  let discount = 0;
  for (let start = 0; start + size <= units.length; start += size) {
    const groupTotal = units.slice(start, start + size).reduce((sum, value) => sum + value, 0);
    discount += Math.max(0, groupTotal - price);
  }
  return Math.round(discount * 100) / 100;
}

// Spread a discount across tax line items (in cents) so tax is charged on what the customer actually pays.
function spreadDiscount(lineItems, discountCents) {
  const total = lineItems.reduce((sum, line) => sum + line.amount, 0);
  if (!discountCents || !total) return lineItems;
  let remaining = discountCents;
  return lineItems.map((line, index) => {
    const share = index === lineItems.length - 1 ? remaining : Math.min(remaining, Math.round((discountCents * line.amount) / total));
    remaining -= share;
    return { ...line, amount: Math.max(0, line.amount - share) };
  });
}

module.exports = { bundleDiscount, spreadDiscount, BUNDLE_SIZE, BUNDLE_PRICE };
