const express = require("express");
const router = express.Router();

const protect = require("../../middleware/auth.middleware");
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} = require("./notification.controller");

router.use(protect);

router.get("/", getMyNotifications);
router.put("/read-all", markAllAsRead);
router.put("/:id/read", markAsRead);

module.exports = router;
