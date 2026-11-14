const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  date: { type: String, required: true },
});

const imageSchema = new Schema({
  url: { type: String, required: true },
  alt: { type: String, default: "" },
});

// allowed categories must match what your frontend uses
const CATEGORIES = [
  "sparkle",
  "long",
  "classic",
  "cheer",
  "pigtails",
  "baby",
  "seasonal",
  "other",
];

// Shop-by-occasion collections; a bow can belong to several.
const OCCASIONS = [
  "christmas",
  "valentines",
  "back-to-school",
  "birthday",
  "everyday",
  "team-spirit",
];

const productSchema = new Schema({
  name: { type: String, required: true, unique: true },
  images: { type: [imageSchema], default: [] },
  price: { type: Number, required: true, min: 0 },
  description: { type: String },
  longDescription: { type: String },
  seoTitle: { type: String, default: "" },
  seoDescription: { type: String, default: "" },
  seoKeywords: { type: String, default: "" },

  category: {
    type: String,
    enum: CATEGORIES,         // restrict to known categories
    default: "other",
  },

  occasions: { type: [{ type: String, enum: OCCASIONS }], default: [] },

  // Every bow is made to order: it can always be bought and ships after it's made.
  madeToOrderDays: { type: Number, default: 7, min: 1, max: 60 },
  // Counts toward the "any N for $X" bundle deal (turn off for premium or custom bows).
  bundleEligible: { type: Boolean, default: true },
  // Customers can add a name, initial, or colors for PERSONALIZATION_FEE (default $3).
  personalizable: { type: Boolean, default: false },

  // Kept for older records; made-to-order bows don't use stock counts.
  inventory: { type: Number, default: 0 },
  materialCost: { type: Number, default: 0, min: 0 },
  profitPerUnit: { type: Number, default: 0 },
  sales: { type: Number, default: 0, min: 0 },
  stripeTaxCode: { type: String, default: "" },

  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },

  reviews: { type: [reviewSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
});

// export the categories too if you want to reuse them frontend
productSchema.statics.CATEGORIES = CATEGORIES;
productSchema.statics.OCCASIONS = OCCASIONS;

module.exports = mongoose.model("Product", productSchema);
