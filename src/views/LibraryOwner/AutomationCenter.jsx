import React, { useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    FormControlLabel,
    Grid,
    Stack,
    Switch,
    Typography,
} from "@mui/material";

import {
    AccessTime,
    Autorenew,
    CalendarMonth,
    CheckCircle,
    Email,
    EventAvailable,
    Groups,
    Notifications,
    Payment,
    ReceiptLong,
    Replay,
    Schedule,
    Settings,
    Summarize,
    TrendingUp,
    Warning,
} from "@mui/icons-material";


// ============================================================
// AUTOMATION CONFIGURATION
// ============================================================

const initialAutomationSettings = {
    // Booking
    bookingConfirmation: true,
    seatReservation: true,
    seatRelease: true,
    bookingReminder: true,

    // Membership
    membershipExpiryReminder: true,
    membershipRenewalReminder: true,

    // Payments
    paymentConfirmation: true,
    invoiceGeneration: true,
    failedPaymentAlert: true,
    refundNotification: true,

    // Library operations
    dailyManagementSummary: true,
    occupancySummary: true,
    revenueSummary: true,

    // Notifications
    emailNotifications: true,
    smsNotifications: false,
    inAppNotifications: true,
};


// ============================================================
// AUTOMATION CARD
// ============================================================

function AutomationItem({
    title,
    description,
    enabled,
    onChange,
    icon,
}) {
    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                transition: "all 0.2s ease",
                borderColor: enabled
                    ? "primary.main"
                    : "divider",
                backgroundColor: enabled
                    ? "rgba(79, 70, 229, 0.02)"
                    : "background.paper",
                "&:hover": {
                    borderColor: "primary.main",
                },
            }}
        >
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={2}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                    >
                        <Box
                            sx={{
                                width: 40,
                                height: 40,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor:
                                    enabled
                                        ? "primary.light"
                                        : "background.default",
                                color: enabled
                                    ? "primary.main"
                                    : "text.secondary",
                                flexShrink: 0,
                            }}
                        >
                            {icon}
                        </Box>

                        <Box>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                            >
                                {title}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                {description}
                            </Typography>
                        </Box>
                    </Stack>

                    <Switch
                        checked={enabled}
                        onChange={(event) =>
                            onChange(
                                event.target.checked
                            )
                        }
                    />
                </Stack>

                <Stack
                    direction="row"
                    spacing={1}
                    mt={2}
                    alignItems="center"
                >
                    {enabled ? (
                        <>
                            <CheckCircle
                                sx={{
                                    fontSize: 16,
                                    color: "success.main",
                                }}
                            />

                            <Typography
                                variant="caption"
                                color="success.main"
                                fontWeight={600}
                            >
                                Automation enabled
                            </Typography>
                        </>
                    ) : (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Automation disabled
                        </Typography>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}


// ============================================================
// SECTION
// ============================================================

function AutomationSection({
    title,
    description,
    icon,
    children,
}) {
    return (
        <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
                <Stack spacing={3}>
                    <Stack
                        direction="row"
                        spacing={1.5}
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
                                backgroundColor:
                                    "primary.light",
                                color: "primary.main",
                            }}
                        >
                            {icon}
                        </Box>

                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {title}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {description}
                            </Typography>
                        </Box>
                    </Stack>

                    <Divider />

                    {children}
                </Stack>
            </CardContent>
        </Card>
    );
}


// ============================================================
// COMPONENT
// ============================================================

