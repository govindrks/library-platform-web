import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

import SeatChangeRequestStatus from "../SeatChangeRequest/components/SeatChangeRequestStatus";
import OwnerReviewDialog from "./components/OwnerReviewDialog";

import libraryApi from "../../api/libraryApi";
import seatChangeRequestApi from "../../api/seatChangeRequestApi";

/* =========================================================
   HELPERS
========================================================= */

/**
 * Extract a readable message from an Axios/backend error.
 */
function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

/**
 * Normalize backend list responses.
 *
 * Supports:
 * [
 *   {...}
 * ]
 *
 * and:
 *
 * {
 *   content: [...]
 * }
 */
function normalizeListResponse(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
}

/**
 * Format date/time returned by backend.
 */
function formatDateTime(value) {
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
}

/* =========================================================
   SEAT CHANGE REQUESTS
========================================================= */

function SeatChangeRequests() {
  /* =======================================================
     LIBRARY STATE
  ======================================================= */

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  /* =======================================================
     REQUEST DATA
  ======================================================= */

  const [requests, setRequests] = useState([]);

  const [summary, setSummary] = useState(null);

  const [loadingRequests, setLoadingRequests] = useState(false);

  /* =======================================================
     FILTERS
  ======================================================= */

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("ALL");

  /* =======================================================
     REVIEW DIALOG
  ======================================================= */

  const [reviewRequest, setReviewRequest] = useState(null);

  const [reviewAction, setReviewAction] = useState(null);

  const [processingReview, setProcessingReview] = useState(false);

  /* =======================================================
     FEEDBACK
  ======================================================= */

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* =======================================================
     LOAD OWNER LIBRARIES
  ======================================================= */

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

      /*
       * Preserve current selection if the library
       * still belongs to the authenticated owner.
       *
       * Otherwise select the first available library.
       */
      setLibraryId((currentLibraryId) => {
        const currentLibraryStillExists =
          currentLibraryId &&
          libraryList.some(
            (library) => String(library.id) === String(currentLibraryId),
          );

        if (currentLibraryStillExists) {
          return String(currentLibraryId);
        }

        return String(libraryList[0].id);
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

  /* =======================================================
     LOAD SEAT CHANGE REQUESTS
  ======================================================= */

  const loadRequests = useCallback(async () => {
    if (!libraryId) {
      setRequests([]);
      setSummary(null);

      return;
    }

    try {
      setLoadingRequests(true);
      setError("");

      /*
       * Request list and summary can be loaded
       * independently at the same time.
       */
      const [requestsResponse, summaryResponse] = await Promise.all([
        seatChangeRequestApi.getLibraryRequests(libraryId, status),

        seatChangeRequestApi.getLibraryRequestSummary(libraryId),
      ]);

      setRequests(normalizeListResponse(requestsResponse));

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

  /* =======================================================
     INITIAL LIBRARY LOAD
  ======================================================= */

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  /* =======================================================
     LOAD REQUESTS WHEN LIBRARY / STATUS CHANGES
  ======================================================= */

  useEffect(() => {
    if (!libraryId) {
      setRequests([]);
      setSummary(null);

      return;
    }

    loadRequests();
  }, [libraryId, loadRequests]);

  /* =======================================================
     SEARCH FILTER

     Status filtering is performed by backend.
     Search remains client-side because the current backend
     endpoint does not require a search parameter.
  ======================================================= */

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return requests;
    }

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

  /* =======================================================
     SUMMARY VALUES
  ======================================================= */

  const totalRequests = Number(summary?.totalRequests ?? 0);

  const pendingRequests = Number(summary?.pendingRequests ?? 0);

  const approvedRequests = Number(summary?.approvedRequests ?? 0);

  const rejectedRequests = Number(summary?.rejectedRequests ?? 0);

  /* =======================================================
     OPEN APPROVE DIALOG
  ======================================================= */

  const handleApprove = (request) => {
    setError("");
    setSuccess("");

    setReviewRequest(request);
    setReviewAction("APPROVE");
  };

  /* =======================================================
     OPEN REJECT DIALOG
  ======================================================= */

  const handleReject = (request) => {
    setError("");
    setSuccess("");

    setReviewRequest(request);
    setReviewAction("REJECT");
  };

  /* =======================================================
     CLOSE REVIEW DIALOG
  ======================================================= */

  const handleCloseReview = () => {
    if (processingReview) {
      return;
    }

    setReviewRequest(null);
    setReviewAction(null);
  };

  /* =======================================================
     REVIEW CONFIRM

     Supports the existing OwnerReviewDialog callback shape:

     {
       requestId,
       status,
       ownerComment
     }
  ======================================================= */

  const handleReviewConfirm = async ({
    requestId,
    status: reviewedStatus,
    ownerComment,
  }) => {
    /*
     * If OwnerReviewDialog still sends the old
     * request.id field, fall back to the currently
     * selected backend request.
     */
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

      /* ---------------------------------------------------
         APPROVE
      --------------------------------------------------- */

      if (reviewedStatus === "APPROVED" || reviewAction === "APPROVE") {
        await seatChangeRequestApi.approveLibraryRequest(
          libraryId,
          effectiveRequestId,
        );

        setSuccess(
          `Seat change request #${effectiveRequestId} approved successfully.`,
        );
      } else if (reviewedStatus === "REJECTED" || reviewAction === "REJECT") {

      /* ---------------------------------------------------
         REJECT
      --------------------------------------------------- */
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

      /* ---------------------------------------------------
         INVALID ACTION
      --------------------------------------------------- */
        setError("Invalid seat change request action.");

        return;
      }

      /*
       * Close dialog only after backend operation
       * succeeds.
       */
      setReviewRequest(null);
      setReviewAction(null);

      /*
       * Reload authoritative backend data.
       *
       * We intentionally do not modify request status
       * locally because approval may also transfer the
       * member's subscription seat.
       */
      await loadRequests();
    } catch (err) {
      console.error("Failed to review seat change request:", err);

      setError(getErrorMessage(err, "Unable to process seat change request."));
    } finally {
      setProcessingReview(false);
    }
  };

  /* =======================================================
     LIBRARY CHANGE
  ======================================================= */

  const handleLibraryChange = (event) => {
    setLibraryId(String(event.target.value));

    setSearch("");
    setStatus("ALL");

    setReviewRequest(null);
    setReviewAction(null);

    setError("");
    setSuccess("");
  };

  /* =======================================================
     STATUS CHANGE
  ======================================================= */

  const handleStatusChange = (event) => {
    setStatus(event.target.value);

    setSearch("");

    setError("");
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box>
      {/* ===================================================
          PAGE HEADER
      =================================================== */}

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
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Seat Change Requests
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Review and manage member seat change requests.
          </Typography>
        </Box>

        {/* Library Selector */}

        <FormControl
          size="small"
          sx={{
            minWidth: 220,
          }}
        >
          <InputLabel>Library</InputLabel>

          <Select
            value={libraryId}
            label="Library"
            disabled={loadingLibraries}
            onChange={handleLibraryChange}
          >
            {libraries.map((library) => (
              <MenuItem key={library.id} value={String(library.id)}>
                {library.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* ===================================================
          SUCCESS MESSAGE
      =================================================== */}

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

      {/* ===================================================
          ERROR MESSAGE
      =================================================== */}

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

      {/* ===================================================
          NO LIBRARY
      =================================================== */}

      {!loadingLibraries && libraries.length === 0 && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
          }}
        >
          No library is available for this owner account.
        </Alert>
      )}

      {/* ===================================================
          SUMMARY CARDS
      =================================================== */}

      {libraryId && (
        <Grid container spacing={2} mb={3}>
          {/* Total */}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Requests
                </Typography>

                <Typography variant="h5" fontWeight={700} mt={0.5}>
                  {totalRequests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending */}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Pending
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="warning.main"
                  mt={0.5}
                >
                  {pendingRequests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Approved */}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Approved
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="success.main"
                  mt={0.5}
                >
                  {approvedRequests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Rejected */}

          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
              }}
            >
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Rejected
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={700}
                  color="error.main"
                  mt={0.5}
                >
                  {rejectedRequests}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* ===================================================
          SEARCH / FILTER
      =================================================== */}

      <Card
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            spacing={2}
          >
            {/* Search */}

            <TextField
              fullWidth
              size="small"
              placeholder="Search member, request or seat..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{
                      mr: 1,
                      color: "text.secondary",
                    }}
                  />
                ),
              }}
            />

            {/* Status */}

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Status</InputLabel>

              <Select
                value={status}
                label="Status"
                disabled={!libraryId}
                onChange={handleStatusChange}
              >
                <MenuItem value="ALL">All Requests</MenuItem>

                <MenuItem value="PENDING">Pending</MenuItem>

                <MenuItem value="APPROVED">Approved</MenuItem>

                <MenuItem value="REJECTED">Rejected</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================
          LIBRARY LOADING
      =================================================== */}

      {loadingLibraries && (
        <Card>
          <CardContent>
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{
                minHeight: 200,
              }}
            >
              <CircularProgress />

              <Typography variant="body2" color="text.secondary">
                Loading libraries...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ===================================================
          REQUEST LOADING
      =================================================== */}

      {!loadingLibraries && loadingRequests && (
        <Card>
          <CardContent>
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
              sx={{
                minHeight: 220,
              }}
            >
              <CircularProgress />

              <Typography variant="body2" color="text.secondary">
                Loading seat change requests...
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ===================================================
          REQUEST CARDS
      =================================================== */}

      {!loadingLibraries && !loadingRequests && libraryId && (
        <Grid container spacing={2}>
          {filteredRequests.map((request) => (
            <Grid
              size={{
                xs: 12,
              }}
              key={request.requestId}
            >
              <Card>
                <CardContent>
                  <Stack spacing={2}>
                    {/* =================================
                            REQUEST HEADER
                        ================================= */}

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
                        <Typography fontWeight={700}>
                          {request.studentName || "Unknown Member"}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Request #{request.requestId}
                          {request.subscriptionId &&
                            ` · Subscription #${request.subscriptionId}`}
                        </Typography>

                        {request.studentEmail && (
                          <Typography variant="caption" color="text.secondary">
                            {request.studentEmail}
                          </Typography>
                        )}
                      </Box>

                      <SeatChangeRequestStatus status={request.status} />
                    </Stack>

                    {/* =================================
                            REQUEST DETAILS
                        ================================= */}

                    <Stack
                      direction={{
                        xs: "column",
                        sm: "row",
                      }}
                      spacing={{
                        xs: 2,
                        sm: 4,
                      }}
                    >
                      {/* Current Seat */}

                      <Box
                        sx={{
                          minWidth: 120,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Current Seat
                        </Typography>

                        <Typography fontWeight={700}>
                          {request.currentSeat || "-"}
                        </Typography>
                      </Box>

                      {/* Requested Seat */}

                      <Box
                        sx={{
                          minWidth: 120,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Requested Seat
                        </Typography>

                        <Typography fontWeight={700}>
                          {request.requestedSeat || "-"}
                        </Typography>
                      </Box>

                      {/* Reason */}

                      <Box
                        sx={{
                          flex: 1,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Reason
                        </Typography>

                        <Typography variant="body2">
                          {request.reason || "-"}
                        </Typography>
                      </Box>

                      {/* Requested At */}

                      <Box
                        sx={{
                          minWidth: 180,
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Requested At
                        </Typography>

                        <Typography variant="body2">
                          {formatDateTime(request.requestedAt)}
                        </Typography>
                      </Box>
                    </Stack>

                    {/* =================================
                            REJECTION REASON
                        ================================= */}

                    {request.status === "REJECTED" &&
                      request.rejectionReason && (
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 1,
                            bgcolor: "error.light",
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="error.dark"
                            fontWeight={700}
                          >
                            Rejection Reason
                          </Typography>

                          <Typography
                            variant="body2"
                            color="error.dark"
                            mt={0.25}
                          >
                            {request.rejectionReason}
                          </Typography>
                        </Box>
                      )}

                    {/* =================================
                            PENDING ACTIONS
                        ================================= */}

                    {request.status === "PENDING" && (
                      <Stack
                        direction="row"
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <Button
                          variant="outlined"
                          color="error"
                          disabled={processingReview}
                          startIcon={<CancelOutlinedIcon />}
                          onClick={() => handleReject(request)}
                        >
                          Reject
                        </Button>

                        <Button
                          variant="contained"
                          color="success"
                          disabled={processingReview}
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApprove(request)}
                        >
                          Approve
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* =============================================
                EMPTY STATE
            ============================================= */}

          {filteredRequests.length === 0 && (
            <Grid
              size={{
                xs: 12,
              }}
            >
              <Card>
                <CardContent>
                  <Box
                    sx={{
                      py: 6,
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="h6" fontWeight={700}>
                      No seat change requests found
                    </Typography>

                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {search
                        ? "No requests match your search."
                        : status !== "ALL"
                          ? `There are no ${status.toLowerCase()} seat change requests.`
                          : "No member has submitted a seat change request yet."}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* ===================================================
          REVIEW DIALOG
      =================================================== */}

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
