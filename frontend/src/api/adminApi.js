import api from "./axios";

export const getAdminDashboard = () => api.get("/admin/dashboard").then((r) => r.data);

export const getCustomers = (params = {}) => api.get("/admin/customers", { params }).then((r) => r.data);

export const getCustomerById = (id) => api.get(`/admin/customers/${id}`).then((r) => r.data);

export const updateCustomerStatus = (id, status) =>
  api.put(`/admin/customers/${id}/status`, { status }).then((r) => r.data);

export const getDeliveryPersons = (params = {}) =>
  api.get("/admin/delivery", { params }).then((r) => r.data);

export const createDeliveryAccount = (payload) =>
  api.post("/admin/delivery", payload).then((r) => r.data);

export const updateDeliveryPersonStatus = (id, status) =>
  api.put(`/admin/delivery/${id}/status`, { status }).then((r) => r.data);

export const getDeliveryPersonOrders = (id) =>
  api.get(`/admin/delivery/${id}/orders`).then((r) => r.data);

export const getAllOrders = (params = {}) => api.get("/admin/orders", { params }).then((r) => r.data);

export const getAdminOrderById = (id) => api.get(`/admin/orders/${id}`).then((r) => r.data);

export const updateOrderStatus = (id, status, reason) =>
  api.put(`/admin/orders/${id}/status`, { status, reason }).then((r) => r.data);

export const assignDelivery = (id, deliveryPersonId) =>
  api.put(`/admin/orders/${id}/assign-delivery`, { deliveryPersonId }).then((r) => r.data);

export const getSalesReport = (period) =>
  api.get("/admin/reports/sales", { params: { period } }).then((r) => r.data);

export const getTopProducts = (limit) =>
  api.get("/admin/reports/products", { params: { limit } }).then((r) => r.data);

export const getCustomerGrowth = () => api.get("/admin/reports/customers").then((r) => r.data);

export const getDeliveryPerformance = () => api.get("/admin/reports/delivery").then((r) => r.data);
