import api from "./axios";

/**
 * ============================================================
 * STUDENT LIBRARY API
 * ============================================================
 *
 * Student-facing library discovery API.
 *
 * Reuses public/student LibraryController endpoints.
 *
 * Used for:
 *
 * - Browse Libraries
 * - Library Details
 * - Search by name
 * - Search by city
 * - Search by amenity
 * - Filter libraries
 * - Nearby libraries
 * - Library reviews
 *
 * This API does NOT contain Library Owner management operations.
 */
const studentLibraryApi = {
  /**
   * ==========================================================
   * GET ALL PUBLIC LIBRARIES
   * ==========================================================
   *
   * GET /api/libraries
   */
  getAll: async () => {
    const response = await api.get("/api/libraries");

    return response.data;
  },

  /**
   * ==========================================================
   * GET LIBRARY DETAILS
   * ==========================================================
   *
   * GET /api/libraries/{libraryId}
   */
  getById: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`/api/libraries/${libraryId}`);

    return response.data;
  },

  /**
   * ==========================================================
   * SEARCH LIBRARY BY NAME
   * ==========================================================
   *
   * GET /api/libraries/search/name?name=
   */
  searchByName: async (name) => {
    const searchValue = name?.trim();

    if (!searchValue) {
      return [];
    }

    const response = await api.get("/api/libraries/search/name", {
      params: {
        name: searchValue,
      },
    });

    return response.data;
  },

  /**
   * ==========================================================
   * SEARCH LIBRARY BY CITY
   * ==========================================================
   *
   * GET /api/libraries/search/city?city=
   */
  searchByCity: async (city) => {
    const cityValue = city?.trim();

    if (!cityValue) {
      return [];
    }

    const response = await api.get("/api/libraries/search/city", {
      params: {
        city: cityValue,
      },
    });

    return response.data;
  },

  /**
   * ==========================================================
   * SEARCH LIBRARY BY AMENITY
   * ==========================================================
   *
   * GET /api/libraries/search/amenity?name=
   */
  searchByAmenity: async (name) => {
    const amenityValue = name?.trim();

    if (!amenityValue) {
      return [];
    }

    const response = await api.get("/api/libraries/search/amenity", {
      params: {
        name: amenityValue,
      },
    });

    return response.data;
  },

  /**
   * ==========================================================
   * FILTER LIBRARIES
   * ==========================================================
   *
   * GET /api/libraries/filter
   *
   * Supported backend parameters:
   *
   * city
   * amenity
   * availableSeats
   */
  filter: async ({ city, amenity, availableSeats } = {}) => {
    const response = await api.get("/api/libraries/filter", {
      params: {
        city: city?.trim() || undefined,

        amenity: amenity?.trim() || undefined,

        availableSeats: availableSeats ?? undefined,
      },
    });

    return response.data;
  },

  /**
   * ==========================================================
   * GET NEARBY LIBRARIES
   * ==========================================================
   *
   * GET /api/libraries/nearby
   *
   * Required parameters:
   *
   * lat
   * lng
   * radius
   */
  nearby: async ({ lat, lng, radius }) => {
    if (
      lat === null ||
      lat === undefined ||
      lng === null ||
      lng === undefined
    ) {
      throw new Error("Latitude and longitude are required.");
    }

    if (radius === null || radius === undefined) {
      throw new Error("Search radius is required.");
    }

    const response = await api.get("/api/libraries/nearby", {
      params: {
        lat,
        lng,
        radius,
      },
    });

    return response.data;
  },

  // ==========================================================
  // LIBRARY REVIEWS
  // ==========================================================

  /**
   * ==========================================================
   * GET LIBRARY RATING SUMMARY
   * ==========================================================
   *
   * GET /api/libraries/{libraryId}/rating
   *
   * Response example:
   *
   * {
   *   averageRating: 4.5,
   *   totalReviews: 12
   * }
   */
  getRatingSummary: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`/api/libraries/${libraryId}/rating`);

    return response.data;
  },

  /**
   * ==========================================================
   * GET ALL LIBRARY REVIEWS
   * ==========================================================
   *
   * GET /api/libraries/{libraryId}/reviews
   */
  getReviews: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`/api/libraries/${libraryId}/reviews`);

    return response.data;
  },

  /**
   * ==========================================================
   * GET CURRENT STUDENT REVIEW
   * ==========================================================
   *
   * GET /api/libraries/{libraryId}/reviews/me
   *
   * Returns the authenticated student's review.
   *
   * 404 means:
   * student has not reviewed the library yet.
   */
  getMyReview: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`/api/libraries/${libraryId}/reviews/me`);

    return response.data;
  },

  /**
   * ==========================================================
   * CREATE / UPSERT REVIEW
   * ==========================================================
   *
   * POST /api/libraries/{libraryId}/reviews
   *
   * Payload:
   *
   * {
   *   rating: 5,
   *   comment: "Very good library"
   * }
   *
   * Backend behavior:
   *
   * No existing review
   * -> creates review
   *
   * Existing review
   * -> updates review
   */
  submitReview: async (libraryId, payload) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!payload || !payload.rating) {
      throw new Error("Rating is required.");
    }

    const response = await api.post(
      `/api/libraries/${libraryId}/reviews`,
      payload,
    );

    return response.data;
  },

  /**
   * ==========================================================
   * UPDATE REVIEW
   * ==========================================================
   *
   * PUT /api/reviews/{reviewId}
   *
   * This remains available even though submitReview()
   * currently supports backend upsert behavior.
   */
  updateReview: async (reviewId, payload) => {
    if (!reviewId) {
      throw new Error("Review ID is required.");
    }

    if (!payload || !payload.rating) {
      throw new Error("Rating is required.");
    }

    const response = await api.put(`/api/reviews/${reviewId}`, payload);

    return response.data;
  },

  /**
   * ==========================================================
   * DELETE REVIEW
   * ==========================================================
   *
   * DELETE /api/reviews/{reviewId}
   */
  deleteReview: async (reviewId) => {
    if (!reviewId) {
      throw new Error("Review ID is required.");
    }

    const response = await api.delete(`/api/reviews/${reviewId}`);

    return response.data;
  },
};

export default studentLibraryApi;
