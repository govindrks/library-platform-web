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
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import libraryApi from "../../../api/libraryApi";
import seatApi from "../../../api/seatApi";

// =============================================================
// CONSTANTS
// =============================================================

const SEAT_STATUS_COLORS = {
    AVAILABLE: "#2E7D32",
    BOOKED: "#D32F2F",
    RESERVED: "#1976D2",
    RESERVED_FOR_GIRLS: "#E91E63",
    MAINTENANCE: "#212121",
};

const SEAT_STATUS_LABELS = {
    AVAILABLE: "Available",
    BOOKED: "Booked",
    RESERVED: "Reserved",
    RESERVED_FOR_GIRLS: "Reserved for Girls",
    MAINTENANCE: "Maintenance",
};

const MANAGEMENT_STATUSES = [
    "AVAILABLE",
    "RESERVED",
    "RESERVED_FOR_GIRLS",
    "MAINTENANCE",
];

const SEAT_TYPES = [
    "NORMAL",
    "PREMIUM",
    "FEMALE_ONLY",
    "WINDOW",
    "QUIET_ZONE",
];

const DEFAULT_ROWS = 4;
const DEFAULT_SEATS_PER_ROW = 5;

// =============================================================
// HELPERS
// =============================================================

const getErrorMessage = (error, fallback) =>
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback;

const todayString = () =>
    new Date().toISOString().slice(0, 10);

const parseSeatNumber = (seatNumber) => {
    const value = String(seatNumber || "")
        .trim()
        .toUpperCase();

    const match = value.match(/^([A-Z]+)(\d+)$/);

    if (!match) {
        return {
            rowLabel: "",
            columnNumber: null,
        };
    }

    return {
        rowLabel: match[1],
        columnNumber: Number(match[2]),
    };
};

const normalizeLibraryId = (value) =>
    value === null || value === undefined
        ? ""
        : String(value);

const normalizeFloorId = (value) =>
    value === null || value === undefined
        ? ""
        : String(value);

// =============================================================
// COMPONENT
// =============================================================

