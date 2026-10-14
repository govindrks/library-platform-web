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
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  CalendarMonth,
  EventSeat,
  History,
  LibraryBooks,
  Refresh,
  SwapHoriz,
  WorkspacePremium,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import studentSubscriptionApi from "../../../api/studentSubscriptionApi";

// ============================================================
// HELPERS
// ============================================================

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

const formatStatus = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "EXPIRED":
      return "warning";

    case "CANCELLED":
      return "default";

    case "SUSPENDED":
      return "error";

    default:
      return "default";
  }
};

function calculateProgress(startDate, endDate, daysRemaining) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);

  const end = new Date(`${endDate}T00:00:00`);

  const totalDays = Math.max(
    1,
    Math.ceil((end - start) / (1000 * 60 * 60 * 24)),
  );

  const remaining = Math.max(0, Number(daysRemaining ?? 0));

  const used = totalDays - remaining;

  return Math.min(100, Math.max(0, (used / totalDays) * 100));
}

// ============================================================
// DETAIL CARD
// ============================================================

function DetailCard({ icon, title, value }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        backgroundColor: "background.paper",

        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",

        "&:hover": {
          transform: "translateY(-3px)",

          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",

          borderColor: "primary.light",
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

              borderRadius: 2.5,

              background:
                "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(99,102,241,0.05))",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              color: "primary.main",

              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mb: 0.35,
                fontWeight: 600,
              }}
            >
              {title}
            </Typography>

            <Typography variant="subtitle1" fontWeight={800} noWrap>
              {value || "-"}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// HISTORY CARD
// ============================================================

function MembershipHistoryCard({ item, highlighted }) {
  return (
    <Card
      id={`student-membership-${item.subscriptionId}`}
      elevation={0}
      sx={{
        border: highlighted ? "2px solid" : "1px solid",

        borderColor: highlighted ? "primary.main" : "divider",

        backgroundColor: highlighted
          ? "rgba(79,70,229,0.035)"
          : "background.paper",

        borderRadius: 3,

        boxShadow: highlighted ? "0 10px 30px rgba(79,70,229,0.12)" : "none",

        transition: "all 0.25s ease",

        "&:hover": {
          borderColor: "primary.light",

          boxShadow: "0 8px 24px rgba(15,23,42,0.07)",
        },
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2.2,
            md: 2.8,
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
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={600}
            >
              Membership #{item.subscriptionId}
            </Typography>

            <Typography
              variant="h6"
              fontWeight={800}
              sx={{
                mt: 0.35,
              }}
            >
              {item.planName || "Membership"}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.35,
              }}
            >
              {item.libraryName || "-"}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={formatStatus(item.status)}
            color={getStatusColor(item.status)}
            variant="outlined"
            sx={{
              fontWeight: 700,
            }}
          />
        </Stack>

        <Divider
          sx={{
            my: 2.2,
          }}
        />

        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <DetailCard
              icon={<EventSeat />}
              title="Seat"
              value={item.seatNumber || "-"}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <DetailCard
              icon={<CalendarMonth />}
              title="Start Date"
              value={formatDate(item.startDate)}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4,
            }}
          >
            <DetailCard
              icon={<CalendarMonth />}
              title="End Date"
              value={formatDate(item.endDate)}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MEMBERSHIP DETAILS
// ============================================================

