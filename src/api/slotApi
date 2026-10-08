import api from "./axios";

const slotApi = {

    // =========================================================
    // GET ALL SLOTS
    // =========================================================

    getSlots: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/slots`
        );

        return response.data;
    },


    // =========================================================
    // GET ACTIVE SLOTS
    // =========================================================

    getActiveSlots: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/slots/active`
        );

        return response.data;
    },


    // =========================================================
    // GET SINGLE SLOT
    // =========================================================

    getSlotById: async (
        libraryId,
        slotId
    ) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/slots/${slotId}`
        );

        return response.data;
    },


    // =========================================================
    // CREATE SLOT
    // =========================================================

    createSlot: async (
        libraryId,
        data
    ) => {
        const response = await api.post(
            `/api/libraries/${libraryId}/slots`,
            data
        );

        return response.data;
    },


    // =========================================================
    // UPDATE SLOT
    // =========================================================

    updateSlot: async (
        libraryId,
        slotId,
        data
    ) => {
        const response = await api.put(
            `/api/libraries/${libraryId}/slots/${slotId}`,
            data
        );

        return response.data;
    },


    // =========================================================
    // ACTIVATE SLOT
    // =========================================================

    activateSlot: async (
        libraryId,
        slotId
    ) => {
        const response = await api.put(
            `/api/libraries/${libraryId}/slots/${slotId}/activate`
        );

        return response.data;
    },


    // =========================================================
    // DEACTIVATE SLOT
    // =========================================================

    deactivateSlot: async (
        libraryId,
        slotId
    ) => {
        const response = await api.put(
            `/api/libraries/${libraryId}/slots/${slotId}/deactivate`
        );

        return response.data;
    },


    // =========================================================
    // DELETE SLOT
    // =========================================================

    deleteSlot: async (
        libraryId,
        slotId
    ) => {
        await api.delete(
            `/api/libraries/${libraryId}/slots/${slotId}`
        );
    },
};

export default slotApi;