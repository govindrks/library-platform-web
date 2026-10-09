import api from "./axios";

const libraryRevenueApi = {

    getRevenue: async (
        libraryId,
        days = 30
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/revenue`,
                {
                    params: {
                        days,
                    },
                }
            );

        return response.data;
    },
};

export default libraryRevenueApi;