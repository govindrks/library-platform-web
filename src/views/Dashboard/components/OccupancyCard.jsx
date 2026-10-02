import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";

import { PieChart } from "@mui/x-charts/PieChart";

function OccupancyCard({ statistics }) {
    const totalSeats = Number(statistics?.totalSeats ?? 0);

    const occupiedSeats = Number(
        statistics?.occupiedSeats ?? 0
    );

    const availableSeats = Number(
        statistics?.availableSeats ?? 0
    );

    /*
     * Reserved seats are not currently provided as a separate
     * dashboard statistic.
     *
     * Therefore we calculate the remaining physical seats.
     *
     * If the backend later exposes reservedSeats explicitly,
     * this calculation can be replaced with that value.
     */
    const reservedSeats = Math.max(
        totalSeats - occupiedSeats - availableSeats,
        0
    );

    const occupancyPercentage =
        totalSeats > 0
            ? (occupiedSeats / totalSeats) * 100
            : 0;

    const availablePercentage =
        totalSeats > 0
            ? (availableSeats / totalSeats) * 100
            : 0;

    const reservedPercentage =
        totalSeats > 0
            ? (reservedSeats / totalSeats) * 100
            : 0;

    const occupancyData = [
        {
            id: 0,
            label: "Occupied",
            value: occupiedSeats,
        },
        {
            id: 1,
            label: "Available",
            value: availableSeats,
        },
        {
            id: 2,
            label: "Reserved",
            value: reservedSeats,
        },
    ];

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
                    gutterBottom
                >
                    Seat Occupancy
                </Typography>

                <Stack
                    direction="row"
                    spacing={3}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box
                        sx={{
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <PieChart
                            width={180}
                            height={180}
                            series={[
                                {
                                    data: occupancyData,
                                    innerRadius: 58,
                                    outerRadius: 78,
                                    paddingAngle: 2,
                                    cornerRadius: 4,
                                    startAngle: -90,
                                    endAngle: 270,
                                },
                            ]}
                            slotProps={{
                                legend: {
                                    hidden: true,
                                },
                            }}
                        />

                        <Box
                            sx={{
                                position: "absolute",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {occupancyPercentage.toFixed(1)}%
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Occupied
                            </Typography>
                        </Box>
                    </Box>

                    <Stack spacing={2} sx={{ flex: 1 }}>
                        <OccupancyItem
                            label="Occupied"
                            percentage={occupancyPercentage}
                            seats={occupiedSeats}
                        />

                        <OccupancyItem
                            label="Available"
                            percentage={availablePercentage}
                            seats={availableSeats}
                        />

                        <OccupancyItem
                            label="Reserved"
                            percentage={reservedPercentage}
                            seats={reservedSeats}
                        />
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

function OccupancyItem({
    label,
    percentage,
    seats,
}) {
    return (
        <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
        >
            <Stack
                direction="row"
                spacing={1}
                alignItems="center"
            >
                <Box
                    sx={{
                        width: 9,
                        height: 9,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                    }}
                />

                <Typography variant="body2">
                    {label}
                </Typography>
            </Stack>

            <Typography
                variant="body2"
                fontWeight={600}
            >
                {percentage.toFixed(1)}%
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
            >
                {seats}
            </Typography>
        </Stack>
    );
}

export default OccupancyCard;