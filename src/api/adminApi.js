import api from "./axios";

const adminApi = {
  // =========================================================
  // DASHBOARD
  // =========================================================

  getDashboard: async () => {
    const response = await api.get("/api/admin/dashboard");

    return response.data;
  },

  // =========================================================
  // LIBRARIES
  // =========================================================

  getLibraries: async ({ search = "", status = "" } = {}) => {
    const params = {};

    if (search?.trim()) {
      params.search = search.trim();
    }

    if (status) {
      params.status = status;
    }

    const response = await api.get("/api/admin/libraries", {
      params,
    });

    return response.data;
  },

  getLibrary: async (libraryId) => {
    const response = await api.get(`/api/admin/libraries/${libraryId}`);

    return response.data;
  },

  updateLibraryStatus: async (libraryId, status) => {
    const response = await api.patch(
      `/api/admin/libraries/${libraryId}/status`,
      {
        status,
      },
    );

    return response.data;
  },

  // =========================================================
  // USERS
  // =========================================================

  getUsers: async ({ search = "", role = "" } = {}) => {
    const params = {};

    if (search?.trim()) {
      params.search = search.trim();
    }

    if (role) {
      params.role = role;
    }

    const response = await api.get("/api/admin/users", {
      params,
    });

    return response.data;
  },

  getUserSummary: async () => {
    const response = await api.get("/api/admin/users/summary");

    return response.data;
  },

  getUser: async (userId) => {
    const response = await api.get(`/api/admin/users/${userId}`);

    return response.data;
  },

  // =========================================================
  // PLATFORM PLANS
  // =========================================================

  getPlatformPlans: async () => {
    const response = await api.get("/api/platform/plans");

    return response.data;
  },

  getActivePlatformPlans: async () => {
    const response = await api.get("/api/platform/plans/active");

    return response.data;
  },

  getPlatformPlan: async (planId) => {
    const response = await api.get(`/api/platform/plans/${planId}`);

    return response.data;
  },

  createPlatformPlan: async (payload) => {
    const response = await api.post("/api/platform/plans", payload);

    return response.data;
  },

  updatePlatformPlan: async (planId, payload) => {
    const response = await api.put(`/api/platform/plans/${planId}`, payload);

    return response.data;
  },

  activatePlatformPlan: async (planId) => {
    const response = await api.patch(`/api/platform/plans/${planId}/activate`);

    return response.data;
  },

  deactivatePlatformPlan: async (planId) => {
    const response = await api.patch(
      `/api/platform/plans/${planId}/deactivate`,
    );

    return response.data;
  },

  // =========================================================
  // PLATFORM SUBSCRIPTIONS
  // =========================================================

  getPlatformSubscriptions: async ({ search = "", status = "" } = {}) => {
    const params = {};

    if (search?.trim()) {
      params.search = search.trim();
    }

    if (status) {
      params.status = status;
    }

    const response = await api.get("/api/admin/subscriptions", {
      params,
    });

    return response.data;
  },

  // =========================================================
  // PLATFORM SUBSCRIPTION SUMMARY
  // =========================================================

  getPlatformSubscriptionSummary: async () => {
    const response = await api.get("/api/admin/subscriptions/summary");

    return response.data;
  },

  // =========================================================
  // PLATFORM SUBSCRIPTION DETAILS
  // =========================================================

  getPlatformSubscription: async (subscriptionId) => {
    const response = await api.get(
      `/api/admin/subscriptions/${subscriptionId}`,
    );

    return response.data;
  },

  // =========================================================
  // PAYMENTS
  // =========================================================

  getPayments: async ({
    search = "",
    status = "",
    referenceType = "",
  } = {}) => {
    const params = {};

    if (search?.trim()) {
      params.search = search.trim();
    }

    if (status) {
      params.status = status;
    }

    if (referenceType) {
      params.referenceType = referenceType;
    }

    const response = await api.get("/api/admin/payments", {
      params,
    });

    return response.data;
  },

  // =========================================================
  // PAYMENT SUMMARY
  // =========================================================

  getPaymentSummary: async () => {
    const response = await api.get("/api/admin/payments/summary");

    return response.data;
  },

  // =========================================================
  // PAYMENT DETAILS
  // =========================================================

  getPayment: async (paymentId) => {
    const response = await api.get(`/api/admin/payments/${paymentId}`);

    return response.data;
  },

  // =========================================================
  // REPORTS
  // =========================================================

  getReports: async () => {
    const response = await api.get("/api/admin/reports");

    return response.data;
  },

  // =========================================================
  // PLATFORM SETTINGS
  // =========================================================

  getPlatformSettings: async () => {
    const response = await api.get("/api/admin/settings");

    return response.data;
  },

  // =========================================================
  // UPDATE PLATFORM SETTINGS
  // =========================================================

  updatePlatformSettings: async (payload) => {
    const response = await api.put("/api/admin/settings", payload);

    return response.data;
  },
};

export default adminApi;
