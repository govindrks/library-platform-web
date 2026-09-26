import {
    AccessTime,
    Add,
    CheckCircle,
    DeleteOutline,
    Edit,
    EventSeat,
    MoreVert,
    Schedule,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
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

import { useState } from "react";

const createEmptySlot = () => ({
    name: "",
    type: "FIXED",
    startTime: "06:00",
    endTime: "10:00",
    duration: 4,
    durationUnit: "HOUR",
    breakTime: 15,
    maxBookings: 40,
    status: "ACTIVE",
});

const initialSlots = [
    {
        id: 1,
        name: "Morning Slot",
        type: "FIXED",
        startTime: "06:00",
        endTime: "10:00",
        duration: 4,
        durationUnit: "HOUR",
        breakTime: 15,
        maxBookings: 40,
        status: "ACTIVE",
    },
    {
        id: 2,
        name: "Afternoon Slot",
        type: "FIXED",
        startTime: "10:00",
        endTime: "14:00",
        duration: 4,
        durationUnit: "HOUR",
        breakTime: 15,
        maxBookings: 40,
        status: "ACTIVE",
    },
    {
        id: 3,
        name: "Evening Slot",
        type: "FIXED",
        startTime: "14:00",
        endTime: "18:00",
        duration: 4,
        durationUnit: "HOUR",
        breakTime: 15,
        maxBookings: 40,
        status: "ACTIVE",
    },
    {
        id: 4,
        name: "Night Slot",
        type: "FIXED",
        startTime: "18:00",
        endTime: "23:00",
        duration: 5,
        durationUnit: "HOUR",
        breakTime: 15,
        maxBookings: 40,
        status: "ACTIVE",
    },
];

function formatTime(time) {
    if (!time) return "-";

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

function validateTimeRange(startTime, endTime) {
    if (!startTime || !endTime) {
        return false;
    }

    return startTime < endTime;
}

function SlotCard({
    slot,
    onEdit,
    onDelete,
    onToggleStatus,
}) {
    const [menuAnchor, setMenuAnchor] = useState(null);

    const menuOpen = Boolean(menuAnchor);

    const closeMenu = () => {
        setMenuAnchor(null);
    };

    return (
        <Card
            sx={{
                height: "100%",
                opacity:
                    slot.status === "ACTIVE"
                        ? 1
                        : 0.65,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {slot.name}
                            </Typography>

                            <Chip
                                label={
                                    slot.status === "ACTIVE"
                                        ? "Active"
                                        : "Inactive"
                                }
                                size="small"
                                color={
                                    slot.status === "ACTIVE"
                                        ? "success"
                                        : "default"
                                }
                                variant="outlined"
                            />
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.75}
                        >
                            {slot.type === "HOURLY"
                                ? "Hourly booking"
                                : slot.type === "FULL_DAY"
                                    ? "Full day access"
                                    : "Fixed duration"}
                        </Typography>
                    </Box>

                    <IconButton
                        onClick={(event) =>
                            setMenuAnchor(event.currentTarget)
                        }
                    >
                        <MoreVert />
                    </IconButton>
                </Stack>

                <Menu
                    anchorEl={menuAnchor}
                    open={menuOpen}
                    onClose={closeMenu}
                >
                    <MenuItem
                        onClick={() => {
                            closeMenu();
                            onEdit(slot);
                        }}
                    >
                        <Edit
                            fontSize="small"
                            sx={{ mr: 1.5 }}
                        />
                        Edit
                    </MenuItem>

                    <MenuItem
                        onClick={() => {
                            closeMenu();
                            onToggleStatus(slot);
                        }}
                    >
                        <CheckCircle
                            fontSize="small"
                            sx={{ mr: 1.5 }}
                        />

                        {slot.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                    </MenuItem>

                    <MenuItem
                        sx={{ color: "error.main" }}
                        onClick={() => {
                            closeMenu();
                            onDelete(slot);
                        }}
                    >
                        <DeleteOutline
                            fontSize="small"
                            sx={{ mr: 1.5 }}
                        />

                        Delete
                    </MenuItem>
                </Menu>

                <Divider sx={{ my: 2.5 }} />

                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "primary.light",
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                    >
                        <AccessTime color="primary" />

                        <Box>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Operating period
                            </Typography>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {formatTime(slot.startTime)} -{" "}
                                {formatTime(slot.endTime)}
                            </Typography>
                        </Box>
                    </Stack>
                </Box>

                <Stack spacing={1.5} mt={2.5}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Schedule
                                fontSize="small"
                                color="action"
                            />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Duration
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                        >
                            {slot.duration}{" "}
                            {slot.durationUnit === "HOUR"
                                ? slot.duration === 1
                                    ? "hour"
                                    : "hours"
                                : slot.duration === 1
                                    ? "minute"
                                    : "minutes"}
                        </Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <AccessTime
                                fontSize="small"
                                color="action"
                            />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Break time
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                        >
                            {slot.breakTime} min
                        </Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        justifyContent="space-between"
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <EventSeat
                                fontSize="small"
                                color="action"
                            />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Maximum bookings
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                        >
                            {slot.maxBookings}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

function SlotManagement() {
    const [slots, setSlots] = useState(initialSlots);

    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [editingSlot, setEditingSlot] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);

    const [form, setForm] = useState(createEmptySlot());

    const [saved, setSaved] = useState(false);
    const [error, setError] = useState("");

    const activeSlots = slots.filter(
        (slot) => slot.status === "ACTIVE"
    );

    const dailyCapacity = activeSlots.reduce(
        (total, slot) =>
            total + Number(slot.maxBookings || 0),
        0
    );

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSaved(false);
        setError("");
    };

    const handleOpenAdd = () => {
        setEditingSlot(null);
        setForm(createEmptySlot());
        setError("");
        setSaved(false);
        setDialogOpen(true);
    };

    const handleOpenEdit = (slot) => {
        setEditingSlot(slot);

        setForm({
            name: slot.name,
            type: slot.type,
            startTime: slot.startTime,
            endTime: slot.endTime,
            duration: slot.duration,
            durationUnit: slot.durationUnit,
            breakTime: slot.breakTime,
            maxBookings: slot.maxBookings,
            status: slot.status,
        });

        setError("");
        setSaved(false);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingSlot(null);
        setForm(createEmptySlot());
        setError("");
    };

    const handleSaveSlot = () => {
        const name = form.name.trim();
        const duration = Number(form.duration);
        const breakTime = Number(form.breakTime);
        const maxBookings = Number(form.maxBookings);

        if (!name) {
            setError("Slot name is required.");
            return;
        }

        if (!form.startTime || !form.endTime) {
            setError(
                "Start time and end time are required."
            );
            return;
        }

        if (
            !validateTimeRange(
                form.startTime,
                form.endTime
            )
        ) {
            setError(
                "End time must be later than start time."
            );
            return;
        }

        if (!duration || duration <= 0) {
            setError(
                "Slot duration must be greater than 0."
            );
            return;
        }

        if (breakTime < 0) {
            setError(
                "Break time cannot be negative."
            );
            return;
        }

        if (!maxBookings || maxBookings <= 0) {
            setError(
                "Maximum bookings must be greater than 0."
            );
            return;
        }

        const slotData = {
            name,
            type: form.type,
            startTime: form.startTime,
            endTime: form.endTime,
            duration,
            durationUnit: form.durationUnit,
            breakTime,
            maxBookings,
            status: form.status,
        };

        if (editingSlot) {
            setSlots((previous) =>
                previous.map((slot) =>
                    slot.id === editingSlot.id
                        ? {
                            ...slot,
                            ...slotData,
                        }
                        : slot
                )
            );
        } else {
            setSlots((previous) => [
                ...previous,
                {
                    id: Date.now(),
                    ...slotData,
                },
            ]);
        }

        handleCloseDialog();
        setSaved(true);
    };

    const handleToggleStatus = (slot) => {
        setSlots((previous) =>
            previous.map((item) =>
                item.id === slot.id
                    ? {
                        ...item,
                        status:
                            item.status === "ACTIVE"
                                ? "INACTIVE"
                                : "ACTIVE",
                    }
                    : item
            )
        );

        setSaved(true);
    };

    const handleOpenDelete = (slot) => {
        setSelectedSlot(slot);
        setDeleteDialogOpen(true);
    };

    const handleCloseDelete = () => {
        setSelectedSlot(null);
        setDeleteDialogOpen(false);
    };

    const handleDelete = () => {
        if (!selectedSlot) return;

        setSlots((previous) =>
            previous.filter(
                (slot) =>
                    slot.id !== selectedSlot.id
            )
        );

        handleCloseDelete();
        setSaved(true);
    };

    return (
        <Box>
            {/* Page Header */}
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
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Slot Management
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Configure booking slots and
                        operating periods for your
                        library.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenAdd}
                >
                    Add Slot
                </Button>
            </Stack>

            {/* Alerts */}
            {saved && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setSaved(false)}
                >
                    Slot configuration has been
                    updated successfully.
                </Alert>
            )}

            {/* Summary */}
            <Grid container spacing={2} mb={3}>
                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor:
                                            "primary.light",
                                        color:
                                            "primary.main",
                                    }}
                                >
                                    <Schedule />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total Slots
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {slots.length}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor:
                                            "success.light",
                                        color:
                                            "success.main",
                                    }}
                                >
                                    <CheckCircle />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Active Slots
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {activeSlots.length}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        bgcolor: "info.light",
                                        color: "info.main",
                                    }}
                                >
                                    <EventSeat />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Daily Capacity
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {dailyCapacity}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Slot List */}
            {slots.length > 0 && (
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
                                onToggleStatus={
                                    handleToggleStatus
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Empty State */}
            {slots.length === 0 && (
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

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            No slots configured
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.5}
                        >
                            Create your first booking
                            slot to start accepting
                            reservations.
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

            {/* Add / Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    {editingSlot
                        ? "Edit Booking Slot"
                        : "Add Booking Slot"}
                </DialogTitle>

                <DialogContent>
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2, mt: 1 }}
                        >
                            {error}
                        </Alert>
                    )}

                    <Stack spacing={2.5} mt={1}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Slot Name"
                                    name="name"
                                    placeholder="e.g. Morning Slot"
                                    value={form.name}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Slot Type
                                    </InputLabel>

                                    <Select
                                        label="Slot Type"
                                        name="type"
                                        value={form.type}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="HOURLY">
                                            Hourly
                                        </MenuItem>

                                        <MenuItem value="FIXED">
                                            Fixed Duration
                                        </MenuItem>

                                        <MenuItem value="FULL_DAY">
                                            Full Day
                                        </MenuItem>
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
                                    label="Slot Duration"
                                    name="duration"
                                    type="number"
                                    value={form.duration}
                                    onChange={handleChange}
                                    slotProps={{
                                        htmlInput: {
                                            min: 1,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>
                                        Duration Unit
                                    </InputLabel>

                                    <Select
                                        label="Duration Unit"
                                        name="durationUnit"
                                        value={
                                            form.durationUnit
                                        }
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="MINUTE">
                                            Minutes
                                        </MenuItem>

                                        <MenuItem value="HOUR">
                                            Hours
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    label="Break Time"
                                    name="breakTime"
                                    type="number"
                                    value={form.breakTime}
                                    onChange={handleChange}
                                    helperText="Break between bookings in minutes."
                                    slotProps={{
                                        htmlInput: {
                                            min: 0,
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <TextField
                                    fullWidth
                                    required
                                    label="Maximum Bookings"
                                    name="maxBookings"
                                    type="number"
                                    value={form.maxBookings}
                                    onChange={handleChange}
                                    helperText="Maximum seats/bookings available for this slot."
                                    slotProps={{
                                        htmlInput: {
                                            min: 1,
                                        },
                                    }}
                                />
                            </Grid>

                            {editingSlot && (
                                <Grid size={{ xs: 12 }}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                checked={
                                                    form.status ===
                                                    "ACTIVE"
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setForm(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            status:
                                                                event
                                                                    .target
                                                                    .checked
                                                                    ? "ACTIVE"
                                                                    : "INACTIVE",
                                                        })
                                                    )
                                                }
                                            />
                                        }
                                        label="Slot is active"
                                    />
                                </Grid>
                            )}
                        </Grid>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2.5,
                    }}
                >
                    <Button onClick={handleCloseDialog}>
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSaveSlot}
                    >
                        {editingSlot
                            ? "Save Changes"
                            : "Create Slot"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDelete}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Delete Booking Slot?
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Are you sure you want to delete{" "}
                        <strong>
                            {selectedSlot?.name}
                        </strong>
                        ? This action cannot be undone.
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2.5,
                    }}
                >
                    <Button onClick={handleCloseDelete}>
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        startIcon={<DeleteOutline />}
                        onClick={handleDelete}
                    >
                        Delete Slot
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SlotManagement;