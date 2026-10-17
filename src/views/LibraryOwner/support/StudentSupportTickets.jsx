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
  CheckCircleRounded,
  LibraryBooksOutlined,
  Refresh,
  Search,
  SupportAgent,
  WarningAmberRounded,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import api from "../../../api/axios";

import supportTicketApi from "../../../api/supportTicketApi";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const getStoredLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);
  if (!value) return null;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
};

const storeLibraryId = (libraryId) => {
  const id = Number(libraryId);
  if (!Number.isFinite(id)) return;
  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
};

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "ST";
  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
};

const STATUS_OPTIONS = [
  {
    value: "ALL",

    label: "All Tickets",
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

    label: "Waiting for Student",
  },

  {
    value: "WAITING_FOR_SUPPORT",

    label: "Waiting for You",
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
    label: "Waiting for Student",

    color: "warning",
  },

  WAITING_FOR_SUPPORT: {
    label: "Waiting for You",

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

function SummaryCard({
  label,
  value,
  description,
  icon,
  active = false,
  onClick,
}) {
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
          p: 2.4,

          "&:last-child": {
            pb: 2.4,
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
            mt: 0.6,
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

function TicketCard({ ticket, onClick }) {
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
            ticket.status === "RESOLVED"
              ? "success.main"
              : ticket.status === "CLOSED"
                ? "grey.400"
                : ticket.status === "WAITING_FOR_USER"
                  ? "warning.main"
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
                  mt: 0.5,

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

          {ticket.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.6,
              }}
            >
              {ticket.description}
            </Typography>
          )}

          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              label={formatEnumLabel(ticket.category)}
            />

            {ticket.requesterName && (
              <Chip
                size="small"
                variant="outlined"
                avatar={
                  <Avatar
                    src={
                      ticket.requesterProfileImageUrl ||
                      ticket.profileImageUrl ||
                      undefined
                    }
                  >
                    {!(
                      ticket.requesterProfileImageUrl || ticket.profileImageUrl
                    )
                      ? getInitials(ticket.requesterName)
                      : null}
                  </Avatar>
                }
                label={ticket.requesterName}
              />
            )}

            {ticket.libraryName && (
              <Chip
                size="small"
                variant="outlined"
                label={ticket.libraryName}
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

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                color: "primary.main",
              }}
            >
              <Typography variant="body2" fontWeight={800}>
                View
              </Typography>

              <ArrowForward fontSize="small" />
            </Stack>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

function StudentSupportTickets() {
  const navigate = useNavigate();

  const [libraries, setLibraries] = useState([]);

  const [librariesLoading, setLibrariesLoading] = useState(true);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [sortMode, setSortMode] = useState("ATTENTION");

  const loadLibraries = useCallback(async () => {
    try {
      setLibrariesLoading(true);

      const response = await api.get("/api/libraries/my");

      const data = response.data;

      const normalized = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data?.libraries)
            ? data.libraries
            : Array.isArray(data?.data)
              ? data.data
              : [];

      setLibraries(normalized);
      if (normalized.length > 0) {
        const storedLibraryId = getStoredLibraryId();

        const storedLibrary =
          storedLibraryId != null
            ? normalized.find(
                (library) => Number(library?.id) === Number(storedLibraryId),
              )
            : null;

        const nextLibrary = storedLibrary ?? normalized[0];
        const nextId = String(nextLibrary.id);

        setSelectedLibraryId((current) => current || nextId);
        storeLibraryId(nextId);
      }
    } catch (requestError) {
      console.error("Failed to load owner libraries:", requestError);

      setLibraries([]);
    } finally {
      setLibrariesLoading(false);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    if (!selectedLibraryId) {
      setTickets([]);

      return;
    }

    try {
      setLoading(true);

      setError("");

      const data =
        await supportTicketApi.getLibrarySupportTickets(selectedLibraryId);

      setTickets(Array.isArray(data) ? data : []);
    } catch (requestError) {
      console.error("Failed to load student support tickets:", requestError);

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail ||
        "Unable to load student support tickets.";

      setError(message);

      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [selectedLibraryId]);

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    const handleLibraryChanged = (event) => {
      const nextLibraryId = Number(event?.detail?.libraryId);

      if (!Number.isFinite(nextLibraryId)) return;

      const exists = libraries.some(
        (library) => Number(library?.id) === nextLibraryId,
      );

      if (!exists || String(nextLibraryId) === String(selectedLibraryId))
        return;

      setSelectedLibraryId(String(nextLibraryId));
      setSearch("");
      setStatusFilter("ALL");
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);

    return () =>
      window.removeEventListener("owner-library-changed", handleLibraryChanged);
  }, [libraries, selectedLibraryId]);

  const counts = useMemo(() => {
    const total = tickets.length;

    const open = tickets.filter((ticket) => ticket.status === "OPEN").length;

    const waitingForOwner = tickets.filter(
      (ticket) => ticket.status === "WAITING_FOR_SUPPORT",
    ).length;

    const resolved = tickets.filter(
      (ticket) => ticket.status === "RESOLVED" || ticket.status === "CLOSED",
    ).length;

    return {
      total,

      open,

      waitingForOwner,

      resolved,
    };
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return tickets.filter((ticket) => {
      const matchesStatus =
        statusFilter === "ALL" || ticket.status === statusFilter;

      const matchesSearch =
        !keyword ||
        ticket.ticketNumber?.toLowerCase().includes(keyword) ||
        ticket.subject?.toLowerCase().includes(keyword) ||
        ticket.category?.toLowerCase().includes(keyword) ||
        ticket.requesterName?.toLowerCase().includes(keyword) ||
        ticket.requesterEmail?.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [tickets, search, statusFilter]);

  const sortedTickets = useMemo(() => {
    const list = [...filteredTickets];

    if (sortMode === "NEWEST") {
      return list.sort(
        (a, b) =>
          new Date(b.updatedAt || b.lastMessageAt || b.createdAt || 0) -
          new Date(a.updatedAt || a.lastMessageAt || a.createdAt || 0),
      );
    }

    if (sortMode === "OLDEST") {
      return list.sort(
        (a, b) =>
          new Date(a.updatedAt || a.lastMessageAt || a.createdAt || 0) -
          new Date(b.updatedAt || b.lastMessageAt || b.createdAt || 0),
      );
    }

    const priority = {
      WAITING_FOR_SUPPORT: 0,
      OPEN: 1,
      IN_PROGRESS: 2,
      WAITING_FOR_USER: 3,
      RESOLVED: 4,
      CLOSED: 5,
    };

    return list.sort((a, b) => {
      const statusDelta =
        (priority[a?.status] ?? 99) - (priority[b?.status] ?? 99);
      if (statusDelta !== 0) return statusDelta;

      return (
        new Date(b.updatedAt || b.lastMessageAt || b.createdAt || 0) -
        new Date(a.updatedAt || a.lastMessageAt || a.createdAt || 0)
      );
    });
  }, [filteredTickets, sortMode]);

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,

    [libraries, selectedLibraryId],
  );

  return (
    <Box
      sx={{
        width: "100%",

        pb: 5,
      }}
    >
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/owner/help-support")}
        sx={{
          mb: 2,

          textTransform: "none",

          fontWeight: 700,
        }}
      >
        Back to Help & Support
      </Button>

      <Card
        elevation={0}
        sx={{
          mb: 3,

          borderRadius: 4,

          overflow: "hidden",

          border: "1px solid",

          borderColor: "rgba(79,70,229,0.13)",

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
                <LibraryBooksOutlined />
              </Box>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    letterSpacing: "-0.02em",
                  }}
                >
                  Student Support
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  View and respond to support requests from students in your
                  library.
                </Typography>
              </Box>
            </Stack>

            {selectedLibrary && (
              <Chip
                icon={<LibraryBooksOutlined />}
                label={selectedLibrary.name}
                color="primary"
                variant="outlined"
                sx={{
                  alignSelf: {
                    xs: "flex-start",

                    md: "center",
                  },

                  bgcolor: "background.paper",

                  fontWeight: 700,
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

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
          >
            <Box>
              <Typography fontWeight={800}>Library</Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.3,
                }}
              >
                Select which library's student tickets you want to manage.
              </Typography>
            </Box>

            <TextField
              select
              size="small"
              label="Library"
              value={selectedLibraryId}
              onChange={(event) => {
                const nextId = String(event.target.value);
                setSelectedLibraryId(nextId);
                storeLibraryId(nextId);
                setSearch("");
                setStatusFilter("ALL");

                window.dispatchEvent(
                  new CustomEvent("owner-library-changed", {
                    detail: { libraryId: Number(nextId) },
                  }),
                );
              }}
              disabled={librariesLoading}
              sx={{
                minWidth: {
                  xs: "100%",

                  md: 300,
                },

                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                },
              }}
            >
              {librariesLoading && (
                <MenuItem disabled>
                  <CircularProgress
                    size={17}
                    sx={{
                      mr: 1,
                    }}
                  />
                  Loading libraries...
                </MenuItem>
              )}

              {!librariesLoading && libraries.length === 0 && (
                <MenuItem disabled>No libraries available</MenuItem>
              )}

              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name || `Library #${library.id}`}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </CardContent>
      </Card>

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

            lg: 3,
          }}
        >
          <SummaryCard
            label="Total Tickets"
            value={counts.total}
            description="All student requests"
            icon={<SupportAgent fontSize="small" />}
            active={statusFilter === "ALL"}
            onClick={() => setStatusFilter("ALL")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 3,
          }}
        >
          <SummaryCard
            label="Open"
            value={counts.open}
            description="New support requests"
            icon={<LibraryBooksOutlined fontSize="small" />}
            active={statusFilter === "OPEN"}
            onClick={() => setStatusFilter("OPEN")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 3,
          }}
        >
          <SummaryCard
            label="Waiting for You"
            value={counts.waitingForOwner}
            description="Student replied"
            icon={<WarningAmberRounded fontSize="small" />}
            active={statusFilter === "WAITING_FOR_SUPPORT"}
            onClick={() => setStatusFilter("WAITING_FOR_SUPPORT")}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,

            sm: 6,

            lg: 3,
          }}
        >
          <SummaryCard
            label="Resolved"
            value={counts.resolved}
            description="Resolved or closed"
            icon={<CheckCircleRounded fontSize="small" />}
            active={statusFilter === "RESOLVED"}
            onClick={() => setStatusFilter("RESOLVED")}
          />
        </Grid>

        {counts.waitingForOwner > 0 &&
          statusFilter !== "WAITING_FOR_SUPPORT" && (
            <Alert
              severity="warning"
              icon={<WarningAmberRounded />}
              sx={{ mb: 3, borderRadius: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setStatusFilter("WAITING_FOR_SUPPORT")}
                >
                  Review Now
                </Button>
              }
            >
              {counts.waitingForOwner} student support{" "}
              {counts.waitingForOwner === 1 ? "request is" : "requests are"}{" "}
              waiting for your response.
            </Alert>
          )}
      </Grid>

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
          >
            <TextField
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ticket, student, subject or category"
              sx={{
                width: {
                  xs: "100%",

                  md: 420,
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

            <Stack
              direction={{
                xs: "column",

                sm: "row",
              }}
              spacing={1.3}
            >
              <TextField
                select
                size="small"
                label="Status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                sx={{
                  minWidth: 190,

                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                  },
                }}
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                size="small"
                label="Sort"
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value)}
                sx={{
                  minWidth: 170,
                  "& .MuiOutlinedInput-root": { borderRadius: 2.5 },
                }}
              >
                <MenuItem value="ATTENTION">Needs Attention</MenuItem>
                <MenuItem value="NEWEST">Newest Updated</MenuItem>
                <MenuItem value="OLDEST">Oldest Updated</MenuItem>
              </TextField>

              {(search || statusFilter !== "ALL") && (
                <Button
                  variant="text"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                  }}
                  sx={{ textTransform: "none", fontWeight: 700 }}
                >
                  Clear
                </Button>
              )}

              <Button
                variant="outlined"
                startIcon={
                  loading ? <CircularProgress size={16} /> : <Refresh />
                }
                disabled={loading || !selectedLibraryId}
                onClick={loadTickets}
                sx={{
                  minHeight: 40,

                  borderRadius: 2.5,

                  textTransform: "none",

                  fontWeight: 700,
                }}
              >
                Refresh
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

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

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((item) => (
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
                height={215}
                sx={{
                  borderRadius: 3,
                }}
              />
            </Grid>
          ))}
        </Grid>
      ) : !selectedLibraryId ? (
        <Alert
          severity="info"
          sx={{
            borderRadius: 3,
          }}
        >
          Select a library to view student support tickets.
        </Alert>
      ) : sortedTickets.length === 0 ? (
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
                py: 6,

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
                  ? "No student support tickets"
                  : "No matching tickets"}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.6,

                  maxWidth: 480,

                  mx: "auto",
                }}
              >
                {tickets.length === 0
                  ? "Student support requests for this library will appear here."
                  : "Try changing your search or status filter."}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {sortedTickets.map((ticket) => (
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
                onClick={() =>
                  navigate(
                    `/owner/student-support/${selectedLibraryId}/tickets/${ticket.id}`,
                  )
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default StudentSupportTickets;
