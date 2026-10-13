import api from "./axios";

/**
 * ============================================================
 * STUDENT LIBRARY API
 * ============================================================
 *
 * Student-facing library discovery API.
 *
 * Reuses the public LibraryController endpoints:
 *
 * /api/libraries
 *
 * These APIs are used for:
 *
 * - Browse Libraries
 * - Library Details
 * - Search by name
 * - Search by city
 * - Search by amenity
 * - Filter libraries
 * - Nearby libraries
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
   *
   * Returns only libraries available for public discovery.
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
};

export default studentLibraryApi;
