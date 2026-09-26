import {
    Add,
    CheckCircle,
    DeleteOutline,
    Edit,
    EventSeat,
    MoreVert,
    People,
    Schedule,
    WorkspacePremium,
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

const initialPlans = [
    {
        id: 1,
        name: "Daily Pass",
        price: 80,
        duration: 1,
        durationUnit: "DAY",
        description:
            "Perfect for students who need a study space for a single day.",
        features: [
            "Full day library access",
            "Seat booking",
            "Wi-Fi access",
            "Reading area access",
        ],
        maxBookings: 1,
        status: "ACTIVE",
    },
    {
        id: 2,
        name: "Monthly",
        price: 1800,
        duration: 1,
        durationUnit: "MONTH",
        description:
            "Unlimited access for regular students and professionals.",
        features: [
            "Unlimited library access",
            "Priority seat booking",
            "Wi-Fi access",
            "Locker access",
        ],
        maxBookings: 30,
        status: "ACTIVE",
    },
    {
        id: 3,
        name: "Quarterly",
        price: 4800,
        duration: 3,
        durationUnit: "MONTH",
        description:
            "Long-term membership with priority access and additional benefits.",
        features: [
            "Unlimited library access",
            "Priority booking",
            "Locker access",
            "Extended access hours",
        ],
        maxBookings: 90,
        status: "ACTIVE",
    },
];

const emptyPlan = {
    name: "",
    price: "",
    duration: 1,
    durationUnit: "MONTH",
    description: "",
    features: "",
    maxBookings: "",
    status: "ACTIVE",
};

function formatDuration(duration, durationUnit) {
    if (durationUnit === "DAY") {
        return `${duration} ${duration === 1 ? "day" : "days"}`;
    }

    if (durationUnit === "MONTH") {
        return `${duration} ${
            duration === 1 ? "month" : "months"
        }`;
    }

    if (durationUnit === "YEAR") {
        return `${duration} ${
            duration === 1 ? "year" : "years"
        }`;
    }

    return `${duration} days`;
}

function PlanCard({
    plan,
    onEdit,
    onDelete,
    onToggleStatus,
}) {
    const [menuAnchor, setMenuAnchor] = useState(null);

    const menuOpen = Boolean(menuAnchor);

    return (
        <Card
            sx={{
                height: "100%",
                position: "relative",
                opacity:
                    plan.status === "ACTIVE" ? 1 : 0.7,
            }}
        >
            <CardContent sx={{ p: 3 }}>
                {/* Header */}

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Box>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            mb={1}
                        >
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {plan.name}
                            </Typography>

                            <Chip
                                label={
                                    plan.status === "ACTIVE"
                                        ? "Active"
                                        : "Inactive"
                                }
                                size="small"
                                color={
                                    plan.status === "ACTIVE"
                                        ? "success"
                                        : "default"
                                }
                                variant="outlined"
                            />
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="baseline"
                        >
                            <Typography
                                variant="h4"
                                fontWeight={700}
                                color="primary.main"
                            >
                                ₹{Number(plan.price).toLocaleString(
                                    "en-IN"
                                )}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                /{" "}
                                {formatDuration(
                                    plan.duration,
                                    plan.durationUnit
                                )}
                            </Typography>
                        </Stack>
                    </Box>

                    <IconButton
                        onClick={(event) =>
                            setMenuAnchor(event.currentTarget)
                        }
                    >
                        <MoreVert />
                    </IconButton>
                </Stack>

                {/* Menu */}

                <Menu
                    anchorEl={menuAnchor}
                    open={menuOpen}
                    onClose={() => setMenuAnchor(null)}
                >
                    <MenuItem
                        onClick={() => {
                            setMenuAnchor(null);
                            onEdit(plan);
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
                            setMenuAnchor(null);
                            onToggleStatus(plan);
                        }}
                    >
                        <CheckCircle
                            fontSize="small"
                            sx={{ mr: 1.5 }}
                        />

                        {plan.status === "ACTIVE"
                            ? "Deactivate"
                            : "Activate"}
                    </MenuItem>

                    <MenuItem
                        sx={{ color: "error.main" }}
                        onClick={() => {
                            setMenuAnchor(null);
                            onDelete(plan);
                        }}
                    >
                        <DeleteOutline
                            fontSize="small"
                            sx={{ mr: 1.5 }}
                        />

                        Delete
                    </MenuItem>
                </Menu>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: 2,
                        minHeight: 42,
                    }}
                >
                    {plan.description}
                </Typography>

                <Divider sx={{ my: 2.5 }} />

                {/* Features */}

                <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    mb={1.5}
                >
                    Plan Benefits
                </Typography>

                <Stack spacing={1}>
                    {plan.features.map((feature) => (
                        <Stack
                            key={feature}
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                        >
                            <CheckCircle
                                sx={{
                                    fontSize: 18,
                                    color: "success.main",
                                    mt: 0.15,
                                }}
                            />

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {feature}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>

                <Divider sx={{ my: 2.5 }} />

                {/* Plan Information */}

                <Stack spacing={1.2}>
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
                                Booking limit
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            fontWeight={600}
                        >
                            {plan.maxBookings || "Unlimited"}
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
                            {formatDuration(
                                plan.duration,
                                plan.durationUnit
                            )}
                        </Typography>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

function MembershipPlans() {
    const [plans, setPlans] = useState(initialPlans);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [editingPlan, setEditingPlan] =
        useState(null);

    const [selectedPlan, setSelectedPlan] =
        useState(null);

    const [form, setForm] = useState(emptyPlan);

    const [saved, setSaved] = useState(false);

    const activePlans = plans.filter(
        (plan) => plan.status === "ACTIVE"
    );

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));

        setSaved(false);
    };

    const handleOpenAdd = () => {
        setEditingPlan(null);
        setForm(emptyPlan);
        setDialogOpen(true);
    };

    const handleOpenEdit = (plan) => {
        setEditingPlan(plan);

        setForm({
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            durationUnit: plan.durationUnit,
            description: plan.description,
            features: plan.features.join("\n"),
            maxBookings: plan.maxBookings,
            status: plan.status,
        });

        setDialogOpen(true);
    };

    const handleSavePlan = () => {
        if (
            !form.name.trim() ||
            !form.price ||
            !form.duration
        ) {
            return;
        }

        const features = form.features
            .split("\n")
            .map((feature) => feature.trim())
            .filter(Boolean);

        if (editingPlan) {
            setPlans((previous) =>
                previous.map((plan) =>
                    plan.id === editingPlan.id
                        ? {
                              ...plan,
                              name: form.name.trim(),
                              price: Number(form.price),
                              duration: Number(
                                  form.duration
                              ),
                              durationUnit:
                                  form.durationUnit,
                              description:
                                  form.description.trim(),
                              features,
                              maxBookings:
                                  form.maxBookings
                                      ? Number(
                                            form.maxBookings
                                        )
                                      : null,
                              status: form.status,
                          }
                        : plan
                )
            );
        } else {
            setPlans((previous) => [
                ...previous,
                {
                    id: Date.now(),
                    name: form.name.trim(),
                    price: Number(form.price),
                    duration: Number(form.duration),
                    durationUnit: form.durationUnit,
                    description:
                        form.description.trim(),
                    features,
                    maxBookings:
                        form.maxBookings
                            ? Number(form.maxBookings)
                            : null,
                    status: "ACTIVE",
                },
            ]);
        }

        setDialogOpen(false);
        setEditingPlan(null);
        setForm(emptyPlan);
        setSaved(true);
    };

    const handleToggleStatus = (plan) => {
        setPlans((previous) =>
            previous.map((item) =>
                item.id === plan.id
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

        setSaved(false);
    };

    const handleDelete = () => {
        if (!selectedPlan) {
            return;
        }

        setPlans((previous) =>
            previous.filter(
                (plan) => plan.id !== selectedPlan.id
            )
        );

        setSelectedPlan(null);
        setDeleteDialogOpen(false);
        setSaved(true);
    };

    return (
        <Box>
            {/* Page Header */}

            <Stack
                direction={{ xs: "column", md: "row" }}
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
                        Membership Plans
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Create and manage membership plans
                        offered by your library.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenAdd}
                >
                    Add Plan
                </Button>
            </Stack>

            {/* Success */}

            {saved && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setSaved(false)}
                >
                    Membership plans have been updated
                    successfully.
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
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "primary.light",
                                        color:
                                            "primary.main",
                                    }}
                                >
                                    <WorkspacePremium />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total Plans
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {plans.length}
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
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
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
                                        Active Plans
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {activePlans.length}
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
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "info.light",
                                        color: "info.main",
                                    }}
                                >
                                    <People />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Members
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        248
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Plans */}

            <Grid container spacing={2.5}>
                {plans.map((plan) => (
                    <Grid
                        key={plan.id}
                        size={{
                            xs: 12,
                            md: 6,
                            lg: 4,
                        }}
                    >
                        <PlanCard
                            plan={plan}
                            onEdit={handleOpenEdit}
                            onDelete={(item) => {
                                setSelectedPlan(item);
                                setDeleteDialogOpen(true);
                            }}
                            onToggleStatus={
                                handleToggleStatus
                            }
                        />
                    </Grid>
                ))}
            </Grid>

            {/* Empty State */}

            {plans.length === 0 && (
                <Card sx={{ mt: 2 }}>
                    <CardContent
                        sx={{
                            py: 8,
                            textAlign: "center",
                        }}
                    >
                        <WorkspacePremium
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
                            No membership plans
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.5}
                        >
                            Create your first membership plan
                            to start offering memberships.
                        </Typography>

                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            sx={{ mt: 2 }}
                            onClick={handleOpenAdd}
                        >
                            Create Plan
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Add / Edit Dialog */}

            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    {editingPlan
                        ? "Edit Membership Plan"
                        : "Add Membership Plan"}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2.5} mt={1}>
                        <Grid container spacing={2}>
                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    required
                                    label="Plan Name"
                                    name="name"
                                    placeholder="e.g. Monthly"
                                    value={form.name}
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    required
                                    label="Price"
                                    name="price"
                                    type="number"
                                    value={form.price}
                                    onChange={
                                        handleChange
                                    }
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <Typography
                                                    sx={{
                                                        mr: 1,
                                                        color:
                                                            "text.secondary",
                                                    }}
                                                >
                                                    ₹
                                                </Typography>
                                            ),
                                        },
                                    }}
                                />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    required
                                    label="Duration"
                                    name="duration"
                                    type="number"
                                    inputProps={{
                                        min: 1,
                                    }}
                                    value={form.duration}
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
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
                                        onChange={
                                            handleChange
                                        }
                                    >
                                        <MenuItem value="DAY">
                                            Day
                                        </MenuItem>

                                        <MenuItem value="MONTH">
                                            Month
                                        </MenuItem>

                                        <MenuItem value="YEAR">
                                            Year
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={3}
                                    label="Description"
                                    name="description"
                                    placeholder="Describe this membership plan"
                                    value={
                                        form.description
                                    }
                                    onChange={
                                        handleChange
                                    }
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    label="Plan Benefits"
                                    name="features"
                                    placeholder={
                                        "One benefit per line\nFull day access\nSeat booking\nWi-Fi access"
                                    }
                                    value={form.features}
                                    onChange={
                                        handleChange
                                    }
                                    helperText="Enter one benefit per line."
                                />
                            </Grid>

                            <Grid
                                size={{
                                    xs: 12,
                                    md: 6,
                                }}
                            >
                                <TextField
                                    fullWidth
                                    label="Maximum Bookings"
                                    name="maxBookings"
                                    type="number"
                                    inputProps={{
                                        min: 1,
                                    }}
                                    value={
                                        form.maxBookings
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    helperText="Leave empty for unlimited."
                                />
                            </Grid>

                            {editingPlan && (
                                <Grid
                                    size={{
                                        xs: 12,
                                        md: 6,
                                    }}
                                >
                                    <FormControl
                                        fullWidth
                                    >
                                        <InputLabel>
                                            Status
                                        </InputLabel>

                                        <Select
                                            label="Status"
                                            name="status"
                                            value={
                                                form.status
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        >
                                            <MenuItem value="ACTIVE">
                                                Active
                                            </MenuItem>

                                            <MenuItem value="INACTIVE">
                                                Inactive
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            )}
                        </Grid>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() =>
                            setDialogOpen(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSavePlan}
                        disabled={
                            !form.name.trim() ||
                            !form.price ||
                            !form.duration
                        }
                    >
                        {editingPlan
                            ? "Save Changes"
                            : "Create Plan"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}

            <Dialog
                open={deleteDialogOpen}
                onClose={() =>
                    setDeleteDialogOpen(false)
                }
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>
                    Delete Membership Plan?
                </DialogTitle>

                <DialogContent>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Are you sure you want to delete{" "}
                        <strong>
                            {selectedPlan?.name}
                        </strong>
                        ? This action cannot be undone.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button
                        onClick={() =>
                            setDeleteDialogOpen(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="contained"
                        startIcon={<DeleteOutline />}
                        onClick={handleDelete}
                    >
                        Delete Plan
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default MembershipPlans;