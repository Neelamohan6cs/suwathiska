const Notification = require("./notification.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");

const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({
    createdAt: -1,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return response.success(res, "Notifications fetched successfully", {
    notifications,
    unreadCount,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    return response.error(res, "Notification not found", 404);
  }

  return response.success(res, "Notification marked as read", { notification });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
  return response.success(res, "All notifications marked as read");
});

module.exports = { getMyNotifications, markAsRead, markAllAsRead };
