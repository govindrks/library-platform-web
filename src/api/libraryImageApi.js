import api from "./axios";

const libraryImageApi = {

    // =========================================================
    // GET LIBRARY IMAGES
    // =========================================================

    getLibraryImages: async (libraryId) => {
        const response = await api.get(
            `/api/libraries/${libraryId}/images`
        );

        return response.data;
    },


    // =========================================================
    // ADD IMAGE USING URL
    // =========================================================

    addImage: async (libraryId, payload) => {
        const response = await api.post(
            `/api/libraries/${libraryId}/images`,
            payload
        );

        return response.data;
    },


    // =========================================================
    // ADD MULTIPLE IMAGES
    // =========================================================

    addImages: async (libraryId, payload) => {
        const response = await api.post(
            `/api/libraries/${libraryId}/images/bulk`,
            payload
        );

        return response.data;
    },


    // =========================================================
    // UPLOAD IMAGE FILE
    // =========================================================

    uploadImage: async (
        libraryId,
        file,
        imageType
    ) => {

        const formData = new FormData();

        formData.append("file", file);
        formData.append("imageType", imageType);

        const response = await api.post(
            `/api/libraries/${libraryId}/images/upload`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    },


    // =========================================================
    // UPDATE IMAGE
    // =========================================================

    updateImage: async (imageId, payload) => {
        const response = await api.put(
            `/api/libraries/images/${imageId}`,
            payload
        );

        return response.data;
    },


    // =========================================================
    // DELETE IMAGE
    // =========================================================

    deleteImage: async (imageId) => {
        const response = await api.delete(
            `/api/libraries/images/${imageId}`
        );

        return response.data;
    },


    // =========================================================
    // SET COVER IMAGE
    // =========================================================

    setCoverImage: async (
        libraryId,
        imageId
    ) => {

        const response = await api.put(
            `/api/libraries/${libraryId}/cover-image/${imageId}`
        );

        return response.data;
    },
};

export default libraryImageApi;