const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      en: { type: String, required: true, trim: true },
      ta: { type: String, required: true, trim: true },
    },
    description: {
      en: String,
      ta: String,
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);
