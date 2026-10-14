// src/api/studentSubscriptionApi.js

import api from "./axios";

const studentSubscriptionApi = {

  getMySubscription: async () => {
    const response =
      await api.get(
        "/api/subscriptions/my"
      );

    return response.data;
  },

   getSubscriptionHistory: async () => {
    const response = await axiosInstance.get(
      "/api/subscriptions/history"
    );

    return response.data;
  },

};

export default studentSubscriptionApi;