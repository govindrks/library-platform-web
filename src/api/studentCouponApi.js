import api from "./axios";

const studentCouponApi = {
  // ============================================================
  // VALIDATE / APPLY COUPON
  // ============================================================

  validateCoupon: async ({ libraryId, code, amount }) => {
    const response = await api.post("/api/coupons/validate", {
      libraryId: Number(libraryId),
      code: code?.trim().toUpperCase(),
      amount: Number(amount),
    });

    return response.data;
  },
};

export default studentCouponApi;
