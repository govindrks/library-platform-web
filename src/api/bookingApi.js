import api from "./axios";

const bookingApi = {
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
};

export default bookingApi;