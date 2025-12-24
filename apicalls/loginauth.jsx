import { apiClient } from "@/lib/apiClient";

export const authApi = {
  login: async (data) => {
    return apiClient.post("/api/auth/login", data);
  },

  citizenLogin: async (data) => {
    return apiClient.post("/api/auth/citizen/login", data);
  },

  logout: async () => {
    return apiClient.post("/api/auth/logout");
  },

  getProfile: async () => {
    return apiClient.get("/api/auth/profile");
  },

};