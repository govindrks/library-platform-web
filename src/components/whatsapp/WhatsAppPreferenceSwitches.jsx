import {
  ReceiptLongOutlined,
  EventAvailableOutlined,
  AccessTimeOutlined,
  SwapHorizOutlined,
  CampaignOutlined,
  WhatsApp,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

// ============================================================
// DEFAULT PREFERENCE DEFINITIONS
// ============================================================

const DEFAULT_PREFERENCES = [
  {
    key: "paymentInvoice",
    label: "Payment confirmations & invoices",
    description:
      "Receive payment success confirmations and invoice links on WhatsApp.",
    icon: ReceiptLongOutlined,
    enabledByPlatform: true,
  },

  {
    key: "bookingConfirmation",
    label: "Booking confirmations",
    description:
      "Receive booking confirmation updates after successful seat booking.",
    icon: EventAvailableOutlined,
    enabledByPlatform: false,
  },

  {
    key: "subscriptionExpiryReminder",
    label: "Membership expiry reminders",
    description:
      "Receive reminders before your membership or subscription expires.",
    icon: AccessTimeOutlined,
    enabledByPlatform: false,
  },

  {
    key: "seatChangeNotification",
    label: "Seat change updates",
    description: "Receive seat change approval or rejection updates.",
    icon: SwapHorizOutlined,
    enabledByPlatform: false,
  },

  {
    key: "promotionalMessages",
    label: "Promotional messages",
    description:
      "Receive promotional offers and non-essential marketing messages.",
    icon: CampaignOutlined,
    enabledByPlatform: false,
  },
];

// ============================================================
// WHATSAPP PREFERENCE SWITCHES
// ============================================================

function WhatsAppPreferenceSwitches({
  value = {},

  onChange,

  disabled = false,

  preferences = DEFAULT_PREFERENCES,

  showPlatformStatus = true,

  title = "WhatsApp notification preferences",

  description = "Choose which eligible LibraryHub updates you want to receive on WhatsApp.",
}) {
  // ==========================================================
  // CHANGE
  // ==========================================================

  const handleChange = (key, enabled) => {
    onChange?.({
      ...value,
      [key]: enabled,
    });
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        border: "1px solid",

        borderColor: "divider",

        borderRadius: 3,

        overflow: "hidden",

        backgroundColor: "background.paper",
      }}
    >
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <Box
        sx={{
          p: 2.5,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <WhatsApp
            sx={{
              mt: 0.25,

              color: "#25D366",
            }}
          />

          <Box>
            <Typography variant="h6" fontWeight={700}>
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* ===================================================== */}
      {/* PREFERENCES */}
      {/* ===================================================== */}

      <Stack divider={<Divider />}>
        {preferences.map((preference) => {
          const Icon = preference.icon;

          const platformAvailable = preference.enabledByPlatform !== false;

          const checked = Boolean(value[preference.key]);

          const switchDisabled = disabled || !platformAvailable;

          return (
            <Box
              key={preference.key}
              sx={{
                p: 2.25,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="flex-start"
                justifyContent="space-between"
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="flex-start"
                  sx={{
                    minWidth: 0,

                    flex: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 38,

                      height: 38,

                      borderRadius: 2,

                      display: "flex",

                      alignItems: "center",

                      justifyContent: "center",

                      flexShrink: 0,

                      backgroundColor: platformAvailable
                        ? "rgba(37, 211, 102, 0.08)"
                        : "action.hover",
                    }}
                  >
                    <Icon
                      fontSize="small"
                      sx={{
                        color: platformAvailable ? "#128C7E" : "text.disabled",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      minWidth: 0,
                    }}
                  >
                    <Typography variant="body1" fontWeight={700}>
                      {preference.label}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.35,
                      }}
                    >
                      {preference.description}
                    </Typography>

                    {showPlatformStatus && !platformAvailable && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",

                          mt: 0.75,

                          fontWeight: 600,
                        }}
                      >
                        Coming soon
                      </Typography>
                    )}
                  </Box>
                </Stack>

                <FormControlLabel
                  sx={{
                    m: 0,

                    flexShrink: 0,
                  }}
                  control={
                    <Switch
                      checked={checked}
                      disabled={switchDisabled}
                      onChange={(event) =>
                        handleChange(preference.key, event.target.checked)
                      }
                      color="success"
                    />
                  }
                  label=""
                />
              </Stack>
            </Box>
          );
        })}
      </Stack>

      {/* ===================================================== */}
      {/* POLICY INFO */}
      {/* ===================================================== */}

      <Divider />

      <Alert
        severity="info"
        icon={false}
        sx={{
          borderRadius: 0,
        }}
      >
        Login OTP is a security/authentication message and is managed separately
        from these notification preferences.
      </Alert>
    </Box>
  );
}

export default WhatsAppPreferenceSwitches;
