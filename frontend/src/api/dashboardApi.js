import api from "./axios";

export const getCustomerDashboard = () => api.get("/dashboard/customer").then((r) => r.data);
