// Occasion collections come first (that's how most shoppers look for bows); style collections follow.
// A collection matches by occasion (product.occasions) or by style (product.category).
export const COLLECTIONS = [
  {
    slug: "christmas",
    title: "Christmas Collection",
    occasion: "christmas",
    description: "Handmade Christmas bows for photos, parties, and stockings. Made to order.",
    eyebrow: "Holiday favorites",
    hero: "Red, green, plaid, and sparkle bows made to order for Christmas cards, school parties, and stocking stuffers.",
  },
  {
    slug: "team-spirit",
    title: "Team Spirit",
    occasion: "team-spirit",
    description: "Bows in your team or school colors for cheer, dance, and game days.",
    eyebrow: "Cheer, dance & school",
    hero: "Made in your colors. Ordering for a whole team? Ask about team pricing.",
  },
  {
    slug: "birthday",
    title: "Birthday Bows",
    occasion: "birthday",
    description: "Party-ready bows for birthday girls and birthday gifts.",
    eyebrow: "Party ready",
    hero: "Bright, sparkly bows that make the birthday photos.",
  },
  {
    slug: "back-to-school",
    title: "Back to School",
    occasion: "back-to-school",
    description: "Everyday bows in school colors and classic shades.",
    eyebrow: "School days",
    hero: "Durable, comfortable bows for school mornings and picture day.",
  },
  {
    slug: "valentines",
    title: "Valentine's Day",
    occasion: "valentines",
    description: "Pinks, reds, and hearts for Valentine's Day.",
    eyebrow: "Made with love",
    hero: "Sweet bows for class parties and Valentine's photos.",
  },
  {
    slug: "everyday",
    title: "Everyday Bows",
    occasion: "everyday",
    description: "Go-with-everything bows for everyday wear.",
    eyebrow: "Everyday favorites",
    hero: "Soft colors and classic shapes that match any outfit.",
  },
  {
    slug: "cheer",
    title: "Cheer Bows",
    category: "cheer",
    description: "Big, bold cheer bows that stay put.",
    eyebrow: "Go team",
    hero: "Competition-ready cheer bows, made in your colors.",
  },
  {
    slug: "pigtails",
    title: "Pigtail Sets",
    category: "pigtails",
    description: "Matching pairs for pigtails and sisters.",
    eyebrow: "Perfect pairs",
    hero: "Matching bow sets for pigtails, sisters, and best friends.",
  },
  {
    slug: "baby",
    title: "Baby & Headbands",
    category: "baby",
    description: "Soft headbands and tiny bows for babies and toddlers.",
    eyebrow: "Little ones",
    hero: "Gentle, soft bows sized for babies and toddlers.",
  },
  {
    slug: "sparkle",
    title: "Sparkle Collection",
    category: "sparkle",
    description:
      "Statement bows designed for birthdays, celebrations, and girls who love shine.",
    eyebrow: "Signature shine",
    hero:
      "A premium edit of sparkle bows built to feel gift-worthy, photogenic, and boutique-level polished.",
  },
  {
    slug: "classic",
    title: "Classic Collection",
    category: "classic",
    description:
      "Timeless silhouettes for portraits, school outfits, and elevated everyday wear.",
    eyebrow: "Refined everyday",
    hero:
      "Classic bows for customers who want softness, structure, and presentation that still feels special.",
  },
  {
    slug: "ribbon",
    title: "Ribbon Collection",
    category: "long",
    description:
      "Long-tail ribbon bows with movement, shape, and boutique presence.",
    eyebrow: "Elegant detail",
    hero:
      "Longer silhouettes that feel polished in product photos, gifting moments, and special-event outfits.",
  },
];

export function productInCollection(product, collection) {
  if (collection.occasion) return Array.isArray(product.occasions) && product.occasions.includes(collection.occasion);
  return product.category === collection.category;
}

export function getCollectionBySlug(slug) {
  return COLLECTIONS.find((collection) => collection.slug === slug) || null;
}
