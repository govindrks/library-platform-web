import api from "./axios";

const studentNotificationApi = {
  getUnread: async () => {
    const response = await api.get("/api/notifications/unread");

    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/api/notifications/count");

    return response.data;
  },

  markAsRead: async (notificationId) => {
    if (!notificationId) {
      throw new Error("Notification ID is required.");
    }

    const response = await api.put(`/api/notifications/${notificationId}/read`);

    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/api/notifications/mark-all-read");

    return response.data;
  },
};

export default studentNotificationApi;
