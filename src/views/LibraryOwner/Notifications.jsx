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
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AccessTimeRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  DoneAllRounded,
  EventSeatRounded,
  GroupsRounded,
  InfoRounded,
  LibraryBooksRounded,
  NotificationsActiveRounded,
  PaymentRounded,
  ReceiptLongRounded,
  RefreshRounded,
  ReviewsRounded,
  SmartToyRounded,
  WarningAmberRounded,
  ArrowForwardRounded,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

import notificationApi from "../../api/notificationApi";
import { useNotifications } from "../../context/NotificationContext";

const PAGE_SIZE = 10;

const TYPE_OPTIONS = [
  { value: "ALL", label: "All Types" },
  { value: "BOOKING", label: "Bookings" },
  { value: "PAYMENT", label: "Payments" },
  { value: "MEMBERSHIP", label: "Memberships" },
  { value: "SUBSCRIPTION", label: "Subscriptions" },
  { value: "SEAT_CHANGE", label: "Seat Changes" },
  { value: "SEAT_TRANSFER", label: "Seat Transfers" },
  { value: "LIBRARY", label: "Library" },
  { value: "REVIEW", label: "Reviews" },
  { value: "REPORT", label: "Reports" },
  { value: "SYSTEM", label: "System" },
  { value: "AI_ASSISTANT", label: "AI Assistant" },
];

const TYPE_META = {
  BOOKING: {
    label: "Booking",
    icon: <CheckCircleRounded />,
    tone: "success",
  },
  PAYMENT: {
    label: "Payment",
    icon: <PaymentRounded />,
    tone: "info",
  },
  MEMBERSHIP: {
    label: "Membership",
    icon: <GroupsRounded />,
    tone: "primary",
  },
  SUBSCRIPTION: {
    label: "Subscription",
    icon: <GroupsRounded />,
    tone: "primary",
  },
  SEAT: {
    label: "Seat",
    icon: <EventSeatRounded />,
    tone: "secondary",
  },
  SEAT_CHANGE: {
    label: "Seat Change",
    icon: <EventSeatRounded />,
    tone: "secondary",
  },
  SEAT_TRANSFER: {
    label: "Seat Transfer",
    icon: <EventSeatRounded />,
    tone: "secondary",
  },
  LIBRARY: {
    label: "Library",
    icon: <LibraryBooksRounded />,
    tone: "primary",
  },
  REVIEW: {
    label: "Review",
    icon: <ReviewsRounded />,
    tone: "warning",
  },
  REPORT: {
    label: "Report",
    icon: <ReceiptLongRounded />,
    tone: "info",
  },
  WARNING: {
    label: "Warning",
    icon: <WarningAmberRounded />,
    tone: "warning",
  },
  SYSTEM: {
    label: "System",
    icon: <NotificationsActiveRounded />,
    tone: "default",
  },
  AI_ASSISTANT: {
    label: "AI Assistant",
    icon: <SmartToyRounded />,
    tone: "primary",
  },
};

