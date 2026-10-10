import api from "./axios";

const settingsApi = {

    getSettings: async (libraryId) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/settings`
            );

        return response.data;
    },


    updateSettings: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}/settings`,
                payload
            );

        return response.data;
    },

};

export default settingsApi;