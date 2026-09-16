const Order = require("../order/order.schema");
const User = require("../user/user.schema");
const Delivery = require("../delivery/delivery.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");

const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case "daily":
      start.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      start.setDate(now.getDate() - 7);
      break;
    case "monthly":
      start.setMonth(now.getMonth() - 1);
      break;
    case "yearly":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setDate(now.getDate() - 30);
  }

  return { start, end: now };
};

const getSalesReport = asyncHandler(async (req, res) => {
  const { period = "monthly" } = req.query;
  const { start, end } = getDateRange(period);

  const [summary] = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
        averageOrderValue: { $avg: "$totalAmount" },
      },
    },
  ]);

  const dailyBreakdown = await Order.aggregate([
    { $match: { createdAt: { $gte: start, $lte: end }, orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        orders: { $sum: 1 },
        revenue: { $sum: "$totalAmount" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return response.success(res, "Sales report generated successfully", {
    period,
    totalOrders: summary?.totalOrders || 0,
    totalRevenue: summary?.totalRevenue || 0,
    averageOrderValue: summary?.averageOrderValue || 0,
    dailyBreakdown,
  });
});

const getTopProducts = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const topProducts = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        totalQuantitySold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
      },
    },
    { $sort: { totalQuantitySold: -1 } },
    { $limit: Number(limit) },
  ]);

  return response.success(res, "Top selling products fetched successfully", { topProducts });
});

const getCustomerGrowth = asyncHandler(async (req, res) => {
  const growth = await User.aggregate([
    { $match: { role: "customer" } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        newCustomers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return response.success(res, "Customer growth report generated successfully", { growth });
});

const getDeliveryPerformance = asyncHandler(async (req, res) => {
  const performance = await Delivery.aggregate([
    { $match: { status: "Delivered", assignedAt: { $ne: null }, deliveredAt: { $ne: null } } },
    {
      $group: {
        _id: "$deliveryPerson",
        totalDelivered: { $sum: 1 },
        averageDeliveryTimeMs: {
          $avg: { $subtract: ["$deliveredAt", "$assignedAt"] },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "deliveryPerson",
      },
    },
    { $unwind: "$deliveryPerson" },
    {
      $project: {
        _id: 0,
        deliveryPersonId: "$deliveryPerson._id",
        name: "$deliveryPerson.name",
        totalDelivered: 1,
        averageDeliveryTimeHours: { $divide: ["$averageDeliveryTimeMs", 1000 * 60 * 60] },
      },
    },
    { $sort: { totalDelivered: -1 } },
  ]);

  return response.success(res, "Delivery performance report generated successfully", { performance });
});

module.exports = { getSalesReport, getTopProducts, getCustomerGrowth, getDeliveryPerformance };
