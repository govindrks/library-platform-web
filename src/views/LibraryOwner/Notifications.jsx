import React, { useMemo, useState } from "react";

import {
    Alert,
    Badge,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Tab,
    Tabs,
    Typography,
} from "@mui/material";

import {
    AccessTime,
    CheckCircle,
    Delete,
    DoneAll,
    EventSeat,
    Groups,
    Info,
    NotificationsActive,
    Payment,
    ReceiptLong,
    Warning,
} from "@mui/icons-material";


// ============================================================
// MOCK NOTIFICATIONS
// ============================================================

const initialNotifications = [
    {
        id: 1,
        type: "BOOKING",
        title: "New booking received",
        message:
            "Rahul Kumar booked seat A12 for the Morning slot.",
        time: "5 minutes ago",
        date: "2026-09-28",
        read: false,
        priority: "NORMAL",
    },
    {
        id: 2,
        type: "PAYMENT",
        title: "Payment received",
        message:
            "Payment of ₹1,499 was successfully received from Priya Sharma.",
        time: "32 minutes ago",
        date: "2026-09-28",
        read: false,
        priority: "NORMAL",
    },
    {
        id: 3,
        type: "MEMBERSHIP",
        title: "Membership expiring soon",
        message:
            "3 members have memberships expiring within the next 7 days.",
        time: "1 hour ago",
        date: "2026-09-28",
        read: false,
        priority: "HIGH",
    },
    {
        id: 4,
        type: "SEAT",
        title: "Seat change request received",
        message:
            "A member has requested a change from A3 to D2.",
        time: "2 hours ago",
        date: "2026-09-28",
        read: true,
        priority: "NORMAL",
    },
    {
        id: 5,
        type: "REPORT",
        title: "Daily report generated",
        message:
            "Your daily occupancy and revenue report is ready.",
        time: "Yesterday",
        date: "2026-09-27",
        read: true,
        priority: "NORMAL",
    },
    {
        id: 6,
        type: "PAYMENT",
        title: "Payment failed",
        message:
            "A membership payment of ₹999 could not be completed.",
        time: "Yesterday",
        date: "2026-09-27",
        read: true,
        priority: "HIGH",
    },
    {
        id: 7,
        type: "SYSTEM",
        title: "Automation completed",
        message:
            "Daily management summary was generated successfully.",
        time: "Yesterday",
        date: "2026-09-27",
        read: true,
        priority: "NORMAL",
    },
];


// ============================================================
// ICON
// ============================================================

const getNotificationIcon = (type) => {
    switch (type) {
        case "BOOKING":
            return <CheckCircle />;

        case "PAYMENT":
            return <PaymentIcon />;

        case "MEMBERSHIP":
            return <Groups />;

        case "SEAT":
            return <EventSeat />;

        case "REPORT":
            return <ReceiptLong />;

        case "SYSTEM":
            return <NotificationsActive />;

        default:
            return <Info />;
    }
};


// Separate component so the notification icon can be reused.
function PaymentIcon() {
    return <Payment />;
}


// ============================================================
// NOTIFICATION CARD
// ============================================================

