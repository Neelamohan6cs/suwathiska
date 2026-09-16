const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const optionalAuth = require("../../middleware/optionalAuth.middleware");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("./category.controller");

router.get("/", optionalAuth, getCategories);
router.post("/", protect, authorize("admin", "manager"), createCategory);
router.put("/:id", protect, authorize("admin", "manager"), updateCategory);
router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;
