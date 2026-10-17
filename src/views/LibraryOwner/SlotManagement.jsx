import {
  AccessTime,
  Add,
  AutoAwesome,
  CheckCircle,
  DeleteOutlineOutlined,
  Edit,
  EventAvailable,
  MoreVert,
  Refresh,
  Schedule,
  Timelapse,
} from "@mui/icons-material";

import {
  Alert,
  alpha,
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
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import slotApi from "../../api/slotApi";

// ============================================================
// DEFAULT FORM
// ============================================================

const createEmptySlot = () => ({
  name: "",
  type: "FIXED",
  startTime: "06:00",
  endTime: "10:00",
  breakMinutes: 0,
  active: true,
});

// ============================================================
// HELPERS
// ============================================================

function formatTime(time) {
  if (!time) {
    return "-";
  }

  const [hours, minutes] = String(time).split(":");
  const date = new Date();

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  date.setSeconds(0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function validateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return false;
  }

  return startTime < endTime;
}

function normalizeTime(time) {
  if (!time) {
    return "";
  }

  return String(time).substring(0, 5);
}

function getErrorMessage(error, fallback) {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return responseData?.message || responseData?.error || fallback;
}

function getSlotDurationMinutes(startTime, endTime) {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHour, startMinute] = String(startTime)
    .substring(0, 5)
    .split(":")
    .map(Number);

  const [endHour, endMinute] = String(endTime)
    .substring(0, 5)
    .split(":")
    .map(Number);

  return Math.max(0, endHour * 60 + endMinute - (startHour * 60 + startMinute));
}

