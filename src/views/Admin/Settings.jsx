import {
  AdminPanelSettingsOutlined,
  AttachMoneyOutlined,
  BusinessOutlined,
  EmailOutlined,
  PublicOutlined,
  RefreshOutlined,
  SaveOutlined,
  SettingsOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControlLabel,
  Grid,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";

import adminApi from "../../api/adminApi";

// ============================================================
// DEFAULT FORM
// ============================================================

const DEFAULT_FORM = {
  platformName: "LibraryHub",

  supportEmail: "",

  supportPhone: "",

  maintenanceMode: false,

  allowLibraryRegistration: true,

  allowUserRegistration: true,

  defaultCurrency: "INR",

  platformFeePercentage: 1.95,

  taxPercentage: 18,

  timezone: "Asia/Kolkata",
};

// ============================================================
// COMPONENT
// ============================================================

function Settings() {
  const [form, setForm] = useState(DEFAULT_FORM);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // LOAD SETTINGS
  // =========================================================

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await adminApi.getPlatformSettings();

      setForm({
        platformName: response?.platformName ?? "LibraryHub",

        supportEmail: response?.supportEmail ?? "",

        supportPhone: response?.supportPhone ?? "",

        maintenanceMode: Boolean(response?.maintenanceMode),

        allowLibraryRegistration: response?.allowLibraryRegistration !== false,

        allowUserRegistration: response?.allowUserRegistration !== false,

        defaultCurrency: response?.defaultCurrency ?? "INR",

        platformFeePercentage: response?.platformFeePercentage ?? 1.95,

        taxPercentage: response?.taxPercentage ?? 18,

        timezone: response?.timezone ?? "Asia/Kolkata",
      });
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
  // SAVE
  // =========================================================

  const handleSave = async () => {
    if (!form.platformName?.trim()) {
      setError("Platform name is required.");

      return;
    }

    if (Number(form.platformFeePercentage) < 0) {
      setError("Platform fee cannot be negative.");

      return;
    }

    if (Number(form.taxPercentage) < 0) {
      setError("Tax percentage cannot be negative.");

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

        platformFeePercentage: Number(form.platformFeePercentage),

        taxPercentage: Number(form.taxPercentage),

        timezone: form.timezone.trim(),
      };

      const response = await adminApi.updatePlatformSettings(payload);

      setForm({
        platformName: response.platformName,

        supportEmail: response.supportEmail ?? "",

        supportPhone: response.supportPhone ?? "",

        maintenanceMode: Boolean(response.maintenanceMode),

        allowLibraryRegistration: Boolean(response.allowLibraryRegistration),

        allowUserRegistration: Boolean(response.allowUserRegistration),

        defaultCurrency: response.defaultCurrency,

        platformFeePercentage: response.platformFeePercentage,

        taxPercentage: response.taxPercentage,

        timezone: response.timezone,
      });

      setSuccess("Platform settings updated successfully.");
    } catch (requestError) {
      console.error("Platform settings update failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
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
      <Stack
        minHeight={450}
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading platform settings...
        </Typography>
      </Stack>
    );
  }

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box
      sx={{
        pb: 5,
      }}
    >
      {/* HEADER */}

      <Stack
        direction={{
          xs: "column",

          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          md: "center",
        }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Platform Settings
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Configure global LibraryHub behavior and platform defaults.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshOutlined />}
          onClick={loadSettings}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
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
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      <Stack spacing={3}>
        {/* GENERAL */}

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <SettingsOutlined color="primary" />

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  General
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Basic platform identity and support details.
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <BusinessOutlined />
                      </InputAdornment>
                    ),
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlined />
                      </InputAdornment>
                    ),
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
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicOutlined />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* ACCESS */}

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <AdminPanelSettingsOutlined color="primary" />

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Platform Access
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Control platform availability and registrations.
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.maintenanceMode}
                    name="maintenanceMode"
                    onChange={handleChange}
                  />
                }
                label="Maintenance Mode"
              />

              <Typography variant="caption" color="text.secondary" ml={6}>
                Marks the platform as being under maintenance.
              </Typography>

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.allowLibraryRegistration}
                    name="allowLibraryRegistration"
                    onChange={handleChange}
                  />
                }
                label="Allow New Library Registration"
              />

              <Divider />

              <FormControlLabel
                control={
                  <Switch
                    checked={form.allowUserRegistration}
                    name="allowUserRegistration"
                    onChange={handleChange}
                  />
                }
                label="Allow New User Registration"
              />
            </Stack>
          </CardContent>
        </Card>

        {/* FINANCIAL */}

        <Card variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <AttachMoneyOutlined color="primary" />

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Financial Configuration
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Configure platform-wide financial defaults.
                </Typography>
              </Box>
            </Stack>

            <Grid container spacing={2}>
              <Grid
                size={{
                  xs: 12,

                  md: 4,
                }}
              >
                <TextField
                  required
                  fullWidth
                  label="Default Currency"
                  name="defaultCurrency"
                  value={form.defaultCurrency}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,

                  md: 4,
                }}
              >
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Platform Fee"
                  name="platformFeePercentage"
                  value={form.platformFeePercentage}
                  onChange={handleChange}
                  inputProps={{
                    min: 0,

                    step: 0.01,
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,

                  md: 4,
                }}
              >
                <TextField
                  required
                  fullWidth
                  type="number"
                  label="Applicable Tax"
                  name="taxPercentage"
                  value={form.taxPercentage}
                  onChange={handleChange}
                  inputProps={{
                    min: 0,

                    step: 0.01,
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">%</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Alert
              severity="info"
              sx={{
                mt: 2,
              }}
            >
              Current platform fee:{" "}
              <strong>{form.platformFeePercentage}%</strong> + applicable tax.
            </Alert>
          </CardContent>
        </Card>

        {/* SAVE */}

        <Stack direction="row" justifyContent="flex-end">
          <Button
            size="large"
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            onClick={handleSave}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}

export default Settings;
