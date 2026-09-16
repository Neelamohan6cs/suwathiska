const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderLocation,
  updateOrderLocation,
} = require("./order.controller");

router.use(protect);

router.post("/", authorize("customer"), createOrder);
router.get("/my-orders", authorize("customer"), getMyOrders);
router.get("/:id/location", getOrderLocation);
router.put("/:id/location", authorize("customer"), updateOrderLocation);
router.get("/:id", getOrderById);
router.put("/:id/cancel", authorize("customer"), cancelOrder);

module.exports = router;
