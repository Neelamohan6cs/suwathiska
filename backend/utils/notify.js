const Notification = require("../modules/notification/notification.schema");
const User = require("../modules/user/user.schema");

const notifyUser = async (userId, title, message, type = "general") => {
  return Notification.create({ user: userId, title, message, type });
};

const notifyAdmins = async (title, message, type = "general") => {
  const admins = await User.find({ role: "admin" }).select("_id");
  const notifications = admins.map((admin) => ({
    user: admin._id,
    title,
    message,
    type,
  }));
  if (notifications.length) {
    return Notification.insertMany(notifications);
  }
};

module.exports = { notifyUser, notifyAdmins };
