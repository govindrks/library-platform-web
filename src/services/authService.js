import api from "../api/axios";

const authService = {

    register: async (registerData) => {

        const response = await api.post(
            "/api/auth/register",
            registerData
        );

        return response.data;
    },

};

export default authService;