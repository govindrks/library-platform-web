import api from "./axios";

/**
 * API service for Floor and Seat Management.
 *
 * Backend base routes:
 *
 * /api/libraries/{libraryId}/floors
 * /api/libraries/{libraryId}/seats
 */
const seatApi = {
  // =========================================================
  // FLOOR MANAGEMENT
  // =========================================================

  /**
   * Get all floors belonging to a library.
   *
   * GET /api/libraries/{libraryId}/floors
   */
  getFloors: async (libraryId) => {
    const response = await api.get(`/api/libraries/${libraryId}/floors`);

    return response.data;
  },

  /**
   * Create a new floor.
   *
   * POST /api/libraries/{libraryId}/floors
   *
   * Request:
   *
   * {
   *   name: "Ground Floor",
   *   floorNumber: 0
   * }
   */
  createFloor: async (libraryId, data) => {
    const response = await api.post(`/api/libraries/${libraryId}/floors`, data);

    return response.data;
  },

  // =========================================================
  // FLOOR SEAT LAYOUT
  // =========================================================

  /**
   * Save or update the seat layout of a floor.
   *
   * PUT /api/libraries/{libraryId}/floors/{floorId}/layout
   *
   * Backend SeatLayoutRequest:
   *
   * {
   *   seats: [
   *     {
   *       id: null,
   *       seatNumber: "A1",
   *       rowLabel: "A",
   *       columnNumber: 1,
   *       seatType: "NORMAL",
   *       status: "AVAILABLE"
   *     }
   *   ]
   * }
   *
   * IMPORTANT:
   * floorId belongs in the URL, not in the request body.
   */
  saveLayout: async (libraryId, floorId, data) => {
    const response = await api.put(
      `/api/libraries/${libraryId}/floors/${floorId}/layout`,
      data,
    );

    return response.data;
  },

  /**
   * Backward-compatible alias.
   *
   * Existing frontend code may still call generateLayout().
   * Keep this temporarily while SeatMapping.jsx is migrated.
   */
  generateLayout: async (libraryId, floorId, data) => {
    const response = await api.put(
      `/api/libraries/${libraryId}/floors/${floorId}/layout`,
      data,
    );

    return response.data;
  },

  /**
   * Get the seat matrix of a floor.
   *
   * GET
   * /api/libraries/{libraryId}/floors/{floorId}/seat-matrix
   *
   * Backend returns List<SeatRowResponse>.
   */
  getSeatMatrix: async (libraryId, floorId) => {
    const response = await api.get(
      `/api/libraries/${libraryId}/floors/${floorId}/seat-matrix`,
    );

    return response.data;
  },

  // =========================================================
  // SEAT MANAGEMENT
  // =========================================================

  /**
   * Get all seats belonging to a library.
   *
   * GET /api/libraries/{libraryId}/seats
   */
  getLibrarySeats: async (libraryId) => {
    const response = await api.get(`/api/libraries/${libraryId}/seats`);

    return response.data;
  },

  /**
   * Create one seat inside a floor.
   *
   * POST
   * /api/libraries/{libraryId}/floors/{floorId}/seats
   *
   * SeatRequest:
   *
   * {
   *   seatNumber: "A1",
   *   rowLabel: "A",
   *   columnNumber: 1,
   *   seatType: "NORMAL",
   *   status: "AVAILABLE"
   * }
   */
  createSeat: async (libraryId, floorId, data) => {
    const response = await api.post(
      `/api/libraries/${libraryId}/floors/${floorId}/seats`,
      data,
    );

    return response.data;
  },

  /**
   * Get one seat by ID.
   *
   * GET /api/libraries/{libraryId}/seats/{seatId}
   */
  getSeatById: async (libraryId, seatId) => {
    const response = await api.get(
      `/api/libraries/${libraryId}/seats/${seatId}`,
    );

    return response.data;
  },

  /**
   * Delete a seat.
   *
   * DELETE /api/libraries/{libraryId}/seats/{seatId}
   */
  deleteSeat: async (libraryId, seatId) => {
    const response = await api.delete(
      `/api/libraries/${libraryId}/seats/${seatId}`,
    );

    return response.data;
  },

  // =========================================================
  // SEAT STATUS
  // =========================================================

  /**
   * Update the physical status of one seat.
   *
   * PUT /api/libraries/{libraryId}/seats/{seatId}/status
   *
   * {
   *   status: "AVAILABLE"
   * }
   *
   * Supported backend statuses:
   *
   * AVAILABLE
   * BOOKED
   * RESERVED
   * RESERVED_FOR_GIRLS
   * MAINTENANCE
   *
   * BOOKED should normally be controlled by the actual
   * booking/subscription flow instead of Seat Mapping.
   */
  updateSeatStatus: async (libraryId, seatId, status) => {
    const response = await api.put(
      `/api/libraries/${libraryId}/seats/${seatId}/status`,
      {
        status,
      },
    );

    return response.data;
  },

  // =========================================================
  // SEAT TYPE
  // =========================================================

  /**
   * Update the type of one seat.
   *
   * PUT /api/libraries/{libraryId}/seats/{seatId}/type
   *
   * {
   *   seatType: "PREMIUM"
   * }
   *
   * Supported types:
   *
   * NORMAL
   * PREMIUM
   * FEMALE_ONLY
   * WINDOW
   * QUIET_ZONE
   */
  updateSeatType: async (libraryId, seatId, seatType) => {
    const response = await api.put(
      `/api/libraries/${libraryId}/seats/${seatId}/type`,
      {
        seatType,
      },
    );

    return response.data;
  },

  // =========================================================
  // CURRENT AVAILABLE SEATS
  // =========================================================

  /**
   * Get currently available physical seats.
   *
   * GET /api/libraries/{libraryId}/available-seats
   *
   * Useful for:
   *
   * - Member seat allocation
   * - Seat change
   * - Administrative allocation
   */
  getAvailableSeats: async (libraryId) => {
    const response = await api.get(
      `/api/libraries/${libraryId}/available-seats`,
    );

    return response.data;
  },

  // =========================================================
  // GET SEAT AVAILABILITY
  // =========================================================

  getSeatAvailability: async (libraryId, floorId, slotId, date) => {
    const response = await api.get(
      `/api/libraries/${libraryId}/seat-availability`,
      {
        params: {
          floorId,
          slotId,
          date,
        },
      },
    );

    return response.data;
  },

  // =========================================================
  // BULK STATUS UPDATE
  // =========================================================

  /**
   * Update physical status of multiple seats.
   *
   * PUT
   * /api/libraries/{libraryId}/seats/bulk/status
   *
   * {
   *   seatIds: [1, 2, 3],
   *   status: "MAINTENANCE"
   * }
   */
  bulkUpdateSeatStatus: async (libraryId, seatIds, status) => {
    const response = await api.put(
      `/api/libraries/${libraryId}/seats/bulk/status`,
      {
        seatIds,
        status,
      },
    );

    return response.data;
  },

  // =========================================================
  // BULK TYPE UPDATE
  // =========================================================

  /**
   * Update the type of multiple seats.
   *
   * PUT
   * /api/libraries/{libraryId}/seats/bulk/type
   *
   * {
   *   seatIds: [1, 2, 3],
   *   seatType: "PREMIUM"
   * }
   */
  bulkUpdateSeatType: async (libraryId, seatIds, seatType) => {
    const response = await api.put(
      `/api/libraries/${libraryId}/seats/bulk/type`,
      {
        seatIds,
        seatType,
      },
    );

    return response.data;
  },

  // =========================================================
  // SEAT TRANSFER
  // =========================================================

  /**
   * Transfer an existing subscription/member
   * from one seat to another.
   *
   * PUT /api/libraries/{libraryId}/seat/transfer
   *
   * {
   *   subscriptionId: 10,
   *   newSeatId: 25,
   *   reason: "Member requested window seat"
   * }
   */
  transferSeat: async (libraryId, data) => {
    const response = await api.put(
      `/api/libraries/${libraryId}/seat/transfer`,
      data,
    );

    return response.data;
  },

  // =========================================================
  // COMPLETE SEAT SETUP
  // =========================================================

  /**
   * Complete the SEATS_AND_SLOTS onboarding step.
   *
   * POST
   * /api/libraries/{libraryId}/seat-setup/complete
   *
   * Advances onboarding:
   *
   * SEATS_AND_SLOTS -> PLATFORM_PLAN
   *
   * IMPORTANT:
   * This is an onboarding operation.
   * Normal dashboard seat editing must NOT call this endpoint.
   */
  completeSeatSetup: async (libraryId) => {
    const response = await api.post(
      `/api/libraries/${libraryId}/seat-setup/complete`,
    );

    return response.data;
  },
};

export default seatApi;
