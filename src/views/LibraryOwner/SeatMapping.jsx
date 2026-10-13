import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Add,
  DeleteOutlineOutlined,
  DoorFrontOutlined,
  EventSeat,
  MeetingRoomOutlined,
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
// OWNER LIBRARY SELECTION
// ============================================================

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const getStoredOwnerLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
};

const storeOwnerLibraryId = (libraryId) => {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
};

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_ROWS = 4;

const DEFAULT_COLUMNS = 5;

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

const LAYOUT_POSITIONS = [
  {
    value: "TOP_LEFT",
    label: "Top Left",
  },
  {
    value: "TOP_CENTER",
    label: "Top Center",
  },
  {
    value: "TOP_RIGHT",
    label: "Top Right",
  },
  {
    value: "LEFT_CENTER",
    label: "Left Center",
  },
  {
    value: "RIGHT_CENTER",
    label: "Right Center",
  },
  {
    value: "BOTTOM_LEFT",
    label: "Bottom Left",
  },
  {
    value: "BOTTOM_CENTER",
    label: "Bottom Center",
  },
  {
    value: "BOTTOM_RIGHT",
    label: "Bottom Right",
  },
  {
    value: "NONE",
    label: "None",
  },
];

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

const normalizeRow = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const positionKey = (rowLabel, columnNumber) =>
  `${normalizeRow(rowLabel)}:${Number(columnNumber)}`;

const flattenRows = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.flatMap((row) => {
    if (!Array.isArray(row?.seats)) {
      return [];
    }

    return row.seats.map((seat) => ({
      ...seat,

      id: seat.id ?? seat.seatId,

      rowLabel: seat.rowLabel || row.rowLabel,
    }));
  });
};

const getRowLabel = (index) => String.fromCharCode(65 + index);

// ============================================================
// FLOOR NAME HELPER
// ============================================================

const getFloorName = (floorNumber) => {
  const number = Number(floorNumber);

  if (!Number.isInteger(number)) {
    return "";
  }

  if (number < 0) {
    return `Basement ${Math.abs(number)}`;
  }

  if (number === 0) {
    return "Ground Floor";
  }

  const floorNames = {
    1: "First Floor",
    2: "Second Floor",
    3: "Third Floor",
    4: "Fourth Floor",
    5: "Fifth Floor",
    6: "Sixth Floor",
    7: "Seventh Floor",
    8: "Eighth Floor",
    9: "Ninth Floor",
    10: "Tenth Floor",
    11: "Eleventh Floor",
    12: "Twelfth Floor",
    13: "Thirteenth Floor",
    14: "Fourteenth Floor",
    15: "Fifteenth Floor",
    16: "Sixteenth Floor",
    17: "Seventeenth Floor",
    18: "Eighteenth Floor",
    19: "Nineteenth Floor",
    20: "Twentieth Floor",
  };

  return floorNames[number] || `Floor ${number}`;
};

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

// ============================================================
// LAYOUT MARKER
// ============================================================

function LayoutMarker({ type }) {
  const isEntrance = type === "ENTRANCE";

  return (
    <Box
      sx={{
        minWidth: 170,

        px: 3,
        py: 1.25,

        borderRadius: 3,

        border: "1px solid",

        borderColor: "divider",

        bgcolor: "action.hover",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: 1,

        fontWeight: 800,

        letterSpacing: 1.5,
      }}
    >
      {isEntrance ? (
        <DoorFrontOutlined fontSize="small" />
      ) : (
        <MeetingRoomOutlined fontSize="small" />
      )}

      {type}
    </Box>
  );
}

// ============================================================
// STATISTIC CARD
// ============================================================

function StatisticCard({ label, value }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,

        borderRadius: 2,

        textAlign: "center",
      }}
    >
      <Typography variant="h6" fontWeight={800}>
        {value}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

// ============================================================
// COMPONENT
// ============================================================