function SeatMapping() {
    // -----------------------------------------------------------
    // LIBRARIES / FLOORS
    // -----------------------------------------------------------

    const [libraries, setLibraries] = useState([]);
    const [libraryId, setLibraryId] = useState("");

    const [floors, setFloors] = useState([]);
    const [floorId, setFloorId] = useState("");

    // -----------------------------------------------------------
    // SEAT DATA
    // -----------------------------------------------------------

    const [seats, setSeats] = useState([]);
    const [availability, setAvailability] = useState([]);

    // -----------------------------------------------------------
    // UI
    // -----------------------------------------------------------

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [availabilityDate, setAvailabilityDate] =
        useState(todayString());

    // -----------------------------------------------------------
    // SELECTED SEAT
    // -----------------------------------------------------------

    const [selectedSeat, setSelectedSeat] = useState(null);

    const [seatDialogOpen, setSeatDialogOpen] =
        useState(false);

    const [newStatus, setNewStatus] =
        useState("AVAILABLE");

    const [newSeatType, setNewSeatType] =
        useState("NORMAL");

    // -----------------------------------------------------------
    // ADD ROW
    // -----------------------------------------------------------

    const [rowDialogOpen, setRowDialogOpen] =
        useState(false);

    const [rowName, setRowName] =
        useState("");

    const [rowSeatCount, setRowSeatCount] =
        useState(5);

    // -----------------------------------------------------------
    // ADD SEATS
    // -----------------------------------------------------------

    const [addSeatsDialogOpen, setAddSeatsDialogOpen] =
        useState(false);

    const [selectedRow, setSelectedRow] =
        useState("");

    const [additionalSeats, setAdditionalSeats] =
        useState(5);

    // -----------------------------------------------------------
    // CONFIGURE LAYOUT
    // -----------------------------------------------------------

    const [layoutDialogOpen, setLayoutDialogOpen] =
        useState(false);

    const [layoutRows, setLayoutRows] =
        useState(DEFAULT_ROWS);

    const [layoutSeatsPerRow, setLayoutSeatsPerRow] =
        useState(DEFAULT_SEATS_PER_ROW);

    // ===========================================================
    // LOAD LIBRARIES
    // ===========================================================

    const loadLibraries = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response =
                await libraryApi.getMyLibraries();

            const list = Array.isArray(response)
                ? response
                : [];

            setLibraries(list);

            if (list.length === 0) {
                setLibraryId("");
                setFloors([]);
                setFloorId("");
                setSeats([]);
                setAvailability([]);
                return;
            }

            setLibraryId((current) => {
                const exists = list.some(
                    (library) =>
                        normalizeLibraryId(library.id) === current
                );

                return exists
                    ? current
                    : normalizeLibraryId(list[0].id);
            });
        } catch (err) {
            console.error(
                "Failed to load libraries:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to load libraries."
                )
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadLibraries();
    }, [loadLibraries]);

    // ===========================================================
    // LOAD FLOORS
    // ===========================================================

    const loadFloors = useCallback(async () => {
        if (!libraryId) {
            setFloors([]);
            setFloorId("");
            setSeats([]);
            setAvailability([]);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const response =
                await seatApi.getFloors(libraryId);

            const list = Array.isArray(response)
                ? response
                : [];

            setFloors(list);

            setFloorId((current) => {
                const exists = list.some(
                    (floor) =>
                        normalizeFloorId(floor.id) === current
                );

                return exists
                    ? current
                    : list.length > 0
                        ? normalizeFloorId(list[0].id)
                        : "";
            });

            if (list.length === 0) {
                setSeats([]);
                setAvailability([]);
            }
        } catch (err) {
            console.error(
                "Failed to load floors:",
                err
            );

            setFloors([]);
            setFloorId("");
            setSeats([]);
            setAvailability([]);

            setError(
                getErrorMessage(
                    err,
                    "Failed to load library floors."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [libraryId]);

    useEffect(() => {
        loadFloors();
    }, [loadFloors]);

    // ===========================================================
    // LOAD SEAT MATRIX + DATE AVAILABILITY
    // ===========================================================

    const loadSeatMapping = useCallback(async () => {
        if (!libraryId || !floorId) {
            setSeats([]);
            setAvailability([]);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [
                matrixResponse,
                availabilityResponse,
            ] = await Promise.all([
                seatApi.getSeatMatrix(
                    libraryId,
                    floorId
                ),
                seatApi.getSeatAvailability(
                    libraryId,
                    availabilityDate
                ),
            ]);

            const matrixRows =
                Array.isArray(matrixResponse)
                    ? matrixResponse
                    : [];

            const matrixSeats = matrixRows.flatMap(
                (row) =>
                    Array.isArray(row?.seats)
                        ? row.seats.map((seat) => ({
                            id:
                                seat.seatId ??
                                seat.id,
                            seatNumber:
                                seat.seatNumber,
                            rowLabel:
                                seat.rowLabel ??
                                row.rowLabel,
                            columnNumber:
                                seat.columnNumber ??
                                parseSeatNumber(
                                    seat.seatNumber
                                ).columnNumber,
                            floorNumber:
                                seat.floorNumber,
                            seatType:
                                seat.seatType,
                            status:
                                seat.status,
                        }))
                        : []
            );

            setSeats(matrixSeats);

            setAvailability(
                Array.isArray(availabilityResponse)
                    ? availabilityResponse
                    : []
            );
        } catch (err) {
            console.error(
                "Failed to load seat mapping:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to load seat layout."
                )
            );
        } finally {
            setLoading(false);
        }
    }, [
        libraryId,
        floorId,
        availabilityDate,
    ]);

    useEffect(() => {
        loadSeatMapping();
    }, [loadSeatMapping]);

    // ===========================================================
    // MERGE PHYSICAL STATUS + LIVE BOOKING STATUS
    // ===========================================================

    const mappedSeats = useMemo(() => {
        const availabilityMap = new Map(
            availability.map((seat) => [
                String(seat.id),
                seat.status,
            ])
        );

        return seats.map((seat) => {
            const parsed =
                parseSeatNumber(
                    seat.seatNumber
                );

            const physicalStatus =
                seat.status || "AVAILABLE";

            const liveStatus =
                availabilityMap.get(
                    String(seat.id)
                );

            return {
                ...seat,
                rowLabel:
                    seat.rowLabel ||
                    parsed.rowLabel,
                columnNumber:
                    seat.columnNumber ??
                    parsed.columnNumber,
                physicalStatus,
                displayStatus:
                    liveStatus || physicalStatus,
            };
        });
    }, [seats, availability]);

    // ===========================================================
    // GROUP BY ROW
    // ===========================================================

    const rows = useMemo(() => {
        const rowMap = new Map();

        mappedSeats.forEach((seat) => {
            const row =
                seat.rowLabel ||
                parseSeatNumber(
                    seat.seatNumber
                ).rowLabel ||
                "A";

            if (!rowMap.has(row)) {
                rowMap.set(row, []);
            }

            rowMap.get(row).push(seat);
        });

        return Array.from(rowMap.entries())
            .sort(([a], [b]) =>
                a.localeCompare(b, undefined, {
                    numeric: true,
                })
            )
            .map(([name, rowSeats]) => ({
                name,
                seats: [...rowSeats].sort(
                    (a, b) =>
                        Number(a.columnNumber || 0) -
                        Number(b.columnNumber || 0)
                ),
            }));
    }, [mappedSeats]);

    // ===========================================================
    // STATS
    // ===========================================================

    const stats = useMemo(() => {
        const result = {
            total: mappedSeats.length,
            AVAILABLE: 0,
            BOOKED: 0,
            RESERVED: 0,
            RESERVED_FOR_GIRLS: 0,
            MAINTENANCE: 0,
        };

        mappedSeats.forEach((seat) => {
            const status = seat.displayStatus;

            if (
                Object.prototype.hasOwnProperty.call(
                    result,
                    status
                )
            ) {
                result[status] += 1;
            }
        });

        return result;
    }, [mappedSeats]);

    // ===========================================================
    // COMMON VALIDATION
    // ===========================================================

    const requireLibraryAndFloor = () => {
        if (!libraryId) {
            setError("Please select a library.");
            return false;
        }

        if (!floorId) {
            setError("Please select a floor.");
            return false;
        }

        return true;
    };

    // ===========================================================
    // CREATE ONE SEAT
    // ===========================================================

    const createSingleSeat = async (
        row,
        column
    ) => {
        const seatNumber =
            `${String(row).trim().toUpperCase()}${column}`;

        return seatApi.createSeat(
            libraryId,
            floorId,
            {
                seatNumber,
                seatType: "NORMAL",
                rowLabel:
                    String(row)
                        .trim()
                        .toUpperCase(),
                columnNumber: Number(column),
            }
        );
    };

    // ===========================================================
    // CONFIGURE LAYOUT
    // ===========================================================

    const handleApplyLayout = async () => {
        if (!requireLibraryAndFloor()) {
            return;
        }

        const rowCount = Number(layoutRows);
        const seatsPerRow =
            Number(layoutSeatsPerRow);

        if (
            !Number.isInteger(rowCount) ||
            rowCount < 1 ||
            rowCount > 26
        ) {
            setError(
                "Rows must be between 1 and 26."
            );
            return;
        }

        if (
            !Number.isInteger(seatsPerRow) ||
            seatsPerRow < 1 ||
            seatsPerRow > 100
        ) {
            setError(
                "Seats per row must be between 1 and 100."
            );
            return;
        }

        if (seats.length > 0) {
            setError(
                "This floor already has a layout. Use Add Row or Add Seats to extend the existing layout."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await seatApi.generateLayout(
                libraryId,
                floorId,
                {
                    rows: rowCount,
                    seatsPerRow,
                }
            );

            setSuccess(
                `${rowCount * seatsPerRow} seats generated successfully.`
            );

            setLayoutDialogOpen(false);

            await loadSeatMapping();
        } catch (err) {
            console.error(
                "Failed to generate layout:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to generate seat layout."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // ===========================================================
    // ADD ROW
    // ===========================================================

    const handleAddRow = async () => {
        if (!requireLibraryAndFloor()) {
            return;
        }

        const row =
            rowName
                .trim()
                .toUpperCase();

        const seatCount =
            Number(rowSeatCount);

        if (!/^[A-Z]+$/.test(row)) {
            setError(
                "Row name must contain letters only, for example A, B, C or E."
            );
            return;
        }

        if (
            !Number.isInteger(seatCount) ||
            seatCount < 1 ||
            seatCount > 100
        ) {
            setError(
                "Number of seats must be between 1 and 100."
            );
            return;
        }

        const existingNumbers = new Set(
            seats.map((seat) =>
                String(seat.seatNumber)
                    .trim()
                    .toUpperCase()
            )
        );

        const seatNumbers = Array.from(
            { length: seatCount },
            (_, index) =>
                `${row}${index + 1}`
        );

        if (
            seatNumbers.some((number) =>
                existingNumbers.has(number)
            )
        ) {
            setError(
                `Some seats in row ${row} already exist.`
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await Promise.all(
                seatNumbers.map(
                    (_, index) =>
                        createSingleSeat(
                            row,
                            index + 1
                        )
                )
            );

            setSuccess(
                `Row ${row} added successfully with ${seatCount} seats.`
            );

            setRowName("");
            setRowDialogOpen(false);

            await loadSeatMapping();
        } catch (err) {
            console.error(
                "Failed to add row:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to add row."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // ===========================================================
    // ADD SEATS TO ROW
    // ===========================================================

    const handleAddSeats = async () => {
        if (!requireLibraryAndFloor()) {
            return;
        }

        if (!selectedRow) {
            setError("Please select a row.");
            return;
        }

        const count =
            Number(additionalSeats);

        if (
            !Number.isInteger(count) ||
            count < 1 ||
            count > 100
        ) {
            setError(
                "Number of seats must be between 1 and 100."
            );
            return;
        }

        const row =
            rows.find(
                (item) =>
                    item.name === selectedRow
            );

        const rowSeats =
            row?.seats || [];

        const maxColumn =
            rowSeats.reduce(
                (max, seat) =>
                    Math.max(
                        max,
                        Number(
                            seat.columnNumber || 0
                        )
                    ),
                0
            );

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await Promise.all(
                Array.from(
                    { length: count },
                    (_, index) =>
                        createSingleSeat(
                            selectedRow,
                            maxColumn + index + 1
                        )
                )
            );

            setSuccess(
                `${count} seats added to row ${selectedRow}.`
            );

            setAddSeatsDialogOpen(false);

            await loadSeatMapping();
        } catch (err) {
            console.error(
                "Failed to add seats:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to add seats."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // ===========================================================
    // SELECT SEAT
    // ===========================================================

    const handleSelectSeat = (seat) => {
        setSelectedSeat(seat);

        setNewStatus(
            seat.physicalStatus ||
            "AVAILABLE"
        );

        setNewSeatType(
            seat.seatType ||
            "NORMAL"
        );

        setSeatDialogOpen(true);
    };

    // ===========================================================
    // UPDATE STATUS + TYPE
    // ===========================================================

    const handleSaveSeat = async () => {
        if (!selectedSeat) {
            return;
        }

        if (
            selectedSeat.displayStatus ===
            "BOOKED"
        ) {
            setError(
                "A booked seat cannot be changed for the selected date."
            );
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const statusChanged =
                newStatus !==
                selectedSeat.physicalStatus;

            const typeChanged =
                newSeatType !==
                selectedSeat.seatType;

            if (statusChanged) {
                await seatApi.updateSeatStatus(
                    libraryId,
                    selectedSeat.id,
                    newStatus
                );
            }

            if (typeChanged) {
                await seatApi.updateSeatType(
                    libraryId,
                    selectedSeat.id,
                    newSeatType
                );
            }

            setSuccess(
                `Seat ${selectedSeat.seatNumber} updated successfully.`
            );

            setSeatDialogOpen(false);
            setSelectedSeat(null);

            await loadSeatMapping();
        } catch (err) {
            console.error(
                "Failed to update seat:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to update seat."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // ===========================================================
    // DELETE SEAT
    // ===========================================================

    const handleDeleteSeat = async () => {
        if (!selectedSeat) {
            return;
        }

        if (
            selectedSeat.displayStatus ===
            "BOOKED"
        ) {
            setError(
                "A booked seat cannot be deleted."
            );
            return;
        }

        const confirmed =
            window.confirm(
                `Delete seat ${selectedSeat.seatNumber}?`
            );

        if (!confirmed) {
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            await seatApi.deleteSeat(
                libraryId,
                selectedSeat.id
            );

            setSuccess(
                `Seat ${selectedSeat.seatNumber} deleted successfully.`
            );

            setSeatDialogOpen(false);
            setSelectedSeat(null);

            await loadSeatMapping();
        } catch (err) {
            console.error(
                "Failed to delete seat:",
                err
            );

            setError(
                getErrorMessage(
                    err,
                    "Failed to delete seat."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // ===========================================================
    // OPEN ADD-SEATS DIALOG
    // ===========================================================

    const openAddSeatsDialog = () => {
        if (rows.length === 0) {
            setError(
                "Create a layout first."
            );
            return;
        }

        setSelectedRow(
            (current) =>
                rows.some(
                    (row) =>
                        row.name === current
                )
                    ? current
                    : rows[0].name
        );

        setAddSeatsDialogOpen(true);
    };

    // ===========================================================
    // OPEN CONFIGURE DIALOG
    // ===========================================================

    const openLayoutDialog = () => {
        if (!floorId) {
            setError(
                "Please select a floor first."
            );
            return;
        }

        setLayoutDialogOpen(true);
    };

    // ===========================================================
    // SAVE / SYNC
    // ===========================================================

    const handleSaveLayout = async () => {
        try {
            setSaving(true);
            setError("");

            await loadSeatMapping();

            setSuccess(
                "Seat layout is synchronized with the database."
            );
        } catch (err) {
            setError(
                getErrorMessage(
                    err,
                    "Failed to synchronize seat layout."
                )
            );
        } finally {
            setSaving(false);
        }
    };

    // ===========================================================
    // LOADING STATE
    // ===========================================================

    if (
        loading &&
        libraries.length === 0
    ) {
        return (
            <Box
                sx={{
                    minHeight: "60vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    // ===========================================================
    // UI
    // ===========================================================

    return (
        <Box
            sx={{
                minHeight: "100%",
                backgroundColor: "#F8FAFD",
                p: {
                    xs: 2,
                    md: 3,
                },
            }}
        >
            {/* HEADER */}
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
                        sx={{
                            fontWeight: 800,
                            color: "#11194B",
                        }}
                    >
                        Seat Mapping
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
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
                        sm: "auto",
                    }}
                >
                    <Button
                        variant="outlined"
                        startIcon={<Settings />}
                        onClick={openLayoutDialog}
                        disabled={!floorId}
                    >
                        Configure Layout
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={() =>
                            setRowDialogOpen(true)
                        }
                        disabled={!floorId}
                    >
                        Add Row
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<Add />}
                        onClick={openAddSeatsDialog}
                        disabled={
                            !floorId ||
                            rows.length === 0
                        }
                    >
                        Add Seats
                    </Button>
                </Stack>
            </Stack>

            {/* LIBRARY + FLOOR */}
            <Card
                sx={{
                    mb: 3,
                    borderRadius: 3,
                }}
            >
                <CardContent>
                    <Grid
                        container
                        spacing={2}
                    >
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                            }}
                        >
                            <FormControl fullWidth>
                                <InputLabel>
                                    Library
                                </InputLabel>

                                <Select
                                    value={libraryId}
                                    label="Library"
                                    onChange={(event) => {
                                        setLibraryId(
                                            event.target.value
                                        );
                                        setFloorId("");
                                        setSeats([]);
                                        setAvailability([]);
                                    }}
                                >
                                    {libraries.map(
                                        (library) => (
                                            <MenuItem
                                                key={
                                                    library.id
                                                }
                                                value={String(
                                                    library.id
                                                )}
                                            >
                                                {library.name}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                            }}
                        >
                            <FormControl
                                fullWidth
                                disabled={
                                    floors.length === 0
                                }
                            >
                                <InputLabel>
                                    Floor
                                </InputLabel>

                                <Select
                                    value={floorId}
                                    label="Floor"
                                    onChange={(event) =>
                                        setFloorId(
                                            event.target.value
                                        )
                                    }
                                >
                                    {floors.map(
                                        (floor) => (
                                            <MenuItem
                                                key={
                                                    floor.id
                                                }
                                                value={String(
                                                    floor.id
                                                )}
                                            >
                                                {floor.name ||
                                                    `Floor ${floor.floorNumber}`}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                            }}
                        >
                            <TextField
                                fullWidth
                                type="date"
                                label="Availability Date"
                                value={
                                    availabilityDate
                                }
                                onChange={(event) =>
                                    setAvailabilityDate(
                                        event.target.value
                                    )
                                }
                                InputLabelProps={{
                                    shrink: true,
                                }}
                                helperText="BOOKED status is calculated from bookings for this date."
                            />
                        </Grid>
                    </Grid>

                    {floors.length === 0 &&
                        libraryId && (
                            <Alert
                                severity="info"
                                sx={{ mt: 2 }}
                            >
                                No floor has been configured
                                for this library yet.
                            </Alert>
                        )}
                </CardContent>
            </Card>

            {/* ALERTS */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() =>
                        setError("")
                    }
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() =>
                        setSuccess("")
                    }
                >
                    {success}
                </Alert>
            )}

            {/* SUMMARY */}
            <Grid
                container
                spacing={2}
                mb={3}
            >
                {[
                    {
                        label: "Total Seats",
                        value: stats.total,
                        color: "#11194B",
                    },
                    {
                        label: "Available",
                        value: stats.AVAILABLE,
                        color:
                            SEAT_STATUS_COLORS.AVAILABLE,
                    },
                    {
                        label: "Booked",
                        value: stats.BOOKED,
                        color:
                            SEAT_STATUS_COLORS.BOOKED,
                    },
                    {
                        label: "Maintenance",
                        value: stats.MAINTENANCE,
                        color:
                            SEAT_STATUS_COLORS.MAINTENANCE,
                    },
                ].map((item) => (
                    <Grid
                        key={item.label}
                        size={{
                            xs: 12,
                            sm: 6,
                            md: 3,
                        }}
                    >
                        <Card>
                            <CardContent>
                                <Typography
                                    color="text.secondary"
                                >
                                    {item.label}
                                </Typography>

                                <Typography
                                    variant="h4"
                                    fontWeight={800}
                                    sx={{
                                        color: item.color,
                                    }}
                                >
                                    {item.value}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* LAYOUT */}
            <Card
                sx={{
                    borderRadius: 3,
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
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        justifyContent="space-between"
                        alignItems={{
                            xs: "flex-start",
                            sm: "center",
                        }}
                        spacing={2}
                        mb={3}
                    >
                        <Box>
                            <Typography
                                variant="h6"
                                fontWeight={800}
                            >
                                Library Layout
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {floorId
                                    ? "Select a seat to view and manage its details."
                                    : "Select a floor to view its seat layout."}
                            </Typography>
                        </Box>

                        <Chip
                            label={`${rows.length} Rows`}
                        />
                    </Stack>

                    {/* ENTRANCE */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mb: 4,
                        }}
                    >
                        <Box
                            sx={{
                                px: 8,
                                py: 1.5,
                                background:
                                    "#EEF3FA",
                                border:
                                    "1px solid #CBD5E1",
                                borderRadius:
                                    "0 0 16px 16px",
                                fontWeight: 800,
                                color: "#26355C",
                            }}
                        >
                            ENTRANCE
                        </Box>
                    </Box>

                    {/* SEATS */}
                    {loading && floorId ? (
                        <Box
                            sx={{
                                py: 8,
                                display: "flex",
                                justifyContent:
                                    "center",
                            }}
                        >
                            <CircularProgress />
                        </Box>
                    ) : rows.length === 0 ? (
                        <Box
                            sx={{
                                py: 8,
                                textAlign: "center",
                            }}
                        >
                            <EventSeat
                                sx={{
                                    fontSize: 60,
                                    color: "#CBD5E1",
                                }}
                            />

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                mt={2}
                            >
                                No seats configured
                            </Typography>

                            <Typography
                                color="text.secondary"
                                mb={3}
                            >
                                Configure your floor
                                layout or add seats.
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={
                                    <Settings />
                                }
                                onClick={
                                    openLayoutDialog
                                }
                                disabled={!floorId}
                            >
                                Configure Layout
                            </Button>
                        </Box>
                    ) : (
                        <Stack
                            spacing={2}
                            sx={{
                                overflowX:
                                    "auto",
                                pb: 2,
                            }}
                        >
                            {rows.map((row) => (
                                <Box
                                    key={row.name}
                                >
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={2}
                                    >
                                        {/* ROW */}
                                        <Box
                                            sx={{
                                                width: 55,
                                                minWidth: 55,
                                                height: 65,
                                                display:
                                                    "flex",
                                                alignItems:
                                                    "center",
                                                justifyContent:
                                                    "center",
                                                borderRadius:
                                                    2,
                                                background:
                                                    "#EAF2FF",
                                                color:
                                                    "#14235B",
                                                fontSize: 22,
                                                fontWeight:
                                                    800,
                                            }}
                                        >
                                            {row.name}
                                        </Box>

                                        {/* SEATS */}
                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                        >
                                            {row.seats.map(
                                                (seat) => {
                                                    const color =
                                                        SEAT_STATUS_COLORS[
                                                            seat.displayStatus
                                                        ] ||
                                                        "#94A3B8";

                                                    const isBooked =
                                                        seat.displayStatus ===
                                                        "BOOKED";

                                                    return (
                                                        <Box
                                                            key={
                                                                seat.id
                                                            }
                                                            onClick={() =>
                                                                handleSelectSeat(
                                                                    seat
                                                                )
                                                            }
                                                            sx={{
                                                                width: 82,
                                                                minWidth: 82,
                                                                height: 88,
                                                                borderRadius: 2.5,
                                                                border: `2px solid ${color}`,
                                                                background: `${color}18`,
                                                                cursor: "pointer",
                                                                display: "flex",
                                                                flexDirection:
                                                                    "column",
                                                                alignItems:
                                                                    "center",
                                                                justifyContent:
                                                                    "center",
                                                                transition:
                                                                    "all .2s",
                                                                opacity:
                                                                    isBooked
                                                                        ? 0.9
                                                                        : 1,
                                                                "&:hover":
                                                                    {
                                                                        transform:
                                                                            "translateY(-2px)",
                                                                        boxShadow:
                                                                            3,
                                                                    },
                                                            }}
                                                        >
                                                            <Typography
                                                                sx={{
                                                                    fontWeight:
                                                                        800,
                                                                    color:
                                                                        "#11194B",
                                                                }}
                                                            >
                                                                {
                                                                    seat.seatNumber
                                                                }
                                                            </Typography>

                                                            <EventSeat
                                                                sx={{
                                                                    fontSize: 35,
                                                                    color,
                                                                    mt: 0.5,
                                                                }}
                                                            />

                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color,
                                                                    fontWeight:
                                                                        700,
                                                                }}
                                                            >
                                                                {
                                                                    SEAT_STATUS_LABELS[
                                                                        seat.displayStatus
                                                                    ]
                                                                }
                                                            </Typography>
                                                        </Box>
                                                    );
                                                }
                                            )}
                                        </Stack>
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    )}

                    {/* RECEPTION */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                        }}
                    >
                        <Box
                            sx={{
                                px: 8,
                                py: 1.5,
                                borderRadius: 2,
                                background:
                                    "#EEF3FA",
                                border:
                                    "1px solid #CBD5E1",
                                fontWeight: 800,
                                color: "#26355C",
                            }}
                        >
                            RECEPTION
                        </Box>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* LEGEND */}
                    <Stack
                        direction="row"
                        spacing={3}
                        flexWrap="wrap"
                        useFlexGap
                    >
                        {[
                            "AVAILABLE",
                            "BOOKED",
                            "RESERVED",
                            "RESERVED_FOR_GIRLS",
                            "MAINTENANCE",
                        ].map((status) => (
                            <Stack
                                key={status}
                                direction="row"
                                spacing={1}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        width: 18,
                                        height: 18,
                                        borderRadius:
                                            "50%",
                                        background:
                                            SEAT_STATUS_COLORS[
                                                status
                                            ],
                                    }}
                                />

                                <Typography>
                                    {
                                        SEAT_STATUS_LABELS[
                                            status
                                        ]
                                    }{" "}
                                    (
                                    {stats[
                                        status
                                    ] || 0}
                                    )
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>

                    {/* SAVE */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent:
                                "flex-end",
                            mt: 3,
                        }}
                    >
                        <Button
                            variant="contained"
                            startIcon={<Save />}
                            onClick={
                                handleSaveLayout
                            }
                            disabled={
                                saving ||
                                !floorId
                            }
                            sx={{
                                minWidth: 220,
                                py: 1.4,
                            }}
                        >
                            {saving
                                ? "Saving..."
                                : "Save Seat Layout"}
                        </Button>
                    </Box>
                </CardContent>
            </Card>

            {/* ===================================================
                CONFIGURE LAYOUT DIALOG
            =================================================== */}
            <Dialog
                open={layoutDialogOpen}
                onClose={() =>
                    setLayoutDialogOpen(false)
                }
                fullWidth
                maxWidth="lg"
            >
                <DialogTitle
                    sx={{
                        fontWeight: 800,
                    }}
                >
                    Configure Library Layout
                </DialogTitle>

                <DialogContent>
                    <Grid
                        container
                        spacing={3}
                        sx={{ mt: 0.5 }}
                    >
                        <Grid
                            size={{
                                xs: 12,
                                md: 4,
                            }}
                        >
                            <Stack spacing={2}>
                                <TextField
                                    label="Rows"
                                    type="number"
                                    value={
                                        layoutRows
                                    }
                                    onChange={(event) =>
                                        setLayoutRows(
                                            Math.min(
                                                26,
                                                Math.max(
                                                    1,
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    ) || 1
                                                )
                                            )
                                        )
                                    }
                                />

                                <TextField
                                    label="Seats per Row"
                                    type="number"
                                    value={
                                        layoutSeatsPerRow
                                    }
                                    onChange={(event) =>
                                        setLayoutSeatsPerRow(
                                            Math.min(
                                                100,
                                                Math.max(
                                                    1,
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    ) || 1
                                                )
                                            )
                                        )
                                    }
                                />

                                {seats.length >
                                    0 && (
                                    <Alert severity="warning">
                                        This floor already
                                        contains seats.
                                        Configure Layout is
                                        only for an empty
                                        floor. Use Add Row or
                                        Add Seats to extend
                                        the existing layout.
                                    </Alert>
                                )}

                                {seats.length ===
                                    0 && (
                                    <Alert severity="info">
                                        This will create the
                                        initial physical seat
                                        layout for the selected
                                        floor.
                                    </Alert>
                                )}
                            </Stack>
                        </Grid>

                        <Grid
                            size={{
                                xs: 12,
                                md: 8,
                            }}
                        >
                            <Box
                                sx={{
                                    p: 3,
                                    border:
                                        "1px solid #E1E9F3",
                                    borderRadius: 3,
                                    overflowX:
                                        "auto",
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight={800}
                                    mb={2}
                                >
                                    Layout Preview
                                </Typography>

                                <Stack spacing={1}>
                                    {Array.from(
                                        {
                                            length:
                                                layoutRows,
                                        },
                                        (_, rowIndex) => {
                                            const row =
                                                String.fromCharCode(
                                                    65 +
                                                        rowIndex
                                                );

                                            return (
                                                <Stack
                                                    key={
                                                        row
                                                    }
                                                    direction="row"
                                                    spacing={1}
                                                    justifyContent="center"
                                                >
                                                    {Array.from(
                                                        {
                                                            length:
                                                                layoutSeatsPerRow,
                                                        },
                                                        (
                                                            __,
                                                            columnIndex
                                                        ) => (
                                                            <Box
                                                                key={
                                                                    columnIndex
                                                                }
                                                                sx={{
                                                                    width: 65,
                                                                    minWidth: 65,
                                                                    height: 60,
                                                                    borderRadius: 2,
                                                                    background:
                                                                        "#E8F8EE",
                                                                    border:
                                                                        "1px solid #61D68A",
                                                                    display:
                                                                        "flex",
                                                                    alignItems:
                                                                        "center",
                                                                    justifyContent:
                                                                        "center",
                                                                    color:
                                                                        "#168A43",
                                                                    fontWeight:
                                                                        800,
                                                                }}
                                                            >
                                                                {row}
                                                                {columnIndex +
                                                                    1}
                                                            </Box>
                                                        )
                                                    )}
                                                </Stack>
                                            );
                                        }
                                    )}
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setLayoutDialogOpen(
                                false
                            )
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        onClick={
                            handleApplyLayout
                        }
                        disabled={
                            saving ||
                            seats.length > 0
                        }
                    >
                        {saving
                            ? "Applying..."
                            : "Apply Layout"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ===================================================
                ADD ROW DIALOG
            =================================================== */}
            <Dialog
                open={rowDialogOpen}
                onClose={() =>
                    setRowDialogOpen(false)
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Add Row
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            label="Row Name"
                            value={rowName}
                            onChange={(event) =>
                                setRowName(
                                    event.target.value
                                        .replace(
                                            /[^a-zA-Z]/g,
                                            ""
                                        )
                                        .toUpperCase()
                                )
                            }
                            placeholder="E"
                            inputProps={{
                                maxLength: 3,
                            }}
                        />

                        <TextField
                            label="Number of Seats"
                            type="number"
                            value={
                                rowSeatCount
                            }
                            onChange={(event) =>
                                setRowSeatCount(
                                    Math.min(
                                        100,
                                        Math.max(
                                            1,
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            ) || 1
                                        )
                                    )
                                )
                            }
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setRowDialogOpen(
                                false
                            )
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        disabled={
                            !rowName.trim() ||
                            saving ||
                            !floorId
                        }
                        onClick={
                            handleAddRow
                        }
                    >
                        Add Row
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ===================================================
                ADD SEATS DIALOG
            =================================================== */}
            <Dialog
                open={addSeatsDialogOpen}
                onClose={() =>
                    setAddSeatsDialogOpen(
                        false
                    )
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    Add Seats
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ mt: 1 }}
                    >
                        <FormControl fullWidth>
                            <InputLabel>
                                Row
                            </InputLabel>

                            <Select
                                value={
                                    selectedRow
                                }
                                label="Row"
                                onChange={(event) =>
                                    setSelectedRow(
                                        event.target
                                            .value
                                    )
                                }
                            >
                                {rows.map(
                                    (row) => (
                                        <MenuItem
                                            key={
                                                row.name
                                            }
                                            value={
                                                row.name
                                            }
                                        >
                                            Row{" "}
                                            {
                                                row.name
                                            }
                                        </MenuItem>
                                    )
                                )}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Number of Seats"
                            type="number"
                            value={
                                additionalSeats
                            }
                            onChange={(event) =>
                                setAdditionalSeats(
                                    Math.min(
                                        100,
                                        Math.max(
                                            1,
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            ) || 1
                                        )
                                    )
                                )
                            }
                        />
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setAddSeatsDialogOpen(
                                false
                            )
                        }
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        disabled={
                            !selectedRow ||
                            saving ||
                            !floorId
                        }
                        onClick={
                            handleAddSeats
                        }
                    >
                        Add Seats
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ===================================================
                SEAT DETAILS DIALOG
            =================================================== */}
            <Dialog
                open={seatDialogOpen}
                onClose={() =>
                    setSeatDialogOpen(false)
                }
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Seat{" "}
                    {
                        selectedSeat?.seatNumber
                    }
                </DialogTitle>

                <DialogContent>
                    {selectedSeat && (
                        <Stack
                            spacing={3}
                            sx={{ mt: 1 }}
                        >
                            <Box
                                sx={{
                                    p: 3,
                                    textAlign:
                                        "center",
                                    borderRadius: 3,
                                    background:
                                        `${
                                            SEAT_STATUS_COLORS[
                                                selectedSeat
                                                    .displayStatus
                                            ] ||
                                            "#64748B"
                                        }18`,
                                }}
                            >
                                <EventSeat
                                    sx={{
                                        fontSize: 55,
                                        color:
                                            SEAT_STATUS_COLORS[
                                                selectedSeat
                                                    .displayStatus
                                            ] ||
                                            "#64748B",
                                    }}
                                />

                                <Typography
                                    variant="h5"
                                    fontWeight={800}
                                >
                                    {
                                        selectedSeat.seatNumber
                                    }
                                </Typography>

                                <Chip
                                    label={
                                        SEAT_STATUS_LABELS[
                                            selectedSeat
                                                .displayStatus
                                        ] ||
                                        selectedSeat.displayStatus
                                    }
                                    sx={{
                                        mt: 1,
                                        color:
                                            "#fff",
                                        background:
                                            SEAT_STATUS_COLORS[
                                                selectedSeat
                                                    .displayStatus
                                            ] ||
                                            "#64748B",
                                    }}
                                />
                            </Box>

                            <Typography>
                                <strong>
                                    Floor:
                                </strong>{" "}
                                {
                                    floors.find(
                                        (floor) =>
                                            String(
                                                floor.id
                                            ) ===
                                            String(
                                                floorId
                                            )
                                    )?.name ||
                                    "Selected floor"
                                }
                            </Typography>

                            <Typography>
                                <strong>
                                    Seat Number:
                                </strong>{" "}
                                {
                                    selectedSeat.seatNumber
                                }
                            </Typography>

                            <Typography>
                                <strong>
                                    Physical Status:
                                </strong>{" "}
                                {
                                    SEAT_STATUS_LABELS[
                                        selectedSeat
                                            .physicalStatus
                                    ] ||
                                    selectedSeat.physicalStatus
                                }
                            </Typography>

                            {selectedSeat.displayStatus ===
                                "BOOKED" && (
                                <Alert severity="info">
                                    This seat is booked for
                                    the selected date. BOOKED
                                    is calculated from the
                                    booking system and cannot
                                    be manually assigned.
                                </Alert>
                            )}

                            <FormControl
                                fullWidth
                                disabled={
                                    selectedSeat.displayStatus ===
                                    "BOOKED"
                                }
                            >
                                <InputLabel>
                                    Physical Status
                                </InputLabel>

                                <Select
                                    value={
                                        newStatus
                                    }
                                    label="Physical Status"
                                    onChange={(event) =>
                                        setNewStatus(
                                            event.target
                                                .value
                                        )
                                    }
                                >
                                    {MANAGEMENT_STATUSES.map(
                                        (status) => (
                                            <MenuItem
                                                key={
                                                    status
                                                }
                                                value={
                                                    status
                                                }
                                            >
                                                {
                                                    SEAT_STATUS_LABELS[
                                                        status
                                                    ]
                                                }
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>

                            <FormControl
                                fullWidth
                                disabled={
                                    selectedSeat.displayStatus ===
                                    "BOOKED"
                                }
                            >
                                <InputLabel>
                                    Seat Type
                                </InputLabel>

                                <Select
                                    value={
                                        newSeatType
                                    }
                                    label="Seat Type"
                                    onChange={(event) =>
                                        setNewSeatType(
                                            event.target
                                                .value
                                        )
                                    }
                                >
                                    {SEAT_TYPES.map(
                                        (type) => (
                                            <MenuItem
                                                key={
                                                    type
                                                }
                                                value={
                                                    type
                                                }
                                            >
                                                {type.replace(
                                                    /_/g,
                                                    " "
                                                )}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>
                        </Stack>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button
                        color="error"
                        startIcon={
                            <DeleteOutline />
                        }
                        onClick={
                            handleDeleteSeat
                        }
                        disabled={
                            saving ||
                            selectedSeat?.displayStatus ===
                                "BOOKED"
                        }
                    >
                        Delete Seat
                    </Button>

                    <Box sx={{ flex: 1 }} />

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
                        variant="contained"
                        onClick={
                            handleSaveSeat
                        }
                        disabled={
                            saving ||
                            selectedSeat?.displayStatus ===
                                "BOOKED"
                        }
                    >
                        {saving
                            ? "Saving..."
                            : "Save Seat"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default SeatMapping;
