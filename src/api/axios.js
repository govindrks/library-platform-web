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
// Automatically attaches JWT to API requests.
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

        return Promise.reject(
            error
        );
    }
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================
//
// Handles:
//
// 401
//     Invalid / expired authentication
//
// 403
//     Authenticated but forbidden
//     Do NOT automatically logout.
//
// 503 + maintenanceMode=true
//     Platform is in maintenance mode.
//
// ============================================================

api.interceptors.response.use(

    (response) =>
        response,


    (error) => {


        const status =
            error.response?.status;


        const data =
            error.response?.data;


        // =====================================================
        // 401 - TOKEN INVALID / EXPIRED
        // =====================================================

        if (
            status === 401
        ) {

            storage.clear();


            if (
                window.location.pathname !==
                "/login"
            ) {

                window.location.href =
                    "/login";
            }


            return Promise.reject(
                error
            );
        }


        // =====================================================
        // 503 - PLATFORM MAINTENANCE
        // =====================================================

        if (
            status === 503
            &&
            data?.maintenanceMode === true
        ) {

            /*
             * ADMIN requests should already be allowed by the
             * backend maintenance filter.
             *
             * Therefore, if the frontend receives this response,
             * the current authenticated user is normally USER
             * or LIBRARY_OWNER.
             */

            if (
                window.location.pathname !==
                "/maintenance"
            ) {

                window.location.href =
                    "/maintenance";
            }


            return Promise.reject(
                error
            );
        }


        // =====================================================
        // 403
        // =====================================================
        //
        // Do not clear authentication.
        //
        // 403 means:
        //
        // authenticated successfully,
        // but user does not have permission.
        //
        // =====================================================


        return Promise.reject(
            error
        );
    }
);


export default api;