import api from "./axios";

// ============================================================
// CONSTANTS
// ============================================================

const EXCEL_CONTENT_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

// ============================================================
// INTERNAL HELPERS
// ============================================================

const getLibraryId = (payload) => {
  const libraryId = payload?.libraryId;

  if (libraryId === null || libraryId === undefined || libraryId === "") {
    throw new Error("Library ID is required for report operations.");
  }

  return libraryId;
};

const buildReportUrl = (payload, endpoint) => {
  const libraryId = getLibraryId(payload);

  return `/api/libraries/${libraryId}/reports/${endpoint}`;
};

const postJson = async (url, payload) => {
  const response = await api.post(url, payload);

  return response.data;
};

const postBlob = async (url, payload, contentType) => {
  const response = await api.post(url, payload, {
    responseType: "blob",

    headers: {
      Accept: contentType,
    },
  });

  return response.data;
};

const downloadBlob = (blob, fileName) => {
  if (!blob) {
    throw new Error("Report file could not be generated.");
  }

  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = fileName;

  document.body.appendChild(link);

  link.click();

  link.remove();

  window.URL.revokeObjectURL(url);
};

// ============================================================
// BOOKING REPORT
// ============================================================

const generateBookingReport = async (payload) => {
  return postJson(buildReportUrl(payload, "bookings"), payload);
};

const downloadBookingPdf = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "bookings/pdf"),

    payload,

    "application/pdf",
  );

  downloadBlob(blob, "booking-report.pdf");
};

const downloadBookingExcel = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "bookings/excel"),

    payload,

    EXCEL_CONTENT_TYPE,
  );

  downloadBlob(blob, "booking-report.xlsx");
};

// ============================================================
// REVENUE REPORT
// ============================================================

const generateRevenueReport = async (payload) => {
  return postJson(
    buildReportUrl(payload, "revenue"),

    payload,
  );
};

const downloadRevenuePdf = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "revenue/pdf"),

    payload,

    "application/pdf",
  );

  downloadBlob(blob, "revenue-report.pdf");
};

const downloadRevenueExcel = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "revenue/excel"),

    payload,

    EXCEL_CONTENT_TYPE,
  );

  downloadBlob(blob, "revenue-report.xlsx");
};

// ============================================================
// PAYMENT REPORT
// ============================================================

const generatePaymentReport = async (payload) => {
  return postJson(
    buildReportUrl(payload, "payments"),

    payload,
  );
};

const downloadPaymentPdf = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "payments/pdf"),

    payload,

    "application/pdf",
  );

  downloadBlob(blob, "payment-report.pdf");
};

const downloadPaymentExcel = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "payments/excel"),

    payload,

    EXCEL_CONTENT_TYPE,
  );

  downloadBlob(blob, "payment-report.xlsx");
};

// ============================================================
// REFUND REPORT
// ============================================================

const generateRefundReport = async (payload) => {
  return postJson(
    buildReportUrl(payload, "refunds"),

    payload,
  );
};

const downloadRefundPdf = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "refunds/pdf"),

    payload,

    "application/pdf",
  );

  downloadBlob(blob, "refund-report.pdf");
};

const downloadRefundExcel = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "refunds/excel"),

    payload,

    EXCEL_CONTENT_TYPE,
  );

  downloadBlob(blob, "refund-report.xlsx");
};

// ============================================================
// MEMBERSHIP / SUBSCRIPTION REPORT
// ============================================================

const generateMembershipReport = async (payload) => {
  return postJson(
    buildReportUrl(payload, "subscriptions"),

    payload,
  );
};

const downloadMembershipPdf = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "subscriptions/pdf"),

    payload,

    "application/pdf",
  );

  downloadBlob(blob, "membership-report.pdf");
};

const downloadMembershipExcel = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "subscriptions/excel"),

    payload,

    EXCEL_CONTENT_TYPE,
  );

  downloadBlob(blob, "membership-report.xlsx");
};

// ============================================================
// OCCUPANCY / SEAT UTILIZATION REPORT
// ============================================================

const generateOccupancyReport = async (payload) => {
  return postJson(
    buildReportUrl(payload, "seat-utilization"),

    payload,
  );
};

const downloadOccupancyPdf = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "seat-utilization/pdf"),

    payload,

    "application/pdf",
  );

  downloadBlob(blob, "occupancy-report.pdf");
};

const downloadOccupancyExcel = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "seat-utilization/excel"),

    payload,

    EXCEL_CONTENT_TYPE,
  );

  downloadBlob(blob, "occupancy-report.xlsx");
};

// ============================================================
// ATTENDANCE REPORT
// ============================================================

const generateAttendanceReport = async (payload) => {
  return postJson(
    buildReportUrl(payload, "attendance"),

    payload,
  );
};

const downloadAttendancePdf = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "attendance/pdf"),

    payload,

    "application/pdf",
  );

  downloadBlob(blob, "attendance-report.pdf");
};

const downloadAttendanceExcel = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "attendance/excel"),

    payload,

    EXCEL_CONTENT_TYPE,
  );

  downloadBlob(blob, "attendance-report.xlsx");
};

// ============================================================
// DASHBOARD EXPORT
// ============================================================

const downloadDashboardPdf = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "dashboard/pdf"),

    payload,

    "application/pdf",
  );

  downloadBlob(blob, "dashboard-report.pdf");
};

const downloadDashboardExcel = async (payload) => {
  const blob = await postBlob(
    buildReportUrl(payload, "dashboard/excel"),

    payload,

    EXCEL_CONTENT_TYPE,
  );

  downloadBlob(blob, "dashboard-report.xlsx");
};

// ============================================================
// EXPORT
// ============================================================

const reportApi = {
  // Booking
  generateBookingReport,
  downloadBookingPdf,
  downloadBookingExcel,

  // Revenue
  generateRevenueReport,
  downloadRevenuePdf,
  downloadRevenueExcel,

  // Payment
  generatePaymentReport,
  downloadPaymentPdf,
  downloadPaymentExcel,

  // Refund
  generateRefundReport,
  downloadRefundPdf,
  downloadRefundExcel,

  // Membership
  generateMembershipReport,
  downloadMembershipPdf,
  downloadMembershipExcel,

  // Occupancy
  generateOccupancyReport,
  downloadOccupancyPdf,
  downloadOccupancyExcel,

  // Attendance
  generateAttendanceReport,
  downloadAttendancePdf,
  downloadAttendanceExcel,

  // Dashboard
  downloadDashboardPdf,
  downloadDashboardExcel,
};

export default reportApi;
