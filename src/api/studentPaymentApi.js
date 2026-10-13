import api from "./axios";

const studentPaymentApi = {
  getMyPayments: async () => {
    const response =
      await api.get(
        "/api/payments/my"
      );

    return response.data;
  },
};

export default studentPaymentApi;