import React, { useCallback, useEffect, useMemo, useState } from "react";

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
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RedeemIcon from "@mui/icons-material/Redeem";
import BlockIcon from "@mui/icons-material/Block";
import RefreshIcon from "@mui/icons-material/Refresh";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ScheduleIcon from "@mui/icons-material/Schedule";
import PercentIcon from "@mui/icons-material/Percent";
import CurrencyRupeeIcon from "@mui/icons-material/CurrencyRupee";
import ClearAllIcon from "@mui/icons-material/ClearAll";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";

import libraryApi from "../../api/libraryApi";
import couponApi from "../../api/couponApi";
import platformSubscriptionApi from "../../api/platformSubscriptionApi";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const emptyForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minimumAmount: "0",
  maximumDiscount: "",
  validFrom: "",
  validUntil: "",
};

function safeNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  return `₹${safeNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDateTime(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getErrorMessage(error, fallback) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function normalizeListResponse(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.content)) return response.content;
  if (Array.isArray(response?.data)) return response.data;
  return [];
}

function getStoredLibraryId() {
  const raw = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);
  if (!raw) return null;
  const id = Number(raw);
  return Number.isFinite(id) ? id : null;
}

function storeLibraryId(libraryId) {
  const id = Number(libraryId);
  if (!Number.isFinite(id)) return;
  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
}

function getCouponStatus(coupon) {
  const explicit = String(coupon?.status || "").toUpperCase();
  if (explicit && explicit !== "ACTIVE") return explicit;

  const now = Date.now();
  const validFrom = coupon?.validFrom
    ? new Date(coupon.validFrom).getTime()
    : null;
  const validUntil = coupon?.validUntil
    ? new Date(coupon.validUntil).getTime()
    : null;

  if (Number.isFinite(validUntil) && validUntil < now) return "EXPIRED";
  if (Number.isFinite(validFrom) && validFrom > now) return "SCHEDULED";
  return explicit || "ACTIVE";
}

function getDaysUntil(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

function StatusChip({ status }) {
  const config = {
    ACTIVE: { label: "Active", color: "success" },
    USED: { label: "Used", color: "info" },
    EXPIRED: { label: "Expired", color: "warning" },
    DEACTIVATED: { label: "Deactivated", color: "default" },
    SCHEDULED: { label: "Scheduled", color: "primary" },
  };

  const current = config[status] || {
    label: status || "-",
    color: "default",
  };

  return (
    <Chip
      size="small"
      label={current.label}
      color={current.color}
      variant="outlined"
      sx={{ fontWeight: 750, borderRadius: 1.5 }}
    />
  );
}

function MetricCard({ title, value, helper, icon, tone = "primary" }) {
  const theme = useTheme();
  const palette = theme.palette[tone] || theme.palette.primary;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: alpha(palette.main, 0.14),
        borderRadius: 3.5,
        background: `linear-gradient(145deg, ${alpha(
          palette.main,
          0.055,
        )} 0%, ${alpha(theme.palette.background.paper, 0.98)} 52%)`,
        transition:
          "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 14px 32px ${alpha(theme.palette.common.black, 0.07)}`,
          borderColor: alpha(palette.main, 0.26),
        },
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              {title}
            </Typography>
            <Typography variant="h5" fontWeight={850} sx={{ mt: 0.45 }}>
              {value}
            </Typography>
            {helper && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", mt: 0.4 }}
              >
                {helper}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              bgcolor: alpha(palette.main, 0.1),
              color: palette.main,
              border: `1px solid ${alpha(palette.main, 0.14)}`,
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetailRow({ label, value, strong = false }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={strong ? 800 : 650}
        textAlign="right"
        sx={{ wordBreak: "break-word" }}
      >
        {value}
      </Typography>
    </Stack>
  );
}

