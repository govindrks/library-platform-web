import {
  ApartmentOutlined,
  AutorenewOutlined,
  CheckCircleOutlineOutlined,
  GroupsOutlined,
  LocalLibraryOutlined,
  PendingActionsOutlined,
  ReceiptLongOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
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

import { useCallback, useEffect, useState } from "react";

import adminApi from "../../api/adminApi";
import usePlatformConfig from "../../api/usePlatformConfig";

// ============================================================
// HELPERS
// ============================================================

const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "PENDING_PAYMENT":
      return "warning";

    case "SUSPENDED":
      return "warning";

    case "FAILED":
      return "error";

    case "EXPIRED":
    case "CANCELLED":
      return "default";

    default:
      return "default";
  }
};

const formatStatus = (status) => {
  if (!status) {
    return "-";
  }

  return status
    .toLowerCase()
    .split("_")
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
};

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",

    month: "short",

    year: "numeric",
  });
};

const formatMoney = (amount, currency = "INR") => {
  if (amount === null || amount === undefined) {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",

    currency: currency || "INR",

    maximumFractionDigits: 0,
  }).format(amount);
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
              {value ?? 0}
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
// COMPONENT
// ============================================================

function PlatformDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const { platformName } = usePlatformConfig();

  // =========================================================
  // LOAD DASHBOARD
  // =========================================================

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await adminApi.getDashboard();

      setDashboard(response);
    } catch (requestError) {
      console.error("Admin dashboard load failed:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Unable to load platform dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <Stack
        minHeight={450}
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading platform dashboard...
        </Typography>
      </Stack>
    );
  }

  const overview = dashboard?.overview || {};

  const recentLibraries = dashboard?.recentLibraries || [];

  const recentSubscriptions = dashboard?.recentSubscriptions || [];

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box
      sx={{
        pb: 5,
      }}
    >
      {/* =================================================
                HEADER
            ================================================= */}

      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>
          Platform Dashboard
        </Typography>

        <Typography color="text.secondary" mt={0.5}>
          Monitor libraries, owners, users and platform subscriptions across
          {platformName}.
        </Typography>
      </Box>

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

      {/* =================================================
                PRIMARY STATS
            ================================================= */}

      <Grid container spacing={2}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="Libraries"
            value={overview.totalLibraries}
            subtitle={`${overview.activeLibraries || 0} active`}
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
            title="Library Owners"
            value={overview.totalLibraryOwners}
            subtitle="Registered owners"
            icon={<ApartmentOutlined />}
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
            title="Students"
            value={overview.totalStudents}
            subtitle={`${overview.totalUsers || 0} total accounts`}
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
            title="Active Subscriptions"
            value={overview.activeSubscriptions}
            subtitle={`${overview.totalSubscriptions || 0} total`}
            icon={<CheckCircleOutlineOutlined />}
          />
        </Grid>
      </Grid>

      {/* =================================================
                SUBSCRIPTION STATS
            ================================================= */}

      <Grid container spacing={2} mt={0.5}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <StatCard
            title="Expiring Soon"
            value={overview.expiringIn7Days}
            subtitle="Next 7 days"
            icon={<WarningAmberOutlined />}
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
            title="Pending Payment"
            value={overview.pendingSubscriptions}
            subtitle="Awaiting payment"
            icon={<PendingActionsOutlined />}
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
            title="Platform Plans"
            value={overview.totalPlans}
            subtitle={`${overview.activePlans || 0} active`}
            icon={<ReceiptLongOutlined />}
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
            title="Expired"
            value={overview.expiredSubscriptions}
            subtitle={`${overview.cancelledSubscriptions || 0} cancelled`}
            icon={<AutorenewOutlined />}
          />
        </Grid>
      </Grid>

      {/* =================================================
                RECENT LIBRARIES
            ================================================= */}

      <Card
        variant="outlined"
        sx={{
          mt: 3,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Recent Libraries
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Latest libraries registered on the platform.
              </Typography>
            </Box>

            <Chip
              label={`${recentLibraries.length} recent`}
              variant="outlined"
            />
          </Stack>

          <Divider
            sx={{
              my: 2,
            }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Library</TableCell>

                  <TableCell>Owner</TableCell>

                  <TableCell>Location</TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recentLibraries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No libraries found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentLibraries.map((library) => (
                    <TableRow key={library.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>{library.name}</Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {library.ownerName || "-"}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {library.ownerEmail || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        {[library.city, library.state]
                          .filter(Boolean)
                          .join(", ") || "-"}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={formatStatus(library.status)}
                          color={getStatusColor(library.status)}
                        />
                      </TableCell>

                      <TableCell>{formatDate(library.createdAt)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* =================================================
                RECENT SUBSCRIPTIONS
            ================================================= */}

      <Card
        variant="outlined"
        sx={{
          mt: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Recent Platform Subscriptions
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Latest plan subscriptions across libraries.
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Library</TableCell>

                  <TableCell>Plan</TableCell>

                  <TableCell>Price</TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell>Start</TableCell>

                  <TableCell>End</TableCell>

                  <TableCell>Renewal</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {recentSubscriptions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No subscriptions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id} hover>
                      <TableCell>
                        <Typography fontWeight={600}>
                          {subscription.libraryName || "-"}
                        </Typography>
                      </TableCell>

                      <TableCell>{subscription.planName || "-"}</TableCell>

                      <TableCell>
                        {formatMoney(
                          subscription.planPrice,
                          subscription.currency,
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={formatStatus(subscription.status)}
                          color={getStatusColor(subscription.status)}
                        />
                      </TableCell>

                      <TableCell>
                        {formatDate(subscription.startDate)}
                      </TableCell>

                      <TableCell>{formatDate(subscription.endDate)}</TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={subscription.autoRenew ? "Auto" : "Manual"}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}

export default PlatformDashboard;
