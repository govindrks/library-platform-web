import React, { useMemo, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Checkbox,
    Chip,
    Container,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography,
} from "@mui/material";

import {
    AccessTime,
    ArrowBack,
    ArrowForward,
    CheckCircle,
    EventSeat,
    LibraryBooks,
    LocationOn,
    Payment,
    Person,
    WorkspacePremium,
} from "@mui/icons-material";

import {
    useLocation,
    useNavigate,
} from "react-router-dom";

import PlanSelection from "./components/PlanSelection";

import {
    getPlanById,
} from "../../utility/platformPlans";


// ============================================================
// REGISTRATION STEPS
// ============================================================

const steps = [
    "Owner Details",
    "Library Details",
    "Amenities",
    "Seats & Slots",
    "LibraryHub Plan",
    "Review",
];


// ============================================================
// AMENITIES
// ============================================================

const amenitiesList = [
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


// ============================================================
// INITIAL FORM DATA
// ============================================================

const initialFormData = {
    // Owner
    ownerName: "",
    email: "",
    phone: "",
    password: "",

    // Library
    libraryName: "",
    description: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    openingTime: "",
    closingTime: "",

    // Amenities
    amenities: [],

    // Seats
    totalSeats: "",
    rows: "",
    seatsPerRow: "",

    // Slots
    slotType: "HOURLY",
    slotDuration: 60,

    // LibraryHub subscription
    platformPlanId: "",

    // Terms
    termsAccepted: false,
};


// ============================================================
// HELPERS
// ============================================================

const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidPhone = (phone) => {
    return /^[6-9]\d{9}$/.test(phone);
};

const isValidPincode = (pincode) => {
    return /^\d{6}$/.test(pincode);
};


// ============================================================
// COMPONENT
// ============================================================

function RegisterLibrary() {
    const navigate = useNavigate();
    const location = useLocation();

    // --------------------------------------------------------
    // Selected plan passed from PlatformPlans page
    // --------------------------------------------------------

    const selectedPlanIdFromNavigation =
        location.state?.selectedPlanId || "";

    // --------------------------------------------------------
    // State
    // --------------------------------------------------------

    const [activeStep, setActiveStep] = useState(0);

    const [formData, setFormData] = useState({
        ...initialFormData,
        platformPlanId: selectedPlanIdFromNavigation,
    });

    const [error, setError] = useState("");

    const [submitted, setSubmitted] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);


    // --------------------------------------------------------
    // Selected plan
    // --------------------------------------------------------

    const selectedPlan = useMemo(
        () =>
            getPlanById(
                formData.platformPlanId
            ),
        [formData.platformPlanId]
    );


    // ========================================================
    // FIELD UPDATE
    // ========================================================

    const updateField = (field, value) => {
        setFormData((previous) => ({
            ...previous,
            [field]: value,
        }));

        setError("");
    };


    // ========================================================
    // AMENITY TOGGLE
    // ========================================================

    const toggleAmenity = (amenity) => {
        setFormData((previous) => {
            const exists =
                previous.amenities.includes(amenity);

            return {
                ...previous,

                amenities: exists
                    ? previous.amenities.filter(
                          (item) =>
                              item !== amenity
                      )
                    : [
                          ...previous.amenities,
                          amenity,
                      ],
            };
        });

        setError("");
    };


    // ========================================================
    // STEP VALIDATION
    // ========================================================

    const validateStep = () => {
        setError("");

        // ----------------------------------------------------
        // STEP 0 - OWNER DETAILS
        // ----------------------------------------------------

        if (activeStep === 0) {
            if (!formData.ownerName.trim()) {
                setError(
                    "Please enter the owner name."
                );
                return false;
            }

            if (!formData.email.trim()) {
                setError(
                    "Please enter the owner email."
                );
                return false;
            }

            if (!isValidEmail(formData.email.trim())) {
                setError(
                    "Please enter a valid email address."
                );
                return false;
            }

            if (!formData.phone.trim()) {
                setError(
                    "Please enter the owner phone number."
                );
                return false;
            }

            if (!isValidPhone(formData.phone.trim())) {
                setError(
                    "Please enter a valid 10-digit Indian mobile number."
                );
                return false;
            }

            if (!formData.password.trim()) {
                setError(
                    "Please create a password."
                );
                return false;
            }

            if (formData.password.length < 8) {
                setError(
                    "Password must contain at least 8 characters."
                );
                return false;
            }
        }


        // ----------------------------------------------------
        // STEP 1 - LIBRARY DETAILS
        // ----------------------------------------------------

        if (activeStep === 1) {
            if (!formData.libraryName.trim()) {
                setError(
                    "Please enter the library name."
                );
                return false;
            }

            if (!formData.address.trim()) {
                setError(
                    "Please enter the library address."
                );
                return false;
            }

            if (!formData.city.trim()) {
                setError(
                    "Please enter the city."
                );
                return false;
            }

            if (!formData.state.trim()) {
                setError(
                    "Please enter the state."
                );
                return false;
            }

            if (!formData.pincode.trim()) {
                setError(
                    "Please enter the pincode."
                );
                return false;
            }

            if (!isValidPincode(formData.pincode.trim())) {
                setError(
                    "Please enter a valid 6-digit pincode."
                );
                return false;
            }

            if (
                !formData.openingTime ||
                !formData.closingTime
            ) {
                setError(
                    "Please provide library operating hours."
                );
                return false;
            }

            if (
                formData.openingTime ===
                formData.closingTime
            ) {
                setError(
                    "Opening time and closing time cannot be the same."
                );
                return false;
            }
        }


        // ----------------------------------------------------
        // STEP 2 - AMENITIES
        // ----------------------------------------------------

        if (activeStep === 2) {
            if (
                formData.amenities.length === 0
            ) {
                setError(
                    "Please select at least one amenity."
                );
                return false;
            }
        }


        // ----------------------------------------------------
        // STEP 3 - SEATS & SLOTS
        // ----------------------------------------------------

        if (activeStep === 3) {
            const totalSeats =
                Number(formData.totalSeats);

            const rows =
                Number(formData.rows);

            const seatsPerRow =
                Number(formData.seatsPerRow);

            if (
                !formData.totalSeats ||
                !Number.isInteger(totalSeats) ||
                totalSeats <= 0
            ) {
                setError(
                    "Please enter a valid total number of seats."
                );
                return false;
            }

            if (
                !formData.rows ||
                !Number.isInteger(rows) ||
                rows <= 0
            ) {
                setError(
                    "Please enter a valid number of rows."
                );
                return false;
            }

            if (
                !formData.seatsPerRow ||
                !Number.isInteger(seatsPerRow) ||
                seatsPerRow <= 0
            ) {
                setError(
                    "Please enter a valid number of seats per row."
                );
                return false;
            }

            const calculatedSeats =
                rows * seatsPerRow;

            if (calculatedSeats !== totalSeats) {
                setError(
                    `Total seats must match rows × seats per row. ${rows} × ${seatsPerRow} = ${calculatedSeats}.`
                );
                return false;
            }

            if (!formData.slotType) {
                setError(
                    "Please select a slot type."
                );
                return false;
            }

            if (
                formData.slotType === "HOURLY" &&
                !formData.slotDuration
            ) {
                setError(
                    "Please select a slot duration."
                );
                return false;
            }
        }


        // ----------------------------------------------------
        // STEP 4 - LIBRARYHUB PLAN
        // ----------------------------------------------------

        if (activeStep === 4) {
            if (!formData.platformPlanId) {
                setError(
                    "Please select a LibraryHub plan."
                );
                return false;
            }

            if (!selectedPlan) {
                setError(
                    "The selected LibraryHub plan is invalid. Please select another plan."
                );
                return false;
            }
        }


        // ----------------------------------------------------
        // STEP 5 - REVIEW
        // ----------------------------------------------------

        if (activeStep === 5) {
            if (!formData.termsAccepted) {
                setError(
                    "Please accept the terms and conditions."
                );
                return false;
            }
        }

        return true;
    };


    // ========================================================
    // NEXT
    // ========================================================

    const handleNext = () => {
        if (!validateStep()) {
            return;
        }

        setActiveStep(
            (previous) =>
                Math.min(
                    previous + 1,
                    steps.length - 1
                )
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    // ========================================================
    // BACK
    // ========================================================

    const handleBack = () => {
        setError("");

        setActiveStep(
            (previous) =>
                Math.max(previous - 1, 0)
        );

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    // ========================================================
    // PLAN CHANGE
    // ========================================================

    const handlePlanChange = (planId) => {
        updateField(
            "platformPlanId",
            planId
        );
    };


    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit = async () => {
        if (!validateStep()) {
            return;
        }

        if (isSubmitting) {
            return;
        }

        setIsSubmitting(true);
        setError("");

        try {
            const payload = {
                ownerName:
                    formData.ownerName.trim(),

                email:
                    formData.email.trim(),

                phone:
                    formData.phone.trim(),

                password:
                    formData.password,

                libraryName:
                    formData.libraryName.trim(),

                description:
                    formData.description.trim(),

                address:
                    formData.address.trim(),

                city:
                    formData.city.trim(),

                state:
                    formData.state.trim(),

                pincode:
                    formData.pincode.trim(),

                openingTime:
                    formData.openingTime,

                closingTime:
                    formData.closingTime,

                amenities:
                    [...formData.amenities],

                totalSeats:
                    Number(formData.totalSeats),

                rows:
                    Number(formData.rows),

                seatsPerRow:
                    Number(formData.seatsPerRow),

                slotType:
                    formData.slotType,

                slotDuration:
                    Number(formData.slotDuration),

                platformPlanId:
                    formData.platformPlanId,

                termsAccepted:
                    formData.termsAccepted,
            };

            // ------------------------------------------------
            // API integration will be added here.
            // ------------------------------------------------

            console.log(
                "Library registration payload:",
                payload
            );

            setSubmitted(true);

            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        } catch (submissionError) {
            console.error(
                "Library registration failed:",
                submissionError
            );

            setError(
                "Unable to submit the registration. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };


    // ========================================================
    // CHANGE PLAN FROM REVIEW
    // ========================================================

    const handleChangePlan = () => {
        setActiveStep(4);
        setError("");

        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };


    // ========================================================
    // SUBMITTED SCREEN
    // ========================================================

    if (submitted) {
        return (
            <Box
                sx={{
                    minHeight:
                        "calc(100vh - 72px)",
                    backgroundColor:
                        "background.default",
                    py: {
                        xs: 4,
                        md: 8,
                    },
                }}
            >
                <Container maxWidth="md">
                    <Card>
                        <CardContent
                            sx={{
                                p: {
                                    xs: 3,
                                    md: 6,
                                },
                            }}
                        >
                            <Stack
                                spacing={3}
                                alignItems="center"
                                textAlign="center"
                            >
                                <CheckCircle
                                    sx={{
                                        fontSize: 72,
                                        color: "success.main",
                                    }}
                                />

                                <Box>
                                    <Typography
                                        variant="h4"
                                        fontWeight={800}
                                    >
                                        Registration
                                        Submitted
                                    </Typography>

                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        mt={1}
                                    >
                                        Your library
                                        registration
                                        has been
                                        submitted
                                        successfully.
                                    </Typography>
                                </Box>

                                {selectedPlan && (
                                    <Card
                                        sx={{
                                            width: "100%",
                                            backgroundColor:
                                                "primary.light",
                                            borderColor:
                                                "primary.main",
                                        }}
                                    >
                                        <CardContent>
                                            <Stack
                                                spacing={1}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    Selected
                                                    LibraryHub
                                                    Plan
                                                </Typography>

                                                <Typography
                                                    variant="h6"
                                                    fontWeight={
                                                        700
                                                    }
                                                >
                                                    {
                                                        selectedPlan.name
                                                    }
                                                </Typography>

                                                <Typography
                                                    color="primary.main"
                                                    fontWeight={
                                                        700
                                                    }
                                                >
                                                    {selectedPlan.maxMembers
                                                        ? `Up to ${selectedPlan.maxMembers.toLocaleString(
                                                              "en-IN"
                                                          )} active members`
                                                        : "1,000+ active members"}
                                                </Typography>

                                                {selectedPlan.price && (
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        ₹
                                                        {selectedPlan.price.toLocaleString(
                                                            "en-IN"
                                                        )}{" "}
                                                        / month
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                )}

                                <Alert
                                    severity="info"
                                    sx={{
                                        width: "100%",
                                        textAlign: "left",
                                    }}
                                >
                                    The next step will be
                                    subscription payment
                                    and library activation.
                                </Alert>

                                <Button
                                    variant="contained"
                                    onClick={() =>
                                        navigate("/")
                                    }
                                >
                                    Back to Home
                                </Button>
                            </Stack>
                        </CardContent>
                    </Card>
                </Container>
            </Box>
        );
    }


    // ========================================================
    // MAIN PAGE
    // ========================================================

    return (
        <Box
            sx={{
                minHeight:
                    "calc(100vh - 72px)",
                backgroundColor:
                    "background.default",
                py: {
                    xs: 3,
                    md: 5,
                },
            }}
        >
            <Container maxWidth="lg">

                {/* =================================================
                    PAGE HEADER
                ================================================== */}

                <Stack
                    alignItems="center"
                    textAlign="center"
                    spacing={1}
                    mb={4}
                >
                    <Typography
                        variant="h3"
                        fontWeight={800}
                        sx={{
                            fontSize: {
                                xs: "2rem",
                                md: "2.5rem",
                            },
                        }}
                    >
                        Register Your Library
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        maxWidth={650}
                    >
                        Set up your library on LibraryHub
                        and manage members, seats,
                        bookings, payments and analytics
                        from one platform.
                    </Typography>
                </Stack>


                {/* =================================================
                    STEPPER
                ================================================== */}

                <Card sx={{ mb: 3 }}>
                    <CardContent
                        sx={{
                            px: {
                                xs: 1,
                                sm: 2,
                                md: 4,
                            },
                            py: 3,
                            overflowX: "auto",
                        }}
                    >
                        <Stepper
                            activeStep={activeStep}
                            alternativeLabel
                            sx={{
                                minWidth: {
                                    xs: 650,
                                    sm: "auto",
                                },
                            }}
                        >
                            {steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                    </CardContent>
                </Card>


                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 3 }}
                    >
                        {error}
                    </Alert>
                )}


                {/* =================================================
                    STEP CONTENT
                ================================================== */}

                <Card>
                    <CardContent
                        sx={{
                            p: {
                                xs: 2,
                                sm: 3,
                                md: 4,
                            },
                        }}
                    >

                        {/* =================================================
                            STEP 1 - OWNER DETAILS
                        ================================================== */}

                        {activeStep === 0 && (
                            <Stack spacing={3}>

                                <Box>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <Person color="primary" />

                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                        >
                                            Owner Details
                                        </Typography>
                                    </Stack>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        Enter the primary
                                        contact information
                                        for the library.
                                    </Typography>
                                </Box>

                                <Divider />

                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Owner Name"
                                            value={
                                                formData.ownerName
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "ownerName",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            fullWidth
                                            type="email"
                                            label="Email"
                                            value={
                                                formData.email
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "email",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Phone Number"
                                            value={
                                                formData.phone
                                            }
                                            inputProps={{
                                                maxLength: 10,
                                            }}
                                            onChange={(event) =>
                                                updateField(
                                                    "phone",
                                                    event.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        md={6}
                                    >
                                        <TextField
                                            fullWidth
                                            type="password"
                                            label="Create Password"
                                            value={
                                                formData.password
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "password",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        )}


                        {/* =================================================
                            STEP 2 - LIBRARY DETAILS
                        ================================================== */}

                        {activeStep === 1 && (
                            <Stack spacing={3}>

                                <Box>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <LibraryBooks color="primary" />

                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                        >
                                            Library Details
                                        </Typography>
                                    </Stack>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        Provide the basic
                                        information members
                                        will see about your
                                        library.
                                    </Typography>
                                </Box>

                                <Divider />

                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Library Name"
                                            value={
                                                formData.libraryName
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "libraryName",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            label="Description"
                                            value={
                                                formData.description
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "description",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            label="Address"
                                            value={
                                                formData.address
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "address",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                    >
                                        <TextField
                                            fullWidth
                                            label="City"
                                            value={
                                                formData.city
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "city",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                    >
                                        <TextField
                                            fullWidth
                                            label="State"
                                            value={
                                                formData.state
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "state",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                    >
                                        <TextField
                                            fullWidth
                                            label="Pincode"
                                            value={
                                                formData.pincode
                                            }
                                            inputProps={{
                                                maxLength: 6,
                                            }}
                                            onChange={(event) =>
                                                updateField(
                                                    "pincode",
                                                    event.target.value.replace(
                                                        /\D/g,
                                                        ""
                                                    )
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={3}
                                    >
                                        <TextField
                                            fullWidth
                                            type="time"
                                            label="Opening Time"
                                            value={
                                                formData.openingTime
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "openingTime",
                                                    event.target.value
                                                )
                                            }
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={3}
                                    >
                                        <TextField
                                            fullWidth
                                            type="time"
                                            label="Closing Time"
                                            value={
                                                formData.closingTime
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "closingTime",
                                                    event.target.value
                                                )
                                            }
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Stack>
                        )}


                        {/* =================================================
                            STEP 3 - AMENITIES
                        ================================================== */}

                        {activeStep === 2 && (
                            <Stack spacing={3}>

                                <Box>
                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        Library Amenities
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        Select the facilities
                                        available at your
                                        library.
                                    </Typography>
                                </Box>

                                <Divider />

                                <Grid
                                    container
                                    spacing={1.5}
                                >
                                    {amenitiesList.map(
                                        (amenity) => {
                                            const selected =
                                                formData.amenities.includes(
                                                    amenity
                                                );

                                            return (
                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                    md={4}
                                                    key={amenity}
                                                >
                                                    <Card
                                                        onClick={() =>
                                                            toggleAmenity(
                                                                amenity
                                                            )
                                                        }
                                                        sx={{
                                                            cursor: "pointer",
                                                            border:
                                                                "1px solid",
                                                            borderColor:
                                                                selected
                                                                    ? "primary.main"
                                                                    : "divider",
                                                            backgroundColor:
                                                                selected
                                                                    ? "primary.light"
                                                                    : "background.paper",
                                                            transition:
                                                                "all 0.2s ease",
                                                            "&:hover":
                                                                {
                                                                    borderColor:
                                                                        "primary.main",
                                                                },
                                                        }}
                                                    >
                                                        <CardContent
                                                            sx={{
                                                                py: 1,
                                                                "&:last-child":
                                                                    {
                                                                        pb: 1,
                                                                    },
                                                            }}
                                                        >
                                                            <Stack
                                                                direction="row"
                                                                alignItems="center"
                                                                spacing={1}
                                                            >
                                                                <Checkbox
                                                                    checked={
                                                                        selected
                                                                    }
                                                                    onChange={() =>
                                                                        toggleAmenity(
                                                                            amenity
                                                                        )
                                                                    }
                                                                    onClick={(
                                                                        event
                                                                    ) =>
                                                                        event.stopPropagation()
                                                                    }
                                                                />

                                                                <Typography
                                                                    variant="body2"
                                                                    fontWeight={
                                                                        selected
                                                                            ? 600
                                                                            : 400
                                                                    }
                                                                >
                                                                    {
                                                                        amenity
                                                                    }
                                                                </Typography>
                                                            </Stack>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            );
                                        }
                                    )}
                                </Grid>

                                {formData.amenities.length >
                                    0 && (
                                    <Alert severity="success">
                                        {
                                            formData
                                                .amenities
                                                .length
                                        }{" "}
                                        amenities selected.
                                    </Alert>
                                )}
                            </Stack>
                        )}


                        {/* =================================================
                            STEP 4 - SEATS & SLOTS
                        ================================================== */}

                        {activeStep === 3 && (
                            <Stack spacing={3}>

                                <Box>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <EventSeat color="primary" />

                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                        >
                                            Seats & Slots
                                        </Typography>
                                    </Stack>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        Configure your
                                        library's seat
                                        capacity and booking
                                        slots.
                                    </Typography>
                                </Box>

                                <Divider />

                                <Grid
                                    container
                                    spacing={2}
                                >
                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Total Seats"
                                            value={
                                                formData.totalSeats
                                            }
                                            inputProps={{
                                                min: 1,
                                            }}
                                            onChange={(event) =>
                                                updateField(
                                                    "totalSeats",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Rows"
                                            value={
                                                formData.rows
                                            }
                                            inputProps={{
                                                min: 1,
                                            }}
                                            onChange={(event) =>
                                                updateField(
                                                    "rows",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={4}
                                    >
                                        <TextField
                                            fullWidth
                                            type="number"
                                            label="Seats Per Row"
                                            value={
                                                formData.seatsPerRow
                                            }
                                            inputProps={{
                                                min: 1,
                                            }}
                                            onChange={(event) =>
                                                updateField(
                                                    "seatsPerRow",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                    >
                                        <Alert
                                            severity="info"
                                        >
                                            Total seats should
                                            equal Rows × Seats
                                            Per Row.
                                        </Alert>
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                    >
                                        <FormControl fullWidth>
                                            <InputLabel>
                                                Slot Type
                                            </InputLabel>

                                            <Select
                                                value={
                                                    formData.slotType
                                                }
                                                label="Slot Type"
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateField(
                                                        "slotType",
                                                        event.target.value
                                                    )
                                                }
                                            >
                                                <MenuItem value="HOURLY">
                                                    Hourly
                                                </MenuItem>

                                                <MenuItem value="FIXED">
                                                    Fixed
                                                </MenuItem>

                                                <MenuItem value="FULL_DAY">
                                                    Full Day
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid
                                        item
                                        xs={12}
                                        sm={6}
                                    >
                                        <FormControl
                                            fullWidth
                                            disabled={
                                                formData.slotType !==
                                                "HOURLY"
                                            }
                                        >
                                            <InputLabel>
                                                Slot Duration
                                            </InputLabel>

                                            <Select
                                                value={
                                                    formData.slotDuration
                                                }
                                                label="Slot Duration"
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateField(
                                                        "slotDuration",
                                                        Number(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    )
                                                }
                                            >
                                                <MenuItem value={30}>
                                                    30 Minutes
                                                </MenuItem>

                                                <MenuItem value={60}>
                                                    1 Hour
                                                </MenuItem>

                                                <MenuItem value={120}>
                                                    2 Hours
                                                </MenuItem>

                                                <MenuItem value={240}>
                                                    4 Hours
                                                </MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <Alert severity="info">
                                    You can configure
                                    individual seats and
                                    detailed slots later from
                                    the LibraryHub owner
                                    dashboard.
                                </Alert>
                            </Stack>
                        )}


                        {/* =================================================
                            STEP 5 - LIBRARYHUB PLAN
                        ================================================== */}

                        {activeStep === 4 && (
                            <Stack spacing={3}>
                                <Box>
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <WorkspacePremium color="primary" />

                                        <Typography
                                            variant="h5"
                                            fontWeight={700}
                                        >
                                            Choose Your LibraryHub Plan
                                        </Typography>
                                    </Stack>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        Select a platform plan
                                        based on the number
                                        of active members your
                                        library needs to manage.
                                    </Typography>
                                </Box>

                                <Divider />

                                <PlanSelection
                                    selectedPlanId={
                                        formData.platformPlanId
                                    }
                                    onSelect={
                                        handlePlanChange
                                    }
                                />
                            </Stack>
                        )}


                        {/* =================================================
                            STEP 6 - REVIEW
                        ================================================== */}

                        {activeStep === 5 && (
                            <Stack spacing={3}>

                                <Box>
                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        Review Your Registration
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        mt={0.5}
                                    >
                                        Review the information
                                        before submitting your
                                        library registration.
                                    </Typography>
                                </Box>

                                <Divider />


                                {/* =========================================
                                    OWNER DETAILS
                                ========================================== */}

                                <Card>
                                    <CardContent>
                                        <Stack spacing={2}>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <Person color="primary" />

                                                <Typography
                                                    variant="h6"
                                                    fontWeight={700}
                                                >
                                                    Owner Details
                                                </Typography>
                                            </Stack>

                                            <Divider />

                                            <Grid
                                                container
                                                spacing={2}
                                            >
                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Name
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {
                                                            formData.ownerName
                                                        }
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Email
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {
                                                            formData.email
                                                        }
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Phone
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {
                                                            formData.phone
                                                        }
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </CardContent>
                                </Card>


                                {/* =========================================
                                    LIBRARY DETAILS
                                ========================================== */}

                                <Card>
                                    <CardContent>
                                        <Stack spacing={2}>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <LibraryBooks color="primary" />

                                                <Typography
                                                    variant="h6"
                                                    fontWeight={700}
                                                >
                                                    Library Details
                                                </Typography>
                                            </Stack>

                                            <Divider />

                                            <Grid
                                                container
                                                spacing={2}
                                            >
                                                <Grid
                                                    item
                                                    xs={12}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Library Name
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {
                                                            formData.libraryName
                                                        }
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Description
                                                    </Typography>

                                                    <Typography>
                                                        {formData.description ||
                                                            "Not provided"}
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="flex-start"
                                                    >
                                                        <LocationOn
                                                            color="primary"
                                                            fontSize="small"
                                                        />

                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Address
                                                            </Typography>

                                                            <Typography fontWeight={600}>
                                                                {
                                                                    formData.address
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                mt={0.5}
                                                            >
                                                                {
                                                                    formData.city
                                                                }
                                                                ,{" "}
                                                                {
                                                                    formData.state
                                                                }{" "}
                                                                -{" "}
                                                                {
                                                                    formData.pincode
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                >
                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                    >
                                                        <AccessTime
                                                            color="primary"
                                                            fontSize="small"
                                                        />

                                                        <Box>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                Operating
                                                                Hours
                                                            </Typography>

                                                            <Typography fontWeight={600}>
                                                                {
                                                                    formData.openingTime
                                                                }{" "}
                                                                –{" "}
                                                                {
                                                                    formData.closingTime
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </CardContent>
                                </Card>


                                {/* =========================================
                                    AMENITIES
                                ========================================== */}

                                <Card>
                                    <CardContent>
                                        <Stack spacing={2}>

                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                            >
                                                Amenities
                                            </Typography>

                                            <Divider />

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                flexWrap="wrap"
                                                useFlexGap
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
                                                            variant="outlined"
                                                        />
                                                    )
                                                )}
                                            </Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>


                                {/* =========================================
                                    SEATS & SLOTS
                                ========================================== */}

                                <Card>
                                    <CardContent>
                                        <Stack spacing={2}>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <EventSeat color="primary" />

                                                <Typography
                                                    variant="h6"
                                                    fontWeight={700}
                                                >
                                                    Seats & Slots
                                                </Typography>
                                            </Stack>

                                            <Divider />

                                            <Grid
                                                container
                                                spacing={2}
                                            >
                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={4}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Total Seats
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {
                                                            formData.totalSeats
                                                        }
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={4}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Rows
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {
                                                            formData.rows
                                                        }
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={4}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Seats Per Row
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {
                                                            formData.seatsPerRow
                                                        }
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Slot Type
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {
                                                            formData.slotType
                                                        }
                                                    </Typography>
                                                </Grid>

                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={6}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        Slot Duration
                                                    </Typography>

                                                    <Typography fontWeight={600}>
                                                        {formData.slotType ===
                                                        "HOURLY"
                                                            ? `${formData.slotDuration} minutes`
                                                            : "Not applicable"}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </CardContent>
                                </Card>


                                {/* =========================================
                                    LIBRARYHUB PLAN
                                ========================================== */}

                                <Card
                                    sx={{
                                        border:
                                            "2px solid",
                                        borderColor:
                                            "primary.main",
                                        backgroundColor:
                                            "primary.light",
                                    }}
                                >
                                    <CardContent>
                                        <Stack spacing={2}>

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
                                                spacing={1}
                                            >
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                >
                                                    <WorkspacePremium color="primary" />

                                                    <Typography
                                                        variant="h6"
                                                        fontWeight={700}
                                                    >
                                                        LibraryHub Plan
                                                    </Typography>
                                                </Stack>

                                                <Button
                                                    size="small"
                                                    onClick={
                                                        handleChangePlan
                                                    }
                                                >
                                                    Change Plan
                                                </Button>
                                            </Stack>

                                            <Divider />

                                            {selectedPlan ? (
                                                <Grid
                                                    container
                                                    spacing={2}
                                                >
                                                    <Grid
                                                        item
                                                        xs={12}
                                                        sm={4}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Plan
                                                        </Typography>

                                                        <Typography
                                                            variant="h6"
                                                            fontWeight={700}
                                                        >
                                                            {
                                                                selectedPlan.name
                                                            }
                                                        </Typography>
                                                    </Grid>

                                                    <Grid
                                                        item
                                                        xs={12}
                                                        sm={4}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Member
                                                            Capacity
                                                        </Typography>

                                                        <Typography fontWeight={700}>
                                                            {selectedPlan.maxMembers
                                                                ? `1–${selectedPlan.maxMembers.toLocaleString(
                                                                      "en-IN"
                                                                  )} members`
                                                                : "1,000+ members"}
                                                        </Typography>
                                                    </Grid>

                                                    <Grid
                                                        item
                                                        xs={12}
                                                        sm={4}
                                                    >
                                                        <Typography
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Subscription
                                                        </Typography>

                                                        <Typography
                                                            fontWeight={700}
                                                            color="primary.main"
                                                        >
                                                            {selectedPlan.price
                                                                ? `₹${selectedPlan.price.toLocaleString(
                                                                      "en-IN"
                                                                  )} / month`
                                                                : "Custom"}
                                                        </Typography>
                                                    </Grid>
                                                </Grid>
                                            ) : (
                                                <Alert severity="error">
                                                    No LibraryHub
                                                    plan has been
                                                    selected.
                                                </Alert>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>


                                {/* =========================================
                                    TERMS
                                ========================================== */}

                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={
                                                formData.termsAccepted
                                            }
                                            onChange={(event) =>
                                                updateField(
                                                    "termsAccepted",
                                                    event.target.checked
                                                )
                                            }
                                        />
                                    }
                                    label={
                                        <Typography variant="body2">
                                            I agree to the
                                            LibraryHub terms
                                            and conditions and
                                            confirm that the
                                            information provided
                                            is accurate.
                                        </Typography>
                                    }
                                />
                            </Stack>
                        )}
                    </CardContent>
                </Card>


                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <Stack
                    direction={{
                        xs: "column-reverse",
                        sm: "row",
                    }}
                    justifyContent="space-between"
                    spacing={2}
                    mt={3}
                >
                    <Button
                        variant="outlined"
                        startIcon={<ArrowBack />}
                        onClick={
                            activeStep === 0
                                ? () =>
                                      navigate("/")
                                : handleBack
                        }
                    >
                        {activeStep === 0
                            ? "Cancel"
                            : "Back"}
                    </Button>

                    {activeStep <
                    steps.length - 1 ? (
                        <Button
                            variant="contained"
                            endIcon={
                                <ArrowForward />
                            }
                            onClick={handleNext}
                        >
                            Continue
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={
                                <CheckCircle />
                            }
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting
                                ? "Submitting..."
                                : "Submit Registration"}
                        </Button>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

export default RegisterLibrary;