import {
  AccessTime,
  Add,
  CalendarMonth,
  CheckCircle,
  Close,
  CurrencyRupee,
  Edit,
  MoreVert,
  Replay,
  SavingsOutlined,
  Schedule,
  WorkspacePremium,
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
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import libraryApi from "../../api/libraryApi";
import membershipPlanApi from "../../api/membershipPlanApi";

// =========================================================
// PRICING CONSTANTS
// =========================================================

const FEATURE_OPTIONS = [
  { value: "WINDOW", label: "Window" },
  { value: "QUIET_ZONE", label: "Quiet Zone" },
  { value: "POWER_SOCKET", label: "Power Socket" },
  { value: "BETTER_COOLING", label: "Better Cooling" },
  { value: "PREMIUM_AMBIENCE", label: "Premium Ambience" },
  { value: "READING_LAMP", label: "Reading Lamp" },
  { value: "LARGE_DESK", label: "Large Desk" },
  { value: "ERGONOMIC_CHAIR", label: "Ergonomic Chair" },
  { value: "PERSONAL_LOCKER", label: "Personal Locker" },
];

function createEmptyFeaturePricing() {
  return FEATURE_OPTIONS.reduce((accumulator, feature) => {
    accumulator[feature.value] = {
      enabled: false,
      price: "",
    };

    return accumulator;
  }, {});
}

const emptyPlan = {
  name: "",
  description: "",

  // Legacy timing fields kept during BookingSlot migration.
  shiftName: "",
  startTime: "",
  endTime: "",

  planType: "MONTHLY",
  durationDays: 30,

  // New seat-type pricing.
  normalPrice: "",
  premiumEnabled: false,
  premiumPrice: "",

  // Optional additive seat-feature pricing.
  featurePricing: createEmptyFeaturePricing(),

  active: true,

  fullRefundDays: 0,
  partialRefundDays: 0,
  partialRefundPercentage: 0,
};

// =========================================================
// HELPERS
// =========================================================

function formatPlanType(planType) {
  if (!planType) {
    return "-";
  }

  return planType
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatFeature(feature) {
  if (!feature) {
    return "-";
  }

  return feature
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTime(time) {
  if (!time) {
    return "";
  }

  const parts = String(time).split(":");

  if (parts.length < 2) {
    return time;
  }

  const hour = Number(parts[0]);
  const minute = parts[1];

  if (Number.isNaN(hour)) {
    return time;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;

  return `${displayHour}:${minute} ${period}`;
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
}

function resolveSeatPrice(plan, seatType) {
  const priceRow = Array.isArray(plan?.seatPrices)
    ? plan.seatPrices.find(
        (item) => item?.seatType === seatType && item?.active !== false,
      )
    : null;

  if (priceRow?.price != null) {
    return Number(priceRow.price);
  }

  if (seatType === "NORMAL" && plan?.price != null) {
    return Number(plan.price);
  }

  return null;
}

function mapPlanToForm(plan) {
  const normalPrice = resolveSeatPrice(plan, "NORMAL");
  const premiumPrice = resolveSeatPrice(plan, "PREMIUM");

  const featurePricing = createEmptyFeaturePricing();

  if (Array.isArray(plan?.featurePrices)) {
    plan.featurePrices.forEach((item) => {
      if (!item?.seatFeature || !featurePricing[item.seatFeature]) {
        return;
      }

      featurePricing[item.seatFeature] = {
        enabled: item.active !== false,
        price: item.additionalPrice != null ? String(item.additionalPrice) : "",
      };
    });
  }

  return {
    name: plan?.name || "",
    description: plan?.description || "",

    shiftName: plan?.shiftName || "",
    startTime: plan?.startTime || "",
    endTime: plan?.endTime || "",

    planType: plan?.planType || "MONTHLY",
    durationDays: plan?.durationDays ?? 30,

    normalPrice: normalPrice != null ? String(normalPrice) : "",

    premiumEnabled: premiumPrice != null,

    premiumPrice: premiumPrice != null ? String(premiumPrice) : "",

    featurePricing,

    active: Boolean(plan?.active),

    fullRefundDays: plan?.fullRefundDays ?? 0,
    partialRefundDays: plan?.partialRefundDays ?? 0,
    partialRefundPercentage: plan?.partialRefundPercentage ?? 0,
  };
}

// =========================================================
// SUMMARY TILE
// =========================================================

function SummaryTile({ icon, label, value, tone = "primary", helper }) {
  const theme = useTheme();

  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3.2,
        border: "1px solid",
        borderColor: alpha(color, 0.14),
        bgcolor: "background.paper",
        boxShadow: "0 8px 26px rgba(15,23,42,0.045)",
      }}
    >
      <CardContent
        sx={{
          p: 2.2,
          "&:last-child": {
            pb: 2.2,
          },
        }}
      >
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: alpha(color, 0.085),
              color,
            }}
          >
            {icon}
          </Box>

          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              {label}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={850}
              sx={{
                mt: 0.1,
                letterSpacing: "-0.02em",
              }}
            >
              {value}
            </Typography>

            {helper && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: "block",
                  mt: 0.2,
                }}
              >
                {helper}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =========================================================
