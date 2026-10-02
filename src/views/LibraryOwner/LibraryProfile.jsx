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
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";

import libraryApi from "../../../api/libraryApi";
import LibraryImageGallery from "./LibraryImageGallery";
import getImageUrl from "../../../utility/imageUrl";

// ============================================================
// EMPTY LIBRARY STATE
// ============================================================

const emptyLibrary = {
    id: null,

    libraryName: "",
    description: "",

    address: "",
    city: "",
    state: "",
    pincode: "",

    phone: "",
    email: "",

    openingTime: "",
    closingTime: "",

    totalSeats: 0,
    availableSeats: 0,

    latitude: null,
    longitude: null,

    status: "ACTIVE",

    coverImageUrl: "",

    amenities: [],
};

// ============================================================
// COMPONENT
// ============================================================

function LibraryProfile() {
    // ========================================================
    // STATE
    // ========================================================

    const [library, setLibrary] = useState(emptyLibrary);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [editing, setEditing] = useState(false);

    // ========================================================
    // ERROR MESSAGE HELPER
    // ========================================================

    const getErrorMessage = (err, fallbackMessage) => {
        return (
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            fallbackMessage
        );
    };

    // ========================================================
    // MAP BACKEND RESPONSE TO UI STATE
    // ========================================================

    const mapLibraryDetails = useCallback(
        (details, fallbackLibrary = {}) => {
            return {
                id:
                    details?.id ??
                    fallbackLibrary?.id ??
                    null,

                libraryName:
                    details?.name ??
                    fallbackLibrary?.name ??
                    "",

                description:
                    details?.description ??
                    "",

                address:
                    details?.address ??
                    "",

                city:
                    details?.city ??
                    fallbackLibrary?.city ??
                    "",

                state:
                    details?.state ??
                    fallbackLibrary?.state ??
                    "",

                pincode:
                    details?.pincode ??
                    fallbackLibrary?.pincode ??
                    "",

                phone:
                    details?.contactNumber ??
                    fallbackLibrary?.contactNumber ??
                    "",

                email:
                    details?.email ??
                    fallbackLibrary?.email ??
                    "",

                openingTime:
                    details?.openingTime ??
                    "",

                closingTime:
                    details?.closingTime ??
                    "",

                totalSeats:
                    details?.totalSeats ??
                    fallbackLibrary?.totalSeats ??
                    0,

                availableSeats:
                    details?.availableSeats ??
                    0,

                latitude:
                    details?.latitude ??
                    null,

                longitude:
                    details?.longitude ??
                    null,

                status:
                    details?.status ??
                    fallbackLibrary?.status ??
                    "ACTIVE",

                coverImageUrl:
                    details?.coverImageUrl ??
                    "",

                amenities:
                    Array.isArray(details?.amenities)
                        ? details.amenities
                        : [],

                images:
                    Array.isArray(details?.images)
                        ? details.images
                        : [],
            };
        },
        []
    );

    // ========================================================
    // LOAD COMPLETE LIBRARY DETAILS
    // ========================================================

    const refreshLibraryDetails = useCallback(
        async (libraryId, fallbackLibrary = {}) => {
            if (!libraryId) {
                return;
            }

            try {
                const details =
                    await libraryApi.getLibraryDetails(
                        libraryId
                    );

                setLibrary(
                    mapLibraryDetails(
                        details,
                        fallbackLibrary
                    )
                );

                return details;
            } catch (err) {
                console.error(
                    "Failed to refresh library details:",
                    err
                );

                throw err;
            }
        },
        [mapLibraryDetails]
    );

    // ========================================================
    // LOAD LIBRARY PROFILE
    // ========================================================

    const loadLibraryProfile = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            // ------------------------------------------------
            // STEP 1
            // Get libraries belonging to authenticated owner
            // ------------------------------------------------

            const myLibraries =
                await libraryApi.getMyLibraries();

            // ------------------------------------------------
            // STEP 2
            // No library found
            // ------------------------------------------------

            if (
                !myLibraries ||
                myLibraries.length === 0
            ) {
                setLibrary(emptyLibrary);

                setError(
                    "No library is associated with your account."
                );

                return;
            }

            // ------------------------------------------------
            // STEP 3
            // Currently use the first library
            // ------------------------------------------------

            const myLibrary = myLibraries[0];

            // ------------------------------------------------
            // STEP 4
            // Validate library ID
            // ------------------------------------------------

            if (!myLibrary?.id) {
                throw new Error(
                    "Library ID was not returned by the server."
                );
            }

            // ------------------------------------------------
            // STEP 5
            // Get complete library details
            // ------------------------------------------------

            await refreshLibraryDetails(
                myLibrary.id,
                myLibrary
            );
        } catch (err) {
            console.error(
                "Failed to load library profile:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to load library profile."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [refreshLibraryDetails]);

    // ========================================================
    // LOAD ON COMPONENT MOUNT
    // ========================================================

    useEffect(() => {
        loadLibraryProfile();
    }, [loadLibraryProfile]);

    // ========================================================
    // HANDLE FIELD CHANGE
    // ========================================================

    const handleChange = (event) => {
        const {
            name,
            value,
        } = event.target;

        setLibrary((previous) => ({
            ...previous,
            [name]: value,
        }));

        setError("");
        setSuccess("");
    };

    // ========================================================
    // HANDLE SAVE
    // ========================================================

    const handleSave = async () => {
        if (!library.id) {
            setError(
                "Library ID is not available."
            );

            return;
        }

        try {
            setSaving(true);

            setError("");
            setSuccess("");

            // ------------------------------------------------
            // Prepare backend request
            // ------------------------------------------------

            const payload = {
                name:
                    library.libraryName,

                description:
                    library.description,

                address:
                    library.address,

                city:
                    library.city,

                state:
                    library.state,

                pincode:
                    library.pincode,

                contactNumber:
                    library.phone,

                email:
                    library.email,

                openingTime:
                    library.openingTime,

                closingTime:
                    library.closingTime,

                totalSeats:
                    Number(library.totalSeats),

                latitude:
                    library.latitude !== undefined &&
                    library.latitude !== null &&
                    library.latitude !== ""
                        ? Number(library.latitude)
                        : null,

                longitude:
                    library.longitude !== undefined &&
                    library.longitude !== null &&
                    library.longitude !== ""
                        ? Number(library.longitude)
                        : null,
            };

            // ------------------------------------------------
            // Update library
            // ------------------------------------------------

            await libraryApi.updateLibrary(
                library.id,
                payload
            );

            // ------------------------------------------------
            // Reload from backend
            // This ensures UI contains the actual
            // persisted values.
            // ------------------------------------------------

            await refreshLibraryDetails(
                library.id,
                library
            );

            setEditing(false);

            setSuccess(
                "Library profile updated successfully."
            );
        } catch (err) {
            console.error(
                "Failed to update library:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to update library profile."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // ========================================================
    // HANDLE CANCEL
    // ========================================================

    const handleCancel = async () => {
        setEditing(false);

        setError("");
        setSuccess("");

        if (!library.id) {
            return;
        }

        try {
            setLoading(true);

            await refreshLibraryDetails(
                library.id,
                library
            );
        } catch (err) {
            console.error(
                "Failed to reload library profile:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to reload library profile."
                )
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================================
    // HANDLE COVER IMAGE CHANGE
    // ========================================================

    const handleCoverChange = async () => {
        if (!library.id) {
            return;
        }

        try {
            setError("");

            const details =
                await refreshLibraryDetails(
                    library.id,
                    library
                );

            if (details) {
                setSuccess(
                    "Library cover image updated successfully."
                );
            }
        } catch (err) {
            console.error(
                "Failed to refresh cover image:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Cover image was updated, but the profile could not be refreshed."
                )
            );
        }
    };

    // ========================================================
    // LOADING STATE
    // ========================================================

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // ========================================================
    // RENDER
    // ========================================================

    return (
        <Box>

            {/* ==================================================
                PAGE HEADER
            ================================================== */}

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
                        Library Profile
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        View and manage your library
                        information.
                    </Typography>
                </Box>

                {!editing ? (
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => {
                            setError("");
                            setSuccess("");
                            setEditing(true);
                        }}
                        disabled={saving}
                    >
                        Edit Library
                    </Button>
                ) : (
                    <Stack
                        direction="row"
                        spacing={1}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={
                                saving ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : (
                                    <Save />
                                )
                            }
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Changes"}
                        </Button>
                    </Stack>
                )}
            </Stack>

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                    onClose={() => setError("")}
                >
                    {error}
                </Alert>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() => setSuccess("")}
                >
                    {success}
                </Alert>
            )}

            {/* ==================================================
                LIBRARY OVERVIEW
            ================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        spacing={3}
                        alignItems={{
                            xs: "flex-start",
                            md: "center",
                        }}
                    >

                        {/* LIBRARY IMAGE */}

                        <Box
                            sx={{
                                width: {
                                    xs: "100%",
                                    md: 180,
                                },
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
                            {library.coverImageUrl ? (
                                <Box
                                    component="img"
                                    src={getImageUrl(
                                        library.coverImageUrl
                                    )}
                                    alt={
                                        library.libraryName ||
                                        "Library"
                                    }
                                    sx={{
                                        width: "100%",
                                        height: "100%",
                                        objectFit: "cover",
                                    }}
                                />
                            ) : (
                                <Typography
                                    variant="h3"
                                    fontWeight={700}
                                    color="primary.main"
                                >
                                    {library.libraryName
                                        ?.charAt(0)
                                        ?.toUpperCase() ||
                                        "L"}
                                </Typography>
                            )}
                        </Box>

                        {/* LIBRARY SUMMARY */}

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
                                    {library.libraryName ||
                                        "Library"}
                                </Typography>

                                <Chip
                                    label={
                                        library.status ===
                                        "ACTIVE"
                                            ? "Active"
                                            : library.status ||
                                              "Unknown"
                                    }
                                    color={
                                        library.status ===
                                        "ACTIVE"
                                            ? "success"
                                            : "default"
                                    }
                                    size="small"
                                />
                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                mb={1}
                            >
                                <LocationOn
                                    fontSize="small"
                                    color="action"
                                />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {[
                                        library.city,
                                        library.state,
                                        library.pincode,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </Typography>
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {library.description ||
                                    "No library description available."}
                            </Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* ==================================================
                LIBRARY INFORMATION
            ================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Library Information
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid
                        container
                        spacing={2.5}
                    >

                        {/* Library Name */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Library Name"
                                name="libraryName"
                                value={
                                    library.libraryName
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                            />
                        </Grid>

                        {/* Email */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Library Email"
                                name="email"
                                type="email"
                                value={
                                    library.email
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                            />
                        </Grid>

                        {/* Phone */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Contact Number"
                                name="phone"
                                value={
                                    library.phone
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                            />
                        </Grid>

                        {/* Address */}

                        <Grid
                            size={{
                                xs: 12,
                            }}
                        >
                            <TextField
                                fullWidth
                                multiline
                                minRows={2}
                                label="Address"
                                name="address"
                                value={
                                    library.address
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                            />
                        </Grid>

                        {/* City */}

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
                                    library.city
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                            />
                        </Grid>

                        {/* State */}

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
                                    library.state
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                            />
                        </Grid>

                        {/* Pincode */}

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
                                    library.pincode
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                            />
                        </Grid>

                        {/* Description */}

                        <Grid
                            size={{
                                xs: 12,
                            }}
                        >
                            <TextField
                                fullWidth
                                multiline
                                minRows={4}
                                label="Description"
                                name="description"
                                value={
                                    library.description
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                            />
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>

            {/* ==================================================
                LOCATION COORDINATES
            ================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Location Coordinates
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={2}
                    >
                        Latitude and longitude are used for
                        location-based library discovery and
                        nearby-library search.
                    </Typography>

                    <Grid
                        container
                        spacing={2.5}
                    >

                        {/* Latitude */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Latitude"
                                name="latitude"
                                type="number"
                                value={
                                    library.latitude ??
                                    ""
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                                inputProps={{
                                    step: "any",
                                }}
                            />
                        </Grid>

                        {/* Longitude */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Longitude"
                                name="longitude"
                                type="number"
                                value={
                                    library.longitude ??
                                    ""
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                                inputProps={{
                                    step: "any",
                                }}
                            />
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>

            {/* ==================================================
                OPERATING HOURS
            ================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Operating Hours
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid
                        container
                        spacing={2.5}
                    >

                        {/* Opening Time */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Opening Time"
                                name="openingTime"
                                type="time"
                                value={
                                    library.openingTime
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
                                slotProps={{
                                    inputLabel: {
                                        shrink: true,
                                    },
                                }}
                            />
                        </Grid>

                        {/* Closing Time */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <TextField
                                fullWidth
                                label="Closing Time"
                                name="closingTime"
                                type="time"
                                value={
                                    library.closingTime
                                }
                                onChange={handleChange}
                                disabled={!editing || saving}
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

            {/* ==================================================
                SEAT INFORMATION
            ================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Seat Information
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Grid
                        container
                        spacing={2}
                    >

                        {/* Total Seats */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                    >
                                        <EventSeat
                                            color="primary"
                                        />

                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Total Seats
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {
                                                    library.totalSeats
                                                }
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Available Seats */}

                        <Grid
                            size={{
                                xs: 12,
                                md: 6,
                            }}
                        >
                            <Card variant="outlined">
                                <CardContent>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                    >
                                        <EventSeat
                                            color="success"
                                        />

                                        <Box>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                Available Seats
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {
                                                    library.availableSeats
                                                }
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>

                    </Grid>
                </CardContent>
            </Card>

            {/* ==================================================
                CONTACT / HOURS SUMMARY
            ================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Contact & Hours
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    <Stack spacing={2}>

                        {/* Phone */}

                        {library.phone && (
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <Phone color="action" />

                                <Typography>
                                    {library.phone}
                                </Typography>
                            </Stack>
                        )}

                        {/* Email */}

                        {library.email && (
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <Email color="action" />

                                <Typography>
                                    {library.email}
                                </Typography>
                            </Stack>
                        )}

                        {/* Address */}

                        {library.address && (
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="flex-start"
                            >
                                <LocationOn color="action" />

                                <Typography>
                                    {[
                                        library.address,
                                        library.city,
                                        library.state,
                                        library.pincode,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </Typography>
                            </Stack>
                        )}

                        {/* Hours */}

                        {(library.openingTime ||
                            library.closingTime) && (
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                            >
                                <AccessTime color="action" />

                                <Typography>
                                    {library.openingTime ||
                                        "--:--"}

                                    {" - "}

                                    {library.closingTime ||
                                        "--:--"}
                                </Typography>
                            </Stack>
                        )}

                    </Stack>
                </CardContent>
            </Card>

            {/* ==================================================
                AMENITIES
            ================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Amenities
                    </Typography>

                    <Divider sx={{ mb: 3 }} />

                    {library.amenities?.length > 0 ? (
                        <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            flexWrap="wrap"
                        >
                            {library.amenities.map(
                                (amenity) => (
                                    <Chip
                                        key={amenity}
                                        label={amenity}
                                        variant="outlined"
                                    />
                                )
                            )}
                        </Stack>
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            No amenities configured yet.
                        </Typography>
                    )}
                </CardContent>
            </Card>

            {/* ==================================================
                LIBRARY IMAGES
            ================================================== */}

            {library.id && (
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            mb={2}
                        >
                            Library Images
                        </Typography>

                        <Divider sx={{ mb: 3 }} />

                        <LibraryImageGallery
                            libraryId={library.id}
                            onCoverChange={
                                handleCoverChange
                            }
                        />
                    </CardContent>
                </Card>
            )}

        </Box>
    );
}

export default LibraryProfile;