import api from "./axios";

// ============================================================
// HELPERS
// ============================================================

const requireLibraryId = (libraryId) => {
  if (!libraryId) {
    throw new Error("Library ID is required.");
  }
};

const requireCampaignId = (campaignId) => {
  if (!campaignId) {
    throw new Error("Campaign ID is required.");
  }
};

const normalizeScanToken = (scanToken) => {
  const value = String(scanToken || "").trim();

  return value || null;
};

const normalizeCampaignCode = (campaignCode) => {
  const value = String(campaignCode || "")
    .trim()
    .toUpperCase();

  return value || null;
};

const sanitizeFileName = (value, fallback) => {
  const sanitized = String(value || fallback || "qr-campaign")
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return sanitized || fallback || "qr-campaign";
};

const triggerBlobDownload = (blob, fileName) => {
  if (!blob) {
    throw new Error("File was not returned.");
  }

  const objectUrl = window.URL.createObjectURL(blob);

  const anchor = document.createElement("a");

  anchor.href = objectUrl;

  anchor.download = fileName;

  anchor.style.display = "none";

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  setTimeout(() => {
    window.URL.revokeObjectURL(objectUrl);
  }, 1000);

  return true;
};

// ============================================================
// QR CAMPAIGN API
// ============================================================

const qrCampaignApi = {
  // =========================================================
  // PUBLIC QR RESOLUTION
  // =========================================================
  //
  // GET
  // /api/public/qr/{code}
  //
  // Backend:
  //
  // 1. validates campaign
  // 2. validates ACTIVE status
  // 3. creates LibraryQrScan
  // 4. creates scanToken
  // 5. returns final destinationUrl
  //
  // =========================================================

  resolvePublicQr: async (code) => {
    const normalizedCode = normalizeCampaignCode(code);

    if (!normalizedCode) {
      throw new Error("QR campaign code is required.");
    }

    const response = await api.get(
      `/api/public/qr/${encodeURIComponent(normalizedCode)}`,
    );

    return response.data;
  },

  // =========================================================
  // QR ATTRIBUTION URL HELPERS
  // =========================================================
  //
  // Example:
  //
  // ?qr=CACY9YFC&qrs=SCAN_TOKEN
  //
  // Returns:
  //
  // {
  //   campaignCode: "CACY9YFC",
  //   scanToken: "SCAN_TOKEN"
  // }
  //
  // =========================================================

  getQrAttributionFromUrl: (search = window.location.search) => {
    const params = new URLSearchParams(search || "");

    const campaignCode = normalizeCampaignCode(params.get("qr"));

    const scanToken = normalizeScanToken(params.get("qrs"));

    return {
      campaignCode,
      scanToken,
    };
  },

  // =========================================================
  // COMPATIBILITY ALIAS
  // =========================================================
  //
  // Keep this because existing components may still use:
  //
  // qrCampaignApi.getAttributionFromSearch(...)
  //
  // =========================================================

  getAttributionFromSearch: (search = window.location.search) => {
    return qrCampaignApi.getQrAttributionFromUrl(search);
  },

  // =========================================================
  // GET SCAN TOKEN
  // =========================================================

  getScanTokenFromUrl: (search = window.location.search) => {
    return qrCampaignApi.getQrAttributionFromUrl(search).scanToken;
  },

  // =========================================================
  // GET CAMPAIGN CODE
  // =========================================================

  getCampaignCodeFromUrl: (search = window.location.search) => {
    return qrCampaignApi.getQrAttributionFromUrl(search).campaignCode;
  },

  // =========================================================
  // OWNER - GET ALL CAMPAIGNS
  // =========================================================
  //
  // GET
  // /api/libraries/{libraryId}/qr-campaigns
  //
  // =========================================================

  getCampaigns: async (libraryId) => {
    requireLibraryId(libraryId);

    const response = await api.get(`/api/libraries/${libraryId}/qr-campaigns`);

    return Array.isArray(response.data) ? response.data : [];
  },

  // =========================================================
  // OWNER - GET SINGLE CAMPAIGN
  // =========================================================

  getCampaign: async (libraryId, campaignId) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const response = await api.get(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}`,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - CAMPAIGN ANALYTICS
  // =========================================================
  //
  // GET
  // /api/libraries/{libraryId}
  //     /qr-campaigns/{campaignId}/analytics
  //
  // =========================================================

  getAnalytics: async (libraryId, campaignId) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const response = await api.get(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}/analytics`,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - CREATE CAMPAIGN
  // =========================================================

  createCampaign: async (libraryId, payload) => {
    requireLibraryId(libraryId);

    if (!payload) {
      throw new Error("Campaign payload is required.");
    }

    const response = await api.post(
      `/api/libraries/${libraryId}/qr-campaigns`,
      payload,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - UPDATE CAMPAIGN
  // =========================================================

  updateCampaign: async (libraryId, campaignId, payload) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    if (!payload) {
      throw new Error("Campaign payload is required.");
    }

    const response = await api.put(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}`,
      payload,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - ACTIVATE CAMPAIGN
  // =========================================================

  activateCampaign: async (libraryId, campaignId) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const response = await api.patch(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}/activate`,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - DEACTIVATE CAMPAIGN
  // =========================================================

  deactivateCampaign: async (libraryId, campaignId) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const response = await api.patch(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}/deactivate`,
    );

    return response.data;
  },

  // =========================================================
  // OWNER - ARCHIVE CAMPAIGN
  // =========================================================

  archiveCampaign: async (libraryId, campaignId) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const response = await api.patch(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}/archive`,
    );

    return response.data;
  },

  // =========================================================
  // CAMPAIGN QR PREVIEW
  // =========================================================

  getCampaignQrPreview: async (libraryId, campaignId) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const response = await api.get(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}/qr/png`,
      {
        params: {
          download: false,
        },

        responseType: "blob",
      },
    );

    return response.data;
  },

  // =========================================================
  // DOWNLOAD CAMPAIGN QR
  // =========================================================

  downloadCampaignQr: async (libraryId, campaignId) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const response = await api.get(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}/qr/png`,
      {
        params: {
          download: true,
        },

        responseType: "blob",
      },
    );

    return response.data;
  },

  // =========================================================
  // SAVE CAMPAIGN QR PNG
  // =========================================================

  saveCampaignQrPng: async (libraryId, campaignId, campaignName) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const blob = await qrCampaignApi.downloadCampaignQr(libraryId, campaignId);

    if (!blob) {
      throw new Error("Campaign QR image was not returned.");
    }

    const safeCampaignName = sanitizeFileName(
      campaignName,
      `campaign-${campaignId}`,
    );

    return triggerBlobDownload(blob, `${safeCampaignName}-qr.png`);
  },

  // =========================================================
  // CREATE CAMPAIGN QR OBJECT URL
  // =========================================================

  createCampaignQrObjectUrl: async (libraryId, campaignId) => {
    const blob = await qrCampaignApi.getCampaignQrPreview(
      libraryId,
      campaignId,
    );

    if (!blob) {
      throw new Error("Campaign QR preview image was not returned.");
    }

    return window.URL.createObjectURL(blob);
  },

  // =========================================================
  // DOWNLOAD PRINTABLE POSTER PDF
  // =========================================================

  downloadCampaignPosterPdf: async (libraryId, campaignId, payload = {}) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const response = await api.post(
      `/api/libraries/${libraryId}/qr-campaigns/${campaignId}/poster/pdf`,
      payload,
      {
        responseType: "blob",
      },
    );

    return response.data;
  },

  // =========================================================
  // SAVE PRINTABLE POSTER PDF
  // =========================================================

  saveCampaignPosterPdf: async (
    libraryId,
    campaignId,
    campaignName,
    payload = {},
  ) => {
    requireLibraryId(libraryId);

    requireCampaignId(campaignId);

    const blob = await qrCampaignApi.downloadCampaignPosterPdf(
      libraryId,
      campaignId,
      payload,
    );

    if (!blob) {
      throw new Error("Campaign poster PDF was not returned.");
    }

    const safeCampaignName = sanitizeFileName(
      campaignName,
      `campaign-${campaignId}`,
    );

    return triggerBlobDownload(blob, `${safeCampaignName}-poster.pdf`);
  },

  // =========================================================
  // COPY TRACKING LINK
  // =========================================================

  copyTrackingLink: async (trackingUrl) => {
    const value = String(trackingUrl || "").trim();

    if (!value) {
      throw new Error("Tracking URL is required.");
    }

    // ---------------------------------------------------------
    // MODERN CLIPBOARD API
    // ---------------------------------------------------------

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);

      return true;
    }

    // ---------------------------------------------------------
    // FALLBACK
    // ---------------------------------------------------------

    const textarea = document.createElement("textarea");

    textarea.value = value;

    textarea.style.position = "fixed";

    textarea.style.opacity = "0";

    textarea.style.pointerEvents = "none";

    textarea.style.left = "-9999px";

    document.body.appendChild(textarea);

    textarea.focus();

    textarea.select();

    const copied = document.execCommand("copy");

    textarea.remove();

    if (!copied) {
      throw new Error("Unable to copy tracking URL.");
    }

    return true;
  },

  // =========================================================
  // OPEN TRACKING LINK
  // =========================================================
  //
  // IMPORTANT:
  //
  // Opening this link goes through /q/{code}.
  //
  // Therefore this may create a real scan in analytics.
  //
  // Owner testing should normally use openDestination().
  //
  // =========================================================

  openTrackingLink: (trackingUrl) => {
    const value = String(trackingUrl || "").trim();

    if (!value) {
      throw new Error("Tracking URL is required.");
    }

    window.open(value, "_blank", "noopener,noreferrer");
  },

  // =========================================================
  // OPEN FINAL DESTINATION
  // =========================================================
  //
  // Bypasses /q/{code}.
  //
  // Therefore owner destination previews do not create
  // artificial scan analytics.
  //
  // =========================================================

  openDestination: (destinationUrl) => {
    const value = String(destinationUrl || "").trim();

    if (!value) {
      throw new Error("Destination URL is required.");
    }

    window.open(value, "_blank", "noopener,noreferrer");
  },
};

export default qrCampaignApi;
