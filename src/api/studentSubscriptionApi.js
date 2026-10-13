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

};

export default studentSubscriptionApi;