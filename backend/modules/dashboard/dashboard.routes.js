const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const { adminDashboard, customerDashboard, deliveryDashboard } = require("./dashboard.controller");

router.get("/admin", protect, authorize("admin"), adminDashboard);
router.get("/customer", protect, authorize("customer"), customerDashboard);
router.get("/delivery", protect, authorize("delivery"), deliveryDashboard);

module.exports = router;
