const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const uploadProfile = require("../../middleware/upload.middleware");
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage,
} = require("./user.controller");

router.use(protect);

router.get("/profile", getProfile);
router.put("/profile", updateProfile);
router.put("/change-password", changePassword);
router.post("/profile/image", uploadProfile.single("profileImage"), uploadProfileImage);

module.exports = router;
