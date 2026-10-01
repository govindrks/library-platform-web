import api from "../utility/axiosInterceptor";

const subscriptionApi = {

    getCustomPricing: async (
        libraryId,
        subscriptionId
    ) => {

        const response = await api.get(
            `/api/subscriptions/library/${libraryId}/${subscriptionId}/pricing`
        );

        return response.data;
    },

    updateCustomPricing: async (
        libraryId,
        subscriptionId,
        payload
    ) => {

        const response = await api.put(
            `/api/subscriptions/library/${libraryId}/${subscriptionId}/pricing`,
            payload
        );

        return response.data;
    },

    removeCustomPricing: async (
        libraryId,
        subscriptionId
    ) => {

        const response = await api.delete(
            `/api/subscriptions/library/${libraryId}/${subscriptionId}/pricing`
        );

        return response.data;
    },

    getEffectivePrice: async (
        subscriptionId
    ) => {

        const response = await api.get(
            `/api/subscriptions/${subscriptionId}/effective-price`
        );

        return response.data;
    },

};

export default subscriptionApi;