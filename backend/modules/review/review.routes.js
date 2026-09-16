const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const { updateReview, deleteReview } = require("./review.controller");

router.use(protect);

router.put("/:id", updateReview);
router.delete("/:id", deleteReview);

module.exports = router;
