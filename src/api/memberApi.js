import api from "./axios";

const memberApi = {

    // =========================================================
    // LIBRARY OWNER - MEMBERS
    // =========================================================

    /**
     * Get all members belonging to the selected library.
     */
    getLibraryMembers: async (libraryId) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/members`
        );

        return response.data;
    },


    /**
     * Get summary information for the Members page.
     */
    getLibraryMemberSummary: async (libraryId) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/members/summary`
        );

        return response.data;
    },


    /**
     * Get complete details for one member.
     */
    getLibraryMemberById: async (
        libraryId,
        memberId
    ) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/members/${memberId}`
        );

        return response.data;
    },


    /**
     * Suspend an active library member.
     */
    suspendMember: async (
        libraryId,
        memberId
    ) => {

        const response = await api.put(
            `/api/libraries/${libraryId}/members/${memberId}/suspend`
        );

        return response.data;
    },


    /**
     * Reactivate a suspended library member.
     */
    reactivateMember: async (
        libraryId,
        memberId
    ) => {

        const response = await api.put(
            `/api/libraries/${libraryId}/members/${memberId}/reactivate`
        );

        return response.data;
    },
};

export default memberApi;