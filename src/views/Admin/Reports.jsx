import {
  AccountBalanceWalletOutlined,
  ApartmentOutlined,
  AssessmentOutlined,
  CheckCircleOutlineOutlined,
  DownloadOutlined,
  EventAvailableOutlined,
  EventSeatOutlined,
  GroupsOutlined,
  LocalLibraryOutlined,
  PaymentsOutlined,
  RefreshOutlined,
  ReplayOutlined,
  TrendingUpOutlined,
  WarningAmberOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
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
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import adminApi from "../../api/adminApi";
import usePlatformConfig from "../../api/usePlatformConfig";

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

const formatMoney = (value) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
};

const percentage = (value, total) => {
  const safeTotal = Number(total || 0);

  if (safeTotal <= 0) {
    return 0;
  }

  return Math.round((Number(value || 0) / safeTotal) * 100);
};

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ title, value, subtitle, icon, tone = "primary" }) {
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
            {title}
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

          {subtitle && (
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          )}
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
// DISTRIBUTION CARD
// ============================================================

function DistributionCard({ title, description, data, valueFormatter }) {
  const theme = useTheme();

  const entries = Object.entries(data || {});

  const total = entries.reduce((sum, [, value]) => sum + Number(value || 0), 0);

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3.5,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 2.4,
          py: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.primary.main, 0.018),
        }}
      >
        <Typography variant="h6" fontWeight={900}>
          {title}
        </Typography>

        {description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.35,
            }}
          >
            {description}
          </Typography>
        )}
      </Box>

      <Box sx={{ p: 2.4 }}>
        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No report data available.
          </Typography>
        ) : (
          <Stack spacing={1.7}>
            {entries.map(([key, value]) => {
              const numericValue = Number(value || 0);

              const share = valueFormatter
                ? 0
                : percentage(numericValue, total);

              return (
                <Box key={key}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1.5}
                  >
                    <Typography variant="body2" fontWeight={700}>
                      {displayEnum(key)}
                    </Typography>

                    <Chip
                      size="small"
                      label={
                        valueFormatter
                          ? valueFormatter(value)
                          : numericValue.toLocaleString("en-IN")
                      }
                      variant="outlined"
                      sx={{
                        fontWeight: 750,
                      }}
                    />
                  </Stack>

                  {!valueFormatter && (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{
                        mt: 0.8,
                      }}
                    >
                      <LinearProgress
                        variant="determinate"
                        value={share}
                        sx={{
                          flex: 1,
                          height: 7,
                          borderRadius: 99,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 99,
                          },
                        }}
                      />

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          width: 38,
                          textAlign: "right",
                        }}
                      >
                        {share}%
                      </Typography>
                    </Stack>
                  )}
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

// ============================================================
// LIBRARY REPORT DEFINITIONS
// ============================================================

const LIBRARY_REPORTS = [
  {
    key: "bookings",
    title: "Booking Report",
    description:
      "Analyze booking activity, booking status, seat reservations and slot performance.",
    category: "Operations",
    icon: EventAvailableOutlined,
  },
  {
    key: "revenue",
    title: "Revenue Report",
    description:
      "Review gross revenue, refunds, net revenue and transaction performance.",
    category: "Finance",
    icon: TrendingUpOutlined,
  },
  {
    key: "occupancy",
    title: "Occupancy Report",
    description:
      "Monitor seat utilization, occupied capacity and occupancy performance.",
    category: "Operations",
    icon: EventSeatOutlined,
  },
  {
    key: "payments",
    title: "Payment Report",
    description:
      "Review the complete payment ledger including successful, failed and refunded payments.",
    category: "Finance",
    icon: PaymentsOutlined,
  },
  {
    key: "refunds",
    title: "Refund Report",
    description:
      "Track refund requests, processing status, successful refunds and failed refunds.",
    category: "Finance",
    icon: ReplayOutlined,
  },
  {
    key: "membership",
    title: "Membership Report",
    description:
      "Analyze memberships, active subscriptions and membership performance for the selected library.",
    category: "Membership",
    icon: GroupsOutlined,
  },
];

// ============================================================
// COMPONENT
// ============================================================

