import React, { useCallback, useEffect, useMemo, useState } from "react";

import {
  Add,
  CheckBoxOutlined,
  DeleteOutlineOutlined,
  DoorFrontOutlined,
  LayersOutlined,
  EventSeat,
  MeetingRoomOutlined,
  Refresh,
  Settings,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Checkbox,
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
  alpha,
  IconButton,
  useTheme,
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
// FLOOR DIMENSION HELPERS
// ============================================================

const getRowIndexFromLabel = (rowLabel) => {
  const normalized = normalizeRow(rowLabel);

  if (!/^[A-Z]$/.test(normalized)) {
    return 0;
  }

  return normalized.charCodeAt(0) - 64;
};

const calculateRequiredDimensions = ({
  seats = [],
  gaps = [],
  rowCount = 0,
  columnCount = 0,
}) => {
  let requiredRows = Math.max(Number(rowCount) || 0, 0);
  let requiredColumns = Math.max(Number(columnCount) || 0, 0);

  (Array.isArray(seats) ? seats : []).forEach((seat) => {
    const rowIndex = getRowIndexFromLabel(seat?.rowLabel);
    const column = Number(seat?.columnNumber);

    if (rowIndex > requiredRows) {
      requiredRows = rowIndex;
    }

    if (Number.isInteger(column) && column > requiredColumns) {
      requiredColumns = column;
    }
  });

  (Array.isArray(gaps) ? gaps : []).forEach((gap) => {
    const rowIndex = getRowIndexFromLabel(gap?.rowLabel);
    const column = Number(gap?.columnNumber);

    if (rowIndex > requiredRows) {
      requiredRows = rowIndex;
    }

    if (Number.isInteger(column) && column > requiredColumns) {
      requiredColumns = column;
    }
  });

  return {
    rowCount: requiredRows,
    columnCount: requiredColumns,
  };
};

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
        px: 2.5,
        py: 1.1,
        borderRadius: 2.6,
        border: "1px solid",
        borderColor: isEntrance
          ? "rgba(79,70,229,0.18)"
          : "rgba(14,165,233,0.18)",
        bgcolor: isEntrance
          ? "rgba(79,70,229,0.055)"
          : "rgba(14,165,233,0.055)",
        color: isEntrance ? "primary.main" : "info.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        fontWeight: 850,
        fontSize: "0.78rem",
        letterSpacing: 1.15,
        boxShadow: "0 6px 18px rgba(15,23,42,0.04)",
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

function StatisticCard({ label, value, tone = "primary" }) {
  const theme = useTheme();
  const color = theme.palette[tone]?.main || theme.palette.primary.main;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.8,
        height: "100%",
        borderRadius: 2.7,
        textAlign: "center",
        border: "1px solid",
        borderColor: alpha(color, 0.14),
        bgcolor: alpha(color, 0.035),
      }}
    >
      <Typography
        variant="h6"
        fontWeight={900}
        sx={{ color, letterSpacing: "-0.02em" }}
      >
        {value}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 700 }}
      >
        {label}
      </Typography>
    </Paper>
  );
}

// ============================================================
// COMPONENT
// ============================================================

