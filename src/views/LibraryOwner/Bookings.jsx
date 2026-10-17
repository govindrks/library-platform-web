import {
  CalendarMonth,
  CheckCircle,
  Close,
  CurrencyRupee,
  EventSeat,
  FilterList,
  MoreVert,
  Refresh,
  Search,
  Visibility,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import bookingApi from "../../api/bookingApi";

import libraryApi from "../../api/libraryApi";

// ============================================================

// OWNER LIBRARY SELECTION

// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const getStoredOwnerLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
};

const storeOwnerLibraryId = (libraryId) => {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
};

// ============================================================

// HELPERS

// ============================================================

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const normalizedDate = String(date).substring(0, 10);

  const parsedDate = new Date(`${normalizedDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toLocaleString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",

    hour: "2-digit",

    minute: "2-digit",
  });
}

function formatTime(value) {
  if (!value) {
    return "";
  }

  const stringValue = String(value);

  return stringValue.length >= 5 ? stringValue.substring(0, 5) : stringValue;
}

function buildSlotTime(startTime, endTime) {
  const start = formatTime(startTime);

  const end = formatTime(endTime);

  if (!start && !end) {
    return "-";
  }

  if (!start) {
    return end;
  }

  if (!end) {
    return start;
  }

  return `${start} - ${end}`;
}

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,

    maximumFractionDigits: 2,
  });
}

function resolvePaymentStatus(booking) {
  const value =
    booking?.paymentStatus ||
    booking?.latestPaymentStatus ||
    booking?.transactionStatus ||
    booking?.payment?.status ||
    null;

  if (!value) {
    return "NOT_STARTED";
  }

  const normalized = String(value).toUpperCase();

  if (normalized === "SUCCESS") {
    return "PAID";
  }

  if (normalized === "CREATED" || normalized === "PENDING") {
    return "PENDING";
  }

  return normalized;
}

function mapBookingToUi(booking) {
  const bookingId = booking?.bookingId ?? booking?.id ?? null;

  return {
    ...booking,

    bookingId,

    id: bookingId != null ? `BK-${bookingId}` : "-",

    userId: booking?.userId ?? booking?.memberId ?? null,

    memberName: booking?.memberName || booking?.userName || "-",

    email: booking?.memberEmail || booking?.email || "-",

    phone: booking?.memberPhone || booking?.phone || "-",

    profileImageUrl: booking?.profileImageUrl || "",

    libraryId: booking?.libraryId ?? null,

    libraryName: booking?.libraryName || "-",

    floorId: booking?.floorId ?? null,

    floorName: booking?.floorName || "-",

    seatId: booking?.seatId ?? null,

    seat: booking?.seatNumber || booking?.seat || "-",

    seatType: booking?.seatType || "NORMAL",

    seatFeatures: Array.isArray(booking?.seatFeatures)
      ? booking.seatFeatures
      : Array.isArray(booking?.features)
        ? booking.features
        : [],

    seatRestrictions: Array.isArray(booking?.seatRestrictions)
      ? booking.seatRestrictions
      : Array.isArray(booking?.restrictions)
        ? booking.restrictions
        : [],

    slotId: booking?.slotId ?? null,

    slot: booking?.slotName || "-",

    slotStartTime: booking?.slotStartTime || null,

    slotEndTime: booking?.slotEndTime || null,

    time: buildSlotTime(booking?.slotStartTime, booking?.slotEndTime),

    date: booking?.startDate || booking?.bookingDate || "",

    startDate: booking?.startDate || "",

    endDate: booking?.endDate || "",

    bookingDate: booking?.bookingDate || "",

    createdAt: booking?.createdAt || booking?.bookingDate || "",

    membershipPlanId: booking?.membershipPlanId ?? null,

    membershipPlanName:
      booking?.membershipPlanName || booking?.planName || null,

    subscriptionId: booking?.subscriptionId ?? null,

    amount: Number(booking?.amount ?? 0),

    paymentStatus: resolvePaymentStatus(booking),

    status: booking?.status || booking?.bookingStatus || "",

    displayStatus: booking?.displayStatus || "",
  };
}

function mapBookingDetailsToUi(details, fallbackBooking) {
  if (!details) {
    return fallbackBooking;
  }

  const canonicalStatus =
    details?.bookingStatus || details?.status || fallbackBooking?.status || "";

  const displayStatus =
    canonicalStatus === "ACTIVE"
      ? "Confirmed"
      : canonicalStatus === "PENDING_PAYMENT"
        ? "Pending"
        : canonicalStatus === "EXPIRED"
          ? "Completed"
          : canonicalStatus === "CANCELLED"
            ? "Cancelled"
            : canonicalStatus;

  return {
    ...fallbackBooking,

    ...details,

    bookingId: details?.bookingId ?? fallbackBooking?.bookingId,

    id:
      details?.bookingId != null
        ? `BK-${details.bookingId}`
        : fallbackBooking?.id || "-",

    memberName:
      details?.userName ||
      details?.memberName ||
      fallbackBooking?.memberName ||
      "-",

    email:
      details?.memberEmail || details?.email || fallbackBooking?.email || "-",

    phone:
      details?.memberPhone || details?.phone || fallbackBooking?.phone || "-",

    profileImageUrl:
      details?.profileImageUrl || fallbackBooking?.profileImageUrl || "",

    libraryId: details?.libraryId ?? fallbackBooking?.libraryId,

    libraryName: details?.libraryName || fallbackBooking?.libraryName || "-",

    floorId: details?.floorId ?? fallbackBooking?.floorId,

    floorName: details?.floorName || fallbackBooking?.floorName || "-",

    seatId: details?.seatId ?? fallbackBooking?.seatId,

    seat: details?.seatNumber || fallbackBooking?.seat || "-",

    seatType: details?.seatType || fallbackBooking?.seatType || "NORMAL",

    seatFeatures: Array.isArray(details?.seatFeatures)
      ? details.seatFeatures
      : Array.isArray(details?.features)
        ? details.features
        : fallbackBooking?.seatFeatures || [],

    seatRestrictions: Array.isArray(details?.seatRestrictions)
      ? details.seatRestrictions
      : Array.isArray(details?.restrictions)
        ? details.restrictions
        : fallbackBooking?.seatRestrictions || [],

    slotId: details?.slotId ?? fallbackBooking?.slotId,

    slot: details?.slotName || fallbackBooking?.slot || "-",

    slotStartTime: details?.slotStartTime ?? fallbackBooking?.slotStartTime,

    slotEndTime: details?.slotEndTime ?? fallbackBooking?.slotEndTime,

    time: buildSlotTime(
      details?.slotStartTime ?? fallbackBooking?.slotStartTime,

      details?.slotEndTime ?? fallbackBooking?.slotEndTime,
    ),

    startDate: details?.startDate || fallbackBooking?.startDate || "",

    endDate: details?.endDate || fallbackBooking?.endDate || "",

    date: details?.startDate || fallbackBooking?.date || "",

    amount: Number(details?.amount ?? fallbackBooking?.amount ?? 0),

    status: canonicalStatus,

    displayStatus,

    paymentStatus: resolvePaymentStatus({
      ...fallbackBooking,

      ...details,
    }),

    membershipPlanId:
      details?.membershipPlanId ?? fallbackBooking?.membershipPlanId ?? null,

    membershipPlanName:
      details?.membershipPlanName ||
      details?.planName ||
      fallbackBooking?.membershipPlanName ||
      null,

    subscriptionId:
      details?.subscriptionId ?? fallbackBooking?.subscriptionId ?? null,
  };
}

// ============================================================

// STATUS CHIP

// ============================================================

function StatusChip({ status }) {
  const config = {
    ACTIVE: { label: "Confirmed", tone: "success" },

    PENDING_PAYMENT: { label: "Pending", tone: "warning" },

    EXPIRED: { label: "Completed", tone: "info" },

    CANCELLED: { label: "Cancelled", tone: "error" },

    PAID: { label: "Paid", tone: "success" },

    SUCCESS: { label: "Paid", tone: "success" },

    PENDING: { label: "Pending", tone: "warning" },

    CREATED: { label: "Pending", tone: "warning" },

    NOT_STARTED: { label: "Not Started", tone: "default" },

    FAILED: { label: "Failed", tone: "error" },

    REFUND_PENDING: { label: "Refund Pending", tone: "warning" },

    PARTIALLY_REFUNDED: { label: "Partially Refunded", tone: "info" },

    REFUNDED: { label: "Refunded", tone: "default" },
  };

  const current = config[status] || {
    label: status || "-",

    tone: "default",
  };

  return (
    <Chip
      label={current.label}
      size="small"
      color={current.tone}
      variant="outlined"
      sx={{
        height: 27,

        borderRadius: 1.7,

        fontWeight: 750,

        bgcolor: (theme) =>
          current.tone === "default"
            ? alpha(theme.palette.text.primary, 0.035)
            : alpha(theme.palette[current.tone].main, 0.06),
      }}
    />
  );
}

function DetailItem({ label, value, children }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",

          fontWeight: 650,

          display: "block",

          mb: 0.4,
        }}
      >
        {label}
      </Typography>

      {children || (
        <Typography
          variant="body2"
          sx={{ fontWeight: 750, color: "text.primary" }}
        >
          {value || "-"}
        </Typography>
      )}
    </Box>
  );
}

// ============================================================

// BOOKING DETAILS DIALOG

// ============================================================

function BookingDetailsDialog({ booking, open, onClose, loading }) {
  const theme = useTheme();

  if (!booking && !loading) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,

            overflow: "hidden",

            boxShadow: "0 28px 80px rgba(15,23,42,0.18)",
          },
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: 3,

            py: 2.5,

            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,

              0.1,
            )} 0%, ${alpha(theme.palette.primary.light, 0.06)} 55%, #fff 100%)`,

            borderBottom: "1px solid",

            borderColor: alpha(theme.palette.primary.main, 0.1),
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,

                  height: 44,

                  borderRadius: 2.5,

                  display: "grid",

                  placeItems: "center",

                  bgcolor: "primary.main",

                  color: "common.white",

                  boxShadow: `0 8px 22px ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              >
                <EventSeat />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={850}>
                  Booking Details
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {booking?.id || "Booking"} · {booking?.memberName || "Member"}
                </Typography>
              </Box>
            </Stack>

            {!loading && <StatusChip status={booking?.status} />}
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ py: 7, display: "flex", justifyContent: "center" }}>
            <Stack spacing={1.5} alignItems="center">
              <CircularProgress />

              <Typography variant="body2" color="text.secondary">
                Loading booking details...
              </Typography>
            </Stack>
          </Box>
        ) : (
          <Stack spacing={3}>
            <Paper
              variant="outlined"
              sx={{
                p: 2.5,

                borderRadius: 3,

                borderColor: alpha(theme.palette.primary.main, 0.12),

                bgcolor: alpha(theme.palette.primary.main, 0.025),
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    Booking
                  </Typography>

                  <Typography variant="h6" fontWeight={850}>
                    {booking?.id}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    Created {formatDateTime(booking?.createdAt)}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    Amount
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={900}
                    color="primary.main"
                  >
                    ₹{formatCurrency(booking?.amount)}
                  </Typography>

                  <Box mt={0.5}>
                    <StatusChip status={booking?.paymentStatus} />
                  </Box>
                </Box>
              </Stack>
            </Paper>

            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 3, height: "100%" }}
                >
                  <Typography variant="subtitle2" fontWeight={850} mb={2}>
                    Member
                  </Typography>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      src={booking?.profileImageUrl || undefined}
                      alt={booking?.memberName || "Member"}
                      sx={{
                        width: 58,
                        height: 58,
                        flexShrink: 0,
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        fontWeight: 850,
                        fontSize: 20,
                        border: "2px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.15),
                      }}
                    >
                      {!booking?.profileImageUrl
                        ? booking?.memberName
                            ?.trim()
                            ?.charAt(0)
                            ?.toUpperCase() || "M"
                        : null}
                    </Avatar>

                    <Box minWidth={0}>
                      <Typography variant="subtitle1" fontWeight={850} noWrap>
                        {booking?.memberName || "-"}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" noWrap>
                        {booking?.phone || "-"}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {booking?.email || "-"}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 3, height: "100%" }}
                >
                  <Typography variant="subtitle2" fontWeight={850} mb={2}>
                    Seat & Location
                  </Typography>

                  <Stack spacing={1.8}>
                    <DetailItem label="Library" value={booking?.libraryName} />

                    <DetailItem label="Floor" value={booking?.floorName} />

                    <DetailItem label="Seat">
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Chip
                          icon={<EventSeat />}
                          label={booking?.seat || "-"}
                          size="small"
                          variant="outlined"
                        />

                        <Chip
                          label={booking?.seatType || "NORMAL"}
                          size="small"
                          color={
                            booking?.seatType === "PREMIUM"
                              ? "warning"
                              : "default"
                          }
                          variant="outlined"
                        />
                      </Stack>
                    </DetailItem>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 3, height: "100%" }}
                >
                  <Typography variant="subtitle2" fontWeight={850} mb={2}>
                    Booking Window
                  </Typography>

                  <Stack spacing={1.8}>
                    <DetailItem
                      label="Start Date"
                      value={formatDate(booking?.startDate)}
                    />

                    <DetailItem
                      label="End Date"
                      value={formatDate(booking?.endDate)}
                    />

                    <DetailItem
                      label="Slot"
                      value={`${booking?.slot || "-"} · ${booking?.time || "-"}`}
                    />
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{ p: 2.5, borderRadius: 3, height: "100%" }}
                >
                  <Typography variant="subtitle2" fontWeight={850} mb={2}>
                    Membership
                  </Typography>

                  <Stack spacing={1.8}>
                    <DetailItem
                      label="Plan"
                      value={booking?.membershipPlanName || "-"}
                    />

                    <DetailItem
                      label="Subscription ID"
                      value={
                        booking?.subscriptionId
                          ? `SUB-${booking.subscriptionId}`
                          : "-"
                      }
                    />

                    <DetailItem label="Booking Status">
                      <StatusChip status={booking?.status} />
                    </DetailItem>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            {(booking?.seatFeatures?.length > 0 ||
              booking?.seatRestrictions?.length > 0) && (
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="subtitle2" fontWeight={850} mb={1.5}>
                  Seat Attributes
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(booking?.seatFeatures || []).map((feature) => (
                    <Chip
                      key={`feature-${feature}`}
                      label={String(feature).replaceAll("_", " ")}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  ))}

                  {(booking?.seatRestrictions || []).map((restriction) => (
                    <Chip
                      key={`restriction-${restriction}`}
                      label={String(restriction).replaceAll("_", " ")}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  ))}
                </Stack>
              </Paper>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================

// CANCEL CONFIRMATION

// ============================================================

function CancelBookingDialog({ open, booking, loading, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
      slotProps={{ paper: { sx: { borderRadius: 3.5 } } }}
    >
      <DialogTitle sx={{ fontWeight: 850 }}>Cancel Booking?</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to cancel{" "}
          <strong>{booking?.id || "this booking"}</strong>?
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1}>
          The booking will be cancelled and availability will be recalculated
          from active booking records.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} disabled={loading}>
          Keep Booking
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
          sx={{ borderRadius: 2 }}
        >
          {loading ? "Cancelling..." : "Cancel Booking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ============================================================

// KPI CARD

// ============================================================

function KpiCard({ icon, label, value, helper, tone = "primary" }) {
  const theme = useTheme();

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",

        borderRadius: 3.2,

        borderColor: alpha(
          theme.palette[tone]?.main || theme.palette.primary.main,

          0.14,
        ),

        background: `linear-gradient(145deg, #fff 0%, ${alpha(
          theme.palette[tone]?.main || theme.palette.primary.main,

          0.035,
        )} 100%)`,

        boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
      }}
    >
      <CardContent sx={{ p: 2.4 }}>
        <Stack direction="row" spacing={1.7} alignItems="center">
          <Box
            sx={{
              width: 44,

              height: 44,

              borderRadius: 2.4,

              display: "grid",

              placeItems: "center",

              bgcolor: alpha(
                theme.palette[tone]?.main || theme.palette.primary.main,

                0.09,
              ),

              color: `${tone}.main`,

              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box minWidth={0}>
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              {label}
            </Typography>

            <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.15 }}>
              {value}
            </Typography>

            {helper && (
              <Typography variant="caption" color="text.secondary">
                {helper}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================

// BOOKINGS

// ============================================================

function Bookings() {
  const theme = useTheme();

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [bookings, setBookings] = useState([]);

  const [summary, setSummary] = useState(null);

  const [loadingBookings, setLoadingBookings] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const [dateFilter, setDateFilter] = useState("");

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [menuBooking, setMenuBooking] = useState(null);

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [bookingToCancel, setBookingToCancel] = useState(null);

  const [cancelling, setCancelling] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const selectedLibrary = useMemo(
    () =>
      libraries.find((library) => String(library.id) === String(libraryId)) ||
      null,

    [libraries, libraryId],
  );

  // ==========================================================

  // LOAD LIBRARIES

  // ==========================================================

  const loadLibraries = useCallback(async () => {
    try {
      setLoadingLibraries(true);

      setError("");

      const response = await libraryApi.getMyLibraries();

      const libraryList = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : [];

      setLibraries(libraryList);

      if (libraryList.length === 0) {
        setLibraryId("");

        setBookings([]);

        setSummary(null);

        return;
      }

      const storedLibraryId = getStoredOwnerLibraryId();

      const preferredLibrary = storedLibraryId
        ? libraryList.find(
            (library) => Number(library.id) === Number(storedLibraryId),
          )
        : null;

      setLibraryId((currentLibraryId) => {
        const currentStillExists =
          currentLibraryId &&
          libraryList.some(
            (library) => String(library.id) === String(currentLibraryId),
          );

        if (currentStillExists) {
          return String(currentLibraryId);
        }

        const nextLibraryId = String(preferredLibrary?.id ?? libraryList[0].id);

        storeOwnerLibraryId(nextLibraryId);

        return nextLibraryId;
      });
    } catch (err) {
      console.error("Failed to load owner libraries:", err);

      setLibraries([]);

      setLibraryId("");

      setBookings([]);

      setSummary(null);

      setError(getErrorMessage(err, "Unable to load your libraries."));
    } finally {
      setLoadingLibraries(false);
    }
  }, []);

  // ==========================================================

  // LOAD BOOKINGS + SUMMARY

  // ==========================================================

  const loadBookings = useCallback(async () => {
    if (!libraryId) {
      setBookings([]);

      setSummary(null);

      return;
    }

    try {
      setLoadingBookings(true);

      setError("");

      const [bookingsResponse, summaryResponse] = await Promise.all([
        bookingApi.getLibraryBookings(libraryId),

        bookingApi.getLibraryBookingSummary(libraryId),
      ]);

      const bookingList = Array.isArray(bookingsResponse)
        ? bookingsResponse
        : Array.isArray(bookingsResponse?.content)
          ? bookingsResponse.content
          : [];

      setBookings(bookingList.map(mapBookingToUi));

      setSummary(summaryResponse ?? null);

      setPage(0);
    } catch (err) {
      console.error("Failed to load library bookings:", err);

      setBookings([]);

      setSummary(null);

      setError(getErrorMessage(err, "Unable to load library bookings."));
    } finally {
      setLoadingBookings(false);
    }
  }, [libraryId]);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (libraryId) {
      storeOwnerLibraryId(libraryId);

      loadBookings();
    } else {
      setBookings([]);

      setSummary(null);
    }
  }, [libraryId, loadBookings]);

  // ==========================================================

  // FILTERS

  // ==========================================================

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const searchableValues = [
        booking.id,

        booking.memberName,

        booking.email,

        booking.phone,

        booking.seat,

        booking.seatType,

        booking.floorName,

        booking.slot,

        booking.membershipPlanName,
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()

            .includes(query),
        );

      const matchesStatus =
        statusFilter === "ALL" || booking.status === statusFilter;

      const matchesPayment =
        paymentFilter === "ALL" || booking.paymentStatus === paymentFilter;

      const matchesDate = !dateFilter || booking.date === dateFilter;

      return matchesSearch && matchesStatus && matchesPayment && matchesDate;
    });
  }, [bookings, search, statusFilter, paymentFilter, dateFilter]);

  const totalBookings = Number(summary?.totalBookings ?? bookings.length ?? 0);

  const confirmedCount = Number(summary?.confirmedBookings ?? 0);

  const pendingCount = Number(summary?.pendingBookings ?? 0);

  const completedCount = Number(summary?.completedBookings ?? 0);

  const totalRevenue = Number(summary?.paidRevenue ?? 0);

  const completedPayments = Number(summary?.completedPayments ?? 0);

  // ==========================================================

  // DETAILS

  // ==========================================================

  const handleOpenDetails = async (booking) => {
    if (!libraryId || !booking?.bookingId) {
      return;
    }

    setSelectedBooking(booking);

    setDetailsOpen(true);

    setLoadingDetails(true);

    setError("");

    try {
      const response = await bookingApi.getLibraryBookingById(
        libraryId,

        booking.bookingId,
      );

      setSelectedBooking(mapBookingDetailsToUi(response, booking));
    } catch (err) {
      console.error("Failed to load booking details:", err);

      setError(getErrorMessage(err, "Unable to load booking details."));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);

    setSelectedBooking(null);

    setLoadingDetails(false);
  };

  // ==========================================================

  // ACTION MENU / CANCEL

  // ==========================================================

  const handleOpenMenu = (event, booking) => {
    setMenuAnchor(event.currentTarget);

    setMenuBooking(booking);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);

    setMenuBooking(null);
  };

  const handleRequestCancel = () => {
    if (!menuBooking) {
      return;
    }

    setBookingToCancel(menuBooking);

    setMenuAnchor(null);

    setMenuBooking(null);

    setCancelDialogOpen(true);
  };

  const handleCloseCancelDialog = () => {
    if (cancelling) {
      return;
    }

    setCancelDialogOpen(false);

    setBookingToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!libraryId || !bookingToCancel?.bookingId) {
      return;
    }

    try {
      setCancelling(true);

      setError("");

      setSuccess("");

      await bookingApi.cancelLibraryBooking(
        libraryId,

        bookingToCancel.bookingId,
      );

      setCancelDialogOpen(false);

      setBookingToCancel(null);

      setSuccess("Booking cancelled successfully.");

      await loadBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);

      setError(getErrorMessage(err, "Unable to cancel booking."));
    } finally {
      setCancelling(false);
    }
  };

  const handleClearFilters = () => {
    setSearch("");

    setStatusFilter("ALL");

    setPaymentFilter("ALL");

    setDateFilter("");

    setPage(0);
  };

  const handleLibraryChange = (event) => {
    const nextLibraryId = String(event.target.value);

    setLibraryId(nextLibraryId);

    storeOwnerLibraryId(nextLibraryId);

    setSearch("");

    setStatusFilter("ALL");

    setPaymentFilter("ALL");

    setDateFilter("");

    setPage(0);

    setSuccess("");

    setError("");
  };

  const activeFilters = [
    Boolean(search.trim()),

    statusFilter !== "ALL",

    paymentFilter !== "ALL",

    Boolean(dateFilter),
  ].filter(Boolean).length;

  // ==========================================================

  // RENDER

  // ==========================================================

  return (
    <Box sx={{ pb: 4 }}>
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
          )} 0%, #fff 50%, ${alpha(theme.palette.info.main, 0.045)} 100%)`,

          boxShadow: "0 14px 40px rgba(15,23,42,0.05)",

          "&::after": {
            content: '""',

            position: "absolute",

            width: 190,

            height: 190,

            borderRadius: "50%",

            right: -45,

            top: -80,

            bgcolor: alpha(theme.palette.primary.main, 0.055),
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
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
              <CalendarMonth sx={{ fontSize: 29 }} />
            </Box>

            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ letterSpacing: -0.6 }}
              >
                Bookings
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.4}>
                Manage reservations, payment state, member details, seats and
                booking windows from one workspace.
              </Typography>

              {selectedLibrary && (
                <Chip
                  size="small"
                  label={selectedLibrary.name}
                  sx={{
                    mt: 1.3,

                    fontWeight: 750,

                    bgcolor: alpha(theme.palette.primary.main, 0.07),

                    color: "primary.main",
                  }}
                />
              )}
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.2}>
            <Button
              variant="outlined"
              startIcon={
                loadingBookings ? <CircularProgress size={16} /> : <Refresh />
              }
              onClick={loadBookings}
              disabled={!libraryId || loadingBookings}
              sx={{ borderRadius: 2.4, px: 2.1, fontWeight: 800 }}
            >
              Refresh
            </Button>
          </Stack>
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

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2.3,

          mb: 3,

          borderRadius: 3.2,

          borderColor: "divider",

          boxShadow: "0 8px 24px rgba(15,23,42,0.035)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Box sx={{ minWidth: { md: 210 } }}>
            <Typography variant="subtitle2" fontWeight={850}>
              Working library
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Booking data follows the same selected library used across owner
              setup screens.
            </Typography>
          </Box>

          <FormControl fullWidth size="small">
            <InputLabel>Library</InputLabel>

            <Select
              value={libraryId}
              label="Library"
              disabled={loadingLibraries || libraries.length === 0}
              onChange={handleLibraryChange}
              sx={{ borderRadius: 2.2 }}
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingLibraries && <CircularProgress size={22} />}
        </Stack>
      </Paper>

      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            icon={<EventSeat />}
            label="Total Bookings"
            value={totalBookings}
            helper="All reservations"
            tone="primary"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            icon={<CheckCircle />}
            label="Confirmed"
            value={confirmedCount}
            helper="Active bookings"
            tone="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            icon={<CalendarMonth />}
            label="Pending"
            value={pendingCount}
            helper="Awaiting completion"
            tone="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <KpiCard
            icon={<CurrencyRupee />}
            label="Paid Revenue"
            value={`₹${formatCurrency(totalRevenue)}`}
            helper={`${completedPayments} successful payment${completedPayments === 1 ? "" : "s"}`}
            tone="info"
          />
        </Grid>
      </Grid>

      <Paper
        variant="outlined"
        sx={{
          p: 2.2,

          mb: 2.5,

          borderRadius: 3.2,

          boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", lg: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search booking, member, floor, seat or slot..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);

              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2.2 },

              minWidth: { lg: 320 },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Booking Status</InputLabel>

            <Select
              value={statusFilter}
              label="Booking Status"
              onChange={(event) => {
                setStatusFilter(event.target.value);

                setPage(0);
              }}
              sx={{ borderRadius: 2.2 }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>

              <MenuItem value="PENDING_PAYMENT">Pending</MenuItem>

              <MenuItem value="ACTIVE">Confirmed</MenuItem>

              <MenuItem value="EXPIRED">Completed</MenuItem>

              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel>Payment</InputLabel>

            <Select
              value={paymentFilter}
              label="Payment"
              onChange={(event) => {
                setPaymentFilter(event.target.value);

                setPage(0);
              }}
              sx={{ borderRadius: 2.2 }}
            >
              <MenuItem value="ALL">All Payments</MenuItem>

              <MenuItem value="PAID">Paid</MenuItem>

              <MenuItem value="PENDING">Pending</MenuItem>

              <MenuItem value="NOT_STARTED">Not Started</MenuItem>

              <MenuItem value="FAILED">Failed</MenuItem>

              <MenuItem value="REFUND_PENDING">Refund Pending</MenuItem>

              <MenuItem value="PARTIALLY_REFUNDED">Partially Refunded</MenuItem>

              <MenuItem value="REFUNDED">Refunded</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="Booking Date"
            value={dateFilter}
            onChange={(event) => {
              setDateFilter(event.target.value);

              setPage(0);
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              minWidth: 175,

              "& .MuiOutlinedInput-root": { borderRadius: 2.2 },
            }}
          />

          <Button
            variant={activeFilters > 0 ? "contained" : "outlined"}
            startIcon={<FilterList />}
            onClick={handleClearFilters}
            disabled={activeFilters === 0}
            sx={{ borderRadius: 2.2, whiteSpace: "nowrap", fontWeight: 800 }}
          >
            Clear {activeFilters > 0 ? `(${activeFilters})` : ""}
          </Button>
        </Stack>
      </Paper>

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3.5,

          overflow: "hidden",

          boxShadow: "0 12px 34px rgba(15,23,42,0.045)",
        }}
      >
        <Box
          sx={{
            px: 2.5,

            py: 2.1,

            borderBottom: "1px solid",

            borderColor: "divider",

            bgcolor: alpha(theme.palette.primary.main, 0.018),
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Booking activity
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {filteredBookings.length} booking
                {filteredBookings.length === 1 ? "" : "s"} · {completedCount}{" "}
                completed
              </Typography>
            </Box>

            <Chip
              size="small"
              label={selectedLibrary?.name || "No library selected"}
              variant="outlined"
              color="primary"
              sx={{ fontWeight: 750 }}
            />
          </Stack>
        </Box>

        <TableContainer>
          <Table sx={{ minWidth: 1120 }}>
            <TableHead>
              <TableRow
                sx={{
                  "& th": {
                    bgcolor: "#FAFBFD",

                    color: "text.secondary",

                    fontSize: 12,

                    fontWeight: 800,

                    textTransform: "uppercase",

                    letterSpacing: 0.45,

                    borderBottomColor: "divider",

                    py: 1.45,
                  },
                }}
              >
                <TableCell>Booking</TableCell>

                <TableCell>Member</TableCell>

                <TableCell>Schedule</TableCell>

                <TableCell>Seat</TableCell>

                <TableCell>Amount</TableCell>

                <TableCell>Payment</TableCell>

                <TableCell>Status</TableCell>

                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingBookings && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 8 }}>
                      <CircularProgress />

                      <Typography variant="body2" color="text.secondary" mt={2}>
                        Loading bookings...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {!loadingBookings &&
                filteredBookings

                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)

                  .map((booking) => (
                    <TableRow
                      key={booking.bookingId}
                      hover
                      sx={{
                        "& td": { py: 1.8 },

                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.022),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={850}
                          color="primary.main"
                        >
                          {booking.id}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {formatDateTime(booking.createdAt)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack
                          direction="row"
                          spacing={1.4}
                          alignItems="center"
                        >
                          <Avatar
                            src={booking.profileImageUrl || undefined}
                            alt={booking.memberName || "Member"}
                            sx={{
                              width: 38,
                              height: 38,
                              flexShrink: 0,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                              fontWeight: 800,
                              border: "2px solid",
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.14,
                              ),
                            }}
                          >
                            {!booking.profileImageUrl
                              ? booking.memberName
                                  ?.trim()
                                  ?.charAt(0)
                                  ?.toUpperCase() || "M"
                              : null}
                          </Avatar>

                          <Box minWidth={0}>
                            <Typography variant="body2" fontWeight={750} noWrap>
                              {booking.memberName}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              {booking.phone !== "-"
                                ? booking.phone
                                : booking.email}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={750}>
                          {formatDate(booking.startDate)}

                          {booking.endDate &&
                          booking.endDate !== booking.startDate
                            ? ` - ${formatDate(booking.endDate)}`
                            : ""}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {booking.slot} · {booking.time}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.6} alignItems="flex-start">
                          <Stack
                            direction="row"
                            spacing={0.7}
                            alignItems="center"
                          >
                            <Chip
                              icon={<EventSeat />}
                              label={booking.seat}
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 750 }}
                            />

                            {booking.seatType === "PREMIUM" && (
                              <Chip
                                label="Premium"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{ fontWeight: 750 }}
                              />
                            )}
                          </Stack>

                          <Typography variant="caption" color="text.secondary">
                            {booking.floorName && booking.floorName !== "-"
                              ? booking.floorName
                              : "Floor not provided"}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight={850}>
                          ₹{formatCurrency(booking.amount)}
                        </Typography>

                        {booking.membershipPlanName && (
                          <Typography variant="caption" color="text.secondary">
                            {booking.membershipPlanName}
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusChip status={booking.paymentStatus} />
                      </TableCell>

                      <TableCell>
                        <StatusChip status={booking.status} />
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          justifyContent="flex-end"
                          spacing={0.5}
                        >
                          <Tooltip title="View details">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetails(booking)}
                              sx={{
                                border: "1px solid",

                                borderColor: "divider",

                                borderRadius: 1.7,
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          <IconButton
                            size="small"
                            onClick={(event) => handleOpenMenu(event, booking)}
                            sx={{
                              border: "1px solid",

                              borderColor: "divider",

                              borderRadius: 1.7,
                            }}
                          >
                            <MoreVert fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}

              {!loadingBookings && filteredBookings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 8 }}>
                      <Box
                        sx={{
                          width: 56,

                          height: 56,

                          borderRadius: 3,

                          display: "grid",

                          placeItems: "center",

                          mx: "auto",

                          mb: 1.5,

                          bgcolor: alpha(theme.palette.primary.main, 0.06),

                          color: "primary.main",
                        }}
                      >
                        <EventSeat sx={{ fontSize: 30 }} />
                      </Box>

                      <Typography variant="h6" fontWeight={850}>
                        No bookings found
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                      >
                        {libraryId
                          ? "Try changing your search or filters."
                          : "Select a library to view bookings."}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <TablePagination
          component="div"
          count={filteredBookings.length}
          page={Math.min(
            page,

            Math.max(0, Math.ceil(filteredBookings.length / rowsPerPage) - 1),
          )}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));

            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        slotProps={{
          paper: { sx: { mt: 0.7, borderRadius: 2.3, minWidth: 180 } },
        }}
      >
        <MenuItem
          onClick={() => {
            const booking = menuBooking;

            handleCloseMenu();

            if (booking) {
              handleOpenDetails(booking);
            }
          }}
        >
          <Visibility fontSize="small" sx={{ mr: 1.5 }} />
          View Details
        </MenuItem>

        {menuBooking?.status !== "CANCELLED" &&
          menuBooking?.status !== "EXPIRED" && (
            <MenuItem
              sx={{ color: "error.main" }}
              onClick={handleRequestCancel}
            >
              <Close fontSize="small" sx={{ mr: 1.5 }} />
              Cancel Booking
            </MenuItem>
          )}
      </Menu>

      <BookingDetailsDialog
        booking={selectedBooking}
        open={detailsOpen}
        loading={loadingDetails}
        onClose={handleCloseDetails}
      />

      <CancelBookingDialog
        open={cancelDialogOpen}
        booking={bookingToCancel}
        loading={cancelling}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
      />
    </Box>
  );
}

export default Bookings;
