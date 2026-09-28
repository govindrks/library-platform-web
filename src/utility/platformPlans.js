const platformPlans = [
    {
        id: "STARTER",
        name: "Starter",
        minMembers: 1,
        maxMembers: 50,
        price: 999,
        billingCycle: "MONTHLY",
        description:
            "For small libraries starting their digital journey.",
        popular: false,
    },
    {
        id: "GROWTH",
        name: "Growth",
        minMembers: 1,
        maxMembers: 100,
        price: 1499,
        billingCycle: "MONTHLY",
        description:
            "For growing libraries managing more members.",
        popular: true,
    },
    {
        id: "STANDARD",
        name: "Standard",
        minMembers: 1,
        maxMembers: 200,
        price: 2499,
        billingCycle: "MONTHLY",
        description:
            "For libraries with a larger member base.",
        popular: false,
    },
    {
        id: "PROFESSIONAL",
        name: "Professional",
        minMembers: 1,
        maxMembers: 500,
        price: 3999,
        billingCycle: "MONTHLY",
        description:
            "For established libraries with high usage.",
        popular: false,
    },
    {
        id: "BUSINESS",
        name: "Business",
        minMembers: 1,
        maxMembers: 1000,
        price: 6999,
        billingCycle: "MONTHLY",
        description:
            "For large libraries requiring higher capacity.",
        popular: false,
    },
    {
        id: "ENTERPRISE",
        name: "Enterprise",
        minMembers: 1001,
        maxMembers: null,
        price: null,
        billingCycle: "CUSTOM",
        description:
            "For large-scale and multi-location operations.",
        popular: false,
    },
];

export const getPlanById = (planId) =>
    platformPlans.find(
        (plan) => plan.id === planId
    );

export default platformPlans;