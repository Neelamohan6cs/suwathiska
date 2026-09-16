const Product = require("./product.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");
const { FOLDERS, uploadImage, uploadVideo, destroyMedia } = require("../../utils/storage");

const parseJSON = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
};

const parseBoolean = (value, defaultValue) => {
  if (value === undefined || value === null || value === "") return defaultValue;
  if (typeof value === "boolean") return value;
  return String(value).toLowerCase() === "true";
};

const buildMediaFromFiles = async (req) => {
  const imageFiles = req.files?.images || [];
  const videoFiles = req.files?.videos || [];

  const uploadedImages = await Promise.all(
    imageFiles.map((file) => uploadImage(file, FOLDERS.image))
  );

  const uploadedVideos = await Promise.all(
    videoFiles.map((file) => uploadVideo(file, FOLDERS.video))
  );

  const images = uploadedImages.map((result, index) => ({
    url: result.url,
    publicId: result.publicId,
    alt: { en: "", ta: "" },
    isPrimary: index === 0,
  }));

  const videos = uploadedVideos.map((result, index) => ({
    title: videoFiles[index].originalname,
    description: "",
    videoUrl: result.url,
    publicId: result.publicId,
    thumbnail: result.thumbnail,
    duration: result.duration,
    type: "Product Demo",
    isFeatured: index === 0,
    displayOrder: index + 1,
  }));

  return { images, videos };
};

const createProduct = asyncHandler(async (req, res) => {
  const body = req.body || {};

  const {
    productId,
    sku,
    name,
    shortDescription,
    description,
    category,
    brand,
    weight,
    price,
    discountPrice,
    gst,
    stock,
    minOrderQty,
    nutrition,
    ingredients,
    benefits,
    feedingGuide,
    suitableFor,
    storageInstructions,
    manufacturer,
    expiryMonths,
    tags,
    isAvailable,
    isFeatured,
  } = body;

  if (!productId || !sku || !name || !category || price === undefined || price === "") {
    return response.error(res, "productId, sku, name, category and price are required", 400);
  }

  const parsedName = parseJSON(name, {});
  if (!parsedName.en || !parsedName.ta) {
    return response.error(res, "name must contain both en and ta", 400);
  }

  const { images, videos } = await buildMediaFromFiles(req);

  const productPrice = Number(price);
  const productDiscountPrice = Number(discountPrice || 0);
  const productStock = Number(stock || 0);

  if (isNaN(productPrice) || productPrice < 0) {
    return response.error(res, "price must be a valid positive number", 400);
  }
  if (productDiscountPrice < 0) {
    return response.error(res, "discountPrice cannot be negative", 400);
  }
  if (productStock < 0) {
    return response.error(res, "stock cannot be negative", 400);
  }

  const product = await Product.create({
    productId,
    sku,
    name: parsedName,
    shortDescription: parseJSON(shortDescription, { en: "", ta: "" }),
    description: parseJSON(description, { en: "", ta: "" }),
    category,
    brand: parseJSON(brand, { en: "", ta: "" }),
    weight: parseJSON(weight, { value: 0, unit: "kg" }),
    price: productPrice,
    discountPrice: productDiscountPrice,
    gst: Number(gst || 0),
    stock: productStock,
    minOrderQty: Number(minOrderQty || 1),
    images,
    videos,
    nutrition: parseJSON(nutrition, {}),
    ingredients: parseJSON(ingredients, []),
    benefits: parseJSON(benefits, []),
    feedingGuide: parseJSON(feedingGuide, { en: "", ta: "" }),
    suitableFor: parseJSON(suitableFor, []),
    storageInstructions: parseJSON(storageInstructions, { en: "", ta: "" }),
    manufacturer: parseJSON(manufacturer, { en: "", ta: "" }),
    expiryMonths: Number(expiryMonths || 6),
    tags: parseJSON(tags, []),
    isAvailable: parseBoolean(isAvailable, true),
    isFeatured: parseBoolean(isFeatured, false),
  });

  return response.success(res, "Product created successfully", { product }, 201);
});

