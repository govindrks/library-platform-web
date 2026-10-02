import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";

import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";

function RevenueChart({ analytics }) {

    const revenueTrend =
        analytics?.monthlyRevenueTrend ?? [];

    const chartData = revenueTrend.map((item) => ({
        month: formatMonth(item.label),
        revenue: Number(item.revenue ?? 0),
    }));

    const totalRevenue = Number(
        analytics?.monthlyRevenue ?? 0
    );

    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
            }}
        >
            <CardContent>
                <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 3 }}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={600}
                        >
                            Revenue Trend
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
                        fontWeight={700}
                    >
                        ₹
                        {totalRevenue.toLocaleString(
                            "en-IN"
                        )}
                    </Typography>
                </Stack>

                {chartData.length === 0 ? (
                    <Box
                        sx={{
                            height: 300,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            No revenue data available
                        </Typography>
                    </Box>
                ) : (
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
                            <AreaChart
                                data={chartData}
                                margin={{
                                    top: 10,
                                    right: 10,
                                    left: 0,
                                    bottom: 0,
                                }}
                            >
                                <CartesianGrid
                                    strokeDasharray="3 3"
                                    vertical={false}
                                />

                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={formatYAxis}
                                />

                                <Tooltip
                                    formatter={(value) =>
                                        `₹${Number(
                                            value
                                        ).toLocaleString(
                                            "en-IN"
                                        )}`
                                    }
                                    labelFormatter={(label) =>
                                        `Month: ${label}`
                                    }
                                />

                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    strokeWidth={2}
                                    fillOpacity={0.15}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
}

function formatMonth(value) {
    if (!value) {
        return "-";
    }

    const month = String(value)
        .toLowerCase();

    return (
        month.charAt(0).toUpperCase() +
        month.slice(1, 3)
    );
}

function formatYAxis(value) {
    const number = Number(value);

    if (number >= 100000) {
        return `₹${(number / 100000).toFixed(1)}L`;
    }

    if (number >= 1000) {
        return `₹${(number / 1000).toFixed(0)}K`;
    }

    return `₹${number}`;
}

export default RevenueChart;