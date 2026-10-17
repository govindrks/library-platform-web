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
  InputAdornment,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  ArrowForward,
  FilterAltOff,
  Refresh,
  Search,
  SupportAgent,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate, useSearchParams } from "react-router-dom";

import supportTicketApi from "../../../api/supportTicketApi";

// ============================================================
// FILTER OPTIONS
// ============================================================

const STATUS_OPTIONS = [
  {
    value: "ALL",
    label: "All Statuses",
  },
  {
    value: "OPEN",
    label: "Open",
  },
  {
    value: "IN_PROGRESS",
    label: "In Progress",
  },
  {
    value: "WAITING_FOR_USER",
    label: "Waiting for User",
  },
  {
    value: "WAITING_FOR_SUPPORT",
    label: "Waiting for Support",
  },
  {
    value: "RESOLVED",
    label: "Resolved",
  },
  {
    value: "CLOSED",
    label: "Closed",
  },
];

const SCOPE_OPTIONS = [
  {
    value: "ALL",
    label: "All Scopes",
  },
  {
    value: "PLATFORM",
    label: "Platform Support",
  },
  {
    value: "LIBRARY",
    label: "Library Support",
  },
];

const ROLE_OPTIONS = [
  {
    value: "ALL",
    label: "All Requesters",
  },
  {
    value: "USER",
    label: "Student",
  },
  {
    value: "LIBRARY_OWNER",
    label: "Library Owner",
  },
];

const PRIORITY_OPTIONS = [
  {
    value: "ALL",
    label: "All Priorities",
  },
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
  {
    value: "URGENT",
    label: "Urgent",
  },
];

const ASSIGNMENT_OPTIONS = [
  {
    value: "ALL",
    label: "All Assignments",
  },
  {
    value: "ASSIGNED",
    label: "Assigned",
  },
  {
    value: "UNASSIGNED",
    label: "Unassigned",
  },
];

// ============================================================
// META
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

const PRIORITY_META = {
  LOW: {
    label: "Low",
    color: "default",
  },

  MEDIUM: {
    label: "Medium",
    color: "info",
  },

  HIGH: {
    label: "High",
    color: "warning",
  },

  URGENT: {
    label: "Urgent",
    color: "error",
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
// SUMMARY CARD
// ============================================================

function SummaryCard({ label, value, description }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
      }}
    >
      <CardContent
        sx={{
          p: 2.3,

          "&:last-child": {
            pb: 2.3,
          },
        }}
      >
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          {label}
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
      </CardContent>
    </Card>
  );
}

// ============================================================
// TICKET CARD
// ============================================================

function TicketCard({ ticket, onClick }) {
  const status = STATUS_META[ticket?.status] || STATUS_META.OPEN;

  const priority = PRIORITY_META[ticket?.priority] || PRIORITY_META.MEDIUM;

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
        overflow: "hidden",
        transition: "all 0.2s ease",

        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "primary.light",
          boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
        },
      }}
    >
      <Box
        sx={{
          height: 4,

          bgcolor:
            ticket.priority === "URGENT"
              ? "error.main"
              : ticket.status === "RESOLVED"
                ? "success.main"
                : ticket.status === "CLOSED"
                  ? "grey.400"
                  : ticket.status === "WAITING_FOR_SUPPORT"
                    ? "secondary.main"
                    : "primary.main",
        }}
      />

      <CardContent
        sx={{
          p: 2.5,

          "&:last-child": {
            pb: 2.5,
          },
        }}
      >
        <Stack spacing={2}>
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
                variant="h6"
                fontWeight={800}
                sx={{
                  mt: 0.4,
                  lineHeight: 1.35,
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

            <Chip
              size="small"
              variant="outlined"
              color={priority.color}
              label={`${priority.label} Priority`}
            />

            {ticket.requesterRole && (
              <Chip
                size="small"
                variant="outlined"
                label={
                  ticket.requesterRole === "USER"
                    ? "Student"
                    : ticket.requesterRole === "LIBRARY_OWNER"
                      ? "Library Owner"
                      : formatEnumLabel(ticket.requesterRole)
                }
              />
            )}
          </Stack>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Requester
            </Typography>

            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                mt: 0.2,
              }}
            >
              {ticket.requesterName || "Unknown requester"}
            </Typography>
          </Box>

          {ticket.libraryName && (
            <Box>
              <Typography variant="body2" color="text.secondary">
                Library
              </Typography>

              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  mt: 0.2,
                }}
              >
                {ticket.libraryName}
              </Typography>
            </Box>
          )}

          <Divider />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box>
              <Typography variant="caption" color="text.secondary">
                {ticket.assignedToName
                  ? `Assigned to ${ticket.assignedToName}`
                  : "Unassigned"}
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Updated{" "}
                {formatDateTime(
                  ticket.updatedAt || ticket.lastMessageAt || ticket.createdAt,
                )}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                color: "primary.main",
              }}
            >
              <Typography variant="body2" fontWeight={800}>
                Open
              </Typography>

              <ArrowForward fontSize="small" />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// ADMIN SUPPORT TICKETS
