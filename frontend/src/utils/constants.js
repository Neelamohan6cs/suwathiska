export const ORDER_FLOW = [
  "Pending",
  "Confirmed",
  "Processing",
  "Packed",
  "Assigned",
  "Out for Delivery",
  "Delivered",
];

export const DELIVERY_FLOW = ["Assigned", "Picked Up", "Out for Delivery", "Delivered"];

export const ORDER_STATUS_LABELS = {
  Pending: "Order placed",
  Confirmed: "Confirmed",
  Processing: "Processing",
  Packed: "Packed",
  Assigned: "Assigned for delivery",
  "Out for Delivery": "Out for delivery",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

export const CATEGORY_LABELS = {
  cattle_feed: "Cattle Feed",
  calf_feed: "Calf Feed",
  mineral_mixture: "Mineral Mixture",
  silage: "Silage",
  fodder: "Fodder",
  feed_supplement: "Feed Supplement",
};

export const SUITABLE_FOR_OPTIONS = ["Cow", "Buffalo", "Calf", "Goat", "Sheep"];

export const CUSTOMER_STATUS_LABELS = {
  approved: "Approved",
  pending: "Pending approval",
  blocked: "Blocked",
  rejected: "Rejected",
};

export const SORT_OPTIONS = [
  { value: "", label: "Newest first" },
  { value: "newest", label: "Newest first" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "popularity", label: "Most Reviewed" },
];
