import api from "./axios";

// ============================================================
// INVOICE API
// ============================================================
//
// Owner / tenant-scoped invoice routes:
//
// /api/libraries/{libraryId}/invoices
//
// General payment invoice routes:
//
// /api/payment/invoices
//
// IMPORTANT:
//
// PDF generation happens on the backend:
//
// PaymentInvoiceService
//      ↓
// PdfInvoiceGeneratorImpl
//
// The frontend only requests/downloads the generated PDF.
// ============================================================

// ============================================================
// DOWNLOAD BLOB
// ============================================================

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = filename || "invoice.pdf";

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

// ============================================================
// EXTRACT FILENAME FROM RESPONSE HEADER
// ============================================================

const extractFilename = (contentDisposition, fallback) => {
  if (!contentDisposition) {
    return fallback;
  }

  /*
   * Handles:
   *
   * filename*=UTF-8''INV-001.pdf
   */
  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i);

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/["']/g, "").trim());
  }

  /*
   * Handles:
   *
   * filename="INV-001.pdf"
   */
  const normalMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  if (normalMatch?.[1]) {
    return normalMatch[1].trim();
  }

  return fallback;
};

// ============================================================
// API
// ============================================================

const invoiceApi = {
  // ==========================================================
  // OWNER / LIBRARY INVOICES
  // ==========================================================

  /*
   * Get all invoices belonging to a library.
   *
   * Backend:
   *
   * GET
   * /api/libraries/{libraryId}/invoices
   */
  getLibraryInvoices: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(`/api/libraries/${libraryId}/invoices`);

    return response.data;
  },

  // ==========================================================
  // GET OWNER-SCOPED INVOICE BY ID
  // ==========================================================

  /*
   * Retrieves invoice details while enforcing
   * library / tenant ownership.
   *
   * Backend:
   *
   * GET
   * /api/libraries/{libraryId}/invoices/{invoiceId}
   */
  getInvoiceById: async (libraryId, invoiceId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!invoiceId) {
      throw new Error("Invoice ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/invoices/${invoiceId}`,
    );

    return response.data;
  },

  // ==========================================================
  // DOWNLOAD LIBRARY-SCOPED PDF
  // ==========================================================

  /*
   * Downloads an invoice PDF for the selected library.
   *
   * Backend:
   *
   * GET
   * /api/libraries/{libraryId}/invoices/{invoiceId}/download
   */
  downloadInvoice: async (libraryId, invoiceId, invoiceNumber) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!invoiceId) {
      throw new Error("Invoice ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/invoices/${invoiceId}/download`,
      {
        responseType: "blob",
      },
    );

    const fallbackFilename = invoiceNumber
      ? `${invoiceNumber}.pdf`
      : `invoice-${invoiceId}.pdf`;

    const filename = extractFilename(
      response.headers?.["content-disposition"],
      fallbackFilename,
    );

    downloadBlob(response.data, filename);

    return true;
  },

  // ==========================================================
  // GENERATE INVOICE
  // ==========================================================

  /*
   * Generates or returns an existing invoice for a successful
   * payment transaction.
   *
   * Backend:
   *
   * POST
   * /api/payment/invoices/generate/{paymentTransactionId}
   */
  generateInvoice: async (paymentTransactionId) => {
    if (!paymentTransactionId) {
      throw new Error("Payment transaction ID is required.");
    }

    const response = await api.post(
      `/api/payment/invoices/generate/${paymentTransactionId}`,
    );

    return response.data;
  },

  // ==========================================================
  // GENERATE MISSING / HISTORICAL INVOICE
  // ==========================================================

  /*
   * Creates a missing invoice for an already-successful
   * historical payment.
   *
   * Backend:
   *
   * POST
   * /api/payment/invoices/generate-missing/{paymentTransactionId}
   *
   * Backend uses generateIfAbsent(...), therefore this remains
   * safe when called repeatedly.
   */
  generateMissingInvoice: async (paymentTransactionId) => {
    if (!paymentTransactionId) {
      throw new Error("Payment transaction ID is required.");
    }

    const response = await api.post(
      `/api/payment/invoices/generate-missing/${paymentTransactionId}`,
    );

    return response.data;
  },

  // ==========================================================
  // REGENERATE EXISTING INVOICE PDF
  // ==========================================================

  /*
   * Recreates the PDF for an invoice that already exists.
   *
   * IMPORTANT:
   *
   * This does NOT create another invoice row.
   * This does NOT create another invoice number.
   *
   * Existing:
   *
   * invoiceId
   * invoiceNumber
   * paymentTransactionId
   * libraryId
   * customerId
   *
   * remain unchanged.
   *
   * Only the stored PDF is regenerated using the latest
   * PdfInvoiceGeneratorImpl template.
   *
   * Backend:
   *
   * POST
   * /api/payment/invoices/{invoiceId}/regenerate-pdf
   *
   * Used when:
   *
   * Due Date -> Paid On
   *
   * or when any future PDF-template change needs to be applied
   * to an existing historical invoice.
   */
  regeneratePdf: async (invoiceId, invoiceNumber) => {
    if (!invoiceId) {
      throw new Error("Invoice ID is required.");
    }

    const response = await api.post(
      `/api/payment/invoices/${invoiceId}/regenerate-pdf`,
      {},
      {
        responseType: "blob",
      },
    );

    const fallbackFilename = invoiceNumber
      ? `${invoiceNumber}.pdf`
      : `invoice-${invoiceId}.pdf`;

    const filename = extractFilename(
      response.headers?.["content-disposition"],
      fallbackFilename,
    );

    downloadBlob(response.data, filename);

    return true;
  },

  // ==========================================================
  // GET INVOICE BY GLOBAL ID
  // ==========================================================

  /*
   * Backend:
   *
   * GET
   * /api/payment/invoices/{invoiceId}
   */
  getById: async (invoiceId) => {
    if (!invoiceId) {
      throw new Error("Invoice ID is required.");
    }

    const response = await api.get(`/api/payment/invoices/${invoiceId}`);

    return response.data;
  },

  // ==========================================================
  // GET INVOICE BY NUMBER
  // ==========================================================

  /*
   * Backend:
   *
   * GET
   * /api/payment/invoices/number/{invoiceNumber}
   */
  getByInvoiceNumber: async (invoiceNumber) => {
    if (!invoiceNumber) {
      throw new Error("Invoice number is required.");
    }

    const response = await api.get(
      `/api/payment/invoices/number/${encodeURIComponent(invoiceNumber)}`,
    );

    return response.data;
  },

  // ==========================================================
  // GET CUSTOMER INVOICES
  // ==========================================================

  /*
   * Backend:
   *
   * GET
   * /api/payment/invoices/customer/{customerId}
   */
  getCustomerInvoices: async (customerId) => {
    if (!customerId) {
      throw new Error("Customer ID is required.");
    }

    const response = await api.get(
      `/api/payment/invoices/customer/${customerId}`,
    );

    return response.data;
  },

  // ==========================================================
  // GET AUTHENTICATED USER INVOICES
  // ==========================================================

  /*
   * Returns invoices belonging to the currently authenticated
   * student/member.
   *
   * Backend:
   *
   * GET
   * /api/payment/invoices/my
   */
  getMyInvoices: async () => {
    const response = await api.get("/api/payment/invoices/my");

    return response.data;
  },

  // ==========================================================
  // GET LIBRARY INVOICES - GENERAL CONTROLLER
  // ==========================================================

  /*
   * Backend:
   *
   * GET
   * /api/payment/invoices/library/{libraryId}
   */
  getLibraryInvoicesGlobal: async (libraryId) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    const response = await api.get(
      `/api/payment/invoices/library/${libraryId}`,
    );

    return response.data;
  },

  // ==========================================================
  // DOWNLOAD GLOBAL INVOICE
  // ==========================================================

  /*
   * Backend:
   *
   * GET
   * /api/payment/invoices/{invoiceId}/download
   *
   * This normally returns the already-stored PDF.
   */
  downloadGlobalInvoice: async (invoiceId, invoiceNumber) => {
    if (!invoiceId) {
      throw new Error("Invoice ID is required.");
    }

    const response = await api.get(
      `/api/payment/invoices/${invoiceId}/download`,
      {
        responseType: "blob",
      },
    );

    const fallbackFilename = invoiceNumber
      ? `${invoiceNumber}.pdf`
      : `invoice-${invoiceId}.pdf`;

    const filename = extractFilename(
      response.headers?.["content-disposition"],
      fallbackFilename,
    );

    downloadBlob(response.data, filename);

    return true;
  },
};

export default invoiceApi;
