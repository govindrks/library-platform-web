import {
  AutoAwesome,
  CalendarMonth,
  CardMembership,
  CheckCircle,
  EmailOutlined,
  EventSeat,
  GroupsOutlined,
  LocalOffer,
  MoreVert,
  Person,
  PhoneOutlined,
  Refresh,
  Search,
  TrendingUp,
  Visibility,
  WorkspacePremium,
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
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Menu,
  MenuItem,
  Paper,
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
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import CustomPricingDialog from "./components/CustomPricingDialog";

import libraryApi from "../../api/libraryApi";
import memberApi from "../../api/memberApi";
import memberPricingApi from "../../api/memberPricingApi";
import getImageUrl from "../../utility/imageUrl";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const getStoredOwnerLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);
  if (!value) return null;
  const id = Number(value);
  return Number.isFinite(id) ? id : null;
};

const storeOwnerLibraryId = (libraryId) => {
  const id = Number(libraryId);
  if (!Number.isFinite(id)) return;
  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
};

function getErrorMessage(error, fallback = "Something went wrong.") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

function formatDate(date) {
  if (!date) return "-";
  const normalizedDate = String(date).substring(0, 10);
  const parsedDate = new Date(`${normalizedDate}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return String(date);
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
  if (!value) return "-";
  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getInitials(name) {
  const normalized = String(name || "").trim();
  if (!normalized) return "M";
  return normalized
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getDaysRemaining(date) {
  if (!date) return null;
  const end = new Date(`${String(date).substring(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(end.getTime())) return null;
  return Math.ceil((end.getTime() - today.getTime()) / 86400000);
}

function mapMember(member) {
  return {
    ...member,
    memberId: member?.memberId ?? null,
    memberCode: member?.memberCode || "",
    fullName: member?.fullName || "Member",
    email: member?.email || "",
    phone: member?.phone || "",
    profileImageUrl: member?.profileImageUrl || "",
    subscriptionId: member?.subscriptionId ?? null,
    membershipPlanId: member?.membershipPlanId ?? null,
    membershipPlanName: member?.membershipPlanName || "-",
    planType: member?.planType || "",
    startDate: member?.startDate || "",
    endDate: member?.endDate || "",
    subscriptionStatus: member?.subscriptionStatus || "",
    displayStatus: member?.displayStatus || "",
    seatId: member?.seatId ?? null,
    seatNumber: member?.seatNumber || "",
    floorId: member?.floorId ?? null,
    floorName: member?.floorName || "",
    amountPaid: Number(member?.amountPaid ?? 0),
    standardPrice: Number(member?.standardPrice ?? 0),
    customPrice:
      member?.customPrice != null ? Number(member.customPrice) : null,
    effectivePrice: Number(
      member?.effectivePrice ?? member?.standardPrice ?? 0,
    ),
    customPricingEnabled: Boolean(member?.customPricingEnabled),
    totalBookings: Number(member?.totalBookings ?? 0),
    completedBookings: Number(member?.completedBookings ?? 0),
    autoRenew: Boolean(member?.autoRenew),
  };
}

function MemberStatusChip({ status }) {
  const theme = useTheme();
  const config = {
    ACTIVE: {
      label: "Active",
      background: alpha(theme.palette.success.main, 0.09),
      border: alpha(theme.palette.success.main, 0.28),
      color: theme.palette.success.dark,
    },
    EXPIRED: {
      label: "Expired",
      background: alpha(theme.palette.error.main, 0.07),
      border: alpha(theme.palette.error.main, 0.22),
      color: theme.palette.error.main,
    },
    SUSPENDED: {
      label: "Suspended",
      background: alpha(theme.palette.warning.main, 0.1),
      border: alpha(theme.palette.warning.main, 0.28),
      color: theme.palette.warning.dark,
    },
    CANCELLED: {
      label: "Cancelled",
      background: alpha(theme.palette.error.main, 0.07),
      border: alpha(theme.palette.error.main, 0.22),
      color: theme.palette.error.main,
    },
    PENDING_PAYMENT: {
      label: "Pending Payment",
      background: alpha(theme.palette.info.main, 0.08),
      border: alpha(theme.palette.info.main, 0.24),
      color: theme.palette.info.dark,
    },
  };

  const current = config[status] || {
    label: status || "-",
    background: alpha(theme.palette.text.secondary, 0.06),
    border: alpha(theme.palette.text.secondary, 0.16),
    color: theme.palette.text.secondary,
  };

  return (
    <Chip
      label={current.label}
      size="small"
      sx={{
        height: 26,
        fontWeight: 800,
        fontSize: 11.5,
        bgcolor: current.background,
        color: current.color,
        border: "1px solid",
        borderColor: current.border,
        "& .MuiChip-label": { px: 1.2 },
      }}
    />
  );
}

function MemberAvatar({ member, size = 42, fontSize = 14 }) {
  const theme = useTheme();
  const profileImageUrl = member?.profileImageUrl || "";

  return (
    <Avatar
      src={profileImageUrl ? getImageUrl(profileImageUrl) : undefined}
      alt={member?.fullName || "Member"}
      imgProps={{ referrerPolicy: "no-referrer" }}
      sx={{
        width: size,
        height: size,
        fontSize,
        fontWeight: 850,
        color: "primary.main",
        bgcolor: alpha(theme.palette.primary.main, 0.09),
        border: "2px solid",
        borderColor: alpha(theme.palette.primary.main, 0.14),
        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.08)}`,
      }}
    >
      {!profileImageUrl ? getInitials(member?.fullName) : null}
    </Avatar>
  );
}

function InfoItem({ icon, label, value, secondary }) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={1.4}
      alignItems="flex-start"
      sx={{
        p: 1.5,
        borderRadius: 2.2,
        bgcolor: alpha(theme.palette.primary.main, 0.025),
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.75),
        minHeight: 70,
      }}
    >
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: 1.8,
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          bgcolor: alpha(theme.palette.primary.main, 0.08),
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", fontWeight: 700, mb: 0.2 }}
        >
          {label}
        </Typography>

        <Typography
          variant="body2"
          fontWeight={750}
          sx={{ wordBreak: "break-word" }}
        >
          {value || "-"}
        </Typography>

        {secondary && (
          <Typography variant="caption" color="text.secondary" display="block">
            {secondary}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function MemberDetailsDialog({ member, open, onClose, loading }) {
  const theme = useTheme();

  if (!member && !loading) return null;

  const daysRemaining = getDaysRemaining(member?.endDate);

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="md"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
          },
        },
      }}
    >
      {loading && !member ? (
        <Box sx={{ py: 10, display: "grid", placeItems: "center" }}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading latest member details...
            </Typography>
          </Stack>
        </Box>
      ) : (
        <>
          <Box
            sx={{
              p: { xs: 2.5, sm: 3 },
              background:
                "linear-gradient(135deg, rgba(79,70,229,0.10) 0%, rgba(255,255,255,0.96) 55%, rgba(99,102,241,0.05) 100%)",
              borderBottom: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2.2}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <MemberAvatar member={member} size={76} fontSize={24} />

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 850, letterSpacing: "-0.02em" }}
                  >
                    {member?.fullName || "-"}
                  </Typography>
                  <MemberStatusChip status={member?.subscriptionStatus} />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.45, fontWeight: 650 }}
                >
                  {member?.memberCode || "-"}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  mt={1.2}
                  flexWrap="wrap"
                  useFlexGap
                >
                  {member?.membershipPlanName && (
                    <Chip
                      icon={<WorkspacePremium />}
                      label={member.membershipPlanName}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                    />
                  )}
                  {member?.seatNumber && member?.seatNumber !== "-" && (
                    <Chip
                      icon={<EventSeat />}
                      label={`Seat ${member.seatNumber}`}
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                    />
                  )}
                  {daysRemaining != null &&
                    member?.subscriptionStatus === "ACTIVE" && (
                      <Chip
                        icon={<CalendarMonth />}
                        label={
                          daysRemaining >= 0
                            ? `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} remaining`
                            : "Membership ended"
                        }
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, bgcolor: "background.paper" }}
                      />
                    )}
                </Stack>
              </Box>
            </Stack>
          </Box>

          <DialogContent sx={{ p: { xs: 2.5, sm: 3 } }}>
            <Stack spacing={3}>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 850, mb: 1.5 }}
                >
                  Member information
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem
                      icon={<EmailOutlined fontSize="small" />}
                      label="Email"
                      value={member?.email}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem
                      icon={<PhoneOutlined fontSize="small" />}
                      label="Phone"
                      value={member?.phone}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem
                      icon={<CardMembership fontSize="small" />}
                      label="Membership"
                      value={member?.membershipPlanName}
                      secondary={formatPlanType(member?.planType)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <InfoItem
                      icon={<EventSeat fontSize="small" />}
                      label="Assigned seat"
                      value={member?.seatNumber}
                      secondary={member?.floorName}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      height: "100%",
                      bgcolor: alpha(theme.palette.primary.main, 0.025),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Started
                    </Typography>
                    <Typography variant="body2" fontWeight={800} mt={0.4}>
                      {formatDate(member?.startDate)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      height: "100%",
                      bgcolor: alpha(theme.palette.primary.main, 0.025),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Expires
                    </Typography>
                    <Typography variant="body2" fontWeight={800} mt={0.4}>
                      {formatDate(member?.endDate)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      height: "100%",
                      bgcolor: alpha(theme.palette.success.main, 0.035),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Total bookings
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={850}
                      color="primary.main"
                      mt={0.2}
                    >
                      {Number(member?.totalBookings ?? 0)}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.8,
                      borderRadius: 2.5,
                      height: "100%",
                      bgcolor: alpha(theme.palette.success.main, 0.045),
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight={850}
                      color="success.dark"
                      mt={0.2}
                    >
                      {Number(member?.completedBookings ?? 0)}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.018),
                }}
              >
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    justifyContent="space-between"
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalOffer color="primary" sx={{ fontSize: 20 }} />
                        <Typography variant="subtitle1" fontWeight={850}>
                          Membership pricing
                        </Typography>
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                      >
                        Current pricing snapshot for this member.
                      </Typography>
                    </Box>
                    {member?.customPricingEnabled && (
                      <Chip
                        label="Custom pricing applied"
                        color="primary"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  <Grid container spacing={2} mt={0.3}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Standard price
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        ₹{formatCurrency(member?.standardPrice)}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Custom price
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {member?.customPricingEnabled &&
                        member?.customPrice != null
                          ? `₹${formatCurrency(member.customPrice)}`
                          : "-"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                      <Typography variant="caption" color="text.secondary">
                        Effective price
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={850}
                        color="primary.main"
                      >
                        ₹{formatCurrency(member?.effectivePrice)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              py: 2,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Button
              onClick={onClose}
              disabled={loading}
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 750 }}
            >
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

function SummaryCard({ icon, label, value, helper, tone = "primary" }) {
  const theme = useTheme();
  const color =
    tone === "success"
      ? theme.palette.success.main
      : tone === "warning"
        ? theme.palette.warning.main
        : tone === "error"
          ? theme.palette.error.main
          : theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: alpha(color, 0.14),
        borderRadius: 3.5,
        boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Stack direction="row" spacing={1.8} alignItems="center">
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: 2.3,
              display: "grid",
              placeItems: "center",
              color,
              bgcolor: alpha(color, 0.09),
              border: "1px solid",
              borderColor: alpha(color, 0.12),
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontWeight: 700 }}
            >
              {label}
            </Typography>
            <Typography
              variant="h5"
              sx={{ mt: 0.15, fontWeight: 900, letterSpacing: "-0.03em" }}
            >
              {value}
            </Typography>
            {helper && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mt={0.15}
              >
                {helper}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function Members() {
  const theme = useTheme();

  const [libraries, setLibraries] = useState([]);
  const [libraryId, setLibraryId] = useState("");
  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [members, setMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [planFilter, setPlanFilter] = useState("ALL");

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedMember, setSelectedMember] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuMember, setMenuMember] = useState(null);

  const [customPricingOpen, setCustomPricingOpen] = useState(false);
  const [customPricingMember, setCustomPricingMember] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const selectedLibrary = useMemo(
    () =>
      libraries.find((library) => String(library.id) === String(libraryId)) ||
      null,
    [libraries, libraryId],
  );

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

      const storedLibraryId = getStoredOwnerLibraryId();
      const storedExists =
        storedLibraryId != null &&
        libraryList.some(
          (library) => Number(library.id) === Number(storedLibraryId),
        );

      const nextLibraryId = storedExists
        ? String(storedLibraryId)
        : String(libraryList[0].id);

      setLibraryId(nextLibraryId);
      storeOwnerLibraryId(nextLibraryId);
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

      setMembers(memberList.map(mapMember));
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

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (libraryId) loadMembers();
    else {
      setMembers([]);
      setSummary(null);
    }
  }, [libraryId, loadMembers]);

  const availablePlanTypes = useMemo(
    () =>
      [
        ...new Set(members.map((member) => member.planType).filter(Boolean)),
      ].sort(),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return members.filter((member) => {
      const searchableValues = [
        member.memberCode,
        member.fullName,
        member.email,
        member.phone,
        member.membershipPlanName,
        member.seatNumber,
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

  const totalMembers = Number(summary?.totalMembers ?? members.length ?? 0);
  const activeMembers = Number(
    summary?.activeMembers ??
      members.filter((member) => member.subscriptionStatus === "ACTIVE").length,
  );
  const suspendedMembers = Number(
    summary?.suspendedMembers ??
      members.filter((member) => member.subscriptionStatus === "SUSPENDED")
        .length,
  );
  const expiredMembers = Number(
    summary?.expiredMembers ??
      members.filter((member) => member.subscriptionStatus === "EXPIRED")
        .length,
  );
  const cancelledMembers = Number(
    summary?.cancelledMembers ??
      members.filter((member) => member.subscriptionStatus === "CANCELLED")
        .length,
  );
  const membershipRevenue = Number(summary?.membershipRevenue ?? 0);
  const successfulMembershipPayments = Number(
    summary?.successfulMembershipPayments ?? 0,
  );

  const activeRate =
    totalMembers > 0 ? Math.round((activeMembers / totalMembers) * 100) : 0;

  const expiringSoonCount = members.filter((member) => {
    if (member.subscriptionStatus !== "ACTIVE") return false;
    const days = getDaysRemaining(member.endDate);
    return days != null && days >= 0 && days <= 7;
  }).length;

  const customPricingCount = members.filter(
    (member) => member.customPricingEnabled,
  ).length;

  const revenuePerPaidMember =
    successfulMembershipPayments > 0
      ? membershipRevenue / successfulMembershipPayments
      : 0;

  const handleOpenDetails = async (member) => {
    if (!libraryId || !member?.memberId) return;

    setSelectedMember(member);
    setDetailsOpen(true);
    setLoadingDetails(true);
    setError("");

    try {
      const response = await memberApi.getLibraryMemberById(
        libraryId,
        member.memberId,
      );

      setSelectedMember(mapMember(response || member));
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

  const handleOpenMenu = (event, member) => {
    setMenuAnchor(event.currentTarget);
    setMenuMember(member);
  };

  const handleCloseMenu = () => {
    setMenuAnchor(null);
    setMenuMember(null);
  };

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

      await memberPricingApi.createPricing({
        memberId: Number(member.memberId),
        membershipPlanId: Number(member.membershipPlanId),
        pricingType: pricing.pricingType,
        customPrice: Number(pricing.customPrice),
        effectiveFrom: pricing.effectiveFrom,
        effectiveUntil: pricing.effectiveUntil || null,
        reason: pricing.reason || null,
      });

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

  const handleToggleStatus = async () => {
    if (!libraryId || !menuMember?.memberId) return;

    const member = menuMember;
    setMenuAnchor(null);
    setMenuMember(null);

    try {
      setUpdatingStatus(true);
      setError("");
      setSuccess("");

      if (member.subscriptionStatus === "ACTIVE") {
        await memberApi.suspendMember(libraryId, member.memberId);
        setSuccess(`${member.fullName} has been suspended.`);
      } else if (member.subscriptionStatus === "SUSPENDED") {
        await memberApi.reactivateMember(libraryId, member.memberId);
        setSuccess(`${member.fullName} has been reactivated.`);
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

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setPlanFilter("ALL");
    setPage(0);
  };

  const handleLibraryChange = (event) => {
    const nextLibraryId = String(event.target.value);
    storeOwnerLibraryId(nextLibraryId);
    setLibraryId(nextLibraryId);
    setPage(0);
    setSearch("");
    setStatusFilter("ALL");
    setPlanFilter("ALL");
    setSuccess("");
    setError("");
  };

  const handleRefresh = async () => {
    setError("");
    setSuccess("");
    await loadMembers();
  };

  return (
    <Box sx={{ minHeight: "100%" }}>
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          mb: 3,
          px: { xs: 2.5, md: 3.5 },
          py: { xs: 2.7, md: 3.2 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.13),
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.08) 0%, rgba(255,255,255,0.98) 48%, rgba(99,102,241,0.04) 100%)",
          boxShadow: "0 18px 45px rgba(15,23,42,0.055)",
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
          spacing={2.5}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 58,
                height: 58,
                borderRadius: 3,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 12px 24px rgba(79,70,229,0.22)",
                flexShrink: 0,
              }}
            >
              <GroupsOutlined />
            </Box>

            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, letterSpacing: "-0.035em" }}
                >
                  Members
                </Typography>
                <Chip
                  icon={<AutoAwesome />}
                  label="Member intelligence"
                  size="small"
                  variant="outlined"
                  sx={{
                    display: { xs: "none", sm: "inline-flex" },
                    height: 26,
                    fontWeight: 750,
                    color: "primary.main",
                  }}
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.45, maxWidth: 690, lineHeight: 1.6 }}
              >
                Understand memberships, seat assignments, engagement, pricing
                and renewal health from one workspace.
              </Typography>

              {selectedLibrary && (
                <Chip
                  label={selectedLibrary.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 1.25,
                    fontWeight: 750,
                    bgcolor: "background.paper",
                  }}
                />
              )}
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <Button
              variant="outlined"
              startIcon={
                loadingMembers ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <Refresh />
                )
              }
              onClick={handleRefresh}
              disabled={!libraryId || loadingMembers}
              sx={{
                minHeight: 44,
                borderRadius: 2.3,
                px: 2.2,
                textTransform: "none",
                fontWeight: 800,
                bgcolor: "background.paper",
              }}
            >
              Refresh
            </Button>

            <FormControl
              size="small"
              sx={{
                minWidth: { xs: "100%", sm: 230 },
                bgcolor: "background.paper",
                borderRadius: 2.2,
              }}
            >
              <InputLabel>Working Library</InputLabel>
              <Select
                value={libraryId}
                label="Working Library"
                disabled={loadingLibraries || libraries.length === 0}
                onChange={handleLibraryChange}
                sx={{ borderRadius: 2.2, fontWeight: 700 }}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </Stack>
      </Box>

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: 2.5 }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={2} mb={2.5}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            icon={<GroupsOutlined />}
            label="Total Members"
            value={totalMembers}
            helper={`${suspendedMembers} suspended · ${cancelledMembers} cancelled`}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            icon={<CheckCircle />}
            label="Active Members"
            value={activeMembers}
            helper={`${activeRate}% of member base active`}
            tone="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            icon={<CalendarMonth />}
            label="Renewal Attention"
            value={expiringSoonCount}
            helper={`${expiredMembers} already expired`}
            tone={expiringSoonCount > 0 ? "warning" : "primary"}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <SummaryCard
            icon={<TrendingUp />}
            label="Membership Revenue"
            value={`₹${formatCurrency(membershipRevenue)}`}
            helper={`${successfulMembershipPayments} successful payments`}
          />
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          px: 2.5,
          py: 1.8,
          borderRadius: 3,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.1),
          bgcolor: alpha(theme.palette.primary.main, 0.018),
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={{ xs: 1.5, md: 3 }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              Avg. successful payment
            </Typography>
            <Typography variant="body1" fontWeight={850}>
              ₹{formatCurrency(revenuePerPaidMember)}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              Custom pricing
            </Typography>
            <Typography variant="body1" fontWeight={850}>
              {customPricingCount} member{customPricingCount !== 1 ? "s" : ""}
            </Typography>
          </Box>
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight={700}
            >
              Renewal window
            </Typography>
            <Typography variant="body1" fontWeight={850}>
              {expiringSoonCount} expiring in 7 days
            </Typography>
          </Box>
        </Stack>
      </Paper>

      <Card
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(15,23,42,0.035)",
        }}
      >
        <CardContent>
          <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search name, member ID, email, phone or plan..."
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(0);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
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
            <FormControl size="small" sx={{ minWidth: 200 }}>
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
            <Button
              variant="outlined"
              onClick={handleClearFilters}
              sx={{
                borderRadius: 2.2,
                textTransform: "none",
                fontWeight: 750,
                whiteSpace: "nowrap",
              }}
            >
              Clear filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: "0 14px 38px rgba(15,23,42,0.045)",
        }}
      >
        <Box
          sx={{
            px: 2.7,
            py: 2.2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.014),
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.2}
          >
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 850 }}>
                Member directory
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {filteredMembers.length} member
                {filteredMembers.length !== 1 ? "s" : ""} match the current view
              </Typography>
            </Box>
            {loadingMembers && <CircularProgress size={20} />}
          </Stack>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{ bgcolor: alpha(theme.palette.text.primary, 0.018) }}
              >
                <TableCell>Member</TableCell>
                <TableCell>Membership</TableCell>
                <TableCell>Validity</TableCell>
                <TableCell>Engagement</TableCell>
                <TableCell>Pricing</TableCell>
                <TableCell>Paid</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loadingMembers && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 8 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="text.secondary" mt={2}>
                        Loading members...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {!loadingMembers &&
                filteredMembers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((member) => {
                    const daysRemaining = getDaysRemaining(member.endDate);
                    return (
                      <TableRow
                        key={member.memberId ?? member.memberCode}
                        hover
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <MemberAvatar member={member} size={44} />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography
                                variant="body2"
                                fontWeight={800}
                                noWrap
                              >
                                {member.fullName || "-"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                noWrap
                              >
                                {member.memberCode || "-"}
                              </Typography>
                              {member.email && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                  noWrap
                                  sx={{ maxWidth: 210 }}
                                >
                                  {member.email}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={750}>
                            {member.membershipPlanName || "-"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatPlanType(member.planType)}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={700}>
                            {formatDate(member.startDate)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            to {formatDate(member.endDate)}
                          </Typography>
                          {member.subscriptionStatus === "ACTIVE" &&
                            daysRemaining != null &&
                            daysRemaining >= 0 &&
                            daysRemaining <= 7 && (
                              <Typography
                                variant="caption"
                                color="warning.dark"
                                display="block"
                                fontWeight={750}
                                mt={0.25}
                              >
                                {daysRemaining === 0
                                  ? "Expires today"
                                  : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left`}
                              </Typography>
                            )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>
                            {member.totalBookings}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {member.completedBookings} completed
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={800}>
                            ₹
                            {formatCurrency(
                              member.effectivePrice || member.standardPrice,
                            )}
                          </Typography>
                          {member.customPricingEnabled ? (
                            <Chip
                              label="Custom"
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{
                                mt: 0.45,
                                height: 20,
                                fontSize: 10.5,
                                fontWeight: 750,
                              }}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Standard
                            </Typography>
                          )}
                        </TableCell>

                        <TableCell>
                          <Typography variant="body2" fontWeight={850}>
                            ₹{formatCurrency(member.amountPaid)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <MemberStatusChip
                            status={member.subscriptionStatus}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end">
                            <Tooltip title="View member">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDetails(member)}
                                sx={{ color: "primary.main" }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="More actions">
                              <IconButton
                                size="small"
                                onClick={(event) =>
                                  handleOpenMenu(event, member)
                                }
                              >
                                <MoreVert fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}

              {!loadingMembers && filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ py: 9 }}>
                      <Person sx={{ fontSize: 42, color: "text.disabled" }} />
                      <Typography variant="h6" fontWeight={850} mt={1}>
                        No members found
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Try changing your search or filters.
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />

        <TablePagination
          component="div"
          count={filteredMembers.length}
          page={Math.min(
            page,
            Math.max(0, Math.ceil(filteredMembers.length / rowsPerPage) - 1),
          )}
          onPageChange={(_event, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Card>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
      >
        <MenuItem
          onClick={() => {
            const member = menuMember;
            handleCloseMenu();
            if (member) handleOpenDetails(member);
          }}
        >
          <Visibility
            fontSize="small"
            sx={{ mr: 1.5, color: "primary.main" }}
          />
          View Details
        </MenuItem>

        {menuMember?.membershipPlanId && (
          <MenuItem
            onClick={() => {
              const member = menuMember;
              handleCloseMenu();
              if (member) handleOpenCustomPricing(member);
            }}
          >
            <LocalOffer
              fontSize="small"
              sx={{ mr: 1.5, color: "primary.main" }}
            />
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

      <MemberDetailsDialog
        member={selectedMember}
        open={detailsOpen}
        onClose={handleCloseDetails}
        loading={loadingDetails}
      />

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
