import api from "./axios";

const libraryRegistrationApi = {

  // ============================================================
  // STEP 1 — REGISTER LIBRARY OWNER
  // ============================================================

  registerOwner: async (payload) => {
    const response = await api.post(
      "/api/auth/register/library-owner",
      payload
    );

    return response.data;
  },


  // ============================================================
  // STEP 2 — CREATE / UPDATE DRAFT LIBRARY
  // ============================================================

  saveLibraryDetails: async (payload) => {
    const response = await api.post(
      "/api/libraries",
      payload
    );

    return response.data;
  },


  // ============================================================
  // STEP 3 — ASSIGN AMENITIES
  // ============================================================

  saveAmenities: async (
    libraryId,
    amenityIds
  ) => {
    const response = await api.post(
      `/api/libraries/${libraryId}/amenities`,
      {
        amenityIds,
      }
    );

    return response.data;
  },


  // ============================================================
  // STEP 3 — GET ASSIGNED AMENITIES
  // Useful for resume/edit onboarding
  // ============================================================

  getLibraryAmenities: async (
    libraryId
  ) => {
    const response = await api.get(
      `/api/libraries/${libraryId}/amenities`
    );

    return response.data;
  },


  // ============================================================
  // STEP 4A — CREATE FLOOR
  // ============================================================

  createFloor: async (
    libraryId,
    payload
  ) => {
    const response = await api.post(
      `/api/libraries/${libraryId}/floors`,
      payload
    );

    return response.data;
  },


  // ============================================================
  // STEP 4B — GET FLOORS
  // Useful for resume/edit onboarding
  // ============================================================

  getFloors: async (
    libraryId
  ) => {
    const response = await api.get(
      `/api/libraries/${libraryId}/floors`
    );

    return response.data;
  },


  // ============================================================
  // STEP 4C — SAVE FLOOR SEAT LAYOUT
  // ============================================================

  saveSeatLayout: async (
    libraryId,
    floorId,
    payload
  ) => {
    const response = await api.put(
      `/api/libraries/${libraryId}/floors/${floorId}/layout`,
      payload
    );

    return response.data;
  },


  // ============================================================
  // STEP 4D — GET SEAT MATRIX
  // ============================================================

  getSeatMatrix: async (
    libraryId,
    floorId
  ) => {
    const response = await api.get(
      `/api/libraries/${libraryId}/floors/${floorId}/seat-matrix`
    );

    return response.data;
  },


  // ============================================================
  // STEP 4E — COMPLETE SEAT SETUP
  // ============================================================

  completeSeatSetup: async (
    libraryId
  ) => {
    const response = await api.post(
      `/api/libraries/${libraryId}/seat-setup/complete`
    );

    return response.data;
  },


  // ============================================================
  // STEP 5 — SELECT PLATFORM PLAN
  // ============================================================

  selectPlatformPlan: async (
    libraryId,
    platformPlanId,
    autoRenew = false
  ) => {
    const response = await api.post(
      `/api/platform/subscriptions/onboarding/libraries/${libraryId}/plan`,
      {
        platformPlanId,
        autoRenew,
      }
    );

    return response.data;
  },


  // ============================================================
  // STEP 6 — COMPLETE ONBOARDING
  // ============================================================

  completeOnboarding: async (
    libraryId,
    termsAccepted
  ) => {
    const response = await api.post(
      `/api/libraries/${libraryId}/onboarding/complete`,
      {
        termsAccepted,
      }
    );

    return response.data;
  },


  // ============================================================
  // OWNER LIBRARIES
  // ============================================================

  getMyLibraries: async () => {
    const response = await api.get(
      "/api/libraries/my"
    );

    return response.data;
  },

};

export default libraryRegistrationApi;