import {
  ArrowBack,
  ArrowForward,
  CalendarMonth,
  CheckCircle,
  EventSeat,
  LibraryBooks,
  LocalOffer,
  Payments,
  Person,
  ReceiptLong,
  Schedule,
  WorkspacePremium,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import bookingApi from "../../api/bookingApi";
import couponApi from "../../api/couponApi";
import libraryApi from "../../api/libraryApi";
import memberApi from "../../api/memberApi";
import memberPricingApi from "../../api/memberPricingApi";
import membershipPlanApi from "../../api/membershipPlanApi";
import seatApi from "../../api/seatApi";
import slotApi from "../../api/slotApi";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const STEPS = [
  "Member",
  "Membership",
  "Slot & Dates",
  "Seat",
  "Pricing",
  "Payment",
  "Review",
];

const EMPTY_NEW_MEMBER = {
  fullName: "",
  email: "",
  phone: "",
  gender: "",
  password: "",
};

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.detail ||
    error?.message ||
    fallback
  );
}

function roundMoney(value) {
  const number = Number(value ?? 0);
  if (!Number.isFinite(number)) return 0;
  return Math.round((number + Number.EPSILON) * 100) / 100;
}

function formatMoney(value) {
  return `₹${roundMoney(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDisplayDate(value) {
  if (!value) return "-";

  const parsed = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

function formatEnum(value) {
  if (!value) return "-";

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getInitials(name) {
  const normalized = String(name || "").trim();
  if (!normalized) return "M";

  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function normalizeEnumValue(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function normalizeGender(value) {
  return normalizeEnumValue(value);
}

function getSeatAvailabilityStatus(seat) {
  return normalizeEnumValue(
    seat?.availabilityStatus ||
      seat?.status ||
      "",
  );
}

function isFemaleOnlySeat(seat) {
  if (!seat) return false;

  if (getSeatAvailabilityStatus(seat) === "RESERVED_FOR_GIRLS") {
    return true;
  }

  return (seat.restrictions || []).some(
    (restriction) =>
      normalizeEnumValue(restriction) === "FEMALE_ONLY",
  );
}

function addDaysInclusive(startDate, durationDays) {
  if (!startDate || !durationDays || Number(durationDays) <= 0) return "";

  const date = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "";

  date.setDate(date.getDate() + Number(durationDays) - 1);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function resolveSeatBasePrice(plan, seat) {
  if (!plan || !seat) return 0;

  const seatType = String(seat.seatType || "NORMAL").toUpperCase();

  const configured = (plan.seatPrices || []).find(
    (item) =>
      item?.active !== false &&
      String(item?.seatType || "").toUpperCase() === seatType,
  );

  if (configured?.price != null) return roundMoney(configured.price);

  // Backend only permits legacy fallback for NORMAL pricing.
  if (seatType === "NORMAL") return roundMoney(plan.price);

  return 0;
}

function resolveFeatureSurcharge(plan, seat) {
  if (!plan || !seat) return 0;

  const features = new Set(
    (seat.features || []).map((feature) => String(feature).toUpperCase()),
  );

  return roundMoney(
    (plan.featurePrices || [])
      .filter(
        (item) =>
          item?.active !== false &&
          features.has(String(item?.seatFeature || "").toUpperCase()),
      )
      .reduce((sum, item) => sum + Number(item?.additionalPrice ?? 0), 0),
  );
}

function CreateBooking() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const initialLibraryId =
    location.state?.libraryId ??
    localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY) ??
    "";

  const [activeStep, setActiveStep] = useState(0);

  const [libraries, setLibraries] = useState([]);
  const [libraryId, setLibraryId] = useState(String(initialLibraryId || ""));

  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [floors, setFloors] = useState([]);
  const [slots, setSlots] = useState([]);

  const [memberMode, setMemberMode] = useState("EXISTING");
  const [memberId, setMemberId] = useState("");
  const [newMember, setNewMember] = useState({ ...EMPTY_NEW_MEMBER });

  const [membershipPlanId, setMembershipPlanId] = useState("");
  const [startDate, setStartDate] = useState(getToday());
  const [slotId, setSlotId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [seatId, setSeatId] = useState("");
  const [availableSeats, setAvailableSeats] = useState([]);

  const [memberPricing, setMemberPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [amountReceived, setAmountReceived] = useState("");
  const [paymentDate, setPaymentDate] = useState(getToday());
  const [receiptNumber, setReceiptNumber] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [loadingContext, setLoadingContext] = useState(true);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [successResponse, setSuccessResponse] = useState(null);

  const selectedLibrary = useMemo(
    () =>
      libraries.find((item) => String(item.id) === String(libraryId)) || null,
    [libraries, libraryId],
  );

  const selectedMember = useMemo(
    () =>
      members.find(
        (item) => String(item.memberId ?? item.id) === String(memberId),
      ) || null,
    [members, memberId],
  );

  const effectiveMemberGender = useMemo(
    () =>
      memberMode === "EXISTING"
        ? normalizeGender(selectedMember?.gender)
        : normalizeGender(newMember.gender),
    [memberMode, selectedMember, newMember.gender],
  );

  const memberIsFemale = effectiveMemberGender === "FEMALE";

  const isSeatSelectable = (seat) => {
    if (!seat) return false;
    if (seat.booked === true) return false;

    const availabilityStatus = getSeatAvailabilityStatus(seat);

    if (availabilityStatus === "BOOKED") return false;

    if (
      availabilityStatus === "RESERVED" ||
      availabilityStatus === "MAINTENANCE"
    ) {
      return false;
    }

    if (availabilityStatus === "RESERVED_FOR_GIRLS") {
      return memberIsFemale;
    }

    if (availabilityStatus !== "AVAILABLE") {
      return false;
    }

    if (isFemaleOnlySeat(seat)) {
      return memberIsFemale;
    }

    return true;
  };

  const selectedPlan = useMemo(
    () =>
      plans.find((item) => String(item.id) === String(membershipPlanId)) ||
      null,
    [plans, membershipPlanId],
  );

  const selectedSlot = useMemo(
    () => slots.find((item) => String(item.id) === String(slotId)) || null,
    [slots, slotId],
  );

  const selectedFloor = useMemo(
    () => floors.find((item) => String(item.id) === String(floorId)) || null,
    [floors, floorId],
  );

  const selectedSeat = useMemo(
    () =>
      availableSeats.find(
        (item) => String(item.seatId ?? item.id) === String(seatId),
      ) || null,
    [availableSeats, seatId],
  );

  const endDate = useMemo(
    () => addDaysInclusive(startDate, selectedPlan?.durationDays),
    [startDate, selectedPlan],
  );

  const seatBasePrice = useMemo(
    () => resolveSeatBasePrice(selectedPlan, selectedSeat),
    [selectedPlan, selectedSeat],
  );

  const featureSurcharge = useMemo(
    () => resolveFeatureSurcharge(selectedPlan, selectedSeat),
    [selectedPlan, selectedSeat],
  );

  const effectiveBasePrice = useMemo(() => {
    const seatType = String(selectedSeat?.seatType || "NORMAL").toUpperCase();

    // Current backend migration rule: member-level custom pricing applies only
    // to NORMAL seat base price. PREMIUM uses configured seat-type price.
    if (
      memberMode === "EXISTING" &&
      seatType === "NORMAL" &&
      memberPricing?.effectivePrice != null
    ) {
      return roundMoney(memberPricing.effectivePrice);
    }

    return roundMoney(seatBasePrice);
  }, [memberMode, selectedSeat, memberPricing, seatBasePrice]);

  const originalAmount = useMemo(
    () => roundMoney(effectiveBasePrice + featureSurcharge),
    [effectiveBasePrice, featureSurcharge],
  );

  const discountAmount = useMemo(
    () => roundMoney(appliedCoupon?.discountAmount ?? 0),
    [appliedCoupon],
  );

  const finalAmount = useMemo(
    () =>
      roundMoney(
        appliedCoupon?.finalAmount ??
          Math.max(0, originalAmount - discountAmount),
      ),
    [appliedCoupon, originalAmount, discountAmount],
  );

  const effectiveMemberName =
    memberMode === "EXISTING"
      ? selectedMember?.fullName || selectedMember?.memberName || "-"
      : newMember.fullName || "-";

  // ==========================================================
  // LOAD OWNER LIBRARIES
  // ==========================================================

  useEffect(() => {
    let active = true;

    async function loadLibraries() {
      try {
        setError("");

        const response = await libraryApi.getMyLibraries();
        if (!active) return;

        const list = normalizeList(response);
        setLibraries(list);

        if (list.length === 0) {
          setLibraryId("");
          return;
        }

        const stored = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

        const preferred =
          list.find(
            (item) => String(item.id) === String(libraryId || stored || ""),
          ) || list[0];

        setLibraryId(String(preferred.id));
      } catch (requestError) {
        if (active) {
          setError(
            getErrorMessage(requestError, "Unable to load your libraries."),
          );
        }
      }
    }

    loadLibraries();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================================
  // LOAD LIBRARY MANUAL-BOOKING CONTEXT
  // ==========================================================

  useEffect(() => {
    if (!libraryId) return;

    let active = true;

    async function loadContext() {
      try {
        setLoadingContext(true);
        setError("");

        const [memberResponse, planResponse, floorResponse, slotResponse] =
          await Promise.all([
            memberApi.getLibraryMembers(libraryId),
            membershipPlanApi.getActivePlans(libraryId),
            seatApi.getFloors(libraryId),
            slotApi.getActiveSlots(libraryId),
          ]);

        if (!active) return;

        const memberList = normalizeList(memberResponse);
        const planList = normalizeList(planResponse);
        const floorList = normalizeList(floorResponse);
        const slotList = normalizeList(slotResponse);

        setMembers(memberList);
        setPlans(planList);
        setFloors(floorList);
        setSlots(slotList);

        setMemberId("");
        setNewMember({ ...EMPTY_NEW_MEMBER });
        setMembershipPlanId("");
        setSlotId("");
        setSeatId("");
        setAvailableSeats([]);
        setMemberPricing(null);
        setCouponCode("");
        setAppliedCoupon(null);
        setActiveStep(0);

        setFloorId(floorList.length > 0 ? String(floorList[0].id) : "");
      } catch (requestError) {
        if (active) {
          setError(
            getErrorMessage(
              requestError,
              "Unable to load manual booking setup data.",
            ),
          );
        }
      } finally {
        if (active) setLoadingContext(false);
      }
    }

    localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(libraryId));

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: { libraryId: Number(libraryId) },
      }),
    );

    loadContext();

    return () => {
      active = false;
    };
  }, [libraryId]);

  // ==========================================================
  // LOAD SEAT AVAILABILITY
  // ==========================================================

  useEffect(() => {
    setSeatId("");
    setAppliedCoupon(null);
    setCouponCode("");

    if (!libraryId || !floorId || !slotId || !startDate) {
      setAvailableSeats([]);
      return;
    }

    let active = true;

    async function loadAvailability() {
      try {
        setLoadingSeats(true);
        setError("");

        const response = await seatApi.getSeatAvailability(
          libraryId,
          Number(floorId),
          Number(slotId),
          startDate,
        );

        if (!active) return;
        setAvailableSeats(normalizeList(response));
      } catch (requestError) {
        if (active) {
          setAvailableSeats([]);
          setError(
            getErrorMessage(requestError, "Unable to load seat availability."),
          );
        }
      } finally {
        if (active) setLoadingSeats(false);
      }
    }

    loadAvailability();

    return () => {
      active = false;
    };
  }, [libraryId, floorId, slotId, startDate]);

  // ==========================================================
  // EXISTING MEMBER NORMAL-SEAT PRICING
  // ==========================================================

  useEffect(() => {
    setMemberPricing(null);
    setAppliedCoupon(null);
    setCouponCode("");

    if (memberMode !== "EXISTING" || !memberId || !membershipPlanId) return;

    let active = true;

    async function loadMemberPrice() {
      try {
        setPricingLoading(true);

        const response = await memberPricingApi.getEffectivePrice(
          Number(memberId),
          Number(membershipPlanId),
        );

        if (active) setMemberPricing(response ?? null);
      } catch (requestError) {
        if (active) {
          setMemberPricing(null);
          setError(
            getErrorMessage(
              requestError,
              "Unable to load member-specific pricing.",
            ),
          );
        }
      } finally {
        if (active) setPricingLoading(false);
      }
    }

    loadMemberPrice();

    return () => {
      active = false;
    };
  }, [memberMode, memberId, membershipPlanId]);

  // Keep the cash/bank received amount synchronized to current preview.
  useEffect(() => {
    if (selectedPlan && selectedSeat) {
      setAmountReceived(finalAmount.toFixed(2));
    } else {
      setAmountReceived("");
    }
  }, [finalAmount, selectedPlan, selectedSeat]);

  // Any price-authority context change invalidates the prior coupon preview.
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponCode("");
  }, [memberMode, memberId, membershipPlanId, seatId]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError("Enter a coupon code first.");
      return;
    }

    if (!selectedPlan || !selectedSeat) {
      setError("Select a membership plan and seat before applying a coupon.");
      return;
    }

    if (originalAmount <= 0) {
      setError("Unable to calculate a valid amount for this booking.");
      return;
    }

    try {
      setCouponLoading(true);
      setError("");

      const response = await couponApi.validateCoupon({
        libraryId: Number(libraryId),
        code: couponCode.trim(),
        amount: originalAmount,
      });

      if (response?.valid === false) {
        throw new Error(response?.message || "Coupon is not valid.");
      }

      setAppliedCoupon(response ?? null);
    } catch (requestError) {
      setAppliedCoupon(null);
      setError(getErrorMessage(requestError, "Unable to apply coupon."));
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setError("");
  };

  const validateStep = (step) => {
    if (step === 0) {
      if (memberMode === "EXISTING") {
        return memberId ? "" : "Select an existing member.";
      }

      if (!newMember.fullName.trim()) return "New member name is required.";
      if (!newMember.email.trim()) return "New member email is required.";
      if (!newMember.gender) return "New member gender is required.";

      if (!newMember.password || newMember.password.length < 6) {
        return "Password must contain at least 6 characters.";
      }

      if (newMember.phone && !/^\d{10}$/.test(newMember.phone)) {
        return "Phone number must contain exactly 10 digits.";
      }

      return "";
    }

    if (step === 1) {
      return membershipPlanId ? "" : "Select a membership plan.";
    }

    if (step === 2) {
      if (!startDate) return "Select a membership start date.";
      if (!slotId) return "Select a booking slot.";
      return "";
    }

    if (step === 3) {
      if (!floorId) return "Select a floor.";
      if (!seatId) return "Select an available seat.";

      if (!isSeatSelectable(selectedSeat)) {
        if (isFemaleOnlySeat(selectedSeat) && !memberIsFemale) {
          return "This seat can only be booked for a female member.";
        }

        return "Selected seat is not available.";
      }

      return "";
    }

    if (step === 4) {
      return originalAmount > 0
        ? ""
        : "A valid booking price could not be calculated.";
    }

    if (step === 5) {
      if (paymentMethod !== "CASH" && paymentMethod !== "BANK_TRANSFER") {
        return "Select CASH or BANK_TRANSFER.";
      }

      if (!paymentDate) return "Payment date is required.";

      if (roundMoney(amountReceived) !== roundMoney(finalAmount)) {
        return `Amount received must exactly match ${formatMoney(finalAmount)}.`;
      }

      return "";
    }

    return "";
  };

  const handleNext = () => {
    const message = validateStep(activeStep);

    if (message) {
      setError(message);
      return;
    }

    setError("");
    setActiveStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const handleBack = () => {
    setError("");
    setActiveStep((current) => Math.max(current - 1, 0));
  };

  const handleCreateBooking = async () => {
    for (let step = 0; step < STEPS.length - 1; step += 1) {
      const message = validateStep(step);

      if (message) {
        setActiveStep(step);
        setError(message);
        return;
      }
    }

    if (!selectedPlan || !selectedSlot || !selectedSeat) {
      setError("Booking information is incomplete.");
      return;
    }

    const payload = {
      memberId: memberMode === "EXISTING" ? Number(memberId) : null,

      newMember:
        memberMode === "NEW"
          ? {
              fullName: newMember.fullName.trim(),
              email: newMember.email.trim(),
              phone: newMember.phone.trim() || null,
              gender: newMember.gender,
              password: newMember.password,
            }
          : null,

      membershipPlanId: Number(membershipPlanId),
      slotId: Number(slotId),
      seatId: Number(seatId),
      startDate,

      couponId: appliedCoupon?.couponId ? Number(appliedCoupon.couponId) : null,

      paymentMethod,
      amountReceived: roundMoney(amountReceived),
      paymentDate,
      receiptNumber: receiptNumber.trim() || null,
      paymentNote: paymentNote.trim() || null,
    };

    try {
      setCreating(true);
      setError("");

      const response = await bookingApi.createManualBooking(
        Number(libraryId),
        payload,
      );

      setSuccessResponse(response ?? {});
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to create the manual booking."),
      );
    } finally {
      setCreating(false);
    }
  };

  const resetBooking = () => {
    setActiveStep(0);
    setMemberMode("EXISTING");
    setMemberId("");
    setNewMember({ ...EMPTY_NEW_MEMBER });
    setMembershipPlanId("");
    setStartDate(getToday());
    setSlotId("");
    setFloorId(floors.length > 0 ? String(floors[0].id) : "");
    setSeatId("");
    setAvailableSeats([]);
    setMemberPricing(null);
    setCouponCode("");
    setAppliedCoupon(null);
    setPaymentMethod("CASH");
    setPaymentDate(getToday());
    setAmountReceived("");
    setReceiptNumber("");
    setPaymentNote("");
    setError("");
    setSuccessResponse(null);
  };

  if (successResponse) {
    return (
      <Box sx={{ pb: 5 }}>
        <Paper
          variant="outlined"
          sx={{
            maxWidth: 900,
            mx: "auto",
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          <CheckCircle color="success" sx={{ fontSize: 72 }} />

          <Typography variant="h4" fontWeight={900} mt={2}>
            Booking Created Successfully
          </Typography>

          <Typography color="text.secondary" mt={1}>
            Subscription, booking and manual payment were recorded successfully.
          </Typography>

          <Grid container spacing={2} mt={3} textAlign="left">
            <Grid size={{ xs: 12, md: 6 }}>
              <ResultItem
                label="Booking ID"
                value={
                  successResponse.bookingId
                    ? `#${successResponse.bookingId}`
                    : "-"
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ResultItem
                label="Member"
                value={successResponse.memberName || effectiveMemberName}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ResultItem
                label="Membership"
                value={
                  successResponse.membershipPlanName ||
                  selectedPlan?.name ||
                  "-"
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ResultItem
                label="Seat"
                value={
                  successResponse.seatNumber || selectedSeat?.seatNumber || "-"
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ResultItem
                label="Validity"
                value={`${formatDisplayDate(
                  successResponse.startDate || startDate,
                )} - ${formatDisplayDate(successResponse.endDate || endDate)}`}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ResultItem
                label="Amount Paid"
                value={formatMoney(
                  successResponse.finalPayableAmount ?? finalAmount,
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ResultItem
                label="Payment Method"
                value={formatEnum(
                  successResponse.paymentMethod || paymentMethod,
                )}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <ResultItem
                label="Receipt"
                value={successResponse.receiptNumber || "-"}
              />
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
            mt={4}
          >
            <Button
              variant="contained"
              onClick={() => navigate("/owner/bookings")}
            >
              View Bookings
            </Button>

            <Button variant="outlined" onClick={resetBooking}>
              Create Another
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 5 }}>
      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          overflow: "hidden",
          p: { xs: 2.5, md: 3.2 },
          mb: 3,
          borderRadius: 4,
          borderColor: alpha(theme.palette.primary.main, 0.14),
          background: `linear-gradient(118deg, ${alpha(
            theme.palette.primary.main,
            0.08,
          )} 0%, #fff 52%, ${alpha(theme.palette.info.main, 0.045)} 100%)`,
          boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Stack direction="row" spacing={1.7} alignItems="center">
            <Button
              startIcon={<ArrowBack />}
              onClick={() => navigate("/owner/bookings")}
              sx={{ textTransform: "none", fontWeight: 750 }}
            >
              Bookings
            </Button>

            <Divider orientation="vertical" flexItem />

            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ letterSpacing: -0.5 }}
              >
                Manual Booking
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.4}>
                Create a member subscription, assign a seat and record an
                offline payment.
              </Typography>
            </Box>
          </Stack>

          {selectedLibrary && (
            <Chip
              icon={<LibraryBooks />}
              label={selectedLibrary.name}
              color="primary"
              variant="outlined"
              sx={{
                alignSelf: { xs: "flex-start", md: "center" },
                fontWeight: 750,
              }}
            />
          )}
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ p: 2.3, mb: 3, borderRadius: 3.2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems="center"
        >
          <Box sx={{ minWidth: { md: 210 } }}>
            <Typography variant="subtitle2" fontWeight={850}>
              Working library
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manual booking is tenant-scoped to this library.
            </Typography>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>Library</InputLabel>
            <Select
              value={libraryId}
              label="Library"
              disabled={loadingContext || creating}
              onChange={(event) => setLibraryId(String(event.target.value))}
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingContext && <CircularProgress size={22} />}
        </Stack>
      </Paper>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.6 },
          mb: 3,
          borderRadius: 3.2,
          overflowX: "auto",
        }}
      >
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{ minWidth: 780 }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card variant="outlined" sx={{ borderRadius: 3.2 }}>
            <CardContent sx={{ p: { xs: 2.4, md: 3.2 } }}>
              {activeStep === 0 && (
                <Stack spacing={3}>
                  <SectionTitle
                    icon={<Person />}
                    title="Member"
                    subtitle="Choose an existing member or create a new walk-in member."
                  />

                  <RadioGroup
                    row
                    value={memberMode}
                    onChange={(event) => {
                      setMemberMode(event.target.value);
                      setMemberId("");
                      setNewMember({ ...EMPTY_NEW_MEMBER });
                      setError("");
                    }}
                  >
                    <FormControlLabel
                      value="EXISTING"
                      control={<Radio />}
                      label="Existing Member"
                    />
                    <FormControlLabel
                      value="NEW"
                      control={<Radio />}
                      label="New Walk-in Member"
                    />
                  </RadioGroup>

                  {memberMode === "EXISTING" ? (
                    <>
                      <FormControl fullWidth size="small">
                        <InputLabel>Select Member</InputLabel>
                        <Select
                          value={memberId}
                          label="Select Member"
                          onChange={(event) => {
                            setMemberId(String(event.target.value));
                            setError("");
                          }}
                        >
                          <MenuItem value="">Select Member</MenuItem>

                          {members.map((member) => {
                            const id = member.memberId ?? member.id;

                            return (
                              <MenuItem key={id} value={String(id)}>
                                {member.fullName ||
                                  member.memberName ||
                                  `Member #${id}`}
                                {member.email ? ` · ${member.email}` : ""}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>

                      {selectedMember && (
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            bgcolor: "action.hover",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              src={selectedMember.profileImageUrl || undefined}
                            >
                              {!selectedMember.profileImageUrl
                                ? getInitials(
                                    selectedMember.fullName ||
                                      selectedMember.memberName,
                                  )
                                : null}
                            </Avatar>

                            <Box sx={{ minWidth: 0 }}>
                              <Typography fontWeight={800}>
                                {selectedMember.fullName ||
                                  selectedMember.memberName}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {selectedMember.email || "No email"}
                                {selectedMember.phone
                                  ? ` · ${selectedMember.phone}`
                                  : ""}
                              </Typography>

                              <Stack
                                direction="row"
                                spacing={1}
                                mt={0.8}
                                useFlexGap
                                flexWrap="wrap"
                              >
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  label={
                                    selectedMember.subscriptionStatus ||
                                    "Member"
                                  }
                                />

                                {selectedMember.gender && (
                                  <Chip
                                    size="small"
                                    color={
                                      normalizeGender(selectedMember.gender) ===
                                      "FEMALE"
                                        ? "secondary"
                                        : "default"
                                    }
                                    variant="outlined"
                                    label={formatEnum(selectedMember.gender)}
                                  />
                                )}

                                {selectedMember.membershipPlanName && (
                                  <Chip
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    label={selectedMember.membershipPlanName}
                                  />
                                )}
                              </Stack>
                            </Box>
                          </Stack>
                        </Paper>
                      )}
                    </>
                  ) : (
                    <>
                      <Alert severity="info" sx={{ borderRadius: 2.4 }}>
                        The new account and membership are committed only if the
                        whole manual-booking transaction succeeds.
                      </Alert>

                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Full Name"
                            value={newMember.fullName}
                            onChange={(event) =>
                              setNewMember((current) => ({
                                ...current,
                                fullName: event.target.value,
                              }))
                            }
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Email"
                            type="email"
                            value={newMember.email}
                            onChange={(event) =>
                              setNewMember((current) => ({
                                ...current,
                                email: event.target.value,
                              }))
                            }
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Phone"
                            value={newMember.phone}
                            inputProps={{ maxLength: 10 }}
                            onChange={(event) =>
                              setNewMember((current) => ({
                                ...current,
                                phone: event.target.value.replace(/\D/g, ""),
                              }))
                            }
                          />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Gender</InputLabel>
                            <Select
                              value={newMember.gender}
                              label="Gender"
                              onChange={(event) =>
                                setNewMember((current) => ({
                                  ...current,
                                  gender: event.target.value,
                                }))
                              }
                            >
                              <MenuItem value="MALE">Male</MenuItem>
                              <MenuItem value="FEMALE">Female</MenuItem>
                              <MenuItem value="OTHERS">Others</MenuItem>
                              <MenuItem value="PREFER_NOT_TO_SAY">
                                Prefer not to say
                              </MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                          <TextField
                            fullWidth
                            size="small"
                            type="password"
                            label="Initial Password"
                            value={newMember.password}
                            helperText="Minimum 6 characters. We can replace this with an invite/set-password flow later."
                            onChange={(event) =>
                              setNewMember((current) => ({
                                ...current,
                                password: event.target.value,
                              }))
                            }
                          />
                        </Grid>
                      </Grid>
                    </>
                  )}
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack spacing={3}>
                  <SectionTitle
                    icon={<WorkspacePremium />}
                    title="Membership Plan"
                    subtitle="Select the plan to activate for this member."
                  />

                  {plans.length === 0 ? (
                    <Alert severity="warning">
                      No active membership plans are configured for this
                      library.
                    </Alert>
                  ) : (
                    <Grid container spacing={2}>
                      {plans.map((plan) => {
                        const selected =
                          String(membershipPlanId) === String(plan.id);

                        return (
                          <Grid key={plan.id} size={{ xs: 12, md: 6 }}>
                            <Paper
                              variant="outlined"
                              onClick={() => {
                                setMembershipPlanId(String(plan.id));
                                setSeatId("");
                                setAppliedCoupon(null);
                              }}
                              sx={{
                                p: 2.2,
                                borderRadius: 2.8,
                                cursor: "pointer",
                                borderColor: selected
                                  ? "primary.main"
                                  : "divider",
                                bgcolor: selected
                                  ? alpha(theme.palette.primary.main, 0.045)
                                  : "background.paper",
                                transition: "160ms ease",
                                "&:hover": {
                                  borderColor: "primary.light",
                                  transform: "translateY(-1px)",
                                },
                              }}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                spacing={2}
                              >
                                <Box>
                                  <Typography fontWeight={850}>
                                    {plan.name}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.4}
                                  >
                                    {plan.durationDays} days ·{" "}
                                    {formatEnum(plan.planType)}
                                  </Typography>
                                </Box>

                                {selected && <CheckCircle color="primary" />}
                              </Stack>

                              <Divider sx={{ my: 1.5 }} />

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Normal seat
                              </Typography>

                              <Typography variant="h6" fontWeight={850}>
                                {formatMoney(
                                  resolveSeatBasePrice(plan, {
                                    seatType: "NORMAL",
                                  }),
                                )}
                              </Typography>

                              {(plan.seatPrices || []).some(
                                (item) =>
                                  item?.active !== false &&
                                  String(item?.seatType).toUpperCase() ===
                                    "PREMIUM",
                              ) && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Premium seat pricing configured
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack spacing={3}>
                  <SectionTitle
                    icon={<CalendarMonth />}
                    title="Slot & Dates"
                    subtitle="The backend derives the end date from the selected membership duration."
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Membership Start Date"
                        value={startDate}
                        inputProps={{ min: getToday() }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={(event) => {
                          setStartDate(event.target.value);
                          setSeatId("");
                        }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Membership End Date"
                        value={endDate ? formatDisplayDate(endDate) : "-"}
                        disabled
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Booking Slot</InputLabel>
                        <Select
                          value={slotId}
                          label="Booking Slot"
                          onChange={(event) => {
                            setSlotId(String(event.target.value));
                            setSeatId("");
                          }}
                        >
                          <MenuItem value="">Select Slot</MenuItem>
                          {slots.map((slot) => (
                            <MenuItem key={slot.id} value={String(slot.id)}>
                              {slot.name} · {formatTime(slot.startTime)} -{" "}
                              {formatTime(slot.endTime)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {selectedPlan && (
                    <Alert severity="info" sx={{ borderRadius: 2.4 }}>
                      {selectedPlan.name} is valid for{" "}
                      {selectedPlan.durationDays} days:{" "}
                      {formatDisplayDate(startDate)} through{" "}
                      {formatDisplayDate(endDate)}.
                    </Alert>
                  )}
                </Stack>
              )}

              {activeStep === 3 && (
                <Stack spacing={3}>
                  <SectionTitle
                    icon={<EventSeat />}
                    title="Seat"
                    subtitle="Choose an available seat for the selected floor, slot and start date. Female-only seats are selectable only for female members."
                  />

                  {effectiveMemberGender ? (
                    <Alert
                      severity={memberIsFemale ? "success" : "info"}
                      sx={{ borderRadius: 2.4 }}
                    >
                      Member gender: {formatEnum(effectiveMemberGender)}.
                      {memberIsFemale
                        ? " Female-only seats are available when they are not already booked."
                        : " Female-only seats will remain disabled."}
                    </Alert>
                  ) : (
                    <Alert severity="warning" sx={{ borderRadius: 2.4 }}>
                      Member gender is missing. Female-only seats cannot be
                      selected until gender is available.
                    </Alert>
                  )}

                  <FormControl fullWidth size="small">
                    <InputLabel>Floor</InputLabel>
                    <Select
                      value={floorId}
                      label="Floor"
                      onChange={(event) => {
                        setFloorId(String(event.target.value));
                        setSeatId("");
                      }}
                    >
                      {floors.map((floor) => (
                        <MenuItem key={floor.id} value={String(floor.id)}>
                          {floor.name || `Floor ${floor.floorNumber}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {loadingSeats ? (
                    <Box sx={{ py: 6, display: "grid", placeItems: "center" }}>
                      <CircularProgress />
                    </Box>
                  ) : availableSeats.length === 0 ? (
                    <Alert severity="info">
                      No seats are available for the selected floor, slot and
                      date.
                    </Alert>
                  ) : (
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(118px, 1fr))",
                        gap: 1.4,
                      }}
                    >
                      {availableSeats.map((seat) => {
                        const id = String(seat.seatId ?? seat.id);
                        const available = isSeatSelectable(seat);
                        const selected = seatId === id;
                        const femaleOnly = isFemaleOnlySeat(seat);
                        const availabilityStatus =
                          getSeatAvailabilityStatus(seat);

                        let unavailableLabel = "";

                        if (!available) {
                          if (
                            femaleOnly &&
                            !memberIsFemale &&
                            availabilityStatus !== "BOOKED"
                          ) {
                            unavailableLabel = "Female Only";
                          } else {
                            unavailableLabel =
                              formatEnum(availabilityStatus);
                          }
                        }

                        return (
                          <Button
                            key={id}
                            disabled={!available}
                            variant={selected ? "contained" : "outlined"}
                            onClick={() => {
                              setSeatId(id);
                              setError("");
                            }}
                            sx={{
                              minHeight: 100,
                              borderRadius: 2.4,
                              textTransform: "none",
                            }}
                          >
                            <Stack spacing={0.35} alignItems="center">
                              <EventSeat />

                              <Typography fontWeight={850}>
                                {seat.seatNumber}
                              </Typography>

                              <Typography variant="caption">
                                {formatEnum(seat.seatType)}
                              </Typography>

                              {femaleOnly && available && (
                                <Typography
                                  variant="caption"
                                  color="secondary.main"
                                  fontWeight={750}
                                >
                                  Female Only
                                </Typography>
                              )}

                              {!available && unavailableLabel && (
                                <Typography
                                  variant="caption"
                                  color="inherit"
                                  fontWeight={650}
                                >
                                  {unavailableLabel}
                                </Typography>
                              )}
                            </Stack>
                          </Button>
                        );
                      })}
                    </Box>
                  )}

                  {selectedSeat && (
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                      <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Chip
                          label={`Seat ${selectedSeat.seatNumber}`}
                          color="primary"
                        />
                        <Chip
                          label={formatEnum(selectedSeat.seatType)}
                          variant="outlined"
                        />

                        {isFemaleOnlySeat(selectedSeat) && (
                          <Chip
                            size="small"
                            label="Female Only"
                            color="secondary"
                            variant="outlined"
                          />
                        )}

                        {(selectedSeat.features || []).map((feature) => (
                          <Chip
                            key={feature}
                            size="small"
                            label={formatEnum(feature)}
                            variant="outlined"
                          />
                        ))}
                        {(selectedSeat.restrictions || []).map(
                          (restriction) => (
                            <Chip
                              key={restriction}
                              size="small"
                              label={formatEnum(restriction)}
                              color="warning"
                              variant="outlined"
                            />
                          ),
                        )}
                      </Stack>
                    </Paper>
                  )}
                </Stack>
              )}

              {activeStep === 4 && (
                <Stack spacing={3}>
                  <SectionTitle
                    icon={<LocalOffer />}
                    title="Pricing & Coupon"
                    subtitle="This is a preview; the backend recalculates the authoritative price before commit."
                  />

                  {pricingLoading && (
                    <Alert severity="info">
                      Loading member-specific pricing...
                    </Alert>
                  )}

                  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.8 }}>
                    <Stack spacing={1.6}>
                      <PriceRow
                        label={`${formatEnum(selectedSeat?.seatType)} seat base price`}
                        value={effectiveBasePrice}
                      />

                      {memberMode === "EXISTING" &&
                        String(selectedSeat?.seatType || "").toUpperCase() ===
                          "NORMAL" &&
                        memberPricing?.effectivePrice != null &&
                        roundMoney(memberPricing.effectivePrice) !==
                          roundMoney(seatBasePrice) && (
                          <Alert severity="success" sx={{ borderRadius: 2.2 }}>
                            Member-specific NORMAL-seat price applied.
                          </Alert>
                        )}

                      <PriceRow
                        label="Feature surcharge"
                        value={featureSurcharge}
                      />

                      <Divider />

                      <PriceRow
                        label="Original amount"
                        value={originalAmount}
                        strong
                      />

                      {appliedCoupon && (
                        <PriceRow
                          label={`Coupon ${appliedCoupon.code || couponCode}`}
                          value={-discountAmount}
                          success
                        />
                      )}

                      <Divider />

                      <PriceRow
                        label="Final payable"
                        value={finalAmount}
                        strong
                        primary
                      />
                    </Stack>
                  </Paper>

                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Coupon Code"
                      value={couponCode}
                      disabled={Boolean(appliedCoupon)}
                      onChange={(event) => setCouponCode(event.target.value)}
                    />

                    {appliedCoupon ? (
                      <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleRemoveCoupon}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        disabled={couponLoading}
                        onClick={handleApplyCoupon}
                        startIcon={
                          couponLoading ? (
                            <CircularProgress size={17} />
                          ) : (
                            <LocalOffer />
                          )
                        }
                        sx={{ minWidth: 140 }}
                      >
                        Apply
                      </Button>
                    )}
                  </Stack>
                </Stack>
              )}

              {activeStep === 5 && (
                <Stack spacing={3}>
                  <SectionTitle
                    icon={<Payments />}
                    title="Manual Payment"
                    subtitle="Record the offline payment received by the library."
                  />

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Payment Method</InputLabel>
                        <Select
                          value={paymentMethod}
                          label="Payment Method"
                          onChange={(event) =>
                            setPaymentMethod(event.target.value)
                          }
                        >
                          <MenuItem value="CASH">Cash</MenuItem>
                          <MenuItem value="BANK_TRANSFER">
                            Bank Transfer
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="date"
                        label="Payment Date"
                        value={paymentDate}
                        inputProps={{ max: getToday() }}
                        slotProps={{ inputLabel: { shrink: true } }}
                        onChange={(event) => setPaymentDate(event.target.value)}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="Amount Received"
                        value={amountReceived}
                        inputProps={{ min: 0, step: "0.01" }}
                        onChange={(event) =>
                          setAmountReceived(event.target.value)
                        }
                        helperText={`Must exactly match ${formatMoney(finalAmount)}`}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Receipt / External Reference"
                        value={receiptNumber}
                        onChange={(event) =>
                          setReceiptNumber(event.target.value)
                        }
                        helperText="Optional. Backend generates a receipt when left blank."
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Payment Note"
                        value={paymentNote}
                        onChange={(event) => setPaymentNote(event.target.value)}
                        placeholder="Example: Cash collected at reception."
                      />
                    </Grid>
                  </Grid>

                  <Alert severity="info" sx={{ borderRadius: 2.4 }}>
                    Manual payments bypass Razorpay/Cashfree. The backend
                    records this transaction with source MANUAL and status
                    SUCCESS.
                  </Alert>
                </Stack>
              )}

              {activeStep === 6 && (
                <Stack spacing={3}>
                  <SectionTitle
                    icon={<ReceiptLong />}
                    title="Review Booking"
                    subtitle="Review the complete transaction before confirming."
                  />

                  <ReviewSection
                    title="Member"
                    rows={[
                      [
                        "Type",
                        memberMode === "EXISTING"
                          ? "Existing Member"
                          : "New Walk-in Member",
                      ],
                      ["Name", effectiveMemberName],
                      [
                        "Email",
                        memberMode === "EXISTING"
                          ? selectedMember?.email || "-"
                          : newMember.email || "-",
                      ],
                      [
                        "Phone",
                        memberMode === "EXISTING"
                          ? selectedMember?.phone || "-"
                          : newMember.phone || "-",
                      ],
                      [
                        "Gender",
                        effectiveMemberGender
                          ? formatEnum(effectiveMemberGender)
                          : "-",
                      ],
                    ]}
                  />

                  <ReviewSection
                    title="Membership & Seat"
                    rows={[
                      ["Plan", selectedPlan?.name || "-"],
                      [
                        "Validity",
                        `${formatDisplayDate(startDate)} - ${formatDisplayDate(
                          endDate,
                        )}`,
                      ],
                      [
                        "Slot",
                        selectedSlot
                          ? `${selectedSlot.name} · ${formatTime(
                              selectedSlot.startTime,
                            )} - ${formatTime(selectedSlot.endTime)}`
                          : "-",
                      ],
                      ["Floor", selectedFloor?.name || "-"],
                      [
                        "Seat",
                        selectedSeat
                          ? `${selectedSeat.seatNumber} · ${formatEnum(
                              selectedSeat.seatType,
                            )}`
                          : "-",
                      ],
                    ]}
                  />

                  <ReviewSection
                    title="Payment"
                    rows={[
                      ["Original Amount", formatMoney(originalAmount)],
                      ["Coupon Discount", `-${formatMoney(discountAmount)}`],
                      ["Final Payable", formatMoney(finalAmount)],
                      ["Amount Received", formatMoney(amountReceived)],
                      ["Payment Method", formatEnum(paymentMethod)],
                      ["Payment Date", formatDisplayDate(paymentDate)],
                    ]}
                  />

                  <Alert severity="warning" sx={{ borderRadius: 2.4 }}>
                    The backend will re-check seat availability across the full
                    membership range, member eligibility, pricing and coupon
                    validity before committing the transaction.
                  </Alert>
                </Stack>
              )}
            </CardContent>
          </Card>

          <Stack direction="row" justifyContent="space-between" mt={2.5}>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              disabled={activeStep === 0 || creating}
              onClick={handleBack}
            >
              Back
            </Button>

            {activeStep < STEPS.length - 1 ? (
              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                disabled={loadingContext || creating}
                onClick={handleNext}
              >
                Continue
              </Button>
            ) : (
              <Button
                variant="contained"
                startIcon={
                  creating ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <CheckCircle />
                  )
                }
                disabled={creating}
                onClick={handleCreateBooking}
              >
                {creating ? "Creating Booking..." : "Confirm Manual Booking"}
              </Button>
            )}
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            variant="outlined"
            sx={{
              position: { lg: "sticky" },
              top: { lg: 92 },
              borderRadius: 3.2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={850}>
                Booking Summary
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.4}>
                Live preview of the manual booking.
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Stack spacing={2.15}>
                <SummaryItem
                  label="Library"
                  value={selectedLibrary?.name || "Not selected"}
                />
                <SummaryItem
                  label="Member"
                  value={
                    effectiveMemberName === "-"
                      ? "Not selected"
                      : effectiveMemberName
                  }
                />

                <SummaryItem
                  label="Gender"
                  value={
                    effectiveMemberGender
                      ? formatEnum(effectiveMemberGender)
                      : "Not selected"
                  }
                />

                <SummaryItem
                  label="Membership"
                  value={selectedPlan?.name || "Not selected"}
                />
                <SummaryItem
                  label="Validity"
                  value={
                    selectedPlan && startDate
                      ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(
                          endDate,
                        )}`
                      : "Not selected"
                  }
                />
                <SummaryItem
                  label="Slot"
                  value={
                    selectedSlot
                      ? `${selectedSlot.name} · ${formatTime(
                          selectedSlot.startTime,
                        )}-${formatTime(selectedSlot.endTime)}`
                      : "Not selected"
                  }
                />
                <SummaryItem
                  label="Floor"
                  value={selectedFloor?.name || "Not selected"}
                />
                <SummaryItem
                  label="Seat"
                  value={
                    selectedSeat
                      ? `${selectedSeat.seatNumber} · ${formatEnum(
                          selectedSeat.seatType,
                        )}`
                      : "Not selected"
                  }
                />

                <Divider />

                <SummaryItem
                  label="Original Amount"
                  value={formatMoney(originalAmount)}
                />

                {appliedCoupon && (
                  <SummaryItem
                    label={`Coupon ${appliedCoupon.code || ""}`}
                    value={`-${formatMoney(discountAmount)}`}
                    success
                  />
                )}

                <SummaryItem
                  label="Final Payable"
                  value={formatMoney(finalAmount)}
                  strong
                />

                <Divider />

                <SummaryItem
                  label="Payment"
                  value={formatEnum(paymentMethod)}
                />

                <Alert
                  severity="info"
                  icon={<Schedule />}
                  sx={{ borderRadius: 2.2 }}
                >
                  Final pricing and availability are revalidated by the backend.
                </Alert>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function SectionTitle({ icon, title, subtitle }) {
  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "rgba(79,70,229,0.08)",
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="h6" fontWeight={850}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>
    </Stack>
  );
}

function SummaryItem({ label, value, strong = false, success = false }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant={strong ? "subtitle1" : "body2"}
        fontWeight={strong ? 850 : 700}
        color={
          success ? "success.main" : strong ? "primary.main" : "text.primary"
        }
        mt={0.25}
      >
        {value}
      </Typography>
    </Box>
  );
}

function PriceRow({
  label,
  value,
  strong = false,
  success = false,
  primary = false,
}) {
  const numeric = Number(value ?? 0);

  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography
        variant={strong ? "subtitle1" : "body2"}
        fontWeight={strong ? 800 : 500}
      >
        {label}
      </Typography>
      <Typography
        variant={strong ? "subtitle1" : "body2"}
        fontWeight={strong ? 900 : 750}
        color={
          success ? "success.main" : primary ? "primary.main" : "text.primary"
        }
      >
        {numeric < 0
          ? `-${formatMoney(Math.abs(numeric))}`
          : formatMoney(numeric)}
      </Typography>
    </Stack>
  );
}

function ReviewSection({ title, rows }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.3, borderRadius: 2.7 }}>
      <Typography variant="subtitle1" fontWeight={850} mb={1.6}>
        {title}
      </Typography>

      <Stack spacing={1.15}>
        {rows.map(([label, value]) => (
          <Stack
            key={label}
            direction="row"
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2" fontWeight={700} textAlign="right">
              {value}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Paper>
  );
}

function ResultItem({ label, value }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography fontWeight={800} mt={0.4}>
        {value}
      </Typography>
    </Paper>
  );
}

export default CreateBooking;
