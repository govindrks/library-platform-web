import api from "./axios";

const seatApi = {

    // =========================================================
    // FLOORS
    // =========================================================

    getFloors: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/floors`
        );

        return response.data;
    },


    createFloor: async (libraryId, data) => {
        const response = await api.post(
            `/api/libraries/${libraryId}/floors`,
            data
        );

        return response.data;
    },


    // =========================================================
    // SEAT LAYOUT
    // =========================================================

    generateLayout: async (
        libraryId,
        floorId,
        data
    ) => {

        const response = await api.post(
            `/api/libraries/${libraryId}/floors/${floorId}/layout`,
            data
        );

        return response.data;
    },


    getSeatMatrix: async (
        libraryId,
        floorId
    ) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/floors/${floorId}/seat-matrix`
        );

        return response.data;
    },


    // =========================================================
    // SEATS
    // =========================================================

    getLibrarySeats: async (libraryId) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/seats`
        );

        return response.data;
    },


    createSeat: async (
        libraryId,
        floorId,
        data
    ) => {

        const response = await api.post(
            `/api/libraries/${libraryId}/floors/${floorId}/seats`,
            data
        );

        return response.data;
    },


    getSeatById: async (
        libraryId,
        seatId
    ) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/seats/${seatId}`
        );

        return response.data;
    },


    deleteSeat: async (
        libraryId,
        seatId
    ) => {

        const response = await api.delete(
            `/api/libraries/${libraryId}/seats/${seatId}`
        );

        return response.data;
    },


    // =========================================================
    // SEAT STATUS
    // =========================================================

    updateSeatStatus: async (
        libraryId,
        seatId,
        status
    ) => {

        const response = await api.put(
            `/api/libraries/${libraryId}/seats/${seatId}/status`,
            {
                status
            }
        );

        return response.data;
    },


    // =========================================================
    // SEAT TYPE
    // =========================================================

    updateSeatType: async (
        libraryId,
        seatId,
        seatType
    ) => {

        const response = await api.put(
            `/api/libraries/${libraryId}/seats/${seatId}/type`,
            {
                seatType
            }
        );

        return response.data;
    },


    // =========================================================
    // AVAILABLE SEATS
    // =========================================================

    getAvailableSeats: async (libraryId) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/available-seats`
        );

        return response.data;
    },


    // =========================================================
    // DATE BASED AVAILABILITY
    // =========================================================

    getSeatAvailability: async (
        libraryId,
        date
    ) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/seat-availability`,
            {
                params: {
                    date
                }
            }
        );

        return response.data;
    },


    // =========================================================
    // BULK STATUS
    // =========================================================

    bulkUpdateSeatStatus: async (
        libraryId,
        seatIds,
        status
    ) => {

        const response = await api.put(
            `/api/libraries/${libraryId}/seats/bulk/status`,
            {
                seatIds,
                status
            }
        );

        return response.data;
    },


    // =========================================================
    // BULK TYPE
    // =========================================================

    bulkUpdateSeatType: async (
        libraryId,
        seatIds,
        seatType
    ) => {

        const response = await api.put(
            `/api/libraries/${libraryId}/seats/bulk/type`,
            {
                seatIds,
                seatType
            }
        );

        return response.data;
    },
};

export default seatApi;