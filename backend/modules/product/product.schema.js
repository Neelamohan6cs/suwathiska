const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
   
    productId: {
      type: String,
      
      unique: true,
      trim: true,
    },

    // SKU
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    // Product Name
    name: {
      en: {
        type: String,
        required: true,
        trim: true,
      },
      ta: {
        type: String,
        required: true,
        trim: true,
      },
    },

    // Short Description
    shortDescription: {
      en: String,
      ta: String,
    },

    // Full Description
    description: {
      en: String,
      ta: String,
    },

    // Category
    category: {
      type: String,
      enum: [
        "cattle_feed",
        "calf_feed",
        "mineral_mixture",
        "silage",
        "fodder",
        "feed_supplement",
      ],
      required: true,
    },

    // Brand
    brand: {
      en: String,
      ta: String,
    },

    // Weight
    weight: {
      value: Number,
      unit: {
        type: String,
        default: "kg",
      },
    },

    // Pricing
    price: {
      type: Number,
      required: true,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    gst: {
      type: Number,
      default: 0,
    },

    // Inventory
    stock: {
      type: Number,
      default: 0,
    },

    minOrderQty: {
      type: Number,
      default: 1,
    },

    // Product Images
    images: [
      {
        url: String,

        publicId: String,

        alt: {
          en: String,
          ta: String,
        },

        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],

    // Product Videos (English Only)
    videos: [
      {
        title: {
          type: String,
          required: true,
        },

        description: String,

        videoUrl: {
          type: String,
          required: true,
        },

        publicId: String,

        thumbnail: String,

        duration: Number,

        type: {
          type: String,
          enum: [
            "Product Demo",
            "Feeding Guide",
            "Customer Review",
            "Educational",
            "Promotion",
          ],
          default: "Product Demo",
        },

        isFeatured: {
          type: Boolean,
          default: false,
        },

        displayOrder: {
          type: Number,
          default: 1,
        },
      },
    ],

    // Nutrition Information
    nutrition: {
      protein: Number,
      fat: Number,
      fiber: Number,
      calcium: Number,
      phosphorus: Number,
      moisture: Number,
    },

    // Ingredients
    ingredients: [
      {
        en: String,
        ta: String,
      },
    ],

    // Benefits
    benefits: [
      {
        en: String,
        ta: String,
      },
    ],

    // Feeding Guide
    feedingGuide: {
      en: String,
      ta: String,
    },

    // Suitable Animals
    suitableFor: [
      {
        type: String,
        enum: [
          "Cow",
          "Buffalo",
          "Calf",
          "Goat",
          "Sheep",
        ],
      },
    ],

    // Storage Instructions
    storageInstructions: {
      en: String,
      ta: String,
    },

    // Manufacturer
    manufacturer: {
      en: String,
      ta: String,
    },

    // Shelf Life
    expiryMonths: {
      type: Number,
      default: 6,
    },

    // Search Tags
    tags: [String],

    // Rating
    rating: {
      average: {
        type: Number,
        default: 0,
      },

      totalReviews: {
        type: Number,
        default: 0,
      },
    },

    // Status
    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);