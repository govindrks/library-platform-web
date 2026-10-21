import api from "./axios";

// ============================================================
// HELPERS
// ============================================================

const requireLibraryId = (libraryId) => {
  if (!libraryId) {
    throw new Error("Library ID is required.");
  }
};

const requireEnquiryId = (enquiryId) => {
  if (!enquiryId) {
    throw new Error("Enquiry ID is required.");
  }
};

const normalizeStatus = (status) => {
  const value = String(status || "")
    .trim()
    .toUpperCase();

  return value || null;
};

// ============================================================
// LIBRARY ENQUIRY API
// ============================================================

const libraryEnquiryApi = {
  // =========================================================
  // PUBLIC - CREATE MEMBERSHIP ENQUIRY
  // =========================================================
  //
  // POST
  // /api/public/libraries/{libraryId}/enquiries
  //
  // No authentication required.
  //
  // Example payload:
  //
  // {
  //   fullName: "Rahul Sharma",
  //   phone: "9876543210",
  //   email: "rahul@example.com",
  //   membershipPlanId: 8,
  //   message: "Interested in monthly membership",
  //   qrCampaignCode: "K7M4PX9Q",
  //   qrScanToken: "..."
  // }
  //
  // =========================================================

  createPublicEnquiry: async (libraryId, payload) => {
    requireLibraryId(libraryId);

    if (!payload) {
      throw new Error("Enquiry payload is required.");
    }

    const response = await api.post(
      `/api/public/libraries/${libraryId}/enquiries`,
      payload,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - GET ALL ENQUIRIES
  // =========================================================
  //
  // GET
  // /api/libraries/{libraryId}/enquiries
  //
  // Optional:
  //
  // ?status=NEW
  // ?status=CONTACTED
  // ?status=INTERESTED
  // ?status=CONVERTED
  // ?status=CLOSED
  //
  // =========================================================

  getEnquiries: async (libraryId, status = null) => {
    requireLibraryId(libraryId);

    const normalizedStatus = normalizeStatus(status);

    const response = await api.get(`/api/libraries/${libraryId}/enquiries`, {
      params: normalizedStatus
        ? {
            status: normalizedStatus,
          }
        : {},
    });

    return Array.isArray(response.data) ? response.data : [];
  },

  // =========================================================
  // OWNER - GET SINGLE ENQUIRY
  // =========================================================
  //
  // GET
  // /api/libraries/{libraryId}/enquiries/{enquiryId}
  //
  // =========================================================

  getEnquiry: async (libraryId, enquiryId) => {
    requireLibraryId(libraryId);
    requireEnquiryId(enquiryId);

    const response = await api.get(
      `/api/libraries/${libraryId}/enquiries/${enquiryId}`,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - UPDATE ENQUIRY STATUS
  // =========================================================
  //
  // PATCH
  // /api/libraries/{libraryId}
  // /enquiries/{enquiryId}/status
  //
  // Body:
  //
  // {
  //   status: "CONTACTED"
  // }
  //
  // =========================================================

  updateStatus: async (libraryId, enquiryId, status) => {
    requireLibraryId(libraryId);
    requireEnquiryId(enquiryId);

    const normalizedStatus = normalizeStatus(status);

    if (!normalizedStatus) {
      throw new Error("Enquiry status is required.");
    }

    const response = await api.patch(
      `/api/libraries/${libraryId}/enquiries/${enquiryId}/status`,
      {
        status: normalizedStatus,
      },
    );

    return response.data;
  },

  // =========================================================
  // STATUS HELPERS
  // =========================================================

  markNew: async (libraryId, enquiryId) => {
    return libraryEnquiryApi.updateStatus(libraryId, enquiryId, "NEW");
  },

  markContacted: async (libraryId, enquiryId) => {
    return libraryEnquiryApi.updateStatus(libraryId, enquiryId, "CONTACTED");
  },

  markInterested: async (libraryId, enquiryId) => {
    return libraryEnquiryApi.updateStatus(libraryId, enquiryId, "INTERESTED");
  },

  markConverted: async (libraryId, enquiryId) => {
    return libraryEnquiryApi.updateStatus(libraryId, enquiryId, "CONVERTED");
  },

  markClosed: async (libraryId, enquiryId) => {
    return libraryEnquiryApi.updateStatus(libraryId, enquiryId, "CLOSED");
  },
};

export default libraryEnquiryApi;
