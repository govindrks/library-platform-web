import React from "react";
import { Chip } from "@mui/material";

function SeatChangeRequestStatus({ status }) {
    const config = {
        PENDING: {
            label: "Pending",
            color: "warning",
        },
        APPROVED: {
            label: "Approved",
            color: "success",
        },
        REJECTED: {
            label: "Rejected",
            color: "error",
        },
    };

    const current = config[status] || {
        label: status,
        color: "default",
    };

    return (
        <Chip
            label={current.label}
            color={current.color}
            size="small"
            variant="outlined"
        />
    );
}

export default SeatChangeRequestStatus;