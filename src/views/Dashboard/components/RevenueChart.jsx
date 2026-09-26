import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";

const data = [
    {
        month: "Apr",
        revenue: 18000,
    },
    {
        month: "May",
        revenue: 21000,
    },
    {
        month: "Jun",
        revenue: 19500,
    },
    {
        month: "Jul",
        revenue: 23000,
    },
    {
        month: "Aug",
        revenue: 21800,
    },
    {
        month: "Sep",
        revenue: 24850,
    },
];

function RevenueChart() {
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography variant="h6">
                            Revenue Overview
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Monthly revenue performance
                        </Typography>
                    </Box>

                    <Typography
                        variant="h6"
                        color="primary.main"
                    >
                        ₹24,850
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        width: "100%",
                        height: 300,
                    }}
                >
                    <ResponsiveContainer
                        width="100%"
                        height="100%"
                    >
                        <LineChart data={data}>
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                            />

                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                            />

                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) =>
                                    `₹${value / 1000}k`
                                }
                            />

                            <Tooltip
                                formatter={(value) =>
                                    `₹${Number(value).toLocaleString(
                                        "en-IN"
                                    )}`
                                }
                            />

                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#4F46E5"
                                strokeWidth={3}
                                dot={{
                                    r: 4,
                                }}
                                activeDot={{
                                    r: 6,
                                }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </CardContent>
        </Card>
    );
}

export default RevenueChart;