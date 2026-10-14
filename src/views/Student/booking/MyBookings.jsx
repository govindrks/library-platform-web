import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  CalendarMonth,
  CancelOutlined,
  CheckCircleOutlineOutlined,
  EventSeat,
  HourglassTop,
  Refresh,
  Schedule,
  Visibility,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import studentBookingApi from "../../../api/studentBookingApi";

// ============================================================
// HELPERS
// ============================================================

const formatMoney = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
};

const formatStatus = (status) => {
  if (!status) {
    return "-";
  }

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "CONFIRMED":
      return "success";

    case "PENDING_PAYMENT":
      return "warning";

    case "CANCELLED":
      return "default";

    case "EXPIRED":
      return "default";

    default:
      return "default";
  }
};

const getStatusAccent = (status) => {
  switch (status) {
    case "ACTIVE":
    case "CONFIRMED":
      return {
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.09), rgba(255,255,255,1) 56%)",

        borderColor: "rgba(34,197,94,0.24)",

        iconBg: "rgba(34,197,94,0.10)",

        iconColor: "success.main",
      };

    case "PENDING_PAYMENT":
      return {
        background:
          "linear-gradient(135deg, rgba(245,158,11,0.10), rgba(255,255,255,1) 56%)",

        borderColor: "rgba(245,158,11,0.26)",

        iconBg: "rgba(245,158,11,0.10)",

        iconColor: "warning.main",
      };

    case "CANCELLED":
      return {
        background:
          "linear-gradient(135deg, rgba(100,116,139,0.07), rgba(255,255,255,1) 56%)",

        borderColor: "divider",

        iconBg: "rgba(100,116,139,0.08)",

        iconColor: "text.secondary",
      };

    default:
      return {
        background:
          "linear-gradient(135deg, rgba(79,70,229,0.07), rgba(255,255,255,1) 56%)",

        borderColor: "divider",

        iconBg: "rgba(79,70,229,0.08)",

        iconColor: "primary.main",
      };
  }
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
// SUMMARY CARD
// ============================================================

function BookingSummaryCard({ icon, label, value, description }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        border: "1px solid",
        borderColor: "divider",

        borderRadius: 3,

        background:
          "linear-gradient(145deg, #ffffff 0%, rgba(248,250,252,0.9) 100%)",

        transition: "all 0.22s ease",

        "&:hover": {
          transform: "translateY(-3px)",

          borderColor: "primary.light",

          boxShadow: "0 10px 28px rgba(15,23,42,0.07)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.4,

          "&:last-child": {
            pb: 2.4,
          },
        }}
      >
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,

              minWidth: 48,

              borderRadius: 2.5,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              bgcolor: "rgba(79,70,229,0.08)",

              color: "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              {label}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                mt: 0.15,
              }}
            >
              {value}
            </Typography>

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
// COMPONENT
// ============================================================

