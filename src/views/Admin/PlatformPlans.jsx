import {
  Add,
  AnalyticsOutlined,
  ApiOutlined,
  ApartmentOutlined,
  AutoAwesomeOutlined,
  BusinessOutlined,
  Check,
  Close,
  EditOutlined,
  GroupsOutlined,
  LocalLibraryOutlined,
  PaletteOutlined,
  Refresh,
  ReportOutlined,
  Search,
  SupportAgentOutlined,
  ToggleOffOutlined,
  ToggleOnOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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

// ============================================================
// BILLING CYCLES
// ============================================================

const BILLING_CYCLES = [
  {
    value: "MONTHLY",
    label: "Monthly",
  },
  {
    value: "QUARTERLY",
    label: "Quarterly",
  },
  {
    value: "HALF_YEARLY",
    label: "Half Yearly",
  },
  {
    value: "YEARLY",
    label: "Yearly",
  },
];

// ============================================================
// EMPTY FORM
// ============================================================

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  currency: "INR",
  billingCycle: "MONTHLY",
  maxLibraries: "",
  maxStudents: "",
  maxSeats: "",
  maxBranches: "",
  analyticsEnabled: true,
  reportsEnabled: true,
  apiAccess: false,
  customBranding: false,
  prioritySupport: false,
  active: true,
};

// ============================================================
// HELPERS
// ============================================================

const displayEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const formatMoney = (amount, currency = "INR") => {
  if (amount === null || amount === undefined || amount === "") {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
};

const toNullableInteger = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

const getEnabledFeatureCount = (plan) => {
  return [
    plan.analyticsEnabled,
    plan.reportsEnabled,
    plan.apiAccess,
    plan.customBranding,
    plan.prioritySupport,
  ].filter(Boolean).length;
};

const getLimitLabel = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Unlimited";
  }

  return Number(value).toLocaleString("en-IN");
};

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ label, value, helper, icon, tone = "primary" }) {
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
        p: 2.4,
        position: "relative",
        overflow: "hidden",
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: alpha(palette.main, 0.12),
        background: `linear-gradient(
          145deg,
          ${theme.palette.background.paper} 0%,
          ${alpha(palette.main, 0.04)} 100%
        )`,
        transition: "all .2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: alpha(palette.main, 0.24),
          boxShadow: `0 16px 34px ${alpha(theme.palette.common.black, 0.07)}`,
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 92,
          height: 92,
          borderRadius: "50%",
          right: -30,
          top: -34,
          bgcolor: alpha(palette.main, 0.07),
        }}
      />

      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={750}>
            {label}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 0.55,
              fontWeight: 900,
              letterSpacing: "-0.035em",
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
            width: 44,
            height: 44,
            borderRadius: 2.3,
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
// FEATURE CHIP
// ============================================================

function FeatureChip({ enabled, label, icon }) {
  const theme = useTheme();

  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      variant="outlined"
      sx={{
        height: 28,
        fontWeight: 750,
        borderColor: enabled
          ? alpha(theme.palette.success.main, 0.28)
          : alpha(theme.palette.text.secondary, 0.13),
        bgcolor: enabled
          ? alpha(theme.palette.success.main, 0.055)
          : alpha(theme.palette.action.hover, 0.28),
        color: enabled ? "success.dark" : "text.disabled",
        "& .MuiChip-icon": {
          color: "inherit",
        },
      }}
    />
  );
}

// ============================================================
// LIMIT ITEM
// ============================================================

