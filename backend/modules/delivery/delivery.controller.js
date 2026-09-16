const Delivery = require("./delivery.schema");
const Order = require("../order/order.schema");
const Payment = require("../payment/payment.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");
const { notifyUser, notifyAdmins } = require("../../utils/notify");
const { getRoute } = require("../../utils/routing");

const DELIVERY_FLOW = ["Assigned", "Picked Up", "Out for Delivery", "Delivered"];

const isValidLatitude = (lat) => typeof lat === "number" && !Number.isNaN(lat) && lat >= -90 && lat <= 90;
const isValidLongitude = (lng) => typeof lng === "number" && !Number.isNaN(lng) && lng >= -180 && lng <= 180;

const emitToOrderRoom = (req, orderId, event, payload) => {
  try {
    const io = req.app.get("io");
    if (io) io.to(`order:${orderId}`).emit(event, payload);
  } catch (err) {
    // realtime is best-effort; never fail the request because of it
  }
};

const getDashboard = asyncHandler(async (req, res) => {
  const deliveryPersonId = req.user._id;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [totalAssigned, pendingDeliveries, outForDelivery, delivered, todaysDeliveries] =
    await Promise.all([
      Delivery.countDocuments({ deliveryPerson: deliveryPersonId }),
      Delivery.countDocuments({
        deliveryPerson: deliveryPersonId,
        status: { $in: ["Assigned", "Picked Up"] },
      }),
      Delivery.countDocuments({ deliveryPerson: deliveryPersonId, status: "Out for Delivery" }),
      Delivery.countDocuments({ deliveryPerson: deliveryPersonId, status: "Delivered" }),
      Delivery.countDocuments({
        deliveryPerson: deliveryPersonId,
        assignedAt: { $gte: startOfDay },
      }),
    ]);

  return response.success(res, "Delivery dashboard fetched successfully", {
    totalAssigned,
    pendingDeliveries,
    outForDelivery,
    delivered,
    todaysDeliveries,
  });
});

const getMyDeliveries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = { deliveryPerson: req.user._id };
  if (status) filter.status = status;

  const deliveries = await Delivery.find(filter)
    .populate({
      path: "order",
      populate: { path: "customer", select: "name phone" },
    })
    .sort({ createdAt: -1 });

  return response.success(res, "Assigned orders fetched successfully", { deliveries });
});

const getDeliveryById = asyncHandler(async (req, res) => {
  const delivery = await Delivery.findOne({
    _id: req.params.id,
    deliveryPerson: req.user._id,
  }).populate({
    path: "order",
    populate: { path: "customer", select: "name phone" },
  });

  if (!delivery) return response.error(res, "Delivery record not found", 404);
  return response.success(res, "Delivery details fetched successfully", { delivery });
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { status, deliveryNotes } = req.body;

  const delivery = await Delivery.findOne({
    _id: req.params.id,
    deliveryPerson: req.user._id,
  });

  if (!delivery) return response.error(res, "Delivery record not found", 404);

  if (["Delivered", "Failed Delivery"].includes(delivery.status)) {
    return response.error(res, `Delivery is already marked as ${delivery.status}`, 400);
  }

  if (status === "Failed Delivery") {
    delivery.status = "Failed Delivery";
    delivery.deliveryNotes = deliveryNotes || "Delivery attempt failed";
  } else {
    const currentIndex = DELIVERY_FLOW.indexOf(delivery.status);
    const nextIndex = DELIVERY_FLOW.indexOf(status);

    if (nextIndex === -1) return response.error(res, "Invalid delivery status", 400);

    if (nextIndex !== currentIndex + 1) {
      return response.error(
        res,
        `Status must move from ${delivery.status} to ${DELIVERY_FLOW[currentIndex + 1]}`,
        400
      );
    }

    delivery.status = status;
    if (status === "Picked Up") delivery.pickedUpAt = new Date();
    if (status === "Out for Delivery") delivery.outForDeliveryAt = new Date();
    if (status === "Delivered") delivery.deliveredAt = new Date();
    if (deliveryNotes) delivery.deliveryNotes = deliveryNotes;
  }

  await delivery.save();

  const order = await Order.findById(delivery.order);
  if (order) {
    if (delivery.status === "Out for Delivery") {
      order.orderStatus = "Out for Delivery";
    }

    if (delivery.status === "Delivered") {
      order.orderStatus = "Delivered";
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "Paid";
        await Payment.findOneAndUpdate(
          { order: order._id },
          { paymentStatus: "Paid", paymentDate: new Date() }
        );
      }
    }

    await order.save();

    await notifyUser(
      order.customer,
      "Delivery update",
      `Your order ${order.orderId} is now ${delivery.status}`,
      "delivery"
    );

    emitToOrderRoom(req, order._id, "deliveryStatusUpdate", {
      orderId: order._id,
      deliveryId: delivery._id,
      status: delivery.status,
      orderStatus: order.orderStatus,
    });

    if (delivery.status === "Delivered") {
      await notifyAdmins("Delivery completed", `Order ${order.orderId} was delivered`, "delivery");
      emitToOrderRoom(req, order._id, "rideCompleted", { orderId: order._id, deliveryId: delivery._id });
    }
  }

  return response.success(res, "Delivery status updated successfully", { delivery });
});