function NotificationCard({
    notification,
    onMarkRead,
    onDelete,
}) {
    const isUnread = !notification.read;

    return (
        <Card
            variant="outlined"
            sx={{
                borderColor: isUnread
                    ? "primary.main"
                    : "divider",

                backgroundColor: isUnread
                    ? "rgba(79, 70, 229, 0.025)"
                    : "background.paper",

                transition: "all 0.2s ease",

                "&:hover": {
                    borderColor:
                        "primary.main",
                },
            }}
        >
            <CardContent sx={{ p: 2.5 }}>
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
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
                            flexShrink: 0,
                            backgroundColor:
                                isUnread
                                    ? "primary.light"
                                    : "background.default",
                            color: isUnread
                                ? "primary.main"
                                : "text.secondary",
                        }}
                    >
                        {getNotificationIcon(
                            notification.type
                        )}
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            minWidth: 0,
                        }}
                    >
                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            justifyContent="space-between"
                            spacing={1}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >
                                <Typography
                                    variant="subtitle1"
                                    fontWeight={
                                        isUnread
                                            ? 700
                                            : 600
                                    }
                                >
                                    {
                                        notification.title
                                    }
                                </Typography>

                                {isUnread && (
                                    <Box
                                        sx={{
                                            width: 7,
                                            height: 7,
                                            borderRadius:
                                                "50%",
                                            backgroundColor:
                                                "primary.main",
                                        }}
                                    />
                                )}
                            </Stack>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    whiteSpace:
                                        "nowrap",
                                }}
                            >
                                {
                                    notification.time
                                }
                            </Typography>
                        </Stack>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.7}
                        >
                            {
                                notification.message
                            }
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            mt={2}
                        >
                            <Chip
                                label={
                                    notification.type
                                }
                                size="small"
                                variant="outlined"
                            />

                            {notification.priority ===
                                "HIGH" && (
                                <Chip
                                    label="High Priority"
                                    size="small"
                                    color="warning"
                                />
                            )}

                            <Box
                                sx={{
                                    flexGrow: 1,
                                }}
                            />

                            {!notification.read && (
                                <Button
                                    size="small"
                                    onClick={() =>
                                        onMarkRead(
                                            notification.id
                                        )
                                    }
                                >
                                    Mark as read
                                </Button>
                            )}

                            <IconButton
                                size="small"
                                onClick={() =>
                                    onDelete(
                                        notification.id
                                    )
                                }
                            >
                                <DeleteOutline
                                    fontSize="small"
                                />
                            </IconButton>
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}


// ============================================================
// COMPONENT
// ============================================================

