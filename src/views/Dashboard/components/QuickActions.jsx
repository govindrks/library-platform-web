import {
    Add,
    EventSeat,
    PersonAdd,
    ReceiptLong,
} from "@mui/icons-material";

import {
    Button,
    Stack,
} from "@mui/material";

function QuickActions() {
    return (
        <Stack
            direction={{
                xs: "column",
                sm: "row",
            }}
            spacing={1.5}
        >
            <Button
                variant="contained"
                startIcon={<PersonAdd />}
            >
                Add Member
            </Button>

            <Button
                variant="outlined"
                startIcon={<EventSeat />}
            >
                Manage Seats
            </Button>

            <Button
                variant="outlined"
                startIcon={<ReceiptLong />}
            >
                View Payments
            </Button>

            <Button
                variant="outlined"
                startIcon={<Add />}
            >
                New Booking
            </Button>
        </Stack>
    );
}

export default QuickActions;