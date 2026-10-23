import {
  NotificationsActiveOutlined,
  SaveOutlined,
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
  Stack,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";



import whatsappConsentApi from "../../../api/whatsappConsentApi";

import WhatsAppPreferenceSwitches from "../../../components/whatsapp/WhatsAppPreferenceSwitches";

import WhatsAppConsentField from "../../../components/whatsapp/WhatsAppConsentField";

// ============================================================
// DEFAULT STATE
// ============================================================

const DEFAULT_PREFERENCES = {
  consentEnabled: false,

  paymentInvoice: true,

  bookingConfirmation: false,

  subscriptionExpiryReminder: false,

  seatChangeNotification: false,

  promotionalMessages: false,
};

// ============================================================
// NOTIFICATION PREFERENCES
// ============================================================

function NotificationPreferences() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);

  const [originalPreferences, setOriginalPreferences] =
    useState(DEFAULT_PREFERENCES);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // DIRTY STATE
  // ==========================================================

  const hasChanges =
    JSON.stringify(preferences) !== JSON.stringify(originalPreferences);

  // ==========================================================
  // LOAD
  // ==========================================================

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setLoading(true);

        setError("");

        const response = await whatsappConsentApi.getMyConsent();

        const data = response?.data ?? response ?? {};

        const normalized = {
          consentEnabled: Boolean(
            data.enabled ?? data.consentEnabled ?? data.optedIn ?? false,
          ),

          paymentInvoice: data.paymentInvoice ?? true,

          bookingConfirmation: data.bookingConfirmation ?? false,

          subscriptionExpiryReminder: data.subscriptionExpiryReminder ?? false,

          seatChangeNotification: data.seatChangeNotification ?? false,

          promotionalMessages: data.promotionalMessages ?? false,
        };

        setPreferences(normalized);

        setOriginalPreferences(normalized);
      } catch (exception) {
        setError(
          exception?.response?.data?.message ||
            exception?.response?.data?.error ||
            exception?.message ||
            "Unable to load notification preferences.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // ==========================================================
  // CONSENT CHANGE
  // ==========================================================

  const handleConsentChange = (enabled) => {
    setPreferences((previous) => ({
      ...previous,

      consentEnabled: enabled,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // PREFERENCE CHANGE
  // ==========================================================

  const handlePreferenceChange = (nextPreferences) => {
    setPreferences((previous) => ({
      ...previous,

      ...nextPreferences,
    }));

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = async () => {
    try {
      setSaving(true);

      setError("");
      setSuccess("");

      /*
       * For now consent is the authoritative backend call.
       *
       * Once the final backend DTO exposes per-notification
       * preferences, this API wrapper can be extended without
       * changing this page structure.
       */

      if (preferences.consentEnabled) {
        await whatsappConsentApi.grantConsent();
      } else {
        await whatsappConsentApi.revokeConsent();
      }

      setOriginalPreferences(preferences);

      setSuccess("Notification preferences saved successfully.");
    } catch (exception) {
      setError(
        exception?.response?.data?.message ||
          exception?.response?.data?.error ||
          exception?.message ||
          "Unable to save notification preferences.",
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
            Loading notification preferences...
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

        maxWidth: 900,

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

        <Stack direction="row" spacing={1.25} alignItems="center">
          <NotificationsActiveOutlined
            color="primary"
            sx={{
              fontSize: 30,
            }}
          />

          <Box>
            <Typography variant="h4" fontWeight={800}>
              Notification Preferences
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
              }}
            >
              Control how LibraryHub sends eligible service notifications to
              you.
            </Typography>
          </Box>
        </Stack>

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
        {/* WHATSAPP INFO */}
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
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <WhatsApp
                sx={{
                  color: "#25D366",

                  mt: 0.25,
                }}
              />

              <Box>
                <Typography variant="h6" fontWeight={800}>
                  WhatsApp notifications
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  LibraryHub can send important service updates to the WhatsApp
                  number registered with your account.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* ================================================= */}
        {/* CONSENT */}
        {/* ================================================= */}

        <WhatsAppConsentField
          checked={preferences.consentEnabled}
          onChange={handleConsentChange}
          title="Receive WhatsApp service notifications"
          description="Allow LibraryHub to send eligible account, booking, membership and payment-related updates to your registered WhatsApp number."
          helperText="You can turn this preference off at any time."
        />

        {/* ================================================= */}
        {/* INDIVIDUAL PREFERENCES */}
        {/* ================================================= */}

        <WhatsAppPreferenceSwitches
          value={{
            paymentInvoice: preferences.paymentInvoice,

            bookingConfirmation: preferences.bookingConfirmation,

            subscriptionExpiryReminder: preferences.subscriptionExpiryReminder,

            seatChangeNotification: preferences.seatChangeNotification,

            promotionalMessages: preferences.promotionalMessages,
          }}
          disabled={!preferences.consentEnabled}
          onChange={handlePreferenceChange}
        />

        {/* ================================================= */}
        {/* AUTHENTICATION NOTICE */}
        {/* ================================================= */}

        <Alert severity="info">
          WhatsApp login OTP is a security authentication message and is managed
          separately from these notification preferences.
        </Alert>

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
          <CardContent>
            <Typography variant="h6" fontWeight={800}>
              Currently available
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              LibraryHub is initially enabling only essential WhatsApp service
              notifications.
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
                • Booking confirmations — coming later
              </Typography>

              <Typography variant="body2" color="text.secondary">
                • Membership expiry reminders — coming later
              </Typography>

              <Typography variant="body2" color="text.secondary">
                • Seat change notifications — coming later
              </Typography>

              <Typography variant="body2" color="text.secondary">
                • Promotional messages — disabled
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
            disabled={saving || !hasChanges}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            onClick={handleSave}
            sx={{
              minWidth: 190,

              minHeight: 48,

              fontWeight: 700,
            }}
          >
            {saving ? "Saving..." : "Save preferences"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default NotificationPreferences;
