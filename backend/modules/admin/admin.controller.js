const User = require("../user/user.schema");
const Product = require("../product/product.schema");
const Order = require("../order/order.schema");
const Delivery = require("../delivery/delivery.schema");
const Inventory = require("../inventory/inventory.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");
const { notifyUser } = require("../../utils/notify");

const getDashboard = asyncHandler(async (req, res) => {
  const [
    customers,
    deliveryPersons,
    products,
    totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockProducts,
    revenueAgg,
  ] = await Promise.all([
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "delivery" }),
    Product.countDocuments({ isDeleted: false }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "Pending" }),
    Order.countDocuments({ orderStatus: { $in: ["Confirmed", "Processing", "Packed"] } }),
    Order.countDocuments({ orderStatus: "Delivered" }),
    Order.countDocuments({ orderStatus: "Cancelled" }),
    Inventory.countDocuments({ $expr: { $lte: ["$currentStock", "$minimumStock"] } }),
    Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  return response.success(res, "Admin dashboard fetched successfully", {
    customers,
    deliveryPersons,
    products,
    orders: totalOrders,
    pendingOrders,
    processingOrders,
    deliveredOrders,
    cancelledOrders,
    lowStockProducts,
    totalRevenue: revenueAgg[0]?.total || 0,
  });
});

const getCustomers = asyncHandler(async (req, res) => {
  const { search, status } = req.query;

  const filter = { role: "customer" };
  if (status) filter.status = status;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { phone: { $regex: search, $options: "i" } },
    ];
  }

  const customers = await User.find(filter).sort({ createdAt: -1 });
  return response.success(res, "Customers fetched successfully", { customers });
});

const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await User.findOne({ _id: req.params.id, role: "customer" });
  if (!customer) return response.error(res, "Customer not found", 404);

  const orders = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });

  return response.success(res, "Customer details fetched successfully", { customer, orders });
});

const updateCustomerStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["approved", "blocked", "rejected", "pending"].includes(status)) {
    return response.error(res, "Invalid status value", 400);
  }

  const customer = await User.findOneAndUpdate(
    { _id: req.params.id, role: "customer" },
    { status },
    { new: true }
  );

  if (!customer) return response.error(res, "Customer not found", 404);

  await notifyUser(customer._id, "Account status updated", `Your account is now ${status}`, "account");

  return response.success(res, "Customer status updated successfully", { customer });
});

const getDeliveryPersons = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { role: "delivery" };
  if (status) filter.status = status;

  const deliveryPersons = await User.find(filter).sort({ createdAt: -1 });
  return response.success(res, "Delivery persons fetched successfully", { deliveryPersons });
});

const createDeliveryAccount = asyncHandler(async (req, res) => {
  const { name, email, phone, password, address } = req.body;

  if (!name || !email || !phone || !password) {
    return response.error(res, "Name, email, phone and password are required", 400);
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return response.error(res, "Email is already registered", 409);

  const deliveryPerson = await User.create({
    name,
    email,
    phone,
    password,
    address,
    role: "delivery",
    status: "approved",
  });

  return response.success(
    res,
    "Delivery account created successfully",
    { deliveryPerson: deliveryPerson.toSafeObject() },
    201
  );
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["approved", "blocked", "rejected", "pending"].includes(status)) {
    return response.error(res, "Invalid status value", 400);
  }

  const deliveryPerson = await User.findOneAndUpdate(
    { _id: req.params.id, role: "delivery" },
    { status },
    { new: true }
  );

  if (!deliveryPerson) return response.error(res, "Delivery person not found", 404);

  await notifyUser(deliveryPerson._id, "Account status updated", `Your account is now ${status}`, "account");

  return response.success(res, "Delivery person status updated successfully", { deliveryPerson });
});

const getDeliveryPersonOrders = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find({ deliveryPerson: req.params.id })
    .populate("order")
    .sort({ createdAt: -1 });

  return response.success(res, "Delivery person orders fetched successfully", { deliveries });
});

module.exports = {
  getDashboard,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
  getDeliveryPersons,
  createDeliveryAccount,
  updateDeliveryStatus,
  getDeliveryPersonOrders,
};
