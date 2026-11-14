// Klaviyo shopping events for flows. "Started Checkout" drives the Abandoned Cart flow; "Placed Order" lets the flow
// skip people who finished buying (flow filter: Placed Order zero times since starting the flow).
// Fire-and-forget: a Klaviyo problem never blocks checkout. Skipped when KLAVIYO_PRIVATE_KEY isn't set.
const logger = require("../logger");

const STORE_URL = (process.env.FRONTEND_URL || "https://www.sparklebows.shop").replace(/\/$/, "");

function itemProperties(items = []) {
  return items.map((item) => ({
    ProductID: String(item.productId?._id || item.productId || ""),
    ProductName: item.name,
    Quantity: item.quantity,
    ItemPrice: item.price,
    RowTotal: Math.round(item.price * item.quantity * 100) / 100,
    ProductURL: `${STORE_URL}/product/${item.productId?._id || item.productId}`,
    ...(item.imageUrl ? { ImageURL: item.imageUrl } : {}),
  }));
}

async function sendEvent(metric, { email, name = "", value, uniqueId, properties }) {
  const key = process.env.KLAVIYO_PRIVATE_KEY;
  if (!key || !email) return;
  try {
    const res = await fetch("https://a.klaviyo.com/api/events/", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Klaviyo-API-Key ${key}`, revision: "2024-02-15" },
      body: JSON.stringify({
        data: {
          type: "event",
          attributes: {
            metric: { data: { type: "metric", attributes: { name: metric } } },
            profile: { data: { type: "profile", attributes: { email, ...(name ? { first_name: String(name).split(" ")[0] } : {}) } } },
            properties,
            value,
            ...(uniqueId ? { unique_id: uniqueId } : {}),
          },
        },
      }),
    });
    if (!res.ok) logger.error("Klaviyo event failed", { metric, status: res.status, body: (await res.text()).slice(0, 300) });
  } catch (error) {
    logger.error("Klaviyo event error", { metric, error: error.message });
  }
}

function trackStartedCheckout({ email, name, orderId, items, total }) {
  const lines = itemProperties(items);
  return sendEvent("Started Checkout", {
    email, name, value: total, uniqueId: `checkout-${orderId}`,
    properties: { $value: total, ItemNames: lines.map((line) => line.ProductName), Items: lines, CheckoutURL: `${STORE_URL}/?cart=open` },
  });
}

function trackPlacedOrder({ email, name, orderId, items, total }) {
  const lines = itemProperties(items);
  return sendEvent("Placed Order", {
    email, name, value: total, uniqueId: `order-${orderId}`,
    properties: { $value: total, OrderId: String(orderId), ItemNames: lines.map((line) => line.ProductName), Items: lines },
  });
}

module.exports = { trackStartedCheckout, trackPlacedOrder, itemProperties };
