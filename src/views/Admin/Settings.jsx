import {
  AdminPanelSettingsOutlined,
  AttachMoneyOutlined,
  BusinessOutlined,
  CheckCircleOutlineOutlined,
  EmailOutlined,
  InfoOutlined,
  LockOutlined,
  PublicOutlined,
  RefreshOutlined,
  RestartAltOutlined,
  SaveOutlined,
  SchoolOutlined,
  SecurityOutlined,
  SettingsOutlined,
  WarningAmberOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Paper,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import adminApi from "../../api/adminApi";
import usePlatformConfig, { publishPlatformConfig } from "../../api/usePlatformConfig";


// ============================================================
// DEFAULT FORM
// ============================================================

const DEFAULT_FORM = {
  platformName: "{platformName}",
  supportEmail: "",
  supportPhone: "",
  maintenanceMode: false,
  allowLibraryRegistration: true,
  allowUserRegistration: true,
  defaultCurrency: "INR",
  taxPercentage: 18,
  timezone: "Asia/Kolkata",
};

// ============================================================
// HELPERS
// ============================================================

const normalizeSettings = (response) => ({
  platformName: response?.platformName ?? "{platformName}",

  supportEmail: response?.supportEmail ?? "",

  supportPhone: response?.supportPhone ?? "",

  maintenanceMode: Boolean(response?.maintenanceMode),

  allowLibraryRegistration: response?.allowLibraryRegistration !== false,

  allowUserRegistration: response?.allowUserRegistration !== false,

  defaultCurrency: response?.defaultCurrency ?? "INR",

  taxPercentage: response?.taxPercentage ?? 18,

  timezone: response?.timezone ?? "Asia/Kolkata",
});

const stableSettingsString = (settings) =>
  JSON.stringify({
    platformName: settings.platformName ?? "",

    supportEmail: settings.supportEmail ?? "",

    supportPhone: settings.supportPhone ?? "",

    maintenanceMode: Boolean(settings.maintenanceMode),

    allowLibraryRegistration: Boolean(settings.allowLibraryRegistration),

    allowUserRegistration: Boolean(settings.allowUserRegistration),

    defaultCurrency: settings.defaultCurrency ?? "",

    taxPercentage: Number(settings.taxPercentage ?? 0),

    timezone: settings.timezone ?? "",
  });

// ============================================================
// STATUS TILE
// ============================================================

function StatusTile({ title, value, helper, icon, tone = "primary" }) {
  const theme = useTheme();

  const palette =
    tone === "success"
      ? theme.palette.success
      : tone === "warning"
        ? theme.palette.warning
        : tone === "error"
          ? theme.palette.error
          : theme.palette.primary;

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alpha(palette.main, 0.14),
        background: `linear-gradient(
          145deg,
          ${theme.palette.background.paper} 0%,
          ${alpha(palette.main, 0.04)} 100%
        )`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={750}>
            {title}
          </Typography>

          <Typography
            variant="h6"
            fontWeight={900}
            sx={{
              mt: 0.3,
            }}
          >
            {value}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(palette.main, 0.1),
            color: palette.main,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// ACCESS SWITCH
// ============================================================

function SettingSwitchRow({
  checked,
  name,
  title,
  description,
  onChange,
  tone = "primary",
  disabled = false,
}) {
  const theme = useTheme();

  const palette =
    tone === "warning"
      ? theme.palette.warning
      : tone === "success"
        ? theme.palette.success
        : theme.palette.primary;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.8,
        borderRadius: 2.8,
        border: "1px solid",
        borderColor: checked ? alpha(palette.main, 0.22) : "divider",
        bgcolor: checked ? alpha(palette.main, 0.035) : "#FFFFFF",
        transition: "all .2s ease",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
      >
        <Box>
          <Typography fontWeight={850}>{title}</Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.3,
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>
        </Box>

        <Switch
          checked={checked}
          name={name}
          onChange={onChange}
          disabled={disabled}
          color={
            tone === "warning"
              ? "warning"
              : tone === "success"
                ? "success"
                : "primary"
          }
        />
      </Stack>
    </Paper>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Settings() {
  const theme = useTheme();

  const [form, setForm] = useState(DEFAULT_FORM);

  const [originalForm, setOriginalForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const { platformName } = usePlatformConfig();

  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getPlatformSettings();

      const normalized = normalizeSettings(response);

      setForm(normalized);
      setOriginalForm(normalized);
    } catch (requestError) {
      console.error("Platform settings load failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load platform settings.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // =========================================================
  // DERIVED
  // =========================================================

  const hasChanges = useMemo(
    () => stableSettingsString(form) !== stableSettingsString(originalForm),
    [form, originalForm],
  );

  const platformOperational = !form.maintenanceMode;

  const registrationOpen =
    form.allowLibraryRegistration || form.allowUserRegistration;

  // =========================================================
  // CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));

    setSuccess("");
    setError("");
  };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {
    setForm(originalForm);
    setSuccess("");
    setError("");
  };

  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (!form.platformName?.trim()) {
      setError("Platform name is required.");

      return;
    }

    const tax = Number(form.taxPercentage);

    if (!Number.isFinite(tax) || tax < 0 || tax > 100) {
      setError("Tax percentage must be between 0 and 100.");

      return;
    }

    if (!form.defaultCurrency?.trim()) {
      setError("Default currency is required.");

      return;
    }

    if (!form.timezone?.trim()) {
      setError("Timezone is required.");

      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        platformName: form.platformName.trim(),

        supportEmail: form.supportEmail?.trim() || null,

        supportPhone: form.supportPhone?.trim() || null,

        maintenanceMode: Boolean(form.maintenanceMode),

        allowLibraryRegistration: Boolean(form.allowLibraryRegistration),

        allowUserRegistration: Boolean(form.allowUserRegistration),

        defaultCurrency: form.defaultCurrency.trim().toUpperCase(),

        taxPercentage: tax,

        timezone: form.timezone.trim(),
      };

      const response = await adminApi.updatePlatformSettings(payload);

      const normalized = normalizeSettings(response);

      setForm(normalized);
      setOriginalForm(normalized);

      publishPlatformConfig(normalized);

      setSuccess("Platform settings updated successfully.");
    } catch (requestError) {
      console.error("Platform settings update failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          "Unable to update platform settings.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Box sx={{ pb: 5 }}>
        <Skeleton
          variant="rounded"
          height={170}
          sx={{
            borderRadius: 4,
            mb: 3,
          }}
        />

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[1, 2, 3, 4].map((item) => (
            <Grid
              key={item}
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <Skeleton
                variant="rounded"
                height={120}
                sx={{
                  borderRadius: 3,
                }}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={3}>
          <Grid
            size={{
              xs: 12,
              lg: 7,
            }}
          >
            <Skeleton
              variant="rounded"
              height={440}
              sx={{
                borderRadius: 4,
              }}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            <Skeleton
              variant="rounded"
              height={440}
              sx={{
                borderRadius: 4,
              }}
            />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box sx={{ pb: 8 }}>
      {/* PREMIUM HERO */}

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: {
            xs: 2.6,
            md: 3.3,
          },
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background:
            "linear-gradient(135deg, #F8FAFF 0%, #F3F1FF 48%, #EEF5FF 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 230,
            height: 230,
            borderRadius: "50%",
            right: -80,
            top: -115,
            bgcolor: alpha(theme.palette.primary.main, 0.07),
          }}
        />

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
          spacing={2.5}
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                minWidth: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 10px 26px rgba(79,70,229,.22)",
              }}
            >
              <SettingsOutlined />
            </Box>

            <Box>
              <Chip
                label="PLATFORM CONTROL"
                size="small"
                icon={<WorkspacePremiumOutlined />}
                sx={{
                  mb: 1,
                  fontWeight: 850,
                  letterSpacing: 0.6,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                  "& .MuiChip-icon": {
                    color: "inherit",
                  },
                }}
              />

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  letterSpacing: "-0.035em",
                }}
              >
                Platform Settings
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.45,
                  lineHeight: 1.65,
                }}
              >
                Configure platform identity, access controls and {platformName}
                platform-subscription billing.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {hasChanges && (
              <Chip
                label="Unsaved changes"
                color="warning"
                variant="outlined"
                sx={{
                  bgcolor: "#FFFFFF",
                  fontWeight: 800,
                }}
              />
            )}

            <Tooltip title="Reload saved platform settings">
              <Button
                variant="outlined"
                startIcon={<RefreshOutlined />}
                onClick={loadSettings}
                disabled={saving}
                sx={{
                  minHeight: 42,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 750,
                  bgcolor: "#FFFFFF",
                }}
              >
                Refresh
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
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
          sx={{
            mb: 2,
            borderRadius: 2.5,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* LIVE STATUS */}

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatusTile
            title="Platform Status"
            value={platformOperational ? "Operational" : "Maintenance"}
            helper={
              platformOperational
                ? "Normal platform access"
                : "Non-admin login restricted"
            }
            icon={
              platformOperational ? (
                <CheckCircleOutlineOutlined />
              ) : (
                <WarningAmberOutlined />
              )
            }
            tone={platformOperational ? "success" : "warning"}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatusTile
            title="Library Registration"
            value={form.allowLibraryRegistration ? "Open" : "Closed"}
            helper="New tenant registrations"
            icon={<BusinessOutlined />}
            tone={form.allowLibraryRegistration ? "success" : "warning"}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatusTile
            title="User Registration"
            value={form.allowUserRegistration ? "Open" : "Closed"}
            helper="New student/member accounts"
            icon={<AdminPanelSettingsOutlined />}
            tone={form.allowUserRegistration ? "success" : "warning"}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatusTile
            title="Platform Tax"
            value={`${Number(form.taxPercentage || 0).toFixed(2)}%`}
            helper="Owner platform subscription only"
            icon={<AttachMoneyOutlined />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* LEFT */}

        <Grid
          size={{
            xs: 12,
            lg: 7,
          }}
        >
          <Stack spacing={3}>
            {/* GENERAL */}

            <Paper
              elevation={0}
              sx={{
                p: 2.7,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#FFFFFF",
              }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                sx={{ mb: 2.4 }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                >
                  <SettingsOutlined />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    General
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Platform identity, support contacts and regional defaults.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    required
                    fullWidth
                    label="Platform Name"
                    name="platformName"
                    value={form.platformName}
                    onChange={handleChange}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <BusinessOutlined />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    type="email"
                    label="Support Email"
                    name="supportEmail"
                    value={form.supportEmail}
                    onChange={handleChange}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <EmailOutlined />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Support Phone"
                    name="supportPhone"
                    value={form.supportPhone}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    required
                    fullWidth
                    label="Timezone"
                    name="timezone"
                    value={form.timezone}
                    onChange={handleChange}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <PublicOutlined />
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* BILLING POLICY */}

            <Paper
              elevation={0}
              sx={{
                p: 2.7,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#FFFFFF",
              }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                sx={{ mb: 2.4 }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.success.main, 0.08),
                    color: "success.main",
                  }}
                >
                  <AttachMoneyOutlined />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Platform Subscription Billing
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Financial defaults used when a library owner purchases
                    {platformName}.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    required
                    fullWidth
                    label="Default Currency"
                    name="defaultCurrency"
                    value={form.defaultCurrency}
                    onChange={handleChange}
                    helperText="Used for {platformName} platform subscription payments."
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    required
                    fullWidth
                    type="number"
                    label="Platform Subscription Tax"
                    name="taxPercentage"
                    value={form.taxPercentage}
                    onChange={handleChange}
                    helperText="Applied only to the {platformName} plan purchased by a library owner."
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        max: 100,
                        step: 0.01,
                      },

                      input: {
                        endAdornment: (
                          <InputAdornment position="end">%</InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Alert
                icon={<InfoOutlined />}
                severity="info"
                sx={{
                  mt: 2,
                  borderRadius: 2.5,
                }}
              >
                Library owners pay{" "}
                <strong>
                  Platform Plan Price +{" "}
                  {Number(form.taxPercentage || 0).toFixed(2)}% tax
                </strong>
                . No separate {platformName} percentage fee is added.
              </Alert>

              <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      height: "100%",
                      borderRadius: 2.7,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.success.main, 0.2),
                      bgcolor: alpha(theme.palette.success.main, 0.035),
                    }}
                  >
                    <Stack direction="row" spacing={1.2}>
                      <CheckCircleOutlineOutlined color="success" />

                      <Box>
                        <Typography fontWeight={850}>
                          Student Payments
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.35,
                            lineHeight: 1.6,
                          }}
                        >
                          Booking, membership and member renewal payments
                          receive no {platformName} service fee and no
                          {platformName}-added tax.
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.8,
                      height: "100%",
                      borderRadius: 2.7,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.18),
                      bgcolor: alpha(theme.palette.primary.main, 0.03),
                    }}
                  >
                    <Stack direction="row" spacing={1.2}>
                      <SchoolOutlined color="primary" />

                      <Box>
                        <Typography fontWeight={850}>Library Owner</Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.35,
                            lineHeight: 1.6,
                          }}
                        >
                          Platform subscriptions use the plan price as the
                          taxable base and apply the configured platform tax.
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>
          </Stack>
        </Grid>

        {/* RIGHT */}

        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <Stack spacing={3}>
            {/* ACCESS */}

            <Paper
              elevation={0}
              sx={{
                p: 2.7,
                borderRadius: 4,
                border: "1px solid",
                borderColor: form.maintenanceMode
                  ? alpha(theme.palette.warning.main, 0.25)
                  : "divider",
                bgcolor: "#FFFFFF",
              }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                sx={{ mb: 2.2 }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                >
                  <SecurityOutlined />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Platform Access
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Control availability and registration access.
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={1.3}>
                <SettingSwitchRow
                  checked={form.maintenanceMode}
                  name="maintenanceMode"
                  onChange={handleChange}
                  title="Maintenance Mode"
                  description={
                    form.maintenanceMode
                      ? "Non-admin login and new registrations are blocked."
                      : "Platform is available for normal operation."
                  }
                  tone="warning"
                  disabled={saving}
                />

                <SettingSwitchRow
                  checked={form.allowLibraryRegistration}
                  name="allowLibraryRegistration"
                  onChange={handleChange}
                  title="Allow New Library Registration"
                  description="Controls both owner registration and complete library-registration onboarding."
                  tone="success"
                  disabled={saving}
                />

                <SettingSwitchRow
                  checked={form.allowUserRegistration}
                  name="allowUserRegistration"
                  onChange={handleChange}
                  title="Allow New User Registration"
                  description="Controls new student/member account registration."
                  tone="success"
                  disabled={saving}
                />
              </Stack>
            </Paper>

            {/* STATUS */}

            <Paper
              elevation={0}
              sx={{
                p: 2.7,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "#FFFFFF",
              }}
            >
              <Stack direction="row" spacing={1.2} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                >
                  <LockOutlined />
                </Box>

                <Box>
                  <Typography fontWeight={900}>Configuration Status</Typography>

                  <Typography variant="body2" color="text.secondary">
                    Current saved and edited platform state.
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1.2}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    Unsaved Changes
                  </Typography>

                  <Chip
                    size="small"
                    label={hasChanges ? "Yes" : "No"}
                    color={hasChanges ? "warning" : "success"}
                    variant="outlined"
                    sx={{
                      fontWeight: 750,
                    }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    Registration
                  </Typography>

                  <Chip
                    size="small"
                    label={registrationOpen ? "Open" : "Closed"}
                    color={registrationOpen ? "success" : "warning"}
                    variant="outlined"
                    sx={{
                      fontWeight: 750,
                    }}
                  />
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    Platform Currency
                  </Typography>

                  <Typography variant="body2" fontWeight={850}>
                    {form.defaultCurrency}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    Platform Tax
                  </Typography>

                  <Typography variant="body2" fontWeight={850}>
                    {Number(form.taxPercentage || 0).toFixed(2)}%
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Typography variant="body2" color="text.secondary">
                    Timezone
                  </Typography>

                  <Typography variant="body2" fontWeight={850}>
                    {form.timezone}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* STICKY SAVE BAR */}

      <Paper
        elevation={8}
        sx={{
          position: "sticky",
          bottom: 16,
          zIndex: 5,
          mt: 3,
          p: 1.4,
          borderRadius: 3.2,
          border: "1px solid",
          borderColor: hasChanges
            ? alpha(theme.palette.warning.main, 0.25)
            : alpha(theme.palette.success.main, 0.18),
          bgcolor: alpha(theme.palette.background.paper, 0.96),
          backdropFilter: "blur(12px)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "stretch",
            sm: "center",
          }}
          spacing={1.5}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {hasChanges ? (
              <WarningAmberOutlined color="warning" />
            ) : (
              <CheckCircleOutlineOutlined color="success" />
            )}

            <Box>
              <Typography fontWeight={850}>
                {hasChanges
                  ? "You have unsaved changes"
                  : "All settings are saved"}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {hasChanges
                  ? "Review and save the settings to apply them across {platformName}."
                  : "Current form matches the latest persisted platform settings."}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RestartAltOutlined />}
              disabled={saving || !hasChanges}
              onClick={handleReset}
              sx={{
                borderRadius: 2.4,
                textTransform: "none",
                fontWeight: 750,
              }}
            >
              Reset
            </Button>

            <Button
              variant="contained"
              disabled={saving || !hasChanges}
              startIcon={
                saving ? (
                  <CircularProgress size={17} color="inherit" />
                ) : (
                  <SaveOutlined />
                )
              }
              onClick={handleSave}
              sx={{
                minWidth: 150,
                borderRadius: 2.4,
                textTransform: "none",
                fontWeight: 850,
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Settings;
