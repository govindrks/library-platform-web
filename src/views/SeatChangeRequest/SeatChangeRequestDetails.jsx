import React from "react";
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import SeatChangeRequestStatus
    from "./components/SeatChangeRequestStatus";

function SeatChangeRequestDetails({
    request,
    open,
    onClose,
}) {
    if (!request) return null;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        Seat Change Request
                    </Typography>

                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Request #{request.id}
                        </Typography>

                        <SeatChangeRequestStatus
                            status={request.status}
                        />
                    </Stack>

                    <Divider />

                    <Stack spacing={1}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Library
                        </Typography>

                        <Typography fontWeight={600}>
                            {request.libraryName}
                        </Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        spacing={3}
                        alignItems="center"
                    >
                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Current Seat
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {request.currentSeatNumber}
                            </Typography>
                        </Box>

                        <ArrowForwardIcon color="action" />

                        <Box>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Requested Seat
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {request.requestedSeatNumber}
                            </Typography>
                        </Box>
                    </Stack>

                    <Stack spacing={1}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            Reason
                        </Typography>

                        <Typography>
                            {request.reason}
                        </Typography>
                    </Stack>

                    {request.ownerComment && (
                        <Stack spacing={1}>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                Owner Comment
                            </Typography>

                            <Typography>
                                {request.ownerComment}
                            </Typography>
                        </Stack>
                    )}

                    <Stack spacing={0.5}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            Requested At
                        </Typography>

                        <Typography variant="body2">
                            {new Date(
                                request.requestedAt
                            ).toLocaleString()}
                        </Typography>
                    </Stack>

                    {request.reviewedAt && (
                        <Stack spacing={0.5}>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Reviewed At
                            </Typography>

                            <Typography variant="body2">
                                {new Date(
                                    request.reviewedAt
                                ).toLocaleString()}
                            </Typography>
                        </Stack>
                    )}
                </Stack>
            </DialogContent>
        </Dialog>
    );
}

export default SeatChangeRequestDetails;