const localizeProduct = (product, lang) => {
  const localized = {};

  for (const key in product) {
    const field = product[key];

    if (Array.isArray(field)) {
      localized[key] = field.map((item) =>
        item && typeof item === "object" && !Array.isArray(item) && item[lang] !== undefined
          ? item[lang]
          : item
      );
    } else if (field && typeof field === "object" && !Array.isArray(field) && field[lang] !== undefined) {
      localized[key] = field[lang];
    } else {
      localized[key] = field;
    }
  }

  return localized;
};

const getProducts = asyncHandler(async (req, res) => {
  const {
    lang = "en",
    search,
    category,
    minPrice,
    maxPrice,
    minWeight,
    maxWeight,
    sort,
    page = 1,
    limit = 20,
  } = req.query;

  const filter = { isDeleted: false };

  if (req.user?.role !== "admin" && req.user?.role !== "manager") {
    filter.isAvailable = true;
  }

  if (category) filter.category = category;

  if (search) {
    filter.$or = [
      { "name.en": { $regex: search, $options: "i" } },
      { "name.ta": { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (minWeight || maxWeight) {
    filter["weight.value"] = {};
    if (minWeight) filter["weight.value"].$gte = Number(minWeight);
    if (maxWeight) filter["weight.value"].$lte = Number(maxWeight);
  }

  const sortOptions = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    newest: { createdAt: -1 },
    popularity: { "rating.totalReviews": -1 },
  };

  const products = await Product.find(filter)
    .sort(sortOptions[sort] || { createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .lean();

  const total = await Product.countDocuments(filter);

  const localized = products.map((product) => localizeProduct(product, lang));

  return response.success(res, "Products fetched successfully", {
    lang,
    products: localized,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const { lang = "en" } = req.query;

  const product = await Product.findOne({ _id: req.params.id, isDeleted: false }).lean();
  if (!product) return response.error(res, "Product not found", 404);

  return response.success(res, "Product fetched successfully", {
    product: localizeProduct(product, lang),
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) return response.error(res, "Product not found", 404);

  const body = req.body || {};
  const updatableFields = [
    "sku", "category", "price", "discountPrice", "gst", "stock", "minOrderQty",
    "nutrition", "ingredients", "benefits", "suitableFor", "expiryMonths", "tags",
    "isAvailable", "isFeatured",
  ];
  const localizedFields = ["name", "shortDescription", "description", "brand", "feedingGuide", "storageInstructions", "manufacturer"];

  updatableFields.forEach((field) => {
    if (body[field] !== undefined) product[field] = parseJSON(body[field], body[field]);
  });

  localizedFields.forEach((field) => {
    if (body[field] !== undefined) product[field] = parseJSON(body[field], product[field]);
  });

  if (body.weight !== undefined) product.weight = parseJSON(body.weight, product.weight);

  const { images, videos } = await buildMediaFromFiles(req);
  if (images.length) product.images.push(...images);
  if (videos.length) product.videos.push(...videos);

  await product.save();

  return response.success(res, "Product updated successfully", { product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, isAvailable: false },
    { new: true }
  );

  if (!product) return response.error(res, "Product not found", 404);
  return response.success(res, "Product deleted successfully");
});

const toggleAvailability = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) return response.error(res, "Product not found", 404);

  product.isAvailable = !product.isAvailable;
  await product.save();

  return response.success(res, "Product availability updated", { product });
});

const removeProductMedia = asyncHandler(async (req, res) => {
  const { type, publicId } = req.body;

  if (!["image", "video"].includes(type)) {
    return response.error(res, "type must be image or video", 400);
  }
  if (!publicId) return response.error(res, "publicId is required", 400);

  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) return response.error(res, "Product not found", 404);

  const list = type === "image" ? product.images : product.videos;
  const index = list.findIndex((item) => item.publicId === publicId);

  if (index === -1) return response.error(res, "Media not found on this product", 404);

  await destroyMedia(publicId, type);
  list.splice(index, 1);

  if (type === "image" && product.images.length && !product.images.some((img) => img.isPrimary)) {
    product.images[0].isPrimary = true;
  }

  await product.save();

  return response.success(res, "Media removed successfully", { product });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  removeProductMedia,
};
