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

import { DoneAll, NotificationsActive } from "@mui/icons-material";

import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import notificationApi from "../../../api/notificationApi";

import { useNotifications } from "../../../context/NotificationContext";

// ============================================================
// HELPER
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
// COMPONENT
// ============================================================

function StudentNotifications() {
  // ==========================================================
  // NAVIGATION
  // ==========================================================

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

        /*
         * Backend returns Spring Page:
         *
         * {
         *   content: [],
         *   totalElements: 0,
         *   totalPages: 0,
         *   ...
         * }
         */

        const response = await notificationApi.getUnread(0, 50);

        setNotifications(
          Array.isArray(response?.content) ? response.content : [],
        );

        /*
         * Keep global bell badge synchronized
         * with database state.
         */

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
       * Once read, remove the notification.
       */

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== notificationId),
      );

      /*
       * Update global badge immediately.
       */

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
     * so mark the notification as read first.
     */

    const marked = await handleMarkRead(notification.id);

    if (!marked) {
      return;
    }

    // ======================================================
    // NAVIGATE
    // ======================================================

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
  // UI
  // ==========================================================

  return (
    <Box>
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

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
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 52,

              height: 52,

              borderRadius: 2,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              bgcolor: "primary.light",

              color: "primary.main",
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              max={99}
              invisible={unreadCount <= 0}
            >
              <NotificationsActive />
            </Badge>
          </Box>

          <Box>
            <Typography variant="h4" fontWeight={800}>
              Notifications
            </Typography>

            <Typography color="text.secondary">
              Your unread library activity and updates.
            </Typography>
          </Box>
        </Stack>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
        >
          {/* REFRESH */}

          <Button
            variant="outlined"
            disabled={refreshing}
            onClick={handleRefresh}
          >
            {refreshing ? <CircularProgress size={18} /> : "Refresh"}
          </Button>

          {/* MARK ALL */}

          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={
                markingAll ? <CircularProgress size={16} /> : <DoneAll />
              }
              disabled={markingAll}
              onClick={handleMarkAll}
            >
              Mark All as Read
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ===================================================== */}
      {/* UNREAD SUMMARY */}
      {/* ===================================================== */}

      {!loading && unreadCount > 0 && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
          }}
        >
          You have <strong>{unreadCount}</strong> unread notification
          {unreadCount === 1 ? "" : "s"}.
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
          }}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* LOADING */}
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

          <Typography color="text.secondary">
            Loading notifications...
          </Typography>
        </Stack>
      ) : notifications.length === 0 ? (
        // =================================================
        // EMPTY STATE
        // =================================================

        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              py: 8,

              textAlign: "center",
            }}
          >
            <NotificationsActive
              sx={{
                fontSize: 56,

                color: "text.disabled",

                mb: 2,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              You're all caught up
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              You have no unread notifications.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        // =================================================
        // NOTIFICATION LIST
        // =================================================

        <Stack spacing={2}>
          {notifications.map((notification) => {
            const marking = markingId === notification.id;

            const hasAction = Boolean(
              notification?.actionUrl && String(notification.actionUrl).trim(),
            );

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
                  border: "1px solid",

                  borderColor: "primary.main",

                  borderRadius: 3,

                  backgroundColor: "rgba(79, 70, 229, 0.025)",

                  transition: "all 0.2s ease",

                  cursor: hasAction ? "pointer" : "default",

                  "&:hover": {
                    boxShadow: 1,
                  },

                  "&:focus-visible": hasAction
                    ? {
                        outline: "2px solid",

                        outlineColor: "primary.main",

                        outlineOffset: "2px",
                      }
                    : undefined,
                }}
              >
                <CardContent>
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent="space-between"
                    spacing={2}
                  >
                    {/* CONTENT */}

                    <Box
                      sx={{
                        flexGrow: 1,

                        minWidth: 0,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" fontWeight={700}>
                          {notification.title}
                        </Typography>

                        {/* UNREAD DOT */}

                        <Box
                          sx={{
                            width: 7,

                            height: 7,

                            borderRadius: "50%",

                            bgcolor: "primary.main",

                            flexShrink: 0,
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.75,

                          whiteSpace: "pre-line",
                        }}
                      >
                        {notification.message}
                      </Typography>

                      {hasAction && (
                        <Typography
                          variant="caption"
                          color="primary.main"
                          sx={{
                            display: "block",

                            mt: 1,

                            fontWeight: 600,
                          }}
                        >
                          Click to open details
                        </Typography>
                      )}
                    </Box>

                    {/* TYPE */}

                    {notification.type && (
                      <Chip
                        size="small"
                        label={String(notification.type).replaceAll("_", " ")}
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Divider
                    sx={{
                      my: 2,
                    }}
                  />

                  <Stack direction="row" justifyContent="flex-end">
                    <Button
                      size="small"
                      disabled={marking}
                      onClick={(event) => {
                        /*
                         * Prevent Card click from navigating
                         * when user only wants to mark read.
                         */

                        event.stopPropagation();

                        handleMarkRead(notification.id);
                      }}
                    >
                      {marking ? (
                        <CircularProgress size={16} />
                      ) : (
                        "Mark as Read"
                      )}
                    </Button>
                  </Stack>
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
