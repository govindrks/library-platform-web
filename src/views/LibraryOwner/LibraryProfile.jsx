import {
    AccessTime,
    Edit,
    Email,
    EventSeat,
    LocationOn,
    Phone,
    Save,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const initialLibrary = {
    libraryName: "GNC Central Library",
    description:
        "A modern and peaceful study space designed for students and working professionals.",
    address: "123, 5th Main Road, Koramangala",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560034",
    phone: "+91 9876543210",
    email: "contact@gnccentrallibrary.com",
    openingTime: "06:00",
    closingTime: "23:00",
    totalSeats: 120,
    status: "ACTIVE",
};

const amenities = [
    "Wi-Fi",
    "Air Conditioning",
    "Power Backup",
    "CCTV",
    "Parking",
    "Drinking Water",
    "Locker",
    "Reading Area",
    "Quiet Zone",
];

function LibraryProfile() {
    const navigate = useNavigate();

    const [library, setLibrary] = useState(initialLibrary);
    const [editing, setEditing] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setLibrary((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSave = () => {
        console.log("Library profile:", library);

        // API integration will be added later.
        setEditing(false);
    };

    return (
        <Box>
            {/* Page Header */}
            <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", md: "center" }}
                spacing={2}
                mb={3}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Library Profile
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        View and manage your library information.
                    </Typography>
                </Box>

                {!editing ? (
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => setEditing(true)}
                    >
                        Edit Library
                    </Button>
                ) : (
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setLibrary(initialLibrary);
                                setEditing(false);
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={handleSave}
                        >
                            Save Changes
                        </Button>
                    </Stack>
                )}
            </Stack>

            {/* Library Overview */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{ xs: "column", md: "row" }}
                        spacing={3}
                        alignItems={{ xs: "flex-start", md: "center" }}
                    >
                        {/* Library Image */}
                        <Box
                            sx={{
                                width: { xs: "100%", md: 180 },
                                height: 130,
                                borderRadius: 2,
                                overflow: "hidden",
                                bgcolor: "primary.light",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                            }}
                        >
                            <Typography
                                variant="h3"
                                fontWeight={700}
                                color="primary.main"
                            >
                                G
                            </Typography>
                        </Box>

                        <Box flex={1}>
                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={1}
                                alignItems={{
                                    xs: "flex-start",
                                    sm: "center",
                                }}
                                mb={1}
                            >
                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                >
                                    {library.libraryName}
                                </Typography>

                                <Chip
                                    label={
                                        library.status === "ACTIVE"
                                            ? "Active"
                                            : "Inactive"
                                    }
                                    color={
                                        library.status === "ACTIVE"
                                            ? "success"
                                            : "default"
                                    }
                                    size="small"
                                />
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={2}
                            >
                                {library.description}
                            </Typography>

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={2}
                                flexWrap="wrap"
                            >
                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                >
                                    <LocationOn
                                        fontSize="small"
                                        color="action"
                                    />

                                    <Typography variant="body2">
                                        {library.city},{" "}
                                        {library.state}
                                    </Typography>
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                >
                                    <EventSeat
                                        fontSize="small"
                                        color="action"
                                    />

                                    <Typography variant="body2">
                                        {library.totalSeats} seats
                                    </Typography>
                                </Stack>

                                <Stack
                                    direction="row"
                                    spacing={0.75}
                                    alignItems="center"
                                >
                                    <AccessTime
                                        fontSize="small"
                                        color="action"
                                    />

                                    <Typography variant="body2">
                                        {library.openingTime} -{" "}
                                        {library.closingTime}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* Basic Information */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                        Basic Information
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Library Name"
                                name="libraryName"
                                value={library.libraryName}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Total Seats"
                                name="totalSeats"
                                type="number"
                                value={library.totalSeats}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                multiline
                                minRows={3}
                                label="Description"
                                name="description"
                                value={library.description}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Location */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                        Location
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                label="Address"
                                name="address"
                                value={library.address}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="City"
                                name="city"
                                value={library.city}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="State"
                                name="state"
                                value={library.state}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                fullWidth
                                label="Pincode"
                                name="pincode"
                                value={library.pincode}
                                onChange={handleChange}
                                disabled={!editing}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Contact */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                        Contact Information
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                value={library.phone}
                                onChange={handleChange}
                                disabled={!editing}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <Phone
                                                fontSize="small"
                                                sx={{
                                                    mr: 1,
                                                    color: "text.secondary",
                                                }}
                                            />
                                        ),
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                value={library.email}
                                onChange={handleChange}
                                disabled={!editing}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <Email
                                                fontSize="small"
                                                sx={{
                                                    mr: 1,
                                                    color: "text.secondary",
                                                }}
                                            />
                                        ),
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography variant="h6" fontWeight={700} mb={2}>
                        Operating Hours
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                label="Opening Time"
                                name="openingTime"
                                type="time"
                                value={library.openingTime}
                                onChange={handleChange}
                                disabled={!editing}
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
                                label="Closing Time"
                                name="closingTime"
                                type="time"
                                value={library.closingTime}
                                onChange={handleChange}
                                disabled={!editing}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Amenities */}
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
                        mb={2}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Amenities
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Facilities currently available in
                                your library.
                            </Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            onClick={() =>
                                navigate("/owner/amenities")
                            }
                        >
                            Manage Amenities
                        </Button>
                    </Stack>

                    <Divider sx={{ mb: 2.5 }} />

                    <Stack
                        direction="row"
                        spacing={1}
                        useFlexGap
                        flexWrap="wrap"
                    >
                        {amenities.map((amenity) => (
                            <Chip
                                key={amenity}
                                label={amenity}
                                variant="outlined"
                            />
                        ))}
                    </Stack>
                </CardContent>
            </Card>

            {/* Quick Configuration */}
            <Card>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Library Configuration
                    </Typography>

                    <Divider sx={{ mb: 2.5 }} />

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<EventSeat />}
                                onClick={() =>
                                    navigate(
                                        "/owner/seat-mapping"
                                    )
                                }
                                sx={{ py: 1.5 }}
                            >
                                Configure Seats
                            </Button>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<AccessTime />}
                                onClick={() =>
                                    navigate("/owner/slots")
                                }
                                sx={{ py: 1.5 }}
                            >
                                Configure Slots
                            </Button>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 4 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() =>
                                    navigate(
                                        "/owner/membership-plans"
                                    )
                                }
                                sx={{ py: 1.5 }}
                            >
                                Membership Plans
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}

export default LibraryProfile;