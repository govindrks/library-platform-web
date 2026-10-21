import {
  CheckCircleRounded,
  CloseRounded,
  ContactPhoneRounded,
  EmailRounded,
  FilterAltRounded,
  LocalPhoneRounded,
  MarkEmailReadRounded,
  PersonRounded,
  QrCode2Rounded,
  RefreshRounded,
  ScheduleRounded,
  TrendingUpRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
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
  TableRow,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import libraryApi from "../../../api/libraryApi";
import libraryEnquiryApi from "../../../api/libraryEnquiryApi";

// ============================================================
// CONSTANTS
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const STATUS_OPTIONS = [
  {
    value: "NEW",
    label: "New",
  },
  {
    value: "CONTACTED",
    label: "Contacted",
  },
  {
    value: "INTERESTED",
    label: "Interested",
  },
  {
    value: "CONVERTED",
    label: "Converted",
  },
  {
    value: "CLOSED",
    label: "Closed",
  },
];

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message || data?.error || data?.detail || error?.message || fallback
  );
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

const formatStatus = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getStoredLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
};

const storeLibraryId = (libraryId) => {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
};

const getStatusColor = (status) => {
  switch (status) {
    case "NEW":
      return "info";

    case "CONTACTED":
      return "warning";

    case "INTERESTED":
      return "primary";

    case "CONVERTED":
      return "success";

    case "CLOSED":
      return "default";

    default:
      return "default";
  }
};

// ============================================================
// METRIC CARD
// ============================================================

function MetricCard({ label, value, icon, color = "primary" }) {
  const theme = useTheme();

  const palette = theme.palette[color] || theme.palette.primary;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",

        borderRadius: 3.5,

        borderColor: alpha(palette.main, 0.16),

        background: `linear-gradient(
            135deg,
            ${alpha(palette.main, 0.045)},
            #fff 55%
          )`,

        boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              bgcolor: alpha(palette.main, 0.09),

              color: palette.main,

              width: 48,

              height: 48,
            }}
          >
            {icon}
          </Avatar>

          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              {label}
            </Typography>

            <Typography variant="h5" fontWeight={900}>
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// PAGE
// ============================================================

