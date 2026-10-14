import React, { useCallback, useEffect, useMemo, useState } from "react";

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
  MenuItem,
  Pagination,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";

import {
  AccessTime,
  CheckCircle,
  DoneAll,
  EventSeat,
  Groups,
  Info,
  NotificationsActive,
  Payment,
  ReceiptLong,
  Refresh,
  Warning,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import notificationApi from "../../api/notificationApi";

import { useNotifications } from "../../context/NotificationContext";

// ============================================================
// CONSTANTS
// ============================================================

const PAGE_SIZE = 10;

// ============================================================
// HELPERS
// ============================================================

const formatEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatNotificationTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const now = new Date();

  const diffMs = now.getTime() - date.getTime();

  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "BOOKING":
      return <CheckCircle />;

    case "PAYMENT":
      return <Payment />;

    case "MEMBERSHIP":

    case "SUBSCRIPTION":
      return <Groups />;

    case "SEAT":

    case "SEAT_CHANGE":

    case "SEAT_TRANSFER":
      return <EventSeat />;

    case "REPORT":
      return <ReceiptLong />;

    case "WARNING":
      return <Warning />;

    case "SYSTEM":
      return <NotificationsActive />;

    default:
      return <Info />;
  }
};

// ============================================================
// NOTIFICATION CARD
// ============================================================