const formatEnum = (value) => {
  if (!value) {
    return "—";
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
  const minutes = Math.max(0, Math.floor(diffMs / (1000 * 60)));

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

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.response?.data?.detail ||
  error?.message ||
  fallback;

function NotificationSummaryCard({
  label,
  value,
  description,
  icon,
  active = false,
  onClick,
}) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: active ? "primary.main" : "divider",
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        background: active
          ? "linear-gradient(145deg, rgba(79,70,229,0.08), rgba(255,255,255,0.98))"
          : "background.paper",
        boxShadow: active ? "0 12px 30px rgba(79,70,229,0.09)" : "none",
        transition: "all 0.2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              borderColor: "primary.light",
              boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
            }
          : undefined,
      }}
    >
      <CardContent sx={{ p: 2.4, "&:last-child": { pb: 2.4 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {label}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ mt: 0.55, letterSpacing: "-0.03em" }}
            >
              {value}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: active ? "primary.main" : "rgba(79,70,229,0.08)",
              color: active ? "primary.contrastText" : "primary.main",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function NotificationCard({ notification, onMarkRead, onOpen, markingId }) {
  const isUnread = !notification.read;
  const marking = markingId === notification.id;
  const hasAction = Boolean(
    notification?.actionUrl && String(notification.actionUrl).trim(),
  );

  const meta = TYPE_META[notification?.type] || {
    label: formatEnum(notification?.type),
    icon: <InfoRounded />,
    tone: "default",
  };

  const handleOpen = () => {
    if (!hasAction) {
      return;
    }

    onOpen(notification);
  };

  const handleKeyDown = (event) => {
    if (!hasAction) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleOpen();
    }
  };

  const handleMarkReadClick = (event) => {
    event.stopPropagation();
    onMarkRead(notification.id);
  };

  return (
    <Card
      elevation={0}
      onClick={hasAction ? handleOpen : undefined}
      onKeyDown={hasAction ? handleKeyDown : undefined}
      role={hasAction ? "button" : undefined}
      tabIndex={hasAction ? 0 : undefined}
      sx={{
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: isUnread ? "rgba(79,70,229,0.34)" : "divider",
        borderRadius: 3.2,
        background: isUnread
          ? "linear-gradient(145deg, rgba(79,70,229,0.045), #ffffff 58%)"
          : "background.paper",
        transition: "all 0.2s ease",
        cursor: hasAction ? "pointer" : "default",
        "&::before": isUnread
          ? {
              content: '\"\"',
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: 4,
              bgcolor: "primary.main",
            }
          : undefined,
        "&:hover": hasAction
          ? {
              transform: "translateY(-2px)",
              borderColor: "primary.light",
              boxShadow: "0 12px 30px rgba(15,23,42,0.08)",
            }
          : undefined,
        "&:focus-visible": hasAction
          ? {
              outline: "2px solid",
              outlineColor: "primary.main",
              outlineOffset: 2,
            }
          : undefined,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2.2, sm: 2.6 },
          "&:last-child": { pb: { xs: 2.2, sm: 2.6 } },
        }}
      >
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box
            sx={{
              width: 46,
              height: 46,
              minWidth: 46,
              borderRadius: 2.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: isUnread
                ? "rgba(79,70,229,0.10)"
                : "rgba(15,23,42,0.045)",
              color: isUnread ? "primary.main" : "text.secondary",
            }}
          >
            {meta.icon}
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={1}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ minWidth: 0 }}
              >
                <Typography
                  variant="subtitle1"
                  fontWeight={isUnread ? 800 : 700}
                  sx={{ lineHeight: 1.35 }}
                >
                  {notification.title}
                </Typography>

                {isUnread && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      minWidth: 8,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                    }}
                  />
                )}
              </Stack>

              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                sx={{ flexShrink: 0 }}
              >
                <AccessTimeRounded
                  sx={{
                    fontSize: 15,
                    color: "text.disabled",
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ whiteSpace: "nowrap" }}
                >
                  {formatNotificationTime(notification.createdAt)}
                </Typography>
              </Stack>
            </Stack>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.8,
                lineHeight: 1.7,
                whiteSpace: "pre-line",
              }}
            >
              {notification.message}
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "flex-start", sm: "center" }}
              sx={{ mt: 2 }}
            >
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  size="small"
                  label={meta.label}
                  color={meta.tone}
                  variant="outlined"
                />

                {notification?.referenceType && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={formatEnum(notification.referenceType)}
                  />
                )}

                {hasAction && (
                  <Chip
                    size="small"
                    color="primary"
                    variant="outlined"
                    icon={<ArrowForwardRounded />}
                    label="Open details"
                  />
                )}
              </Stack>

              <Box sx={{ flexGrow: 1 }} />

              {isUnread && (
                <Button
                  size="small"
                  variant="text"
                  disabled={marking}
                  onClick={handleMarkReadClick}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                  }}
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

