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
  Skeleton,
  Stack,
  Typography,
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

// ============================================================
// KPI CARD
// ============================================================

function KpiCard({ title, value, description, icon, onClick }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        cursor: onClick ? "pointer" : "default",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "all 0.2s ease",

        "&:hover": onClick
          ? {
              transform: "translateY(-3px)",
              borderColor: "primary.light",
              boxShadow: "0 10px 26px rgba(15,23,42,0.07)",
            }
          : {},
      }}
    >
      <CardContent
        sx={{
          p: 2.5,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mt: 0.5,
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
              width: 46,
              height: 46,
              minWidth: 46,
              borderRadius: 2.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "rgba(79,70,229,0.08)",
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
// RECENT TICKET CARD
// ============================================================

function RecentTicketCard({ ticket, onClick }) {
  const status = STATUS_META[ticket?.status] || STATUS_META.OPEN;

  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        height: "100%",
        cursor: "pointer",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "primary.light",
          boxShadow: "0 10px 24px rgba(15,23,42,0.07)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.4,

          "&:last-child": {
            pb: 2.4,
          },
        }}
      >
        <Stack spacing={1.7}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="flex-start"
            spacing={2}
          >
            <Box
              sx={{
                minWidth: 0,
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight={700}
              >
                {ticket.ticketNumber || `Ticket #${ticket.id}`}
              </Typography>

              <Typography
                fontWeight={800}
                sx={{
                  mt: 0.4,
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
              sx={{
                flexShrink: 0,
                fontWeight: 700,
              }}
            />
          </Stack>

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
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
          </Stack>

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="caption" color="text.secondary">
              Updated{" "}
              {formatDateTime(
                ticket.updatedAt || ticket.lastMessageAt || ticket.createdAt,
              )}
            </Typography>

            <ArrowForward
              fontSize="small"
              sx={{
                color: "primary.main",
              }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SUPPORT DASHBOARD
// ============================================================

function SupportDashboard() {
  const navigate = useNavigate();

  // ==========================================================
  // STATE
  // ==========================================================

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD TICKETS
  // ==========================================================

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

  // ==========================================================
  // SUMMARY
  // ==========================================================

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

    return {
      total,
      open,
      inProgress,
      waitingForSupport,
      resolved,
      unassigned,
    };
  }, [tickets]);

  // ==========================================================
  // RECENT TICKETS
  // ==========================================================

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort(
        (a, b) =>
          new Date(b.updatedAt || b.lastMessageAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.lastMessageAt || a.createdAt || 0),
      )
      .slice(0, 6);
  }, [tickets]);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",
        pb: 5,
      }}
    >
      {/* ===================================================== */}
      {/* HERO */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "rgba(79,70,229,0.13)",
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.11), rgba(255,255,255,1) 56%, rgba(99,102,241,0.05))",
          position: "relative",

          "&::after": {
            content: '""',
            position: "absolute",
            width: 230,
            height: 230,
            right: -85,
            top: -110,
            borderRadius: "50%",
            bgcolor: "rgba(79,70,229,0.06)",
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",
            zIndex: 1,

            p: {
              xs: 2.5,
              md: 3.5,
            },

            "&:last-child": {
              pb: {
                xs: 2.5,
                md: 3.5,
              },
            },
          }}
        >
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
            spacing={2.5}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  minWidth: 58,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 10px 26px rgba(79,70,229,0.24)",
                }}
              >
                <SupportAgent />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    letterSpacing: "-0.02em",
                  }}
                >
                  Support Dashboard
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Monitor and manage LibraryHub support requests.
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={
                  loading ? <CircularProgress size={16} /> : <Refresh />
                }
                disabled={loading}
                onClick={loadTickets}
                sx={{
                  minHeight: 42,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontWeight: 700,
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
                  fontWeight: 700,
                }}
              >
                Manage Tickets
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

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

      {/* ===================================================== */}
      {/* KPIS */}
      {/* ===================================================== */}

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
                  borderRadius: 3,
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
              icon={<AssignmentIndOutlined />}
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
              onClick={() => navigate("/admin/support/tickets?status=RESOLVED")}
            />
          </Grid>
        </Grid>
      )}

      {/* ===================================================== */}
      {/* RECENT TICKETS */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.4,
              md: 3,
            },

            "&:last-child": {
              pb: {
                xs: 2.4,
                md: 3,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              sm: "center",
            }}
            spacing={2}
            sx={{
              mb: 2.5,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Recent Support Tickets
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.4,
                }}
              >
                Latest activity across LibraryHub support.
              </Typography>
            </Box>

            <Button
              endIcon={<ArrowForward />}
              onClick={() => navigate("/admin/support/tickets")}
              sx={{
                alignSelf: {
                  xs: "flex-start",
                  sm: "center",
                },
                textTransform: "none",
                fontWeight: 700,
              }}
            >
              View All Tickets
            </Button>
          </Stack>

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
                    height={190}
                    sx={{
                      borderRadius: 3,
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          ) : recentTickets.length === 0 ? (
            <Box
              sx={{
                py: 6,
                textAlign: "center",
                bgcolor: "rgba(248,250,252,0.75)",
                borderRadius: 3,
              }}
            >
              <CheckCircleOutlineOutlined
                sx={{
                  fontSize: 52,
                  color: "text.disabled",
                }}
              />

              <Typography
                variant="h6"
                fontWeight={800}
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
        </CardContent>
      </Card>
    </Box>
  );
}

export default SupportDashboard;
