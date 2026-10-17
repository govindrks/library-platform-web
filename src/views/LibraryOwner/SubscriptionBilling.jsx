import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  Select,
  alpha,
  useTheme,
} from "@mui/material";

import {
  ArrowForward,
  CalendarMonth,
  CheckCircle,
  Groups,
  History,
  Payment,
  TrendingUp,
  WorkspacePremium,
  AutoAwesome,
  Refresh,
  Bolt,
  ShieldOutlined,
  AccountBalanceWalletOutlined,
  Download as DownloadIcon,
  ReceiptLong as ReceiptLongIcon,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

import libraryApi from "../../api/libraryApi";
import libraryRegistrationApi from "../../api/libraryRegistrationApi";
import memberApi from "../../api/memberApi";
import platformPlanApi from "../../api/platformPlanApi";
import platformSubscriptionApi from "../../api/platformSubscriptionApi";
import platformPaymentApi from "../../api/platformPaymentApi";
import invoiceApi from "../../api/invoiceApi";

// ============================================================
// CONSTANTS
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

// ============================================================
// HELPERS
// ============================================================

function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

/*
 * Normalize the seat-matrix response exactly for capacity checks.
 *
 * During registration the plan is validated against seats already
 * persisted for every floor. Subscription & Billing must use the
 * same persisted backend seat count instead of relying on a UI
 * draft or dashboard approximation.
 */
function extractSeatList(matrixResponse) {
  if (!matrixResponse) {
    return [];
  }

  if (Array.isArray(matrixResponse)) {
    const grouped = matrixResponse.some((item) => Array.isArray(item?.seats));

    if (grouped) {
      return matrixResponse.flatMap((row) =>
        Array.isArray(row?.seats) ? row.seats : [],
      );
    }

    return matrixResponse;
  }

  if (Array.isArray(matrixResponse?.seats)) {
    return matrixResponse.seats;
  }

  if (Array.isArray(matrixResponse?.seatMatrix)) {
    const matrix = matrixResponse.seatMatrix;

    const grouped = matrix.some((item) => Array.isArray(item?.seats));

    if (grouped) {
      return matrix.flatMap((row) =>
        Array.isArray(row?.seats) ? row.seats : [],
      );
    }

    return matrix;
  }

  if (Array.isArray(matrixResponse?.rows)) {
    return matrixResponse.rows.flatMap((row) =>
      Array.isArray(row?.seats) ? row.seats : [],
    );
  }

  if (Array.isArray(matrixResponse?.content)) {
    const content = matrixResponse.content;

    const grouped = content.some((item) => Array.isArray(item?.seats));

    if (grouped) {
      return content.flatMap((row) =>
        Array.isArray(row?.seats) ? row.seats : [],
      );
    }

    return content;
  }

  return [];
}

function getStoredLibraryId() {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
}

function storeLibraryId(libraryId) {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
}

function formatCurrency(value, currency = "INR") {
  const amount = Number(value) || 0;

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `₹${amount.toLocaleString("en-IN")}`;
  }
}

function formatDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getBillingCycleLabel(billingCycle) {
  switch (billingCycle) {
    case "MONTHLY":
      return "month";

    case "QUARTERLY":
      return "quarter";

    case "HALF_YEARLY":
      return "6 months";

    case "YEARLY":
    case "ANNUAL":
      return "year";

    default:
      return billingCycle
        ? billingCycle.replaceAll("_", " ").toLowerCase()
        : "";
  }
}

function getSubscriptionStatusColor(status) {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "PENDING_PAYMENT":
      return "warning";

    case "FAILED":
    case "CANCELLED":
    case "EXPIRED":
    case "SUSPENDED":
      return "error";

    default:
      return "default";
  }
}

// ============================================================
// RAZORPAY CHECKOUT
// ============================================================

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true), {
        once: true,
      });

      existingScript.addEventListener("error", () => resolve(false), {
        once: true,
      });

      return;
    }

    const script = document.createElement("script");

    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.async = true;

    script.onload = () => resolve(true);

    script.onerror = () => resolve(false);

    document.body.appendChild(script);
  });

// ============================================================
// COMPONENT
// ============================================================

