import {
  ArrowBackRounded,
  ArrowForwardRounded,
  CalendarMonthRounded,
  ChairAltRounded,
  CheckCircleRounded,
  EventSeatRounded,
  LoginRounded,
  RefreshRounded,
  ScheduleRounded,
  VerifiedRounded,
  WorkspacePremiumRounded,
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
  Container,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import bookingApi from "../../api/bookingApi";
import qrCampaignApi from "../../api/qrCampaignApi";
import libraryApi from "../../api/libraryApi";
import membershipPlanApi from "../../api/membershipPlanApi";
import seatApi from "../../api/seatApi";
import seatPriceQuoteApi from "../../api/seatPriceQuoteApi";
import slotApi from "../../api/slotApi";

import SeatMap from "./components/SeatMap";

// ============================================================
// SEAT STATUS COLORS
// ============================================================

const SEAT_STATUS_COLORS = {
  AVAILABLE: "#16A34A",
  BOOKED: "#DC2626",
  RESERVED: "#2563EB",
  RESERVED_FOR_GIRLS: "#DB2777",
  MAINTENANCE: "#64748B",
  UNAVAILABLE: "#94A3B8",
};

// ============================================================
// DATE HELPERS
// ============================================================

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const addDaysInclusive = (startDate, durationDays) => {
  if (!startDate || !durationDays || Number(durationDays) <= 0) {
    return "";
  }

  const date = new Date(`${startDate}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  date.setDate(date.getDate() + Number(durationDays) - 1);

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) {
    return "";
  }

  const raw = String(value).slice(0, 5);

  const [hourValue, minute] = raw.split(":");

  const hour = Number(hourValue);

  if (Number.isNaN(hour) || !minute) {
    return raw;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
};

// ============================================================
// GENERAL HELPERS
// ============================================================

const normalizeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.seats)) {
    return response.seats;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const formatEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const roundMoney = (value) => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return Math.round((amount + Number.EPSILON) * 100) / 100;
};

const formatMoney = (value) => {
  return `₹${roundMoney(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message || data?.error || data?.detail || error?.message || fallback
  );
};

// ============================================================
// SEAT HELPERS
// ============================================================

const getSeatId = (seat) => {
  return seat?.seatId ?? seat?.id ?? null;
};

const getSeatNumber = (seat) => {
  return seat?.seatNumber ?? seat?.number ?? getSeatId(seat) ?? "-";
};

const getSeatStatus = (seat) => {
  if (seat?.booked === true) {
    return "BOOKED";
  }

  const status = String(
    seat?.availabilityStatus || seat?.status || seat?.physicalStatus || "",
  )
    .trim()
    .toUpperCase();

  if (status === "OCCUPIED") {
    return "BOOKED";
  }

  return status || "UNAVAILABLE";
};

const normalizeSeat = (seat) => {
  return {
    ...seat,

    id: getSeatId(seat),

    seatId: getSeatId(seat),

    seatNumber: getSeatNumber(seat),

    status: getSeatStatus(seat),
  };
};

const getSeatFeatureValue = (feature) => {
  if (typeof feature === "string") {
    return feature;
  }

  return feature?.feature || feature?.seatFeature || feature?.name || "";
};

// ============================================================
// PUBLIC SEAT BASE PRICE
// ============================================================
//
// IMPORTANT:
//
// plan.price is legacy/default NORMAL pricing.
//
// It must NOT be used as fallback for:
//
// PREMIUM
// WINDOW
// QUIET_ZONE
// FEMALE_ONLY
//
// ============================================================

const resolvePublicSeatBasePrice = (plan, seat) => {
  if (!plan || !seat) {
    return null;
  }

  const seatType = String(seat?.seatType || "NORMAL")
    .trim()
    .toUpperCase();

  // ==========================================================
  // CONFIGURED SEAT TYPE PRICE
  // ==========================================================

  const configuredPrice = Array.isArray(plan?.seatPrices)
    ? plan.seatPrices.find(
        (item) =>
          item?.active !== false &&
          String(item?.seatType || "")
            .trim()
            .toUpperCase() === seatType,
      )
    : null;

  if (configuredPrice?.price != null) {
    const amount = Number(configuredPrice.price);

    if (Number.isFinite(amount)) {
      return roundMoney(amount);
    }
  }

  // ==========================================================
  // LEGACY FALLBACK ONLY FOR NORMAL
  // ==========================================================

  if (seatType === "NORMAL") {
    const legacyPrice = Number(plan?.price);

    if (Number.isFinite(legacyPrice)) {
      return roundMoney(legacyPrice);
    }
  }

  return null;
};

// ============================================================
// PUBLIC FEATURE SURCHARGE
// ============================================================

const resolvePublicFeatureSurcharge = (plan, seat) => {
  if (!plan || !seat) {
    return 0;
  }

  const seatFeatures = new Set(
    (Array.isArray(seat?.features) ? seat.features : [])
      .map(getSeatFeatureValue)
      .filter(Boolean)
      .map((feature) => String(feature).trim().toUpperCase()),
  );

  if (seatFeatures.size === 0 || !Array.isArray(plan?.featurePrices)) {
    return 0;
  }

  const total = plan.featurePrices
    .filter(
      (item) =>
        item?.active !== false &&
        seatFeatures.has(
          String(item?.seatFeature || "")
            .trim()
            .toUpperCase(),
        ),
    )
    .reduce((sum, item) => {
      const amount = Number(item?.additionalPrice ?? 0);

      return sum + (Number.isFinite(amount) ? amount : 0);
    }, 0);

  return roundMoney(total);
};

// ============================================================
// PLAN STARTING PRICE
// ============================================================

const getPlanStartingPrice = (plan) => {
  if (!plan) {
    return null;
  }

  const values = [];

  const legacyNormal = Number(plan?.price);

  if (Number.isFinite(legacyNormal) && legacyNormal > 0) {
    values.push(legacyNormal);
  }

  if (Array.isArray(plan?.seatPrices)) {
    plan.seatPrices
      .filter((item) => item?.active !== false)
      .forEach((item) => {
        const amount = Number(item?.price);

        if (Number.isFinite(amount) && amount > 0) {
          values.push(amount);
        }
      });
  }

  if (values.length === 0) {
    return null;
  }

  return Math.min(...values);
};

// ============================================================
// LOADING PAGE
// ============================================================

function LoadingPage() {
  return (
    <Box
      sx={{
        minHeight: "72vh",
        display: "grid",
        placeItems: "center",
        bgcolor: "#F7F9FC",
      }}
    >
      <Stack spacing={2} alignItems="center">
        <CircularProgress />

        <Typography color="text.secondary" fontWeight={650}>
          Preparing your seat selection...
        </Typography>
      </Stack>
    </Box>
  );
}

// ============================================================
// SECTION HEADER
// ============================================================

function SectionHeader({ number, icon, title, description, complete = false }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Avatar
        sx={{
          width: 44,
          height: 44,

          bgcolor: complete
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.primary.main, 0.08),

          color: complete ? "success.main" : "primary.main",
        }}
      >
        {complete ? <CheckCircleRounded /> : icon}
      </Avatar>

      <Box>
        <Typography variant="caption" color="text.secondary" fontWeight={800}>
          STEP {number}
        </Typography>

        <Typography variant="h6" fontWeight={850} lineHeight={1.2}>
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.3,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

// ============================================================
// SELECTION CARD
// ============================================================

function SelectionCard({
  selected,
  title,
  subtitle,
  description,
  badge,
  icon,
  onClick,
  disabled = false,
}) {
  const theme = useTheme();

  return (
    <Paper
      component="button"
      type="button"
      elevation={0}
      disabled={disabled}
      onClick={onClick}
      sx={{
        appearance: "none",
        width: "100%",
        p: 2,
        minHeight: 145,
        textAlign: "left",
        borderRadius: 3,

        border: selected ? "2px solid" : "1px solid",

        borderColor: selected
          ? "primary.main"
          : alpha(theme.palette.divider, 0.9),

        bgcolor: selected
          ? alpha(theme.palette.primary.main, 0.05)
          : "background.paper",

        cursor: disabled ? "not-allowed" : "pointer",

        opacity: disabled ? 0.55 : 1,

        boxShadow: selected
          ? `0 10px 28px ${alpha(theme.palette.primary.main, 0.12)}`
          : "none",

        transition: "all .2s ease",

        "&:hover": disabled
          ? {}
          : {
              transform: "translateY(-3px)",

              borderColor: "primary.main",

              boxShadow: `0 12px 30px ${alpha(
                theme.palette.primary.main,
                0.1,
              )}`,
            },
      }}
    >
      <Stack direction="row" spacing={1.3}>
        <Avatar
          sx={{
            width: 43,
            height: 43,
            flexShrink: 0,

            bgcolor: selected
              ? "primary.main"
              : alpha(theme.palette.primary.main, 0.08),

            color: selected ? "#fff" : "primary.main",
          }}
        >
          {icon}
        </Avatar>

        <Box flex={1} minWidth={0}>
          <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography fontWeight={850}>{title}</Typography>

            {selected && (
              <CheckCircleRounded
                color="primary"
                sx={{
                  fontSize: 19,
                }}
              />
            )}
          </Stack>

          {subtitle && (
            <Typography
              variant="body2"
              color="primary.main"
              fontWeight={750}
              sx={{
                mt: 0.45,
              }}
            >
              {subtitle}
            </Typography>
          )}

          {description && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 0.6,
                lineHeight: 1.45,
              }}
            >
              {description}
            </Typography>
          )}

          {badge && (
            <Chip
              size="small"
              label={badge}
              variant="outlined"
              sx={{
                mt: 1.1,
                height: 24,
                fontWeight: 700,
              }}
            />
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// SUMMARY ROW
// ============================================================

function SummaryRow({ label, value, valueColor, strong = false }) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="flex-start"
      spacing={2}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        fontWeight={strong ? 700 : 400}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={strong ? 850 : 750}
        color={valueColor || "text.primary"}
        textAlign="right"
      >
        {value || "-"}
      </Typography>
    </Stack>
  );
}

// ============================================================
// MAIN
// ============================================================

function SeatAvailability() {
  const theme = useTheme();

  const navigate = useNavigate();

  const location = useLocation();

  const { libraryId } = useParams();

  const { isAuthenticated } = useAuth();

  // ==========================================================
  // ROUTE / QR ATTRIBUTION STATE
  // ==========================================================
  //
  // DIRECT_BOOKING campaign URLs may contain:
  //
  // ?membershipPlanId=8
  // &floorId=2
  // &slotId=1
  // &seatId=146
  // &date=2026-10-19
  // &qr=K7M4PX9Q
  // &qrs=<secure-scan-token>
  //
  // location.state remains supported so the existing login restore
  // flow continues to work. Query parameters take precedence.
  // ==========================================================

  const routeSearchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const qrCampaignCode = useMemo(() => {
    const value =
      routeSearchParams.get("qr") ||
      location.state?.qrCampaignCode ||
      location.state?.qr ||
      "";

    return String(value).trim().toUpperCase() || null;
  }, [routeSearchParams, location.state]);

  const qrScanToken = useMemo(() => {
    const value =
      routeSearchParams.get("qrs") ||
      location.state?.qrScanToken ||
      location.state?.qrs ||
      "";

    return String(value).trim() || null;
  }, [routeSearchParams, location.state]);

  const initialPlanId =
    routeSearchParams.get("membershipPlanId") ||
    (location.state?.membershipPlanId
      ? String(location.state.membershipPlanId)
      : "");

  const initialFloorId =
    routeSearchParams.get("floorId") ||
    (location.state?.floorId ? String(location.state.floorId) : "");

  const initialSlotId =
    routeSearchParams.get("slotId") ||
    (location.state?.slotId ? String(location.state.slotId) : "");

  const initialSeatId =
    routeSearchParams.get("seatId") ||
    (location.state?.seatId ? String(location.state.seatId) : "");

  const initialDate =
    routeSearchParams.get("date") ||
    routeSearchParams.get("startDate") ||
    location.state?.startDate ||
    location.state?.date ||
    getToday();

  // ==========================================================
  // CORE STATE
  // ==========================================================

  const [library, setLibrary] = useState(null);

  const [plans, setPlans] = useState([]);

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);

  const [floors, setFloors] = useState([]);

  const [selectedFloorId, setSelectedFloorId] = useState(initialFloorId);

  const [slots, setSlots] = useState([]);

  const [selectedSlotId, setSelectedSlotId] = useState(initialSlotId);

  const [selectedDate, setSelectedDate] = useState(initialDate);

  const [floorLayout, setFloorLayout] = useState(null);

  const [seats, setSeats] = useState([]);

  const [selectedSeat, setSelectedSeat] = useState(null);

  // ==========================================================
  // PRICE QUOTE
  // ==========================================================

  const [seatPriceQuote, setSeatPriceQuote] = useState(null);

  const [loadingPriceQuote, setLoadingPriceQuote] = useState(false);

  const [priceQuoteError, setPriceQuoteError] = useState("");

  // ==========================================================
  // UI STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);

  const [loadingLayout, setLoadingLayout] = useState(false);

  const [loadingSeats, setLoadingSeats] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [bookingLoading, setBookingLoading] = useState(false);

  const [unavailable, setUnavailable] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const restoreSeatRef = useRef(false);

  // Prevent repeated QR seat auto-selection and duplicate conversion calls.
  const qrSeatPreselectionRef = useRef(false);
  const qrBookingStartedRef = useRef(false);

  // ==========================================================
  // SELECTED ENTITIES
  // ==========================================================

  const selectedPlan = useMemo(
    () =>
      plans.find((plan) => String(plan.id) === String(selectedPlanId)) || null,
    [plans, selectedPlanId],
  );

  const selectedFloor = useMemo(
    () =>
      floors.find((floor) => String(floor.id) === String(selectedFloorId)) ||
      null,
    [floors, selectedFloorId],
  );

  const selectedSlot = useMemo(
    () =>
      slots.find((slot) => String(slot.id) === String(selectedSlotId)) || null,
    [slots, selectedSlotId],
  );

  // ==========================================================
  // END DATE
  // ==========================================================

  const endDate = useMemo(
    () => addDaysInclusive(selectedDate, selectedPlan?.durationDays),
    [selectedDate, selectedPlan],
  );

  // ==========================================================
  // PUBLIC ESTIMATE
  // ==========================================================

  const estimatedBasePrice = useMemo(
    () => resolvePublicSeatBasePrice(selectedPlan, selectedSeat),
    [selectedPlan, selectedSeat],
  );

  const estimatedFeatureSurcharge = useMemo(
    () => resolvePublicFeatureSurcharge(selectedPlan, selectedSeat),
    [selectedPlan, selectedSeat],
  );

  const estimatedTotalPrice = useMemo(() => {
    if (estimatedBasePrice == null) {
      return null;
    }

    return roundMoney(estimatedBasePrice + estimatedFeatureSurcharge);
  }, [estimatedBasePrice, estimatedFeatureSurcharge]);

  // ==========================================================
  // QUOTE MATCHING
  // ==========================================================

  const quoteMatchesSelection = useMemo(() => {
    if (!seatPriceQuote || !selectedPlan || !selectedSeat) {
      return false;
    }

    return (
      String(seatPriceQuote.libraryId) === String(libraryId) &&
      String(seatPriceQuote.membershipPlanId) === String(selectedPlan.id) &&
      String(seatPriceQuote.seatId) === String(getSeatId(selectedSeat))
    );
  }, [seatPriceQuote, selectedPlan, selectedSeat, libraryId]);

  // ==========================================================
  // AUTHORITATIVE QUOTE VALUES
  // ==========================================================

  const standardBasePrice = useMemo(() => {
    if (!quoteMatchesSelection) {
      return null;
    }

    const value = Number(seatPriceQuote?.standardBasePrice);

    return Number.isFinite(value) ? roundMoney(value) : null;
  }, [seatPriceQuote, quoteMatchesSelection]);

  const memberBasePrice = useMemo(() => {
    if (!quoteMatchesSelection) {
      return null;
    }

    const value = Number(seatPriceQuote?.memberBasePrice);

    return Number.isFinite(value) ? roundMoney(value) : null;
  }, [seatPriceQuote, quoteMatchesSelection]);

  const memberPricingApplied =
    quoteMatchesSelection && Boolean(seatPriceQuote?.memberPricingApplied);

  const effectiveBasePrice =
    memberPricingApplied && memberBasePrice != null
      ? memberBasePrice
      : standardBasePrice;

  const authoritativeFeatureSurcharge = useMemo(() => {
    if (!quoteMatchesSelection) {
      return 0;
    }

    const value = Number(seatPriceQuote?.featureSurcharge);

    return Number.isFinite(value) ? roundMoney(value) : 0;
  }, [seatPriceQuote, quoteMatchesSelection]);

  const authoritativeSeatPrice = useMemo(() => {
    if (!quoteMatchesSelection) {
      return null;
    }

    const value = Number(seatPriceQuote?.effectivePrice);

    return Number.isFinite(value) ? roundMoney(value) : null;
  }, [seatPriceQuote, quoteMatchesSelection]);

  const quotedFeatures = useMemo(() => {
    if (
      !quoteMatchesSelection ||
      !Array.isArray(seatPriceQuote?.featurePrices)
    ) {
      return [];
    }

    return seatPriceQuote.featurePrices;
  }, [seatPriceQuote, quoteMatchesSelection]);

  const displayedPrice =
    isAuthenticated && authoritativeSeatPrice != null
      ? authoritativeSeatPrice
      : estimatedTotalPrice;

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  const loadInitialData = useCallback(async () => {
    if (!libraryId) {
      return;
    }

    try {
      setLoading(true);

      setUnavailable(false);

      setError("");

      const [libraryResponse, plansResponse, floorsResponse, slotsResponse] =
        await Promise.all([
          libraryApi.getLibraryDetails(libraryId),

          membershipPlanApi.getActivePlans(libraryId),

          seatApi.getFloors(libraryId),

          slotApi.getActiveSlots(libraryId),
        ]);

      setLibrary(libraryResponse || null);

      // ======================================================
      // PLANS
      // ======================================================

      const planList = normalizeList(plansResponse).filter(
        (plan) => plan?.active !== false,
      );

      setPlans(planList);

      setSelectedPlanId((current) => {
        if (
          current &&
          planList.some((plan) => String(plan.id) === String(current))
        ) {
          return current;
        }

        return planList[0]?.id ? String(planList[0].id) : "";
      });

      // ======================================================
      // FLOORS
      // ======================================================

      const floorList = normalizeList(floorsResponse);

      setFloors(floorList);

      setSelectedFloorId((current) => {
        if (
          current &&
          floorList.some((floor) => String(floor.id) === String(current))
        ) {
          return current;
        }

        return floorList[0]?.id ? String(floorList[0].id) : "";
      });

      // ======================================================
      // SLOTS
      // ======================================================

      const slotList = normalizeList(slotsResponse);

      setSlots(slotList);

      setSelectedSlotId((current) => {
        if (
          current &&
          slotList.some((slot) => String(slot.id) === String(current))
        ) {
          return current;
        }

        return slotList[0]?.id ? String(slotList[0].id) : "";
      });
    } catch (requestError) {
      console.error(
        "Unable to load public booking configuration:",
        requestError,
      );

      if (requestError?.response?.status === 404) {
        setUnavailable(true);

        return;
      }

      setError(
        getErrorMessage(requestError, "Unable to load booking information."),
      );
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ==========================================================
  // FLOOR LAYOUT
  // ==========================================================

  const loadFloorLayout = useCallback(async () => {
    if (!libraryId || !selectedFloorId) {
      setFloorLayout(null);

      return null;
    }

    try {
      setLoadingLayout(true);

      const response = await seatApi.getFloorLayout(libraryId, selectedFloorId);

      setFloorLayout(response || null);

      return response;
    } catch (requestError) {
      console.error("Unable to load floor layout:", requestError);

      setFloorLayout(null);

      return null;
    } finally {
      setLoadingLayout(false);
    }
  }, [libraryId, selectedFloorId]);

  useEffect(() => {
    loadFloorLayout();
  }, [loadFloorLayout]);

  // ==========================================================
  // LIVE AVAILABILITY
  // ==========================================================

  const loadAvailability = useCallback(async () => {
    if (!libraryId || !selectedFloorId || !selectedSlotId || !selectedDate) {
      setSeats([]);

      setSelectedSeat(null);

      return [];
    }

    try {
      setLoadingSeats(true);

      setError("");

      const response = await seatApi.getSeatAvailability(
        libraryId,
        Number(selectedFloorId),
        Number(selectedSlotId),
        selectedDate,
      );

      const list = normalizeList(response).map(normalizeSeat);

      setSeats(list);

      setSelectedSeat((currentSeat) => {
        if (!currentSeat) {
          return null;
        }

        const updated = list.find(
          (seat) => String(getSeatId(seat)) === String(getSeatId(currentSeat)),
        );

        if (!updated || getSeatStatus(updated) !== "AVAILABLE") {
          return null;
        }

        return updated;
      });

      return list;
    } catch (requestError) {
      console.error("Unable to load seat availability:", requestError);

      setSeats([]);

      setSelectedSeat(null);

      setError(
        getErrorMessage(requestError, "Unable to load seat availability."),
      );

      return [];
    } finally {
      setLoadingSeats(false);
    }
  }, [libraryId, selectedFloorId, selectedSlotId, selectedDate]);

  useEffect(() => {
    if (loading || unavailable) {
      return;
    }

    loadAvailability();
  }, [loading, unavailable, loadAvailability]);

  // ==========================================================
  // AUTHORITATIVE PRICE QUOTE
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadQuote = async () => {
      if (
        !isAuthenticated ||
        !libraryId ||
        !selectedPlan?.id ||
        !selectedSeat
      ) {
        setSeatPriceQuote(null);

        setPriceQuoteError("");

        setLoadingPriceQuote(false);

        return;
      }

      const seatId = getSeatId(selectedSeat);

      if (!seatId) {
        return;
      }

      try {
        setLoadingPriceQuote(true);

        setSeatPriceQuote(null);

        setPriceQuoteError("");

        const response = await seatPriceQuoteApi.getSeatQuote({
          libraryId: Number(libraryId),

          membershipPlanId: Number(selectedPlan.id),

          seatId: Number(seatId),
        });

        if (!active) {
          return;
        }

        setSeatPriceQuote(response || null);
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error("Unable to load authoritative seat price:", requestError);

        setSeatPriceQuote(null);

        setPriceQuoteError(
          getErrorMessage(
            requestError,
            "Unable to calculate your personalized seat price.",
          ),
        );
      } finally {
        if (active) {
          setLoadingPriceQuote(false);
        }
      }
    };

    loadQuote();

    return () => {
      active = false;
    };
  }, [isAuthenticated, libraryId, selectedPlan?.id, selectedSeat]);

  // ==========================================================
  // BUILD ATTRIBUTION-PRESERVING SEAT URL
  // ==========================================================

  const buildSeatPageUrl = useCallback(
    ({ includeSelection = true } = {}) => {
      const params = new URLSearchParams();

      if (includeSelection) {
        if (selectedPlanId) {
          params.set("membershipPlanId", String(selectedPlanId));
        }

        if (selectedFloorId) {
          params.set("floorId", String(selectedFloorId));
        }

        if (selectedSlotId) {
          params.set("slotId", String(selectedSlotId));
        }

        if (selectedSeat) {
          params.set("seatId", String(getSeatId(selectedSeat)));
        } else if (initialSeatId) {
          params.set("seatId", String(initialSeatId));
        }

        if (selectedDate) {
          params.set("date", selectedDate);
        }
      }

      if (qrCampaignCode) {
        params.set("qr", qrCampaignCode);
      }

      if (qrScanToken) {
        params.set("qrs", qrScanToken);
      }

      const query = params.toString();

      return `/libraries/${libraryId}/seats${query ? `?${query}` : ""}`;
    },
    [
      libraryId,
      selectedPlanId,
      selectedFloorId,
      selectedSlotId,
      selectedSeat,
      initialSeatId,
      selectedDate,
      qrCampaignCode,
      qrScanToken,
    ],
  );

  // ==========================================================
  // QR DIRECT-BOOKING SEAT PRESELECTION
  // ==========================================================
  //
  // If a campaign contains seatId, select that seat automatically once
  // live availability has loaded. We still verify that it is AVAILABLE.
  // ==========================================================

  useEffect(() => {
    if (qrSeatPreselectionRef.current || !initialSeatId || seats.length === 0) {
      return;
    }

    qrSeatPreselectionRef.current = true;

    const qrSeat = seats.find(
      (seat) => String(getSeatId(seat)) === String(initialSeatId),
    );

    if (qrSeat && getSeatStatus(qrSeat) === "AVAILABLE") {
      setSelectedSeat(qrSeat);
      setSeatPriceQuote(null);
      setPriceQuoteError("");

      if (qrCampaignCode) {
        setSuccess(
          `Seat ${getSeatNumber(qrSeat)} was preselected from the QR campaign.`,
        );
      }
    } else if (qrCampaignCode) {
      setError(
        "The seat linked to this QR campaign is no longer available. Please choose another seat.",
      );
    }
  }, [seats, initialSeatId, qrCampaignCode]);

  // ==========================================================
  // RESTORE SEAT AFTER LOGIN / REGISTER
  // ==========================================================

  useEffect(() => {
    if (
      !isAuthenticated ||
      restoreSeatRef.current ||
      location.state?.action !== "BOOK_SEAT" ||
      !location.state?.seatId ||
      seats.length === 0
    ) {
      return;
    }

    restoreSeatRef.current = true;

    const restoredSeat = seats.find(
      (seat) => String(getSeatId(seat)) === String(location.state.seatId),
    );

    if (restoredSeat && getSeatStatus(restoredSeat) === "AVAILABLE") {
      setSelectedSeat(restoredSeat);

      setSuccess(
        `Seat ${getSeatNumber(
          restoredSeat,
        )} is still available. Your booking selection has been restored.`,
      );
    } else {
      setError(
        "The seat selected before sign-in is no longer available. Please choose another seat.",
      );
    }

    navigate(buildSeatPageUrl(), {
      replace: true,
      state: null,
    });
  }, [isAuthenticated, seats, location.state, buildSeatPageUrl, navigate]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const seatCounts = useMemo(() => {
    return seats.reduce(
      (current, seat) => {
        const status = getSeatStatus(seat);

        current.total += 1;

        if (status === "AVAILABLE") {
          current.available += 1;
        } else if (status === "BOOKED") {
          current.booked += 1;
        } else {
          current.other += 1;
        }

        return current;
      },
      {
        total: 0,
        available: 0,
        booked: 0,
        other: 0,
      },
    );
  }, [seats]);

  // ==========================================================
  // PRICING READY
  // ==========================================================

  const pricingReady = useMemo(() => {
    if (!selectedSeat || !selectedPlan) {
      return false;
    }

    if (isAuthenticated) {
      return (
        quoteMatchesSelection &&
        authoritativeSeatPrice != null &&
        !loadingPriceQuote &&
        !priceQuoteError
      );
    }

    return estimatedTotalPrice != null;
  }, [
    selectedSeat,
    selectedPlan,
    isAuthenticated,
    quoteMatchesSelection,
    authoritativeSeatPrice,
    loadingPriceQuote,
    priceQuoteError,
    estimatedTotalPrice,
  ]);

  // ==========================================================
  // SELECT PLAN
  // ==========================================================

  const handlePlanSelect = (plan) => {
    setSelectedPlanId(String(plan.id));

    setSelectedSeat(null);

    setSeatPriceQuote(null);

    setPriceQuoteError("");

    setSuccess("");

    setError("");
  };

  // ==========================================================
  // SELECT FLOOR
  // ==========================================================

  const handleFloorSelect = (floor) => {
    setSelectedFloorId(String(floor.id));

    setSeats([]);

    setSelectedSeat(null);

    setFloorLayout(null);

    setSeatPriceQuote(null);

    setPriceQuoteError("");

    setSuccess("");

    setError("");
  };

  // ==========================================================
  // SELECT SLOT
  // ==========================================================

  const handleSlotSelect = (slot) => {
    setSelectedSlotId(String(slot.id));

    setSeats([]);

    setSelectedSeat(null);

    setSeatPriceQuote(null);

    setPriceQuoteError("");

    setSuccess("");

    setError("");
  };

  // ==========================================================
  // DATE CHANGE
  // ==========================================================

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);

    setSelectedSeat(null);

    setSeatPriceQuote(null);

    setPriceQuoteError("");

    setSuccess("");

    setError("");
  };

  // ==========================================================
  // SELECT SEAT
  // ==========================================================

  const handleSeatSelect = (seat) => {
    const normalizedSeat = normalizeSeat(seat);

    if (getSeatStatus(normalizedSeat) !== "AVAILABLE") {
      return;
    }

    setSelectedSeat(normalizedSeat);

    setSeatPriceQuote(null);

    setPriceQuoteError("");

    setSuccess("");

    setError("");
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await Promise.all([loadFloorLayout(), loadAvailability()]);
    } finally {
      setRefreshing(false);
    }
  };

  // ==========================================================
  // SELECTION COMPLETE
  // ==========================================================

  const selectionComplete = Boolean(
    selectedPlan &&
    selectedFloor &&
    selectedSlot &&
    selectedDate &&
    selectedSeat,
  );

  // ==========================================================
  // VALIDATE
  // ==========================================================

  const validateSelection = () => {
    if (!selectedPlan) {
      setError("Please select a membership plan.");

      return false;
    }

    if (!selectedFloor) {
      setError("Please select a floor.");

      return false;
    }

    if (!selectedSlot) {
      setError("Please select a booking slot.");

      return false;
    }

    if (!selectedDate) {
      setError("Please select a membership start date.");

      return false;
    }

    if (!endDate) {
      setError("Unable to determine the membership end date.");

      return false;
    }

    if (!selectedSeat) {
      setError("Please select an available seat.");

      return false;
    }

    if (getSeatStatus(selectedSeat) !== "AVAILABLE") {
      setError("The selected seat is no longer available.");

      return false;
    }

    if (!isAuthenticated && estimatedTotalPrice == null) {
      setError(
        `${formatEnum(
          selectedSeat?.seatType,
        )} pricing has not been configured for this membership plan.`,
      );

      return false;
    }

    if (isAuthenticated && !pricingReady) {
      setError(
        "Your verified seat price is not available yet. Please wait for price verification.",
      );

      return false;
    }

    return true;
  };

  // ==========================================================
  // RECORD QR BOOKING START
  // ==========================================================
  //
  // Analytics must never block a real booking. Failure is logged only.
  // Backend conversion recording is idempotent.
  // ==========================================================

  const recordQrBookingStarted = async () => {
    if (!qrScanToken || qrBookingStartedRef.current) {
      return;
    }

    try {
      await qrCampaignApi.recordBookingStarted(qrScanToken);
      qrBookingStartedRef.current = true;
    } catch (trackingError) {
      console.warn(
        "Unable to record QR booking-start conversion:",
        trackingError,
      );
    }
  };

  // ==========================================================
  // REDIRECT TO LOGIN
  // ==========================================================

  const redirectToLogin = () => {
    const returnUrl = buildSeatPageUrl();

    navigate("/login", {
      state: {
        from: returnUrl,

        action: "BOOK_SEAT",

        libraryId: Number(libraryId),

        membershipPlanId: Number(selectedPlan.id),

        membershipPlanName: selectedPlan.name,

        floorId: Number(selectedFloor.id),

        slotId: Number(selectedSlot.id),

        seatId: Number(getSeatId(selectedSeat)),

        date: selectedDate,

        startDate: selectedDate,

        endDate,

        // QR attribution survives login/register redirect.
        qrCampaignCode,
        qrScanToken,
        qr: qrCampaignCode,
        qrs: qrScanToken,
      },
    });
  };

  // ==========================================================
  // CREATE BOOKING + PAYMENT HANDOFF
  // ==========================================================

  const handleContinue = async () => {
    if (!validateSelection()) {
      return;
    }

    // A valid QR visitor has now meaningfully entered the booking flow.
    await recordQrBookingStarted();

    // ========================================================
    // ANONYMOUS
    // ========================================================

    if (!isAuthenticated) {
      redirectToLogin();

      return;
    }

    try {
      setBookingLoading(true);

      setError("");

      // ======================================================
      // REFRESH LIVE AVAILABILITY BEFORE BOOKING
      // ======================================================

      const currentSeats = await loadAvailability();

      const refreshedSeat = currentSeats.find(
        (seat) => String(getSeatId(seat)) === String(getSeatId(selectedSeat)),
      );

      if (!refreshedSeat || getSeatStatus(refreshedSeat) !== "AVAILABLE") {
        setSelectedSeat(null);

        setSeatPriceQuote(null);

        throw new Error(
          "The selected seat is no longer available. Please choose another seat.",
        );
      }

      // ======================================================
      // CREATE BOOKING
      // ======================================================
      //
      // IMPORTANT:
      //
      // Do NOT send:
      //
      // amount
      // estimatedTotalPrice
      // authoritativeSeatPrice
      // standardBasePrice
      // memberBasePrice
      //
      // Backend recalculates trusted pricing.
      //
      // ======================================================

      const payload = {
        seatId: Number(getSeatId(refreshedSeat)),

        slotId: Number(selectedSlot.id),

        membershipPlanId: Number(selectedPlan.id),

        startDate: selectedDate,

        endDate,
      };

      console.log("Creating public booking:", payload);

      const booking = await bookingApi.createBooking(payload);

      // ======================================================
      // BOOKING ID
      // ======================================================

      const bookingId = booking?.bookingId ?? booking?.id ?? null;

      if (!bookingId) {
        throw new Error("Booking was created but booking ID was not returned.");
      }

      // ======================================================
      // PAYMENT HANDOFF
      // ======================================================
      //
      // MembershipPayment expects a persisted booking.
      //
      // Payment:
      //
      // referenceType = BOOKING
      // referenceId   = bookingId
      //
      // ======================================================

      navigate("/student/membership/payment", {
        state: {
          paymentType: "BOOKING",

          bookingId,

          booking,

          // ================================================
          // REQUIRED PAYMENT CONTEXT
          // ================================================

          library,

          selectedSeat: refreshedSeat,

          // ================================================
          // DISPLAY CONTEXT
          // ================================================

          selectedPlan,

          selectedFloor,

          selectedSlot,

          seatPriceQuote,

          startDate: selectedDate,

          endDate,

          // ================================================
          // QR CONVERSION ATTRIBUTION
          // ================================================
          // Keep this through payment success so the final
          // booking-completed conversion can be recorded.

          qrCampaignCode,

          qrScanToken,

          qr: qrCampaignCode,

          qrs: qrScanToken,
        },
      });
    } catch (requestError) {
      console.error("Unable to create booking:", requestError);

      const status = requestError?.response?.status;

      if (status === 401) {
        redirectToLogin();

        return;
      }

      setError(
        getErrorMessage(
          requestError,
          "Unable to create booking. Please check seat availability and try again.",
        ),
      );
    } finally {
      setBookingLoading(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return <LoadingPage />;
  }

  // ==========================================================
  // UNAVAILABLE
  // ==========================================================

  if (unavailable) {
    return (
      <Box
        sx={{
          minHeight: "74vh",
          display: "grid",
          placeItems: "center",
          p: 2,
          bgcolor: "#F7F9FC",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 650,

            p: {
              xs: 3,
              sm: 5,
            },

            textAlign: "center",
            borderRadius: 5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <EventSeatRounded
            sx={{
              fontSize: 58,
              color: "text.disabled",
            }}
          />

          <Typography variant="h4" fontWeight={850} mt={2}>
            Seat Booking Unavailable
          </Typography>

          <Typography color="text.secondary" mt={1}>
            This library is not currently available for public seat booking.
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/libraries")}
            sx={{
              mt: 3,
              borderRadius: 2.5,
              fontWeight: 750,
            }}
          >
            Browse Libraries
          </Button>
        </Paper>
      </Box>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#F7F9FC",
        pb: 8,
      }}
    >
      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <Box
        sx={{
          bgcolor: "background.paper",

          borderBottom: "1px solid",

          borderColor: "divider",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 3,
              md: 4,
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBackRounded />}
                onClick={() => navigate(`/libraries/${libraryId}`)}
                sx={{
                  minHeight: 44,
                  borderRadius: 2.5,
                  fontWeight: 700,
                }}
              >
                Library
              </Button>

              <Box>
                <Stack direction="row" spacing={0.7} alignItems="center">
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,

                      letterSpacing: "-0.045em",

                      fontSize: {
                        xs: "1.65rem",
                        md: "2.1rem",
                      },
                    }}
                  >
                    Choose Your Seat
                  </Typography>

                  <VerifiedRounded
                    color="primary"
                    sx={{
                      fontSize: 21,
                    }}
                  />
                </Stack>

                <Typography color="text.secondary" mt={0.35}>
                  {library?.name || "Library"}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={
                refreshing ? <CircularProgress size={16} /> : <RefreshRounded />
              }
              disabled={refreshing}
              onClick={handleRefresh}
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
              }}
            >
              Refresh Availability
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ====================================================== */}
      {/* CONTENT */}
      {/* ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: 3,
        }}
      >
        {!isAuthenticated && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              borderRadius: 3,
            }}
          >
            Browse membership plans, floors, slots and live seat availability
            without signing in. Login is required only when you proceed with
            booking.
          </Alert>
        )}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mb: 3,
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() => setSuccess("")}
            sx={{
              mb: 3,
              borderRadius: 3,
            }}
          >
            {success}
          </Alert>
        )}

        <Grid container spacing={3} alignItems="flex-start">
          {/* ================================================== */}
          {/* LEFT */}
          {/* ================================================== */}

          <Grid
            size={{
              xs: 12,
              lg: 8,
            }}
          >
            <Stack spacing={3}>
              {/* ============================================== */}
              {/* PLAN */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 2.2,
                    md: 3,
                  },

                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <SectionHeader
                  number="1"
                  icon={<WorkspacePremiumRounded />}
                  title="Choose Membership Plan"
                  description="Choose the membership period that works for you."
                  complete={Boolean(selectedPlan)}
                />

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    mt: 2.5,
                    pb: 1,
                    overflowX: "auto",
                  }}
                >
                  {plans.map((plan) => {
                    const startingPrice = getPlanStartingPrice(plan);

                    return (
                      <Box
                        key={plan.id}
                        sx={{
                          flex: "0 0 245px",
                        }}
                      >
                        <SelectionCard
                          selected={String(plan.id) === String(selectedPlanId)}
                          icon={<WorkspacePremiumRounded />}
                          title={plan.name}
                          subtitle={
                            startingPrice != null
                              ? `${formatMoney(startingPrice)} onwards`
                              : "Select seat for pricing"
                          }
                          description={
                            plan.durationDays
                              ? `${plan.durationDays} day membership`
                              : null
                          }
                          badge={
                            plan.planType ? formatEnum(plan.planType) : null
                          }
                          onClick={() => handlePlanSelect(plan)}
                        />
                      </Box>
                    );
                  })}
                </Box>

                {plans.length === 0 && (
                  <Alert
                    severity="warning"
                    sx={{
                      mt: 2,
                    }}
                  >
                    No active membership plans are currently available.
                  </Alert>
                )}
              </Paper>

              {/* ============================================== */}
              {/* FLOOR */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 2.2,
                    md: 3,
                  },

                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <SectionHeader
                  number="2"
                  icon={<EventSeatRounded />}
                  title="Choose Floor"
                  description="Select the floor where you want to study."
                  complete={Boolean(selectedFloor)}
                />

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    mt: 2.5,
                    overflowX: "auto",
                    pb: 1,
                  }}
                >
                  {floors.map((floor) => (
                    <Box
                      key={floor.id}
                      sx={{
                        flex: "0 0 215px",
                      }}
                    >
                      <SelectionCard
                        selected={String(floor.id) === String(selectedFloorId)}
                        icon={<EventSeatRounded />}
                        title={floor.name || `Floor ${floor.floorNumber ?? ""}`}
                        subtitle={
                          floor.floorNumber != null
                            ? `Floor ${floor.floorNumber}`
                            : null
                        }
                        description="View the actual physical floor layout."
                        onClick={() => handleFloorSelect(floor)}
                      />
                    </Box>
                  ))}
                </Box>

                {floors.length === 0 && (
                  <Alert
                    severity="warning"
                    sx={{
                      mt: 2,
                    }}
                  >
                    No floors have been configured for this library.
                  </Alert>
                )}
              </Paper>

              {/* ============================================== */}
              {/* SLOT + DATE */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 2.2,
                    md: 3,
                  },

                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <SectionHeader
                  number="3"
                  icon={<ScheduleRounded />}
                  title="Choose Slot & Date"
                  description="Availability is calculated for this exact slot and start date."
                  complete={Boolean(selectedSlot && selectedDate)}
                />

                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    mt: 2.5,
                    overflowX: "auto",
                    pb: 1,
                  }}
                >
                  {slots.map((slot) => (
                    <Box
                      key={slot.id}
                      sx={{
                        flex: "0 0 235px",
                      }}
                    >
                      <SelectionCard
                        selected={String(slot.id) === String(selectedSlotId)}
                        icon={<ScheduleRounded />}
                        title={slot.name || "Booking Slot"}
                        subtitle={
                          slot.startTime && slot.endTime
                            ? `${formatTime(slot.startTime)} – ${formatTime(
                                slot.endTime,
                              )}`
                            : null
                        }
                        description="See which seats are available in this slot."
                        onClick={() => handleSlotSelect(slot)}
                      />
                    </Box>
                  ))}
                </Box>

                {slots.length === 0 && (
                  <Alert
                    severity="warning"
                    sx={{
                      mt: 2,
                    }}
                  >
                    No active booking slots are currently available.
                  </Alert>
                )}

                <Divider
                  sx={{
                    my: 2.5,
                  }}
                />

                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <TextField
                      fullWidth
                      type="date"
                      label="Membership Start Date"
                      value={selectedDate}
                      onChange={handleDateChange}
                      slotProps={{
                        inputLabel: {
                          shrink: true,
                        },

                        htmlInput: {
                          min: getToday(),
                        },
                      }}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.6,
                        height: "100%",
                        borderRadius: 2.5,

                        bgcolor: alpha(theme.palette.primary.main, 0.045),

                        border: "1px solid",

                        borderColor: alpha(theme.palette.primary.main, 0.12),
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Membership Period
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                        mt={0.4}
                      >
                        <CalendarMonthRounded
                          color="primary"
                          sx={{
                            fontSize: 18,
                          }}
                        />

                        <Typography fontWeight={800}>
                          {formatDisplayDate(selectedDate)} →{" "}
                          {formatDisplayDate(endDate)}
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>

              {/* ============================================== */}
              {/* SEAT MAP */}
              {/* ============================================== */}

              <Paper
                elevation={0}
                sx={{
                  p: {
                    xs: 1.5,
                    sm: 2.3,
                    md: 3,
                  },

                  borderRadius: 4,

                  border: "1px solid",

                  borderColor: selectedSeat
                    ? alpha(theme.palette.primary.main, 0.25)
                    : "divider",
                }}
              >
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
                  spacing={1.5}
                  mb={2.5}
                >
                  <SectionHeader
                    number="4"
                    icon={<ChairAltRounded />}
                    title="Choose Your Seat"
                    description="Tap an available seat to select it."
                    complete={Boolean(selectedSeat)}
                  />

                  {(loadingSeats || loadingLayout) && (
                    <Chip
                      icon={<CircularProgress size={14} />}
                      label={
                        loadingSeats
                          ? "Checking availability"
                          : "Loading layout"
                      }
                      variant="outlined"
                    />
                  )}
                </Stack>

                {!selectedFloor || !selectedSlot ? (
                  <Box
                    sx={{
                      py: 8,
                      textAlign: "center",
                      borderRadius: 3,
                      bgcolor: "background.default",
                    }}
                  >
                    <ChairAltRounded
                      sx={{
                        fontSize: 50,
                        color: "text.disabled",
                      }}
                    />

                    <Typography variant="h6" fontWeight={800} mt={1}>
                      Complete the Previous Steps
                    </Typography>

                    <Typography color="text.secondary">
                      Select a floor and slot to view live seat availability.
                    </Typography>
                  </Box>
                ) : loadingSeats ? (
                  <Box
                    sx={{
                      py: 8,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <Stack alignItems="center" spacing={1.5}>
                      <CircularProgress />

                      <Typography color="text.secondary">
                        Checking live seat availability...
                      </Typography>
                    </Stack>
                  </Box>
                ) : seats.length === 0 ? (
                  <Box
                    sx={{
                      py: 8,
                      textAlign: "center",
                      borderRadius: 3,
                      bgcolor: "background.default",
                    }}
                  >
                    <ChairAltRounded
                      sx={{
                        fontSize: 50,
                        color: "text.disabled",
                      }}
                    />

                    <Typography variant="h6" fontWeight={800} mt={1}>
                      No Seats Available
                    </Typography>

                    <Typography color="text.secondary">
                      Try another slot, floor or date.
                    </Typography>
                  </Box>
                ) : (
                  <SeatMap
                    seats={seats}
                    layout={floorLayout}
                    selectedSeat={selectedSeat}
                    onSeatSelect={handleSeatSelect}
                    statusColors={SEAT_STATUS_COLORS}
                  />
                )}

                {/* ============================================ */}
                {/* SELECTED SEAT */}
                {/* ============================================ */}

                {selectedSeat && (
                  <Paper
                    elevation={0}
                    sx={{
                      mt: 2.5,
                      p: 2,
                      borderRadius: 3,

                      border: "1px solid",

                      borderColor: alpha(theme.palette.primary.main, 0.15),

                      bgcolor: alpha(theme.palette.primary.main, 0.035),
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      alignItems="center"
                    >
                      <Chip
                        label={`Seat ${getSeatNumber(selectedSeat)}`}
                        color="primary"
                      />

                      <Chip
                        label={formatEnum(selectedSeat.seatType)}
                        variant="outlined"
                      />

                      {(selectedSeat?.features || []).map((feature, index) => {
                        const value = getSeatFeatureValue(feature);

                        if (!value) {
                          return null;
                        }

                        return (
                          <Chip
                            key={`${value}-${index}`}
                            size="small"
                            label={formatEnum(value)}
                            variant="outlined"
                          />
                        );
                      })}

                      {(selectedSeat?.restrictions || []).map((restriction) => (
                        <Chip
                          key={restriction}
                          size="small"
                          color="warning"
                          label={formatEnum(restriction)}
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Paper>
                )}
              </Paper>
            </Stack>
          </Grid>

          {/* ================================================== */}
          {/* BOOKING SUMMARY */}
          {/* ================================================== */}

          <Grid
            size={{
              xs: 12,
              lg: 4,
            }}
          >
            <Box
              sx={{
                position: {
                  lg: "sticky",
                },

                top: {
                  lg: 96,
                },
              }}
            >
              <Card
                elevation={0}
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid",

                  borderColor: selectionComplete
                    ? alpha(theme.palette.primary.main, 0.27)
                    : "divider",

                  boxShadow: "0 20px 50px rgba(15,23,42,.07)",
                }}
              >
                {/* ============================================ */}
                {/* SUMMARY HEADER */}
                {/* ============================================ */}

                <Box
                  sx={{
                    p: 2.5,
                    color: "#fff",

                    background:
                      "linear-gradient(135deg,#071A37 0%,#0B4A9F 65%,#146EF5 140%)",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "rgba(255,255,255,.7)",
                          fontWeight: 750,
                        }}
                      >
                        YOUR SELECTION
                      </Typography>

                      <Typography variant="h5" fontWeight={900} mt={0.3}>
                        Booking Summary
                      </Typography>
                    </Box>

                    <Avatar
                      sx={{
                        bgcolor: "rgba(255,255,255,.12)",
                        color: "#fff",
                      }}
                    >
                      <ChairAltRounded />
                    </Avatar>
                  </Stack>
                </Box>

                <CardContent
                  sx={{
                    p: 2.5,

                    "&:last-child": {
                      pb: 2.5,
                    },
                  }}
                >
                  {/* ========================================== */}
                  {/* DETAILS */}
                  {/* ========================================== */}

                  <Stack spacing={1.45}>
                    <SummaryRow label="Library" value={library?.name} />

                    <Divider />

                    <SummaryRow label="Plan" value={selectedPlan?.name} />

                    <SummaryRow
                      label="Floor"
                      value={
                        selectedFloor?.name ||
                        (selectedFloor
                          ? `Floor ${selectedFloor.floorNumber ?? ""}`
                          : "-")
                      }
                    />

                    <SummaryRow
                      label="Slot"
                      value={
                        selectedSlot
                          ? `${selectedSlot.name || "Slot"}${
                              selectedSlot.startTime && selectedSlot.endTime
                                ? ` · ${formatTime(
                                    selectedSlot.startTime,
                                  )} – ${formatTime(selectedSlot.endTime)}`
                                : ""
                            }`
                          : "-"
                      }
                    />

                    <SummaryRow
                      label="Start"
                      value={formatDisplayDate(selectedDate)}
                    />

                    <SummaryRow
                      label="End"
                      value={selectedPlan ? formatDisplayDate(endDate) : "-"}
                    />

                    <Divider />

                    <SummaryRow
                      label="Seat"
                      value={
                        selectedSeat
                          ? `Seat ${getSeatNumber(selectedSeat)}`
                          : "Not selected"
                      }
                    />

                    <SummaryRow
                      label="Seat Type"
                      value={
                        selectedSeat?.seatType
                          ? formatEnum(selectedSeat.seatType)
                          : "-"
                      }
                    />
                  </Stack>

                  {/* ========================================== */}
                  {/* PRICE */}
                  {/* ========================================== */}

                  <Box
                    sx={{
                      mt: 2.5,
                      p: 2.2,
                      borderRadius: 3,

                      bgcolor: alpha(theme.palette.primary.main, 0.045),

                      border: "1px solid",

                      borderColor: alpha(theme.palette.primary.main, 0.13),
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={2}
                    >
                      <Box>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={800}
                        >
                          {isAuthenticated
                            ? "YOUR VERIFIED PRICE"
                            : "ESTIMATED PRICE"}
                        </Typography>

                        {loadingPriceQuote ? (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            mt={1}
                          >
                            <CircularProgress size={20} />

                            <Typography variant="body2" color="text.secondary">
                              Calculating...
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography
                            variant="h4"
                            fontWeight={900}
                            color="primary.main"
                            mt={0.35}
                          >
                            {displayedPrice != null
                              ? formatMoney(displayedPrice)
                              : "—"}
                          </Typography>
                        )}
                      </Box>

                      {isAuthenticated &&
                        quoteMatchesSelection &&
                        authoritativeSeatPrice != null && (
                          <Chip
                            icon={<VerifiedRounded />}
                            label="Verified"
                            color="success"
                            size="small"
                            variant="outlined"
                            sx={{
                              fontWeight: 750,
                            }}
                          />
                        )}
                    </Stack>

                    {/* ======================================== */}
                    {/* ANONYMOUS PRICE */}
                    {/* ======================================== */}

                    {!isAuthenticated && selectedSeat && (
                      <>
                        {estimatedBasePrice != null ? (
                          <>
                            <Divider
                              sx={{
                                my: 2,
                              }}
                            />

                            <Stack spacing={1}>
                              <SummaryRow
                                label={`${formatEnum(
                                  selectedSeat.seatType,
                                )} Seat Base`}
                                value={formatMoney(estimatedBasePrice)}
                              />

                              {(selectedSeat?.features || []).map(
                                (rawFeature, index) => {
                                  const feature =
                                    getSeatFeatureValue(rawFeature);

                                  if (!feature) {
                                    return null;
                                  }

                                  const configured = (
                                    selectedPlan?.featurePrices || []
                                  ).find(
                                    (item) =>
                                      item?.active !== false &&
                                      String(item?.seatFeature || "")
                                        .trim()
                                        .toUpperCase() ===
                                        String(feature).trim().toUpperCase(),
                                  );

                                  if (!configured) {
                                    return null;
                                  }

                                  const amount = Number(
                                    configured?.additionalPrice,
                                  );

                                  if (!Number.isFinite(amount)) {
                                    return null;
                                  }

                                  return (
                                    <SummaryRow
                                      key={`${feature}-${index}`}
                                      label={formatEnum(feature)}
                                      value={`+${formatMoney(amount)}`}
                                    />
                                  );
                                },
                              )}

                              <SummaryRow
                                label="Feature Surcharge"
                                value={
                                  estimatedFeatureSurcharge > 0
                                    ? `+${formatMoney(
                                        estimatedFeatureSurcharge,
                                      )}`
                                    : formatMoney(0)
                                }
                              />

                              <Divider />

                              <SummaryRow
                                label="Estimated Total"
                                value={formatMoney(estimatedTotalPrice)}
                                valueColor="primary.main"
                                strong
                              />
                            </Stack>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                mt: 1.4,
                                lineHeight: 1.55,
                              }}
                            >
                              Sign in to receive your personalized authoritative
                              price. Member pricing may apply where supported.
                            </Typography>
                          </>
                        ) : (
                          <Alert
                            severity="warning"
                            sx={{
                              mt: 2,
                              borderRadius: 2.5,
                            }}
                          >
                            {formatEnum(selectedSeat?.seatType)} pricing has not
                            been configured for this membership plan.
                          </Alert>
                        )}
                      </>
                    )}

                    {/* ======================================== */}
                    {/* AUTHENTICATED PRICE */}
                    {/* ======================================== */}

                    {isAuthenticated &&
                      quoteMatchesSelection &&
                      seatPriceQuote &&
                      !loadingPriceQuote && (
                        <>
                          <Divider
                            sx={{
                              my: 2,
                            }}
                          />

                          <Stack spacing={1.1}>
                            <SummaryRow
                              label="Standard Base Price"
                              value={
                                standardBasePrice != null
                                  ? formatMoney(standardBasePrice)
                                  : "-"
                              }
                            />

                            {memberPricingApplied &&
                              memberBasePrice != null && (
                                <>
                                  <SummaryRow
                                    label="Your Member Base Price"
                                    value={formatMoney(memberBasePrice)}
                                    valueColor="success.main"
                                  />

                                  {standardBasePrice != null &&
                                    memberBasePrice < standardBasePrice && (
                                      <SummaryRow
                                        label="Member Saving"
                                        value={`-${formatMoney(
                                          standardBasePrice - memberBasePrice,
                                        )}`}
                                        valueColor="success.main"
                                      />
                                    )}
                                </>
                              )}

                            <SummaryRow
                              label="Effective Base"
                              value={
                                effectiveBasePrice != null
                                  ? formatMoney(effectiveBasePrice)
                                  : "-"
                              }
                            />
                          </Stack>

                          {quotedFeatures.length > 0 && (
                            <>
                              <Divider
                                sx={{
                                  my: 2,
                                }}
                              />

                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={800}
                              >
                                SEAT FEATURE CHARGES
                              </Typography>

                              <Stack spacing={0.9} mt={1}>
                                {quotedFeatures.map((featurePrice, index) => {
                                  const feature = featurePrice?.feature;

                                  const amount = Number(
                                    featurePrice?.additionalPrice,
                                  );

                                  return (
                                    <SummaryRow
                                      key={`${feature}-${index}`}
                                      label={formatEnum(feature)}
                                      value={
                                        Number.isFinite(amount)
                                          ? `+${formatMoney(amount)}`
                                          : "-"
                                      }
                                    />
                                  );
                                })}
                              </Stack>
                            </>
                          )}

                          <Divider
                            sx={{
                              my: 2,
                            }}
                          />

                          <SummaryRow
                            label="Feature Surcharge"
                            value={
                              authoritativeFeatureSurcharge > 0
                                ? `+${formatMoney(
                                    authoritativeFeatureSurcharge,
                                  )}`
                                : formatMoney(0)
                            }
                          />

                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            mt={1.5}
                          >
                            <Box>
                              <Typography fontWeight={850}>
                                Final Price
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Before coupon
                              </Typography>
                            </Box>

                            <Typography
                              variant="h5"
                              fontWeight={900}
                              color="primary.main"
                            >
                              {authoritativeSeatPrice != null
                                ? formatMoney(authoritativeSeatPrice)
                                : "—"}
                            </Typography>
                          </Stack>

                          {memberPricingApplied && (
                            <Chip
                              label="Member-specific pricing applied"
                              color="success"
                              size="small"
                              sx={{
                                mt: 1.5,
                                fontWeight: 700,
                              }}
                            />
                          )}
                        </>
                      )}

                    {priceQuoteError && (
                      <Alert
                        severity="warning"
                        sx={{
                          mt: 2,
                          borderRadius: 2.5,
                        }}
                      >
                        {priceQuoteError}
                      </Alert>
                    )}
                  </Box>

                  {/* ========================================== */}
                  {/* AVAILABILITY */}
                  {/* ========================================== */}

                  <Grid container spacing={1} mt={2}>
                    <Grid
                      size={{
                        xs: 4,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.3,
                          textAlign: "center",
                          borderRadius: 2.5,

                          bgcolor: alpha(theme.palette.success.main, 0.06),
                        }}
                      >
                        <Typography fontWeight={850} color="success.main">
                          {seatCounts.available}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Available
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid
                      size={{
                        xs: 4,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.3,
                          textAlign: "center",
                          borderRadius: 2.5,

                          bgcolor: alpha(theme.palette.error.main, 0.05),
                        }}
                      >
                        <Typography fontWeight={850} color="error.main">
                          {seatCounts.booked}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Booked
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid
                      size={{
                        xs: 4,
                      }}
                    >
                      <Box
                        sx={{
                          p: 1.3,
                          textAlign: "center",
                          borderRadius: 2.5,
                          bgcolor: "background.default",
                        }}
                      >
                        <Typography fontWeight={850}>
                          {seatCounts.total}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          Total
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {/* ========================================== */}
                  {/* MESSAGES */}
                  {/* ========================================== */}

                  {!selectedSeat && (
                    <Alert
                      severity="info"
                      icon={false}
                      sx={{
                        mt: 2.5,
                        borderRadius: 2.5,
                      }}
                    >
                      Select an available seat from the map to continue.
                    </Alert>
                  )}

                  {!isAuthenticated &&
                    selectedSeat &&
                    estimatedTotalPrice != null && (
                      <Alert
                        severity="info"
                        icon={<LoginRounded />}
                        sx={{
                          mt: 2.5,
                          borderRadius: 2.5,
                        }}
                      >
                        Your plan, floor, slot, date and seat selection will be
                        preserved while you sign in or create an account.
                      </Alert>
                    )}

                  {isAuthenticated && selectedSeat && loadingPriceQuote && (
                    <Alert
                      severity="info"
                      sx={{
                        mt: 2.5,
                        borderRadius: 2.5,
                      }}
                    >
                      Verifying your personalized seat price...
                    </Alert>
                  )}

                  {/* ========================================== */}
                  {/* CTA */}
                  {/* ========================================== */}

                  <Button
                    fullWidth
                    size="large"
                    variant="contained"
                    disabled={
                      !selectionComplete || bookingLoading || !pricingReady
                    }
                    endIcon={
                      bookingLoading ? null : isAuthenticated ? (
                        <ArrowForwardRounded />
                      ) : (
                        <LoginRounded />
                      )
                    }
                    onClick={handleContinue}
                    sx={{
                      mt: 2.5,
                      minHeight: 54,
                      borderRadius: 2.6,
                      fontWeight: 850,

                      boxShadow:
                        selectionComplete && pricingReady
                          ? `0 12px 28px ${alpha(
                              theme.palette.primary.main,
                              0.2,
                            )}`
                          : "none",
                    }}
                  >
                    {bookingLoading ? (
                      <CircularProgress size={21} color="inherit" />
                    ) : isAuthenticated ? (
                      loadingPriceQuote ? (
                        "Verifying Price..."
                      ) : (
                        "Continue to Payment"
                      )
                    ) : (
                      "Sign In to Continue"
                    )}
                  </Button>

                  <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems="center"
                    spacing={0.6}
                    mt={1.5}
                  >
                    <VerifiedRounded
                      sx={{
                        fontSize: 15,
                        color: "success.main",
                      }}
                    />

                    <Typography variant="caption" color="text.secondary">
                      Secure backend verified booking
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default SeatAvailability;
