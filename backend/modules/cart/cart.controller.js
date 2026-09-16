const Cart = require("./cart.schema");
const Product = require("../product/product.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");

const buildCartResponse = async (cart) => {
  const populated = await cart.populate("items.product", "name images price discountPrice stock isAvailable");

  const items = populated.items.map((item) => ({
    product: item.product,
    quantity: item.quantity,
    price: item.price,
    lineTotal: item.price * item.quantity,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);

  return {
    _id: populated._id,
    items,
    subtotal,
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
};

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  return response.success(res, "Cart fetched successfully", await buildCartResponse(cart));
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  if (!productId) return response.error(res, "productId is required", 400);
  if (quantity < 1) return response.error(res, "Quantity must be at least 1", 400);

  const product = await Product.findById(productId);
  if (!product || product.isDeleted || !product.isAvailable) {
    return response.error(res, "Product not available", 404);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existingItem = cart.items.find((item) => item.product.toString() === productId);
  const newQuantity = existingItem ? existingItem.quantity + Number(quantity) : Number(quantity);

  if (newQuantity > product.stock) {
    return response.error(res, `Only ${product.stock} units available in stock`, 400);
  }

  const price = product.discountPrice > 0 ? product.discountPrice : product.price;

  if (existingItem) {
    existingItem.quantity = newQuantity;
    existingItem.price = price;
  } else {
    cart.items.push({ product: productId, quantity: newQuantity, price });
  }

  await cart.save();
  return response.success(res, "Product added to cart", await buildCartResponse(cart));
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  if (!productId || quantity === undefined) {
    return response.error(res, "productId and quantity are required", 400);
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return response.error(res, "Cart not found", 404);

  const item = cart.items.find((item) => item.product.toString() === productId);
  if (!item) return response.error(res, "Product not found in cart", 404);

  if (quantity <= 0) {
    cart.items = cart.items.filter((item) => item.product.toString() !== productId);
  } else {
    const product = await Product.findById(productId);
    if (quantity > product.stock) {
      return response.error(res, `Only ${product.stock} units available in stock`, 400);
    }
    item.quantity = quantity;
  }

  await cart.save();
  return response.success(res, "Cart updated successfully", await buildCartResponse(cart));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return response.error(res, "Cart not found", 404);

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId
  );

  await cart.save();
  return response.success(res, "Product removed from cart", await buildCartResponse(cart));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return response.error(res, "Cart not found", 404);

  cart.items = [];
  await cart.save();
  return response.success(res, "Cart cleared successfully", await buildCartResponse(cart));
});

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
