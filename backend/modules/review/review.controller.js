const Review = require("./review.schema");
const Product = require("../product/product.schema");
const Order = require("../order/order.schema");
const asyncHandler = require("../../utils/asyncHandler");
const response = require("../../utils/response");

const recalculateRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", average: { $avg: "$rating" }, total: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    "rating.average": stats[0]?.average || 0,
    "rating.totalReviews": stats[0]?.total || 0,
  });
};

const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const { orderId } = req.body;

  if (!rating) return response.error(res, "Rating is required", 400);
  if (!orderId) return response.error(res, "orderId is required", 400);

  const order = await Order.findOne({
    _id: orderId,
    customer: req.user._id,
    orderStatus: "Delivered",
    "items.product": productId,
  });

  if (!order) {
    return response.error(res, "You can only review products from a delivered order", 400);
  }

  const existingReview = await Review.findOne({ user: req.user._id, product: productId, order: orderId });
  if (existingReview) {
    return response.error(res, "You have already reviewed this product for this order", 409);
  }

  const review = await Review.create({
    user: req.user._id,
    product: productId,
    order: orderId,
    rating,
    comment,
  });

  await recalculateRating(productId);

  return response.success(res, "Review added successfully", { review }, 201);
});

const getProductReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ product: req.params.id })
    .populate("user", "name profileImage")
    .sort({ createdAt: -1 });

  return response.success(res, "Reviews fetched successfully", { reviews });
});

const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const review = await Review.findOne({ _id: req.params.id, user: req.user._id });
  if (!review) return response.error(res, "Review not found", 404);

  if (rating) review.rating = rating;
  if (comment !== undefined) review.comment = comment;
  await review.save();

  await recalculateRating(review.product);

  return response.success(res, "Review updated successfully", { review });
});

const deleteReview = asyncHandler(async (req, res) => {
  const filter =
    req.user.role === "admin" ? { _id: req.params.id } : { _id: req.params.id, user: req.user._id };

  const review = await Review.findOneAndDelete(filter);
  if (!review) return response.error(res, "Review not found", 404);

  await recalculateRating(review.product);

  return response.success(res, "Review deleted successfully");
});

module.exports = { addReview, getProductReviews, updateReview, deleteReview };
