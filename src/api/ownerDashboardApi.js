import api from "./axios";

const ownerDashboardApi = {

  // ============================================================
  // OWNER DASHBOARD CONTEXT
  //
  // Works even when owner has not created a library yet.
  // ============================================================

  getContext: async () => {

    const response = await api.get(
      "/api/dashboard/owner/context"
    );

    return response.data;
  },


  // ============================================================
  // COMPLETE OPERATIONAL DASHBOARD
  //
  // Call only when a library exists.
  // ============================================================

  getDashboard: async (libraryId) => {

    const response = await api.get(
      `/api/dashboard/${libraryId}`
    );

    return response.data;
  },


  // ============================================================
  // STATISTICS
  // ============================================================

  getStatistics: async (libraryId) => {

    const response = await api.get(
      `/api/dashboard/${libraryId}/statistics`
    );

    return response.data;
  },


  // ============================================================
  // ACTIVITIES
  // ============================================================

  getActivities: async (libraryId) => {

    const response = await api.get(
      `/api/dashboard/${libraryId}/activities`
    );

    return response.data;
  },


  // ============================================================
  // ALERTS
  // ============================================================

  getAlerts: async (libraryId) => {

    const response = await api.get(
      `/api/dashboard/${libraryId}/alerts`
    );

    return response.data;
  },


  // ============================================================
  // QUICK ACTIONS
  // ============================================================

  getQuickActions: async (libraryId) => {

    const response = await api.get(
      `/api/dashboard/${libraryId}/quick-actions`
    );

    return response.data;
  },

};

export default ownerDashboardApi;