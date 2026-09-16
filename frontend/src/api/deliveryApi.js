import api from "./axios";

export const getDeliveryDashboard = () => api.get("/delivery/dashboard").then((r) => r.data);

export const getMyDeliveries = (params = {}) =>
  api.get("/delivery/orders", { params }).then((r) => r.data);

export const getDeliveryById = (id) => api.get(`/delivery/orders/${id}`).then((r) => r.data);

export const updateDeliveryStatus = (id, status, deliveryNotes) =>
  api.put(`/delivery/orders/${id}/status`, { status, deliveryNotes }).then((r) => r.data);

export const startRide = (id, latitude, longitude) =>
  api.post(`/delivery/orders/${id}/start-ride`, { latitude, longitude }).then((r) => r.data);

export const updateDriverLocation = (id, latitude, longitude) =>
  api.put(`/delivery/orders/${id}/driver-location`, { latitude, longitude }).then((r) => r.data);

export const getDeliveryRoute = (id) => api.get(`/delivery/orders/${id}/route`).then((r) => r.data);

export const getActiveDeliveries = () => api.get("/delivery/active").then((r) => r.data);
