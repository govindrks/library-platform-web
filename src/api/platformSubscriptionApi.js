import api from "./axios";

/**
 * =============================================================
 * PLATFORM SUBSCRIPTION API
 * =============================================================
 *
 * Handles LibraryHub SaaS/platform subscriptions.
 *
 * IMPORTANT:
 *
 * This API is for:
 *
 * Library Owner
 *      ↓
 * LibraryHub Platform Plan
 *
 * It is NOT used for:
 *
 * Student
 *      ↓
 * Library Membership / Booking payment
 *
 * Backend base URL:
 *
 * /api/platform/subscriptions
 * =============================================================
 */

const platformSubscriptionApi = {
  // ===========================================================
  // ONBOARDING - SELECT PLATFORM PLAN
  // ===========================================================

  /**
   * Selects a LibraryHub platform plan during library-owner
   * onboarding.
   *
   * Backend:
   *
   * POST
   * /api/platform/subscriptions/onboarding/libraries/{libraryId}/plan
   *
   * Request:
   *
   * {
   *   platformPlanId: 1,
   *   autoRenew: true
   * }
   *
   * The authenticated Library Owner is resolved from the JWT.
   * ownerId / customerId must NOT be sent by the frontend.
   *
   * The response may also contain payment information such as:
   *
   * subscriptionId
   * paymentTransactionId
   * gatewayOrderId
   * amount
   * currency
   * paymentUrl
   */
  selectPlanDuringOnboarding: async (
    libraryId,
    payload,
  ) => {
    if (!libraryId) {
      throw new Error(
        "Library ID is required to select a platform plan.",
      );
    }

    if (!payload?.platformPlanId) {
      throw new Error(
        "Platform plan ID is required.",
      );
    }

    const response = await api.post(
      `/api/platform/subscriptions/onboarding/libraries/${libraryId}/plan`,
      {
        platformPlanId: Number(
          payload.platformPlanId,
        ),

        autoRenew:
          payload.autoRenew === true,
      },
    );

    return response.data;
  },


  // ===========================================================
  // NORMAL PLATFORM SUBSCRIPTION
  // ===========================================================

  /**
   * Creates a platform subscription outside initial onboarding.
   *
   * Backend:
   *
   * POST
   * /api/platform/subscriptions
   *
   * Expected request follows PlatformSubscriptionRequest.
   */
  subscribe: async (payload) => {
    if (!payload) {
      throw new Error(
        "Platform subscription request is required.",
      );
    }

    const response = await api.post(
      "/api/platform/subscriptions",
      payload,
    );

    return response.data;
  },


  // ===========================================================
  // GET SUBSCRIPTION BY ID
  // ===========================================================

  /**
   * Retrieves a platform subscription by subscription ID.
   *
   * Backend:
   *
   * GET
   * /api/platform/subscriptions/{subscriptionId}
   */
  getById: async (subscriptionId) => {
    if (!subscriptionId) {
      throw new Error(
        "Platform subscription ID is required.",
      );
    }

    const response = await api.get(
      `/api/platform/subscriptions/${subscriptionId}`,
    );

    return response.data;
  },


  // ===========================================================
  // GET ACTIVE SUBSCRIPTION
  // ===========================================================

  /**
   * Retrieves the currently ACTIVE platform subscription
   * for the requested library.
   *
   * Backend:
   *
   * GET
   * /api/platform/subscriptions/library/{libraryId}/active
   */
  getActiveSubscription: async (
    libraryId,
  ) => {
    if (!libraryId) {
      throw new Error(
        "Library ID is required.",
      );
    }

    const response = await api.get(
      `/api/platform/subscriptions/library/${libraryId}/active`,
    );

    return response.data;
  },


  // ===========================================================
  // GET LIBRARY SUBSCRIPTION HISTORY
  // ===========================================================

  /**
   * Retrieves all platform subscriptions associated with
   * a library.
   *
   * Backend:
   *
   * GET
   * /api/platform/subscriptions/library/{libraryId}
   *
   * Current backend service returns subscriptions ordered by:
   *
   * createdAt DESC
   *
   * Therefore:
   *
   * response[0]
   *
   * is normally the newest subscription.
   *
   * This method is particularly important for onboarding restore:
   *
   * refresh
   * Save Draft & Exit
   * payment retry
   * payment already completed
   * Review-page restoration
   */
  getLibrarySubscriptions: async (
    libraryId,
  ) => {
    if (!libraryId) {
      throw new Error(
        "Library ID is required.",
      );
    }

    const response = await api.get(
      `/api/platform/subscriptions/library/${libraryId}`,
    );

    return Array.isArray(response.data)
      ? response.data
      : [];
  },


  // ===========================================================
  // GET LATEST LIBRARY SUBSCRIPTION
  // ===========================================================

  /**
   * Convenience frontend helper.
   *
   * This does NOT introduce a new backend endpoint.
   *
   * It uses:
   *
   * GET
   * /api/platform/subscriptions/library/{libraryId}
   *
   * and returns the latest relevant subscription.
   *
   * Priority:
   *
   * ACTIVE
   *      ↓
   * PENDING_PAYMENT
   *      ↓
   * newest subscription
   *
   * Useful during library onboarding restore.
   */
  getLatestSubscription: async (
    libraryId,
  ) => {
    const subscriptions =
      await platformSubscriptionApi.getLibrarySubscriptions(
        libraryId,
      );

    if (subscriptions.length === 0) {
      return null;
    }

    const activeSubscription =
      subscriptions.find(
        (subscription) =>
          subscription?.status === "ACTIVE",
      );

    if (activeSubscription) {
      return activeSubscription;
    }

    const pendingSubscription =
      subscriptions.find(
        (subscription) =>
          subscription?.status ===
          "PENDING_PAYMENT",
      );

    if (pendingSubscription) {
      return pendingSubscription;
    }

    return subscriptions[0];
  },


  // ===========================================================
  // RENEW PLATFORM SUBSCRIPTION
  // ===========================================================

  /**
   * Starts renewal for an ACTIVE or EXPIRED platform
   * subscription.
   *
   * Backend:
   *
   * PUT
   * /api/platform/subscriptions/{subscriptionId}/renew
   *
   * The backend may create a new payment transaction/order
   * and return its payment information.
   */
  renew: async (subscriptionId) => {
    if (!subscriptionId) {
      throw new Error(
        "Platform subscription ID is required.",
      );
    }

    const response = await api.put(
      `/api/platform/subscriptions/${subscriptionId}/renew`,
    );

    return response.data;
  },

  // ===========================================================
// CHANGE / UPGRADE PLATFORM PLAN
// ===========================================================

/**
 * Starts a platform plan change for an existing ACTIVE
 * subscription.
 *
 * Backend:
 *
 * POST
 * /api/platform/subscriptions/{subscriptionId}/change-plan
 *
 * Request:
 *
 * {
 *   platformPlanId: 3,
 *   autoRenew: true
 * }
 *
 * IMPORTANT:
 *
 * The current ACTIVE subscription must remain ACTIVE until
 * payment for the replacement plan succeeds.
 *
 * The backend should return payment information such as:
 *
 * subscriptionId
 * paymentTransactionId
 * gatewayOrderId
 * keyId
 * amount / totalAmount
 * currency
 */
changePlan: async (
  subscriptionId,
  payload,
) => {
  if (!subscriptionId) {
    throw new Error(
      "Current platform subscription ID is required.",
    );
  }

  if (!payload?.platformPlanId) {
    throw new Error(
      "New platform plan ID is required.",
    );
  }

  const response = await api.post(
    `/api/platform/subscriptions/${subscriptionId}/change-plan`,
    {
      platformPlanId: Number(
        payload.platformPlanId,
      ),

      autoRenew:
        payload.autoRenew !== false,
    },
  );

  return response.data;
},


  // ===========================================================
  // CANCEL PLATFORM SUBSCRIPTION
  // ===========================================================

  /**
   * Cancels an ACTIVE platform subscription.
   *
   * Backend:
   *
   * PUT
   * /api/platform/subscriptions/{subscriptionId}/cancel
   */
  cancel: async (subscriptionId) => {
    if (!subscriptionId) {
      throw new Error(
        "Platform subscription ID is required.",
      );
    }

    const response = await api.put(
      `/api/platform/subscriptions/${subscriptionId}/cancel`,
    );

    return response.data;
  },
};

export default platformSubscriptionApi;