function LimitItem({ icon, label, value }) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.35,
        borderRadius: 2.3,
        border: "1px solid",
        borderColor: alpha(theme.palette.primary.main, 0.08),
        bgcolor: alpha(theme.palette.primary.main, 0.018),
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.8,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.07),
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {label}
          </Typography>

          <Typography variant="body2" fontWeight={850}>
            {getLimitLabel(value)}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function PlatformPlans() {
  const theme = useTheme();

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [actionPlanId, setActionPlanId] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [formError, setFormError] = useState("");

  // =========================================================
  // LOAD REAL PLAN DATA
  // =========================================================

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getPlatformPlans();

      setPlans(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Platform plans load failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          "Unable to load platform plans.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  // =========================================================
  // REAL SUMMARY DERIVED FROM API RESPONSE
  // =========================================================

  const summary = useMemo(() => {
    const active = plans.filter((plan) => plan.active === true).length;

    const prices = plans
      .map((plan) => Number(plan.price))
      .filter((price) => Number.isFinite(price) && price > 0);

    const averageEnabledFeatures =
      plans.length > 0
        ? (
            plans.reduce(
              (total, plan) => total + getEnabledFeatureCount(plan),
              0,
            ) / plans.length
          ).toFixed(1)
        : "0.0";

    return {
      total: plans.length,
      active,
      inactive: plans.length - active,
      startingPrice: prices.length > 0 ? Math.min(...prices) : null,
      averageEnabledFeatures,
    };
  }, [plans]);

  // =========================================================
  // FILTER
  // =========================================================

  const filteredPlans = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return plans.filter((plan) => {
      const matchesSearch =
        !normalized ||
        plan.name?.toLowerCase().includes(normalized) ||
        plan.description?.toLowerCase().includes(normalized) ||
        plan.billingCycle?.toLowerCase().includes(normalized);

      const matchesStatus =
        statusFilter === "ALL"
          ? true
          : statusFilter === "ACTIVE"
            ? plan.active === true
            : plan.active === false;

      return matchesSearch && matchesStatus;
    });
  }, [plans, search, statusFilter]);

  // =========================================================
  // FORM
  // =========================================================

  const openCreate = () => {
    setEditingPlan(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);

    setForm({
      name: plan.name || "",
      description: plan.description || "",
      price: plan.price ?? "",
      currency: plan.currency || "INR",
      billingCycle: plan.billingCycle || "MONTHLY",
      maxLibraries: plan.maxLibraries ?? "",
      maxStudents: plan.maxStudents ?? "",
      maxSeats: plan.maxSeats ?? "",
      maxBranches: plan.maxBranches ?? "",
      analyticsEnabled: Boolean(plan.analyticsEnabled),
      reportsEnabled: Boolean(plan.reportsEnabled),
      apiAccess: Boolean(plan.apiAccess),
      customBranding: Boolean(plan.customBranding),
      prioritySupport: Boolean(plan.prioritySupport),
      active: plan.active !== false,
    });

    setFormError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingPlan(null);
    setFormError("");
  };

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setFormError("");
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      return "Plan name is required.";
    }

    if (form.price === "" || Number(form.price) <= 0) {
      return "Plan price must be greater than 0.";
    }

    if (!form.billingCycle) {
      return "Billing cycle is required.";
    }

    const limits = [
      {
        label: "Maximum libraries",
        value: form.maxLibraries,
      },
      {
        label: "Maximum students",
        value: form.maxStudents,
      },
      {
        label: "Maximum seats",
        value: form.maxSeats,
      },
      {
        label: "Maximum branches",
        value: form.maxBranches,
      },
    ];

    for (const item of limits) {
      if (item.value !== "" && Number(item.value) <= 0) {
        return `${item.label} must be greater than 0.`;
      }
    }

    return "";
  };

  const handleSave = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description?.trim() || null,
      price: Number(form.price),
      currency: form.currency || "INR",
      billingCycle: form.billingCycle,
      maxLibraries: toNullableInteger(form.maxLibraries),
      maxStudents: toNullableInteger(form.maxStudents),
      maxSeats: toNullableInteger(form.maxSeats),
      maxBranches: toNullableInteger(form.maxBranches),
      analyticsEnabled: Boolean(form.analyticsEnabled),
      reportsEnabled: Boolean(form.reportsEnabled),
      apiAccess: Boolean(form.apiAccess),
      customBranding: Boolean(form.customBranding),
      prioritySupport: Boolean(form.prioritySupport),
      active: Boolean(form.active),
    };

    try {
      setSaving(true);
      setFormError("");

      let saved;

      if (editingPlan) {
        saved = await adminApi.updatePlatformPlan(editingPlan.id, payload);

        setPlans((previous) =>
          previous.map((plan) => (plan.id === saved.id ? saved : plan)),
        );

        setSuccess("Platform plan updated successfully.");
      } else {
        saved = await adminApi.createPlatformPlan(payload);

        setPlans((previous) => [...previous, saved]);

        setSuccess("Platform plan created successfully.");
      }

      setDialogOpen(false);
      setEditingPlan(null);
    } catch (requestError) {
      console.error("Platform plan save failed:", requestError);

      setFormError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          "Unable to save platform plan.",
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // ACTIVATE / DEACTIVATE REAL PLAN
  // =========================================================

  const handleToggleActive = async (plan) => {
    try {
      setActionPlanId(plan.id);
      setError("");

      const updated = plan.active
        ? await adminApi.deactivatePlatformPlan(plan.id)
        : await adminApi.activatePlatformPlan(plan.id);

      setPlans((previous) =>
        previous.map((item) => (item.id === updated.id ? updated : item)),
      );

      setSuccess(
        updated.active
          ? `${updated.name} activated successfully.`
          : `${updated.name} deactivated successfully.`,
      );
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message ||
          "Unable to change platform plan status.",
      );
    } finally {
      setActionPlanId(null);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box sx={{ pb: 5 }}>
      {/* =================================================== */}
      {/* PREMIUM HERO */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: {
            xs: 2.6,
            md: 3.2,
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
            width: 220,
            height: 220,
            borderRadius: "50%",
            right: -80,
            top: -110,
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
          spacing={2}
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box>
            <Chip
              label="SAAS CATALOG"
              size="small"
              icon={<WorkspacePremiumOutlined />}
              sx={{
                mb: 1.3,
                fontWeight: 850,
                letterSpacing: 0.7,
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
                letterSpacing: "-0.04em",
              }}
            >
              Platform Plans
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.65,
                maxWidth: 760,
                lineHeight: 1.7,
              }}
            >
              Configure LibraryHub pricing, capacity limits and premium
              capabilities using live plan records from your platform backend.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Tooltip title="Reload live plan data">
              <IconButton
                onClick={loadPlans}
                disabled={loading}
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "#FFFFFF",
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.12),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                  },
                }}
              >
                {loading ? <CircularProgress size={18} /> : <Refresh />}
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openCreate}
              sx={{
                minHeight: 44,
                px: 2.4,
                borderRadius: 2.4,
                textTransform: "none",
                fontWeight: 850,
                boxShadow: "0 10px 24px rgba(79,70,229,.20)",
              }}
            >
              Create Plan
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* =================================================== */}
      {/* ALERTS */}
      {/* =================================================== */}

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

      {/* =================================================== */}
      {/* REAL STATISTICS */}
      {/* =================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            label="Total Plans"
            value={summary.total}
            helper="Live plans returned by backend"
            icon={<AutoAwesomeOutlined />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            label="Active Plans"
            value={summary.active}
            helper="Available for subscription"
            icon={<ToggleOnOutlined />}
            tone="success"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            label="Inactive Plans"
            value={summary.inactive}
            helper="Hidden from new subscriptions"
            icon={<ToggleOffOutlined />}
            tone="warning"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            label="Starting Price"
            value={
              summary.startingPrice !== null
                ? formatMoney(
                    summary.startingPrice,
                    plans[0]?.currency || "INR",
                  )
                : "-"
            }
            helper={`${summary.averageEnabledFeatures}/5 avg. enabled features`}
            icon={<WorkspacePremiumOutlined />}
          />
        </Grid>
      </Grid>

      {/* =================================================== */}
      {/* FILTERS */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          bgcolor: "#FFFFFF",
          boxShadow: "0 8px 24px rgba(15,23,42,0.035)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          spacing={1.25}
          alignItems={{
            xs: "stretch",
            md: "center",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search plan name, description or billing cycle..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                "& fieldset": {
                  borderColor: alpha(theme.palette.divider, 0.95),
                },
                "&:hover fieldset": {
                  borderColor: alpha(theme.palette.primary.main, 0.32),
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 3px ${alpha(
                    theme.palette.primary.main,
                    0.08,
                  )}`,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                  borderWidth: 1,
                },
              },
              "& .MuiInputBase-input": {
                py: 0,
                height: 48,
                boxSizing: "border-box",
                fontSize: 14,
                fontWeight: 550,
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1.8,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.06),
                      color: "primary.main",
                    }}
                  >
                    <Search
                      sx={{
                        fontSize: 19,
                      }}
                    />
                  </Box>
                </InputAdornment>
              ),
            }}
          />

          <FormControl
            sx={{
              minWidth: {
                xs: "100%",
                md: 205,
              },
            }}
          >
            <InputLabel>Status</InputLabel>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              sx={{
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                fontWeight: 650,
              }}
            >
              <MenuItem value="ALL">All Plans</MenuItem>

              <MenuItem value="ACTIVE">Active</MenuItem>

              <MenuItem value="INACTIVE">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      {/* =================================================== */}
      {/* CATALOG HEADER */}
      {/* =================================================== */}

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
        spacing={1}
        sx={{
          mb: 1.6,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>
            Plan Catalog
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Showing {filteredPlans.length} of {plans.length} live platform
            plans.
          </Typography>
        </Box>

        {!loading && (
          <Chip
            size="small"
            variant="outlined"
            label={`${summary.active} available`}
            color="success"
            sx={{
              fontWeight: 750,
            }}
          />
        )}
      </Stack>

      {/* =================================================== */}
      {/* LOADING */}
      {/* =================================================== */}

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
            <Grid
              key={item}
              size={{
                xs: 12,
                lg: 6,
              }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Skeleton width="38%" height={32} />

                <Skeleton width="70%" height={22} />

                <Skeleton
                  width="45%"
                  height={54}
                  sx={{
                    mt: 2,
                  }}
                />

                <Skeleton
                  height={150}
                  sx={{
                    mt: 2,
                  }}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : filteredPlans.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            py: 8,
            px: 3,
            textAlign: "center",
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <WorkspacePremiumOutlined
            sx={{
              fontSize: 46,
              color: "text.disabled",
            }}
          />

          <Typography
            variant="h6"
            fontWeight={850}
            sx={{
              mt: 1,
            }}
          >
            No plans found
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Change the filters or create a new platform plan.
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreate}
            sx={{
              mt: 2,
              borderRadius: 2.2,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            Create Plan
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {filteredPlans.map((plan) => {
            const enabledFeatures = getEnabledFeatureCount(plan);

            return (
              <Grid
                key={plan.id}
                size={{
                  xs: 12,
                  lg: 6,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    overflow: "hidden",
                    position: "relative",
                    borderRadius: 3.7,
                    border: "1px solid",
                    borderColor: plan.active
                      ? alpha(theme.palette.primary.main, 0.14)
                      : alpha(theme.palette.text.secondary, 0.12),
                    bgcolor: "#FFFFFF",
                    opacity: plan.active ? 1 : 0.78,
                    transition:
                      "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 20px 44px rgba(15,23,42,.08)",
                      borderColor: alpha(theme.palette.primary.main, 0.28),
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 5,
                      bgcolor: plan.active ? "primary.main" : "action.disabled",
                    }}
                  />

                  <CardContent
                    sx={{
                      p: 2.6,
                      "&:last-child": {
                        pb: 2.6,
                      },
                    }}
                  >
                    {/* HEADER */}

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={2}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Typography variant="h6" fontWeight={900}>
                            {plan.name}
                          </Typography>

                          <Chip
                            size="small"
                            label={plan.active ? "ACTIVE" : "INACTIVE"}
                            color={plan.active ? "success" : "default"}
                            variant={plan.active ? "filled" : "outlined"}
                            sx={{
                              height: 23,
                              fontSize: 10,
                              fontWeight: 850,
                            }}
                          />

                          <Chip
                            size="small"
                            label={`#${plan.id}`}
                            variant="outlined"
                            sx={{
                              height: 23,
                              fontSize: 10,
                              fontWeight: 750,
                              color: "text.secondary",
                            }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.75,
                            lineHeight: 1.65,
                            minHeight: 42,
                          }}
                        >
                          {plan.description || "No description provided."}
                        </Typography>
                      </Box>

                      <Tooltip title="Edit plan">
                        <IconButton
                          onClick={() => openEdit(plan)}
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            color: "primary.main",
                            "&:hover": {
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                          }}
                        >
                          <EditOutlined />
                        </IconButton>
                      </Tooltip>
                    </Stack>

                    {/* PRICE */}

                    <Box
                      sx={{
                        mt: 2.2,
                        p: 2,
                        borderRadius: 3,
                        background:
                          "linear-gradient(135deg, rgba(79,70,229,.08), rgba(37,99,235,.035))",
                        border: "1px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    >
                      <Stack
                        direction={{
                          xs: "column",
                          sm: "row",
                        }}
                        justifyContent="space-between"
                        spacing={1}
                        alignItems={{
                          xs: "flex-start",
                          sm: "flex-end",
                        }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={750}
                          >
                            Subscription price
                          </Typography>

                          <Stack
                            direction="row"
                            alignItems="baseline"
                            spacing={0.8}
                            sx={{
                              mt: 0.2,
                            }}
                          >
                            <Typography
                              variant="h4"
                              fontWeight={950}
                              color="primary.main"
                            >
                              {formatMoney(plan.price, plan.currency)}
                            </Typography>

                            <Typography
                              variant="body2"
                              color="text.secondary"
                              fontWeight={650}
                            >
                              / {displayEnum(plan.billingCycle)}
                            </Typography>
                          </Stack>
                        </Box>

                        <Chip
                          label={`${enabledFeatures}/5 features enabled`}
                          size="small"
                          variant="outlined"
                          sx={{
                            fontWeight: 750,
                            bgcolor: "#FFFFFF",
                          }}
                        />
                      </Stack>
                    </Box>

                    {/* LIMITS */}

                    <Typography
                      variant="subtitle2"
                      fontWeight={850}
                      sx={{
                        mt: 2.3,
                        mb: 1.2,
                      }}
                    >
                      Usage Limits
                    </Typography>

                    <Grid container spacing={1}>
                      <Grid
                        size={{
                          xs: 6,
                        }}
                      >
                        <LimitItem
                          icon={<LocalLibraryOutlined fontSize="small" />}
                          label="Libraries"
                          value={plan.maxLibraries}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 6,
                        }}
                      >
                        <LimitItem
                          icon={<GroupsOutlined fontSize="small" />}
                          label="Students"
                          value={plan.maxStudents}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 6,
                        }}
                      >
                        <LimitItem
                          icon={<BusinessOutlined fontSize="small" />}
                          label="Seats"
                          value={plan.maxSeats}
                        />
                      </Grid>

                      <Grid
                        size={{
                          xs: 6,
                        }}
                      >
                        <LimitItem
                          icon={<ApartmentOutlined fontSize="small" />}
                          label="Branches"
                          value={plan.maxBranches}
                        />
                      </Grid>
                    </Grid>

                    {/* FEATURES */}

                    <Typography
                      variant="subtitle2"
                      fontWeight={850}
                      sx={{
                        mt: 2.3,
                        mb: 1.2,
                      }}
                    >
                      Included Capabilities
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={0.8}
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <FeatureChip
                        enabled={plan.analyticsEnabled}
                        label="Analytics"
                        icon={<AnalyticsOutlined />}
                      />

                      <FeatureChip
                        enabled={plan.reportsEnabled}
                        label="Reports"
                        icon={<ReportOutlined />}
                      />

                      <FeatureChip
                        enabled={plan.apiAccess}
                        label="API Access"
                        icon={<ApiOutlined />}
                      />

                      <FeatureChip
                        enabled={plan.customBranding}
                        label="Branding"
                        icon={<PaletteOutlined />}
                      />

                      <FeatureChip
                        enabled={plan.prioritySupport}
                        label="Priority Support"
                        icon={<SupportAgentOutlined />}
                      />
                    </Stack>

                    <Divider
                      sx={{
                        my: 2.3,
                      }}
                    />

                    {/* ACTIONS */}

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
                      spacing={1}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Changes are persisted through the platform plan API.
                      </Typography>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          startIcon={<EditOutlined />}
                          onClick={() => openEdit(plan)}
                          sx={{
                            borderRadius: 2.2,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          variant={plan.active ? "outlined" : "contained"}
                          color={plan.active ? "error" : "success"}
                          disabled={actionPlanId === plan.id}
                          startIcon={
                            actionPlanId === plan.id ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : plan.active ? (
                              <ToggleOffOutlined />
                            ) : (
                              <ToggleOnOutlined />
                            )
                          }
                          onClick={() => handleToggleActive(plan)}
                          sx={{
                            borderRadius: 2.2,
                            textTransform: "none",
                            fontWeight: 800,
                          }}
                        >
                          {plan.active ? "Deactivate" : "Activate"}
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* =================================================== */}
      {/* CREATE / EDIT DIALOG */}
      {/* =================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 30px 90px rgba(15,23,42,.22)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            px: {
              xs: 2.5,
              md: 3,
            },
            py: 2.5,
            color: "#FFFFFF",
            background:
              "linear-gradient(135deg, #312E81 0%, #4F46E5 60%, #2563EB 100%)",
          }}
        >
          <IconButton
            disabled={saving}
            onClick={closeDialog}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "rgba(255,255,255,.88)",
              "&:hover": {
                bgcolor: "rgba(255,255,255,.10)",
              },
            }}
          >
            <Close />
          </IconButton>

          <Typography
            variant="overline"
            sx={{
              opacity: 0.72,
              fontWeight: 850,
              letterSpacing: 0.8,
            }}
          >
            PLATFORM PLAN
          </Typography>

          <Typography variant="h5" fontWeight={900}>
            {editingPlan ? "Edit Platform Plan" : "Create Platform Plan"}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.4,
              color: "rgba(255,255,255,.74)",
            }}
          >
            Configure real pricing, capacity limits and features.
          </Typography>
        </Box>

        <DialogContent
          dividers
          sx={{
            p: {
              xs: 2.2,
              md: 3,
            },
            bgcolor: "#F8FAFD",
          }}
        >
          {formError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                borderRadius: 2.5,
              }}
            >
              {formError}
            </Alert>
          )}

          <Stack spacing={2.5}>
            {/* BASIC */}

            <Paper
              elevation={0}
              sx={{
                p: 2.3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" fontWeight={850}>
                Basic Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.3,
                  mb: 2,
                }}
              >
                Define the commercial identity of this plan.
              </Typography>

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    required
                    label="Plan Name"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    required
                    type="number"
                    label="Price"
                    name="price"
                    value={form.price}
                    inputProps={{
                      min: 0,
                    }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 3,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Currency"
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <FormControl fullWidth required>
                    <InputLabel>Billing Cycle</InputLabel>

                    <Select
                      label="Billing Cycle"
                      name="billingCycle"
                      value={form.billingCycle}
                      onChange={handleChange}
                    >
                      {BILLING_CYCLES.map((item) => (
                        <MenuItem key={item.value} value={item.value}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Description"
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* LIMITS */}

            <Paper
              elevation={0}
              sx={{
                p: 2.3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" fontWeight={850}>
                Usage Limits
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.3,
                  mb: 2,
                }}
              >
                Leave a field empty when the backend should treat the resource
                as unlimited.
              </Typography>

              <Grid container spacing={2}>
                {[
                  {
                    label: "Maximum Libraries",
                    name: "maxLibraries",
                    value: form.maxLibraries,
                  },
                  {
                    label: "Maximum Students",
                    name: "maxStudents",
                    value: form.maxStudents,
                  },
                  {
                    label: "Maximum Seats",
                    name: "maxSeats",
                    value: form.maxSeats,
                  },
                  {
                    label: "Maximum Branches",
                    name: "maxBranches",
                    value: form.maxBranches,
                  },
                ].map((item) => (
                  <Grid
                    key={item.name}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <TextField
                      fullWidth
                      type="number"
                      label={item.label}
                      name={item.name}
                      value={item.value}
                      inputProps={{
                        min: 1,
                      }}
                      onChange={handleChange}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* FEATURES */}

            <Paper
              elevation={0}
              sx={{
                p: 2.3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle1" fontWeight={850}>
                Included Capabilities
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.3,
                  mb: 1.5,
                }}
              >
                These switches are persisted directly as plan feature flags.
              </Typography>

              <Grid container spacing={1}>
                {[
                  {
                    name: "analyticsEnabled",
                    label: "Analytics",
                    checked: form.analyticsEnabled,
                  },
                  {
                    name: "reportsEnabled",
                    label: "Reports",
                    checked: form.reportsEnabled,
                  },
                  {
                    name: "apiAccess",
                    label: "API Access",
                    checked: form.apiAccess,
                  },
                  {
                    name: "customBranding",
                    label: "Custom Branding",
                    checked: form.customBranding,
                  },
                  {
                    name: "prioritySupport",
                    label: "Priority Support",
                    checked: form.prioritySupport,
                  },
                ].map((feature) => (
                  <Grid
                    key={feature.name}
                    size={{
                      xs: 12,
                      sm: 6,
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 2.2,
                        border: "1px solid",
                        borderColor: feature.checked
                          ? alpha(theme.palette.success.main, 0.2)
                          : "divider",
                        bgcolor: feature.checked
                          ? alpha(theme.palette.success.main, 0.035)
                          : "#FFFFFF",
                      }}
                    >
                      <FormControlLabel
                        sx={{
                          m: 0,
                          width: "100%",
                        }}
                        control={
                          <Switch
                            name={feature.name}
                            checked={feature.checked}
                            onChange={handleChange}
                          />
                        }
                        label={
                          <Typography fontWeight={750}>
                            {feature.label}
                          </Typography>
                        }
                      />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* AVAILABILITY */}

            <Paper
              elevation={0}
              sx={{
                p: 2.3,
                borderRadius: 3,
                border: "1px solid",
                borderColor: form.active
                  ? alpha(theme.palette.success.main, 0.2)
                  : alpha(theme.palette.warning.main, 0.2),
                bgcolor: form.active
                  ? alpha(theme.palette.success.main, 0.035)
                  : alpha(theme.palette.warning.main, 0.035),
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
                spacing={1}
              >
                <Box>
                  <Typography fontWeight={850}>Availability</Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.25,
                    }}
                  >
                    {form.active
                      ? "This plan is available for new subscriptions."
                      : "This plan is hidden from new subscriptions."}
                  </Typography>
                </Box>

                <Switch
                  name="active"
                  checked={form.active}
                  onChange={handleChange}
                  color="success"
                />
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 1.8,
          }}
        >
          <Button
            disabled={saving}
            onClick={closeDialog}
            variant="outlined"
            sx={{
              borderRadius: 2.2,
              textTransform: "none",
              fontWeight: 750,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Check />
              )
            }
            onClick={handleSave}
            sx={{
              minWidth: 140,
              borderRadius: 2.2,
              textTransform: "none",
              fontWeight: 850,
            }}
          >
            {editingPlan ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PlatformPlans;