function MyBookings() {
  // ==========================================================
  // ROUTER
  // ==========================================================

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

  const [highlightedBookingId, setHighlightedBookingId] = useState(null);

  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  // ==========================================================
  // STATE
  // ==========================================================

  const [bookings, setBookings] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // LOAD BOOKINGS
  // ==========================================================

  const loadBookings = useCallback(async ({ showFullLoader = true } = {}) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await studentBookingApi.getMyBookings();

      const bookingList = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : [];

      setBookings(bookingList);

      return bookingList;
    } catch (requestError) {
      console.error("Failed to load student bookings:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load your bookings.",
      );

      return [];
    } finally {
      setLoading(false);

      setRefreshing(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadBookings({
      showFullLoader: true,
    });
  }, [loadBookings]);

  // ==========================================================
  // SORT BOOKINGS
  // ==========================================================

  const sortedBookings = useMemo(
    () =>
      [...bookings].sort((a, b) => {
        const aDate = new Date(a.startDate || 0);

        const bDate = new Date(b.startDate || 0);

        return bDate - aDate;
      }),
    [bookings],
  );

  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const bookingSummary = useMemo(() => {
    const result = {
      total: bookings.length,

      active: 0,

      pending: 0,

      cancelled: 0,
    };

    bookings.forEach((booking) => {
      const status = booking.status ?? booking.bookingStatus;

      if (status === "ACTIVE" || status === "CONFIRMED") {
        result.active += 1;
      }

      if (status === "PENDING_PAYMENT") {
        result.pending += 1;
      }

      if (status === "CANCELLED") {
        result.cancelled += 1;
      }
    });

    return result;
  }, [bookings]);

  // ==========================================================
  // RESOLVE NOTIFICATION TARGET
  // ==========================================================

  useEffect(() => {
    if (deepLinkHandled) {
      return;
    }

    if (loading) {
      return;
    }

    if (!fromNotification) {
      setDeepLinkHandled(true);

      return;
    }

    if (notificationReferenceType !== "BOOKING") {
      setDeepLinkHandled(true);

      navigate(location.pathname, {
        replace: true,

        state: null,
      });

      return;
    }

    if (!notificationReferenceId) {
      setDeepLinkHandled(true);

      navigate(location.pathname, {
        replace: true,

        state: null,
      });

      return;
    }

    const matchingBooking = sortedBookings.find(
      (booking) =>
        Number(booking?.bookingId ?? booking?.id) ===
        Number(notificationReferenceId),
    );

    if (!matchingBooking) {
      setError(`Booking #${notificationReferenceId} could not be found.`);

      setDeepLinkHandled(true);

      navigate(location.pathname, {
        replace: true,

        state: null,
      });

      return;
    }

    const targetBookingId = matchingBooking.bookingId ?? matchingBooking.id;

    setHighlightedBookingId(targetBookingId);

    setSuccess(`Booking #${targetBookingId} opened from notification.`);

    setDeepLinkHandled(true);

    navigate(location.pathname, {
      replace: true,

      state: null,
    });

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(
        `student-booking-${targetBookingId}`,
      );

      element?.scrollIntoView({
        behavior: "smooth",

        block: "center",
      });
    }, 150);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    deepLinkHandled,
    loading,
    fromNotification,
    notificationReferenceId,
    notificationReferenceType,
    sortedBookings,
    location.pathname,
    navigate,
  ]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    setError("");

    setSuccess("");

    loadBookings({
      showFullLoader: false,
    });
  };

  // ==========================================================
  // VIEW DETAILS
  // ==========================================================

  const handleViewDetails = (booking) => {
    const bookingId = booking?.bookingId ?? booking?.id;

    if (!bookingId) {
      setError("Booking ID is unavailable.");

      return;
    }

    navigate(`/student/bookings/${bookingId}`);
  };

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

          borderColor: "rgba(79,70,229,0.12)",

          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(255,255,255,1) 52%, rgba(99,102,241,0.055) 100%)",

          position: "relative",

          "&::before": {
            content: '""',

            position: "absolute",

            width: 210,
            height: 210,

            right: -80,
            top: -110,

            borderRadius: "50%",

            background: "rgba(79,70,229,0.07)",
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",

            zIndex: 1,

            p: {
              xs: 2.5,
              md: 3.3,
            },

            "&:last-child": {
              pb: {
                xs: 2.5,
                md: 3.3,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,

                  minWidth: 56,

                  borderRadius: 3,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  bgcolor: "primary.main",

                  color: "primary.contrastText",

                  boxShadow: "0 10px 25px rgba(79,70,229,0.24)",
                }}
              >
                <CalendarMonth
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
                  My Bookings
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.45,
                  }}
                >
                  Track your current and previous seat bookings.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={
                refreshing ? <CircularProgress size={16} /> : <Refresh />
              }
              disabled={refreshing}
              onClick={handleRefresh}
              sx={{
                minHeight: 46,

                px: 2.3,

                borderRadius: 2.5,

                textTransform: "none",

                fontWeight: 700,

                bgcolor: "background.paper",
              }}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* SUCCESS */}
      {/* ===================================================== */}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,

            borderRadius: 2.5,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,

            borderRadius: 2.5,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* SUMMARY */}
      {/* ===================================================== */}

      {!loading && (
        <Grid
          container
          spacing={2}
          sx={{
            mb: 3.5,
          }}
        >
          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <BookingSummaryCard
              icon={<CalendarMonth />}
              label="Total Bookings"
              value={bookingSummary.total}
              description="All booking records"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <BookingSummaryCard
              icon={<CheckCircleOutlineOutlined />}
              label="Active"
              value={bookingSummary.active}
              description="Currently active"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <BookingSummaryCard
              icon={<HourglassTop />}
              label="Pending Payment"
              value={bookingSummary.pending}
              description="Awaiting payment"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <BookingSummaryCard
              icon={<CancelOutlined />}
              label="Cancelled"
              value={bookingSummary.cancelled}
              description="Cancelled bookings"
            />
          </Grid>
        </Grid>
      )}

      {/* ===================================================== */}
      {/* SECTION HEADER */}
      {/* ===================================================== */}

      {!loading && sortedBookings.length > 0 && (
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
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Booking History
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.25,
              }}
            >
              Your latest bookings appear first.
            </Typography>
          </Box>

          <Chip
            label={`${sortedBookings.length} ${
              sortedBookings.length === 1 ? "Booking" : "Bookings"
            }`}
            color="primary"
            variant="outlined"
            sx={{
              fontWeight: 700,
            }}
          />
        </Stack>
      )}

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      {loading ? (
        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            py: 8,
          }}
        >
          <CircularProgress />

          <Typography color="text.secondary">Loading bookings...</Typography>
        </Stack>
      ) : sortedBookings.length === 0 ? (
        /* ================================================= */
        /* EMPTY STATE                                       */
        /* ================================================= */

        <Card
          elevation={0}
          sx={{
            border: "1px dashed",

            borderColor: "divider",

            borderRadius: 4,

            minHeight: 320,

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            background:
              "linear-gradient(145deg, rgba(248,250,252,0.9), rgba(255,255,255,1))",
          }}
        >
          <CardContent
            sx={{
              textAlign: "center",

              py: 6,
            }}
          >
            <Box
              sx={{
                width: 70,
                height: 70,

                borderRadius: "50%",

                mx: "auto",

                mb: 2,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                bgcolor: "rgba(79,70,229,0.08)",

                color: "primary.main",
              }}
            >
              <EventSeat
                sx={{
                  fontSize: 36,
                }}
              />
            </Box>

            <Typography variant="h5" fontWeight={800}>
              No bookings yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.7,

                mb: 2.5,
              }}
            >
              Book a study seat and your booking details will appear here.
            </Typography>

            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => navigate("/student/libraries")}
              sx={{
                textTransform: "none",

                fontWeight: 700,

                borderRadius: 2.5,

                px: 2.5,
              }}
            >
              Browse Libraries
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* ================================================= */
        /* BOOKING GRID                                      */
        /* ================================================= */

        <Grid container spacing={2.5}>
          {sortedBookings.map((booking) => {
            const bookingId = booking.bookingId ?? booking.id;

            const status = booking.status ?? booking.bookingStatus;

            const highlighted =
              String(highlightedBookingId) === String(bookingId);

            const accent = getStatusAccent(status);

            return (
              <Grid
                key={bookingId}
                size={{
                  xs: 12,
                  md: 6,
                  xl: 4,
                }}
              >
                <Card
                  id={`student-booking-${bookingId}`}
                  elevation={0}
                  onClick={() => handleViewDetails(booking)}
                  sx={{
                    height: "100%",

                    cursor: "pointer",

                    border: highlighted ? "2px solid" : "1px solid",

                    borderColor: highlighted
                      ? "primary.main"
                      : accent.borderColor,

                    background: highlighted
                      ? "linear-gradient(135deg, rgba(79,70,229,0.10), #ffffff 60%)"
                      : accent.background,

                    boxShadow: highlighted
                      ? "0 14px 34px rgba(79,70,229,0.16)"
                      : "0 4px 16px rgba(15,23,42,0.035)",

                    borderRadius: 4,

                    overflow: "hidden",

                    position: "relative",

                    transition: "all 0.24s ease",

                    "&:hover": {
                      transform: "translateY(-5px)",

                      boxShadow: "0 16px 36px rgba(15,23,42,0.10)",

                      borderColor: highlighted
                        ? "primary.main"
                        : "primary.light",
                    },

                    "&::before": {
                      content: '""',

                      position: "absolute",

                      top: 0,
                      left: 0,

                      width: "100%",
                      height: 4,

                      bgcolor:
                        status === "ACTIVE" || status === "CONFIRMED"
                          ? "success.main"
                          : status === "PENDING_PAYMENT"
                            ? "warning.main"
                            : status === "CANCELLED"
                              ? "grey.400"
                              : "primary.main",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2.7,

                      height: "100%",

                      "&:last-child": {
                        pb: 2.7,
                      },
                    }}
                  >
                    <Stack
                      spacing={2.2}
                      sx={{
                        height: "100%",
                      }}
                    >
                      {/* ================================= */}
                      {/* HEADER */}
                      {/* ================================= */}

                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={1}
                      >
                        <Stack
                          direction="row"
                          spacing={1.4}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 46,
                              height: 46,

                              borderRadius: 2.5,

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              bgcolor: accent.iconBg,

                              color: accent.iconColor,
                            }}
                          >
                            <EventSeat />
                          </Box>

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={700}
                            >
                              BOOKING
                            </Typography>

                            <Typography
                              variant="h5"
                              fontWeight={800}
                              sx={{
                                mt: 0.1,
                              }}
                            >
                              #{bookingId}
                            </Typography>
                          </Box>
                        </Stack>

                        <Chip
                          size="small"
                          label={formatStatus(status)}
                          color={getStatusColor(status)}
                          variant="outlined"
                          sx={{
                            fontWeight: 700,

                            bgcolor: "rgba(255,255,255,0.75)",
                          }}
                        />
                      </Stack>

                      <Divider />

                      {/* ================================= */}
                      {/* DETAILS */}
                      {/* ================================= */}

                      <Stack spacing={1.35}>
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <EventSeat
                            fontSize="small"
                            sx={{
                              color: "primary.main",
                            }}
                          />

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Seat
                            </Typography>

                            <Typography variant="body2" fontWeight={700}>
                              {booking.seatNumber ?? "-"}
                            </Typography>
                          </Box>
                        </Stack>

                        {booking.slotName && (
                          <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                          >
                            <Schedule
                              fontSize="small"
                              sx={{
                                color: "primary.main",
                              }}
                            />

                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Slot
                              </Typography>

                              <Typography variant="body2" fontWeight={700}>
                                {booking.slotName}
                              </Typography>
                            </Box>
                          </Stack>
                        )}

                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <CalendarMonth
                            fontSize="small"
                            sx={{
                              color: "primary.main",
                            }}
                          />

                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Booking Date
                            </Typography>

                            <Typography variant="body2" fontWeight={700}>
                              {formatDate(booking.startDate)}

                              {booking.endDate &&
                                booking.endDate !== booking.startDate &&
                                ` - ${formatDate(booking.endDate)}`}
                            </Typography>
                          </Box>
                        </Stack>

                        {(booking.slotStartTime || booking.slotEndTime) && (
                          <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                          >
                            <Schedule
                              fontSize="small"
                              sx={{
                                color: "primary.main",
                              }}
                            />

                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Time
                              </Typography>

                              <Typography variant="body2" fontWeight={700}>
                                {booking.slotStartTime || "-"}

                                {" - "}

                                {booking.slotEndTime || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        )}
                      </Stack>

                      {/* ================================= */}
                      {/* AMOUNT */}
                      {/* ================================= */}

                      <Box
                        sx={{
                          p: 1.6,

                          borderRadius: 2.5,

                          bgcolor: "rgba(79,70,229,0.055)",

                          border: "1px solid",

                          borderColor: "rgba(79,70,229,0.08)",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Booking Amount
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight={800}
                          color="primary.main"
                          sx={{
                            mt: 0.1,
                          }}
                        >
                          {formatMoney(booking.amount)}
                        </Typography>
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                        }}
                      />

                      {/* ================================= */}
                      {/* VIEW DETAILS */}
                      {/* ================================= */}

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Visibility />}
                        endIcon={<ArrowForward />}
                        onClick={(event) => {
                          event.stopPropagation();

                          handleViewDetails(booking);
                        }}
                        sx={{
                          minHeight: 46,

                          borderRadius: 2.5,

                          textTransform: "none",

                          fontWeight: 700,

                          bgcolor: "rgba(255,255,255,0.72)",

                          transition: "all 0.2s ease",

                          "&:hover": {
                            bgcolor: "primary.main",

                            color: "primary.contrastText",

                            borderColor: "primary.main",
                          },
                        }}
                      >
                        View Details
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}

export default MyBookings;
