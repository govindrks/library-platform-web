import {
    AcUnit,
    Add,
    Apartment,
    CheckCircle,
    Coffee,
    DeleteOutline,
    DirectionsCar,
    LocalDrink,
    Lock,
    MenuBook,
    Newspaper,
    Power,
    Security,
    Wifi,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Grid,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";

const defaultAmenities = [
    {
        id: "wifi",
        name: "Wi-Fi",
        description: "High-speed internet access",
        icon: Wifi,
        selected: true,
    },
    {
        id: "ac",
        name: "Air Conditioning",
        description: "Air-conditioned study area",
        icon: AcUnit,
        selected: true,
    },
    {
        id: "power-backup",
        name: "Power Backup",
        description: "Backup power during outages",
        icon: Power,
        selected: true,
    },
    {
        id: "cctv",
        name: "CCTV",
        description: "24/7 security monitoring",
        icon: Security,
        selected: true,
    },
    {
        id: "parking",
        name: "Parking",
        description: "Parking facility available",
        icon: DirectionsCar,
        selected: true,
    },
    {
        id: "drinking-water",
        name: "Drinking Water",
        description: "Drinking water facility",
        icon: LocalDrink,
        selected: true,
    },
    {
        id: "locker",
        name: "Locker",
        description: "Personal storage lockers",
        icon: Lock,
        selected: true,
    },
    {
        id: "reading-area",
        name: "Reading Area",
        description: "Dedicated reading space",
        icon: MenuBook,
        selected: true,
    },
    {
        id: "quiet-zone",
        name: "Quiet Zone",
        description: "Silent study area",
        icon: Security,
        selected: false,
    },
    {
        id: "cafe",
        name: "Cafe",
        description: "Food and refreshments",
        icon: Coffee,
        selected: false,
    },
    {
        id: "newspapers",
        name: "Newspapers",
        description: "Daily newspapers",
        icon: Newspaper,
        selected: false,
    },
    {
        id: "24-7",
        name: "24/7 Access",
        description: "Library accessible 24 hours",
        icon: Apartment,
        selected: false,
    },
];

function Amenities() {
    const [amenities, setAmenities] =
        useState(defaultAmenities);

    const [customAmenities, setCustomAmenities] = useState([]);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [customAmenity, setCustomAmenity] = useState({
        name: "",
        description: "",
    });

    const [saved, setSaved] = useState(false);

    const selectedCount =
        amenities.filter((amenity) => amenity.selected).length +
        customAmenities.length;

    const handleToggle = (id) => {
        setAmenities((previous) =>
            previous.map((amenity) =>
                amenity.id === id
                    ? {
                          ...amenity,
                          selected: !amenity.selected,
                      }
                    : amenity
            )
        );

        setSaved(false);
    };

    const handleAddCustomAmenity = () => {
        if (!customAmenity.name.trim()) {
            return;
        }

        setCustomAmenities((previous) => [
            ...previous,
            {
                id: `custom-${Date.now()}`,
                name: customAmenity.name.trim(),
                description:
                    customAmenity.description.trim() ||
                    "Custom library facility",
            },
        ]);

        setCustomAmenity({
            name: "",
            description: "",
        });

        setDialogOpen(false);
        setSaved(false);
    };

    const handleDeleteCustomAmenity = (id) => {
        setCustomAmenities((previous) =>
            previous.filter((amenity) => amenity.id !== id)
        );

        setSaved(false);
    };

    const handleSave = () => {
        const selectedAmenities = [
            ...amenities
                .filter((amenity) => amenity.selected)
                .map((amenity) => amenity.name),
            ...customAmenities.map((amenity) => amenity.name),
        ];

        console.log(
            "Selected library amenities:",
            selectedAmenities
        );

        // API integration will be added later.

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
                    <Typography variant="h4" fontWeight={700}>
                        Amenities
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Manage the facilities available at your
                        library.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={handleSave}
                >
                    Save Amenities
                </Button>
            </Stack>

            {saved && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setSaved(false)}
                >
                    Library amenities have been saved successfully.
                </Alert>
            )}

            {/* Summary */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "flex-start",
                            sm: "center",
                        }}
                        spacing={2}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Available Facilities
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Select all facilities that your
                                library currently provides.
                            </Typography>
                        </Box>

                        <Chip
                            label={`${selectedCount} Selected`}
                            color="primary"
                            variant="outlined"
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* Standard Amenities */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={0.5}
                    >
                        Library Facilities
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={2.5}
                    >
                        Choose from the commonly available library
                        facilities.
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2}>
                        {amenities.map((amenity) => {
                            const Icon = amenity.icon;

                            return (
                                <Grid
                                    key={amenity.id}
                                    size={{
                                        xs: 12,
                                        sm: 6,
                                        lg: 4,
                                    }}
                                >
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            height: "100%",
                                            borderColor:
                                                amenity.selected
                                                    ? "primary.main"
                                                    : "divider",
                                            backgroundColor:
                                                amenity.selected
                                                    ? "primary.light"
                                                    : "background.paper",
                                            transition:
                                                "all 0.2s ease",
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                p: 2,
                                                "&:last-child": {
                                                    pb: 2,
                                                },
                                            }}
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={1.5}
                                                alignItems="center"
                                            >
                                                <Box
                                                    sx={{
                                                        width: 42,
                                                        height: 42,
                                                        borderRadius: 2,
                                                        display:
                                                            "flex",
                                                        alignItems:
                                                            "center",
                                                        justifyContent:
                                                            "center",
                                                        backgroundColor:
                                                            amenity.selected
                                                                ? "primary.main"
                                                                : "secondary.light",
                                                        color: amenity.selected
                                                            ? "primary.contrastText"
                                                            : "text.secondary",
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Icon fontSize="small" />
                                                </Box>

                                                <Box flex={1}>
                                                    <FormControlLabel
                                                        sx={{
                                                            m: 0,
                                                            width: "100%",
                                                        }}
                                                        control={
                                                            <Checkbox
                                                                checked={
                                                                    amenity.selected
                                                                }
                                                                onChange={() =>
                                                                    handleToggle(
                                                                        amenity.id
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label={
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={
                                                                    600
                                                                }
                                                            >
                                                                {
                                                                    amenity.name
                                                                }
                                                            </Typography>
                                                        }
                                                    />

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{
                                                            display:
                                                                "block",
                                                            ml: 5,
                                                        }}
                                                    >
                                                        {
                                                            amenity.description
                                                        }
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </CardContent>
            </Card>

            {/* Custom Amenities */}
            <Card>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "flex-start",
                            sm: "center",
                        }}
                        spacing={2}
                        mb={2}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Custom Amenities
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Add facilities specific to your
                                library.
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<Add />}
                            onClick={() =>
                                setDialogOpen(true)
                            }
                        >
                            Add Custom Amenity
                        </Button>
                    </Stack>

                    <Divider sx={{ mb: 2.5 }} />

                    {customAmenities.length === 0 ? (
                        <Box
                            sx={{
                                py: 4,
                                textAlign: "center",
                                border: "1px dashed",
                                borderColor: "divider",
                                borderRadius: 2,
                            }}
                        >
                            <Typography
                                color="text.secondary"
                            >
                                No custom amenities added yet.
                            </Typography>

                            <Button
                                sx={{ mt: 1 }}
                                startIcon={<Add />}
                                onClick={() =>
                                    setDialogOpen(true)
                                }
                            >
                                Add Custom Amenity
                            </Button>
                        </Box>
                    ) : (
                        <Stack spacing={1.5}>
                            {customAmenities.map(
                                (amenity) => (
                                    <Box
                                        key={amenity.id}
                                        sx={{
                                            p: 1.5,
                                            border: "1px solid",
                                            borderColor:
                                                "divider",
                                            borderRadius: 2,
                                            display: "flex",
                                            alignItems:
                                                "center",
                                            justifyContent:
                                                "space-between",
                                        }}
                                    >
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {amenity.name}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {
                                                    amenity.description
                                                }
                                            </Typography>
                                        </Box>

                                        <IconButton
                                            color="error"
                                            onClick={() =>
                                                handleDeleteCustomAmenity(
                                                    amenity.id
                                                )
                                            }
                                        >
                                            <DeleteOutline />
                                        </IconButton>
                                    </Box>
                                )
                            )}
                        </Stack>
                    )}
                </CardContent>
            </Card>

            {/* Add Custom Amenity Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Add Custom Amenity
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            fullWidth
                            label="Amenity Name"
                            placeholder="e.g. Sleeping Pods"
                            value={customAmenity.name}
                            onChange={(event) =>
                                setCustomAmenity(
                                    (previous) => ({
                                        ...previous,
                                        name: event.target.value,
                                    })
                                )
                            }
                        />

                        <TextField
                            fullWidth
                            multiline
                            minRows={2}
                            label="Description"
                            placeholder="Describe this facility"
                            value={
                                customAmenity.description
                            }
                            onChange={(event) =>
                                setCustomAmenity(
                                    (previous) => ({
                                        ...previous,
                                        description:
                                            event.target.value,
                                    })
                                )
                            }
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() =>
                            setDialogOpen(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAddCustomAmenity}
                        disabled={
                            !customAmenity.name.trim()
                        }
                    >
                        Add Amenity
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default Amenities;