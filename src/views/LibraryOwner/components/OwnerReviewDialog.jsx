import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

function OwnerReviewDialog({
    open,
    request,
    action,
    onClose,
    onConfirm,
}) {
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setComment("");
            setError("");
        }
    }, [open, request, action]);

    if (!request) {
        return null;
    }

    const isApprove = action === "APPROVE";
    const isReject = action === "REJECT";

    const handleConfirm = () => {
        if (isReject && !comment.trim()) {
            setError(
                "Please provide a reason for rejecting this request."
            );
            return;
        }

        if (comment.trim().length > 500) {
            setError(
                "Comment cannot exceed 500 characters."
            );
            return;
        }

        onConfirm({
            requestId: request.id,
            status: isApprove
                ? "APPROVED"
                : "REJECTED",
            ownerComment: comment.trim(),
        });
    };

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
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {isApprove
                                ? "Approve Seat Change Request"
                                : "Reject Seat Change Request"}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.5}
                        >
                            Request #{request.id}
                        </Typography>
                    </Box>

                    <Button
                        onClick={onClose}
                        sx={{
                            minWidth: 40,
                            width: 40,
                            height: 40,
                            p: 0,
                        }}
                    >
                        <CloseIcon />
                    </Button>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    {/* Request summary */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor:
                                "background.default",
                            border: "1px solid",
                            borderColor: "divider",
                        }}
                    >
                        <Stack spacing={2}>
                            <Box>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    Member
                                </Typography>

                                <Typography
                                    fontWeight={600}
                                >
                                    {request.userName}
                                </Typography>
                            </Box>

                            <Divider />

                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="center"
                                spacing={3}
                            >
                                <Box textAlign="center">
                                    <EventSeatIcon
                                        color="action"
                                    />

                                    <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                    >
                                        Current Seat
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {
                                            request.currentSeatNumber
                                        }
                                    </Typography>
                                </Box>

                                <ArrowForwardIcon color="action" />

                                <Box textAlign="center">
                                    <EventSeatIcon
                                        color="primary"
                                    />

                                    <Typography
                                        variant="caption"
                                        display="block"
                                        color="text.secondary"
                                    >
                                        Requested Seat
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                        color="primary.main"
                                    >
                                        {
                                            request.requestedSeatNumber
                                        }
                                    </Typography>
                                </Box>
                            </Stack>
                        </Stack>
                    </Box>

                    {/* Reason */}
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={0.5}
                        >
                            Member's Reason
                        </Typography>

                        <Typography variant="body2">
                            {request.reason}
                        </Typography>
                    </Box>

                    {/* Approval warning */}
                    {isApprove && (
                        <Alert severity="info">
                            Approving this request will change
                            the member's booking from{" "}
                            <strong>
                                {request.currentSeatNumber}
                            </strong>{" "}
                            to{" "}
                            <strong>
                                {request.requestedSeatNumber}
                            </strong>
                            .
                        </Alert>
                    )}

                    {/* Rejection warning */}
                    {isReject && (
                        <Alert severity="warning">
                            The booking will remain on{" "}
                            <strong>
                                {request.currentSeatNumber}
                            </strong>{" "}
                            after rejection.
                        </Alert>
                    )}

                    {/* Owner comment */}
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={5}
                        label={
                            isReject
                                ? "Rejection Reason"
                                : "Owner Comment"
                        }
                        placeholder={
                            isReject
                                ? "Explain why this request is being rejected..."
                                : "Add an optional comment..."
                        }
                        value={comment}
                        onChange={(event) => {
                            setComment(
                                event.target.value
                            );
                            setError("");
                        }}
                        inputProps={{
                            maxLength: 500,
                        }}
                        helperText={`${comment.length}/500`}
                        error={Boolean(error)}
                    />

                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    variant="outlined"
                    onClick={onClose}
                >
                    Cancel
                </Button>

                {isApprove && (
                    <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={handleConfirm}
                    >
                        Confirm Approval
                    </Button>
                )}

                {isReject && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<CancelOutlinedIcon />}
                        onClick={handleConfirm}
                    >
                        Confirm Rejection
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

export default OwnerReviewDialog;