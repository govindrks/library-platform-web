import React from "react";
import {
    Card,
    CardContent,
    Stack,
    Typography,
    Divider,
    Button,
} from "@mui/material";

import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SeatChangeRequestStatus from "./SeatChangeRequestStatus";

function SeatChangeRequestCard({
    request,
    onView,
}) {
    return (
        <Card>
            <CardContent>
                <Stack spacing={2}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography fontWeight={700}>
                            Request #{request.id}
                        </Typography>

                        <SeatChangeRequestStatus
                            status={request.status}
                        />
                    </Stack>

                    <Divider />

                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                        alignItems={{
                            xs: "flex-start",
                            sm: "center",
                        }}
                    >
                        <Stack>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Current Seat
                            </Typography>

                            <Typography fontWeight={600}>
                                {request.currentSeatNumber}
                            </Typography>
                        </Stack>

                        <ArrowForwardIcon
                            color="action"
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "block",
                                },
                            }}
                        />

                        <Stack>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Requested Seat
                            </Typography>

                            <Typography fontWeight={600}>
                                {request.requestedSeatNumber}
                            </Typography>
                        </Stack>
                    </Stack>

                    <Stack>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Reason
                        </Typography>

                        <Typography variant="body2">
                            {request.reason}
                        </Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        justifyContent="flex-end"
                    >
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => onView(request)}
                        >
                            View Details
                        </Button>
                    </Stack>
                </Stack>
            </CardContent>
        </Card>
    );
}

export default SeatChangeRequestCard;