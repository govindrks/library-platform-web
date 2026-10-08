import api from "./axios";

const platformPlanApi = {

  getActivePlans: async () => {

    const response = await api.get(
      "/api/platform/plans/active"
    );

    return response.data;
  },


  getById: async (planId) => {

    const response = await api.get(
      `/api/platform/plans/${planId}`
    );

    return response.data;
  },

};

export default platformPlanApi;