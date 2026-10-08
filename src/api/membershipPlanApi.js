import api from "./axios";

const membershipPlanApi = {

    getPlans: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/plans`
        );

        return response.data;
    },

    getActivePlans: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/plans/active`
        );

        return response.data;
    },

    createPlan: async (libraryId, payload) => {
        const response = await api.post(
            `/api/libraries/${libraryId}/plans`,
            payload
        );

        return response.data;
    },

    updatePlan: async (planId, payload) => {
        const response = await api.put(
            `/api/libraries/plans/${planId}`,
            payload
        );

        return response.data;
    },

    deactivatePlan: async (planId) => {
        const response = await api.delete(
            `/api/libraries/plans/${planId}`
        );

        return response.data;
    },

    activatePlan: async (planId) => {
        const response = await api.put(
            `/api/libraries/plans/${planId}/activate`
        );

        return response.data;
    },
};

export default membershipPlanApi;