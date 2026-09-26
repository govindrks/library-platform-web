import { Box, Grid, Stack, Typography } from "@mui/material";

import PageHeader from "../Common/Components/PageHeader";

import DashboardStats from "./components/DashboardStats";
import QuickActions from "./components/QuickActions";
import RevenueChart from "./components/RevenueChart";
import OccupancyCard from "./components/OccupancyCard";
import BookingOverview from "./components/BookingOverview";
import RecentBookings from "./components/RecentBookings";
import RecentPayments from "./components/RecentPayments";
import RecentActivity from "./components/RecentActivity";

function Dashboard() {
    return (
        <Stack spacing={3}>
            {/* Header */}
            <PageHeader
                title="Good morning, Govind 👋"
                subtitle="Here's what's happening in your library today."
                actions={<QuickActions />}
            />

            {/* KPI Cards */}
            <DashboardStats />

            {/* Revenue + Occupancy */}
            <Grid container spacing={3}>
                <Grid
                    size={{
                        xs: 12,
                        lg: 8,
                    }}
                >
                    <RevenueChart />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        lg: 4,
                    }}
                >
                    <OccupancyCard />
                </Grid>
            </Grid>

            {/* Booking Overview */}
            <BookingOverview />

            {/* Recent Bookings */}
            <RecentBookings />

            {/* Payments + Activity */}
            <Grid container spacing={3}>
                <Grid
                    size={{
                        xs: 12,
                        lg: 7,
                    }}
                >
                    <RecentPayments />
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        lg: 5,
                    }}
                >
                    <RecentActivity />
                </Grid>
            </Grid>

            <Box sx={{ pb: 2 }}>
                <Typography
                    variant="caption"
                    color="text.disabled"
                >
                    LibraryHub Management Platform
                </Typography>
            </Box>
        </Stack>
    );
}

export default Dashboard;