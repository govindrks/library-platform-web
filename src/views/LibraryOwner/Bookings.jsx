import {
  CalendarMonth,
  CheckCircle,
  Close,
  EventSeat,
  FilterList,
  MoreVert,
  Person,
  Search,
  Visibility,
} from "@mui/icons-material";

import {
  Alert,
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
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import bookingApi from "../../api/bookingApi";
import libraryApi from "../../api/libraryApi";

/* =========================================================
   HELPERS
========================================================= */

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

/*
 * OwnerBookingListResponse -> UI model.
 *
 * Backend canonical booking statuses:
 *
 * PENDING_PAYMENT
 * ACTIVE
 * EXPIRED
 * CANCELLED
 *
 * Backend already returns displayStatus too, but we keep
 * canonical status in booking.status for filtering/actions.
 */
function mapBookingToUi(booking) {
  return {
    ...booking,

    bookingId: booking?.bookingId,

    id: booking?.bookingId ? `BK-${booking.bookingId}` : "-",

    memberName: booking?.memberName || "-",

    email: booking?.memberEmail || "-",

    phone: booking?.memberPhone || "-",

    date: booking?.startDate || booking?.bookingDate || "",

    startDate: booking?.startDate || "",

    endDate: booking?.endDate || "",

    slot: booking?.slotName || "-",

    time: buildSlotTime(booking?.slotStartTime, booking?.slotEndTime),

    seat: booking?.seatNumber || "-",

    amount: Number(booking?.amount ?? 0),

    paymentStatus: booking?.paymentStatus || "NOT_STARTED",

    status: booking?.status || "",

    displayStatus: booking?.displayStatus || "",

    createdAt: booking?.createdAt || booking?.bookingDate || "",
  };
}

function mapBookingDetailsToUi(details, fallbackBooking) {
  if (!details) {
    return fallbackBooking;
  }

  const canonicalStatus =
    details?.bookingStatus || fallbackBooking?.status || "";

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

    bookingId: details?.bookingId ?? fallbackBooking?.bookingId,

    id:
      details?.bookingId != null
        ? `BK-${details.bookingId}`
        : fallbackBooking?.id || "-",

    memberName: details?.userName || fallbackBooking?.memberName || "-",

    /*
     * BookingDetailsResponse currently does not expose
     * memberEmail/memberPhone, therefore retain those values
     * from OwnerBookingListResponse.
     */
    email: fallbackBooking?.email || "-",

    phone: fallbackBooking?.phone || "-",

    libraryName: details?.libraryName || fallbackBooking?.libraryName,

    floorName: details?.floorName || fallbackBooking?.floorName,

    seat: details?.seatNumber || fallbackBooking?.seat || "-",

    seatType: details?.seatType || fallbackBooking?.seatType,

    slot: details?.slotName || fallbackBooking?.slot || "-",

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

    paymentStatus: fallbackBooking?.paymentStatus || "NOT_STARTED",

    membershipPlanName: details?.membershipPlanName,

    subscriptionId: details?.subscriptionId,
  };
}

/* =========================================================
   STATUS CHIP
========================================================= */

function StatusChip({ status }) {
  const config = {
    /* Booking statuses */
    ACTIVE: {
      label: "Confirmed",
      color: "success",
    },

    PENDING_PAYMENT: {
      label: "Pending",
      color: "warning",
    },

    EXPIRED: {
      label: "Completed",
      color: "info",
    },

    CANCELLED: {
      label: "Cancelled",
      color: "error",
    },

    /* Payment display statuses */
    PAID: {
      label: "Paid",
      color: "success",
    },

    PENDING: {
      label: "Pending",
      color: "warning",
    },

    NOT_STARTED: {
      label: "Not Started",
      color: "default",
    },

    FAILED: {
      label: "Failed",
      color: "error",
    },

    REFUND_PENDING: {
      label: "Refund Pending",
      color: "warning",
    },

    PARTIALLY_REFUNDED: {
      label: "Partially Refunded",
      color: "info",
    },

    REFUNDED: {
      label: "Refunded",
      color: "default",
    },
  };

  const current = config[status] || {
    label: status || "-",
    color: "default",
  };

  return (
    <Chip
      label={current.label}
      color={current.color}
      size="small"
      variant="outlined"
    />
  );
}

