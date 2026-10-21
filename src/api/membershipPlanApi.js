import api from "./axios";

const membershipPlanApi = {
  // =========================================================
  // OWNER - ALL PLANS
  // =========================================================

  getPlans: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`/api/libraries/${libraryId}/plans`);

    return response.data;
  },

  // =========================================================
  // PUBLIC / STUDENT - ACTIVE PLANS ONLY
  // =========================================================

  getActivePlans: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`/api/libraries/${libraryId}/plans/active`);

    return response.data;
  },

  // =========================================================
  // OWNER - CREATE
  // =========================================================

  createPlan: async (libraryId, payload) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!payload) {
      throw new Error("Membership plan payload is required.");
    }

    const response = await api.post(
      `/api/libraries/${libraryId}/plans`,
      payload,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - UPDATE
  // =========================================================

  updatePlan: async (planId, payload) => {
    if (!planId) {
      throw new Error("Membership plan ID is required.");
    }

    if (!payload) {
      throw new Error("Membership plan payload is required.");
    }

    const response = await api.put(`/api/libraries/plans/${planId}`, payload);

    return response.data;
  },

  // =========================================================
  // OWNER - DEACTIVATE
  // =========================================================

  deactivatePlan: async (planId) => {
    if (!planId) {
      throw new Error("Membership plan ID is required.");
    }

    const response = await api.delete(`/api/libraries/plans/${planId}`);

    return response.data;
  },

  // =========================================================
  // OWNER - ACTIVATE
  // =========================================================

  activatePlan: async (planId) => {
    if (!planId) {
      throw new Error("Membership plan ID is required.");
    }

    const response = await api.put(`/api/libraries/plans/${planId}/activate`);

    return response.data;
  },
};

export default membershipPlanApi;
