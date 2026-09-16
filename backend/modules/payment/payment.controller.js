const Payment = require("./payment.schema");
const Order = require("../order/order.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");
const { notifyUser } = require("../../utils/notify");

const getPaymentByOrder = asyncHandler(async (req, res) => {
  const payment = await Payment.findOne({ order: req.params.orderId });
  if (!payment) return response.error(res, "Payment record not found", 404);
  return response.success(res, "Payment fetched successfully", { payment });
});

const verifyOnlinePayment = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;

  const payment = await Payment.findOne({ order: req.params.orderId, user: req.user._id });
  if (!payment) return response.error(res, "Payment record not found", 404);

  if (payment.paymentMethod !== "Online") {
    return response.error(res, "This order is not paid online", 400);
  }

  payment.paymentStatus = "Paid";
  payment.transactionId = transactionId || `TXN-${Date.now()}`;
  payment.paymentDate = new Date();
  await payment.save();

  const order = await Order.findById(payment.order);
  if (order) {
    order.paymentStatus = "Paid";
    if (order.orderStatus === "Pending") order.orderStatus = "Confirmed";
    await order.save();
  }

  await notifyUser(req.user._id, "Payment successful", "Your payment was received successfully", "payment");

  return response.success(res, "Payment verified successfully", { payment });
});

const getAllPayments = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { paymentStatus: status } : {};

  const payments = await Payment.find(filter)
    .populate("order", "orderId totalAmount orderStatus")
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return response.success(res, "Payments fetched successfully", { payments });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;

  const payment = await Payment.findByIdAndUpdate(
    req.params.id,
    { paymentStatus, ...(paymentStatus === "Paid" && { paymentDate: new Date() }) },
    { new: true }
  );

  if (!payment) return response.error(res, "Payment not found", 404);

  await Order.findByIdAndUpdate(payment.order, { paymentStatus });

  return response.success(res, "Payment status updated successfully", { payment });
});

module.exports = { getPaymentByOrder, verifyOnlinePayment, getAllPayments, updatePaymentStatus };
