// Occasion collections come first (that's how most shoppers look for bows); style collections follow.
// A collection matches by occasion (product.occasions) or by style (product.category).
export const COLLECTIONS = [
  {
    slug: "christmas",
    title: "Christmas Bows",
    occasion: "christmas",
    description: "Sparkly Christmas bows for photos, parties, and stockings. Tied to order.",
    eyebrow: "🎄 The Christmas shop",
    hero: "Red velvet, candy-cane stripes, and snowy sparkle for the merriest princess on the block.",
  },
  {
    slug: "birthday",
    title: "Birthday Bows",
    occasion: "birthday",
    description: "Party-ready bows for the birthday girl and the friends she invites.",
    eyebrow: "🎂 Party time",
    hero: "Glitter, rainbows, and a little extra sparkle for the big day.",
  },
  {
    slug: "team-spirit",
    title: "Cheer & Team Bows",
    occasion: "team-spirit",
    description: "Big, bold bows in your team or school colors.",
    eyebrow: "📣 Go team",
    hero: "Made in your colors for cheer, dance, and game day. Ordering for a whole team? Ask about team pricing.",
  },
  {
    slug: "everyday",
    title: "Everyday Bows",
    occasion: "everyday",
    description: "Sweet, go-with-anything bows for school and play.",
    eyebrow: "🌸 Every day",
    hero: "Soft colors and classic shapes that match any outfit.",
  },
];

export function productInCollection(product, collection) {
  if (collection.occasion) return Array.isArray(product.occasions) && product.occasions.includes(collection.occasion);
  return product.category === collection.category;
}

export function getCollectionBySlug(slug) {
  return COLLECTIONS.find((collection) => collection.slug === slug) || null;
}
