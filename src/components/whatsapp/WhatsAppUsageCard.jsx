import {
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined,
  MarkChatReadOutlined,
  MessageOutlined,
  SendOutlined,
  WhatsApp,
} from "@mui/icons-material";

import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

// ============================================================
// HELPERS
// ============================================================

function formatNumber(value) {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return new Intl.NumberFormat("en-IN").format(number);
}

function calculatePercentage(value, total) {
  const safeValue = Number(value ?? 0);

  const safeTotal = Number(total ?? 0);

  if (
    !Number.isFinite(safeValue) ||
    !Number.isFinite(safeTotal) ||
    safeTotal <= 0
  ) {
    return 0;
  }

  return Math.min(100, Math.max(0, (safeValue / safeTotal) * 100));
}

// ============================================================
// STAT ITEM
// ============================================================

function UsageStat({
  icon: Icon,

  label,

  value,

  helperText,
}) {
  return (
    <Stack direction="row" spacing={1.25} alignItems="flex-start">
      <Box
        sx={{
          width: 38,

          height: 38,

          borderRadius: 2,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          flexShrink: 0,

          backgroundColor: "action.hover",
        }}
      >
        <Icon fontSize="small" />
      </Box>

      <Box
        sx={{
          minWidth: 0,
        }}
      >
        <Typography variant="h6" fontWeight={800} lineHeight={1.15}>
          {formatNumber(value)}
        </Typography>

        <Typography
          variant="body2"
          fontWeight={600}
          sx={{
            mt: 0.25,
          }}
        >
          {label}
        </Typography>

        {helperText && (
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

// ============================================================
// WHATSAPP USAGE CARD
// ============================================================

function WhatsAppUsageCard({
  title = "WhatsApp usage",

  subtitle = "Message activity for the selected period.",

  totalMessages = 0,

  sentMessages = 0,

  deliveredMessages = 0,

  readMessages = 0,

  failedMessages = 0,

  usageLimit = null,

  loading = false,
}) {
  // ==========================================================
  // DERIVED VALUES
  // ==========================================================

  const deliveryRate = calculatePercentage(deliveredMessages, sentMessages);

  const readRate = calculatePercentage(readMessages, deliveredMessages);

  const failureRate = calculatePercentage(failedMessages, totalMessages);

  const usagePercentage = usageLimit
    ? calculatePercentage(totalMessages, usageLimit)
    : null;

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid",

        borderColor: "divider",

        borderRadius: 3,

        height: "100%",
      }}
    >
      <CardContent
        sx={{
          p: {
            xs: 2.5,

            sm: 3,
          },
        }}
      >
        <Stack spacing={3}>
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <Box
              sx={{
                width: 42,

                height: 42,

                borderRadius: 2,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                backgroundColor: "rgba(37, 211, 102, 0.10)",
              }}
            >
              <WhatsApp
                sx={{
                  color: "#25D366",
                }}
              />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={800}>
                {title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.25,
                }}
              >
                {subtitle}
              </Typography>
            </Box>
          </Stack>

          <Divider />

          {/* ================================================= */}
          {/* USAGE LIMIT */}
          {/* ================================================= */}

          {usageLimit !== null && (
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  mb: 1,
                }}
              >
                <Typography variant="body2" fontWeight={700}>
                  Usage
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {formatNumber(totalMessages)}
                  {" / "}
                  {formatNumber(usageLimit)}
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={usagePercentage}
                sx={{
                  height: 8,

                  borderRadius: 10,
                }}
              />

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",

                  mt: 0.75,
                }}
              >
                {usagePercentage.toFixed(1)}% of the current usage allocation
              </Typography>
            </Box>
          )}

          {/* ================================================= */}
          {/* COUNTERS */}
          {/* ================================================= */}

          <Grid container spacing={2.5}>
            <Grid
              size={{
                xs: 12,

                sm: 6,
              }}
            >
              <UsageStat
                icon={MessageOutlined}
                label="Total messages"
                value={totalMessages}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,

                sm: 6,
              }}
            >
              <UsageStat
                icon={SendOutlined}
                label="Sent"
                value={sentMessages}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,

                sm: 6,
              }}
            >
              <UsageStat
                icon={CheckCircleOutlineOutlined}
                label="Delivered"
                value={deliveredMessages}
                helperText={`${deliveryRate.toFixed(1)}% delivery rate`}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,

                sm: 6,
              }}
            >
              <UsageStat
                icon={MarkChatReadOutlined}
                label="Read"
                value={readMessages}
                helperText={`${readRate.toFixed(1)}% read rate`}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,

                sm: 6,
              }}
            >
              <UsageStat
                icon={ErrorOutlineOutlined}
                label="Failed"
                value={failedMessages}
                helperText={`${failureRate.toFixed(1)}% failure rate`}
              />
            </Grid>
          </Grid>

          {/* ================================================= */}
          {/* LOADING */}
          {/* ================================================= */}

          {loading && (
            <Typography variant="caption" color="text.secondary">
              Loading WhatsApp usage...
            </Typography>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

export default WhatsAppUsageCard;
