import api from "../utility/axiosInterceptor";

const seatChangeRequestApi = {
    // =========================================================
    // MEMBER / STUDENT
    // =========================================================

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


    // =========================================================
    // LIBRARY OWNER
    // =========================================================

    /**
     * Get seat change requests belonging to a library.
     *
     * status:
     * ALL
     * PENDING
     * APPROVED
     * REJECTED
     */
    getLibraryRequests: async (
        libraryId,
        status = "ALL"
    ) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/seat-change-requests`,
            {
                params: {
                    status,
                },
            }
        );

        return response.data;
    },

    /**
     * Get owner dashboard summary for seat change requests.
     */
    getLibraryRequestSummary: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/seat-change-requests/summary`
        );

        return response.data;
    },

    /**
     * Get one seat change request.
     */
    getLibraryRequestById: async (
        libraryId,
        requestId
    ) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/seat-change-requests/${requestId}`
        );

        return response.data;
    },

    /**
     * Approve a pending seat change request.
     */
    approveLibraryRequest: async (
        libraryId,
        requestId
    ) => {
        const response = await api.put(
            `/api/libraries/${libraryId}/seat-change-requests/${requestId}/approve`
        );

        return response.data;
    },

    /**
     * Reject a pending seat change request.
     */
    rejectLibraryRequest: async (
        libraryId,
        requestId,
        rejectionReason
    ) => {
        const response = await api.put(
            `/api/libraries/${libraryId}/seat-change-requests/${requestId}/reject`,
            {
                rejectionReason,
            }
        );

        return response.data;
    },
};

export default seatChangeRequestApi;