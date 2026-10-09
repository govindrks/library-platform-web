import api from "./axios";

const couponApi = {

    getLibraryCoupons: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/coupons`
            );

        return response.data;
    },


    getActiveCoupons: async (
        libraryId
    ) => {

        const response =
            await api.get(
                `/api/libraries/${libraryId}/coupons/active`
            );

        return response.data;
    },


    createCoupon: async (
        libraryId,
        payload
    ) => {

        const response =
            await api.post(
                `/api/libraries/${libraryId}/coupons`,
                payload
            );

        return response.data;
    },


    deactivateCoupon: async (
        libraryId,
        couponId
    ) => {

        await api.patch(
            `/api/libraries/${libraryId}/coupons/${couponId}/deactivate`
        );
    },


    validateCoupon: async (
        payload
    ) => {

        const response =
            await api.post(
                "/api/coupons/validate",
                payload
            );

        return response.data;
    },
};

export default couponApi;