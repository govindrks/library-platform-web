import api from "./axios";


const platformApi = {

  // =========================================================
  // PUBLIC PLATFORM STATUS
  // =========================================================

  getStatus: async () => {
    const response = await api.get(
      "/api/platform/status",
    );

    return response.data;
  },
};


export default platformApi;