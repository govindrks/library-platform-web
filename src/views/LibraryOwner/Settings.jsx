import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import {
  AccessTime,
  AutoAwesome,
  CheckCircle,
  ChevronRight,
  CurrencyRupee,
  EventSeat,
  Language,
  LibraryBooks,
  LocationOn,
  LockOutlined,
  MailOutlineOutlined,
  Notifications,
  PhoneOutlined,
  Public,
  Refresh,
  Save,
  Security,
  SettingsSuggest,
  SmsOutlined,
  Tune,
  VerifiedUserOutlined,
} from "@mui/icons-material";

import libraryApi from "../../api/libraryApi";
import settingsApi from "../../api/settingsApi";

// ============================================================
// CONSTANTS
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

// ============================================================
// DEFAULT SETTINGS
// ============================================================

const defaultSettings = {
  // ---------------------------------------------------------
  // LIBRARY CORE DATA
  // ---------------------------------------------------------

  libraryName: "",

  email: "",

  phone: "",

  address: "",

  city: "",

  state: "",

  pincode: "",

  openingTime: "",

  closingTime: "",

  description: "",

  totalSeats: 0,

  latitude: null,

  longitude: null,

  // ---------------------------------------------------------
  // GENERAL SETTINGS
  // ---------------------------------------------------------

  timezone: "Asia/Kolkata",

  // ---------------------------------------------------------
  // LIBRARY SETTINGS
  // ---------------------------------------------------------

  allowPublicDiscovery: true,

  allowOnlineBooking: true,

  // ---------------------------------------------------------
  // BOOKING SETTINGS
  // ---------------------------------------------------------

  autoConfirmBooking: true,

  allowCancellation: true,

  cancellationHours: 2,

  allowSeatChangeRequest: true,

  // ---------------------------------------------------------
  // NOTIFICATION SETTINGS
  // ---------------------------------------------------------

  emailNotifications: true,

  smsNotifications: false,

  inAppNotifications: true,

  bookingNotifications: true,

  paymentNotifications: true,

  membershipNotifications: true,
};

// ============================================================
// SETTINGS SECTIONS
// ============================================================

const SETTINGS_SECTIONS = [
  {
    id: "general",

    label: "General",

    description: "Identity, contacts and location",

    icon: Tune,
  },

  {
    id: "library",

    label: "Operations",

    description: "Hours, discovery and booking access",

    icon: LibraryBooks,
  },

  {
    id: "booking",

    label: "Booking",

    description: "Confirmation, cancellation and seat changes",

    icon: EventSeat,
  },

  {
    id: "notifications",

    label: "Notifications",

    description: "Channels and business events",

    icon: Notifications,
  },

  {
    id: "security",

    label: "Security",

    description: "Authentication and account controls",

    icon: Security,
  },
];

// ============================================================
// HELPERS
// ============================================================

const normalizeLibraries = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
};

const normalizeTime = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const getStoredLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
};

const storeLibraryId = (libraryId) => {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
};

const formatTime = (value) => {
  if (!value) {
    return "Not configured";
  }

  const parts = String(value).split(":");

  if (parts.length < 2) {
    return value;
  }

  const hours = Number(parts[0]);

  const minutes = Number(parts[1]);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const date = new Date();

  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",

    minute: "2-digit",
  });
};

// ============================================================
// PREMIUM SECTION CARD
// ============================================================

function SectionCard({ title, description, icon, children, action }) {
  const theme = useTheme();

  const Icon = icon;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,

        border: "1px solid",

        borderColor: "divider",

        overflow: "hidden",

        boxShadow: "0 16px 44px rgba(15, 23, 42, 0.045)",
      }}
    >
      <Box
        sx={{
          px: {
            xs: 2.4,
            md: 3,
          },

          py: 2.4,

          background: `linear-gradient(
              135deg,
              ${alpha(theme.palette.primary.main, 0.055)} 0%,
              ${theme.palette.background.paper} 72%
            )`,

          borderBottom: "1px solid",

          borderColor: "divider",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={2}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,

                height: 44,

                borderRadius: 2.4,

                display: "grid",

                placeItems: "center",

                color: "primary.main",

                bgcolor: alpha(theme.palette.primary.main, 0.09),

                border: "1px solid",

                borderColor: alpha(theme.palette.primary.main, 0.13),

                flexShrink: 0,
              }}
            >
              <Icon />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={850}>
                {title}
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.25}>
                {description}
              </Typography>
            </Box>
          </Stack>

          {action}
        </Stack>
      </Box>

      <CardContent
        sx={{
          p: {
            xs: 2.4,
            md: 3,
          },

          "&:last-child": {
            pb: {
              xs: 2.4,
              md: 3,
            },
          },
        }}
      >
        {children}
      </CardContent>
    </Card>
  );
}