function Notifications() {
  const navigate = useNavigate();

  const {
    unreadCount,
    latestNotification,
    notificationVersion,
    decreaseUnreadCount,
    clearUnreadCount,
    refreshUnreadCount,
  } = useNotifications();

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

        const response = await notificationPromise;

        setNotifications(
          Array.isArray(response?.content) ? response.content : [],
        );

        setPage(Number(response?.number ?? 0));
        setTotalPages(Number(response?.totalPages ?? 0));
        setTotalElements(Number(response?.totalElements ?? 0));

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

  useEffect(() => {
    loadNotifications({
      requestedPage: 0,
      showFullLoader: true,
    });
  }, [activeTab, loadNotifications]);

  useEffect(() => {
    if (!latestNotification || notificationVersion <= 0 || page !== 0) {
      return;
    }

    if (activeTab === 1 && latestNotification.read === true) {
      return;
    }

    setNotifications((previous) => {
      const exists = previous.some(
        (notification) => notification.id === latestNotification.id,
      );

      if (exists) {
        return previous;
      }

      return [latestNotification, ...previous].slice(0, PAGE_SIZE);
    });

    setTotalElements((previous) => previous + 1);
  }, [notificationVersion, latestNotification, page, activeTab]);

  const filteredNotifications = useMemo(() => {
    if (typeFilter === "ALL") {
      return notifications;
    }

    return notifications.filter(
      (notification) => notification.type === typeFilter,
    );
  }, [notifications, typeFilter]);

  const visibleUnreadCount = useMemo(
    () =>
      notifications.filter((notification) => notification.read !== true).length,
    [notifications],
  );

  const actionableCount = useMemo(
    () =>
      notifications.filter((notification) =>
        Boolean(
          notification?.actionUrl && String(notification.actionUrl).trim(),
        ),
      ).length,
    [notifications],
  );

  const pageReadCount = Math.max(notifications.length - visibleUnreadCount, 0);

  const handleMarkRead = async (notificationId) => {
    if (!notificationId) {
      return false;
    }

    const currentNotification = notifications.find(
      (notification) => notification.id === notificationId,
    );

    if (currentNotification?.read === true) {
      return true;
    }

    try {
      setMarkingId(notificationId);
      setError("");

      await notificationApi.markAsRead(notificationId);

      if (activeTab === 1) {
        setNotifications((previous) =>
          previous.filter((notification) => notification.id !== notificationId),
        );

        setTotalElements((previous) => Math.max(previous - 1, 0));
      } else {
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

    if (notification.read !== true) {
      const marked = await handleMarkRead(notification.id);

      if (!marked) {
        return;
      }
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

  const handleTabChange = (event, value) => {
    setPage(0);
    setTypeFilter("ALL");
    setActiveTab(value);
  };

  const handlePageChange = (event, value) => {
    const requestedPage = value - 1;

    setPage(requestedPage);

    loadNotifications({
      requestedPage,
      showFullLoader: true,
    });
  };

  const handleRefresh = () => {
    loadNotifications({
      requestedPage: page,
      showFullLoader: false,
    });
  };

  return (
    <Box sx={{ width: "100%", pb: 5 }}>
      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "rgba(79,70,229,0.13)",
          borderRadius: 4,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(255,255,255,1) 58%, rgba(99,102,241,0.05))",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3.5 },
            "&:last-child": {
              pb: { xs: 2.5, md: 3.5 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2.5}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  minWidth: 58,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 10px 24px rgba(79,70,229,0.24)",
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="error"
                  max={99}
                  invisible={unreadCount <= 0}
                >
                  <NotificationsActiveRounded />
                </Badge>
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ letterSpacing: "-0.03em" }}
                  >
                    Notifications
                  </Typography>

                  <Chip
                    size="small"
                    icon={<AutoAwesomeRounded />}
                    label="Live"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  Stay on top of bookings, payments, memberships and owner
                  actions.
                </Typography>
              </Box>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
              {unreadCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={
                    markingAll ? (
                      <CircularProgress size={16} />
                    ) : (
                      <DoneAllRounded />
                    )
                  }
                  disabled={markingAll}
                  onClick={handleMarkAllRead}
                  sx={{
                    minHeight: 42,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                    bgcolor: "background.paper",
                  }}
                >
                  Mark All as Read
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={
                  refreshing ? (
                    <CircularProgress size={16} />
                  ) : (
                    <RefreshRounded />
                  )
                }
                disabled={refreshing}
                onClick={handleRefresh}
                sx={{
                  minHeight: 42,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
                  bgcolor: "background.paper",
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 3, borderRadius: 2.5 }}
        >
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
          gap: 2,
          mb: 3,
        }}
      >
        <NotificationSummaryCard
          label="All Notifications"
          value={totalElements}
          description="Across the selected page scope"
          icon={<NotificationsActiveRounded />}
          active={activeTab === 0}
          onClick={() => setActiveTab(0)}
        />

        <NotificationSummaryCard
          label="Unread"
          value={unreadCount}
          description="Require your attention"
          icon={
            <Badge variant="dot" color="error" invisible={unreadCount <= 0}>
              <WarningAmberRounded />
            </Badge>
          }
          active={activeTab === 1}
          onClick={() => setActiveTab(1)}
        />

        <NotificationSummaryCard
          label="Actionable"
          value={actionableCount}
          description="Visible items with deep links"
          icon={<ArrowForwardRounded />}
        />

        <NotificationSummaryCard
          label="Read on Page"
          value={pageReadCount}
          description="Already reviewed in this page"
          icon={<CheckCircleRounded />}
        />
      </Box>

      {!loading && unreadCount > 0 && (
        <Alert
          severity="info"
          sx={{ mb: 3, borderRadius: 2.5 }}
          action={
            activeTab !== 1 ? (
              <Button
                size="small"
                color="inherit"
                onClick={() => setActiveTab(1)}
              >
                View Unread
              </Button>
            ) : undefined
          }
        >
          You have <strong>{unreadCount}</strong> unread notification
          {unreadCount === 1 ? "" : "s"}.
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3.2,
        }}
      >
        <CardContent sx={{ p: 2.2, "&:last-child": { pb: 2.2 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 42,
                "& .MuiTab-root": {
                  minHeight: 42,
                  textTransform: "none",
                  fontWeight: 700,
                },
              }}
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

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Select
                size="small"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                sx={{
                  minWidth: 200,
                  borderRadius: 2.5,
                }}
              >
                {TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>

              {typeFilter !== "ALL" && (
                <Button
                  variant="text"
                  onClick={() => setTypeFilter("ALL")}
                  sx={{
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Clear Filter
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {loading ? (
        <Stack spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={item}
              variant="rounded"
              height={174}
              sx={{ borderRadius: 3.2 }}
            />
          ))}
        </Stack>
      ) : filteredNotifications.length > 0 ? (
        <>
          {refreshing && <LinearProgress sx={{ mb: 2, borderRadius: 999 }} />}

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
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              sx={{ mt: 4 }}
            >
              <Typography variant="body2" color="text.secondary">
                Page {page + 1} of {totalPages} · {totalElements} notification
                {totalElements === 1 ? "" : "s"}
              </Typography>

              <Pagination
                page={page + 1}
                count={totalPages}
                color="primary"
                onChange={handlePageChange}
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Stack>
          )}
        </>
      ) : (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
          }}
        >
          <CardContent>
            <Box sx={{ py: 7, textAlign: "center" }}>
              <Box
                sx={{
                  width: 70,
                  height: 70,
                  borderRadius: 3,
                  mx: "auto",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(79,70,229,0.07)",
                  color: "primary.main",
                }}
              >
                <NotificationsActiveRounded sx={{ fontSize: 38 }} />
              </Box>

              <Typography variant="h6" fontWeight={800} sx={{ mt: 2 }}>
                {activeTab === 1
                  ? "You're all caught up"
                  : typeFilter !== "ALL"
                    ? "No matching notifications"
                    : "No notifications yet"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.6,
                  maxWidth: 500,
                  mx: "auto",
                  lineHeight: 1.65,
                }}
              >
                {activeTab === 1
                  ? "There are no unread notifications requiring your attention."
                  : typeFilter !== "ALL"
                    ? "Try selecting another notification type or clear the filter."
                    : "Important LibraryHub activity will appear here as it happens."}
              </Typography>

              {typeFilter !== "ALL" && (
                <Button
                  variant="outlined"
                  onClick={() => setTypeFilter("ALL")}
                  sx={{
                    mt: 2.5,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Show All Types
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      )}

      <Divider sx={{ my: 4 }} />

      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        spacing={1.5}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <AccessTimeRounded sx={{ fontSize: 18, color: "text.secondary" }} />

          <Typography variant="caption" color="text.secondary">
            Notifications are synchronized with LibraryHub in real time.
          </Typography>
        </Stack>

        <Tooltip title="New notifications can appear automatically while you stay on this page.">
          <Chip
            size="small"
            icon={<NotificationsActiveRounded />}
            label="Live synchronization"
            variant="outlined"
          />
        </Tooltip>
      </Stack>
    </Box>
  );
}

export default Notifications;
