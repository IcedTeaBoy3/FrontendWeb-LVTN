import axios from "axios";
import { store } from "@/redux/store"; // nơi chứa store Redux
import {AuthService} from "@/services/AuthService"; // nơi chứa các hàm gọi API
import { logout, setUser } from "@/redux/slices/authSlice";
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_APP_BACKEND_URL}/api`,
    withCredentials: true, // để gửi cookie lên nếu dùng HttpOnly
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) prom.reject(error);
        else prom.resolve(token);
    });
    failedQueue = [];
};

// Add access_token từ Redux
axiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = store.getState().auth?.user?.accessToken;
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error),
);

// Xử lý khi token hết hạn (401)
axiosInstance.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config;

        if (
            error.response?.data.message === "jwt expired" &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return axiosInstance(originalRequest);
                });
            }
            isRefreshing = true;
            try {
                const res = await AuthService.refreshToken();
                console.log('res',res)
                if (res?.status === "error") {
                    // store.dispatch(logout());
                    return Promise.reject(res);
                } else if (res?.status === "success") {
                    console.log("Token mới:", res?.accessToken);
                    const user = store.getState().auth.user;
                    const newAccessToken = res.accessToken;
                    store.dispatch(
                        setUser({ ...user, accessToken: newAccessToken }),
                    );
                    axiosInstance.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
                    processQueue(null, newAccessToken);
                    return axiosInstance(originalRequest);
                }
            } catch (err) {
                processQueue(err, null);
                // store.dispatch(logout());
                return Promise.reject(err);
            } finally {
                isRefreshing = false;
            }
        }
        return Promise.reject(error);
    },
);
export default axiosInstance;
