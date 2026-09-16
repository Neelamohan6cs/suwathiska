import api from "./axios";

export const updateReview = (id, payload) => api.put(`/reviews/${id}`, payload).then((r) => r.data);

export const deleteReview = (id) => api.delete(`/reviews/${id}`).then((r) => r.data);
