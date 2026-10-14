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
  TrendingUp,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import studentSubscriptionApi from "../../../api/studentSubscriptionApi";

import studentBookingApi from "../../../api/studentBookingApi";

import { useNotifications } from "../../../context/NotificationContext";

import { useAuth } from "../../../context/AuthContext";

// ============================================================
// QUICK ACTION CARD
// ============================================================

function QuickAction({ icon, title, description, actionLabel, onClick }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",

        border: "1px solid",
        borderColor: "divider",

        borderRadius: 3,

        cursor: "pointer",

        background:
          "linear-gradient(145deg, #ffffff 0%, rgba(248,250,252,0.9) 100%)",

        transition: "all 0.22s ease",

        "&:hover": {
          transform: "translateY(-4px)",

          borderColor: "primary.light",

          boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)",

          "& .quick-action-icon": {
            transform: "scale(1.08)",

            backgroundColor: "primary.main",

            color: "primary.contrastText",
          },

          "& .quick-action-arrow": {
            transform: "translateX(4px)",
          },
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.8,

          height: "100%",

          "&:last-child": {
            pb: 2.8,
          },
        }}
      >
        <Stack
          spacing={2.2}
          sx={{
            height: "100%",
          }}
        >
          <Box
            className="quick-action-icon"
            sx={{
              width: 50,
              height: 50,

              borderRadius: 2.5,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              backgroundColor: "rgba(79,70,229,0.08)",

              color: "primary.main",

              transition: "all 0.22s ease",
            }}
          >
            {icon}
          </Box>

          <Box
            sx={{
              flex: 1,
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.6,
                lineHeight: 1.6,
              }}
            >
              {description}
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={
              <ArrowForward
                className="quick-action-arrow"
                sx={{
                  transition: "transform 0.2s ease",
                }}
              />
            }
            onClick={(event) => {
              event.stopPropagation();

              onClick();
            }}
            sx={{
              alignSelf: "flex-start",

              px: 0,

              textTransform: "none",

              fontWeight: 700,

              "&:hover": {
                backgroundColor: "transparent",
              },
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

function StatusCard({
  icon,
  title,
  value,
  description,
  loading = false,
  onClick,
}) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",

        border: "1px solid",
        borderColor: "divider",

        borderRadius: 3,

        backgroundColor: "background.paper",

        cursor: onClick ? "pointer" : "default",

        transition: "all 0.2s ease",

        "&:hover": {
          transform: onClick ? "translateY(-3px)" : "none",

          borderColor: onClick ? "primary.light" : "divider",

          boxShadow: onClick ? "0 10px 28px rgba(15,23,42,0.07)" : "none",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack direction="row" spacing={1.8} alignItems="center">
          <Box
            sx={{
              width: 50,
              height: 50,

              minWidth: 50,

              borderRadius: 2.5,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              background:
                "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.05))",

              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box
            sx={{
              minWidth: 0,
              flex: 1,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              {title}
            </Typography>

            {loading ? (
              <CircularProgress
                size={20}
                sx={{
                  display: "block",

                  mt: 0.8,
                }}
              />
            ) : (
              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  mt: 0.2,

                  overflow: "hidden",

                  textOverflow: "ellipsis",

                  whiteSpace: "nowrap",
                }}
              >
                {value}
              </Typography>
            )}

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",

                mt: 0.25,

                overflow: "hidden",

                textOverflow: "ellipsis",

                whiteSpace: "nowrap",
              }}
            >
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

  // ==========================================================
  // AUTH
  // ==========================================================

  const { user } = useAuth();

  const studentName = user?.fullName?.trim() || "Student";

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const { unreadCount } = useNotifications();

  // ==========================================================
  // STATE
  // ==========================================================

  const [subscription, setSubscription] = useState(null);

  const [bookings, setBookings] = useState([]);

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

        const results = await Promise.allSettled([
          studentSubscriptionApi.getMySubscription(),

          studentBookingApi.getMyBookings(),
        ]);

        if (!active) {
          return;
        }

        // ===============================================
        // MEMBERSHIP
        // ===============================================

        if (results[0].status === "fulfilled") {
          setSubscription(results[0].value || null);
        } else {
          setSubscription(null);
        }

        // ===============================================
        // BOOKINGS
        // ===============================================

        if (results[1].status === "fulfilled") {
          setBookings(Array.isArray(results[1].value) ? results[1].value : []);
        } else {
          setBookings([]);
        }

        // ===============================================
        // ERROR
        // ===============================================

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
  // CURRENT SEAT
  // ==========================================================

  const currentSeatValue = subscription?.seatNumber
    ? `Seat ${subscription.seatNumber}`
    : "Not Assigned";

  const currentSeatDescription =
    subscription?.libraryName || "No active library.";

  // ==========================================================
  // UPCOMING BOOKING
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
  // NOTIFICATION DISPLAY
  // ==========================================================

  const notificationDescription =
    unreadCount === 0
      ? "You're all caught up."
      : unreadCount === 1
        ? "1 unread notification"
        : `${unreadCount} unread notifications`;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        pb: 5,
      }}
    >
      {/* ===================================================== */}
      {/* HERO HEADER */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

          borderRadius: 4,

          overflow: "hidden",

          border: "1px solid",

          borderColor: "rgba(79,70,229,0.10)",

          background:
            "linear-gradient(135deg, rgba(79,70,229,0.11) 0%, rgba(255,255,255,1) 52%, rgba(99,102,241,0.06) 100%)",

          position: "relative",

          "&::before": {
            content: '""',

            position: "absolute",

            width: 220,

            height: 220,

            borderRadius: "50%",

            right: -80,

            top: -110,

            background: "rgba(79,70,229,0.08)",
          },

          "&::after": {
            content: '""',

            position: "absolute",

            width: 120,

            height: 120,

            borderRadius: "50%",

            right: 120,

            bottom: -80,

            background: "rgba(99,102,241,0.05)",
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",

            zIndex: 1,

            p: {
              xs: 2.5,
              md: 3.5,
            },

            "&:last-child": {
              pb: {
                xs: 2.5,
                md: 3.5,
              },
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
            spacing={2.5}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 58,

                  height: 58,

                  borderRadius: 3,

                  bgcolor: "primary.main",

                  color: "primary.contrastText",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  boxShadow: "0 10px 26px rgba(79,70,229,0.25)",
                }}
              >
                <TrendingUp
                  sx={{
                    fontSize: 30,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    letterSpacing: "-0.02em",
                  }}
                >
                  Welcome, {studentName}
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Manage your membership, bookings, seat and payments from one
                  place.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="contained"
              size="large"
              startIcon={<LibraryBooks />}
              endIcon={<ArrowForward />}
              onClick={() => navigate("/student/libraries")}
              sx={{
                minHeight: 48,

                px: 2.5,

                borderRadius: 2.5,

                textTransform: "none",

                fontWeight: 700,

                boxShadow: "0 8px 18px rgba(79,70,229,0.22)",
              }}
            >
              Browse Libraries
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

      {error && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* ACTIVITY HEADER */}
      {/* ===================================================== */}

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          mb: 1.6,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800}>
            My Library Activity
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.25,
            }}
          >
            A quick snapshot of your current library activity.
          </Typography>
        </Box>
      </Stack>

      {/* ===================================================== */}
      {/* ACTIVITY CARDS */}
      {/* ===================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 4,
        }}
      >
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
            onClick={() => navigate("/student/membership")}
          />
        </Grid>

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
            onClick={() => navigate("/student/membership")}
          />
        </Grid>

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
            onClick={() => navigate("/student/bookings")}
          />
        </Grid>

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
            value={unreadCount}
            description={notificationDescription}
            loading={false}
            onClick={() => navigate("/student/notifications")}
          />
        </Grid>
      </Grid>

      {/* ===================================================== */}
      {/* QUICK ACTION HEADER */}
      {/* ===================================================== */}

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
        spacing={1}
        sx={{
          mb: 1.8,
        }}
      >
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" fontWeight={800}>
              Quick Actions
            </Typography>

            <Chip
              size="small"
              label="Student"
              color="primary"
              variant="outlined"
              sx={{
                fontWeight: 700,
              }}
            />
          </Stack>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
            }}
          >
            Jump directly to the most frequently used areas.
          </Typography>
        </Box>
      </Stack>

      {/* ===================================================== */}
      {/* QUICK ACTIONS */}
      {/* ===================================================== */}

      <Grid container spacing={2}>
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
            description={
              unreadCount > 0
                ? `You have ${unreadCount} unread notification${
                    unreadCount === 1 ? "" : "s"
                  }.`
                : "View important booking, payment and membership updates."
            }
            actionLabel="View Notifications"
            onClick={() => navigate("/student/notifications")}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StudentDashboard;
