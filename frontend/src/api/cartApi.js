import api from "./axios";

export const getCart = () => api.get("/cart").then((r) => r.data);

export const addToCart = (productId, quantity = 1) =>
  api.post("/cart/add", { productId, quantity }).then((r) => r.data);

export const updateCartItem = (productId, quantity) =>
  api.put("/cart/update", { productId, quantity }).then((r) => r.data);

export const removeFromCart = (productId) =>
  api.delete(`/cart/remove/${productId}`).then((r) => r.data);

export const clearCart = () => api.delete("/cart/clear").then((r) => r.data);
