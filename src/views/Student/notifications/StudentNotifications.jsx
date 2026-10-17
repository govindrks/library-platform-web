import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowForwardRounded,
  CampaignOutlined,
  CheckCircleOutlineRounded,
  DoneAll,
  EventSeatOutlined,
  InfoOutlined,
  LocalOfferOutlined,
  NotificationsActive,
  NotificationsNoneRounded,
  PaymentOutlined,
  ReceiptLongOutlined,
  Refresh,
  ScheduleOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";

import { alpha, useTheme } from "@mui/material/styles";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import notificationApi from "../../../api/notificationApi";

import { useNotifications } from "../../../context/NotificationContext";

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// ============================================================
// FORMAT TYPE
// ============================================================

const formatNotificationType = (type) => {
  if (!type) {
    return "Update";
  }

  return String(type)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

// ============================================================
// NOTIFICATION ICON
// ============================================================

const getNotificationIcon = (type) => {
  const normalized = String(type || "").toUpperCase();

  if (normalized.includes("PAYMENT")) {
    return <PaymentOutlined />;
  }

  if (normalized.includes("INVOICE")) {
    return <ReceiptLongOutlined />;
  }

  if (normalized.includes("BOOKING")) {
    return <EventSeatOutlined />;
  }

  if (normalized.includes("SEAT")) {
    return <EventSeatOutlined />;
  }

  if (normalized.includes("COUPON") || normalized.includes("OFFER")) {
    return <LocalOfferOutlined />;
  }

  if (normalized.includes("SUPPORT")) {
    return <SupportAgentOutlined />;
  }

  if (normalized.includes("REMINDER") || normalized.includes("EXPIR")) {
    return <ScheduleOutlined />;
  }

  if (normalized.includes("ANNOUNCEMENT")) {
    return <CampaignOutlined />;
  }

  return <NotificationsNoneRounded />;
};

// ============================================================
// COMPONENT
// ============================================================

function StudentNotifications() {
  const theme = useTheme();

  const navigate = useNavigate();

  // ==========================================================
  // GLOBAL NOTIFICATION STATE
  // ==========================================================

  const {
    unreadCount,
    latestNotification,
    notificationVersion,
    decreaseUnreadCount,
    clearUnreadCount,
    refreshUnreadCount,
  } = useNotifications();

  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [markingId, setMarkingId] = useState(null);

  const [markingAll, setMarkingAll] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD UNREAD NOTIFICATIONS
  // ==========================================================

  const loadNotifications = useCallback(
    async (showLoader = true) => {
      try {
        if (showLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const response = await notificationApi.getUnread(0, 50);

        setNotifications(
          Array.isArray(response?.content) ? response.content : [],
        );

        await refreshUnreadCount();
      } catch (requestError) {
        console.error("Failed to load notifications:", requestError);

        setError(
          getErrorMessage(requestError, "Unable to load notifications."),
        );
      } finally {
        setLoading(false);

        setRefreshing(false);
      }
    },
    [refreshUnreadCount],
  );

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadNotifications(true);
  }, [loadNotifications]);

  // ==========================================================
  // REAL-TIME WEBSOCKET NOTIFICATION
  // ==========================================================

  useEffect(() => {
    if (!latestNotification || notificationVersion <= 0) {
      return;
    }

    /*
     * This page shows unread notifications only.
     */

    if (latestNotification.read === true) {
      return;
    }

    setNotifications((previous) => {
      const alreadyExists = previous.some(
        (notification) => notification.id === latestNotification.id,
      );

      if (alreadyExists) {
        return previous;
      }

      return [latestNotification, ...previous];
    });
  }, [latestNotification, notificationVersion]);

  // ==========================================================
  // MARK ONE AS READ
  // ==========================================================

  const handleMarkRead = async (notificationId) => {
    if (!notificationId) {
      return false;
    }

    try {
      setMarkingId(notificationId);

      setError("");

      await notificationApi.markAsRead(notificationId);

      /*
       * This page displays unread notifications only.
       * Once read, remove it immediately.
       */

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== notificationId),
      );

      decreaseUnreadCount();

      return true;
    } catch (requestError) {
      console.error("Failed to mark notification as read:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to mark notification as read."),
      );

      return false;
    } finally {
      setMarkingId(null);
    }
  };

  // ==========================================================
  // OPEN NOTIFICATION / DEEP LINK
  // ==========================================================

  const handleNotificationOpen = async (notification) => {
    if (!notification) {
      return;
    }

    const actionUrl = notification?.actionUrl
      ? String(notification.actionUrl).trim()
      : "";

    if (!actionUrl) {
      return;
    }

    /*
     * Student page contains unread notifications only,
     * so mark as read before navigating.
     */

    const marked = await handleMarkRead(notification.id);

    if (!marked) {
      return;
    }

    navigate(actionUrl, {
      state: {
        fromNotification: true,

        notificationId: notification.id ?? null,

        notificationReferenceId: notification.referenceId ?? null,

        notificationReferenceType: notification.referenceType ?? null,
      },
    });
  };

  // ==========================================================
  // MARK ALL AS READ
  // ==========================================================

  const handleMarkAll = async () => {
    if (unreadCount <= 0) {
      return;
    }

    try {
      setMarkingAll(true);

      setError("");

      await notificationApi.markAllAsRead();

      setNotifications([]);

      clearUnreadCount();
    } catch (requestError) {
      console.error("Failed to mark notifications as read:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to mark notifications as read."),
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // ==========================================================
  // MANUAL REFRESH
  // ==========================================================

  const handleRefresh = () => {
    loadNotifications(false);
  };

  // ==========================================================
  // DERIVED VALUES
  // ==========================================================

  const visibleUnreadCount = useMemo(
    () => Math.max(unreadCount || 0, notifications.length),
    [unreadCount, notifications.length],
  );

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: 1180,

        mx: "auto",

        pb: 5,
      }}
    >
      {/* ====================================================== */}
      {/* PREMIUM HERO */}
      {/* ====================================================== */}

      <Card
        elevation={0}
        sx={{
          position: "relative",

          overflow: "hidden",

          mb: 3,

          borderRadius: 4,

          border: "1px solid",

          borderColor: alpha(theme.palette.primary.main, 0.13),

          background: `
            linear-gradient(
              135deg,
              ${alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.2 : 0.095,
              )} 0%,
              ${alpha(theme.palette.background.paper, 0.99)} 50%,
              ${alpha(theme.palette.primary.main, 0.025)} 100%
            )
          `,

          boxShadow: `0 18px 52px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === "dark" ? 0.2 : 0.055,
          )}`,

          "&::before": {
            content: '""',

            position: "absolute",

            width: 330,
            height: 330,

            borderRadius: "50%",

            top: -210,
            right: -100,

            background: alpha(theme.palette.primary.main, 0.075),
          },

          "&::after": {
            content: '""',

            position: "absolute",

            width: 180,
            height: 180,

            borderRadius: "50%",

            right: 210,
            bottom: -135,

            background: alpha(theme.palette.primary.main, 0.035),
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",

            zIndex: 1,

            p: {
              xs: 2.5,
              sm: 3,
              md: 4,
            },

            "&:last-child": {
              pb: {
                xs: 2.5,
                sm: 3,
                md: 4,
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
            spacing={3}
          >
            {/* ============================================== */}
            {/* TITLE */}
            {/* ============================================== */}

            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 64,
                  height: 64,

                  borderRadius: 3.2,

                  display: "grid",

                  placeItems: "center",

                  bgcolor: alpha(theme.palette.primary.main, 0.1),

                  color: "primary.main",

                  boxShadow: `0 12px 30px ${alpha(
                    theme.palette.primary.main,
                    0.14,
                  )}`,
                }}
              >
                <Badge
                  badgeContent={visibleUnreadCount}
                  color="error"
                  max={99}
                  invisible={visibleUnreadCount <= 0}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontWeight: 800,

                      border: "2px solid",

                      borderColor: "background.paper",
                    },
                  }}
                >
                  <NotificationsActive
                    sx={{
                      fontSize: 32,
                    }}
                  />
                </Badge>
              </Box>

              <Box>
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
                    sx={{
                      letterSpacing: "-0.035em",
                    }}
                  >
                    Notifications
                  </Typography>

                  {visibleUnreadCount > 0 && (
                    <Chip
                      size="small"
                      label={`${visibleUnreadCount} unread`}
                      sx={{
                        fontWeight: 800,

                        bgcolor: alpha(theme.palette.primary.main, 0.08),

                        color: "primary.main",

                        borderRadius: 2,
                      }}
                    />
                  )}
                </Stack>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.7,

                    lineHeight: 1.7,

                    maxWidth: 620,
                  }}
                >
                  Stay informed about bookings, payments, invoices, memberships,
                  seat requests and important LibraryHub activity.
                </Typography>
              </Box>
            </Stack>

            {/* ============================================== */}
            {/* HEADER ACTIONS */}
            {/* ============================================== */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
              sx={{
                width: {
                  xs: "100%",
                  md: "auto",
                },
              }}
            >
              <Button
                variant="outlined"
                startIcon={
                  refreshing ? (
                    <CircularProgress size={17} color="inherit" />
                  ) : (
                    <Refresh />
                  )
                }
                disabled={refreshing}
                onClick={handleRefresh}
                sx={{
                  minHeight: 44,

                  px: 2.2,

                  borderRadius: 2.5,

                  borderWidth: "1.5px",

                  textTransform: "none",

                  fontWeight: 800,

                  "&:hover": {
                    borderWidth: "1.5px",

                    bgcolor: alpha(theme.palette.primary.main, 0.045),
                  },
                }}
              >
                {refreshing ? "Refreshing..." : "Refresh"}
              </Button>

              {visibleUnreadCount > 0 && (
                <Button
                  variant="contained"
                  startIcon={
                    markingAll ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <DoneAll />
                    )
                  }
                  disabled={markingAll}
                  onClick={handleMarkAll}
                  sx={{
                    minHeight: 44,

                    px: 2.3,

                    borderRadius: 2.5,

                    textTransform: "none",

                    fontWeight: 800,

                    boxShadow: `0 9px 24px ${alpha(
                      theme.palette.primary.main,
                      0.21,
                    )}`,

                    "&:hover": {
                      boxShadow: `0 12px 30px ${alpha(
                        theme.palette.primary.main,
                        0.29,
                      )}`,
                    },
                  }}
                >
                  {markingAll ? "Marking..." : "Mark All Read"}
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* UNREAD STATUS STRIP */}
      {/* ====================================================== */}

      {!loading && visibleUnreadCount > 0 && (
        <Box
          sx={{
            mb: 3,

            px: {
              xs: 2,
              sm: 2.5,
            },

            py: 1.6,

            borderRadius: 3,

            border: "1px solid",

            borderColor: alpha(theme.palette.primary.main, 0.12),

            bgcolor: alpha(theme.palette.primary.main, 0.035),
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
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 34,
                  height: 34,

                  display: "grid",

                  placeItems: "center",

                  borderRadius: 2,

                  bgcolor: alpha(theme.palette.primary.main, 0.09),

                  color: "primary.main",
                }}
              >
                <InfoOutlined
                  sx={{
                    fontSize: 19,
                  }}
                />
              </Box>

              <Box>
                <Typography variant="body2" fontWeight={800}>
                  You have {visibleUnreadCount} unread notification
                  {visibleUnreadCount === 1 ? "" : "s"}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Open an update to view its related details.
                </Typography>
              </Box>
            </Stack>

            <Chip
              size="small"
              label="Live updates enabled"
              icon={<NotificationsActive />}
              variant="outlined"
              sx={{
                fontWeight: 700,

                color: "success.main",

                borderColor: alpha(theme.palette.success.main, 0.2),

                bgcolor: alpha(theme.palette.success.main, 0.04),

                "& .MuiChip-icon": {
                  color: "success.main",
                },
              }}
            />
          </Stack>
        </Box>
      )}

      {/* ====================================================== */}
      {/* ERROR */}
      {/* ====================================================== */}

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

      {/* ====================================================== */}
      {/* LOADING */}
      {/* ====================================================== */}

      {loading ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 4,
          }}
        >
          <CardContent
            sx={{
              py: "75px !important",
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 70,
                  height: 70,

                  display: "grid",

                  placeItems: "center",

                  borderRadius: "50%",

                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                }}
              >
                <CircularProgress size={32} />
              </Box>

              <Box textAlign="center">
                <Typography fontWeight={900}>Loading notifications</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Checking your latest LibraryHub activity.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        // ====================================================
        // EMPTY STATE
        // ====================================================

        <Card
          elevation={0}
          sx={{
            position: "relative",

            overflow: "hidden",

            border: "1px dashed",

            borderColor: alpha(theme.palette.success.main, 0.28),

            borderRadius: 4,

            bgcolor: alpha(theme.palette.success.main, 0.018),
          }}
        >
          <CardContent
            sx={{
              py: "78px !important",

              px: 3,

              textAlign: "center",
            }}
          >
            <Stack alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 82,
                  height: 82,

                  display: "grid",

                  placeItems: "center",

                  borderRadius: 4,

                  bgcolor: alpha(theme.palette.success.main, 0.08),

                  color: "success.main",

                  boxShadow: `0 12px 30px ${alpha(
                    theme.palette.success.main,
                    0.1,
                  )}`,
                }}
              >
                <CheckCircleOutlineRounded
                  sx={{
                    fontSize: 43,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  fontWeight={900}
                  sx={{
                    letterSpacing: "-0.025em",
                  }}
                >
                  You're all caught up
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.7,

                    maxWidth: 460,

                    lineHeight: 1.7,
                  }}
                >
                  There are no unread notifications right now. New LibraryHub
                  updates will appear here automatically.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={
                  refreshing ? <CircularProgress size={17} /> : <Refresh />
                }
                disabled={refreshing}
                onClick={handleRefresh}
                sx={{
                  mt: 1,

                  minHeight: 43,

                  px: 2.3,

                  borderRadius: 2.4,

                  textTransform: "none",

                  fontWeight: 800,
                }}
              >
                Check for Updates
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : (
        // ====================================================
        // NOTIFICATION LIST
        // ====================================================

        <Stack spacing={2}>
          {notifications.map((notification, index) => {
            const marking = markingId === notification.id;

            const hasAction = Boolean(
              notification?.actionUrl && String(notification.actionUrl).trim(),
            );

            const typeLabel = formatNotificationType(notification.type);

            return (
              <Card
                key={notification.id}
                elevation={0}
                onClick={
                  hasAction
                    ? () => handleNotificationOpen(notification)
                    : undefined
                }
                onKeyDown={
                  hasAction
                    ? (event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();

                          handleNotificationOpen(notification);
                        }
                      }
                    : undefined
                }
                role={hasAction ? "button" : undefined}
                tabIndex={hasAction ? 0 : undefined}
                sx={{
                  position: "relative",

                  overflow: "hidden",

                  border: "1px solid",

                  borderColor: alpha(theme.palette.primary.main, 0.16),

                  borderRadius: 3.5,

                  bgcolor: alpha(theme.palette.primary.main, 0.018),

                  cursor: hasAction ? "pointer" : "default",

                  boxShadow: `0 7px 26px ${alpha(
                    theme.palette.common.black,
                    theme.palette.mode === "dark" ? 0.1 : 0.028,
                  )}`,

                  transition: "all 0.22s ease",

                  "&::before": {
                    content: '""',

                    position: "absolute",

                    top: 0,
                    bottom: 0,
                    left: 0,

                    width: 4,

                    bgcolor: "primary.main",
                  },

                  "&:hover": {
                    transform: hasAction ? "translateY(-2px)" : "none",

                    borderColor: alpha(theme.palette.primary.main, 0.28),

                    bgcolor: alpha(theme.palette.primary.main, 0.032),

                    boxShadow: `0 14px 38px ${alpha(
                      theme.palette.common.black,
                      theme.palette.mode === "dark" ? 0.15 : 0.06,
                    )}`,
                  },

                  "&:focus-visible": hasAction
                    ? {
                        outline: "2px solid",

                        outlineColor: "primary.main",

                        outlineOffset: "3px",
                      }
                    : undefined,
                }}
              >
                <CardContent
                  sx={{
                    p: {
                      xs: 2.2,
                      sm: 2.6,
                    },

                    "&:last-child": {
                      pb: {
                        xs: 2.2,
                        sm: 2.6,
                      },
                    },
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
                      sm: "flex-start",
                    }}
                  >
                    {/* ==================================== */}
                    {/* ICON */}
                    {/* ==================================== */}

                    <Box
                      sx={{
                        width: 48,
                        height: 48,

                        flexShrink: 0,

                        display: "grid",

                        placeItems: "center",

                        borderRadius: 2.6,

                        bgcolor: alpha(theme.palette.primary.main, 0.085),

                        color: "primary.main",

                        "& svg": {
                          fontSize: 23,
                        },
                      }}
                    >
                      {getNotificationIcon(notification.type)}
                    </Box>

                    {/* ==================================== */}
                    {/* CONTENT */}
                    {/* ==================================== */}

                    <Box
                      sx={{
                        flexGrow: 1,

                        minWidth: 0,
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Typography
                          variant="subtitle1"
                          fontWeight={900}
                          sx={{
                            lineHeight: 1.35,
                          }}
                        >
                          {notification.title || "LibraryHub Update"}
                        </Typography>

                        <Box
                          sx={{
                            width: 7,
                            height: 7,

                            borderRadius: "50%",

                            bgcolor: "primary.main",

                            boxShadow: `0 0 0 4px ${alpha(
                              theme.palette.primary.main,
                              0.1,
                            )}`,
                          }}
                        />

                        {index === 0 && (
                          <Chip
                            label="New"
                            size="small"
                            sx={{
                              height: 23,

                              fontSize: "0.68rem",

                              fontWeight: 800,

                              bgcolor: alpha(theme.palette.primary.main, 0.08),

                              color: "primary.main",
                            }}
                          />
                        )}
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.8,

                          whiteSpace: "pre-line",

                          lineHeight: 1.7,

                          maxWidth: 800,
                        }}
                      >
                        {notification.message}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        alignItems="center"
                        sx={{
                          mt: 1.6,
                        }}
                      >
                        {notification.type && (
                          <Chip
                            size="small"
                            label={typeLabel}
                            variant="outlined"
                            sx={{
                              height: 27,

                              borderRadius: 1.8,

                              fontSize: "0.72rem",

                              fontWeight: 700,

                              color: "text.secondary",

                              borderColor: alpha(theme.palette.divider, 0.9),
                            }}
                          />
                        )}

                        {hasAction && (
                          <Stack
                            direction="row"
                            spacing={0.45}
                            alignItems="center"
                            sx={{
                              color: "primary.main",
                            }}
                          >
                            <Typography variant="caption" fontWeight={800}>
                              View details
                            </Typography>

                            <ArrowForwardRounded
                              sx={{
                                fontSize: 15,
                              }}
                            />
                          </Stack>
                        )}
                      </Stack>
                    </Box>

                    {/* ==================================== */}
                    {/* READ ACTION */}
                    {/* ==================================== */}

                    <Button
                      size="small"
                      variant="text"
                      startIcon={
                        marking ? (
                          <CircularProgress size={15} color="inherit" />
                        ) : (
                          <DoneAll
                            sx={{
                              fontSize: 17,
                            }}
                          />
                        )
                      }
                      disabled={marking}
                      onClick={(event) => {
                        /*
                         * Prevent card navigation when
                         * user only wants to mark it read.
                         */
                        event.stopPropagation();

                        handleMarkRead(notification.id);
                      }}
                      sx={{
                        flexShrink: 0,

                        textTransform: "none",

                        fontWeight: 800,

                        borderRadius: 2,

                        px: 1.3,

                        alignSelf: {
                          xs: "flex-start",
                          sm: "center",
                        },

                        "&:hover": {
                          bgcolor: alpha(theme.palette.success.main, 0.07),

                          color: "success.main",
                        },
                      }}
                    >
                      {marking ? "Updating..." : "Mark Read"}
                    </Button>
                  </Stack>

                  {/* ====================================== */}
                  {/* FOOTER */}
                  {/* ====================================== */}

                  {(notification.referenceType || notification.referenceId) && (
                    <>
                      <Divider
                        sx={{
                          my: 2,
                        }}
                      />

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        alignItems="center"
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Related to
                        </Typography>

                        {notification.referenceType && (
                          <Typography variant="caption" fontWeight={800}>
                            {formatNotificationType(notification.referenceType)}
                          </Typography>
                        )}

                        {notification.referenceId && (
                          <Typography variant="caption" color="text.secondary">
                            #{notification.referenceId}
                          </Typography>
                        )}
                      </Stack>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}

export default StudentNotifications;
