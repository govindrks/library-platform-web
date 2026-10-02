import api from "./axios";

const libraryApi = {

    // =========================================================
    // LIBRARY
    // =========================================================

    getMyLibraries: async () => {
        const response =
            await api.get("/api/libraries/my");

        return response.data;
    },

    getLibraryDetails: async (libraryId) => {
        const response =
            await api.get(
                `/api/libraries/${libraryId}`
            );

        return response.data;
    },

    updateLibrary: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}`,
                payload
            );

        return response.data;
    },


    // =========================================================
    // PUBLIC LIBRARIES
    // =========================================================

    getAllLibraries: async () => {

        const response =
            await api.get(
                "/api/libraries"
            );

        return response.data;
    },


    // =========================================================
    // STANDARD AMENITIES
    // =========================================================

    getAllAmenities: async () => {

        const response =
            await api.get(
                "/api/amenities"
            );

        return response.data;
    },


    getLibraryAmenities: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/amenities`
            );

        return response.data;
    },


    assignLibraryAmenities: async (
        libraryId,
        amenityIds
    ) => {

        const response =
            await api.post(
                `/api/libraries/${libraryId}/amenities`,
                {
                    amenityIds,
                }
            );

        return response.data;
    },


    // =========================================================
    // CUSTOM AMENITIES
    // =========================================================

    getCustomAmenities: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/custom-amenities`
            );

        return response.data;
    },


    createCustomAmenity: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.post(
                `/api/libraries/${libraryId}/custom-amenities`,
                payload
            );

        return response.data;
    },


    updateCustomAmenity: async (
        libraryId,
        customAmenityId,
        payload
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}/custom-amenities/${customAmenityId}`,
                payload
            );

        return response.data;
    },


    deleteCustomAmenity: async (
        libraryId,
        customAmenityId
    ) => {

        await api.delete(
            `/api/libraries/${libraryId}/custom-amenities/${customAmenityId}`
        );
    },
};

export default libraryApi;