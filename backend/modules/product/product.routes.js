const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const authorize = require("../../middleware/role.middleware");
const optionalAuth = require("../../middleware/optionalAuth.middleware");
const upload = require("./upload.middleware");

const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  removeProductMedia,
} = require("./product.controller");

const { addReview, getProductReviews } = require("../review/review.controller");

const uploadFields = upload.fields([
  { name: "images", maxCount: 10 },
  { name: "videos", maxCount: 5 },
]);

router.get("/", optionalAuth, getProducts);
router.get("/:id", optionalAuth, getProductById);
router.get("/:id/reviews", getProductReviews);

router.post("/", protect, authorize("admin", "manager"), uploadFields, createProduct);
router.put("/:id", protect, authorize("admin", "manager"), uploadFields, updateProduct);
router.delete("/:id", protect, authorize("admin"), deleteProduct);
router.put("/:id/toggle-availability", protect, authorize("admin", "manager"), toggleAvailability);
router.delete("/:id/media", protect, authorize("admin", "manager"), removeProductMedia);

router.post("/:id/reviews", protect, authorize("customer"), addReview);

module.exports = router;
