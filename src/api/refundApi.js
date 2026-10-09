import api from "./axios";

const refundApi = {
    // ============================================================
    // GET ALL REFUNDS
    // ============================================================

    getLibraryRefunds: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/refunds`
        );

        return response.data;
    },

    // ============================================================
    // GET REFUND SUMMARY
    // ============================================================

    getRefundSummary: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/refunds/summary`
        );

        return response.data;
    },

    // ============================================================
    // GET REFUND DETAILS
    // ============================================================

    getRefundById: async (
        libraryId,
        refundId
    ) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/refunds/${refundId}`
        );

        return response.data;
    },

    // ============================================================
    // CREATE REFUND
    // ============================================================

    createRefund: async (
        libraryId,
        payload
    ) => {
        const response = await api.post(
            `/api/libraries/${libraryId}/refunds`,
            payload
        );

        return response.data;
    },
};

export default refundApi;