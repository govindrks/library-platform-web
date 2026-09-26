import api from "../utility/axiosInterceptor";

const authApi = {
    login: async (payload) => {
        const response = await api.post(
            "/api/auth/login",
            payload
        );

        return response.data;
    },

    register: async (payload) => {
        const response = await api.post(
            "/api/auth/register",
            payload
        );

        return response.data;
    },

    forgotPassword: async (payload) => {
        const response = await api.post(
            "/api/auth/forgot-password",
            payload
        );

        return response.data;
    },

    resetPassword: async (payload) => {
        const response = await api.post(
            "/api/auth/reset-password",
            payload
        );

        return response.data;
    },
};

export default authApi;