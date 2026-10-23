import {
  AccessTimeOutlined,
  Close,
  ErrorOutlineOutlined,
  PersonOutlineOutlined,
  ReceiptLongOutlined,
  WhatsApp,
} from "@mui/icons-material";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

import WhatsAppDeliveryStatusChip from "./WhatsAppDeliveryStatusChip";

// ============================================================
// HELPERS
// ============================================================

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatEnumLabel(value) {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

// ============================================================
// DETAIL ROW
// ============================================================

function DetailRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "grid",

        gridTemplateColumns: {
          xs: "1fr",
          sm: "160px 1fr",
        },

        gap: {
          xs: 0.5,
          sm: 2,
        },

        py: 1.25,
      }}
    >
      <Typography variant="body2" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          wordBreak: "break-word",
        }}
      >
        {value ?? "—"}
      </Typography>
    </Box>
  );
}

// ============================================================
// WHATSAPP MESSAGE DETAILS DIALOG
// ============================================================

function WhatsAppMessageDetailsDialog({
  open = false,

  onClose,

  message = null,
}) {
  if (!message) {
    return null;
  }

  // ==========================================================
  // NORMALIZE COMMON FIELDS
  // ==========================================================

  const status = message.status || message.messageStatus || "PENDING";

  const notificationType = message.notificationType || message.type;

  const recipientPhone = message.recipientPhone || message.phone || message.to;

  const recipientName =
    message.recipientName || message.userName || message.customerName;

  const metaMessageId = message.metaMessageId || message.providerMessageId;

  const referenceType = message.referenceType;

  const referenceId = message.referenceId;

  const attemptCount = message.attemptCount ?? message.attempts ?? 0;

  const lastError =
    message.lastError || message.errorMessage || message.failureReason;

  const createdAt = message.createdAt;

  const sentAt = message.sentAt;

  const deliveredAt = message.deliveredAt;

  const readAt = message.readAt;

  const failedAt = message.failedAt;

  const updatedAt = message.updatedAt;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <WhatsApp
            sx={{
              color: "#25D366",
            }}
          />

          <Box>
            <Typography variant="h6" fontWeight={800}>
              WhatsApp message
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Delivery and message details
            </Typography>
          </Box>
        </Stack>

        <IconButton
          onClick={onClose}
          aria-label="Close"
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
          spacing={3}
          sx={{
            pt: 1,
          }}
        >
          {/* ================================================= */}
          {/* STATUS */}
          {/* ================================================= */}

          <Box>
            <Typography variant="overline" color="text.secondary">
              Current status
            </Typography>

            <Box
              sx={{
                mt: 0.75,
              }}
            >
              <WhatsAppDeliveryStatusChip status={status} />
            </Box>
          </Box>

          <Divider />

          {/* ================================================= */}
          {/* RECIPIENT */}
          {/* ================================================= */}

          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mb: 1,
              }}
            >
              <PersonOutlineOutlined fontSize="small" color="primary" />

              <Typography variant="subtitle2" fontWeight={800}>
                Recipient
              </Typography>
            </Stack>

            <DetailRow label="Name" value={recipientName} />

            <DetailRow label="Phone" value={recipientPhone} />
          </Box>

          <Divider />

          {/* ================================================= */}
          {/* MESSAGE */}
          {/* ================================================= */}

          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mb: 1,
              }}
            >
              <ReceiptLongOutlined fontSize="small" color="primary" />

              <Typography variant="subtitle2" fontWeight={800}>
                Message
              </Typography>
            </Stack>

            <DetailRow
              label="Notification"
              value={formatEnumLabel(notificationType)}
            />

            <DetailRow
              label="Reference type"
              value={formatEnumLabel(referenceType)}
            />

            <DetailRow label="Reference ID" value={referenceId} />

            <DetailRow label="Meta message ID" value={metaMessageId} />

            <DetailRow label="Attempts" value={attemptCount} />
          </Box>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {lastError && (
            <>
              <Divider />

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mb: 1,
                  }}
                >
                  <ErrorOutlineOutlined fontSize="small" color="error" />

                  <Typography
                    variant="subtitle2"
                    fontWeight={800}
                    color="error.main"
                  >
                    Failure details
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    p: 2,

                    borderRadius: 2,

                    backgroundColor: "rgba(211, 47, 47, 0.06)",

                    border: "1px solid",

                    borderColor: "rgba(211, 47, 47, 0.15)",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="error.main"
                    sx={{
                      whiteSpace: "pre-wrap",

                      wordBreak: "break-word",
                    }}
                  >
                    {lastError}
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          <Divider />

          {/* ================================================= */}
          {/* TIMELINE */}
          {/* ================================================= */}

          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mb: 1,
              }}
            >
              <AccessTimeOutlined fontSize="small" color="primary" />

              <Typography variant="subtitle2" fontWeight={800}>
                Timeline
              </Typography>
            </Stack>

            <DetailRow label="Created" value={formatDateTime(createdAt)} />

            <DetailRow label="Sent" value={formatDateTime(sentAt)} />

            <DetailRow label="Delivered" value={formatDateTime(deliveredAt)} />

            <DetailRow label="Read" value={formatDateTime(readAt)} />

            <DetailRow label="Failed" value={formatDateTime(failedAt)} />

            <DetailRow label="Last updated" value={formatDateTime(updatedAt)} />
          </Box>
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
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default WhatsAppMessageDetailsDialog;