function NotificationCard({ notification, onMarkRead, onOpen, markingId }) {
  const isUnread = !notification.read;

  const marking = markingId === notification.id;

  const hasAction = Boolean(
    notification?.actionUrl && String(notification.actionUrl).trim(),
  );

  // ==========================================================
  // OPEN
  // ==========================================================

  const handleOpen = () => {
    if (!hasAction) {
      return;
    }

    onOpen(notification);
  };

  // ==========================================================
  // KEYBOARD OPEN
  // ==========================================================

  const handleKeyDown = (event) => {
    if (!hasAction) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();

      handleOpen();
    }
  };

  // ==========================================================
  // MARK READ BUTTON
  // ==========================================================

  const handleMarkReadClick = (event) => {
    /*
     * Prevent clicking "Mark as read" from also triggering
     * the Card deep-link navigation.
     */

    event.stopPropagation();

    onMarkRead(notification.id);
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Card
      variant="outlined"
      onClick={hasAction ? handleOpen : undefined}
      onKeyDown={hasAction ? handleKeyDown : undefined}
      role={hasAction ? "button" : undefined}
      tabIndex={hasAction ? 0 : undefined}
      sx={{
        borderColor: isUnread ? "primary.main" : "divider",

        backgroundColor: isUnread
          ? "rgba(79, 70, 229, 0.025)"
          : "background.paper",

        transition: "all 0.2s ease",

        cursor: hasAction ? "pointer" : "default",

        "&:hover": {
          borderColor: hasAction ? "primary.main" : undefined,

          boxShadow: hasAction ? 1 : undefined,
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
      <CardContent
        sx={{
          p: 2.5,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* ================================================= */}
          {/* ICON */}
          {/* ================================================= */}

          <Box
            sx={{
              width: 44,

              height: 44,

              borderRadius: 2,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              flexShrink: 0,

              backgroundColor: isUnread
                ? "primary.light"
                : "background.default",

              color: isUnread ? "primary.main" : "text.secondary",
            }}
          >
            {getNotificationIcon(notification.type)}
          </Box>

          {/* ================================================= */}
          {/* CONTENT */}
          {/* ================================================= */}

          <Box
            sx={{
              flexGrow: 1,

              minWidth: 0,
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              spacing={1}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  variant="subtitle1"
                  fontWeight={isUnread ? 700 : 600}
                >
                  {notification.title}
                </Typography>

                {isUnread && (
                  <Box
                    sx={{
                      width: 7,

                      height: 7,

                      borderRadius: "50%",

                      backgroundColor: "primary.main",
                    }}
                  />
                )}
              </Stack>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  whiteSpace: "nowrap",
                }}
              >
                {formatNotificationTime(notification.createdAt)}
              </Typography>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.7}
              sx={{
                whiteSpace: "pre-line",
              }}
            >
              {notification.message}
            </Typography>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
              mt={2}
            >
              <Chip
                label={formatEnum(notification.type)}
                size="small"
                variant="outlined"
              />

              {hasAction && (
                <Chip
                  label="Open details"
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}

              <Box
                sx={{
                  flexGrow: 1,
                }}
              />

              {isUnread && (
                <Button
                  size="small"
                  disabled={marking}
                  onClick={handleMarkReadClick}
                >
                  {marking ? <CircularProgress size={16} /> : "Mark as read"}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Notifications() {
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
  // LOCAL PAGE STATE
  // ==========================================================

  const [notifications, setNotifications] = useState([]);

  const [activeTab, setActiveTab] = useState(0);

  const [typeFilter, setTypeFilter] = useState("ALL");

  const [page, setPage] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [totalElements, setTotalElements] = useState(0);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [markingId, setMarkingId] = useState(null);

  const [markingAll, setMarkingAll] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD
  // ==========================================================

  const loadNotifications = useCallback(
    async ({ requestedPage = 0, showFullLoader = false } = {}) => {
      try {
        if (showFullLoader) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        setError("");

        const notificationPromise =
          activeTab === 1
            ? notificationApi.getUnread(requestedPage, PAGE_SIZE)
            : notificationApi.getAll(requestedPage, PAGE_SIZE);

        const notificationResponse = await notificationPromise;

        setNotifications(
          Array.isArray(notificationResponse?.content)
            ? notificationResponse.content
            : [],
        );

        setPage(Number(notificationResponse?.number ?? 0));

        setTotalPages(Number(notificationResponse?.totalPages ?? 0));

        setTotalElements(Number(notificationResponse?.totalElements ?? 0));

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
    [activeTab, refreshUnreadCount],
  );

  // ==========================================================
  // INITIAL + TAB LOAD
  // ==========================================================

  useEffect(() => {
    loadNotifications({
      requestedPage: 0,
      showFullLoader: true,
    });
  }, [activeTab, loadNotifications]);

  // ==========================================================
  // REAL-TIME EVENT
  // ==========================================================

  useEffect(() => {
    if (!latestNotification || notificationVersion <= 0) {
      return;
    }

    /*
     * Only inject locally when viewing newest page.
     */

    if (page !== 0) {
      return;
    }

    /*
     * When viewing unread tab, do not inject a notification
     * if the backend ever pushes one already marked read.
     */

    if (activeTab === 1 && latestNotification.read === true) {
      return;
    }

    setNotifications((previous) => {
      const alreadyExists = previous.some(
        (notification) => notification.id === latestNotification.id,
      );

      if (alreadyExists) {
        return previous;
      }

      return [latestNotification, ...previous].slice(0, PAGE_SIZE);
    });

    setTotalElements((previous) => previous + 1);
  }, [notificationVersion, latestNotification, page, activeTab]);

  // ==========================================================
  // CLIENT-SIDE TYPE FILTER
  // ==========================================================

  const filteredNotifications = useMemo(() => {
    if (typeFilter === "ALL") {
      return notifications;
    }

    return notifications.filter(
      (notification) => notification.type === typeFilter,
    );
  }, [notifications, typeFilter]);

  // ==========================================================
  // MARK ONE
  // ==========================================================

  const handleMarkRead = async (notificationId) => {
    if (!notificationId) {
      return false;
    }

    const currentNotification = notifications.find(
      (notification) => notification.id === notificationId,
    );

    /*
     * If already marked read locally, avoid an unnecessary
     * backend request.
     */

    if (currentNotification && currentNotification.read === true) {
      return true;
    }

    try {
      setMarkingId(notificationId);

      setError("");

      await notificationApi.markAsRead(notificationId);

      // -----------------------------------------------------
      // UNREAD TAB
      // -----------------------------------------------------

      if (activeTab === 1) {
        setNotifications((previous) =>
          previous.filter((notification) => notification.id !== notificationId),
        );

        setTotalElements((previous) => Math.max(previous - 1, 0));
      } else {
        // ---------------------------------------------------
        // ALL TAB
        // ---------------------------------------------------

        setNotifications((previous) =>
          previous.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,

                  read: true,
                }
              : notification,
          ),
        );
      }

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
     * Mark unread notification before leaving the page.
     */

    if (notification.read !== true) {
      const marked = await handleMarkRead(notification.id);

      /*
       * Do not navigate if the read operation failed.
       *
       * This keeps backend/local unread state consistent.
       */

      if (!marked) {
        return;
      }
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
  // MARK ALL
  // ==========================================================

  const handleMarkAllRead = async () => {
    if (unreadCount <= 0) {
      return;
    }

    try {
      setMarkingAll(true);

      setError("");

      await notificationApi.markAllAsRead();

      clearUnreadCount();

      if (activeTab === 1) {
        setNotifications([]);

        setTotalElements(0);

        setTotalPages(0);

        setPage(0);
      } else {
        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,

            read: true,
          })),
        );
      }
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to mark all notifications as read.",
        ),
      );
    } finally {
      setMarkingAll(false);
    }
  };

  // ==========================================================
  // TAB
  // ==========================================================

  const handleTabChange = (event, value) => {
    setPage(0);

    setTypeFilter("ALL");

    setActiveTab(value);
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  const handlePageChange = (event, value) => {
    const requestedPage = value - 1;

    setPage(requestedPage);

    loadNotifications({
      requestedPage,
      showFullLoader: true,
    });
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    loadNotifications({
      requestedPage: page,
      showFullLoader: false,
    });
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
        mb={4}
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

              backgroundColor: "primary.light",

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

            <Typography variant="body1" color="text.secondary" mt={0.5}>
              Stay updated with important library activities.
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
          {unreadCount > 0 && (
            <Button
              variant="outlined"
              startIcon={
                markingAll ? <CircularProgress size={16} /> : <DoneAll />
              }
              disabled={markingAll}
              onClick={handleMarkAllRead}
            >
              Mark All as Read
            </Button>
          )}

          <Button
            variant="outlined"
            startIcon={
              refreshing ? <CircularProgress size={16} /> : <Refresh />
            }
            disabled={refreshing}
            onClick={handleRefresh}
          >
            Refresh
          </Button>
        </Stack>
      </Stack>

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
      {/* FILTERS */}
      {/* ===================================================== */}

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent
          sx={{
            pb: "16px !important",
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
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="All" />

              <Tab
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <span>Unread</span>

                    {unreadCount > 0 && (
                      <Chip label={unreadCount} size="small" color="primary" />
                    )}
                  </Stack>
                }
              />
            </Tabs>

            <Select
              size="small"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              sx={{
                minWidth: 180,
              }}
            >
              <MenuItem value="ALL">All Types</MenuItem>

              <MenuItem value="BOOKING">Bookings</MenuItem>

              <MenuItem value="PAYMENT">Payments</MenuItem>

              <MenuItem value="MEMBERSHIP">Memberships</MenuItem>

              <MenuItem value="SUBSCRIPTION">Subscriptions</MenuItem>

              <MenuItem value="SEAT_CHANGE">Seat Changes</MenuItem>

              <MenuItem value="SEAT_TRANSFER">Seat Transfers</MenuItem>

              <MenuItem value="LIBRARY">Library</MenuItem>

              <MenuItem value="REVIEW">Reviews</MenuItem>

              <MenuItem value="REPORT">Reports</MenuItem>

              <MenuItem value="SYSTEM">System</MenuItem>

              <MenuItem value="AI_ASSISTANT">AI Assistant</MenuItem>
            </Select>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      {loading ? (
        <Card>
          <CardContent
            sx={{
              py: 10,

              textAlign: "center",
            }}
          >
            <CircularProgress />

            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading notifications...
            </Typography>
          </CardContent>
        </Card>
      ) : filteredNotifications.length > 0 ? (
        <>
          <Stack spacing={2}>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                onOpen={handleNotificationOpen}
                markingId={markingId}
              />
            ))}
          </Stack>

          {totalPages > 1 && (
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              mt={4}
            >
              <Typography variant="body2" color="text.secondary">
                {totalElements} notification
                {totalElements === 1 ? "" : "s"}
              </Typography>

              <Pagination
                page={page + 1}
                count={totalPages}
                color="primary"
                onChange={handlePageChange}
                showFirstButton
                showLastButton
              />
            </Stack>
          )}
        </>
      ) : (
        <Card>
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
              No notifications
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {activeTab === 1
                ? "You have no unread notifications."
                : "There are no notifications matching the selected filters."}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ===================================================== */}
      {/* FOOTER */}
      {/* ===================================================== */}

      <Divider
        sx={{
          my: 4,
        }}
      />

      <Stack direction="row" spacing={1} alignItems="center">
        <AccessTime
          sx={{
            fontSize: 18,

            color: "text.secondary",
          }}
        />

        <Typography variant="caption" color="text.secondary">
          Notifications are synchronized with LibraryHub in real time.
        </Typography>
      </Stack>
    </Box>
  );
}

export default Notifications;
