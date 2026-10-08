import api from "./axios";

const ownerPaymentApi = {
    getLibraryPayments: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/payments`
        );

        return response.data;
    },

    getLibraryPaymentSummary: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/payments/summary`
        );

        return response.data;
    },

    getLibraryPaymentById: async (
        libraryId,
        paymentId
    ) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/payments/${paymentId}`
        );

        return response.data;
    },
};

export default ownerPaymentApi;