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
  FormControl,
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
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RedeemIcon from "@mui/icons-material/Redeem";
import BlockIcon from "@mui/icons-material/Block";

import { useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import couponApi from "../../api/couponApi";

// =============================================================
// HELPERS
// =============================================================

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) => {
  return `₹${safeNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

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

// =============================================================
// STATUS CHIP
// =============================================================

function StatusChip({ status }) {
  const config = {
    ACTIVE: {
      label: "Active",

      color: "success",
    },

    USED: {
      label: "Used",

      color: "info",
    },

    EXPIRED: {
      label: "Expired",

      color: "warning",
    },

    DEACTIVATED: {
      label: "Deactivated",

      color: "default",
    },
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
    />
  );
}

// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({ title, value, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",

        borderRadius: 3,

        height: "100%",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mt: 0.5,
              }}
            >
              {value}
            </Typography>
          </Box>

          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
}

// =============================================================
// MAIN PAGE
// =============================================================

function Coupons() {
  // =========================================================
  // LIBRARY
  // =========================================================

  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  // =========================================================
  // COUPONS
  // =========================================================

  const [coupons, setCoupons] = useState([]);

  // =========================================================
  // PAGE STATE
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // FILTERS
  // =========================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  // =========================================================
  // CREATE COUPON
  // =========================================================

  const [createOpen, setCreateOpen] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [saving, setSaving] = useState(false);

  // =========================================================
  // DEACTIVATE
  // =========================================================

  const [deactivatingId, setDeactivatingId] = useState(null);

  // =========================================================
  // LOAD LIBRARIES
  // =========================================================

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await libraryApi.getMyLibraries();

        const list = Array.isArray(data) ? data : [];

        setLibraries(list);

        if (list.length > 0) {
          setSelectedLibraryId(String(list[0].id));
        }
      } catch (err) {
        console.error("Failed to load libraries:", err);

        setError(getErrorMessage(err, "Failed to load libraries."));
      } finally {
        setLoading(false);
      }
    };

    loadLibraries();
  }, []);

  // =========================================================
  // LOAD COUPONS
  // =========================================================

  const loadCoupons = async (libraryId) => {
    if (!libraryId) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      const data = await couponApi.getLibraryCoupons(libraryId);

      setCoupons(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load coupons:", err);

      setError(getErrorMessage(err, "Failed to load coupons."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLibraryId) {
      loadCoupons(Number(selectedLibraryId));
    }
  }, [selectedLibraryId]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    return {
      total: coupons.length,

      active: coupons.filter((coupon) => coupon.status === "ACTIVE").length,

      used: coupons.filter((coupon) => coupon.status === "USED").length,

      inactive: coupons.filter(
        (coupon) =>
          coupon.status === "EXPIRED" || coupon.status === "DEACTIVATED",
      ).length,
    };
  }, [coupons]);

  // =========================================================
  // FILTER COUPONS
  // =========================================================

  const filteredCoupons = useMemo(() => {
    const query = search.trim().toLowerCase();

    return coupons.filter((coupon) => {
      const matchesSearch =
        !query ||
        String(coupon.code ?? "")
          .toLowerCase()
          .includes(query) ||
        String(coupon.description ?? "")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" || coupon.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [coupons, search, statusFilter]);

  // =========================================================
  // UPDATE FORM FIELD
  // =========================================================

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,

      [field]: value,
    }));
  };

  // =========================================================
  // OPEN CREATE DIALOG
  // =========================================================

  const openCreateDialog = () => {
    setForm(emptyForm);

    setError("");

    setCreateOpen(true);
  };

  // =========================================================
  // CREATE COUPON
  // =========================================================

  const handleCreate = async () => {
    if (!selectedLibraryId) {
      return;
    }

    if (
      !form.code.trim() ||
      !form.discountValue ||
      !form.validFrom ||
      !form.validUntil
    ) {
      setError("Coupon code, discount value and validity period are required.");

      return;
    }

    if (Number(form.discountValue) <= 0) {
      setError("Discount value must be greater than zero.");

      return;
    }

    if (
      form.discountType === "PERCENTAGE" &&
      Number(form.discountValue) > 100
    ) {
      setError("Percentage discount cannot exceed 100%.");

      return;
    }

    const startDate = new Date(form.validFrom);

    const endDate = new Date(form.validUntil);

    if (endDate < startDate) {
      setError("Valid Until must be after Valid From.");

      return;
    }

    try {
      setSaving(true);

      setError("");

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

      await loadCoupons(Number(selectedLibraryId));
    } catch (err) {
      console.error("Failed to create coupon:", err);

      setError(getErrorMessage(err, "Failed to create coupon."));
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DEACTIVATE COUPON
  // =========================================================

  const handleDeactivate = async (coupon) => {
    const confirmed = window.confirm(`Deactivate coupon ${coupon.code}?`);

    if (!confirmed) {
      return;
    }

    try {
      setDeactivatingId(coupon.id);

      setError("");

      await couponApi.deactivateCoupon(Number(selectedLibraryId), coupon.id);

      await loadCoupons(Number(selectedLibraryId));
    } catch (err) {
      console.error("Failed to deactivate coupon:", err);

      setError(getErrorMessage(err, "Failed to deactivate coupon."));
    } finally {
      setDeactivatingId(null);
    }
  };

  // =========================================================
  // INITIAL LOADING
  // =========================================================

  if (loading && libraries.length === 0) {
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

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box>
      {/* =================================================
                HEADER
            ================================================= */}

      <Stack
        direction={{
          xs: "column",

          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",

          md: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Coupons
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Create and manage promotional discounts for your members.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",

            sm: "row",
          }}
          spacing={1.5}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 220,
            }}
          >
            <InputLabel>Library</InputLabel>

            <Select
              value={selectedLibraryId}
              label="Library"
              onChange={(event) => {
                setSelectedLibraryId(event.target.value);

                setError("");
              }}
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            variant="contained"
            disableElevation
            startIcon={<AddIcon />}
            disabled={!selectedLibraryId}
            onClick={openCreateDialog}
          >
            Create Coupon
          </Button>
        </Stack>
      </Stack>

      {/* =================================================
                ERROR
            ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* =================================================
                SUMMARY
            ================================================= */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            sm: "repeat(2, 1fr)",

            lg: "repeat(4, 1fr)",
          },

          gap: 2,

          mb: 3,
        }}
      >
        <SummaryCard
          title="Total Coupons"
          value={summary.total}
          icon={<LocalOfferIcon color="primary" />}
        />

        <SummaryCard
          title="Active"
          value={summary.active}
          icon={<CheckCircleIcon color="success" />}
        />

        <SummaryCard
          title="Used"
          value={summary.used}
          icon={<RedeemIcon color="info" />}
        />

        <SummaryCard
          title="Expired / Deactivated"
          value={summary.inactive}
          icon={<BlockIcon color="warning" />}
        />
      </Box>

      {/* =================================================
                FILTERS
            ================================================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",

          borderRadius: 3,

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
              placeholder="Search coupon code or description..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 190,
              }}
            >
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <MenuItem value="ALL">All Status</MenuItem>

                <MenuItem value="ACTIVE">Active</MenuItem>

                <MenuItem value="USED">Used</MenuItem>

                <MenuItem value="EXPIRED">Expired</MenuItem>

                <MenuItem value="DEACTIVATED">Deactivated</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* =================================================
                COUPON TABLE
            ================================================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",

          borderRadius: 3,

          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 280,

              display: "flex",

              alignItems: "center",

              justifyContent: "center",
            }}
          >
            <CircularProgress />
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
            <LocalOfferIcon
              sx={{
                fontSize: 48,

                color: "text.disabled",

                mb: 1,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              No coupons found
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Create your first promotional coupon for this library.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Coupon</TableCell>

                  <TableCell>Discount</TableCell>

                  <TableCell>Minimum Amount</TableCell>

                  <TableCell>Validity</TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell>Usage</TableCell>

                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id} hover>
                    {/* COUPON */}

                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {coupon.code}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {coupon.description || "-"}
                      </Typography>
                    </TableCell>

                    {/* DISCOUNT */}

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {coupon.discountType === "PERCENTAGE"
                          ? `${safeNumber(coupon.discountValue)}%`
                          : formatMoney(coupon.discountValue)}
                      </Typography>

                      {coupon.maximumDiscount &&
                        coupon.discountType === "PERCENTAGE" && (
                          <Typography variant="caption" color="text.secondary">
                            Max {formatMoney(coupon.maximumDiscount)}
                          </Typography>
                        )}
                    </TableCell>

                    {/* MINIMUM */}

                    <TableCell>{formatMoney(coupon.minimumAmount)}</TableCell>

                    {/* VALIDITY */}

                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(coupon.validFrom)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        to {formatDateTime(coupon.validUntil)}
                      </Typography>
                    </TableCell>

                    {/* STATUS */}

                    <TableCell>
                      <StatusChip status={coupon.status} />
                    </TableCell>

                    {/* USAGE */}

                    <TableCell>
                      {coupon.status === "USED" ? (
                        <Stack spacing={0.25}>
                          <Typography variant="body2">
                            User #{coupon.usedBy ?? "-"}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Discount {formatMoney(coupon.discountAmount)}
                          </Typography>

                          {coupon.usedAt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {formatDateTime(coupon.usedAt)}
                            </Typography>
                          )}
                        </Stack>
                      ) : (
                        "-"
                      )}
                    </TableCell>

                    {/* ACTION */}

                    <TableCell align="right">
                      {coupon.status === "ACTIVE" ? (
                        <Button
                          color="error"
                          size="small"
                          disabled={deactivatingId === coupon.id}
                          onClick={() => handleDeactivate(coupon)}
                        >
                          {deactivatingId === coupon.id
                            ? "Deactivating..."
                            : "Deactivate"}
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {/* =================================================
                CREATE COUPON DIALOG
            ================================================= */}

      <Dialog
        open={createOpen}
        onClose={() => {
          if (!saving) {
            setCreateOpen(false);
          }
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,

            overflow: "hidden",
          },
        }}
      >
        {/* HEADER */}

        <DialogTitle
          sx={{
            px: 3,

            pt: 3,

            pb: 1,
          }}
        >
          <Typography variant="h6" fontWeight={700}>
            Create Coupon
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Create a promotional discount for members of this library.
          </Typography>
        </DialogTitle>

        {/* CONTENT */}

        <DialogContent
          sx={{
            px: 3,

            pt: "16px !important",

            pb: 2,
          }}
        >
          <Stack spacing={2.25}>
            {/* COUPON CODE */}

            <TextField
              fullWidth
              size="small"
              label="Coupon Code"
              placeholder="WELCOME50"
              required
              value={form.code}
              onChange={(event) =>
                updateField("code", event.target.value.toUpperCase())
              }
              inputProps={{
                maxLength: 50,
              }}
              helperText="Example: WELCOME50, NEWUSER20"
            />

            {/* DESCRIPTION */}

            <TextField
              fullWidth
              size="small"
              label="Description"
              placeholder="Optional description for this coupon"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              multiline
              minRows={2}
              maxRows={3}
            />

            {/* DISCOUNT TYPE */}

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
                }}
              >
                <MenuItem value="PERCENTAGE">Percentage</MenuItem>

                <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
              </Select>
            </FormControl>

            {/* DISCOUNT + MINIMUM */}

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
                inputProps={{
                  min: 0,

                  step: 0.01,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* MAXIMUM DISCOUNT */}

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
                inputProps={{
                  min: 0.01,

                  step: 0.01,
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">₹</InputAdornment>
                  ),
                }}
                helperText="Optional cap for percentage-based discounts"
              />
            )}

            {/* VALIDITY */}

            <Box>
              <Typography
                variant="subtitle2"
                fontWeight={600}
                sx={{
                  mb: 1,
                }}
              >
                Coupon Validity
              </Typography>

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
                {/* VALID FROM */}

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",

                      mb: 0.75,

                      ml: 0.25,
                    }}
                  >
                    Valid From *
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    value={form.validFrom}
                    onChange={(event) =>
                      updateField("validFrom", event.target.value)
                    }
                    inputProps={{
                      "aria-label": "Valid From",
                    }}
                  />
                </Box>

                {/* VALID UNTIL */}

                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",

                      mb: 0.75,

                      ml: 0.25,
                    }}
                  >
                    Valid Until *
                  </Typography>

                  <TextField
                    fullWidth
                    size="small"
                    type="datetime-local"
                    value={form.validUntil}
                    onChange={(event) =>
                      updateField("validUntil", event.target.value)
                    }
                    inputProps={{
                      "aria-label": "Valid Until",
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Stack>
        </DialogContent>

        {/* ACTIONS */}

        <DialogActions
          sx={{
            px: 3,

            py: 2.5,

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
            sx={{
              px: 2.5,
            }}
          >
            {saving ? "Creating..." : "Create Coupon"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Coupons;
