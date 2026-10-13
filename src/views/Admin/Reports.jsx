import {
  AccountBalanceWalletOutlined,
  ApartmentOutlined,
  AssessmentOutlined,
  DownloadOutlined,
  GroupsOutlined,
  LocalLibraryOutlined,
  PaymentsOutlined,
  RefreshOutlined,
  TrendingUpOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import adminApi from "../../api/adminApi";

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

// ============================================================
// STAT CARD
// ============================================================

function StatCard({ title, value, subtitle, icon }) {
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
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography variant="h4" fontWeight={800} mt={0.5}>
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
              width: 46,

              height: 46,

              borderRadius: 2,

              bgcolor: "action.hover",

              display: "flex",

              alignItems: "center",

              justifyContent: "center",

              color: "primary.main",
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
// DISTRIBUTION TABLE
// ============================================================

function DistributionTable({ title, description, data, valueFormatter }) {
  const entries = Object.entries(data || {});

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>

        {description && (
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {description}
          </Typography>
        )}

        <Divider
          sx={{
            my: 2,
          }}
        />

        {entries.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No report data available.
          </Typography>
        ) : (
          <Stack spacing={1.25}>
            {entries.map(([key, value]) => (
              <Stack
                key={key}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2">{displayEnum(key)}</Typography>

                <Chip
                  size="small"
                  label={valueFormatter ? valueFormatter(value) : value}
                  variant="outlined"
                />
              </Stack>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Reports() {
  const [report, setReport] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

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

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  // =========================================================
  // REPORT ROWS
  // =========================================================

  const summaryRows = useMemo(() => {
    if (!report) {
      return [];
    }

    return [
      ["Libraries", report.totalLibraries, report.activeLibraries],

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
      ["LibraryHub Platform Report", ""],

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

    link.download = `libraryhub-platform-report-${new Date()
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
      <Stack
        minHeight={450}
        alignItems="center"
        justifyContent="center"
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Preparing platform reports...
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
      {/* HEADER */}

      <Stack
        direction={{
          xs: "column",

          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          md: "center",
        }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Reports
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Platform-wide library, subscription, user and payment insights.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshOutlined />}
            onClick={loadReport}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<DownloadOutlined />}
            onClick={exportCsv}
            disabled={!report}
          >
            Export CSV
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {report && (
        <>
          {/* KPI */}

          <Grid container spacing={2} mb={3}>
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

          {/* DISTRIBUTIONS */}

          <Grid container spacing={2} mb={3}>
            <Grid
              size={{
                xs: 12,

                md: 6,

                lg: 4,
              }}
            >
              <DistributionTable
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
              <DistributionTable
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
              <DistributionTable
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
              <DistributionTable
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
              <DistributionTable
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
              <DistributionTable
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
              <DistributionTable
                title="Successful Revenue by Type"
                description="Successful transaction value by payment reference."
                data={report.successfulRevenueByPaymentType}
                valueFormatter={formatMoney}
              />
            </Grid>
          </Grid>

          {/* PLATFORM SUMMARY */}

          <Card variant="outlined">
            <CardContent>
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <AssessmentOutlined color="primary" />

                <Typography variant="h6" fontWeight={700}>
                  Platform Summary
                </Typography>
              </Stack>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Category</TableCell>

                      <TableCell>Total</TableCell>

                      <TableCell>Details</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {summaryRows.map((row) => (
                      <TableRow key={row[0]}>
                        <TableCell>
                          <Typography fontWeight={600}>{row[0]}</Typography>
                        </TableCell>

                        <TableCell>{row[1]}</TableCell>

                        <TableCell>{row[2]}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}

export default Reports;
