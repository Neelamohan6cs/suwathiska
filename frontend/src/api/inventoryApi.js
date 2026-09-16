import api from "./axios";

export const getInventory = () => api.get("/inventory").then((r) => r.data);

export const getLowStock = () => api.get("/inventory/low-stock").then((r) => r.data);

export const updateStock = (productId, payload) =>
  api.put(`/inventory/${productId}`, payload).then((r) => r.data);