function MembershipDetails() {
  // ==========================================================
  // ROUTER
  // ==========================================================

  const navigate = useNavigate();

  const location = useLocation();

  // ==========================================================
  // ROUTE / NOTIFICATION STATE
  // ==========================================================

  const paymentSuccess = Boolean(location.state?.paymentSuccess);

  const fromNotification = Boolean(location.state?.fromNotification);

  const notificationReferenceId =
    location.state?.notificationReferenceId ?? null;

  const notificationReferenceType =
    location.state?.notificationReferenceType ?? null;

  // ==========================================================
  // STATE
  // ==========================================================

  const [subscription, setSubscription] = useState(null);

  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [highlightedSubscriptionId, setHighlightedSubscriptionId] =
    useState(null);

  const [notificationHandled, setNotificationHandled] = useState(false);

  // ==========================================================
  // LOAD ACTIVE MEMBERSHIP + HISTORY
  // ==========================================================

  const loadSubscription = useCallback(
    async ({ showFullLoader = true } = {}) => {
      try {
        if (showFullLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const historyPromise =
          typeof studentSubscriptionApi.getSubscriptionHistory === "function"
            ? studentSubscriptionApi.getSubscriptionHistory()
            : Promise.resolve([]);

        const [activeResult, historyResult] = await Promise.allSettled([
          studentSubscriptionApi.getMySubscription(),

          historyPromise,
        ]);

        // -----------------------------------------------
        // ACTIVE MEMBERSHIP
        // -----------------------------------------------

        if (activeResult.status === "fulfilled") {
          setSubscription(activeResult.value || null);
        } else {
          setSubscription(null);
        }

        // -----------------------------------------------
        // HISTORY
        // -----------------------------------------------

        if (historyResult.status === "fulfilled") {
          const response = historyResult.value;

          setHistory(
            Array.isArray(response)
              ? response
              : Array.isArray(response?.content)
                ? response.content
                : [],
          );
        } else {
          console.error(
            "Failed to load membership history:",
            historyResult.reason,
          );

          setHistory([]);
        }

        // -----------------------------------------------
        // ERROR ONLY IF BOTH FAIL
        // -----------------------------------------------

        if (
          activeResult.status === "rejected" &&
          historyResult.status === "rejected"
        ) {
          setError(
            activeResult.reason?.response?.data?.message ||
              activeResult.reason?.message ||
              "Unable to load membership information.",
          );
        }
      } catch (requestError) {
        console.error("Failed to load membership:", requestError);

        setSubscription(null);

        setHistory([]);

        setError(
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            requestError?.message ||
            "Unable to load membership information.",
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [],
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadSubscription({
      showFullLoader: true,
    });
  }, [loadSubscription]);

  // ==========================================================
  // PROGRESS
  // ==========================================================

  const progress = useMemo(
    () =>
      calculateProgress(
        subscription?.startDate,

        subscription?.endDate,

        subscription?.daysRemaining,
      ),
    [subscription],
  );

  // ==========================================================
  // COMBINED SUBSCRIPTIONS
  // ==========================================================

  const allSubscriptions = useMemo(() => {
    const result = [];

    if (subscription?.subscriptionId) {
      result.push(subscription);
    }

    history.forEach((item) => {
      const alreadyIncluded = result.some(
        (existing) =>
          Number(existing?.subscriptionId) === Number(item?.subscriptionId),
      );

      if (!alreadyIncluded) {
        result.push(item);
      }
    });

    return result;
  }, [subscription, history]);

  // ==========================================================
  // NOTIFICATION DEEP LINK
  // ==========================================================

  useEffect(() => {
    if (notificationHandled || loading) {
      return;
    }

    if (!fromNotification) {
      setNotificationHandled(true);

      return;
    }

    if (notificationReferenceType !== "SUBSCRIPTION") {
      setNotificationHandled(true);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    if (!notificationReferenceId) {
      setNotificationHandled(true);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    const matchingSubscription = allSubscriptions.find(
      (item) =>
        Number(item?.subscriptionId) === Number(notificationReferenceId),
    );

    if (!matchingSubscription) {
      setError(`Membership #${notificationReferenceId} could not be found.`);

      setNotificationHandled(true);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    setHighlightedSubscriptionId(matchingSubscription.subscriptionId);

    setSuccess(
      `Membership #${matchingSubscription.subscriptionId} opened from notification.`,
    );

    setNotificationHandled(true);

    navigate(location.pathname, {
      replace: true,
      state: null,
    });

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(
        `student-membership-${matchingSubscription.subscriptionId}`,
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
    notificationHandled,
    loading,
    fromNotification,
    notificationReferenceId,
    notificationReferenceType,
    allSubscriptions,
    location.pathname,
    navigate,
  ]);

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    setError("");

    setSuccess("");

    loadSubscription({
      showFullLoader: false,
    });
  };

  // ==========================================================
  // ACTIVE CARD HIGHLIGHT
  // ==========================================================

  const activeHighlighted =
    subscription?.subscriptionId &&
    String(subscription.subscriptionId) === String(highlightedSubscriptionId);

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{
          py: 10,
        }}
      >
        <CircularProgress />

        <Typography color="text.secondary" fontWeight={500}>
          Loading membership...
        </Typography>
      </Stack>
    );
  }

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
      {/* PAGE HEADER */}
      {/* ===================================================== */}

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          md: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              letterSpacing: "-0.02em",
            }}
          >
            My Membership
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.6,
            }}
          >
            View your active plan, assigned seat and membership history.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <Refresh />}
          disabled={refreshing}
          onClick={handleRefresh}
          sx={{
            alignSelf: {
              xs: "flex-start",

              md: "center",
            },

            minHeight: 44,

            px: 2.2,

            borderRadius: 2,

            textTransform: "none",

            fontWeight: 700,
          }}
        >
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </Stack>

      {/* ===================================================== */}
      {/* ALERTS */}
      {/* ===================================================== */}

      {paymentSuccess && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          Payment completed successfully. Your membership is active.
        </Alert>
      )}

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
      {/* CURRENT MEMBERSHIP */}
      {/* ===================================================== */}

      {subscription ? (
        <>
          <Card
            id={`student-membership-${subscription.subscriptionId}`}
            elevation={0}
            sx={{
              mb: 3,

              position: "relative",

              overflow: "hidden",

              border: activeHighlighted ? "2px solid" : "1px solid",

              borderColor: activeHighlighted ? "primary.main" : "divider",

              borderRadius: 4,

              background:
                "linear-gradient(135deg, rgba(79,70,229,0.07) 0%, rgba(255,255,255,1) 45%, rgba(99,102,241,0.035) 100%)",

              boxShadow: activeHighlighted
                ? "0 12px 34px rgba(79,70,229,0.14)"
                : "0 5px 20px rgba(15,23,42,0.045)",

              transition: "all 0.25s ease",

              "&::before": {
                content: '""',

                position: "absolute",

                top: -70,
                right: -60,

                width: 190,
                height: 190,

                borderRadius: "50%",

                background: "rgba(79,70,229,0.06)",
              },
            }}
          >
            <CardContent
              sx={{
                position: "relative",

                zIndex: 1,

                p: {
                  xs: 2.5,
                  md: 3.2,
                },

                "&:last-child": {
                  pb: {
                    xs: 2.5,
                    md: 3.2,
                  },
                },
              }}
            >
              {/* =========================================== */}
              {/* MEMBERSHIP HEADER */}
              {/* =========================================== */}

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
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 54,
                      height: 54,

                      borderRadius: 3,

                      bgcolor: "primary.main",

                      color: "primary.contrastText",

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      boxShadow: "0 8px 20px rgba(79,70,229,0.25)",
                    }}
                  >
                    <WorkspacePremium
                      sx={{
                        fontSize: 30,
                      }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={700}
                    >
                      CURRENT MEMBERSHIP
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{
                        mt: 0.2,
                        letterSpacing: "-0.02em",
                      }}
                    >
                      {subscription.planName}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.25,
                      }}
                    >
                      {subscription.libraryName}
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={formatStatus(subscription.status)}
                  color={getStatusColor(subscription.status)}
                  sx={{
                    fontWeight: 800,
                    px: 0.6,
                    minHeight: 34,
                  }}
                />
              </Stack>

              <Divider
                sx={{
                  my: 3,
                }}
              />

              {/* =========================================== */}
              {/* MEMBERSHIP PROGRESS */}
              {/* =========================================== */}

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
                  mb: 1.3,
                }}
              >
                <Box>
                  <Typography fontWeight={800}>Membership usage</Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                    }}
                  >
                    Track your current membership period.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    px: 1.5,
                    py: 0.7,

                    borderRadius: 50,

                    bgcolor: "rgba(79,70,229,0.08)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="primary.main"
                    fontWeight={800}
                  >
                    {subscription.daysRemaining} days remaining
                  </Typography>
                </Box>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 10,

                  borderRadius: 20,

                  bgcolor: "rgba(79,70,229,0.10)",

                  "& .MuiLinearProgress-bar": {
                    borderRadius: 20,

                    background: "linear-gradient(90deg, #4f46e5, #818cf8)",
                  },
                }}
              />

              {/* =========================================== */}
              {/* TIMELINE */}
              {/* =========================================== */}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{
                  mt: 1.3,
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Started
                  </Typography>

                  <Typography variant="body2" fontWeight={700}>
                    {formatDate(subscription.startDate)}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    textAlign: "center",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Progress
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={800}
                    color="primary.main"
                  >
                    {Math.round(progress)}%
                  </Typography>
                </Box>

                <Box
                  sx={{
                    textAlign: "right",
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Valid until
                  </Typography>

                  <Typography variant="body2" fontWeight={700}>
                    {formatDate(subscription.endDate)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* =============================================== */}
          {/* DETAIL CARDS */}
          {/* =============================================== */}

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <DetailCard
                icon={<LibraryBooks />}
                title="Library"
                value={subscription.libraryName}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <DetailCard
                icon={<WorkspacePremium />}
                title="Plan"
                value={subscription.planName}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <DetailCard
                icon={<EventSeat />}
                title="Assigned Seat"
                value={subscription.seatNumber}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <DetailCard
                icon={<CalendarMonth />}
                title="Valid Until"
                value={formatDate(subscription.endDate)}
              />
            </Grid>
          </Grid>

          {/* =============================================== */}
          {/* ACTIONS */}
          {/* =============================================== */}

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.5}
            sx={{
              mt: 3,
            }}
          >
            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => navigate("/student/bookings")}
              sx={{
                minHeight: 46,

                px: 2.4,

                borderRadius: 2,

                textTransform: "none",

                fontWeight: 700,

                boxShadow: "0 6px 16px rgba(79,70,229,0.2)",
              }}
            >
              My Bookings
            </Button>

            <Button
              variant="outlined"
              startIcon={<SwapHoriz />}
              onClick={() => navigate("/student/seat-change")}
              sx={{
                minHeight: 46,

                px: 2.4,

                borderRadius: 2,

                textTransform: "none",

                fontWeight: 700,
              }}
            >
              Request Seat Change
            </Button>
          </Stack>
        </>
      ) : (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,

            mb: 3,
          }}
        >
          <CardContent
            sx={{
              p: 3,
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
              spacing={2}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  No active membership
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Choose a library and membership plan to get started.
                </Typography>
              </Box>

              <Button
                variant="contained"
                endIcon={<ArrowForward />}
                onClick={() => navigate("/student/libraries")}
                sx={{
                  textTransform: "none",

                  borderRadius: 2,

                  fontWeight: 700,
                }}
              >
                Browse Libraries
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ===================================================== */}
      {/* MEMBERSHIP HISTORY HEADER */}
      {/* ===================================================== */}

      <Stack
        direction="row"
        spacing={1.2}
        alignItems="center"
        sx={{
          mt: 4.5,
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,

            borderRadius: 2,

            bgcolor: "action.hover",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",

            color: "primary.main",
          }}
        >
          <History />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={800}>
            Membership History
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Your previous memberships will appear here.
          </Typography>
        </Box>
      </Stack>

      {/* ===================================================== */}
      {/* EMPTY HISTORY */}
      {/* ===================================================== */}

      {history.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px dashed",

            borderColor: "divider",

            borderRadius: 3,

            bgcolor: "rgba(248,250,252,0.7)",
          }}
        >
          <CardContent
            sx={{
              py: 5,
            }}
          >
            <Stack alignItems="center" textAlign="center" spacing={1}>
              <Box
                sx={{
                  width: 58,
                  height: 58,

                  borderRadius: "50%",

                  bgcolor: "action.hover",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  color: "text.secondary",

                  mb: 0.5,
                }}
              >
                <History
                  sx={{
                    fontSize: 30,
                  }}
                />
              </Box>

              <Typography variant="h6" fontWeight={800}>
                No membership history yet
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  maxWidth: 420,
                }}
              >
                Previous, cancelled or expired memberships will appear here once
                available.
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {history.map((item) => {
            const highlighted =
              String(item.subscriptionId) === String(highlightedSubscriptionId);

            return (
              <MembershipHistoryCard
                key={item.subscriptionId}
                item={item}
                highlighted={highlighted}
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export default MembershipDetails;
