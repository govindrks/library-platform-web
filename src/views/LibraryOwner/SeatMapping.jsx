import {
    Add,
    DeleteOutline,
    Edit,
    EventSeat,
    Save,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import { useMemo, useState } from "react";

const createSeat = (row, number) => ({
    id: `${row}-${number}`,
    label: `${row}${number}`,
    row,
    number,
    status: "AVAILABLE",
});

const createInitialRows = () => [
    {
        id: 1,
        name: "A",
        seats: Array.from({ length: 5 }, (_, index) =>
            createSeat("A", index + 1)
        ),
    },
    {
        id: 2,
        name: "B",
        seats: Array.from({ length: 5 }, (_, index) =>
            createSeat("B", index + 1)
        ),
    },
    {
        id: 3,
        name: "C",
        seats: Array.from({ length: 5 }, (_, index) =>
            createSeat("C", index + 1)
        ),
    },
    {
        id: 4,
        name: "D",
        seats: Array.from({ length: 5 }, (_, index) =>
            createSeat("D", index + 1)
        ),
    },
];

function SeatMapping() {
    const [rows, setRows] = useState(createInitialRows);

    const [selectedSeat, setSelectedSeat] = useState(null);

    const [rowDialogOpen, setRowDialogOpen] =
        useState(false);

    const [rowName, setRowName] = useState("");

    const [seatDialogOpen, setSeatDialogOpen] =
        useState(false);

    const [saved, setSaved] = useState(false);

    const totalSeats = useMemo(
        () =>
            rows.reduce(
                (total, row) =>
                    total + row.seats.length,
                0
            ),
        [rows]
    );

    const availableSeats = useMemo(
        () =>
            rows.reduce(
                (total, row) =>
                    total +
                    row.seats.filter(
                        (seat) =>
                            seat.status === "AVAILABLE"
                    ).length,
                0
            ),
        [rows]
    );

    const disabledSeats = totalSeats - availableSeats;

    const handleSeatClick = (rowId, seatId) => {
        setRows((previous) =>
            previous.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          seats: row.seats.map((seat) =>
                              seat.id === seatId
                                  ? {
                                        ...seat,
                                        status:
                                            seat.status ===
                                            "AVAILABLE"
                                                ? "DISABLED"
                                                : "AVAILABLE",
                                    }
                                  : seat
                          ),
                      }
                    : row
            )
        );

        setSaved(false);
    };

    const handleAddRow = () => {
        const trimmedName = rowName
            .trim()
            .toUpperCase();

        if (!trimmedName) return;

        const alreadyExists = rows.some(
            (row) => row.name === trimmedName
        );

        if (alreadyExists) return;

        const newRow = {
            id: Date.now(),
            name: trimmedName,
            seats: Array.from(
                { length: 5 },
                (_, index) =>
                    createSeat(
                        trimmedName,
                        index + 1
                    )
            ),
        };

        setRows((previous) => [
            ...previous,
            newRow,
        ]);

        setRowName("");
        setRowDialogOpen(false);
        setSaved(false);
    };

    const handleDeleteRow = (rowId) => {
        setRows((previous) =>
            previous.filter(
                (row) => row.id !== rowId
            )
        );

        setSaved(false);
    };

    const handleAddSeat = (rowId) => {
        setRows((previous) =>
            previous.map((row) => {
                if (row.id !== rowId) {
                    return row;
                }

                const nextNumber =
                    row.seats.length + 1;

                return {
                    ...row,
                    seats: [
                        ...row.seats,
                        createSeat(
                            row.name,
                            nextNumber
                        ),
                    ],
                };
            })
        );

        setSaved(false);
    };

    const handleRemoveSeat = (rowId, seatId) => {
        setRows((previous) =>
            previous.map((row) =>
                row.id === rowId
                    ? {
                          ...row,
                          seats: row.seats.filter(
                              (seat) =>
                                  seat.id !== seatId
                          ),
                      }
                    : row
            )
        );

        setSelectedSeat(null);
        setSeatDialogOpen(false);
        setSaved(false);
    };

    const handleOpenSeatDetails = (row, seat) => {
        setSelectedSeat({
            rowId: row.id,
            rowName: row.name,
            seat,
        });

        setSeatDialogOpen(true);
    };

    const handleSaveLayout = () => {
        console.log(
            "Seat layout:",
            rows
        );

        setSaved(true);
    };

    return (
        <Box>
            {/* Header */}
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
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        Seat Mapping
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        Configure the physical seat
                        layout of your library.
                    </Typography>
                </Box>

                <Stack
                    direction="row"
                    spacing={1}
                >
                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() =>
                            setRowDialogOpen(true)
                        }
                    >
                        Add Row
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSaveLayout}
                    >
                        Save Seat Layout
                    </Button>
                </Stack>
            </Stack>

            {/* Success */}
            {saved && (
                <Alert
                    severity="success"
                    sx={{ mb: 3 }}
                    onClose={() =>
                        setSaved(false)
                    }
                >
                    Seat layout has been saved
                    successfully.
                </Alert>
            )}

            {/* Summary */}
            <Grid
                container
                spacing={2}
                mb={3}
            >
                <Grid
                    size={{
                        xs: 12,
                        sm: 4,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "primary.light",
                                        color:
                                            "primary.main",
                                    }}
                                >
                                    <EventSeat />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Total Seats
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {totalSeats}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 4,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "success.light",
                                        color:
                                            "success.main",
                                    }}
                                >
                                    <EventSeat />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Available
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {availableSeats}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid
                    size={{
                        xs: 12,
                        sm: 4,
                    }}
                >
                    <Card>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        display:
                                            "flex",
                                        alignItems:
                                            "center",
                                        justifyContent:
                                            "center",
                                        bgcolor:
                                            "error.light",
                                        color:
                                            "error.main",
                                    }}
                                >
                                    <EventSeat />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        Disabled
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {disabledSeats}
                                    </Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Library Layout */}
            <Card>
                <CardContent sx={{ p: 3 }}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={3}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                Library Layout
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mt={0.5}
                            >
                                Click a seat to enable or
                                disable it.
                            </Typography>
                        </Box>

                        <Chip
                            label={`${rows.length} Rows`}
                            variant="outlined"
                        />
                    </Stack>

                    {/* Entrance */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "center",
                            mb: 4,
                        }}
                    >
                        <Box
                            sx={{
                                px: 8,
                                py: 1.5,
                                borderRadius:
                                    "0 0 12px 12px",
                                backgroundColor:
                                    "grey.100",
                                border:
                                    "1px solid",
                                borderColor:
                                    "divider",
                                minWidth: 280,
                                textAlign: "center",
                            }}
                        >
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color="text.secondary"
                            >
                                ENTRANCE
                            </Typography>
                        </Box>
                    </Box>

                    {/* Seat Rows */}
                    <Stack
                        spacing={3}
                        sx={{
                            overflowX: "auto",
                            pb: 2,
                        }}
                    >
                        {rows.map(
                            (row, rowIndex) => (
                                <Box
                                    key={row.id}
                                    sx={{
                                        minWidth:
                                            "max-content",
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={2}
                                    >
                                        {/* Row Label */}
                                        <Box
                                            sx={{
                                                width: 70,
                                                flexShrink: 0,
                                            }}
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight={
                                                        700
                                                    }
                                                >
                                                    Row{" "}
                                                    {
                                                        row.name
                                                    }
                                                </Typography>

                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() =>
                                                        handleDeleteRow(
                                                            row.id
                                                        )
                                                    }
                                                >
                                                    <DeleteOutline
                                                        fontSize="small"
                                                    />
                                                </IconButton>
                                            </Stack>
                                        </Box>

                                        {/* Seats */}
                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                            alignItems="center"
                                        >
                                            {row.seats.map(
                                                (
                                                    seat
                                                ) => {
                                                    const isAvailable =
                                                        seat.status ===
                                                        "AVAILABLE";

                                                    return (
                                                        <Box
                                                            key={
                                                                seat.id
                                                            }
                                                            onClick={() =>
                                                                handleSeatClick(
                                                                    row.id,
                                                                    seat.id
                                                                )
                                                            }
                                                            onContextMenu={(
                                                                event
                                                            ) => {
                                                                event.preventDefault();

                                                                handleOpenSeatDetails(
                                                                    row,
                                                                    seat
                                                                );
                                                            }}
                                                            sx={{
                                                                width: 58,
                                                                height: 58,
                                                                borderRadius: 2,
                                                                display:
                                                                    "flex",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                cursor: "pointer",
                                                                userSelect:
                                                                    "none",
                                                                border:
                                                                    "2px solid",
                                                                borderColor:
                                                                    isAvailable
                                                                        ? "success.main"
                                                                        : "error.main",
                                                                bgcolor:
                                                                    isAvailable
                                                                        ? "success.light"
                                                                        : "error.light",
                                                                color:
                                                                    isAvailable
                                                                        ? "success.dark"
                                                                        : "error.dark",
                                                                fontWeight:
                                                                    700,
                                                                transition:
                                                                    "all 0.2s ease",
                                                                "&:hover":
                                                                    {
                                                                        transform:
                                                                            "translateY(-2px)",
                                                                        boxShadow:
                                                                            2,
                                                                    },
                                                            }}
                                                        >
                                                            {
                                                                seat.label
                                                            }
                                                        </Box>
                                                    );
                                                }
                                            )}

                                            <IconButton
                                                size="small"
                                                onClick={() =>
                                                    handleAddSeat(
                                                        row.id
                                                    )
                                                }
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    border: "1px dashed",
                                                    borderColor:
                                                        "divider",
                                                }}
                                            >
                                                <Add fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Stack>

                                    {rowIndex <
                                        rows.length -
                                            1 && (
                                        <Divider
                                            sx={{
                                                mt: 3,
                                            }}
                                        />
                                    )}
                                </Box>
                            )
                        )}
                    </Stack>

                    {/* Reception */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "center",
                            mt: 4,
                        }}
                    >
                        <Box
                            sx={{
                                px: 7,
                                py: 1.5,
                                borderRadius: 2,
                                backgroundColor:
                                    "grey.100",
                                border:
                                    "1px solid",
                                borderColor:
                                    "divider",
                            }}
                        >
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color="text.secondary"
                            >
                                RECEPTION
                            </Typography>
                        </Box>
                    </Box>

                    {/* Legend */}
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                        mt={4}
                        pt={3}
                        borderTop="1px solid"
                        borderColor="divider"
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Box
                                sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 1,
                                    bgcolor:
                                        "success.light",
                                    border:
                                        "2px solid",
                                    borderColor:
                                        "success.main",
                                }}
                            />

                            <Typography variant="body2">
                                Available
                            </Typography>
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <Box
                                sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 1,
                                    bgcolor:
                                        "error.light",
                                    border:
                                        "2px solid",
                                    borderColor:
                                        "error.main",
                                }}
                            />

                            <Typography variant="body2">
                                Disabled
                            </Typography>
                        </Stack>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: "auto" }}
                        >
                            Right-click a seat for
                            seat actions.
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            {/* Add Row Dialog */}
            <Dialog
                open={rowDialogOpen}
                onClose={() =>
                    setRowDialogOpen(false)
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Add New Row
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        autoFocus
                        label="Row Name"
                        placeholder="e.g. E"
                        value={rowName}
                        onChange={(event) =>
                            setRowName(
                                event.target.value
                            )
                        }
                        sx={{ mt: 1 }}
                    />

                    <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                        mt={1}
                    >
                        A new row will start with 5
                        seats.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() => {
                            setRowName("");
                            setRowDialogOpen(false);
                        }}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        disabled={!rowName.trim()}
                        onClick={handleAddRow}
                    >
                        Add Row
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Seat Details Dialog */}
            <Dialog
                open={seatDialogOpen}
                onClose={() =>
                    setSeatDialogOpen(false)
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Seat Details
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Box
                            sx={{
                                p: 3,
                                textAlign: "center",
                                borderRadius: 2,
                                bgcolor:
                                    selectedSeat?.seat
                                        ?.status ===
                                    "AVAILABLE"
                                        ? "success.light"
                                        : "error.light",
                            }}
                        >
                            <EventSeat
                                sx={{
                                    fontSize: 42,
                                }}
                            />

                            <Typography
                                variant="h5"
                                fontWeight={700}
                                mt={1}
                            >
                                {
                                    selectedSeat?.seat
                                        ?.label
                                }
                            </Typography>

                            <Chip
                                sx={{ mt: 1 }}
                                label={
                                    selectedSeat?.seat
                                        ?.status ===
                                    "AVAILABLE"
                                        ? "Available"
                                        : "Disabled"
                                }
                                color={
                                    selectedSeat?.seat
                                        ?.status ===
                                    "AVAILABLE"
                                        ? "success"
                                        : "error"
                                }
                                size="small"
                            />
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setSeatDialogOpen(
                                false
                            )
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        color="error"
                        variant="outlined"
                        startIcon={
                            <DeleteOutline />
                        }
                        onClick={() => {
                            if (
                                selectedSeat
                            ) {
                                handleRemoveSeat(
                                    selectedSeat.rowId,
                                    selectedSeat.seat.id
                                );
                            }
                        }}
                    >
                        Remove Seat
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SeatMapping;