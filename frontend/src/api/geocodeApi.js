import api from "./axios";

export const reverseGeocode = (latitude, longitude) =>
  api.post("/geocode/reverse", { latitude, longitude }).then((r) => r.data);

export const searchAddress = (query) =>
  api.get("/geocode/search", { params: { q: query } }).then((r) => r.data);
