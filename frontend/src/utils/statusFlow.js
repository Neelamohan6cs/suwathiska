import { DELIVERY_FLOW, ORDER_FLOW } from "./constants";

export const nextOrderStatus = (currentStatus) => {
  const index = ORDER_FLOW.indexOf(currentStatus);
  if (index === -1 || index === ORDER_FLOW.length - 1) return null;
  return ORDER_FLOW[index + 1];
};

export const nextDeliveryStatus = (currentStatus) => {
  const index = DELIVERY_FLOW.indexOf(currentStatus);
  if (index === -1 || index === DELIVERY_FLOW.length - 1) return null;
  return DELIVERY_FLOW[index + 1];
};

export const isOrderFinal = (status) => status === "Delivered" || status === "Cancelled";

export const isDeliveryFinal = (status) => status === "Delivered" || status === "Failed Delivery";

export const statusBadgeTone = (status) => {
  const tones = {
    Pending: "bg-wheat-100 text-wheat-600",
    Confirmed: "bg-dairy-100 text-dairy-700",
    Processing: "bg-dairy-100 text-dairy-700",
    Packed: "bg-dairy-100 text-dairy-700",
    Assigned: "bg-dairy-100 text-dairy-700",
    "Out for Delivery": "bg-wheat-100 text-wheat-600",
    Delivered: "bg-leaf-500/10 text-leaf-600",
    Cancelled: "bg-clay-500/10 text-clay-600",
    Approved: "bg-leaf-500/10 text-leaf-600",
    approved: "bg-leaf-500/10 text-leaf-600",
    pending: "bg-wheat-100 text-wheat-600",
    blocked: "bg-clay-500/10 text-clay-600",
    rejected: "bg-clay-500/10 text-clay-600",
    Paid: "bg-leaf-500/10 text-leaf-600",
    Failed: "bg-clay-500/10 text-clay-600",
    Refunded: "bg-dairy-100 text-dairy-700",
  };
  return tones[status] || "bg-dairy-50 text-dairy-700";
};
