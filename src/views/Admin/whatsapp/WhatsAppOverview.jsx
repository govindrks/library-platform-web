import {
  BusinessOutlined,
  ErrorOutlineOutlined,
  MessageOutlined,
  Refresh,
  WhatsApp,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";

import whatsappAdminApi from "../../../api/whatsappAdminApi";

import WhatsAppUsageCard from "../../../components/whatsapp/WhatsAppUsageCard";

// ============================================================
// PERIOD OPTIONS
// ============================================================

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
// SUMMARY CARD
// ============================================================

function SummaryCard({ icon: Icon, title, value, helperText }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",

        border: "1px solid",

        borderColor: "divider",

        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 42,

              height: 42,

              borderRadius: 2,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              backgroundColor: "action.hover",
            }}
          >
            <Icon fontSize="small" />
          </Box>

          <Box>
            <Typography variant="h5" fontWeight={800}>
              {new Intl.NumberFormat("en-IN").format(Number(value ?? 0))}
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                mt: 0.25,
              }}
            >
              {title}
            </Typography>

            {helperText && (
              <Typography variant="caption" color="text.secondary">
                {helperText}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// NORMALIZE OVERVIEW
// ============================================================

function normalizeOverview(source) {
  const data = source?.data ?? source ?? {};

  return {
    totalMessages: Number(data.totalMessages ?? 0),

    sentMessages: Number(data.sentMessages ?? 0),

    deliveredMessages: Number(data.deliveredMessages ?? 0),

    readMessages: Number(data.readMessages ?? 0),

    failedMessages: Number(data.failedMessages ?? 0),

    pendingMessages: Number(data.pendingMessages ?? 0),

    activeLibraries: Number(data.activeLibraries ?? data.enabledLibraries ?? 0),

    totalLibraries: Number(data.totalLibraries ?? 0),

    templates: Number(data.templates ?? data.templateCount ?? 0),

    usageLimit: data.usageLimit ?? null,
  };
}

// ============================================================
// ADMIN WHATSAPP OVERVIEW
// ============================================================

function WhatsAppOverview() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [period, setPeriod] = useState("THIS_MONTH");

  const [overview, setOverview] = useState(normalizeOverview({}));

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD OVERVIEW
  // ==========================================================

  const loadOverview = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await whatsappAdminApi.getOverview({
        period,
      });

      setOverview(normalizeOverview(response));
    } catch (exception) {
      setError(
        exception?.response?.data?.message ||
          exception?.response?.data?.error ||
          exception?.message ||
          "Unable to load WhatsApp overview.",
      );
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

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

                fontSize: 32,
              }}
            />

            <Box>
              <Typography variant="h4" fontWeight={800}>
                WhatsApp Overview
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Platform-wide WhatsApp delivery, usage and failure monitoring.
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
              onClick={loadOverview}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {/* ================================================= */}
        {/* INFO */}
        {/* ================================================= */}

        <Alert severity="info">
          Meta WhatsApp Cloud API is not active yet. This dashboard is ready for
          platform-level monitoring once live message delivery is enabled.
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

        {!loading && (
          <>
            {/* =============================================== */}
            {/* PLATFORM KPIs */}
            {/* =============================================== */}

            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,

                  sm: 6,

                  lg: 3,
                }}
              >
                <SummaryCard
                  icon={BusinessOutlined}
                  title="Active libraries"
                  value={overview.activeLibraries}
                  helperText={
                    overview.totalLibraries
                      ? `${overview.activeLibraries} of ${overview.totalLibraries}`
                      : undefined
                  }
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,

                  sm: 6,

                  lg: 3,
                }}
              >
                <SummaryCard
                  icon={MessageOutlined}
                  title="Total messages"
                  value={overview.totalMessages}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,

                  sm: 6,

                  lg: 3,
                }}
              >
                <SummaryCard
                  icon={ErrorOutlineOutlined}
                  title="Failed messages"
                  value={overview.failedMessages}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,

                  sm: 6,

                  lg: 3,
                }}
              >
                <SummaryCard
                  icon={WhatsApp}
                  title="Templates"
                  value={overview.templates}
                />
              </Grid>
            </Grid>

            {/* =============================================== */}
            {/* USAGE */}
            {/* =============================================== */}

            <WhatsAppUsageCard
              title="Platform WhatsApp usage"
              subtitle={
                PERIOD_OPTIONS.find((option) => option.value === period)
                  ?.label ?? "Selected period"
              }
              totalMessages={overview.totalMessages}
              sentMessages={overview.sentMessages}
              deliveredMessages={overview.deliveredMessages}
              readMessages={overview.readMessages}
              failedMessages={overview.failedMessages}
              usageLimit={overview.usageLimit}
            />

            {/* =============================================== */}
            {/* QUEUE */}
            {/* =============================================== */}

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
                  Queue health
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Messages waiting for dispatch or currently being processed.
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
                  <Typography variant="body2" fontWeight={700}>
                    Pending / processing
                  </Typography>

                  <Typography variant="h5" fontWeight={800}>
                    {overview.pendingMessages}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default WhatsAppOverview;
