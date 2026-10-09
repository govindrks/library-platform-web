import React from "react";

import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from "@mui/material";

import {
  Assessment,
  EventAvailable,
  EventSeat,
  Groups,
  Payments,
  Replay,
  TrendingUp,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";

// ============================================================
// REPORT DEFINITIONS
// ============================================================

const reports = [
  {
    title: "Booking Report",
    description:
      "Analyze booking activity, booking status, seat reservations and slot performance.",
    path: "/owner/reports/bookings",
    icon: EventAvailable,
    category: "Operations",
  },
  {
    title: "Revenue Report",
    description:
      "Review gross revenue, refunds, net revenue and transaction performance.",
    path: "/owner/reports/revenue",
    icon: TrendingUp,
    category: "Finance",
  },
  {
    title: "Occupancy Report",
    description:
      "Monitor seat utilization, occupied capacity and occupancy performance.",
    path: "/owner/reports/occupancy",
    icon: EventSeat,
    category: "Operations",
  },
  {
    title: "Payment Report",
    description:
      "Review the complete payment ledger including successful, failed and refunded payments.",
    path: "/owner/reports/payments",
    icon: Payments,
    category: "Finance",
  },
  {
    title: "Refund Report",
    description:
      "Track refund requests, processing status, successful refunds and failed refunds.",
    path: "/owner/reports/refunds",
    icon: Replay,
    category: "Finance",
  },
  {
    title: "Membership Report",
    description:
      "Analyze library memberships, active subscriptions and membership performance.",
    path: "/owner/reports/membership",
    icon: Groups,
    category: "Membership",
  },
];

// ============================================================
// COMPONENT
// ============================================================

function Reports() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* ==================================================
                HEADER
            ================================================== */}

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
        mb={4}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Reports
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Generate, analyze and export operational, membership and financial
            reports for your library.
          </Typography>
        </Box>

        <Chip
          icon={<Assessment />}
          label={`${reports.length} Report Types`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      {/* ==================================================
                REPORT CARDS
            ================================================== */}

      <Grid container spacing={3}>
        {reports.map((report) => {
          const Icon = report.icon;

          return (
            <Grid item xs={12} sm={6} lg={4} key={report.path}>
              <Card
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  boxShadow: "none",

                  transition: "all 0.2s ease",

                  "&:hover": {
                    boxShadow: 4,
                    transform: "translateY(-3px)",
                    borderColor: "primary.light",
                  },
                }}
              >
                <CardActionArea
                  onClick={() => navigate(report.path)}
                  sx={{
                    height: "100%",
                  }}
                >
                  <CardContent
                    sx={{
                      p: 3,
                      height: "100%",
                    }}
                  >
                    <Stack spacing={2} height="100%">
                      {/* ICON */}

                      <Box
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "primary.light",
                          color: "primary.main",
                        }}
                      >
                        <Icon />
                      </Box>

                      {/* CATEGORY */}

                      <Box>
                        <Chip
                          size="small"
                          label={report.category}
                          variant="outlined"
                          sx={{
                            mb: 1.5,
                          }}
                        />

                        <Typography variant="h6" fontWeight={700}>
                          {report.title}
                        </Typography>
                      </Box>

                      {/* DESCRIPTION */}

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          flexGrow: 1,
                        }}
                      >
                        {report.description}
                      </Typography>

                      {/* CTA */}

                      <Typography
                        variant="body2"
                        color="primary.main"
                        fontWeight={600}
                      >
                        View Report →
                      </Typography>
                    </Stack>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}

export default Reports;
