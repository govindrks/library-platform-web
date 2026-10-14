import {
  Alert,
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
  Add,
  CancelOutlined,
  EventSeat,
  Refresh,
  SwapHoriz,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import studentSeatChangeApi from "../../../api/studentSeatChangeApi";

// ============================================================
// HELPERS
// ============================================================

const statusColor = (status) => {
  switch (status) {
    case "PENDING":
      return "warning";

    case "APPROVED":
      return "success";

    case "REJECTED":
      return "error";

    case "CANCELLED":
      return "default";

    default:
      return "default";
  }
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ============================================================
// COMPONENT
// ============================================================

function MySeatChangeRequests() {
  // ==========================================================
  // ROUTER
  // ==========================================================

  const location = useLocation();

  const navigate = useNavigate();

  // ==========================================================
  // NOTIFICATION / SUBMISSION DEEP LINK STATE
  // ==========================================================

  const fromNotification = Boolean(location.state?.fromNotification);

  const notificationReferenceId =
    location.state?.notificationReferenceId ?? null;

  const notificationReferenceType =
    location.state?.notificationReferenceType ?? null;

  const fromSeatChangeSubmission = Boolean(
    location.state?.fromSeatChangeSubmission,
  );

  const submittedRequestId = location.state?.submittedRequestId ?? null;

  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [cancellingId, setCancellingId] = useState(null);

  const [highlightedRequestId, setHighlightedRequestId] = useState(null);

  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  // ==========================================================
  // LOAD REQUESTS
  // ==========================================================

  const loadRequests = useCallback(async ({ showFullLoader = true } = {}) => {
    try {
      if (showFullLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const response = await studentSeatChangeApi.getMyRequests();

      const requestList = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : [];

      setRequests(requestList);

      return requestList;
    } catch (requestError) {
      console.error("Failed to load seat change requests:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load seat change requests.",
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
    loadRequests({
      showFullLoader: true,
    });
  }, [loadRequests]);

  // ==========================================================
  // RESOLVE NOTIFICATION / SUBMISSION TARGET
  // ==========================================================

  useEffect(() => {
    if (deepLinkHandled) {
      return;
    }

    if (loading) {
      return;
    }

    let targetRequestId = null;

    // -------------------------------------------------------
    // NOTIFICATION TARGET
    // -------------------------------------------------------

    if (
      fromNotification &&
      notificationReferenceType === "SEAT_CHANGE_REQUEST" &&
      notificationReferenceId
    ) {
      targetRequestId = notificationReferenceId;
    }

    // -------------------------------------------------------
    // NEWLY SUBMITTED REQUEST TARGET
    // -------------------------------------------------------

    if (!targetRequestId && fromSeatChangeSubmission && submittedRequestId) {
      targetRequestId = submittedRequestId;
    }

    if (!targetRequestId) {
      setDeepLinkHandled(true);

      return;
    }

    const matchingRequest = requests.find(
      (request) => Number(request?.requestId) === Number(targetRequestId),
    );

    if (!matchingRequest) {
      setError(`Seat change request #${targetRequestId} could not be found.`);

      setDeepLinkHandled(true);

      navigate(location.pathname, {
        replace: true,
        state: null,
      });

      return;
    }

    setHighlightedRequestId(matchingRequest.requestId);

    if (fromNotification) {
      setSuccess(
        `Seat change request #${matchingRequest.requestId} opened from notification.`,
      );
    } else if (fromSeatChangeSubmission) {
      setSuccess(
        `Seat change request #${matchingRequest.requestId} submitted successfully.`,
      );
    }

    setDeepLinkHandled(true);

    // -------------------------------------------------------
    // CLEAR ROUTER STATE
    // -------------------------------------------------------

    navigate(location.pathname, {
      replace: true,
      state: null,
    });

    // -------------------------------------------------------
    // SCROLL TO TARGET
    // -------------------------------------------------------

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(
        `student-seat-change-request-${matchingRequest.requestId}`,
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
    requests,

    fromNotification,
    notificationReferenceId,
    notificationReferenceType,

    fromSeatChangeSubmission,
    submittedRequestId,

    location.pathname,
    navigate,
  ]);

  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const summary = useMemo(() => {
    return requests.reduce(
      (result, request) => {
        result.total += 1;

        switch (request?.status) {
          case "PENDING":
            result.pending += 1;
            break;

          case "APPROVED":
            result.approved += 1;
            break;

          case "REJECTED":
            result.rejected += 1;
            break;

          case "CANCELLED":
            result.cancelled += 1;
            break;

          default:
            break;
        }

        return result;
      },
      {
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
        cancelled: 0,
      },
    );
  }, [requests]);

  // ==========================================================
  // CANCEL REQUEST
  // ==========================================================

  const handleCancel = async (requestId) => {
    if (!requestId) {
      return;
    }

    try {
      setCancellingId(requestId);

      setError("");

      setSuccess("");

      await studentSeatChangeApi.cancelRequest(requestId);

      setSuccess(`Seat change request #${requestId} cancelled successfully.`);

      await loadRequests({
        showFullLoader: false,
      });
    } catch (requestError) {
      console.error("Failed to cancel seat change request:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to cancel the seat change request.",
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh = () => {
    setError("");

    loadRequests({
      showFullLoader: false,
    });
  };

  // ==========================================================
  // NEW REQUEST
  // ==========================================================

  const handleNewRequest = () => {
    navigate("/student/seat-change/request");
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
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Seat Change Requests
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Track your requested seat changes and their approval status.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
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

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleNewRequest}
          >
            New Request
          </Button>
        </Stack>
      </Stack>

      {/* ===================================================== */}
      {/* SUMMARY */}
      {/* ===================================================== */}

      {!loading && requests.length > 0 && (
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1}
          sx={{
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Chip label={`Total ${summary.total}`} variant="outlined" />

          <Chip
            label={`Pending ${summary.pending}`}
            color="warning"
            variant="outlined"
          />

          <Chip
            label={`Approved ${summary.approved}`}
            color="success"
            variant="outlined"
          />

          <Chip
            label={`Rejected ${summary.rejected}`}
            color="error"
            variant="outlined"
          />

          {summary.cancelled > 0 && (
            <Chip label={`Cancelled ${summary.cancelled}`} variant="outlined" />
          )}
        </Stack>
      )}

      {/* ===================================================== */}
      {/* SUCCESS */}
      {/* ===================================================== */}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
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
          }}
          onClose={() => setError("")}
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

          <Typography color="text.secondary">Loading requests...</Typography>
        </Stack>
      ) : requests.length === 0 ? (
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
          <CardContent>
            <Typography variant="h6" fontWeight={700}>
              No seat change requests
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,

                mb: 2,
              }}
            >
              You have not requested a seat change yet.
            </Typography>

            <Button variant="contained" onClick={handleNewRequest}>
              Request Seat Change
            </Button>
          </CardContent>
        </Card>
      ) : (
        // =================================================
        // REQUEST LIST
        // =================================================

        <Stack spacing={2}>
          {requests.map((request) => {
            const pending = request.status === "PENDING";

            const highlighted =
              String(highlightedRequestId) === String(request.requestId);

            return (
              <Card
                id={`student-seat-change-request-${request.requestId}`}
                key={request.requestId}
                elevation={0}
                sx={{
                  border: highlighted ? "2px solid" : "1px solid",

                  borderColor: highlighted
                    ? "primary.main"
                    : pending
                      ? "warning.light"
                      : "divider",

                  backgroundColor: highlighted
                    ? "rgba(79, 70, 229, 0.04)"
                    : "background.paper",

                  boxShadow: highlighted ? 3 : 0,

                  borderRadius: 3,

                  transition: "all 0.25s ease",
                }}
              >
                <CardContent>
                  {/* =================================== */}
                  {/* HEADER */}
                  {/* =================================== */}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Request
                      </Typography>

                      <Typography variant="h6" fontWeight={800}>
                        #{request.requestId}
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={request.status || "-"}
                      color={statusColor(request.status)}
                    />
                  </Stack>

                  <Divider
                    sx={{
                      my: 2,
                    }}
                  />

                  {/* =================================== */}
                  {/* SEAT TRANSITION */}
                  {/* =================================== */}

                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    alignItems={{
                      xs: "flex-start",
                      sm: "center",
                    }}
                    spacing={2}
                  >
                    <Stack
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      spacing={0.5}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Current Seat
                      </Typography>

                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <EventSeat />

                        <Typography variant="h6" fontWeight={700}>
                          {request.currentSeat || "-"}
                        </Typography>
                      </Stack>
                    </Stack>

                    <SwapHoriz />

                    <Stack
                      alignItems={{
                        xs: "flex-start",
                        sm: "center",
                      }}
                      spacing={0.5}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Requested Seat
                      </Typography>

                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <EventSeat color="primary" />

                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="primary.main"
                        >
                          {request.requestedSeat || "-"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Divider
                    sx={{
                      my: 2,
                    }}
                  />

                  {/* =================================== */}
                  {/* DETAILS */}
                  {/* =================================== */}

                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Reason:</strong> {request.reason || "-"}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Requested on: {formatDateTime(request.requestedAt)}
                    </Typography>

                    {request.status === "APPROVED" && (
                      <Alert severity="success">
                        Your seat change request has been approved.
                      </Alert>
                    )}

                    {request.status === "REJECTED" &&
                      request.rejectionReason && (
                        <Alert severity="error">
                          {request.rejectionReason}
                        </Alert>
                      )}

                    {request.status === "CANCELLED" && (
                      <Alert severity="info">
                        This seat change request was cancelled.
                      </Alert>
                    )}
                  </Stack>

                  {/* =================================== */}
                  {/* CANCEL */}
                  {/* =================================== */}

                  {pending && (
                    <Button
                      color="error"
                      variant="outlined"
                      startIcon={<CancelOutlined />}
                      disabled={cancellingId === request.requestId}
                      onClick={() => handleCancel(request.requestId)}
                      sx={{
                        mt: 2,
                      }}
                    >
                      {cancellingId === request.requestId
                        ? "Cancelling..."
                        : "Cancel Request"}
                    </Button>
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

export default MySeatChangeRequests;
