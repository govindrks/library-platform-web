import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import EventSeatRoundedIcon from "@mui/icons-material/EventSeatRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import HighlightOffRoundedIcon from "@mui/icons-material/HighlightOffRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import { useLocation, useNavigate } from "react-router-dom";

import SeatChangeRequestStatus from "../Common/Components/SeatChangeRequestStatus";
import OwnerReviewDialog from "./components/OwnerReviewDialog";

import libraryApi from "../../api/libraryApi";
import seatChangeRequestApi from "../../api/seatChangeRequestApi";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

function getStoredOwnerLibraryId() {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);
  if (!value) return null;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
}

function storeOwnerLibraryId(libraryId) {
  const id = Number(libraryId);
  if (!Number.isFinite(id)) return;
  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
}

function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  return [];
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name) {
  if (!name) return "M";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function mapRequest(request) {
  return {
    ...request,
    requestId: request?.requestId ?? null,
    studentId: request?.studentId ?? null,
    studentName: request?.studentName || "Unknown Member",
    studentEmail: request?.studentEmail || "",
    profileImageUrl: request?.profileImageUrl || "",
    subscriptionId: request?.subscriptionId ?? null,
    currentSeatId: request?.currentSeatId ?? null,
    currentSeat: request?.currentSeat || "-",
    requestedSeatId: request?.requestedSeatId ?? null,
    requestedSeat: request?.requestedSeat || "-",
    reason: request?.reason || "",
    rejectionReason: request?.rejectionReason || "",
    status: request?.status || "PENDING",
    requestedAt: request?.requestedAt || "",
  };
}

function KpiCard({ icon, label, value, helper, tone = "primary" }) {
  const theme = useTheme();
  const palette = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3.2,
        borderColor: alpha(palette, 0.14),
        background: `linear-gradient(145deg, #fff 0%, ${alpha(palette, 0.035)} 100%)`,
        boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
      }}
    >
      <CardContent sx={{ p: 2.35 }}>
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.4,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(palette, 0.09),
              color: palette,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box minWidth={0}>
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.15 }}>
              {value}
            </Typography>
            {helper && (
              <Typography variant="caption" color="text.secondary">
                {helper}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SeatChangeRequests() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const fromNotification = Boolean(location.state?.fromNotification);
  const notificationReferenceId =
    location.state?.notificationReferenceId ?? null;
  const notificationReferenceType =
    location.state?.notificationReferenceType ?? null;

  const [highlightedRequestId, setHighlightedRequestId] = useState(null);
  const [resolvingNotificationTarget, setResolvingNotificationTarget] =
    useState(false);
  const [notificationTargetHandled, setNotificationTargetHandled] =
    useState(false);

  const [libraries, setLibraries] = useState([]);
  const [libraryId, setLibraryId] = useState("");
  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [requests, setRequests] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");

  const [reviewRequest, setReviewRequest] = useState(null);
  const [reviewAction, setReviewAction] = useState(null);
  const [processingReview, setProcessingReview] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedLibrary = useMemo(
    () =>
      libraries.find((library) => String(library.id) === String(libraryId)) ||
      null,
    [libraries, libraryId],
  );

  const loadLibraries = useCallback(async () => {
    try {
      setLoadingLibraries(true);
      setError("");

      const response = await libraryApi.getMyLibraries();
      const libraryList = normalizeListResponse(response);
      setLibraries(libraryList);

      if (libraryList.length === 0) {
        setLibraryId("");
        setRequests([]);
        setSummary(null);
        return;
      }

      const storedLibraryId = getStoredOwnerLibraryId();
      const preferredLibrary = storedLibraryId
        ? libraryList.find(
            (library) => Number(library.id) === Number(storedLibraryId),
          )
        : null;

      setLibraryId((currentLibraryId) => {
        const currentStillExists =
          currentLibraryId &&
          libraryList.some(
            (library) => String(library.id) === String(currentLibraryId),
          );

        if (currentStillExists) return String(currentLibraryId);

        const nextLibraryId = String(preferredLibrary?.id ?? libraryList[0].id);
        storeOwnerLibraryId(nextLibraryId);
        return nextLibraryId;
      });
    } catch (err) {
      console.error("Failed to load owner libraries:", err);
      setLibraries([]);
      setLibraryId("");
      setRequests([]);
      setSummary(null);
      setError(getErrorMessage(err, "Unable to load your libraries."));
    } finally {
      setLoadingLibraries(false);
    }
  }, []);

  const loadRequests = useCallback(async () => {
    if (!libraryId) {
      setRequests([]);
      setSummary(null);
      return;
    }

    try {
      setLoadingRequests(true);
      setError("");

      const [requestsResponse, summaryResponse] = await Promise.all([
        seatChangeRequestApi.getLibraryRequests(libraryId, status),
        seatChangeRequestApi.getLibraryRequestSummary(libraryId),
      ]);

      setRequests(normalizeListResponse(requestsResponse).map(mapRequest));
      setSummary(summaryResponse ?? null);
    } catch (err) {
      console.error("Failed to load seat change requests:", err);
      setRequests([]);
      setSummary(null);
      setError(getErrorMessage(err, "Unable to load seat change requests."));
    } finally {
      setLoadingRequests(false);
    }
  }, [libraryId, status]);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (!libraryId) {
      setRequests([]);
      setSummary(null);
      return;
    }

    storeOwnerLibraryId(libraryId);
    loadRequests();
  }, [libraryId, loadRequests]);

  useEffect(() => {
    if (!fromNotification) return;
    if (notificationTargetHandled) return;
    if (notificationReferenceType !== "SEAT_CHANGE_REQUEST") return;
    if (!notificationReferenceId) return;
    if (loadingLibraries || libraries.length === 0) return;

    let cancelled = false;

    const resolveTarget = async () => {
      try {
        setResolvingNotificationTarget(true);
        setError("");

        for (const library of libraries) {
          if (cancelled) return;

          const response = await seatChangeRequestApi.getLibraryRequests(
            library.id,
            "ALL",
          );
          const libraryRequests =
            normalizeListResponse(response).map(mapRequest);

          const matchingRequest = libraryRequests.find(
            (request) =>
              Number(request?.requestId) === Number(notificationReferenceId),
          );

          if (matchingRequest) {
            setLibraryId(String(library.id));
            storeOwnerLibraryId(library.id);
            setStatus("ALL");
            setSearch("");
            setHighlightedRequestId(matchingRequest.requestId);
            setSuccess(
              `Seat change request #${matchingRequest.requestId} opened from notification.`,
            );
            setNotificationTargetHandled(true);
            navigate(location.pathname, { replace: true, state: null });
            return;
          }
        }

        setError(
          `Seat change request #${notificationReferenceId} could not be found in your libraries.`,
        );
        setNotificationTargetHandled(true);
        navigate(location.pathname, { replace: true, state: null });
      } catch (err) {
        console.error(
          "Failed to resolve notification seat-change request:",
          err,
        );
        setError(
          getErrorMessage(
            err,
            "Unable to open the seat change request from the notification.",
          ),
        );
        setNotificationTargetHandled(true);
        navigate(location.pathname, { replace: true, state: null });
      } finally {
        if (!cancelled) setResolvingNotificationTarget(false);
      }
    };

    resolveTarget();

    return () => {
      cancelled = true;
    };
  }, [
    fromNotification,
    notificationReferenceId,
    notificationReferenceType,
    notificationTargetHandled,
    loadingLibraries,
    libraries,
    location.pathname,
    navigate,
  ]);

  useEffect(() => {
    if (!highlightedRequestId || loadingRequests) return;

    const exists = requests.some(
      (request) => String(request.requestId) === String(highlightedRequestId),
    );
    if (!exists) return;

    const timeoutId = window.setTimeout(() => {
      const element = document.getElementById(
        `seat-change-request-${highlightedRequestId}`,
      );
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 150);

    return () => window.clearTimeout(timeoutId);
  }, [highlightedRequestId, loadingRequests, requests]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;

    return requests.filter((request) => {
      const searchableValues = [
        request.requestId,
        request.studentId,
        request.studentName,
        request.studentEmail,
        request.subscriptionId,
        request.currentSeatId,
        request.currentSeat,
        request.requestedSeatId,
        request.requestedSeat,
        request.reason,
        request.rejectionReason,
        request.status,
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [requests, search]);

  const totalRequests = Number(summary?.totalRequests ?? 0);
  const pendingRequests = Number(summary?.pendingRequests ?? 0);
  const approvedRequests = Number(summary?.approvedRequests ?? 0);
  const rejectedRequests = Number(summary?.rejectedRequests ?? 0);

  const approvalRate =
    approvedRequests + rejectedRequests > 0
      ? Math.round(
          (approvedRequests / (approvedRequests + rejectedRequests)) * 100,
        )
      : 0;

  const handleApprove = (request) => {
    setError("");
    setSuccess("");
    setReviewRequest(request);
    setReviewAction("APPROVE");
  };

  const handleReject = (request) => {
    setError("");
    setSuccess("");
    setReviewRequest(request);
    setReviewAction("REJECT");
  };

  const handleCloseReview = () => {
    if (processingReview) return;
    setReviewRequest(null);
    setReviewAction(null);
  };

  const handleReviewConfirm = async ({
    requestId,
    status: reviewedStatus,
    ownerComment,
  }) => {
    const effectiveRequestId = requestId ?? reviewRequest?.requestId;

    if (!libraryId) {
      setError("Please select a library.");
      return;
    }

    if (!effectiveRequestId) {
      setError("Seat change request id is missing.");
      return;
    }

    try {
      setProcessingReview(true);
      setError("");
      setSuccess("");

      if (reviewedStatus === "APPROVED" || reviewAction === "APPROVE") {
        await seatChangeRequestApi.approveLibraryRequest(
          libraryId,
          effectiveRequestId,
        );
        setSuccess(
          `Seat change request #${effectiveRequestId} approved successfully.`,
        );
      } else if (reviewedStatus === "REJECTED" || reviewAction === "REJECT") {
        const rejectionReason = ownerComment?.trim();
        if (!rejectionReason) {
          setError("Rejection reason is required.");
          return;
        }

        await seatChangeRequestApi.rejectLibraryRequest(
          libraryId,
          effectiveRequestId,
          rejectionReason,
        );

        setSuccess(
          `Seat change request #${effectiveRequestId} rejected successfully.`,
        );
      } else {
        setError("Invalid seat change request action.");
        return;
      }

      setReviewRequest(null);
      setReviewAction(null);
      await loadRequests();
    } catch (err) {
      console.error("Failed to review seat change request:", err);
      setError(getErrorMessage(err, "Unable to process seat change request."));
    } finally {
      setProcessingReview(false);
    }
  };

  const handleLibraryChange = (event) => {
    const nextLibraryId = String(event.target.value);
    setLibraryId(nextLibraryId);
    storeOwnerLibraryId(nextLibraryId);
    setSearch("");
    setStatus("ALL");
    setReviewRequest(null);
    setReviewAction(null);
    setHighlightedRequestId(null);
    setError("");
    setSuccess("");
  };

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
    setSearch("");
    setHighlightedRequestId(null);
    setError("");
  };

  return (
    <Box sx={{ pb: 4 }}>
      <Paper
        variant="outlined"
        sx={{
          position: "relative",
          overflow: "hidden",
          p: { xs: 2.5, md: 3.2 },
          mb: 3,
          borderRadius: 4,
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background: `linear-gradient(118deg, ${alpha(
            theme.palette.primary.main,
            0.08,
          )} 0%, #fff 52%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
          boxShadow: "0 14px 40px rgba(15,23,42,0.05)",
          "&::after": {
            content: '\"\"',
            position: "absolute",
            width: 190,
            height: 190,
            borderRadius: "50%",
            right: -45,
            top: -85,
            bgcolor: alpha(theme.palette.primary.main, 0.05),
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2.5}
          position="relative"
          zIndex={1}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "common.white",
                boxShadow: `0 10px 28px ${alpha(theme.palette.primary.main, 0.24)}`,
                flexShrink: 0,
              }}
            >
              <SwapHorizRoundedIcon sx={{ fontSize: 30 }} />
            </Box>

            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ letterSpacing: -0.6 }}
              >
                Seat Change Requests
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.4}>
                Review member seat moves, understand the reason, and make a
                clear decision.
              </Typography>

              {selectedLibrary && (
                <Chip
                  size="small"
                  label={selectedLibrary.name}
                  sx={{
                    mt: 1.3,
                    fontWeight: 750,
                    bgcolor: alpha(theme.palette.primary.main, 0.07),
                    color: "primary.main",
                  }}
                />
              )}
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <FormControl
              size="small"
              sx={{ minWidth: { xs: "100%", sm: 220 } }}
            >
              <InputLabel>Library</InputLabel>
              <Select
                value={libraryId}
                label="Library"
                disabled={loadingLibraries || resolvingNotificationTarget}
                onChange={handleLibraryChange}
                sx={{ borderRadius: 2.2, bgcolor: "background.paper" }}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Refresh requests">
              <span>
                <Button
                  variant="outlined"
                  startIcon={
                    loadingRequests ? (
                      <CircularProgress size={16} />
                    ) : (
                      <RefreshRoundedIcon />
                    )
                  }
                  disabled={!libraryId || loadingRequests}
                  onClick={loadRequests}
                  sx={{
                    height: 40,
                    borderRadius: 2.2,
                    px: 2,
                    fontWeight: 800,
                    whiteSpace: "nowrap",
                    bgcolor: "background.paper",
                  }}
                >
                  Refresh
                </Button>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {resolvingNotificationTarget && (
        <Alert
          severity="info"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
          icon={<CircularProgress size={18} />}
        >
          Opening the seat change request from your notification...
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {!loadingLibraries && libraries.length === 0 && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5 }}>
          No library is available for this owner account.
        </Alert>
      )}

      {libraryId && (
        <Grid container spacing={2} mb={3}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              icon={<SwapHorizRoundedIcon />}
              label="Total Requests"
              value={totalRequests}
              helper="All seat-change requests"
              tone="primary"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              icon={<PendingActionsRoundedIcon />}
              label="Pending"
              value={pendingRequests}
              helper="Requires owner decision"
              tone="warning"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              icon={<TaskAltRoundedIcon />}
              label="Approved"
              value={approvedRequests}
              helper={`${approvalRate}% approval rate`}
              tone="success"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              icon={<HighlightOffRoundedIcon />}
              label="Rejected"
              value={rejectedRequests}
              helper="Closed without seat move"
              tone="error"
            />
          </Grid>
        </Grid>
      )}

      <Paper
        variant="outlined"
        sx={{
          p: 2.2,
          mb: 2.5,
          borderRadius: 3.2,
          borderColor: "divider",
          boxShadow: "0 8px 24px rgba(15,23,42,0.03)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search member, request, subscription or seat..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": { borderRadius: 2.2 },
              minWidth: { md: 340 },
            }}
          />

          <FormControl size="small" sx={{ minWidth: 190 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              disabled={!libraryId}
              onChange={handleStatusChange}
              sx={{ borderRadius: 2.2 }}
            >
              <MenuItem value="ALL">All Requests</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
              <MenuItem value="APPROVED">Approved</MenuItem>
              <MenuItem value="REJECTED">Rejected</MenuItem>
            </Select>
          </FormControl>

          <Chip
            size="small"
            label={`${filteredRequests.length} visible`}
            variant="outlined"
            sx={{
              fontWeight: 750,
              alignSelf: { xs: "flex-start", md: "center" },
            }}
          />
        </Stack>
      </Paper>

      {(loadingLibraries || loadingRequests) && (
        <Paper variant="outlined" sx={{ borderRadius: 3.2, p: 5, mb: 3 }}>
          <Stack
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            minHeight={180}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              {loadingLibraries
                ? "Loading libraries..."
                : "Loading seat change requests..."}
            </Typography>
          </Stack>
        </Paper>
      )}

      {!loadingLibraries && !loadingRequests && libraryId && (
        <Stack spacing={2}>
          {filteredRequests.map((request) => {
            const highlighted =
              String(highlightedRequestId) === String(request.requestId);
            const isPending = request.status === "PENDING";

            return (
              <Card
                key={request.requestId}
                id={`seat-change-request-${request.requestId}`}
                variant="outlined"
                sx={{
                  borderRadius: 3.4,
                  overflow: "hidden",
                  borderWidth: highlighted ? 2 : 1,
                  borderColor: highlighted
                    ? "primary.main"
                    : isPending
                      ? alpha(theme.palette.warning.main, 0.18)
                      : "divider",
                  background: highlighted
                    ? `linear-gradient(110deg, ${alpha(theme.palette.primary.main, 0.05)}, #fff 35%)`
                    : "background.paper",
                  boxShadow: highlighted
                    ? `0 16px 38px ${alpha(theme.palette.primary.main, 0.12)}`
                    : "0 8px 24px rgba(15,23,42,0.035)",
                  transition: "all 0.25s ease",
                }}
              >
                <CardContent sx={{ p: { xs: 2.2, md: 2.6 } }}>
                  <Stack spacing={2.2}>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={2}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                        minWidth={0}
                      >
                        <Avatar
                          src={request.profileImageUrl || undefined}
                          alt={request.studentName}
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: "primary.main",
                            fontWeight: 850,
                            border: "2px solid",
                            borderColor: alpha(
                              theme.palette.primary.main,
                              0.14,
                            ),
                            flexShrink: 0,
                          }}
                        >
                          {!request.profileImageUrl
                            ? initials(request.studentName)
                            : null}
                        </Avatar>

                        <Box minWidth={0}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={850}
                              noWrap
                            >
                              {request.studentName}
                            </Typography>
                            <Chip
                              size="small"
                              label={`#${request.requestId}`}
                              variant="outlined"
                              sx={{ height: 24, fontWeight: 750 }}
                            />
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={1.1}
                            alignItems="center"
                            mt={0.45}
                            flexWrap="wrap"
                            useFlexGap
                          >
                            {request.studentEmail && (
                              <Stack
                                direction="row"
                                spacing={0.45}
                                alignItems="center"
                              >
                                <EmailOutlinedIcon
                                  sx={{ fontSize: 15, color: "text.secondary" }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {request.studentEmail}
                                </Typography>
                              </Stack>
                            )}
                            {request.subscriptionId && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Subscription #{request.subscriptionId}
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Stack>

                      <SeatChangeRequestStatus status={request.status} />
                    </Stack>

                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2.6,
                        bgcolor: alpha(theme.palette.primary.main, 0.018),
                        borderColor: alpha(theme.palette.primary.main, 0.09),
                      }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(
                                  theme.palette.text.primary,
                                  0.05,
                                ),
                                color: "text.secondary",
                              }}
                            >
                              <EventSeatRoundedIcon fontSize="small" />
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={650}
                              >
                                Current Seat
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={850}>
                                {request.currentSeat}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 2 }}>
                          <Box sx={{ display: "grid", placeItems: "center" }}>
                            <ArrowForwardRoundedIcon color="primary" />
                          </Box>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 5 }}>
                          <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.08,
                                ),
                                color: "primary.main",
                              }}
                            >
                              <EventSeatRoundedIcon fontSize="small" />
                            </Box>
                            <Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                fontWeight={650}
                              >
                                Requested Seat
                              </Typography>
                              <Typography
                                variant="subtitle1"
                                fontWeight={900}
                                color="primary.main"
                              >
                                {request.requestedSeat}
                              </Typography>
                            </Box>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, md: 8 }}>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                          >
                            Member Reason
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ mt: 0.5, lineHeight: 1.65 }}
                          >
                            {request.reason || "No reason was provided."}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={{ xs: 12, md: 4 }}>
                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="flex-start"
                        >
                          <AccessTimeRoundedIcon
                            sx={{
                              fontSize: 17,
                              mt: 0.2,
                              color: "text.secondary",
                            }}
                          />
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={700}
                            >
                              Requested At
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              mt={0.25}
                            >
                              {formatDateTime(request.requestedAt)}
                            </Typography>
                          </Box>
                        </Stack>
                      </Grid>
                    </Grid>

                    {request.status === "REJECTED" &&
                      request.rejectionReason && (
                        <Box
                          sx={{
                            p: 1.7,
                            borderRadius: 2.2,
                            bgcolor: alpha(theme.palette.error.main, 0.055),
                            border: "1px solid",
                            borderColor: alpha(theme.palette.error.main, 0.14),
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="error.main"
                            fontWeight={800}
                          >
                            Rejection Reason
                          </Typography>
                          <Typography
                            variant="body2"
                            color="error.dark"
                            mt={0.35}
                          >
                            {request.rejectionReason}
                          </Typography>
                        </Box>
                      )}

                    {isPending && (
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        justifyContent="flex-end"
                        spacing={1}
                        pt={0.2}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          disabled={processingReview}
                          startIcon={<CancelOutlinedIcon />}
                          onClick={() => handleReject(request)}
                          sx={{ borderRadius: 2.2, fontWeight: 800 }}
                        >
                          Reject
                        </Button>

                        <Button
                          variant="contained"
                          color="success"
                          disabled={processingReview}
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApprove(request)}
                          sx={{
                            borderRadius: 2.2,
                            fontWeight: 800,
                            boxShadow: `0 8px 18px ${alpha(theme.palette.success.main, 0.22)}`,
                          }}
                        >
                          Approve Seat Change
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}

          {filteredRequests.length === 0 && (
            <Paper
              variant="outlined"
              sx={{
                p: 6,
                borderRadius: 3.2,
                textAlign: "center",
                borderStyle: "dashed",
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  mx: "auto",
                  mb: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                  color: "primary.main",
                }}
              >
                <SwapHorizRoundedIcon />
              </Box>
              <Typography variant="h6" fontWeight={850}>
                No seat change requests found
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={0.6}>
                {search
                  ? "No requests match your search."
                  : status !== "ALL"
                    ? `There are no ${status.toLowerCase()} seat change requests.`
                    : "No member has submitted a seat change request yet."}
              </Typography>
            </Paper>
          )}
        </Stack>
      )}

      <OwnerReviewDialog
        open={Boolean(reviewRequest)}
        request={reviewRequest}
        action={reviewAction}
        onClose={handleCloseReview}
        onConfirm={handleReviewConfirm}
        loading={processingReview}
      />
    </Box>
  );
}

export default SeatChangeRequests;
