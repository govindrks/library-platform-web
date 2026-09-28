import couponMockData from "./couponMockData";

let coupons = couponMockData.map((coupon) => ({
    ...coupon,
}));

const listeners = new Set();

const notify = () => {
    listeners.forEach((listener) => listener());
};

const normalizeDate = (date) => {
    if (!date) return "";

    return new Date(`${date}T00:00:00`);
};

const getToday = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const updateExpiredCoupons = () => {
    const today = getToday();

    let changed = false;

    coupons = coupons.map((coupon) => {
        if (
            coupon.status === "ACTIVE" &&
            coupon.validUntil &&
            today > coupon.validUntil
        ) {
            changed = true;

            return {
                ...coupon,
                status: "EXPIRED",
            };
        }

        return coupon;
    });

    return changed;
};

const getCoupons = () => {
    updateExpiredCoupons();

    return coupons;
};

const subscribe = (listener) => {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
};

const createCoupon = (couponData) => {
    const normalizedCode = couponData.code
        .trim()
        .toUpperCase();

    const existingCoupon = coupons.find(
        (coupon) =>
            coupon.code.toUpperCase() === normalizedCode
    );

    if (existingCoupon) {
        throw new Error(
            "A coupon with this code already exists."
        );
    }

    const newCoupon = {
        id: Date.now(),
        ...couponData,
        code: normalizedCode,
        status: "ACTIVE",
        createdAt: getToday(),
        usedAt: null,
        usedBy: null,
        bookingId: null,
        paymentId: null,
        discountAmount: null,
    };

    coupons = [newCoupon, ...coupons];

    notify();

    return newCoupon;
};

const updateCoupon = (couponId, couponData) => {
    const coupon = coupons.find(
        (item) => item.id === couponId
    );

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    if (coupon.status !== "ACTIVE") {
        throw new Error(
            "Only active coupons can be edited."
        );
    }

    const updatedCoupon = {
        ...coupon,
        ...couponData,
        code: coupon.code,
    };

    coupons = coupons.map((item) =>
        item.id === couponId
            ? updatedCoupon
            : item
    );

    notify();

    return updatedCoupon;
};

const deactivateCoupon = (couponId) => {
    const coupon = coupons.find(
        (item) => item.id === couponId
    );

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    if (coupon.status !== "ACTIVE") {
        throw new Error(
            "Only active coupons can be deactivated."
        );
    }

    coupons = coupons.map((item) =>
        item.id === couponId
            ? {
                  ...item,
                  status: "DEACTIVATED",
              }
            : item
    );

    notify();

    return true;
};

const deleteCoupon = (couponId) => {
    coupons = coupons.filter(
        (coupon) => coupon.id !== couponId
    );

    notify();
};

const findCouponByCode = (code) => {
    if (!code) return null;

    const normalizedCode = code
        .trim()
        .toUpperCase();

    return getCoupons().find(
        (coupon) =>
            coupon.code.toUpperCase() === normalizedCode
    ) || null;
};

const validateCoupon = ({
    code,
    amount,
}) => {
    const coupon = findCouponByCode(code);

    if (!coupon) {
        return {
            valid: false,
            coupon: null,
            message: "Invalid coupon code.",
        };
    }

    if (coupon.status === "USED") {
        return {
            valid: false,
            coupon,
            message:
                "This coupon has already been used.",
        };
    }

    if (coupon.status === "DEACTIVATED") {
        return {
            valid: false,
            coupon,
            message:
                "This coupon has been deactivated.",
        };
    }

    if (coupon.status === "EXPIRED") {
        return {
            valid: false,
            coupon,
            message: "This coupon has expired.",
        };
    }

    const today = getToday();

    if (
        coupon.validFrom &&
        today < coupon.validFrom
    ) {
        return {
            valid: false,
            coupon,
            message: `This coupon is valid from ${coupon.validFrom}.`,
        };
    }

    if (
        coupon.validUntil &&
        today > coupon.validUntil
    ) {
        return {
            valid: false,
            coupon,
            message: "This coupon has expired.",
        };
    }

    if (
        Number(amount) <
        Number(coupon.minimumAmount || 0)
    ) {
        return {
            valid: false,
            coupon,
            message: `Minimum payment of ₹${coupon.minimumAmount} is required.`,
        };
    }

    return {
        valid: true,
        coupon,
        message: "Coupon is valid.",
    };
};

const calculateDiscount = (coupon, amount) => {
    if (!coupon || amount <= 0) {
        return 0;
    }

    let discount = 0;

    if (coupon.discountType === "PERCENTAGE") {
        discount =
            (Number(amount) *
                Number(coupon.discountValue)) /
            100;

        if (
            coupon.maximumDiscount !== null &&
            coupon.maximumDiscount !== undefined
        ) {
            discount = Math.min(
                discount,
                Number(coupon.maximumDiscount)
            );
        }
    }

    if (coupon.discountType === "FIXED_AMOUNT") {
        discount = Number(coupon.discountValue);
    }

    return Math.min(
        Math.max(discount, 0),
        Number(amount)
    );
};

const consumeCoupon = ({
    couponId,
    usedBy = "Current Student",
    bookingId = null,
    paymentId = null,
    discountAmount = 0,
}) => {
    const coupon = coupons.find(
        (item) => item.id === couponId
    );

    if (!coupon) {
        throw new Error("Coupon not found.");
    }

    if (coupon.status !== "ACTIVE") {
        throw new Error(
            "Coupon is no longer available."
        );
    }

    const today = getToday();

    if (
        coupon.validFrom &&
        today < coupon.validFrom
    ) {
        throw new Error(
            "Coupon is not active yet."
        );
    }

    if (
        coupon.validUntil &&
        today > coupon.validUntil
    ) {
        throw new Error(
            "Coupon has expired."
        );
    }

    const consumedCoupon = {
        ...coupon,
        status: "USED",
        usedAt: new Date().toLocaleString("en-IN"),
        usedBy,
        bookingId,
        paymentId,
        discountAmount,
    };

    coupons = coupons.map((item) =>
        item.id === couponId
            ? consumedCoupon
            : item
    );

    notify();

    return consumedCoupon;
};

const getActiveCoupons = () => {
    return getCoupons().filter(
        (coupon) => coupon.status === "ACTIVE"
    );
};

const getPastCoupons = () => {
    return getCoupons().filter(
        (coupon) =>
            coupon.status === "USED" ||
            coupon.status === "EXPIRED" ||
            coupon.status === "DEACTIVATED"
    );
};

const couponStore = {
    getCoupons,
    getActiveCoupons,
    getPastCoupons,
    subscribe,
    createCoupon,
    updateCoupon,
    deactivateCoupon,
    deleteCoupon,
    findCouponByCode,
    validateCoupon,
    calculateDiscount,
    consumeCoupon,
};

export default couponStore;