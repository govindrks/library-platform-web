import api from "./axios";


const expenseApi = {


  getExpenses: async (libraryId) => {

    const response =
      await api.get(
        `/api/libraries/${libraryId}/expenses`,
      );

    return response.data;
  },


  createExpense: async (
    libraryId,
    payload,
  ) => {

    const response =
      await api.post(
        `/api/libraries/${libraryId}/expenses`,
        payload,
      );

    return response.data;
  },


  updateExpense: async (
    libraryId,
    expenseId,
    payload,
  ) => {

    const response =
      await api.put(
        `/api/libraries/${libraryId}/expenses/${expenseId}`,
        payload,
      );

    return response.data;
  },


  deleteExpense: async (
    libraryId,
    expenseId,
  ) => {

    await api.delete(
      `/api/libraries/${libraryId}/expenses/${expenseId}`,
    );
  },


  getTotalExpenses: async (
    libraryId,
  ) => {

    const response =
      await api.get(
        `/api/libraries/${libraryId}/expenses/total`,
      );

    return response.data;
  },
};


export default expenseApi;