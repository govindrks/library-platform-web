import {
  Add,
  CleaningServices,
  CloseRounded,
  DeleteOutlineOutlined,
  EditOutlined,
  ElectricBolt,
  FilterAltOff,
  MoreHoriz,
  Newspaper,
  ReceiptLong,
  StorefrontRounded,
  Refresh,
  Search,
  TrendingDown,
  WaterDropOutlined,
  Wifi,
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
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import expenseApi from "../../api/expenseApi";
import libraryApi from "../../api/libraryApi";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const EXPENSE_CATEGORIES = [
  {
    value: "ELECTRICITY",
    label: "Electricity",
    icon: <ElectricBolt fontSize="small" />,
  },
  {
    value: "WATER",
    label: "Water",
    icon: <WaterDropOutlined fontSize="small" />,
  },
  {
    value: "WIFI_INTERNET",
    label: "WiFi / Internet",
    icon: <Wifi fontSize="small" />,
  },
  {
    value: "NEWSPAPER",
    label: "Newspaper",
    icon: <Newspaper fontSize="small" />,
  },
  {
    value: "CLEANING",
    label: "Cleaning",
    icon: <CleaningServices fontSize="small" />,
  },
  {
    value: "RENT",
    label: "Rent",
    icon: <StorefrontRounded fontSize="small" />,
  },
  {
    value: "MAINTENANCE",
    label: "Maintenance",
    icon: <CleaningServices fontSize="small" />,
  },
  {
    value: "STAFF_SALARY",
    label: "Staff Salary",
    icon: <ReceiptLong fontSize="small" />,
  },
  {
    value: "OFFICE_SUPPLIES",
    label: "Office Supplies",
    icon: <ReceiptLong fontSize="small" />,
  },
  { value: "OTHER", label: "Other", icon: <MoreHoriz fontSize="small" /> },
];

function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(`${String(value).substring(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatEnum(value) {
  if (!value) return "-";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

function emptyExpense() {
  return {
    category: "ELECTRICITY",
    expenseName: "",
    amount: "",
    expenseDate: today(),
    vendorName: "",
    referenceNumber: "",
    notes: "",
  };
}

function SummaryCard({ label, value, helper, icon, tone = "primary" }) {
  const theme = useTheme();
  const color =
    tone === "error"
      ? theme.palette.error.main
      : tone === "warning"
        ? theme.palette.warning.main
        : theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: alpha(color, 0.15),
        borderRadius: 3.5,
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" spacing={1.6} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.4,
              display: "grid",
              placeItems: "center",
              color,
              bgcolor: alpha(color, 0.09),
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={900}>
              {value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {helper}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function ExpenseFormDialog({ open, expense, saving, onClose, onSave }) {
  const theme = useTheme();
  const [form, setForm] = useState(emptyExpense());
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setError("");
    setForm(
      expense
        ? {
            category: expense.category || "OTHER",
            expenseName: expense.expenseName || "",
            amount: String(expense.amount ?? ""),
            expenseDate: String(expense.expenseDate || today()).substring(
              0,
              10,
            ),
            vendorName: expense.vendorName || "",
            referenceNumber: expense.referenceNumber || "",
            notes: expense.notes || "",
          }
        : emptyExpense(),
    );
  }, [open, expense]);

  const set = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const submit = async () => {
    const amount = Number(form.amount);

    if (!form.expenseName.trim()) {
      setError("Expense name is required.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Expense amount must be greater than zero.");
      return;
    }

    if (!form.expenseDate) {
      setError("Expense date is required.");
      return;
    }

    await onSave({
      category: form.category,
      expenseName: form.expenseName.trim(),
      amount,
      expenseDate: form.expenseDate,
      vendorName: form.vendorName.trim() || null,
      referenceNumber: form.referenceNumber.trim() || null,
      notes: form.notes.trim() || null,
    });
  };

  const selectedCategory =
    EXPENSE_CATEGORIES.find((item) => item.value === form.category) ||
    EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1];

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      bgcolor: "background.paper",
      transition: "box-shadow 160ms ease, border-color 160ms ease",
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: alpha(theme.palette.primary.main, 0.45),
      },
      "&.Mui-focused": {
        boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.08)}`,
      },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.52)",
            backdropFilter: "blur(5px)",
          },
        },
        paper: {
          sx: {
            width: "100%",
            maxWidth: 760,
            maxHeight: "calc(100vh - 56px)",
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.1),
            boxShadow: "0 32px 90px rgba(15, 23, 42, 0.28)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          p: 0,
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.11) 0%, rgba(255,255,255,0.99) 55%, rgba(14,165,233,0.06) 100%)",
          borderBottom: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{ px: { xs: 2.2, sm: 3 }, py: 2.2 }}
        >
          <Stack direction="row" spacing={1.6} alignItems="center">
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 10px 24px rgba(79,70,229,0.24)",
              }}
            >
              {expense ? <EditOutlined /> : <Add />}
            </Box>

            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 900, letterSpacing: "-0.025em" }}
              >
                {expense ? "Edit Expense" : "Add Expense"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {expense
                  ? "Update this expense while keeping your financial records accurate."
                  : "Record a new operating expense for the selected library."}
              </Typography>
            </Box>
          </Stack>

          <IconButton
            onClick={onClose}
            disabled={saving}
            aria-label="Close expense dialog"
            sx={{
              border: "1px solid",
              borderColor: "divider",
              bgcolor: alpha(theme.palette.background.paper, 0.86),
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            <CloseRounded />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: { xs: 2.2, sm: 3 },
          bgcolor: alpha(theme.palette.primary.main, 0.018),
        }}
      >
        <Stack spacing={2.5}>
          {error && (
            <Alert severity="error" sx={{ borderRadius: 2.3 }}>
              {error}
            </Alert>
          )}

          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1}
              mb={1.4}
            >
              <Box>
                <Typography fontWeight={850}>Expense details</Typography>
                <Typography variant="caption" color="text.secondary">
                  Enter the category, amount and transaction date.
                </Typography>
              </Box>

              <Chip
                size="small"
                icon={selectedCategory.icon}
                label={selectedCategory.label}
                sx={{
                  fontWeight: 800,
                  color: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.12),
                }}
              />
            </Stack>

            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 2.3 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha(theme.palette.text.primary, 0.08),
                bgcolor: "background.paper",
              }}
            >
              <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, sm: 5 }}>
                  <FormControl fullWidth size="small" sx={fieldSx}>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      label="Category *"
                      value={form.category}
                      onChange={(e) => set("category", e.target.value)}
                      renderValue={(value) => {
                        const selected =
                          EXPENSE_CATEGORIES.find(
                            (item) => item.value === value,
                          ) || selectedCategory;

                        return (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Box
                              sx={{ color: "primary.main", display: "flex" }}
                            >
                              {selected.icon}
                            </Box>
                            <Typography variant="body2" fontWeight={750}>
                              {selected.label}
                            </Typography>
                          </Stack>
                        );
                      }}
                    >
                      {EXPENSE_CATEGORIES.map((category) => (
                        <MenuItem key={category.value} value={category.value}>
                          <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                          >
                            <Box
                              sx={{ color: "text.secondary", display: "flex" }}
                            >
                              {category.icon}
                            </Box>
                            <span>{category.label}</span>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid size={{ xs: 12, sm: 7 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    label={
                      form.category === "OTHER"
                        ? "Other Expense Name"
                        : "Expense Name"
                    }
                    placeholder={
                      form.category === "OTHER"
                        ? "e.g. AC repair or generator fuel"
                        : "e.g. October Electricity Bill"
                    }
                    value={form.expenseName}
                    onChange={(e) => set("expenseName", e.target.value)}
                    sx={fieldSx}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    type="number"
                    label="Amount"
                    value={form.amount}
                    onChange={(e) => set("amount", e.target.value)}
                    slotProps={{ htmlInput: { min: 0.01, step: 0.01 } }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography fontWeight={900} color="primary.main">
                            ₹
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={fieldSx}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    required
                    size="small"
                    type="date"
                    label="Expense Date"
                    value={form.expenseDate}
                    onChange={(e) => set("expenseDate", e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>

          <Box>
            <Typography fontWeight={850}>Payment reference</Typography>
            <Typography variant="caption" color="text.secondary">
              Optional vendor, invoice and notes for reconciliation.
            </Typography>

            <Paper
              elevation={0}
              sx={{
                mt: 1.4,
                p: { xs: 2, sm: 2.3 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha(theme.palette.text.primary, 0.08),
                bgcolor: "background.paper",
              }}
            >
              <Grid container spacing={1.8}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Vendor / Payee"
                    placeholder="e.g. BSES, Airtel, Local Vendor"
                    value={form.vendorName}
                    onChange={(e) => set("vendorName", e.target.value)}
                    sx={fieldSx}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Reference / Invoice No."
                    placeholder="Optional invoice or receipt number"
                    value={form.referenceNumber}
                    onChange={(e) => set("referenceNumber", e.target.value)}
                    sx={fieldSx}
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    maxRows={5}
                    size="small"
                    label="Notes"
                    placeholder="Add any useful details about this expense..."
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    sx={fieldSx}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: { xs: 2.2, sm: 3 },
          py: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mr: "auto", display: { xs: "none", sm: "block" } }}
        >
          * Required fields
        </Typography>

        <Button
          disabled={saving}
          onClick={onClose}
          sx={{
            minWidth: 96,
            borderRadius: 2.2,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          Cancel
        </Button>

        <Button
          variant="contained"
          disabled={saving}
          onClick={submit}
          startIcon={
            saving ? (
              <CircularProgress size={16} color="inherit" />
            ) : expense ? (
              <EditOutlined />
            ) : (
              <Add />
            )
          }
          sx={{
            minWidth: 158,
            minHeight: 42,
            px: 2.2,
            borderRadius: 2.2,
            textTransform: "none",
            fontWeight: 850,
            boxShadow: "0 10px 20px rgba(79,70,229,0.22)",
          }}
        >
          {saving ? "Saving..." : expense ? "Update Expense" : "Save Expense"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function Expenses() {
  const theme = useTheme();
  const [libraries, setLibraries] = useState([]);
  const [libraryId, setLibraryId] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const selectedLibrary = useMemo(
    () =>
      libraries.find((item) => String(item.id) === String(libraryId)) || null,
    [libraries, libraryId],
  );

  const loadLibraries = useCallback(async () => {
    try {
      const response = await libraryApi.getMyLibraries();
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : [];

      setLibraries(list);
      if (!list.length) return;

      const stored = Number(localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY));
      const validStored = list.some((item) => Number(item.id) === stored);
      const next = validStored ? stored : list[0].id;
      setLibraryId(String(next));
      localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(next));
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load libraries."));
    }
  }, []);

  const loadExpenses = useCallback(async () => {
    if (!libraryId) return;
    try {
      setLoading(true);
      setError("");
      const response = await expenseApi.getExpenses(libraryId);
      const list = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : [];
      setExpenses(list);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load expenses."));
    } finally {
      setLoading(false);
    }
  }, [libraryId]);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, item) => sum + Number(item.amount ?? 0), 0),
    [expenses],
  );

  const monthExpenses = useMemo(() => {
    const now = new Date();
    return expenses.reduce((sum, item) => {
      if (!item.expenseDate) return sum;
      const d = new Date(
        `${String(item.expenseDate).substring(0, 10)}T00:00:00`,
      );
      if (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth()
      ) {
        return sum + Number(item.amount ?? 0);
      }
      return sum;
    }, 0);
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals = {};
    expenses.forEach((item) => {
      totals[item.category] =
        (totals[item.category] || 0) + Number(item.amount ?? 0);
    });
    return totals;
  }, [expenses]);

  const largestCategory = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return expenses.filter((item) => {
      const searchable = [
        item.expenseName,
        item.vendorName,
        item.referenceNumber,
        item.notes,
        item.category,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(q),
      );

      const itemDate = String(item.expenseDate || "").substring(0, 10);
      return (
        (!q || searchable) &&
        (category === "ALL" || item.category === category) &&
        (!fromDate || itemDate >= fromDate) &&
        (!toDate || itemDate <= toDate)
      );
    });
  }, [expenses, search, category, fromDate, toDate]);

  const saveExpense = async (payload) => {
    try {
      setSaving(true);
      setError("");
      if (editing?.id) {
        await expenseApi.updateExpense(libraryId, editing.id, payload);
        setSuccess("Expense updated successfully.");
      } else {
        await expenseApi.createExpense(libraryId, payload);
        setSuccess("Expense added successfully.");
      }
      setFormOpen(false);
      setEditing(null);
      await loadExpenses();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to save expense."));
    } finally {
      setSaving(false);
    }
  };

  const deleteExpense = async () => {
    if (!deleteTarget?.id) return;
    try {
      setDeleting(true);
      setError("");
      await expenseApi.deleteExpense(libraryId, deleteTarget.id);
      setSuccess("Expense deleted successfully.");
      setDeleteTarget(null);
      await loadExpenses();
    } catch (err) {
      setError(getErrorMessage(err, "Unable to delete expense."));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          p: { xs: 2.5, md: 3.2 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.13),
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(255,255,255,0.99) 48%, rgba(14,165,233,0.055) 100%)",
          boxShadow: "0 18px 48px rgba(15,23,42,0.055)",
          "&::after": {
            content: '\"\"',
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            right: -55,
            top: -85,
            bgcolor: alpha(theme.palette.primary.main, 0.045),
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2.5}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={1.8} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 14px 28px rgba(79,70,229,0.24)",
                flexShrink: 0,
              }}
            >
              <ReceiptLong />
            </Box>

            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, letterSpacing: "-0.04em" }}
                >
                  Expenses
                </Typography>

                <Chip
                  size="small"
                  label="Finance intelligence"
                  sx={{
                    fontWeight: 800,
                    color: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.07),
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.12),
                  }}
                />
              </Stack>

              <Typography
                color="text.secondary"
                sx={{ mt: 0.45, maxWidth: 720, lineHeight: 1.6 }}
              >
                Record, organize and review every operating expense for the
                selected library.
              </Typography>

              {selectedLibrary && (
                <Chip
                  label={selectedLibrary.name}
                  size="small"
                  variant="outlined"
                  sx={{ mt: 1.1, fontWeight: 800, bgcolor: "background.paper" }}
                />
              )}
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.1}
            alignItems={{ xs: "stretch", sm: "center" }}
          >
            <Button
              variant="outlined"
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Refresh />
                )
              }
              disabled={!libraryId || loading}
              onClick={loadExpenses}
              sx={{
                minHeight: 44,
                borderRadius: 2.3,
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "background.paper",
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              disabled={!libraryId}
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
              sx={{
                minHeight: 44,
                px: 2.2,
                borderRadius: 2.3,
                textTransform: "none",
                fontWeight: 850,
                boxShadow: "0 10px 22px rgba(79,70,229,0.20)",
              }}
            >
              Add Expense
            </Button>

            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 220 },
                bgcolor: "background.paper",
                borderRadius: 2.2,
              }}
            >
              <InputLabel>Working Library</InputLabel>
              <Select
                label="Working Library"
                value={libraryId}
                onChange={(e) => {
                  setLibraryId(String(e.target.value));
                  localStorage.setItem(
                    OWNER_SELECTED_LIBRARY_KEY,
                    String(e.target.value),
                  );
                }}
                sx={{ borderRadius: 2.2, fontWeight: 700 }}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Paper>

      {success && (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2.5 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} mb={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Total Expenses"
            value={`₹${formatCurrency(totalExpenses)}`}
            helper={`${expenses.length} recorded expenses`}
            icon={<TrendingDown />}
            tone="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="This Month"
            value={`₹${formatCurrency(monthExpenses)}`}
            helper="Current month operating cost"
            icon={<ReceiptLong />}
            tone="warning"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Largest Category"
            value={largestCategory ? formatEnum(largestCategory[0]) : "-"}
            helper={
              largestCategory
                ? `₹${formatCurrency(largestCategory[1])}`
                : "No expenses"
            }
            icon={<ElectricBolt />}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            label="Average Expense"
            value={`₹${formatCurrency(expenses.length ? totalExpenses / expenses.length : 0)}`}
            helper="Average per expense entry"
            icon={<ReceiptLong />}
          />
        </Grid>
      </Grid>

      <Card
        elevation={0}
        sx={{
          mb: 2.5,
          border: "1px solid",
          borderColor: alpha(theme.palette.text.primary, 0.08),
          borderRadius: 3.5,
          boxShadow: "0 10px 30px rgba(15,23,42,0.035)",
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              value={search}
              placeholder="Search expense, vendor, invoice or notes..."
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel>Category</InputLabel>
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <MenuItem value="ALL">All Categories</MenuItem>
                {EXPENSE_CATEGORIES.map((item) => (
                  <MenuItem key={item.value} value={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="From"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              size="small"
              type="date"
              label="To"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="outlined"
              startIcon={<FilterAltOff />}
              onClick={() => {
                setSearch("");
                setCategory("ALL");
                setFromDate("");
                setToDate("");
              }}
            >
              Clear
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: alpha(theme.palette.text.primary, 0.08),
          borderRadius: 3.5,
          overflow: "hidden",
          boxShadow: "0 14px 38px rgba(15,23,42,0.045)",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Expense</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Vendor</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 7 }}>
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((expense) => (
                    <TableRow key={expense.id} hover>
                      <TableCell>{formatDate(expense.expenseDate)}</TableCell>
                      <TableCell>
                        <Typography fontWeight={800}>
                          {expense.expenseName}
                        </Typography>
                        {expense.notes && (
                          <Typography variant="caption" color="text.secondary">
                            {expense.notes}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={formatEnum(expense.category)}
                        />
                      </TableCell>
                      <TableCell>{expense.vendorName || "-"}</TableCell>
                      <TableCell>{expense.referenceNumber || "-"}</TableCell>
                      <TableCell>
                        <Typography fontWeight={900} color="error.main">
                          ₹{formatCurrency(expense.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit expense">
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setEditing(expense);
                              setFormOpen(true);
                            }}
                          >
                            <EditOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete expense">
                          <IconButton
                            color="error"
                            onClick={() => setDeleteTarget(expense)}
                          >
                            <DeleteOutlineOutlined fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}

              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ py: 8 }}>
                      <ReceiptLong
                        sx={{ fontSize: 42, color: "text.disabled" }}
                      />
                      <Typography variant="h6" fontWeight={850} mt={1}>
                        No expenses found
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />
        <TablePagination
          component="div"
          count={filtered.length}
          page={Math.min(
            page,
            Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1),
          )}
          onPageChange={(_e, next) => setPage(next)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      <ExpenseFormDialog
        open={formOpen}
        expense={editing}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setFormOpen(false);
            setEditing(null);
          }
        }}
        onSave={saveExpense}
      />

      <Dialog
        open={Boolean(deleteTarget)}
        onClose={deleting ? undefined : () => setDeleteTarget(null)}
      >
        <DialogTitle fontWeight={900}>Delete Expense?</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            This action cannot be undone.
          </Typography>
          {deleteTarget && (
            <Paper variant="outlined" sx={{ p: 2, mt: 2, borderRadius: 2 }}>
              <Typography fontWeight={850}>
                {deleteTarget.expenseName}
              </Typography>
              <Typography color="error.main" fontWeight={900}>
                ₹{formatCurrency(deleteTarget.amount)}
              </Typography>
            </Paper>
          )}
        </DialogContent>
        <DialogActions>
          <Button disabled={deleting} onClick={() => setDeleteTarget(null)}>
            Cancel
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleting}
            onClick={deleteExpense}
          >
            {deleting ? "Deleting..." : "Delete Expense"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
