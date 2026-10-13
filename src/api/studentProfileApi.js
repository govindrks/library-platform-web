import api from "./axios";

const studentProfileApi = {
  getProfile: async () => {
    const response = await api.get(
      "/api/users/profile"
    );

    return response.data;
  },
};

export default studentProfileApi;