const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const {
  getPaymentByOrder,
  verifyOnlinePayment,
  getAllPayments,
  updatePaymentStatus,
} = require("./payment.controller");

router.use(protect);

router.get("/", authorize("admin"), getAllPayments);
router.get("/:orderId", getPaymentByOrder);
router.post("/:orderId/verify", authorize("customer"), verifyOnlinePayment);
router.put("/:id/status", authorize("admin"), updatePaymentStatus);

module.exports = router;
