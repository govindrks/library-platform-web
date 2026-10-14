import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { ArrowBack, EventSeat, Send, SwapHoriz } from "@mui/icons-material";

import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import studentSeatApi from "../../../api/studentSeatApi";
import studentSeatChangeApi from "../../../api/studentSeatChangeApi";
import studentSubscriptionApi from "../../../api/studentSubscriptionApi";

// ============================================================
// COMPONENT
// ============================================================

function SeatChangeRequest() {
  // ==========================================================
  // ROUTER
  // ==========================================================

  const location = useLocation();

  const navigate = useNavigate();

  // ==========================================================
  // NOTIFICATION SAFETY
  // ==========================================================

  const fromNotification = Boolean(location.state?.fromNotification);

  const notificationReferenceType =
    location.state?.notificationReferenceType ?? null;

  /*
   * This component is the seat-change REQUEST CREATION form.
   *
   * Approved/rejected notification deep links belong to the
   * student's seat-change history page:
   *
   * /student/seat-change
   *
   * If this creation page is ever opened accidentally with a
   * SEAT_CHANGE_REQUEST notification state, forward the user to
   * the history page while preserving the navigation state.
   */

  useEffect(() => {
    if (!fromNotification) {
      return;
    }

    if (notificationReferenceType !== "SEAT_CHANGE_REQUEST") {
      return;
    }

    if (location.pathname === "/student/seat-change") {
      return;
    }

    navigate("/student/seat-change", {
      replace: true,
      state: location.state,
    });
  }, [
    fromNotification,
    notificationReferenceType,
    location.pathname,
    location.state,
    navigate,
  ]);

  // ==========================================================
  // STATE
  // ==========================================================

  const [subscription, setSubscription] = useState(null);

  const [seats, setSeats] = useState([]);

  const [selectedSeat, setSelectedSeat] = useState(null);

  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [submittedRequest, setSubmittedRequest] = useState(null);

  // ==========================================================
  // LOAD SUBSCRIPTION + AVAILABLE SEATS
  // ==========================================================

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        setError("");

        const subscriptionResponse =
          await studentSubscriptionApi.getMySubscription();

        setSubscription(subscriptionResponse);

        if (!subscriptionResponse?.libraryId) {
          throw new Error(
            "Library ID is unavailable for the active membership.",
          );
        }

        const seatResponse = await studentSeatApi.getAvailableSeats(
          subscriptionResponse.libraryId,
        );

        setSeats(Array.isArray(seatResponse) ? seatResponse : []);
      } catch (requestError) {
        console.error("Failed to load seat change data:", requestError);

        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load seat change information.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async () => {
    if (!selectedSeat) {
      setError("Please select a new seat.");

      return;
    }

    const trimmedReason = reason.trim();

    if (!trimmedReason) {
      setError("Please enter a reason for changing your seat.");

      return;
    }

    if (!subscription?.subscriptionId) {
      setError("Active subscription ID is unavailable.");

      return;
    }

    try {
      setSubmitting(true);

      setError("");

      const response = await studentSeatChangeApi.submitRequest({
        subscriptionId: subscription.subscriptionId,

        requestedSeatId: selectedSeat.id,

        reason: trimmedReason,
      });

      setSubmittedRequest({
        ...response,

        reason: trimmedReason,
      });
    } catch (requestError) {
      console.error("Seat change request failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.message ||
          "Unable to submit seat change request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Stack
        alignItems="center"
        spacing={2}
        sx={{
          py: 8,
        }}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading available seats...
        </Typography>
      </Stack>
    );
  }

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (submittedRequest) {
    return (
      <Box
        sx={{
          maxWidth: 680,

          mx: "auto",
        }}
      >
        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
              alignItems="center"
              spacing={1.5}
              sx={{
                py: 2,
              }}
            >
              <Box
                sx={{
                  width: 72,

                  height: 72,

                  borderRadius: "50%",

                  bgcolor: "primary.light",

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >
                <Send
                  color="primary"
                  sx={{
                    fontSize: 38,
                  }}
                />
              </Box>

              <Typography variant="h5" fontWeight={800} textAlign="center">
                Seat Change Request Submitted
              </Typography>

              <Typography color="text.secondary" textAlign="center">
                Your request has been sent to the library owner for review.
              </Typography>
            </Stack>

            <Stack
              spacing={1.5}
              sx={{
                mt: 3,
              }}
            >
              <SummaryRow
                label="Request ID"
                value={submittedRequest.requestId}
              />

              <SummaryRow
                label="Current Seat"
                value={submittedRequest.currentSeat}
              />

              <SummaryRow
                label="Requested Seat"
                value={submittedRequest.requestedSeat}
              />

              <SummaryRow label="Reason" value={submittedRequest.reason} />

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography color="text.secondary">Status</Typography>

                <Chip
                  size="small"
                  color="warning"
                  label={submittedRequest.status || "PENDING"}
                />
              </Stack>
            </Stack>

            <Button
              fullWidth
              variant="outlined"
              sx={{
                mt: 3,
              }}
              onClick={() =>
                navigate("/student/seat-change", {
                  state: {
                    fromSeatChangeSubmission: true,

                    submittedRequestId: submittedRequest.requestId ?? null,
                  },
                })
              }
            >
              Back to Seat Change Requests
            </Button>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ==========================================================
  // MAIN FORM
  // ==========================================================

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/student/membership")}
        sx={{
          mb: 2,
        }}
      >
        Back
      </Button>

      <Typography variant="h4" fontWeight={800}>
        Request Seat Change
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.5,

          mb: 3,
        }}
      >
        Choose another available seat in your current library.
      </Typography>

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
      {/* CURRENT SEAT */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,

          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            Current Seat
          </Typography>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mt: 1,
            }}
          >
            <EventSeat color="primary" />

            <Typography variant="h4" fontWeight={800}>
              {subscription?.seatNumber || "-"}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* NEW SEAT */}
      {/* ===================================================== */}

      <Typography
        variant="h6"
        fontWeight={700}
        sx={{
          mb: 2,
        }}
      >
        Select New Seat
      </Typography>

      {seats.length === 0 ? (
        <Alert severity="info">
          No alternative seats are currently available.
        </Alert>
      ) : (
        <Grid container spacing={1.5}>
          {seats.map((seat) => {
            const selected = selectedSeat?.id === seat.id;

            return (
              <Grid
                key={seat.id}
                size={{
                  xs: 6,

                  sm: 4,

                  md: 3,

                  lg: 2,
                }}
              >
                <Button
                  fullWidth
                  variant={selected ? "contained" : "outlined"}
                  startIcon={<EventSeat />}
                  onClick={() => setSelectedSeat(seat)}
                  sx={{
                    minHeight: 72,

                    flexDirection: "column",
                  }}
                >
                  {seat.seatNumber}
                </Button>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ===================================================== */}
      {/* SELECTED SEAT SUMMARY */}
      {/* ===================================================== */}

      {selectedSeat && (
        <Card
          elevation={0}
          sx={{
            mt: 3,

            border: "1px solid",

            borderColor: "primary.main",

            borderRadius: 3,
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={2}
            >
              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Current Seat
                </Typography>

                <Typography variant="h6" fontWeight={800}>
                  {subscription?.seatNumber || "-"}
                </Typography>
              </Box>

              <SwapHoriz color="primary" />

              <Box textAlign="center">
                <Typography variant="caption" color="text.secondary">
                  Requested Seat
                </Typography>

                <Typography variant="h6" fontWeight={800} color="primary.main">
                  {selectedSeat.seatNumber}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ===================================================== */}
      {/* REASON */}
      {/* ===================================================== */}

      <TextField
        fullWidth
        required
        multiline
        minRows={5}
        label="Reason for Seat Change"
        placeholder="Example: Need a quieter seat."
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        slotProps={{
          htmlInput: {
            maxLength: 200,
          },
        }}
        helperText={`${reason.length}/200`}
        sx={{
          mt: 3,
        }}
      />

      <Button
        fullWidth
        size="large"
        variant="contained"
        startIcon={<Send />}
        disabled={submitting || !selectedSeat || !reason.trim()}
        onClick={handleSubmit}
        sx={{
          mt: 2,
        }}
      >
        {submitting ? "Submitting..." : "Submit Request"}
      </Button>
    </Box>
  );
}

// ============================================================
// SUMMARY ROW
// ============================================================

function SummaryRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography color="text.secondary">{label}</Typography>

      <Typography fontWeight={600} textAlign="right">
        {value || "-"}
      </Typography>
    </Stack>
  );
}

export default SeatChangeRequest;