const SeatMapping = () => {
  // ==========================================================
  // LIBRARY
  // ==========================================================

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  // ==========================================================
  // FLOOR
  // ==========================================================

  const [floors, setFloors] = useState([]);

  const [floorId, setFloorId] = useState("");

  // ==========================================================
  // COMPLETE FLOOR LAYOUT
  // ==========================================================

  const [seats, setSeats] = useState([]);

  const [gaps, setGaps] = useState([]);

  const [rowCount, setRowCount] = useState(0);

  const [columnCount, setColumnCount] = useState(0);

  const [entrancePosition, setEntrancePosition] = useState("TOP_CENTER");

  const [receptionPosition, setReceptionPosition] = useState("BOTTOM_CENTER");

  // ==========================================================
  // LOADING
  // ==========================================================

  const [loadingFloors, setLoadingFloors] = useState(false);

  const [loadingLayout, setLoadingLayout] = useState(false);

  const [saving, setSaving] = useState(false);

  // ==========================================================
  // MESSAGES
  // ==========================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // ADD FLOOR
  // ==========================================================

  const [floorDialogOpen, setFloorDialogOpen] = useState(false);

  const [newFloorNumber, setNewFloorNumber] = useState("");

  // ==========================================================
  // CONFIGURE LAYOUT
  // ==========================================================

  const [layoutDialogOpen, setLayoutDialogOpen] = useState(false);

  const [layoutRows, setLayoutRows] = useState(DEFAULT_ROWS);

  const [layoutColumns, setLayoutColumns] = useState(DEFAULT_COLUMNS);

  const [layoutSeatType, setLayoutSeatType] = useState(DEFAULT_SEAT_TYPE);

  const [layoutSeatStatus, setLayoutSeatStatus] = useState(DEFAULT_SEAT_STATUS);

  const [layoutEntrance, setLayoutEntrance] = useState("TOP_CENTER");

  const [layoutReception, setLayoutReception] = useState("BOTTOM_CENTER");

  // ==========================================================
  // POSITION ACTION DIALOG
  // ==========================================================

  const [positionDialogOpen, setPositionDialogOpen] = useState(false);

  const [selectedPosition, setSelectedPosition] = useState(null);

  // ==========================================================
  // ADD SEAT
  // ==========================================================

  const [addSeatDialogOpen, setAddSeatDialogOpen] = useState(false);

  const [addSeatRow, setAddSeatRow] = useState("");

  const [addSeatColumn, setAddSeatColumn] = useState("");

  const [addSeatNumber, setAddSeatNumber] = useState("");

  const [addSeatType, setAddSeatType] = useState("NORMAL");

  const [addSeatStatus, setAddSeatStatus] = useState("AVAILABLE");

  // ==========================================================
  // ADD ROW
  // ==========================================================

  const [addRowDialogOpen, setAddRowDialogOpen] = useState(false);

  const [addRowSeats, setAddRowSeats] = useState(DEFAULT_COLUMNS);

  const [addRowSeatType, setAddRowSeatType] = useState("NORMAL");

  const [addRowSeatStatus, setAddRowSeatStatus] = useState("AVAILABLE");

  // ==========================================================
  // EDIT SEAT
  // ==========================================================

  const [seatDialogOpen, setSeatDialogOpen] = useState(false);

  const [selectedSeat, setSelectedSeat] = useState(null);

  const [editSeatType, setEditSeatType] = useState("");

  const [editSeatStatus, setEditSeatStatus] = useState("");

  // ==========================================================
  // LOAD LIBRARIES
  // ==========================================================

  const loadLibraries = useCallback(async () => {
    try {
      setLoadingLibraries(true);

      setError("");

      const data = await libraryApi.getMyLibraries();

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : [];

      setLibraries(list);

      if (list.length === 0) {
        setLibraryId("");
        setFloors([]);
        setFloorId("");
        setSeats([]);
        setGaps([]);

        return;
      }

      const storedId = getStoredOwnerLibraryId();

      const storedLibrary =
        storedId !== null
          ? list.find((library) => Number(library.id) === Number(storedId))
          : null;

      const selectedLibrary = storedLibrary || list[0];

      const selectedId = String(selectedLibrary.id);

      setLibraryId(selectedId);

      storeOwnerLibraryId(selectedId);
    } catch (err) {
      console.error("Failed to load owner libraries:", err);

      setLibraries([]);
      setLibraryId("");
      setFloors([]);
      setFloorId("");
      setSeats([]);
      setGaps([]);

      setError(getErrorMessage(err, "Failed to load your libraries."));
    } finally {
      setLoadingLibraries(false);
    }
  }, []);

  // ==========================================================
  // LOAD FLOORS
  // ==========================================================

  const loadFloors = useCallback(async () => {
    if (!libraryId) {
      setFloors([]);
      setFloorId("");
      setSeats([]);
      setGaps([]);

      return;
    }

    try {
      setLoadingFloors(true);

      setError("");

      const data = await seatApi.getFloors(libraryId);

      const list = Array.isArray(data) ? data : [];

      setFloors(list);

      if (list.length === 0) {
        setFloorId("");
        setSeats([]);
        setGaps([]);

        return;
      }

      setFloorId((current) => {
        const exists =
          current && list.some((floor) => String(floor.id) === String(current));

        return exists ? String(current) : String(list[0].id);
      });
    } catch (err) {
      console.error("Failed to load floors:", err);

      setFloors([]);
      setFloorId("");
      setSeats([]);
      setGaps([]);

      setError(getErrorMessage(err, "Failed to load floors."));
    } finally {
      setLoadingFloors(false);
    }
  }, [libraryId]);

  // ==========================================================
  // LOAD COMPLETE LAYOUT
  // ==========================================================

  const loadFloorLayout = useCallback(async () => {
    if (!libraryId || !floorId) {
      setSeats([]);
      setGaps([]);
      setRowCount(0);
      setColumnCount(0);

      return;
    }

    try {
      setLoadingLayout(true);

      setError("");

      const data = await seatApi.getFloorLayout(libraryId, floorId);

      const loadedSeats = flattenRows(data?.rows);

      const loadedGaps = Array.isArray(data?.gaps) ? data.gaps : [];

      const loadedRows = Number(data?.rowCount ?? 0);

      const loadedColumns = Number(data?.columnCount ?? 0);

      setSeats(loadedSeats);

      setGaps(loadedGaps);

      setRowCount(loadedRows);

      setColumnCount(loadedColumns);

      setEntrancePosition(data?.entrancePosition || "TOP_CENTER");

      setReceptionPosition(data?.receptionPosition || "BOTTOM_CENTER");

      setLayoutRows(loadedRows || DEFAULT_ROWS);

      setLayoutColumns(loadedColumns || DEFAULT_COLUMNS);

      setLayoutEntrance(data?.entrancePosition || "TOP_CENTER");

      setLayoutReception(data?.receptionPosition || "BOTTOM_CENTER");
    } catch (err) {
      console.error("Failed to load complete floor layout:", err);

      setSeats([]);
      setGaps([]);

      setError(getErrorMessage(err, "Failed to load floor layout."));
    } finally {
      setLoadingLayout(false);
    }
  }, [libraryId, floorId]);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    setFloorId("");
    setSeats([]);
    setGaps([]);

    if (!libraryId) {
      setFloors([]);

      return;
    }

    loadFloors();
  }, [libraryId, loadFloors]);

  useEffect(() => {
    if (!libraryId || !floorId) {
      setSeats([]);
      setGaps([]);

      return;
    }

    loadFloorLayout();
  }, [libraryId, floorId, loadFloorLayout]);

  // ==========================================================
  // CURRENT FLOOR
  // ==========================================================

  const currentFloor = useMemo(
    () => floors.find((floor) => String(floor.id) === String(floorId)),
    [floors, floorId],
  );

  // ==========================================================
  // POSITION LOOKUPS
  // ==========================================================

  const seatByPosition = useMemo(() => {
    const map = new Map();

    seats.forEach((seat) => {
      map.set(positionKey(seat.rowLabel, seat.columnNumber), seat);
    });

    return map;
  }, [seats]);

  const gapKeys = useMemo(() => {
    return new Set(
      gaps.map((gap) => positionKey(gap.rowLabel, gap.columnNumber)),
    );
  }, [gaps]);

  const isGapPosition = (rowLabel, columnNumber) =>
    gapKeys.has(positionKey(rowLabel, columnNumber));

  // ==========================================================
  // STATISTICS
  // ==========================================================

  const statistics = useMemo(
    () => ({
      total: seats.length,

      available: seats.filter((seat) => seat.status === "AVAILABLE").length,

      booked: seats.filter((seat) => seat.status === "BOOKED").length,

      reserved: seats.filter((seat) => seat.status === "RESERVED").length,

      girlsReserved: seats.filter(
        (seat) => seat.status === "RESERVED_FOR_GIRLS",
      ).length,

      maintenance: seats.filter((seat) => seat.status === "MAINTENANCE").length,

      gaps: gaps.length,
    }),
    [seats, gaps],
  );

  // ==========================================================
  // SAVE COMPLETE LAYOUT
  // ==========================================================

  // ==========================================================
// SAVE COMPLETE FLOOR LAYOUT
// ==========================================================

