import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  ArrowForwardRounded,
  CancelOutlined,
  CheckCircleRounded,
  CloseRounded,
  EventSeatRounded,
  InfoOutlined,
  PersonRounded,
  SwapHorizRounded,
} from "@mui/icons-material";

const MAX_COMMENT_LENGTH = 500;

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "M";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

function SeatCard({ label, seatNumber, tone = "default" }) {
  const isPrimary = tone === "primary";

  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        minWidth: 0,
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: isPrimary ? "rgba(79,70,229,0.28)" : "divider",
        background: isPrimary
          ? "linear-gradient(145deg, rgba(79,70,229,0.08), #ffffff)"
          : "linear-gradient(145deg, rgba(248,250,252,0.96), #ffffff)",
      }}
    >
      <Stack spacing={0.8} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isPrimary ? "primary.main" : "rgba(15,23,42,0.06)",
            color: isPrimary ? "primary.contrastText" : "text.secondary",
          }}
        >
          <EventSeatRounded />
        </Box>

        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          {label}
        </Typography>

        <Typography
          variant="h5"
          fontWeight={800}
          color={isPrimary ? "primary.main" : "text.primary"}
        >
          {seatNumber || "—"}
        </Typography>
      </Stack>
    </Paper>
  );
}

function OwnerReviewDialog({
  open,
  request,
  action,
  onClose,
  onConfirm,
  confirming = false,
}) {
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setComment("");
    setError("");
    setSubmitting(false);
  }, [open, request, action]);

  const isApprove = action === "APPROVE";
  const isReject = action === "REJECT";
  const isBusy = confirming || submitting;

  const memberName =
    request?.userName ||
    request?.memberName ||
    request?.studentName ||
    "Member";

  const profileImageUrl =
    request?.profileImageUrl ||
    request?.userProfileImageUrl ||
    request?.memberProfileImageUrl ||
    "";

  const progress = useMemo(() => {
    if (!isReject) {
      return 100;
    }

    const length = comment.trim().length;

    if (length === 0) {
      return 0;
    }

    return Math.min(100, Math.max(18, Math.round((length / 80) * 100)));
  }, [comment, isReject]);

  if (!request) {
    return null;
  }

  const handleClose = () => {
    if (isBusy) {
      return;
    }

    setError("");
    onClose?.();
  };

  const handleConfirm = async () => {
    const normalizedComment = comment.trim();

    if (isReject && !normalizedComment) {
      setError("Please provide a reason for rejecting this request.");
      return;
    }

    if (normalizedComment.length > MAX_COMMENT_LENGTH) {
      setError(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters.`);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await onConfirm?.({
        requestId: request.id,
        status: isApprove ? "APPROVED" : "REJECTED",
        ownerComment: normalizedComment,
      });
    } catch (confirmError) {
      setError(
        confirmError?.response?.data?.message ||
          confirmError?.response?.data?.error ||
          confirmError?.message ||
          "Unable to process this seat change request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(79,70,229,0.12)",
          boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: { xs: 2.5, sm: 3 },
            position: "relative",
            overflow: "hidden",
            background: isApprove
              ? "linear-gradient(135deg, rgba(34,197,94,0.10), rgba(255,255,255,1) 58%, rgba(79,70,229,0.05))"
              : "linear-gradient(135deg, rgba(239,68,68,0.08), rgba(255,255,255,1) 58%, rgba(245,158,11,0.05))",
            "&::after": {
              content: '\"\"',
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              right: -80,
              top: -110,
              bgcolor: isApprove
                ? "rgba(34,197,94,0.06)"
                : "rgba(239,68,68,0.05)",
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={1.7} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  minWidth: 52,
                  borderRadius: 2.7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isApprove ? "success.main" : "error.main",
                  color: "common.white",
                  boxShadow: isApprove
                    ? "0 10px 26px rgba(34,197,94,0.22)"
                    : "0 10px 26px rgba(239,68,68,0.20)",
                }}
              >
                {isApprove ? <CheckCircleRounded /> : <CancelOutlined />}
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ letterSpacing: "-0.02em" }}
                >
                  {isApprove ? "Approve Seat Change" : "Reject Seat Change"}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{ mt: 0.5 }}
                >
                  <Chip
                    size="small"
                    label={`Request #${request.id}`}
                    variant="outlined"
                  />

                  {request.status && (
                    <Chip
                      size="small"
                      label={request.status}
                      color="warning"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>
            </Stack>

            <Tooltip title="Close">
              <span>
                <IconButton
                  onClick={handleClose}
                  disabled={isBusy}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.78)",
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <CloseRounded />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: "28px !important",
        }}
      >
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.4,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              background:
                "linear-gradient(145deg, #ffffff 0%, rgba(248,250,252,0.96) 100%)",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  src={profileImageUrl || undefined}
                  alt={memberName}
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: "rgba(79,70,229,0.10)",
                    color: "primary.main",
                    fontWeight: 800,
                    border: "2px solid",
                    borderColor: "background.paper",
                  }}
                >
                  {!profileImageUrl ? getInitials(memberName) : null}
                </Avatar>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    MEMBER
                  </Typography>

                  <Typography variant="h6" fontWeight={800}>
                    {memberName}
                  </Typography>

                  {(request.userEmail || request.memberEmail) && (
                    <Typography variant="body2" color="text.secondary">
                      {request.userEmail || request.memberEmail}
                    </Typography>
                  )}
                </Box>
              </Stack>

              <Chip
                icon={<SwapHorizRounded />}
                label="Seat transfer request"
                variant="outlined"
                color="primary"
              />
            </Stack>
          </Paper>

          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.4 }}>
              Requested seat change
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="stretch"
            >
              <SeatCard
                label="Current Seat"
                seatNumber={request.currentSeatNumber}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: { xs: 0, sm: 0.5 },
                }}
              >
                <ArrowForwardRounded
                  color="action"
                  sx={{
                    transform: {
                      xs: "rotate(90deg)",
                      sm: "none",
                    },
                  }}
                />
              </Box>

              <SeatCard
                label="Requested Seat"
                seatNumber={request.requestedSeatNumber}
                tone="primary"
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              fontWeight={700}
            >
              Member's reason
            </Typography>

            <Paper
              elevation={0}
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 2.5,
                bgcolor: "rgba(248,250,252,0.78)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.7,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {request.reason || "No reason provided."}
              </Typography>
            </Paper>
          </Box>

          {isApprove && (
            <Alert
              severity="info"
              icon={<InfoOutlined />}
              sx={{ borderRadius: 2.5 }}
            >
              Approving this request will move the member from{" "}
              <strong>{request.currentSeatNumber}</strong> to{" "}
              <strong>{request.requestedSeatNumber}</strong>. The booking will
              be updated after confirmation.
            </Alert>
          )}

          {isReject && (
            <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
              Rejecting this request keeps the member on{" "}
              <strong>{request.currentSeatNumber}</strong>. A rejection reason
              is required.
            </Alert>
          )}

          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1" fontWeight={800}>
                {isReject ? "Rejection reason" : "Owner comment"}
              </Typography>

              <Typography
                variant="caption"
                color={
                  comment.length >= 450 ? "warning.main" : "text.secondary"
                }
              >
                {comment.length}/{MAX_COMMENT_LENGTH}
              </Typography>
            </Stack>

            <TextField
              fullWidth
              multiline
              minRows={4}
              maxRows={7}
              required={isReject}
              value={comment}
              disabled={isBusy}
              placeholder={
                isReject
                  ? "Explain why this seat change request cannot be approved..."
                  : "Add an optional note for the member..."
              }
              onChange={(event) => {
                setComment(event.target.value);
                setError("");
              }}
              inputProps={{ maxLength: MAX_COMMENT_LENGTH }}
              error={Boolean(error)}
            />

            {isReject && (
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  mt: 1.2,
                  height: 5,
                  borderRadius: 999,
                }}
              />
            )}
          </Box>

          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{ borderRadius: 2.5 }}
            >
              {error}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: 2.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(248,250,252,0.72)",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Button
          color="inherit"
          onClick={handleClose}
          disabled={isBusy}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          color={isApprove ? "success" : "error"}
          disableElevation
          onClick={handleConfirm}
          disabled={isBusy || (isReject && !comment.trim())}
          startIcon={
            isBusy ? (
              <CircularProgress size={17} color="inherit" />
            ) : isApprove ? (
              <CheckCircleRounded />
            ) : (
              <CancelOutlined />
            )
          }
          sx={{
            minWidth: 180,
            minHeight: 44,
            px: 2.7,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 800,
            boxShadow: isApprove
              ? "0 8px 18px rgba(34,197,94,0.18)"
              : "0 8px 18px rgba(239,68,68,0.16)",
          }}
        >
          {isBusy
            ? isApprove
              ? "Approving..."
              : "Rejecting..."
            : isApprove
              ? "Confirm Approval"
              : "Confirm Rejection"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default OwnerReviewDialog;
