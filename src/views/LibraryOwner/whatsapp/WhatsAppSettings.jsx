import { SaveOutlined, WhatsApp } from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";

import whatsappSettingsApi from "../../../api/whatsappSettingsApi";

import WhatsAppPreferenceSwitches from "../../../components/whatsapp/WhatsAppPreferenceSwitches";

// ============================================================
// LOCAL STORAGE
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

// ============================================================
// GET STORED LIBRARY
// ============================================================

function getStoredLibraryId() {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
}

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_SETTINGS = {
  enabled: false,

  paymentInvoice: true,

  bookingConfirmation: false,

  subscriptionExpiryReminder: false,

  seatChangeNotification: false,

  promotionalMessages: false,
};

// ============================================================
// OWNER WHATSAPP SETTINGS
// ============================================================

function WhatsAppSettings() {
  // ==========================================================
  // LIBRARY
  // ==========================================================

  const libraryId = useMemo(() => getStoredLibraryId(), []);

  // ==========================================================
  // STATE
  // ==========================================================

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  const [originalSettings, setOriginalSettings] = useState(DEFAULT_SETTINGS);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // DIRTY STATE
  // ==========================================================

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(originalSettings);

  // ==========================================================
  // LOAD SETTINGS
  // ==========================================================

  useEffect(() => {
    const loadSettings = async () => {
      setError("");
      setSuccess("");

      if (!libraryId) {
        setLoading(false);

        setError("No library is currently selected.");

        return;
      }

      try {
        setLoading(true);

        const response =
          await whatsappSettingsApi.getLibrarySettings(libraryId);

        const data = response?.data ?? response ?? {};

        const normalized = {
          enabled: Boolean(data.enabled),

          paymentInvoice: data.paymentInvoice ?? true,

          bookingConfirmation: data.bookingConfirmation ?? false,

          subscriptionExpiryReminder: data.subscriptionExpiryReminder ?? false,

          seatChangeNotification: data.seatChangeNotification ?? false,

          promotionalMessages: data.promotionalMessages ?? false,
        };

        setSettings(normalized);

        setOriginalSettings(normalized);
      } catch (exception) {
        setError(
          exception?.response?.data?.message ||
            exception?.response?.data?.error ||
            exception?.message ||
            "Unable to load WhatsApp settings.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [libraryId]);

  // ==========================================================
  // MASTER ENABLE
  // ==========================================================

  const handleMasterToggle = (event) => {
    setSettings((previous) => ({
      ...previous,

      enabled: event.target.checked,
    }));

    setSuccess("");
    setError("");
  };

  // ==========================================================
  // PREFERENCES
  // ==========================================================

  const handlePreferencesChange = (preferences) => {
    setSettings((previous) => ({
      ...previous,

      ...preferences,
    }));

    setSuccess("");
    setError("");
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = async () => {
    if (!libraryId) {
      setError("No library is currently selected.");

      return;
    }

    setError("");
    setSuccess("");

    try {
      setSaving(true);

      const payload = {
        enabled: settings.enabled,

        paymentInvoice: settings.paymentInvoice,

        bookingConfirmation: settings.bookingConfirmation,

        subscriptionExpiryReminder: settings.subscriptionExpiryReminder,

        seatChangeNotification: settings.seatChangeNotification,

        promotionalMessages: settings.promotionalMessages,
      };

      const response = await whatsappSettingsApi.updateLibrarySettings(
        libraryId,
        payload,
      );

      const data = response?.data ?? response ?? payload;

      const normalized = {
        enabled: data.enabled ?? payload.enabled,

        paymentInvoice: data.paymentInvoice ?? payload.paymentInvoice,

        bookingConfirmation:
          data.bookingConfirmation ?? payload.bookingConfirmation,

        subscriptionExpiryReminder:
          data.subscriptionExpiryReminder ?? payload.subscriptionExpiryReminder,

        seatChangeNotification:
          data.seatChangeNotification ?? payload.seatChangeNotification,

        promotionalMessages:
          data.promotionalMessages ?? payload.promotionalMessages,
      };

      setSettings(normalized);

      setOriginalSettings(normalized);

      setSuccess("WhatsApp settings saved successfully.");
    } catch (exception) {
      setError(
        exception?.response?.data?.message ||
          exception?.response?.data?.error ||
          exception?.message ||
          "Unable to save WhatsApp settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 320,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography variant="body2" color="text.secondary">
            Loading WhatsApp settings...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: 980,

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

        <Box>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <WhatsApp
              sx={{
                color: "#25D366",

                fontSize: 30,
              }}
            />

            <Box>
              <Typography variant="h4" fontWeight={800}>
                WhatsApp Settings
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.4,
                }}
              >
                Control WhatsApp service notifications for your library.
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* ================================================= */}
        {/* ALERTS */}
        {/* ================================================= */}

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        {/* ================================================= */}
        {/* DEVELOPMENT STATUS */}
        {/* ================================================= */}

        <Alert severity="info">
          Meta WhatsApp Cloud API is not enabled yet. You can configure these
          preferences now; actual message sending will start only after
          LibraryHub is deployed and the Meta integration is activated.
        </Alert>

        {/* ================================================= */}
        {/* MASTER SETTING */}
        {/* ================================================= */}

        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              p: 3,
            }}
          >
            <Stack
              direction={{
                xs: "column",

                sm: "row",
              }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{
                xs: "flex-start",

                sm: "center",
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  WhatsApp notifications
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,

                    maxWidth: 650,
                  }}
                >
                  Enable eligible WhatsApp service notifications for this
                  library. Authentication OTP is managed separately by
                  LibraryHub.
                </Typography>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={settings.enabled}
                    onChange={handleMasterToggle}
                    color="success"
                  />
                }
                label={settings.enabled ? "Enabled" : "Disabled"}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* ================================================= */}
        {/* PREFERENCES */}
        {/* ================================================= */}

        <WhatsAppPreferenceSwitches
          value={{
            paymentInvoice: settings.paymentInvoice,

            bookingConfirmation: settings.bookingConfirmation,

            subscriptionExpiryReminder: settings.subscriptionExpiryReminder,

            seatChangeNotification: settings.seatChangeNotification,

            promotionalMessages: settings.promotionalMessages,
          }}
          disabled={!settings.enabled}
          onChange={handlePreferencesChange}
        />

        {/* ================================================= */}
        {/* CURRENT ROLLOUT */}
        {/* ================================================= */}

        <Card
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              p: 3,
            }}
          >
            <Typography variant="h6" fontWeight={800}>
              Current LibraryHub rollout
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Initial production rollout will keep only payment confirmations
              and invoices enabled for library notifications.
            </Typography>

            <Divider
              sx={{
                my: 2,
              }}
            />

            <Stack spacing={1}>
              <Typography variant="body2">
                ✓ Payment confirmation and invoice
              </Typography>

              <Typography variant="body2" color="text.secondary">
                • Booking confirmation — coming later
              </Typography>

              <Typography variant="body2" color="text.secondary">
                • Membership expiry reminder — coming later
              </Typography>

              <Typography variant="body2" color="text.secondary">
                • Seat change notification — coming later
              </Typography>

              <Typography variant="body2" color="text.secondary">
                • Promotional messaging — disabled
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* ================================================= */}
        {/* SAVE */}
        {/* ================================================= */}

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            size="large"
            disabled={saving || !hasChanges || !libraryId}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            onClick={handleSave}
            sx={{
              minWidth: 170,

              minHeight: 48,

              fontWeight: 700,
            }}
          >
            {saving ? "Saving..." : "Save settings"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default WhatsAppSettings;
