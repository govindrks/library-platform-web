import api from "./axios";


const seatPriceQuoteApi = {

    // =========================================================
    // GET AUTHORITATIVE SEAT PRICE QUOTE
    // =========================================================
    //
    // Backend resolves:
    //
    // - authenticated member
    // - membership plan
    // - selected seat
    // - NORMAL / PREMIUM base price
    // - member-specific pricing override
    // - seat feature surcharges
    //
    // Example:
    //
    // GET
    // /api/libraries/1/pricing/seat-quote
    //     ?membershipPlanId=5
    //     &seatId=101
    //
    // =========================================================

    getSeatQuote: async ({
        libraryId,
        membershipPlanId,
        seatId,
    }) => {

        const response = await api.get(
            `/api/libraries/${libraryId}/pricing/seat-quote`,
            {
                params: {
                    membershipPlanId,
                    seatId,
                },
            }
        );

        return response.data;
    },
};


export default seatPriceQuoteApi;