import api from "./axios";

// ============================================================
// WHATSAPP ADMIN API
// ============================================================

const BASE_URL = "/api/admin/whatsapp";

const whatsappAdminApi = {
  // ==========================================================
  // OVERVIEW
  // ==========================================================

  getOverview: async ({ period = "THIS_MONTH" } = {}) => {
    const response = await api.get(`${BASE_URL}/overview`, {
      params: {
        period,
      },
    });

    return response.data;
  },

  // ==========================================================
  // TEMPLATES
  // ==========================================================

  getTemplates: async () => {
    const response = await api.get(`${BASE_URL}/templates`);

    return response.data;
  },

  // ==========================================================
  // FAILURES
  // ==========================================================

  getFailures: async ({
    page = 0,
    size = 20,
    notificationType,
    search,
  } = {}) => {
    const response = await api.get(`${BASE_URL}/failures`, {
      params: {
        page,
        size,

        notificationType: notificationType || undefined,

        search: search?.trim() || undefined,
      },
    });

    return response.data;
  },

  // ==========================================================
  // RETRY FAILED MESSAGE
  // ==========================================================

  retryFailure: async (messageId, { note = null } = {}) => {
    if (!messageId) {
      throw new Error("Message ID is required.");
    }

    const response = await api.post(`${BASE_URL}/messages/${messageId}/retry`, {
      note,
    });

    return response.data;
  },
};

export default whatsappAdminApi;