// ============================================================

function SupportTickets() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  // ==========================================================
  // STATE
  // ==========================================================

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "ALL",
  );

  const [scopeFilter, setScopeFilter] = useState(
    searchParams.get("scope") || "ALL",
  );

  const [roleFilter, setRoleFilter] = useState(
    searchParams.get("role") || "ALL",
  );

  const [priorityFilter, setPriorityFilter] = useState(
    searchParams.get("priority") || "ALL",
  );

  const [assignmentFilter, setAssignmentFilter] = useState(
    searchParams.get("assignment") || "ALL",
  );

  // ==========================================================
  // LOAD
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
        "Unable to load support tickets.";

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
  // SYNC QUERY PARAMS
  // ==========================================================

  useEffect(() => {
    const nextParams = new URLSearchParams();

    if (statusFilter !== "ALL") {
      nextParams.set("status", statusFilter);
    }

    if (scopeFilter !== "ALL") {
      nextParams.set("scope", scopeFilter);
    }

    if (roleFilter !== "ALL") {
      nextParams.set("role", roleFilter);
    }

    if (priorityFilter !== "ALL") {
      nextParams.set("priority", priorityFilter);
    }

    if (assignmentFilter !== "ALL") {
      nextParams.set("assignment", assignmentFilter);
    }

    setSearchParams(nextParams, {
      replace: true,
    });
  }, [
    statusFilter,
    scopeFilter,
    roleFilter,
    priorityFilter,
    assignmentFilter,
    setSearchParams,
  ]);

  // ==========================================================
  // SUMMARY
  // ==========================================================

  const summary = useMemo(() => {
    const total = tickets.length;

    const open = tickets.filter((ticket) => ticket.status === "OPEN").length;

    const waiting = tickets.filter(
      (ticket) => ticket.status === "WAITING_FOR_SUPPORT",
    ).length;

    const urgent = tickets.filter(
      (ticket) => ticket.priority === "URGENT",
    ).length;

    const unassigned = tickets.filter(
      (ticket) =>
        !ticket.assignedToUserId &&
        !["RESOLVED", "CLOSED"].includes(ticket.status),
    ).length;

    return {
      total,
      open,
      waiting,
      urgent,
      unassigned,
    };
  }, [tickets]);

  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;

      const matchesScope =
        scopeFilter === "ALL" || ticket.scope === scopeFilter;

      const matchesRole =
        roleFilter === "ALL" || ticket.requesterRole === roleFilter;

      const matchesPriority =
        priorityFilter === "ALL" || ticket.priority === priorityFilter;

      const matchesAssignment =
        assignmentFilter === "ALL" ||
        (assignmentFilter === "ASSIGNED" && Boolean(ticket.assignedToUserId)) ||
        (assignmentFilter === "UNASSIGNED" && !ticket.assignedToUserId);

      const matchesSearch =
        !keyword ||
        ticket.ticketNumber?.toLowerCase().includes(keyword) ||
        ticket.subject?.toLowerCase().includes(keyword) ||
        ticket.category?.toLowerCase().includes(keyword) ||
        ticket.requesterName?.toLowerCase().includes(keyword) ||
        ticket.requesterEmail?.toLowerCase().includes(keyword) ||
        ticket.libraryName?.toLowerCase().includes(keyword) ||
        ticket.assignedToName?.toLowerCase().includes(keyword);

      return (
        matchesStatus &&
        matchesScope &&
        matchesRole &&
        matchesPriority &&
        matchesAssignment &&
        matchesSearch
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    scopeFilter,
    roleFilter,
    priorityFilter,
    assignmentFilter,
  ]);

  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const handleResetFilters = () => {
    setSearch("");

    setStatusFilter("ALL");

    setScopeFilter("ALL");

    setRoleFilter("ALL");

    setPriorityFilter("ALL");

    setAssignmentFilter("ALL");
  };

  // ==========================================================
  // ACTIVE FILTER COUNT
  // ==========================================================

  const activeFilterCount =
    [
      statusFilter,
      scopeFilter,
      roleFilter,
      priorityFilter,
      assignmentFilter,
    ].filter((value) => value !== "ALL").length + (search.trim() ? 1 : 0);

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
      {/* BACK */}
      {/* ===================================================== */}

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/admin/support")}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: 700,
        }}
      >
        Back to Support Dashboard
      </Button>

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
            "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(255,255,255,1) 58%, rgba(99,102,241,0.05))",
        }}
      >
        <CardContent
          sx={{
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
                  Support Tickets
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Search, filter and manage LibraryHub support requests.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
              disabled={loading}
              onClick={loadTickets}
              sx={{
                alignSelf: {
                  xs: "flex-start",
                  md: "center",
                },
                minHeight: 42,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "background.paper",
              }}
            >
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* SUMMARY */}
      {/* ===================================================== */}

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
            lg: 2.4,
          }}
        >
          <SummaryCard
            label="Total"
            value={summary.total}
            description="All tickets"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 2.4,
          }}
        >
          <SummaryCard
            label="Open"
            value={summary.open}
            description="New tickets"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 2.4,
          }}
        >
          <SummaryCard
            label="Waiting"
            value={summary.waiting}
            description="Needs response"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 2.4,
          }}
        >
          <SummaryCard
            label="Urgent"
            value={summary.urgent}
            description="Urgent priority"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 2.4,
          }}
        >
          <SummaryCard
            label="Unassigned"
            value={summary.unassigned}
            description="Needs owner"
          />
        </Grid>
      </Grid>

      {/* ===================================================== */}
      {/* FILTERS */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4,
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
          <Stack spacing={2}>
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{
                xs: "stretch",
                md: "center",
              }}
            >
              <TextField
                size="small"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search ticket, requester, subject, library or assignee"
                sx={{
                  width: {
                    xs: "100%",
                    md: 480,
                  },

                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                  },
                }}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {activeFilterCount > 0 && (
                <Button
                  startIcon={<FilterAltOff />}
                  onClick={handleResetFilters}
                  sx={{
                    alignSelf: {
                      xs: "flex-start",
                      md: "center",
                    },
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Clear Filters ({activeFilterCount})
                </Button>
              )}
            </Stack>

            <Grid container spacing={1.5}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Status"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Scope"
                  value={scopeFilter}
                  onChange={(event) => setScopeFilter(event.target.value)}
                >
                  {SCOPE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Requester"
                  value={roleFilter}
                  onChange={(event) => setRoleFilter(event.target.value)}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Priority"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 2.4,
                }}
              >
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Assignment"
                  value={assignmentFilter}
                  onChange={(event) => setAssignmentFilter(event.target.value)}
                >
                  {ASSIGNMENT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* RESULT COUNT */}
      {/* ===================================================== */}

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
        spacing={1}
        sx={{
          mb: 2,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing <strong>{filteredTickets.length}</strong> of{" "}
          <strong>{tickets.length}</strong> support tickets
        </Typography>

        {activeFilterCount > 0 && (
          <Chip
            size="small"
            color="primary"
            variant="outlined"
            label={`${activeFilterCount} active ${
              activeFilterCount === 1 ? "filter" : "filters"
            }`}
          />
        )}
      </Stack>

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
      {/* TICKETS */}
      {/* ===================================================== */}

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
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
                height={285}
                sx={{
                  borderRadius: 3,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : filteredTickets.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
          }}
        >
          <CardContent>
            <Box
              sx={{
                py: 7,
                textAlign: "center",
              }}
            >
              <SupportAgent
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
                {tickets.length === 0
                  ? "No support tickets"
                  : "No matching tickets"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.6,
                  maxWidth: 500,
                  mx: "auto",
                }}
              >
                {tickets.length === 0
                  ? "New student and library-owner support requests will appear here."
                  : "Try changing your search term or clearing one of the active filters."}
              </Typography>

              {activeFilterCount > 0 && (
                <Button
                  variant="outlined"
                  startIcon={<FilterAltOff />}
                  onClick={handleResetFilters}
                  sx={{
                    mt: 2.5,
                    borderRadius: 2.5,
                    textTransform: "none",
                    fontWeight: 700,
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {filteredTickets.map((ticket) => (
            <Grid
              key={ticket.id}
              size={{
                xs: 12,
                md: 6,
                xl: 4,
              }}
            >
              <TicketCard
                ticket={ticket}
                onClick={() => navigate(`/admin/support/tickets/${ticket.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default SupportTickets;
