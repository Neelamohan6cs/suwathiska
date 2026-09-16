const Inventory = require("./inventory.schema");
const Product = require("../product/product.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");

const getInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find().populate("product", "name sku price stock");
  return response.success(res, "Inventory fetched successfully", { inventory });
});

const getLowStock = asyncHandler(async (req, res) => {
  const lowStock = await Inventory.find({
    $expr: { $lte: ["$currentStock", "$minimumStock"] },
  }).populate("product", "name sku price stock");

  return response.success(res, "Low stock products fetched successfully", { lowStock });
});

const updateStock = asyncHandler(async (req, res) => {
  const { currentStock, minimumStock } = req.body;

  const product = await Product.findById(req.params.productId);
  if (!product) return response.error(res, "Product not found", 404);

  if (currentStock !== undefined) product.stock = currentStock;
  await product.save();

  const inventory = await Inventory.findOneAndUpdate(
    { product: req.params.productId },
    {
      ...(currentStock !== undefined && { currentStock }),
      ...(minimumStock !== undefined && { minimumStock }),
      lastUpdated: new Date(),
    },
    { upsert: true, new: true }
  );

  return response.success(res, "Inventory updated successfully", { inventory });
});

module.exports = { getInventory, getLowStock, updateStock };
