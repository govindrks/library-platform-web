import {
    EventSeat,
    Payment,
    PersonAdd,
} from "@mui/icons-material";

import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";

const activities = [
    {
        title: "New member registered",
        description: "Rahul Kumar joined the library",
        time: "10 minutes ago",
        icon: PersonAdd,
    },
    {
        title: "Payment received",
        description: "₹1,500 payment received from Priya Singh",
        time: "35 minutes ago",
        icon: Payment,
    },
    {
        title: "Seat booking created",
        description: "Seat B-018 booked successfully",
        time: "1 hour ago",
        icon: EventSeat,
    },
];

function RecentActivity() {
    return (
        <Card>
            <CardContent>
                <Typography variant="h6">
                    Recent Activity
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, mb: 2 }}
                >
                    Latest activity in your library
                </Typography>

                <Stack spacing={2.5}>
                    {activities.map((activity) => {
                        const Icon = activity.icon;

                        return (
                            <Stack
                                key={activity.title}
                                direction="row"
                                spacing={1.5}
                            >
                                <Box
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        minWidth: 36,
                                        borderRadius: 2,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent:
                                            "center",
                                        backgroundColor:
                                            "primary.light",
                                        color: "primary.main",
                                    }}
                                >
                                    <Icon fontSize="small" />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                    >
                                        {activity.title}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {activity.description}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.disabled"
                                        sx={{
                                            display: "block",
                                            mt: 0.25,
                                        }}
                                    >
                                        {activity.time}
                                    </Typography>
                                </Box>
                            </Stack>
                        );
                    })}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default RecentActivity;