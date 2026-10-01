import api from "../utility/axiosInterceptor";

const memberPricingApi = {

    createPricing: async (payload) => {

        const response =
            await api.post(
                "/api/member-pricing",
                payload
            );

        return response.data;
    },


    updatePricing: async (
        pricingId,
        payload
    ) => {

        const response =
            await api.put(
                `/api/member-pricing/${pricingId}`,
                payload
            );

        return response.data;
    },


    getMemberPricing: async (
        memberId
    ) => {

        const response =
            await api.get(
                `/api/member-pricing/member/${memberId}`
            );

        return response.data;
    },


    getCurrentPricing: async (
        memberId,
        membershipPlanId
    ) => {

        const response =
            await api.get(
                `/api/member-pricing/member/${memberId}/plan/${membershipPlanId}`
            );

        return response.data;
    },


    getEffectivePrice: async (
        memberId,
        membershipPlanId
    ) => {

        const response =
            await api.get(
                "/api/member-pricing/effective-price",
                {
                    params: {
                        memberId,
                        membershipPlanId,
                    },
                }
            );

        return response.data;
    },


    deactivatePricing: async (
        pricingId
    ) => {

        await api.patch(
            `/api/member-pricing/${pricingId}/deactivate`
        );
    },
};

export default memberPricingApi;