import api from "./axios";

// ============================================================
// WHATSAPP MESSAGES API
// ============================================================

const BASE_URL = "/api/whatsapp/messages";

const whatsappMessagesApi = {
  // ==========================================================
  // GET LIBRARY MESSAGES
  // ==========================================================

  getLibraryMessages: async ({
    libraryId,
    page = 0,
    size = 20,
    status,
    notificationType,
    search,
  }) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`${BASE_URL}/libraries/${libraryId}`, {
      params: {
        page,
        size,

        status: status || undefined,

        notificationType: notificationType || undefined,

        search: search?.trim() || undefined,
      },
    });

    return response.data;
  },

  // ==========================================================
  // GET MESSAGE DETAILS
  // ==========================================================

  getMessageById: async (messageId) => {
    if (!messageId) {
      throw new Error("Message ID is required.");
    }

    const response = await api.get(`${BASE_URL}/${messageId}`);

    return response.data;
  },

  // ==========================================================
  // RETRY MESSAGE
  // ==========================================================

  retryMessage: async (messageId, { note = null } = {}) => {
    if (!messageId) {
      throw new Error("Message ID is required.");
    }

    const response = await api.post(`${BASE_URL}/${messageId}/retry`, {
      note,
    });

    return response.data;
  },
};

export default whatsappMessagesApi;
