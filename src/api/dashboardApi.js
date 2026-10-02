import api from "./axios";

const dashboardApi = {
    getDashboard: async (libraryId) => {
        const response = await api.get(
            `/libraries/${libraryId}/dashboard`
        );

        return response.data;
    },
};

export default dashboardApi;