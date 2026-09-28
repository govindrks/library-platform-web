import React, { useMemo, useState } from "react";
import {
    Box,
    Button,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";

import SeatChangeRequestCard
    from "./components/SeatChangeRequestCard";

import SeatChangeRequestDetails
    from "./SeatChangeRequestDetails";

const mockRequests = [
    {
        id: 1001,
        bookingId: 501,
        libraryId: 1,
        libraryName: "GNC Central Library",
        currentSeatId: 12,
        currentSeatNumber: "A3",
        requestedSeatId: 18,
        requestedSeatNumber: "D2",
        reason: "I would prefer a quieter seat near the reading area.",
        status: "PENDING",
        ownerComment: null,
        requestedAt: "2026-09-25T10:30:00",
        reviewedAt: null,
    },
    {
        id: 1002,
        bookingId: 498,
        libraryId: 1,
        libraryName: "GNC Central Library",
        currentSeatId: 7,
        currentSeatNumber: "B2",
        requestedSeatId: 15,
        requestedSeatNumber: "C5",
        reason: "I need a seat closer to the charging point.",
        status: "APPROVED",
        ownerComment: "Seat change approved.",
        requestedAt: "2026-09-22T09:15:00",
        reviewedAt: "2026-09-22T11:20:00",
    },
    {
        id: 1003,
        bookingId: 490,
        libraryId: 2,
        libraryName: "Knowledge Point Library",
        currentSeatId: 20,
        currentSeatNumber: "D4",
        requestedSeatId: 22,
        requestedSeatNumber: "E1",
        reason: "I need a seat with better lighting.",
        status: "REJECTED",
        ownerComment:
            "The requested seat is already reserved.",
        requestedAt: "2026-09-20T14:00:00",
        reviewedAt: "2026-09-20T15:30:00",
    },
];

function MySeatChangeRequests() {
    const [selectedRequest, setSelectedRequest] =
        useState(null);

    const requests = useMemo(
        () => mockRequests,
        []
    );

    return (
        <Box>
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
                mb={3}
            >
                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        Seat Change Requests
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Track your seat change requests and
                        their approval status.
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                        console.log(
                            "Navigate to request seat change"
                        )
                    }
                >
                    Request Seat Change
                </Button>
            </Stack>

            <Grid container spacing={2}>
                {requests.map((request) => (
                    <Grid
                        item
                        xs={12}
                        md={6}
                        key={request.id}
                    >
                        <SeatChangeRequestCard
                            request={request}
                            onView={setSelectedRequest}
                        />
                    </Grid>
                ))}
            </Grid>

            {selectedRequest && (
                <SeatChangeRequestDetails
                    request={selectedRequest}
                    open={Boolean(selectedRequest)}
                    onClose={() =>
                        setSelectedRequest(null)
                    }
                />
            )}
        </Box>
    );
}

export default MySeatChangeRequests;