const Order = require("./order.schema");
const Cart = require("../cart/cart.schema");
const Product = require("../product/product.schema");
const Payment = require("../payment/payment.schema");
const User = require("../user/user.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");
const generateId = require("../../utils/generateId");
const { adjustStock } = require("../../utils/inventoryHelper");
const { notifyUser, notifyAdmins } = require("../../utils/notify");
const { reverseGeocode } = require("../../utils/geocoding");

const ORDER_FLOW = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Assigned",
  "Out for Delivery",
  "Delivered",
];

const calculateDeliveryCharge = (subtotal) => (subtotal >= 500 ? 0 : 50);

const isValidLatitude = (lat) => typeof lat === "number" && !Number.isNaN(lat) && lat >= -90 && lat <= 90;
const isValidLongitude = (lng) => typeof lng === "number" && !Number.isNaN(lng) && lng >= -180 && lng <= 180;

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, deliveryLocation } = req.body;

  if (!shippingAddress?.street || !shippingAddress?.city || !shippingAddress?.pincode) {
    return response.error(res, "Complete shipping address is required", 400);
  }

  if (!["COD", "Online"].includes(paymentMethod)) {
    return response.error(res, "paymentMethod must be COD or Online", 400);
  }

  let resolvedDeliveryLocation;
  if (deliveryLocation) {
    const latitude = Number(deliveryLocation.latitude);
    const longitude = Number(deliveryLocation.longitude);

    if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      return response.error(res, "Delivery location coordinates are invalid", 400);
    }

    resolvedDeliveryLocation = {
      latitude,
      longitude,
      address: deliveryLocation.address || undefined,
    };
  }

  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return response.error(res, "Your cart is empty", 400);
  }

  for (const item of cart.items) {
    if (!item.product || item.product.isDeleted || !item.product.isAvailable) {
      return response.error(res, "One or more products are no longer available", 400);
    }
    if (item.quantity > item.product.stock) {
      return response.error(
        res,
        `Insufficient stock for ${item.product.name?.en}. Only ${item.product.stock} left`,
        400
      );
    }
  }

  const items = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name?.en,
    quantity: item.quantity,
    price: item.price,
  }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = calculateDeliveryCharge(subtotal);
  const discount = 0;
  const totalAmount = subtotal + deliveryCharge - discount;

  const order = await Order.create({
    orderId: generateId("ORD"),
    customer: req.user._id,
    items,
    shippingAddress,
    deliveryLocation: resolvedDeliveryLocation,
    subtotal,
    deliveryCharge,
    discount,
    totalAmount,
    paymentMethod,
    paymentStatus: "Pending",
    orderStatus: "Pending",
  });

  for (const item of items) {
    await adjustStock(item.product, -item.quantity, item.quantity);
  }

  await Payment.create({
    order: order._id,
    user: req.user._id,
    amount: totalAmount,
    paymentMethod,
    paymentStatus: "Pending",
  });

  cart.items = [];
  await cart.save();

  await notifyUser(
    req.user._id,
    "Order placed",
    `Your order ${order.orderId} has been placed successfully`,
    "order"
  );

  await notifyAdmins(
    "New order received",
    `Order ${order.orderId} was placed by ${req.user.name}`,
    "order"
  );

  return response.success(res, "Order placed successfully", { order }, 201);
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort({ createdAt: -1 });
  return response.success(res, "Orders fetched successfully", { orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };

  if (req.user.role === "customer") query.customer = req.user._id;
  if (req.user.role === "delivery") query.deliveryPerson = req.user._id;

  const order = await Order.findOne(query)
    .populate("customer", "name email phone")
    .populate("deliveryPerson", "name phone");

  if (!order) return response.error(res, "Order not found", 404);

  let delivery = null;
  if (order.deliveryPerson) {
    const Delivery = require("../delivery/delivery.schema");
    delivery = await Delivery.findOne({ order: order._id }).select(
      "status driverLocation rideStartedAt outForDeliveryAt deliveredAt route"
    );
  }

  return response.success(res, "Order fetched successfully", { order, delivery });
});

const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
  if (!order) return response.error(res, "Order not found", 404);

  if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
    return response.error(res, "Order can no longer be cancelled", 400);
  }

  order.orderStatus = "Cancelled";
  order.cancelReason = req.body.reason || "Cancelled by customer";
  await order.save();

  for (const item of order.items) {
    await adjustStock(item.product, item.quantity, -item.quantity);
  }

  await Payment.findOneAndUpdate({ order: order._id }, { paymentStatus: "Refunded" });

  await notifyAdmins("Order cancelled", `Order ${order.orderId} was cancelled by the customer`, "order");

  return response.success(res, "Order cancelled successfully", { order });
});

