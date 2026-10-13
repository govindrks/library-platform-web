import api from "./axios";

/**
 * ============================================================
 * STUDENT SEAT API
 * ============================================================
 *
 * Student-facing seat discovery operations.
 *
 * Existing backend APIs:
 *
 * GET /api/libraries/{libraryId}/seats
 * GET /api/libraries/{libraryId}/available-seats
 * GET /api/libraries/{libraryId}/seat-availability?date=
 */
const studentSeatApi = {
  /**
   * Get all seats belonging to a library.
   */
  getLibrarySeats: async (libraryId) => {
    if (!libraryId) {
      throw new Error(
        "Library ID is required."
      );
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/seats`
    );

    return response.data;
  },

  /**
   * Get seats currently available for allocation.
   */
  getAvailableSeats: async (libraryId) => {
    if (!libraryId) {
      throw new Error(
        "Library ID is required."
      );
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/available-seats`
    );

    return response.data;
  },

  /**
   * Get seat availability for a selected date.
   *
   * GET
   * /api/libraries/{libraryId}/seat-availability?date=2026-10-12
   */
  getSeatAvailability: async (
    libraryId,
    date
  ) => {
    if (!libraryId) {
      throw new Error(
        "Library ID is required."
      );
    }

    if (!date) {
      throw new Error(
        "Booking date is required."
      );
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/seat-availability`,
      {
        params: {
          date,
        },
      }
    );

    return response.data;
  },
};

export default studentSeatApi;