import api from "../utility/axiosInterceptor";

const couponApi = {

    createCoupon: async (libraryId, payload) => {
        return (
            await api.post(
                `/api/libraries/${libraryId}/coupons`,
                payload
            )
        ).data;
    },

    getLibraryCoupons: async (libraryId) => {
        return (
            await api.get(
                `/api/libraries/${libraryId}/coupons`
            )
        ).data;
    },

    getActiveCoupons: async (libraryId) => {
        return (
            await api.get(
                `/api/libraries/${libraryId}/coupons/active`
            )
        ).data;
    },

    validateCoupon: async ({
        libraryId,
        code,
        amount,
    }) => {
        return (
            await api.post(
                "/api/coupons/validate",
                {
                    libraryId,
                    code,
                    amount,
                }
            )
        ).data;
    },

    deactivateCoupon: async (
        libraryId,
        couponId
    ) => {
        await api.patch(
            `/api/libraries/${libraryId}/coupons/${couponId}/deactivate`
        );
    },
};

export default couponApi;