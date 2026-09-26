import {
    CalendarMonth,
    CheckCircle,
    Close,
    EventSeat,
    FilterList,
    MoreVert,
    Person,
    Search,
    Visibility,
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
    FormControl,
    Grid,
    IconButton,
    InputAdornment,
    InputLabel,
    Menu,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";

import { useMemo, useState } from "react";

const initialBookings = [
    {
        id: "BK-1001",
        memberName: "Rahul Kumar",
        email: "rahul@example.com",
        phone: "9876543210",
        date: "2026-09-26",
        slot: "Morning Slot",
        time: "06:00 - 10:00",
        seat: "A3",
        amount: 80,
        paymentStatus: "PAID",
        status: "CONFIRMED",
        createdAt: "2026-09-25 20:15",
    },
    {
        id: "BK-1002",
        memberName: "Priya Sharma",
        email: "priya@example.com",
        phone: "9876543211",
        date: "2026-09-26",
        slot: "Morning Slot",
        time: "06:00 - 10:00",
        seat: "B2",
        amount: 80,
        paymentStatus: "PAID",
        status: "CONFIRMED",
        createdAt: "2026-09-25 21:05",
    },
    {
        id: "BK-1003",
        memberName: "Amit Singh",
        email: "amit@example.com",
        phone: "9876543212",
        date: "2026-09-26",
        slot: "Afternoon Slot",
        time: "10:00 - 14:00",
        seat: "C4",
        amount: 80,
        paymentStatus: "PAID",
        status: "COMPLETED",
        createdAt: "2026-09-25 18:30",
    },
    {
        id: "BK-1004",
        memberName: "Neha Verma",
        email: "neha@example.com",
        phone: "9876543213",
        date: "2026-09-27",
        slot: "Evening Slot",
        time: "14:00 - 18:00",
        seat: "D1",
        amount: 80,
        paymentStatus: "PENDING",
        status: "PENDING",
        createdAt: "2026-09-26 09:10",
    },
    {
        id: "BK-1005",
        memberName: "Vikash Kumar",
        email: "vikash@example.com",
        phone: "9876543214",
        date: "2026-09-27",
        slot: "Night Slot",
        time: "18:00 - 23:00",
        seat: "A1",
        amount: 100,
        paymentStatus: "PAID",
        status: "CONFIRMED",
        createdAt: "2026-09-26 10:45",
    },
    {
        id: "BK-1006",
        memberName: "Anjali Gupta",
        email: "anjali@example.com",
        phone: "9876543215",
        date: "2026-09-25",
        slot: "Morning Slot",
        time: "06:00 - 10:00",
        seat: "C2",
        amount: 80,
        paymentStatus: "REFUNDED",
        status: "CANCELLED",
        createdAt: "2026-09-24 17:20",
    },
];

function formatDate(date) {
    if (!date) return "-";

    return new Date(
        `${date}T00:00:00`
    ).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function StatusChip({ status }) {
    const config = {
        CONFIRMED: {
            label: "Confirmed",
            color: "success",
        },
        PENDING: {
            label: "Pending",
            color: "warning",
        },
        COMPLETED: {
            label: "Completed",
            color: "info",
        },
        CANCELLED: {
            label: "Cancelled",
            color: "error",
        },
        PAID: {
            label: "Paid",
            color: "success",
        },
        REFUNDED: {
            label: "Refunded",
            color: "default",
        },
    };

    const current = config[status] || {
        label: status,
        color: "default",
    };

    return (
        <Chip
            label={current.label}
            color={current.color}
            size="small"
            variant="outlined"
        />
    );
}

function BookingDetailsDialog({
    booking,
    open,
    onClose,
}) {
    if (!booking) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Booking Details
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.5} mt={1}>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            bgcolor: "primary.light",
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Booking ID
                                </Typography>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {booking.id}
                                </Typography>
                            </Box>

                            <StatusChip
                                status={booking.status}
                            />
                        </Stack>
                    </Box>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Member
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={600}
                            >
                                {booking.memberName}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Phone
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={600}
                            >
                                {booking.phone}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Email
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={600}
                            >
                                {booking.email}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Booking Date
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={600}
                            >
                                {formatDate(
                                    booking.date
                                )}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Seat
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={600}
                            >
                                {booking.seat}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Slot
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={600}
                            >
                                {booking.slot}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {booking.time}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Amount
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={700}
                            >
                                ₹{booking.amount}
                            </Typography>

                            <StatusChip
                                status={
                                    booking.paymentStatus
                                }
                            />
                        </Grid>
                    </Grid>
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function Bookings() {
    const [bookings, setBookings] =
        useState(initialBookings);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("ALL");
    const [paymentFilter, setPaymentFilter] =
        useState("ALL");
    const [dateFilter, setDateFilter] =
        useState("");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] =
        useState(5);

    const [selectedBooking, setSelectedBooking] =
        useState(null);

    const [detailsOpen, setDetailsOpen] =
        useState(false);

    const [menuAnchor, setMenuAnchor] =
        useState(null);

    const [menuBooking, setMenuBooking] =
        useState(null);

    const [saved, setSaved] = useState(false);

    const filteredBookings = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return bookings.filter((booking) => {
            const matchesSearch =
                !query ||
                booking.id
                    .toLowerCase()
                    .includes(query) ||
                booking.memberName
                    .toLowerCase()
                    .includes(query) ||
                booking.email
                    .toLowerCase()
                    .includes(query) ||
                booking.seat
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                booking.status === statusFilter;

            const matchesPayment =
                paymentFilter === "ALL" ||
                booking.paymentStatus ===
                    paymentFilter;

            const matchesDate =
                !dateFilter ||
                booking.date === dateFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPayment &&
                matchesDate
            );
        });
    }, [
        bookings,
        search,
        statusFilter,
        paymentFilter,
        dateFilter,
    ]);

    const confirmedCount = bookings.filter(
        (booking) =>
            booking.status === "CONFIRMED"
    ).length;

    const pendingCount = bookings.filter(
        (booking) =>
            booking.status === "PENDING"
    ).length;

    const completedCount = bookings.filter(
        (booking) =>
            booking.status === "COMPLETED"
    ).length;

    const totalRevenue = bookings
        .filter(
            (booking) =>
                booking.paymentStatus === "PAID"
        )
        .reduce(
            (total, booking) =>
                total + Number(booking.amount),
            0
        );

    const handleOpenDetails = (booking) => {
        setSelectedBooking(booking);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setDetailsOpen(false);
        setSelectedBooking(null);
    };

    const handleOpenMenu = (event, booking) => {
        setMenuAnchor(event.currentTarget);
        setMenuBooking(booking);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
        setMenuBooking(null);
    };

    const handleCancelBooking = () => {
        if (!menuBooking) return;

        setBookings((previous) =>
            previous.map((booking) =>
                booking.id === menuBooking.id
                    ? {
                          ...booking,
                          status: "CANCELLED",
                      }
                    : booking
            )
        );

        handleCloseMenu();
        setSaved(true);
    };

    const handleCompleteBooking = () => {
        if (!menuBooking) return;

        setBookings((previous) =>
            previous.map((booking) =>
                booking.id === menuBooking.id
                    ? {
                          ...booking,
                          status: "COMPLETED",
                      }
                    : booking
            )
        );

        handleCloseMenu();
        setSaved(true);
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setPaymentFilter("ALL");
        setDateFilter("");
        setPage(0);
    };

    return (
        <Box>
            {/* Header */}
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
                        Bookings
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Manage seat reservations and
                        booking activity.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<CalendarMonth />}
                >
                    Booking Calendar
                </Button>
            </Stack>

            {saved && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() =>
                        setSaved(false)
                    }
                >
                    Booking status updated
                    successfully.
                </Alert>
            )}

            {/* Summary */}
            <Grid
                container
                spacing={2}
                mb={3}
            >
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
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
                                        display:
                                            "flex",
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
                                    <EventSeat />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total Bookings
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {
                                            bookings.length
                                        }
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
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
                                        display:
                                            "flex",
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
                                        Confirmed
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {
                                            confirmedCount
                                        }
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
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
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "warning.light",
                                        color:
                                            "warning.dark",
                                    }}
                                >
                                    <CalendarMonth />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Pending
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {
                                            pendingCount
                                        }
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                        md: 3,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Paid Revenue
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                                mt={0.5}
                            >
                                ₹
                                {totalRevenue.toLocaleString(
                                    "en-IN"
                                )}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {completedCount}{" "}
                                completed bookings
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filters */}
            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Stack
                        direction={{
                            xs: "column",
                            lg: "row",
                        }}
                        spacing={2}
                    >
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search booking, member or seat..."
                            value={search}
                            onChange={(event) => {
                                setSearch(
                                    event.target.value
                                );
                                setPage(0);
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControl
                            size="small"
                            sx={{
                                minWidth: 180,
                            }}
                        >
                            <InputLabel>
                                Booking Status
                            </InputLabel>

                            <Select
                                value={statusFilter}
                                label="Booking Status"
                                onChange={(event) => {
                                    setStatusFilter(
                                        event.target
                                            .value
                                    );
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="ALL">
                                    All Statuses
                                </MenuItem>
                                <MenuItem value="PENDING">
                                    Pending
                                </MenuItem>
                                <MenuItem value="CONFIRMED">
                                    Confirmed
                                </MenuItem>
                                <MenuItem value="COMPLETED">
                                    Completed
                                </MenuItem>
                                <MenuItem value="CANCELLED">
                                    Cancelled
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl
                            size="small"
                            sx={{
                                minWidth: 170,
                            }}
                        >
                            <InputLabel>
                                Payment
                            </InputLabel>

                            <Select
                                value={paymentFilter}
                                label="Payment"
                                onChange={(event) => {
                                    setPaymentFilter(
                                        event.target
                                            .value
                                    );
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="ALL">
                                    All Payments
                                </MenuItem>
                                <MenuItem value="PAID">
                                    Paid
                                </MenuItem>
                                <MenuItem value="PENDING">
                                    Pending
                                </MenuItem>
                                <MenuItem value="REFUNDED">
                                    Refunded
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            size="small"
                            type="date"
                            label="Booking Date"
                            value={dateFilter}
                            onChange={(event) => {
                                setDateFilter(
                                    event.target.value
                                );
                                setPage(0);
                            }}
                            slotProps={{
                                inputLabel: {
                                    shrink: true,
                                },
                            }}
                        />

                        <Button
                            variant="outlined"
                            startIcon={<FilterList />}
                            onClick={
                                handleClearFilters
                            }
                        >
                            Clear
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Booking Table */}
            <Card>
                <CardContent
                    sx={{
                        p: 0,
                    }}
                >
                    <Box
                        sx={{
                            p: 2.5,
                            borderBottom:
                                "1px solid",
                            borderColor:
                                "divider",
                        }}
                    >
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    Booking List
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {
                                        filteredBookings.length
                                    }{" "}
                                    booking
                                    {filteredBookings.length !==
                                    1
                                        ? "s"
                                        : ""}{" "}
                                    found
                                </Typography>
                            </Box>

                            <Chip
                                label={
                                    selectedBooking
                                        ? "Booking selected"
                                        : "All bookings"
                                }
                                variant="outlined"
                            />
                        </Stack>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Booking
                                    </TableCell>

                                    <TableCell>
                                        Member
                                    </TableCell>

                                    <TableCell>
                                        Date & Slot
                                    </TableCell>

                                    <TableCell>
                                        Seat
                                    </TableCell>

                                    <TableCell>
                                        Amount
                                    </TableCell>

                                    <TableCell>
                                        Payment
                                    </TableCell>

                                    <TableCell>
                                        Status
                                    </TableCell>

                                    <TableCell align="right">
                                        Action
                                    </TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {filteredBookings
                                    .slice(
                                        page *
                                            rowsPerPage,
                                        page *
                                            rowsPerPage +
                                            rowsPerPage
                                    )
                                    .map(
                                        (booking) => (
                                            <TableRow
                                                key={
                                                    booking.id
                                                }
                                                hover
                                            >
                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            700
                                                        }
                                                    >
                                                        {
                                                            booking.id
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            booking.createdAt
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Stack
                                                        direction="row"
                                                        spacing={
                                                            1.5
                                                        }
                                                        alignItems="center"
                                                    >
                                                        <Box
                                                            sx={{
                                                                width: 34,
                                                                height: 34,
                                                                borderRadius:
                                                                    "50%",
                                                                display:
                                                                    "flex",
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
                                                            <Person fontSize="small" />
                                                        </Box>

                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={
                                                                    600
                                                                }
                                                            >
                                                                {
                                                                    booking.memberName
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    booking.phone
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            600
                                                        }
                                                    >
                                                        {formatDate(
                                                            booking.date
                                                        )}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            booking.slot
                                                        }{" "}
                                                        ·{" "}
                                                        {
                                                            booking.time
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Chip
                                                        icon={
                                                            <EventSeat />
                                                        }
                                                        label={
                                                            booking.seat
                                                        }
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            700
                                                        }
                                                    >
                                                        ₹
                                                        {
                                                            booking.amount
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <StatusChip
                                                        status={
                                                            booking.paymentStatus
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell>
                                                    <StatusChip
                                                        status={
                                                            booking.status
                                                        }
                                                    />
                                                </TableCell>

                                                <TableCell align="right">
                                                    <Stack
                                                        direction="row"
                                                        justifyContent="flex-end"
                                                    >
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleOpenDetails(
                                                                    booking
                                                                )
                                                            }
                                                        >
                                                            <Visibility fontSize="small" />
                                                        </IconButton>

                                                        <IconButton
                                                            size="small"
                                                            onClick={(
                                                                event
                                                            ) =>
                                                                handleOpenMenu(
                                                                    event,
                                                                    booking
                                                                )
                                                            }
                                                        >
                                                            <MoreVert fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    )}

                                {filteredBookings.length ===
                                    0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={8}
                                            align="center"
                                        >
                                            <Box
                                                sx={{
                                                    py: 8,
                                                }}
                                            >
                                                <EventSeat
                                                    sx={{
                                                        fontSize: 48,
                                                        color: "text.disabled",
                                                    }}
                                                />

                                                <Typography
                                                    variant="h6"
                                                    fontWeight={
                                                        700
                                                    }
                                                    mt={1}
                                                >
                                                    No bookings
                                                    found
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    mt={0.5}
                                                >
                                                    Try changing
                                                    your search
                                                    or filters.
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        component="div"
                        count={
                            filteredBookings.length
                        }
                        page={page}
                        onPageChange={(
                            _event,
                            newPage
                        ) =>
                            setPage(newPage)
                        }
                        rowsPerPage={
                            rowsPerPage
                        }
                        onRowsPerPageChange={(
                            event
                        ) => {
                            setRowsPerPage(
                                parseInt(
                                    event.target.value,
                                    10
                                )
                            );
                            setPage(0);
                        }}
                        rowsPerPageOptions={[
                            5,
                            10,
                            25,
                        ]}
                    />
                </CardContent>
            </Card>

            {/* Action Menu */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleCloseMenu}
            >
                <MenuItem
                    onClick={() => {
                        if (menuBooking) {
                            handleOpenDetails(
                                menuBooking
                            );
                        }
                        handleCloseMenu();
                    }}
                >
                    <Visibility
                        fontSize="small"
                        sx={{ mr: 1.5 }}
                    />
                    View Details
                </MenuItem>

                {menuBooking?.status ===
                    "PENDING" && (
                    <MenuItem
                        onClick={
                            handleCompleteBooking
                        }
                    >
                        <CheckCircle
                            fontSize="small"
                            sx={{
                                mr: 1.5,
                            }}
                        />
                        Confirm Booking
                    </MenuItem>
                )}

                {menuBooking?.status ===
                    "CONFIRMED" && (
                    <MenuItem
                        onClick={
                            handleCompleteBooking
                        }
                    >
                        <CheckCircle
                            fontSize="small"
                            sx={{
                                mr: 1.5,
                            }}
                        />
                        Mark Completed
                    </MenuItem>
                )}

                {menuBooking?.status !==
                    "CANCELLED" &&
                    menuBooking?.status !==
                        "COMPLETED" && (
                        <MenuItem
                            sx={{
                                color: "error.main",
                            }}
                            onClick={
                                handleCancelBooking
                            }
                        >
                            <Close
                                fontSize="small"
                                sx={{
                                    mr: 1.5,
                                }}
                            />
                            Cancel Booking
                        </MenuItem>
                    )}
            </Menu>

            {/* Details */}
            <BookingDetailsDialog
                booking={selectedBooking}
                open={detailsOpen}
                onClose={handleCloseDetails}
            />
        </Box>
    );
}

export default Bookings;