const { bundleDiscount, spreadDiscount } = require("../utils/bundlePricing");

describe("any 3 for $25 bundle", () => {
  test("three $10 bows cost $25", () => {
    expect(bundleDiscount([{ price: 10, quantity: 3 }], { size: 3, price: 25 })).toBe(5);
  });
  test("only full groups count, cheapest bows grouped first", () => {
    // 5 bows: 9, 10, 10, 12, 15 -> one group (9+10+10=29) -> $4 off; 12 and 15 pay full price
    const items = [{ price: 10, quantity: 2 }, { price: 9, quantity: 1 }, { price: 12, quantity: 1 }, { price: 15, quantity: 1 }];
    expect(bundleDiscount(items, { size: 3, price: 25 })).toBe(4);
  });
  test("bows turned off for the bundle never count", () => {
    expect(bundleDiscount([{ price: 10, quantity: 2 }, { price: 20, quantity: 1, bundleEligible: false }], { size: 3, price: 25 })).toBe(0);
  });
  test("a group already under the bundle price gets no discount", () => {
    expect(bundleDiscount([{ price: 6, quantity: 3 }], { size: 3, price: 25 })).toBe(0);
  });
  test("the discount is spread across tax lines in cents", () => {
    const lines = spreadDiscount([{ amount: 2000 }, { amount: 1000 }], 500);
    expect(lines.map((line) => line.amount)).toEqual([1667, 833]);
    expect(lines.reduce((sum, line) => sum + line.amount, 0)).toBe(2500);
  });
});

describe("personalization", () => {
  const { cleanPersonalization } = require("../utils/bundlePricing");
  test("kept only on personalizable bows, trimmed to 40 characters", () => {
    expect(cleanPersonalization("  Emma  ", { personalizable: true })).toBe("Emma");
    expect(cleanPersonalization("Emma", { personalizable: false })).toBe("");
    expect(cleanPersonalization("x".repeat(60), { personalizable: true })).toHaveLength(40);
  });
});
