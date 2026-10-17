import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
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
  FormControlLabel,
  FormLabel,
  InputAdornment,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  CalendarMonthRounded,
  CheckCircleRounded,
  CloseRounded,
  InfoOutlined,
  LocalOfferRounded,
  SavingsRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";

const DEFAULT_PRICING_TYPE = "FIXED_AMOUNT";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

const todayDateInput = () => new Date().toISOString().split("T")[0];

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "M";

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

function CustomPricingDialog({ open, member, onClose, onSave }) {
  const [pricingType, setPricingType] = useState(DEFAULT_PRICING_TYPE);
  const [customPrice, setCustomPrice] = useState("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [hasExpiry, setHasExpiry] = useState(false);
  const [effectiveUntil, setEffectiveUntil] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // Current member-pricing API supports fixed-amount overrides.
  // Keep percentage pricing visible but disabled until backend support is added.
  const percentagePricingEnabled = false;

  useEffect(() => {
    if (!open || !member) return;

    setPricingType(member.pricingType || DEFAULT_PRICING_TYPE);
    setCustomPrice(
      member.customPrice !== null && member.customPrice !== undefined
        ? String(member.customPrice)
        : "",
    );
    setEffectiveFrom(member.customPriceFrom || todayDateInput());
    setHasExpiry(Boolean(member.customPriceUntil));
    setEffectiveUntil(member.customPriceUntil || "");
    setReason(member.customPriceReason || "");
    setError("");
  }, [open, member]);

  const regularPrice = Number(member?.standardPrice ?? member?.amount ?? 0);
  const parsedCustomPrice = Number(customPrice);
  const hasValidCustomPrice =
    Number.isFinite(parsedCustomPrice) && parsedCustomPrice > 0;

  const savingsAmount = useMemo(() => {
    if (!hasValidCustomPrice || regularPrice <= 0) return 0;
    return Math.max(regularPrice - parsedCustomPrice, 0);
  }, [hasValidCustomPrice, parsedCustomPrice, regularPrice]);

  const savingsPercentage = useMemo(() => {
    if (savingsAmount <= 0 || regularPrice <= 0) return 0;
    return Math.round((savingsAmount / regularPrice) * 100);
  }, [savingsAmount, regularPrice]);

  const formCompletion = useMemo(() => {
    const checks = [
      hasValidCustomPrice,
      Boolean(effectiveFrom),
      !hasExpiry || Boolean(effectiveUntil),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [hasValidCustomPrice, effectiveFrom, hasExpiry, effectiveUntil]);

  const handleClose = () => {
    if (saving) return;
    setError("");
    onClose?.();
  };

  const validateForm = () => {
    if (!member) return "Member information is missing.";

    if (customPrice === "" || Number.isNaN(Number(customPrice))) {
      return "Please enter a valid custom price.";
    }

    const price = Number(customPrice);
    if (price <= 0) return "Custom price must be greater than ₹0.";

    if (
      pricingType === "FIXED_AMOUNT" &&
      regularPrice > 0 &&
      price >= regularPrice
    ) {
      return "Custom price should be lower than the regular plan price.";
    }

    if (!effectiveFrom) return "Please select an effective start date.";
    if (hasExpiry && !effectiveUntil) return "Please select an expiry date.";

    if (hasExpiry && effectiveUntil < effectiveFrom) {
      return "Expiry date cannot be earlier than the effective start date.";
    }

    return "";
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      pricingType,
      customPrice: Number(customPrice),
      effectiveFrom,
      effectiveUntil: hasExpiry ? effectiveUntil : null,
      reason: reason.trim() || null,
    };

    try {
      setSaving(true);
      setError("");
      await onSave?.(member, payload);
      onClose?.();
    } catch (saveError) {
      setError(
        saveError?.response?.data?.message ||
          saveError?.response?.data?.error ||
          saveError?.message ||
          "Unable to save custom pricing.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!member) return null;

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
            px: { xs: 2.5, md: 3.5 },
            py: { xs: 2.5, md: 3 },
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(79,70,229,0.12), rgba(255,255,255,1) 58%, rgba(99,102,241,0.06))",
            "&::after": {
              content: '\"\"',
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: "50%",
              right: -80,
              top: -110,
              bgcolor: "rgba(79,70,229,0.07)",
            },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{ position: "relative", zIndex: 1 }}
          >
            <Stack direction="row" spacing={1.8} alignItems="center">
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  minWidth: 52,
                  borderRadius: 2.7,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 10px 26px rgba(79,70,229,0.24)",
                }}
              >
                <WorkspacePremiumRounded />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{ letterSpacing: "-0.02em" }}
                >
                  Member-Specific Pricing
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.4 }}
                >
                  Configure a private price override for this member.
                </Typography>
              </Box>
            </Stack>

            <Button
              color="inherit"
              startIcon={<CloseRounded />}
              onClick={handleClose}
              disabled={saving}
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                color: "text.secondary",
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              Close
            </Button>
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: "28px !important",
        }}
      >
        <Stack spacing={3}>
          {error && (
            <Alert
              severity="error"
              onClose={() => setError("")}
              sx={{ borderRadius: 2.5 }}
            >
              {error}
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
                "linear-gradient(145deg, #ffffff 0%, rgba(248,250,252,0.96) 100%)",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <Stack direction="row" spacing={1.6} alignItems="center">
                <Avatar
                  src={member.profileImageUrl || undefined}
                  alt={member.name || "Member"}
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: "rgba(79,70,229,0.10)",
                    color: "primary.main",
                    fontWeight: 800,
                    border: "2px solid",
                    borderColor: "background.paper",
                    boxShadow: "0 6px 18px rgba(15,23,42,0.08)",
                  }}
                >
                  {!member.profileImageUrl ? getInitials(member.name) : null}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    useFlexGap
                    flexWrap="wrap"
                  >
                    <Typography fontWeight={800} variant="h6">
                      {member.name}
                    </Typography>

                    {member.subscriptionStatus && (
                      <Chip
                        size="small"
                        label={member.subscriptionStatus}
                        color={
                          member.subscriptionStatus === "ACTIVE"
                            ? "success"
                            : "default"
                        }
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.3 }}
                  >
                    {member.email || "No email available"}
                    {member.phone ? ` • ${member.phone}` : ""}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {member.plan || member.planName || "Membership Plan"}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Chip
                  icon={<LocalOfferRounded />}
                  label={
                    regularPrice > 0
                      ? `Regular ${formatMoney(regularPrice)}`
                      : "Regular price unavailable"
                  }
                  variant="outlined"
                />

                {member.customPrice != null && (
                  <Chip
                    icon={<SavingsRounded />}
                    label={`Current custom ${formatMoney(member.customPrice)}`}
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Stack>
            </Stack>
          </Paper>

          <Alert
            severity="info"
            icon={<InfoOutlined />}
            sx={{ borderRadius: 2.5 }}
          >
            This price overrides the member&apos;s regular membership price only
            during the configured effective period.
          </Alert>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              border: "1px solid",
              borderColor: hasValidCustomPrice
                ? "rgba(34,197,94,0.30)"
                : "divider",
              borderRadius: 3,
              background: hasValidCustomPrice
                ? "linear-gradient(145deg, rgba(34,197,94,0.07), #ffffff)"
                : "background.paper",
              transition: "all 0.2s ease",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                >
                  MEMBER WILL PAY
                </Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  color={hasValidCustomPrice ? "success.dark" : "text.disabled"}
                  sx={{ mt: 0.3 }}
                >
                  {hasValidCustomPrice ? formatMoney(parsedCustomPrice) : "—"}
                </Typography>
                {regularPrice > 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.4 }}
                  >
                    Regular price {formatMoney(regularPrice)}
                  </Typography>
                )}
              </Box>

              <Stack
                spacing={1}
                alignItems={{ xs: "flex-start", sm: "flex-end" }}
              >
                {savingsAmount > 0 && (
                  <Chip
                    icon={<SavingsRounded />}
                    label={`Save ${formatMoney(
                      savingsAmount,
                    )} (${savingsPercentage}%)`}
                    color="success"
                    variant="outlined"
                  />
                )}

                <Chip
                  icon={
                    formCompletion === 100 ? (
                      <CheckCircleRounded />
                    ) : (
                      <LocalOfferRounded />
                    )
                  }
                  label={`${formCompletion}% configured`}
                  color={formCompletion === 100 ? "success" : "default"}
                  variant="outlined"
                />
              </Stack>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={formCompletion}
              sx={{ mt: 2, height: 6, borderRadius: 999 }}
            />
          </Paper>

          <Divider />

          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1.4 }}>
              Pricing method
            </Typography>

            <FormControl fullWidth>
              <FormLabel
                sx={{
                  mb: 1,
                  color: "text.primary",
                  fontWeight: 700,
                }}
              >
                Custom Pricing Type
              </FormLabel>

              <RadioGroup
                value={pricingType}
                onChange={(event) => {
                  setPricingType(event.target.value);
                  setError("");
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    px: 1.6,
                    py: 0.7,
                    border: "1px solid",
                    borderColor:
                      pricingType === "FIXED_AMOUNT"
                        ? "primary.main"
                        : "divider",
                    borderRadius: 2.5,
                    bgcolor:
                      pricingType === "FIXED_AMOUNT"
                        ? "rgba(79,70,229,0.045)"
                        : "transparent",
                  }}
                >
                  <FormControlLabel
                    value="FIXED_AMOUNT"
                    control={<Radio />}
                    sx={{ m: 0, width: "100%" }}
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          Fixed Amount
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Set the exact amount this member pays.
                        </Typography>
                      </Box>
                    }
                  />
                </Paper>

                <Paper
                  elevation={0}
                  sx={{
                    mt: 1.2,
                    px: 1.6,
                    py: 0.7,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2.5,
                    opacity: percentagePricingEnabled ? 1 : 0.58,
                  }}
                >
                  <FormControlLabel
                    value="PERCENTAGE_DISCOUNT"
                    control={<Radio />}
                    disabled={!percentagePricingEnabled}
                    sx={{ m: 0, width: "100%" }}
                    label={
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        useFlexGap
                        flexWrap="wrap"
                      >
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            Percentage Discount
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Apply a percentage discount to the regular plan
                            price.
                          </Typography>
                        </Box>

                        {!percentagePricingEnabled && (
                          <Chip
                            size="small"
                            label="Coming with API support"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    }
                  />
                </Paper>
              </RadioGroup>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            required
            type="number"
            label="Custom Price"
            value={customPrice}
            onChange={(event) => {
              setCustomPrice(event.target.value);
              setError("");
            }}
            disabled={saving}
            inputProps={{ min: 0.01, step: "0.01" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₹</InputAdornment>
              ),
            }}
            helperText={
              regularPrice > 0
                ? `Enter an amount below the regular plan price of ${formatMoney(
                    regularPrice,
                  )}.`
                : "The member will pay this amount during the configured period."
            }
          />

          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 1.5 }}
            >
              <CalendarMonthRounded color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={800}>
                Effective period
              </Typography>
            </Stack>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: hasExpiry ? "1fr 1fr" : "1fr",
                },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                required
                type="date"
                label="Effective From"
                value={effectiveFrom}
                onChange={(event) => {
                  setEffectiveFrom(event.target.value);
                  setError("");
                }}
                disabled={saving}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />

              {hasExpiry && (
                <TextField
                  fullWidth
                  required
                  type="date"
                  label="Effective Until"
                  value={effectiveUntil}
                  onChange={(event) => {
                    setEffectiveUntil(event.target.value);
                    setError("");
                  }}
                  disabled={saving}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthRounded fontSize="small" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            </Box>

            <FormControl sx={{ mt: 1.7 }}>
              <RadioGroup
                row
                value={hasExpiry ? "SET_EXPIRY" : "NO_EXPIRY"}
                onChange={(event) => {
                  const nextHasExpiry = event.target.value === "SET_EXPIRY";
                  setHasExpiry(nextHasExpiry);
                  if (!nextHasExpiry) setEffectiveUntil("");
                  setError("");
                }}
              >
                <FormControlLabel
                  value="NO_EXPIRY"
                  control={<Radio size="small" />}
                  label="No expiry"
                />
                <FormControlLabel
                  value="SET_EXPIRY"
                  control={<Radio size="small" />}
                  label="Set expiry date"
                />
              </RadioGroup>
            </FormControl>
          </Box>

          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={5}
            label="Reason / Note"
            placeholder="Example: Special pricing offered to a long-term member."
            value={reason}
            onChange={(event) => {
              setReason(event.target.value);
              setError("");
            }}
            disabled={saving}
            inputProps={{ maxLength: 500 }}
            helperText={`${reason.length}/500 · Optional internal note`}
          />
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.5, md: 3.5 },
          py: 2.5,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "rgba(248,250,252,0.72)",
        }}
      >
        <Button
          color="inherit"
          onClick={handleClose}
          disabled={saving}
          sx={{ textTransform: "none", fontWeight: 700 }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disableElevation
          onClick={handleSave}
          disabled={saving}
          startIcon={
            saving ? (
              <CircularProgress size={17} color="inherit" />
            ) : (
              <LocalOfferRounded />
            )
          }
          sx={{
            minWidth: 170,
            minHeight: 44,
            px: 2.7,
            borderRadius: 2.5,
            textTransform: "none",
            fontWeight: 800,
            boxShadow: "0 8px 18px rgba(79,70,229,0.18)",
          }}
        >
          {saving ? "Saving..." : "Save Custom Price"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CustomPricingDialog;
