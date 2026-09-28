import React, { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Divider,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Switch,
    Tab,
    Tabs,
    TextField,
    Typography,
} from "@mui/material";

import {
    AccessTime,
    CheckCircle,
    EventSeat,
    LibraryBooks,
    Notifications,
    Save,
    Security,
} from "@mui/icons-material";


// ============================================================
// INITIAL SETTINGS
// ============================================================

const initialSettings = {
    // General
    libraryName: "GNC Central Library",
    email: "library@example.com",
    phone: "9876543210",
    timezone: "Asia/Kolkata",

    // Library
    openingTime: "06:00",
    closingTime: "23:00",
    allowPublicDiscovery: true,
    allowOnlineBooking: true,

    // Booking
    autoConfirmBooking: true,
    allowCancellation: true,
    cancellationHours: 2,
    allowSeatChangeRequest: true,

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
    bookingNotifications: true,
    paymentNotifications: true,
    membershipNotifications: true,

    // Security
    sessionTimeout: "30",
    twoFactorAuthentication: false,
};


// ============================================================
// COMPONENT
// ============================================================

function Settings() {
    const [activeTab, setActiveTab] = useState(0);

    const [settings, setSettings] =
        useState(initialSettings);

    const [saved, setSaved] = useState(false);

    const updateSetting = (field, value) => {
        setSettings((previous) => ({
            ...previous,
            [field]: value,
        }));

        setSaved(false);
    };


    const handleSave = () => {
        console.log(
            "Library settings:",
            settings
        );

        setSaved(true);
    };


    return (
        <Box>

            {/* =====================================================
                HEADER
            ====================================================== */}

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
                mb={4}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={800}
                    >
                        Settings
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Configure your library,
                        booking and account preferences.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSave}
                >
                    Save Changes
                </Button>
            </Stack>


            {/* =====================================================
                SUCCESS
            ====================================================== */}

            {saved && (
                <Alert
                    severity="success"
                    icon={<CheckCircle />}
                    sx={{ mb: 3 }}
                    onClose={() =>
                        setSaved(false)
                    }
                >
                    Your settings have been saved
                    successfully.
                </Alert>
            )}


            {/* =====================================================
                SETTINGS TABS
            ====================================================== */}

            <Card sx={{ mb: 3 }}>
                <Tabs
                    value={activeTab}
                    onChange={(
                        event,
                        value
                    ) => setActiveTab(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    <Tab
                        icon={<LibraryBooks />}
                        iconPosition="start"
                        label="General"
                    />

                    <Tab
                        icon={<AccessTime />}
                        iconPosition="start"
                        label="Library"
                    />

                    <Tab
                        icon={<EventSeat />}
                        iconPosition="start"
                        label="Booking"
                    />

                    <Tab
                        icon={<Notifications />}
                        iconPosition="start"
                        label="Notifications"
                    />

                    <Tab
                        icon={<Security />}
                        iconPosition="start"
                        label="Security"
                    />
                </Tabs>
            </Card>


            {/* =====================================================
                GENERAL
            ====================================================== */}

            {activeTab === 0 && (
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={3}>

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    General Settings
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    Manage the basic
                                    information associated
                                    with your library account.
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
                                        label="Library Name"
                                        value={
                                            settings.libraryName
                                        }
                                        onChange={(event) =>
                                            updateSetting(
                                                "libraryName",
                                                event.target
                                                    .value
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
                                        label="Contact Email"
                                        type="email"
                                        value={
                                            settings.email
                                        }
                                        onChange={(event) =>
                                            updateSetting(
                                                "email",
                                                event.target
                                                    .value
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
                                        label="Contact Phone"
                                        value={
                                            settings.phone
                                        }
                                        onChange={(event) =>
                                            updateSetting(
                                                "phone",
                                                event.target
                                                    .value
                                            )
                                        }
                                    />
                                </Grid>

                                <Grid
                                    item
                                    xs={12}
                                    md={6}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel>
                                            Timezone
                                        </InputLabel>

                                        <Select
                                            value={
                                                settings.timezone
                                            }
                                            label="Timezone"
                                            onChange={(event) =>
                                                updateSetting(
                                                    "timezone",
                                                    event.target
                                                        .value
                                                )
                                            }
                                        >
                                            <MenuItem value="Asia/Kolkata">
                                                India
                                                Standard Time
                                                (IST)
                                            </MenuItem>

                                            <MenuItem value="Asia/Dubai">
                                                Gulf Standard
                                                Time
                                            </MenuItem>

                                            <MenuItem value="UTC">
                                                UTC
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                        </Stack>
                    </CardContent>
                </Card>
            )}


            {/* =====================================================
                LIBRARY
            ====================================================== */}

            {activeTab === 1 && (
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={3}>

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Library Settings
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    Configure operating hours
                                    and public availability.
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
                                    sm={6}
                                >
                                    <TextField
                                        fullWidth
                                        type="time"
                                        label="Opening Time"
                                        value={
                                            settings.openingTime
                                        }
                                        onChange={(event) =>
                                            updateSetting(
                                                "openingTime",
                                                event.target
                                                    .value
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
                                    sm={6}
                                >
                                    <TextField
                                        fullWidth
                                        type="time"
                                        label="Closing Time"
                                        value={
                                            settings.closingTime
                                        }
                                        onChange={(event) =>
                                            updateSetting(
                                                "closingTime",
                                                event.target
                                                    .value
                                            )
                                        }
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Grid>
                            </Grid>

                            <Divider />

                            <Stack spacing={1}>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.allowPublicDiscovery
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "allowPublicDiscovery",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography
                                                fontWeight={600}
                                            >
                                                Public Library
                                                Discovery
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Allow members
                                                to discover
                                                your library
                                                on LibraryHub.
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.allowOnlineBooking
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "allowOnlineBooking",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography
                                                fontWeight={600}
                                            >
                                                Online Booking
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Allow members
                                                to book seats
                                                online.
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Stack>

                        </Stack>
                    </CardContent>
                </Card>
            )}


            {/* =====================================================
                BOOKING
            ====================================================== */}

            {activeTab === 2 && (
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={3}>

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Booking Settings
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    Control how bookings,
                                    cancellations and seat
                                    changes work.
                                </Typography>
                            </Box>

                            <Divider />

                            <Stack spacing={1}>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.autoConfirmBooking
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "autoConfirmBooking",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography
                                                fontWeight={600}
                                            >
                                                Automatically
                                                Confirm Bookings
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Automatically
                                                confirm eligible
                                                bookings.
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.allowCancellation
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "allowCancellation",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography
                                                fontWeight={600}
                                            >
                                                Allow Booking
                                                Cancellation
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Allow members
                                                to cancel their
                                                bookings.
                                            </Typography>
                                        </Box>
                                    }
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.allowSeatChangeRequest
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "allowSeatChangeRequest",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography
                                                fontWeight={600}
                                            >
                                                Allow Seat Change
                                                Requests
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Allow members
                                                to request a
                                                different seat
                                                for an existing
                                                booking.
                                            </Typography>
                                        </Box>
                                    }
                                />
                            </Stack>

                            {settings.allowCancellation && (
                                <>
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
                                            <TextField
                                                fullWidth
                                                type="number"
                                                label="Cancellation Window"
                                                value={
                                                    settings.cancellationHours
                                                }
                                                inputProps={{
                                                    min: 0,
                                                }}
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateSetting(
                                                        "cancellationHours",
                                                        Number(
                                                            event
                                                                .target
                                                                .value
                                                        )
                                                    )
                                                }
                                                helperText="Minimum hours before booking start"
                                            />
                                        </Grid>
                                    </Grid>
                                </>
                            )}

                        </Stack>
                    </CardContent>
                </Card>
            )}


            {/* =====================================================
                NOTIFICATIONS
            ====================================================== */}

            {activeTab === 3 && (
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={3}>

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Notification Settings
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    Select the notification
                                    channels and events your
                                    library wants to receive.
                                </Typography>
                            </Box>

                            <Divider />

                            <Typography
                                variant="subtitle2"
                                fontWeight={700}
                            >
                                Notification Channels
                            </Typography>

                            <Stack spacing={1}>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.emailNotifications
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "emailNotifications",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Email Notifications"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.smsNotifications
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "smsNotifications",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="SMS Notifications"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.inAppNotifications
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "inAppNotifications",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="In-App Notifications"
                                />
                            </Stack>

                            <Divider />

                            <Typography
                                variant="subtitle2"
                                fontWeight={700}
                            >
                                Notification Events
                            </Typography>

                            <Stack spacing={1}>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.bookingNotifications
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "bookingNotifications",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Booking Notifications"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.paymentNotifications
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "paymentNotifications",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Payment Notifications"
                                />

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={
                                                settings.membershipNotifications
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateSetting(
                                                    "membershipNotifications",
                                                    event.target
                                                        .checked
                                                )
                                            }
                                        />
                                    }
                                    label="Membership Notifications"
                                />
                            </Stack>

                        </Stack>
                    </CardContent>
                </Card>
            )}


            {/* =====================================================
                SECURITY
            ====================================================== */}

            {activeTab === 4 && (
                <Card>
                    <CardContent sx={{ p: 3 }}>
                        <Stack spacing={3}>

                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Security Settings
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={0.5}
                                >
                                    Configure account session
                                    and authentication
                                    preferences.
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
                                    sm={6}
                                >
                                    <FormControl fullWidth>
                                        <InputLabel>
                                            Session Timeout
                                        </InputLabel>

                                        <Select
                                            value={
                                                settings.sessionTimeout
                                            }
                                            label="Session Timeout"
                                            onChange={(event) =>
                                                updateSetting(
                                                    "sessionTimeout",
                                                    event.target
                                                        .value
                                                )
                                            }
                                        >
                                            <MenuItem value="15">
                                                15 minutes
                                            </MenuItem>

                                            <MenuItem value="30">
                                                30 minutes
                                            </MenuItem>

                                            <MenuItem value="60">
                                                1 hour
                                            </MenuItem>

                                            <MenuItem value="120">
                                                2 hours
                                            </MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>

                            <Divider />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={
                                            settings.twoFactorAuthentication
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            updateSetting(
                                                "twoFactorAuthentication",
                                                event.target
                                                    .checked
                                            )
                                        }
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography
                                            fontWeight={600}
                                        >
                                            Two-Factor
                                            Authentication
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                        >
                                            Add an additional
                                            authentication
                                            step to protect
                                            the owner account.
                                        </Typography>
                                    </Box>
                                }
                            />

                            <Alert severity="info">
                                Authentication security will
                                ultimately be enforced by the
                                Spring Boot backend. These
                                settings currently represent
                                the frontend configuration.
                            </Alert>

                        </Stack>
                    </CardContent>
                </Card>
            )}

        </Box>
    );
}

export default Settings;