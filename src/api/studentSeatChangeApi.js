import api from "./axios";

const studentSeatChangeApi = {
  submitRequest: async ({
    subscriptionId,
    requestedSeatId,
    reason,
  }) => {
    const response = await api.post(
      "/api/seat-change/request",
      {
        subscriptionId,
        requestedSeatId,
        reason,
      }
    );

    return response.data;
  },

  getMyRequests: async () => {
    const response = await api.get(
      "/api/seat-change/my"
    );

    return response.data;
  },

  cancelRequest: async (requestId) => {
    if (!requestId) {
      throw new Error(
        "Seat change request ID is required."
      );
    }

    const response = await api.put(
      `/api/seat-change/${requestId}/cancel`
    );

    return response.data;
  },
};

export default studentSeatChangeApi;