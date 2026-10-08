import api from "./axios";

const amenityApi = {

  // Public master amenity list
  getAllAmenities: async () => {
    const response = await api.get(
      "/api/amenities"
    );

    return response.data;
  },

  // Amenities assigned to an existing library
  getLibraryAmenities: async (libraryId) => {
    const response = await api.get(
      `/api/libraries/${libraryId}/amenities`
    );

    return response.data;
  },

  // Assign amenities after/while creating a library
  assignAmenities: async (
    libraryId,
    amenityIds
  ) => {
    const response = await api.post(
      `/api/libraries/${libraryId}/amenities`,
      {
        amenityIds,
      }
    );

    return response.data;
  },
};

export default amenityApi;