import api from "./axios";

const libraryOccupancyApi = {

    getOccupancy: async (
        libraryId,
        {
            date,
            slotId,
        } = {}
    ) => {

        const params = {};

        if (date) {
            params.date = date;
        }

        if (slotId) {
            params.slotId = slotId;
        }

        const response =
            await api.get(
                `/api/libraries/${libraryId}/occupancy`,
                {
                    params,
                }
            );

        return response.data;
    },
};

export default libraryOccupancyApi;