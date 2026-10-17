import { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  CalendarMonthRounded,
  CheckCircleRounded,
  CloseRounded,
  LocalOfferRounded,
  PercentRounded,
  SavingsRounded,
} from "@mui/icons-material";

const initialForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minimumAmount: "0",
  maximumDiscount: "",
  validFrom: "",
  validUntil: "",
};

const safeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(safeNumber(value));

const formatDateTimeLocal = (value) => {
  if (!value) return "";

  const stringValue = String(value);

  if (stringValue.length >= 16 && stringValue.includes("T")) {
    return stringValue.slice(0, 16);
  }

  return stringValue;
};

function CouponFormDialog({
  open,
  onClose,
  onSave,
  coupon = null,
  saving = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState("");

  const isEditing = Boolean(coupon);

  useEffect(() => {
    setFormError("");

    if (coupon) {
      setForm({
        code: coupon.code || "",
        description: coupon.description || "",
        discountType: coupon.discountType || "PERCENTAGE",
        discountValue: coupon.discountValue ?? "",
        minimumAmount: coupon.minimumAmount ?? "0",
        maximumDiscount: coupon.maximumDiscount ?? "",
        validFrom: formatDateTimeLocal(coupon.validFrom),
        validUntil: formatDateTimeLocal(coupon.validUntil),
      });
      return;
    }

    setForm(initialForm);
  }, [coupon, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormError("");

    if (name === "discountType") {
      setForm((current) => ({
        ...current,
        discountType: value,
        maximumDiscount:
          value === "FIXED_AMOUNT" ? "" : current.maximumDiscount,
      }));
      return;
    }

    setForm((current) => ({
      ...current,
      [name]: name === "code" ? value.toUpperCase() : value,
    }));
  };

  const previewDiscount = useMemo(() => {
    const value = safeNumber(form.discountValue);

    if (value <= 0) return "Set discount value";

    if (form.discountType === "PERCENTAGE") {
      const maximumDiscount = safeNumber(form.maximumDiscount);
      return maximumDiscount > 0
        ? `${value}% off · Max ${formatMoney(maximumDiscount)}`
        : `${value}% off`;
    }

    return `${formatMoney(value)} off`;
  }, [form.discountType, form.discountValue, form.maximumDiscount]);

  const minimumAmountLabel =
    safeNumber(form.minimumAmount) > 0
      ? `Minimum spend ${formatMoney(form.minimumAmount)}`
      : "No minimum spend";

  const formCompletion = useMemo(() => {
    const checks = [
      Boolean(form.code.trim()),
      safeNumber(form.discountValue) > 0,
      Boolean(form.validFrom),
      Boolean(form.validUntil),
    ];

    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [form.code, form.discountValue, form.validFrom, form.validUntil]);

  const validateForm = () => {
    const code = form.code.trim().toUpperCase();

    if (!code) return "Coupon code is required.";

    if (!/^[A-Z0-9_-]+$/.test(code)) {
      return "Coupon code can contain only letters, numbers, hyphens and underscores.";
    }

    const discountValue = Number(form.discountValue);

    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      return "Discount value must be greater than zero.";
    }

    if (form.discountType === "PERCENTAGE" && discountValue > 100) {
      return "Percentage discount cannot exceed 100%.";
    }

    const minimumAmount =
      form.minimumAmount === "" ? 0 : Number(form.minimumAmount);

    if (!Number.isFinite(minimumAmount) || minimumAmount < 0) {
      return "Minimum payment amount cannot be negative.";
    }

    if (form.discountType === "PERCENTAGE" && form.maximumDiscount !== "") {
      const maximumDiscount = Number(form.maximumDiscount);

      if (!Number.isFinite(maximumDiscount) || maximumDiscount <= 0) {
        return "Maximum discount must be greater than zero.";
      }
    }

    if (!form.validFrom || !form.validUntil) {
      return "Coupon validity period is required.";
    }

    const start = new Date(form.validFrom);
    const end = new Date(form.validUntil);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return "Please enter a valid coupon validity period.";
    }

    if (end <= start) {
      return "Valid Until must be after Valid From.";
    }

    return "";
  };

  const handleSubmit = async () => {
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      description: form.description.trim() || null,
      discountValue: Number(form.discountValue),
      minimumAmount: form.minimumAmount ? Number(form.minimumAmount) : 0,
      maximumDiscount:
        form.discountType === "PERCENTAGE" && form.maximumDiscount
          ? Number(form.maximumDiscount)
          : null,
    };

    try {
      await onSave?.(payload);
    } catch (error) {
      setFormError(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unable to save this coupon.",
      );
    }
  };

  const handleClose = () => {
    if (saving) return;
    setFormError("");
    onClose?.();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(79,70,229,0.12)",
          boxShadow: "0 30px 80px rgba(15,23,42,0.18)",
        },
      }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: { xs: 2.5, sm: 3 },
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(255,255,255,1) 60%, rgba(99,102,241,0.06))",
            "&::after": {
              content: '\"\"',
              position: "absolute",
              width: 180,
              height: 180,
              borderRadius: "50%",
              right: -60,
              top: -90,
              bgcolor: "rgba(79,70,229,0.07)",
            },
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="space-between"
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={1.7} alignItems="center">
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2.5,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 10px 26px rgba(79,70,229,0.24)",
                }}
              >
                <LocalOfferRounded />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ letterSpacing: "-0.02em" }}
                >
                  {isEditing ? "Edit Coupon" : "Create Coupon"}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.4 }}
                >
                  {isEditing
                    ? "Update discount rules and validity for this coupon."
                    : "Create a promotional discount your members can apply during checkout."}
                </Typography>
              </Box>
            </Stack>

            <Button
              color="inherit"
              onClick={handleClose}
              disabled={saving}
              startIcon={<CloseRounded />}
              sx={{
                minWidth: "auto",
                color: "text.secondary",
                display: { xs: "none", sm: "inline-flex" },
              }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: "28px !important",
        }}
      >
        <Stack spacing={3}>
          {formError && (
            <Alert
              severity="error"
              onClose={() => setFormError("")}
              sx={{ borderRadius: 2.5 }}
            >
              {formError}
            </Alert>
          )}

          <Paper
            elevation={0}
            sx={{
              p: 2.4,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3,
              background:
                "linear-gradient(145deg, #ffffff, rgba(248,250,252,0.92))",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(79,70,229,0.08)",
                    color: "primary.main",
                  }}
                >
                  <SavingsRounded />
                </Box>

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={700}
                  >
                    LIVE COUPON PREVIEW
                  </Typography>

                  <Typography variant="h6" fontWeight={800}>
                    {form.code.trim() || "YOURCODE"}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  label={previewDiscount}
                  color="primary"
                  variant="outlined"
                  icon={
                    form.discountType === "PERCENTAGE" ? (
                      <PercentRounded />
                    ) : (
                      <SavingsRounded />
                    )
                  }
                />

                <Chip label={minimumAmountLabel} variant="outlined" />

                <Chip
                  label={`${formCompletion}% complete`}
                  color={formCompletion === 100 ? "success" : "default"}
                  icon={
                    formCompletion === 100 ? <CheckCircleRounded /> : undefined
                  }
                />
              </Stack>
            </Stack>
          </Paper>

          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
              Coupon details
            </Typography>

            <Stack spacing={2.2}>
              <TextField
                name="code"
                label="Coupon Code"
                value={form.code}
                onChange={handleChange}
                fullWidth
                required
                placeholder="WELCOME50"
                disabled={saving}
                inputProps={{
                  maxLength: 50,
                  style: {
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    fontWeight: 700,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LocalOfferRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                helperText="Use letters, numbers, hyphens or underscores."
              />

              <TextField
                name="description"
                label="Description"
                value={form.description}
                onChange={handleChange}
                fullWidth
                multiline
                minRows={2}
                maxRows={4}
                disabled={saving}
                placeholder="Example: Welcome discount for new members"
                inputProps={{ maxLength: 250 }}
                helperText={`${form.description.length}/250`}
              />
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.5 }}>
              Discount rules
            </Typography>

            <Stack spacing={2.2}>
              <FormControl fullWidth>
                <InputLabel>Discount Type</InputLabel>

                <Select
                  name="discountType"
                  value={form.discountType}
                  label="Discount Type"
                  onChange={handleChange}
                  disabled={saving}
                >
                  <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                </Select>
              </FormControl>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "1fr 1fr",
                  },
                  gap: 2,
                }}
              >
                <TextField
                  name="discountValue"
                  label={
                    form.discountType === "PERCENTAGE"
                      ? "Discount Percentage"
                      : "Discount Amount"
                  }
                  type="number"
                  value={form.discountValue}
                  onChange={handleChange}
                  fullWidth
                  required
                  disabled={saving}
                  inputProps={{
                    min: 0.01,
                    step: 0.01,
                    max: form.discountType === "PERCENTAGE" ? 100 : undefined,
                  }}
                  InputProps={{
                    startAdornment:
                      form.discountType === "FIXED_AMOUNT" ? (
                        <InputAdornment position="start">₹</InputAdornment>
                      ) : undefined,
                    endAdornment:
                      form.discountType === "PERCENTAGE" ? (
                        <InputAdornment position="end">%</InputAdornment>
                      ) : undefined,
                  }}
                />

                <TextField
                  name="minimumAmount"
                  label="Minimum Payment Amount"
                  type="number"
                  value={form.minimumAmount}
                  onChange={handleChange}
                  fullWidth
                  disabled={saving}
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  helperText="Use 0 for no minimum purchase."
                />
              </Box>

              {form.discountType === "PERCENTAGE" && (
                <TextField
                  name="maximumDiscount"
                  label="Maximum Discount"
                  type="number"
                  value={form.maximumDiscount}
                  onChange={handleChange}
                  fullWidth
                  disabled={saving}
                  inputProps={{ min: 0.01, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  helperText="Optional cap for percentage-based discounts."
                />
              )}
            </Stack>
          </Box>

          <Divider />

          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <CalendarMonthRounded fontSize="small" color="primary" />
              <Typography variant="subtitle1" fontWeight={800}>
                Coupon validity
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                name="validFrom"
                label="Valid From"
                type="datetime-local"
                value={form.validFrom}
                onChange={handleChange}
                fullWidth
                required
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                name="validUntil"
                label="Valid Until"
                type="datetime-local"
                value={form.validUntil}
                onChange={handleChange}
                fullWidth
                required
                disabled={saving}
                InputLabelProps={{ shrink: true }}
              />
            </Box>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 1.2 }}
            >
              The coupon can only be validated during this time window.
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, sm: 3.5 },
          py: 2.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(248,250,252,0.72)",
        }}
      >
        <Button
          onClick={handleClose}
          disabled={saving}
          color="inherit"
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          disableElevation
          startIcon={
            saving ? (
              <CircularProgress size={17} color="inherit" />
            ) : (
              <CheckCircleRounded />
            )
          }
          sx={{
            minWidth: 150,
            minHeight: 44,
            px: 2.7,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "0 8px 18px rgba(79,70,229,0.18)",
          }}
        >
          {saving
            ? isEditing
              ? "Updating..."
              : "Creating..."
            : isEditing
              ? "Update Coupon"
              : "Create Coupon"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CouponFormDialog;
