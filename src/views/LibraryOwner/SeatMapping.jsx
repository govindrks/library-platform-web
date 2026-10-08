import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Add,
  DeleteOutlineOutlined,
  EventSeat,
  Refresh,
  Settings,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
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
  Paper,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import seatApi from "../../api/seatApi";

import libraryApi from "../../api/libraryApi";

// ============================================================

// CONSTANTS

// ============================================================

const DEFAULT_ROWS = 4;

const DEFAULT_SEATS_PER_ROW = 5;

const DEFAULT_SEAT_TYPE = "NORMAL";

const DEFAULT_SEAT_STATUS = "AVAILABLE";

const SEAT_TYPES = ["NORMAL", "PREMIUM", "FEMALE_ONLY", "WINDOW", "QUIET_ZONE"];

const SEAT_STATUSES = [
  "AVAILABLE",

  "BOOKED",

  "RESERVED",

  "RESERVED_FOR_GIRLS",

  "MAINTENANCE",
];

const MANAGEMENT_STATUSES = [
  "AVAILABLE",

  "RESERVED",

  "RESERVED_FOR_GIRLS",

  "MAINTENANCE",
];

const SEAT_STATUS_LABELS = {
  AVAILABLE: "Available",

  BOOKED: "Booked",

  RESERVED: "Reserved",

  RESERVED_FOR_GIRLS: "Girls Reserved",

  MAINTENANCE: "Maintenance",
};

const SEAT_TYPE_LABELS = {
  NORMAL: "Normal",

  PREMIUM: "Premium",

  FEMALE_ONLY: "Female Only",

  WINDOW: "Window",

  QUIET_ZONE: "Quiet Zone",
};

// ============================================================

// HELPERS

// ============================================================

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const normalizeSeatMatrix = (matrix) => {
  if (!Array.isArray(matrix)) {
    return [];
  }

  return matrix.flatMap((row) => {
    if (!Array.isArray(row?.seats)) {
      return [];
    }

    return row.seats.map((seat) => ({
      ...seat,

      // Backend may expose either id or seatId.

      id: seat.id ?? seat.seatId,

      rowLabel: seat.rowLabel || row.rowLabel,
    }));
  });
};

const getNextRowLabel = (seats) => {
  if (!seats.length) {
    return "A";
  }

  const rows = seats

    .map((seat) => seat.rowLabel)

    .filter(Boolean)

    .map((row) => String(row).toUpperCase());

  if (!rows.length) {
    return "A";
  }

  const highestRow = rows.sort().at(-1);

  const code = highestRow.charCodeAt(0);

  if (code >= 90) {
    return null;
  }

  return String.fromCharCode(code + 1);
};

// ============================================================

// COMPONENT

// ============================================================

