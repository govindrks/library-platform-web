import {
    Box,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    Typography,
} from "@mui/material";

const occupancyData = [
    {
        label: "Occupied",
        value: 78.4,
        seats: 941,
    },
    {
        label: "Available",
        value: 16.2,
        seats: 194,
    },
    {
        label: "Reserved",
        value: 5.4,
        seats: 65,
    },
];

function OccupancyCard() {
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Typography variant="h6">
                    Seat Occupancy
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                >
                    Current seat utilization
                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        my: 3,
                    }}
                >
                    <Box
                        sx={{
                            width: 150,
                            height: 150,
                            borderRadius: "50%",
                            border: "18px solid",
                            borderColor: "primary.light",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Box sx={{ textAlign: "center" }}>
                            <Typography
                                variant="h4"
                                fontWeight={700}
                            >
                                78.4%
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Occupied
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Stack spacing={2}>
                    {occupancyData.map((item) => (
                        <Box key={item.label}>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                sx={{ mb: 0.75 }}
                            >
                                <Typography variant="body2">
                                    {item.label}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                >
                                    {item.seats} seats
                                </Typography>
                            </Stack>

                            <LinearProgress
                                variant="determinate"
                                value={item.value}
                                sx={{
                                    height: 6,
                                    borderRadius: 5,
                                    backgroundColor:
                                        "secondary.light",
                                }}
                            />
                        </Box>
                    ))}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default OccupancyCard;