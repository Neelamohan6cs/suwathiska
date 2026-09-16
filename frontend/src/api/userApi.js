import api from "./axios";

export const getProfile = () => api.get("/users/profile").then((r) => r.data);

export const updateProfile = (payload) => api.put("/users/profile", payload).then((r) => r.data);

export const changePassword = (payload) =>
  api.put("/users/change-password", payload).then((r) => r.data);

export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append("profileImage", file);
  return api
    .post("/users/profile/image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);
};
