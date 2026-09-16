const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");

const {
  getDashboard,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  getDeliveryPersons,
  createDeliveryAccount,
  updateDeliveryStatus,
  getDeliveryPersonOrders,
} = require("./admin.controller");

const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  assignDelivery,
} = require("../order/order.controller");

const {
  getSalesReport,
  getTopProducts,
  getCustomerGrowth,
  getDeliveryPerformance,
} = require("./report.controller");

router.use(protect, authorize("admin"));

router.get("/dashboard", getDashboard);

router.get("/customers", getCustomers);
router.get("/customers/:id", getCustomerById);
router.put("/customers/:id/status", updateCustomerStatus);

router.get("/delivery", getDeliveryPersons);
router.post("/delivery", createDeliveryAccount);
router.put("/delivery/:id/status", updateDeliveryStatus);
router.get("/delivery/:id/orders", getDeliveryPersonOrders);

router.get("/orders", getAllOrders);
router.get("/orders/:id", getOrderById);
router.put("/orders/:id/status", updateOrderStatus);
router.put("/orders/:id/assign-delivery", assignDelivery);

router.get("/reports/sales", getSalesReport);
router.get("/reports/products", getTopProducts);
router.get("/reports/customers", getCustomerGrowth);
router.get("/reports/delivery", getDeliveryPerformance);

module.exports = router;
