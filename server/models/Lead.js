const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
      default: "",
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    source: {
      type: String,
      trim: true,
      default: "website",
    },
    vipSubscribed: {
      type: Boolean,
      default: false,
    },
    klaviyoStatus: {
      type: String,
      enum: ["unknown", "pending", "synced", "failed"],
      default: "unknown",
    },
    klaviyoSyncedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Lead", leadSchema);
