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

import studentNotificationApi from "../../../api/studentNotificationApi";

function StudentNotifications() {
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await studentNotificationApi.getUnread();

      setNotifications(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Failed to load notifications:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to load notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkRead = async (notificationId) => {
    try {
      setError("");

      await studentNotificationApi.markAsRead(notificationId);

      setNotifications((previous) =>
        previous.filter((notification) => notification.id !== notificationId),
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to mark notification as read.",
      );
    }
  };

  const handleMarkAll = async () => {
    try {
      setError("");

      await studentNotificationApi.markAllAsRead();

      setNotifications([]);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to mark notifications as read.",
      );
    }
  };

  return (
    <Box>
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
        sx={{ mb: 3 }}
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
            <Badge badgeContent={notifications.length} color="error">
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

        {notifications.length > 0 && (
          <Button
            variant="outlined"
            startIcon={<DoneAll />}
            onClick={handleMarkAll}
          >
            Mark All as Read
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 8 }}>
          <CircularProgress />

          <Typography color="text.secondary">
            Loading notifications...
          </Typography>
        </Stack>
      ) : notifications.length === 0 ? (
        <Alert severity="info">You have no unread notifications.</Alert>
      ) : (
        <Stack spacing={2}>
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {notification.title}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.75,
                      }}
                    >
                      {notification.message}
                    </Typography>
                  </Box>

                  {notification.type && (
                    <Chip size="small" label={notification.type} />
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
                    onClick={() => handleMarkRead(notification.id)}
                  >
                    Mark as Read
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
}

export default StudentNotifications;
