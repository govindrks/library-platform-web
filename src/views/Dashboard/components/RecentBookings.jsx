import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

function RecentBookings({ bookings = [] }) {

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "-";
        }

        return parsedDate.toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatAmount = (amount) => {
        return `₹${Number(amount ?? 0).toLocaleString("en-IN")}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "ACTIVE":
                return "success";

            case "PENDING_PAYMENT":
                return "warning";

            case "CANCELLED":
                return "error";

            case "EXPIRED":
                return "default";

            default:
                return "default";
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case "ACTIVE":
                return "Confirmed";

            case "PENDING_PAYMENT":
                return "Pending";

            case "CANCELLED":
                return "Cancelled";

            case "EXPIRED":
                return "Expired";

            default:
                return status || "-";
        }
    };

    return (
        <Card
            sx={{
                borderRadius: 3,
            }}
        >
            <CardContent sx={{ p: 0 }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                        px: 3,
                        py: 2.5,
                    }}
                >
                    <BoxTitle />
                </Stack>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Booking
                                </TableCell>

                                <TableCell>
                                    Student
                                </TableCell>

                                <TableCell>
                                    Seat
                                </TableCell>

                                <TableCell>
                                    Date
                                </TableCell>

                                <TableCell>
                                    Status
                                </TableCell>

                                <TableCell align="right">
                                    Amount
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {bookings.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={6}
                                        align="center"
                                    >
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ py: 3 }}
                                        >
                                            No recent bookings
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookings.map((booking) => (
                                    <TableRow
                                        key={booking.bookingId}
                                        hover
                                    >
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                #
                                                {booking.bookingId}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                            >
                                                {booking.studentName ||
                                                    "Unknown"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                fontWeight={500}
                                            >
                                                {booking.seatNumber ||
                                                    "-"}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {formatDate(
                                                    booking.bookingDate ||
                                                        booking.startDate
                                                )}
                                            </Typography>
                                        </TableCell>

                                        <TableCell>
                                            <Chip
                                                label={getStatusLabel(
                                                    booking.status
                                                )}
                                                color={getStatusColor(
                                                    booking.status
                                                )}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>

                                        <TableCell align="right">
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {formatAmount(
                                                    booking.amount
                                                )}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </CardContent>
        </Card>
    );
}

function BoxTitle() {
    return (
        <Typography
            variant="h6"
            fontWeight={600}
        >
            Recent Bookings
        </Typography>
    );
}

export default RecentBookings;