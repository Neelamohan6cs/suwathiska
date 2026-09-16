import api from "./axios";

export const getProducts = (params = {}) => api.get("/products", { params }).then((r) => r.data);

export const getProductById = (id, params = {}) =>
  api.get(`/products/${id}`, { params }).then((r) => r.data);

export const getProductReviews = (id) => api.get(`/products/${id}/reviews`).then((r) => r.data);

export const addProductReview = (id, payload) =>
  api.post(`/products/${id}/reviews`, payload).then((r) => r.data);

export const createProduct = (formData) =>
  api
    .post("/products", formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);

export const updateProduct = (id, formData) =>
  api
    .put(`/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);

export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);

export const toggleProductAvailability = (id) =>
  api.put(`/products/${id}/toggle-availability`).then((r) => r.data);
