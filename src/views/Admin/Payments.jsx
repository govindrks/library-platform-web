import {
  AccountBalanceWalletOutlined,
  Close,
  DownloadOutlined,
  ErrorOutlineOutlined,
  HourglassEmptyOutlined,
  PaymentsOutlined,
  ReceiptLongOutlined,
  Refresh,
  ReplayOutlined,
  Search,
  TrendingUpOutlined,
  VisibilityOutlined,
  WarningAmberOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Skeleton,
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

import { useCallback, useEffect, useMemo, useState } from "react";

import adminApi from "../../api/adminApi";
import invoiceApi from "../../api/invoiceApi";
import usePlatformConfig from "../../api/usePlatformConfig";


// ============================================================
// STATUS
// ============================================================

const STATUS_OPTIONS = [
  "PENDING",
  "CREATED",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
];


// ============================================================
// REFERENCE TYPES
// ============================================================

const REFERENCE_TYPES = [
  "PLATFORM_SUBSCRIPTION",
  "MEMBERSHIP",
  "BOOKING",
  "SUBSCRIPTION_RENEWAL",
  "SECURITY_DEPOSIT",
  "LATE_FEE",
  "OTHER",
];


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
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
};


const formatMoney = (amount, currency = "INR") => {
  if (
    amount === null
    || amount === undefined
    || amount === ""
  ) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount));
};


const formatDateTime = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};


const getStatusColor = (status) => {
  switch (status) {
    case "SUCCESS":
      return "success";

    case "PENDING":
    case "CREATED":
      return "warning";

    case "FAILED":
      return "error";

    case "REFUNDED":
      return "info";

    default:
      return "default";
  }
};


const getStatusTone = (status, theme) => {
  switch (status) {
    case "SUCCESS":
      return theme.palette.success;

    case "PENDING":
    case "CREATED":
      return theme.palette.warning;

    case "FAILED":
      return theme.palette.error;

    case "REFUNDED":
      return theme.palette.info;

    default:
      return theme.palette.primary;
  }
};



// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  label,
  value,
  helper,
  icon,
  tone = "primary",
}) {
  const theme = useTheme();

  const palette =
    tone === "success"
      ? theme.palette.success
      : tone === "warning"
        ? theme.palette.warning
        : tone === "error"
          ? theme.palette.error
          : tone === "info"
            ? theme.palette.info
            : theme.palette.primary;

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 2.35,
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
          boxShadow: `0 16px 34px ${alpha(
            theme.palette.common.black,
            0.07,
          )}`,
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

      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            variant="body2"
            color="text.secondary"
            fontWeight={750}
          >
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

          <Typography
            variant="caption"
            color="text.secondary"
          >
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
// INFO TILE
// ============================================================

function InfoTile({
  title,
  value,
  helper,
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        p: 1.8,
        borderRadius: 2.6,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
      >
        {title}
      </Typography>

      <Typography
        variant="body1"
        fontWeight={850}
        sx={{
          mt: 0.4,
          wordBreak: "break-word",
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
            mt: 0.35,
            wordBreak: "break-word",
          }}
        >
          {helper}
        </Typography>
      )}
    </Paper>
  );
}


// ============================================================
// COMPONENT
// ============================================================

