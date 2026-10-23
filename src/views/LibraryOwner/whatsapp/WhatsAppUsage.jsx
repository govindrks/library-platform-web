import { Refresh, WhatsApp } from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import WhatsAppUsageCard from "../../../components/whatsapp/WhatsAppUsageCard";

import whatsappMessagesApi from "../../../api/whatsappMessagesApi";

// ============================================================
// CONSTANTS
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const PERIOD_OPTIONS = [
  {
    value: "TODAY",
    label: "Today",
  },

  {
    value: "LAST_7_DAYS",
    label: "Last 7 days",
  },

  {
    value: "THIS_MONTH",
    label: "This month",
  },

  {
    value: "LAST_30_DAYS",
    label: "Last 30 days",
  },
];

// ============================================================
// HELPERS
// ============================================================

function getStoredLibraryId() {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
}

function normalizeUsage(source) {
  const data = source?.data ?? source ?? {};

  return {
    totalMessages: Number(data.totalMessages ?? data.total ?? 0),

    sentMessages: Number(data.sentMessages ?? data.sent ?? 0),

    deliveredMessages: Number(data.deliveredMessages ?? data.delivered ?? 0),

    readMessages: Number(data.readMessages ?? data.read ?? 0),

    failedMessages: Number(data.failedMessages ?? data.failed ?? 0),

    pendingMessages: Number(data.pendingMessages ?? data.pending ?? 0),

    usageLimit: data.usageLimit ?? null,
  };
}

// ============================================================
// WHATSAPP USAGE PAGE
// ============================================================

function WhatsAppUsage() {
  // ==========================================================
  // LIBRARY
  // ==========================================================

  const libraryId = useMemo(() => getStoredLibraryId(), []);

  // ==========================================================
  // STATE
  // ==========================================================

  const [period, setPeriod] = useState("THIS_MONTH");

  const [usage, setUsage] = useState(normalizeUsage({}));

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD USAGE
  // ==========================================================

  const loadUsage = useCallback(async () => {
    if (!libraryId) {
      setError("No library is currently selected.");

      return;
    }

    try {
      setLoading(true);

      setError("");

      /*
       * TEMPORARY IMPLEMENTATION
       *
       * Until a dedicated usage endpoint exists,
       * retrieve message data and derive summary
       * values from the returned records.
       *
       * Later this can be replaced by:
       *
       * GET
       * /api/whatsapp/usage/libraries/{libraryId}
       */

      const response = await whatsappMessagesApi.getLibraryMessages({
        libraryId,
        page: 0,
        size: 500,
      });

      const data = response?.data ?? response ?? {};

      const messages = Array.isArray(data)
        ? data
        : (data.content ?? data.messages ?? []);

      const totals = {
        totalMessages: messages.length,

        sentMessages: 0,

        deliveredMessages: 0,

        readMessages: 0,

        failedMessages: 0,

        pendingMessages: 0,

        usageLimit: null,
      };

      messages.forEach((message) => {
        const status = String(message.status ?? message.messageStatus ?? "")
          .trim()
          .toUpperCase();

        if (status === "FAILED") {
          totals.failedMessages += 1;

          return;
        }

        if (status === "PENDING" || status === "SENDING") {
          totals.pendingMessages += 1;

          return;
        }

        if (status === "READ") {
          totals.readMessages += 1;

          totals.deliveredMessages += 1;

          totals.sentMessages += 1;

          return;
        }

        if (status === "DELIVERED") {
          totals.deliveredMessages += 1;

          totals.sentMessages += 1;

          return;
        }

        if (status === "SENT") {
          totals.sentMessages += 1;
        }
      });

      setUsage(totals);
    } catch (exception) {
      setError(
        exception?.response?.data?.message ||
          exception?.response?.data?.error ||
          exception?.message ||
          "Unable to load WhatsApp usage.",
      );
    } finally {
      setLoading(false);
    }
  }, [libraryId, period]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: 1100,

        mx: "auto",

        p: {
          xs: 2,

          md: 3,
        },
      }}
    >
      <Stack spacing={3}>
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <Stack
          direction={{
            xs: "column",

            sm: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "flex-start",

            sm: "center",
          }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <WhatsApp
              sx={{
                color: "#25D366",

                fontSize: 30,
              }}
            />

            <Box>
              <Typography variant="h4" fontWeight={800}>
                WhatsApp Usage
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Monitor WhatsApp notification activity for your selected
                library.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <TextField
              select
              size="small"
              label="Period"
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              sx={{
                minWidth: 170,
              }}
            >
              {PERIOD_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <Button
              variant="outlined"
              disabled={loading}
              startIcon={<Refresh />}
              onClick={loadUsage}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {/* ================================================= */}
        {/* INFO */}
        {/* ================================================= */}

        <Alert severity="info">
          Usage reporting is ready for frontend integration. Live message
          statistics will become meaningful after Meta WhatsApp delivery is
          enabled.
        </Alert>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <Box
            sx={{
              display: "flex",

              justifyContent: "center",

              py: 4,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* ================================================= */}
        {/* USAGE */}
        {/* ================================================= */}

        {!loading && (
          <WhatsAppUsageCard
            title="WhatsApp message usage"
            subtitle={
              PERIOD_OPTIONS.find((option) => option.value === period)?.label ??
              "Selected period"
            }
            totalMessages={usage.totalMessages}
            sentMessages={usage.sentMessages}
            deliveredMessages={usage.deliveredMessages}
            readMessages={usage.readMessages}
            failedMessages={usage.failedMessages}
            usageLimit={usage.usageLimit}
          />
        )}

        {/* ================================================= */}
        {/* PENDING */}
        {/* ================================================= */}

        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              Queue status
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Messages waiting to be processed or currently being dispatched.
            </Typography>

            <Divider
              sx={{
                my: 2,
              }}
            />

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" fontWeight={600}>
                Pending / processing
              </Typography>

              <Typography variant="h5" fontWeight={800}>
                {usage.pendingMessages}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* ================================================= */}
        {/* CURRENT BILLING POLICY */}
        {/* ================================================= */}

        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              WhatsApp billing
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.75,
              }}
            >
              WhatsApp infrastructure is centrally managed by LibraryHub.
              Individual library owners do not need to configure Meta
              credentials from this page.
            </Typography>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}

export default WhatsAppUsage;
