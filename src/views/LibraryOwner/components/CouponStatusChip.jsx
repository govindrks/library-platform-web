import { Box, Chip, Tooltip } from "@mui/material";

import {
  CheckCircleRounded,
  DoNotDisturbOnRounded,
  EventBusyRounded,
  RedeemRounded,
} from "@mui/icons-material";

const statusConfig = {
  ACTIVE: {
    label: "Active",
    description: "This coupon is available for eligible member payments.",
    icon: CheckCircleRounded,
    color: "#15803D",
    backgroundColor: "rgba(22, 163, 74, 0.10)",
    borderColor: "rgba(22, 163, 74, 0.24)",
    dotColor: "#22C55E",
  },

  USED: {
    label: "Used",
    description: "This coupon has already been consumed successfully.",
    icon: RedeemRounded,
    color: "#0369A1",
    backgroundColor: "rgba(14, 165, 233, 0.10)",
    borderColor: "rgba(14, 165, 233, 0.24)",
    dotColor: "#0EA5E9",
  },

  EXPIRED: {
    label: "Expired",
    description: "This coupon is outside its configured validity period.",
    icon: EventBusyRounded,
    color: "#64748B",
    backgroundColor: "rgba(100, 116, 139, 0.10)",
    borderColor: "rgba(100, 116, 139, 0.22)",
    dotColor: "#94A3B8",
  },

  DEACTIVATED: {
    label: "Deactivated",
    description: "This coupon was manually deactivated by the library owner.",
    icon: DoNotDisturbOnRounded,
    color: "#B45309",
    backgroundColor: "rgba(245, 158, 11, 0.11)",
    borderColor: "rgba(245, 158, 11, 0.25)",
    dotColor: "#F59E0B",
  },
};

const defaultConfig = {
  label: "Unknown",
  description: "Coupon status is currently unavailable.",
  icon: DoNotDisturbOnRounded,
  color: "#64748B",
  backgroundColor: "rgba(100, 116, 139, 0.08)",
  borderColor: "rgba(100, 116, 139, 0.20)",
  dotColor: "#94A3B8",
};

function CouponStatusChip({
  status,
  showIcon = true,
  showPulse = true,
  interactive = true,
  size = "small",
  sx,
}) {
  const normalizedStatus = String(status || "")
    .trim()
    .toUpperCase();

  const config = statusConfig[normalizedStatus] || {
    ...defaultConfig,
    label: normalizedStatus || defaultConfig.label,
  };

  const StatusIcon = config.icon;

  const chip = (
    <Chip
      size={size}
      icon={showIcon ? <StatusIcon /> : undefined}
      label={
        <Box
          component="span"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          {showPulse && normalizedStatus === "ACTIVE" && (
            <Box
              component="span"
              sx={{
                position: "relative",
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: config.dotColor,
                flexShrink: 0,
                boxShadow: `0 0 0 3px ${config.backgroundColor}`,

                "&::after": {
                  content: '\"\"',
                  position: "absolute",
                  inset: -3,
                  borderRadius: "50%",
                  border: `1px solid ${config.dotColor}`,
                  opacity: 0.45,
                  animation: "coupon-status-pulse 1.8s ease-out infinite",
                },

                "@keyframes coupon-status-pulse": {
                  "0%": {
                    transform: "scale(0.7)",
                    opacity: 0.6,
                  },

                  "70%": {
                    transform: "scale(1.6)",
                    opacity: 0,
                  },

                  "100%": {
                    transform: "scale(1.6)",
                    opacity: 0,
                  },
                },
              }}
            />
          )}

          <Box
            component="span"
            sx={{
              lineHeight: 1,
            }}
          >
            {config.label}
          </Box>
        </Box>
      }
      sx={{
        height: size === "small" ? 30 : 34,

        px: 0.4,
        borderRadius: 999,
        border: "1px solid",
        borderColor: config.borderColor,
        bgcolor: config.backgroundColor,
        color: config.color,
        fontWeight: 800,
        letterSpacing: "0.01em",
        boxShadow: "0 4px 12px rgba(15, 23, 42, 0.04)",
        transition: "all 0.2s ease",

        "& .MuiChip-label": {
          px: 1.05,
          display: "flex",
          alignItems: "center",
        },

        "& .MuiChip-icon": {
          color: config.color,
          ml: 0.85,
          mr: -0.25,
          fontSize: size === "small" ? 17 : 19,
        },

        ...(interactive
          ? {
              cursor: "default",

              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 7px 16px rgba(15, 23, 42, 0.08)",
                borderColor: config.color,
              },
            }
          : {}),

        ...sx,
      }}
    />
  );

  if (!interactive) {
    return chip;
  }

  return (
    <Tooltip title={config.description} arrow placement="top" enterDelay={350}>
      <Box
        component="span"
        sx={{
          display: "inline-flex",
        }}
      >
        {chip}
      </Box>
    </Tooltip>
  );
}

export default CouponStatusChip;