function LibraryEnquiries() {
  const theme = useTheme();

  // ==========================================================
  // LIBRARY STATE
  // ==========================================================

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  // ==========================================================
  // ENQUIRY STATE
  // ==========================================================

  const [enquiries, setEnquiries] = useState([]);

  const [statusFilter, setStatusFilter] = useState("");

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const [error, setError] = useState("");

  const [selectedEnquiry, setSelectedEnquiry] = useState(null);

  // ==========================================================
  // SELECTED LIBRARY
  // ==========================================================

  const selectedLibrary = useMemo(
    () =>
      libraries.find((library) => String(library.id) === String(libraryId)) ||
      null,
    [libraries, libraryId],
  );

  // ==========================================================
  // LOAD LIBRARIES
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadLibraries = async () => {
      try {
        setLoadingLibraries(true);

        setError("");

        const response = await libraryApi.getMyLibraries();

        if (!active) {
          return;
        }

        const list = Array.isArray(response) ? response : [];

        setLibraries(list);

        if (list.length === 0) {
          setLibraryId("");

          setError("No library found for this account.");

          return;
        }

        const storedId = getStoredLibraryId();

        const storedExists = list.some(
          (library) => Number(library.id) === Number(storedId),
        );

        const nextId = storedExists ? String(storedId) : String(list[0].id);

        setLibraryId(nextId);

        storeLibraryId(nextId);
      } catch (requestError) {
        if (!active) {
          return;
        }

        console.error("Unable to load owner libraries:", requestError);

        setLibraries([]);

        setLibraryId("");

        setError(
          getErrorMessage(requestError, "Unable to load your libraries."),
        );
      } finally {
        if (active) {
          setLoadingLibraries(false);
        }
      }
    };

    loadLibraries();

    return () => {
      active = false;
    };
  }, []);

  // ==========================================================
  // LOAD ENQUIRIES
  // ==========================================================

  const loadEnquiries = useCallback(async () => {
    if (!libraryId) {
      setEnquiries([]);

      return;
    }

    try {
      setLoadingEnquiries(true);

      setError("");

      const response = await libraryEnquiryApi.getEnquiries(
        libraryId,
        statusFilter || null,
      );

      setEnquiries(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Unable to load membership enquiries:", requestError);

      setEnquiries([]);

      setError(
        getErrorMessage(requestError, "Unable to load membership enquiries."),
      );
    } finally {
      setLoadingEnquiries(false);
    }
  }, [libraryId, statusFilter]);

  useEffect(() => {
    if (loadingLibraries) {
      return;
    }

    loadEnquiries();
  }, [loadingLibraries, loadEnquiries]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const counts = useMemo(() => {
    return enquiries.reduce(
      (current, enquiry) => {
        current.total += 1;

        if (enquiry.status === "NEW") {
          current.new += 1;
        }

        if (enquiry.status === "CONTACTED") {
          current.contacted += 1;
        }

        if (enquiry.status === "CONVERTED") {
          current.converted += 1;
        }

        if (enquiry.qrAttributed) {
          current.qr += 1;
        }

        return current;
      },
      {
        total: 0,
        new: 0,
        contacted: 0,
        converted: 0,
        qr: 0,
      },
    );
  }, [enquiries]);

  // ==========================================================
  // CHANGE LIBRARY
  // ==========================================================

  const handleLibraryChange = (event) => {
    const nextId = event.target.value;

    setLibraryId(nextId);

    storeLibraryId(nextId);

    setStatusFilter("");

    setSelectedEnquiry(null);
  };

  // ==========================================================
  // UPDATE STATUS
  // ==========================================================

  const handleStatusChange = async (enquiry, newStatus) => {
    if (!libraryId || !enquiry?.id || !newStatus) {
      return;
    }

    try {
      setUpdatingStatusId(enquiry.id);

      setError("");

      const updated = await libraryEnquiryApi.updateStatus(
        libraryId,
        enquiry.id,
        newStatus,
      );

      setEnquiries((current) =>
        current.map((item) =>
          String(item.id) === String(enquiry.id)
            ? {
                ...item,
                ...updated,
              }
            : item,
        ),
      );

      setSelectedEnquiry((current) => {
        if (!current || String(current.id) !== String(enquiry.id)) {
          return current;
        }

        return {
          ...current,
          ...updated,
        };
      });
    } catch (requestError) {
      console.error("Unable to update enquiry status:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to update enquiry status."),
      );
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // ==========================================================
  // INITIAL LOADING
  // ==========================================================

  if (loadingLibraries) {
    return (
      <Box
        sx={{
          minHeight: 420,

          display: "grid",

          placeItems: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography color="text.secondary">Loading libraries...</Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        pb: 4,
      }}
    >
      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,

          borderRadius: 4,

          borderColor: alpha(theme.palette.primary.main, 0.13),

          background: `linear-gradient(
              120deg,
              ${alpha(theme.palette.primary.main, 0.07)} 0%,
              #ffffff 55%,
              ${alpha(theme.palette.info.main, 0.04)} 100%
            )`,

          boxShadow: "0 14px 42px rgba(15,23,42,0.055)",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3.5,
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
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 58,

                  height: 58,

                  bgcolor: "primary.main",

                  color: "#fff",
                }}
              >
                <ContactPhoneRounded />
              </Avatar>

              <Box>
                <Typography variant="h4" fontWeight={900}>
                  Membership Enquiries
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Track potential members and QR campaign leads.
                </Typography>

                {selectedLibrary && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={selectedLibrary.name}
                    sx={{
                      mt: 1.2,

                      bgcolor: "#fff",
                    }}
                  />
                )}
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={
                loadingEnquiries ? (
                  <CircularProgress size={16} />
                ) : (
                  <RefreshRounded />
                )
              }
              onClick={loadEnquiries}
              disabled={loadingEnquiries || !libraryId}
            >
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

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

      {/* ===================================================== */}
      {/* FILTER BAR */}
      {/* ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,

          borderRadius: 3.5,
        }}
      >
        <CardContent>
          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Library</InputLabel>

                <Select
                  value={libraryId}
                  label="Library"
                  onChange={handleLibraryChange}
                >
                  {libraries.map((library) => (
                    <MenuItem key={library.id} value={String(library.id)}>
                      {library.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>

                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(event) => setStatusFilter(event.target.value)}
                  startAdornment={
                    <FilterAltRounded
                      sx={{
                        mr: 1,
                        color: "text.secondary",
                      }}
                    />
                  }
                >
                  <MenuItem value="">All Enquiries</MenuItem>

                  {STATUS_OPTIONS.map((status) => (
                    <MenuItem key={status.value} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* METRICS */}
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
            lg: 3,
          }}
        >
          <MetricCard
            label="Total Enquiries"
            value={counts.total}
            icon={<PersonRounded />}
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <MetricCard
            label="New"
            value={counts.new}
            icon={<MarkEmailReadRounded />}
            color="info"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <MetricCard
            label="Converted"
            value={counts.converted}
            icon={<TrendingUpRounded />}
            color="success"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <MetricCard
            label="QR Leads"
            value={counts.qr}
            icon={<QrCode2Rounded />}
            color="secondary"
          />
        </Grid>
      </Grid>

      {/* ===================================================== */}
      {/* ENQUIRY TABLE */}
      {/* ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          borderRadius: 3.5,

          overflow: "hidden",
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Member</TableCell>

                <TableCell>Contact</TableCell>

                <TableCell>Source</TableCell>

                <TableCell>Created</TableCell>

                <TableCell>Status</TableCell>

                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingEnquiries ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        py: 6,

                        display: "grid",

                        placeItems: "center",
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  </TableCell>
                </TableRow>
              ) : enquiries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6}>
                    <Box
                      sx={{
                        py: 7,

                        textAlign: "center",
                      }}
                    >
                      <ContactPhoneRounded
                        sx={{
                          fontSize: 50,

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
                        No enquiries found
                      </Typography>

                      <Typography color="text.secondary" variant="body2">
                        Membership enquiries will appear here.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                enquiries.map((enquiry) => (
                  <TableRow key={enquiry.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.3} alignItems="center">
                        <Avatar
                          sx={{
                            width: 38,
                            height: 38,
                          }}
                        >
                          {String(enquiry.fullName || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </Avatar>

                        <Box>
                          <Typography fontWeight={800}>
                            {enquiry.fullName}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            Enquiry #{enquiry.id}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>

                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack
                          direction="row"
                          spacing={0.6}
                          alignItems="center"
                        >
                          <LocalPhoneRounded
                            sx={{
                              fontSize: 15,
                            }}
                          />

                          <Typography variant="body2">
                            {enquiry.phone}
                          </Typography>
                        </Stack>

                        {enquiry.email && (
                          <Stack
                            direction="row"
                            spacing={0.6}
                            alignItems="center"
                          >
                            <EmailRounded
                              sx={{
                                fontSize: 15,
                              }}
                            />

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {enquiry.email}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </TableCell>

                    <TableCell>
                      {enquiry.qrAttributed ? (
                        <Chip
                          size="small"
                          icon={<QrCode2Rounded />}
                          label={
                            enquiry.qrCampaignCode
                              ? `QR · ${enquiry.qrCampaignCode}`
                              : "QR Campaign"
                          }
                          color="primary"
                          variant="outlined"
                        />
                      ) : (
                        <Chip
                          size="small"
                          label={enquiry.source || "Public Web"}
                          variant="outlined"
                        />
                      )}
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2">
                        {formatDateTime(enquiry.createdAt)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={formatStatus(enquiry.status)}
                        color={getStatusColor(enquiry.status)}
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedEnquiry(enquiry)}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* ===================================================== */}
      {/* ENQUIRY DETAILS DIALOG */}
      {/* ===================================================== */}

      <Dialog
        open={Boolean(selectedEnquiry)}
        onClose={() => setSelectedEnquiry(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="h6" fontWeight={900}>
                Enquiry Details
              </Typography>

              {selectedEnquiry && (
                <Typography variant="caption" color="text.secondary">
                  #{selectedEnquiry.id}
                </Typography>
              )}
            </Box>

            <Button onClick={() => setSelectedEnquiry(null)}>
              <CloseRounded />
            </Button>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent>
          {selectedEnquiry && (
            <Stack spacing={2.2}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  NAME
                </Typography>

                <Typography fontWeight={850}>
                  {selectedEnquiry.fullName}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    PHONE
                  </Typography>

                  <Typography>{selectedEnquiry.phone}</Typography>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    EMAIL
                  </Typography>

                  <Typography>{selectedEnquiry.email || "-"}</Typography>
                </Grid>
              </Grid>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  MESSAGE
                </Typography>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,

                    mt: 0.5,

                    borderRadius: 2.5,
                  }}
                >
                  <Typography variant="body2">
                    {selectedEnquiry.message || "No message provided."}
                  </Typography>
                </Paper>
              </Box>

              {selectedEnquiry.membershipPlanId && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    MEMBERSHIP PLAN
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <WorkspacePremiumRounded color="primary" fontSize="small" />

                    <Typography>
                      Plan #{selectedEnquiry.membershipPlanId}
                    </Typography>
                  </Stack>
                </Box>
              )}

              <Box>
                <Typography variant="caption" color="text.secondary">
                  SOURCE
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    mt: 0.5,
                  }}
                >
                  {selectedEnquiry.qrAttributed ? (
                    <Chip
                      size="small"
                      icon={<QrCode2Rounded />}
                      label={
                        selectedEnquiry.qrCampaignCode
                          ? `QR · ${selectedEnquiry.qrCampaignCode}`
                          : "QR Campaign"
                      }
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Chip
                      size="small"
                      label={selectedEnquiry.source || "Public Web"}
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="caption" color="text.secondary">
                  RECEIVED
                </Typography>

                <Stack direction="row" spacing={0.8} alignItems="center">
                  <ScheduleRounded fontSize="small" />

                  <Typography>
                    {formatDateTime(selectedEnquiry.createdAt)}
                  </Typography>
                </Stack>
              </Box>

              <Divider />

              <Box>
                <Typography
                  fontWeight={850}
                  sx={{
                    mb: 1,
                  }}
                >
                  Update Status
                </Typography>

                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>

                  <Select
                    value={selectedEnquiry.status || "NEW"}
                    label="Status"
                    disabled={updatingStatusId === selectedEnquiry.id}
                    onChange={(event) =>
                      handleStatusChange(selectedEnquiry, event.target.value)
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setSelectedEnquiry(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LibraryEnquiries;