function SubscriptionBilling() {
  const theme = useTheme();

  const location = useLocation();

  const navigate = useNavigate();

  // ==========================================================
  // NOTIFICATION DEEP LINK
  // ==========================================================

  const fromNotification = Boolean(location.state?.fromNotification);

  const notificationReferenceId =
    location.state?.notificationReferenceId ?? null;

  const notificationReferenceType =
    location.state?.notificationReferenceType ?? null;

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  const [library, setLibrary] = useState(null);

  const [subscriptions, setSubscriptions] = useState([]);

  const [activeSubscription, setActiveSubscription] = useState(null);

  const [plans, setPlans] = useState([]);

  const [memberSummary, setMemberSummary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [notificationSuccess, setNotificationSuccess] = useState("");

  const [highlightedPaymentTransactionId, setHighlightedPaymentTransactionId] =
    useState(null);

  const [showAllHistory, setShowAllHistory] = useState(false);

  const [planDialogMode, setPlanDialogMode] = useState(null);

  const [selectedChangePlanId, setSelectedChangePlanId] = useState(null);

  const [librarySeatCount, setLibrarySeatCount] = useState(0);

  const [librarySeatCountLoading, setLibrarySeatCountLoading] = useState(false);

  const [librarySeatCountError, setLibrarySeatCountError] = useState("");

  const [planPaymentLoading, setPlanPaymentLoading] = useState(false);

  const [planPaymentMessage, setPlanPaymentMessage] = useState("");

  // ==========================================================
  // PLATFORM INVOICE VIEWER
  // ==========================================================

  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false);

  const [invoiceDialogLoading, setInvoiceDialogLoading] = useState(false);

  const [selectedBillingItem, setSelectedBillingItem] = useState(null);

  const [selectedPlatformInvoice, setSelectedPlatformInvoice] = useState(null);

  const [invoiceDownloadLoading, setInvoiceDownloadLoading] = useState(false);

  const [invoiceDialogError, setInvoiceDialogError] = useState("");

  // ==========================================================
  // LOAD OWNER LIBRARIES
  // ==========================================================

  const loadLibraries = useCallback(async () => {
    const response = await libraryApi.getMyLibraries();

    const list = normalizeListResponse(response);

    setLibraries(list);

    if (list.length === 0) {
      setLibraryId("");
      setLibrary(null);

      return null;
    }

    const storedLibraryId = getStoredLibraryId();

    if (storedLibraryId !== null) {
      const storedLibrary = list.find(
        (item) => Number(item?.id) === storedLibraryId,
      );

      if (storedLibrary) {
        setLibraryId(String(storedLibrary.id));

        setLibrary(storedLibrary);

        return storedLibrary;
      }
    }

    /*
     * Recovery for older accounts with duplicate empty DRAFT
     * libraries: prefer one with an ACTIVE platform subscription.
     */
    for (const item of list) {
      try {
        const active = await platformSubscriptionApi.getActiveSubscription(
          item.id,
        );

        if (active) {
          setLibraryId(String(item.id));

          setLibrary(item);

          storeLibraryId(item.id);

          return item;
        }
      } catch {
        // Continue to next library.
      }
    }

    const fallback = list[0];

    setLibraryId(String(fallback.id));

    setLibrary(fallback);

    storeLibraryId(fallback.id);

    return fallback;
  }, []);

  // ==========================================================
  // LOAD PERSISTED LIBRARY SEAT COUNT
  // ==========================================================
  //
  // This mirrors the registration plan-validation rule:
  //
  //   persisted library seats <= platformPlan.maxSeats
  //
  // Seats are counted from every persisted floor / seat matrix,
  // so changing a plan cannot accidentally move an existing
  // library onto a plan that supports fewer seats than it already
  // contains.
  // ==========================================================

  const loadLibrarySeatCount = useCallback(async (selectedLibraryId) => {
    if (!selectedLibraryId) {
      setLibrarySeatCount(0);
      setLibrarySeatCountError("");
      return 0;
    }

    try {
      setLibrarySeatCountLoading(true);

      setLibrarySeatCountError("");

      const floorsResponse =
        await libraryRegistrationApi.getFloors(selectedLibraryId);

      const floors = normalizeListResponse(floorsResponse);

      let totalSeats = 0;

      for (const floor of floors) {
        const floorId = floor?.id ?? floor?.floorId;

        if (!floorId) {
          continue;
        }

        try {
          const matrix = await libraryRegistrationApi.getSeatMatrix(
            selectedLibraryId,
            floorId,
          );

          totalSeats += extractSeatList(matrix).length;
        } catch (matrixError) {
          console.warn(
            `Unable to load seat matrix for floor ${floorId}:`,
            matrixError,
          );
        }
      }

      setLibrarySeatCount(totalSeats);

      return totalSeats;
    } catch (requestError) {
      console.error("Unable to load library seat count:", requestError);

      setLibrarySeatCount(0);

      setLibrarySeatCountError(
        getErrorMessage(
          requestError,
          "Unable to verify the library seat count against plan limits.",
        ),
      );

      return 0;
    } finally {
      setLibrarySeatCountLoading(false);
    }
  }, []);

  // ==========================================================
  // LOAD SUBSCRIPTION DATA
  // ==========================================================

  const loadSubscriptionData = useCallback(async (selectedLibraryId) => {
    if (!selectedLibraryId) {
      setSubscriptions([]);
      setActiveSubscription(null);
      setMemberSummary(null);

      return;
    }

    const [subscriptionResponse, planResponse, memberSummaryResponse] =
      await Promise.all([
        platformSubscriptionApi.getLibrarySubscriptions(selectedLibraryId),

        platformPlanApi.getActivePlans(),

        memberApi
          .getLibraryMemberSummary(selectedLibraryId)
          .catch((requestError) => {
            console.warn("Unable to load member summary:", requestError);
            return null;
          }),
      ]);

    const subscriptionList = normalizeListResponse(subscriptionResponse);

    const active =
      subscriptionList.find(
        (subscription) => subscription?.status === "ACTIVE",
      ) ?? null;

    setSubscriptions(subscriptionList);

    setActiveSubscription(active);

    setPlans(normalizeListResponse(planResponse));

    setMemberSummary(memberSummaryResponse ?? null);
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const selectedLibrary = await loadLibraries();

        if (mounted && selectedLibrary?.id) {
          await loadSubscriptionData(selectedLibrary.id);
        }
      } catch (requestError) {
        console.error("Failed to load subscription & billing:", requestError);

        if (mounted) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load subscription and billing.",
            ),
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [loadLibraries, loadSubscriptionData]);

  // ==========================================================
  // RELOAD WHEN LIBRARY CHANGES
  // ==========================================================

  useEffect(() => {
    const handleLibraryChanged = async (event) => {
      const nextLibraryId = Number(event?.detail?.libraryId);

      if (!Number.isFinite(nextLibraryId)) {
        return;
      }

      const nextLibrary = libraries.find(
        (item) => Number(item.id) === nextLibraryId,
      );

      setLibraryId(String(nextLibraryId));

      setLibrary(nextLibrary ?? null);

      storeLibraryId(nextLibraryId);

      try {
        setLoading(true);
        setError("");

        await loadSubscriptionData(nextLibraryId);
      } catch (requestError) {
        setError(
          getErrorMessage(
            requestError,
            "Unable to load subscription and billing.",
          ),
        );
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);

    return () =>
      window.removeEventListener("owner-library-changed", handleLibraryChanged);
  }, [libraries, loadSubscriptionData]);

  // ==========================================================
  // PLATFORM SUBSCRIPTION PAYMENT NOTIFICATION
  // ==========================================================

  useEffect(() => {
    if (
      loading ||
      !fromNotification ||
      notificationReferenceType !== "PLATFORM_SUBSCRIPTION_PAYMENT" ||
      !notificationReferenceId ||
      libraries.length === 0
    ) {
      return;
    }

    let cancelled = false;

    const resolveNotificationTarget = async () => {
      const targetPaymentTransactionId = Number(notificationReferenceId);

      if (!Number.isFinite(targetPaymentTransactionId)) {
        if (!cancelled) {
          setError(
            "Invalid platform subscription payment notification reference.",
          );

          navigate(location.pathname, {
            replace: true,
            state: null,
          });
        }

        return;
      }

      /*
       * Search every owner library because a notification may refer
       * to a payment belonging to a library other than the currently
       * selected owner library.
       */
      for (const ownerLibrary of libraries) {
        try {
          const response =
            await platformSubscriptionApi.getLibrarySubscriptions(
              ownerLibrary.id,
            );

          const subscriptionList = normalizeListResponse(response);

          const matchingSubscription = subscriptionList.find(
            (subscription) =>
              Number(subscription?.paymentTransactionId) ===
              targetPaymentTransactionId,
          );

          if (!matchingSubscription) {
            continue;
          }

          if (cancelled) {
            return;
          }

          const targetLibraryId = Number(ownerLibrary.id);

          setLibraryId(String(targetLibraryId));

          setLibrary(ownerLibrary);

          storeLibraryId(targetLibraryId);

          /*
           * Make sure the matched historical transaction is visible
           * even when it is outside the default five-row view.
           */
          setShowAllHistory(true);

          await loadSubscriptionData(targetLibraryId);

          if (cancelled) {
            return;
          }

          setHighlightedPaymentTransactionId(targetPaymentTransactionId);

          setNotificationSuccess(
            `Platform payment #${targetPaymentTransactionId} opened from notification.`,
          );

          /*
           * Clear the notification navigation state after resolving.
           * This allows future notification clicks to this mounted
           * route to be handled independently.
           */
          navigate(location.pathname, {
            replace: true,
            state: null,
          });

          return;
        } catch (notificationError) {
          console.debug(
            "Platform payment notification lookup skipped library:",
            ownerLibrary?.id,
            notificationError,
          );
        }
      }

      if (!cancelled) {
        setError(
          `Platform payment #${targetPaymentTransactionId} could not be found in your billing history.`,
        );

        navigate(location.pathname, {
          replace: true,
          state: null,
        });
      }
    };

    resolveNotificationTarget();

    return () => {
      cancelled = true;
    };
  }, [
    loading,
    fromNotification,
    notificationReferenceId,
    notificationReferenceType,
    libraries,
    loadSubscriptionData,
    location.pathname,
    navigate,
  ]);

  // ==========================================================
  // SCROLL TO HIGHLIGHTED PLATFORM PAYMENT
  // ==========================================================

  useEffect(() => {
    if (!highlightedPaymentTransactionId) {
      return;
    }

    const targetExists = subscriptions.some(
      (subscription) =>
        Number(subscription?.paymentTransactionId) ===
        Number(highlightedPaymentTransactionId),
    );

    if (!targetExists) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      document
        .getElementById(`platform-payment-${highlightedPaymentTransactionId}`)
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedPaymentTransactionId, subscriptions, showAllHistory]);

  // ==========================================================
  // CURRENT PLAN
  // ==========================================================

  const currentPlan = useMemo(() => {
    if (!activeSubscription) {
      return null;
    }

    return (
      plans.find(
        (plan) =>
          Number(plan?.id ?? plan?.planId) ===
          Number(activeSubscription?.platformPlanId),
      ) ?? null
    );
  }, [plans, activeSubscription]);

  const planName =
    activeSubscription?.platformPlanName ?? currentPlan?.name ?? "-";

  const planPrice = Number(
    currentPlan?.price ??
      activeSubscription?.planAmount ??
      activeSubscription?.amount ??
      0,
  );

  const currency =
    activeSubscription?.currency ?? currentPlan?.currency ?? "INR";

  const billingCycle = currentPlan?.billingCycle ?? null;

  const maxMembers = Number(
    currentPlan?.maxStudents ?? currentPlan?.maxMembers ?? 0,
  );

  // Member capacity must use the same owner-member source of truth as
  // the Members page. Dashboard statistics can lag or represent a
  // different metric, which caused Members = 1 while Billing = 0.
  const currentMembers = Number(memberSummary?.activeMembers ?? 0);

  const usagePercentage =
    maxMembers > 0 ? Math.min((currentMembers / maxMembers) * 100, 100) : 0;

  const remainingMembers =
    maxMembers > 0 ? Math.max(maxMembers - currentMembers, 0) : null;

  const usageSeverity =
    usagePercentage >= 100
      ? "error"
      : usagePercentage >= 80
        ? "warning"
        : "success";

  const nextBillingDate = activeSubscription?.endDate ?? "-";

  // ==========================================================
  // HISTORY
  // ==========================================================

  const billingHistory = useMemo(
    () =>
      subscriptions
        .filter((subscription) => subscription?.paymentTransactionId != null)
        .map((subscription) => ({
          id: subscription.subscriptionId,
          date: subscription.startDate ?? subscription.endDate,
          description: subscription.platformPlanName ?? "LibraryHub Plan",
          amount: Number(subscription.amount ?? 0),
          currency: subscription.currency ?? "INR",
          status: subscription.status,
          paymentTransactionId: subscription.paymentTransactionId,
        })),
    [subscriptions],
  );

  const displayedHistory = showAllHistory
    ? billingHistory
    : billingHistory.slice(0, 5);

  // ==========================================================
  // RESTORE SEAT CAPACITY FOR PLAN VALIDATION
  // ==========================================================

  useEffect(() => {
    if (!libraryId) {
      setLibrarySeatCount(0);
      return;
    }

    loadLibrarySeatCount(Number(libraryId));
  }, [libraryId, loadLibrarySeatCount]);

  // ==========================================================
  // AVAILABLE PLATFORM PLANS
  // ==========================================================
  //
  // These are the SAME active plan records configured by the
  // platform admin and used during library registration.
  //
  // Subscription & Billing reuses those records directly rather
  // than opening the admin PlatformPlans screen.
  // ==========================================================

  const availablePlans = useMemo(
    () => plans.filter((plan) => plan?.active !== false),
    [plans],
  );

  const selectedChangePlan = useMemo(
    () =>
      availablePlans.find(
        (plan) =>
          Number(plan?.id ?? plan?.planId) === Number(selectedChangePlanId),
      ) ?? null,
    [availablePlans, selectedChangePlanId],
  );

  const openPlanDialog = (mode) => {
    setPlanDialogMode(mode);

    setSelectedChangePlanId(null);
  };

  const closePlanDialog = () => {
    setPlanDialogMode(null);

    setSelectedChangePlanId(null);
  };

  const getPlanId = (plan) => Number(plan?.id ?? plan?.planId);

  const isCurrentPlan = (plan) =>
    getPlanId(plan) ===
    Number(
      activeSubscription?.platformPlanId ??
        currentPlan?.id ??
        currentPlan?.planId,
    );

  const getPlanSeatLimit = (plan) => {
    const rawLimit = plan?.maxSeats;

    if (rawLimit === null || rawLimit === undefined || rawLimit === "") {
      return null;
    }

    const limit = Number(rawLimit);

    return Number.isFinite(limit) ? limit : null;
  };

  const getPlanSeatEligibility = (plan) => {
    const maxSeats = getPlanSeatLimit(plan);

    /*
     * null means the backend plan does not define a seat cap.
     */
    if (maxSeats === null) {
      return {
        eligible: true,
        maxSeats: null,
        usedSeats: librarySeatCount,
        remainingSeats: null,
      };
    }

    const usedSeats = Number(librarySeatCount) || 0;

    return {
      eligible: usedSeats <= maxSeats,

      maxSeats,

      usedSeats,

      remainingSeats: maxSeats - usedSeats,
    };
  };

  const getPlanActionLabel = (plan) => {
    if (isCurrentPlan(plan)) {
      return "Current Plan";
    }

    const currentPrice = Number(
      currentPlan?.price ?? activeSubscription?.amount ?? 0,
    );

    const nextPrice = Number(plan?.price ?? 0);

    if (nextPrice > currentPrice) {
      return `Upgrade to ${plan?.name ?? "Plan"}`;
    }

    if (nextPrice < currentPrice) {
      return `Change to ${plan?.name ?? "Plan"}`;
    }

    return `Select ${plan?.name ?? "Plan"}`;
  };

  const handlePreparePlanChange = (plan) => {
    if (isCurrentPlan(plan)) {
      return;
    }

    const seatEligibility = getPlanSeatEligibility(plan);

    if (!seatEligibility.eligible) {
      setError(
        `${plan?.name ?? "This plan"} supports a maximum of ` +
          `${seatEligibility.maxSeats} seats, but this library currently has ` +
          `${seatEligibility.usedSeats} persisted seats. ` +
          "Choose a plan with a higher seat limit or reduce the library seat count first.",
      );

      return;
    }

    setError("");

    setSelectedChangePlanId(getPlanId(plan));

    setPlanDialogMode("change");
  };

  // ==========================================================
  // OPEN RAZORPAY FOR PLAN CHANGE
  // ==========================================================

  const openPlanChangeCheckout = async (payment, targetPlan) => {
    const loaded = await loadRazorpayScript();

    if (!loaded || !window.Razorpay) {
      throw new Error(
        "Unable to load Razorpay checkout. Please check your internet connection.",
      );
    }

    const keyId = payment?.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!keyId) {
      throw new Error("Razorpay key ID is not configured.");
    }

    const transactionId =
      payment?.paymentTransactionId ?? payment?.transactionId;

    const gatewayOrderId = payment?.gatewayOrderId;

    const amount = Number(
      payment?.totalAmount ?? payment?.amount ?? targetPlan?.price ?? 0,
    );

    const currency = payment?.currency ?? targetPlan?.currency ?? "INR";

    if (!transactionId) {
      throw new Error("Payment transaction ID was not returned.");
    }

    if (!gatewayOrderId) {
      throw new Error("Razorpay order ID was not returned.");
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid platform subscription amount.");
    }

    return new Promise((resolve, reject) => {
      let settled = false;

      const options = {
        key: keyId,

        amount: Math.round(amount * 100),

        currency,

        name: "LibraryHub",

        description: `${targetPlan?.name ?? "LibraryHub"} plan subscription`,

        order_id: gatewayOrderId,

        notes: {
          libraryId: String(libraryId ?? ""),

          platformPlanId: String(getPlanId(targetPlan) ?? ""),

          previousSubscriptionId: String(
            activeSubscription?.subscriptionId ?? "",
          ),
        },

        handler: async (razorpayResponse) => {
          try {
            const verification = await platformPaymentApi.verifyPayment({
              transactionId,

              gatewayOrderId: razorpayResponse.razorpay_order_id,

              gatewayPaymentId: razorpayResponse.razorpay_payment_id,

              gatewaySignature: razorpayResponse.razorpay_signature,
            });

            if (verification?.status !== "SUCCESS") {
              throw new Error(
                verification?.message || "Payment verification failed.",
              );
            }

            settled = true;

            resolve(verification);
          } catch (verificationError) {
            settled = true;

            reject(verificationError);
          }
        },

        modal: {
          ondismiss: () => {
            if (settled) {
              return;
            }

            settled = true;

            const error = new Error("Payment was cancelled before completion.");

            error.code = "PAYMENT_CANCELLED";

            reject(error);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", (response) => {
        if (settled) {
          return;
        }

        settled = true;

        const error = new Error(
          response?.error?.description || "Razorpay payment failed.",
        );

        error.code = "PAYMENT_FAILED";

        reject(error);
      });

      razorpay.open();
    });
  };

  // ==========================================================
  // CONTINUE TO PAYMENT
  // ==========================================================

  const handleContinuePlanPayment = async () => {
    if (!activeSubscription?.subscriptionId) {
      setError("Current active subscription is unavailable.");

      return;
    }

    if (!selectedChangePlan) {
      setError("Please select a new LibraryHub plan.");

      return;
    }

    const seatEligibility = getPlanSeatEligibility(selectedChangePlan);

    if (!seatEligibility.eligible) {
      setError(
        `${selectedChangePlan.name} supports a maximum of ` +
          `${seatEligibility.maxSeats} seats, but this library currently has ` +
          `${seatEligibility.usedSeats} seats.`,
      );

      return;
    }

    try {
      setPlanPaymentLoading(true);

      setError("");

      setPlanPaymentMessage("Creating payment order...");

      /*
       * Create a new PENDING_PAYMENT subscription/order for
       * the selected plan. The existing ACTIVE subscription
       * must remain active until this payment succeeds.
       */
      const payment = await platformSubscriptionApi.changePlan(
        activeSubscription.subscriptionId,
        {
          platformPlanId: getPlanId(selectedChangePlan),

          autoRenew: true,
        },
      );

      if (!payment) {
        throw new Error("Plan-change payment response was not returned.");
      }

      setPlanPaymentMessage("Complete payment in Razorpay.");

      await openPlanChangeCheckout(payment, selectedChangePlan);

      setPlanPaymentMessage(
        "Payment successful. Refreshing your subscription...",
      );

      /*
       * PaymentCompletionProcessor activates the new platform
       * subscription after successful verification.
       *
       * Reload from backend rather than mutating current plan
       * locally.
       */
      await loadSubscriptionData(Number(libraryId));

      closePlanDialog();

      setPlanPaymentMessage("Plan changed successfully.");
    } catch (requestError) {
      console.error("Plan change payment failed:", requestError);

      if (requestError?.code === "PAYMENT_CANCELLED") {
        setPlanPaymentMessage(
          "Payment was cancelled. Your existing plan remains unchanged.",
        );
      } else {
        setError(
          getErrorMessage(
            requestError,
            "Unable to complete the plan change payment.",
          ),
        );

        setPlanPaymentMessage("");
      }
    } finally {
      setPlanPaymentLoading(false);
    }
  };

  // ==========================================================
  // PLATFORM BILLING INVOICE VIEWER
  // ==========================================================
  //
  // View Invoice:
  //
  // 1. Load library invoices.
  // 2. Match invoice by paymentTransactionId.
  // 3. If a successful historical payment has no invoice yet,
  //    request backend invoice generation.
  // 4. Display invoice details in this page.
  //
  // Download:
  //
  // invoiceApi.downloadInvoice(...)
  //      ->
  // OwnerPaymentInvoiceController
  //      ->
  // PaymentInvoiceService.downloadForLibrary(...)
  //      ->
  // PdfInvoiceGeneratorImpl when regeneration is required.
  // ==========================================================

  const findPlatformInvoiceByPayment = useCallback(
    async (paymentTransactionId, allowGenerate = true) => {
      if (!libraryId) {
        throw new Error("Library is not selected.");
      }

      const transactionId = Number(paymentTransactionId);

      if (!Number.isFinite(transactionId)) {
        throw new Error("Payment transaction ID is unavailable.");
      }

      let invoiceList = normalizeListResponse(
        await invoiceApi.getLibraryInvoices(Number(libraryId)),
      );

      let invoice =
        invoiceList.find(
          (candidate) =>
            Number(candidate?.paymentTransactionId) === transactionId,
        ) ?? null;

      /*
       * Older successful platform payments may predate automatic
       * invoice generation. Generate once, then reload.
       *
       * If the payment is not SUCCESS, backend validation will
       * reject generation and the caller will show the error.
       */
      if (!invoice && allowGenerate) {
        await invoiceApi.generateInvoice(transactionId);

        invoiceList = normalizeListResponse(
          await invoiceApi.getLibraryInvoices(Number(libraryId)),
        );

        invoice =
          invoiceList.find(
            (candidate) =>
              Number(candidate?.paymentTransactionId) === transactionId,
          ) ?? null;
      }

      return invoice;
    },
    [libraryId],
  );

  const handleViewPlatformInvoice = async (item) => {
    if (!item?.paymentTransactionId) {
      setError("This subscription does not have a payment transaction.");

      return;
    }

    try {
      setSelectedBillingItem(item);

      setSelectedPlatformInvoice(null);

      setInvoiceDialogError("");

      setInvoiceDialogOpen(true);

      setInvoiceDialogLoading(true);

      const invoice = await findPlatformInvoiceByPayment(
        item.paymentTransactionId,
        true,
      );

      if (!invoice) {
        throw new Error(
          `Invoice was not found for payment #${item.paymentTransactionId}.`,
        );
      }

      /*
       * Load owner-scoped invoice details so the dialog displays
       * the server's latest invoice record.
       */
      const details = await invoiceApi.getInvoiceById(
        Number(libraryId),
        invoice.id,
      );

      setSelectedPlatformInvoice(details ?? invoice);
    } catch (requestError) {
      console.error("Failed to load platform invoice:", requestError);

      setInvoiceDialogError(
        getErrorMessage(requestError, "Unable to load this platform invoice."),
      );
    } finally {
      setInvoiceDialogLoading(false);
    }
  };

  const handleDownloadPlatformInvoice = async () => {
    const invoice = selectedPlatformInvoice;

    if (!invoice?.id) {
      setInvoiceDialogError("Invoice is unavailable for download.");

      return;
    }

    try {
      setInvoiceDownloadLoading(true);

      setInvoiceDialogError("");

      await invoiceApi.downloadInvoice(
        Number(libraryId),
        invoice.id,
        invoice.invoiceNumber,
      );
    } catch (requestError) {
      console.error("Failed to download platform invoice PDF:", requestError);

      setInvoiceDialogError(
        getErrorMessage(requestError, "Unable to download the invoice PDF."),
      );
    } finally {
      setInvoiceDownloadLoading(false);
    }
  };

  const closeInvoiceDialog = () => {
    if (invoiceDownloadLoading) {
      return;
    }

    setInvoiceDialogOpen(false);

    setSelectedBillingItem(null);

    setSelectedPlatformInvoice(null);

    setInvoiceDialogError("");
  };

  // ==========================================================
  // PREMIUM PAGE INTERACTIONS
  // ==========================================================

  const handleLibrarySelectionChange = async (event) => {
    const nextLibraryId = Number(event.target.value);

    if (!Number.isFinite(nextLibraryId)) {
      return;
    }

    const nextLibrary =
      libraries.find((item) => Number(item?.id) === nextLibraryId) ?? null;

    setLibraryId(String(nextLibraryId));
    setLibrary(nextLibrary);
    storeLibraryId(nextLibraryId);
    setHighlightedPaymentTransactionId(null);
    setShowAllHistory(false);
    setError("");

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: { libraryId: nextLibraryId },
      }),
    );
  };

  const handleRefreshBilling = async () => {
    if (!libraryId || refreshing) {
      return;
    }

    try {
      setRefreshing(true);
      setError("");

      await Promise.all([
        loadSubscriptionData(Number(libraryId)),
        loadLibrarySeatCount(Number(libraryId)),
      ]);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to refresh subscription and billing data.",
        ),
      );
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Paper
        variant="outlined"
        sx={{
          minHeight: 420,
          borderRadius: 4,
          display: "grid",
          placeItems: "center",
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background: `linear-gradient(145deg, #fff 0%, ${alpha(
            theme.palette.primary.main,
            0.035,
          )} 100%)`,
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 58,
              height: 58,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <CircularProgress size={28} />
          </Box>

          <Box textAlign="center">
            <Typography fontWeight={850}>
              Loading your LibraryHub plan
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.35}>
              Syncing subscription, usage and billing history...
            </Typography>
          </Box>
        </Stack>
      </Paper>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box
      sx={{
        pb: 4,
        "& .MuiButton-root": {
          textTransform: "none",
          fontWeight: 800,
        },
        "& .MuiCard-root": {
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
        },
        "& .MuiTableHead-root .MuiTableCell-root": {
          bgcolor: "#FAFBFD",
          color: "text.secondary",
          fontSize: 12,
          fontWeight: 850,
          textTransform: "uppercase",
          letterSpacing: 0.45,
        },
      }}
    >
      {/* PREMIUM HEADER */}
      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          overflow: "hidden",
          p: { xs: 2.5, md: 3.2 },
          mb: 3,
          borderRadius: 4,
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background: `linear-gradient(118deg, ${alpha(
            theme.palette.primary.main,
            0.08,
          )} 0%, #fff 52%, ${alpha(theme.palette.info.main, 0.045)} 100%)`,
          boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
          "&::after": {
            content: '""',
            position: "absolute",
            width: 210,
            height: 210,
            borderRadius: "50%",
            right: -70,
            top: -110,
            bgcolor: alpha(theme.palette.primary.main, 0.055),
          },
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          spacing={2.5}
          position="relative"
          zIndex={1}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "common.white",
                boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.24)}`,
                flexShrink: 0,
              }}
            >
              <WorkspacePremium sx={{ fontSize: 29 }} />
            </Box>

            <Box minWidth={0}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  variant="h4"
                  fontWeight={900}
                  sx={{ letterSpacing: -0.7 }}
                >
                  Subscription & Billing
                </Typography>

                <Chip
                  icon={<AutoAwesome sx={{ fontSize: 16 }} />}
                  label="LibraryHub Platform"
                  size="small"
                  sx={{
                    fontWeight: 800,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                />
              </Stack>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Manage your plan, monitor capacity, compare upgrades and keep
                billing records in one workspace.
              </Typography>

              {activeSubscription && (
                <Stack
                  direction="row"
                  spacing={1}
                  mt={1.2}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Chip
                    size="small"
                    icon={<CheckCircle />}
                    label={`${planName} · Active`}
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 800 }}
                  />
                  <Chip
                    size="small"
                    label={`${Math.round(usagePercentage)}% member capacity used`}
                    variant="outlined"
                    sx={{ fontWeight: 750 }}
                  />
                </Stack>
              )}
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <FormControl size="small" sx={{ minWidth: { sm: 220 } }}>
              <InputLabel>Library</InputLabel>
              <Select
                value={libraryId}
                label="Library"
                disabled={libraries.length === 0 || refreshing}
                onChange={handleLibrarySelectionChange}
                sx={{ borderRadius: 2.2, bgcolor: "background.paper" }}
              >
                {libraries.map((item) => (
                  <MenuItem key={item.id} value={String(item.id)}>
                    {item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Refresh subscription, usage and billing">
              <span>
                <IconButton
                  onClick={handleRefreshBilling}
                  disabled={!libraryId || refreshing}
                  sx={{
                    width: 40,
                    height: 40,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2.2,
                    bgcolor: "background.paper",
                  }}
                >
                  {refreshing ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Refresh fontSize="small" />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Button
              variant="outlined"
              startIcon={<History />}
              onClick={() => setShowAllHistory((previous) => !previous)}
              sx={{ borderRadius: 2.2, fontWeight: 800, whiteSpace: "nowrap" }}
            >
              {showAllHistory ? "Recent Billing" : "Billing History"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {notificationSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 3, borderRadius: 2.5 }}
          onClose={() => setNotificationSuccess("")}
        >
          {notificationSuccess}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: 2.5 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {!activeSubscription && (
        <Alert
          severity="warning"
          sx={{ mb: 3, borderRadius: 2.5 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate("/platform-plans")}
            >
              View Plans
            </Button>
          }
        >
          No active LibraryHub platform subscription was found for this library.
        </Alert>
      )}

      {activeSubscription && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{ mb: 3, borderRadius: 2.5 }}
        >
          Your LibraryHub subscription is active.
          {nextBillingDate !== "-" && (
            <>
              {" "}
              Current plan period ends on{" "}
              <strong>{formatDate(nextBillingDate)}</strong>.
            </>
          )}
        </Alert>
      )}

      {/* CURRENT PLAN + USAGE */}
      <Grid container spacing={3} mb={3}>
        <Grid
          size={{
            xs: 12,
            md: 7,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              borderRadius: 4,
              borderColor: activeSubscription
                ? alpha(theme.palette.primary.main, 0.22)
                : "divider",
              background: `linear-gradient(145deg, #fff 0%, ${alpha(
                theme.palette.primary.main,
                0.035,
              )} 100%)`,
              boxShadow: "0 14px 38px rgba(15,23,42,0.05)",
              transition: "transform .2s ease, box-shadow .2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 18px 44px rgba(15,23,42,0.08)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "flex-start",
                    sm: "center",
                  }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "primary.light",
                        color: "primary.main",
                      }}
                    >
                      <WorkspacePremium />
                    </Box>

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Current LibraryHub Plan
                      </Typography>

                      <Typography variant="h5" fontWeight={800}>
                        {planName}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    label={activeSubscription?.status ?? "NO ACTIVE PLAN"}
                    color={getSubscriptionStatusColor(
                      activeSubscription?.status,
                    )}
                    size="small"
                  />
                </Stack>

                <Divider />

                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Member Capacity
                    </Typography>

                    <Typography variant="h6" fontWeight={700}>
                      {maxMembers > 0
                        ? `1 - ${maxMembers.toLocaleString("en-IN")}`
                        : "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Plan Price
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {formatCurrency(planPrice, currency)}
                      {billingCycle &&
                        ` / ${getBillingCycleLabel(billingCycle)}`}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Current Period End
                    </Typography>

                    <Typography variant="h6" fontWeight={700}>
                      {formatDate(nextBillingDate)}
                    </Typography>
                  </Grid>
                </Grid>

                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                >
                  <Button
                    variant="contained"
                    startIcon={<TrendingUp />}
                    sx={{ borderRadius: 2.2, px: 2.2, fontWeight: 800 }}
                    endIcon={<ArrowForward />}
                    disabled={!libraryId || !activeSubscription}
                    onClick={() => openPlanDialog("change")}
                  >
                    Change / Upgrade Plan
                  </Button>

                  <Button
                    variant="outlined"
                    sx={{ borderRadius: 2.2, fontWeight: 800 }}
                    disabled={!libraryId}
                    onClick={() => openPlanDialog("compare")}
                  >
                    Compare Plans
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 5,
          }}
        >
          <Card
            variant="outlined"
            sx={{
              height: "100%",
              borderRadius: 4,
              borderColor: alpha(theme.palette.success.main, 0.16),
              boxShadow: "0 14px 38px rgba(15,23,42,0.045)",
              transition: "transform .2s ease, box-shadow .2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 18px 44px rgba(15,23,42,0.075)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Groups color="primary" />

                    <Typography variant="h6" fontWeight={700}>
                      Member Usage
                    </Typography>
                  </Stack>

                  <Button
                    size="small"
                    endIcon={<ArrowForward />}
                    onClick={() => navigate("/owner/members")}
                  >
                    View Members
                  </Button>
                </Stack>

                <Typography variant="h4" fontWeight={800}>
                  {currentMembers}
                  {maxMembers > 0 ? ` / ${maxMembers}` : ""}
                  <Typography
                    component="span"
                    variant="body1"
                    sx={{
                      ml: 1,
                      fontWeight: 600,
                    }}
                  >
                    Members
                  </Typography>
                </Typography>

                <Box>
                  <LinearProgress
                    variant="determinate"
                    value={usagePercentage}
                    color={
                      usageSeverity === "error"
                        ? "error"
                        : usageSeverity === "warning"
                          ? "warning"
                          : "success"
                    }
                    sx={{
                      height: 12,
                      borderRadius: 6,
                    }}
                  />

                  <Stack direction="row" justifyContent="space-between" mt={1}>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(usagePercentage)}% used
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {remainingMembers != null
                        ? `${remainingMembers} member slots remaining`
                        : "Capacity unavailable"}
                    </Typography>
                  </Stack>
                </Box>

                <Alert severity={usageSeverity}>
                  {usagePercentage >= 100
                    ? "Member capacity reached. Upgrade the plan or reduce active memberships."
                    : usagePercentage >= 80
                      ? `You're using ${Math.round(
                          usagePercentage,
                        )}% of your member capacity.`
                      : remainingMembers != null
                        ? `You can add ${remainingMembers} more active members on your current plan.`
                        : "Member capacity information is unavailable for this plan."}
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* USAGE STATUS */}
      {maxMembers > 0 && (
        <Grid container spacing={2} mb={3}>
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: usagePercentage < 80 ? "success.light" : "divider",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle color="success" />

                    <Typography fontWeight={700}>Normal Usage</Typography>
                  </Stack>

                  <Typography variant="h5" fontWeight={800}>
                    {currentMembers} / {maxMembers}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(usagePercentage, 79)}
                    color="success"
                    sx={{
                      height: 9,
                      borderRadius: 5,
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor:
                  usagePercentage >= 80 && usagePercentage < 100
                    ? "warning.main"
                    : "divider",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography fontWeight={700} color="warning.main">
                    80% Usage Warning
                  </Typography>

                  <Typography variant="h5" fontWeight={800}>
                    {currentMembers} / {maxMembers}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(usagePercentage, 100)}
                    color="warning"
                    sx={{
                      height: 9,
                      borderRadius: 5,
                    }}
                  />

                  {usagePercentage >= 80 && usagePercentage < 100 && (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={() => openPlanDialog("change")}
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
                border: "1px solid",
                borderColor: usagePercentage >= 100 ? "error.main" : "divider",
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography fontWeight={700} color="error.main">
                    Capacity Reached
                  </Typography>

                  <Typography variant="h5" fontWeight={800}>
                    {currentMembers} / {maxMembers}
                  </Typography>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(usagePercentage, 100)}
                    color="error"
                    sx={{
                      height: 9,
                      borderRadius: 5,
                    }}
                  />

                  {usagePercentage >= 100 && (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => navigate("/platform-plans")}
                    >
                      Upgrade Plan
                    </Button>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* QUICK BILLING INFO */}
      <Grid container spacing={3} mb={3}>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <AccountBalanceWalletOutlined color="primary" />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Platform Plan Billing
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    {formatCurrency(planPrice, currency)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <CalendarMonth color="primary" />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Current Period End
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    {formatDate(nextBillingDate)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Bolt color="primary" />

                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Payment Gateway
                  </Typography>

                  <Typography variant="body1" fontWeight={700}>
                    Razorpay
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* PLAN FEATURES / LIMITS */}
      {currentPlan && (
        <Card
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 3.5,
            boxShadow: "0 10px 30px rgba(15,23,42,0.035)",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.2} alignItems="center" mb={0.5}>
              <ShieldOutlined color="primary" />
              <Typography variant="h6" fontWeight={850}>
                Included in your {currentPlan.name} plan
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" mb={2}>
              Current LibraryHub platform limits and enabled features.
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Max Libraries
                </Typography>

                <Typography fontWeight={700}>
                  {currentPlan.maxLibraries ?? "-"}
                </Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Max Members
                </Typography>

                <Typography fontWeight={700}>
                  {currentPlan.maxStudents ?? currentPlan.maxMembers ?? "-"}
                </Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Max Seats
                </Typography>

                <Typography fontWeight={700}>
                  {currentPlan.maxSeats ?? "-"}
                </Typography>
              </Grid>

              {[
                ["Analytics", currentPlan.analyticsEnabled],
                ["Reports", currentPlan.reportsEnabled],
                ["API Access", currentPlan.apiAccess],
                ["Custom Branding", currentPlan.customBranding],
                ["Priority Support", currentPlan.prioritySupport],
              ].map(([label, enabled]) => (
                <Grid
                  key={label}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircle
                      sx={{
                        fontSize: 19,
                        color: enabled ? "success.main" : "text.disabled",
                      }}
                    />

                    <Typography variant="body2">
                      {label}: {enabled ? "Enabled" : "Not included"}
                    </Typography>
                  </Stack>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* BILLING HISTORY */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3.5,
          overflow: "hidden",
          boxShadow: "0 12px 34px rgba(15,23,42,0.045)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            spacing={2}
            mb={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={850}>
                Platform Billing History
              </Typography>

              <Typography variant="body2" color="text.secondary">
                LibraryHub platform subscription transactions only.
                Student/member payments are shown in Payments.
              </Typography>
            </Box>

            <Button
              size="small"
              onClick={() => setShowAllHistory((previous) => !previous)}
            >
              {showAllHistory ? "Show Less" : "View All"}
            </Button>
          </Stack>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Subscription</TableCell>

                  <TableCell>Date</TableCell>

                  <TableCell>Plan</TableCell>

                  <TableCell>Payment</TableCell>

                  <TableCell align="right">Amount</TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell align="right">Invoice</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayedHistory.map((item) => (
                  <TableRow
                    id={`platform-payment-${item.paymentTransactionId}`}
                    key={item.id}
                    hover
                    sx={{
                      backgroundColor:
                        String(item.paymentTransactionId) ===
                        String(highlightedPaymentTransactionId)
                          ? "rgba(79, 70, 229, 0.06)"
                          : "inherit",

                      outline:
                        String(item.paymentTransactionId) ===
                        String(highlightedPaymentTransactionId)
                          ? "2px solid"
                          : "none",

                      outlineColor: "primary.main",

                      outlineOffset: "-2px",

                      transition: "all 0.25s ease",
                    }}
                  >
                    <TableCell>#{item.id}</TableCell>

                    <TableCell>{formatDate(item.date)}</TableCell>

                    <TableCell>{item.description}</TableCell>

                    <TableCell>
                      {item.paymentTransactionId
                        ? `#${item.paymentTransactionId}`
                        : "-"}
                    </TableCell>

                    <TableCell align="right">
                      {formatCurrency(item.amount, item.currency)}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={item.status ?? "UNKNOWN"}
                        color={getSubscriptionStatusColor(item.status)}
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<ReceiptLongIcon />}
                        disabled={!item.paymentTransactionId}
                        onClick={() => handleViewPlatformInvoice(item)}
                      >
                        View Invoice
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {displayedHistory.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      align="center"
                      sx={{
                        py: 5,
                      }}
                    >
                      <Typography color="text.secondary">
                        No platform billing history found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* =====================================================
          COMPARE / CHANGE PLAN DIALOG

          Uses the same active platform plan records that are
          configured by the platform admin and shown during
          library registration.
         ===================================================== */}
      <Dialog
        open={planDialogMode !== null}
        onClose={closePlanDialog}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>
          {planDialogMode === "compare"
            ? "Compare LibraryHub Plans"
            : "Change / Upgrade LibraryHub Plan"}
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {planDialogMode === "compare"
              ? "Compare all active plans currently offered by LibraryHub. Your existing subscription will not change until you explicitly choose another plan."
              : "Choose another active LibraryHub plan. Your current plan is highlighted below."}
          </Typography>

          {librarySeatCountLoading ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Verifying the current library seat count before allowing a plan
              change...
            </Alert>
          ) : librarySeatCountError ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {librarySeatCountError}
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              This library currently has <strong>{librarySeatCount}</strong>{" "}
              persisted seat
              {librarySeatCount === 1 ? "" : "s"}. A plan can be selected only
              when its seat limit is at least this amount.
            </Alert>
          )}

          <Grid container spacing={2}>
            {availablePlans.map((plan) => {
              const current = isCurrentPlan(plan);

              const selected = Number(selectedChangePlanId) === getPlanId(plan);

              const seatEligibility = getPlanSeatEligibility(plan);

              return (
                <Grid
                  key={getPlanId(plan)}
                  size={{
                    xs: 12,
                    md: 6,
                    lg: 4,
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      border: "2px solid",
                      borderColor: current
                        ? "primary.main"
                        : selected
                          ? "success.main"
                          : "divider",
                      borderRadius: 3,
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 2.5,
                      }}
                    >
                      <Stack spacing={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="flex-start"
                          spacing={1}
                        >
                          <Box>
                            <Typography variant="h6" fontWeight={800}>
                              {plan?.name ?? "LibraryHub Plan"}
                            </Typography>

                            {plan?.description && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                              >
                                {plan.description}
                              </Typography>
                            )}
                          </Box>

                          {current && (
                            <Chip
                              label="CURRENT"
                              color="primary"
                              size="small"
                            />
                          )}
                        </Stack>

                        <Box>
                          <Typography
                            variant="h5"
                            fontWeight={800}
                            color="primary.main"
                          >
                            {formatCurrency(
                              plan?.price,
                              plan?.currency ?? "INR",
                            )}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {plan?.billingCycle
                              ? `/${getBillingCycleLabel(plan.billingCycle)}`
                              : ""}
                          </Typography>
                        </Box>

                        <Divider />

                        <Grid container spacing={1.5}>
                          <Grid
                            size={{
                              xs: 6,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Members
                            </Typography>

                            <Typography fontWeight={700}>
                              {plan?.maxStudents ?? "-"}
                            </Typography>
                          </Grid>

                          <Grid
                            size={{
                              xs: 6,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Seats
                            </Typography>

                            <Typography fontWeight={700}>
                              {plan?.maxSeats ?? "-"}
                            </Typography>
                          </Grid>

                          <Grid
                            size={{
                              xs: 6,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Libraries
                            </Typography>

                            <Typography fontWeight={700}>
                              {plan?.maxLibraries ?? "-"}
                            </Typography>
                          </Grid>

                          <Grid
                            size={{
                              xs: 6,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Branches
                            </Typography>

                            <Typography fontWeight={700}>
                              {plan?.maxBranches ?? "-"}
                            </Typography>
                          </Grid>
                        </Grid>

                        <Alert
                          severity={
                            seatEligibility.eligible ? "success" : "error"
                          }
                          variant="outlined"
                          sx={{
                            py: 0.25,
                          }}
                        >
                          {seatEligibility.maxSeats === null
                            ? `Current library: ${seatEligibility.usedSeats} seats. No seat limit is configured for this plan.`
                            : seatEligibility.eligible
                              ? `Seat capacity verified: ${seatEligibility.usedSeats} / ${seatEligibility.maxSeats} seats used.`
                              : `Not eligible: library has ${seatEligibility.usedSeats} seats but this plan supports only ${seatEligibility.maxSeats}.`}
                        </Alert>

                        <Divider />

                        <Stack spacing={0.7}>
                          {[
                            ["Analytics", plan?.analyticsEnabled],
                            ["Reports", plan?.reportsEnabled],
                            ["API Access", plan?.apiAccess],
                            ["Custom Branding", plan?.customBranding],
                            ["Priority Support", plan?.prioritySupport],
                          ].map(([label, enabled]) => (
                            <Stack
                              key={label}
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <CheckCircle
                                sx={{
                                  fontSize: 18,
                                  color: enabled
                                    ? "success.main"
                                    : "text.disabled",
                                }}
                              />

                              <Typography
                                variant="body2"
                                color={
                                  enabled ? "text.primary" : "text.disabled"
                                }
                              >
                                {label}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>

                        <Button
                          fullWidth
                          variant={
                            current
                              ? "outlined"
                              : selected
                                ? "contained"
                                : "outlined"
                          }
                          disabled={
                            current ||
                            librarySeatCountLoading ||
                            !seatEligibility.eligible
                          }
                          onClick={() => handlePreparePlanChange(plan)}
                        >
                          {current
                            ? "Current Plan"
                            : !seatEligibility.eligible
                              ? `Requires ${seatEligibility.usedSeats} Seat Capacity`
                              : getPlanActionLabel(plan)}
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>

          {availablePlans.length === 0 && (
            <Alert severity="info">
              No active LibraryHub plans are currently available.
            </Alert>
          )}

          {selectedChangePlan && planDialogMode === "change" && (
            <Alert severity="info" sx={{ mt: 3 }}>
              Selected <strong>{selectedChangePlan.name}</strong>. Seat capacity
              verified: <strong>{librarySeatCount}</strong> current seats within
              the plan limit of{" "}
              <strong>
                {getPlanSeatLimit(selectedChangePlan) ?? "Unlimited"}
              </strong>
              . The selected plan is now ready for the existing
              platform-subscription change/payment flow.
            </Alert>
          )}

          {planPaymentMessage && (
            <Alert
              severity={
                planPaymentMessage.toLowerCase().includes("successful")
                  ? "success"
                  : "info"
              }
              sx={{ mt: 2 }}
            >
              {planPaymentMessage}
            </Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={closePlanDialog}>Close</Button>

          {planDialogMode === "compare" && selectedChangePlan && (
            <Button
              variant="contained"
              onClick={() => setPlanDialogMode("change")}
            >
              Continue with Selected Plan
            </Button>
          )}

          {planDialogMode === "change" && selectedChangePlan && (
            <Button
              variant="contained"
              disabled={
                planPaymentLoading ||
                librarySeatCountLoading ||
                !getPlanSeatEligibility(selectedChangePlan).eligible
              }
              onClick={handleContinuePlanPayment}
            >
              {planPaymentLoading ? "Processing..." : "Continue to Payment"}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* =====================================================
          PLATFORM SUBSCRIPTION INVOICE VIEWER
         ===================================================== */}
      <Dialog
        open={invoiceDialogOpen}
        onClose={closeInvoiceDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: { borderRadius: 4, overflow: "hidden" },
          },
        }}
      >
        <DialogTitle>Platform Billing Invoice</DialogTitle>

        <DialogContent dividers>
          {invoiceDialogLoading ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={2}
              sx={{
                minHeight: 220,
              }}
            >
              <CircularProgress />

              <Typography variant="body2" color="text.secondary">
                Loading invoice...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={2}>
              {invoiceDialogError && (
                <Alert severity="error">{invoiceDialogError}</Alert>
              )}

              {selectedBillingItem && (
                <Card
                  elevation={0}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Subscription Payment
                    </Typography>

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      justifyContent="space-between"
                      spacing={1}
                      mt={0.5}
                    >
                      <Box>
                        <Typography fontWeight={700}>
                          {selectedBillingItem.description}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Subscription #{selectedBillingItem.id}
                          {" · "}
                          Payment #{selectedBillingItem.paymentTransactionId}
                        </Typography>
                      </Box>

                      <Typography fontWeight={800}>
                        {formatCurrency(
                          selectedBillingItem.amount,
                          selectedBillingItem.currency,
                        )}
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {selectedPlatformInvoice && (
                <>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Invoice Number
                      </Typography>

                      <Typography variant="h6" fontWeight={800}>
                        {selectedPlatformInvoice.invoiceNumber ||
                          `Invoice #${selectedPlatformInvoice.id}`}
                      </Typography>
                    </Box>

                    <Chip
                      label={selectedPlatformInvoice.status ?? "GENERATED"}
                      color="success"
                      size="small"
                    />
                  </Stack>

                  <Divider />

                  <Grid container spacing={2}>
                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Invoice Date
                      </Typography>

                      <Typography fontWeight={600}>
                        {formatDate(selectedPlatformInvoice.invoiceDate)}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Payment Transaction
                      </Typography>

                      <Typography fontWeight={600}>
                        #{selectedPlatformInvoice.paymentTransactionId ?? "-"}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Taxable Amount
                      </Typography>

                      <Typography fontWeight={600}>
                        {formatCurrency(
                          selectedPlatformInvoice.taxableAmount,
                          selectedPlatformInvoice.currency,
                        )}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        GST
                      </Typography>

                      <Typography fontWeight={600}>
                        {selectedPlatformInvoice.gstPercentage ?? 0}%
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        CGST
                      </Typography>

                      <Typography fontWeight={600}>
                        {formatCurrency(
                          selectedPlatformInvoice.cgst,
                          selectedPlatformInvoice.currency,
                        )}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        SGST
                      </Typography>

                      <Typography fontWeight={600}>
                        {formatCurrency(
                          selectedPlatformInvoice.sgst,
                          selectedPlatformInvoice.currency,
                        )}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        IGST
                      </Typography>

                      <Typography fontWeight={600}>
                        {formatCurrency(
                          selectedPlatformInvoice.igst,
                          selectedPlatformInvoice.currency,
                        )}
                      </Typography>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Total Amount
                      </Typography>

                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color="primary.main"
                      >
                        {formatCurrency(
                          selectedPlatformInvoice.totalAmount,
                          selectedPlatformInvoice.currency,
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </>
              )}

              {!selectedPlatformInvoice && !invoiceDialogError && (
                <Alert severity="info">
                  No invoice is available for this payment yet.
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={closeInvoiceDialog}
            disabled={invoiceDownloadLoading}
          >
            Close
          </Button>

          <Button
            variant="contained"
            startIcon={
              invoiceDownloadLoading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DownloadIcon />
              )
            }
            disabled={
              invoiceDialogLoading ||
              !selectedPlatformInvoice?.id ||
              invoiceDownloadLoading
            }
            onClick={handleDownloadPlatformInvoice}
          >
            {invoiceDownloadLoading ? "Downloading..." : "Download Invoice PDF"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SubscriptionBilling;
