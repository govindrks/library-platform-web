import api from "./axios";

const studentMembershipApi = {

  // =========================================================
  // GET ACTIVE LIBRARY MEMBERSHIP PLANS
  // =========================================================

  getLibraryPlans: async (
    libraryId
  ) => {

    if (!libraryId) {
      throw new Error(
        "Library ID is required."
      );
    }

    const response =
      await api.get(
        `/api/libraries/${libraryId}/plans/active`
      );

    return response.data;
  },
};

export default studentMembershipApi;