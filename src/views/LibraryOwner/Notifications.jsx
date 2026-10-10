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

import notificationApi from "../../api/notificationApi";

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

// ============================================================
// ICON
// ============================================================

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

function NotificationCard({ notification, onMarkRead, markingId }) {
  const isUnread = !notification.read;

  const marking = markingId === notification.id;

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: isUnread ? "primary.main" : "divider",

        backgroundColor: isUnread
          ? "rgba(79, 70, 229, 0.025)"
          : "background.paper",

        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: "primary.main",
          boxShadow: 1,
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          {/* ICON */}

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

          {/* CONTENT */}

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

            <Typography variant="body2" color="text.secondary" mt={0.7}>
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

              <Box
                sx={{
                  flexGrow: 1,
                }}
              />

              {isUnread && (
                <Button
                  size="small"
                  disabled={marking}
                  onClick={() => onMarkRead(notification.id)}
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
  // ========================================================
  // STATE
  // ========================================================

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

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

  // ========================================================
  // LOAD NOTIFICATIONS
  // ========================================================

  const loadNotifications = useCallback(
    async ({
      requestedPage = page,

      showFullLoader = false,
    } = {}) => {
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

        const [notificationResponse, unreadResponse] = await Promise.all([
          notificationPromise,
          notificationApi.getUnreadCount(),
        ]);

        setNotifications(
          Array.isArray(notificationResponse?.content)
            ? notificationResponse.content
            : [],
        );

        setPage(Number(notificationResponse?.number || 0));

        setTotalPages(Number(notificationResponse?.totalPages || 0));

        setTotalElements(Number(notificationResponse?.totalElements || 0));

        setUnreadCount(Number(unreadResponse?.unreadCount || 0));
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
    [activeTab, page],
  );

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadNotifications({
      requestedPage: 0,

      showFullLoader: true,
    });
  }, [activeTab]);

  // ========================================================
  // TYPE FILTER
  // ========================================================

  const filteredNotifications = useMemo(() => {
    if (typeFilter === "ALL") {
      return notifications;
    }

    return notifications.filter(
      (notification) => notification.type === typeFilter,
    );
  }, [notifications, typeFilter]);

  // ========================================================
  // MARK ONE AS READ
  // ========================================================

  const handleMarkRead = async (notificationId) => {
    if (!notificationId) {
      return;
    }

    try {
      setMarkingId(notificationId);

      setError("");

      await notificationApi.markAsRead(notificationId);

      /*
       * If the user is currently on the unread tab,
       * remove the item immediately because it no
       * longer belongs in that filtered result.
       */
      if (activeTab === 1) {
        setNotifications((previous) =>
          previous.filter((notification) => notification.id !== notificationId),
        );

        setTotalElements((previous) => Math.max(previous - 1, 0));
      } else {
        /*
         * On the All tab keep the notification
         * visible, but update its read state.
         */
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

      setUnreadCount((previous) => Math.max(previous - 1, 0));
    } catch (requestError) {
      console.error("Failed to mark notification as read:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to mark notification as read."),
      );
    } finally {
      setMarkingId(null);
    }
  };

  // ========================================================
  // MARK ALL AS READ
  // ========================================================

  const handleMarkAllRead = async () => {
    if (unreadCount <= 0) {
      return;
    }

    try {
      setMarkingAll(true);

      setError("");

      await notificationApi.markAllAsRead();

      setUnreadCount(0);

      /*
       * On unread tab, after marking everything read,
       * the result should become empty.
       */
      if (activeTab === 1) {
        setNotifications([]);

        setTotalElements(0);

        setTotalPages(0);

        setPage(0);
      } else {
        /*
         * On All tab, retain the notifications and
         * simply update their read flag.
         */
        setNotifications((previous) =>
          previous.map((notification) => ({
            ...notification,

            read: true,
          })),
        );
      }
    } catch (requestError) {
      console.error("Failed to mark all notifications as read:", requestError);

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

  // ========================================================
  // TAB CHANGE
  // ========================================================

  const handleTabChange = (event, value) => {
    setPage(0);

    setTypeFilter("ALL");

    setActiveTab(value);
  };

  // ========================================================
  // PAGE CHANGE
  // ========================================================

  const handlePageChange = (event, value) => {
    const requestedPage = value - 1;

    setPage(requestedPage);

    loadNotifications({
      requestedPage,
      showFullLoader: true,
    });
  };

  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh = () => {
    loadNotifications({
      requestedPage: page,

      showFullLoader: false,
    });
  };

  // ========================================================
  // UI
  // ========================================================

  return (
    <Box>
      {/* ==================================================
                HEADER
            ================================================== */}

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
            <Badge badgeContent={unreadCount} color="error" max={99}>
              <NotificationsActive />
            </Badge>
          </Box>

          <Box>
            <Typography variant="h4" fontWeight={800}>
              Notifications
            </Typography>

            <Typography variant="body1" color="text.secondary" mt={0.5}>
              Stay updated with important library activities and automated
              operations.
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

      {/* ==================================================
                ERROR
            ================================================== */}

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

      {/* ==================================================
                UNREAD SUMMARY
            ================================================== */}

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

      {/* ==================================================
                FILTERS
            ================================================== */}

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

              <MenuItem value="SEAT">Seats</MenuItem>

              <MenuItem value="SEAT_CHANGE">Seat Changes</MenuItem>

              <MenuItem value="REPORT">Reports</MenuItem>

              <MenuItem value="SYSTEM">System</MenuItem>
            </Select>
          </Stack>
        </CardContent>
      </Card>

      {/* ==================================================
                INITIAL / PAGE LOADING
            ================================================== */}

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
          {/* ==========================================
                        NOTIFICATION LIST
                    ========================================== */}

          <Stack spacing={2}>
            {filteredNotifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
                onMarkRead={handleMarkRead}
                markingId={markingId}
              />
            ))}
          </Stack>

          {/* ==========================================
                        PAGINATION
                    ========================================== */}

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
        /* ==============================================
                   EMPTY STATE
                ============================================== */

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

      {/* ==================================================
                FOOTER
            ================================================== */}

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
          Notifications are loaded from the LibraryHub backend and are scoped to
          your authenticated account.
        </Typography>
      </Stack>
    </Box>
  );
}

export default Notifications;
