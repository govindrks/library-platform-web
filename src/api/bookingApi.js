import api from "./axios";

const bookingApi = {

    // =========================================================
    // MEMBER / STUDENT
    // =========================================================

    createBooking: async (payload) => {

        const response = await api.post(
            "/api/bookings",
            payload
        );

        return response.data;
    },


    getMyBookings: async () => {

        const response = await api.get(
            "/api/bookings/my"
        );

        return response.data;
    },


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


    // =========================================================
    // LIBRARY OWNER
    // =========================================================

    getLibraryBookings: async (libraryId) => {

        if (!libraryId) {
            throw new Error(
                "Library ID is required."
            );
        }

        const response = await api.get(
            `/api/libraries/${libraryId}/bookings`
        );

        return response.data;
    },


    getLibraryBookingSummary: async (libraryId) => {

        if (!libraryId) {
            throw new Error(
                "Library ID is required."
            );
        }

        const response = await api.get(
            `/api/libraries/${libraryId}/bookings/summary`
        );

        return response.data;
    },


    getLibraryBookingById: async (
        libraryId,
        bookingId
    ) => {

        if (!libraryId) {
            throw new Error(
                "Library ID is required."
            );
        }

        if (!bookingId) {
            throw new Error(
                "Booking ID is required."
            );
        }

        const response = await api.get(
            `/api/libraries/${libraryId}/bookings/${bookingId}`
        );

        return response.data;
    },


    cancelLibraryBooking: async (
        libraryId,
        bookingId
    ) => {

        if (!libraryId) {
            throw new Error(
                "Library ID is required."
            );
        }

        if (!bookingId) {
            throw new Error(
                "Booking ID is required."
            );
        }

        const response = await api.put(
            `/api/libraries/${libraryId}/bookings/${bookingId}/cancel`
        );

        return response.data;
    },


    // =========================================================
    // LIBRARY OWNER - MANUAL BOOKING
    // =========================================================
    //
    // POST
    // /api/libraries/{libraryId}/bookings/manual
    //
    // Backend handles:
    //
    // - existing member OR new walk-in member
    // - membership plan validation
    // - membership end-date calculation
    // - slot validation
    // - seat locking
    // - seat restriction validation
    // - seat/date/slot conflict validation
    // - authoritative member/seat pricing
    // - optional coupon
    // - ACTIVE subscription
    // - ACTIVE booking
    // - MANUAL SUCCESS payment
    //
    // =========================================================

    createManualBooking: async (
        libraryId,
        payload
    ) => {

        if (!libraryId) {
            throw new Error(
                "Library ID is required."
            );
        }

        if (!payload) {
            throw new Error(
                "Manual booking payload is required."
            );
        }

        const response = await api.post(
            `/api/libraries/${libraryId}/bookings/manual`,
            payload
        );

        return response.data;
    },
};

export default bookingApi;