function Coupons() {
  const theme = useTheme();

  const [libraries, setLibraries] = useState([]);
  const [selectedLibraryId, setSelectedLibraryId] = useState("");
  const [coupons, setCoupons] = useState([]);

  const [loadingLibraries, setLoadingLibraries] = useState(true);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [couponToDeactivate, setCouponToDeactivate] = useState(null);
  const [deactivatingId, setDeactivatingId] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [copiedCouponId, setCopiedCouponId] = useState(null);

  const resolveInitialLibrary = useCallback(async (libraryList) => {
    const storedId = getStoredLibraryId();

    if (storedId != null) {
      const stored = libraryList.find(
        (library) => Number(library?.id) === Number(storedId),
      );
      if (stored) return stored;
    }

    for (const library of libraryList) {
      try {
        const active = await platformSubscriptionApi.getActiveSubscription(
          library.id,
        );
        if (active) return library;
      } catch {
        // Keep checking the remaining libraries.
      }
    }

    return libraryList[0] ?? null;
  }, []);

  const loadLibraries = useCallback(async () => {
    try {
      setLoadingLibraries(true);
      setError("");

      const response = await libraryApi.getMyLibraries();
      const list = normalizeListResponse(response);
      setLibraries(list);

      if (list.length === 0) {
        setSelectedLibraryId("");
        setCoupons([]);
        return;
      }

      const initial = await resolveInitialLibrary(list);
      if (!initial?.id) return;

      setSelectedLibraryId(String(initial.id));
      storeLibraryId(initial.id);
    } catch (err) {
      console.error("Failed to load libraries:", err);
      setLibraries([]);
      setSelectedLibraryId("");
      setCoupons([]);
      setError(getErrorMessage(err, "Failed to load libraries."));
    } finally {
      setLoadingLibraries(false);
    }
  }, [resolveInitialLibrary]);

  const loadCoupons = useCallback(
    async (libraryId, { silent = false } = {}) => {
      if (!libraryId) {
        setCoupons([]);
        return;
      }

      try {
        if (!silent) setLoadingCoupons(true);
        setError("");

        const response = await couponApi.getLibraryCoupons(libraryId);
        setCoupons(normalizeListResponse(response));
      } catch (err) {
        console.error("Failed to load coupons:", err);
        setCoupons([]);
        setError(getErrorMessage(err, "Failed to load coupons."));
      } finally {
        if (!silent) setLoadingCoupons(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (selectedLibraryId) {
      loadCoupons(Number(selectedLibraryId));
    } else {
      setCoupons([]);
    }
  }, [selectedLibraryId, loadCoupons]);

  useEffect(() => {
    const handleLibraryChanged = (event) => {
      const nextId = Number(event?.detail?.libraryId);
      if (!Number.isFinite(nextId)) return;

      const exists = libraries.some(
        (library) => Number(library?.id) === Number(nextId),
      );
      if (!exists) return;

      setSelectedLibraryId(String(nextId));
      storeLibraryId(nextId);
      setSearch("");
      setStatusFilter("ALL");
      setError("");
      setSuccess("");
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);
    return () =>
      window.removeEventListener("owner-library-changed", handleLibraryChanged);
  }, [libraries]);

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) ?? null,
    [libraries, selectedLibraryId],
  );

  const normalizedCoupons = useMemo(
    () =>
      coupons.map((coupon) => ({
        ...coupon,
        displayStatus: getCouponStatus(coupon),
      })),
    [coupons],
  );

  const summary = useMemo(() => {
    const total = normalizedCoupons.length;
    const active = normalizedCoupons.filter(
      (coupon) => coupon.displayStatus === "ACTIVE",
    ).length;
    const used = normalizedCoupons.filter(
      (coupon) => coupon.displayStatus === "USED",
    ).length;
    const inactive = normalizedCoupons.filter((coupon) =>
      ["EXPIRED", "DEACTIVATED"].includes(coupon.displayStatus),
    ).length;
    const scheduled = normalizedCoupons.filter(
      (coupon) => coupon.displayStatus === "SCHEDULED",
    ).length;
    const expiringSoon = normalizedCoupons.filter((coupon) => {
      if (coupon.displayStatus !== "ACTIVE") return false;
      const days = getDaysUntil(coupon.validUntil);
      return days != null && days >= 0 && days <= 7;
    }).length;

    const percentageCoupons = normalizedCoupons.filter(
      (coupon) => coupon.discountType === "PERCENTAGE",
    );
    const avgPercentage = percentageCoupons.length
      ? percentageCoupons.reduce(
          (sum, coupon) => sum + safeNumber(coupon.discountValue),
          0,
        ) / percentageCoupons.length
      : 0;

    return {
      total,
      active,
      used,
      inactive,
      scheduled,
      expiringSoon,
      avgPercentage,
    };
  }, [normalizedCoupons]);

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return normalizedCoupons.filter((coupon) => {
      const matchesSearch =
        !query ||
        [coupon.code, coupon.description, coupon.discountType, coupon.id].some(
          (value) =>
            String(value ?? "")
              .toLowerCase()
              .includes(query),
        );

      const matchesStatus =
        statusFilter === "ALL" || coupon.displayStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [normalizedCoupons, search, statusFilter]);

  const filtersActive = Boolean(search.trim()) || statusFilter !== "ALL";

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError("");
  };

  const openCreateDialog = () => {
    setForm(emptyForm);
    setFormError("");
    setError("");
    setSuccess("");
    setCreateOpen(true);
  };

  const handleCreate = async () => {
    if (!selectedLibraryId) return;

    if (
      !form.code.trim() ||
      !form.discountValue ||
      !form.validFrom ||
      !form.validUntil
    ) {
      setFormError(
        "Coupon code, discount value and validity period are required.",
      );
      return;
    }

    if (Number(form.discountValue) <= 0) {
      setFormError("Discount value must be greater than zero.");
      return;
    }

    if (
      form.discountType === "PERCENTAGE" &&
      Number(form.discountValue) > 100
    ) {
      setFormError("Percentage discount cannot exceed 100%.");
      return;
    }

    const startDate = new Date(form.validFrom);
    const endDate = new Date(form.validUntil);

    if (endDate < startDate) {
      setFormError("Valid Until must be after Valid From.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");
      setError("");
      setSuccess("");

      const payload = {
        libraryId: Number(selectedLibraryId),
        code: form.code.trim().toUpperCase(),
        description: form.description.trim() || null,
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumAmount: form.minimumAmount ? Number(form.minimumAmount) : 0,
        maximumDiscount:
          form.discountType === "PERCENTAGE" && form.maximumDiscount
            ? Number(form.maximumDiscount)
            : null,
        validFrom: form.validFrom,
        validUntil: form.validUntil,
      };

      await couponApi.createCoupon(Number(selectedLibraryId), payload);

      setCreateOpen(false);
      setForm(emptyForm);
      setSuccess(`Coupon ${payload.code} created successfully.`);
      await loadCoupons(Number(selectedLibraryId));
    } catch (err) {
      console.error("Failed to create coupon:", err);
      setFormError(getErrorMessage(err, "Failed to create coupon."));
    } finally {
      setSaving(false);
    }
  };

  const openDeactivateDialog = (coupon) => {
    setCouponToDeactivate(coupon);
    setDeactivateOpen(true);
    setError("");
    setSuccess("");
  };

  const handleDeactivate = async () => {
    if (!couponToDeactivate?.id || !selectedLibraryId) return;

    try {
      setDeactivatingId(couponToDeactivate.id);
      setError("");
      setSuccess("");

      await couponApi.deactivateCoupon(
        Number(selectedLibraryId),
        couponToDeactivate.id,
      );

      setDeactivateOpen(false);
      setSuccess(`Coupon ${couponToDeactivate.code} deactivated.`);
      setCouponToDeactivate(null);
      await loadCoupons(Number(selectedLibraryId));
    } catch (err) {
      console.error("Failed to deactivate coupon:", err);
      setError(getErrorMessage(err, "Failed to deactivate coupon."));
    } finally {
      setDeactivatingId(null);
    }
  };

  const handleCopyCode = async (coupon) => {
    try {
      await navigator.clipboard.writeText(coupon.code || "");
      setCopiedCouponId(coupon.id);
      window.setTimeout(() => setCopiedCouponId(null), 1500);
    } catch {
      setError("Unable to copy coupon code.");
    }
  };

  const handleRefresh = async () => {
    if (!selectedLibraryId) return;
    setSuccess("");
    await loadCoupons(Number(selectedLibraryId));
  };

  const handleLibraryChange = (event) => {
    const nextId = String(event.target.value);
    setSelectedLibraryId(nextId);
    storeLibraryId(nextId);
    setSearch("");
    setStatusFilter("ALL");
    setError("");
    setSuccess("");

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: { libraryId: Number(nextId) },
      }),
    );
  };

  const openDetails = (coupon) => {
    setSelectedCoupon(coupon);
    setDetailsOpen(true);
  };

  if (loadingLibraries && libraries.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 420,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading coupon workspace...
          </Typography>
        </Stack>
      </Box>
    );
  }

  const previewDiscount =
    form.discountType === "PERCENTAGE"
      ? form.discountValue
        ? `${safeNumber(form.discountValue)}% OFF`
        : "Percentage discount"
      : form.discountValue
        ? `${formatMoney(form.discountValue)} OFF`
        : "Fixed discount";

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
          p: { xs: 2.25, md: 3 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.14),
          background: `radial-gradient(circle at 92% 8%, ${alpha(
            theme.palette.primary.main,
            0.1,
          )} 0%, transparent 32%), linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.055,
          )} 0%, ${alpha(theme.palette.background.paper, 0.98)} 58%)`,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2.5}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 62,
                height: 62,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                color: "common.white",
                flexShrink: 0,
                background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                boxShadow: `0 12px 28px ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 30 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography variant="h4" fontWeight={900}>
                  Coupons
                </Typography>
                <Chip
                  size="small"
                  icon={
                    <AutoAwesomeIcon sx={{ fontSize: "16px !important" }} />
                  }
                  label="Promotion studio"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 750 }}
                />
              </Stack>

              <Typography color="text.secondary" sx={{ mt: 0.4 }}>
                Create targeted offers, manage validity and keep promotional
                discounts under control.
              </Typography>

              {selectedLibrary && (
                <Chip
                  size="small"
                  icon={<StorefrontIcon sx={{ fontSize: "16px !important" }} />}
                  label={selectedLibrary.name}
                  sx={{ mt: 1.15, fontWeight: 700 }}
                />
              )}
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.25}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 220 },
                bgcolor: alpha(theme.palette.background.paper, 0.85),
              }}
            >
              <InputLabel>Working Library</InputLabel>
              <Select
                value={selectedLibraryId}
                label="Working Library"
                onChange={handleLibraryChange}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Tooltip title="Refresh coupons">
              <span>
                <IconButton
                  onClick={handleRefresh}
                  disabled={!selectedLibraryId || loadingCoupons}
                  sx={{
                    width: 42,
                    height: 42,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  {loadingCoupons ? (
                    <CircularProgress size={18} />
                  ) : (
                    <RefreshIcon />
                  )}
                </IconButton>
              </span>
            </Tooltip>

            <Button
              variant="contained"
              disableElevation
              startIcon={<AddIcon />}
              disabled={!selectedLibraryId}
              onClick={openCreateDialog}
              sx={{ px: 2.25, minHeight: 42, fontWeight: 800 }}
            >
              Create Coupon
            </Button>
          </Stack>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2.5 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(4, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 2,
        }}
      >
        <MetricCard
          title="Total Coupons"
          value={summary.total}
          helper={`${summary.scheduled} scheduled`}
          icon={<LocalOfferIcon />}
          tone="primary"
        />
        <MetricCard
          title="Active Offers"
          value={summary.active}
          helper={`${summary.expiringSoon} expiring in 7 days`}
          icon={<CheckCircleIcon />}
          tone="success"
        />
        <MetricCard
          title="Redeemed"
          value={summary.used}
          helper="Coupons already consumed"
          icon={<RedeemIcon />}
          tone="info"
        />
        <MetricCard
          title="Expired / Disabled"
          value={summary.inactive}
          helper="Inactive promotions"
          icon={<BlockIcon />}
          tone="warning"
        />
      </Box>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.025),
        }}
      >
        <CardContent sx={{ py: 1.6, "&:last-child": { pb: 1.6 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.2, md: 4 }}
            divider={<Divider orientation="vertical" flexItem />}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <ScheduleIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Expiring soon
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {summary.expiringSoon} active coupon
                  {summary.expiringSoon === 1 ? "" : "s"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <PercentIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Avg. percentage offer
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {summary.avgPercentage
                    ? `${summary.avgPercentage.toFixed(1)}%`
                    : "No percentage coupons"}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <ConfirmationNumberIcon fontSize="small" color="primary" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Current view
                </Typography>
                <Typography variant="body2" fontWeight={800}>
                  {filteredCoupons.length} coupon
                  {filteredCoupons.length === 1 ? "" : "s"}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3.5,
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.5}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search coupon code, description, type or ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: { md: 190 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="SCHEDULED">Scheduled</MenuItem>
                <MenuItem value="USED">Used</MenuItem>
                <MenuItem value="EXPIRED">Expired</MenuItem>
                <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="text"
              startIcon={<ClearAllIcon />}
              disabled={!filtersActive}
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              sx={{ whiteSpace: "nowrap", fontWeight: 750 }}
            >
              Clear filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3.5,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" fontWeight={850}>
            Coupon directory
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {filteredCoupons.length} coupon
            {filteredCoupons.length === 1 ? "" : "s"} match the current view
          </Typography>
        </Box>

        {loadingCoupons ? (
          <Box
            sx={{
              minHeight: 280,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Stack alignItems="center" spacing={1.5}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary">
                Loading promotions...
              </Typography>
            </Stack>
          </Box>
        ) : filteredCoupons.length === 0 ? (
          <Box
            sx={{
              minHeight: 280,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              px: 2,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
                mb: 1.5,
              }}
            >
              <LocalOfferIcon sx={{ fontSize: 32 }} />
            </Box>
            <Typography variant="h6" fontWeight={800}>
              {filtersActive ? "No matching coupons" : "No coupons yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
              {filtersActive
                ? "Adjust your search or filters to find a promotion."
                : "Create your first promotional coupon for this library."}
            </Typography>
            {!filtersActive && selectedLibraryId && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateDialog}
                sx={{ mt: 2 }}
              >
                Create Coupon
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.025) }}
                >
                  <TableCell>Coupon</TableCell>
                  <TableCell>Discount</TableCell>
                  <TableCell>Minimum</TableCell>
                  <TableCell>Validity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCoupons.map((coupon) => {
                  const daysRemaining = getDaysUntil(coupon.validUntil);
                  const isExpiringSoon =
                    coupon.displayStatus === "ACTIVE" &&
                    daysRemaining != null &&
                    daysRemaining >= 0 &&
                    daysRemaining <= 7;

                  return (
                    <TableRow
                      key={coupon.id}
                      hover
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.018),
                        },
                      }}
                    >
                      <TableCell sx={{ minWidth: 220 }}>
                        <Stack
                          direction="row"
                          spacing={1.25}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 38,
                              height: 38,
                              borderRadius: 2,
                              display: "grid",
                              placeItems: "center",
                              bgcolor: alpha(theme.palette.primary.main, 0.08),
                              color: "primary.main",
                              flexShrink: 0,
                            }}
                          >
                            <LocalOfferIcon fontSize="small" />
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <Typography variant="body2" fontWeight={850}>
                                {coupon.code}
                              </Typography>
                              <Tooltip
                                title={
                                  copiedCouponId === coupon.id
                                    ? "Copied"
                                    : "Copy code"
                                }
                              >
                                <IconButton
                                  size="small"
                                  onClick={() => handleCopyCode(coupon)}
                                  sx={{ p: 0.35 }}
                                >
                                  <ContentCopyIcon sx={{ fontSize: 15 }} />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{
                                display: "block",
                                maxWidth: 260,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {coupon.description || "No description"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Stack spacing={0.2}>
                          <Typography variant="body2" fontWeight={800}>
                            {coupon.discountType === "PERCENTAGE"
                              ? `${safeNumber(coupon.discountValue)}%`
                              : formatMoney(coupon.discountValue)}
                          </Typography>
                          {coupon.discountType === "PERCENTAGE" &&
                            coupon.maximumDiscount && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Max {formatMoney(coupon.maximumDiscount)}
                              </Typography>
                            )}
                        </Stack>
                      </TableCell>

                      <TableCell>{formatMoney(coupon.minimumAmount)}</TableCell>

                      <TableCell sx={{ minWidth: 190 }}>
                        <Typography variant="body2">
                          {formatDate(coupon.validFrom)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          until {formatDate(coupon.validUntil)}
                        </Typography>
                        {isExpiringSoon && (
                          <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            label={`${daysRemaining}d left`}
                            sx={{ ml: 0.75, height: 20, fontSize: 11 }}
                          />
                        )}
                      </TableCell>

                      <TableCell>
                        <StatusChip status={coupon.displayStatus} />
                      </TableCell>

                      <TableCell>
                        {coupon.displayStatus === "USED" ? (
                          <Stack spacing={0.15}>
                            <Typography variant="body2" fontWeight={650}>
                              User #{coupon.usedBy ?? "-"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Saved {formatMoney(coupon.discountAmount)}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            Not redeemed
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="right">
                        <Stack
                          direction="row"
                          spacing={0.5}
                          justifyContent="flex-end"
                          alignItems="center"
                        >
                          <Tooltip title="View coupon details">
                            <IconButton
                              size="small"
                              onClick={() => openDetails(coupon)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>

                          {coupon.displayStatus === "ACTIVE" && (
                            <Button
                              color="error"
                              size="small"
                              disabled={deactivatingId === coupon.id}
                              onClick={() => openDeactivateDialog(coupon)}
                              sx={{ fontWeight: 750 }}
                            >
                              Deactivate
                            </Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      <Dialog
        open={createOpen}
        onClose={() => {
          if (!saving) setCreateOpen(false);
        }}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.09),
                color: "primary.main",
              }}
            >
              <AddIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={850}>
                Create Coupon
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Build a promotion for {selectedLibrary?.name || "this library"}.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 3 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "minmax(0, 1.15fr) minmax(260px, .85fr)",
              },
              gap: 3,
              mt: 0.5,
            }}
          >
            <Stack spacing={2.1}>
              {formError && <Alert severity="error">{formError}</Alert>}

              <TextField
                fullWidth
                size="small"
                label="Coupon Code"
                placeholder="WELCOME20"
                required
                value={form.code}
                onChange={(event) =>
                  updateField("code", event.target.value.toUpperCase())
                }
                inputProps={{ maxLength: 50 }}
                helperText="Short, memorable codes work best."
              />

              <TextField
                fullWidth
                size="small"
                label="Description"
                placeholder="New member welcome offer"
                value={form.description}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                multiline
                minRows={2}
                maxRows={3}
              />

              <FormControl fullWidth size="small">
                <InputLabel>Discount Type</InputLabel>
                <Select
                  value={form.discountType}
                  label="Discount Type"
                  onChange={(event) => {
                    const value = event.target.value;
                    setForm((current) => ({
                      ...current,
                      discountType: value,
                      maximumDiscount:
                        value === "FIXED_AMOUNT" ? "" : current.maximumDiscount,
                    }));
                    setFormError("");
                  }}
                >
                  <MenuItem value="PERCENTAGE">Percentage</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                </Select>
              </FormControl>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  label={
                    form.discountType === "PERCENTAGE"
                      ? "Discount Percentage"
                      : "Discount Amount"
                  }
                  type="number"
                  required
                  value={form.discountValue}
                  onChange={(event) =>
                    updateField("discountValue", event.target.value)
                  }
                  inputProps={{
                    min: 0.01,
                    step: 0.01,
                    max: form.discountType === "PERCENTAGE" ? 100 : undefined,
                  }}
                  InputProps={{
                    startAdornment:
                      form.discountType === "FIXED_AMOUNT" ? (
                        <InputAdornment position="start">₹</InputAdornment>
                      ) : null,
                    endAdornment:
                      form.discountType === "PERCENTAGE" ? (
                        <InputAdornment position="end">%</InputAdornment>
                      ) : null,
                  }}
                />

                <TextField
                  fullWidth
                  size="small"
                  label="Minimum Purchase"
                  type="number"
                  value={form.minimumAmount}
                  onChange={(event) =>
                    updateField("minimumAmount", event.target.value)
                  }
                  inputProps={{ min: 0, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                />
              </Box>

              {form.discountType === "PERCENTAGE" && (
                <TextField
                  fullWidth
                  size="small"
                  label="Maximum Discount"
                  type="number"
                  value={form.maximumDiscount}
                  onChange={(event) =>
                    updateField("maximumDiscount", event.target.value)
                  }
                  inputProps={{ min: 0.01, step: 0.01 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">₹</InputAdornment>
                    ),
                  }}
                  helperText="Optional cap for percentage-based discounts"
                />
              )}

              <Typography variant="subtitle2" fontWeight={800}>
                Coupon validity
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  type="datetime-local"
                  label="Valid From"
                  value={form.validFrom}
                  onChange={(event) =>
                    updateField("validFrom", event.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ "aria-label": "Valid From" }}
                />

                <TextField
                  fullWidth
                  size="small"
                  type="datetime-local"
                  label="Valid Until"
                  value={form.validUntil}
                  onChange={(event) =>
                    updateField("validUntil", event.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ "aria-label": "Valid Until" }}
                />
              </Box>
            </Stack>

            <Card
              elevation={0}
              sx={{
                alignSelf: "start",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.16),
                borderRadius: 3,
                background: `linear-gradient(150deg, ${alpha(
                  theme.palette.primary.main,
                  0.09,
                )}, ${alpha(theme.palette.background.paper, 0.98)} 58%)`,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography
                      variant="overline"
                      color="primary.main"
                      fontWeight={900}
                    >
                      Live preview
                    </Typography>
                    <LocalOfferIcon color="primary" />
                  </Stack>

                  <Box>
                    <Typography
                      variant="h5"
                      fontWeight={900}
                      letterSpacing={0.5}
                    >
                      {form.code.trim() || "YOURCODE"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.35 }}
                    >
                      {form.description.trim() ||
                        "Your promotion description will appear here."}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: alpha(theme.palette.primary.main, 0.07),
                    }}
                  >
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      color="primary.main"
                    >
                      {previewDiscount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {safeNumber(form.minimumAmount) > 0
                        ? `Minimum purchase ${formatMoney(form.minimumAmount)}`
                        : "No minimum purchase"}
                    </Typography>
                  </Box>

                  <Divider />

                  <DetailRow
                    label="Discount type"
                    value={
                      form.discountType === "PERCENTAGE"
                        ? "Percentage"
                        : "Fixed amount"
                    }
                  />
                  <DetailRow
                    label="Maximum discount"
                    value={
                      form.discountType === "PERCENTAGE" && form.maximumDiscount
                        ? formatMoney(form.maximumDiscount)
                        : "No cap"
                    }
                  />
                  <DetailRow
                    label="Starts"
                    value={formatDateTime(form.validFrom)}
                  />
                  <DetailRow
                    label="Ends"
                    value={formatDateTime(form.validUntil)}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 2.25,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button disabled={saving} onClick={() => setCreateOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disableElevation
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AddIcon />
              )
            }
            onClick={handleCreate}
            sx={{ px: 2.5, fontWeight: 800 }}
          >
            {saving ? "Creating..." : "Create Coupon"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 2 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.09),
                color: "primary.main",
              }}
            >
              <LocalOfferIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={850}>
                Coupon Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Promotion configuration and usage information.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pb: 3 }}>
          {selectedCoupon && (
            <Stack spacing={2.1}>
              <Box
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.15),
                  bgcolor: alpha(theme.palette.primary.main, 0.035),
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h5" fontWeight={900}>
                      {selectedCoupon.code}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.35 }}
                    >
                      {selectedCoupon.description || "No description"}
                    </Typography>
                  </Box>
                  <StatusChip status={selectedCoupon.displayStatus} />
                </Stack>
              </Box>

              <DetailRow label="Coupon ID" value={`#${selectedCoupon.id}`} />
              <DetailRow
                label="Discount"
                value={
                  selectedCoupon.discountType === "PERCENTAGE"
                    ? `${safeNumber(selectedCoupon.discountValue)}%`
                    : formatMoney(selectedCoupon.discountValue)
                }
                strong
              />
              <DetailRow
                label="Minimum purchase"
                value={formatMoney(selectedCoupon.minimumAmount)}
              />
              <DetailRow
                label="Maximum discount"
                value={
                  selectedCoupon.maximumDiscount
                    ? formatMoney(selectedCoupon.maximumDiscount)
                    : "No cap"
                }
              />
              <Divider />
              <DetailRow
                label="Valid from"
                value={formatDateTime(selectedCoupon.validFrom)}
              />
              <DetailRow
                label="Valid until"
                value={formatDateTime(selectedCoupon.validUntil)}
              />

              {selectedCoupon.displayStatus === "USED" && (
                <>
                  <Divider />
                  <DetailRow
                    label="Used by"
                    value={`User #${selectedCoupon.usedBy ?? "-"}`}
                  />
                  <DetailRow
                    label="Discount applied"
                    value={formatMoney(selectedCoupon.discountAmount)}
                    strong
                  />
                  <DetailRow
                    label="Used at"
                    value={formatDateTime(selectedCoupon.usedAt)}
                  />
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.25 }}>
          {selectedCoupon && (
            <Button
              startIcon={<ContentCopyIcon />}
              onClick={() => handleCopyCode(selectedCoupon)}
            >
              Copy Code
            </Button>
          )}
          <Button variant="contained" onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deactivateOpen}
        onClose={() => {
          if (!deactivatingId) {
            setDeactivateOpen(false);
            setCouponToDeactivate(null);
          }
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: 4 } }}
      >
        <DialogTitle sx={{ pt: 3, px: 3 }}>
          <Typography variant="h6" fontWeight={850}>
            Deactivate coupon?
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3 }}>
          <Alert severity="warning" sx={{ mt: 1 }}>
            <strong>{couponToDeactivate?.code}</strong> will no longer be
            available for future redemptions. Existing historical usage is
            preserved.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.25 }}>
          <Button
            disabled={Boolean(deactivatingId)}
            onClick={() => {
              setDeactivateOpen(false);
              setCouponToDeactivate(null);
            }}
          >
            Keep Active
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={Boolean(deactivatingId)}
            startIcon={
              deactivatingId ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <BlockIcon />
              )
            }
            onClick={handleDeactivate}
          >
            {deactivatingId ? "Deactivating..." : "Deactivate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Coupons;
