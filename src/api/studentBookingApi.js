import api from "./axios";

/**
 * ============================================================
 * STUDENT BOOKING API
 * ============================================================
 *
 * Backend:
 *
 * POST /api/bookings
 * GET  /api/bookings/my
 * GET  /api/bookings/{bookingId}
 * PUT  /api/bookings/{bookingId}/cancel
 * POST /api/bookings/seats
 */
const studentBookingApi = {
  /**
   * Create a normal booking.
   *
   * BookingRequest:
   *
   * {
   *   seatId,
   *   slotId,
   *   startDate,
   *   endDate,
   *   amount
   * }
   */
  createBooking: async (data) => {
    const response = await api.post(
      "/api/bookings",
      data
    );

    return response.data;
  },

  /**
   * Get bookings belonging to the logged-in student.
   *
   * GET /api/bookings/my
   */
  getMyBookings: async () => {
    const response = await api.get(
      "/api/bookings/my"
    );

    return response.data;
  },

  /**
   * Get one booking belonging to the logged-in student.
   *
   * GET /api/bookings/{bookingId}
   */
  getBookingById: async (bookingId) => {
    if (!bookingId) {
      throw new Error(
        "Booking ID is required."
      );
    }

    const response = await api.get(
      `/api/bookings/${bookingId}`
    );

    return response.data;
  },

  /**
   * Cancel one student booking.
   *
   * PUT /api/bookings/{bookingId}/cancel
   */
  cancelBooking: async (bookingId) => {
    if (!bookingId) {
      throw new Error(
        "Booking ID is required."
      );
    }

    const response = await api.put(
      `/api/bookings/${bookingId}/cancel`
    );

    return response.data;
  },

  /**
   * Subscription-based seat booking.
   *
   * SeatBookingRequest currently requires:
   *
   * seatId
   * subscriptionId
   * slotId
   *
   * userId is retained only for backward compatibility.
   * The backend resolves the logged-in user itself.
   */
  bookSubscriptionSeat: async (data) => {
    const response = await api.post(
      "/api/bookings/seats",
      data
    );

    return response.data;
  },
};

export default studentBookingApi;