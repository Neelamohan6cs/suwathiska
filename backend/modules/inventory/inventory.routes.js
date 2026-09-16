const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const { getInventory, getLowStock, updateStock } = require("./inventory.controller");

router.use(protect, authorize("admin", "manager"));

router.get("/", getInventory);
router.get("/low-stock", getLowStock);
router.put("/:productId", updateStock);

module.exports = router;
