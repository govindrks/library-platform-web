import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import {
  ArrowForward,
  AssignmentIndOutlined,
  CheckCircleOutlineOutlined,
  ForumOutlined,
  PendingActionsOutlined,
  Refresh,
  SupportAgent,
  TaskAltOutlined,
  WarningAmberOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import supportTicketApi from "../../../api/supportTicketApi";

// ============================================================
// STATUS META
// ============================================================

const STATUS_META = {
  OPEN: {
    label: "Open",
    color: "info",
  },

  IN_PROGRESS: {
    label: "In Progress",
    color: "primary",
  },

  WAITING_FOR_USER: {
    label: "Waiting for User",
    color: "warning",
  },

  WAITING_FOR_SUPPORT: {
    label: "Waiting for Support",
    color: "secondary",
  },

  RESOLVED: {
    label: "Resolved",
    color: "success",
  },

  CLOSED: {
    label: "Closed",
    color: "default",
  },
};

// ============================================================
// HELPERS
// ============================================================

function formatEnumLabel(value) {
  if (!value) {
    return "—";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getTicketAgeHours(ticket) {
  const value = ticket?.updatedAt || ticket?.lastMessageAt || ticket?.createdAt;

  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();

  if (!Number.isFinite(time)) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - time) / (1000 * 60 * 60)));
}

// ============================================================
// KPI CARD
// ============================================================

function KpiCard({
  title,
  value,
  description,
  icon,
  tone = "primary",
  onClick,
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
            : tone === "secondary"
              ? theme.palette.secondary
              : theme.palette.primary;

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        p: 2.35,
        cursor: onClick ? "pointer" : "default",
        border: "1px solid",
        borderColor: alpha(palette.main, 0.12),
        borderRadius: 3.5,
        background: `linear-gradient(
          145deg,
          ${theme.palette.background.paper} 0%,
          ${alpha(palette.main, 0.035)} 100%
        )`,
        transition:
          "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              borderColor: alpha(palette.main, 0.25),
              boxShadow: "0 16px 34px rgba(15,23,42,.07)",
            }
          : {},
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: 88,
          height: 88,
          borderRadius: "50%",
          right: -30,
          top: -34,
          bgcolor: alpha(palette.main, 0.065),
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

          <Typography variant="caption" color="text.secondary">
            {description}
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
// RECENT TICKET CARD
// ============================================================

function RecentTicketCard({ ticket, onClick }) {
  const theme = useTheme();

  const status = STATUS_META[ticket?.status] || STATUS_META.OPEN;

  const ageHours = getTicketAgeHours(ticket);

  const needsAttention =
    !["RESOLVED", "CLOSED"].includes(ticket?.status) &&
    (!ticket?.assignedToUserId || ticket?.status === "WAITING_FOR_SUPPORT");

  return (
    <Paper
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        p: 2.3,
        cursor: "pointer",
        border: "1px solid",
        borderColor: needsAttention
          ? alpha(theme.palette.warning.main, 0.22)
          : "divider",
        borderRadius: 3.3,
        bgcolor: needsAttention
          ? alpha(theme.palette.warning.main, 0.018)
          : "#FFFFFF",
        transition:
          "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "primary.light",
          boxShadow: "0 14px 30px rgba(15,23,42,.07)",
        },
      }}
    >
      <Stack spacing={1.6}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box
            sx={{
              minWidth: 0,
            }}
          >
            <Stack
              direction="row"
              spacing={0.7}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={750}
              >
                {ticket.ticketNumber || `Ticket #${ticket.id}`}
              </Typography>

              {needsAttention && (
                <Chip
                  size="small"
                  icon={<WarningAmberOutlined />}
                  label="Needs Attention"
                  color="warning"
                  variant="outlined"
                  sx={{
                    height: 21,
                    fontSize: 9.5,
                    fontWeight: 800,
                  }}
                />
              )}
            </Stack>

            <Typography
              fontWeight={850}
              sx={{
                mt: 0.55,
                lineHeight: 1.4,
              }}
            >
              {ticket.subject}
            </Typography>
          </Box>

          <Chip
            size="small"
            label={status.label}
            color={status.color}
            variant={ticket?.status === "RESOLVED" ? "filled" : "outlined"}
            sx={{
              flexShrink: 0,
              fontWeight: 750,
            }}
          />
        </Stack>

        <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap">
          <Chip
            size="small"
            variant="outlined"
            label={formatEnumLabel(ticket.category)}
          />

          <Chip
            size="small"
            variant="outlined"
            label={ticket.scope === "LIBRARY" ? "Library" : "Platform"}
          />

          {ticket.requesterRole && (
            <Chip
              size="small"
              variant="outlined"
              label={formatEnumLabel(ticket.requesterRole)}
            />
          )}

          {!ticket.assignedToUserId &&
            !["RESOLVED", "CLOSED"].includes(ticket.status) && (
              <Chip
                size="small"
                color="error"
                variant="outlined"
                label="Unassigned"
                sx={{
                  fontWeight: 750,
                }}
              />
            )}
        </Stack>

        <Divider />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Updated{" "}
              {formatDateTime(
                ticket.updatedAt || ticket.lastMessageAt || ticket.createdAt,
              )}
            </Typography>

            {ageHours !== null && (
              <Typography
                variant="caption"
                color={ageHours >= 24 ? "warning.main" : "text.disabled"}
                sx={{
                  display: "block",
                  mt: 0.15,
                  fontWeight: ageHours >= 24 ? 700 : 500,
                }}
              >
                {ageHours < 1
                  ? "Updated within the last hour"
                  : `${ageHours}h since last activity`}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.06),
              color: "primary.main",
            }}
          >
            <ArrowForward fontSize="small" />
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
}

