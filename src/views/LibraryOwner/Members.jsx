import {
  CardMembership,
  EmailOutlined,
  EventSeat,
  LocalOffer,
  MoreVert,
  Person,
  PhoneOutlined,
  Search,
  Visibility,
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
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
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
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import CustomPricingDialog from "./components/CustomPricingDialog";

import libraryApi from "../../api/libraryApi";
import memberApi from "../../api/memberApi";
import memberPricingApi from "../../api/memberPricingApi";

/* =========================================================
   HELPERS
========================================================= */

function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  const normalizedDate = String(date).substring(0, 10);

  const parsedDate = new Date(`${normalizedDate}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatPlanType(value) {
  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

/* =========================================================
   STATUS CHIP
========================================================= */

function MemberStatusChip({ status }) {
  const config = {
    ACTIVE: {
      label: "Active",
      color: "success",
    },

    EXPIRED: {
      label: "Expired",
      color: "error",
    },

    SUSPENDED: {
      label: "Suspended",
      color: "warning",
    },

    CANCELLED: {
      label: "Cancelled",
      color: "error",
    },

    PENDING_PAYMENT: {
      label: "Pending Payment",
      color: "info",
    },
  };

  const current = config[status] || {
    label: status || "-",
    color: "default",
  };

  return (
    <Chip
      label={current.label}
      color={current.color}
      variant="outlined"
      size="small"
    />
  );
}

/* =========================================================
   MEMBER DETAILS DIALOG
========================================================= */

function MemberDetailsDialog({ member, open, onClose, loading }) {
  if (!member && !loading) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Member Details</DialogTitle>

      <DialogContent>
        {loading && !member ? (
          <Box
            sx={{
              py: 6,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Stack spacing={3} mt={1}>
            {/* Member Header */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  bgcolor: "primary.light",
                  color: "primary.main",
                  fontWeight: 700,
                }}
              >
                {(member?.fullName || "?").charAt(0).toUpperCase()}
              </Avatar>

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {member?.fullName || "-"}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {member?.memberCode || "-"}
                </Typography>
              </Box>

              <Box sx={{ ml: "auto" }}>
                <MemberStatusChip status={member?.subscriptionStatus} />
              </Box>
            </Stack>

            {/* Personal / Membership Information */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={1}>
                  <EmailOutlined color="action" fontSize="small" />

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Email
                    </Typography>

                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        wordBreak: "break-word",
                      }}
                    >
                      {member?.email || "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Stack direction="row" spacing={1}>
                  <PhoneOutlined color="action" fontSize="small" />

                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Phone
                    </Typography>

                    <Typography variant="body2" fontWeight={600}>
                      {member?.phone || "-"}
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Membership Plan
                </Typography>

                <Typography variant="body1" fontWeight={600}>
                  {member?.membershipPlanName || "-"}
                </Typography>

                {member?.planType && (
                  <Typography variant="caption" color="text.secondary">
                    {formatPlanType(member.planType)}
                  </Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Amount Paid
                </Typography>

                <Typography variant="body1" fontWeight={700}>
                  ₹{formatCurrency(member?.amountPaid)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Joined Date
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {formatDate(member?.startDate)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Membership Expiry
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {formatDate(member?.endDate)}
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Seat
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {member?.seatNumber || "-"}
                </Typography>

                {member?.floorName && (
                  <Typography variant="caption" color="text.secondary">
                    {member.floorName}
                  </Typography>
                )}
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">
                  Auto Renew
                </Typography>

                <Typography variant="body2" fontWeight={600}>
                  {member?.autoRenew ? "Enabled" : "Disabled"}
                </Typography>
              </Grid>
            </Grid>

            {/* Booking Statistics */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  sx={{
                    bgcolor: "primary.light",
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Total Bookings
                    </Typography>

                    <Typography variant="h5" fontWeight={700}>
                      {Number(member?.totalBookings ?? 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card
                  sx={{
                    bgcolor: "success.light",
                  }}
                >
                  <CardContent>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="success.dark"
                    >
                      {Number(member?.completedBookings ?? 0)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Pricing */}
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight={700} mb={2}>
                  Membership Pricing
                </Typography>

                <Grid container spacing={2}>
                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Standard Price
                    </Typography>

                    <Typography variant="body1" fontWeight={600}>
                      ₹{formatCurrency(member?.standardPrice)}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Custom Price
                    </Typography>

                    <Typography variant="body1" fontWeight={600}>
                      {member?.customPricingEnabled
                        ? `₹${formatCurrency(member?.customPrice)}`
                        : "-"}
                    </Typography>
                  </Grid>

                  <Grid
                    size={{
                      xs: 12,
                      sm: 4,
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Effective Price
                    </Typography>

                    <Typography
                      variant="body1"
                      fontWeight={700}
                      color="primary.main"
                    >
                      ₹{formatCurrency(member?.effectivePrice)}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {loading && (
              <Stack direction="row" spacing={1} alignItems="center">
                <CircularProgress size={16} />

                <Typography variant="caption" color="text.secondary">
                  Loading latest member details...
                </Typography>
              </Stack>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* =========================================================
   MEMBERS
========================================================= */

function Members() {
  /* =======================================================
     LIBRARY
  ======================================================= */

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  /* =======================================================
     MEMBER DATA
  ======================================================= */

  const [members, setMembers] = useState([]);

  const [summary, setSummary] = useState(null);

  const [loadingMembers, setLoadingMembers] = useState(false);

  /* =======================================================
     FILTERS
  ======================================================= */

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [planFilter, setPlanFilter] = useState("ALL");

  /* =======================================================
     PAGINATION
  ======================================================= */

  const [page, setPage] = useState(0);

  const [rowsPerPage, setRowsPerPage] = useState(5);

  /* =======================================================
     DETAILS
  ======================================================= */

  const [selectedMember, setSelectedMember] = useState(null);

  const [detailsOpen, setDetailsOpen] = useState(false);

  const [loadingDetails, setLoadingDetails] = useState(false);

  /* =======================================================
     ACTION MENU
  ======================================================= */

  const [menuAnchor, setMenuAnchor] = useState(null);

  const [menuMember, setMenuMember] = useState(null);

  /* =======================================================
     CUSTOM PRICING
  ======================================================= */

  const [customPricingOpen, setCustomPricingOpen] = useState(false);

  const [customPricingMember, setCustomPricingMember] = useState(null);

  /* =======================================================
     FEEDBACK / ACTION STATE
  ======================================================= */

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [updatingStatus, setUpdatingStatus] = useState(false);

  /* =======================================================
     LOAD OWNER LIBRARIES
  ======================================================= */

  const loadLibraries = useCallback(async () => {
    try {
      setLoadingLibraries(true);
      setError("");

      const response = await libraryApi.getMyLibraries();

      const libraryList = Array.isArray(response)
        ? response
        : Array.isArray(response?.content)
          ? response.content
          : [];

      setLibraries(libraryList);

      if (libraryList.length === 0) {
        setLibraryId("");
        setMembers([]);
        setSummary(null);

        return;
      }

      setLibraryId((currentLibraryId) => {
        const currentStillExists =
          currentLibraryId &&
          libraryList.some(
            (library) => String(library.id) === String(currentLibraryId),
          );

        if (currentStillExists) {
          return String(currentLibraryId);
        }

        return String(libraryList[0].id);
      });
    } catch (err) {
      console.error("Failed to load owner libraries:", err);

      setLibraries([]);
      setLibraryId("");
      setMembers([]);
      setSummary(null);

      setError(getErrorMessage(err, "Unable to load your libraries."));
    } finally {
      setLoadingLibraries(false);
    }
  }, []);

  /* =======================================================
     LOAD MEMBERS + SUMMARY
  ======================================================= */

  const loadMembers = useCallback(async () => {
    if (!libraryId) {
      setMembers([]);
      setSummary(null);

      return;
    }

    try {
      setLoadingMembers(true);
      setError("");

      const [membersResponse, summaryResponse] = await Promise.all([
        memberApi.getLibraryMembers(libraryId),

        memberApi.getLibraryMemberSummary(libraryId),
      ]);

      const memberList = Array.isArray(membersResponse)
        ? membersResponse
        : Array.isArray(membersResponse?.content)
          ? membersResponse.content
          : [];

      setMembers(memberList);

      setSummary(summaryResponse ?? null);

      setPage(0);
    } catch (err) {
      console.error("Failed to load library members:", err);

      setMembers([]);
      setSummary(null);

      setError(getErrorMessage(err, "Unable to load library members."));
    } finally {
      setLoadingMembers(false);
    }
  }, [libraryId]);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  /* =======================================================
     LIBRARY CHANGED -> LOAD MEMBERS
  ======================================================= */

  useEffect(() => {
    if (libraryId) {
      loadMembers();
    } else {
      setMembers([]);
      setSummary(null);
    }
  }, [libraryId, loadMembers]);

  /* =======================================================
     AVAILABLE PLAN TYPES
  ======================================================= */

  const availablePlanTypes = useMemo(() => {
    return [
      ...new Set(members.map((member) => member.planType).filter(Boolean)),
    ].sort();
  }, [members]);

  /* =======================================================
     FILTER MEMBERS
  ======================================================= */

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const searchableValues = [
        member.memberCode,
        member.fullName,
        member.email,
        member.phone,
        member.membershipPlanName,
      ];

      const matchesSearch =
        !query ||
        searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      const matchesStatus =
        statusFilter === "ALL" || member.subscriptionStatus === statusFilter;

      const matchesPlan =
        planFilter === "ALL" || member.planType === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [members, search, statusFilter, planFilter]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const totalMembers = Number(summary?.totalMembers ?? 0);

  const activeMembers = Number(summary?.activeMembers ?? 0);

  const suspendedMembers = Number(summary?.suspendedMembers ?? 0);

  const expiredMembers = Number(summary?.expiredMembers ?? 0);

  const cancelledMembers = Number(summary?.cancelledMembers ?? 0);

  const membershipRevenue = Number(summary?.membershipRevenue ?? 0);

  const successfulMembershipPayments = Number(
    summary?.successfulMembershipPayments ?? 0,
  );

  /* =======================================================
     DETAILS
  ======================================================= */

  const handleOpenDetails = async (member) => {
    if (!libraryId || !member?.memberId) {
      return;
    }

    setSelectedMember(member);
    setDetailsOpen(true);
    setLoadingDetails(true);
    setError("");

    try {
      const response = await memberApi.getLibraryMemberById(
        libraryId,
        member.memberId,
      );

      setSelectedMember(response);
    } catch (err) {
      console.error("Failed to load member details:", err);

      setError(getErrorMessage(err, "Unable to load member details."));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);

    setSelectedMember(null);

    setLoadingDetails(false);
  };

  /* =======================================================
     ACTION MENU
  ======================================================= */

  const handleOpenMenu = (event, member) => {
    setMenuAnchor(event.currentTarget);

    setMenuMember(member);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);

    setMenuMember(null);
  };

  /* =======================================================
     CUSTOM PRICING
  ======================================================= */

  const handleOpenCustomPricing = (member) => {
    setCustomPricingMember(member);

    setCustomPricingOpen(true);
  };

  const handleCloseCustomPricing = () => {
    setCustomPricingOpen(false);

    setCustomPricingMember(null);
  };

  const handleSaveCustomPricing = async (member, pricing) => {
    if (!member?.memberId || !member?.membershipPlanId) {
      setError("Member or membership plan information is missing.");

      return;
    }

    try {
      setError("");
      setSuccess("");

      const payload = {
        memberId: Number(member.memberId),

        membershipPlanId: Number(member.membershipPlanId),

        pricingType: pricing.pricingType,

        customPrice: Number(pricing.customPrice),

        effectiveFrom: pricing.effectiveFrom,

        effectiveUntil: pricing.effectiveUntil || null,

        reason: pricing.reason || null,
      };

      await memberPricingApi.createPricing(payload);

      /*
       * Reload authoritative backend
       * member/pricing information.
       */
      await loadMembers();

      setCustomPricingOpen(false);

      setCustomPricingMember(null);

      setSuccess("Custom pricing updated successfully.");
    } catch (err) {
      console.error("Failed to save custom pricing:", err);

      setError(getErrorMessage(err, "Unable to save custom pricing."));

      throw err;
    }
  };

  /* =======================================================
     SUSPEND / REACTIVATE MEMBER
  ======================================================= */

  const handleToggleStatus = async () => {
    if (!libraryId || !menuMember?.memberId) {
      return;
    }

    /*
     * Store the member before closing
     * the menu because handleCloseMenu()
     * clears menuMember.
     */
    const member = menuMember;

    setMenuAnchor(null);
    setMenuMember(null);

    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      if (member.subscriptionStatus === "ACTIVE") {
        await memberApi.suspendMember(libraryId, member.memberId);

        setSuccess("Member suspended successfully.");
      } else if (member.subscriptionStatus === "SUSPENDED") {
        await memberApi.reactivateMember(libraryId, member.memberId);

        setSuccess("Member reactivated successfully.");
      } else {
        setError("Only active or suspended members can use this action.");

        return;
      }

      await loadMembers();
    } catch (err) {
      console.error("Failed to update member status:", err);

      setError(getErrorMessage(err, "Unable to update member status."));
    } finally {
      setUpdatingStatus(false);
    }
  };

  /* =======================================================
     CLEAR FILTERS
  ======================================================= */

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPlanFilter("ALL");
    setPage(0);
  };

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Box>
      {/* ===================================================
          HEADER
      =================================================== */}

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
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Members
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Manage library members and their membership activity.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",
            sm: "row",
          }}
          spacing={1.5}
          sx={{
            width: {
              xs: "100%",
              md: "auto",
            },
          }}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 220,
            }}
          >
            <InputLabel>Library</InputLabel>

            <Select
              value={libraryId}
              label="Library"
              disabled={loadingLibraries}
              onChange={(event) => {
                setLibraryId(String(event.target.value));

                setPage(0);
                setSearch("");
                setStatusFilter("ALL");
                setPlanFilter("ALL");
              }}
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button variant="outlined" startIcon={<CardMembership />}>
            Membership Plans
          </Button>
        </Stack>
      </Stack>

      {/* ===================================================
          FEEDBACK
      =================================================== */}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {!loadingLibraries && libraries.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No library is available for this owner account.
        </Alert>
      )}

      {/* ===================================================
          SUMMARY
      =================================================== */}

      <Grid container spacing={2} mb={3}>
        {/* Total Members */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "primary.light",
                    color: "primary.main",
                  }}
                >
                  <Person />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Members
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {totalMembers}
                  </Typography>

                  {(suspendedMembers > 0 || cancelledMembers > 0) && (
                    <Typography variant="caption" color="text.secondary">
                      {suspendedMembers} suspended · {cancelledMembers}{" "}
                      cancelled
                    </Typography>
                  )}
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Active Members */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Active Members
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                color="success.main"
                mt={0.5}
              >
                {activeMembers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Expired */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Expired
              </Typography>

              <Typography
                variant="h5"
                fontWeight={700}
                color="error.main"
                mt={0.5}
              >
                {expiredMembers}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue */}
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Membership Revenue
              </Typography>

              <Typography variant="h5" fontWeight={700} mt={0.5}>
                ₹{formatCurrency(membershipRevenue)}
              </Typography>

              <Typography variant="caption" color="text.secondary">
                {successfulMembershipPayments} successful payment
                {successfulMembershipPayments !== 1 ? "s" : ""}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack
            direction={{
              xs: "column",
              lg: "row",
            }}
            spacing={2}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Search member, email, phone or ID..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);

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

            <FormControl
              size="small"
              sx={{
                minWidth: 170,
              }}
            >
              <InputLabel>Status</InputLabel>

              <Select
                value={statusFilter}
                label="Status"
                onChange={(event) => {
                  setStatusFilter(event.target.value);

                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Statuses</MenuItem>

                <MenuItem value="ACTIVE">Active</MenuItem>

                <MenuItem value="SUSPENDED">Suspended</MenuItem>

                <MenuItem value="EXPIRED">Expired</MenuItem>

                <MenuItem value="CANCELLED">Cancelled</MenuItem>

                <MenuItem value="PENDING_PAYMENT">Pending Payment</MenuItem>
              </Select>
            </FormControl>

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Membership Plan</InputLabel>

              <Select
                value={planFilter}
                label="Membership Plan"
                onChange={(event) => {
                  setPlanFilter(event.target.value);

                  setPage(0);
                }}
              >
                <MenuItem value="ALL">All Plans</MenuItem>

                {availablePlanTypes.map((planType) => (
                  <MenuItem key={planType} value={planType}>
                    {formatPlanType(planType)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button variant="outlined" onClick={handleClearFilters}>
              Clear
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================
          MEMBERS TABLE
      =================================================== */}

      <Card>
        <CardContent sx={{ p: 0 }}>
          <Box
            sx={{
              p: 2.5,
              borderBottom: "1px solid",
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" fontWeight={700}>
              Member List
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {filteredMembers.length} member
              {filteredMembers.length !== 1 ? "s" : ""} found
            </Typography>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>

                  <TableCell>Membership</TableCell>

                  <TableCell>Validity</TableCell>

                  <TableCell>Bookings</TableCell>

                  <TableCell>Payable</TableCell>

                  <TableCell>Paid</TableCell>

                  <TableCell>Status</TableCell>

                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {/* Loading */}
                {loadingMembers && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box
                        sx={{
                          py: 7,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 1.5,
                        }}
                      >
                        <CircularProgress size={30} />

                        <Typography variant="body2" color="text.secondary">
                          Loading members...
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}

                {/* Member Rows */}
                {!loadingMembers &&
                  filteredMembers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((member) => (
                      <TableRow key={member.memberId} hover>
                        {/* Member */}
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "primary.light",
                                color: "primary.main",
                                fontSize: "0.875rem",
                                fontWeight: 700,
                              }}
                            >
                              {(member.fullName || "?").charAt(0).toUpperCase()}
                            </Avatar>

                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {member.fullName || "-"}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {member.memberCode || "-"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Membership */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {member.membershipPlanName || "-"}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            {formatPlanType(member.planType)}
                          </Typography>
                        </TableCell>

                        {/* Validity */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(member.startDate)}
                          </Typography>

                          <Typography variant="caption" color="text.secondary">
                            to {formatDate(member.endDate)}
                          </Typography>
                        </TableCell>

                        {/* Bookings */}
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <EventSeat fontSize="small" />

                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {Number(member.totalBookings ?? 0)}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {Number(member.completedBookings ?? 0)}{" "}
                                completed
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Payable */}
                        <TableCell>
                          <Stack spacing={0.25}>
                            <Typography variant="body2" fontWeight={700}>
                              ₹
                              {formatCurrency(
                                member.effectivePrice ?? member.standardPrice,
                              )}
                            </Typography>

                            {member.customPricingEnabled && (
                              <Chip
                                label="Custom"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  width: "fit-content",
                                  height: 20,
                                  fontSize: "0.65rem",
                                }}
                              />
                            )}
                          </Stack>
                        </TableCell>

                        {/* Paid */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            ₹{formatCurrency(member.amountPaid)}
                          </Typography>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <MemberStatusChip
                            status={member.subscriptionStatus}
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDetails(member)}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>

                            <IconButton
                              size="small"
                              onClick={(event) => handleOpenMenu(event, member)}
                            >
                              <MoreVert fontSize="small" />
                            </IconButton>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}

                {/* Empty State */}
                {!loadingMembers && filteredMembers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">
                      <Box
                        sx={{
                          py: 8,
                        }}
                      >
                        <Person
                          sx={{
                            fontSize: 48,
                            color: "text.disabled",
                          }}
                        />

                        <Typography variant="h6" fontWeight={700} mt={1}>
                          No members found
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          {libraryId
                            ? "Try changing your search or filters."
                            : "Select a library to view its members."}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredMembers.length}
            page={page}
            onPageChange={(_event, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));

              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* ===================================================
          ACTION MENU
      =================================================== */}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            const member = menuMember;

            handleCloseMenu();

            if (member) {
              handleOpenDetails(member);
            }
          }}
        >
          <Visibility fontSize="small" sx={{ mr: 1.5 }} />
          View Details
        </MenuItem>

        {menuMember?.membershipPlanId && (
          <MenuItem
            onClick={() => {
              const member = menuMember;

              handleCloseMenu();

              if (member) {
                handleOpenCustomPricing(member);
              }
            }}
          >
            <LocalOffer fontSize="small" sx={{ mr: 1.5 }} />
            Set Custom Price
          </MenuItem>
        )}

        {(menuMember?.subscriptionStatus === "ACTIVE" ||
          menuMember?.subscriptionStatus === "SUSPENDED") && (
          <MenuItem disabled={updatingStatus} onClick={handleToggleStatus}>
            {menuMember?.subscriptionStatus === "ACTIVE"
              ? "Suspend Member"
              : "Reactivate Member"}
          </MenuItem>
        )}
      </Menu>

      {/* ===================================================
          DETAILS DIALOG
      =================================================== */}

      <MemberDetailsDialog
        member={selectedMember}
        open={detailsOpen}
        onClose={handleCloseDetails}
        loading={loadingDetails}
      />

      {/* ===================================================
          CUSTOM PRICING
      =================================================== */}

      <CustomPricingDialog
        member={customPricingMember}
        open={customPricingOpen}
        onClose={handleCloseCustomPricing}
        onSave={handleSaveCustomPricing}
      />
    </Box>
  );
}

export default Members;
