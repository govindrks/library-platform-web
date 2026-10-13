import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  ArrowForward,
  DoorFrontOutlined,
  EventSeat,
  MeetingRoom,
  MeetingRoomOutlined,
  Schedule,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import seatApi from "../../../api/seatApi";

import slotApi from "../../../api/slotApi";

// ============================================================
// HELPERS
// ============================================================

function getToday() {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatSeatType(value) {
  if (!value) {
    return "Normal";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatTime(value) {
  if (!value) {
    return "-";
  }

  return String(value).slice(0, 5);
}

function normalizeRow(value) {
  return String(value || "")
    .trim()
    .toUpperCase();
}

function positionKey(rowLabel, columnNumber) {
  return `${normalizeRow(rowLabel)}:${Number(columnNumber)}`;
}

function getRowLabel(index) {
  return String.fromCharCode(65 + index);
}

function isSeatSelectable(seat) {
  return seat?.availabilityStatus === "AVAILABLE" && seat?.booked !== true;
}

// ============================================================
// LAYOUT MARKER
// ============================================================

function LayoutMarker({ type }) {
  const isEntrance = type === "ENTRANCE";

  return (
    <Box
      sx={{
        minWidth: {
          xs: 135,
          sm: 165,
        },

        px: 2.5,
        py: 1.1,

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        gap: 1,

        border: "1px solid",

        borderColor: "divider",

        borderRadius: 3,

        bgcolor: "action.hover",

        fontWeight: 800,

        letterSpacing: 1.2,
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
// COMPONENT
// ============================================================

function BookSeat() {
  const { libraryId } = useParams();

  const location = useLocation();

  const navigate = useNavigate();

  // ==========================================================
  // ROUTE STATE
  // ==========================================================

  const selectedPlan = location.state?.selectedPlan || null;

  const library = location.state?.library || null;

  // ==========================================================
  // BOOKING STATE
  // ==========================================================

  const [bookingDate, setBookingDate] = useState(getToday());

  const [floors, setFloors] = useState([]);

  const [floorId, setFloorId] = useState("");

  const [slots, setSlots] = useState([]);

  const [slotId, setSlotId] = useState("");

  const [seats, setSeats] = useState([]);

  const [selectedSeat, setSelectedSeat] = useState(null);

  // ==========================================================
  // PHYSICAL FLOOR LAYOUT
  // ==========================================================

  const [floorLayout, setFloorLayout] = useState(null);

  const [loadingLayout, setLoadingLayout] = useState(false);

  // ==========================================================
  // LOADING / ERROR
  // ==========================================================

  const [loadingSetup, setLoadingSetup] = useState(true);

  const [loadingSeats, setLoadingSeats] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // SELECTED FLOOR
  // ==========================================================

  const selectedFloor = useMemo(
    () => floors.find((floor) => String(floor.id) === String(floorId)) || null,
    [floors, floorId],
  );

  // ==========================================================
  // SELECTED SLOT
  // ==========================================================

  const selectedSlot = useMemo(
    () => slots.find((slot) => String(slot.id) === String(slotId)) || null,
    [slots, slotId],
  );

  // ==========================================================
  // LOAD FLOORS + ACTIVE SLOTS
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadSetup = async () => {
      if (!libraryId) {
        return;
      }

      try {
        setLoadingSetup(true);

        setError("");

        const [floorResponse, slotResponse] = await Promise.all([
          seatApi.getFloors(libraryId),

          slotApi.getActiveSlots(libraryId),
        ]);

        if (!active) {
          return;
        }

        const loadedFloors = Array.isArray(floorResponse) ? floorResponse : [];

        const loadedSlots = Array.isArray(slotResponse) ? slotResponse : [];

        setFloors(loadedFloors);

        setSlots(loadedSlots);

        if (loadedFloors.length > 0) {
          setFloorId(String(loadedFloors[0].id));
        }

        if (loadedSlots.length > 0) {
          setSlotId(String(loadedSlots[0].id));
        }
      } catch (requestError) {
        console.error("Unable to load booking configuration:", requestError);

        if (active) {
          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load floors and booking slots.",
          );
        }
      } finally {
        if (active) {
          setLoadingSetup(false);
        }
      }
    };

    loadSetup();

    return () => {
      active = false;
    };
  }, [libraryId]);

  // ==========================================================
  // LOAD COMPLETE PHYSICAL FLOOR LAYOUT
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadPhysicalLayout = async () => {
      if (!libraryId || !floorId) {
        setFloorLayout(null);

        return;
      }

      try {
        setLoadingLayout(true);

        const response = await seatApi.getFloorLayout(
          libraryId,
          Number(floorId),
        );

        if (!active) {
          return;
        }

        setFloorLayout(response || null);
      } catch (requestError) {
        console.error("Unable to load physical floor layout:", requestError);

        if (active) {
          setFloorLayout(null);

          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load the physical floor layout.",
          );
        }
      } finally {
        if (active) {
          setLoadingLayout(false);
        }
      }
    };

    loadPhysicalLayout();

    return () => {
      active = false;
    };
  }, [libraryId, floorId]);

  // ==========================================================
  // LOAD SLOT-AWARE AVAILABILITY
  // ==========================================================

  useEffect(() => {
    let active = true;

    const loadAvailability = async () => {
      if (!libraryId || !floorId || !slotId || !bookingDate) {
        setSeats([]);

        setSelectedSeat(null);

        return;
      }

      try {
        setLoadingSeats(true);

        setError("");

        setSelectedSeat(null);

        const response = await seatApi.getSeatAvailability(
          libraryId,
          Number(floorId),
          Number(slotId),
          bookingDate,
        );

        if (!active) {
          return;
        }

        setSeats(Array.isArray(response) ? response : []);
      } catch (requestError) {
        console.error("Unable to load seat availability:", requestError);

        if (active) {
          setSeats([]);

          setError(
            requestError?.response?.data?.message ||
              requestError?.message ||
              "Unable to load seat availability.",
          );
        }
      } finally {
        if (active) {
          setLoadingSeats(false);
        }
      }
    };

    loadAvailability();

    return () => {
      active = false;
    };
  }, [libraryId, floorId, slotId, bookingDate]);

  // ==========================================================
  // LAYOUT VALUES
  // ==========================================================

  const rowCount = Number(floorLayout?.rowCount ?? 0);

  const columnCount = Number(floorLayout?.columnCount ?? 0);

  const entrancePosition = floorLayout?.entrancePosition || "NONE";

  const receptionPosition = floorLayout?.receptionPosition || "NONE";

  const gaps = useMemo(
    () => (Array.isArray(floorLayout?.gaps) ? floorLayout.gaps : []),
    [floorLayout],
  );

  // ==========================================================
  // SEAT LOOKUP BY PHYSICAL POSITION
  // ==========================================================

  const seatByPosition = useMemo(() => {
    const map = new Map();

    seats.forEach((seat) => {
      map.set(positionKey(seat.rowLabel, seat.columnNumber), seat);
    });

    return map;
  }, [seats]);

  // ==========================================================
  // GAP LOOKUP
  // ==========================================================

  const gapKeys = useMemo(
    () =>
      new Set(gaps.map((gap) => positionKey(gap.rowLabel, gap.columnNumber))),
    [gaps],
  );

  // ==========================================================
  // FALLBACK DIMENSIONS
  // ==========================================================
  //
  // Older floors may not yet have FloorLayoutConfig.
  //
  // In that case derive enough dimensions from the
  // actual availability data so booking remains usable.
  //

  const derivedRowCount = useMemo(() => {
    if (seats.length === 0) {
      return 0;
    }

    const rowIndexes = seats
      .map((seat) => {
        const row = normalizeRow(seat.rowLabel);

        if (!row) {
          return 0;
        }

        return row.charCodeAt(0) - 64;
      })
      .filter((value) => value > 0);

    return rowIndexes.length ? Math.max(...rowIndexes) : 0;
  }, [seats]);

  const derivedColumnCount = useMemo(() => {
    if (seats.length === 0) {
      return 0;
    }

    return Math.max(...seats.map((seat) => Number(seat.columnNumber ?? 0)));
  }, [seats]);

  const effectiveRowCount = rowCount > 0 ? rowCount : derivedRowCount;

  const effectiveColumnCount =
    columnCount > 0 ? columnCount : derivedColumnCount;

  // ==========================================================
  // COUNTS
  // ==========================================================

  const availableCount = useMemo(
    () => seats.filter(isSeatSelectable).length,
    [seats],
  );

  const bookedCount = useMemo(
    () =>
      seats.filter(
        (seat) => seat.availabilityStatus === "BOOKED" || seat.booked === true,
      ).length,
    [seats],
  );

  // ==========================================================
  // CONTINUE
  // ==========================================================

  const handleContinue = () => {
    setError("");

    if (!selectedPlan) {
      setError("Please select a membership plan first.");

      return;
    }

    if (!bookingDate) {
      setError("Please select a booking date.");

      return;
    }

    if (!selectedFloor) {
      setError("Please select a floor.");

      return;
    }

    if (!selectedSlot) {
      setError("Please select a booking slot.");

      return;
    }

    if (!selectedSeat) {
      setError("Please select an available seat.");

      return;
    }

    const normalizedSeat = {
      ...selectedSeat,

      id: selectedSeat.seatId,

      floorId: selectedFloor.id,

      floorNumber: selectedFloor.floorNumber,

      floorName: selectedFloor.name,
    };

    navigate(`/student/libraries/${libraryId}/booking-review`, {
      state: {
        library,

        selectedPlan,

        selectedSeat: normalizedSeat,

        selectedSlot,

        selectedFloor,

        startDate: bookingDate,

        endDate: bookingDate,
      },
    });
  };

  // ==========================================================
  // TOP MARKERS
  // ==========================================================

  const renderTopMarkers = () => {
    const left = [];
    const center = [];
    const right = [];

    if (entrancePosition === "TOP_LEFT") {
      left.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "TOP_LEFT") {
      left.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    if (entrancePosition === "TOP_CENTER") {
      center.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "TOP_CENTER") {
      center.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    if (entrancePosition === "TOP_RIGHT") {
      right.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === "TOP_RIGHT") {
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

          gap: 2,

          mb: 4,
        }}
      >
        <Stack alignItems="flex-start" spacing={1}>
          {left}
        </Stack>

        <Stack alignItems="center" spacing={1}>
          {center}
        </Stack>

        <Stack alignItems="flex-end" spacing={1}>
          {right}
        </Stack>
      </Box>
    );
  };

  // ==========================================================
  // BOTTOM MARKERS
  // ==========================================================

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

          gap: 2,

          mt: 4,
        }}
      >
        <Stack alignItems="flex-start" spacing={1}>
          {left}
        </Stack>

        <Stack alignItems="center" spacing={1}>
          {center}
        </Stack>

        <Stack alignItems="flex-end" spacing={1}>
          {right}
        </Stack>
      </Box>
    );
  };

  // ==========================================================
  // NO PLAN
  // ==========================================================

  if (!selectedPlan) {
    return (
      <Box>
        <Alert
          severity="warning"
          sx={{
            mb: 2,
          }}
        >
          Please select a membership plan before booking a seat.
        </Alert>

        <Button
          variant="contained"
          onClick={() => navigate(`/student/libraries/${libraryId}/plans`)}
        >
          Select Membership Plan
        </Button>
      </Box>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box>
      {/* ======================================================
          BACK
      ====================================================== */}

      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/student/libraries/${libraryId}/plans`)}
        sx={{
          mb: 2,
        }}
      >
        Back to Plans
      </Button>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <Typography variant="h4" fontWeight={800}>
        Select Your Seat
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.5,
          mb: 3,
        }}
      >
        Choose a date, floor, booking slot and available seat.
      </Typography>

      {/* ======================================================
          SELECTED PLAN
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,
        }}
      >
        <CardContent>
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
          >
            <Box>
              <Typography variant="body2" color="text.secondary">
                Selected Plan
              </Typography>

              <Typography variant="h6" fontWeight={800}>
                {selectedPlan.name}
              </Typography>

              {library?.name && (
                <Typography variant="body2" color="text.secondary">
                  {library.name}
                </Typography>
              )}
            </Box>

            <Typography variant="h5" fontWeight={800} color="primary.main">
              ₹{Number(selectedPlan.price ?? 0).toLocaleString("en-IN")}
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          LOADING SETUP
      ====================================================== */}

      {loadingSetup ? (
        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            py: 6,
          }}
        >
          <CircularProgress />

          <Typography color="text.secondary">
            Loading floors and booking slots...
          </Typography>
        </Stack>
      ) : (
        <>
          {/* ==================================================
              DATE / FLOOR / SLOT
          ================================================== */}

          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
            }}
          >
            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                fullWidth
                type="date"
                label="Booking Date"
                value={bookingDate}
                onChange={(event) => setBookingDate(event.target.value)}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },

                  htmlInput: {
                    min: getToday(),
                  },
                }}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                select
                fullWidth
                label="Floor"
                value={floorId}
                onChange={(event) => {
                  setFloorId(event.target.value);

                  setSelectedSeat(null);
                }}
                disabled={floors.length === 0}
              >
                {floors.map((floor) => (
                  <MenuItem key={floor.id} value={String(floor.id)}>
                    {floor.name || `Floor ${floor.floorNumber}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                select
                fullWidth
                label="Booking Slot"
                value={slotId}
                onChange={(event) => setSlotId(event.target.value)}
                disabled={slots.length === 0}
              >
                {slots.map((slot) => (
                  <MenuItem key={slot.id} value={String(slot.id)}>
                    {slot.name}
                    {" • "}
                    {formatTime(slot.startTime)}
                    {" - "}
                    {formatTime(slot.endTime)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>

          {/* ==================================================
              CONFIG WARNINGS
          ================================================== */}

          {floors.length === 0 && (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
              }}
            >
              This library does not have any configured floors.
            </Alert>
          )}

          {slots.length === 0 && (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
              }}
            >
              This library does not currently have an active booking slot.
            </Alert>
          )}

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
              }}
            >
              {error}
            </Alert>
          )}

          {/* ==================================================
              CURRENT SELECTION
          ================================================== */}

          {selectedFloor && selectedSlot && (
            <Card
              elevation={0}
              sx={{
                mb: 3,

                border: "1px solid",

                borderColor: "divider",

                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack
                  direction={{
                    xs: "column",
                    md: "row",
                  }}
                  spacing={2}
                  divider={<Divider orientation="vertical" flexItem />}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MeetingRoom color="primary" />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Floor
                      </Typography>

                      <Typography fontWeight={700}>
                        {selectedFloor.name ||
                          `Floor ${selectedFloor.floorNumber}`}
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Schedule color="primary" />

                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Slot
                      </Typography>

                      <Typography fontWeight={700}>
                        {selectedSlot.name}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {formatTime(selectedSlot.startTime)}
                        {" - "}
                        {formatTime(selectedSlot.endTime)}
                      </Typography>
                    </Box>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* ==================================================
              AVAILABILITY HEADER
          ================================================== */}

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
            sx={{
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Seat Availability
              </Typography>

              {floorLayout && (
                <Typography variant="body2" color="text.secondary">
                  Physical layout configured by the library owner
                </Typography>
              )}
            </Box>

            <Stack
              direction="row"
              sx={{
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Chip
                size="small"
                color="success"
                label={`${availableCount} Available`}
              />

              <Chip
                size="small"
                color="error"
                variant="outlined"
                label={`${bookedCount} Booked`}
              />

              {gaps.length > 0 && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${gaps.length} Gaps / Aisles`}
                />
              )}
            </Stack>
          </Stack>

          {/* ==================================================
              PHYSICAL SEAT MAP
          ================================================== */}

          {loadingSeats || loadingLayout ? (
            <Stack
              alignItems="center"
              spacing={2}
              sx={{
                py: 6,
              }}
            >
              <CircularProgress />

              <Typography color="text.secondary">
                Loading physical seat layout and availability...
              </Typography>
            </Stack>
          ) : !floorId || !slotId ? (
            <Alert severity="info">
              Select a floor and booking slot to see seat availability.
            </Alert>
          ) : effectiveRowCount === 0 || effectiveColumnCount === 0 ? (
            <Alert severity="info">
              No seat layout has been configured for this floor.
            </Alert>
          ) : (
            <Card
              elevation={0}
              sx={{
                border: "1px solid",

                borderColor: "divider",

                borderRadius: 3,
              }}
            >
              <CardContent>
                {/* LEGEND */}

                <Stack
                  direction="row"
                  sx={{
                    flexWrap: "wrap",
                    gap: 1,
                    mb: 4,
                  }}
                >
                  <Chip size="small" color="success" label="Available" />

                  <Chip size="small" color="error" label="Booked" />

                  <Chip size="small" label="Reserved" />

                  <Chip size="small" color="warning" label="Girls Reserved" />

                  <Chip size="small" variant="outlined" label="Maintenance" />

                  <Chip size="small" variant="outlined" label="Gap / Aisle" />
                </Stack>

                {/* TOP ENTRANCE / RECEPTION */}

                {renderTopMarkers()}

                {/* MAIN PHYSICAL ROOM */}

                <Box
                  sx={{
                    display: "grid",

                    gridTemplateColumns:
                      entrancePosition === "LEFT_CENTER" ||
                      receptionPosition === "LEFT_CENTER" ||
                      entrancePosition === "RIGHT_CENTER" ||
                      receptionPosition === "RIGHT_CENTER"
                        ? {
                            xs: "1fr",
                            lg: "175px minmax(0, 1fr) 175px",
                          }
                        : "1fr",

                    gap: 2,

                    alignItems: "center",
                  }}
                >
                  {/* LEFT SIDE */}

                  {(entrancePosition === "LEFT_CENTER" ||
                    receptionPosition === "LEFT_CENTER") && (
                    <Stack
                      spacing={2}
                      alignItems="center"
                      sx={{
                        display: {
                          xs: "none",
                          lg: "flex",
                        },
                      }}
                    >
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
                      spacing={2.25}
                      sx={{
                        minWidth: effectiveColumnCount * 78 + 55,
                      }}
                    >
                      {Array.from({
                        length: effectiveRowCount,
                      }).map((_, rowIndex) => {
                        const rowLabel = getRowLabel(rowIndex);

                        return (
                          <Stack
                            key={rowLabel}
                            direction="row"
                            spacing={1.4}
                            alignItems="center"
                          >
                            {/* ROW LABEL */}

                            <Box
                              sx={{
                                width: 38,

                                minWidth: 38,

                                height: 72,

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

                            {/* POSITIONS */}

                            {Array.from({
                              length: effectiveColumnCount,
                            }).map((__, columnIndex) => {
                              const columnNumber = columnIndex + 1;

                              const key = positionKey(rowLabel, columnNumber);

                              const seat = seatByPosition.get(key);

                              const isGap = gapKeys.has(key);

                              // =============================
                              // INTENTIONAL GAP
                              // =============================

                              if (isGap) {
                                return (
                                  <Box
                                    key={key}
                                    sx={{
                                      width: 68,

                                      minWidth: 68,

                                      height: 78,

                                      display: "flex",

                                      alignItems: "center",

                                      justifyContent: "center",
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                      sx={{
                                        writingMode: "vertical-rl",

                                        letterSpacing: 1,
                                      }}
                                    >
                                      AISLE
                                    </Typography>
                                  </Box>
                                );
                              }

                              // =============================
                              // NO SEAT CONFIGURED
                              // =============================

                              if (!seat) {
                                return (
                                  <Box
                                    key={key}
                                    sx={{
                                      width: 68,

                                      minWidth: 68,

                                      height: 78,
                                    }}
                                  />
                                );
                              }

                              const selectable = isSeatSelectable(seat);

                              const selected =
                                selectedSeat?.seatId === seat.seatId;

                              const status = seat.availabilityStatus;

                              const seatColor = selected
                                ? "primary"
                                : selectable
                                  ? "success"
                                  : status === "BOOKED"
                                    ? "error"
                                    : status === "RESERVED_FOR_GIRLS"
                                      ? "warning"
                                      : "inherit";

                              return (
                                <Tooltip
                                  key={key}
                                  title={`${seat.seatNumber} • ${formatSeatType(
                                    seat.seatType,
                                  )} • ${formatSeatType(
                                    seat.availabilityStatus,
                                  )}`}
                                >
                                  <span>
                                    <Button
                                      variant={
                                        selected ? "contained" : "outlined"
                                      }
                                      color={seatColor}
                                      disabled={!selectable}
                                      onClick={() => setSelectedSeat(seat)}
                                      sx={{
                                        width: 68,

                                        minWidth: 68,

                                        height: 78,

                                        px: 0.5,

                                        flexDirection: "column",

                                        opacity:
                                          selectable || selected ? 1 : 0.55,

                                        borderRadius: 2,
                                      }}
                                    >
                                      <EventSeat />

                                      <Typography
                                        component="span"
                                        fontWeight={800}
                                        variant="body2"
                                      >
                                        {seat.seatNumber}
                                      </Typography>

                                      <Typography
                                        component="span"
                                        variant="caption"
                                        sx={{
                                          lineHeight: 1.1,

                                          textTransform: "none",
                                        }}
                                      >
                                        {formatSeatType(seat.seatType)}
                                      </Typography>
                                    </Button>
                                  </span>
                                </Tooltip>
                              );
                            })}
                          </Stack>
                        );
                      })}
                    </Stack>
                  </Box>

                  {/* RIGHT SIDE */}

                  {(entrancePosition === "RIGHT_CENTER" ||
                    receptionPosition === "RIGHT_CENTER") && (
                    <Stack
                      spacing={2}
                      alignItems="center"
                      sx={{
                        display: {
                          xs: "none",
                          lg: "flex",
                        },
                      }}
                    >
                      {entrancePosition === "RIGHT_CENTER" && (
                        <LayoutMarker type="ENTRANCE" />
                      )}

                      {receptionPosition === "RIGHT_CENTER" && (
                        <LayoutMarker type="RECEPTION" />
                      )}
                    </Stack>
                  )}
                </Box>

                {/* BOTTOM ENTRANCE / RECEPTION */}

                {renderBottomMarkers()}
              </CardContent>
            </Card>
          )}

          {/* ==================================================
              SELECTED SEAT
          ================================================== */}

          {selectedSeat && (
            <Card
              elevation={0}
              sx={{
                mt: 3,

                border: "1px solid",

                borderColor: "primary.main",

                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  alignItems={{
                    xs: "stretch",
                    sm: "center",
                  }}
                  spacing={2}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <EventSeat color="primary" />

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Selected Seat
                      </Typography>

                      <Typography variant="h6" fontWeight={800}>
                        {selectedSeat.seatNumber}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        {formatSeatType(selectedSeat.seatType)}
                        {" • Row "}
                        {selectedSeat.rowLabel}
                        {" • Position "}
                        {selectedSeat.columnNumber}
                      </Typography>
                    </Box>
                  </Stack>

                  <Button
                    size="large"
                    variant="contained"
                    endIcon={<ArrowForward />}
                    onClick={handleContinue}
                  >
                    Review Booking
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </Box>
  );
}

export default BookSeat;