const startRide = asyncHandler(async (req, res) => {
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return response.error(res, "A valid current latitude and longitude are required to start the ride", 400);
  }

  const delivery = await Delivery.findOne({ _id: req.params.id, deliveryPerson: req.user._id });
  if (!delivery) return response.error(res, "Delivery record not found", 404);

  if (delivery.status !== "Assigned") {
    return response.error(res, `Ride cannot be started from status "${delivery.status}"`, 400);
  }

  const order = await Order.findById(delivery.order);
  if (!order) return response.error(res, "Order not found", 404);

  if (!order.deliveryLocation?.latitude || !order.deliveryLocation?.longitude) {
    return response.error(res, "Customer delivery location is not available for this order", 400);
  }

  let route = null;
  try {
    route = await getRoute(
      latitude,
      longitude,
      order.deliveryLocation.latitude,
      order.deliveryLocation.longitude
    );
  } catch (err) {
    route = null;
  }

  delivery.rideStartedAt = new Date();
  delivery.outForDeliveryAt = new Date();
  delivery.driverLocation = { latitude, longitude, updatedAt: new Date() };
  delivery.status = "Out for Delivery";
  if (route) delivery.route = route;
  await delivery.save();

  order.orderStatus = "Out for Delivery";
  await order.save();

  await notifyUser(order.customer, "Ride started", `Your delivery for order ${order.orderId} is on the way`, "delivery");

  emitToOrderRoom(req, order._id, "rideStarted", {
    orderId: order._id,
    deliveryId: delivery._id,
    driverLocation: delivery.driverLocation,
    route,
  });

  return response.success(res, "Ride started successfully", { delivery, route });
});

const updateDriverLocation = asyncHandler(async (req, res) => {
  const latitude = Number(req.body.latitude);
  const longitude = Number(req.body.longitude);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return response.error(res, "A valid latitude and longitude are required", 400);
  }

  const delivery = await Delivery.findOne({ _id: req.params.id, deliveryPerson: req.user._id });
  if (!delivery) return response.error(res, "Delivery record not found", 404);

  if (["Delivered", "Failed Delivery"].includes(delivery.status)) {
    return response.error(res, "This delivery has already been completed", 400);
  }

  delivery.driverLocation = { latitude, longitude, updatedAt: new Date() };
  await delivery.save();

  emitToOrderRoom(req, delivery.order, "driverLocationUpdate", {
    orderId: delivery.order,
    deliveryId: delivery._id,
    driverLocation: delivery.driverLocation,
  });

  return response.success(res, "Driver location updated successfully", {
    driverLocation: delivery.driverLocation,
  });
});

const getRouteHandler = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };
  if (req.user.role === "delivery") query.deliveryPerson = req.user._id;

  const delivery = await Delivery.findOne(query).populate("order", "deliveryLocation orderId");
  if (!delivery) return response.error(res, "Delivery record not found", 404);

  if (!delivery.driverLocation?.latitude) {
    return response.error(res, "Driver location is not available yet", 400);
  }

  if (!delivery.order?.deliveryLocation?.latitude) {
    return response.error(res, "Customer delivery location is not available for this order", 400);
  }

  const route = await getRoute(
    delivery.driverLocation.latitude,
    delivery.driverLocation.longitude,
    delivery.order.deliveryLocation.latitude,
    delivery.order.deliveryLocation.longitude
  );

  delivery.route = route;
  await delivery.save();

  return response.success(res, "Route calculated successfully", { route });
});

const getActiveDeliveries = asyncHandler(async (req, res) => {
  const deliveries = await Delivery.find({ status: { $in: ["Assigned", "Picked Up", "Out for Delivery"] } })
    .populate("deliveryPerson", "name phone")
    .populate({
      path: "order",
      select: "orderId totalAmount deliveryLocation customer",
      populate: { path: "customer", select: "name phone" },
    })
    .sort({ createdAt: -1 });

  return response.success(res, "Active deliveries fetched successfully", { deliveries });
});

module.exports = {
  getDashboard,
  getMyDeliveries,
  getDeliveryById,
  updateDeliveryStatus,
  startRide,
  updateDriverLocation,
  getRouteHandler,
  getActiveDeliveries,
  DELIVERY_FLOW,
};
