const Product = require("../modules/product/product.schema");
const Inventory = require("../modules/inventory/inventory.schema");
const { notifyAdmins } = require("./notify");

const adjustStock = async (productId, delta, soldDelta = 0) => {
  const product = await Product.findByIdAndUpdate(
    productId,
    { $inc: { stock: delta } },
    { new: true }
  );

  if (!product) return null;

  const inventory = await Inventory.findOneAndUpdate(
    { product: productId },
    {
      $inc: { currentStock: delta, soldQuantity: soldDelta },
      $set: { lastUpdated: new Date() },
      $setOnInsert: { minimumStock: 10 },
    },
    { upsert: true, new: true }
  );

  if (inventory.currentStock <= inventory.minimumStock) {
    await notifyAdmins(
      "Low stock alert",
      `${product.name?.en || "A product"} is running low (${inventory.currentStock} left)`,
      "inventory"
    );
  }

  return product;
};

module.exports = { adjustStock };