/* =========================================================
   BOOKING DETAILS DIALOG
========================================================= */

function BookingDetailsDialog({ booking, open, onClose, loading }) {
  if (!booking && !loading) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Booking Details</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box
            sx={{
              py: 6,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={2.5} mt={1}>
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: "primary.light",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Booking ID
                  </Typography>

                  <Typography variant="h6" fontWeight={700}>
                    {booking?.id}
                  </Typography>
                </Box>

                <StatusChip status={booking?.status} />
              </Stack>
            </Box>

            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Member
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {booking?.memberName || "-"}
                </Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Phone
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {booking?.phone || "-"}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Typography variant="caption" color="text.secondary">
                  Email
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {booking?.email || "-"}
                </Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Start Date
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {formatDate(booking?.startDate)}
                </Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  End Date
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {formatDate(booking?.endDate)}
                </Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Seat
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {booking?.seat || "-"}
                </Typography>

                {booking?.floorName && (
                  <Typography variant="caption" color="text.secondary">
                    {booking.floorName}
                  </Typography>
                )}
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Slot
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {booking?.slot || "-"}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {booking?.time || "-"}
                </Typography>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Amount
                </Typography>

                <Typography variant="body1" fontWeight={700}>
                  ₹{formatCurrency(booking?.amount)}
                </Typography>

                <Box mt={0.5}>
                  <StatusChip status={booking?.paymentStatus} />
                </Box>
              </Grid>

              {booking?.membershipPlanName && (
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Membership Plan
                  </Typography>

                  <Typography variant="body1" fontWeight={600}>
                    {booking.membershipPlanName}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

/* =========================================================
   CANCEL CONFIRMATION
========================================================= */

function CancelBookingDialog({ open, booking, loading, onClose, onConfirm }) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>Cancel Booking</DialogTitle>

      <DialogContent>
        <Typography>
          Are you sure you want to cancel{" "}
          <strong>{booking?.id || "this booking"}</strong>?
        </Typography>

        <Typography variant="body2" color="text.secondary" mt={1}>
          The booking will be marked as cancelled. Seat availability will be
          recalculated from the booking status.
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Keep Booking
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Cancelling..." : "Cancel Booking"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* =========================================================
   BOOKINGS
========================================================= */

function Bookings() {
  /* =====================================================
       LIBRARY
    ===================================================== */

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  /* =====================================================
       BOOKING DATA
    ===================================================== */

  const [bookings, setBookings] = useState([]);

  const [summary, setSummary] = useState(null);

  const [loadingBookings, setLoadingBookings] = useState(false);

  /* =====================================================
       FILTERS
    ===================================================== */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [paymentFilter, setPaymentFilter] = useState("ALL");

  const [dateFilter, setDateFilter] = useState("");

  /* =====================================================
       PAGINATION
    ===================================================== */

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* =====================================================
       DETAILS
    ===================================================== */

  const [selectedBooking, setSelectedBooking] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(false);

  /* =====================================================
       ACTION MENU
    ===================================================== */

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [menuBooking, setMenuBooking] = useState(null);

  /* =====================================================
       CANCEL
    ===================================================== */

  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const [bookingToCancel, setBookingToCancel] = useState(null);

  const [cancelling, setCancelling] = useState(false);

  /* =====================================================
       FEEDBACK
    ===================================================== */

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =====================================================
       LOAD OWNER LIBRARIES
    ===================================================== */

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

      setLibraryId((currentLibraryId) => {
        const currentStillExists =
          currentLibraryId &&
          libraryList.some(
            (library) => String(library.id) === String(currentLibraryId),
          );

        if (currentStillExists) {
          return String(currentLibraryId);
        }

        return String(libraryList[0].id);
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

  /* =====================================================
       LOAD BOOKINGS + SUMMARY
    ===================================================== */

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

  /* =====================================================
       INITIAL LOAD
    ===================================================== */

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (libraryId) {
      loadBookings();
    } else {
      setBookings([]);
      setSummary(null);
    }
  }, [libraryId, loadBookings]);

  /* =====================================================
       FILTER BOOKINGS
    ===================================================== */

  const filteredBookings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bookings.filter((booking) => {
      const searchableValues = [
        booking.id,
        booking.memberName,
        booking.email,
        booking.phone,
        booking.seat,
        booking.slot,
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

  /* =====================================================
       SUMMARY
    ===================================================== */

  const totalBookings = Number(summary?.totalBookings ?? 0);

  const confirmedCount = Number(summary?.confirmedBookings ?? 0);

  const pendingCount = Number(summary?.pendingBookings ?? 0);

  const completedCount = Number(summary?.completedBookings ?? 0);

  const totalRevenue = Number(summary?.paidRevenue ?? 0);

  const completedPayments = Number(summary?.completedPayments ?? 0);

  /* =====================================================
       DETAILS
    ===================================================== */

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

  /* =====================================================
       ACTION MENU
    ===================================================== */

  const handleOpenMenu = (event, booking) => {
    setMenuAnchor(event.currentTarget);

    setMenuBooking(booking);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuBooking(null);
  };

  /* =====================================================
       CANCEL BOOKING
    ===================================================== */

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

      /*
       * Reload both:
       *
       * 1. booking list
       * 2. summary/revenue counters
       */
      await loadBookings();
    } catch (err) {
      console.error("Failed to cancel booking:", err);

      setError(getErrorMessage(err, "Unable to cancel booking."));
    } finally {
      setCancelling(false);
    }
  };

  /* =====================================================
       CLEAR FILTERS
    ===================================================== */

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setDateFilter("");
    setPage(0);
  };

  /* =====================================================
       LIBRARY CHANGE
    ===================================================== */

  const handleLibraryChange = (event) => {
    setLibraryId(String(event.target.value));

    setSearch("");
    setStatusFilter("ALL");
    setPaymentFilter("ALL");
    setDateFilter("");
    setPage(0);
    setSuccess("");
    setError("");
  };

  /* =====================================================
       RENDER
    ===================================================== */

  return (
    <Box>
      {/* =============================================
                HEADER
            ============================================= */}

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
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Bookings
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage seat reservations and booking activity.
          </Typography>
        </Box>

        <Button variant="outlined" startIcon={<CalendarMonth />}>
          Booking Calendar
        </Button>
      </Stack>

      {/* =============================================
                ALERTS
            ============================================= */}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* =============================================
                LIBRARY SELECTOR
            ============================================= */}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 260,
            }}
          >
            <InputLabel>Library</InputLabel>

            <Select
              value={libraryId}
              label="Library"
              disabled={loadingLibraries || libraries.length === 0}
              onChange={handleLibraryChange}
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {loadingLibraries && <CircularProgress size={22} />}

          {!loadingLibraries && libraries.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No library is registered for this account.
            </Typography>
          )}
        </Stack>
      </Paper>

      {/* =============================================
                SUMMARY
            ============================================= */}

      <Grid container spacing={2} mb={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.light",
                    color: "primary.main",
                  }}
                >
                  <EventSeat />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Bookings
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {totalBookings}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "success.light",
                    color: "success.main",
                  }}
                >
                  <CheckCircle />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Confirmed
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {confirmedCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "warning.light",
                    color: "warning.dark",
                  }}
                >
                  <CalendarMonth />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Pending
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {pendingCount}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Paid Revenue
              </Typography>

              <Typography variant="h5" fontWeight={700} mt={0.5}>
                ₹{formatCurrency(totalRevenue)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {completedPayments} completed payment
                {completedPayments !== 1 ? "s" : ""}
                {" · "}
                {completedCount} completed booking
                {completedCount !== 1 ? "s" : ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =============================================
                FILTERS
            ============================================= */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search booking, member or seat..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Booking Status</InputLabel>

              <Select
                value={statusFilter}
                label="Booking Status"
                onChange={(event) => {
                  setStatusFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>

                <MenuItem value="PENDING_PAYMENT">Pending</MenuItem>

                <MenuItem value="ACTIVE">Confirmed</MenuItem>

                <MenuItem value="EXPIRED">Completed</MenuItem>

                <MenuItem value="CANCELLED">Cancelled</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 190,
              }}
            >
              <InputLabel>Payment</InputLabel>

              <Select
                value={paymentFilter}
                label="Payment"
                onChange={(event) => {
                  setPaymentFilter(event.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Payments</MenuItem>

                <MenuItem value="PAID">Paid</MenuItem>

                <MenuItem value="PENDING">Pending</MenuItem>

                <MenuItem value="NOT_STARTED">Not Started</MenuItem>

                <MenuItem value="FAILED">Failed</MenuItem>

                <MenuItem value="REFUND_PENDING">Refund Pending</MenuItem>

                <MenuItem value="PARTIALLY_REFUNDED">
                  Partially Refunded
                </MenuItem>

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
              slotProps={{
                inputLabel: {
                  shrink: true,
                },
              }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleClearFilters}
            >
              Clear
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* =============================================
                BOOKING TABLE
            ============================================= */}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Booking List
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {filteredBookings.length} booking
                  {filteredBookings.length !== 1 ? "s" : ""} found
                </Typography>
              </Box>

              {loadingBookings ? (
                <CircularProgress size={22} />
              ) : (
                <Chip
                  label={selectedBooking ? "Booking selected" : "All bookings"}
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Booking</TableCell>

                  <TableCell>Member</TableCell>

                  <TableCell>Date & Slot</TableCell>

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
                      <Box
                        sx={{
                          py: 8,
                        }}
                      >
                        <CircularProgress />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          mt={2}
                        >
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
                      <TableRow key={booking.bookingId} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {booking.id}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {formatDateTime(booking.createdAt)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: "primary.light",
                                color: "primary.main",
                              }}
                            >
                              <Person fontSize="small" />
                            </Box>

                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {booking.memberName}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {booking.phone}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(booking.startDate)}

                            {booking.endDate &&
                              booking.endDate !== booking.startDate &&
                              ` - ${formatDate(booking.endDate)}`}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {booking.slot} · {booking.time}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            icon={<EventSeat />}
                            label={booking.seat}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            ₹{formatCurrency(booking.amount)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <StatusChip status={booking.paymentStatus} />
                        </TableCell>

                        <TableCell>
                          <StatusChip status={booking.status} />
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetails(booking)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={(event) =>
                                handleOpenMenu(event, booking)
                              }
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
                      <Box
                        sx={{
                          py: 8,
                        }}
                      >
                        <EventSeat
                          sx={{
                            fontSize: 48,
                            color: "text.disabled",
                          }}
                        />

                        <Typography variant="h6" fontWeight={700} mt={1}>
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
        </CardContent>
      </Card>

      {/* =============================================
                ACTION MENU
            ============================================= */}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
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
              sx={{
                color: "error.main",
              }}
              onClick={handleRequestCancel}
            >
              <Close
                fontSize="small"
                sx={{
                  mr: 1.5,
                }}
              />
              Cancel Booking
            </MenuItem>
          )}
      </Menu>

      {/* =============================================
                DETAILS DIALOG
            ============================================= */}

      <BookingDetailsDialog
        booking={selectedBooking}
        open={detailsOpen}
        loading={loadingDetails}
        onClose={handleCloseDetails}
      />

      {/* =============================================
                CANCEL DIALOG
            ============================================= */}

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
