const { itemXml } = require("../routes/feeds");

describe("Google Shopping feed item", () => {
  test("includes the fields Google requires and escapes text", () => {
    const xml = itemXml({ _id: "abc123", name: "Red & Green Plaid Bow", price: 10, images: [{ url: "https://img.example/1.jpg" }], description: "Plaid <bow>", madeToOrderDays: 7, category: "seasonal" });
    expect(xml).toContain("<g:id>abc123</g:id>");
    expect(xml).toContain("<g:title>Red &amp; Green Plaid Bow</g:title>");
    expect(xml).toContain("<g:price>10.00 USD</g:price>");
    expect(xml).toContain("<g:availability>in_stock</g:availability>");
    expect(xml).toContain("Plaid &lt;bow&gt;");
    expect(xml).toContain("<g:max_handling_time>7</g:max_handling_time>");
  });
  test("skips products without a photo or price", () => {
    expect(itemXml({ _id: "x", name: "No photo", price: 10, images: [] })).toBe("");
  });
});
