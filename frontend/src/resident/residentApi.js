// Copyright (c) 2026 Aravind Adari. All rights reserved.

import axios from "axios";
import { toast } from "react-toastify";

/**
 * Axios instance pre-configured for the resident portal API.
 * Automatically attaches the resident JWT access token and handles
 * silent token refresh on 401 responses, redirecting to /login on failure.
 */
const residentApi = axios.create({
    baseURL: "/resident-portal",
});

residentApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("residentAccessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

residentApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("residentRefreshToken");
            if (refreshToken) {
                try {
                    const res = await axios.post("/api/token/refresh/", { refresh: refreshToken });
                    const newAccess = res.data.access;
                    localStorage.setItem("residentAccessToken", newAccess);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return residentApi(originalRequest);
                } catch {
                    // Refresh failed — force logout
                    localStorage.removeItem("residentAccessToken");
                    localStorage.removeItem("residentRefreshToken");
                    localStorage.removeItem("residentData");
                    localStorage.removeItem("userType");
                    localStorage.removeItem("phone");
                    window.location.href = "/login";
                }
            }
        }

        const skipGlobalErrorToast = error?.config?.skipGlobalErrorToast;
        if (!skipGlobalErrorToast) {
            const apiMessage = error?.response?.data?.message;
            toast.error(apiMessage || "Request failed. Please try again.");
        }

        return Promise.reject(error);
    }
);

export default residentApi;
