import api from "./axios";

const libraryApi = {
  // =========================================================
  // OWNER LIBRARY
  // =========================================================

  /**
   * Returns all libraries owned by the authenticated owner.
   *
   * GET /api/libraries/my
   */
  getMyLibraries: async () => {
    const response = await api.get("/api/libraries/my");

    return response.data;
  },


  /**
   * Returns COMPLETE owner-management details.
   *
   * Includes public/private gallery images, profile image,
   * cover image and logo.
   *
   * GET /api/libraries/my/{libraryId}/details
   */
  getOwnerLibraryDetails: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/libraries/my/${libraryId}/details`,
    );

    return response.data;
  },


  // =========================================================
  // PUBLIC LIBRARY DETAILS
  // =========================================================

  /**
   * Returns PUBLIC/STUDENT-safe library details.
   *
   * Private gallery images are not returned.
   *
   * GET /api/libraries/{libraryId}
   */
  getLibraryDetails: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}`,
    );

    return response.data;
  },


  // =========================================================
  // UPDATE LIBRARY
  // =========================================================

  updateLibrary: async (
    libraryId,
    payload,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.put(
      `/api/libraries/${libraryId}`,
      payload,
    );

    return response.data;
  },


  // =========================================================
  // PERMANENT LIBRARY QR
  // =========================================================

  /**
   * Returns permanent QR metadata for an owner/admin-managed
   * library.
   *
   * Backend:
   *
   * GET
   * /api/libraries/{libraryId}/qr
   *
   * Example response:
   *
   * {
   *   libraryId: 3,
   *   libraryName: "ABC Library",
   *   publicUrl: "https://libraryhub.in/libraries/3",
   *   qrDownloadUrl: "/api/libraries/3/qr/png",
   *   publicAvailable: true
   * }
   */
  getLibraryQr: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/qr`,
    );

    return response.data;
  },


  /**
   * Returns the permanent QR PNG as a Blob for inline preview.
   *
   * Backend:
   *
   * GET
   * /api/libraries/{libraryId}/qr/png?download=false
   *
   * Content-Disposition:
   *
   * inline
   *
   * IMPORTANT:
   *
   * React should convert this Blob into an object URL:
   *
   * const url = URL.createObjectURL(blob);
   *
   * and later release it:
   *
   * URL.revokeObjectURL(url);
   */
  getLibraryQrPreview: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/qr/png`,
      {
        params: {
          download: false,
        },

        responseType: "blob",
      },
    );

    return response.data;
  },


  /**
   * Downloads the permanent QR PNG.
   *
   * Backend:
   *
   * GET
   * /api/libraries/{libraryId}/qr/png
   *
   * Default backend behavior:
   *
   * download=true
   */
  downloadLibraryQr: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/qr/png`,
      {
        params: {
          download: true,
        },

        responseType: "blob",
      },
    );

    return response.data;
  },


  /**
   * Convenience helper.
   *
   * Downloads the permanent QR image in the browser without
   * requiring every page to repeat Blob download logic.
   */
  saveLibraryQrPng: async (
    libraryId,
    libraryName,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const blob =
      await libraryApi.downloadLibraryQr(
        libraryId,
      );

    if (!blob) {
      throw new Error(
        "QR image was not returned.",
      );
    }

    const objectUrl =
      window.URL.createObjectURL(
        blob,
      );

    const anchor =
      document.createElement("a");

    const safeLibraryName =
      String(
        libraryName ||
          `library-${libraryId}`,
      )
        .trim()
        .replace(
          /[^a-zA-Z0-9-_]+/g,
          "-",
        )
        .replace(
          /-+/g,
          "-",
        )
        .replace(
          /^-|-$|/g,
          "",
        );

    anchor.href =
      objectUrl;

    anchor.download =
      `${safeLibraryName || `library-${libraryId}`}-qr.png`;

    document.body.appendChild(
      anchor,
    );

    anchor.click();

    anchor.remove();

    window.URL.revokeObjectURL(
      objectUrl,
    );

    return true;
  },


  // =========================================================
  // UPDATE IMAGE PUBLIC VISIBILITY
  // =========================================================

  setLibraryImageVisibility: async (
    libraryId,
    imageId,
    publicVisible,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!imageId) {
      throw new Error("Image ID is required.");
    }

    const response = await api.patch(
      `/api/libraries/${libraryId}/images/${imageId}/visibility`,
      null,
      {
        params: {
          publicVisible,
        },
      },
    );

    return response.data;
  },


  // =========================================================
  // PUBLIC LIBRARIES
  // =========================================================

  getAllLibraries: async () => {
    const response = await api.get(
      "/api/libraries",
    );

    return response.data;
  },


  // =========================================================
  // STANDARD AMENITIES
  // =========================================================

  getAllAmenities: async () => {
    const response = await api.get(
      "/api/amenities",
    );

    return response.data;
  },


  getLibraryAmenities: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/amenities`,
    );

    return response.data;
  },


  assignLibraryAmenities: async (
    libraryId,
    amenityIds,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.post(
      `/api/libraries/${libraryId}/amenities`,
      {
        amenityIds,
      },
    );

    return response.data;
  },


  // =========================================================
  // CUSTOM AMENITIES
  // =========================================================

  getCustomAmenities: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/custom-amenities`,
    );

    return response.data;
  },


  createCustomAmenity: async (
    libraryId,
    payload,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.post(
      `/api/libraries/${libraryId}/custom-amenities`,
      payload,
    );

    return response.data;
  },


  updateCustomAmenity: async (
    libraryId,
    customAmenityId,
    payload,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!customAmenityId) {
      throw new Error(
        "Custom amenity ID is required.",
      );
    }

    const response = await api.put(
      `/api/libraries/${libraryId}/custom-amenities/${customAmenityId}`,
      payload,
    );

    return response.data;
  },


  deleteCustomAmenity: async (
    libraryId,
    customAmenityId,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!customAmenityId) {
      throw new Error(
        "Custom amenity ID is required.",
      );
    }

    const response = await api.delete(
      `/api/libraries/${libraryId}/custom-amenities/${customAmenityId}`,
    );

    return response.data;
  },


  // =========================================================
  // LIBRARY IMAGES
  // =========================================================

  /**
   * Returns all images available to the owner image-management
   * endpoint.
   */
  getLibraryImages: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/images`,
    );

    return response.data;
  },


  // =========================================================
  // ADD IMAGE USING EXISTING URL
  // =========================================================

  addLibraryImage: async (
    libraryId,
    payload,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.post(
      `/api/libraries/${libraryId}/images`,
      payload,
    );

    return response.data;
  },


  // =========================================================
  // ADD MULTIPLE IMAGES USING URLS
  // =========================================================

  addLibraryImages: async (
    libraryId,
    payload,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.post(
      `/api/libraries/${libraryId}/images/bulk`,
      payload,
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
    imageRole = "GALLERY",
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!file) {
      throw new Error(
        "Image file is required.",
      );
    }

    if (!imageType) {
      throw new Error(
        "Image type is required.",
      );
    }

    const formData =
      new FormData();

    formData.append(
      "file",
      file,
    );

    formData.append(
      "imageType",
      imageType,
    );

    formData.append(
      "imageRole",
      imageRole,
    );

    const response = await api.post(
      `/api/libraries/${libraryId}/images/upload`,
      formData,
      {
        /*
         * Let the browser/Axios create the multipart boundary.
         */
        headers: {
          "Content-Type":
            undefined,
        },
      },
    );

    return response.data;
  },


  // =========================================================
  // UPDATE IMAGE METADATA
  // =========================================================

  updateLibraryImage: async (
    imageId,
    payload,
  ) => {
    if (!imageId) {
      throw new Error(
        "Image ID is required.",
      );
    }

    const response = await api.put(
      `/api/libraries/images/${imageId}`,
      payload,
    );

    return response.data;
  },


  // =========================================================
  // CHANGE IMAGE ROLE
  // =========================================================

  setLibraryImageRole: async (
    libraryId,
    imageId,
    role,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!imageId) {
      throw new Error(
        "Image ID is required.",
      );
    }

    if (!role) {
      throw new Error(
        "Image role is required.",
      );
    }

    const response = await api.patch(
      `/api/libraries/${libraryId}/images/${imageId}/role`,
      null,
      {
        params: {
          role,
        },
      },
    );

    return response.data;
  },


  // =========================================================
  // SET PROFILE IMAGE
  // =========================================================

  setProfileImage: async (
    libraryId,
    imageId,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!imageId) {
      throw new Error(
        "Image ID is required.",
      );
    }

    const response = await api.put(
      `/api/libraries/${libraryId}/profile-image/${imageId}`,
    );

    return response.data;
  },


  // =========================================================
  // SET COVER IMAGE
  // =========================================================

  setCoverImage: async (
    libraryId,
    imageId,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!imageId) {
      throw new Error(
        "Image ID is required.",
      );
    }

    const response = await api.put(
      `/api/libraries/${libraryId}/cover-image/${imageId}`,
    );

    return response.data;
  },


  // =========================================================
  // MOVE IMAGE TO GALLERY
  // =========================================================

  setGalleryImage: async (
    libraryId,
    imageId,
  ) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!imageId) {
      throw new Error(
        "Image ID is required.",
      );
    }

    const response = await api.put(
      `/api/libraries/${libraryId}/images/${imageId}/gallery`,
    );

    return response.data;
  },


  // =========================================================
  // DELETE IMAGE
  // =========================================================

  deleteLibraryImage: async (imageId) => {
    if (!imageId) {
      throw new Error(
        "Image ID is required.",
      );
    }

    const response = await api.delete(
      `/api/libraries/images/${imageId}`,
    );

    return response.data;
  },
};

export default libraryApi;