const SeatMapping = () => {
  // ========================================================

  // LIBRARY

  // ========================================================

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  // ========================================================

  // FLOOR + SEATS

  // ========================================================

  const [floors, setFloors] = useState([]);

  const [floorId, setFloorId] = useState("");

  const [seats, setSeats] = useState([]);

  // ========================================================

  // LOADING

  // ========================================================

  const [loadingFloors, setLoadingFloors] = useState(false);

  const [loadingSeats, setLoadingSeats] = useState(false);

  const [saving, setSaving] = useState(false);

  // ========================================================

  // MESSAGES

  // ========================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ========================================================

  // ADD FLOOR

  // ========================================================

  const [floorDialogOpen, setFloorDialogOpen] = useState(false);

  const [newFloorName, setNewFloorName] = useState("");

  const [newFloorNumber, setNewFloorNumber] = useState("");

  // ========================================================

  // CONFIGURE LAYOUT

  // ========================================================

  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false);

  const [layoutRows, setLayoutRows] = useState(DEFAULT_ROWS);

  const [layoutSeatsPerRow, setLayoutSeatsPerRow] = useState(
    DEFAULT_SEATS_PER_ROW,
  );

  const [layoutStartingRow, setLayoutStartingRow] = useState("A");

  const [layoutSeatType, setLayoutSeatType] = useState(DEFAULT_SEAT_TYPE);

  const [layoutSeatStatus, setLayoutSeatStatus] = useState(DEFAULT_SEAT_STATUS);

  // ========================================================

  // ADD ROW

  // ========================================================

  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);

  const [addRowSeats, setAddRowSeats] = useState(DEFAULT_SEATS_PER_ROW);

  const [addRowSeatType, setAddRowSeatType] = useState("NORMAL");

  const [addRowSeatStatus, setAddRowSeatStatus] = useState("AVAILABLE");

  // ========================================================

  // ADD SEATS

  // ========================================================

  const [addSeatDialogOpen, setAddSeatDialogOpen] = useState(false);

  const [addSeatMode, setAddSeatMode] = useState("APPEND");

  const [addSeatRow, setAddSeatRow] = useState("");

  const [addSeatCount, setAddSeatCount] = useState(1);

  const [addSeatColumn, setAddSeatColumn] = useState("");

  const [addSeatNumber, setAddSeatNumber] = useState("");

  const [addSeatType, setAddSeatType] = useState("NORMAL");

  const [addSeatStatus, setAddSeatStatus] = useState("AVAILABLE");

  // ========================================================

  // EDIT SEAT

  // ========================================================

  const [seatDialogOpen, setSeatDialogOpen] = useState(false);

  const [selectedSeat, setSelectedSeat] = useState(null);

  const [editSeatType, setEditSeatType] = useState("");

  const [editSeatStatus, setEditSeatStatus] = useState("");

  // ========================================================

  // LOAD AUTHENTICATED OWNER LIBRARIES

  // ========================================================

  const loadLibraries = useCallback(async () => {
    try {
      setLoadingLibraries(true);

      setError("");

      const data = await libraryApi.getMyLibraries();

      const libraryList = Array.isArray(data) ? data : [];

      setLibraries(libraryList);

      if (libraryList.length === 0) {
        setLibraryId("");

        setFloors([]);

        setFloorId("");

        setSeats([]);

        return;
      }

      setLibraryId((currentLibraryId) => {
        const currentExists =
          currentLibraryId &&
          libraryList.some(
            (library) => String(library.id) === String(currentLibraryId),
          );

        if (currentExists) {
          return String(currentLibraryId);
        }

        return String(libraryList[0].id);
      });
    } catch (err) {
      console.error("Failed to load owner libraries:", err);

      setLibraries([]);

      setLibraryId("");

      setFloors([]);

      setFloorId("");

      setSeats([]);

      setError(getErrorMessage(err, "Failed to load your libraries."));
    } finally {
      setLoadingLibraries(false);
    }
  }, []);

  // ========================================================

  // LOAD FLOORS

  // ========================================================

  const loadFloors = useCallback(async () => {
    if (!libraryId) {
      setFloors([]);

      setFloorId("");

      setSeats([]);

      return;
    }

    try {
      setLoadingFloors(true);

      setError("");

      const data = await seatApi.getFloors(libraryId);

      const floorList = Array.isArray(data) ? data : [];

      setFloors(floorList);

      if (floorList.length === 0) {
        setFloorId("");

        setSeats([]);

        return;
      }

      setFloorId((currentFloorId) => {
        const currentExists =
          currentFloorId &&
          floorList.some(
            (floor) => String(floor.id) === String(currentFloorId),
          );

        if (currentExists) {
          return String(currentFloorId);
        }

        return String(floorList[0].id);
      });
    } catch (err) {
      console.error("Failed to load floors:", err);

      setFloors([]);

      setFloorId("");

      setSeats([]);

      setError(getErrorMessage(err, "Failed to load floors."));
    } finally {
      setLoadingFloors(false);
    }
  }, [libraryId]);

  // ========================================================

  // LOAD SEAT MATRIX

  // ========================================================

  const loadSeatMapping = useCallback(async () => {
    if (!libraryId || !floorId) {
      setSeats([]);

      return;
    }

    try {
      setLoadingSeats(true);

      setError("");

      const data = await seatApi.getSeatMatrix(libraryId, floorId);

      setSeats(normalizeSeatMatrix(data));
    } catch (err) {
      console.error("Failed to load seat matrix:", err);

      setSeats([]);

      setError(getErrorMessage(err, "Failed to load seat layout."));
    } finally {
      setLoadingSeats(false);
    }
  }, [libraryId, floorId]);

  // ========================================================

  // INITIAL LOAD

  // ========================================================

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  // ========================================================

  // LIBRARY CHANGED -> LOAD FLOORS

  // ========================================================

  useEffect(() => {
    setFloorId("");

    setSeats([]);

    if (!libraryId) {
      setFloors([]);

      return;
    }

    loadFloors();
  }, [libraryId, loadFloors]);

  // ========================================================

  // FLOOR CHANGED -> LOAD SEAT MATRIX

  // ========================================================

  useEffect(() => {
    if (!libraryId || !floorId) {
      setSeats([]);

      return;
    }

    loadSeatMapping();
  }, [libraryId, floorId, loadSeatMapping]);

  // ========================================================

  // GROUP SEATS BY ROW

  // ========================================================

  const seatRows = useMemo(() => {
    const rows = {};

    seats.forEach((seat) => {
      const rowLabel = seat.rowLabel || "UNKNOWN";

      if (!rows[rowLabel]) {
        rows[rowLabel] = [];
      }

      rows[rowLabel].push(seat);
    });

    return Object.keys(rows)

      .sort()

      .map((rowLabel) => ({
        rowLabel,

        seats: rows[rowLabel].sort(
          (a, b) => Number(a.columnNumber) - Number(b.columnNumber),
        ),
      }));
  }, [seats]);

  // ========================================================

  // SEAT POSITION HELPERS

  // ========================================================

  const getSeatAtPosition = useCallback(
    (rowLabel, columnNumber) => {
      return seats.find(
        (seat) =>
          String(seat.rowLabel || "").toUpperCase() ===
            String(rowLabel || "").toUpperCase() &&
          Number(seat.columnNumber) === Number(columnNumber),
      );
    },

    [seats],
  );

  const maxColumnNumber = useMemo(() => {
    if (seats.length === 0) {
      return 0;
    }

    return Math.max(...seats.map((seat) => Number(seat.columnNumber) || 0));
  }, [seats]);

  // ========================================================

  // NEXT LOGICAL SEAT NUMBER FOR ROW

  // ========================================================

  const getNextSeatNumberForRow = useCallback(
    (rowLabel) => {
      if (!rowLabel) {
        return "";
      }

      const normalizedRow = String(rowLabel).trim().toUpperCase();

      const rowSeatCount = seats.filter(
        (seat) =>
          String(seat.rowLabel || "")
            .trim()
            .toUpperCase() === normalizedRow,
      ).length;

      return `${normalizedRow}${rowSeatCount + 1}`;
    },

    [seats],
  );

  // ========================================================

  // STATISTICS

  // ========================================================

  const statistics = useMemo(() => {
    return {
      total: seats.length,

      available: seats.filter((seat) => seat.status === "AVAILABLE").length,

      booked: seats.filter((seat) => seat.status === "BOOKED").length,

      reserved: seats.filter((seat) => seat.status === "RESERVED").length,

      girlsReserved: seats.filter(
        (seat) => seat.status === "RESERVED_FOR_GIRLS",
      ).length,

      maintenance: seats.filter((seat) => seat.status === "MAINTENANCE").length,
    };
  }, [seats]);

  // ========================================================

  // CREATE FLOOR

  // ========================================================

  const handleCreateFloor = async () => {
    if (!libraryId) {
      setError("Please select a library.");

      return;
    }

    if (!newFloorName.trim()) {
      setError("Floor name is required.");

      return;
    }

    const floorNumber = Number(newFloorNumber);

    if (!Number.isInteger(floorNumber)) {
      setError("Valid floor number is required.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      const createdFloor = await seatApi.createFloor(libraryId, {
        name: newFloorName.trim(),

        floorNumber,
      });

      setFloorDialogOpen(false);

      setNewFloorName("");

      setNewFloorNumber("");

      await loadFloors();

      if (createdFloor?.id) {
        setFloorId(String(createdFloor.id));
      }

      setSuccess("Floor created successfully.");
    } catch (err) {
      console.error("Failed to create floor:", err);

      setError(getErrorMessage(err, "Failed to create floor."));
    } finally {
      setSaving(false);
    }
  };

  // ========================================================

  // GENERATE INITIAL LAYOUT

  // ========================================================

  const handleApplyLayout = async () => {
    if (!libraryId) {
      setError("Please select a library.");

      return;
    }

    if (!floorId) {
      setError("Please select a floor.");

      return;
    }

    if (seats.length > 0) {
      setError(
        "This floor already contains seats. Use Add Row or Add Seats to extend the layout.",
      );

      return;
    }

    const rowCount = Number(layoutRows);

    const seatsPerRow = Number(layoutSeatsPerRow);

    if (!Number.isInteger(rowCount) || rowCount < 1) {
      setError("Rows must be greater than zero.");

      return;
    }

    if (!Number.isInteger(seatsPerRow) || seatsPerRow < 1) {
      setError("Seats per row must be greater than zero.");

      return;
    }

    const startingIndex = layoutStartingRow.toUpperCase().charCodeAt(0) - 65;

    if (startingIndex + rowCount > 26) {
      setError("Seat rows cannot extend beyond Z.");

      return;
    }

    const generatedSeats = [];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const rowLabel = String.fromCharCode(65 + startingIndex + rowIndex);

      for (let column = 1; column <= seatsPerRow; column++) {
        generatedSeats.push({
          seatNumber: `${rowLabel}${column}`,

          rowLabel,

          columnNumber: column,

          seatType: layoutSeatType,

          status: layoutSeatStatus,
        });
      }
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      await seatApi.saveLayout(libraryId, floorId, {
        seats: generatedSeats,
      });

      setLayoutDialogOpen(false);

      setSuccess(`${generatedSeats.length} seats created successfully.`);

      await loadSeatMapping();
    } catch (err) {
      console.error("Failed to generate layout:", err);

      setError(getErrorMessage(err, "Failed to generate seat layout."));
    } finally {
      setSaving(false);
    }
  };

  // ========================================================

  // CREATE SINGLE SEAT

  // ========================================================

  const createSingleSeat = async (
    row,

    column,

    seatType = "NORMAL",

    status = "AVAILABLE",

    seatNumber = null,
  ) => {
    const normalizedRow = String(row).trim().toUpperCase();

    const normalizedColumn = Number(column);

    const normalizedSeatNumber = seatNumber
      ? String(seatNumber).trim().toUpperCase()
      : `${normalizedRow}${normalizedColumn}`;

    if (!normalizedRow) {
      throw new Error("Row is required.");
    }

    if (!Number.isInteger(normalizedColumn) || normalizedColumn < 1) {
      throw new Error("Column number must be greater than 0.");
    }

    if (!normalizedSeatNumber) {
      throw new Error("Seat number is required.");
    }

    return seatApi.createSeat(libraryId, floorId, {
      seatNumber: normalizedSeatNumber,

      rowLabel: normalizedRow,

      columnNumber: normalizedColumn,

      seatType,

      status,
    });
  };

  // ========================================================

  // ADD ROW

  // ========================================================

  const handleAddRow = async () => {
    if (!libraryId || !floorId) {
      setError("Please select a library and floor.");

      return;
    }

    const seatCount = Number(addRowSeats);

    if (!Number.isInteger(seatCount) || seatCount < 1) {
      setError("Enter a valid number of seats.");

      return;
    }

    const nextRow = getNextRowLabel(seats);

    if (!nextRow) {
      setError("Maximum row Z has already been reached.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      for (let column = 1; column <= seatCount; column++) {
        await createSingleSeat(
          nextRow,

          column,

          addRowSeatType,

          addRowSeatStatus,
        );
      }

      setAddRowDialogOpen(false);

      setSuccess(`Row ${nextRow} added successfully.`);

      await loadSeatMapping();
    } catch (err) {
      console.error("Failed to add row:", err);

      setError(getErrorMessage(err, "Failed to add row."));
    } finally {
      setSaving(false);
    }
  };

  // ========================================================

  // ADD SEATS

  // ========================================================

  const handleAddSeats = async () => {
    if (!libraryId || !floorId) {
      setError("Please select a library and floor.");

      return;
    }

    if (!addSeatRow) {
      setError("Select a row.");

      return;
    }

    const normalizedRow = String(addSeatRow).trim().toUpperCase();

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      if (addSeatMode === "POSITION") {
        const column = Number(addSeatColumn);

        if (!Number.isInteger(column) || column < 1) {
          setError("Enter a valid column number.");

          return;
        }

        const existingSeat = getSeatAtPosition(normalizedRow, column);

        if (existingSeat) {
          setError(
            `Seat ${existingSeat.seatNumber} already occupies row ${normalizedRow}, column ${column}.`,
          );

          return;
        }

        const normalizedSeatNumber = String(addSeatNumber || "")
          .trim()

          .toUpperCase();

        if (!normalizedSeatNumber) {
          setError("Seat number is required.");

          return;
        }

        await createSingleSeat(
          normalizedRow,

          column,

          addSeatType,

          addSeatStatus,

          normalizedSeatNumber,
        );

        setAddSeatDialogOpen(false);

        setAddSeatColumn("");

        setAddSeatNumber("");

        setSuccess(`Seat ${normalizedSeatNumber} added successfully.`);

        await loadSeatMapping();

        return;
      }

      const count = Number(addSeatCount);

      if (!Number.isInteger(count) || count < 1) {
        setError("Enter a valid number of seats.");

        return;
      }

      const rowSeats = seats.filter(
        (seat) => String(seat.rowLabel || "").toUpperCase() === normalizedRow,
      );

      const highestColumn = rowSeats.length
        ? Math.max(...rowSeats.map((seat) => Number(seat.columnNumber)))
        : 0;

      const existingSeatCount = rowSeats.length;

      for (let index = 1; index <= count; index++) {
        await createSingleSeat(
          normalizedRow,

          highestColumn + index,

          addSeatType,

          addSeatStatus,

          `${normalizedRow}${existingSeatCount + index}`,
        );
      }

      setAddSeatDialogOpen(false);

      setSuccess(
        `${count} seat${count > 1 ? "s" : ""} added to row ${normalizedRow}.`,
      );

      await loadSeatMapping();
    } catch (err) {
      console.error("Failed to add seats:", err);

      setError(getErrorMessage(err, "Failed to add seats."));
    } finally {
      setSaving(false);
    }
  };

  const handleEmptyPositionClick = (rowLabel, columnNumber) => {
    setError("");

    setSuccess("");

    setAddSeatMode("POSITION");

    setAddSeatRow(rowLabel);

    setAddSeatColumn(String(columnNumber));

    setAddSeatNumber(getNextSeatNumberForRow(rowLabel));

    setAddSeatCount(1);

    setAddSeatDialogOpen(true);
  };

  // ========================================================

  // OPEN SEAT EDITOR

  // ========================================================

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);

    setEditSeatType(seat.seatType || "NORMAL");

    setEditSeatStatus(seat.status || "AVAILABLE");

    setSeatDialogOpen(true);
  };

  // ========================================================

  // UPDATE SEAT

  // ========================================================

  const handleUpdateSeat = async () => {
    if (!selectedSeat?.id) {
      setError("Seat ID not found.");

      return;
    }

    if (!libraryId) {
      setError("Library not selected.");

      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      const seatId = selectedSeat.id;

      if (editSeatType && editSeatType !== selectedSeat.seatType) {
        await seatApi.updateSeatType(libraryId, seatId, editSeatType);
      }

      if (editSeatStatus && editSeatStatus !== selectedSeat.status) {
        await seatApi.updateSeatStatus(libraryId, seatId, editSeatStatus);
      }

      await loadSeatMapping();

      setSeatDialogOpen(false);

      setSelectedSeat(null);

      setSuccess("Seat updated successfully.");
    } catch (err) {
      console.error("Failed to update seat:", err);

      setError(getErrorMessage(err, "Failed to update seat."));
    } finally {
      setSaving(false);
    }
  };

  // ========================================================

  // DELETE SEAT

  // ========================================================

  const handleDeleteSeat = async () => {
    if (!selectedSeat) {
      return;
    }

    if (selectedSeat.status === "BOOKED") {
      setError(
        "A booked seat cannot be deleted. Change or end the member's seat allocation first.",
      );

      return;
    }

    const confirmed = window.confirm(`Delete seat ${selectedSeat.seatNumber}?`);

    if (!confirmed) {
      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      await seatApi.deleteSeat(libraryId, selectedSeat.id);

      setSeatDialogOpen(false);

      setSelectedSeat(null);

      setSuccess("Seat deleted successfully.");

      await loadSeatMapping();
    } catch (err) {
      console.error("Failed to delete seat:", err);

      setError(getErrorMessage(err, "Failed to delete seat."));
    } finally {
      setSaving(false);
    }
  };

  // ========================================================

  // SEAT STYLE

  // ========================================================

  const getSeatStyle = (status) => {
    switch (status) {
      case "BOOKED":
        return {
          backgroundColor: "#fee2e2",

          borderColor: "#ef4444",

          color: "#991b1b",
        };

      case "RESERVED":
        return {
          backgroundColor: "#dbeafe",

          borderColor: "#3b82f6",

          color: "#1e40af",
        };

      case "RESERVED_FOR_GIRLS":
        return {
          backgroundColor: "#fce7f3",

          borderColor: "#ec4899",

          color: "#9d174d",
        };

      case "MAINTENANCE":
        return {
          backgroundColor: "#e5e7eb",

          borderColor: "#6b7280",

          color: "#374151",
        };

      case "AVAILABLE":

      default:
        return {
          backgroundColor: "#dcfce7",

          borderColor: "#22c55e",

          color: "#166534",
        };
    }
  };

  // ========================================================

  // CURRENT FLOOR

  // ========================================================

  const currentFloor = floors.find(
    (floor) => String(floor.id) === String(floorId),
  );

  // ========================================================

  // UI

  // ========================================================

  return (
    <Box
      sx={{
        p: {
          xs: 2,

          md: 3,
        },
      }}
    >
      {/* =================================================*

*                    HEADER*

*          ================================================= */}

      <Stack
        direction={{
          xs: "column",

          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",

          md: "center",
        }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Seat Mapping
          </Typography>

          <Typography color="text.secondary" mt={0.5}>
            Design and manage your library seat layout.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",

            sm: "row",
          }}
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadSeatMapping}
            disabled={!floorId || loadingSeats}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            disabled={!libraryId}
            onClick={() => setFloorDialogOpen(true)}
          >
            Add Floor
          </Button>
        </Stack>
      </Stack>

      {/* =================================================*

*                    ALERTS*

*          ================================================= */}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* =================================================*

