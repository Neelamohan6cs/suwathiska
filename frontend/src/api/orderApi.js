import api from "./axios";

export const createOrder = (payload) => api.post("/orders", payload).then((r) => r.data);

export const getMyOrders = () => api.get("/orders/my-orders").then((r) => r.data);

export const getOrderById = (id) => api.get(`/orders/${id}`).then((r) => r.data);

export const cancelOrder = (id, reason) =>
  api.put(`/orders/${id}/cancel`, { reason }).then((r) => r.data);

export const getOrderLocation = (id) => api.get(`/orders/${id}/location`).then((r) => r.data);

export const updateOrderLocation = (id, latitude, longitude) =>
  api.put(`/orders/${id}/location`, { latitude, longitude }).then((r) => r.data);
