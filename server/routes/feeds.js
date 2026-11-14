// Google Merchant Center product feed (free Google Shopping listings).
// Add https://api.sparklebows.shop/api/feeds/google.xml as a scheduled feed in Merchant Center.
const express = require("express");
const Product = require("../models/productModel");
const logger = require("../logger");

const router = express.Router();
const STORE_URL = (process.env.FRONTEND_URL || "https://www.sparklebows.shop").replace(/\/$/, "");
const escapeXml = (value = "") => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

function itemXml(product) {
  const image = product.images?.[0]?.url;
  if (!image || !(product.price > 0)) return "";
  const description = product.longDescription || product.description || `${product.name}, a handmade hair bow made to order.`;
  const extraImages = (product.images || []).slice(1, 6).map((img) => `      <g:additional_image_link>${escapeXml(img.url)}</g:additional_image_link>`).join("\n");
  return `    <item>
      <g:id>${escapeXml(String(product._id))}</g:id>
      <g:title>${escapeXml(product.name)}</g:title>
      <g:description>${escapeXml(description.slice(0, 4900))}</g:description>
      <g:link>${escapeXml(`${STORE_URL}/product/${product._id}`)}</g:link>
      <g:image_link>${escapeXml(image)}</g:image_link>
${extraImages ? extraImages + "\n" : ""}      <g:availability>in_stock</g:availability>
      <g:price>${Number(product.price).toFixed(2)} USD</g:price>
      <g:brand>Sparkle Bows</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>Apparel &amp; Accessories &gt; Clothing Accessories &gt; Hair Accessories</g:google_product_category>
      <g:product_type>${escapeXml(["Hair Bows", product.category].filter(Boolean).join(" > "))}</g:product_type>
      <g:age_group>kids</g:age_group>
      <g:gender>female</g:gender>
      <g:min_handling_time>1</g:min_handling_time>
      <g:max_handling_time>${Number(product.madeToOrderDays || 7)}</g:max_handling_time>
    </item>`;
}

router.get("/google.xml", async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }).lean();
    const items = products.map(itemXml).filter(Boolean).join("\n");
    res.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Sparkle Bows</title>
    <link>${escapeXml(STORE_URL)}</link>
    <description>Handmade hair bows, made to order.</description>
${items}
  </channel>
</rss>
`);
  } catch (error) {
    logger.error("Google feed failed", { message: error.message });
    res.status(500).type("text/plain").send("Feed unavailable");
  }
});

module.exports = router;
module.exports.itemXml = itemXml;
