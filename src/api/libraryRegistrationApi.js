import api from "./axios";

const libraryRegistrationApi = {

    register: async (payload) => {

        const response =
            await api.post(
                "/api/library-registration",
                payload
            );

        return response.data;
    },

};

export default libraryRegistrationApi;