const SeatMapping = () => {
  const theme = useTheme();

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
  // DELETE FLOOR
  // ==========================================================

  const [deleteFloorDialogOpen, setDeleteFloorDialogOpen] = useState(false);

  const [floorPendingDelete, setFloorPendingDelete] = useState(null);

  // ==========================================================
  // BULK SEAT EDITING
  // ==========================================================

  const [bulkMode, setBulkMode] = useState(false);

  const [selectedSeatIds, setSelectedSeatIds] = useState([]);

  const [bulkSeatType, setBulkSeatType] = useState("NORMAL");

  const [bulkSeatStatus, setBulkSeatStatus] = useState("AVAILABLE");

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
  // ADD BLANK SPACE
  // ==========================================================

  const [addSpaceDialogOpen, setAddSpaceDialogOpen] = useState(false);

  const [addSpaceRow, setAddSpaceRow] = useState("");

  const [addSpaceColumn, setAddSpaceColumn] = useState("");

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

  const [editSeatNumber, setEditSeatNumber] = useState("");

  const [editSeatRow, setEditSeatRow] = useState("");

  const [editSeatColumn, setEditSeatColumn] = useState("");

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

      const backendRows = Math.max(Number(data?.rowCount ?? 0), 0);
      const backendColumns = Math.max(Number(data?.columnCount ?? 0), 0);

      // Existing seats and gaps define the minimum dimensions required
      // to render the physical layout. This also repairs stale frontend
      // state such as rowCount=6 while a persisted seat exists at G1.
      const requiredDimensions = calculateRequiredDimensions({
        seats: loadedSeats,
        gaps: loadedGaps,
        rowCount: backendRows,
        columnCount: backendColumns,
      });

      const effectiveRows = requiredDimensions.rowCount;
      const effectiveColumns = requiredDimensions.columnCount;

      setSeats(loadedSeats);
      setGaps(loadedGaps);
      setRowCount(effectiveRows);
      setColumnCount(effectiveColumns);

      setEntrancePosition(data?.entrancePosition || "TOP_CENTER");
      setReceptionPosition(data?.receptionPosition || "BOTTOM_CENTER");

      setLayoutRows(effectiveRows || DEFAULT_ROWS);
      setLayoutColumns(effectiveColumns || DEFAULT_COLUMNS);
      setLayoutEntrance(data?.entrancePosition || "TOP_CENTER");
      setLayoutReception(data?.receptionPosition || "BOTTOM_CENTER");

      if (
        effectiveRows !== backendRows ||
        effectiveColumns !== backendColumns
      ) {
        console.warn(
          "Floor layout dimensions were smaller than actual seat/gap positions.",
          {
            backendRows,
            backendColumns,
            effectiveRows,
            effectiveColumns,
          },
        );
      }
    } catch (err) {
      console.error("Failed to load complete floor layout:", err);

      setSeats([]);
      setGaps([]);
      setRowCount(0);
      setColumnCount(0);

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

  useEffect(() => {
    setSelectedSeatIds([]);
    setBulkMode(false);
  }, [libraryId, floorId]);

  // ==========================================================
  // CURRENT LIBRARY / FLOOR
  // ==========================================================

  const currentLibrary = useMemo(
    () => libraries.find((library) => String(library.id) === String(libraryId)),
    [libraries, libraryId],
  );

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

      operational: seats.filter((seat) => seat.status === "AVAILABLE").length,

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
    // NORMALIZE / AUTO-EXPAND DIMENSIONS
    // ========================================================

    let normalizedRowCount = Number(nextRowCount);
    let normalizedColumnCount = Number(nextColumnCount);

    if (
      !Number.isInteger(normalizedRowCount) ||
      normalizedRowCount < 0 ||
      normalizedRowCount > 26
    ) {
      throw new Error("Invalid floor row count.");
    }

    if (!Number.isInteger(normalizedColumnCount) || normalizedColumnCount < 0) {
      throw new Error("Invalid floor column count.");
    }

    // Existing seats/gaps are the source of truth for the minimum
    // physical dimensions. This prevents legacy data such as G1 with
    // rowCount=6 from blocking every subsequent layout save.
    const calculatedDimensions = calculateRequiredDimensions({
      seats: nextSeats,
      gaps: nextGaps,
      rowCount: normalizedRowCount,
      columnCount: normalizedColumnCount,
    });

    normalizedRowCount = calculatedDimensions.rowCount;
    normalizedColumnCount = calculatedDimensions.columnCount;

    if (normalizedRowCount > 26) {
      throw new Error("Floor cannot contain rows beyond Z.");
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

        if (!Number.isInteger(columnNumber) || columnNumber < 1) {
          throw new Error(
            `Seat ${seatNumber} must have a valid column number.`,
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
      },
    );

    // ========================================================
    // NORMALIZE GAPS
    // ========================================================

    const gapPayload = (Array.isArray(nextGaps) ? nextGaps : []).map((gap) => {
      const rowLabel = normalizeRow(gap.rowLabel);

      const columnNumber = Number(gap.columnNumber);

      if (!rowLabel) {
        throw new Error("Every gap must have a valid row.");
      }

      if (!Number.isInteger(columnNumber) || columnNumber < 1) {
        throw new Error(
          `Gap ${rowLabel || "-"} must have a valid column number.`,
        );
      }

      return {
        rowLabel,

        columnNumber,
      };
    });

    // ========================================================
    // VALIDATE DUPLICATE SEAT NUMBERS
    // ========================================================

    const seatNumberSet = new Set();

    for (const seat of seatPayload) {
      if (seatNumberSet.has(seat.seatNumber)) {
        throw new Error(`Duplicate seat number detected: ${seat.seatNumber}`);
      }

      seatNumberSet.add(seat.seatNumber);
    }

    // ========================================================
    // VALIDATE DUPLICATE SEAT POSITIONS
    // ========================================================

    const seatPositionSet = new Set();

    for (const seat of seatPayload) {
      const key = positionKey(seat.rowLabel, seat.columnNumber);

      if (seatPositionSet.has(key)) {
        throw new Error(
          `Multiple seats cannot occupy position ${seat.rowLabel}${seat.columnNumber}.`,
        );
      }

      seatPositionSet.add(key);
    }

    // ========================================================
    // VALIDATE DUPLICATE GAPS
    // ========================================================

    const gapPositionSet = new Set();

    for (const gap of gapPayload) {
      const key = positionKey(gap.rowLabel, gap.columnNumber);

      if (gapPositionSet.has(key)) {
        throw new Error(
          `Duplicate gap detected at ${gap.rowLabel}${gap.columnNumber}.`,
        );
      }

      gapPositionSet.add(key);
    }

    // ========================================================
    // VALIDATE SEAT / GAP COLLISION
    // ========================================================

    for (const gap of gapPayload) {
      const key = positionKey(gap.rowLabel, gap.columnNumber);

      if (seatPositionSet.has(key)) {
        throw new Error(
          `Position ${gap.rowLabel}${gap.columnNumber} cannot be both a seat and a gap.`,
        );
      }
    }

    // ========================================================
    // VALIDATE SEATS INSIDE FLOOR DIMENSIONS
    // ========================================================

    for (const seat of seatPayload) {
      const rowIndex = seat.rowLabel.charCodeAt(0) - 64;

      if (
        rowIndex < 1 ||
        rowIndex > normalizedRowCount ||
        seat.columnNumber > normalizedColumnCount
      ) {
        throw new Error(
          `Seat ${seat.seatNumber} is outside the configured floor layout.`,
        );
      }
    }

    // ========================================================
    // VALIDATE GAPS INSIDE FLOOR DIMENSIONS
    // ========================================================

    for (const gap of gapPayload) {
      const rowIndex = gap.rowLabel.charCodeAt(0) - 64;

      if (
        rowIndex < 1 ||
        rowIndex > normalizedRowCount ||
        gap.columnNumber > normalizedColumnCount
      ) {
        throw new Error(
          `Gap ${gap.rowLabel}${gap.columnNumber} is outside the configured floor layout.`,
        );
      }
    }

    // ========================================================
    // CREATE FINAL REQUEST
    // ========================================================

    const payload = {
      rowCount: normalizedRowCount,

      columnCount: normalizedColumnCount,

      entrancePosition: nextEntrance || "NONE",

      receptionPosition: nextReception || "NONE",

      gaps: gapPayload,

      seats: seatPayload,
    };

    // ========================================================
    // SAVE THROUGH API
    // ========================================================

    await seatApi.saveLayout(libraryId, floorId, payload);
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
    const rows = Number(layoutRows);

    const columns = Number(layoutColumns);

    // ========================================================
    // VALIDATE ROW COUNT
    // ========================================================

    if (!Number.isInteger(rows) || rows < 1 || rows > 26) {
      setError("Rows must be between 1 and 26.");

      return;
    }

    // ========================================================
    // VALIDATE COLUMN COUNT
    // ========================================================

    if (!Number.isInteger(columns) || columns < 1) {
      setError("Columns per row must be greater than zero.");

      return;
    }

    // ========================================================
    // CHECK EXISTING SEATS AGAINST NEW DIMENSIONS
    // ========================================================

    const seatOutsideLayout = seats.find((seat) => {
      const row = normalizeRow(seat.rowLabel);

      if (!row) {
        return false;
      }

      const rowIndex = row.charCodeAt(0) - 64;

      const column = Number(seat.columnNumber);

      return rowIndex > rows || column > columns;
    });

    if (seatOutsideLayout) {
      setError(
        `Seat ${seatOutsideLayout.seatNumber} is outside the new ${rows} × ${columns} layout. Move or delete that seat before reducing the layout size.`,
      );

      return;
    }

    // ========================================================
    // CHECK EXISTING GAPS AGAINST NEW DIMENSIONS
    // ========================================================

    const gapOutsideLayout = gaps.find((gap) => {
      const row = normalizeRow(gap.rowLabel);

      if (!row) {
        return false;
      }

      const rowIndex = row.charCodeAt(0) - 64;

      const column = Number(gap.columnNumber);

      return rowIndex > rows || column > columns;
    });

    if (gapOutsideLayout) {
      setError(
        `Gap ${gapOutsideLayout.rowLabel}${gapOutsideLayout.columnNumber} is outside the new ${rows} × ${columns} layout. Remove the gap before reducing the layout size.`,
      );

      return;
    }

    // ========================================================
    // DETERMINE WHETHER THIS IS A NEW EMPTY FLOOR
    // ========================================================

    const floorIsEmpty = seats.length === 0;

    let nextSeats;

    // ========================================================
    // NEW FLOOR
    // ========================================================
    //
    // Only when the floor has ZERO seats do we generate
    // the initial seat matrix automatically.
    // ========================================================

    if (floorIsEmpty) {
      nextSeats = [];

      for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
        const rowLabel = getRowLabel(rowIndex);

        for (let column = 1; column <= columns; column++) {
          nextSeats.push({
            id: null,

            seatNumber: `${rowLabel}${column}`,

            rowLabel,

            columnNumber: column,

            seatType: layoutSeatType,

            status: layoutSeatStatus,
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
      // explicitly chooses Add Seat or Add Space.
      // ======================================================

      nextSeats = seats.map((seat) => ({
        ...seat,
      }));
    }

    // ========================================================
    // DEFENSIVE DUPLICATE VALIDATION
    // ========================================================

    const seatNumbers = new Set();

    const seatPositions = new Set();

    for (const seat of nextSeats) {
      const normalizedSeatNumber = String(seat.seatNumber || "")
        .trim()
        .toUpperCase();

      const position = positionKey(seat.rowLabel, seat.columnNumber);

      if (!normalizedSeatNumber) {
        setError("Every seat must have a seat number.");

        return;
      }

      if (seatNumbers.has(normalizedSeatNumber)) {
        setError(
          `Duplicate seat number detected before saving: ${normalizedSeatNumber}`,
        );

        return;
      }

      if (seatPositions.has(position)) {
        setError(`Duplicate seat position detected before saving: ${position}`);

        return;
      }

      seatNumbers.add(normalizedSeatNumber);

      seatPositions.add(position);
    }

    // ========================================================
    // ENSURE A GAP DOES NOT OVERLAP A SEAT
    // ========================================================

    for (const gap of gaps) {
      const key = positionKey(gap.rowLabel, gap.columnNumber);

      if (seatPositions.has(key)) {
        setError(
          `Position ${gap.rowLabel}${gap.columnNumber} cannot be both a seat and a gap.`,
        );

        return;
      }
    }

    // ========================================================
    // SAVE
    // ========================================================

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      await saveCompleteLayout({
        nextSeats,

        nextGaps: gaps,

        nextRowCount: rows,

        nextColumnCount: columns,

        nextEntrance: layoutEntrance,

        nextReception: layoutReception,
      });

      setLayoutDialogOpen(false);

      setSuccess(
        floorIsEmpty
          ? `${nextSeats.length} seats and floor layout created successfully.`
          : "Floor layout configuration updated successfully.",
      );

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to save layout:", err);

      setError(getErrorMessage(err, "Failed to save floor layout."));
    } finally {
      setSaving(false);
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

      setSuccess("Blank space added successfully.");

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to add blank space:", err);

      setError(getErrorMessage(err, "Failed to add blank space."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // REMOVE GAP
  // ==========================================================

  const handleRemoveGap = async (gap) => {
    const row = normalizeRow(gap.rowLabel);
    const column = Number(gap.columnNumber);

    const nextGaps = gaps
      .filter(
        (item) =>
          positionKey(item.rowLabel, item.columnNumber) !==
          positionKey(row, column),
      )
      .map((item) => {
        if (
          normalizeRow(item.rowLabel) === row &&
          Number(item.columnNumber) > column
        ) {
          return {
            ...item,
            columnNumber: Number(item.columnNumber) - 1,
          };
        }

        return { ...item };
      });

    const nextSeats = seats.map((seat) => {
      if (
        normalizeRow(seat.rowLabel) === row &&
        Number(seat.columnNumber) > column
      ) {
        return {
          ...seat,
          columnNumber: Number(seat.columnNumber) - 1,
        };
      }

      return { ...seat };
    });

    const usedColumns = [...nextSeats, ...nextGaps]
      .map((item) => Number(item.columnNumber))
      .filter((value) => Number.isInteger(value) && value > 0);

    const nextColumnCount =
      usedColumns.length > 0 ? Math.max(...usedColumns) : 1;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await saveCompleteLayout({
        nextSeats,
        nextGaps,
        nextColumnCount,
      });

      setSuccess(
        `Blank space removed from ${row}${column}. Seats to the right were shifted left automatically.`,
      );

      await loadFloorLayout();
    } catch (err) {
      console.error("Failed to remove blank space:", err);

      setError(getErrorMessage(err, "Failed to remove blank space."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // OPEN ADD BLANK SPACE ANYWHERE
  // ==========================================================

  const handleOpenAddSpaceAnywhere = () => {
    if (!floorId) {
      setError("Please select a floor before adding blank space.");
      return;
    }

    let suggestedRow = "A";
    let suggestedColumn = 1;
    let foundOpenPosition = false;

    for (let rowIndex = 0; rowIndex < Math.max(rowCount, 1); rowIndex++) {
      const rowLabel = getRowLabel(rowIndex);

      for (
        let columnNumber = 1;
        columnNumber <= Math.max(columnCount, 1);
        columnNumber++
      ) {
        const key = positionKey(rowLabel, columnNumber);

        if (!seatByPosition.has(key) && !gapKeys.has(key)) {
          suggestedRow = rowLabel;
          suggestedColumn = columnNumber;
          foundOpenPosition = true;
          break;
        }
      }

      if (foundOpenPosition) {
        break;
      }
    }

    if (!foundOpenPosition) {
      suggestedRow = "A";
      suggestedColumn = Math.max(columnCount, 0) + 1;
    }

    setAddSpaceRow(suggestedRow);
    setAddSpaceColumn(String(suggestedColumn));
    setAddSpaceDialogOpen(true);
  };

  const buildLayoutWithInsertedSpace = (row, column) => {
    const normalizedRow = normalizeRow(row);
    const normalizedColumn = Number(column);

    const existingGap = gaps.some(
      (gap) =>
        positionKey(gap.rowLabel, gap.columnNumber) ===
        positionKey(normalizedRow, normalizedColumn),
    );

    if (existingGap) {
      throw new Error(
        `Position ${normalizedRow}${normalizedColumn} is already a blank space.`,
      );
    }

    const positionIsOccupied =
      seats.some(
        (seat) =>
          positionKey(seat.rowLabel, seat.columnNumber) ===
          positionKey(normalizedRow, normalizedColumn),
      ) ||
      gaps.some(
        (gap) =>
          positionKey(gap.rowLabel, gap.columnNumber) ===
          positionKey(normalizedRow, normalizedColumn),
      );

    // If the requested column is already occupied, insert a new physical
    // position and shift everything at that column (and to its right) by 1.
    // This lets the owner insert space BETWEEN two existing seats.
    const shouldShift = positionIsOccupied;

    const nextSeats = seats.map((seat) => {
      if (
        normalizeRow(seat.rowLabel) === normalizedRow &&
        shouldShift &&
        Number(seat.columnNumber) >= normalizedColumn
      ) {
        return {
          ...seat,
          columnNumber: Number(seat.columnNumber) + 1,
        };
      }

      return { ...seat };
    });

    const nextGaps = gaps.map((gap) => {
      if (
        normalizeRow(gap.rowLabel) === normalizedRow &&
        shouldShift &&
        Number(gap.columnNumber) >= normalizedColumn
      ) {
        return {
          ...gap,
          columnNumber: Number(gap.columnNumber) + 1,
        };
      }

      return { ...gap };
    });

    nextGaps.push({
      rowLabel: normalizedRow,
      columnNumber: normalizedColumn,
    });

    const required = calculateRequiredDimensions({
      seats: nextSeats,
      gaps: nextGaps,
      rowCount: Math.max(rowCount, getRowIndexFromLabel(normalizedRow)),
      columnCount: shouldShift
        ? Math.max(columnCount + 1, normalizedColumn)
        : Math.max(columnCount, normalizedColumn),
    });

    return {
      nextSeats,
      nextGaps,
      nextRowCount: required.rowCount,
      nextColumnCount: required.columnCount,
      shifted: shouldShift,
    };
  };

  const insertBlankSpaceAt = async (row, column, options = {}) => {
    const normalizedRow = normalizeRow(row);
    const normalizedColumn = Number(column);

    if (!/^[A-Z]$/.test(normalizedRow)) {
      throw new Error("Row must be a single letter between A and Z.");
    }

    if (!Number.isInteger(normalizedColumn) || normalizedColumn < 1) {
      throw new Error("Valid column is required.");
    }

    const { nextSeats, nextGaps, nextRowCount, nextColumnCount, shifted } =
      buildLayoutWithInsertedSpace(normalizedRow, normalizedColumn);

    await saveCompleteLayout({
      nextSeats,
      nextGaps,
      nextRowCount,
      nextColumnCount,
    });

    if (options.closeSeatDialog) {
      setSeatDialogOpen(false);
      setSelectedSeat(null);
    }

    if (options.closeSpaceDialog) {
      setAddSpaceDialogOpen(false);
    }

    setSuccess(
      shifted
        ? `Blank space inserted at ${normalizedRow}${normalizedColumn}. Seats to the right were shifted automatically.`
        : `Blank space added at ${normalizedRow}${normalizedColumn}.`,
    );

    await loadFloorLayout();
  };

  const handleAddSpace = async () => {
    const row = normalizeRow(addSpaceRow);
    const column = Number(addSpaceColumn);

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await insertBlankSpaceAt(row, column, {
        closeSpaceDialog: true,
      });
    } catch (err) {
      console.error("Failed to add blank space:", err);
      setError(getErrorMessage(err, "Failed to add blank space."));
    } finally {
      setSaving(false);
    }
  };

  const handleInsertSpaceRelativeToSeat = async (side) => {
    if (!selectedSeat) {
      return;
    }

    const row = normalizeRow(selectedSeat.rowLabel);
    const currentColumn = Number(selectedSeat.columnNumber);
    const insertColumn = side === "after" ? currentColumn + 1 : currentColumn;

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await insertBlankSpaceAt(row, insertColumn, {
        closeSeatDialog: true,
      });
    } catch (err) {
      console.error("Failed to insert blank space near seat:", err);
      setError(getErrorMessage(err, "Failed to insert blank space."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // OPEN ADD SEAT
  // ==========================================================

  /**
   * Opens Add Seat independently from the visual grid.
   *
   * The owner can choose any row A-Z and any positive column.
   * If the selected position is outside the current configured
   * dimensions, handleAddSeat() automatically expands the
   * persisted rowCount / columnCount.
   */
  const handleOpenAddSeatAnywhere = () => {
    if (!floorId) {
      setError("Please select a floor before adding a seat.");
      return;
    }

    let suggestedRow = "A";
    let suggestedColumn = 1;
    let foundOpenPosition = false;

    for (let rowIndex = 0; rowIndex < Math.max(rowCount, 1); rowIndex++) {
      const rowLabel = getRowLabel(rowIndex);

      for (
        let columnNumber = 1;
        columnNumber <= Math.max(columnCount, 1);
        columnNumber++
      ) {
        const key = positionKey(rowLabel, columnNumber);

        if (!seatByPosition.has(key) && !gapKeys.has(key)) {
          suggestedRow = rowLabel;
          suggestedColumn = columnNumber;
          foundOpenPosition = true;
          break;
        }
      }

      if (foundOpenPosition) {
        break;
      }
    }

    if (!foundOpenPosition) {
      suggestedRow = "A";
      suggestedColumn = Math.max(columnCount, 0) + 1;
    }

    setSelectedPosition(null);

    setAddSeatRow(suggestedRow);
    setAddSeatColumn(String(suggestedColumn));
    setAddSeatNumber(`${suggestedRow}${suggestedColumn}`);
    setAddSeatType("NORMAL");
    setAddSeatStatus("AVAILABLE");

    setAddSeatDialogOpen(true);
  };

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

    if (!/^[A-Z]$/.test(row)) {
      setError("Row must be a single letter between A and Z.");

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

    const normalizedSeatNumber = addSeatNumber.trim().toUpperCase();

    const duplicateSeatNumber = seats.find(
      (seat) =>
        String(seat.seatNumber || "")
          .trim()
          .toUpperCase() === normalizedSeatNumber,
    );

    if (duplicateSeatNumber) {
      setError(
        `Seat number ${normalizedSeatNumber} already exists on this floor.`,
      );

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

        seatNumber: normalizedSeatNumber,

        rowLabel: row,

        columnNumber: column,

        seatType: addSeatType,

        status: addSeatStatus,
      },
    ];

    const nextRowCount = Math.max(rowCount, getRowIndexFromLabel(row));

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
        `Seat ${normalizedSeatNumber} added successfully at ${row}${column}.`,
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

    const actualDimensions = calculateRequiredDimensions({
      seats,
      gaps,
      rowCount,
      columnCount,
    });

    const currentActualRowCount = actualDimensions.rowCount;

    if (currentActualRowCount >= 26) {
      setError("Maximum row Z has already been reached.");

      return;
    }

    const nextRowCount = currentActualRowCount + 1;

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

    setEditSeatNumber(String(seat.seatNumber || ""));

    setEditSeatRow(normalizeRow(seat.rowLabel));

    setEditSeatColumn(String(seat.columnNumber || ""));

    setEditSeatType(seat.seatType || "NORMAL");

    setEditSeatStatus(seat.status || "AVAILABLE");

    setSeatDialogOpen(true);
  };

  const handleUpdateSeat = async () => {
    if (!selectedSeat?.id) {
      setError("Seat ID not found.");
      return;
    }

    const normalizedSeatNumber = String(editSeatNumber || "")
      .trim()
      .toUpperCase();

    const normalizedRow = normalizeRow(editSeatRow);
    const normalizedColumn = Number(editSeatColumn);

    if (!normalizedSeatNumber) {
      setError("Seat name / number is required.");
      return;
    }

    if (!/^[A-Z]$/.test(normalizedRow)) {
      setError("Row must be a single letter between A and Z.");
      return;
    }

    if (!Number.isInteger(normalizedColumn) || normalizedColumn < 1) {
      setError("Position / column must be a positive whole number.");
      return;
    }

    const duplicateSeatName = seats.find(
      (seat) =>
        Number(seat.id) !== Number(selectedSeat.id) &&
        String(seat.seatNumber || "")
          .trim()
          .toUpperCase() === normalizedSeatNumber,
    );

    if (duplicateSeatName) {
      setError(
        `Seat name ${normalizedSeatNumber} already exists on this floor.`,
      );
      return;
    }

    const occupiedByAnotherSeat = seats.find(
      (seat) =>
        Number(seat.id) !== Number(selectedSeat.id) &&
        positionKey(seat.rowLabel, seat.columnNumber) ===
          positionKey(normalizedRow, normalizedColumn),
    );

    if (occupiedByAnotherSeat) {
      setError(
        `Row ${normalizedRow}, position ${normalizedColumn} already contains seat ${occupiedByAnotherSeat.seatNumber}.`,
      );
      return;
    }

    // Moving a seat onto an intentionally blank position converts that
    // position back into a seat automatically.
    const nextGaps = gaps.filter(
      (gap) =>
        positionKey(gap.rowLabel, gap.columnNumber) !==
        positionKey(normalizedRow, normalizedColumn),
    );

    const nextSeats = seats.map((seat) => {
      if (Number(seat.id) !== Number(selectedSeat.id)) {
        return { ...seat };
      }

      return {
        ...seat,
        seatNumber: normalizedSeatNumber,
        rowLabel: normalizedRow,
        columnNumber: normalizedColumn,
        seatType: editSeatType,
        status: editSeatStatus,
      };
    });

    const nextRowCount = Math.max(
      rowCount,
      getRowIndexFromLabel(normalizedRow),
    );

    const nextColumnCount = Math.max(columnCount, normalizedColumn);

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

      setSeatDialogOpen(false);
      setSelectedSeat(null);

      setSuccess(
        `Seat ${normalizedSeatNumber} updated successfully at row ${normalizedRow}, position ${normalizedColumn}.`,
      );

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
  // DELETE FLOOR
  // ==========================================================

  const handleOpenDeleteFloor = (floor) => {
    if (!floor) {
      return;
    }

    setFloorPendingDelete(floor);
    setDeleteFloorDialogOpen(true);
  };

  const handleDeleteFloor = async () => {
    if (!libraryId || !floorPendingDelete?.id) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await seatApi.deleteFloor(libraryId, floorPendingDelete.id);

      const deletedFloorId = String(floorPendingDelete.id);

      setDeleteFloorDialogOpen(false);
      setFloorPendingDelete(null);

      if (String(floorId) === deletedFloorId) {
        setFloorId("");
        setSeats([]);
        setGaps([]);
        setRowCount(0);
        setColumnCount(0);
      }

      await loadFloors();

      setSuccess("Floor deleted successfully.");
    } catch (err) {
      console.error("Failed to delete floor:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to delete this floor. Remove active bookings or protected seat allocations first.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // BULK SEAT SELECTION
  // ==========================================================

  const handleSeatPrimaryAction = (seat) => {
    if (!seat) {
      return;
    }

    if (!bulkMode) {
      handleSeatClick(seat);
      return;
    }

    setSelectedSeatIds((previous) => {
      const seatId = Number(seat.id);

      if (!Number.isFinite(seatId)) {
        return previous;
      }

      return previous.includes(seatId)
        ? previous.filter((id) => id !== seatId)
        : [...previous, seatId];
    });
  };

  const handleSelectAllEditableSeats = () => {
    const editableSeatIds = seats
      .filter((seat) => seat.status !== "BOOKED")
      .map((seat) => Number(seat.id))
      .filter(Number.isFinite);

    setSelectedSeatIds(editableSeatIds);
  };

  const handleClearSeatSelection = () => {
    setSelectedSeatIds([]);
  };

  const handleBulkUpdateType = async () => {
    if (!libraryId || selectedSeatIds.length === 0) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await seatApi.bulkUpdateSeatType(
        libraryId,
        selectedSeatIds,
        bulkSeatType,
      );

      setSuccess(
        `${selectedSeatIds.length} seat${
          selectedSeatIds.length === 1 ? "" : "s"
        } updated to ${SEAT_TYPE_LABELS[bulkSeatType] || bulkSeatType}.`,
      );

      setSelectedSeatIds([]);
      await loadFloorLayout();
    } catch (err) {
      console.error("Bulk seat type update failed:", err);

      setError(getErrorMessage(err, "Failed to update selected seat types."));
    } finally {
      setSaving(false);
    }
  };

  const handleBulkUpdateStatus = async () => {
    if (!libraryId || selectedSeatIds.length === 0) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await seatApi.bulkUpdateSeatStatus(
        libraryId,
        selectedSeatIds,
        bulkSeatStatus,
      );

      setSuccess(
        `${selectedSeatIds.length} seat${
          selectedSeatIds.length === 1 ? "" : "s"
        } updated to ${SEAT_STATUS_LABELS[bulkSeatStatus] || bulkSeatStatus}.`,
      );

      setSelectedSeatIds([]);
      await loadFloorLayout();
    } catch (err) {
      console.error("Bulk seat status update failed:", err);

      setError(
        getErrorMessage(err, "Failed to update selected seat statuses."),
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // ADD SEAT POSITION PREVIEW
  // ==========================================================

  const addSeatNormalizedRow = normalizeRow(addSeatRow);

  const addSeatNormalizedColumn = Number(addSeatColumn);

  const addSeatPositionKey =
    addSeatNormalizedRow &&
    Number.isInteger(addSeatNormalizedColumn) &&
    addSeatNormalizedColumn > 0
      ? positionKey(addSeatNormalizedRow, addSeatNormalizedColumn)
      : null;

  const seatAtAddPosition = addSeatPositionKey
    ? seatByPosition.get(addSeatPositionKey)
    : null;

  const gapAtAddPosition = addSeatPositionKey
    ? gaps.find(
        (gap) =>
          positionKey(gap.rowLabel, gap.columnNumber) === addSeatPositionKey,
      )
    : null;

  const addSeatRowIndex =
    addSeatNormalizedRow && /^[A-Z]$/.test(addSeatNormalizedRow)
      ? addSeatNormalizedRow.charCodeAt(0) - 64
      : 0;

  const addSeatWouldExpandLayout =
    addSeatRowIndex > rowCount ||
    (Number.isInteger(addSeatNormalizedColumn) &&
      addSeatNormalizedColumn > columnCount);

  const addSeatNextRowCount = Math.max(rowCount, addSeatRowIndex || 0);

  const addSeatNextColumnCount = Math.max(
    columnCount,
    Number.isInteger(addSeatNormalizedColumn) ? addSeatNormalizedColumn : 0,
  );

  // ==========================================================
  // ADD SPACE POSITION PREVIEW
  // ==========================================================

  const addSpaceNormalizedRow = normalizeRow(addSpaceRow);

  const addSpaceNormalizedColumn = Number(addSpaceColumn);

  const addSpacePositionKey =
    addSpaceNormalizedRow &&
    Number.isInteger(addSpaceNormalizedColumn) &&
    addSpaceNormalizedColumn > 0
      ? positionKey(addSpaceNormalizedRow, addSpaceNormalizedColumn)
      : null;

  const seatAtAddSpacePosition = addSpacePositionKey
    ? seatByPosition.get(addSpacePositionKey)
    : null;

  const spaceAlreadyExists = addSpacePositionKey
    ? gapKeys.has(addSpacePositionKey)
    : false;

  const addSpaceWillInsertAndShift = Boolean(seatAtAddSpacePosition);

  const addSpaceRowIndex =
    addSpaceNormalizedRow && /^[A-Z]$/.test(addSpaceNormalizedRow)
      ? getRowIndexFromLabel(addSpaceNormalizedRow)
      : 0;

  const addSpaceWouldExpandLayout =
    addSpaceRowIndex > rowCount ||
    (Number.isInteger(addSpaceNormalizedColumn) &&
      addSpaceNormalizedColumn > columnCount);

  const addSpaceNextRowCount = Math.max(rowCount, addSpaceRowIndex || 0);

  const addSpaceNextColumnCount = Math.max(
    columnCount,
    Number.isInteger(addSpaceNormalizedColumn) ? addSpaceNormalizedColumn : 0,
  );

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
        width: "100%",
        maxWidth: 1500,
        mx: "auto",
        px: { xs: 1.5, md: 2.5 },
        pb: 5,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 1.5, fontWeight: 500 }}
      >
        Dashboard
        {"  ›  "}
        Library Setup
        {"  ›  "}
        <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
          Seat Mapping
        </Box>
      </Typography>

      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2.5, md: 3.5 },
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background: `linear-gradient(
            135deg,
            ${alpha(theme.palette.primary.main, 0.1)} 0%,
            ${theme.palette.background.paper} 52%,
            ${alpha(theme.palette.info.main, 0.055)} 100%
          )`,
          boxShadow: "0 18px 50px rgba(15,23,42,0.055)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 280,
            height: 280,
            borderRadius: "50%",
            right: -110,
            top: -170,
            bgcolor: alpha(theme.palette.primary.main, 0.065),
          },
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          spacing={3}
          sx={{ position: "relative", zIndex: 1 }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: 3.2,
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: `0 12px 28px ${alpha(
                  theme.palette.primary.main,
                  0.28,
                )}`,
              }}
            >
              <EventSeat sx={{ fontSize: 33 }} />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h4"
                fontWeight={900}
                sx={{ letterSpacing: "-0.025em", lineHeight: 1.12 }}
              >
                Seat Mapping
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.7,
                  maxWidth: 760,
                  fontWeight: 650,
                }}
              >
                Seat Mapping = physical configuration
              </Typography>

              {currentLibrary?.name && (
                <Chip
                  size="small"
                  label={currentLibrary.name}
                  variant="outlined"
                  sx={{
                    mt: 1.3,
                    fontWeight: 750,
                    bgcolor: alpha(theme.palette.background.paper, 0.7),
                  }}
                />
              )}
            </Box>
          </Stack>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            sx={{ flexShrink: 0 }}
          >
            <Button
              variant="outlined"
              startIcon={
                loadingLayout ? <CircularProgress size={17} /> : <Refresh />
              }
              onClick={loadFloorLayout}
              disabled={!floorId || loadingLayout}
              sx={{
                minHeight: 46,
                px: 2.2,
                textTransform: "none",
                borderRadius: 2.4,
                fontWeight: 750,
                bgcolor: "background.paper",
              }}
            >
              Refresh
            </Button>

            <Button
              variant="contained"
              startIcon={<Add />}
              disabled={!libraryId}
              onClick={() => setFloorDialogOpen(true)}
              sx={{
                minHeight: 46,
                px: 2.4,
                textTransform: "none",
                borderRadius: 2.4,
                fontWeight: 850,
                boxShadow: `0 8px 22px ${alpha(
                  theme.palette.primary.main,
                  0.22,
                )}`,
              }}
            >
              Add Floor
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{ mb: 2.5, borderRadius: 2.5 }}
        >
          {success}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 2.4 },
          mb: 3,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 8px 26px rgba(15,23,42,0.04)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          alignItems={{ xs: "stretch", lg: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Grid container spacing={1.6} sx={{ flex: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
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
                  sx={{ borderRadius: 2.2 }}
                >
                  {libraries.map((library) => (
                    <MenuItem key={library.id} value={String(library.id)}>
                      {library.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
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
                  sx={{ borderRadius: 2.2 }}
                >
                  {floors.map((floor) => (
                    <MenuItem key={floor.id} value={String(floor.id)}>
                      {floor.name || getFloorName(floor.floorNumber)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            sx={{ flexShrink: 0 }}
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
              sx={{
                minHeight: 42,
                textTransform: "none",
                borderRadius: 2.2,
                fontWeight: 750,
              }}
            >
              Configure Layout
            </Button>

            <Button
              variant="contained"
              startIcon={<EventSeat />}
              disabled={!floorId || saving}
              onClick={handleOpenAddSeatAnywhere}
              sx={{
                minHeight: 42,
                textTransform: "none",
                borderRadius: 2.2,
                fontWeight: 800,
                boxShadow: "none",
              }}
            >
              Add Seat
            </Button>

            <Button
              variant="outlined"
              startIcon={<Add />}
              disabled={!floorId || saving}
              onClick={handleOpenAddSpaceAnywhere}
              sx={{
                minHeight: 42,
                textTransform: "none",
                borderRadius: 2.2,
                fontWeight: 750,
              }}
            >
              Add Space
            </Button>

            <Button
              variant="outlined"
              startIcon={<Add />}
              disabled={!floorId || rowCount === 0}
              onClick={() => setAddRowDialogOpen(true)}
              sx={{
                minHeight: 42,
                textTransform: "none",
                borderRadius: 2.2,
                fontWeight: 750,
              }}
            >
              Add Row
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {libraryId && floors.length > 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 1.5, md: 2 },
            mb: 3,
            borderRadius: 3.5,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 8px 26px rgba(15,23,42,0.035)",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
            sx={{ mb: 1.6 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <LayersOutlined color="primary" />

              <Box>
                <Typography variant="subtitle1" fontWeight={850}>
                  Floors
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Switch floors instantly or add/remove floors as your library
                  changes.
                </Typography>
              </Box>
            </Stack>

            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFloorDialogOpen(true)}
              disabled={saving}
              sx={{
                textTransform: "none",
                borderRadius: 2.2,
                fontWeight: 800,
              }}
            >
              Add Floor
            </Button>
          </Stack>

          <Box
            sx={{
              display: "flex",
              gap: 1.2,
              overflowX: "auto",
              pb: 0.5,
              scrollbarWidth: "thin",
            }}
          >
            {floors.map((floor) => {
              const active = String(floor.id) === String(floorId);

              return (
                <Paper
                  key={floor.id}
                  elevation={0}
                  onClick={() => {
                    setFloorId(String(floor.id));
                    setSeats([]);
                    setGaps([]);
                  }}
                  sx={{
                    minWidth: 190,
                    p: 1.5,
                    borderRadius: 2.8,
                    border: "1px solid",
                    borderColor: active
                      ? alpha(theme.palette.primary.main, 0.45)
                      : "divider",
                    bgcolor: active
                      ? alpha(theme.palette.primary.main, 0.055)
                      : "background.paper",
                    cursor: "pointer",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: alpha(theme.palette.primary.main, 0.35),
                      boxShadow: "0 8px 20px rgba(15,23,42,0.06)",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="flex-start"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        fontWeight={850}
                        noWrap
                        color={active ? "primary.main" : "text.primary"}
                      >
                        {floor.name || getFloorName(floor.floorNumber)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mt: 0.25 }}
                      >
                        Floor {floor.floorNumber}
                      </Typography>
                    </Box>

                    <Tooltip title="Delete floor">
                      <IconButton
                        size="small"
                        color="error"
                        disabled={saving}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleOpenDeleteFloor(floor);
                        }}
                        sx={{
                          width: 30,
                          height: 30,
                          border: "1px solid",
                          borderColor: alpha(theme.palette.error.main, 0.14),
                          bgcolor: alpha(theme.palette.error.main, 0.025),
                        }}
                      >
                        <DeleteOutlineOutlined sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>

                  {active && (
                    <Chip
                      size="small"
                      label="Selected"
                      color="primary"
                      sx={{
                        mt: 1.1,
                        height: 22,
                        fontWeight: 750,
                      }}
                    />
                  )}
                </Paper>
              );
            })}
          </Box>
        </Paper>
      )}

      {floorId && (
        <Grid container spacing={1.6} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <StatisticCard label="Total Seats" value={statistics.total} />
          </Grid>

          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <StatisticCard
              label="Operational"
              value={statistics.operational}
              tone="success"
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <StatisticCard
              label="Gaps"
              value={statistics.gaps}
              tone="primary"
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <StatisticCard
              label="Reserved"
              value={statistics.reserved}
              tone="info"
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <StatisticCard
              label="Girls Reserved"
              value={statistics.girlsReserved}
              tone="secondary"
            />
          </Grid>

          <Grid size={{ xs: 6, sm: 4, lg: 2 }}>
            <StatisticCard
              label="Maintenance"
              value={statistics.maintenance}
              tone="warning"
            />
          </Grid>
        </Grid>
      )}

      {!loadingFloors && libraryId && floors.length === 0 && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, md: 7 },
            minHeight: 340,
            textAlign: "center",
            borderRadius: 4,
            border: "1.5px dashed",
            borderColor: alpha(theme.palette.primary.main, 0.28),
            bgcolor: alpha(theme.palette.primary.main, 0.018),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box>
            <Box
              sx={{
                width: 76,
                height: 76,
                borderRadius: "50%",
                mx: "auto",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <EventSeat sx={{ fontSize: 38 }} />
            </Box>

            <Typography variant="h5" fontWeight={850} sx={{ mt: 2 }}>
              No floors configured
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mt: 0.75, mb: 2.5, maxWidth: 500 }}
            >
              Create your first floor and then configure its rows, columns,
              seats, gaps, entrance and reception.
            </Typography>

            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setFloorDialogOpen(true)}
              sx={{
                textTransform: "none",
                borderRadius: 2.5,
                fontWeight: 800,
              }}
            >
              Create Floor
            </Button>
          </Box>
        </Paper>
      )}

      {floorId && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 12px 34px rgba(15,23,42,0.045)",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            sx={{ mb: 2.5 }}
          >
            <Box>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography variant="h6" fontWeight={850}>
                  {currentFloor?.name ||
                    getFloorName(currentFloor?.floorNumber) ||
                    "Floor"}
                </Typography>

                <Chip
                  size="small"
                  label="Live Layout"
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {statistics.total} seats
                {"  •  "}
                {rowCount} rows
                {"  •  "}
                {columnCount} columns
                {"  •  "}
                {statistics.gaps} gaps
              </Typography>
            </Box>

            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label={`${statistics.operational} Operational`}
                sx={{
                  fontWeight: 700,
                  bgcolor: "#dcfce7",
                  color: "#166534",
                }}
              />
              <Chip
                size="small"
                label={`${statistics.reserved + statistics.girlsReserved} Restricted`}
                sx={{
                  fontWeight: 700,
                  bgcolor: "#eff6ff",
                  color: "#1d4ed8",
                }}
              />
              <Chip
                size="small"
                label={`${statistics.gaps} Gaps`}
                variant="outlined"
                sx={{ fontWeight: 700 }}
              />
            </Stack>
          </Stack>

          <Paper
            elevation={0}
            sx={{
              mb: 2.5,
              p: 1.4,
              borderRadius: 2.8,
              border: "1px solid",
              borderColor: bulkMode
                ? alpha(theme.palette.primary.main, 0.22)
                : "divider",
              bgcolor: bulkMode
                ? alpha(theme.palette.primary.main, 0.028)
                : alpha(theme.palette.text.primary, 0.012),
            }}
          >
            <Stack
              direction={{ xs: "column", lg: "row" }}
              alignItems={{ xs: "stretch", lg: "center" }}
              justifyContent="space-between"
              spacing={1.3}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Button
                  variant={bulkMode ? "contained" : "outlined"}
                  size="small"
                  startIcon={<CheckBoxOutlined />}
                  onClick={() => {
                    setBulkMode((previous) => !previous);
                    setSelectedSeatIds([]);
                  }}
                  sx={{
                    textTransform: "none",
                    borderRadius: 2,
                    fontWeight: 800,
                  }}
                >
                  {bulkMode ? "Exit Bulk Edit" : "Bulk Edit Seats"}
                </Button>

                {bulkMode && (
                  <Chip
                    size="small"
                    label={`${selectedSeatIds.length} selected`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 750 }}
                  />
                )}
              </Stack>

              {bulkMode && (
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  alignItems={{ xs: "stretch", md: "center" }}
                >
                  <Button
                    size="small"
                    variant="text"
                    onClick={handleSelectAllEditableSeats}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Select editable seats
                  </Button>

                  <Button
                    size="small"
                    variant="text"
                    onClick={handleClearSeatSelection}
                    disabled={selectedSeatIds.length === 0}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Clear
                  </Button>

                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Seat Type</InputLabel>
                    <Select
                      value={bulkSeatType}
                      label="Seat Type"
                      onChange={(event) => setBulkSeatType(event.target.value)}
                    >
                      {SEAT_TYPES.map((type) => (
                        <MenuItem key={type} value={type}>
                          {SEAT_TYPE_LABELS[type]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    size="small"
                    variant="outlined"
                    disabled={saving || selectedSeatIds.length === 0}
                    onClick={handleBulkUpdateType}
                    sx={{ textTransform: "none", fontWeight: 750 }}
                  >
                    Apply Type
                  </Button>

                  <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={bulkSeatStatus}
                      label="Status"
                      onChange={(event) =>
                        setBulkSeatStatus(event.target.value)
                      }
                    >
                      {MANAGEMENT_STATUSES.map((status) => (
                        <MenuItem key={status} value={status}>
                          {SEAT_STATUS_LABELS[status]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Button
                    size="small"
                    variant="outlined"
                    disabled={saving || selectedSeatIds.length === 0}
                    onClick={handleBulkUpdateStatus}
                    sx={{ textTransform: "none", fontWeight: 750 }}
                  >
                    Apply Status
                  </Button>
                </Stack>
              )}
            </Stack>
          </Paper>

          <Divider sx={{ mb: 3 }} />

          {loadingLayout ? (
            <Box
              sx={{
                minHeight: 360,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Stack alignItems="center" spacing={1.5}>
                <CircularProgress />
                <Typography color="text.secondary">
                  Loading seat layout...
                </Typography>
              </Stack>
            </Box>
          ) : rowCount === 0 || columnCount === 0 ? (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  mx: "auto",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                  color: "primary.main",
                }}
              >
                <Settings sx={{ fontSize: 34 }} />
              </Box>

              <Typography variant="h6" fontWeight={850} sx={{ mt: 2 }}>
                Layout not configured
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2.5 }}>
                Configure rows, columns, entrance and reception to build the
                seat map.
              </Typography>

              <Button
                variant="contained"
                startIcon={<Settings />}
                onClick={() => setLayoutDialogOpen(true)}
                sx={{
                  textTransform: "none",
                  borderRadius: 2.4,
                  fontWeight: 800,
                }}
              >
                Configure Layout
              </Button>
            </Box>
          ) : (
            <>
              {renderTopMarkers()}

              <Box
                sx={{
                  p: { xs: 1.5, md: 2.5 },
                  borderRadius: 3.2,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.09),
                  bgcolor: alpha(theme.palette.primary.main, 0.012),
                }}
              >
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

                  <Box sx={{ overflowX: "auto", py: 1.5, px: 0.5 }}>
                    <Stack spacing={2} sx={{ minWidth: columnCount * 78 + 80 }}>
                      {Array.from({ length: rowCount }).map((_, rowIndex) => {
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
                                bgcolor: alpha(
                                  theme.palette.primary.main,
                                  0.07,
                                ),
                                color: "primary.main",
                                border: "1px solid",
                                borderColor: alpha(
                                  theme.palette.primary.main,
                                  0.1,
                                ),
                                fontWeight: 900,
                              }}
                            >
                              {rowLabel}
                            </Box>

                            {Array.from({ length: columnCount }).map(
                              (__, columnIndex) => {
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

                                if (seat) {
                                  const style = getSeatStyle(seat.status);

                                  return (
                                    <Tooltip
                                      key={key}
                                      arrow
                                      title={`${seat.seatNumber} • ${
                                        SEAT_TYPE_LABELS[seat.seatType] ||
                                        seat.seatType
                                      } • ${
                                        SEAT_STATUS_LABELS[seat.status] ||
                                        seat.status
                                      }`}
                                    >
                                      <Box
                                        onClick={() =>
                                          handleSeatPrimaryAction(seat)
                                        }
                                        sx={{
                                          width: 64,
                                          minWidth: 64,
                                          height: 60,
                                          position: "relative",
                                          display: "flex",
                                          flexDirection: "column",
                                          alignItems: "center",
                                          justifyContent: "center",
                                          cursor: "pointer",
                                          border: "1.5px solid",
                                          borderColor: selectedSeatIds.includes(
                                            Number(seat.id),
                                          )
                                            ? "primary.main"
                                            : style.borderColor,
                                          bgcolor: selectedSeatIds.includes(
                                            Number(seat.id),
                                          )
                                            ? alpha(
                                                theme.palette.primary.main,
                                                0.11,
                                              )
                                            : style.backgroundColor,
                                          color: style.color,
                                          borderRadius: 2.3,
                                          boxShadow:
                                            "0 4px 12px rgba(15,23,42,0.035)",
                                          transition:
                                            "transform 0.18s ease, box-shadow 0.18s ease",
                                          "&:hover": {
                                            transform: "translateY(-3px)",
                                            boxShadow:
                                              "0 9px 20px rgba(15,23,42,0.10)",
                                          },
                                        }}
                                      >
                                        <EventSeat fontSize="small" />

                                        <Typography
                                          variant="caption"
                                          fontWeight={800}
                                          sx={{ mt: 0.15 }}
                                        >
                                          {seat.seatNumber}
                                        </Typography>
                                      </Box>
                                    </Tooltip>
                                  );
                                }

                                if (gap) {
                                  return (
                                    <Tooltip
                                      key={key}
                                      arrow
                                      title="Blank space • Click to remove"
                                    >
                                      <Box
                                        onClick={() => handleRemoveGap(gap)}
                                        sx={{
                                          width: 64,
                                          minWidth: 64,
                                          height: 60,
                                          cursor: "pointer",
                                          borderRadius: 2.3,
                                          border: "1.5px solid transparent",
                                          bgcolor: "transparent",
                                          transition: "all 0.18s ease",
                                          "&:hover": {
                                            borderColor: alpha(
                                              theme.palette.text.primary,
                                              0.12,
                                            ),
                                            bgcolor: alpha(
                                              theme.palette.text.primary,
                                              0.025,
                                            ),
                                          },
                                        }}
                                      />
                                    </Tooltip>
                                  );
                                }

                                return (
                                  <Tooltip
                                    key={key}
                                    arrow
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
                                        display: "grid",
                                        placeItems: "center",
                                        cursor: "pointer",
                                        border: "1.5px solid transparent",
                                        bgcolor: "transparent",
                                        color: "primary.main",
                                        borderRadius: 2.3,
                                        transition: "all 0.18s ease",
                                        "& .empty-position-add": {
                                          opacity: 0,
                                          transform: "scale(0.85)",
                                          transition: "all 0.18s ease",
                                        },
                                        "&:hover": {
                                          borderColor: alpha(
                                            theme.palette.primary.main,
                                            0.28,
                                          ),
                                          bgcolor: alpha(
                                            theme.palette.primary.main,
                                            0.035,
                                          ),
                                        },
                                        "&:hover .empty-position-add": {
                                          opacity: 1,
                                          transform: "scale(1)",
                                        },
                                      }}
                                    >
                                      <Add
                                        className="empty-position-add"
                                        fontSize="small"
                                      />
                                    </Box>
                                  </Tooltip>
                                );
                              },
                            )}
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>

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
              </Box>

              {renderBottomMarkers()}

              <Divider sx={{ my: 3 }} />

              <Stack
                direction="row"
                flexWrap="wrap"
                useFlexGap
                gap={1}
                alignItems="center"
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    mr: 0.5,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  Legend
                </Typography>

                {SEAT_STATUSES.map((status) => {
                  const style = getSeatStyle(status);

                  return (
                    <Chip
                      key={status}
                      size="small"
                      label={SEAT_STATUS_LABELS[status]}
                      sx={{
                        fontWeight: 700,
                        bgcolor: style.backgroundColor,
                        color: style.color,
                        border: "1px solid",
                        borderColor: style.borderColor,
                      }}
                    />
                  );
                })}

                <Chip
                  size="small"
                  label="Blank Space"
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
              </Stack>
            </>
          )}
        </Paper>
      )}

      <Dialog
        open={deleteFloorDialogOpen}
        onClose={() => {
          if (!saving) {
            setDeleteFloorDialogOpen(false);
            setFloorPendingDelete(null);
          }
        }}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.3,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.error.main, 0.08),
                color: "error.main",
              }}
            >
              <DeleteOutlineOutlined />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={850}>
                Delete Floor
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {floorPendingDelete?.name ||
                  getFloorName(floorPendingDelete?.floorNumber)}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Alert severity="warning" sx={{ borderRadius: 2.2 }}>
            Deleting a floor removes its physical layout and seats. The backend
            should reject this action when protected bookings or active seat
            allocations still depend on the floor.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button
            variant="outlined"
            disabled={saving}
            onClick={() => {
              setDeleteFloorDialogOpen(false);
              setFloorPendingDelete(null);
            }}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            startIcon={<DeleteOutlineOutlined />}
            disabled={saving}
            onClick={handleDeleteFloor}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 800 }}
          >
            {saving ? "Deleting..." : "Delete Floor"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={floorDialogOpen}
        onClose={() => !saving && setFloorDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.3,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <Add />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={850}>
                Add Floor
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Create a new floor for this library.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2.2 }}>
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
              <Alert severity="success" sx={{ borderRadius: 2.2 }}>
                <strong>{getFloorName(newFloorNumber)}</strong> will be created.
                After creating it, configure rows, columns, seats, gaps,
                entrance and reception.
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button
            disabled={saving}
            onClick={() => {
              setFloorDialogOpen(false);
              setNewFloorNumber("");
            }}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={saving || newFloorNumber === ""}
            onClick={handleCreateFloor}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 800 }}
          >
            {saving ? "Creating..." : "Create Floor"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={layoutDialogOpen}
        onClose={() => !saving && setLayoutDialogOpen(false)}
        fullWidth
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: "0 28px 80px rgba(15,23,42,0.20)",
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2.5, md: 3.2 },
            pt: 3,
            pb: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.4,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.09),
                color: "primary.main",
              }}
            >
              <Settings />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={850}>
                Configure Library Layout
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Define the floor dimensions and physical reference points.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2.5, md: 3.2 }, py: 3 }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2.1}>
                <TextField
                  label="Rows"
                  type="number"
                  value={layoutRows}
                  slotProps={{ htmlInput: { min: 1, max: 26 } }}
                  onChange={(event) => setLayoutRows(event.target.value)}
                  fullWidth
                />

                <TextField
                  label="Columns / Row"
                  type="number"
                  value={layoutColumns}
                  slotProps={{ htmlInput: { min: 1 } }}
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

                <Alert severity="info" sx={{ borderRadius: 2.2 }}>
                  Empty positions remain configurable. Click one later to add a
                  seat or mark an intentional gap / aisle.
                </Alert>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 7 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  height: "100%",
                  borderRadius: 3.2,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.1),
                  bgcolor: alpha(theme.palette.primary.main, 0.018),
                }}
              >
                <Typography variant="h6" fontWeight={850}>
                  Layout Preview
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
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
                    sx={{ mb: 2 }}
                  >
                    <LayoutMarker type="ENTRANCE" />
                  </Stack>
                )}

                <Box sx={{ overflowX: "auto" }}>
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
                              fontWeight: 800,
                              color: "primary.main",
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
                                borderRadius: 1.7,
                                border: "1px solid",
                                borderColor: alpha(
                                  theme.palette.success.main,
                                  0.25,
                                ),
                                bgcolor: alpha(
                                  theme.palette.success.main,
                                  0.06,
                                ),
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <EventSeat
                                sx={{ fontSize: 18, color: "success.main" }}
                              />

                              <Typography variant="caption" fontWeight={700}>
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
                    sx={{ mt: 3 }}
                  >
                    <LayoutMarker type="RECEPTION" />
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions
          sx={{
            px: { xs: 2.5, md: 3.2 },
            py: 2.2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            disabled={saving}
            onClick={() => setLayoutDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={saving}
            onClick={handleApplyLayout}
            sx={{
              textTransform: "none",
              borderRadius: 2.2,
              fontWeight: 800,
              minWidth: 140,
            }}
          >
            {saving ? "Applying..." : "Apply Layout"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={positionDialogOpen}
        onClose={() => !saving && setPositionDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Typography variant="h6" fontWeight={850}>
            Configure Position
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            Row {selectedPosition?.rowLabel} • Position{" "}
            {selectedPosition?.columnNumber}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Alert severity="info" sx={{ borderRadius: 2.2 }}>
            Choose whether this physical position should contain a seat or
            remain intentionally empty as blank space.
          </Alert>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button
            onClick={() => setPositionDialogOpen(false)}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="outlined"
            disabled={saving}
            onClick={handleMarkGap}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 700 }}
          >
            Mark as Gap
          </Button>

          <Button
            variant="contained"
            startIcon={<EventSeat />}
            onClick={openAddSeatForPosition}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 800 }}
          >
            Add Seat
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addSpaceDialogOpen}
        onClose={() => !saving && setAddSpaceDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Typography variant="h6" fontWeight={850}>
            Add Blank Space
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            Reserve a physical position as empty space between seats.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2.2 }}>
              Blank spaces are saved in the layout but rendered without any
              label. Use consecutive blank positions to create wider aisles.
            </Alert>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Row</InputLabel>
                  <Select
                    value={addSpaceRow}
                    label="Row"
                    onChange={(event) => setAddSpaceRow(event.target.value)}
                  >
                    {Array.from({ length: 26 }).map((_, index) => {
                      const rowLabel = getRowLabel(index);
                      return (
                        <MenuItem key={rowLabel} value={rowLabel}>
                          Row {rowLabel}
                          {index + 1 > rowCount ? " • New row" : ""}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Column"
                  type="number"
                  value={addSpaceColumn}
                  onChange={(event) => setAddSpaceColumn(event.target.value)}
                  inputProps={{ min: 1, step: 1 }}
                  helperText={
                    Number(addSpaceColumn) > columnCount
                      ? "This will extend the current column count."
                      : "Choose the physical column for the blank space."
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            {addSpaceWillInsertAndShift ? (
              <Alert severity="info" sx={{ borderRadius: 2.2 }}>
                Position {addSpaceNormalizedRow}
                {addSpaceNormalizedColumn} currently contains seat{" "}
                <strong>{seatAtAddSpacePosition?.seatNumber}</strong>. A new
                blank space will be inserted here and this seat, plus every
                seat/space to its right in row {addSpaceNormalizedRow}, will
                shift one position to the right.
              </Alert>
            ) : spaceAlreadyExists ? (
              <Alert severity="warning" sx={{ borderRadius: 2.2 }}>
                Position {addSpaceNormalizedRow}
                {addSpaceNormalizedColumn} is already blank space.
              </Alert>
            ) : addSpaceWouldExpandLayout ? (
              <Alert severity="success" sx={{ borderRadius: 2.2 }}>
                The layout will expand to{" "}
                <strong>
                  {addSpaceNextRowCount} rows × {addSpaceNextColumnCount}{" "}
                  columns
                </strong>
                .
              </Alert>
            ) : addSpacePositionKey ? (
              <Alert severity="success" sx={{ borderRadius: 2.2 }}>
                Position {addSpaceNormalizedRow}
                {addSpaceNormalizedColumn} can be used as blank space.
              </Alert>
            ) : null}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button
            disabled={saving}
            onClick={() => setAddSpaceDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={
              saving ||
              !/^[A-Z]$/.test(addSpaceNormalizedRow) ||
              !Number.isInteger(addSpaceNormalizedColumn) ||
              addSpaceNormalizedColumn < 1 ||
              spaceAlreadyExists
            }
            onClick={handleAddSpace}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 800 }}
          >
            {saving ? "Adding..." : "Add Space"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addSeatDialogOpen}
        onClose={() => !saving && setAddSeatDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.3,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.success.main, 0.09),
                color: "success.main",
              }}
            >
              <EventSeat />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={850}>
                Add Seat
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Row {addSeatRow || "-"} • Position {addSeatColumn || "-"}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2.2 }}>
              Select any row from A-Z and any positive column. If the position
              is outside the current floor dimensions, LibraryHub will expand
              the layout automatically when the seat is saved.
            </Alert>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Row</InputLabel>

                  <Select
                    value={addSeatRow}
                    label="Row"
                    onChange={(event) => {
                      const nextRow = event.target.value;
                      setAddSeatRow(nextRow);
                    }}
                  >
                    {Array.from({ length: 26 }).map((_, index) => {
                      const rowLabel = getRowLabel(index);

                      return (
                        <MenuItem key={rowLabel} value={rowLabel}>
                          Row {rowLabel}
                          {index + 1 > rowCount ? " • New row" : ""}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Column"
                  type="number"
                  value={addSeatColumn}
                  onChange={(event) => setAddSeatColumn(event.target.value)}
                  inputProps={{
                    min: 1,
                    step: 1,
                  }}
                  helperText={
                    Number(addSeatColumn) > columnCount
                      ? "This will extend the current column count."
                      : "Choose any column in the floor."
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

            {seatAtAddPosition ? (
              <Alert severity="error" sx={{ borderRadius: 2.2 }}>
                Position {addSeatNormalizedRow}
                {addSeatNormalizedColumn} already contains seat{" "}
                <strong>{seatAtAddPosition.seatNumber}</strong>. Choose another
                row or column.
              </Alert>
            ) : gapAtAddPosition ? (
              <Alert severity="warning" sx={{ borderRadius: 2.2 }}>
                Position {addSeatNormalizedRow}
                {addSeatNormalizedColumn} is currently marked as blank space.
                Adding the seat will replace that space.
              </Alert>
            ) : addSeatWouldExpandLayout ? (
              <Alert severity="success" sx={{ borderRadius: 2.2 }}>
                The floor layout will expand to{" "}
                <strong>
                  {addSeatNextRowCount} rows × {addSeatNextColumnCount} columns
                </strong>{" "}
                to include this seat.
              </Alert>
            ) : addSeatPositionKey ? (
              <Alert severity="success" sx={{ borderRadius: 2.2 }}>
                Position {addSeatNormalizedRow}
                {addSeatNormalizedColumn} is available.
              </Alert>
            ) : null}

            <TextField
              label="Seat Number"
              value={addSeatNumber}
              onChange={(event) => setAddSeatNumber(event.target.value)}
              placeholder="e.g. A1, W12, P-101"
              helperText="Seat number is independent from its physical row and column."
              fullWidth
              autoFocus
            />

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
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
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
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
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button
            disabled={saving}
            onClick={() => setAddSeatDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={
              saving ||
              !addSeatNormalizedRow ||
              !/^[A-Z]$/.test(addSeatNormalizedRow) ||
              !Number.isInteger(addSeatNormalizedColumn) ||
              addSeatNormalizedColumn < 1 ||
              !addSeatNumber.trim() ||
              Boolean(seatAtAddPosition)
            }
            onClick={handleAddSeat}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 800 }}
          >
            {saving ? "Adding..." : "Add Seat"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={addRowDialogOpen}
        onClose={() => !saving && setAddRowDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Typography variant="h6" fontWeight={850}>
            Add New Row
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
            Extend the current floor layout with another row of seats.
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2.2 }}>
              New row:{" "}
              <strong>
                {rowCount < 26 ? getRowLabel(rowCount) : "No row available"}
              </strong>
            </Alert>

            <TextField
              label="Number of Seats"
              type="number"
              value={addRowSeats}
              slotProps={{ htmlInput: { min: 1 } }}
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

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button
            disabled={saving}
            onClick={() => setAddRowDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={saving}
            onClick={handleAddRow}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 800 }}
          >
            {saving ? "Adding..." : "Add Row"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={seatDialogOpen}
        onClose={() => !saving && setSeatDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.3,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <EventSeat />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={850}>
                Manage Seat {selectedSeat?.seatNumber || ""}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Row {selectedSeat?.rowLabel || "-"} • Position{" "}
                {selectedSeat?.columnNumber || "-"}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="info" sx={{ borderRadius: 2.2 }}>
              Seat name and physical position are independent. You can rename
              this seat or move it to any row/column without changing its seat
              ID.
            </Alert>

            <TextField
              label="Seat Name / Number"
              value={editSeatNumber}
              onChange={(event) => setEditSeatNumber(event.target.value)}
              helperText="Example: E8, WINDOW-1, P12"
              fullWidth
            />

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Row</InputLabel>
                  <Select
                    value={editSeatRow}
                    label="Row"
                    onChange={(event) => setEditSeatRow(event.target.value)}
                  >
                    {Array.from({ length: 26 }).map((_, index) => {
                      const rowLabel = getRowLabel(index);
                      return (
                        <MenuItem key={rowLabel} value={rowLabel}>
                          Row {rowLabel}
                          {index + 1 > rowCount ? " • New row" : ""}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Position / Column"
                  type="number"
                  value={editSeatColumn}
                  onChange={(event) => setEditSeatColumn(event.target.value)}
                  inputProps={{ min: 1, step: 1 }}
                  helperText={
                    Number(editSeatColumn) > columnCount
                      ? "Layout will expand automatically."
                      : "Physical position in this row."
                  }
                  fullWidth
                />
              </Grid>
            </Grid>

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

            {selectedSeat?.status === "BOOKED" && (
              <Alert severity="warning" sx={{ borderRadius: 2.2 }}>
                This seat is currently booked and cannot be deleted.
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1.5,
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<Add />}
            disabled={saving}
            onClick={() => handleInsertSpaceRelativeToSeat("before")}
            sx={{ textTransform: "none", fontWeight: 750 }}
          >
            Space Before
          </Button>

          <Button
            variant="outlined"
            startIcon={<Add />}
            disabled={saving}
            onClick={() => handleInsertSpaceRelativeToSeat("after")}
            sx={{ textTransform: "none", fontWeight: 750 }}
          >
            Space After
          </Button>

          <Button
            color="error"
            startIcon={<DeleteOutlineOutlined />}
            disabled={saving || selectedSeat?.status === "BOOKED"}
            onClick={handleDeleteSeat}
            sx={{ textTransform: "none", fontWeight: 750 }}
          >
            Delete Seat
          </Button>

          <Box sx={{ flexGrow: 1 }} />

          <Button
            disabled={saving}
            onClick={() => setSeatDialogOpen(false)}
            variant="outlined"
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={saving}
            onClick={handleUpdateSeat}
            sx={{ textTransform: "none", borderRadius: 2.2, fontWeight: 800 }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SeatMapping;
