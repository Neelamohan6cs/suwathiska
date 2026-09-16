const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require("./cart.controller");

router.use(protect, authorize("customer"));

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/update", updateCartItem);
router.delete("/remove/:productId", removeFromCart);
router.delete("/clear", clearCart);

module.exports = router;
