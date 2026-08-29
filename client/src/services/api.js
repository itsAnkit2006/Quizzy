import axios from "axios";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api",

    headers: {
        "Content-Type": "application/json",
    },

    timeout: 15000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            error.isNetworkError = true;

            error.userMessage =
                "Unable to connect to Quizzy. Please check your internet connection and try again.";

            return Promise.reject(error);
        }

        const status = error.response.status;

        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            error.isAuthError = true;

            error.userMessage =
                "Your session has expired. Please log in again.";

            return Promise.reject(error);
        }

        if (status >= 500) {
            error.isServerError = true;

            error.userMessage =
                "Quizzy is temporarily unavailable. Please try again later.";

            return Promise.reject(error);
        }

        error.userMessage =
            error.response.data?.message ||
            "Something went wrong. Please try again.";

        return Promise.reject(error);
    }
);

export default api;