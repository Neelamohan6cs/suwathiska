import api from "./axios";

export const registerCustomer = (payload) => api.post("/auth/register", payload).then((r) => r.data);

export const login = (payload) => api.post("/auth/login", payload).then((r) => r.data);