*               LIBRARY + FLOOR + ACTION BAR*

*          ================================================= */}

      <Paper
        variant="outlined"
        sx={{
          p: 2,

          mb: 3,

          borderRadius: 3,
        }}
      >
        <Stack spacing={2}>
          <Grid container spacing={2} alignItems="center">
            {/* LIBRARY */}

            <Grid item xs={12} md={4}>
              <FormControl
                fullWidth
                size="small"
                disabled={loadingLibraries || libraries.length === 0}
              >
                <InputLabel>Library</InputLabel>

                <Select
                  value={libraryId}
                  label="Library"
                  onChange={(event) => {
                    const nextLibraryId = event.target.value;

                    setError("");

                    setSuccess("");

                    setFloorId("");

                    setFloors([]);

                    setSeats([]);

                    setLibraryId(nextLibraryId);
                  }}
                >
                  {libraries.map((library) => (
                    <MenuItem key={library.id} value={String(library.id)}>
                      {library.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* FLOOR — IMPORTANT FIX */}

            <Grid item xs={12} md={4}>
              <FormControl
                fullWidth
                size="small"
                disabled={!libraryId || loadingFloors || floors.length === 0}
              >
                <InputLabel>Floor</InputLabel>

                <Select
                  value={floorId}
                  label="Floor"
                  onChange={(event) => {
                    setFloorId(event.target.value);

                    setSeats([]);

                    setError("");

                    setSuccess("");
                  }}
                >
                  {floors.map((floor) => (
                    <MenuItem key={floor.id} value={String(floor.id)}>
                      {floor.name}

                      {floor.floorNumber !== null &&
                      floor.floorNumber !== undefined
                        ? ` (Floor ${floor.floorNumber})`
                        : ""}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ACTIONS */}

            <Grid item xs={12} md={4}>
              <Stack
                direction={{
                  xs: "column",

                  sm: "row",
                }}
                spacing={1}
                justifyContent={{
                  md: "flex-end",
                }}
              >
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  disabled={!floorId}
                  onClick={() => {
                    if (seats.length > 0) {
                      setError(
                        "This floor already has a seat layout. Use Add Row or Add Seats to extend it.",
                      );

                      return;
                    }

                    setLayoutDialogOpen(true);
                  }}
                >
                  Configure Layout
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<Add />}
                  disabled={!floorId || seats.length === 0}
                  onClick={() => setAddRowDialogOpen(true)}
                >
                  Add Row
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<EventSeat />}
                  disabled={!floorId || seats.length === 0}
                  onClick={() => {
                    if (seatRows.length > 0) {
                      const firstRow = seatRows[0].rowLabel;

                      setAddSeatRow(firstRow);

                      setAddSeatNumber(getNextSeatNumberForRow(firstRow));
                    }

                    setAddSeatMode("APPEND");

                    setAddSeatCount(1);

                    setAddSeatColumn("");

                    setAddSeatDialogOpen(true);
                  }}
                >
                  Add Seats
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      {/* =================================================*

*                    LOADING FLOORS*

*          ================================================= */}

      {loadingFloors && (
        <Paper
          variant="outlined"
          sx={{
            p: 5,

            mb: 3,

            borderRadius: 3,

            textAlign: "center",
          }}
        >
          <CircularProgress size={30} />

          <Typography color="text.secondary" mt={2}>
            Loading floors...
          </Typography>
        </Paper>
      )}

      {/* =================================================*

*                    NO FLOOR*

*          ================================================= */}

      {!loadingFloors && libraryId && floors.length === 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 6,

            textAlign: "center",

            borderRadius: 3,
          }}
        >
          <EventSeat
            sx={{
              fontSize: 55,

              color: "text.disabled",
            }}
          />

          <Typography variant="h6" mt={2}>
            No floors configured
          </Typography>

          <Typography color="text.secondary" mb={3}>
            Create your first floor to start configuring seats.
          </Typography>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFloorDialogOpen(true)}
          >
            Create Floor
          </Button>
        </Paper>
      )}

      {/* =================================================*

*                    SEAT LAYOUT*

*          ================================================= */}

      {floorId && (
        <Paper
          variant="outlined"
          sx={{
            p: {
              xs: 2,

              md: 4,
            },

            borderRadius: 3,
          }}
        >
          <Stack
            direction={{
              xs: "column",

              md: "row",
            }}
            justifyContent="space-between"
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {currentFloor?.name || "Floor"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Floor {currentFloor?.floorNumber ?? "-"} • Click a seat to
                manage its physical configuration.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip label={`Seats: ${statistics.total}`} />

              <Chip label={`Available: ${statistics.available}`} />

              <Chip label={`Booked: ${statistics.booked}`} />
            </Stack>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          {loadingSeats ? (
            <Box
              sx={{
                minHeight: 300,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : seats.length === 0 ? (
            <Box
              sx={{
                py: 8,

                textAlign: "center",
              }}
            >
              <EventSeat
                sx={{
                  fontSize: 60,

                  color: "text.disabled",
                }}
              />

              <Typography variant="h6" mt={2}>
                No seat layout
              </Typography>

              <Typography color="text.secondary" mb={3}>
                This floor currently has no seats.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Settings />}
                onClick={() => setLayoutDialogOpen(true)}
              >
                Configure Layout
              </Button>
            </Box>
          ) : (
            <>
              {/* ENTRANCE */}

              <Box
                sx={{
                  maxWidth: 900,

                  mx: "auto",

                  mb: 4,

                  py: 1.2,

                  textAlign: "center",

                  bgcolor: "grey.100",

                  borderRadius: 2,

                  fontWeight: 700,

                  letterSpacing: 2,
                }}
              >
                ENTRANCE
              </Box>

              {/* ROWS */}

              <Stack spacing={3}>
                {seatRows.map((row) => (
                  <Box
                    key={row.rowLabel}
                    sx={{
                      display: "flex",

                      alignItems: "center",

                      gap: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        width: 35,

                        fontWeight: 700,

                        textAlign: "center",
                      }}
                    >
                      {row.rowLabel}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",

                        gap: 1.5,

                        flexWrap: "nowrap",

                        overflowX: "auto",

                        pb: 1,
                      }}
                    >
                      {Array.from({
                        length: Math.max(
                          maxColumnNumber,

                          ...row.seats.map(
                            (seat) => Number(seat.columnNumber) || 0,
                          ),
                        ),
                      }).map((_, index) => {
                        const columnNumber = index + 1;

                        const seat = row.seats.find(
                          (item) => Number(item.columnNumber) === columnNumber,
                        );

                        if (!seat) {
                          return (
                            <Tooltip
                              key={`${row.rowLabel}-${columnNumber}`}
                              title={`Empty position • Row ${row.rowLabel}, Column ${columnNumber} • Click to add seat`}
                            >
                              <Box
                                onClick={() =>
                                  handleEmptyPositionClick(
                                    row.rowLabel,

                                    columnNumber,
                                  )
                                }
                                sx={{
                                  width: 62,

                                  minWidth: 62,

                                  height: 58,

                                  display: "flex",

                                  flexDirection: "column",

                                  alignItems: "center",

                                  justifyContent: "center",

                                  cursor: "pointer",

                                  border: "2px dashed",

                                  borderColor: "grey.300",

                                  backgroundColor: "grey.50",

                                  color: "text.disabled",

                                  borderRadius: 2,

                                  transition: "0.2s",

                                  "&:hover": {
                                    borderColor: "primary.main",

                                    color: "primary.main",

                                    backgroundColor: "action.hover",

                                    transform: "translateY(-2px)",
                                  },
                                }}
                              >
                                <Add fontSize="small" />

                                <Typography variant="caption" fontWeight={600}>
                                  {row.rowLabel}

                                  {columnNumber}
                                </Typography>
                              </Box>
                            </Tooltip>
                          );
                        }

                        const style = getSeatStyle(seat.status);

                        return (
                          <Tooltip
                            key={seat.id}
                            title={`${seat.seatNumber} • ${
                              SEAT_TYPE_LABELS[seat.seatType] ||
                              seat.seatType ||
                              "Normal"
                            } • ${
                              SEAT_STATUS_LABELS[seat.status] || seat.status
                            }`}
                          >
                            <Box
                              onClick={() => handleSeatClick(seat)}
                              sx={{
                                width: 62,

                                minWidth: 62,

                                height: 58,

                                display: "flex",

                                flexDirection: "column",

                                alignItems: "center",

                                justifyContent: "center",

                                cursor: "pointer",

                                border: "2px solid",

                                borderColor: style.borderColor,

                                backgroundColor: style.backgroundColor,

                                color: style.color,

                                borderRadius: 2,

                                transition: "0.2s",

                                "&:hover": {
                                  transform: "translateY(-3px)",

                                  boxShadow: 3,
                                },
                              }}
                            >
                              <EventSeat fontSize="small" />

                              <Typography variant="caption" fontWeight={700}>
                                {seat.seatNumber}
                              </Typography>
                            </Box>
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                ))}
              </Stack>

              {/* RECEPTION */}

              <Box
                sx={{
                  maxWidth: 900,

                  mx: "auto",

                  mt: 5,

                  mb: 4,

                  py: 1.2,

                  textAlign: "center",

                  bgcolor: "grey.100",

                  borderRadius: 2,

                  fontWeight: 700,

                  letterSpacing: 2,
                }}
              >
                RECEPTION
              </Box>

              {/* LEGEND */}

              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                useFlexGap
                justifyContent="center"
              >
                {SEAT_STATUSES.map((status) => {
                  const style = getSeatStyle(status);

                  return (
                    <Chip
                      key={status}
                      label={SEAT_STATUS_LABELS[status]}
                      sx={{
                        backgroundColor: style.backgroundColor,

                        color: style.color,

                        border: "1px solid",

                        borderColor: style.borderColor,
                      }}
                    />
                  );
                })}
              </Stack>

              {/* STATISTICS */}

              <Grid container spacing={2} mt={3}>
                <Grid item xs={6} md={2.4}>
                  <StatisticCard
                    label="Available"
                    value={statistics.available}
                  />
                </Grid>

                <Grid item xs={6} md={2.4}>
                  <StatisticCard label="Booked" value={statistics.booked} />
                </Grid>

                <Grid item xs={6} md={2.4}>
                  <StatisticCard label="Reserved" value={statistics.reserved} />
                </Grid>

                <Grid item xs={6} md={2.4}>
                  <StatisticCard
                    label="Girls"
                    value={statistics.girlsReserved}
                  />
                </Grid>

                <Grid item xs={6} md={2.4}>
                  <StatisticCard
                    label="Maintenance"
                    value={statistics.maintenance}
                  />
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      )}

      {/* =================================================*

*                    CREATE FLOOR DIALOG*

*          ================================================= */}

      <Dialog
        open={floorDialogOpen}
        onClose={() => !saving && setFloorDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Floor</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="Floor Name"
              placeholder="Ground Floor"
              value={newFloorName}
              onChange={(event) => setNewFloorName(event.target.value)}
              fullWidth
            />

            <TextField
              label="Floor Number"
              type="number"
              placeholder="0"
              value={newFloorNumber}
              onChange={(event) => setNewFloorNumber(event.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setFloorDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateFloor}
            disabled={saving}
          >
            {saving ? "Creating..." : "Create Floor"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================*

*                    CONFIGURE LAYOUT DIALOG*

*          ================================================= */}

      <Dialog
        open={layoutDialogOpen}
        onClose={() => !saving && setLayoutDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Configure Seat Layout</DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <TextField
              label="Number of Rows"
              type="number"
              value={layoutRows}
              inputProps={{
                min: 1,

                max: 26,
              }}
              onChange={(event) => setLayoutRows(event.target.value)}
              fullWidth
            />

            <TextField
              label="Seats Per Row"
              type="number"
              value={layoutSeatsPerRow}
              inputProps={{
                min: 1,
              }}
              onChange={(event) => setLayoutSeatsPerRow(event.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Starting Row</InputLabel>

              <Select
                value={layoutStartingRow}
                label="Starting Row"
                onChange={(event) => setLayoutStartingRow(event.target.value)}
              >
                {Array.from(
                  {
                    length: 26,
                  },

                  (_, index) => String.fromCharCode(65 + index),
                ).map((row) => (
                  <MenuItem key={row} value={row}>
                    {row}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Default Seat Type</InputLabel>

              <Select
                value={layoutSeatType}
                label="Default Seat Type"
                onChange={(event) => setLayoutSeatType(event.target.value)}
              >
                {SEAT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {SEAT_TYPE_LABELS[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Default Status</InputLabel>

              <Select
                value={layoutSeatStatus}
                label="Default Status"
                onChange={(event) => setLayoutSeatStatus(event.target.value)}
              >
                {MANAGEMENT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {SEAT_STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* PREVIEW */}

            <Paper
              variant="outlined"
              sx={{
                p: 2,

                maxHeight: 250,

                overflow: "auto",
              }}
            >
              <Typography variant="subtitle2" mb={2}>
                Preview
              </Typography>

              <Stack spacing={1}>
                {Array.from({
                  length: Math.min(Number(layoutRows) || 0, 26),
                }).map((_, rowIndex) => {
                  const start = layoutStartingRow.charCodeAt(0);

                  const row = String.fromCharCode(start + rowIndex);

                  return (
                    <Stack
                      key={row}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Typography
                        sx={{
                          width: 25,

                          fontWeight: 700,
                        }}
                      >
                        {row}
                      </Typography>

                      {Array.from({
                        length: Math.min(Number(layoutSeatsPerRow) || 0, 20),
                      }).map((__, columnIndex) => (
                        <Chip
                          key={columnIndex}
                          size="small"
                          label={`${row}${columnIndex + 1}`}
                        />
                      ))}
                    </Stack>
                  );
                })}
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setLayoutDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleApplyLayout}
            disabled={saving}
          >
            {saving ? "Generating..." : "Generate Layout"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================*

*                    ADD ROW DIALOG*

*          ================================================= */}

      <Dialog
        open={addRowDialogOpen}
        onClose={() => !saving && setAddRowDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Row</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Alert severity="info">
              New row:{" "}
              <strong>{getNextRowLabel(seats) || "No row available"}</strong>
            </Alert>

            <TextField
              label="Number of Seats"
              type="number"
              value={addRowSeats}
              inputProps={{
                min: 1,
              }}
              onChange={(event) => setAddRowSeats(event.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Seat Type</InputLabel>

              <Select
                value={addRowSeatType}
                label="Seat Type"
                onChange={(event) => setAddRowSeatType(event.target.value)}
              >
                {SEAT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {SEAT_TYPE_LABELS[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>

              <Select
                value={addRowSeatStatus}
                label="Status"
                onChange={(event) => setAddRowSeatStatus(event.target.value)}
              >
                {MANAGEMENT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {SEAT_STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddRowDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>

          <Button variant="contained" onClick={handleAddRow} disabled={saving}>
            {saving ? "Adding..." : "Add Row"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================*

*                    ADD SEATS DIALOG*

*          ================================================= */}

      <Dialog
        open={addSeatDialogOpen}
        onClose={() => !saving && setAddSeatDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Seats</DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
            <FormControl fullWidth>
              <InputLabel>Add By</InputLabel>

              <Select
                value={addSeatMode}
                label="Add By"
                onChange={(event) => {
                  const nextMode = event.target.value;

                  setAddSeatMode(nextMode);

                  setError("");

                  if (nextMode === "POSITION") {
                    setAddSeatCount(1);

                    setAddSeatNumber(getNextSeatNumberForRow(addSeatRow));
                  } else {
                    setAddSeatColumn("");

                    setAddSeatNumber("");
                  }
                }}
              >
                <MenuItem value="APPEND">Add to End of Row</MenuItem>

                <MenuItem value="POSITION">Exact Row & Column</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Row</InputLabel>

              <Select
                value={addSeatRow}
                label="Row"
                onChange={(event) => {
                  const selectedRow = event.target.value;

                  setAddSeatRow(selectedRow);

                  if (addSeatMode === "POSITION") {
                    setAddSeatNumber(getNextSeatNumberForRow(selectedRow));
                  }

                  setError("");
                }}
              >
                {seatRows.map((row) => (
                  <MenuItem key={row.rowLabel} value={row.rowLabel}>
                    Row {row.rowLabel}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {addSeatMode === "APPEND" && (
              <TextField
                label="Number of Seats"
                type="number"
                value={addSeatCount}
                inputProps={{
                  min: 1,
                }}
                onChange={(event) => setAddSeatCount(event.target.value)}
                fullWidth
              />
            )}

            {addSeatMode === "POSITION" && (
              <>
                <TextField
                  label="Column Number"
                  type="number"
                  value={addSeatColumn}
                  inputProps={{
                    min: 1,
                  }}
                  onChange={(event) => setAddSeatColumn(event.target.value)}
                  helperText="Choose the exact physical column where the seat should exist."
                  fullWidth
                />

                <TextField
                  label="Seat Number"
                  value={addSeatNumber}
                  onChange={(event) =>
                    setAddSeatNumber(event.target.value.toUpperCase())
                  }
                  helperText="Editable seat label. Physical position is controlled by Column Number."
                  fullWidth
                />

                {addSeatRow &&
                  addSeatColumn &&
                  Number(addSeatColumn) > 0 &&
                  getSeatAtPosition(addSeatRow, addSeatColumn) && (
                    <Alert severity="warning">
                      Position {addSeatRow}
                      {addSeatColumn} is already occupied by seat{" "}
                      {getSeatAtPosition(addSeatRow, addSeatColumn)?.seatNumber}
                      .
                    </Alert>
                  )}
              </>
            )}

            <FormControl fullWidth>
              <InputLabel>Seat Type</InputLabel>

              <Select
                value={addSeatType}
                label="Seat Type"
                onChange={(event) => setAddSeatType(event.target.value)}
              >
                {SEAT_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {SEAT_TYPE_LABELS[type]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>

              <Select
                value={addSeatStatus}
                label="Status"
                onChange={(event) => setAddSeatStatus(event.target.value)}
              >
                {MANAGEMENT_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {SEAT_STATUS_LABELS[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setAddSeatDialogOpen(false)} disabled={saving}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleAddSeats}
            disabled={
              saving ||
              !addSeatRow ||
              (addSeatMode === "POSITION" &&
                (!addSeatColumn ||
                  Number(addSeatColumn) < 1 ||
                  !String(addSeatNumber || "").trim()))
            }
          >
            {saving
              ? "Adding..."
              : addSeatMode === "POSITION"
                ? "Add Seat"
                : "Add Seats"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* =================================================*

*                    EDIT SEAT DIALOG*

*          ================================================= */}

      <Dialog
        open={seatDialogOpen}
        onClose={() => !saving && setSeatDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Manage Seat {selectedSeat?.seatNumber}</DialogTitle>

        <DialogContent>
          {selectedSeat && (
            <Stack spacing={2.5} mt={1}>
              {selectedSeat.status === "BOOKED" && (
                <Alert severity="info">
                  This seat is currently booked. Booking occupancy should be
                  managed through the booking flow.
                </Alert>
              )}

              <TextField
                label="Seat Number"
                value={selectedSeat.seatNumber || ""}
                disabled
                fullWidth
              />

              <TextField
                label="Row"
                value={selectedSeat.rowLabel || ""}
                disabled
                fullWidth
              />

              <TextField
                label="Column"
                value={selectedSeat.columnNumber ?? ""}
                disabled
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel>Seat Type</InputLabel>

                <Select
                  value={editSeatType}
                  label="Seat Type"
                  disabled={selectedSeat.status === "BOOKED"}
                  onChange={(event) => setEditSeatType(event.target.value)}
                >
                  {SEAT_TYPES.map((type) => (
                    <MenuItem key={type} value={type}>
                      {SEAT_TYPE_LABELS[type]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Physical Status</InputLabel>

                <Select
                  value={editSeatStatus}
                  label="Physical Status"
                  disabled={selectedSeat.status === "BOOKED"}
                  onChange={(event) => setEditSeatStatus(event.target.value)}
                >
                  {MANAGEMENT_STATUSES.map((status) => (
                    <MenuItem key={status} value={status}>
                      {SEAT_STATUS_LABELS[status]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: "space-between",

            px: 3,

            pb: 2,
          }}
        >
          <Button
            color="error"
            startIcon={<DeleteOutlineOutlined />}
            onClick={handleDeleteSeat}
            disabled={saving || selectedSeat?.status === "BOOKED"}
          >
            Delete
          </Button>

          <Stack direction="row" spacing={1}>
            <Button onClick={() => setSeatDialogOpen(false)} disabled={saving}>
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleUpdateSeat}
              disabled={saving || selectedSeat?.status === "BOOKED"}
            >
              {saving ? "Updating..." : "Update Seat"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ============================================================

// STATISTIC CARD

// ============================================================

const StatisticCard = ({ label, value }) => {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,

        textAlign: "center",

        borderRadius: 2,
      }}
    >
      <Typography variant="h5" fontWeight={700}>
        {value}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
};

export default SeatMapping;
