import api from "./axios";

const seatPriceQuoteApi = {
  // =========================================================
  // AUTHENTICATED MEMBER - AUTHORITATIVE SEAT PRICE QUOTE
  // =========================================================
  //
  // Backend resolves:
  //
  // - authenticated member
  // - membership plan
  // - selected seat
  // - seat type pricing
  // - member pricing override
  // - seat feature surcharges
  //
  // GET
  // /api/libraries/{libraryId}/pricing/seat-quote
  //
  // =========================================================

  getSeatQuote: async ({ libraryId, membershipPlanId, seatId }) => {
    if (!libraryId) {
      throw new Error("Library ID is required.");
    }

    if (!membershipPlanId) {
      throw new Error("Membership plan ID is required.");
    }

    if (!seatId) {
      throw new Error("Seat ID is required.");
    }

    const response = await api.get(
      `/api/libraries/${libraryId}/pricing/seat-quote`,
      {
        params: {
          membershipPlanId,
          seatId,
        },
      },
    );

    return response.data;
  },
};

export default seatPriceQuoteApi;
