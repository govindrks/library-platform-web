import api from "./axios";


const libraryApi = {


    // =========================================================
    // LIBRARY
    // =========================================================

    getMyLibraries: async () => {

        const response =
            await api.get(
                "/api/libraries/my"
            );

        return response.data;
    },


    getLibraryDetails: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}`
            );

        return response.data;
    },


    updateLibrary: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}`,
                payload
            );

        return response.data;
    },

    // =========================================================
// UPDATE PUBLIC VISIBILITY
// =========================================================

setLibraryImageVisibility: async (
    libraryId,
    imageId,
    publicVisible
) => {

    const response =
        await api.patch(
            `/api/libraries/${libraryId}/images/${imageId}/visibility`,
            null,
            {
                params: {
                    publicVisible,
                },
            }
        );

    return response.data;
},


    // =========================================================
    // PUBLIC LIBRARIES
    // =========================================================

    getAllLibraries: async () => {

        const response =
            await api.get(
                "/api/libraries"
            );

        return response.data;
    },


    // =========================================================
    // STANDARD AMENITIES
    // =========================================================

    getAllAmenities: async () => {

        const response =
            await api.get(
                "/api/amenities"
            );

        return response.data;
    },


    getLibraryAmenities: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/amenities`
            );

        return response.data;
    },


    assignLibraryAmenities: async (
        libraryId,
        amenityIds
    ) => {

        const response =
            await api.post(
                `/api/libraries/${libraryId}/amenities`,
                {
                    amenityIds,
                }
            );

        return response.data;
    },


    // =========================================================
    // CUSTOM AMENITIES
    // =========================================================

    getCustomAmenities: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/custom-amenities`
            );

        return response.data;
    },


    createCustomAmenity: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.post(
                `/api/libraries/${libraryId}/custom-amenities`,
                payload
            );

        return response.data;
    },


    updateCustomAmenity: async (
        libraryId,
        customAmenityId,
        payload
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}/custom-amenities/${customAmenityId}`,
                payload
            );

        return response.data;
    },


    deleteCustomAmenity: async (
        libraryId,
        customAmenityId
    ) => {

        await api.delete(
            `/api/libraries/${libraryId}/custom-amenities/${customAmenityId}`
        );
    },


    // =========================================================
    // LIBRARY IMAGES
    // =========================================================

    getLibraryImages: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/images`
            );

        return response.data;
    },


    // =========================================================
    // ADD IMAGE USING EXISTING URL
    // =========================================================

    addLibraryImage: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.post(
                `/api/libraries/${libraryId}/images`,
                payload
            );

        return response.data;
    },


    // =========================================================
    // ADD MULTIPLE IMAGES USING URLS
    // =========================================================

    addLibraryImages: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.post(
                `/api/libraries/${libraryId}/images/bulk`,
                payload
            );

        return response.data;
    },


    // =========================================================
// UPLOAD LIBRARY IMAGE
// =========================================================

uploadLibraryImage: async (
    libraryId,
    file,
    imageType,
    imageRole = "GALLERY"
) => {

    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "imageType",
        imageType
    );


    formData.append(
        "imageRole",
        imageRole
    );


    const response =
        await api.post(
            `/api/libraries/${libraryId}/images/upload`,
            formData,
            {
                /*
                 * IMPORTANT:
                 *
                 * Do not send application/json here.
                 *
                 * Setting Content-Type to undefined allows
                 * Axios/browser to generate:
                 *
                 * multipart/form-data; boundary=...
                 */
                headers: {
                    "Content-Type":
                        undefined,
                },
            }
        );


    return response.data;
},


    // =========================================================
    // UPDATE IMAGE METADATA
    // =========================================================

    updateLibraryImage: async (
        imageId,
        payload
    ) => {

        const response =
            await api.put(
                `/api/libraries/images/${imageId}`,
                payload
            );

        return response.data;
    },


    // =========================================================
    // CHANGE IMAGE ROLE
    // =========================================================

    setLibraryImageRole: async (
        libraryId,
        imageId,
        role
    ) => {

        const response =
            await api.patch(
                `/api/libraries/${libraryId}/images/${imageId}/role`,
                null,
                {
                    params: {
                        role,
                    },
                }
            );


        return response.data;
    },


    // =========================================================
    // SET PROFILE IMAGE
    // =========================================================

    setProfileImage: async (
        libraryId,
        imageId
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}/profile-image/${imageId}`
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

        const response =
            await api.put(
                `/api/libraries/${libraryId}/cover-image/${imageId}`
            );


        return response.data;
    },


    // =========================================================
    // MOVE IMAGE TO GALLERY
    // =========================================================

    setGalleryImage: async (
        libraryId,
        imageId
    ) => {

        const response =
            await api.put(
                `/api/libraries/${libraryId}/images/${imageId}/gallery`
            );


        return response.data;
    },


    // =========================================================
    // DELETE IMAGE
    // =========================================================

    deleteLibraryImage: async (
        imageId
    ) => {

        const response =
            await api.delete(
                `/api/libraries/images/${imageId}`
            );


        return response.data;
    },
};


export default libraryApi;