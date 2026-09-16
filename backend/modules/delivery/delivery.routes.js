const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const {
  getDashboard,
  getMyDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  startRide,
  updateDriverLocation,
  getRouteHandler,
  getActiveDeliveries,
} = require("./delivery.controller");

router.get("/active", protect, authorize("admin"), getActiveDeliveries);
router.get("/orders/:id/route", protect, authorize("delivery", "admin"), getRouteHandler);

router.use(protect, authorize("delivery"));

router.get("/dashboard", getDashboard);
router.get("/orders", getMyDeliveries);
router.get("/orders/:id", getDeliveryById);
router.put("/orders/:id/status", updateDeliveryStatus);
router.post("/orders/:id/start-ride", startRide);
router.put("/orders/:id/driver-location", updateDriverLocation);

module.exports = router;
