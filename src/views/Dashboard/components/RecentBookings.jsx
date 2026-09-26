import {
    ArrowForward,
} from "@mui/icons-material";

import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
} from "@mui/material";

const bookings = [
    {
        id: "#BK-10245",
        member: "Rahul Kumar",
        seat: "A-024",
        date: "26 Sep 2026",
        time: "09:00 AM",
        status: "Confirmed",
    },
    {
        id: "#BK-10244",
        member: "Priya Singh",
        seat: "B-018",
        date: "26 Sep 2026",
        time: "10:30 AM",
        status: "Confirmed",
    },
    {
        id: "#BK-10243",
        member: "Amit Kumar",
        seat: "C-032",
        date: "26 Sep 2026",
        time: "11:00 AM",
        status: "Pending",
    },
    {
        id: "#BK-10242",
        member: "Neha Sharma",
        seat: "A-011",
        date: "26 Sep 2026",
        time: "12:00 PM",
        status: "Confirmed",
    },
];

function RecentBookings() {
    return (
        <Card>
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mb: 2 }}
                >
                    <Box>
                        <Typography variant="h6">
                            Recent Bookings
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Latest seat bookings
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        endIcon={<ArrowForward />}
                    >
                        View All
                    </Button>
                </Stack>

                <Box sx={{ overflowX: "auto" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>
                                    Booking ID
                                </TableCell>

                                <TableCell>
                                    Member
                                </TableCell>

                                <TableCell>
                                    Seat
                                </TableCell>

                                <TableCell>
                                    Date
                                </TableCell>

                                <TableCell>
                                    Time
                                </TableCell>

                                <TableCell>
                                    Status
                                </TableCell>
                            </TableRow>
                        </TableHead>

                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell>
                                        <Typography
                                            variant="body2"
                                            fontWeight={600}
                                        >
                                            {booking.id}
                                        </Typography>
                                    </TableCell>

                                    <TableCell>
                                        {booking.member}
                                    </TableCell>

                                    <TableCell>
                                        {booking.seat}
                                    </TableCell>

                                    <TableCell>
                                        {booking.date}
                                    </TableCell>

                                    <TableCell>
                                        {booking.time}
                                    </TableCell>

                                    <TableCell>
                                        <Chip
                                            label={booking.status}
                                            size="small"
                                            color={
                                                booking.status ===
                                                "Confirmed"
                                                    ? "success"
                                                    : "warning"
                                            }
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </CardContent>
        </Card>
    );
}

export default RecentBookings;