function formatDuration(minutes) {
  if (!minutes) {
    return "0 min";
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

// ============================================================
// PREMIUM STAT CARD
// ============================================================

function StatCard({ icon, label, value, caption, tone = "primary" }) {
  const theme = useTheme();

  const toneColor =
    tone === "success"
      ? theme.palette.success.main
      : tone === "neutral"
        ? theme.palette.text.secondary
        : theme.palette.primary.main;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
        background: `linear-gradient(145deg, ${alpha(
          toneColor,
          0.08,
        )} 0%, ${theme.palette.background.paper} 52%)`,
        boxShadow: `0 14px 32px ${alpha(theme.palette.common.black, 0.05)}`,
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 18px 38px ${alpha(theme.palette.common.black, 0.08)}`,
        },
      }}
    >
      <CardContent sx={{ p: 2.6, "&:last-child": { pb: 2.6 } }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 50,
              height: 50,
              borderRadius: 2.4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: toneColor,
              bgcolor: alpha(toneColor, 0.1),
              border: `1px solid ${alpha(toneColor, 0.14)}`,
            }}
          >
            {icon}
          </Box>

          <Box minWidth={0}>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", fontWeight: 600 }}
            >
              {label}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 0.2,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                lineHeight: 1.15,
              }}
            >
              {value}
            </Typography>

            {caption && (
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 0.4 }}
              >
                {caption}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SLOT CARD
// ============================================================

function SlotCard({ slot, onEdit, onDelete, onToggleStatus, statusUpdating }) {
  const theme = useTheme();
  const [menuAnchor, setMenuAnchor] = useState(null);
  const menuOpen = Boolean(menuAnchor);

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const active = Boolean(slot.active);
  const duration = getSlotDurationMinutes(slot.startTime, slot.endTime);

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 4,
        opacity: active ? 1 : 0.72,
        border: `1px solid ${alpha(
          active ? theme.palette.primary.main : theme.palette.divider,
          active ? 0.16 : 0.9,
        )}`,
        background: active
          ? `linear-gradient(160deg, ${alpha(
              theme.palette.primary.main,
              0.045,
            )} 0%, ${theme.palette.background.paper} 32%)`
          : theme.palette.background.paper,
        boxShadow: active
          ? `0 16px 38px ${alpha(theme.palette.common.black, 0.07)}`
          : `0 8px 22px ${alpha(theme.palette.common.black, 0.035)}`,
        transition:
          "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: active
            ? `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
            : alpha(theme.palette.text.disabled, 0.5),
        },
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 22px 48px ${alpha(
            theme.palette.common.black,
            active ? 0.1 : 0.06,
          )}`,
          borderColor: alpha(theme.palette.primary.main, active ? 0.32 : 0.12),
        },
      }}
    >
      <CardContent sx={{ p: 3.1, "&:last-child": { pb: 3.1 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box minWidth={0}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  lineHeight: 1.2,
                }}
              >
                {slot.name}
              </Typography>

              <Chip
                label={active ? "Active" : "Inactive"}
                size="small"
                color={active ? "success" : "default"}
                sx={{
                  height: 25,
                  fontWeight: 700,
                  borderRadius: 999,
                  ...(active && {
                    bgcolor: alpha(theme.palette.success.main, 0.1),
                    color: "success.dark",
                    border: `1px solid ${alpha(
                      theme.palette.success.main,
                      0.18,
                    )}`,
                  }),
                }}
              />
            </Stack>

            <Typography
              variant="body2"
              sx={{ mt: 0.7, color: "text.secondary", fontWeight: 500 }}
            >
              {slot.type === "FULL_DAY"
                ? "Full-day access window"
                : "Fixed booking period"}
            </Typography>
          </Box>

          <IconButton
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            disabled={statusUpdating}
            size="small"
            sx={{
              mt: -0.4,
              mr: -0.5,
              border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              bgcolor: alpha(theme.palette.background.default, 0.5),
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                borderColor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            {statusUpdating ? <CircularProgress size={19} /> : <MoreVert />}
          </IconButton>

          <Menu
            anchorEl={menuAnchor}
            open={menuOpen}
            onClose={closeMenu}
            slotProps={{
              paper: {
                sx: {
                  mt: 1,
                  minWidth: 180,
                  borderRadius: 2.5,
                  border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                  boxShadow: `0 18px 45px ${alpha(
                    theme.palette.common.black,
                    0.14,
                  )}`,
                },
              },
            }}
          >
            <MenuItem
              onClick={() => {
                closeMenu();
                onEdit(slot);
              }}
            >
              <Edit fontSize="small" sx={{ mr: 1.5 }} />
              Edit details
            </MenuItem>

            <MenuItem
              disabled={statusUpdating}
              onClick={() => {
                closeMenu();
                onToggleStatus(slot);
              }}
            >
              <CheckCircle fontSize="small" sx={{ mr: 1.5 }} />
              {active ? "Deactivate" : "Activate"}
            </MenuItem>

            <Divider sx={{ my: 0.5 }} />

            <MenuItem
              sx={{ color: "error.main" }}
              onClick={() => {
                closeMenu();
                onDelete(slot);
              }}
            >
              <DeleteOutlineOutlined fontSize="small" sx={{ mr: 1.5 }} />
              Delete slot
            </MenuItem>
          </Menu>
        </Stack>

        <Box
          sx={{
            mt: 2.7,
            p: 2.25,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, active ? 0.07 : 0.035),
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
              }}
            >
              <AccessTime />
            </Box>

            <Box minWidth={0}>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  color: "text.secondary",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Operating period
              </Typography>

              <Typography
                variant="h6"
                sx={{ mt: 0.25, fontWeight: 800, letterSpacing: "-0.02em" }}
              >
                {formatTime(slot.startTime)}
                <Box
                  component="span"
                  sx={{ color: "text.disabled", px: 0.9, fontWeight: 500 }}
                >
                  →
                </Box>
                {formatTime(slot.endTime)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ mt: 2.1 }}
        >
          <Chip
            icon={<Schedule />}
            label={slot.type === "FULL_DAY" ? "Full Day" : "Fixed"}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 999, fontWeight: 650 }}
          />

          <Chip
            icon={<Timelapse />}
            label={formatDuration(duration)}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 999, fontWeight: 650 }}
          />

          <Chip
            icon={<AccessTime />}
            label={`${slot.breakMinutes ?? 0} min break`}
            size="small"
            variant="outlined"
            sx={{ borderRadius: 999, fontWeight: 650 }}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SLOT MANAGEMENT
// ============================================================

function SlotManagement() {
  const theme = useTheme();

  // ========================================================
  // LIBRARY STATE
  // ========================================================

  const [libraries, setLibraries] = useState([]);
  const [libraryId, setLibraryId] = useState("");
  const [loadingLibraries, setLoadingLibraries] = useState(true);

  // ========================================================
  // SLOT STATE
  // ========================================================

  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ========================================================
  // UI STATE
  // ========================================================

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState(createEmptySlot());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // ========================================================
  // CALCULATED VALUES
  // ========================================================

  const activeSlots = useMemo(
    () => slots.filter((slot) => Boolean(slot.active)),
    [slots],
  );

  const inactiveSlots = slots.length - activeSlots.length;

  const selectedLibrary = useMemo(
    () =>
      libraries.find((library) => String(library.id) === String(libraryId)) ??
      null,
    [libraries, libraryId],
  );

  // ========================================================
  // LOAD LIBRARIES
  // ========================================================

  const loadLibraries = useCallback(async () => {
    try {
      setLoadingLibraries(true);
      setError("");

      const data = await libraryApi.getMyLibraries();
      const libraryList = Array.isArray(data) ? data : [];

      setLibraries(libraryList);

      if (libraryList.length === 0) {
        setLibraryId("");
        setSlots([]);
        return;
      }

      setLibraryId((currentLibraryId) => {
        const exists = libraryList.some(
          (library) => String(library.id) === String(currentLibraryId),
        );

        if (exists) {
          return currentLibraryId;
        }

        return String(libraryList[0].id);
      });
    } catch (err) {
      console.error("Failed to load libraries:", err);

      setLibraries([]);
      setLibraryId("");
      setSlots([]);
      setError(getErrorMessage(err, "Unable to load your libraries."));
    } finally {
      setLoadingLibraries(false);
    }
  }, []);

  // ========================================================
  // LOAD SLOTS
  // ========================================================

  const loadSlots = useCallback(async () => {
    if (!libraryId) {
      setSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);
      setError("");

      const data = await slotApi.getSlots(libraryId);
      setSlots(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load slots:", err);

      setSlots([]);
      setError(getErrorMessage(err, "Unable to load booking slots."));
    } finally {
      setLoadingSlots(false);
    }
  }, [libraryId]);

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (libraryId) {
      loadSlots();
    } else {
      setSlots([]);
    }
  }, [libraryId, loadSlots]);

  // ========================================================
  // FORM CHANGE
  // ========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setDialogError("");
  };

  // ========================================================
  // OPEN ADD
  // ========================================================

  const handleOpenAdd = () => {
    if (!libraryId) {
      setError("Please select a library first.");
      return;
    }

    setEditingSlot(null);
    setForm(createEmptySlot());
    setDialogError("");
    setSuccess("");
    setDialogOpen(true);
  };

  // ========================================================
  // OPEN EDIT
  // ========================================================

  const handleOpenEdit = (slot) => {
    setEditingSlot(slot);

    setForm({
      name: slot.name ?? "",
      type: slot.type ?? "FIXED",
      startTime: normalizeTime(slot.startTime),
      endTime: normalizeTime(slot.endTime),
      breakMinutes: slot.breakMinutes ?? 0,
      active: Boolean(slot.active),
    });

    setDialogError("");
    setSuccess("");
    setDialogOpen(true);
  };

  // ========================================================
  // CLOSE ADD / EDIT
  // ========================================================

  const handleCloseDialog = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
    setEditingSlot(null);
    setForm(createEmptySlot());
    setDialogError("");
  };

  // ========================================================
  // BUILD REQUEST
  // ========================================================

  const buildSlotPayload = () => ({
    name: form.name.trim(),
    type: form.type,
    startTime: form.startTime,
    endTime: form.endTime,
    breakMinutes: Number(form.breakMinutes ?? 0),
    active: Boolean(form.active),
  });

  // ========================================================
  // SAVE SLOT
  // ========================================================

  const handleSaveSlot = async () => {
    if (!libraryId) {
      setDialogError("Please select a library.");
      return;
    }

    const name = form.name.trim();
    const breakMinutes = Number(form.breakMinutes);

    if (!name) {
      setDialogError("Slot name is required.");
      return;
    }

    if (!form.type) {
      setDialogError("Slot type is required.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setDialogError("Start time and end time are required.");
      return;
    }

    if (!validateTimeRange(form.startTime, form.endTime)) {
      setDialogError("End time must be later than start time.");
      return;
    }

    if (Number.isNaN(breakMinutes) || breakMinutes < 0) {
      setDialogError("Break time cannot be negative.");
      return;
    }

    try {
      setSaving(true);
      setDialogError("");
      setError("");
      setSuccess("");

      const payload = buildSlotPayload();

      if (editingSlot) {
        await slotApi.updateSlot(libraryId, editingSlot.id, payload);
        setSuccess("Slot updated successfully.");
      } else {
        await slotApi.createSlot(libraryId, payload);
        setSuccess("Slot created successfully.");
      }

      await loadSlots();

      setDialogOpen(false);
      setEditingSlot(null);
      setForm(createEmptySlot());
    } catch (err) {
      console.error("Failed to save slot:", err);
      setDialogError(getErrorMessage(err, "Unable to save booking slot."));
    } finally {
      setSaving(false);
    }
  };

  // ========================================================
  // ACTIVATE / DEACTIVATE
  // ========================================================

  const handleToggleStatus = async (slot) => {
    if (!libraryId || !slot?.id) {
      return;
    }

    try {
      setStatusUpdatingId(slot.id);
      setError("");
      setSuccess("");

      if (Boolean(slot.active)) {
        await slotApi.deactivateSlot(libraryId, slot.id);
        setSuccess(`${slot.name} deactivated successfully.`);
      } else {
        await slotApi.activateSlot(libraryId, slot.id);
        setSuccess(`${slot.name} activated successfully.`);
      }

      await loadSlots();
    } catch (err) {
      console.error("Failed to update slot status:", err);
      setError(getErrorMessage(err, "Unable to update slot status."));
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // ========================================================
  // DELETE
  // ========================================================

  const handleOpenDelete = (slot) => {
    setSelectedSlot(slot);
    setDeleteDialogOpen(true);
    setError("");
    setSuccess("");
  };

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setSelectedSlot(null);
    setDeleteDialogOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedSlot || !libraryId) {
      return;
    }

    const slotName = selectedSlot.name;

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      await slotApi.deleteSlot(libraryId, selectedSlot.id);
      await loadSlots();

      setDeleteDialogOpen(false);
      setSelectedSlot(null);
      setSuccess(`${slotName} deleted successfully.`);
    } catch (err) {
      console.error("Failed to delete slot:", err);
      setError(getErrorMessage(err, "Unable to delete booking slot."));
    } finally {
      setDeleting(false);
    }
  };

  // ========================================================
  // REFRESH
  // ========================================================

  const handleRefresh = async () => {
    setError("");
    setSuccess("");
    await loadSlots();
  };

  // ========================================================
  // RENDER
  // ========================================================

  return (
    <Box
      sx={{
        pb: 5,
        minHeight: "100%",
      }}
    >
      {/* ======================================================
          LIGHT PREMIUM HERO HEADER
         ====================================================== */}

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: { xs: 3.5, md: 5 },
          px: { xs: 2.5, sm: 3.5, md: 4 },
          py: { xs: 2.6, md: 3.1 },
          mb: 3,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.075,
          )} 0%, ${theme.palette.background.paper} 52%, ${alpha(
            theme.palette.info.light,
            0.16,
          )} 100%)`,
          boxShadow: `0 16px 42px ${alpha(theme.palette.common.black, 0.045)}`,
          "&::before": {
            content: '""',
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            right: -55,
            top: -105,
            bgcolor: alpha(theme.palette.primary.main, 0.055),
          },
          "&::after": {
            content: '""',
            position: "absolute",
            width: 155,
            height: 155,
            borderRadius: "50%",
            right: 78,
            bottom: -118,
            bgcolor: alpha(theme.palette.info.main, 0.04),
          },
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          spacing={2.5}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            <Box
              sx={{
                width: { xs: 56, md: 64 },
                height: { xs: 56, md: 64 },
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "common.white",
                bgcolor: "primary.main",
                boxShadow: `0 10px 24px ${alpha(
                  theme.palette.primary.main,
                  0.22,
                )}`,
              }}
            >
              <Schedule sx={{ fontSize: { xs: 28, md: 31 } }} />
            </Box>

            <Box minWidth={0}>
              <Stack
                direction="row"
                spacing={0.8}
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <AutoAwesome
                  sx={{ fontSize: 16, color: "primary.main", opacity: 0.9 }}
                />

                <Typography
                  variant="overline"
                  sx={{
                    color: "primary.main",
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    lineHeight: 1,
                  }}
                >
                  Library operations
                </Typography>
              </Stack>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  letterSpacing: "-0.035em",
                  lineHeight: 1.15,
                  fontSize: { xs: "1.65rem", md: "2rem" },
                }}
              >
                Slot Management
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.65,
                  maxWidth: 680,
                  color: "text.secondary",
                  lineHeight: 1.65,
                }}
              >
                Configure booking windows, operating periods, breaks and
                availability for your library.
              </Typography>

              {selectedLibrary && (
                <Chip
                  icon={<EventAvailable />}
                  label={selectedLibrary.name}
                  size="small"
                  variant="outlined"
                  sx={{
                    mt: 1.45,
                    height: 28,
                    fontWeight: 700,
                    color: "text.primary",
                    bgcolor: alpha(theme.palette.background.paper, 0.84),
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                    "& .MuiChip-icon": { color: "primary.main" },
                  }}
                />
              )}
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={1.2}
            width={{ xs: "100%", md: "auto" }}
          >
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleRefresh}
              disabled={!libraryId || loadingSlots}
              sx={{
                flex: { xs: 1, md: "initial" },
                minHeight: 44,
                px: 2.3,
                fontWeight: 700,
                bgcolor: alpha(theme.palette.background.paper, 0.82),
                borderColor: alpha(theme.palette.primary.main, 0.28),
                boxShadow: "none",
                "&:hover": {
                  bgcolor: "background.paper",
                  borderColor: "primary.main",
                },
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenAdd}
              disabled={!libraryId || loadingLibraries}
              sx={{
                flex: { xs: 1, md: "initial" },
                minHeight: 44,
                px: 2.5,
                fontWeight: 800,
                boxShadow: `0 10px 22px ${alpha(
                  theme.palette.primary.main,
                  0.2,
                )}`,
                "&:hover": {
                  boxShadow: `0 12px 26px ${alpha(
                    theme.palette.primary.main,
                    0.26,
                  )}`,
                },
              }}
            >
              Add Slot
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ======================================================
          ALERTS
         ====================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {success}
        </Alert>
      )}

      {/* ======================================================
          LIBRARY SELECTOR
         ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3.5,
          border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          boxShadow: `0 12px 30px ${alpha(theme.palette.common.black, 0.045)}`,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.2, md: 2.7 },
            "&:last-child": { pb: { xs: 2.2, md: 2.7 } },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.6, md: 3 }}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Box minWidth={{ md: 240 }}>
              <Typography fontWeight={800}>Working library</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.25}>
                Slots shown below belong to the selected location.
              </Typography>
            </Box>

            <FormControl
              fullWidth
              size="small"
              disabled={loadingLibraries || libraries.length === 0}
            >
              <InputLabel>Library</InputLabel>

              <Select
                value={libraryId}
                label="Library"
                onChange={(event) => {
                  setError("");
                  setSuccess("");
                  setSlots([]);
                  setLibraryId(event.target.value);
                }}
                sx={{ borderRadius: 2.3 }}
              >
                {libraries.map((library) => (
                  <MenuItem key={library.id} value={String(library.id)}>
                    {library.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          SUMMARY
         ====================================================== */}

      <Grid container spacing={2.2} mb={3.2}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<Schedule />}
            label="Total Slots"
            value={slots.length}
            caption="Configured booking windows"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<CheckCircle />}
            label="Active Slots"
            value={activeSlots.length}
            caption="Available for booking"
            tone="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard
            icon={<AccessTime />}
            label="Inactive Slots"
            value={inactiveSlots}
            caption="Currently hidden from booking"
            tone="neutral"
          />
        </Grid>
      </Grid>

      {/* ======================================================
          CONTENT HEADING
         ====================================================== */}

      {!loadingSlots && slots.length > 0 && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          mb={2}
        >
          <Box>
            <Typography
              variant="h6"
              sx={{ fontWeight: 850, letterSpacing: "-0.025em" }}
            >
              Your booking windows
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={0.2}>
              Manage time ranges, breaks and slot availability.
            </Typography>
          </Box>

          <Chip
            label={`${activeSlots.length} active of ${slots.length}`}
            size="small"
            variant="outlined"
            sx={{ fontWeight: 700, borderRadius: 999 }}
          />
        </Stack>
      )}

      {/* ======================================================
          LOADING
         ====================================================== */}

      {loadingSlots && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: `1px solid ${alpha(theme.palette.divider, 0.75)}`,
          }}
        >
          <CardContent sx={{ py: 9, textAlign: "center" }}>
            <CircularProgress size={34} thickness={4.5} />

            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading booking slots...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          SLOT LIST
         ====================================================== */}

      {!loadingSlots && slots.length > 0 && (
        <Grid container spacing={2.5}>
          {slots.map((slot) => (
            <Grid
              key={slot.id}
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <SlotCard
                slot={slot}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onToggleStatus={handleToggleStatus}
                statusUpdating={statusUpdatingId === slot.id}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* ======================================================
          EMPTY STATE
         ====================================================== */}

      {!loadingSlots && libraryId && slots.length === 0 && (
        <Card
          elevation={0}
          sx={{
            mt: 1,
            overflow: "hidden",
            borderRadius: 4,
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.28)}`,
            background: `linear-gradient(160deg, ${alpha(
              theme.palette.primary.main,
              0.04,
            )}, ${theme.palette.background.paper})`,
          }}
        >
          <CardContent sx={{ py: { xs: 7, md: 9 }, textAlign: "center" }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                mx: "auto",
                mb: 2.2,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
              }}
            >
              <Schedule sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h5" fontWeight={850} letterSpacing="-0.03em">
              Create your first booking slot
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              mt={0.8}
              mx="auto"
              maxWidth={480}
              lineHeight={1.7}
            >
              Define when members can reserve seats. You can create morning,
              afternoon, evening or full-day booking windows.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              sx={{ mt: 2.5, px: 3, fontWeight: 800, borderRadius: 2.2 }}
              onClick={handleOpenAdd}
            >
              Create Slot
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ======================================================
          NO LIBRARY
         ====================================================== */}

      {!loadingLibraries && libraries.length === 0 && (
        <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
          No library is associated with your account.
        </Alert>
      )}

      {/* ======================================================
          ADD / EDIT DIALOG
         ====================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
            boxShadow: `0 30px 80px ${alpha(theme.palette.common.black, 0.2)}`,
          },
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            pt: 3.2,
            pb: 2.5,
            background: `linear-gradient(145deg, ${alpha(
              theme.palette.primary.main,
              0.09,
            )}, ${theme.palette.background.paper} 72%)`,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
              }}
            >
              {editingSlot ? <Edit /> : <Add />}
            </Box>

            <Box>
              <DialogTitle
                sx={{ p: 0, fontWeight: 850, letterSpacing: "-0.03em" }}
              >
                {editingSlot ? "Edit Booking Slot" : "Create Booking Slot"}
              </DialogTitle>

              <Typography variant="body2" color="text.secondary" mt={0.35}>
                {editingSlot
                  ? "Refine this booking window without changing the rest of your schedule."
                  : "Set the time window members will see while booking a seat."}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, pt: 3 }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.2 }}>
              {dialogError}
            </Alert>
          )}

          <Stack spacing={2.8}>
            <Grid container spacing={2.2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Slot Name"
                  name="name"
                  placeholder="e.g. Morning Slot"
                  value={form.name}
                  onChange={handleChange}
                  disabled={saving}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required disabled={saving}>
                  <InputLabel>Slot Type</InputLabel>

                  <Select
                    label="Slot Type"
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                  >
                    <MenuItem value="FIXED">Fixed</MenuItem>
                    <MenuItem value="FULL_DAY">Full Day</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Start Time"
                  name="startTime"
                  type="time"
                  value={form.startTime}
                  onChange={handleChange}
                  disabled={saving}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="End Time"
                  name="endTime"
                  type="time"
                  value={form.endTime}
                  onChange={handleChange}
                  disabled={saving}
                  slotProps={{
                    inputLabel: {
                      shrink: true,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Break Time"
                  name="breakMinutes"
                  type="number"
                  value={form.breakMinutes}
                  onChange={handleChange}
                  disabled={saving}
                  helperText="Break between booking periods in minutes."
                  slotProps={{
                    htmlInput: {
                      min: 0,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    height: "100%",
                    minHeight: 56,
                    px: 2,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                    bgcolor: alpha(theme.palette.background.default, 0.45),
                  }}
                >
                  <FormControlLabel
                    control={
                      <Switch
                        checked={Boolean(form.active)}
                        disabled={saving}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            active: event.target.checked,
                          }))
                        }
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={750}>
                          Active for booking
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Members can select this slot immediately.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{
                p: 2.2,
                borderRadius: 2.7,
                bgcolor: alpha(theme.palette.primary.main, 0.055),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                spacing={1.2}
              >
                <Box>
                  <Typography variant="body2" fontWeight={800}>
                    Live preview
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    How this timing will appear in your schedule.
                  </Typography>
                </Box>

                <Typography
                  variant="body1"
                  sx={{ fontWeight: 850, color: "primary.main" }}
                >
                  {formatTime(form.startTime)} → {formatTime(form.endTime)}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 2.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{ fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveSlot}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : undefined
            }
            sx={{ px: 2.5, fontWeight: 800, borderRadius: 2 }}
          >
            {saving
              ? "Saving..."
              : editingSlot
                ? "Save Changes"
                : "Create Slot"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          DELETE CONFIRMATION
         ====================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            boxShadow: `0 28px 70px ${alpha(theme.palette.common.black, 0.2)}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 850, letterSpacing: "-0.025em" }}>
          Delete Booking Slot?
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
            Are you sure you want to delete{" "}
            <strong>{selectedSlot?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleCloseDelete} disabled={deleting}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={
              deleting ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteOutlineOutlined />
              )
            }
            onClick={handleDelete}
            disabled={deleting}
            sx={{ fontWeight: 800, borderRadius: 2 }}
          >
            {deleting ? "Deleting..." : "Delete Slot"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SlotManagement;
