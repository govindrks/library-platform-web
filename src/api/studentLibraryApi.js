import api from "./axios";


/**
 * ============================================================
 * STUDENT LIBRARY API
 * ============================================================
 *
 * Student-facing/public library API.
 *
 * IMPORTANT:
 *
 * Student library details must only use public-safe endpoints.
 * Private owner gallery images must never be returned here.
 */
const studentLibraryApi = {


    // =========================================================
    // GET ALL PUBLIC LIBRARIES
    // =========================================================

    getAll: async () => {

        const response =
            await api.get(
                "/api/libraries"
            );


        return response.data;
    },


    // =========================================================
    // GET PUBLIC LIBRARY DETAILS
    // =========================================================

    /**
     * GET /api/libraries/{libraryId}
     *
     * Backend must return:
     *
     * - LOGO
     * - PROFILE
     * - COVER
     * - public gallery images
     *
     * Backend must NOT return:
     *
     * - private gallery images
     */
    getById: async (
        libraryId
    ) => {

        if (!libraryId) {

            throw new Error(
                "Library ID is required."
            );
        }


        const response =
            await api.get(
                `/api/libraries/${libraryId}`
            );


        return response.data;
    },


    // =========================================================
    // SEARCH BY NAME
    // =========================================================

    searchByName: async (
        name
    ) => {

        const searchValue =
            name?.trim();


        if (!searchValue) {

            return [];
        }


        const response =
            await api.get(
                "/api/libraries/search/name",
                {
                    params: {
                        name:
                            searchValue,
                    },
                }
            );


        return response.data;
    },


    // =========================================================
    // SEARCH BY CITY
    // =========================================================

    searchByCity: async (
        city
    ) => {

        const cityValue =
            city?.trim();


        if (!cityValue) {

            return [];
        }


        const response =
            await api.get(
                "/api/libraries/search/city",
                {
                    params: {
                        city:
                            cityValue,
                    },
                }
            );


        return response.data;
    },


    // =========================================================
    // SEARCH BY AMENITY
    // =========================================================

    searchByAmenity: async (
        name
    ) => {

        const amenityValue =
            name?.trim();


        if (!amenityValue) {

            return [];
        }


        const response =
            await api.get(
                "/api/libraries/search/amenity",
                {
                    params: {
                        name:
                            amenityValue,
                    },
                }
            );


        return response.data;
    },


    // =========================================================
    // FILTER LIBRARIES
    // =========================================================

    filter: async ({
        city,
        amenity,
        availableSeats,
    } = {}) => {

        const response =
            await api.get(
                "/api/libraries/filter",
                {
                    params: {
                        city:
                            city?.trim()
                            || undefined,

                        amenity:
                            amenity?.trim()
                            || undefined,

                        availableSeats:
                            availableSeats
                            ?? undefined,
                    },
                }
            );


        return response.data;
    },


    // =========================================================
    // GET NEARBY LIBRARIES
    // =========================================================

    nearby: async ({
        lat,
        lng,
        radius,
    }) => {

        if (
            lat === null
            ||
            lat === undefined
            ||
            lng === null
            ||
            lng === undefined
        ) {

            throw new Error(
                "Latitude and longitude are required."
            );
        }


        if (
            radius === null
            ||
            radius === undefined
        ) {

            throw new Error(
                "Search radius is required."
            );
        }


        const response =
            await api.get(
                "/api/libraries/nearby",
                {
                    params: {
                        lat,
                        lng,
                        radius,
                    },
                }
            );


        return response.data;
    },


    // =========================================================
    // LIBRARY REVIEWS
    // =========================================================


    // =========================================================
    // GET LIBRARY RATING SUMMARY
    // =========================================================

    getRatingSummary: async (
        libraryId
    ) => {

        if (!libraryId) {

            throw new Error(
                "Library ID is required."
            );
        }


        const response =
            await api.get(
                `/api/libraries/${libraryId}/rating`
            );


        return response.data;
    },


    // =========================================================
    // GET ALL LIBRARY REVIEWS
    // =========================================================

    getReviews: async (
        libraryId
    ) => {

        if (!libraryId) {

            throw new Error(
                "Library ID is required."
            );
        }


        const response =
            await api.get(
                `/api/libraries/${libraryId}/reviews`
            );


        return response.data;
    },


    // =========================================================
    // GET CURRENT STUDENT REVIEW
    // =========================================================

    getMyReview: async (
        libraryId
    ) => {

        if (!libraryId) {

            throw new Error(
                "Library ID is required."
            );
        }


        const response =
            await api.get(
                `/api/libraries/${libraryId}/reviews/me`
            );


        return response.data;
    },


    // =========================================================
    // CREATE / UPSERT REVIEW
    // =========================================================

    submitReview: async (
        libraryId,
        payload
    ) => {

        if (!libraryId) {

            throw new Error(
                "Library ID is required."
            );
        }


        if (
            !payload
            ||
            !payload.rating
        ) {

            throw new Error(
                "Rating is required."
            );
        }


        const response =
            await api.post(
                `/api/libraries/${libraryId}/reviews`,
                payload
            );


        return response.data;
    },


    // =========================================================
    // UPDATE REVIEW
    // =========================================================

    updateReview: async (
        reviewId,
        payload
    ) => {

        if (!reviewId) {

            throw new Error(
                "Review ID is required."
            );
        }


        if (
            !payload
            ||
            !payload.rating
        ) {

            throw new Error(
                "Rating is required."
            );
        }


        const response =
            await api.put(
                `/api/reviews/${reviewId}`,
                payload
            );


        return response.data;
    },


    // =========================================================
    // DELETE REVIEW
    // =========================================================

    deleteReview: async (
        reviewId
    ) => {

        if (!reviewId) {

            throw new Error(
                "Review ID is required."
            );
        }


        const response =
            await api.delete(
                `/api/reviews/${reviewId}`
            );


        return response.data;
    },
};


export default studentLibraryApi;