function AutomationCenter() {
    const [settings, setSettings] = useState(
        initialAutomationSettings
    );

    const [saved, setSaved] = useState(false);

    const updateSetting = (key, value) => {
        setSettings((previous) => ({
            ...previous,
            [key]: value,
        }));

        setSaved(false);
    };


    const enabledCount = Object.values(
        settings
    ).filter(Boolean).length;

    const totalCount = Object.keys(
        settings
    ).length;


    const enableAll = () => {
        const updatedSettings = {};

        Object.keys(settings).forEach((key) => {
            updatedSettings[key] = true;
        });

        setSettings(updatedSettings);
        setSaved(false);
    };


    const disableAll = () => {
        const updatedSettings = {};

        Object.keys(settings).forEach((key) => {
            updatedSettings[key] = false;
        });

        setSettings(updatedSettings);
        setSaved(false);
    };


    const handleSave = () => {
        console.log(
            "Automation settings:",
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
                        Automation Center
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Configure how LibraryHub automates
                        routine library operations.
                    </Typography>
                </Box>

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={1}
                >
                    <Button
                        variant="outlined"
                        onClick={enableAll}
                    >
                        Enable All
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={disableAll}
                    >
                        Disable All
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Settings />}
                        onClick={handleSave}
                    >
                        Save Changes
                    </Button>
                </Stack>
            </Stack>


            {/* =====================================================
                STATUS
            ====================================================== */}

            {saved && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() =>
                        setSaved(false)
                    }
                >
                    Automation settings saved
                    successfully.
                </Alert>
            )}


            {/* =====================================================
                SUMMARY
            ====================================================== */}

            <Grid
                container
                spacing={2}
                mb={3}
            >
                <Grid
                    item
                    xs={12}
                    sm={4}
                >
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
                                        backgroundColor:
                                            "success.light",
                                        color:
                                            "success.main",
                                    }}
                                >
                                    <CheckCircle />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Active Automations
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={800}
                                    >
                                        {enabledCount}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={4}
                >
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
                                        backgroundColor:
                                            "primary.light",
                                        color:
                                            "primary.main",
                                    }}
                                >
                                    <Autorenew />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Total Automations
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={800}
                                    >
                                        {totalCount}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    item
                    xs={12}
                    sm={4}
                >
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
                                        backgroundColor:
                                            "warning.light",
                                        color:
                                            "warning.main",
                                    }}
                                >
                                    <Schedule />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Automation Coverage
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={800}
                                    >
                                        {Math.round(
                                            (enabledCount /
                                                totalCount) *
                                                100
                                        )}
                                        %
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>


            {/* =====================================================
                BOOKING AUTOMATION
            ====================================================== */}

            <AutomationSection
                title="Booking Automation"
                description="Automate routine booking and seat operations."
                icon={<EventAvailable />}
            >
                <Grid
                    container
                    spacing={2}
                >
                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Booking Confirmation"
                            description="Automatically notify members when a booking is confirmed."
                            enabled={
                                settings.bookingConfirmation
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "bookingConfirmation",
                                    value
                                )
                            }
                            icon={<CheckCircle />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Seat Reservation"
                            description="Automatically reserve the selected seat when a booking is created."
                            enabled={
                                settings.seatReservation
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "seatReservation",
                                    value
                                )
                            }
                            icon={<EventAvailable />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Seat Release"
                            description="Automatically release seats when a booking ends or is cancelled."
                            enabled={
                                settings.seatRelease
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "seatRelease",
                                    value
                                )
                            }
                            icon={<Replay />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Booking Reminder"
                            description="Send automatic reminders before a member's scheduled booking."
                            enabled={
                                settings.bookingReminder
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "bookingReminder",
                                    value
                                )
                            }
                            icon={<Notifications />}
                        />
                    </Grid>
                </Grid>
            </AutomationSection>


            {/* =====================================================
                MEMBERSHIP AUTOMATION
            ====================================================== */}

            <AutomationSection
                title="Membership Automation"
                description="Keep members informed about their membership lifecycle."
                icon={<Groups />}
            >
                <Grid
                    container
                    spacing={2}
                >
                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Membership Expiry Reminder"
                            description="Automatically remind members before their membership expires."
                            enabled={
                                settings.membershipExpiryReminder
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "membershipExpiryReminder",
                                    value
                                )
                            }
                            icon={<Warning />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Membership Renewal Reminder"
                            description="Send renewal reminders to members whose membership is approaching expiry."
                            enabled={
                                settings.membershipRenewalReminder
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "membershipRenewalReminder",
                                    value
                                )
                            }
                            icon={<Autorenew />}
                        />
                    </Grid>
                </Grid>
            </AutomationSection>


            {/* =====================================================
                PAYMENT AUTOMATION
            ====================================================== */}

            <AutomationSection
                title="Payment Automation"
                description="Automate payment communication and financial operations."
                icon={<Payment />}
            >
                <Grid
                    container
                    spacing={2}
                >
                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Payment Confirmation"
                            description="Automatically notify members after successful payments."
                            enabled={
                                settings.paymentConfirmation
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "paymentConfirmation",
                                    value
                                )
                            }
                            icon={<Payment />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Invoice Generation"
                            description="Automatically generate invoices after successful payments."
                            enabled={
                                settings.invoiceGeneration
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "invoiceGeneration",
                                    value
                                )
                            }
                            icon={<ReceiptLong />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Failed Payment Alert"
                            description="Notify the member and owner when a payment fails."
                            enabled={
                                settings.failedPaymentAlert
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "failedPaymentAlert",
                                    value
                                )
                            }
                            icon={<Warning />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={6}
                    >
                        <AutomationItem
                            title="Refund Notification"
                            description="Automatically notify members when a refund is processed."
                            enabled={
                                settings.refundNotification
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "refundNotification",
                                    value
                                )
                            }
                            icon={<Replay />}
                        />
                    </Grid>
                </Grid>
            </AutomationSection>


            {/* =====================================================
                LIBRARY OPERATIONS
            ====================================================== */}

            <AutomationSection
                title="Library Operations"
                description="Automatically generate operational summaries for the owner."
                icon={<Summarize />}
            >
                <Grid
                    container
                    spacing={2}
                >
                    <Grid
                        item
                        xs={12}
                        md={4}
                    >
                        <AutomationItem
                            title="Daily Management Summary"
                            description="Receive a daily summary of important library activities."
                            enabled={
                                settings.dailyManagementSummary
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "dailyManagementSummary",
                                    value
                                )
                            }
                            icon={<Summarize />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >
                        <AutomationItem
                            title="Occupancy Summary"
                            description="Automatically summarize daily seat occupancy."
                            enabled={
                                settings.occupancySummary
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "occupancySummary",
                                    value
                                )
                            }
                            icon={<TrendingUp />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >
                        <AutomationItem
                            title="Revenue Summary"
                            description="Automatically summarize daily library revenue."
                            enabled={
                                settings.revenueSummary
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "revenueSummary",
                                    value
                                )
                            }
                            icon={<TrendingUp />}
                        />
                    </Grid>
                </Grid>
            </AutomationSection>


            {/* =====================================================
                NOTIFICATION CHANNELS
            ====================================================== */}

            <AutomationSection
                title="Notification Channels"
                description="Choose how LibraryHub should deliver automated notifications."
                icon={<Notifications />}
            >
                <Grid
                    container
                    spacing={2}
                >
                    <Grid
                        item
                        xs={12}
                        md={4}
                    >
                        <AutomationItem
                            title="Email Notifications"
                            description="Send automated notifications through email."
                            enabled={
                                settings.emailNotifications
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "emailNotifications",
                                    value
                                )
                            }
                            icon={<Email />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >
                        <AutomationItem
                            title="SMS Notifications"
                            description="Send selected automated notifications through SMS."
                            enabled={
                                settings.smsNotifications
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "smsNotifications",
                                    value
                                )
                            }
                            icon={<Notifications />}
                        />
                    </Grid>

                    <Grid
                        item
                        xs={12}
                        md={4}
                    >
                        <AutomationItem
                            title="In-App Notifications"
                            description="Show automated alerts and updates inside LibraryHub."
                            enabled={
                                settings.inAppNotifications
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "inAppNotifications",
                                    value
                                )
                            }
                            icon={<Notifications />}
                        />
                    </Grid>
                </Grid>
            </AutomationSection>


            {/* =====================================================
                INFORMATION
            ====================================================== */}

            <Alert
                severity="info"
                icon={<AccessTime />}
            >
                Automation settings control how LibraryHub
                handles routine operations. Individual
                automation schedules and notification
                templates can be configured from the
                corresponding settings when backend
                integration is enabled.
            </Alert>

        </Box>
    );
}

export default AutomationCenter;