import { Chip } from "@mui/material";

const statusConfig = {
    ACTIVE: {
        label: "Active",
        color: "success",
    },
    USED: {
        label: "Used",
        color: "info",
    },
    EXPIRED: {
        label: "Expired",
        color: "default",
    },
    DEACTIVATED: {
        label: "Deactivated",
        color: "warning",
    },
};

function CouponStatusChip({ status }) {
    const config = statusConfig[status] || {
        label: status,
        color: "default",
    };

    return (
        <Chip
            label={config.label}
            color={config.color}
            size="small"
            sx={{
                fontWeight: 600,
            }}
        />
    );
}

export default CouponStatusChip;