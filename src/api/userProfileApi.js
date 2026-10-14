import api from "./axios";

// ============================================================
// USER PROFILE API
// ============================================================

const userProfileApi = {
  // ==========================================================
  // GET CURRENT USER PROFILE
  // ==========================================================

  getProfile: async () => {
    const response = await api.get("/api/users/profile");

    return response.data;
  },

  // ==========================================================
  // UPDATE CURRENT USER PROFILE
  // ==========================================================

  updateProfile: async (payload) => {
    const response = await api.put("/api/users/profile", payload);

    return response.data;
  },

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  changePassword: async (payload) => {
    const response = await api.put("/api/users/profile/password", payload);

    return response.data;
  },

  // ==========================================================
  // UPLOAD PROFILE IMAGE
  // ==========================================================

  uploadProfileImage: async (file) => {
    if (!file) {
      throw new Error("Profile image file is required.");
    }

    const formData = new FormData();

    formData.append("file", file);

    /*
     * Do NOT manually set:
     *
     * Content-Type: multipart/form-data
     *
     * src/api/axios.js removes any conflicting Content-Type
     * and lets the browser generate the multipart boundary.
     */
    const response = await api.post("/api/users/profile/image", formData);

    return response.data;
  },

  // ==========================================================
  // REMOVE PROFILE IMAGE
  // ==========================================================

  deleteProfileImage: async () => {
    const response = await api.delete("/api/users/profile/image");

    return response.data;
  },
};

export default userProfileApi;
