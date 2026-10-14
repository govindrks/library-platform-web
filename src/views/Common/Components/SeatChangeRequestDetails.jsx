import React from "react";

import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import SeatChangeRequestStatus
  from "./SeatChangeRequestStatus";

// ============================================================
// SEAT CHANGE REQUEST DETAILS
// ============================================================

function SeatChangeRequestDetails({ request, open, onClose }) {
  if (!request) {
    return null;
  }

  // ==========================================================
  // DATE FORMATTER
  // ==========================================================

  const formatDateTime = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString();
  };

  // ==========================================================
  // REQUEST VALUES
  // ==========================================================

  const requestId = request.id ?? request.requestId ?? "-";

  const libraryName = request.libraryName ?? request.library?.name ?? "-";

  const currentSeatNumber =
    request.currentSeatNumber ?? request.currentSeat?.number ?? "-";

  const requestedSeatNumber =
    request.requestedSeatNumber ?? request.requestedSeat?.number ?? "-";

  const reason = request.reason || "-";

  const ownerComment = request.ownerComment || null;

  const requestedAt = request.requestedAt ?? request.createdAt ?? null;

  const reviewedAt = request.reviewedAt ?? null;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Dialog open={Boolean(open)} onClose={onClose} fullWidth maxWidth="sm">
      {/* ===================================================== */}
      {/* TITLE */}
      {/* ===================================================== */}

      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Typography variant="h6" fontWeight={700}>
            Seat Change Request
          </Typography>

          <IconButton onClick={onClose} aria-label="Close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <DialogContent>
        <Stack spacing={3}>
          {/* ================================================= */}
          {/* REQUEST HEADER */}
          {/* ================================================= */}

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
            spacing={1}
          >
            <Typography variant="body2" color="text.secondary">
              Request #{requestId}
            </Typography>

            <SeatChangeRequestStatus status={request.status} />
          </Stack>

          <Divider />

          {/* ================================================= */}
          {/* LIBRARY */}
          {/* ================================================= */}

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Library
            </Typography>

            <Typography fontWeight={600}>{libraryName}</Typography>
          </Stack>

          {/* ================================================= */}
          {/* SEAT CHANGE */}
          {/* ================================================= */}

          <Stack direction="row" spacing={3} alignItems="center">
            <Box>
              <Typography variant="caption" color="text.secondary">
                Current Seat
              </Typography>

              <Typography variant="h5" fontWeight={700}>
                {currentSeatNumber}
              </Typography>
            </Box>

            <ArrowForwardIcon color="action" />

            <Box>
              <Typography variant="caption" color="text.secondary">
                Requested Seat
              </Typography>

              <Typography variant="h5" fontWeight={700}>
                {requestedSeatNumber}
              </Typography>
            </Box>
          </Stack>

          {/* ================================================= */}
          {/* REASON */}
          {/* ================================================= */}

          <Stack spacing={1}>
            <Typography variant="body2" color="text.secondary">
              Reason
            </Typography>

            <Typography>{reason}</Typography>
          </Stack>

          {/* ================================================= */}
          {/* OWNER COMMENT */}
          {/* ================================================= */}

          {ownerComment && (
            <Stack spacing={1}>
              <Typography variant="body2" color="text.secondary">
                Owner Comment
              </Typography>

              <Typography>{ownerComment}</Typography>
            </Stack>
          )}

          {/* ================================================= */}
          {/* REQUESTED AT */}
          {/* ================================================= */}

          <Stack spacing={0.5}>
            <Typography variant="caption" color="text.secondary">
              Requested At
            </Typography>

            <Typography variant="body2">
              {formatDateTime(requestedAt)}
            </Typography>
          </Stack>

          {/* ================================================= */}
          {/* REVIEWED AT */}
          {/* ================================================= */}

          {reviewedAt && (
            <Stack spacing={0.5}>
              <Typography variant="caption" color="text.secondary">
                Reviewed At
              </Typography>

              <Typography variant="body2">
                {formatDateTime(reviewedAt)}
              </Typography>
            </Stack>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default SeatChangeRequestDetails;
