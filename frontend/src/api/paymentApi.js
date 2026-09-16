import api from "./axios";

export const getPaymentByOrder = (orderId) => api.get(`/payments/${orderId}`).then((r) => r.data);

export const verifyOnlinePayment = (orderId, transactionId) =>
  api.post(`/payments/${orderId}/verify`, { transactionId }).then((r) => r.data);

export const getAllPayments = (params = {}) =>
  api.get("/payments", { params }).then((r) => r.data);

export const updatePaymentStatus = (id, paymentStatus) =>
  api.put(`/payments/${id}/status`, { paymentStatus }).then((r) => r.data);
