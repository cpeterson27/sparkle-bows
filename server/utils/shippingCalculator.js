// backend/utils/shippingCalculator.js

/**
 * Cart estimate before real carrier rates are chosen at checkout:
 * - Free at or over FREE_SHIPPING_THRESHOLD (default $35), same as checkout
 * - Otherwise a $4.99 estimate (checkout shows the actual carrier rate)
 */
const FREE_SHIPPING_THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD || 35);

function calculateShipping(cartTotal) {
  if (cartTotal >= FREE_SHIPPING_THRESHOLD) return 0;
  return 4.99;
}

module.exports = { calculateShipping, FREE_SHIPPING_THRESHOLD };
