import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
});

export const getCurrentUser = (token) =>
  api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export const searchUsers = (token, query) =>
  api.get("/users/search", {
    params: { q: query },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

export default api;
