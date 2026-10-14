import api from "./axios";

// ============================================================
// NOTIFICATION API
// ============================================================

const notificationApi = {
  // ==========================================================
  // GET ALL NOTIFICATIONS
  // ==========================================================

  getAll: async (page = 0, size = 20) => {
    const response = await api.get("/api/notifications", {
      params: {
        page,
        size,
      },
    });

    return response.data;
  },

  // ==========================================================
  // GET UNREAD NOTIFICATIONS
  // ==========================================================

  getUnread: async (page = 0, size = 20) => {
    const response = await api.get("/api/notifications/unread", {
      params: {
        page,
        size,
      },
    });

    return response.data;
  },

  // ==========================================================
  // GET UNREAD COUNT
  // ==========================================================

  getUnreadCount: async () => {
    const response = await api.get("/api/notifications/unread-count");

    return response.data;
  },

  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================

  markAsRead: async (notificationId) => {
    if (!notificationId) {
      throw new Error("Notification ID is required.");
    }

    const response = await api.put(`/api/notifications/${notificationId}/read`);

    return response.data;
  },

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  markAllAsRead: async () => {
    const response = await api.put("/api/notifications/read-all");

    return response.data;
  },
};

export default notificationApi;
