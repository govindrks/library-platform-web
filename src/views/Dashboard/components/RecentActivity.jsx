import {
    Box,
    Card,
    CardContent,
    Divider,
    Stack,
    Typography,
} from "@mui/material";

import {
    EventSeat,
    Login,
    Logout,
    CardMembership,
} from "@mui/icons-material";

function RecentActivity({ activities = [] }) {

    const getActivityIcon = (activity) => {
        switch (activity?.activityType) {
            case "CHECK_IN":
                return Login;

            case "CHECK_OUT":
                return Logout;

            case "SEAT_BOOKED":
                return EventSeat;

            case "SUBSCRIPTION_CREATED":
            case "SUBSCRIPTION_EXPIRED":
                return CardMembership;

            default:
                return EventSeat;
        }
    };

    const getActivityColor = (activity) => {
        switch (activity?.activityType) {
            case "CHECK_IN":
                return "success.main";

            case "CHECK_OUT":
                return "warning.main";

            case "SEAT_BOOKED":
                return "primary.main";

            case "SUBSCRIPTION_CREATED":
                return "info.main";

            case "SUBSCRIPTION_EXPIRED":
                return "error.main";

            default:
                return "primary.main";
        }
    };

    const formatTimeAgo = (date) => {
        if (!date) {
            return "-";
        }

        const activityDate = new Date(date);

        if (Number.isNaN(activityDate.getTime())) {
            return "-";
        }

        const now = new Date();

        const difference =
            Math.max(
                0,
                now.getTime() - activityDate.getTime()
            );

        const seconds = Math.floor(
            difference / 1000
        );

        if (seconds < 60) {
            return "Just now";
        }

        const minutes = Math.floor(
            seconds / 60
        );

        if (minutes < 60) {
            return `${minutes} ${
                minutes === 1 ? "minute" : "minutes"
            } ago`;
        }

        const hours = Math.floor(
            minutes / 60
        );

        if (hours < 24) {
            return `${hours} ${
                hours === 1 ? "hour" : "hours"
            } ago`;
        }

        const days = Math.floor(
            hours / 24
        );

        if (days < 7) {
            return `${days} ${
                days === 1 ? "day" : "days"
            } ago`;
        }

        return activityDate.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    fontWeight={600}
                    sx={{ mb: 2 }}
                >
                    Recent Activity
                </Typography>

                {activities.length === 0 ? (
                    <Box
                        sx={{
                            py: 5,
                            textAlign: "center",
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            No recent activity
                        </Typography>
                    </Box>
                ) : (
                    <Stack divider={<Divider />}>
                        {activities.slice(0, 5).map(
                            (activity, index) => {
                                const Icon =
                                    getActivityIcon(
                                        activity
                                    );

                                const iconColor =
                                    getActivityColor(
                                        activity
                                    );

                                return (
                                    <Stack
                                        key={
                                            activity.referenceId ??
                                            `${activity.activityType}-${index}`
                                        }
                                        direction="row"
                                        spacing={1.5}
                                        sx={{
                                            py: 1.5,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 38,
                                                height: 38,
                                                borderRadius: 2,
                                                display: "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                bgcolor:
                                                    "action.hover",
                                                color: iconColor,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Icon fontSize="small" />
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth: 0,
                                                flex: 1,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {activity.title ||
                                                    "Activity"}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display:
                                                        "block",
                                                }}
                                            >
                                                {activity.description ||
                                                    activity.studentName ||
                                                    "-"}
                                            </Typography>

                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                            >
                                                {formatTimeAgo(
                                                    activity.activityTime
                                                )}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                );
                            }
                        )}
                    </Stack>
                )}
            </CardContent>
        </Card>
    );
}

export default RecentActivity;