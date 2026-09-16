const Order = require("../order/order.schema");
const Cart = require("../cart/cart.schema");
const Notification = require("../notification/notification.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");

const { getDashboard: getAdminDashboard } = require("../admin/admin.controller");
const { getDashboard: getDeliveryDashboard } = require("../delivery/delivery.controller");

const adminDashboard = getAdminDashboard;
const deliveryDashboard = getDeliveryDashboard;

const customerDashboard = asyncHandler(async (req, res) => {
  const customerId = req.user._id;

  const [totalOrders, pendingOrders, deliveredOrders, cart, unreadNotifications, recentOrders] =
    await Promise.all([
      Order.countDocuments({ customer: customerId }),
      Order.countDocuments({
        customer: customerId,
        orderStatus: { $nin: ["Delivered", "Cancelled"] },
      }),
      Order.countDocuments({ customer: customerId, orderStatus: "Delivered" }),
      Cart.findOne({ user: customerId }),
      Notification.countDocuments({ user: customerId, isRead: false }),
      Order.find({ customer: customerId }).sort({ createdAt: -1 }).limit(5),
    ]);

  return response.success(res, "Customer dashboard fetched successfully", {
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cartItems: cart?.items?.length || 0,
    unreadNotifications,
    recentOrders,
  });
});

module.exports = { adminDashboard, customerDashboard, deliveryDashboard };
