import {
    AccessTime,
    ArrowBack,
    ArrowForward,
    Check,
    Chair,
    LocationOn,
    Person,
    Wifi,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Container,
    FormControlLabel,
    Grid,
    MenuItem,
    Paper,
    Select,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from "@mui/material";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const steps = [
    "Owner Details",
    "Library Details",
    "Amenities",
    "Seats & Slots",
    "Review",
];

const availableAmenities = [
    "Wi-Fi",
    "Air Conditioning",
    "Power Backup",
    "CCTV",
    "Parking",
    "Drinking Water",
    "Locker",
    "Reading Area",
    "Quiet Zone",
    "Cafe",
    "Newspapers",
    "24/7 Access",
];

function RegisterLibrary() {
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);

    const [formData, setFormData] = useState({
        ownerName: "",
        email: "",
        phone: "",
        password: "",

        libraryName: "",
        description: "",
        address: "",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "",

        openingTime: "06:00",
        closingTime: "22:00",

        amenities: [],

        totalSeats: 100,
        rows: 10,
        seatsPerRow: 10,

        slotDuration: "60",
        slotType: "HOURLY",

        termsAccepted: false,
    });

    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
    };

    const toggleAmenity = (amenity) => {
        setFormData((previous) => ({
            ...previous,
            amenities:
                previous.amenities.includes(amenity)
                    ? previous.amenities.filter(
                          (item) => item !== amenity
                      )
                    : [
                          ...previous.amenities,
                          amenity,
                      ],
        }));
    };

    const validateStep = () => {
        if (activeStep === 0) {
            if (
                !formData.ownerName.trim() ||
                !formData.email.trim() ||
                !formData.phone.trim() ||
                !formData.password
            ) {
                setError(
                    "Please complete all owner account fields."
                );
                return false;
            }
        }

        if (activeStep === 1) {
            if (
                !formData.libraryName.trim() ||
                !formData.address.trim() ||
                !formData.city ||
                !formData.pincode
            ) {
                setError(
                    "Please complete the required library details."
                );
                return false;
            }
        }

        if (activeStep === 2) {
            if (formData.amenities.length === 0) {
                setError(
                    "Please select at least one amenity."
                );
                return false;
            }
        }

        if (activeStep === 3) {
            if (
                !formData.totalSeats ||
                !formData.rows ||
                !formData.seatsPerRow
            ) {
                setError(
                    "Please configure your seating arrangement."
                );
                return false;
            }
        }

        if (
            activeStep === 4 &&
            !formData.termsAccepted
        ) {
            setError(
                "Please accept the terms to submit your library."
            );
            return false;
        }

        setError("");
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) {
            return;
        }

        if (activeStep === steps.length - 1) {
            handleSubmit();
            return;
        }

        setActiveStep((previous) => previous + 1);
    };

    const handleBack = () => {
        setError("");

        setActiveStep((previous) =>
            Math.max(previous - 1, 0)
        );
    };

    const handleSubmit = () => {
        /*
         * API integration will be added later.
         *
         * For now this represents the completed
         * owner registration workflow.
         */

        console.log(
            "Library registration:",
            formData
        );

        navigate("/owner/dashboard", {
            replace: true,
        });
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#F8FBFF",
                py: 5,
            }}
        >
            <Container maxWidth="lg">
                {/* Header */}

                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/")}
                    sx={{
                        color: "#526B91",
                        mb: 3,
                    }}
                >
                    Back to LibraryHub
                </Button>

                <Stack
                    spacing={1}
                    sx={{ mb: 4 }}
                >
                    <Typography
                        sx={{
                            fontSize: {
                                xs: "2rem",
                                md: "2.6rem",
                            },
                            fontWeight: 800,
                            color: "#11194B",
                            letterSpacing:
                                "-0.03em",
                        }}
                    >
                        Register Your Library
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{
                            maxWidth: 700,
                        }}
                    >
                        Bring your library online, manage
                        seats and slots, create membership
                        plans and allow students to book
                        directly through LibraryHub.
                    </Typography>
                </Stack>

                <Paper
                    elevation={0}
                    sx={{
                        border:
                            "1px solid #E1E9F3",
                        borderRadius: 3,
                        overflow: "hidden",
                    }}
                >
                    {/* Stepper */}

                    <Box
                        sx={{
                            p: {
                                xs: 2,
                                md: 4,
                            },
                            backgroundColor:
                                "#FFFFFF",
                            borderBottom:
                                "1px solid #E5EDF7",
                            overflowX: "auto",
                        }}
                    >
                        <Stepper
                            activeStep={activeStep}
                            alternativeLabel
                        >
                            {steps.map((step) => (
                                <Step key={step}>
                                    <StepLabel>
                                        {step}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </Box>

                    {/* Form */}

                    <Box
                        sx={{
                            p: {
                                xs: 2.5,
                                md: 5,
                            },
                        }}
                    >
                        {error && (
                            <Alert
                                severity="error"
                                sx={{ mb: 3 }}
                            >
                                {error}
                            </Alert>
                        )}

                        {/* =========================================
                            STEP 1
                        ========================================== */}

                        {activeStep === 0 && (
                            <Stack spacing={3}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 800,
                                            color: "#11194B",
                                        }}
                                    >
                                        Create your owner
                                        account
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                    >
                                        These details will be
                                        used to manage your
                                        library.
                                    </Typography>
                                </Box>

                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 6,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Owner Name"
                                            name="ownerName"
                                            value={
                                                formData.ownerName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Enter owner name"
                                            InputProps={{
                                                startAdornment:
                                                    (
                                                        <Person
                                                            sx={{
                                                                mr: 1,
                                                                color: "text.secondary",
                                                            }}
                                                        />
                                                    ),
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
                                            label="Phone Number"
                                            name="phone"
                                            value={
                                                formData.phone
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Email Address"
                                            name="email"
                                            type="email"
                                            value={
                                                formData.email
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="owner@example.com"
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Password"
                                            name="password"
                                            type="password"
                                            value={
                                                formData.password
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Create a secure password"
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        )}

                        {/* =========================================
                            STEP 2
                        ========================================== */}

                        {activeStep === 1 && (
                            <Stack spacing={3}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 800,
                                            color: "#11194B",
                                        }}
                                    >
                                        Tell us about your
                                        library
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                    >
                                        This information will
                                        appear on your public
                                        LibraryHub listing.
                                    </Typography>
                                </Box>

                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        size={{
                                            xs: 12,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Library Name"
                                            name="libraryName"
                                            value={
                                                formData.libraryName
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="e.g. GNC Central Library"
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            label="Library Description"
                                            name="description"
                                            value={
                                                formData.description
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            placeholder="Describe your library..."
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            label="Full Address"
                                            name="address"
                                            value={
                                                formData.address
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            InputProps={{
                                                startAdornment:
                                                    (
                                                        <LocationOn
                                                            sx={{
                                                                mr: 1,
                                                                color: "text.secondary",
                                                            }}
                                                        />
                                                    ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 4,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="City"
                                            name="city"
                                            value={
                                                formData.city
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 4,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="State"
                                            name="state"
                                            value={
                                                formData.state
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 4,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Pincode"
                                            name="pincode"
                                            value={
                                                formData.pincode
                                            }
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
                                            type="time"
                                            label="Opening Time"
                                            name="openingTime"
                                            value={
                                                formData.openingTime
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            InputLabelProps={{
                                                shrink: true,
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
                                            type="time"
                                            label="Closing Time"
                                            name="closingTime"
                                            value={
                                                formData.closingTime
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        )}

                        {/* =========================================
                            STEP 3
                        ========================================== */}

                        {activeStep === 2 && (
                            <Stack spacing={3}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 800,
                                            color: "#11194B",
                                        }}
                                    >
                                        Amenities & facilities
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                    >
                                        Select everything your
                                        library provides.
                                    </Typography>
                                </Box>

                                <Grid
                                    container
                                    spacing={2}
                                >
                                    {availableAmenities.map(
                                        (amenity) => {
                                            const selected =
                                                formData.amenities.includes(
                                                    amenity
                                                );

                                            return (
                                                <Grid
                                                    key={
                                                        amenity
                                                    }
                                                    size={{
                                                        xs: 12,
                                                        sm: 6,
                                                        md: 4,
                                                    }}
                                                >
                                                    <Paper
                                                        elevation={
                                                            0
                                                        }
                                                        onClick={() =>
                                                            toggleAmenity(
                                                                amenity
                                                            )
                                                        }
                                                        sx={{
                                                            p: 2,
                                                            cursor: "pointer",
                                                            border:
                                                                selected
                                                                    ? "2px solid #146EF5"
                                                                    : "1px solid #E1E9F3",
                                                            backgroundColor:
                                                                selected
                                                                    ? "#F1F7FF"
                                                                    : "#FFFFFF",
                                                            borderRadius: 2,
                                                        }}
                                                    >
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            spacing={
                                                                1
                                                            }
                                                        >
                                                            <Checkbox
                                                                checked={
                                                                    selected
                                                                }
                                                            />

                                                            <Typography
                                                                sx={{
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {
                                                                    amenity
                                                                }
                                                            </Typography>
                                                        </Stack>
                                                    </Paper>
                                                </Grid>
                                            );
                                        }
                                    )}
                                </Grid>

                                <Box
                                    sx={{
                                        p: 2,
                                        backgroundColor:
                                            "#F8FBFF",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Selected amenities
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {formData.amenities.map(
                                            (amenity) => (
                                                <Chip
                                                    key={
                                                        amenity
                                                    }
                                                    label={
                                                        amenity
                                                    }
                                                    color="primary"
                                                />
                                            )
                                        )}
                                    </Stack>
                                </Box>
                            </Stack>
                        )}

                        {/* =========================================
                            STEP 4
                        ========================================== */}

                        {activeStep === 3 && (
                            <Stack spacing={4}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 800,
                                            color: "#11194B",
                                        }}
                                    >
                                        Configure seats &
                                        booking slots
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                    >
                                        You can change this
                                        configuration later
                                        from your owner
                                        dashboard.
                                    </Typography>
                                </Box>

                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 4,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Total Seats"
                                            name="totalSeats"
                                            value={
                                                formData.totalSeats
                                            }
                                            onChange={
                                                handleChange
                                            }
                                            InputProps={{
                                                startAdornment:
                                                    (
                                                        <Chair
                                                            sx={{
                                                                mr: 1,
                                                                color: "text.secondary",
                                                            }}
                                                        />
                                                    ),
                                            }}
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 4,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Number of Rows"
                                            name="rows"
                                            value={
                                                formData.rows
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        size={{
                                            xs: 12,
                                            md: 4,
                                        }}
                                    >
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Seats Per Row"
                                            name="seatsPerRow"
                                            value={
                                                formData.seatsPerRow
                                            }
                                            onChange={
                                                handleChange
                                            }
                                        />
                                    </Grid>
                                </Grid>

                                <Box>
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            mb: 2,
                                        }}
                                    >
                                        Booking configuration
                                    </Typography>

                                    <Grid
                                        container
                                        spacing={2}
                                    >
                                        <Grid
                                            size={{
                                                xs: 12,
                                                md: 6,
                                            }}
                                        >
                                            <Select
                                                fullWidth
                                                value={
                                                    formData.slotType
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setFormData(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            slotType:
                                                                event
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                            >
                                                <MenuItem value="HOURLY">
                                                    Hourly Slots
                                                </MenuItem>

                                                <MenuItem value="FIXED">
                                                    Fixed Time Slots
                                                </MenuItem>

                                                <MenuItem value="FULL_DAY">
                                                    Full Day
                                                </MenuItem>
                                            </Select>
                                        </Grid>

                                        <Grid
                                            size={{
                                                xs: 12,
                                                md: 6,
                                            }}
                                        >
                                            <Select
                                                fullWidth
                                                value={
                                                    formData.slotDuration
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setFormData(
                                                        (
                                                            previous
                                                        ) => ({
                                                            ...previous,
                                                            slotDuration:
                                                                event
                                                                    .target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                startAdornment={
                                                    <AccessTime
                                                        sx={{
                                                            mr: 1,
                                                            color: "text.secondary",
                                                        }}
                                                    />
                                                }
                                            >
                                                <MenuItem value="30">
                                                    30 Minutes
                                                </MenuItem>

                                                <MenuItem value="60">
                                                    1 Hour
                                                </MenuItem>

                                                <MenuItem value="120">
                                                    2 Hours
                                                </MenuItem>

                                                <MenuItem value="240">
                                                    4 Hours
                                                </MenuItem>
                                            </Select>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        backgroundColor:
                                            "#F1F7FF",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            color: "#11194B",
                                        }}
                                    >
                                        Configuration preview
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            mt: 1,
                                        }}
                                    >
                                        {
                                            formData.rows
                                        }{" "}
                                        rows ×{" "}
                                        {
                                            formData.seatsPerRow
                                        }{" "}
                                        seats ={" "}
                                        <strong>
                                            {
                                                formData.totalSeats
                                            }
                                        </strong>{" "}
                                        total seats
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        Booking type:{" "}
                                        {
                                            formData.slotType
                                        }
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                    >
                                        Slot duration:{" "}
                                        {
                                            formData.slotDuration
                                        }{" "}
                                        minutes
                                    </Typography>
                                </Paper>
                            </Stack>
                        )}

                        {/* =========================================
                            STEP 5
                        ========================================== */}

                        {activeStep === 4 && (
                            <Stack spacing={3}>
                                <Box>
                                    <Typography
                                        variant="h5"
                                        sx={{
                                            fontWeight: 800,
                                            color: "#11194B",
                                        }}
                                    >
                                        Review your library
                                    </Typography>

                                    <Typography
                                        color="text.secondary"
                                        sx={{ mt: 0.5 }}
                                    >
                                        Check your information
                                        before submitting.
                                    </Typography>
                                </Box>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        border:
                                            "1px solid #E1E9F3",
                                        borderRadius: 2,
                                    }}
                                >
                                    <Stack spacing={2}>
                                        <Typography
                                            sx={{
                                                fontSize: 20,
                                                fontWeight: 800,
                                            }}
                                        >
                                            {
                                                formData.libraryName
                                            }
                                        </Typography>

                                        <Typography color="text.secondary">
                                            {
                                                formData.description
                                            }
                                        </Typography>

                                        <Typography>
                                            📍{" "}
                                            {
                                                formData.address
                                            }
                                            ,{" "}
                                            {formData.city},{" "}
                                            {
                                                formData.state
                                            }{" "}
                                            -{" "}
                                            {
                                                formData.pincode
                                            }
                                        </Typography>

                                        <Typography>
                                            🕐{" "}
                                            {
                                                formData.openingTime
                                            }{" "}
                                            –{" "}
                                            {
                                                formData.closingTime
                                            }
                                        </Typography>

                                        <Typography>
                                            🪑{" "}
                                            {
                                                formData.totalSeats
                                            }{" "}
                                            seats
                                        </Typography>

                                        <Box>
                                            <Typography
                                                sx={{
                                                    fontWeight: 700,
                                                    mb: 1,
                                                }}
                                            >
                                                Amenities
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                flexWrap="wrap"
                                                useFlexGap
                                            >
                                                {formData.amenities.map(
                                                    (
                                                        amenity
                                                    ) => (
                                                        <Chip
                                                            key={
                                                                amenity
                                                            }
                                                            label={
                                                                amenity
                                                            }
                                                        />
                                                    )
                                                )}
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Paper>

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                formData.termsAccepted
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setFormData(
                                                    (
                                                        previous
                                                    ) => ({
                                                        ...previous,
                                                        termsAccepted:
                                                            event
                                                                .target
                                                                .checked,
                                                    })
                                                )
                                            }
                                        />
                                    }
                                    label="I confirm that the information provided is accurate and I agree to the LibraryHub partner terms."
                                />
                            </Stack>
                        )}

                        {/* Navigation */}

                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            sx={{
                                mt: 5,
                                pt: 3,
                                borderTop:
                                    "1px solid #E5EDF7",
                            }}
                        >
                            <Button
                                disabled={
                                    activeStep === 0
                                }
                                onClick={handleBack}
                                startIcon={<ArrowBack />}
                            >
                                Back
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleNext}
                                endIcon={
                                    activeStep ===
                                    steps.length - 1 ? (
                                        <Check />
                                    ) : (
                                        <ArrowForward />
                                    )
                                }
                                sx={{
                                    minWidth: 150,
                                    minHeight: 45,
                                }}
                            >
                                {activeStep ===
                                steps.length - 1
                                    ? "Register Library"
                                    : "Continue"}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}

export default RegisterLibrary;