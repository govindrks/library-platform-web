import api from "./axios";


const platformPaymentApi = {


    // =========================================================
    // VERIFY PLATFORM SUBSCRIPTION PAYMENT
    // =========================================================

    verifyPayment: async (payload) => {

        const response =
            await api.post(
                "/api/payment/platform/verify",
                payload
            );


        return response.data;
    },
};


export default platformPaymentApi;