// ============================================================
// SUPPORT DASHBOARD
// ============================================================

function SupportDashboard() {
  const theme = useTheme();

  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD TICKETS
  // =========================================================

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await supportTicketApi.getAdminTickets();

      setTickets(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Failed to load admin support tickets:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to load support dashboard.";

      setError(message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // =========================================================
  // SUMMARY
  // =========================================================

  const summary = useMemo(() => {
    const total = tickets.length;

    const open = tickets.filter((ticket) => ticket.status === "OPEN").length;

    const inProgress = tickets.filter(
      (ticket) => ticket.status === "IN_PROGRESS",
    ).length;

    const waitingForSupport = tickets.filter(
      (ticket) => ticket.status === "WAITING_FOR_SUPPORT",
    ).length;

    const resolved = tickets.filter(
      (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED",
    ).length;

    const unassigned = tickets.filter(
      (ticket) =>
        !ticket.assignedToUserId &&
        !["RESOLVED", "CLOSED"].includes(ticket.status),
    ).length;

    const needsAttention = tickets.filter(
      (ticket) =>
        !["RESOLVED", "CLOSED"].includes(ticket.status) &&
        (!ticket.assignedToUserId || ticket.status === "WAITING_FOR_SUPPORT"),
    ).length;

    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    return {
      total,
      open,
      inProgress,
      waitingForSupport,
      resolved,
      unassigned,
      needsAttention,
      resolutionRate,
    };
  }, [tickets]);

  // =========================================================
  // RECENT TICKETS
  // =========================================================

  const recentTickets = useMemo(
    () =>
      [...tickets]
        .sort(
          (a, b) =>
            new Date(b.updatedAt || b.lastMessageAt || b.createdAt || 0) -
            new Date(a.updatedAt || a.lastMessageAt || a.createdAt || 0),
        )
        .slice(0, 6),
    [tickets],
  );

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box
      sx={{
        width: "100%",
        pb: 5,
      }}
    >
      {/* =================================================== */}
      {/* PREMIUM HERO */}
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
                boxShadow: "0 10px 26px rgba(79,70,229,0.24)",
              }}
            >
              <SupportAgent />
            </Box>

            <Box>
              <Chip
                label="SUPPORT OPERATIONS"
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
                Support Dashboard
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mt: 0.45,
                  lineHeight: 1.65,
                }}
              >
                Monitor and manage live LibraryHub support requests from one
                platform workspace.
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            spacing={1}
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
          >
            <Chip
              label={`${summary.resolutionRate}% resolution`}
              color={
                summary.resolutionRate >= 80
                  ? "success"
                  : summary.resolutionRate >= 50
                    ? "warning"
                    : "error"
              }
              variant="outlined"
              sx={{
                bgcolor: "#FFFFFF",
                fontWeight: 800,
              }}
            />

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              disabled={loading}
              onClick={loadTickets}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 750,
                bgcolor: "background.paper",
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              endIcon={<ArrowForward />}
              onClick={() => navigate("/admin/support/tickets")}
              sx={{
                minHeight: 42,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 800,
                boxShadow: "0 10px 22px rgba(79,70,229,.18)",
              }}
            >
              Manage Tickets
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* =================================================== */}
      {/* ERROR */}
      {/* =================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* =================================================== */}
      {/* KPI */}
      {/* =================================================== */}

      {loading ? (
        <Grid
          container
          spacing={2}
          sx={{
            mb: 3,
          }}
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid
              key={item}
              size={{
                xs: 12,
                sm: 6,
                lg: 4,
                xl: 2,
              }}
            >
              <Skeleton
                variant="rounded"
                height={150}
                sx={{
                  borderRadius: 3.5,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
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
              sm: 6,
              lg: 4,
              xl: 2,
            }}
          >
            <KpiCard
              title="Total Tickets"
              value={summary.total}
              description="All support requests"
              icon={<ForumOutlined />}
              onClick={() => navigate("/admin/support/tickets")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
              xl: 2,
            }}
          >
            <KpiCard
              title="Open"
              value={summary.open}
              description="New requests"
              icon={<PendingActionsOutlined />}
              tone="info"
              onClick={() => navigate("/admin/support/tickets?status=OPEN")}
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
              xl: 2,
            }}
          >
            <KpiCard
              title="In Progress"
              value={summary.inProgress}
              description="Being handled"
              icon={<AssignmentIndOutlined />}
              onClick={() =>
                navigate("/admin/support/tickets?status=IN_PROGRESS")
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
              xl: 2,
            }}
          >
            <KpiCard
              title="Waiting"
              value={summary.waitingForSupport}
              description="Needs support response"
              icon={<SupportAgent />}
              tone="warning"
              onClick={() =>
                navigate("/admin/support/tickets?status=WAITING_FOR_SUPPORT")
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
              xl: 2,
            }}
          >
            <KpiCard
              title="Unassigned"
              value={summary.unassigned}
              description="Needs ownership"
              icon={<WarningAmberOutlined />}
              tone="error"
              onClick={() =>
                navigate("/admin/support/tickets?assignment=UNASSIGNED")
              }
            />
          </Grid>

          <Grid
            size={{
              xs: 12,
              sm: 6,
              lg: 4,
              xl: 2,
            }}
          >
            <KpiCard
              title="Resolved"
              value={summary.resolved}
              description="Resolved or closed"
              icon={<TaskAltOutlined />}
              tone="success"
              onClick={() => navigate("/admin/support/tickets?status=RESOLVED")}
            />
          </Grid>
        </Grid>
      )}

      {/* =================================================== */}
      {/* ATTENTION STRIP */}
      {/* =================================================== */}

      {!loading && (
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 3.2,
            border: "1px solid",
            borderColor:
              summary.needsAttention > 0
                ? alpha(theme.palette.warning.main, 0.2)
                : "divider",
            bgcolor:
              summary.needsAttention > 0
                ? alpha(theme.palette.warning.main, 0.025)
                : "#FFFFFF",
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
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2.2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor:
                    summary.needsAttention > 0
                      ? alpha(theme.palette.warning.main, 0.1)
                      : alpha(theme.palette.success.main, 0.08),
                  color:
                    summary.needsAttention > 0
                      ? "warning.main"
                      : "success.main",
                }}
              >
                {summary.needsAttention > 0 ? (
                  <WarningAmberOutlined />
                ) : (
                  <CheckCircleOutlineOutlined />
                )}
              </Box>

              <Box>
                <Typography fontWeight={850}>
                  {summary.needsAttention > 0
                    ? `${summary.needsAttention} ticket${
                        summary.needsAttention === 1 ? "" : "s"
                      } need attention`
                    : "Support queue is clear"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Unassigned requests and tickets waiting for support are
                  included here.
                </Typography>
              </Box>
            </Stack>

            {summary.needsAttention > 0 && (
              <Button
                size="small"
                endIcon={<ArrowForward />}
                onClick={() =>
                  navigate("/admin/support/tickets?assignment=UNASSIGNED")
                }
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                }}
              >
                Review Queue
              </Button>
            )}
          </Stack>
        </Paper>
      )}

      {/* =================================================== */}
      {/* RECENT TICKETS */}
      {/* =================================================== */}

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "#FFFFFF",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2.4,
              md: 3,
            },
            py: 2.2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.018),
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
            spacing={1.5}
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Recent Support Tickets
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                }}
              >
                Latest activity across LibraryHub support.
              </Typography>
            </Box>

            <Button
              endIcon={<ArrowForward />}
              onClick={() => navigate("/admin/support/tickets")}
              sx={{
                textTransform: "none",
                fontWeight: 750,
              }}
            >
              View All Tickets
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            p: {
              xs: 2.2,
              md: 2.7,
            },
          }}
        >
          {loading ? (
            <Grid container spacing={2}>
              {[1, 2, 3].map((item) => (
                <Grid
                  key={item}
                  size={{
                    xs: 12,
                    md: 6,
                    xl: 4,
                  }}
                >
                  <Skeleton
                    variant="rounded"
                    height={210}
                    sx={{
                      borderRadius: 3.2,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : recentTickets.length === 0 ? (
            <Box
              sx={{
                py: 7,
                textAlign: "center",
                bgcolor: "rgba(248,250,252,0.75)",
                borderRadius: 3,
              }}
            >
              <CheckCircleOutlineOutlined
                sx={{
                  fontSize: 54,
                  color: "success.light",
                }}
              />

              <Typography
                variant="h6"
                fontWeight={850}
                sx={{
                  mt: 1,
                }}
              >
                No support tickets
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                New platform support requests will appear here.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {recentTickets.map((ticket) => (
                <Grid
                  key={ticket.id}
                  size={{
                    xs: 12,
                    md: 6,
                    xl: 4,
                  }}
                >
                  <RecentTicketCard
                    ticket={ticket}
                    onClick={() =>
                      navigate(`/admin/support/tickets/${ticket.id}`)
                    }
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

export default SupportDashboard;
