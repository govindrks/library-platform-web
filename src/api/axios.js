import axios from "axios";

import storage from "../utility/browserStorage";

const api = axios.create({
    baseURL:
        import.meta.env.VITE_API_BASE_URL ||
        "http://localhost:8080",

    headers: {
        "Content-Type": "application/json",
    },
});


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================
//
// Automatically attaches the JWT token to every API request.
//
// Authorization:
// Bearer <jwt-token>
//
// ============================================================

api.interceptors.request.use(
    (config) => {

        const token =
            storage.getToken();

        if (token) {

            config.headers =
                config.headers || {};

            config.headers.Authorization =
                `Bearer ${token}`;
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
//
// Handle expired / invalid authentication globally.
//
// IMPORTANT:
// 401 = authentication invalid/expired
// 403 = authenticated but forbidden
//
// Do not automatically logout on 403.
//
// ============================================================

api.interceptors.response.use(
    (response) => response,

    (error) => {

        if (
            error.response?.status === 401
        ) {

            storage.clear();

            if (
                window.location.pathname !==
                "/login"
            ) {

                window.location.href =
                    "/login";
            }
        }

        return Promise.reject(error);
    }
);


export default api;