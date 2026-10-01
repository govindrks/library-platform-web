const paymentApi = {

  createOrder: async (payload) => {
    const response = await api.post(
      "/api/payments/order",
      payload
    );

    return response.data;
  },

  verifyPayment: async (payload) => {
    const response = await api.post(
      "/payments/verify",
      payload
    );

    return response.data;
  },

};

export default paymentApi;