// ============================================================
// INTERACTIVE SETTING TOGGLE
// ============================================================

function SettingToggle({
  title,
  description,
  checked,
  onChange,
  icon,
  disabled = false,
  badge,
}) {
  const theme = useTheme();

  const Icon = icon;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,

        borderRadius: 3,

        borderColor: checked
          ? alpha(theme.palette.primary.main, 0.26)
          : "divider",

        bgcolor: checked
          ? alpha(theme.palette.primary.main, 0.035)
          : "background.paper",

        transition: "all 0.2s ease",

        height: "100%",

        "&:hover": {
          borderColor: disabled
            ? "divider"
            : alpha(theme.palette.primary.main, 0.34),

          transform: disabled ? "none" : "translateY(-1px)",

          boxShadow: disabled ? "none" : "0 10px 24px rgba(15,23,42,0.05)",
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack
          direction="row"
          spacing={1.4}
          alignItems="center"
          sx={{
            minWidth: 0,
          }}
        >
          <Box
            sx={{
              width: 40,

              height: 40,

              borderRadius: 2.2,

              display: "grid",

              placeItems: "center",

              color: checked ? "primary.main" : "text.secondary",

              bgcolor: checked
                ? alpha(theme.palette.primary.main, 0.09)
                : "action.hover",

              flexShrink: 0,
            }}
          >
            <Icon fontSize="small" />
          </Box>

          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography variant="body2" fontWeight={800}>
                {title}
              </Typography>

              {badge && (
                <Chip
                  label={badge}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 22,

                    fontSize: 10,

                    fontWeight: 750,
                  }}
                />
              )}
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",

                mt: 0.25,

                lineHeight: 1.5,
              }}
            >
              {description}
            </Typography>
          </Box>
        </Stack>

        <Switch
          checked={Boolean(checked)}
          onChange={(event) => onChange?.(event.target.checked)}
          disabled={disabled}
          color="primary"
        />
      </Stack>
    </Paper>
  );
}

// ============================================================
// SUMMARY TILE
// ============================================================

