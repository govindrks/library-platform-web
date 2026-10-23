import api from "./axios";

// ============================================================
// WHATSAPP CONSENT API
// ============================================================
//
// NOTE:
//
// The backend consent service/repository exists conceptually,
// but the final public controller contract has not yet been
// confirmed.
//
// Keeping paths here in one place means we can adjust them
// later without changing UI components.
//
// ============================================================

const BASE_URL = "/api/whatsapp/consent";

const whatsappConsentApi = {
  // ==========================================================
  // GET CURRENT USER CONSENT
  // ==========================================================

  getMyConsent: async () => {
    const response = await api.get(`${BASE_URL}/me`);

    return response.data;
  },

  // ==========================================================
  // UPDATE CURRENT USER CONSENT
  // ==========================================================
  //
  // Expected payload:
  //
  // {
  //   enabled: true
  // }
  //
  // ==========================================================

  updateMyConsent: async (enabled) => {
    const response = await api.put(`${BASE_URL}/me`, {
      enabled: Boolean(enabled),
    });

    return response.data;
  },

  // ==========================================================
  // GRANT CONSENT
  // ==========================================================

  grantConsent: async () => {
    const response = await api.post(`${BASE_URL}/me/grant`);

    return response.data;
  },

  // ==========================================================
  // REVOKE CONSENT
  // ==========================================================

  revokeConsent: async () => {
    const response = await api.post(`${BASE_URL}/me/revoke`);

    return response.data;
  },
};

export default whatsappConsentApi;
