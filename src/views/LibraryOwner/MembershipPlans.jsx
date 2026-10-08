import {
  Add,
  CheckCircle,
  Edit,
  MoreVert,
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
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import libraryApi from "../../api/libraryApi";
import membershipPlanApi from "../../api/membershipPlanApi";

/* =========================================================
   EMPTY FORM
========================================================= */

const emptyPlan = {
  name: "",
  description: "",

  shiftName: "",
  startTime: "",
  endTime: "",

  planType: "MONTHLY",
  durationDays: 30,

  price: "",

  active: true,

  fullRefundDays: 0,
  partialRefundDays: 0,
  partialRefundPercentage: 0,
};

/* =========================================================
   HELPERS
========================================================= */

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

function formatTime(time) {
  if (!time) {
    return "";
  }

  /*
   * Handles both:
   * 06:00
   * 06:00:00
   */
  const parts = time.split(":");

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

/* =========================================================
   PLAN CARD
========================================================= */

function PlanCard({ plan, onEdit, onToggleStatus, actionLoading }) {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const menuOpen = Boolean(menuAnchor);

  const isUpdating = actionLoading === plan.id;

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
      sx={{
        height: "100%",
        position: "relative",
        opacity: plan.active ? 1 : 0.72,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: 3,
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* =========================
            HEADER
        ========================= */}

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
              mb={1}
              flexWrap="wrap"
              useFlexGap
            >
              <Typography variant="h6" fontWeight={700}>
                {plan.name}
              </Typography>

              <Chip
                label={plan.active ? "Active" : "Inactive"}
                size="small"
                color={plan.active ? "success" : "default"}
                variant="outlined"
              />
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="baseline"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography variant="h4" fontWeight={700} color="primary.main">
                ₹{Number(plan.price || 0).toLocaleString("en-IN")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                / {plan.durationDays || 0} days
              </Typography>
            </Stack>
          </Box>

          <IconButton
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            disabled={isUpdating}
          >
            {isUpdating ? <CircularProgress size={20} /> : <MoreVert />}
          </IconButton>
        </Stack>

        {/* =========================
            MENU
        ========================= */}

        <Menu anchorEl={menuAnchor} open={menuOpen} onClose={handleCloseMenu}>
          <MenuItem onClick={handleEdit} disabled={isUpdating}>
            <Edit fontSize="small" sx={{ mr: 1.5 }} />
            Edit
          </MenuItem>

          <MenuItem onClick={handleToggle} disabled={isUpdating}>
            <CheckCircle fontSize="small" sx={{ mr: 1.5 }} />

            {plan.active ? "Deactivate" : "Activate"}
          </MenuItem>
        </Menu>

        {/* =========================
            DESCRIPTION
        ========================= */}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 2,
            minHeight: 42,
          }}
        >
          {plan.description || "No description provided."}
        </Typography>

        <Divider sx={{ my: 2.5 }} />

        {/* =========================
            PLAN INFORMATION
        ========================= */}

        <Stack spacing={1.4}>
          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Plan Type
            </Typography>

            <Typography variant="body2" fontWeight={600} textAlign="right">
              {formatPlanType(plan.planType)}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between" spacing={2}>
            <Typography variant="body2" color="text.secondary">
              Duration
            </Typography>

            <Typography variant="body2" fontWeight={600} textAlign="right">
              {plan.durationDays || 0} days
            </Typography>
          </Stack>

          {plan.shiftName && (
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Shift
              </Typography>

              <Typography variant="body2" fontWeight={600} textAlign="right">
                {plan.shiftName}
              </Typography>
            </Stack>
          )}

          {(plan.startTime || plan.endTime) && (
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Timing
              </Typography>

              <Typography variant="body2" fontWeight={600} textAlign="right">
                {plan.startTime ? formatTime(plan.startTime) : "—"}
                {" - "}
                {plan.endTime ? formatTime(plan.endTime) : "—"}
              </Typography>
            </Stack>
          )}

          {plan.fullRefundDays != null && (
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Full Refund
              </Typography>

              <Typography variant="body2" fontWeight={600} textAlign="right">
                {plan.fullRefundDays} days
              </Typography>
            </Stack>
          )}

          {plan.partialRefundDays != null && (
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Partial Refund
              </Typography>

              <Typography variant="body2" fontWeight={600} textAlign="right">
                {plan.partialRefundDays} days
              </Typography>
            </Stack>
          )}

          {plan.partialRefundPercentage != null && (
            <Stack direction="row" justifyContent="space-between" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Partial Refund %
              </Typography>

              <Typography variant="body2" fontWeight={600} textAlign="right">
                {plan.partialRefundPercentage}%
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

/* =========================================================
   MEMBERSHIP PLANS PAGE
========================================================= */

function MembershipPlans() {
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);

  const [library, setLibrary] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [actionLoading, setActionLoading] = useState(null);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingPlan, setEditingPlan] = useState(null);

  const [form, setForm] = useState(emptyPlan);

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.active),
    [plans],
  );

  const inactivePlans = useMemo(
    () => plans.filter((plan) => !plan.active),
    [plans],
  );

  /* =======================================================
     LOAD DATA
  ======================================================= */

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

      /*
       * Current architecture assumes the
       * first library is the active owner
       * library.
       *
       * Later, when multi-library switching
       * is added, this can be replaced with
       * selected tenant/library context.
       */
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

  /* =======================================================
     FORM CHANGE
  ======================================================= */

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");
  };

  /* =======================================================
     OPEN ADD
  ======================================================= */

  const handleOpenAdd = () => {
    setEditingPlan(null);

    setForm({
      ...emptyPlan,
    });

    setError("");
    setDialogOpen(true);
  };

  /* =======================================================
     OPEN EDIT
  ======================================================= */

  const handleOpenEdit = (plan) => {
    setEditingPlan(plan);

    setForm({
      name: plan.name || "",

      description: plan.description || "",

      shiftName: plan.shiftName || "",

      startTime: plan.startTime || "",

      endTime: plan.endTime || "",

      planType: plan.planType || "MONTHLY",

      durationDays: plan.durationDays ?? 30,

      price: plan.price ?? "",

      active: Boolean(plan.active),

      fullRefundDays: plan.fullRefundDays ?? 0,

      partialRefundDays: plan.partialRefundDays ?? 0,

      partialRefundPercentage: plan.partialRefundPercentage ?? 0,
    });

    setError("");
    setDialogOpen(true);
  };

  /* =======================================================
     CLOSE DIALOG
  ======================================================= */

  const handleCloseDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingPlan(null);

    setForm({
      ...emptyPlan,
    });
  };

  /* =======================================================
     SAVE PLAN
  ======================================================= */

  const handleSavePlan = async () => {
    if (!library?.id) {
      setError("Library information is not available.");
      return;
    }

    if (!form.name.trim()) {
      setError("Plan name is required.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setError("Enter a valid plan price.");
      return;
    }

    if (!form.durationDays || Number(form.durationDays) <= 0) {
      setError("Duration must be greater than 0 days.");
      return;
    }

    if (!form.planType) {
      setError("Plan type is required.");
      return;
    }

    if (form.startTime && form.endTime && form.startTime === form.endTime) {
      setError("Start time and end time cannot be the same.");
      return;
    }

    if (
      Number(form.partialRefundPercentage) < 0 ||
      Number(form.partialRefundPercentage) > 100
    ) {
      setError("Partial refund percentage must be between 0 and 100.");
      return;
    }

    const payload = {
      name: form.name.trim(),

      description: form.description.trim() || null,

      shiftName: form.shiftName.trim() || null,

      startTime: form.startTime || null,

      endTime: form.endTime || null,

      planType: form.planType,

      durationDays: Number(form.durationDays),

      price: Number(form.price),

      active: Boolean(form.active),

      fullRefundDays: Number(form.fullRefundDays || 0),

      partialRefundDays: Number(form.partialRefundDays || 0),

      partialRefundPercentage: Number(form.partialRefundPercentage || 0),
    };

    try {
      setSaving(true);

      setError("");
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
      });

      await loadMembershipPlans();
    } catch (requestError) {
      console.error("Failed to save membership plan:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to save membership plan.",
      );
    } finally {
      setSaving(false);
    }
  };

  /* =======================================================
     ACTIVATE / DEACTIVATE
  ======================================================= */

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

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box>
      {/* =================================================
          PAGE HEADER
      ================================================= */}

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
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Membership Plans
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Create and manage membership plans offered by your library.
          </Typography>

          {library?.name && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={0.5}
            >
              Library: {library.name}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenAdd}
          disabled={!library || saving || actionLoading !== null}
        >
          Add Plan
        </Button>
      </Stack>

      {/* =================================================
          NO LIBRARY
      ================================================= */}

      {!library && (
        <Alert
          severity="info"
          sx={{ mb: 3 }}
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

      {/* =================================================
          ERROR
      ================================================= */}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* =================================================
          SUCCESS
      ================================================= */}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* =================================================
          SUMMARY
      ================================================= */}

      {library && (
        <Grid container spacing={2} mb={3}>
          {/* Total */}

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      bgcolor: "primary.light",

                      color: "primary.main",
                    }}
                  >
                    <WorkspacePremium />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Plans
                    </Typography>

                    <Typography variant="h5" fontWeight={700}>
                      {plans.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Active */}

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      bgcolor: "success.light",

                      color: "success.main",
                    }}
                  >
                    <CheckCircle />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Active Plans
                    </Typography>

                    <Typography variant="h5" fontWeight={700}>
                      {activePlans.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Inactive */}

          <Grid
            size={{
              xs: 12,
              sm: 4,
            }}
          >
            <Card
              sx={{
                height: "100%",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,

                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      bgcolor: "info.light",

                      color: "info.main",
                    }}
                  >
                    <WorkspacePremium />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Inactive Plans
                    </Typography>

                    <Typography variant="h5" fontWeight={700}>
                      {inactivePlans.length}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* =================================================
          PLAN GRID
      ================================================= */}

      {library && plans.length > 0 && (
        <Grid container spacing={2.5}>
          {plans.map((plan) => (
            <Grid
              key={plan.id}
              size={{
                xs: 12,
                md: 6,
                lg: 4,
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
      )}

      {/* =================================================
          EMPTY STATE
      ================================================= */}

      {library && plans.length === 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent
            sx={{
              py: 8,
              textAlign: "center",
            }}
          >
            <WorkspacePremium
              sx={{
                fontSize: 48,
                color: "text.disabled",
                mb: 2,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              No membership plans
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Create your first membership plan to start offering memberships.
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ mt: 2 }}
              onClick={handleOpenAdd}
            >
              Create Plan
            </Button>
          </CardContent>
        </Card>
      )}

      {/* =================================================
          ADD / EDIT DIALOG
      ================================================= */}

      <Dialog
        open={dialogOpen}
        onClose={saving ? undefined : handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingPlan ? "Edit Membership Plan" : "Add Membership Plan"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <Grid container spacing={2}>
              {/* Plan Name */}

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
                  placeholder="e.g. Monthly Morning Plan"
                  value={form.name}
                  onChange={handleChange}
                />
              </Grid>

              {/* Price */}

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  required
                  label="Price"
                  name="price"
                  type="number"
                  inputProps={{
                    min: 0,
                    step: "0.01",
                  }}
                  value={form.price}
                  onChange={handleChange}
                />
              </Grid>

              {/* Plan Type */}

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

              {/* Duration */}

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

              {/* Description */}

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
                  placeholder="Describe this membership plan"
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>

              {/* Shift */}

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
                  placeholder="e.g. Morning Shift"
                  value={form.shiftName}
                  onChange={handleChange}
                />
              </Grid>

              {/* Start Time */}

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

              {/* End Time */}

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

              {/* Refund Policy Heading */}

              <Grid
                size={{
                  xs: 12,
                }}
              >
                <Divider />

                <Typography variant="subtitle1" fontWeight={700} mt={2}>
                  Refund Policy
                </Typography>

                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  Configure refund rules applicable to this membership plan.
                </Typography>
              </Grid>

              {/* Full Refund */}

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
                  helperText="Number of days eligible for full refund."
                />
              </Grid>

              {/* Partial Refund */}

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
                  helperText="Number of days eligible for partial refund."
                />
              </Grid>

              {/* Partial Percentage */}

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
                    step: "0.01",
                  }}
                  value={form.partialRefundPercentage}
                  onChange={handleChange}
                  helperText="Percentage refunded during partial refund period."
                />
              </Grid>

              {/* Active */}

              <Grid
                size={{
                  xs: 12,
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      name="active"
                      checked={form.active}
                      onChange={handleChange}
                    />
                  }
                  label={
                    form.active ? "Plan will be active" : "Create as inactive"
                  }
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button onClick={handleCloseDialog} disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSavePlan}
            disabled={
              saving ||
              !form.name.trim() ||
              form.price === "" ||
              !form.durationDays ||
              !form.planType
            }
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
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
