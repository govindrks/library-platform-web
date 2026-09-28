import api from "../utility/axiosInterceptor";

const seatChangeRequestApi = {
    createRequest: async (payload) => {
        const response = await api.post(
            "/api/seat-change-requests",
            payload
        );

        return response.data;
    },

    getMyRequests: async () => {
        const response = await api.get(
            "/api/seat-change-requests/my"
        );

        return response.data;
    },

    getMyRequestById: async (requestId) => {
        const response = await api.get(
            `/api/seat-change-requests/my/${requestId}`
        );

        return response.data;
    },

    getLibraryRequests: async (libraryId, status) => {
        const params = {};

        if (status && status !== "ALL") {
            params.status = status;
        }

        const response = await api.get(
            `/api/libraries/${libraryId}/seat-change-requests`,
            { params }
        );

        return response.data;
    },

    reviewRequest: async (libraryId, requestId, payload) => {
        const response = await api.put(
            `/api/libraries/${libraryId}/seat-change-requests/${requestId}`,
            payload
        );

        return response.data;
    },
};

export default seatChangeRequestApi;