import axios from "axios";

import storage from "../utility/browserStorage";

// ============================================================
// AXIOS INSTANCE
// ============================================================

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080",

  /*
   * IMPORTANT:
   *
   * Do not set a global Content-Type header here.
   *
   * Axios/browser will automatically choose the correct
   * Content-Type based on the request body.
   *
   * JSON:
   *   application/json
   *
   * FormData:
   *   multipart/form-data; boundary=...
   *
   * Setting application/json globally would break file uploads
   * such as profile image uploads.
   */
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(
  (config) => {
    // ========================================================
    // AUTH TOKEN
    // ========================================================

    const token = storage.getToken();

    if (token) {
      config.headers = config.headers || {};

      config.headers.Authorization = `Bearer ${token}`;
    }

    // ========================================================
    // FORMDATA / MULTIPART REQUESTS
    // ========================================================

    /*
     * When FormData is used, do not manually force a
     * Content-Type.
     *
     * The browser must generate the multipart boundary.
     */
    if (
      typeof FormData !== "undefined" &&
      config.data instanceof FormData &&
      config.headers
    ) {
      /*
       * Axios v1 normally uses AxiosHeaders.
       */
      if (typeof config.headers.delete === "function") {
        config.headers.delete("Content-Type");
      } else {
        delete config.headers["Content-Type"];

        delete config.headers["content-type"];
      }
    }

    return config;
  },

  (error) => Promise.reject(error),
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error?.response?.status;

    const responseData = error?.response?.data;

    const requestUrl = String(error?.config?.url || "");

    // ========================================================
    // AUTH REQUEST DETECTION
    // ========================================================

    /*
     * A 401 returned by login/register should remain inside
     * those pages so they can display the backend error.
     *
     * Example:
     *
     * POST /api/auth/login
     * → 401
     * → Login.jsx shows "Invalid email or password"
     *
     * We should not trigger another redirect for that request.
     */
    const isAuthRequest =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/register");

    // ========================================================
    // UNAUTHORIZED
    // ========================================================

    if (status === 401 && !isAuthRequest) {
      /*
       * Backend rejected the current JWT/session.
       *
       * Clear all browser authentication persistence.
       */
      storage.clear();

      /*
       * Full navigation is intentional.
       *
       * It recreates the React application and AuthContext
       * from the now-cleared browser storage, preventing stale
       * authenticated state from remaining in memory.
       */
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    // ========================================================
    // MAINTENANCE MODE
    // ========================================================

    if (status === 503 && responseData?.maintenanceMode === true) {
      if (window.location.pathname !== "/maintenance") {
        window.location.replace("/maintenance");
      }
    }

    // ========================================================
    // PROPAGATE ERROR
    // ========================================================

    return Promise.reject(error);
  },
);

export default api;
