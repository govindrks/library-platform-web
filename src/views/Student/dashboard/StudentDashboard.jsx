import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  CalendarMonth,
  CardMembership,
  EventSeat,
  LibraryBooks,
  Notifications,
  Payments,
  ReceiptLong,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";

import { useNavigate } from "react-router-dom";

import studentSubscriptionApi from "../../../api/studentSubscriptionApi";

import studentBookingApi from "../../../api/studentBookingApi";

import studentNotificationApi from "../../../api/studentNotificationApi";

// ============================================================
// QUICK ACTION CARD
// ============================================================

function QuickAction({ icon, title, description, actionLabel, onClick }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack spacing={2}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              {description}
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForward />}
            onClick={onClick}
            sx={{
              alignSelf: "flex-start",
            }}
          >
            {actionLabel}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// STATUS CARD
// ============================================================

function StatusCard({ icon, title, value, description, loading = false }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2}>
          <Box
            sx={{
              width: 44,
              height: 44,
              minWidth: 44,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.hover",
              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            {loading ? (
              <CircularProgress
                size={20}
                sx={{
                  mt: 1,
                  mb: 0.5,
                }}
              />
            ) : (
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </Typography>
            )}

            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// HELPERS
// ============================================================

const getBookingStatus = (booking) => {
  return booking?.status || booking?.bookingStatus || null;
};

const getBookingDate = (booking) => {
  return booking?.startDate || booking?.bookingDate || null;
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// ============================================================
// STUDENT DASHBOARD
// ============================================================

function StudentDashboard() {
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth?.user);

  const studentName = user?.fullName?.trim() || "Student";

  // ==========================================================
  // STATE
  // ==========================================================

  const [subscription, setSubscription] = useState(null);

  const [bookings, setBookings] = useState([]);

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD DASHBOARD DATA
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");

        /*
         * Use Promise.allSettled so that one unavailable
         * module does not prevent the rest of the student
         * dashboard from loading.
         */
        const results = await Promise.allSettled([
          studentSubscriptionApi.getMySubscription(),

          studentBookingApi.getMyBookings(),

          studentNotificationApi.getUnreadCount(),
        ]);

        if (!active) {
          return;
        }

        // --------------------------------------------------
        // MEMBERSHIP
        // --------------------------------------------------

        if (results[0].status === "fulfilled") {
          setSubscription(results[0].value || null);
        } else {
          /*
           * A student may legitimately have no active
           * subscription, so do not block the dashboard.
           */
          setSubscription(null);
        }

        // --------------------------------------------------
        // BOOKINGS
        // --------------------------------------------------

        if (results[1].status === "fulfilled") {
          setBookings(Array.isArray(results[1].value) ? results[1].value : []);
        } else {
          setBookings([]);
        }

        // --------------------------------------------------
        // NOTIFICATIONS
        // --------------------------------------------------

        if (results[2].status === "fulfilled") {
          const response = results[2].value;

          /*
           * Supports either:
           *
           * 5
           *
           * or:
           *
           * {
           *   count: 5
           * }
           *
           * depending on the current backend response.
           */
          const count =
            typeof response === "number"
              ? response
              : Number(response?.count ?? response?.unreadCount ?? 0);

          setUnreadNotifications(Number.isFinite(count) ? count : 0);
        } else {
          setUnreadNotifications(0);
        }

        /*
         * Show one non-blocking warning only when every
         * dashboard request failed.
         */
        const allFailed = results.every(
          (result) => result.status === "rejected",
        );

        if (allFailed) {
          setError("Some dashboard information could not be loaded.");
        }
      } catch (requestError) {
        console.error("Student dashboard load failed:", requestError);

        if (active) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load dashboard information.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================================
  // UPCOMING BOOKINGS
  // ==========================================================

  const upcomingBookings = useMemo(() => {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return bookings
      .filter((booking) => {
        const status = getBookingStatus(booking);

        /*
         * Only bookings that are still relevant to the
         * student are considered upcoming.
         */
        const validStatus =
          status === "ACTIVE" ||
          status === "CONFIRMED" ||
          status === "PENDING_PAYMENT";

        if (!validStatus) {
          return false;
        }

        const dateValue = getBookingDate(booking);

        if (!dateValue) {
          return true;
        }

        const bookingDate = new Date(`${dateValue}T00:00:00`);

        if (Number.isNaN(bookingDate.getTime())) {
          return true;
        }

        return bookingDate >= today;
      })
      .sort((first, second) => {
        const firstDate = new Date(`${getBookingDate(first)}T00:00:00`);

        const secondDate = new Date(`${getBookingDate(second)}T00:00:00`);

        return firstDate - secondDate;
      });
  }, [bookings]);

  const nextBooking = upcomingBookings[0] || null;

  // ==========================================================
  // MEMBERSHIP DISPLAY
  // ==========================================================

  const membershipValue = subscription?.planName || "No Active Plan";

  const membershipDescription = subscription
    ? subscription.daysRemaining != null
      ? `${subscription.daysRemaining} days remaining`
      : subscription.endDate
        ? `Valid until ${formatDate(subscription.endDate)}`
        : "Active membership"
    : "No active membership.";

  // ==========================================================
  // CURRENT SEAT DISPLAY
  // ==========================================================

  const currentSeatValue = subscription?.seatNumber
    ? `Seat ${subscription.seatNumber}`
    : "Not Assigned";

  const currentSeatDescription =
    subscription?.libraryName || "No active library.";

  // ==========================================================
  // UPCOMING BOOKING DISPLAY
  // ==========================================================

  const upcomingBookingValue = nextBooking?.seatNumber
    ? `Seat ${nextBooking.seatNumber}`
    : upcomingBookings.length > 0
      ? `${upcomingBookings.length} Upcoming`
      : "No Booking";

  const upcomingBookingDescription = nextBooking
    ? [formatDate(getBookingDate(nextBooking)), nextBooking.slotName]
        .filter(Boolean)
        .join(" • ")
    : "No upcoming booking.";

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box>
      {/* ======================================================
          HEADER
      ====================================================== */}

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
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Welcome, {studentName}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Manage your memberships, bookings, seats and payments.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<LibraryBooks />}
          onClick={() => navigate("/student/libraries")}
        >
          Browse Libraries
        </Button>
      </Stack>

      {/* ======================================================
          ERROR
      ====================================================== */}

      {error && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {/* ======================================================
          STUDENT ACTIVITY
      ====================================================== */}

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          mb: 1.5,
        }}
      >
        My Library Activity
      </Typography>

      <Grid
        container
        spacing={2}
        sx={{
          mb: 4,
        }}
      >
        {/* ACTIVE MEMBERSHIP */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatusCard
            icon={<CardMembership />}
            title="Active Membership"
            value={membershipValue}
            description={membershipDescription}
            loading={loading}
          />
        </Grid>

        {/* CURRENT SEAT */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatusCard
            icon={<EventSeat />}
            title="Current Seat"
            value={currentSeatValue}
            description={currentSeatDescription}
            loading={loading}
          />
        </Grid>

        {/* UPCOMING BOOKING */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatusCard
            icon={<CalendarMonth />}
            title="Upcoming Booking"
            value={upcomingBookingValue}
            description={upcomingBookingDescription}
            loading={loading}
          />
        </Grid>

        {/* NOTIFICATIONS */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatusCard
            icon={<Notifications />}
            title="Notifications"
            value={unreadNotifications}
            description={
              unreadNotifications === 1
                ? "1 unread notification"
                : `${unreadNotifications} unread notifications`
            }
            loading={loading}
          />
        </Grid>
      </Grid>

      {/* ======================================================
          QUICK ACTION HEADER
      ====================================================== */}

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          mb: 1.5,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Quick Actions
        </Typography>

        <Chip size="small" label="Student" color="primary" variant="outlined" />
      </Stack>

      {/* ======================================================
          QUICK ACTIONS
      ====================================================== */}

      <Grid container spacing={2}>
        {/* FIND LIBRARY */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <QuickAction
            icon={<LibraryBooks />}
            title="Find a Library"
            description="Browse libraries, amenities and membership plans."
            actionLabel="Browse Libraries"
            onClick={() => navigate("/student/libraries")}
          />
        </Grid>

        {/* FIND SEAT */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <QuickAction
            icon={<EventSeat />}
            title="Find a Seat"
            description="Choose a library, membership plan and available seat."
            actionLabel="Find Seats"
            onClick={() => navigate("/student/libraries")}
          />
        </Grid>

        {/* BOOKINGS */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <QuickAction
            icon={<CalendarMonth />}
            title="My Bookings"
            description="View your current and previous bookings."
            actionLabel="View Bookings"
            onClick={() => navigate("/student/bookings")}
          />
        </Grid>

        {/* MEMBERSHIP */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <QuickAction
            icon={<CardMembership />}
            title="My Membership"
            description="View your active membership and assigned seat."
            actionLabel="View Membership"
            onClick={() => navigate("/student/membership")}
          />
        </Grid>

        {/* PAYMENTS */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <QuickAction
            icon={<Payments />}
            title="Payments"
            description="View your booking and membership payment history."
            actionLabel="View Payments"
            onClick={() => navigate("/student/payments")}
          />
        </Grid>

        {/* INVOICES */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <QuickAction
            icon={<ReceiptLong />}
            title="Invoices"
            description="View and download invoices for successful payments."
            actionLabel="View Invoices"
            onClick={() => navigate("/student/invoices")}
          />
        </Grid>

        {/* NOTIFICATIONS */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 4,
          }}
        >
          <QuickAction
            icon={<Notifications />}
            title="Notifications"
            description="View important booking, payment and membership updates."
            actionLabel="View Notifications"
            onClick={() => navigate("/student/notifications")}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StudentDashboard;
