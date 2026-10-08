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

        const response = await api.get(
            `/api/bookings/${bookingId}`
        );

        return response.data;
    },


    cancelBooking: async (bookingId) => {

        const response = await api.put(
            `/api/bookings/${bookingId}/cancel`
        );

        return response.data;
    },


    // =========================================================
    // LIBRARY OWNER
    // =========================================================

    getLibraryBookings: async (libraryId) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/bookings`
        );

        return response.data;
    },


    getLibraryBookingSummary: async (libraryId) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/bookings/summary`
        );

        return response.data;
    },


    getLibraryBookingById: async (
        libraryId,
        bookingId
    ) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/bookings/${bookingId}`
        );

        return response.data;
    },


    cancelLibraryBooking: async (
        libraryId,
        bookingId
    ) => {

        const response = await api.put(
            `/api/libraries/${libraryId}/bookings/${bookingId}/cancel`
        );

        return response.data;
    },
};

export default bookingApi;