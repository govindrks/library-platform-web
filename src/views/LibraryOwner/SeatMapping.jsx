import {
    Add,
    DeleteOutline,
    EventSeat,
    Save,
    Settings,
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
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
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
    type: "STANDARD",
    features: [],
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

    const [selectedSeatId, setSelectedSeatId] = useState(null);
    const [selectedSeat, setSelectedSeat] = useState(null);

    const [configureOpen, setConfigureOpen] = useState(false);
    const [rowDialogOpen, setRowDialogOpen] = useState(false);
    const [addSeatsOpen, setAddSeatsOpen] = useState(false);
    const [seatDialogOpen, setSeatDialogOpen] = useState(false);

    const [rowName, setRowName] = useState("");

    const [layoutConfig, setLayoutConfig] = useState({
        rowCount: 4,
        seatsPerRow: 5,
    });

    const [addSeatsForm, setAddSeatsForm] = useState({
        rowId: "",
        count: 1,
    });

    const [saved, setSaved] = useState(false);

    const totalSeats = useMemo(
        () =>
            rows.reduce(
                (total, row) => total + row.seats.length,
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
                        (seat) => seat.status === "AVAILABLE"
                    ).length,
                0
            ),
        [rows]
    );

    const disabledSeats = useMemo(
        () =>
            rows.reduce(
                (total, row) =>
                    total +
                    row.seats.filter(
                        (seat) => seat.status === "DISABLED"
                    ).length,
                0
            ),
        [rows]
    );

    const handleSeatClick = (row, seat) => {
        setSelectedSeatId(seat.id);

        setSelectedSeat({
            rowId: row.id,
            rowName: row.name,
            seat: { ...seat },
        });
    };

    const handleOpenSeatDetails = (row, seat) => {
        setSelectedSeatId(seat.id);

        setSelectedSeat({
            rowId: row.id,
            rowName: row.name,
            seat: { ...seat },
        });

        setSeatDialogOpen(true);
    };

    const handleSaveSeat = () => {
        if (!selectedSeat) return;

        setRows((previous) =>
            previous.map((row) => {
                if (row.id !== selectedSeat.rowId) {
                    return row;
                }

                return {
                    ...row,
                    seats: row.seats.map((seat) =>
                        seat.id === selectedSeat.seat.id
                            ? {
                                  ...seat,
                                  status:
                                      selectedSeat.seat.status,
                                  type:
                                      selectedSeat.seat.type,
                                  features:
                                      selectedSeat.seat.features,
                              }
                            : seat
                    ),
                };
            })
        );

        setSeatDialogOpen(false);
        setSelectedSeatId(null);
        setSelectedSeat(null);
        setSaved(false);
    };

    const handleDeleteRow = (rowId) => {
        setRows((previous) =>
            previous.filter((row) => row.id !== rowId)
        );

        setSelectedSeatId(null);
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

    const handleAddSeats = () => {
        if (!addSeatsForm.rowId) return;

        const count = Number(addSeatsForm.count);

        if (!count || count < 1) return;

        setRows((previous) =>
            previous.map((row) => {
                if (
                    String(row.id) !==
                    String(addSeatsForm.rowId)
                ) {
                    return row;
                }

                const startingNumber =
                    row.seats.length + 1;

                const newSeats = Array.from(
                    { length: count },
                    (_, index) =>
                        createSeat(
                            row.name,
                            startingNumber + index
                        )
                );

                return {
                    ...row,
                    seats: [
                        ...row.seats,
                        ...newSeats,
                    ],
                };
            })
        );

        setAddSeatsForm({
            rowId: "",
            count: 1,
        });

        setAddSeatsOpen(false);
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

        setSelectedSeatId(null);
        setSelectedSeat(null);
        setSeatDialogOpen(false);
        setSaved(false);
    };

    const handleApplyLayout = () => {
        const rowCount = Number(
            layoutConfig.rowCount
        );

        const seatsPerRow = Number(
            layoutConfig.seatsPerRow
        );

        if (
            rowCount < 1 ||
            seatsPerRow < 1
        ) {
            return;
        }

        const generatedRows = Array.from(
            { length: rowCount },
            (_, rowIndex) => {
                const rowName =
                    String.fromCharCode(
                        65 + rowIndex
                    );

                const existingRow =
                    rows.find(
                        (row) =>
                            row.name === rowName
                    );

                const existingSeats =
                    existingRow?.seats || [];

                const generatedSeats =
                    Array.from(
                        {
                            length: seatsPerRow,
                        },
                        (_, seatIndex) => {
                            const seatNumber =
                                seatIndex + 1;

                            const existingSeat =
                                existingSeats.find(
                                    (seat) =>
                                        seat.number ===
                                        seatNumber
                                );

                            return (
                                existingSeat || {
                                    ...createSeat(
                                        rowName,
                                        seatNumber
                                    ),
                                    number:
                                        seatNumber,
                                }
                            );
                        }
                    );

                return {
                    id:
                        existingRow?.id ||
                        Date.now() +
                            rowIndex,
                    name: rowName,
                    seats: generatedSeats,
                };
            }
        );

        setRows(generatedRows);
        setConfigureOpen(false);
        setSelectedSeatId(null);
        setSelectedSeat(null);
        setSaved(false);
    };

    const handleSaveLayout = () => {
        console.log("Seat layout:", rows);
        setSaved(true);
    };

    const updateSelectedSeat = (field, value) => {
        setSelectedSeat((previous) => ({
            ...previous,
            seat: {
                ...previous.seat,
                [field]: value,
            },
        }));
    };

    const toggleFeature = (feature) => {
        setSelectedSeat((previous) => {
            const currentFeatures =
                previous?.seat?.features || [];

            const exists =
                currentFeatures.includes(feature);

            return {
                ...previous,
                seat: {
                    ...previous.seat,
                    features: exists
                        ? currentFeatures.filter(
                              (item) =>
                                  item !== feature
                          )
                        : [
                              ...currentFeatures,
                              feature,
                          ],
                },
            };
        });
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
                        Design and manage the seat
                        layout for your library.
                    </Typography>
                </Box>

                <Stack
                    direction={{
                        xs: "column",
                        sm: "row",
                    }}
                    spacing={1}
                    width={{
                        xs: "100%",
                        md: "auto",
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<Settings />}
                        onClick={() =>
                            setConfigureOpen(true)
                        }
                    >
                        Configure Layout
                    </Button>

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
                        variant="outlined"
                        startIcon={<EventSeat />}
                        onClick={() =>
                            setAddSeatsOpen(true)
                        }
                    >
                        Add Seats
                    </Button>
                </Stack>
            </Stack>

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

            {/* Library Layout */}
            <Card
                sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                <CardContent
                    sx={{
                        p: {
                            xs: 2,
                            md: 3,
                        },
                    }}
                >
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
                                Select a seat to edit its
                                configuration.
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
                                width: {
                                    xs: "70%",
                                    md: 400,
                                },
                                px: 4,
                                py: 2,
                                borderRadius:
                                    "0 0 14px 14px",
                                bgcolor: "grey.100",
                                border: "1px solid",
                                borderColor:
                                    "divider",
                                textAlign: "center",
                            }}
                        >
                            <Typography
                                fontWeight={700}
                                color="text.secondary"
                            >
                                🚪 ENTRANCE
                            </Typography>
                        </Box>
                    </Box>

                    {/* Layout */}
                    <Box
                        sx={{
                            border: "1px solid",
                            borderColor:
                                "divider",
                            borderRadius: 3,
                            p: {
                                xs: 2,
                                md: 3,
                            },
                            overflowX: "auto",
                        }}
                    >
                        <Stack spacing={3}>
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
                                            {/* Row label */}
                                            <Box
                                                sx={{
                                                    width: 65,
                                                    height: 58,
                                                    flexShrink: 0,
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    borderRadius: 2,
                                                    bgcolor:
                                                        "primary.50",
                                                    border: "1px solid",
                                                    borderColor:
                                                        "primary.100",
                                                }}
                                            >
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={
                                                        700
                                                    }
                                                    color="primary.main"
                                                >
                                                    {row.name}
                                                </Typography>
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
                                                        const selected =
                                                            selectedSeatId ===
                                                            seat.id;

                                                        const available =
                                                            seat.status ===
                                                            "AVAILABLE";

                                                        return (
                                                            <Box
                                                                key={
                                                                    seat.id
                                                                }
                                                                onClick={() =>
                                                                    handleSeatClick(
                                                                        row,
                                                                        seat
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
                                                                    width: 74,
                                                                    cursor: "pointer",
                                                                    userSelect:
                                                                        "none",
                                                                    textAlign:
                                                                        "center",
                                                                    transition:
                                                                        "all 0.2s ease",
                                                                    "&:hover":
                                                                        {
                                                                            transform:
                                                                                "translateY(-2px)",
                                                                        },
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        height: 30,
                                                                        border:
                                                                            "1px solid",
                                                                        borderColor:
                                                                            selected
                                                                                ? "primary.main"
                                                                                : "divider",
                                                                        borderBottom:
                                                                            "none",
                                                                        borderRadius:
                                                                            "8px 8px 0 0",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "center",
                                                                        bgcolor:
                                                                            selected
                                                                                ? "primary.50"
                                                                                : "background.paper",
                                                                    }}
                                                                >
                                                                    <Typography
                                                                        variant="caption"
                                                                        fontWeight={
                                                                            700
                                                                        }
                                                                    >
                                                                        {
                                                                            seat.label
                                                                        }
                                                                    </Typography>
                                                                </Box>

                                                                {/* Chair */}
                                                                <Box
                                                                    sx={{
                                                                        height: 52,
                                                                        borderRadius: 2,
                                                                        border:
                                                                            "3px solid",
                                                                        borderColor:
                                                                            selected
                                                                                ? "primary.main"
                                                                                : available
                                                                                ? "success.main"
                                                                                : "error.main",
                                                                        bgcolor:
                                                                            selected
                                                                                ? "primary.main"
                                                                                : available
                                                                                ? "success.light"
                                                                                : "error.light",
                                                                        display:
                                                                            "flex",
                                                                        alignItems:
                                                                            "center",
                                                                        justifyContent:
                                                                            "center",
                                                                        boxShadow:
                                                                            selected
                                                                                ? 3
                                                                                : "none",
                                                                    }}
                                                                >
                                                                    <EventSeat
                                                                        sx={{
                                                                            color:
                                                                                selected
                                                                                    ? "white"
                                                                                    : available
                                                                                    ? "success.dark"
                                                                                    : "error.dark",
                                                                            fontSize: 30,
                                                                        }}
                                                                    />
                                                                </Box>
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

                                            {/* Delete row */}
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() =>
                                                    handleDeleteRow(
                                                        row.id
                                                    )
                                                }
                                                disabled={
                                                    rows.length <=
                                                    1
                                                }
                                            >
                                                <DeleteOutline fontSize="small" />
                                            </IconButton>
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
                    </Box>

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
                                width: {
                                    xs: "70%",
                                    md: 430,
                                },
                                px: 4,
                                py: 2,
                                borderRadius: 2,
                                bgcolor: "grey.100",
                                border: "1px solid",
                                borderColor:
                                    "divider",
                                textAlign: "center",
                            }}
                        >
                            <Typography
                                fontWeight={700}
                                color="text.secondary"
                            >
                                👤 RECEPTION
                            </Typography>
                        </Box>
                    </Box>

                    {/* Legend + Stats */}
                    <Stack
                        direction={{
                            xs: "column",
                            lg: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "flex-start",
                            lg: "center",
                        }}
                        spacing={3}
                        mt={4}
                        pt={3}
                        borderTop="1px solid"
                        borderColor="divider"
                    >
                        <Stack
                            direction="row"
                            spacing={3}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Legend
                                color="success"
                                label="Available"
                            />

                            <Legend
                                color="error"
                                label="Disabled"
                            />

                            <Legend
                                color="primary"
                                label="Selected"
                            />
                        </Stack>

                        <Stack
                            direction="row"
                            spacing={{
                                xs: 2,
                                md: 4,
                            }}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            <Statistic
                                label="Rows"
                                value={rows.length}
                            />

                            <Statistic
                                label="Seats"
                                value={totalSeats}
                            />

                            <Statistic
                                label="Available"
                                value={availableSeats}
                            />

                            <Statistic
                                label="Disabled"
                                value={disabledSeats}
                            />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Save */}
            <Stack
                direction="row"
                justifyContent="flex-end"
                mt={2}
            >
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<Save />}
                    onClick={handleSaveLayout}
                    sx={{
                        minWidth: 220,
                        py: 1.4,
                        borderRadius: 2,
                        textTransform: "none",
                    }}
                >
                    Save Seat Layout
                </Button>
            </Stack>

            {/* Configure Layout */}
            <Dialog
                open={configureOpen}
                onClose={() =>
                    setConfigureOpen(false)
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Configure Layout
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2.5} mt={1}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Number of Rows"
                            value={
                                layoutConfig.rowCount
                            }
                            onChange={(event) =>
                                setLayoutConfig(
                                    (previous) => ({
                                        ...previous,
                                        rowCount:
                                            Math.max(
                                                1,
                                                Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            ),
                                    })
                                )
                            }
                            inputProps={{
                                min: 1,
                                max: 26,
                            }}
                        />

                        <TextField
                            fullWidth
                            type="number"
                            label="Seats Per Row"
                            value={
                                layoutConfig.seatsPerRow
                            }
                            onChange={(event) =>
                                setLayoutConfig(
                                    (previous) => ({
                                        ...previous,
                                        seatsPerRow:
                                            Math.max(
                                                1,
                                                Number(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            ),
                                    })
                                )
                            }
                            inputProps={{
                                min: 1,
                                max: 50,
                            }}
                        />

                        <Alert severity="info">
                            Existing seat configuration
                            is preserved where the
                            same row and seat already
                            exist.
                        </Alert>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setConfigureOpen(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handleApplyLayout
                        }
                    >
                        Apply Layout
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Row */}
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
                        A new row starts with 5
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

            {/* Add Seats */}
            <Dialog
                open={addSeatsOpen}
                onClose={() =>
                    setAddSeatsOpen(false)
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Add Seats
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={2.5} mt={1}>
                        <FormControl fullWidth>
                            <InputLabel>
                                Row
                            </InputLabel>

                            <Select
                                value={
                                    addSeatsForm.rowId
                                }
                                label="Row"
                                onChange={(event) =>
                                    setAddSeatsForm(
                                        (previous) => ({
                                            ...previous,
                                            rowId:
                                                event
                                                    .target
                                                    .value,
                                        })
                                    )
                                }
                            >
                                {rows.map((row) => (
                                    <MenuItem
                                        key={row.id}
                                        value={row.id}
                                    >
                                        Row {row.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            fullWidth
                            type="number"
                            label="Number of Seats"
                            value={
                                addSeatsForm.count
                            }
                            onChange={(event) =>
                                setAddSeatsForm(
                                    (previous) => ({
                                        ...previous,
                                        count: Math.max(
                                            1,
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                        ),
                                    })
                                )
                            }
                            inputProps={{
                                min: 1,
                                max: 50,
                            }}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setAddSeatsOpen(false)
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddSeats}
                        disabled={
                            !addSeatsForm.rowId
                        }
                    >
                        Add Seats
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Seat Details */}
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
                    {selectedSeat && (
                        <Stack spacing={2.5} mt={1}>
                            <Box
                                sx={{
                                    p: 2.5,
                                    textAlign:
                                        "center",
                                    borderRadius: 2,
                                    bgcolor:
                                        selectedSeat
                                            .seat
                                            .status ===
                                        "AVAILABLE"
                                            ? "success.light"
                                            : "error.light",
                                }}
                            >
                                <EventSeat
                                    sx={{
                                        fontSize: 42,
                                        color:
                                            selectedSeat
                                                .seat
                                                .status ===
                                            "AVAILABLE"
                                                ? "success.dark"
                                                : "error.dark",
                                    }}
                                />

                                <Typography
                                    variant="h5"
                                    fontWeight={700}
                                >
                                    {
                                        selectedSeat
                                            .seat
                                            .label
                                    }
                                </Typography>

                                <Chip
                                    label={
                                        selectedSeat
                                            .seat
                                            .status ===
                                        "AVAILABLE"
                                            ? "Available"
                                            : "Disabled"
                                    }
                                    color={
                                        selectedSeat
                                            .seat
                                            .status ===
                                        "AVAILABLE"
                                            ? "success"
                                            : "error"
                                    }
                                    size="small"
                                    sx={{ mt: 1 }}
                                />
                            </Box>

                            <FormControl fullWidth>
                                <InputLabel>
                                    Status
                                </InputLabel>

                                <Select
                                    value={
                                        selectedSeat
                                            .seat
                                            .status
                                    }
                                    label="Status"
                                    onChange={(
                                        event
                                    ) =>
                                        updateSelectedSeat(
                                            "status",
                                            event.target
                                                .value
                                        )
                                    }
                                >
                                    <MenuItem value="AVAILABLE">
                                        Available
                                    </MenuItem>

                                    <MenuItem value="DISABLED">
                                        Disabled
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>
                                    Seat Type
                                </InputLabel>

                                <Select
                                    value={
                                        selectedSeat
                                            .seat
                                            .type ||
                                        "STANDARD"
                                    }
                                    label="Seat Type"
                                    onChange={(
                                        event
                                    ) =>
                                        updateSelectedSeat(
                                            "type",
                                            event.target
                                                .value
                                        )
                                    }
                                >
                                    <MenuItem value="STANDARD">
                                        Standard
                                    </MenuItem>

                                    <MenuItem value="PREMIUM">
                                        Premium
                                    </MenuItem>

                                    <MenuItem value="WINDOW">
                                        Window
                                    </MenuItem>

                                    <MenuItem value="QUIET">
                                        Quiet Zone
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    mb={1}
                                >
                                    Features
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    useFlexGap
                                >
                                    {[
                                        "Power Socket",
                                        "Window Seat",
                                        "Quiet Zone",
                                    ].map(
                                        (feature) => {
                                            const active =
                                                (
                                                    selectedSeat
                                                        .seat
                                                        .features ||
                                                    []
                                                ).includes(
                                                    feature
                                                );

                                            return (
                                                <Chip
                                                    key={
                                                        feature
                                                    }
                                                    label={
                                                        feature
                                                    }
                                                    clickable
                                                    color={
                                                        active
                                                            ? "primary"
                                                            : "default"
                                                    }
                                                    variant={
                                                        active
                                                            ? "filled"
                                                            : "outlined"
                                                    }
                                                    onClick={() =>
                                                        toggleFeature(
                                                            feature
                                                        )
                                                    }
                                                />
                                            );
                                        }
                                    )}
                                </Stack>
                            </Box>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setSeatDialogOpen(false)
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
                            if (selectedSeat) {
                                handleRemoveSeat(
                                    selectedSeat.rowId,
                                    selectedSeat.seat
                                        .id
                                );
                            }
                        }}
                    >
                        Remove Seat
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSaveSeat}
                    >
                        Save Seat
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

const Legend = ({ color, label }) => (
    <Stack
        direction="row"
        spacing={1}
        alignItems="center"
    >
        <Box
            sx={{
                width: 16,
                height: 16,
                borderRadius: "50%",
                bgcolor: `${color}.main`,
            }}
        />

        <Typography variant="body2">
            {label}
        </Typography>
    </Stack>
);

const Statistic = ({ label, value }) => (
    <Stack
        direction="row"
        spacing={0.7}
        alignItems="center"
    >
        <Typography
            variant="body2"
            color="text.secondary"
        >
            {label}:
        </Typography>

        <Typography
            variant="body2"
            fontWeight={700}
        >
            {value}
        </Typography>
    </Stack>
);

export default SeatMapping;