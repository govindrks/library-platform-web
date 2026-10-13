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
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
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
  if (amount === null || amount === undefined) {
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

// ============================================================
// FEATURE ITEM
// ============================================================

function FeatureItem({ enabled, label, icon }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Box
        sx={{
          width: 30,

          height: 30,

          borderRadius: 1.5,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          bgcolor: enabled ? "success.light" : "action.hover",

          color: enabled ? "success.dark" : "text.disabled",
        }}
      >
        {icon}
      </Box>

      <Typography
        variant="body2"
        color={enabled ? "text.primary" : "text.disabled"}
      >
        {label}
      </Typography>

      {enabled && (
        <Check
          color="success"
          sx={{
            fontSize: 17,
          }}
        />
      )}
    </Stack>
  );
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ label, value, icon }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>

            <Typography variant="h4" fontWeight={800} mt={0.5}>
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 46,

              height: 46,

              borderRadius: 2,

              bgcolor: "action.hover",

              color: "primary.main",

              display: "flex",

              justifyContent: "center",

              alignItems: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function PlatformPlans() {
  // =========================================================
  // STATE
  // =========================================================

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
  // LOAD
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
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const active = plans.filter((plan) => plan.active === true).length;

    return {
      total: plans.length,

      active,

      inactive: plans.length - active,
    };
  }, [plans]);

  // =========================================================
  // FILTERED PLANS
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
  // OPEN CREATE
  // =========================================================

  const openCreate = () => {
    setEditingPlan(null);

    setForm(EMPTY_FORM);

    setFormError("");

    setDialogOpen(true);
  };

  // =========================================================
  // OPEN EDIT
  // =========================================================

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

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));

    setFormError("");
  };

  // =========================================================
  // VALIDATE
  // =========================================================

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

  // =========================================================
  // SAVE
  // =========================================================

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
  // TOGGLE ACTIVE
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
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Stack
        minHeight={450}
        alignItems="center"
        justifyContent="center"
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading platform plans...
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
      {/* =================================================
                HEADER
            ================================================= */}

      <Stack
        direction={{
          xs: "column",

          md: "row",
        }}
        alignItems={{
          md: "center",
        }}
        justifyContent="space-between"
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Platform Plans
          </Typography>

          <Typography color="text.secondary">
            Configure pricing, usage limits and features available to library
            owners.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={loadPlans}>
              <Refresh />
            </IconButton>
          </Tooltip>

          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
            Create Plan
          </Button>
        </Stack>
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

      {/* =================================================
                STATS
            ================================================= */}

      <Grid container spacing={2} mb={3}>
        <Grid
          size={{
            xs: 12,

            md: 4,
          }}
        >
          <StatCard
            label="Total Plans"
            value={summary.total}
            icon={<AutoAwesomeOutlined />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            md: 4,
          }}
        >
          <StatCard
            label="Active Plans"
            value={summary.active}
            icon={<ToggleOnOutlined />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            md: 4,
          }}
        >
          <StatCard
            label="Inactive Plans"
            value={summary.inactive}
            icon={<ToggleOffOutlined />}
          />
        </Grid>
      </Grid>

      {/* =================================================
                FILTERS
            ================================================= */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: "column",

              md: "row",
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search plans..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Status</InputLabel>

              <Select
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="ALL">All Plans</MenuItem>

                <MenuItem value="ACTIVE">Active</MenuItem>

                <MenuItem value="INACTIVE">Inactive</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* =================================================
                PLAN CARDS
            ================================================= */}

      {filteredPlans.length === 0 ? (
        <Alert severity="info">
          No platform plans match your current filters.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredPlans.map((plan) => (
            <Grid
              key={plan.id}
              size={{
                xs: 12,

                lg: 6,
              }}
            >
              <Card
                variant="outlined"
                sx={{
                  height: "100%",

                  opacity: plan.active ? 1 : 0.72,
                }}
              >
                <CardContent>
                  {/* HEADER */}

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h6" fontWeight={800}>
                          {plan.name}
                        </Typography>

                        <Chip
                          size="small"
                          label={plan.active ? "ACTIVE" : "INACTIVE"}
                          color={plan.active ? "success" : "default"}
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.75}
                      >
                        {plan.description || "No description provided."}
                      </Typography>
                    </Box>

                    <Tooltip title="Edit plan">
                      <IconButton onClick={() => openEdit(plan)}>
                        <EditOutlined />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  {/* PRICE */}

                  <Box
                    sx={{
                      mt: 2.5,

                      p: 2,

                      bgcolor: "action.hover",

                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" alignItems="baseline" spacing={1}>
                      <Typography variant="h4" fontWeight={900}>
                        {formatMoney(plan.price, plan.currency)}
                      </Typography>

                      <Typography color="text.secondary">
                        / {displayEnum(plan.billingCycle)}
                      </Typography>
                    </Stack>
                  </Box>

                  <Divider
                    sx={{
                      my: 2.5,
                    }}
                  />

                  {/* LIMITS */}

                  <Typography fontWeight={700} mb={1.5}>
                    Usage Limits
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalLibraryOutlined color="action" />

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Libraries
                          </Typography>

                          <Typography fontWeight={700}>
                            {plan.maxLibraries ?? "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <GroupsOutlined color="action" />

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Students
                          </Typography>

                          <Typography fontWeight={700}>
                            {plan.maxStudents ?? "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <BusinessOutlined color="action" />

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Seats
                          </Typography>

                          <Typography fontWeight={700}>
                            {plan.maxSeats ?? "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid
                      size={{
                        xs: 6,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <ApartmentOutlined color="action" />

                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Branches
                          </Typography>

                          <Typography fontWeight={700}>
                            {plan.maxBranches ?? "—"}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>
                  </Grid>

                  <Divider
                    sx={{
                      my: 2.5,
                    }}
                  />

                  {/* FEATURES */}

                  <Typography fontWeight={700} mb={1.5}>
                    Features
                  </Typography>

                  <Grid container spacing={1.5}>
                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,
                      }}
                    >
                      <FeatureItem
                        enabled={plan.analyticsEnabled}
                        label="Analytics"
                        icon={<AnalyticsOutlined fontSize="small" />}
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,
                      }}
                    >
                      <FeatureItem
                        enabled={plan.reportsEnabled}
                        label="Reports"
                        icon={<ReportOutlined fontSize="small" />}
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,
                      }}
                    >
                      <FeatureItem
                        enabled={plan.apiAccess}
                        label="API Access"
                        icon={<ApiOutlined fontSize="small" />}
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,
                      }}
                    >
                      <FeatureItem
                        enabled={plan.customBranding}
                        label="Custom Branding"
                        icon={<PaletteOutlined fontSize="small" />}
                      />
                    </Grid>

                    <Grid
                      size={{
                        xs: 12,

                        sm: 6,
                      }}
                    >
                      <FeatureItem
                        enabled={plan.prioritySupport}
                        label="Priority Support"
                        icon={<SupportAgentOutlined fontSize="small" />}
                      />
                    </Grid>
                  </Grid>

                  <Divider
                    sx={{
                      my: 2.5,
                    }}
                  />

                  {/* ACTION */}

                  <Stack direction="row" justifyContent="flex-end" spacing={1}>
                    <Button
                      variant="outlined"
                      startIcon={<EditOutlined />}
                      onClick={() => openEdit(plan)}
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
                    >
                      {plan.active ? "Deactivate" : "Activate"}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* =================================================
                CREATE / EDIT DIALOG
            ================================================= */}

      <Dialog
        open={dialogOpen}
        onClose={() => !saving && setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {editingPlan ? "Edit Platform Plan" : "Create Platform Plan"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Configure pricing, limits and plan features.
              </Typography>
            </Box>

            <IconButton disabled={saving} onClick={() => setDialogOpen(false)}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {formError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
              }}
            >
              {formError}
            </Alert>
          )}

          <Stack spacing={3}>
            {/* BASIC INFORMATION */}

            <Box>
              <Typography variant="subtitle1" fontWeight={700} mb={1.5}>
                Basic Information
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
            </Box>

            <Divider />

            {/* LIMITS */}

            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Usage Limits
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={2}>
                Define the maximum resources available under this plan.
              </Typography>

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,

                    sm: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Libraries"
                    name="maxLibraries"
                    value={form.maxLibraries}
                    inputProps={{
                      min: 1,
                    }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,

                    sm: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Students"
                    name="maxStudents"
                    value={form.maxStudents}
                    inputProps={{
                      min: 1,
                    }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,

                    sm: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Seats"
                    name="maxSeats"
                    value={form.maxSeats}
                    inputProps={{
                      min: 1,
                    }}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,

                    sm: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    type="number"
                    label="Maximum Branches"
                    name="maxBranches"
                    value={form.maxBranches}
                    inputProps={{
                      min: 1,
                    }}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* FEATURES */}

            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Features
              </Typography>

              <Typography variant="body2" color="text.secondary" mb={1}>
                Select which capabilities are included in this plan.
              </Typography>

              <Grid container spacing={1}>
                <Grid
                  size={{
                    xs: 12,

                    md: 6,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name="analyticsEnabled"
                        checked={form.analyticsEnabled}
                        onChange={handleChange}
                      />
                    }
                    label="Analytics"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,

                    md: 6,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name="reportsEnabled"
                        checked={form.reportsEnabled}
                        onChange={handleChange}
                      />
                    }
                    label="Reports"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,

                    md: 6,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name="apiAccess"
                        checked={form.apiAccess}
                        onChange={handleChange}
                      />
                    }
                    label="API Access"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,

                    md: 6,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name="customBranding"
                        checked={form.customBranding}
                        onChange={handleChange}
                      />
                    }
                    label="Custom Branding"
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,

                    md: 6,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        name="prioritySupport"
                        checked={form.prioritySupport}
                        onChange={handleChange}
                      />
                    }
                    label="Priority Support"
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* STATUS */}

            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Availability
              </Typography>

              <FormControlLabel
                sx={{
                  mt: 1,
                }}
                control={
                  <Switch
                    name="active"
                    checked={form.active}
                    onChange={handleChange}
                  />
                }
                label={
                  form.active
                    ? "Plan is available for subscription"
                    : "Plan is inactive"
                }
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,

            py: 2,
          }}
        >
          <Button disabled={saving} onClick={() => setDialogOpen(false)}>
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
          >
            {editingPlan ? "Update Plan" : "Create Plan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default PlatformPlans;