const getOrderLocation = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };

  if (req.user.role === "customer") query.customer = req.user._id;
  if (req.user.role === "delivery") query.deliveryPerson = req.user._id;

  const order = await Order.findOne(query).select("deliveryLocation orderId");
  if (!order) return response.error(res, "Order not found", 404);

  return response.success(res, "Delivery location fetched successfully", {
    deliveryLocation: order.deliveryLocation || null,
  });
});

const updateOrderLocation = asyncHandler(async (req, res) => {
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return response.error(res, "A valid latitude and longitude are required", 400);
  }

  const order = await Order.findOne({ _id: req.params.id, customer: req.user._id });
  if (!order) return response.error(res, "Order not found", 404);

  if (order.deliveryPerson) {
    return response.error(
      res,
      "Delivery location can no longer be changed once a delivery partner is assigned",
      400
    );
  }

  let address = null;
  try {
    address = await reverseGeocode(latitude, longitude);
  } catch (err) {
    address = null;
  }

  order.deliveryLocation = { latitude, longitude, address: address || undefined };

  if (address) {
    order.shippingAddress = {
      ...order.shippingAddress,
      street: order.shippingAddress?.street || address.formattedAddress,
      city: address.village || address.city || order.shippingAddress?.city,
      state: address.state || order.shippingAddress?.state,
      pincode: address.postalCode || order.shippingAddress?.pincode,
    };
  }

  await order.save();

  return response.success(res, "Delivery location updated successfully", {
    deliveryLocation: order.deliveryLocation,
  });
});

const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.orderStatus = status;

  const orders = await Order.find(filter)
    .populate("customer", "name email phone")
    .populate("deliveryPerson", "name phone")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Number(limit));

  const total = await Order.countDocuments(filter);

  return response.success(res, "Orders fetched successfully", {
    orders,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return response.error(res, "Order not found", 404);

  if (order.orderStatus === "Delivered" || order.orderStatus === "Cancelled") {
    return response.error(res, `Order is already ${order.orderStatus}`, 400);
  }

  if (status === "Cancelled") {
    order.orderStatus = "Cancelled";
    order.cancelReason = req.body.reason || "Cancelled by admin";
    for (const item of order.items) {
      await adjustStock(item.product, item.quantity, -item.quantity);
    }
  } else {
    const currentIndex = ORDER_FLOW.indexOf(order.orderStatus);
    const nextIndex = ORDER_FLOW.indexOf(status);

    if (nextIndex === -1) {
      return response.error(res, "Invalid order status", 400);
    }

    if (nextIndex !== currentIndex + 1) {
      return response.error(
        res,
        `Order status must move from ${order.orderStatus} to ${ORDER_FLOW[currentIndex + 1] || "the next stage"}`,
        400
      );
    }

    order.orderStatus = status;
  }

  await order.save();

  await notifyUser(
    order.customer,
    "Order status updated",
    `Your order ${order.orderId} is now ${order.orderStatus}`,
    "order"
  );

  return response.success(res, "Order status updated successfully", { order });
});

const assignDelivery = asyncHandler(async (req, res) => {
  const { deliveryPersonId } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) return response.error(res, "Order not found", 404);

  if (!["Confirmed", "Processing", "Packed"].includes(order.orderStatus)) {
    return response.error(res, "Order must be packed before assigning delivery", 400);
  }

  const deliveryPerson = await User.findOne({ _id: deliveryPersonId, role: "delivery" });
  if (!deliveryPerson) return response.error(res, "Delivery person not found", 404);
  if (deliveryPerson.status !== "approved") {
    return response.error(res, "Delivery person is not approved", 400);
  }

  const Delivery = require("../delivery/delivery.schema");
  await Delivery.create({
    order: order._id,
    deliveryPerson: deliveryPerson._id,
    status: "Assigned",
    assignedAt: new Date(),
  });

  order.deliveryPerson = deliveryPerson._id;
  order.orderStatus = "Assigned";
  await order.save();

  await notifyUser(
    deliveryPerson._id,
    "New delivery assigned",
    `You have been assigned order ${order.orderId}`,
    "delivery"
  );

  await notifyUser(
    order.customer,
    "Delivery assigned",
    `Your order ${order.orderId} has been assigned for delivery`,
    "order"
  );

  return response.success(res, "Delivery assigned successfully", { order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrderLocation,
  updateOrderLocation,
  getAllOrders,
  updateOrderStatus,
  assignDelivery,
  ORDER_FLOW,
};
