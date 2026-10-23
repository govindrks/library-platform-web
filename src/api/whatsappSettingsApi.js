import api from "./axios";

// ============================================================
// WHATSAPP SETTINGS API
// ============================================================

const BASE_URL = "/api/whatsapp/settings";

const whatsappSettingsApi = {
  // ==========================================================
  // GET LIBRARY SETTINGS
  // ==========================================================

  getLibrarySettings: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`${BASE_URL}/libraries/${libraryId}`);

    return response.data;
  },

  // ==========================================================
  // UPDATE LIBRARY SETTINGS
  // ==========================================================

  updateLibrarySettings: async (libraryId, payload) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.put(
      `${BASE_URL}/libraries/${libraryId}`,
      payload,
    );

    return response.data;
  },

  // ==========================================================
  // TOGGLE WHATSAPP FOR LIBRARY
  // ==========================================================

  toggleLibraryWhatsApp: async (libraryId, enabled) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.put(
      `${BASE_URL}/libraries/${libraryId}/enabled`,
      {
        enabled: Boolean(enabled),
      },
    );

    return response.data;
  },
};

export default whatsappSettingsApi;