function SummaryTile({ icon, label, value, tone = "primary" }) {
  const theme = useTheme();

  const Icon = icon;

  const tones = {
    primary: theme.palette.primary.main,

    success: theme.palette.success.main,

    info: theme.palette.info.main,

    warning: theme.palette.warning.main,
  };

  const color = tones[tone] || theme.palette.primary.main;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.8,

        borderRadius: 3,

        height: "100%",

        borderColor: alpha(color, 0.15),

        background: `linear-gradient(
            145deg,
            ${alpha(color, 0.05)} 0%,
            ${theme.palette.background.paper} 72%
          )`,
      }}
    >
      <Stack direction="row" spacing={1.3} alignItems="center">
        <Box
          sx={{
            width: 38,

            height: 38,

            borderRadius: 2,

            display: "grid",

            placeItems: "center",

            color,

            bgcolor: alpha(color, 0.09),

            flexShrink: 0,
          }}
        >
          <Icon fontSize="small" />
        </Box>

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>

          <Typography variant="body2" fontWeight={850} noWrap>
            {value}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Settings() {
  const theme = useTheme();

  // ========================================================
  // PAGE STATE
  // ========================================================

  const [activeSection, setActiveSection] = useState("general");

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [settings, setSettings] = useState(defaultSettings);

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [loadingSettings, setLoadingSettings] = useState(false);

  const [saving, setSaving] = useState(false);

  const [success, setSuccess] = useState("");

  const [error, setError] = useState("");

  // ========================================================
  // UPDATE ONE FIELD
  // ========================================================

  const updateSetting = (field, value) => {
    setSettings((previous) => ({
      ...previous,

      [field]: value,
    }));

    setSuccess("");
  };

  // ========================================================
  // LOAD OWNER LIBRARIES
  // ========================================================

  useEffect(() => {
    let active = true;

    const loadLibraries = async () => {
      try {
        setLoadingLibraries(true);

        setError("");

        const response = await libraryApi.getMyLibraries();

        if (!active) {
          return;
        }

        const data = normalizeLibraries(response);

        setLibraries(data);

        if (data.length > 0) {
          const stored = getStoredLibraryId();

          const storedExists =
            stored != null &&
            data.some((library) => Number(library.id) === Number(stored));

          const nextId = storedExists ? stored : data[0].id;

          setSelectedLibraryId(String(nextId));

          storeLibraryId(nextId);
        } else {
          setSelectedLibraryId("");

          setError("No library is associated with your account.");
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error("Failed to load owner libraries:", requestError);

        setError(
          getErrorMessage(requestError, "Unable to load your libraries."),
        );
      } finally {
        if (active) {
          setLoadingLibraries(false);
        }
      }
    };

    loadLibraries();

    return () => {
      active = false;
    };
  }, []);

  // ========================================================
  // SELECTED OWNER LIBRARY
  // ========================================================

  const selectedOwnerLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,
    [libraries, selectedLibraryId],
  );

  // ========================================================
  // LOAD LIBRARY + SETTINGS
  // ========================================================

  const loadSettings = useCallback(async () => {
    if (!selectedLibraryId) {
      return;
    }

    try {
      setLoadingSettings(true);

      setError("");

      setSuccess("");

      const [libraryDetails, preferences] = await Promise.all([
        libraryApi.getLibraryDetails(selectedLibraryId),

        settingsApi.getSettings(selectedLibraryId),
      ]);

      setSettings({
        libraryName: libraryDetails?.name ?? selectedOwnerLibrary?.name ?? "",

        email: libraryDetails?.email ?? selectedOwnerLibrary?.email ?? "",

        phone:
          libraryDetails?.contactNumber ??
          selectedOwnerLibrary?.contactNumber ??
          "",

        address: libraryDetails?.address ?? selectedOwnerLibrary?.address ?? "",

        city: libraryDetails?.city ?? selectedOwnerLibrary?.city ?? "",

        state: libraryDetails?.state ?? selectedOwnerLibrary?.state ?? "",

        pincode:
          libraryDetails?.pincode != null
            ? String(libraryDetails.pincode)
            : selectedOwnerLibrary?.pincode != null
              ? String(selectedOwnerLibrary.pincode)
              : "",

        openingTime: normalizeTime(
          libraryDetails?.openingTime ?? selectedOwnerLibrary?.openingTime,
        ),

        closingTime: normalizeTime(
          libraryDetails?.closingTime ?? selectedOwnerLibrary?.closingTime,
        ),

        description:
          libraryDetails?.description ??
          selectedOwnerLibrary?.description ??
          "",

        totalSeats: Number(
          libraryDetails?.totalSeats ?? selectedOwnerLibrary?.totalSeats ?? 0,
        ),

        latitude:
          libraryDetails?.latitude ?? selectedOwnerLibrary?.latitude ?? null,

        longitude:
          libraryDetails?.longitude ?? selectedOwnerLibrary?.longitude ?? null,

        timezone: preferences?.timezone ?? "Asia/Kolkata",

        allowPublicDiscovery: preferences?.allowPublicDiscovery ?? true,

        allowOnlineBooking: preferences?.allowOnlineBooking ?? true,

        autoConfirmBooking: preferences?.autoConfirmBooking ?? true,

        allowCancellation: preferences?.allowCancellation ?? true,

        cancellationHours: Number(preferences?.cancellationHours ?? 2),

        allowSeatChangeRequest: preferences?.allowSeatChangeRequest ?? true,

        emailNotifications: preferences?.emailNotifications ?? true,

        smsNotifications: preferences?.smsNotifications ?? false,

        inAppNotifications: preferences?.inAppNotifications ?? true,

        bookingNotifications: preferences?.bookingNotifications ?? true,

        paymentNotifications: preferences?.paymentNotifications ?? true,

        membershipNotifications: preferences?.membershipNotifications ?? true,
      });
    } catch (requestError) {
      console.error("Failed to load settings:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to load library settings."),
      );
    } finally {
      setLoadingSettings(false);
    }
  }, [selectedLibraryId, selectedOwnerLibrary]);

  useEffect(() => {
    if (!loadingLibraries && selectedLibraryId) {
      loadSettings();
    }
  }, [loadingLibraries, selectedLibraryId, loadSettings]);

  // ========================================================
  // BUILD LIBRARY UPDATE REQUEST
  // ========================================================

  const buildLibraryPayload = () => {
    return {
      name: settings.libraryName.trim(),

      address: settings.address,

      city: settings.city,

      state: settings.state,

      pincode: settings.pincode,

      contactNumber: settings.phone,

      email: settings.email,

      totalSeats: Number(settings.totalSeats || 0),

      latitude: settings.latitude,

      longitude: settings.longitude,

      openingTime: settings.openingTime || null,

      closingTime: settings.closingTime || null,

      description: settings.description,
    };
  };

  // ========================================================
  // BUILD SETTINGS REQUEST
  // ========================================================

  const buildSettingsPayload = () => {
    return {
      timezone: settings.timezone,

      allowPublicDiscovery: Boolean(settings.allowPublicDiscovery),

      allowOnlineBooking: Boolean(settings.allowOnlineBooking),

      autoConfirmBooking: Boolean(settings.autoConfirmBooking),

      allowCancellation: Boolean(settings.allowCancellation),

      cancellationHours: Math.max(Number(settings.cancellationHours || 0), 0),

      allowSeatChangeRequest: Boolean(settings.allowSeatChangeRequest),

      emailNotifications: Boolean(settings.emailNotifications),

      smsNotifications: Boolean(settings.smsNotifications),

      inAppNotifications: Boolean(settings.inAppNotifications),

      bookingNotifications: Boolean(settings.bookingNotifications),

      paymentNotifications: Boolean(settings.paymentNotifications),

      membershipNotifications: Boolean(settings.membershipNotifications),
    };
  };

  // ========================================================
  // SAVE SETTINGS
  // ========================================================

  const handleSave = async () => {
    if (!selectedLibraryId) {
      return;
    }

    if (!settings.libraryName.trim()) {
      setError("Library name is required.");

      return;
    }

    if (settings.allowCancellation && Number(settings.cancellationHours) < 0) {
      setError("Cancellation window cannot be negative.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      const libraryPayload = buildLibraryPayload();

      const settingsPayload = buildSettingsPayload();

      await Promise.all([
        libraryApi.updateLibrary(selectedLibraryId, libraryPayload),

        settingsApi.updateSettings(selectedLibraryId, settingsPayload),
      ]);

      setSuccess("Library settings saved successfully.");

      await loadSettings();
    } catch (requestError) {
      console.error("Failed to save settings:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to save library settings."),
      );
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // DERIVED VIEW DATA
  // ========================================================

  const enabledNotificationChannels = [
    settings.emailNotifications,

    settings.smsNotifications,

    settings.inAppNotifications,
  ].filter(Boolean).length;

  const bookingControlsEnabled = [
    settings.autoConfirmBooking,

    settings.allowCancellation,

    settings.allowSeatChangeRequest,
  ].filter(Boolean).length;

  const publicStatus = settings.allowPublicDiscovery
    ? "Discoverable"
    : "Private";

  const bookingStatus = settings.allowOnlineBooking ? "Online" : "Offline";

  const sectionHealth = useMemo(
    () => ({
      general: [
        settings.libraryName,

        settings.email,

        settings.phone,

        settings.timezone,
      ].filter(Boolean).length,

      library: [
        settings.openingTime,

        settings.closingTime,

        settings.allowPublicDiscovery,

        settings.allowOnlineBooking,
      ].filter(Boolean).length,

      booking: bookingControlsEnabled,

      notifications: enabledNotificationChannels,

      security: 0,
    }),
    [settings, bookingControlsEnabled, enabledNotificationChannels],
  );

  // ========================================================
  // INITIAL LOADING
  // ========================================================

  if (loadingLibraries) {
    return (
      <Stack
        minHeight={360}
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading your libraries...
        </Typography>
      </Stack>
    );
  }

  // ========================================================
  // UI
  // ========================================================

  return (
    <Box>
      {/* =====================================================
          PREMIUM HEADER
         ===================================================== */}

      <Box
        sx={{
          mb: 3,

          p: {
            xs: 2.5,
            md: 3.25,
          },

          borderRadius: 4,

          border: "1px solid",

          borderColor: alpha(theme.palette.primary.main, 0.14),

          background:
            "linear-gradient(135deg, rgba(79,70,229,0.09) 0%, rgba(255,255,255,0.98) 54%, rgba(16,185,129,0.045) 100%)",

          boxShadow: "0 18px 48px rgba(15, 23, 42, 0.055)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            lg: "center",
          }}
          spacing={2.5}
        >
          <Stack direction="row" spacing={1.8} alignItems="center">
            <Box
              sx={{
                width: 56,

                height: 56,

                borderRadius: 3,

                display: "grid",

                placeItems: "center",

                bgcolor: "primary.main",

                color: "primary.contrastText",

                boxShadow: "0 14px 28px rgba(79,70,229,0.22)",

                flexShrink: 0,
              }}
            >
              <SettingsSuggest />
            </Box>

            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,

                    letterSpacing: "-0.035em",
                  }}
                >
                  Settings
                </Typography>

                <Chip
                  size="small"
                  icon={<AutoAwesome fontSize="small" />}
                  label="Library Control Center"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 750,
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={0.5}
                sx={{
                  maxWidth: 720,
                }}
              >
                Manage your library identity, operations, booking rules,
                notifications and security from one place.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1.2}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: {
                  xs: "100%",
                  sm: 220,
                },

                bgcolor: "background.paper",

                borderRadius: 2,
              }}
            >
              <InputLabel>Working Library</InputLabel>

              <Select
                label="Working Library"
                value={selectedLibraryId}
                onChange={(event) => {
                  const value = event.target.value;

                  setSelectedLibraryId(value);

                  storeLibraryId(value);
                }}
                disabled={saving}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={
                loadingSettings ? <CircularProgress size={16} /> : <Refresh />
              }
              onClick={loadSettings}
              disabled={loadingSettings || saving || !selectedLibraryId}
              sx={{
                minHeight: 40,

                borderRadius: 2.2,

                textTransform: "none",

                fontWeight: 800,

                bgcolor: "background.paper",
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={
                saving ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Save />
                )
              }
              onClick={handleSave}
              disabled={
                saving ||
                loadingSettings ||
                !selectedLibraryId ||
                activeSection === "security"
              }
              sx={{
                minHeight: 40,

                borderRadius: 2.2,

                px: 2.2,

                textTransform: "none",

                fontWeight: 850,

                boxShadow: "0 10px 22px rgba(79,70,229,0.18)",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* =====================================================
          ALERTS
         ===================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,

            borderRadius: 2.5,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{
            mb: 2.5,

            borderRadius: 2.5,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* =====================================================
          LIBRARY SNAPSHOT
         ===================================================== */}

      {!loadingSettings && (
        <Grid
          container
          spacing={1.5}
          sx={{
            mb: 3,
          }}
        >
          <Grid item xs={12} sm={6} lg={3}>
            <SummaryTile
              icon={LibraryBooks}
              label="Working Library"
              value={settings.libraryName || "Not configured"}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryTile
              icon={AccessTime}
              label="Operating Hours"
              value={`${formatTime(settings.openingTime)} – ${formatTime(
                settings.closingTime,
              )}`}
              tone="info"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryTile
              icon={Public}
              label="Visibility"
              value={publicStatus}
              tone={settings.allowPublicDiscovery ? "success" : "warning"}
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <SummaryTile
              icon={EventSeat}
              label="Online Booking"
              value={bookingStatus}
              tone={settings.allowOnlineBooking ? "success" : "warning"}
            />
          </Grid>
        </Grid>
      )}

      {/* =====================================================
          MAIN SETTINGS WORKSPACE
         ===================================================== */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",
            lg: "280px minmax(0, 1fr)",
          },

          gap: 2.5,

          alignItems: "start",
        }}
      >
        {/* ===================================================
            SECTION NAVIGATOR
           =================================================== */}

        <Card
          elevation={0}
          sx={{
            borderRadius: 3.5,

            border: "1px solid",

            borderColor: "divider",

            overflow: "hidden",

            position: {
              lg: "sticky",
            },

            top: {
              lg: 16,
            },
          }}
        >
          <Box
            sx={{
              p: 2.2,

              borderBottom: "1px solid",

              borderColor: "divider",
            }}
          >
            <Typography variant="subtitle1" fontWeight={850}>
              Settings Map
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Choose a configuration area.
            </Typography>
          </Box>

          <Stack
            spacing={0.5}
            sx={{
              p: 1,
            }}
          >
            {SETTINGS_SECTIONS.map((section) => {
              const Icon = section.icon;

              const active = activeSection === section.id;

              return (
                <Button
                  key={section.id}
                  fullWidth
                  onClick={() => setActiveSection(section.id)}
                  sx={{
                    justifyContent: "flex-start",

                    textAlign: "left",

                    px: 1.3,

                    py: 1.25,

                    borderRadius: 2.4,

                    color: active ? "primary.main" : "text.primary",

                    bgcolor: active
                      ? alpha(theme.palette.primary.main, 0.075)
                      : "transparent",

                    border: "1px solid",

                    borderColor: active
                      ? alpha(theme.palette.primary.main, 0.13)
                      : "transparent",

                    textTransform: "none",

                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.055),
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                    sx={{
                      width: "100%",
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,

                        height: 36,

                        borderRadius: 2,

                        display: "grid",

                        placeItems: "center",

                        color: active ? "primary.main" : "text.secondary",

                        bgcolor: active
                          ? alpha(theme.palette.primary.main, 0.09)
                          : "action.hover",

                        flexShrink: 0,
                      }}
                    >
                      <Icon fontSize="small" />
                    </Box>

                    <Box
                      sx={{
                        minWidth: 0,

                        flex: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={active ? 850 : 700}
                      >
                        {section.label}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",

                          lineHeight: 1.35,
                        }}
                      >
                        {section.description}
                      </Typography>
                    </Box>

                    <Stack spacing={0.25} alignItems="center">
                      {section.id !== "security" && (
                        <Chip
                          size="small"
                          label={sectionHealth[section.id] || 0}
                          sx={{
                            height: 20,

                            minWidth: 24,

                            fontSize: 10,

                            fontWeight: 800,
                          }}
                        />
                      )}

                      <ChevronRight
                        fontSize="small"
                        sx={{
                          color: active ? "primary.main" : "text.disabled",
                        }}
                      />
                    </Stack>
                  </Stack>
                </Button>
              );
            })}
          </Stack>
        </Card>

        {/* ===================================================
            SETTINGS CONTENT
           =================================================== */}

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          {loadingSettings ? (
            <Card
              elevation={0}
              sx={{
                border: "1px solid",

                borderColor: "divider",

                borderRadius: 3.5,
              }}
            >
              <CardContent
                sx={{
                  py: 10,

                  textAlign: "center",
                }}
              >
                <CircularProgress />

                <Typography variant="body2" color="text.secondary" mt={2}>
                  Loading library settings...
                </Typography>

                <LinearProgress
                  sx={{
                    mt: 2,

                    maxWidth: 280,

                    mx: "auto",

                    borderRadius: 99,
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ===============================================
                      GENERAL
                     =============================================== */}

              {activeSection === "general" && (
                <SectionCard
                  title="General Settings"
                  description="Manage your library identity, contact information and location."
                  icon={Tune}
                  action={
                    <Chip
                      size="small"
                      icon={<CheckCircle />}
                      label="Core Profile"
                      color="success"
                      variant="outlined"
                    />
                  }
                >
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        required
                        label="Library Name"
                        value={settings.libraryName}
                        onChange={(event) =>
                          updateSetting("libraryName", event.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contact Email"
                        type="email"
                        value={settings.email}
                        onChange={(event) =>
                          updateSetting("email", event.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MailOutlineOutlined fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Contact Phone"
                        value={settings.phone}
                        onChange={(event) =>
                          updateSetting("phone", event.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneOutlined fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Timezone</InputLabel>

                        <Select
                          value={settings.timezone}
                          label="Timezone"
                          onChange={(event) =>
                            updateSetting("timezone", event.target.value)
                          }
                        >
                          <MenuItem value="Asia/Kolkata">
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Language fontSize="small" />

                              <span>India Standard Time (IST)</span>
                            </Stack>
                          </MenuItem>

                          <MenuItem value="Asia/Dubai">
                            Gulf Standard Time
                          </MenuItem>

                          <MenuItem value="UTC">UTC</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  <Divider
                    sx={{
                      my: 3,
                    }}
                  />

                  <Grid container spacing={2}>
                    <Grid item xs={12} md={8}>
                      <TextField
                        fullWidth
                        label="Address"
                        value={settings.address}
                        onChange={(event) =>
                          updateSetting("address", event.target.value)
                        }
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOn fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Pincode"
                        value={settings.pincode}
                        onChange={(event) =>
                          updateSetting("pincode", event.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="City"
                        value={settings.city}
                        onChange={(event) =>
                          updateSetting("city", event.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="State"
                        value={settings.state}
                        onChange={(event) =>
                          updateSetting("state", event.target.value)
                        }
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Library Description"
                        value={settings.description}
                        onChange={(event) =>
                          updateSetting("description", event.target.value)
                        }
                      />
                    </Grid>
                  </Grid>
                </SectionCard>
              )}

              {/* ===============================================
                      OPERATIONS
                     =============================================== */}

              {activeSection === "library" && (
                <Stack spacing={2.5}>
                  <SectionCard
                    title="Operating Hours"
                    description="Define when members can access and book your library."
                    icon={AccessTime}
                  >
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Opening Time"
                          value={settings.openingTime}
                          onChange={(event) =>
                            updateSetting("openingTime", event.target.value)
                          }
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label="Closing Time"
                          value={settings.closingTime}
                          onChange={(event) =>
                            updateSetting("closingTime", event.target.value)
                          }
                          InputLabelProps={{
                            shrink: true,
                          }}
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>

                  <SectionCard
                    title="Availability & Discovery"
                    description="Control how members discover and interact with this library."
                    icon={Public}
                  >
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={6}>
                        <SettingToggle
                          icon={Public}
                          title="Public Library Discovery"
                          description="Allow members to discover your library in LibraryHub search and public listings."
                          checked={settings.allowPublicDiscovery}
                          onChange={(value) =>
                            updateSetting("allowPublicDiscovery", value)
                          }
                          badge={
                            settings.allowPublicDiscovery ? "Visible" : "Hidden"
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <SettingToggle
                          icon={EventSeat}
                          title="Online Booking"
                          description="Allow members to select and book eligible seats online."
                          checked={settings.allowOnlineBooking}
                          onChange={(value) =>
                            updateSetting("allowOnlineBooking", value)
                          }
                          badge={
                            settings.allowOnlineBooking ? "Enabled" : "Disabled"
                          }
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>
                </Stack>
              )}

              {/* ===============================================
                      BOOKING
                     =============================================== */}

              {activeSection === "booking" && (
                <Stack spacing={2.5}>
                  <SectionCard
                    title="Booking Workflow"
                    description="Define how bookings are confirmed, changed and cancelled."
                    icon={EventSeat}
                    action={
                      <Chip
                        size="small"
                        label={`${bookingControlsEnabled}/3 controls active`}
                        color="primary"
                        variant="outlined"
                      />
                    }
                  >
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={6}>
                        <SettingToggle
                          icon={CheckCircle}
                          title="Automatic Confirmation"
                          description="Automatically confirm eligible bookings without owner approval."
                          checked={settings.autoConfirmBooking}
                          onChange={(value) =>
                            updateSetting("autoConfirmBooking", value)
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <SettingToggle
                          icon={AccessTime}
                          title="Booking Cancellation"
                          description="Allow members to cancel bookings before the configured cut-off window."
                          checked={settings.allowCancellation}
                          onChange={(value) =>
                            updateSetting("allowCancellation", value)
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <SettingToggle
                          icon={EventSeat}
                          title="Seat Change Requests"
                          description="Allow members to request a different seat for an existing booking or membership."
                          checked={settings.allowSeatChangeRequest}
                          onChange={(value) =>
                            updateSetting("allowSeatChangeRequest", value)
                          }
                        />
                      </Grid>
                    </Grid>

                    {settings.allowCancellation && (
                      <>
                        <Divider
                          sx={{
                            my: 3,
                          }}
                        />

                        <Box
                          sx={{
                            maxWidth: 420,
                          }}
                        >
                          <TextField
                            fullWidth
                            type="number"
                            label="Cancellation Window"
                            value={settings.cancellationHours}
                            inputProps={{
                              min: 0,
                            }}
                            onChange={(event) =>
                              updateSetting(
                                "cancellationHours",
                                Number(event.target.value),
                              )
                            }
                            helperText="Minimum hours before booking start when cancellation is allowed."
                          />
                        </Box>
                      </>
                    )}
                  </SectionCard>

                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,

                      borderRadius: 3,

                      bgcolor: alpha(theme.palette.info.main, 0.035),

                      borderColor: alpha(theme.palette.info.main, 0.16),
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.4}
                      alignItems="flex-start"
                    >
                      <EventSeat color="info" />

                      <Box>
                        <Typography variant="body2" fontWeight={800}>
                          Current Booking Policy
                        </Typography>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            lineHeight: 1.7,
                          }}
                        >
                          Bookings are{" "}
                          {settings.autoConfirmBooking
                            ? "automatically confirmed"
                            : "manually confirmed"}
                          {settings.allowCancellation
                            ? `, cancellation is allowed up to ${settings.cancellationHours} hour(s) before start`
                            : ", cancellation is disabled"}
                          {settings.allowSeatChangeRequest
                            ? ", and seat-change requests are enabled."
                            : ", and seat-change requests are disabled."}
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Stack>
              )}

              {/* ===============================================
                      NOTIFICATIONS
                     =============================================== */}

              {activeSection === "notifications" && (
                <Stack spacing={2.5}>
                  <SectionCard
                    title="Notification Channels"
                    description="Choose how LibraryHub can communicate important updates."
                    icon={Notifications}
                    action={
                      <Chip
                        size="small"
                        label={`${enabledNotificationChannels}/3 channels active`}
                        color="primary"
                        variant="outlined"
                      />
                    }
                  >
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={4}>
                        <SettingToggle
                          icon={MailOutlineOutlined}
                          title="Email"
                          description="Send supported notifications to the configured library email."
                          checked={settings.emailNotifications}
                          onChange={(value) =>
                            updateSetting("emailNotifications", value)
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <SettingToggle
                          icon={SmsOutlined}
                          title="SMS"
                          description="Enable SMS delivery where your configured messaging provider supports it."
                          checked={settings.smsNotifications}
                          onChange={(value) =>
                            updateSetting("smsNotifications", value)
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <SettingToggle
                          icon={Notifications}
                          title="In-App"
                          description="Show notifications directly inside the LibraryHub owner portal."
                          checked={settings.inAppNotifications}
                          onChange={(value) =>
                            updateSetting("inAppNotifications", value)
                          }
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>

                  <SectionCard
                    title="Notification Events"
                    description="Choose which business events should create owner notifications."
                    icon={SettingsSuggest}
                  >
                    <Grid container spacing={1.5}>
                      <Grid item xs={12} md={4}>
                        <SettingToggle
                          icon={EventSeat}
                          title="Bookings"
                          description="Notify for important booking activity."
                          checked={settings.bookingNotifications}
                          onChange={(value) =>
                            updateSetting("bookingNotifications", value)
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <SettingToggle
                          icon={CurrencyRupee}
                          title="Payments"
                          description="Notify for payment and transaction events."
                          checked={settings.paymentNotifications}
                          onChange={(value) =>
                            updateSetting("paymentNotifications", value)
                          }
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <SettingToggle
                          icon={VerifiedUserOutlined}
                          title="Memberships"
                          description="Notify for important membership activity."
                          checked={settings.membershipNotifications}
                          onChange={(value) =>
                            updateSetting("membershipNotifications", value)
                          }
                        />
                      </Grid>
                    </Grid>
                  </SectionCard>
                </Stack>
              )}

              {/* ===============================================
                      SECURITY
                     =============================================== */}

              {activeSection === "security" && (
                <SectionCard
                  title="Security Settings"
                  description="Authentication and account-security controls for library owners."
                  icon={Security}
                  action={
                    <Chip
                      size="small"
                      label="Backend required"
                      color="warning"
                      variant="outlined"
                    />
                  }
                >
                  <Alert
                    severity="info"
                    sx={{
                      mb: 2.5,

                      borderRadius: 2.5,
                    }}
                  >
                    Session timeout and two-factor authentication are not yet
                    enforced by the backend authentication module. These
                    controls remain disabled until Spring Security supports
                    them.
                  </Alert>

                  <Grid container spacing={1.5}>
                    <Grid item xs={12} md={6}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,

                          borderRadius: 3,

                          height: "100%",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.4}
                          alignItems="flex-start"
                        >
                          <Avatar
                            sx={{
                              bgcolor: alpha(theme.palette.primary.main, 0.09),

                              color: "primary.main",
                            }}
                          >
                            <LockOutlined />
                          </Avatar>

                          <Box
                            sx={{
                              flex: 1,
                            }}
                          >
                            <Typography variant="body2" fontWeight={800}>
                              Session Timeout
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Automatically sign out inactive owner sessions.
                            </Typography>

                            <FormControl
                              fullWidth
                              disabled
                              size="small"
                              sx={{
                                mt: 1.5,
                              }}
                            >
                              <InputLabel>Timeout</InputLabel>

                              <Select value="30" label="Timeout">
                                <MenuItem value="15">15 minutes</MenuItem>

                                <MenuItem value="30">30 minutes</MenuItem>

                                <MenuItem value="60">1 hour</MenuItem>

                                <MenuItem value="120">2 hours</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <SettingToggle
                        icon={VerifiedUserOutlined}
                        title="Two-Factor Authentication"
                        description="Require an additional verification step when an owner signs in."
                        checked={false}
                        disabled
                        badge="Coming soon"
                      />
                    </Grid>
                  </Grid>
                </SectionCard>
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default Settings;