function Payments() {
  const theme = useTheme();

  const [payments, setPayments] = useState([]);

  const [summary, setSummary] = useState({
    totalTransactions: 0,
    successfulTransactions: 0,
    pendingTransactions: 0,
    createdTransactions: 0,
    failedTransactions: 0,
    refundedTransactions: 0,
    grossSuccessfulAmount: 0,
    platformSubscriptionRevenue: 0,
    refundedAmount: 0,
    averageSuccessfulTransaction: 0,
  });

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("");

  const [referenceTypeFilter, setReferenceTypeFilter] = useState("");

  const [loading, setLoading] = useState(true);

  const [summaryLoading, setSummaryLoading] = useState(true);

  const [error, setError] = useState("");

  const [selectedPayment, setSelectedPayment] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const { platformName } = usePlatformConfig();

  const [downloadingInvoicePaymentId, setDownloadingInvoicePaymentId] =
    useState(null);


  // =========================================================
  // SUMMARY
  // =========================================================

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);

      const response =
        await adminApi.getPaymentSummary();

      setSummary(response || {});
    } catch (requestError) {
      console.error(
        "Payment summary failed:",
        requestError,
      );
    } finally {
      setSummaryLoading(false);
    }
  }, []);


  // =========================================================
  // PAYMENTS
  // =========================================================

  const loadPayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await adminApi.getPayments({
          search,
          status: statusFilter,
          referenceType: referenceTypeFilter,
        });

      setPayments(
        Array.isArray(response)
          ? response
          : [],
      );
    } catch (requestError) {
      console.error(
        "Admin payments load failed:",
        requestError,
      );

      setError(
        requestError?.response?.data?.message
        || "Unable to load payment transactions.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    search,
    statusFilter,
    referenceTypeFilter,
  ]);


  useEffect(() => {
    loadSummary();
  }, [loadSummary]);


  useEffect(() => {
    const timer = setTimeout(() => {
      loadPayments();
    }, 300);

    return () => clearTimeout(timer);
  }, [loadPayments]);


  const refreshAll = async () => {
    await Promise.all([
      loadSummary(),
      loadPayments(),
    ]);
  };


  // =========================================================
  // REAL DERIVED HEALTH
  // =========================================================

  const health = useMemo(() => {
    const total =
      Number(summary.totalTransactions || 0);

    const successful =
      Number(summary.successfulTransactions || 0);

    const pending =
      Number(summary.pendingTransactions || 0)
      + Number(summary.createdTransactions || 0);

    const failed =
      Number(summary.failedTransactions || 0);

    const refunded =
      Number(summary.refundedTransactions || 0);

    const successRate =
      total > 0
        ? Math.round(
            (successful / total) * 100,
          )
        : 0;

    return {
      successRate,
      pending,
      failed,
      refunded,
      attention:
        pending + failed,
    };
  }, [summary]);


  // =========================================================
  // DETAILS
  // =========================================================

  const handleView = async (paymentId) => {
    try {
      setDetailsLoading(true);
      setError("");

      const response =
        await adminApi.getPayment(
          paymentId,
        );

      setSelectedPayment(response);
      setDetailsOpen(true);
    } catch (requestError) {
      setError(
        requestError?.response?.data?.message
        || "Unable to load payment details.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };


  // =========================================================
  // PAYMENT INVOICE PDF
  // =========================================================

  const handleDownloadInvoice = async (payment) => {
    const paymentTransactionId = Number(
      payment?.paymentId
      ?? payment?.transactionId
      ?? payment?.id,
    );

    if (!Number.isFinite(paymentTransactionId)) {
      setError("Payment transaction ID is unavailable.");
      return;
    }

    if (payment?.status !== "SUCCESS") {
      setError("Invoice PDF is available only for a successful payment.");
      return;
    }

    try {
      setDownloadingInvoicePaymentId(
        paymentTransactionId,
      );

      setError("");

      /*
       * Admin list responses may already include libraryId.
       * If they do not, load the real payment details first
       * and resolve the owning tenant from that record.
       */
      let libraryId =
        payment?.libraryId != null
          ? Number(payment.libraryId)
          : null;

      let paymentDetails = payment;

      if (
        !Number.isFinite(libraryId)
      ) {
        paymentDetails =
          await adminApi.getPayment(
            paymentTransactionId,
          );

        libraryId =
          paymentDetails?.libraryId != null
            ? Number(
                paymentDetails.libraryId,
              )
            : null;
      }

      if (
        !Number.isFinite(libraryId)
      ) {
        throw new Error(
          `Library ID is unavailable for payment #${paymentTransactionId}.`,
        );
      }

      const invoice =
        await invoiceApi.generateInvoice(
          paymentTransactionId,
        );

      if (!invoice?.id) {
        throw new Error(
          `Invoice ID was not returned for payment #${paymentTransactionId}.`,
        );
      }

      await invoiceApi.downloadInvoice(
        libraryId,
        invoice.id,
        invoice.invoiceNumber,
      );
    } catch (requestError) {
      console.error(
        "Admin invoice download failed:",
        requestError,
      );

      setError(
        requestError?.response?.data?.message
        || requestError?.response?.data?.error
        || requestError?.message
        || "Unable to download the payment invoice PDF.",
      );
    } finally {
      setDownloadingInvoicePaymentId(
        null,
      );
    }
  };


  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setReferenceTypeFilter("");
  };


  const hasFilters =
    Boolean(search.trim())
    || Boolean(statusFilter)
    || Boolean(referenceTypeFilter);


  // =========================================================
  // UI
  // =========================================================

  return (
    <Box sx={{ pb: 5 }}>
      {/* =================================================== */}
      {/* HERO */}
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
          borderColor: alpha(
            theme.palette.primary.main,
            0.12,
          ),
          background:
            "linear-gradient(135deg, #F8FAFF 0%, #F3F1FF 48%, #EEF5FF 100%)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 230,
            height: 230,
            borderRadius: "50%",
            right: -80,
            top: -120,
            bgcolor: alpha(
              theme.palette.primary.main,
              0.07,
            ),
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
              label="FINANCIAL OPERATIONS"
              size="small"
              icon={<WorkspacePremiumOutlined />}
              sx={{
                mb: 1.3,
                fontWeight: 850,
                letterSpacing: 0.7,
                bgcolor: alpha(
                  theme.palette.primary.main,
                  0.08,
                ),
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
              Payments
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.65,
                maxWidth: 820,
                lineHeight: 1.7,
              }}
            >
              Monitor real payment transactions,
              platform revenue, gateway state,
              refunds and failures across {platformName}.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
          >
            <Chip
              label={`${health.successRate}% success rate`}
              color={
                health.successRate >= 85
                  ? "success"
                  : health.successRate >= 60
                    ? "warning"
                    : "error"
              }
              variant="outlined"
              sx={{
                fontWeight: 800,
                bgcolor: "#FFFFFF",
              }}
            />

            <Tooltip title="Refresh live payment data">
              <IconButton
                onClick={refreshAll}
                disabled={
                  loading || summaryLoading
                }
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "#FFFFFF",
                  border: "1px solid",
                  borderColor: alpha(
                    theme.palette.primary.main,
                    0.12,
                  ),
                }}
              >
                {loading || summaryLoading ? (
                  <CircularProgress
                    size={18}
                  />
                ) : (
                  <Refresh />
                )}
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>


      {/* =================================================== */}
      {/* ERROR */}
      {/* =================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2.5,
          }}
          onClose={() =>
            setError("")
          }
        >
          {error}
        </Alert>
      )}


      {/* =================================================== */}
      {/* KPI */}
      {/* =================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 2,
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
            label="Platform Revenue"
            value={
              summaryLoading
                ? "—"
                : formatMoney(
                    summary.platformSubscriptionRevenue,
                  )
            }
            helper="Platform subscriptions & renewals"
            icon={
              <TrendingUpOutlined />
            }
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
            label="Gross Successful"
            value={
              summaryLoading
                ? "—"
                : formatMoney(
                    summary.grossSuccessfulAmount,
                  )
            }
            helper="All successful payment value"
            icon={
              <AccountBalanceWalletOutlined />
            }
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
            label="Total Transactions"
            value={
              summaryLoading
                ? "—"
                : summary.totalTransactions || 0
            }
            helper="All payment transaction records"
            icon={<PaymentsOutlined />}
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
            label="Average Success"
            value={
              summaryLoading
                ? "—"
                : formatMoney(
                    summary.averageSuccessfulTransaction,
                  )
            }
            helper="Average successful transaction value"
            icon={<ReceiptLongOutlined />}
          />
        </Grid>
      </Grid>


      {/* =================================================== */}
      {/* HEALTH STRIP */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: 1.5,
          borderRadius: 3.2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#FFFFFF",
        }}
      >
        <Grid
          container
          spacing={1}
        >
          <Grid
            size={{
              xs: 6,
              md: 3,
            }}
          >
            <InfoTile
              title="Successful"
              value={
                summary.successfulTransactions || 0
              }
              helper="Completed successfully"
            />
          </Grid>

          <Grid
            size={{
              xs: 6,
              md: 3,
            }}
          >
            <InfoTile
              title="Pending / Created"
              value={health.pending}
              helper="Waiting for completion"
            />
          </Grid>

          <Grid
            size={{
              xs: 6,
              md: 3,
            }}
          >
            <InfoTile
              title="Failed"
              value={health.failed}
              helper="Transactions requiring review"
            />
          </Grid>

          <Grid
            size={{
              xs: 6,
              md: 3,
            }}
          >
            <InfoTile
              title="Refunded"
              value={formatMoney(
                summary.refundedAmount,
              )}
              helper={`${health.refunded} transaction${
                health.refunded === 1
                  ? ""
                  : "s"
              }`}
            />
          </Grid>
        </Grid>
      </Paper>


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
          borderColor: alpha(
            theme.palette.primary.main,
            0.1,
          ),
          bgcolor: "#FFFFFF",
          boxShadow:
            "0 8px 24px rgba(15,23,42,0.035)",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            lg: "row",
          }}
          spacing={1.25}
          alignItems={{
            xs: "stretch",
            lg: "center",
          }}
        >
          <TextField
            fullWidth
            placeholder="Search transaction, gateway ID, library or customer..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            sx={{
              "& .MuiOutlinedInput-root": {
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                "& fieldset": {
                  borderColor: alpha(
                    theme.palette.divider,
                    0.95,
                  ),
                },
                "&:hover fieldset": {
                  borderColor: alpha(
                    theme.palette.primary.main,
                    0.32,
                  ),
                },
                "&.Mui-focused": {
                  boxShadow: `0 0 0 3px ${alpha(
                    theme.palette.primary.main,
                    0.08,
                  )}`,
                },
                "&.Mui-focused fieldset": {
                  borderColor:
                    theme.palette.primary.main,
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
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 1.8,
                      bgcolor: alpha(
                        theme.palette.primary.main,
                        0.06,
                      ),
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
                lg: 190,
              },
            }}
          >
            <InputLabel>
              Status
            </InputLabel>

            <Select
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              sx={{
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                fontWeight: 650,
              }}
            >
              <MenuItem value="">
                All Statuses
              </MenuItem>

              {STATUS_OPTIONS.map(
                (status) => (
                  <MenuItem
                    key={status}
                    value={status}
                  >
                    {displayEnum(
                      status,
                    )}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          <FormControl
            sx={{
              minWidth: {
                xs: "100%",
                lg: 240,
              },
            }}
          >
            <InputLabel>
              Payment Type
            </InputLabel>

            <Select
              label="Payment Type"
              value={
                referenceTypeFilter
              }
              onChange={(event) =>
                setReferenceTypeFilter(
                  event.target.value,
                )
              }
              sx={{
                height: 48,
                borderRadius: 2.7,
                bgcolor: "#FFFFFF",
                fontWeight: 650,
              }}
            >
              <MenuItem value="">
                All Payment Types
              </MenuItem>

              {REFERENCE_TYPES.map(
                (type) => (
                  <MenuItem
                    key={type}
                    value={type}
                  >
                    {displayEnum(type)}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl>

          {hasFilters && (
            <Button
              variant="outlined"
              onClick={clearFilters}
              sx={{
                height: 48,
                minWidth: 118,
                borderRadius: 2.7,
                textTransform: "none",
                fontWeight: 750,
              }}
            >
              Clear filters
            </Button>
          )}
        </Stack>
      </Paper>


      {/* =================================================== */}
      {/* TABLE */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2,
              md: 2.5,
            },
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
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
              sm: "center",
            }}
          >
            <Box>
              <Typography
                fontWeight={900}
              >
                Transaction Directory
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                Real gateway, customer, reference and status records.
              </Typography>
            </Box>

            {!loading && (
              <Chip
                size="small"
                variant="outlined"
                label={`${payments.length} result${
                  payments.length === 1
                    ? ""
                    : "s"
                }`}
                sx={{
                  fontWeight: 750,
                }}
              />
            )}
          </Stack>
        </Box>

        <TableContainer>
          <Table
            sx={{
              minWidth: 1180,
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    0.025,
                  ),
                }}
              >
                {[
                  "Transaction",
                  "Library / Customer",
                  "Type",
                  "Gateway",
                  "Amount",
                  "Status",
                  "Created",
                ].map((heading) => (
                  <TableCell
                    key={heading}
                    sx={{
                      py: 1.5,
                      fontSize: 12,
                      fontWeight: 850,
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </TableCell>
                ))}

                <TableCell
                  align="right"
                  sx={{
                    py: 1.5,
                    fontSize: 12,
                    fontWeight: 850,
                    color: "text.secondary",
                  }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                Array.from({
                  length: 5,
                }).map((_, index) => (
                  <TableRow
                    key={`loading-${index}`}
                  >
                    {Array.from({
                      length: 7,
                    }).map((__, cell) => (
                      <TableCell
                        key={cell}
                      >
                        <Skeleton
                          width={
                            cell === 0
                              ? 115
                              : cell === 1
                                ? 150
                                : 95
                          }
                        />
                      </TableCell>
                    ))}

                    <TableCell
                      align="right"
                    >
                      <Skeleton
                        variant="circular"
                        width={32}
                        height={32}
                        sx={{
                          ml: "auto",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    align="center"
                    sx={{
                      py: 9,
                    }}
                  >
                    <Box
                      sx={{
                        width: 58,
                        height: 58,
                        mx: "auto",
                        borderRadius: 3,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(
                          theme.palette.primary.main,
                          0.06,
                        ),
                        color: "primary.main",
                      }}
                    >
                      <PaymentsOutlined
                        sx={{
                          fontSize: 30,
                        }}
                      />
                    </Box>

                    <Typography
                      variant="h6"
                      fontWeight={850}
                      sx={{
                        mt: 1.5,
                      }}
                    >
                      No payment transactions found
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mt: 0.5,
                      }}
                    >
                      Try changing your search or filters.
                    </Typography>

                    {hasFilters && (
                      <Button
                        onClick={clearFilters}
                        sx={{
                          mt: 1.5,
                          textTransform: "none",
                          fontWeight: 750,
                        }}
                      >
                        Clear filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                payments.map(
                  (payment) => {
                    const tone =
                      getStatusTone(
                        payment.status,
                        theme,
                      );

                    return (
                      <TableRow
                        hover
                        key={payment.id}
                        sx={{
                          "&:last-child td": {
                            borderBottom: 0,
                          },
                          bgcolor:
                            payment.status === "FAILED"
                              ? alpha(
                                  theme.palette.error.main,
                                  0.012,
                                )
                              : "transparent",
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.1}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2,
                                display: "grid",
                                placeItems: "center",
                                bgcolor: alpha(
                                  tone.main
                                  || theme.palette.primary.main,
                                  0.08,
                                ),
                                color:
                                  tone.main
                                  || theme.palette.primary.main,
                                flexShrink: 0,
                              }}
                            >
                              <ReceiptLongOutlined
                                sx={{
                                  fontSize: 19,
                                }}
                              />
                            </Box>

                            <Box>
                              <Typography
                                fontWeight={800}
                              >
                                #{payment.id}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {payment.gatewayOrderId
                                  || payment.receiptNumber
                                  || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={750}
                          >
                            {payment.libraryName || "-"}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {payment.customerName
                              || payment.customerEmail
                              || "-"}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            variant="outlined"
                            label={displayEnum(
                              payment.referenceType,
                            )}
                            sx={{
                              fontWeight: 750,
                              maxWidth: 190,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                          >
                            {displayEnum(
                              payment.paymentGateway,
                            )}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {displayEnum(
                              payment.paymentMethod,
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography
                            fontWeight={850}
                            color="primary.main"
                          >
                            {formatMoney(
                              payment.amount,
                              payment.currency,
                            )}
                          </Typography>

                          {Number(
                            payment.couponDiscountAmount || 0,
                          ) > 0 && (
                            <Typography
                              variant="caption"
                              color="success.main"
                              fontWeight={700}
                            >
                              Discount{" "}
                              {formatMoney(
                                payment.couponDiscountAmount,
                                payment.currency,
                              )}
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            color={getStatusColor(
                              payment.status,
                            )}
                            label={displayEnum(
                              payment.status,
                            )}
                            variant={
                              payment.status === "SUCCESS"
                                ? "filled"
                                : "outlined"
                            }
                            sx={{
                              fontWeight: 800,
                              minWidth: 88,
                            }}
                          />
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={650}
                          >
                            {formatDateTime(
                              payment.createdAt,
                            )}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={0.75}
                            justifyContent="flex-end"
                            alignItems="center"
                          >
                            {payment.status === "SUCCESS" && (
                              <Tooltip title="Download payment invoice">
                                <span>
                                  <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={
                                      downloadingInvoicePaymentId ===
                                      Number(
                                        payment.paymentId
                                        ?? payment.transactionId
                                        ?? payment.id,
                                      ) ? (
                                        <CircularProgress
                                          size={14}
                                          color="inherit"
                                        />
                                      ) : (
                                        <DownloadOutlined
                                          fontSize="small"
                                        />
                                      )
                                    }
                                    disabled={
                                      downloadingInvoicePaymentId ===
                                      Number(
                                        payment.paymentId
                                        ?? payment.transactionId
                                        ?? payment.id,
                                      )
                                    }
                                    onClick={() =>
                                      handleDownloadInvoice(
                                        payment,
                                      )
                                    }
                                    sx={{
                                      height: 34,
                                      borderRadius: 2,
                                      textTransform: "none",
                                      fontWeight: 800,
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {downloadingInvoicePaymentId ===
                                    Number(
                                      payment.paymentId
                                      ?? payment.transactionId
                                      ?? payment.id,
                                    )
                                      ? "Downloading..."
                                      : "Invoice"}
                                  </Button>
                                </span>
                              </Tooltip>
                            )}

                            <Tooltip title="Open payment details">
                              <IconButton
                                onClick={() =>
                                  handleView(
                                    payment.id,
                                  )
                                }
                                disabled={
                                  detailsLoading
                                }
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.055,
                                  ),
                                  color: "primary.main",
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.11,
                                    ),
                                  },
                                }}
                              >
                                <VisibilityOutlined />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  },
                )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>


      {/* =================================================== */}
      {/* DETAILS DIALOG */}
      {/* =================================================== */}

      <Dialog
        open={detailsOpen}
        onClose={() =>
          setDetailsOpen(false)
        }
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow:
              "0 30px 90px rgba(15,23,42,.22)",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            px: {
              xs: 2.5,
              md: 3.2,
            },
            py: 2.6,
            color: "#FFFFFF",
            background:
              "linear-gradient(135deg, #312E81 0%, #4F46E5 60%, #2563EB 100%)",
          }}
        >
          <IconButton
            onClick={() =>
              setDetailsOpen(false)
            }
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color:
                "rgba(255,255,255,.88)",
              "&:hover": {
                bgcolor:
                  "rgba(255,255,255,.10)",
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
            PAYMENT OPERATIONS
          </Typography>

          <Typography
            variant="h5"
            fontWeight={900}
          >
            Payment Details
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.4,
              color:
                "rgba(255,255,255,.74)",
            }}
          >
            Transaction #{selectedPayment?.id ?? "-"}
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
          {selectedPayment && (
            <Stack spacing={2.4}>
              {/* AMOUNT / STATUS */}

              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3.2,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#FFFFFF",
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
                  spacing={1.4}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      fontWeight={950}
                      color="primary.main"
                    >
                      {formatMoney(
                        selectedPayment.amount,
                        selectedPayment.currency,
                      )}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        mt: 0.35,
                      }}
                    >
                      {displayEnum(
                        selectedPayment.referenceType,
                      )}
                    </Typography>
                  </Box>

                  <Chip
                    label={displayEnum(
                      selectedPayment.status,
                    )}
                    color={getStatusColor(
                      selectedPayment.status,
                    )}
                    sx={{
                      fontWeight: 850,
                    }}
                  />
                </Stack>
              </Paper>


              {/* LIBRARY / CUSTOMER */}

              <Grid
                container
                spacing={2}
              >
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <InfoTile
                    title="Library"
                    value={
                      selectedPayment.libraryName
                      || "-"
                    }
                    helper={
                      [
                        selectedPayment.libraryCity,
                        selectedPayment.libraryState,
                      ]
                        .filter(Boolean)
                        .join(", ")
                      || "Location unavailable"
                    }
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <InfoTile
                    title="Customer"
                    value={
                      selectedPayment.customerName
                      || "-"
                    }
                    helper={
                      selectedPayment.customerEmail
                      || "-"
                    }
                  />
                </Grid>
              </Grid>


              {/* GATEWAY */}

              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#FFFFFF",
                }}
              >
                <Typography
                  fontWeight={900}
                  sx={{
                    mb: 1.6,
                  }}
                >
                  Gateway Information
                </Typography>

                <Grid
                  container
                  spacing={1.3}
                >
                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <InfoTile
                      title="Gateway"
                      value={displayEnum(
                        selectedPayment.paymentGateway,
                      )}
                      helper={displayEnum(
                        selectedPayment.paymentMethod,
                      )}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <InfoTile
                      title="Receipt"
                      value={
                        selectedPayment.receiptNumber
                        || "-"
                      }
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <InfoTile
                      title="Gateway Order ID"
                      value={
                        selectedPayment.gatewayOrderId
                        || "-"
                      }
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <InfoTile
                      title="Gateway Payment ID"
                      value={
                        selectedPayment.gatewayPaymentId
                        || "-"
                      }
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <InfoTile
                      title="Gateway Transaction ID"
                      value={
                        selectedPayment.gatewayTransactionId
                        || "-"
                      }
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <InfoTile
                      title="Created"
                      value={formatDateTime(
                        selectedPayment.createdAt,
                      )}
                    />
                  </Grid>
                </Grid>
              </Paper>


              {/* BUSINESS REFERENCE */}

              <Paper
                elevation={0}
                sx={{
                  p: 2.3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "#FFFFFF",
                }}
              >
                <Typography
                  fontWeight={900}
                  sx={{
                    mb: 1.6,
                  }}
                >
                  Business Reference
                </Typography>

                <Grid
                  container
                  spacing={1.3}
                >
                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <InfoTile
                      title="Reference Type"
                      value={displayEnum(
                        selectedPayment.referenceType,
                      )}
                    />
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      md: 6,
                    }}
                  >
                    <InfoTile
                      title="Reference ID"
                      value={
                        selectedPayment.referenceId
                        ?? "-"
                      }
                    />
                  </Grid>
                </Grid>
              </Paper>


              {/* REFUND / FAILURE / NOTES */}

              {selectedPayment.refunded && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  Refunded amount:{" "}
                  <strong>
                    {formatMoney(
                      selectedPayment.refundedAmount,
                      selectedPayment.currency,
                    )}
                  </strong>
                </Alert>
              )}

              {selectedPayment.failureReason && (
                <Alert
                  severity="error"
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  <strong>Failure reason:</strong>{" "}
                  {selectedPayment.failureReason}
                </Alert>
              )}

              {selectedPayment.notes && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  <strong>Notes:</strong>{" "}
                  {selectedPayment.notes}
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            py: 1.7,
            justifyContent: "space-between",
          }}
        >
          <Box>
            {selectedPayment?.status === "SUCCESS" && (
              <Button
                variant="contained"
                startIcon={
                  downloadingInvoicePaymentId ===
                  Number(
                    selectedPayment.paymentId
                    ?? selectedPayment.transactionId
                    ?? selectedPayment.id,
                  ) ? (
                    <CircularProgress
                      size={15}
                      color="inherit"
                    />
                  ) : (
                    <DownloadOutlined />
                  )
                }
                disabled={
                  downloadingInvoicePaymentId ===
                  Number(
                    selectedPayment.paymentId
                    ?? selectedPayment.transactionId
                    ?? selectedPayment.id,
                  )
                }
                onClick={() =>
                  handleDownloadInvoice(
                    selectedPayment,
                  )
                }
                sx={{
                  borderRadius: 2.2,
                  textTransform: "none",
                  fontWeight: 850,
                }}
              >
                {downloadingInvoicePaymentId ===
                Number(
                  selectedPayment.paymentId
                  ?? selectedPayment.transactionId
                  ?? selectedPayment.id,
                )
                  ? "Downloading Invoice..."
                  : "Download Invoice"}
              </Button>
            )}
          </Box>

          <Button
            onClick={() =>
              setDetailsOpen(false)
            }
            variant="outlined"
            sx={{
              borderRadius: 2.2,
              textTransform: "none",
              fontWeight: 750,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


export default Payments;
