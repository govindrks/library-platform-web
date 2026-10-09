import api from "./axios";

const paymentApi = {

    // ============================================================
    // CREATE PAYMENT / RAZORPAY ORDER
    // ============================================================

    createPayment: async (payload) => {

        const response = await api.post(
            "/api/payment/library/create",
            payload
        );

        return response.data;
    },


    // ============================================================
    // VERIFY RAZORPAY PAYMENT
    // ============================================================

    verifyPayment: async (payload) => {

        const response = await api.post(
            "/api/payment/library/verify",
            payload
        );

        return response.data;
    },

};

export default paymentApi;