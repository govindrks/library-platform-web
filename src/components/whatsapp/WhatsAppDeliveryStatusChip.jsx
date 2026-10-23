import {
    CheckCircleOutlineOutlined,
  DoneAll,
  ErrorOutlineOutlined,
  HourglassEmpty,
  MarkChatReadOutlined,
  SendOutlined,
  SyncOutlined,
} from "@mui/icons-material";

import { Chip } from "@mui/material";

// ============================================================
// STATUS META
// ============================================================

const STATUS_META = {
  PENDING: {
    label: "Pending",
    color: "default",
    icon: HourglassEmpty,
  },

  SENDING: {
    label: "Sending",
    color: "info",
    icon: SyncOutlined,
  },

  SENT: {
    label: "Sent",
    color: "primary",
    icon: SendOutlined,
  },

  DELIVERED: {
    label: "Delivered",
    color: "success",
    icon: DoneAll,
  },

  READ: {
    label: "Read",
    color: "success",
    icon: MarkChatReadOutlined,
  },

  FAILED: {
    label: "Failed",
    color: "error",
    icon: ErrorOutlineOutlined,
  },

  COMPLETED: {
    label: "Completed",
    color: "success",
    icon: CheckCircleOutlineOutlined,
  },
};

// ============================================================
// NORMALIZE STATUS
// ============================================================

function normalizeStatus(status) {
  if (!status) {
    return "PENDING";
  }

  return String(status)
    .trim()
    .toUpperCase()
    .replaceAll("-", "_")
    .replaceAll(" ", "_");
}

// ============================================================
// WHATSAPP DELIVERY STATUS CHIP
// ============================================================

function WhatsAppDeliveryStatusChip({
  status,

  size = "small",

  variant = "outlined",

  showIcon = true,

  label,
}) {
  const normalizedStatus = normalizeStatus(status);

  const meta = STATUS_META[normalizedStatus] || {
    label: normalizedStatus
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase()),

    color: "default",

    icon: HourglassEmpty,
  };

  const Icon = meta.icon;

  return (
    <Chip
      size={size}
      variant={variant}
      color={meta.color}
      icon={showIcon ? <Icon /> : undefined}
      label={label || meta.label}
      sx={{
        fontWeight: 700,

        "& .MuiChip-icon": {
          fontSize: 17,
        },
      }}
    />
  );
}

export default WhatsAppDeliveryStatusChip;