function Reports() {
  const theme = useTheme();

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [report, setReport] = useState(null);

  const [libraries, setLibraries] = useState([]);

  const [librariesLoading, setLibrariesLoading] = useState(true);

  const [selectedLibraryId, setSelectedLibraryId] = useState(
    searchParams.get("libraryId") || "",
  );

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const { platformName } = usePlatformConfig();

  // =========================================================
  // LOAD
  // =========================================================

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.getReports();

      setReport(response);
    } catch (requestError) {
      console.error("Admin report load failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load platform reports.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLibraries = useCallback(async () => {
    try {
      setLibrariesLoading(true);

      const response = await adminApi.getLibraries({});

      const allLibraries = Array.isArray(response) ? response : [];

      /*
       * Admin library reports are intentionally scoped to
       * libraries that have a real platform subscription.
       *
       * ACTIVE is preferred because these are the tenants
       * currently subscribed to {platformName}.
       */
      const subscribedLibraries = allLibraries.filter(
        (library) =>
          Boolean(library.subscriptionId) &&
          library.subscriptionStatus === "ACTIVE",
      );

      setLibraries(subscribedLibraries);

      setSelectedLibraryId((current) => {
        if (
          current &&
          subscribedLibraries.some(
            (library) => String(library.id) === String(current),
          )
        ) {
          return current;
        }

        return subscribedLibraries[0]?.id
          ? String(subscribedLibraries[0].id)
          : "";
      });
    } catch (requestError) {
      console.error("Subscribed libraries load failed:", requestError);

      setLibraries([]);
    } finally {
      setLibrariesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReport();
    loadLibraries();
  }, [loadReport, loadLibraries]);

  useEffect(() => {
    const next = new URLSearchParams(searchParams);

    if (selectedLibraryId) {
      next.set("libraryId", selectedLibraryId);
    } else {
      next.delete("libraryId");
    }

    setSearchParams(next, {
      replace: true,
    });
  }, [selectedLibraryId, searchParams, setSearchParams]);

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,
    [libraries, selectedLibraryId],
  );

  const openLibraryReport = (reportKey) => {
    if (!selectedLibraryId) {
      return;
    }

    navigate(`/admin/reports/libraries/${selectedLibraryId}/${reportKey}`);
  };

  // =========================================================
  // DERIVED HEALTH
  // =========================================================

  const health = useMemo(() => {
    if (!report) {
      return {
        activeLibraryRate: 0,
        subscriptionHealth: 0,
        paymentSuccessRate: 0,
      };
    }

    return {
      activeLibraryRate: percentage(
        report.activeLibraries,
        report.totalLibraries,
      ),

      subscriptionHealth: percentage(
        report.activeSubscriptions,
        report.totalSubscriptions,
      ),

      paymentSuccessRate: percentage(
        report.successfulTransactions,
        report.totalTransactions,
      ),
    };
  }, [report]);

  // =========================================================
  // SUMMARY ROWS
  // =========================================================

  const summaryRows = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      [
        "Libraries",
        report.totalLibraries,
        `${report.activeLibraries || 0} active`,
      ],
      [
        "Accounts",
        report.totalAccounts,
        `${report.libraryOwners || 0} owners / ${report.students || 0} students`,
      ],
      [
        "Platform Plans",
        report.totalPlans,
        `${report.activePlans || 0} active`,
      ],
      [
        "Subscriptions",
        report.totalSubscriptions,
        `${report.activeSubscriptions || 0} active`,
      ],
      [
        "Payment Transactions",
        report.totalTransactions,
        `${report.successfulTransactions || 0} successful`,
      ],
    ];
  }, [report]);

  // =========================================================
  // CSV EXPORT
  // =========================================================

  const exportCsv = () => {
    if (!report) {
      return;
    }

    const rows = [
      ["{platformName} Platform Report", ""],
      ["Metric", "Value"],
      ["Total Libraries", report.totalLibraries],
      ["Active Libraries", report.activeLibraries],
      ["Total Accounts", report.totalAccounts],
      ["Library Owners", report.libraryOwners],
      ["Students", report.students],
      ["Administrators", report.admins],
      ["Total Plans", report.totalPlans],
      ["Active Plans", report.activePlans],
      ["Total Subscriptions", report.totalSubscriptions],
      ["Active Subscriptions", report.activeSubscriptions],
      ["Total Transactions", report.totalTransactions],
      ["Successful Transactions", report.successfulTransactions],
      ["Failed Transactions", report.failedTransactions],
      ["Pending Transactions", report.pendingTransactions],
      ["Refunded Transactions", report.refundedTransactions],
      ["Gross Successful Amount", report.grossSuccessfulAmount],
      ["Platform Subscription Revenue", report.platformSubscriptionRevenue],
      ["Refunded Amount", report.refundedAmount],
      ["Average Successful Transaction", report.averageSuccessfulTransaction],
      [],
      ["Subscription Status", "Count"],
      ...Object.entries(report.subscriptionStatusDistribution || {}),
      [],
      ["Plan", "Subscriptions"],
      ...Object.entries(report.planAdoptionDistribution || {}),
      [],
      ["Payment Type", "Transaction Count"],
      ...Object.entries(report.paymentTypeDistribution || {}),
      [],
      ["Payment Type", "Successful Revenue"],
      ...Object.entries(report.successfulRevenueByPaymentType || {}),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `{platformName}-platform-report-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Box sx={{ pb: 5 }}>
        <Skeleton
          variant="rounded"
          height={170}
          sx={{
            borderRadius: 4,
            mb: 3,
          }}
        />

        <Grid
          container
          spacing={2}
          sx={{
            mb: 3,
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <Grid
              key={item}
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <Skeleton
                variant="rounded"
                height={145}
                sx={{
                  borderRadius: 3.5,
                }}
              />
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2}>
          {[1, 2, 3].map((item) => (
            <Grid
              key={item}
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <Skeleton
                variant="rounded"
                height={270}
                sx={{
                  borderRadius: 3.5,
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

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
            md: 3.3,
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
            width: 230,
            height: 230,
            borderRadius: "50%",
            right: -80,
            top: -115,
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
          spacing={2.5}
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                minWidth: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 10px 26px rgba(79,70,229,.22)",
              }}
            >
              <AssessmentOutlined />
            </Box>

            <Box>
              <Chip
                label="PLATFORM ANALYTICS"
                size="small"
                icon={<WorkspacePremiumOutlined />}
                sx={{
                  mb: 1,
                  fontWeight: 850,
                  letterSpacing: 0.6,
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
                  letterSpacing: "-0.035em",
                }}
              >
                Reports
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.45,
                  lineHeight: 1.65,
                }}
              >
                Platform-wide library, subscription, user and payment insights
                from live backend data.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<RefreshOutlined />}
              onClick={loadReport}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 750,
                bgcolor: "#FFFFFF",
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<DownloadOutlined />}
              onClick={exportCsv}
              disabled={!report}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "0 10px 22px rgba(79,70,229,.18)",
              }}
            >
              Export CSV
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {report && (
        <>
          {/* ================================================= */}
          {/* KPI */}
          {/* ================================================= */}

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
                title="Libraries"
                value={report.totalLibraries || 0}
                subtitle={`${report.activeLibraries || 0} active`}
                icon={<LocalLibraryOutlined />}
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
                title="Accounts"
                value={report.totalAccounts || 0}
                subtitle={`${report.libraryOwners || 0} library owners`}
                icon={<GroupsOutlined />}
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
                title="Platform Revenue"
                value={formatMoney(report.platformSubscriptionRevenue)}
                subtitle="Plans + renewals"
                icon={<TrendingUpOutlined />}
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
                title="Gross Successful"
                value={formatMoney(report.grossSuccessfulAmount)}
                subtitle={`${report.successfulTransactions || 0} successful payments`}
                icon={<AccountBalanceWalletOutlined />}
              />
            </Grid>
          </Grid>

          {/* ================================================= */}
          {/* HEALTH STRIP */}
          {/* ================================================= */}

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
            <Grid container spacing={1}>
              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.8,
                    borderRadius: 2.6,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Active Libraries
                      </Typography>

                      <Typography
                        variant="h6"
                        fontWeight={900}
                        sx={{
                          mt: 0.2,
                        }}
                      >
                        {health.activeLibraryRate}%
                      </Typography>
                    </Box>

                    <CheckCircleOutlineOutlined color="success" />
                  </Stack>
                </Paper>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.8,
                    borderRadius: 2.6,
                    border: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Subscription Health
                      </Typography>

                      <Typography
                        variant="h6"
                        fontWeight={900}
                        sx={{
                          mt: 0.2,
                        }}
                      >
                        {health.subscriptionHealth}%
                      </Typography>
                    </Box>

                    <ApartmentOutlined color="primary" />
                  </Stack>
                </Paper>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 4,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    p: 1.8,
                    borderRadius: 2.6,
                    border: "1px solid",
                    borderColor:
                      health.paymentSuccessRate < 70
                        ? alpha(theme.palette.warning.main, 0.22)
                        : "divider",
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                      >
                        Payment Success Rate
                      </Typography>

                      <Typography
                        variant="h6"
                        fontWeight={900}
                        sx={{
                          mt: 0.2,
                        }}
                      >
                        {health.paymentSuccessRate}%
                      </Typography>
                    </Box>

                    {health.paymentSuccessRate >= 70 ? (
                      <CheckCircleOutlineOutlined color="success" />
                    ) : (
                      <WarningAmberOutlined color="warning" />
                    )}
                  </Stack>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* ================================================= */}
          {/* DISTRIBUTIONS */}
          {/* ================================================= */}

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
                md: 6,
                lg: 4,
              }}
            >
              <DistributionCard
                title="Library Status"
                description="Current platform library distribution."
                data={report.libraryStatusDistribution}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <DistributionCard
                title="User Roles"
                description="Accounts grouped by platform role."
                data={report.userRoleDistribution}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
                lg: 4,
              }}
            >
              <DistributionCard
                title="Subscription Status"
                description="Platform subscriptions by lifecycle status."
                data={report.subscriptionStatusDistribution}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <DistributionCard
                title="Plan Adoption"
                description="Number of subscriptions created for each platform plan."
                data={report.planAdoptionDistribution}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <DistributionCard
                title="Payment Status"
                description="Payment transactions grouped by state."
                data={report.paymentStatusDistribution}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <DistributionCard
                title="Payment Types"
                description="Transaction volume by business reference."
                data={report.paymentTypeDistribution}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <DistributionCard
                title="Successful Revenue by Type"
                description="Successful transaction value by payment reference."
                data={report.successfulRevenueByPaymentType}
                valueFormatter={formatMoney}
              />
            </Grid>
          </Grid>

          {/* ================================================= */}
          {/* LIBRARY-SPECIFIC REPORTS */}
          {/* ================================================= */}

          <Paper
            elevation={0}
            sx={{
              mb: 3,
              overflow: "hidden",
              borderRadius: 4,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.12),
              bgcolor: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                position: "relative",
                overflow: "hidden",
                px: {
                  xs: 2.4,
                  md: 3,
                },
                py: 2.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                background:
                  "linear-gradient(135deg, rgba(79,70,229,.06), rgba(37,99,235,.025))",
              }}
            >
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
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2.2,
                        display: "grid",
                        placeItems: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                      }}
                    >
                      <LocalLibraryOutlined />
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight={900}>
                        Library Reports
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mt: 0.25,
                        }}
                      >
                        Select a subscribed library and open the same
                        operational reports available to its owner.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <FormControl
                  size="small"
                  sx={{
                    minWidth: {
                      xs: "100%",
                      md: 320,
                    },
                    bgcolor: "#FFFFFF",
                  }}
                >
                  <InputLabel>Subscribed Library</InputLabel>

                  <Select
                    label="Subscribed Library"
                    value={selectedLibraryId}
                    disabled={librariesLoading}
                    onChange={(event) =>
                      setSelectedLibraryId(event.target.value)
                    }
                    sx={{
                      borderRadius: 2.4,
                    }}
                  >
                    {libraries.map((library) => (
                      <MenuItem key={library.id} value={String(library.id)}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={2}
                          sx={{
                            width: "100%",
                          }}
                        >
                          <Box>
                            <Typography variant="body2" fontWeight={750}>
                              {library.name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {[library.city, library.state]
                                .filter(Boolean)
                                .join(", ") || `Library #${library.id}`}
                            </Typography>
                          </Box>

                          <Chip
                            size="small"
                            label={library.planName || "Subscribed"}
                            color="success"
                            variant="outlined"
                            sx={{
                              fontWeight: 700,
                            }}
                          />
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              {selectedLibrary && (
                <Stack
                  direction="row"
                  spacing={0.8}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{
                    mt: 2,
                  }}
                >
                  <Chip
                    size="small"
                    color="success"
                    label={selectedLibrary.subscriptionStatus || "ACTIVE"}
                    sx={{
                      fontWeight: 750,
                    }}
                  />

                  <Chip
                    size="small"
                    variant="outlined"
                    label={selectedLibrary.planName || "Platform Plan"}
                  />

                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${selectedLibrary.totalSeats ?? 0} seats`}
                  />

                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      selectedLibrary.ownerName
                        ? `Owner: ${selectedLibrary.ownerName}`
                        : "Owner available"
                    }
                  />
                </Stack>
              )}
            </Box>

            <Box
              sx={{
                p: {
                  xs: 2.4,
                  md: 3,
                },
              }}
            >
              {librariesLoading ? (
                <Grid container spacing={2}>
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <Grid
                      key={item}
                      size={{
                        xs: 12,
                        md: 6,
                        lg: 4,
                      }}
                    >
                      <Skeleton
                        variant="rounded"
                        height={220}
                        sx={{
                          borderRadius: 3.2,
                        }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : libraries.length === 0 ? (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 2.5,
                  }}
                >
                  No active subscribed libraries are currently available for
                  tenant-level reporting.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  {LIBRARY_REPORTS.map((libraryReport) => {
                    const Icon = libraryReport.icon;

                    return (
                      <Grid
                        key={libraryReport.key}
                        size={{
                          xs: 12,
                          md: 6,
                          lg: 4,
                        }}
                      >
                        <Paper
                          elevation={0}
                          onClick={() => openLibraryReport(libraryReport.key)}
                          sx={{
                            height: "100%",
                            p: 2.4,
                            cursor: selectedLibraryId ? "pointer" : "default",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3.3,
                            bgcolor: "#FFFFFF",
                            transition:
                              "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
                            "&:hover": selectedLibraryId
                              ? {
                                  transform: "translateY(-4px)",
                                  borderColor: alpha(
                                    theme.palette.primary.main,
                                    0.28,
                                  ),
                                  boxShadow: "0 18px 36px rgba(15,23,42,.07)",
                                }
                              : {},
                          }}
                        >
                          <Stack spacing={1.6} height="100%">
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              spacing={1}
                            >
                              <Box
                                sx={{
                                  width: 46,
                                  height: 46,
                                  borderRadius: 2.4,
                                  display: "grid",
                                  placeItems: "center",
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.08,
                                  ),
                                  color: "primary.main",
                                }}
                              >
                                <Icon />
                              </Box>

                              <Chip
                                size="small"
                                label={libraryReport.category}
                                variant="outlined"
                                sx={{
                                  fontWeight: 700,
                                }}
                              />
                            </Stack>

                            <Box>
                              <Typography variant="h6" fontWeight={900}>
                                {libraryReport.title}
                              </Typography>

                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                  mt: 0.7,
                                  lineHeight: 1.7,
                                }}
                              >
                                {libraryReport.description}
                              </Typography>
                            </Box>

                            <Box
                              sx={{
                                mt: "auto",
                                pt: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                color={
                                  selectedLibraryId
                                    ? "primary.main"
                                    : "text.disabled"
                                }
                                fontWeight={800}
                              >
                                {selectedLibrary
                                  ? `View ${selectedLibrary.name} →`
                                  : "Select a library first"}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Paper>

          {/* ================================================= */}
          {/* PLATFORM SUMMARY */}
          {/* ================================================= */}

          <Paper
            elevation={0}
            sx={{
              borderRadius: 3.5,
              border: "1px solid",
              borderColor: "divider",
              overflow: "hidden",
              bgcolor: "#FFFFFF",
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: "1px solid",
                borderColor: "divider",
                bgcolor: alpha(theme.palette.primary.main, 0.018),
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AssessmentOutlined color="primary" />

                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Platform Summary
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.2,
                    }}
                  >
                    Consolidated operational totals from the live report
                    response.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                    }}
                  >
                    <TableCell>Category</TableCell>

                    <TableCell>Total</TableCell>

                    <TableCell>Details</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {summaryRows.map((row) => (
                    <TableRow hover key={row[0]}>
                      <TableCell>
                        <Typography fontWeight={800}>{row[0]}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontWeight={850} color="primary.main">
                          {row[1]}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {row[2]}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </Box>
  );
}

export default Reports;
