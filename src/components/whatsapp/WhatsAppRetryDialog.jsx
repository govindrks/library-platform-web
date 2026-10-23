import {
  Close,
  ErrorOutlineOutlined,
  Refresh,
  WarningAmberOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import WhatsAppDeliveryStatusChip from "./WhatsAppDeliveryStatusChip";

// ============================================================
// WHATSAPP RETRY DIALOG
// ============================================================

function WhatsAppRetryDialog({
  open = false,

  message = null,

  loading = false,

  onClose,

  onRetry,
}) {
  // ==========================================================
  // STATE
  // ==========================================================

  const [note, setNote] = useState("");

  const [error, setError] = useState("");

  // ==========================================================
  // RESET WHEN DIALOG OPENS / MESSAGE CHANGES
  // ==========================================================

  useEffect(() => {
    if (open) {
      setNote("");
      setError("");
    }
  }, [open, message]);

  // ==========================================================
  // NORMALIZED VALUES
  // ==========================================================

  const messageId = message?.id ?? message?.messageId ?? null;

  const notificationType = message?.notificationType || message?.type || "—";

  const recipientPhone =
    message?.recipientPhone || message?.phone || message?.to || "—";

  const status = message?.status || message?.messageStatus || "FAILED";

  const attemptCount = Number(message?.attemptCount ?? message?.attempts ?? 0);

  const lastError =
    message?.lastError ||
    message?.errorMessage ||
    message?.failureReason ||
    null;

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatEnumLabel = (value) => {
    if (!value) {
      return "—";
    }

    return String(value)
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  };

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry = async () => {
    setError("");

    if (!messageId) {
      setError("Message ID is missing. This message cannot be retried.");

      return;
    }

    if (!onRetry) {
      setError("Retry action is not available.");

      return;
    }

    try {
      await onRetry({
        messageId,
        note: note.trim() || null,
      });
    } catch (exception) {
      setError(
        exception?.response?.data?.message ||
          exception?.response?.data?.error ||
          exception?.message ||
          "Unable to retry the WhatsApp message.",
      );
    }
  };

  // ==========================================================
  // CLOSE
  // ==========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose?.();
  };

  // ==========================================================
  // NO MESSAGE
  // ==========================================================

  if (!message) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 3,
        },
      }}
    >
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <DialogTitle
        sx={{
          pr: 7,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 40,

              height: 40,

              borderRadius: 2,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              backgroundColor: "rgba(237, 108, 2, 0.08)",
            }}
          >
            <Refresh color="warning" />
          </Box>

          <Box>
            <Typography variant="h6" fontWeight={800}>
              Retry WhatsApp message
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Review the failure before retrying.
            </Typography>
          </Box>
        </Stack>

        <IconButton
          aria-label="Close"
          disabled={loading}
          onClick={handleClose}
          sx={{
            position: "absolute",

            right: 12,

            top: 12,
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <Divider />

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <DialogContent>
        <Stack
          spacing={2.5}
          sx={{
            pt: 1,
          }}
        >
          {/* ================================================= */}
          {/* WARNING */}
          {/* ================================================= */}

          <Alert severity="warning" icon={<WarningAmberOutlined />}>
            Retry only when the previous send is known to have failed. Avoid
            manually retrying uncertain submissions that may already have been
            accepted by the provider.
          </Alert>

          {/* ================================================= */}
          {/* MESSAGE SUMMARY */}
          {/* ================================================= */}

          <Box
            sx={{
              border: "1px solid",

              borderColor: "divider",

              borderRadius: 2.5,

              p: 2,
            }}
          >
            <Stack spacing={1.5}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
              >
                <Typography variant="body2" color="text.secondary">
                  Status
                </Typography>

                <WhatsAppDeliveryStatusChip status={status} />
              </Stack>

              <Divider />

              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Notification
                </Typography>

                <Typography variant="body2" fontWeight={700} textAlign="right">
                  {formatEnumLabel(notificationType)}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Recipient
                </Typography>

                <Typography variant="body2" fontWeight={700} textAlign="right">
                  {recipientPhone}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Attempts
                </Typography>

                <Typography variant="body2" fontWeight={700}>
                  {attemptCount}
                </Typography>
              </Stack>
            </Stack>
          </Box>

          {/* ================================================= */}
          {/* LAST ERROR */}
          {/* ================================================= */}

          {lastError && (
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mb: 1,
                }}
              >
                <ErrorOutlineOutlined color="error" fontSize="small" />

                <Typography
                  variant="subtitle2"
                  color="error.main"
                  fontWeight={800}
                >
                  Previous failure
                </Typography>
              </Stack>

              <Box
                sx={{
                  p: 2,

                  borderRadius: 2,

                  backgroundColor: "rgba(211, 47, 47, 0.05)",

                  border: "1px solid",

                  borderColor: "rgba(211, 47, 47, 0.15)",
                }}
              >
                <Typography
                  variant="body2"
                  color="error.main"
                  sx={{
                    wordBreak: "break-word",

                    whiteSpace: "pre-wrap",
                  }}
                >
                  {lastError}
                </Typography>
              </Box>
            </Box>
          )}

          {/* ================================================= */}
          {/* RETRY NOTE */}
          {/* ================================================= */}

          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={6}
            label="Retry note"
            placeholder="Optional internal note explaining why this message is being retried."
            value={note}
            disabled={loading}
            onChange={(event) => setNote(event.target.value)}
            inputProps={{
              maxLength: 500,
            }}
            helperText={`${note.length}/500 characters`}
          />

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>

      <Divider />

      {/* ===================================================== */}
      {/* ACTIONS */}
      {/* ===================================================== */}

      <DialogActions
        sx={{
          px: 3,

          py: 2,
        }}
      >
        <Button
          type="button"
          color="inherit"
          disabled={loading}
          onClick={handleClose}
        >
          Cancel
        </Button>

        <Button
          type="button"
          variant="contained"
          color="warning"
          disabled={loading || !messageId}
          startIcon={
            loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <Refresh />
            )
          }
          onClick={handleRetry}
        >
          {loading ? "Retrying..." : "Retry message"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WhatsAppRetryDialog;
