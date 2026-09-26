import {
    CardMembership,
    EmailOutlined,
    EventSeat,
    MoreVert,
    Person,
    PhoneOutlined,
    Search,
    Visibility,
} from "@mui/icons-material";

import {
    Alert,
    Avatar,
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
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography,
} from "@mui/material";

import { useMemo, useState } from "react";

const initialMembers = [
    {
        id: "MEM-1001",
        name: "Rahul Kumar",
        email: "rahul@example.com",
        phone: "9876543210",
        plan: "Monthly Pass",
        planType: "MONTHLY",
        joinedDate: "2026-08-15",
        expiryDate: "2026-09-15",
        status: "ACTIVE",
        totalBookings: 18,
        completedBookings: 16,
        amountPaid: 1800,
    },
    {
        id: "MEM-1002",
        name: "Priya Sharma",
        email: "priya@example.com",
        phone: "9876543211",
        plan: "Quarterly Pass",
        planType: "QUARTERLY",
        joinedDate: "2026-07-10",
        expiryDate: "2026-10-10",
        status: "ACTIVE",
        totalBookings: 31,
        completedBookings: 28,
        amountPaid: 4800,
    },
    {
        id: "MEM-1003",
        name: "Amit Singh",
        email: "amit@example.com",
        phone: "9876543212",
        plan: "Daily Pass",
        planType: "DAILY",
        joinedDate: "2026-09-20",
        expiryDate: "2026-09-21",
        status: "EXPIRED",
        totalBookings: 1,
        completedBookings: 1,
        amountPaid: 80,
    },
    {
        id: "MEM-1004",
        name: "Neha Verma",
        email: "neha@example.com",
        phone: "9876543213",
        plan: "Monthly Pass",
        planType: "MONTHLY",
        joinedDate: "2026-09-01",
        expiryDate: "2026-10-01",
        status: "ACTIVE",
        totalBookings: 9,
        completedBookings: 7,
        amountPaid: 1800,
    },
    {
        id: "MEM-1005",
        name: "Vikash Kumar",
        email: "vikash@example.com",
        phone: "9876543214",
        plan: "Monthly Pass",
        planType: "MONTHLY",
        joinedDate: "2026-08-25",
        expiryDate: "2026-09-25",
        status: "EXPIRED",
        totalBookings: 12,
        completedBookings: 11,
        amountPaid: 1800,
    },
    {
        id: "MEM-1006",
        name: "Anjali Gupta",
        email: "anjali@example.com",
        phone: "9876543215",
        plan: "Quarterly Pass",
        planType: "QUARTERLY",
        joinedDate: "2026-09-05",
        expiryDate: "2026-12-05",
        status: "ACTIVE",
        totalBookings: 7,
        completedBookings: 6,
        amountPaid: 4800,
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

function MemberStatusChip({ status }) {
    const config = {
        ACTIVE: {
            label: "Active",
            color: "success",
        },
        EXPIRED: {
            label: "Expired",
            color: "error",
        },
        SUSPENDED: {
            label: "Suspended",
            color: "warning",
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
            variant="outlined"
            size="small"
        />
    );
}

function MemberDetailsDialog({
    member,
    open,
    onClose,
}) {
    if (!member) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Member Details
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3} mt={1}>
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                    >
                        <Avatar
                            sx={{
                                width: 56,
                                height: 56,
                                bgcolor:
                                    "primary.light",
                                color:
                                    "primary.main",
                                fontWeight: 700,
                            }}
                        >
                            {member.name
                                .charAt(0)
                                .toUpperCase()}
                        </Avatar>

                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {member.name}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {member.id}
                            </Typography>
                        </Box>

                        <Box sx={{ ml: "auto" }}>
                            <MemberStatusChip
                                status={member.status}
                            />
                        </Box>
                    </Stack>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack
                                direction="row"
                                spacing={1}
                            >
                                <EmailOutlined
                                    color="action"
                                    fontSize="small"
                                />

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Email
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {member.email}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Stack
                                direction="row"
                                spacing={1}
                            >
                                <PhoneOutlined
                                    color="action"
                                    fontSize="small"
                                />

                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Phone
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {member.phone}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Membership Plan
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={600}
                            >
                                {member.plan}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Amount Paid
                            </Typography>

                            <Typography
                                variant="body1"
                                fontWeight={700}
                            >
                                ₹
                                {member.amountPaid.toLocaleString(
                                    "en-IN"
                                )}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Joined Date
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                            >
                                {formatDate(
                                    member.joinedDate
                                )}
                            </Typography>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Membership Expiry
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                            >
                                {formatDate(
                                    member.expiryDate
                                )}
                            </Typography>
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Card
                                sx={{
                                    bgcolor:
                                        "primary.light",
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Total Bookings
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {
                                            member.totalBookings
                                        }
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>
                            <Card
                                sx={{
                                    bgcolor:
                                        "success.light",
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        Completed
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                        color="success.dark"
                                    >
                                        {
                                            member.completedBookings
                                        }
                                    </Typography>
                                </CardContent>
                            </Card>
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

function Members() {
    const [members, setMembers] =
        useState(initialMembers);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] =
        useState("ALL");
    const [planFilter, setPlanFilter] =
        useState("ALL");

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] =
        useState(5);

    const [selectedMember, setSelectedMember] =
        useState(null);

    const [detailsOpen, setDetailsOpen] =
        useState(false);

    const [menuAnchor, setMenuAnchor] =
        useState(null);

    const [menuMember, setMenuMember] =
        useState(null);

    const [saved, setSaved] = useState(false);

    const filteredMembers = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        return members.filter((member) => {
            const matchesSearch =
                !query ||
                member.id
                    .toLowerCase()
                    .includes(query) ||
                member.name
                    .toLowerCase()
                    .includes(query) ||
                member.email
                    .toLowerCase()
                    .includes(query) ||
                member.phone
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                member.status === statusFilter;

            const matchesPlan =
                planFilter === "ALL" ||
                member.planType === planFilter;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPlan
            );
        });
    }, [
        members,
        search,
        statusFilter,
        planFilter,
    ]);

    const activeMembers = members.filter(
        (member) => member.status === "ACTIVE"
    ).length;

    const expiredMembers = members.filter(
        (member) => member.status === "EXPIRED"
    ).length;

    const totalBookings = members.reduce(
        (total, member) =>
            total + member.totalBookings,
        0
    );

    const membershipRevenue = members.reduce(
        (total, member) =>
            total + Number(member.amountPaid),
        0
    );

    const handleOpenDetails = (member) => {
        setSelectedMember(member);
        setDetailsOpen(true);
    };

    const handleCloseDetails = () => {
        setSelectedMember(null);
        setDetailsOpen(false);
    };

    const handleOpenMenu = (event, member) => {
        setMenuAnchor(event.currentTarget);
        setMenuMember(member);
    };

    const handleCloseMenu = () => {
        setMenuAnchor(null);
        setMenuMember(null);
    };

    const handleToggleStatus = () => {
        if (!menuMember) return;

        setMembers((previous) =>
            previous.map((member) =>
                member.id === menuMember.id
                    ? {
                          ...member,
                          status:
                              member.status ===
                              "ACTIVE"
                                  ? "SUSPENDED"
                                  : "ACTIVE",
                      }
                    : member
            )
        );

        handleCloseMenu();
        setSaved(true);
    };

    const handleClearFilters = () => {
        setSearch("");
        setStatusFilter("ALL");
        setPlanFilter("ALL");
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
                        Members
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Manage library members and
                        their membership activity.
                    </Typography>
                </Box>

                <Button
                    variant="outlined"
                    startIcon={<CardMembership />}
                >
                    Membership Plans
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
                    Member status updated
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
                                    <Person />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total Members
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {
                                            members.length
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
                                Active Members
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                                color="success.main"
                                mt={0.5}
                            >
                                {activeMembers}
                            </Typography>
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
                                Expired
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                                color="error.main"
                                mt={0.5}
                            >
                                {expiredMembers}
                            </Typography>
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
                                Membership Revenue
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                                mt={0.5}
                            >
                                ₹
                                {membershipRevenue.toLocaleString(
                                    "en-IN"
                                )}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {totalBookings} total
                                bookings
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
                            placeholder="Search member, email, phone or ID..."
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
                                minWidth: 170,
                            }}
                        >
                            <InputLabel>
                                Status
                            </InputLabel>

                            <Select
                                value={statusFilter}
                                label="Status"
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

                                <MenuItem value="ACTIVE">
                                    Active
                                </MenuItem>

                                <MenuItem value="EXPIRED">
                                    Expired
                                </MenuItem>

                                <MenuItem value="SUSPENDED">
                                    Suspended
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl
                            size="small"
                            sx={{
                                minWidth: 180,
                            }}
                        >
                            <InputLabel>
                                Membership Plan
                            </InputLabel>

                            <Select
                                value={planFilter}
                                label="Membership Plan"
                                onChange={(event) => {
                                    setPlanFilter(
                                        event.target
                                            .value
                                    );
                                    setPage(0);
                                }}
                            >
                                <MenuItem value="ALL">
                                    All Plans
                                </MenuItem>

                                <MenuItem value="DAILY">
                                    Daily Pass
                                </MenuItem>

                                <MenuItem value="MONTHLY">
                                    Monthly Pass
                                </MenuItem>

                                <MenuItem value="QUARTERLY">
                                    Quarterly Pass
                                </MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="outlined"
                            onClick={
                                handleClearFilters
                            }
                        >
                            Clear
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Members Table */}
            <Card>
                <CardContent sx={{ p: 0 }}>
                    <Box
                        sx={{
                            p: 2.5,
                            borderBottom:
                                "1px solid",
                            borderColor:
                                "divider",
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Member List
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {
                                filteredMembers.length
                            }{" "}
                            member
                            {filteredMembers.length !==
                            1
                                ? "s"
                                : ""}{" "}
                            found
                        </Typography>
                    </Box>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        Member
                                    </TableCell>

                                    <TableCell>
                                        Membership
                                    </TableCell>

                                    <TableCell>
                                        Validity
                                    </TableCell>

                                    <TableCell>
                                        Bookings
                                    </TableCell>

                                    <TableCell>
                                        Paid
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
                                {filteredMembers
                                    .slice(
                                        page *
                                            rowsPerPage,
                                        page *
                                            rowsPerPage +
                                            rowsPerPage
                                    )
                                    .map(
                                        (member) => (
                                            <TableRow
                                                key={
                                                    member.id
                                                }
                                                hover
                                            >
                                                <TableCell>
                                                    <Stack
                                                        direction="row"
                                                        spacing={
                                                            1.5
                                                        }
                                                        alignItems="center"
                                                    >
                                                        <Avatar
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                bgcolor:
                                                                    "primary.light",
                                                                color:
                                                                    "primary.main",
                                                                fontSize:
                                                                    "0.875rem",
                                                                fontWeight: 700,
                                                            }}
                                                        >
                                                            {member.name
                                                                .charAt(
                                                                    0
                                                                )
                                                                .toUpperCase()}
                                                        </Avatar>

                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                fontWeight={
                                                                    700
                                                                }
                                                            >
                                                                {
                                                                    member.name
                                                                }
                                                            </Typography>

                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                            >
                                                                {
                                                                    member.id
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
                                                        {
                                                            member.plan
                                                        }
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {
                                                            member.planType
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            600
                                                        }
                                                    >
                                                        {formatDate(
                                                            member.joinedDate
                                                        )}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        to{" "}
                                                        {formatDate(
                                                            member.expiryDate
                                                        )}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <Stack
                                                        direction="row"
                                                        spacing={
                                                            1
                                                        }
                                                        alignItems="center"
                                                    >
                                                        <EventSeat fontSize="small" />

                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={
                                                                600
                                                            }
                                                        >
                                                            {
                                                                member.totalBookings
                                                            }
                                                        </Typography>
                                                    </Stack>
                                                </TableCell>

                                                <TableCell>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={
                                                            700
                                                        }
                                                    >
                                                        ₹
                                                        {member.amountPaid.toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </Typography>
                                                </TableCell>

                                                <TableCell>
                                                    <MemberStatusChip
                                                        status={
                                                            member.status
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
                                                                    member
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
                                                                    member
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

                                {filteredMembers.length ===
                                    0 && (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            align="center"
                                        >
                                            <Box
                                                sx={{
                                                    py: 8,
                                                }}
                                            >
                                                <Person
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
                                                    No members
                                                    found
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
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
                            filteredMembers.length
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
                        if (menuMember) {
                            handleOpenDetails(
                                menuMember
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

                <MenuItem
                    onClick={handleToggleStatus}
                >
                    {menuMember?.status ===
                    "ACTIVE"
                        ? "Suspend Member"
                        : "Activate Member"}
                </MenuItem>
            </Menu>

            {/* Details Dialog */}
            <MemberDetailsDialog
                member={selectedMember}
                open={detailsOpen}
                onClose={handleCloseDetails}
            />
        </Box>
    );
}

export default Members;