const saveCompleteLayout = async ({
  nextSeats = seats,
  nextGaps = gaps,
  nextRowCount = rowCount,
  nextColumnCount = columnCount,
  nextEntrance = entrancePosition,
  nextReception = receptionPosition,
} = {}) => {
  // ========================================================
  // VALIDATE LIBRARY / FLOOR
  // ========================================================

  if (!libraryId || !floorId) {
    throw new Error("Library and floor are required.");
  }

  // ========================================================
  // NORMALIZE DIMENSIONS
  // ========================================================

  const normalizedRowCount = Number(nextRowCount);

  const normalizedColumnCount = Number(nextColumnCount);

  if (
    !Number.isInteger(normalizedRowCount) ||
    normalizedRowCount < 0 ||
    normalizedRowCount > 26
  ) {
    throw new Error("Invalid floor row count.");
  }

  if (
    !Number.isInteger(normalizedColumnCount) ||
    normalizedColumnCount < 0
  ) {
    throw new Error("Invalid floor column count.");
  }

  // ========================================================
  // NORMALIZE SEATS
  // ========================================================

  const seatPayload = (Array.isArray(nextSeats) ? nextSeats : []).map(
    (seat) => {
      const seatId = seat.id ?? seat.seatId ?? null;

      const seatNumber = String(seat.seatNumber || "")
        .trim()
        .toUpperCase();

      const rowLabel = normalizeRow(seat.rowLabel);

      const columnNumber = Number(seat.columnNumber);

      const seatType = seat.seatType || DEFAULT_SEAT_TYPE;

      const status = seat.status || DEFAULT_SEAT_STATUS;

      if (!seatNumber) {
        throw new Error("Every seat must have a seat number.");
      }

      if (!rowLabel) {
        throw new Error(`Seat ${seatNumber} must have a valid row.`);
      }

      if (
        !Number.isInteger(columnNumber) ||
        columnNumber < 1
      ) {
        throw new Error(
          `Seat ${seatNumber} must have a valid column number.`
        );
      }

      return {
        id: seatId,

        seatNumber,

        rowLabel,

        columnNumber,

        seatType,

        status,
      };
    }
  );

  // ========================================================
  // NORMALIZE GAPS
  // ========================================================

  const gapPayload = (Array.isArray(nextGaps) ? nextGaps : []).map(
    (gap) => {
      const rowLabel = normalizeRow(gap.rowLabel);

      const columnNumber = Number(gap.columnNumber);

      if (!rowLabel) {
        throw new Error("Every gap must have a valid row.");
      }

      if (
        !Number.isInteger(columnNumber) ||
        columnNumber < 1
      ) {
        throw new Error(
          `Gap ${rowLabel || "-"} must have a valid column number.`
        );
      }

      return {
        rowLabel,

        columnNumber,
      };
    }
  );

  // ========================================================
  // VALIDATE DUPLICATE SEAT NUMBERS
  // ========================================================

  const seatNumberSet = new Set();

  for (const seat of seatPayload) {
    if (seatNumberSet.has(seat.seatNumber)) {
      throw new Error(
        `Duplicate seat number detected: ${seat.seatNumber}`
      );
    }

    seatNumberSet.add(seat.seatNumber);
  }

  // ========================================================
  // VALIDATE DUPLICATE SEAT POSITIONS
  // ========================================================

  const seatPositionSet = new Set();

  for (const seat of seatPayload) {
    const key = positionKey(
      seat.rowLabel,
      seat.columnNumber
    );

    if (seatPositionSet.has(key)) {
      throw new Error(
        `Multiple seats cannot occupy position ${seat.rowLabel}${seat.columnNumber}.`
      );
    }

    seatPositionSet.add(key);
  }

  // ========================================================
  // VALIDATE DUPLICATE GAPS
  // ========================================================

  const gapPositionSet = new Set();

  for (const gap of gapPayload) {
    const key = positionKey(
      gap.rowLabel,
      gap.columnNumber
    );

    if (gapPositionSet.has(key)) {
      throw new Error(
        `Duplicate gap detected at ${gap.rowLabel}${gap.columnNumber}.`
      );
    }

    gapPositionSet.add(key);
  }

  // ========================================================
  // VALIDATE SEAT / GAP COLLISION
  // ========================================================

  for (const gap of gapPayload) {
    const key = positionKey(
      gap.rowLabel,
      gap.columnNumber
    );

    if (seatPositionSet.has(key)) {
      throw new Error(
        `Position ${gap.rowLabel}${gap.columnNumber} cannot be both a seat and a gap.`
      );
    }
  }

  // ========================================================
  // VALIDATE SEATS INSIDE FLOOR DIMENSIONS
  // ========================================================

  for (const seat of seatPayload) {
    const rowIndex =
      seat.rowLabel.charCodeAt(0) - 64;

    if (
      rowIndex < 1 ||
      rowIndex > normalizedRowCount ||
      seat.columnNumber > normalizedColumnCount
    ) {
      throw new Error(
        `Seat ${seat.seatNumber} is outside the configured floor layout.`
      );
    }
  }

  // ========================================================
  // VALIDATE GAPS INSIDE FLOOR DIMENSIONS
  // ========================================================

  for (const gap of gapPayload) {
    const rowIndex =
      gap.rowLabel.charCodeAt(0) - 64;

    if (
      rowIndex < 1 ||
      rowIndex > normalizedRowCount ||
      gap.columnNumber > normalizedColumnCount
    ) {
      throw new Error(
        `Gap ${gap.rowLabel}${gap.columnNumber} is outside the configured floor layout.`
      );
    }
  }

  // ========================================================
  // CREATE FINAL REQUEST
  // ========================================================

  const payload = {
    rowCount: normalizedRowCount,

    columnCount: normalizedColumnCount,

    entrancePosition:
      nextEntrance || "NONE",

    receptionPosition:
      nextReception || "NONE",

    gaps: gapPayload,

    seats: seatPayload,
  };

  // ========================================================
  // SAVE THROUGH API
  // ========================================================

  await seatApi.saveLayout(
    libraryId,
    floorId,
    payload
  );
};

  // ==========================================================
  // CREATE FLOOR
  // ==========================================================

  const handleCreateFloor = async () => {
    if (!libraryId) {
      setError("Please select a library.");
      return;
    }

    if (
      newFloorNumber === "" ||
      newFloorNumber === null ||
      newFloorNumber === undefined
    ) {
      setError("Floor number is required.");
      return;
    }

    const floorNumber = Number(newFloorNumber);

    if (!Number.isInteger(floorNumber)) {
      setError("Floor number must be a whole number.");
      return;
    }

    const duplicateFloor = floors.find(
      (floor) => Number(floor.floorNumber) === floorNumber,
    );

    if (duplicateFloor) {
      setError(`${getFloorName(floorNumber)} is already configured.`);
      return;
    }

    const floorName = getFloorName(floorNumber);

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const created = await seatApi.createFloor(libraryId, {
        name: floorName,
        floorNumber,
      });

      setFloorDialogOpen(false);
      setNewFloorNumber("");

      await loadFloors();

      if (created?.id) {
        setFloorId(String(created.id));
      }

      setSuccess(
        `${floorName} created successfully. Configure its seat layout now.`,
      );
    } catch (err) {
      console.error("Failed to create floor:", err);
      setError(getErrorMessage(err, "Failed to create floor."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
// APPLY / UPDATE FLOOR LAYOUT CONFIGURATION
// ==========================================================
//
// IMPORTANT:
//
// Existing floor:
// - preserve all current seats exactly as they are
// - preserve all current gaps
// - update rows / columns
// - update entrance
// - update reception
// - DO NOT automatically create seats in missing positions
//
// New empty floor:
// - create the initial seat grid
//
// This prevents:
// - duplicate seat numbers
// - destroyed intentional spacing
// - missing positions being automatically converted to seats
// ==========================================================

const handleApplyLayout = async () => {

  const rows =
    Number(
      layoutRows
    );

  const columns =
    Number(
      layoutColumns
    );


  // ========================================================
  // VALIDATE ROW COUNT
  // ========================================================

  if (
    !Number.isInteger(
      rows
    ) ||
    rows < 1 ||
    rows > 26
  ) {

    setError(
      "Rows must be between 1 and 26."
    );

    return;
  }


  // ========================================================
  // VALIDATE COLUMN COUNT
  // ========================================================

  if (
    !Number.isInteger(
      columns
    ) ||
    columns < 1
  ) {

    setError(
      "Columns per row must be greater than zero."
    );

    return;
  }


  // ========================================================
  // CHECK EXISTING SEATS AGAINST NEW DIMENSIONS
  // ========================================================

  const seatOutsideLayout =
    seats.find(
      (seat) => {

        const row =
          normalizeRow(
            seat.rowLabel
          );


        if (!row) {
          return false;
        }


        const rowIndex =
          row.charCodeAt(
            0
          ) -
          64;


        const column =
          Number(
            seat.columnNumber
          );


        return (
          rowIndex >
            rows ||
          column >
            columns
        );
      }
    );


  if (
    seatOutsideLayout
  ) {

    setError(
      `Seat ${seatOutsideLayout.seatNumber} is outside the new ${rows} × ${columns} layout. Move or delete that seat before reducing the layout size.`
    );

    return;
  }


  // ========================================================
  // CHECK EXISTING GAPS AGAINST NEW DIMENSIONS
  // ========================================================

  const gapOutsideLayout =
    gaps.find(
      (gap) => {

        const row =
          normalizeRow(
            gap.rowLabel
          );


        if (!row) {
          return false;
        }


        const rowIndex =
          row.charCodeAt(
            0
          ) -
          64;


        const column =
          Number(
            gap.columnNumber
          );


        return (
          rowIndex >
            rows ||
          column >
            columns
        );
      }
    );


  if (
    gapOutsideLayout
  ) {

    setError(
      `Gap ${gapOutsideLayout.rowLabel}${gapOutsideLayout.columnNumber} is outside the new ${rows} × ${columns} layout. Remove the gap before reducing the layout size.`
    );

    return;
  }


  // ========================================================
  // DETERMINE WHETHER THIS IS A NEW EMPTY FLOOR
  // ========================================================

  const floorIsEmpty =
    seats.length === 0;


  let nextSeats;


  // ========================================================
  // NEW FLOOR
  // ========================================================
  //
  // Only when the floor has ZERO seats do we generate
  // the initial seat matrix automatically.
  // ========================================================

  if (
    floorIsEmpty
  ) {

    nextSeats = [];


    for (
      let rowIndex = 0;
      rowIndex < rows;
      rowIndex++
    ) {

      const rowLabel =
        getRowLabel(
          rowIndex
        );


      for (
        let column = 1;
        column <= columns;
        column++
      ) {

        nextSeats.push({
          id: null,

          seatNumber:
            `${rowLabel}${column}`,

          rowLabel,

          columnNumber:
            column,

          seatType:
            layoutSeatType,

          status:
            layoutSeatStatus,
        });
      }
    }

  } else {

    // ======================================================
    // EXISTING FLOOR
    // ======================================================
    //
    // Preserve actual seat identities and positions.
    //
    // DO NOT fill:
    //
    // B7
    // F6
    // F7
    // etc.
    //
    // Those positions remain unconfigured until the owner
    // explicitly chooses Add Seat or Mark as Gap.
    // ======================================================

    nextSeats =
      seats.map(
        (seat) => ({
          ...seat,
        })
      );
  }


  // ========================================================
  // DEFENSIVE DUPLICATE VALIDATION
  // ========================================================

  const seatNumbers =
    new Set();


  const seatPositions =
    new Set();


  for (
    const seat of
    nextSeats
  ) {

    const normalizedSeatNumber =
      String(
        seat.seatNumber ||
        ""
      )
        .trim()
        .toUpperCase();


    const position =
      positionKey(
        seat.rowLabel,
        seat.columnNumber
      );


    if (
      !normalizedSeatNumber
    ) {

      setError(
        "Every seat must have a seat number."
      );

      return;
    }


    if (
      seatNumbers.has(
        normalizedSeatNumber
      )
    ) {

      setError(
        `Duplicate seat number detected before saving: ${normalizedSeatNumber}`
      );

      return;
    }


    if (
      seatPositions.has(
        position
      )
    ) {

      setError(
        `Duplicate seat position detected before saving: ${position}`
      );

      return;
    }


    seatNumbers.add(
      normalizedSeatNumber
    );


    seatPositions.add(
      position
    );
  }


  // ========================================================
  // ENSURE A GAP DOES NOT OVERLAP A SEAT
  // ========================================================

  for (
    const gap of
    gaps
  ) {

    const key =
      positionKey(
        gap.rowLabel,
        gap.columnNumber
      );


    if (
      seatPositions.has(
        key
      )
    ) {

      setError(
        `Position ${gap.rowLabel}${gap.columnNumber} cannot be both a seat and a gap.`
      );

      return;
    }
  }


  // ========================================================
  // SAVE
  // ========================================================

  try {

    setSaving(
      true
    );

    setError("");

    setSuccess("");


    await saveCompleteLayout({
      nextSeats,

      nextGaps:
        gaps,

      nextRowCount:
        rows,

      nextColumnCount:
        columns,

      nextEntrance:
        layoutEntrance,

      nextReception:
        layoutReception,
    });


    setLayoutDialogOpen(
      false
    );


    setSuccess(
      floorIsEmpty
        ? `${nextSeats.length} seats and floor layout created successfully.`
        : "Floor layout configuration updated successfully."
    );


    await loadFloorLayout();

  } catch (
    err
  ) {

    console.error(
      "Failed to save layout:",
      err
    );


    setError(
      getErrorMessage(
        err,
        "Failed to save floor layout."
      )
    );

  } finally {

    setSaving(
      false
    );
  }
};

  // ==========================================================
  // OPEN POSITION ACTION
  // ==========================================================

  const handleEmptyPositionClick = (rowLabel, columnNumber) => {
    setSelectedPosition({
      rowLabel,
      columnNumber,
    });

    setPositionDialogOpen(true);
  };

  // ==========================================================
  // MARK POSITION AS GAP
  // ==========================================================

  const handleMarkGap = async () => {
    if (!selectedPosition) {
      return;
    }

    const newGap = {
      rowLabel: selectedPosition.rowLabel,

      columnNumber: Number(selectedPosition.columnNumber),
    };

    const nextGaps = [...gaps, newGap];

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveCompleteLayout({
        nextGaps,
      });

      setPositionDialogOpen(false);

      setSelectedPosition(null);

      setSuccess("Gap / aisle added successfully.");

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to mark gap:", err);

      setError(getErrorMessage(err, "Failed to add gap."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // REMOVE GAP
  // ==========================================================

  const handleRemoveGap = async (gap) => {
    const nextGaps = gaps.filter(
      (item) =>
        positionKey(item.rowLabel, item.columnNumber) !==
        positionKey(gap.rowLabel, gap.columnNumber),
    );

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveCompleteLayout({
        nextGaps,
      });

      setSuccess("Gap removed successfully.");

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to remove gap:", err);

      setError(getErrorMessage(err, "Failed to remove gap."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
// OPEN ADD SEAT
// ==========================================================

const openAddSeatForPosition = () => {
  if (!selectedPosition) {
    return;
  }

  const { rowLabel, columnNumber } = selectedPosition;

  // Physical location
  setAddSeatRow(rowLabel);

  setAddSeatColumn(String(columnNumber));

  // Seat number is independent from row / column.
  // Owner will enter the actual seat number manually.
  setAddSeatNumber("");

  setAddSeatType("NORMAL");

  setAddSeatStatus("AVAILABLE");

  setPositionDialogOpen(false);

  setAddSeatDialogOpen(true);
};

  // ==========================================================
  // ADD SEAT
  // ==========================================================

  const handleAddSeat = async () => {
    const row = normalizeRow(addSeatRow);

    const column = Number(addSeatColumn);

    if (!row) {
      setError("Row is required.");

      return;
    }

    if (!Number.isInteger(column) || column < 1) {
      setError("Valid column is required.");

      return;
    }

    if (!addSeatNumber.trim()) {
      setError("Seat number is required.");

      return;
    }

    if (seatByPosition.has(positionKey(row, column))) {
      setError("A seat already exists at this position.");

      return;
    }

    const nextGaps = gaps.filter(
      (gap) =>
        positionKey(gap.rowLabel, gap.columnNumber) !==
        positionKey(row, column),
    );

    const nextSeats = [
      ...seats,

      {
        id: null,

        seatNumber: addSeatNumber.trim().toUpperCase(),

        rowLabel: row,

        columnNumber: column,

        seatType: addSeatType,

        status: addSeatStatus,
      },
    ];

    const nextRowCount = Math.max(rowCount, row.charCodeAt(0) - 64);

    const nextColumnCount = Math.max(columnCount, column);

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveCompleteLayout({
        nextSeats,

        nextGaps,

        nextRowCount,

        nextColumnCount,
      });

      setAddSeatDialogOpen(false);

      setSelectedPosition(null);

      setSuccess(
        `Seat ${addSeatNumber.trim().toUpperCase()} added successfully.`,
      );

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to add seat:", err);

      setError(getErrorMessage(err, "Failed to add seat."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // ADD ROW
  // ==========================================================

  const handleAddRow = async () => {
    const seatCount = Number(addRowSeats);

    if (!Number.isInteger(seatCount) || seatCount < 1) {
      setError("Enter a valid number of seats.");

      return;
    }

    if (rowCount >= 26) {
      setError("Maximum row Z has already been reached.");

      return;
    }

    const nextRowCount = rowCount + 1;

    const rowLabel = getRowLabel(nextRowCount - 1);

    const nextSeats = [...seats];

    for (let column = 1; column <= seatCount; column++) {
      nextSeats.push({
        id: null,

        seatNumber: `${rowLabel}${column}`,

        rowLabel,

        columnNumber: column,

        seatType: addRowSeatType,

        status: addRowSeatStatus,
      });
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveCompleteLayout({
        nextSeats,

        nextRowCount,

        nextColumnCount: Math.max(columnCount, seatCount),
      });

      setAddRowDialogOpen(false);

      setSuccess(`Row ${rowLabel} added successfully.`);

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to add row:", err);

      setError(getErrorMessage(err, "Failed to add row."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // EDIT SEAT
  // ==========================================================

  const handleSeatClick = (seat) => {
    setSelectedSeat(seat);

    setEditSeatType(seat.seatType || "NORMAL");

    setEditSeatStatus(seat.status || "AVAILABLE");

    setSeatDialogOpen(true);
  };

  const handleUpdateSeat = async () => {
    if (!selectedSeat?.id) {
      setError("Seat ID not found.");

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (editSeatType !== selectedSeat.seatType) {
        await seatApi.updateSeatType(libraryId, selectedSeat.id, editSeatType);
      }

      if (editSeatStatus !== selectedSeat.status) {
        await seatApi.updateSeatStatus(
          libraryId,
          selectedSeat.id,
          editSeatStatus,
        );
      }

      setSeatDialogOpen(false);

      setSelectedSeat(null);

      setSuccess("Seat updated successfully.");

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to update seat:", err);

      setError(getErrorMessage(err, "Failed to update seat."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE SEAT
  // ==========================================================

  const handleDeleteSeat = async () => {
    if (!selectedSeat) {
      return;
    }

    if (selectedSeat.status === "BOOKED") {
      setError("A booked seat cannot be deleted.");

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

      setSuccess("Seat deleted. The position is now unconfigured.");

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to delete seat:", err);

      setError(getErrorMessage(err, "Failed to delete seat."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // POSITION MARKERS
  // ==========================================================

  const renderTopMarkers = () => {
    const markers = [];

    if (entrancePosition === "TOP_LEFT") {
      markers.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "TOP_LEFT") {
      markers.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    const center = [];

    if (entrancePosition === "TOP_CENTER") {
      center.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "TOP_CENTER") {
      center.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    const right = [];

    if (entrancePosition === "TOP_RIGHT") {
      right.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "TOP_RIGHT") {
      right.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    if (markers.length === 0 && center.length === 0 && right.length === 0) {
      return null;
    }

    return (
      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: "1fr 1fr 1fr",

          alignItems: "center",

          mb: 4,
        }}
      >
        <Stack alignItems="flex-start">{markers}</Stack>

        <Stack alignItems="center">{center}</Stack>

        <Stack alignItems="flex-end">{right}</Stack>
      </Box>
    );
  };

  const renderBottomMarkers = () => {
    const left = [];
    const center = [];
    const right = [];

    if (entrancePosition === "BOTTOM_LEFT") {
      left.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "BOTTOM_LEFT") {
      left.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    if (entrancePosition === "BOTTOM_CENTER") {
      center.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "BOTTOM_CENTER") {
      center.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    if (entrancePosition === "BOTTOM_RIGHT") {
      right.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "BOTTOM_RIGHT") {
      right.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    if (left.length === 0 && center.length === 0 && right.length === 0) {
      return null;
    }

    return (
      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: "1fr 1fr 1fr",

          alignItems: "center",

          mt: 4,
        }}
      >
        <Stack alignItems="flex-start">{left}</Stack>

        <Stack alignItems="center">{center}</Stack>

        <Stack alignItems="flex-end">{right}</Stack>
      </Box>
    );
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

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
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Seat Mapping
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Design the physical layout of your library, including seats, aisles,
            entrance and reception.
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
            onClick={loadFloorLayout}
            disabled={!floorId || loadingLayout}
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

      {/* ======================================================
          ALERTS
      ====================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 2,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{
            mb: 2,
          }}
        >
          {success}
        </Alert>
      )}

      {/* ======================================================
          LIBRARY / FLOOR / ACTION BAR
      ====================================================== */}

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
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
                  const id = event.target.value;

                  setLibraryId(id);

                  storeOwnerLibraryId(id);

                  setFloorId("");
                  setSeats([]);
                  setGaps([]);

                  window.dispatchEvent(
                    new CustomEvent("owner-library-changed", {
                      detail: {
                        libraryId: Number(id),
                      },
                    }),
                  );
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

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
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
                  setGaps([]);
                }}
              >
                {floors.map((floor) => (
                  <MenuItem key={floor.id} value={String(floor.id)}>
                    {floor.name || getFloorName(floor.floorNumber)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid
            size={{
              xs: 12,
              md: 4,
            }}
          >
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
                  setLayoutRows(rowCount || DEFAULT_ROWS);

                  setLayoutColumns(columnCount || DEFAULT_COLUMNS);

                  setLayoutEntrance(entrancePosition || "TOP_CENTER");

                  setLayoutReception(receptionPosition || "BOTTOM_CENTER");

                  setLayoutDialogOpen(true);
                }}
              >
                Configure Layout
              </Button>

              <Button
                variant="outlined"
                startIcon={<Add />}
                disabled={!floorId || rowCount === 0}
                onClick={() => setAddRowDialogOpen(true)}
              >
                Add Row
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* ======================================================
          NO FLOOR
      ====================================================== */}

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

          <Typography
            variant="h6"
            sx={{
              mt: 2,
            }}
          >
            No floors configured
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mb: 3,
            }}
          >
            Create your first floor to start configuring the physical layout.
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

      {/* ======================================================
          FLOOR LAYOUT
      ====================================================== */}

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
            sx={{
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                {currentFloor?.name ||
                  getFloorName(currentFloor?.floorNumber) ||
                  "Floor"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {statistics.total} seats
                {" • "}
                {rowCount} rows
                {" • "}
                {columnCount} columns / row
                {" • "}
                {statistics.gaps} gaps
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Chip label={`Seats: ${statistics.total}`} />

              <Chip label={`Available: ${statistics.available}`} />

              <Chip label={`Booked: ${statistics.booked}`} />

              <Chip label={`Gaps: ${statistics.gaps}`} />
            </Stack>
          </Stack>

          <Divider
            sx={{
              mb: 3,
            }}
          />

          {loadingLayout ? (
            <Box
              sx={{
                minHeight: 320,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : rowCount === 0 || columnCount === 0 ? (
            <Box
              sx={{
                py: 8,

                textAlign: "center",
              }}
            >
              <Settings
                sx={{
                  fontSize: 58,

                  color: "text.disabled",
                }}
              />

              <Typography
                variant="h6"
                sx={{
                  mt: 2,
                }}
              >
                Layout not configured
              </Typography>

              <Typography
                color="text.secondary"
                sx={{
                  mb: 3,
                }}
              >
                Configure the number of rows, columns, entrance and reception.
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
              {/* TOP MARKERS */}

              {renderTopMarkers()}

              {/* MAIN ROOM */}

              <Box
                sx={{
                  display: "grid",

                  gridTemplateColumns:
                    entrancePosition === "LEFT_CENTER" ||
                    receptionPosition === "LEFT_CENTER" ||
                    entrancePosition === "RIGHT_CENTER" ||
                    receptionPosition === "RIGHT_CENTER"
                      ? "190px minmax(0, 1fr) 190px"
                      : "1fr",

                  gap: 2,

                  alignItems: "center",
                }}
              >
                {/* LEFT SIDE MARKER */}

                {(entrancePosition === "LEFT_CENTER" ||
                  receptionPosition === "LEFT_CENTER") && (
                  <Stack spacing={2} alignItems="center">
                    {entrancePosition === "LEFT_CENTER" && (
                      <LayoutMarker type="ENTRANCE" />
                    )}

                    {receptionPosition === "LEFT_CENTER" && (
                      <LayoutMarker type="RECEPTION" />
                    )}
                  </Stack>
                )}

                {/* SEAT GRID */}

                <Box
                  sx={{
                    overflowX: "auto",

                    py: 2,
                  }}
                >
                  <Stack
                    spacing={2.5}
                    sx={{
                      minWidth: columnCount * 78 + 80,
                    }}
                  >
                    {Array.from({
                      length: rowCount,
                    }).map((_, rowIndex) => {
                      const rowLabel = getRowLabel(rowIndex);

                      return (
                        <Stack
                          key={rowLabel}
                          direction="row"
                          spacing={1.5}
                          alignItems="center"
                        >
                          <Box
                            sx={{
                              width: 42,
                              minWidth: 42,

                              height: 58,

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              borderRadius: 2,

                              bgcolor: "action.hover",

                              fontWeight: 800,
                            }}
                          >
                            {rowLabel}
                          </Box>

                          {Array.from({
                            length: columnCount,
                          }).map((__, columnIndex) => {
                            const columnNumber = columnIndex + 1;

                            const key = positionKey(rowLabel, columnNumber);

                            const seat = seatByPosition.get(key);

                            const gap = gaps.find(
                              (item) =>
                                positionKey(
                                  item.rowLabel,
                                  item.columnNumber,
                                ) === key,
                            );

                            // ===============================
                            // SEAT
                            // ===============================

                            if (seat) {
                              const style = getSeatStyle(seat.status);

                              return (
                                <Tooltip
                                  key={key}
                                  title={`${seat.seatNumber} • ${
                                    SEAT_TYPE_LABELS[seat.seatType] ||
                                    seat.seatType
                                  } • ${
                                    SEAT_STATUS_LABELS[seat.status] ||
                                    seat.status
                                  }`}
                                >
                                  <Box
                                    onClick={() => handleSeatClick(seat)}
                                    sx={{
                                      width: 64,

                                      minWidth: 64,

                                      height: 60,

                                      display: "flex",

                                      flexDirection: "column",

                                      alignItems: "center",

                                      justifyContent: "center",

                                      cursor: "pointer",

                                      border: "2px solid",

                                      borderColor: style.borderColor,

                                      bgcolor: style.backgroundColor,

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

                                    <Typography
                                      variant="caption"
                                      fontWeight={700}
                                    >
                                      {seat.seatNumber}
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              );
                            }

                            // ===============================
                            // INTENTIONAL GAP / AISLE
                            // ===============================

                            if (gap) {
                              return (
                                <Tooltip
                                  key={key}
                                  title="Intentional gap / aisle • Click to remove"
                                >
                                  <Box
                                    onClick={() => handleRemoveGap(gap)}
                                    sx={{
                                      width: 64,

                                      minWidth: 64,

                                      height: 60,

                                      cursor: "pointer",

                                      display: "flex",

                                      alignItems: "center",

                                      justifyContent: "center",

                                      borderRadius: 2,

                                      border: "1px dashed",

                                      borderColor: "divider",

                                      color: "text.disabled",

                                      bgcolor: "transparent",

                                      "&:hover": {
                                        bgcolor: "action.hover",
                                      },
                                    }}
                                  >
                                    <Typography variant="caption">
                                      GAP
                                    </Typography>
                                  </Box>
                                </Tooltip>
                              );
                            }

                            // ===============================
                            // UNCONFIGURED POSITION
                            // ===============================

                            return (
                              <Tooltip
                                key={key}
                                title={`Row ${rowLabel}, Position ${columnNumber} • Configure`}
                              >
                                <Box
                                  onClick={() =>
                                    handleEmptyPositionClick(
                                      rowLabel,
                                      columnNumber,
                                    )
                                  }
                                  sx={{
                                    width: 64,

                                    minWidth: 64,

                                    height: 60,

                                    display: "flex",

                                    flexDirection: "column",

                                    alignItems: "center",

                                    justifyContent: "center",

                                    cursor: "pointer",

                                    border: "2px dashed",

                                    borderColor: "grey.300",

                                    bgcolor: "grey.50",

                                    color: "text.disabled",

                                    borderRadius: 2,

                                    "&:hover": {
                                      borderColor: "primary.main",

                                      color: "primary.main",

                                      bgcolor: "action.hover",
                                    },
                                  }}
                                >
                                  <Add fontSize="small" />

                                  <Typography variant="caption">
                                    {rowLabel}
                                    {columnNumber}
                                  </Typography>
                                </Box>
                              </Tooltip>
                            );
                          })}
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>

                {/* RIGHT SIDE MARKER */}

                {(entrancePosition === "RIGHT_CENTER" ||
                  receptionPosition === "RIGHT_CENTER") && (
                  <Stack spacing={2} alignItems="center">
                    {entrancePosition === "RIGHT_CENTER" && (
                      <LayoutMarker type="ENTRANCE" />
                    )}

                    {receptionPosition === "RIGHT_CENTER" && (
                      <LayoutMarker type="RECEPTION" />
                    )}
                  </Stack>
                )}
              </Box>

              {/* BOTTOM MARKERS */}

              {renderBottomMarkers()}

              {/* LEGEND */}

              <Divider
                sx={{
                  my: 4,
                }}
              />

              <Stack
                direction="row"
                sx={{
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
                justifyContent="center"
              >
                {SEAT_STATUSES.map((status) => {
                  const style = getSeatStyle(status);

                  return (
                    <Chip
                      key={status}
                      label={SEAT_STATUS_LABELS[status]}
                      sx={{
                        bgcolor: style.backgroundColor,

                        color: style.color,

                        border: "1px solid",

                        borderColor: style.borderColor,
                      }}
                    />
                  );
                })}

                <Chip label="Gap / Aisle" variant="outlined" />
              </Stack>

              {/* STATISTICS */}

              <Grid
                container
                spacing={2}
                sx={{
                  mt: 3,
                }}
              >
                <Grid
                  size={{
                    xs: 6,
                    md: 2,
                  }}
                >
                  <StatisticCard
                    label="Available"
                    value={statistics.available}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    md: 2,
                  }}
                >
                  <StatisticCard label="Booked" value={statistics.booked} />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    md: 2,
                  }}
                >
                  <StatisticCard label="Reserved" value={statistics.reserved} />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    md: 2,
                  }}
                >
                  <StatisticCard
                    label="Girls"
                    value={statistics.girlsReserved}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    md: 2,
                  }}
                >
                  <StatisticCard
                    label="Maintenance"
                    value={statistics.maintenance}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 6,
                    md: 2,
                  }}
                >
                  <StatisticCard label="Gaps" value={statistics.gaps} />
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      )}

      {/* ======================================================
          CREATE FLOOR DIALOG
      ====================================================== */}

      <Dialog
        open={floorDialogOpen}
        onClose={() => !saving && setFloorDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Floor</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info">
              Select the floor number. LibraryHub will automatically generate
              the floor name.
            </Alert>

            <TextField
              label="Floor Number"
              type="number"
              value={newFloorNumber}
              onChange={(event) => setNewFloorNumber(event.target.value)}
              helperText="Use 0 for Ground Floor, 1 for First Floor, -1 for Basement 1"
              fullWidth
              autoFocus
            />

            {newFloorNumber !== "" && (
              <TextField
                label="Floor Name"
                value={getFloorName(newFloorNumber)}
                fullWidth
                disabled
                helperText="Generated automatically from the floor number"
              />
            )}

            {newFloorNumber !== "" && (
              <Alert severity="success">
                <strong>{getFloorName(newFloorNumber)}</strong> will be created.
                After creating it, configure rows, columns, seats, gaps,
                entrance and reception.
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            disabled={saving}
            onClick={() => {
              setFloorDialogOpen(false);
              setNewFloorNumber("");
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={saving || newFloorNumber === ""}
            onClick={handleCreateFloor}
          >
            {saving ? "Creating..." : "Create Floor"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          CONFIGURE LAYOUT DIALOG
      ====================================================== */}

      <Dialog
        open={layoutDialogOpen}
        onClose={() => !saving && setLayoutDialogOpen(false)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Configure Library Layout</DialogTitle>

        <DialogContent>
          <Grid
            container
            spacing={3}
            sx={{
              mt: 0.5,
            }}
          >
            {/* CONFIGURATION */}

            <Grid
              size={{
                xs: 12,
                md: 5,
              }}
            >
              <Stack spacing={2.25}>
                <TextField
                  label="Rows"
                  type="number"
                  value={layoutRows}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                      max: 26,
                    },
                  }}
                  onChange={(event) => setLayoutRows(event.target.value)}
                  fullWidth
                />

                <TextField
                  label="Columns / Row"
                  type="number"
                  value={layoutColumns}
                  slotProps={{
                    htmlInput: {
                      min: 1,
                    },
                  }}
                  onChange={(event) => setLayoutColumns(event.target.value)}
                  fullWidth
                />

                <FormControl fullWidth>
                  <InputLabel>Entrance</InputLabel>

                  <Select
                    value={layoutEntrance}
                    label="Entrance"
                    onChange={(event) => setLayoutEntrance(event.target.value)}
                  >
                    {LAYOUT_POSITIONS.map((position) => (
                      <MenuItem key={position.value} value={position.value}>
                        {position.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Reception</InputLabel>

                  <Select
                    value={layoutReception}
                    label="Reception"
                    onChange={(event) => setLayoutReception(event.target.value)}
                  >
                    {LAYOUT_POSITIONS.map((position) => (
                      <MenuItem key={position.value} value={position.value}>
                        {position.label}
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
                    onChange={(event) =>
                      setLayoutSeatStatus(event.target.value)
                    }
                  >
                    {MANAGEMENT_STATUSES.map((status) => (
                      <MenuItem key={status} value={status}>
                        {SEAT_STATUS_LABELS[status]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Alert severity="info">
                  After applying the layout, click any empty position to add a
                  seat or mark it as an intentional gap / aisle.
                </Alert>
              </Stack>
            </Grid>

            {/* LIVE PREVIEW */}

            <Grid
              size={{
                xs: 12,
                md: 7,
              }}
            >
              <Paper
                variant="outlined"
                sx={{
                  p: 3,

                  height: "100%",

                  borderRadius: 3,

                  bgcolor: "grey.50",
                }}
              >
                <Typography variant="h6" fontWeight={700}>
                  Layout Preview
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 3,
                  }}
                >
                  {Number(layoutRows) || 0} rows × {Number(layoutColumns) || 0}{" "}
                  positions
                </Typography>

                {layoutEntrance.startsWith("TOP_") && (
                  <Stack
                    alignItems={
                      layoutEntrance === "TOP_LEFT"
                        ? "flex-start"
                        : layoutEntrance === "TOP_RIGHT"
                          ? "flex-end"
                          : "center"
                    }
                    sx={{
                      mb: 2,
                    }}
                  >
                    <LayoutMarker type="ENTRANCE" />
                  </Stack>
                )}

                <Box
                  sx={{
                    overflowX: "auto",
                  }}
                >
                  <Stack
                    spacing={1}
                    sx={{
                      minWidth:
                        Math.min(Number(layoutColumns) || 1, 10) * 52 + 50,
                    }}
                  >
                    {Array.from({
                      length: Math.min(Number(layoutRows) || 0, 8),
                    }).map((_, rowIndex) => {
                      const row = getRowLabel(rowIndex);

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
                            length: Math.min(Number(layoutColumns) || 0, 10),
                          }).map((__, columnIndex) => (
                            <Box
                              key={columnIndex}
                              sx={{
                                width: 44,

                                height: 44,

                                borderRadius: 1.5,

                                border: "1px solid",

                                borderColor: "divider",

                                bgcolor: "background.paper",

                                display: "flex",

                                flexDirection: "column",

                                alignItems: "center",

                                justifyContent: "center",
                              }}
                            >
                              <EventSeat
                                sx={{
                                  fontSize: 18,

                                  color: "success.main",
                                }}
                              />

                              <Typography variant="caption">
                                {row}
                                {columnIndex + 1}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      );
                    })}
                  </Stack>
                </Box>

                {layoutReception.startsWith("BOTTOM_") && (
                  <Stack
                    alignItems={
                      layoutReception === "BOTTOM_LEFT"
                        ? "flex-start"
                        : layoutReception === "BOTTOM_RIGHT"
                          ? "flex-end"
                          : "center"
                    }
                    sx={{
                      mt: 3,
                    }}
                  >
                    <LayoutMarker type="RECEPTION" />
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button disabled={saving} onClick={() => setLayoutDialogOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={saving}
            onClick={handleApplyLayout}
          >
            {saving ? "Applying..." : "Apply Layout"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          POSITION ACTION DIALOG
      ====================================================== */}

      <Dialog
        open={positionDialogOpen}
        onClose={() => !saving && setPositionDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Configure Position</DialogTitle>

        <DialogContent>
          <Typography
            color="text.secondary"
            sx={{
              mb: 2,
            }}
          >
            Row <strong>{selectedPosition?.rowLabel}</strong>
            {" • "}
            Position <strong>{selectedPosition?.columnNumber}</strong>
          </Typography>

          <Alert severity="info">
            Choose whether this physical position should contain a seat or
            remain empty as a gap / aisle.
          </Alert>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setPositionDialogOpen(false)}>Cancel</Button>

          <Button variant="outlined" disabled={saving} onClick={handleMarkGap}>
            Mark as Gap
          </Button>

          <Button
            variant="contained"
            startIcon={<EventSeat />}
            onClick={openAddSeatForPosition}
          >
            Add Seat
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          ADD SEAT DIALOG
      ====================================================== */}

      <Dialog
        open={addSeatDialogOpen}
        onClose={() => !saving && setAddSeatDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add Seat</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              mt: 1,
            }}
          >
            <TextField label="Row" value={addSeatRow} disabled />

            <TextField label="Position" value={addSeatColumn} disabled />

            <TextField
              label="Seat Number"
              value={addSeatNumber}
              onChange={(event) => setAddSeatNumber(event.target.value)}
            />

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
          <Button disabled={saving} onClick={() => setAddSeatDialogOpen(false)}>
            Cancel
          </Button>

          <Button variant="contained" disabled={saving} onClick={handleAddSeat}>
            {saving ? "Adding..." : "Add Seat"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          ADD ROW DIALOG
      ====================================================== */}

      <Dialog
        open={addRowDialogOpen}
        onClose={() => !saving && setAddRowDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Add New Row</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              mt: 1,
            }}
          >
            <Alert severity="info">
              New row:{" "}
              <strong>
                {rowCount < 26 ? getRowLabel(rowCount) : "No row available"}
              </strong>
            </Alert>

            <TextField
              label="Number of Seats"
              type="number"
              value={addRowSeats}
              slotProps={{
                htmlInput: {
                  min: 1,
                },
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
          <Button disabled={saving} onClick={() => setAddRowDialogOpen(false)}>
            Cancel
          </Button>

          <Button variant="contained" disabled={saving} onClick={handleAddRow}>
            {saving ? "Adding..." : "Add Row"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ======================================================
          EDIT SEAT DIALOG
      ====================================================== */}

      <Dialog
        open={seatDialogOpen}
        onClose={() => !saving && setSeatDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Manage Seat {selectedSeat?.seatNumber || ""}</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              mt: 1,
            }}
          >
            <Alert severity="info">
              Row {selectedSeat?.rowLabel}
              {" • "}
              Position {selectedSeat?.columnNumber}
            </Alert>

            <FormControl fullWidth>
              <InputLabel>Seat Type</InputLabel>

              <Select
                value={editSeatType}
                label="Seat Type"
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
        </DialogContent>

        <DialogActions>
          <Button
            color="error"
            startIcon={<DeleteOutlineOutlined />}
            disabled={saving}
            onClick={handleDeleteSeat}
          >
            Delete Seat
          </Button>

          <Box
            sx={{
              flexGrow: 1,
            }}
          />

          <Button disabled={saving} onClick={() => setSeatDialogOpen(false)}>
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={saving}
            onClick={handleUpdateSeat}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatMapping;
