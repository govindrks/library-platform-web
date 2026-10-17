import api from "./axios";

const supportTicketApi = {
  // ============================================================
  // STUDENT SUPPORT
  // ============================================================

  createStudentTicket: async (payload) => {
    const response = await api.post("/api/student/support/tickets", payload);

    return response.data;
  },

  getStudentTickets: async () => {
    const response = await api.get("/api/student/support/tickets");

    return response.data;
  },

  getStudentTicket: async (ticketId) => {
    const response = await api.get(`/api/student/support/tickets/${ticketId}`);

    return response.data;
  },

  sendStudentMessage: async (ticketId, payload) => {
    const response = await api.post(
      `/api/student/support/tickets/${ticketId}/messages`,
      payload,
    );

    return response.data;
  },

  closeStudentTicket: async (ticketId) => {
    const response = await api.patch(
      `/api/student/support/tickets/${ticketId}/close`,
    );

    return response.data;
  },

  // ============================================================
  // LIBRARY OWNER -> PLATFORM SUPPORT
  // ============================================================

  createOwnerTicket: async (payload) => {
    const response = await api.post("/api/owner/support/tickets", payload);

    return response.data;
  },

  getOwnerTickets: async () => {
    const response = await api.get("/api/owner/support/tickets");

    return response.data;
  },

  getOwnerTicket: async (ticketId) => {
    const response = await api.get(`/api/owner/support/tickets/${ticketId}`);

    return response.data;
  },

  sendOwnerMessage: async (ticketId, payload) => {
    const response = await api.post(
      `/api/owner/support/tickets/${ticketId}/messages`,
      payload,
    );

    return response.data;
  },

  closeOwnerTicket: async (ticketId) => {
    const response = await api.patch(
      `/api/owner/support/tickets/${ticketId}/close`,
    );

    return response.data;
  },

  // ============================================================
  // LIBRARY OWNER -> STUDENT LIBRARY SUPPORT
  // ============================================================

  getLibrarySupportTickets: async (libraryId) => {
    const response = await api.get(
      `/api/owner/support/libraries/${libraryId}/tickets`,
    );

    return response.data;
  },

  getLibrarySupportTicket: async (libraryId, ticketId) => {
    const response = await api.get(
      `/api/owner/support/libraries/${libraryId}/tickets/${ticketId}`,
    );

    return response.data;
  },

  replyToStudentTicket: async (libraryId, ticketId, payload) => {
    const response = await api.post(
      `/api/owner/support/libraries/${libraryId}/tickets/${ticketId}/messages`,
      payload,
    );

    return response.data;
  },

  updateLibraryTicketStatus: async (libraryId, ticketId, status) => {
    const response = await api.patch(
      `/api/owner/support/libraries/${libraryId}/tickets/${ticketId}/status`,
      {
        status,
      },
    );

    return response.data;
  },

  // ============================================================
  // PLATFORM ADMIN SUPPORT
  // ============================================================

  getAdminTickets: async () => {
    const response = await api.get("/api/admin/support/tickets");

    return response.data;
  },

  getAdminTicket: async (ticketId) => {
    const response = await api.get(`/api/admin/support/tickets/${ticketId}`);

    return response.data;
  },

  sendAdminMessage: async (ticketId, payload) => {
    const response = await api.post(
      `/api/admin/support/tickets/${ticketId}/messages`,
      payload,
    );

    return response.data;
  },

  addAdminInternalNote: async (ticketId, payload) => {
    const response = await api.post(
      `/api/admin/support/tickets/${ticketId}/internal-notes`,
      payload,
    );

    return response.data;
  },

  updateAdminTicketStatus: async (ticketId, status) => {
    const response = await api.patch(
      `/api/admin/support/tickets/${ticketId}/status`,
      {
        status,
      },
    );

    return response.data;
  },

  assignAdminTicket: async (ticketId, assignedToUserId) => {
    const response = await api.patch(
      `/api/admin/support/tickets/${ticketId}/assign`,
      {
        assignedToUserId,
      },
    );

    return response.data;
  },
};

export default supportTicketApi;