function Notifications() {
    const [notifications, setNotifications] =
        useState(initialNotifications);

    const [activeTab, setActiveTab] =
        useState(0);

    const [typeFilter, setTypeFilter] =
        useState("ALL");

    const unreadCount = useMemo(
        () =>
            notifications.filter(
                (notification) =>
                    !notification.read
            ).length,
        [notifications]
    );

    const filteredNotifications =
        useMemo(() => {
            return notifications.filter(
                (notification) => {
                    const matchesTab =
                        activeTab === 0 ||
                        (activeTab === 1 &&
                            !notification.read) ||
                        (activeTab === 2 &&
                            notification.priority ===
                                "HIGH");

                    const matchesType =
                        typeFilter === "ALL" ||
                        notification.type ===
                            typeFilter;

                    return (
                        matchesTab &&
                        matchesType
                    );
                }
            );
        }, [
            notifications,
            activeTab,
            typeFilter,
        ]);


    // ========================================================
    // MARK AS READ
    // ========================================================

    const handleMarkRead = (id) => {
        setNotifications(
            (previous) =>
                previous.map(
                    (notification) =>
                        notification.id === id
                            ? {
                                  ...notification,
                                  read: true,
                              }
                            : notification
                )
        );
    };


    // ========================================================
    // MARK ALL READ
    // ========================================================

    const handleMarkAllRead = () => {
        setNotifications(
            (previous) =>
                previous.map(
                    (notification) => ({
                        ...notification,
                        read: true,
                    })
                )
        );
    };


    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete = (id) => {
        setNotifications(
            (previous) =>
                previous.filter(
                    (notification) =>
                        notification.id !== id
                )
        );
    };


    return (
        <Box>

            {/* =================================================
                HEADER
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
                mb={4}
            >
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
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
                        <Badge
                            badgeContent={
                                unreadCount
                            }
                            color="error"
                        >
                            <NotificationsActive />
                        </Badge>
                    </Box>

                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight={800}
                        >
                            Notifications
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            mt={0.5}
                        >
                            Stay updated with important
                            library activities and
                            automated operations.
                        </Typography>
                    </Box>
                </Stack>

                {unreadCount > 0 && (
                    <Button
                        variant="outlined"
                        startIcon={<DoneAll />}
                        onClick={
                            handleMarkAllRead
                        }
                    >
                        Mark All as Read
                    </Button>
                )}
            </Stack>


            {/* =================================================
                SUMMARY
            ================================================== */}

            {unreadCount > 0 && (
                <Alert
                    severity="info"
                    sx={{ mb: 3 }}
                >
                    You have{" "}
                    <strong>
                        {unreadCount}
                    </strong>{" "}
                    unread notification
                    {unreadCount > 1
                        ? "s"
                        : ""}.
                </Alert>
            )}


            {/* =================================================
                FILTERS
            ================================================== */}

            <Card sx={{ mb: 3 }}>
                <CardContent sx={{ pb: "16px !important" }}>
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "stretch",
                            sm: "center",
                        }}
                        spacing={2}
                    >
                        <Tabs
                            value={activeTab}
                            onChange={(
                                event,
                                value
                            ) =>
                                setActiveTab(value)
                            }
                        >
                            <Tab label="All" />

                            <Tab
                                label={
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <span>
                                            Unread
                                        </span>

                                        {unreadCount >
                                            0 && (
                                            <Chip
                                                label={
                                                    unreadCount
                                                }
                                                size="small"
                                                color="primary"
                                            />
                                        )}
                                    </Stack>
                                }
                            />

                            <Tab
                                label="High Priority"
                            />
                        </Tabs>

                        <Select
                            size="small"
                            value={typeFilter}
                            onChange={(event) =>
                                setTypeFilter(
                                    event.target
                                        .value
                                )
                            }
                            sx={{
                                minWidth: 170,
                            }}
                        >
                            <MenuItem value="ALL">
                                All Types
                            </MenuItem>

                            <MenuItem value="BOOKING">
                                Bookings
                            </MenuItem>

                            <MenuItem value="PAYMENT">
                                Payments
                            </MenuItem>

                            <MenuItem value="MEMBERSHIP">
                                Memberships
                            </MenuItem>

                            <MenuItem value="SEAT">
                                Seats
                            </MenuItem>

                            <MenuItem value="REPORT">
                                Reports
                            </MenuItem>

                            <MenuItem value="SYSTEM">
                                System
                            </MenuItem>
                        </Select>
                    </Stack>
                </CardContent>
            </Card>


            {/* =================================================
                NOTIFICATION LIST
            ================================================== */}

            {filteredNotifications.length > 0 ? (
                <Stack spacing={2}>
                    {filteredNotifications.map(
                        (notification) => (
                            <NotificationCard
                                key={
                                    notification.id
                                }
                                notification={
                                    notification
                                }
                                onMarkRead={
                                    handleMarkRead
                                }
                                onDelete={
                                    handleDelete
                                }
                            />
                        )
                    )}
                </Stack>
            ) : (
                <Card>
                    <CardContent
                        sx={{
                            py: 8,
                            textAlign: "center",
                        }}
                    >
                        <NotificationsActive
                            sx={{
                                fontSize: 56,
                                color:
                                    "text.disabled",
                                mb: 2,
                            }}
                        />

                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            No notifications
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.5}
                        >
                            There are no notifications
                            matching the selected
                            filters.
                        </Typography>
                    </CardContent>
                </Card>
            )}


            {/* =================================================
                FOOTER INFORMATION
            ================================================== */}

            <Divider sx={{ my: 4 }} />

            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
            >
                <AccessTime
                    sx={{
                        fontSize: 18,
                        color: "text.secondary",
                    }}
                />

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    Notifications are currently
                    displayed using frontend mock data.
                    Real-time notifications will be
                    connected to the LibraryHub backend
                    and WebSocket service later.
                </Typography>
            </Stack>
        </Box>
    );
}

export default Notifications;