import {
  AccessTime,
  Add,
  CheckCircle,
  DeleteOutlineOutlined,
  Edit,
  MoreVert,
  Refresh,
  Schedule,
} from "@mui/icons-material";

import {
  Alert,
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
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";

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
// FORMAT TIME
// ============================================================

function formatTime(time) {
  if (!time) {
    return "-";
  }

  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(Number(hours));
  date.setMinutes(Number(minutes));
  date.setSeconds(0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ============================================================
// VALIDATE TIME RANGE
// ============================================================

function validateTimeRange(startTime, endTime) {
  if (!startTime || !endTime) {
    return false;
  }

  return startTime < endTime;
}

// ============================================================
// NORMALIZE TIME FROM BACKEND
// ============================================================

function normalizeTime(time) {
  if (!time) {
    return "";
  }

  /*
   * Backend LocalTime may return:
   *
   * 06:00
   * or
   * 06:00:00
   *
   * HTML time input needs HH:mm.
   */
  return String(time).substring(0, 5);
}

// ============================================================
// ERROR MESSAGE
// ============================================================

function getErrorMessage(error, fallback) {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return responseData?.message || responseData?.error || fallback;
}

// ============================================================
// SLOT CARD
// ============================================================

function SlotCard({ slot, onEdit, onDelete, onToggleStatus, statusUpdating }) {
  const [menuAnchor, setMenuAnchor] = useState(null);

  const menuOpen = Boolean(menuAnchor);

  const closeMenu = () => {
    setMenuAnchor(null);
  };

  const active = Boolean(slot.active);

  return (
    <Card
      sx={{
        height: "100%",
        opacity: active ? 1 : 0.65,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" fontWeight={700}>
                {slot.name}
              </Typography>

              <Chip
                label={active ? "Active" : "Inactive"}
                size="small"
                color={active ? "success" : "default"}
                variant="outlined"
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" mt={0.75}>
              {slot.type === "FULL_DAY"
                ? "Full day access"
                : "Fixed booking period"}
            </Typography>
          </Box>

          <IconButton
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            disabled={statusUpdating}
          >
            <MoreVert />
          </IconButton>

          <Menu anchorEl={menuAnchor} open={menuOpen} onClose={closeMenu}>
            <MenuItem
              onClick={() => {
                closeMenu();
                onEdit(slot);
              }}
            >
              <Edit fontSize="small" sx={{ mr: 1.5 }} />
              Edit
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

            <MenuItem
              sx={{
                color: "error.main",
              }}
              onClick={() => {
                closeMenu();
                onDelete(slot);
              }}
            >
              <DeleteOutlineOutlined fontSize="small" sx={{ mr: 1.5 }} />
              Delete
            </MenuItem>
          </Menu>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        {/* Operating period */}

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            backgroundColor: "primary.light",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AccessTime color="primary" />

            <Box>
              <Typography variant="body2" color="text.secondary">
                Operating period
              </Typography>

              <Typography variant="h6" fontWeight={700}>
                {formatTime(slot.startTime)}
                {" - "}
                {formatTime(slot.endTime)}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Slot details */}

        <Stack spacing={1.5} mt={2.5}>
          <Stack direction="row" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <Schedule fontSize="small" color="action" />

              <Typography variant="body2" color="text.secondary">
                Slot type
              </Typography>
            </Stack>

            <Typography variant="body2" fontWeight={600}>
              {slot.type === "FULL_DAY" ? "Full Day" : "Fixed"}
            </Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <AccessTime fontSize="small" color="action" />

              <Typography variant="body2" color="text.secondary">
                Break time
              </Typography>
            </Stack>

            <Typography variant="body2" fontWeight={600}>
              {slot.breakMinutes ?? 0} min
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SLOT MANAGEMENT
// ============================================================

function SlotManagement() {
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

  const activeSlots = slots.filter((slot) => Boolean(slot.active));

  const inactiveSlots = slots.length - activeSlots.length;

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

      /*
       * Keep the current library if it
       * still belongs to this owner.
       *
       * Otherwise select the first one.
       */
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

  // ========================================================
  // LOAD SLOTS WHEN LIBRARY CHANGES
  // ========================================================

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

    // ------------------------------------------------
    // FRONTEND VALIDATION
    // ------------------------------------------------

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

      /*
       * Always reload from backend.
       *
       * PostgreSQL remains the source
       * of truth.
       */
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
  // OPEN DELETE
  // ========================================================

  const handleOpenDelete = (slot) => {
    setSelectedSlot(slot);

    setDeleteDialogOpen(true);

    setError("");
    setSuccess("");
  };

  // ========================================================
  // CLOSE DELETE
  // ========================================================

  const handleCloseDelete = () => {
    if (deleting) {
      return;
    }

    setSelectedSlot(null);

    setDeleteDialogOpen(false);
  };

  // ========================================================
  // DELETE SLOT
  // ========================================================

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
    <Box>
      {/* =================================================
                PAGE HEADER
            ================================================= */}

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
            Slot Management
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Configure booking slots and operating periods for your library.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={!libraryId || loadingSlots}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenAdd}
            disabled={!libraryId || loadingLibraries}
          >
            Add Slot
          </Button>
        </Stack>
      </Stack>

      {/* =================================================
                ALERTS
            ================================================= */}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* =================================================
                LIBRARY SELECTOR
            ================================================= */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
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
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* =================================================
                SUMMARY
            ================================================= */}

      <Grid container spacing={2} mb={3}>
        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card>
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
                  <Schedule />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Total Slots
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {slots.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card>
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
                    bgcolor: "success.light",
                    color: "success.main",
                  }}
                >
                  <CheckCircle />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Active Slots
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {activeSlots.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 4,
          }}
        >
          <Card>
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
                    bgcolor: "action.hover",
                    color: "text.secondary",
                  }}
                >
                  <AccessTime />
                </Box>

                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Inactive Slots
                  </Typography>

                  <Typography variant="h5" fontWeight={700}>
                    {inactiveSlots}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =================================================
                LOADING
            ================================================= */}

      {loadingSlots && (
        <Card>
          <CardContent
            sx={{
              py: 8,
              textAlign: "center",
            }}
          >
            <CircularProgress />

            <Typography variant="body2" color="text.secondary" mt={2}>
              Loading booking slots...
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* =================================================
                SLOT LIST
            ================================================= */}

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

      {/* =================================================
                EMPTY STATE
            ================================================= */}

      {!loadingSlots && libraryId && slots.length === 0 && (
        <Card sx={{ mt: 2 }}>
          <CardContent
            sx={{
              py: 8,
              textAlign: "center",
            }}
          >
            <Schedule
              sx={{
                fontSize: 48,
                color: "text.disabled",
                mb: 2,
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              No slots configured
            </Typography>

            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Create your first booking slot to start accepting reservations.
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{ mt: 2 }}
              onClick={handleOpenAdd}
            >
              Create Slot
            </Button>
          </CardContent>
        </Card>
      )}

      {/* =================================================
                NO LIBRARY
            ================================================= */}

      {!loadingLibraries && libraries.length === 0 && (
        <Alert severity="warning">
          No library is associated with your account.
        </Alert>
      )}

      {/* =================================================
                ADD / EDIT DIALOG
            ================================================= */}

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingSlot ? "Edit Booking Slot" : "Add Booking Slot"}
        </DialogTitle>

        <DialogContent>
          {dialogError && (
            <Alert
              severity="error"
              sx={{
                mb: 2,
                mt: 1,
              }}
            >
              {dialogError}
            </Alert>
          )}

          <Stack spacing={2.5} mt={1}>
            <Grid container spacing={2}>
              {/* Slot name */}

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
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

              {/* Slot type */}

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
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

              {/* Start time */}

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
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

              {/* End time */}

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
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

              {/* Break */}

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
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

              {/* Active switch */}

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
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
                    label="Slot is active"
                  />
                </Box>
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button onClick={handleCloseDialog} disabled={saving}>
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
          >
            {saving
              ? "Saving..."
              : editingSlot
                ? "Save Changes"
                : "Create Slot"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================
                DELETE CONFIRMATION
            ================================================= */}

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Booking Slot?</DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete{" "}
            <strong>{selectedSlot?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
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
          >
            {deleting ? "Deleting..." : "Delete Slot"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SlotManagement;
