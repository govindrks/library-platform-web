import api from "../utility/axiosInterceptor";

const subscriptionApi = {

    // ============================================================
    // GET CURRENT USER SUBSCRIPTION
    // ============================================================

    getMySubscription: async () => {

        const response = await api.get(
            "/api/subscriptions/my"
        );

        return response.data;
    },


    // ============================================================
    // GET SUBSCRIPTION HISTORY
    // ============================================================

    getSubscriptionHistory: async () => {

        const response = await api.get(
            "/api/subscriptions/history"
        );

        return response.data;
    },


    // ============================================================
    // CREATE RENEWAL PAYMENT ORDER
    // ============================================================

    renewSubscription: async (
        subscriptionId
    ) => {

        const response = await api.post(
            `/api/subscriptions/${subscriptionId}/renew`
        );

        return response.data;
    },


    // ============================================================
    // UPDATE AUTO RENEW
    // ============================================================

    updateAutoRenew: async (
        subscriptionId,
        autoRenew
    ) => {

        const response = await api.put(
            `/api/subscriptions/${subscriptionId}/auto-renew`,
            {
                autoRenew,
            }
        );

        return response.data;
    },


    // ============================================================
    // DISABLE AUTO RENEW
    // ============================================================

    disableAutoRenew: async (
        subscriptionId
    ) => {

        const response = await api.put(
            `/api/subscriptions/${subscriptionId}/auto-renew/disable`
        );

        return response.data;
    },


    // ============================================================
    // GET CUSTOM PRICING
    // ============================================================

    getCustomPricing: async (
        libraryId,
        subscriptionId
    ) => {

        const response = await api.get(
            `/api/subscriptions/library/${libraryId}/${subscriptionId}/pricing`
        );

        return response.data;
    },


    // ============================================================
    // UPDATE CUSTOM PRICING
    // ============================================================

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


    // ============================================================
    // REMOVE CUSTOM PRICING
    // ============================================================

    removeCustomPricing: async (
        libraryId,
        subscriptionId
    ) => {

        const response = await api.delete(
            `/api/subscriptions/library/${libraryId}/${subscriptionId}/pricing`
        );

        return response.data;
    },


    // ============================================================
    // GET EFFECTIVE PRICE
    // ============================================================

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