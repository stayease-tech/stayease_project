import axios from "axios";

const tenantApi = axios.create({
    baseURL: "/tenant-portal",
});

tenantApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("tenantAccessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

tenantApi.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("tenantRefreshToken");
            if (refreshToken) {
                try {
                    const res = await axios.post("/api/token/refresh/", { refresh: refreshToken });
                    const newAccess = res.data.access;
                    localStorage.setItem("tenantAccessToken", newAccess);
                    originalRequest.headers.Authorization = `Bearer ${newAccess}`;
                    return tenantApi(originalRequest);
                } catch {
                    // Refresh failed — force logout
                    localStorage.removeItem("tenantAccessToken");
                    localStorage.removeItem("tenantRefreshToken");
                    localStorage.removeItem("tenantData");
                    localStorage.removeItem("userType");
                    localStorage.removeItem("phone");
                    window.location.href = "/login";
                }
            }
        }
        return Promise.reject(error);
    }
);

export default tenantApi;