// PLAN CARD
// =========================================================

function PlanCard({ plan, onEdit, onToggleStatus, actionLoading }) {
  const theme = useTheme();

  const [menuAnchor, setMenuAnchor] = useState(null);

  const menuOpen = Boolean(menuAnchor);

  const isUpdating = actionLoading === plan.id;

  const normalPrice = resolveSeatPrice(plan, "NORMAL");

  const premiumPrice = resolveSeatPrice(plan, "PREMIUM");

  const configuredFeaturePrices = Array.isArray(plan?.featurePrices)
    ? plan.featurePrices.filter(
        (item) =>
          item?.active !== false && Number(item?.additionalPrice || 0) > 0,
      )
    : [];

  const planTiming =
    plan.startTime || plan.endTime
      ? `${plan.startTime ? formatTime(plan.startTime) : "—"} - ${
          plan.endTime ? formatTime(plan.endTime) : "—"
        }`
      : null;

  const handleCloseMenu = () => {
    setMenuAnchor(null);
  };

  const handleEdit = () => {
    handleCloseMenu();
    onEdit(plan);
  };

  const handleToggle = () => {
    handleCloseMenu();
    onToggleStatus(plan);
  };

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        border: "1px solid",
        borderColor: plan.active
          ? alpha(theme.palette.primary.main, 0.15)
          : "divider",
        borderRadius: 3.5,
        bgcolor: "background.paper",
        opacity: plan.active ? 1 : 0.8,
        boxShadow: plan.active ? "0 10px 30px rgba(15,23,42,0.055)" : "none",
        transition:
          "transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 16px 38px rgba(15,23,42,0.085)",
          borderColor: plan.active
            ? alpha(theme.palette.primary.main, 0.35)
            : theme.palette.divider,
        },
        "&::before": {
          content: '""',
          position: "absolute",
          inset: "0 auto 0 0",
          width: 4,
          bgcolor: plan.active ? "primary.main" : "grey.300",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.6,
          pl: 3,
          display: "flex",
          flexDirection: "column",
          height: "100%",
          "&:last-child": {
            pb: 2.6,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box sx={{ minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography variant="h6" fontWeight={850}>
                {plan.name}
              </Typography>

              <Chip
                label={plan.active ? "Active" : "Inactive"}
                size="small"
                color={plan.active ? "success" : "default"}
                variant={plan.active ? "filled" : "outlined"}
                sx={{
                  height: 24,
                  fontWeight: 750,
                }}
              />
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 0.65,
                fontWeight: 650,
              }}
            >
              {formatPlanType(plan.planType)}
            </Typography>
          </Box>

          <IconButton
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            disabled={isUpdating}
            size="small"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.paper",
            }}
          >
            {isUpdating ? <CircularProgress size={18} /> : <MoreVert />}
          </IconButton>
        </Stack>

        <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleCloseMenu}>
          <MenuItem onClick={handleEdit} disabled={isUpdating}>
            <Edit fontSize="small" sx={{ mr: 1.5 }} />
            Edit Plan
          </MenuItem>

          <MenuItem onClick={handleToggle} disabled={isUpdating}>
            <CheckCircle fontSize="small" sx={{ mr: 1.5 }} />

            {plan.active ? "Deactivate" : "Activate"}
          </MenuItem>
        </Menu>

        <Box
          sx={{
            mt: 2.3,
            p: 1.8,
            borderRadius: 2.6,
            bgcolor: alpha(theme.palette.primary.main, 0.055),
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.09),
          }}
        >
          <Typography variant="caption" color="text.secondary" fontWeight={800}>
            NORMAL SEAT
          </Typography>

          <Stack direction="row" spacing={0.8} alignItems="baseline">
            <Typography
              variant="h4"
              fontWeight={900}
              color="primary.main"
              sx={{
                letterSpacing: "-0.035em",
              }}
            >
              ₹{formatCurrency(normalPrice)}
            </Typography>

            <Typography variant="body2" color="text.secondary" fontWeight={600}>
              / {plan.durationDays || 0} days
            </Typography>
          </Stack>

          {premiumPrice != null && (
            <Typography
              variant="body2"
              sx={{
                mt: 0.7,
                fontWeight: 750,
              }}
            >
              Premium seat: ₹{formatCurrency(premiumPrice)}
            </Typography>
          )}
        </Box>

        {configuredFeaturePrices.length > 0 && (
          <Box sx={{ mt: 1.5 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={800}
            >
              FEATURE SURCHARGES
            </Typography>

            <Stack
              direction="row"
              spacing={0.8}
              useFlexGap
              flexWrap="wrap"
              sx={{ mt: 0.8 }}
            >
              {configuredFeaturePrices.map((item) => (
                <Chip
                  key={item.seatFeature}
                  size="small"
                  variant="outlined"
                  label={`${formatFeature(item.seatFeature)} +₹${formatCurrency(
                    item.additionalPrice,
                  )}`}
                />
              ))}
            </Stack>
          </Box>
        )}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 2,
            minHeight: 42,
            lineHeight: 1.55,
          }}
        >
          {plan.description || "No description provided."}
        </Typography>

        <Divider sx={{ my: 2.2 }} />

        <Stack spacing={1.2}>
          <Stack direction="row" spacing={1.2} alignItems="center">
            <CalendarMonth
              sx={{
                fontSize: 18,
                color: "primary.main",
              }}
            />

            <Typography variant="body2" fontWeight={750}>
              {plan.durationDays || 0} days
            </Typography>
          </Stack>

          {plan.shiftName && (
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Schedule
                sx={{
                  fontSize: 18,
                  color: "info.main",
                }}
              />

              <Typography variant="body2" fontWeight={750}>
                {plan.shiftName}
              </Typography>
            </Stack>
          )}

          {planTiming && (
            <Stack direction="row" spacing={1.2} alignItems="center">
              <AccessTime
                sx={{
                  fontSize: 18,
                  color: "warning.main",
                }}
              />

              <Typography variant="body2" fontWeight={750}>
                {planTiming}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Box sx={{ flex: 1 }} />

        <Box
          sx={{
            mt: 2.2,
            p: 1.5,
            borderRadius: 2.4,
            bgcolor: alpha(theme.palette.text.primary, 0.025),
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Refund Policy
          </Typography>

          <Stack spacing={0.7} sx={{ mt: 0.9 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Full refund
              </Typography>

              <Typography variant="caption" fontWeight={750}>
                {plan.fullRefundDays ?? 0} days
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Partial refund
              </Typography>

              <Typography variant="caption" fontWeight={750}>
                {plan.partialRefundDays ?? 0} days
              </Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between">
              <Typography variant="caption" color="text.secondary">
                Refund amount
              </Typography>

              <Typography variant="caption" fontWeight={750}>
                {plan.partialRefundPercentage ?? 0}%
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<Edit />}
          onClick={() => onEdit(plan)}
          disabled={isUpdating}
          sx={{
            mt: 2,
            minHeight: 43,
            textTransform: "none",
            fontWeight: 800,
            borderRadius: 2.3,
          }}
        >
          Edit Plan
        </Button>
      </CardContent>
    </Card>
  );
}

// =========================================================
// MEMBERSHIP PLANS PAGE
// =========================================================

function MembershipPlans() {
  const theme = useTheme();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [library, setLibrary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Validation / API errors produced while the Add/Edit dialog is open.
  // Keep these inside the dialog so the user can actually see why Save failed.
  const [dialogError, setDialogError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState(emptyPlan);

  // =======================================================
  // DERIVED DATA
  // =======================================================

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.active),
    [plans],
  );

  const inactivePlans = useMemo(
    () => plans.filter((plan) => !plan.active),
    [plans],
  );

  const averagePrice = useMemo(() => {
    if (plans.length === 0) {
      return 0;
    }

    const total = plans.reduce(
      (sum, plan) => sum + Number(resolveSeatPrice(plan, "NORMAL") || 0),
      0,
    );

    return total / plans.length;
  }, [plans]);

  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadMembershipPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const libraries = await libraryApi.getMyLibraries();

      const ownerLibraries = Array.isArray(libraries) ? libraries : [];

      if (ownerLibraries.length === 0) {
        setLibrary(null);
        setPlans([]);
        return;
      }

      const currentLibrary = ownerLibraries[0];

      setLibrary(currentLibrary);

      const response = await membershipPlanApi.getPlans(currentLibrary.id);

      setPlans(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Failed to load membership plans:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load membership plans.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMembershipPlans();
  }, [loadMembershipPlans]);

  // =======================================================
  // FORM HANDLERS
  // =======================================================

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setDialogError("");
  };

  const handleFeatureEnabledChange = (feature, enabled) => {
    setForm((previous) => ({
      ...previous,
      featurePricing: {
        ...(previous.featurePricing || createEmptyFeaturePricing()),
        [feature]: {
          ...(previous.featurePricing?.[feature] || {
            enabled: false,
            price: "",
          }),
          enabled,
          price: enabled
            ? (previous.featurePricing?.[feature]?.price ?? "")
            : "",
        },
      },
    }));

    setDialogError("");
  };

  const handleFeaturePriceChange = (feature, value) => {
    setForm((previous) => ({
      ...previous,
      featurePricing: {
        ...(previous.featurePricing || createEmptyFeaturePricing()),
        [feature]: {
          ...(previous.featurePricing?.[feature] || {
            enabled: false,
            price: "",
          }),
          price: value,
        },
      },
    }));

    setDialogError("");
  };

  // =======================================================
  // OPEN / CLOSE
  // =======================================================

  const handleOpenAdd = () => {
    setEditingPlan(null);

    setForm({
      ...emptyPlan,
      featurePricing: createEmptyFeaturePricing(),
    });

    setDialogError("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);
    setForm(mapPlanToForm(plan));
    setDialogError("");
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingPlan(null);
    setDialogError("");

    setForm({
      ...emptyPlan,
      featurePricing: createEmptyFeaturePricing(),
    });
  };

  // =======================================================
  // SAVE PLAN
  // =======================================================

  const handleSavePlan = async () => {
    if (!library?.id) {
      setDialogError("Library information is not available.");
      return;
    }

    if (!form.name.trim()) {
      setDialogError("Plan name is required.");
      return;
    }

    if (form.normalPrice === "" || Number(form.normalPrice) <= 0) {
      setDialogError("Normal seat price must be greater than 0.");
      return;
    }

    if (
      form.premiumEnabled &&
      (form.premiumPrice === "" || Number(form.premiumPrice) <= 0)
    ) {
      setDialogError("Premium seat price must be greater than 0.");
      return;
    }

    if (!form.durationDays || Number(form.durationDays) <= 0) {
      setDialogError("Duration must be greater than 0 days.");
      return;
    }

    if (!form.planType) {
      setDialogError("Plan type is required.");
      return;
    }

    if (form.startTime && form.endTime && form.startTime === form.endTime) {
      setDialogError("Start time and end time cannot be the same.");
      return;
    }

    if (
      Number(form.partialRefundPercentage) < 0 ||
      Number(form.partialRefundPercentage) > 100
    ) {
      setDialogError("Partial refund percentage must be between 0 and 100.");
      return;
    }

    for (const feature of FEATURE_OPTIONS) {
      const configuration = form.featurePricing?.[feature.value] || {
        enabled: false,
        price: "",
      };

      if (!configuration?.enabled) {
        continue;
      }

      if (configuration.price !== "" && Number(configuration.price) < 0) {
        setDialogError(`${feature.label} surcharge cannot be negative.`);
        return;
      }
    }

    const normalPrice = Number(form.normalPrice);

    const seatPrices = [
      {
        seatType: "NORMAL",
        price: normalPrice,
        active: true,
      },
    ];

    if (form.premiumEnabled) {
      seatPrices.push({
        seatType: "PREMIUM",
        price: Number(form.premiumPrice),
        active: true,
      });
    }

    const featurePrices = FEATURE_OPTIONS.filter(
      (feature) => form.featurePricing?.[feature.value]?.enabled,
    ).map((feature) => ({
      seatFeature: feature.value,
      additionalPrice: Number(form.featurePricing?.[feature.value]?.price || 0),
      active: true,
    }));

    const payload = {
      name: form.name.trim(),

      description: form.description.trim() || null,

      // Legacy fields retained until
      // BookingSlot migration is complete.
      shiftName: form.shiftName.trim() || null,

      startTime: form.startTime || null,

      endTime: form.endTime || null,

      planType: form.planType,

      durationDays: Number(form.durationDays),

      // Keep legacy/default price equal
      // to NORMAL base price.
      price: normalPrice,

      seatPrices,

      featurePrices,

      active: Boolean(form.active),

      fullRefundDays: Number(form.fullRefundDays || 0),

      partialRefundDays: Number(form.partialRefundDays || 0),

      partialRefundPercentage: Number(form.partialRefundPercentage || 0),
    };

    try {
      setSaving(true);
      setDialogError("");
      setSuccess("");

      if (editingPlan) {
        await membershipPlanApi.updatePlan(editingPlan.id, payload);

        setSuccess("Membership plan updated successfully.");
      } else {
        await membershipPlanApi.createPlan(library.id, payload);

        setSuccess("Membership plan created successfully.");
      }

      setDialogOpen(false);
      setEditingPlan(null);

      setForm({
        ...emptyPlan,
        featurePricing: createEmptyFeaturePricing(),
      });

      await loadMembershipPlans();
    } catch (requestError) {
      console.error("Failed to save membership plan:", requestError);

      const responseData = requestError?.response?.data;

      const message =
        responseData?.message ||
        responseData?.error ||
        (typeof responseData === "string" ? responseData : null) ||
        requestError?.message ||
        "Unable to save membership plan.";

      setDialogError(message);
    } finally {
      setSaving(false);
    }
  };

  // =======================================================
  // ACTIVATE / DEACTIVATE
  // =======================================================

  const handleToggleStatus = async (plan) => {
    try {
      setActionLoading(plan.id);
      setError("");
      setSuccess("");

      if (plan.active) {
        await membershipPlanApi.deactivatePlan(plan.id);

        setSuccess("Membership plan deactivated successfully.");
      } else {
        await membershipPlanApi.activatePlan(plan.id);

        setSuccess("Membership plan activated successfully.");
      }

      await loadMembershipPlans();
    } catch (requestError) {
      console.error("Failed to update membership plan status:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to update membership plan status.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 460,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography color="text.secondary">
            Loading membership plans...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1480,
        mx: "auto",
        pb: 5,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 1.5,
          fontWeight: 500,
        }}
      >
        Dashboard
        {"  ›  "}
        Library Setup
        {"  ›  "}
        <Box
          component="span"
          sx={{
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          Membership Plans
        </Box>
      </Typography>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background: `linear-gradient(
            135deg,
            ${alpha(theme.palette.primary.main, 0.1)} 0%,
            ${theme.palette.background.paper} 52%,
            ${alpha(theme.palette.secondary.main, 0.055)} 100%
          )`,
          boxShadow: "0 18px 50px rgba(15,23,42,0.06)",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3.5 },
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
            spacing={3}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 62,
                  height: 62,
                  borderRadius: 3.2,
                  display: "grid",
                  placeItems: "center",
                  color: "primary.contrastText",
                  bgcolor: "primary.main",
                }}
              >
                <WorkspacePremium sx={{ fontSize: 32 }} />
              </Box>

              <Box>
                <Typography variant="h4" fontWeight={900}>
                  Membership Plans
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{
                    mt: 0.75,
                    maxWidth: 760,
                  }}
                >
                  Configure plan duration, Normal/Premium seat pricing, optional
                  seat-feature surcharges and refund rules.
                </Typography>

                {library?.name && (
                  <Chip
                    size="small"
                    label={library.name}
                    variant="outlined"
                    sx={{
                      mt: 1.4,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
            </Stack>

            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleOpenAdd}
              disabled={!library || saving || actionLoading !== null}
              sx={{
                minHeight: 48,
                px: 2.6,
                textTransform: "none",
                borderRadius: 2.5,
                fontWeight: 850,
              }}
            >
              Add Membership Plan
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {!library && (
        <Alert
          severity="info"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate("/register-library")}
            >
              Continue Setup
            </Button>
          }
        >
          Complete your library setup before creating membership plans.
        </Alert>
      )}

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
          sx={{
            mb: 2.5,
            borderRadius: 2.5,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {library && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <SummaryTile
              icon={<WorkspacePremium />}
              label="Total Plans"
              value={plans.length}
              helper="All configured plans"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <SummaryTile
              icon={<CheckCircle />}
              label="Active Plans"
              value={activePlans.length}
              helper="Visible to students"
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
            <SummaryTile
              icon={<Replay />}
              label="Inactive Plans"
              value={inactivePlans.length}
              helper="Currently hidden"
              tone="info"
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 3,
            }}
          >
            <SummaryTile
              icon={<CurrencyRupee />}
              label="Average Normal Price"
              value={`₹${formatCurrency(averagePrice)}`}
              helper="Across all plans"
              tone="warning"
            />
          </Grid>
        </Grid>
      )}

      {library && plans.length > 0 && (
        <>
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
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography variant="h6" fontWeight={850}>
                Your Plans
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.25 }}
              >
                Manage base seat pricing, feature surcharges, duration and
                availability.
              </Typography>
            </Box>

            <Chip
              size="small"
              label={`${activePlans.length} active`}
              color="success"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
          </Stack>

          <Grid container spacing={2.5}>
            {plans.map((plan) => (
              <Grid
                key={plan.id}
                size={{
                  xs: 12,
                  md: 6,
                  xl: 4,
                }}
              >
                <PlanCard
                  plan={plan}
                  onEdit={handleOpenEdit}
                  onToggleStatus={handleToggleStatus}
                  actionLoading={actionLoading}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {library && plans.length === 0 && (
        <Card
          elevation={0}
          sx={{
            mt: 2,
            minHeight: 360,
            borderRadius: 4,
            border: "1.5px dashed",
            borderColor: alpha(theme.palette.primary.main, 0.25),
            bgcolor: alpha(theme.palette.primary.main, 0.018),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CardContent
            sx={{
              py: 7,
              px: 3,
              textAlign: "center",
            }}
          >
            <WorkspacePremium
              sx={{
                fontSize: 50,
                color: "primary.main",
              }}
            />

            <Typography variant="h5" fontWeight={850} sx={{ mt: 1.5 }}>
              Create your first membership plan
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.75,
                maxWidth: 520,
                mx: "auto",
                lineHeight: 1.6,
              }}
            >
              Configure Normal and Premium base pricing, optional feature
              surcharges and refund policies.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              sx={{
                mt: 2.5,
                textTransform: "none",
                fontWeight: 800,
                borderRadius: 2.5,
                px: 3,
              }}
              onClick={handleOpenAdd}
            >
              Create Membership Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ================================================= */}
      {/* ADD / EDIT DIALOG */}
      {/* ================================================= */}

      <Dialog
        open={dialogOpen}
        onClose={saving ? undefined : handleCloseDialog}
        fullWidth
        maxWidth="md"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 28px 80px rgba(15,23,42,0.20)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2.5, md: 3.2 },
            pt: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
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
                  bgcolor: alpha(theme.palette.primary.main, 0.09),
                  color: "primary.main",
                }}
              >
                {editingPlan ? <Edit /> : <Add />}
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={850}>
                  {editingPlan ? "Edit Membership Plan" : "Add Membership Plan"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.2 }}
                >
                  Configure plan details and authoritative seat pricing.
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={handleCloseDialog} disabled={saving}>
              <Close />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            px: { xs: 2.5, md: 3.2 },
            py: 3,
          }}
        >
          <Stack spacing={3}>
            {/* PLAN INFORMATION */}

            <Box>
              <Typography variant="subtitle1" fontWeight={850}>
                Plan Information
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                  mb: 2,
                }}
              >
                Set plan identity, type and duration.
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
                    placeholder="e.g. Monthly Plan"
                    value={form.name}
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
                    <InputLabel>Plan Type</InputLabel>

                    <Select
                      label="Plan Type"
                      name="planType"
                      value={form.planType}
                      onChange={handleChange}
                    >
                      <MenuItem value="DAILY">Daily</MenuItem>

                      <MenuItem value="WEEKLY">Weekly</MenuItem>

                      <MenuItem value="MONTHLY">Monthly</MenuItem>

                      <MenuItem value="QUARTERLY">Quarterly</MenuItem>

                      <MenuItem value="CUSTOM">Custom</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <TextField
                    fullWidth
                    required
                    label="Duration (Days)"
                    name="durationDays"
                    type="number"
                    inputProps={{
                      min: 1,
                    }}
                    value={form.durationDays}
                    onChange={handleChange}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    label="Description"
                    name="description"
                    placeholder="Describe this membership plan"
                    value={form.description}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* SEAT TYPE PRICING */}

            <Box>
              <Typography variant="subtitle1" fontWeight={850}>
                Seat Pricing
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                  mb: 2,
                }}
              >
                Set the base price for each commercial seat category.
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
                    label="Normal Seat Price"
                    name="normalPrice"
                    type="number"
                    inputProps={{
                      min: 0.01,
                      step: "0.01",
                    }}
                    value={form.normalPrice}
                    onChange={handleChange}
                    helperText="Required. Also used as the legacy/default plan price during migration."
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={form.premiumEnabled}
                          onChange={(event) =>
                            setForm((previous) => ({
                              ...previous,
                              premiumEnabled: event.target.checked,
                              premiumPrice: event.target.checked
                                ? previous.premiumPrice
                                : "",
                            }))
                          }
                        />
                      }
                      label="Offer Premium Seats"
                    />

                    <TextField
                      fullWidth
                      label="Premium Seat Price"
                      type="number"
                      inputProps={{
                        min: 0.01,
                        step: "0.01",
                      }}
                      value={form.premiumPrice}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          premiumPrice: event.target.value,
                        }))
                      }
                      disabled={!form.premiumEnabled}
                      sx={{ mt: 1 }}
                    />
                  </Card>
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* FEATURE SURCHARGES */}

            <Box>
              <Typography variant="subtitle1" fontWeight={850}>
                Optional Feature Pricing
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                  mb: 2,
                }}
              >
                Add optional surcharges on top of the Normal/Premium base price.
                Features without a configured surcharge remain free.
              </Typography>

              <Grid container spacing={1.5}>
                {FEATURE_OPTIONS.map((feature) => {
                  const configuration = form.featurePricing?.[
                    feature.value
                  ] || {
                    enabled: false,
                    price: "",
                  };

                  return (
                    <Grid
                      key={feature.value}
                      size={{
                        xs: 12,
                        md: 6,
                      }}
                    >
                      <Card
                        variant="outlined"
                        sx={{
                          p: 1.5,
                          borderRadius: 2.5,
                          height: "100%",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={800}>
                              {feature.label}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {feature.value}
                            </Typography>
                          </Box>

                          <Switch
                            checked={configuration?.enabled || false}
                            onChange={(event) =>
                              handleFeatureEnabledChange(
                                feature.value,
                                event.target.checked,
                              )
                            }
                          />
                        </Stack>

                        <TextField
                          fullWidth
                          size="small"
                          label="Additional Price"
                          type="number"
                          inputProps={{
                            min: 0,
                            step: "0.01",
                          }}
                          value={configuration?.price ?? ""}
                          onChange={(event) =>
                            handleFeaturePriceChange(
                              feature.value,
                              event.target.value,
                            )
                          }
                          disabled={!configuration?.enabled}
                          sx={{ mt: 1 }}
                        />
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>

            <Divider />

            {/* LEGACY SHIFT / TIMING */}

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Schedule color="primary" />

                <Typography variant="subtitle1" fontWeight={850}>
                  Shift & Timing
                </Typography>
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                  mb: 2,
                }}
              >
                Legacy optional timing fields. BookingSlot remains the direction
                for the final timing model.
              </Typography>

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Shift Name"
                    name="shiftName"
                    value={form.shiftName}
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
                    fullWidth
                    label="Start Time"
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
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
                    fullWidth
                    label="End Time"
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                    slotProps={{
                      inputLabel: {
                        shrink: true,
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            {/* REFUND POLICY */}

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <SavingsOutlined color="primary" />

                <Typography variant="subtitle1" fontWeight={850}>
                  Refund Policy
                </Typography>
              </Stack>

              <Grid container spacing={2} sx={{ mt: 0.5 }}>
                <Grid
                  size={{
                    xs: 12,
                    md: 4,
                  }}
                >
                  <TextField
                    fullWidth
                    label="Full Refund Days"
                    name="fullRefundDays"
                    type="number"
                    inputProps={{
                      min: 0,
                    }}
                    value={form.fullRefundDays}
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
                    fullWidth
                    label="Partial Refund Days"
                    name="partialRefundDays"
                    type="number"
                    inputProps={{
                      min: 0,
                    }}
                    value={form.partialRefundDays}
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
                    fullWidth
                    label="Partial Refund %"
                    name="partialRefundPercentage"
                    type="number"
                    inputProps={{
                      min: 0,
                      max: 100,
                    }}
                    value={form.partialRefundPercentage}
                    onChange={handleChange}
                  />
                </Grid>
              </Grid>
            </Box>

            <Divider />

            <FormControlLabel
              control={
                <Switch
                  name="active"
                  checked={Boolean(form.active)}
                  onChange={handleChange}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={800}>
                    Active Plan
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {form.active
                      ? "This plan will be visible to students."
                      : "This plan will remain hidden from students."}
                  </Typography>
                </Box>
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, md: 3.2 },
            py: 2.2,
            borderTop: "1px solid",
            borderColor: "divider",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {dialogError && (
            <Alert
              severity="error"
              onClose={() => setDialogError("")}
              sx={{
                flex: "1 1 100%",
                mb: 0.5,
                borderRadius: 2,
              }}
            >
              {dialogError}
            </Alert>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            onClick={handleCloseDialog}
            disabled={saving}
            variant="outlined"
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.2,
              minWidth: 110,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSavePlan}
            disabled={
              saving ||
              !form.name.trim() ||
              form.normalPrice === "" ||
              !form.durationDays ||
              !form.planType ||
              (form.premiumEnabled && form.premiumPrice === "")
            }
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
            sx={{
              textTransform: "none",
              fontWeight: 850,
              borderRadius: 2.2,
              minWidth: 170,
            }}
          >
            {saving
              ? "Saving..."
              : editingPlan
                ? "Save Changes"
                : "Create Plan"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default MembershipPlans;
