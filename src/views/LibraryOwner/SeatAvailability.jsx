import {
  AccessTime,
  CalendarMonth,
  EventSeat,
  Lock,
  Refresh,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import seatApi from "../../api/seatApi";
import slotApi from "../../api/slotApi";

/*
 * ==========================================================
 * DATE HELPERS
 * ==========================================================
 */

function getToday() {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(now.getMonth() + 1).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date) {
  if (!date) {
    return "";
  }

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/*
 * ==========================================================
 * TIME FORMATTER
 * ==========================================================
 */

function formatTime(time) {
  if (!time) {
    return "";
  }

  /*
   * Backend LocalTime may return:
   *
   * 06:00
   * 06:00:00
   *
   * We only need HH:mm.
   */
  return String(time).substring(0, 5);
}

/*
 * ==========================================================
 * API ERROR MESSAGE
 * ==========================================================
 */

function getErrorMessage(error, fallback) {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return (
    responseData?.message || responseData?.error || error?.message || fallback
  );
}

/*
 * ==========================================================
 * SEAT AVAILABILITY PAGE
 * ==========================================================
 */

function SeatAvailability() {
  const today = useMemo(() => getToday(), []);

  /*
   * ======================================================
   * FILTER STATE
   * ======================================================
   */

  const [selectedDate, setSelectedDate] = useState(today);

  /*
   * ======================================================
   * LIBRARY STATE
   * ======================================================
   */

  const [libraries, setLibraries] = useState([]);

  const [libraryId, setLibraryId] = useState("");

  /*
   * ======================================================
   * FLOOR STATE
   * ======================================================
   */

  const [floors, setFloors] = useState([]);

  const [floorId, setFloorId] = useState("");

  /*
   * ======================================================
   * SLOT STATE
   * ======================================================
   */

  const [slots, setSlots] = useState([]);

  const [slotId, setSlotId] = useState("");

  /*
   * ======================================================
   * SEAT STATE
   * ======================================================
   */

  const [seats, setSeats] = useState([]);

  /*
   * ======================================================
   * PAGE STATE
   * ======================================================
   */

  const [loadingLibraries, setLoadingLibraries] = useState(true);

  const [loadingConfiguration, setLoadingConfiguration] = useState(false);

  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState(null);

  /*
   * ======================================================
   * SELECTED OBJECTS
   * ======================================================
   */

  const selectedLibrary = useMemo(
    () =>
      libraries.find((library) => String(library.id) === String(libraryId)) ||
      null,
    [libraries, libraryId],
  );

  const selectedFloor = useMemo(
    () => floors.find((floor) => String(floor.id) === String(floorId)) || null,
    [floors, floorId],
  );

  const selectedSlot = useMemo(
    () => slots.find((slot) => String(slot.id) === String(slotId)) || null,
    [slots, slotId],
  );

  /*
   * ======================================================
   * LOAD OWNER LIBRARIES
   * ======================================================
   */

  useEffect(() => {
    let active = true;

    const loadLibraries = async () => {
      try {
        setLoadingLibraries(true);

        setError("");

        const data = await libraryApi.getMyLibraries();

        if (!active) {
          return;
        }

        const normalizedLibraries = Array.isArray(data) ? data : [];

        setLibraries(normalizedLibraries);

        /*
         * Automatically select the first
         * owner library.
         */
        if (normalizedLibraries.length > 0) {
          setLibraryId(String(normalizedLibraries[0].id));
        } else {
          setLibraryId("");

          setError("No library found for this account.");
        }
      } catch (err) {
        if (!active) {
          return;
        }

        console.error("Failed to load owner libraries:", err);

        setLibraries([]);

        setLibraryId("");

        setError(getErrorMessage(err, "Unable to load your libraries."));
      } finally {
        if (active) {
          setLoadingLibraries(false);
        }
      }
    };

    loadLibraries();

    return () => {
      active = false;
    };
  }, []);

  /*
   * ======================================================
   * LOAD FLOORS + ACTIVE SLOTS
   * ======================================================
   *
   * Whenever the selected library changes:
   *
   * 1. Clear previous dependent data.
   * 2. Load floors.
   * 3. Load active booking slots.
   * 4. Automatically select first floor and slot.
   * ======================================================
   */

  useEffect(() => {
    let active = true;

    const loadConfiguration = async () => {
      if (!libraryId) {
        setFloors([]);
        setSlots([]);

        setFloorId("");
        setSlotId("");

        setSeats([]);

        return;
      }

      try {
        setLoadingConfiguration(true);

        setError("");

        setFloors([]);
        setSlots([]);

        setFloorId("");
        setSlotId("");

        setSeats([]);

        const [floorData, slotData] = await Promise.all([
          seatApi.getFloors(libraryId),
          slotApi.getActiveSlots(libraryId),
        ]);

        if (!active) {
          return;
        }

        const normalizedFloors = Array.isArray(floorData) ? floorData : [];

        const normalizedSlots = Array.isArray(slotData) ? slotData : [];

        setFloors(normalizedFloors);

        setSlots(normalizedSlots);

        if (normalizedFloors.length > 0) {
          setFloorId(String(normalizedFloors[0].id));
        }

        if (normalizedSlots.length > 0) {
          setSlotId(String(normalizedSlots[0].id));
        }

        if (normalizedFloors.length === 0) {
          setError("No floor has been configured for this library.");

          return;
        }

        if (normalizedSlots.length === 0) {
          setError(
            "No active booking slot has been configured for this library.",
          );
        }
      } catch (err) {
        if (!active) {
          return;
        }

        console.error("Failed to load seat availability configuration:", err);

        setFloors([]);
        setSlots([]);

        setFloorId("");
        setSlotId("");

        setSeats([]);

        setError(
          getErrorMessage(err, "Unable to load floors and booking slots."),
        );
      } finally {
        if (active) {
          setLoadingConfiguration(false);
        }
      }
    };

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [libraryId]);

  /*
   * ======================================================
   * LOAD REAL SEAT AVAILABILITY
   * ======================================================
   *
   * Availability is calculated by backend using:
   *
   * library
   * +
   * floor
   * +
   * booking slot
   * +
   * selected date
   * +
   * booking records
   *
   * Seat.status itself is NOT used as dynamic booking
   * occupancy.
   * ======================================================
   */

  const loadAvailability = useCallback(async () => {
    if (!libraryId || !floorId || !slotId || !selectedDate) {
      setSeats([]);

      return;
    }

    try {
      setLoadingAvailability(true);

      setError("");

      const data = await seatApi.getSeatAvailability(
        libraryId,
        floorId,
        slotId,
        selectedDate,
      );

      const normalizedSeats = Array.isArray(data) ? data : [];

      setSeats(normalizedSeats);

      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to load seat availability:", err);

      setSeats([]);

      setError(getErrorMessage(err, "Unable to load seat availability."));
    } finally {
      setLoadingAvailability(false);
    }
  }, [libraryId, floorId, slotId, selectedDate]);

  /*
   * Automatically refresh availability whenever
   * date, floor or slot changes.
   */
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  /*
   * ======================================================
   * SUMMARY COUNTS
   * ======================================================
   */

  const totalSeats = seats.length;

  const availableSeats = useMemo(
    () =>
      seats.filter((seat) => seat.availabilityStatus === "AVAILABLE").length,
    [seats],
  );

  const bookedSeats = useMemo(
    () => seats.filter((seat) => seat.availabilityStatus === "BOOKED").length,
    [seats],
  );

  const unavailableSeats = useMemo(
    () =>
      seats.filter(
        (seat) => !["AVAILABLE", "BOOKED"].includes(seat.availabilityStatus),
      ).length,
    [seats],
  );

  const occupancyPercentage =
    totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  /*
   * ======================================================
   * GROUP SEATS BY ROW
   * ======================================================
   */

  const seatRows = useMemo(() => {
    const grouped = new Map();

    seats.forEach((seat) => {
      const rowLabel = seat.rowLabel || "Other";

      if (!grouped.has(rowLabel)) {
        grouped.set(rowLabel, []);
      }

      grouped.get(rowLabel).push(seat);
    });

    return Array.from(grouped.entries())
      .sort(([rowA], [rowB]) =>
        rowA.localeCompare(rowB, undefined, {
          numeric: true,
        }),
      )
      .map(([rowLabel, rowSeats]) => ({
        rowLabel,

        seats: [...rowSeats].sort(
          (a, b) => (a.columnNumber ?? 0) - (b.columnNumber ?? 0),
        ),
      }));
  }, [seats]);

  /*
   * ======================================================
   * SEAT STYLE
   * ======================================================
   */

  const getSeatStyles = (status) => {
    switch (status) {
      case "BOOKED":
        return {
          bgcolor: "error.light",

          borderColor: "error.main",

          color: "error.dark",
        };

      case "RESERVED":
        return {
          bgcolor: "info.light",

          borderColor: "info.main",

          color: "info.dark",
        };

      case "RESERVED_FOR_GIRLS":
        return {
          bgcolor: "secondary.light",

          borderColor: "secondary.main",

          color: "secondary.dark",
        };

      case "MAINTENANCE":
        return {
          bgcolor: "grey.200",

          borderColor: "grey.500",

          color: "grey.700",
        };

      case "AVAILABLE":
      default:
        return {
          bgcolor: "success.light",

          borderColor: "success.main",

          color: "success.dark",
        };
    }
  };

  /*
   * ======================================================
   * SEAT ICON
   * ======================================================
   */

  const renderSeatIcon = (status) => {
    if (status === "MAINTENANCE" || status === "RESERVED") {
      return (
        <Lock
          sx={{
            fontSize: 17,
          }}
        />
      );
    }

    return (
      <EventSeat
        sx={{
          fontSize: 17,
        }}
      />
    );
  };

  /*
   * ======================================================
   * PAGE LOADING
   * ======================================================
   */

  if (loadingLibraries) {
    return (
      <Box
        sx={{
          minHeight: 350,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography variant="body2" color="text.secondary">
            Loading libraries...
          </Typography>
        </Stack>
      </Box>
    );
  }

  /*
   * ======================================================
   * UI
   * ======================================================
   */

  return (
    <Box>
      {/* =================================================
                HEADER
            ================================================= */}

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
          <Typography variant="h4" fontWeight={700}>
            Seat Availability
          </Typography>

          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Monitor real-time seat availability by library, floor, date and
            booking slot.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            loadingAvailability ? <CircularProgress size={16} /> : <Refresh />
          }
          onClick={loadAvailability}
          disabled={
            loadingAvailability ||
            loadingConfiguration ||
            !libraryId ||
            !floorId ||
            !slotId
          }
        >
          Refresh
        </Button>
      </Stack>

      {/* =================================================
                ERROR
            ================================================= */}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* =================================================
                FILTERS
            ================================================= */}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="flex-end">
            {/* ================================
                            LIBRARY
                        ================================ */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Library
              </Typography>

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

                    /*
                     * Clear dependent state
                     * immediately.
                     */
                    setFloorId("");

                    setSlotId("");

                    setFloors([]);

                    setSlots([]);

                    setSeats([]);

                    setError("");

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

            {/* ================================
                            FLOOR
                        ================================ */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                Floor
              </Typography>

              <FormControl
                fullWidth
                size="small"
                disabled={
                  loadingConfiguration || !libraryId || floors.length === 0
                }
              >
                <InputLabel>Floor</InputLabel>

                <Select
                  value={floorId}
                  label="Floor"
                  onChange={(event) => {
                    setSeats([]);

                    setError("");

                    setFloorId(event.target.value);
                  }}
                >
                  {floors.map((floor) => (
                    <MenuItem key={floor.id} value={String(floor.id)}>
                      {floor.name || `Floor ${floor.floorNumber}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* ================================
                            DATE
                        ================================ */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <CalendarMonth color="primary" fontSize="small" />

                <Typography variant="subtitle2" fontWeight={600}>
                  Select Date
                </Typography>
              </Stack>

              <input
                type="date"
                value={selectedDate}
                min={today}
                onChange={(event) => {
                  setSeats([]);

                  setError("");

                  setSelectedDate(event.target.value);
                }}
                style={{
                  width: "100%",
                  height: "40px",
                  padding: "0 12px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </Grid>

            {/* ================================
                            BOOKING SLOT
                        ================================ */}

            <Grid
              size={{
                xs: 12,
                sm: 6,
                lg: 3,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <AccessTime color="primary" fontSize="small" />

                <Typography variant="subtitle2" fontWeight={600}>
                  Booking Slot
                </Typography>
              </Stack>

              <FormControl
                fullWidth
                size="small"
                disabled={
                  loadingConfiguration || !libraryId || slots.length === 0
                }
              >
                <InputLabel>Booking Slot</InputLabel>

                <Select
                  value={slotId}
                  label="Booking Slot"
                  onChange={(event) => {
                    setSeats([]);

                    setError("");

                    setSlotId(event.target.value);
                  }}
                >
                  {slots.map((slot) => (
                    <MenuItem key={slot.id} value={String(slot.id)}>
                      {slot.name}

                      {" ("}

                      {formatTime(slot.startTime)}

                      {" - "}

                      {formatTime(slot.endTime)}

                      {")"}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* =========================================
                        CURRENT FILTER SUMMARY
                    ========================================= */}

          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: "action.hover",
              borderRadius: 2,
            }}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              spacing={{
                xs: 0.5,
                md: 2,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                <strong>Viewing:</strong>{" "}
                {selectedLibrary?.name || "No library"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Floor:</strong>{" "}
                {selectedFloor?.name ||
                  (selectedFloor
                    ? `Floor ${selectedFloor.floorNumber}`
                    : "Not selected")}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Date:</strong> {formatDate(selectedDate)}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                <strong>Slot:</strong> {selectedSlot?.name || "Not selected"}
              </Typography>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* =================================================
                SUMMARY CARDS
            ================================================= */}

      <Grid container spacing={2} mb={3}>
        {/* TOTAL */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Seats
              </Typography>

              <Typography variant="h4" fontWeight={700} mt={0.5}>
                {totalSeats}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* AVAILABLE */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                color="success.main"
                mt={0.5}
              >
                {availableSeats}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* BOOKED */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Booked
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                color="error.main"
                mt={0.5}
              >
                {bookedSeats}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* OCCUPANCY */}

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Occupancy
              </Typography>

              <Typography
                variant="h4"
                fontWeight={700}
                color="primary.main"
                mt={0.5}
              >
                {occupancyPercentage}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* =================================================
                SEAT LAYOUT
            ================================================= */}

      <Card>
        <CardContent sx={{ p: 3 }}>
          {/* =========================================
                        LAYOUT HEADER
                    ========================================= */}

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
              <Typography variant="h6" fontWeight={700}>
                Seat Availability Map
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                {selectedFloor
                  ? selectedFloor.name || `Floor ${selectedFloor.floorNumber}`
                  : "No floor selected"}

                {selectedSlot && (
                  <>
                    {" · "}
                    {selectedSlot.name}
                    {" · "}
                    {formatTime(selectedSlot.startTime)}
                    {" - "}
                    {formatTime(selectedSlot.endTime)}
                  </>
                )}
              </Typography>
            </Box>

            <Chip
              icon={<CalendarMonth />}
              label={formatDate(selectedDate)}
              variant="outlined"
            />
          </Stack>

          {/* =========================================
                        LOADING
                    ========================================= */}

          {loadingAvailability ? (
            <Box
              sx={{
                minHeight: 300,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Stack spacing={2} alignItems="center">
                <CircularProgress />

                <Typography variant="body2" color="text.secondary">
                  Loading seat availability...
                </Typography>
              </Stack>
            </Box>
          ) : !libraryId ? (
            <Alert severity="info">
              Select a library to view seat availability.
            </Alert>
          ) : !floorId ? (
            <Alert severity="info">
              No floor is available for the selected library.
            </Alert>
          ) : !slotId ? (
            <Alert severity="info">
              No active booking slot is available for the selected library.
            </Alert>
          ) : seats.length === 0 ? (
            <Alert severity="info">
              No seats were found for the selected floor.
            </Alert>
          ) : (
            <>
              {/* =================================
                                ENTRANCE
                            ================================= */}

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
                    minWidth: 280,
                    textAlign: "center",
                    bgcolor: "grey.100",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "0 0 12px 12px",
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

              {/* =================================
                                DYNAMIC SEAT ROWS
                            ================================= */}

              <Stack
                spacing={3}
                sx={{
                  overflowX: "auto",
                  pb: 2,
                }}
              >
                {seatRows.map(({ rowLabel, seats: rowSeats }) => (
                  <Stack
                    key={rowLabel}
                    direction="row"
                    alignItems="center"
                    spacing={3}
                    sx={{
                      minWidth: "max-content",
                    }}
                  >
                    {/* ROW LABEL */}

                    <Box
                      sx={{
                        width: 55,
                        flexShrink: 0,
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        Row {rowLabel}
                      </Typography>
                    </Box>

                    {/* SEATS */}

                    <Stack direction="row" spacing={1.5}>
                      {rowSeats.map((seat) => {
                        const status =
                          seat.availabilityStatus ||
                          seat.physicalStatus ||
                          "AVAILABLE";

                        const style = getSeatStyles(status);

                        return (
                          <Box
                            key={seat.seatId}
                            title={`${seat.seatNumber} · ${status.replaceAll(
                              "_",
                              " ",
                            )} · ${seat.seatType || "NORMAL"}`}
                            sx={{
                              width: 60,
                              height: 60,

                              borderRadius: 2,

                              border: "2px solid",

                              display: "flex",

                              flexDirection: "column",

                              alignItems: "center",

                              justifyContent: "center",

                              flexShrink: 0,

                              bgcolor: style.bgcolor,

                              borderColor: style.borderColor,

                              color: style.color,

                              cursor: "default",

                              transition: "all 0.2s ease",
                            }}
                          >
                            {renderSeatIcon(status)}

                            <Typography variant="caption" fontWeight={700}>
                              {seat.seatNumber}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Stack>
                  </Stack>
                ))}
              </Stack>

              {/* =================================
                                RECEPTION
                            ================================= */}

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  mt: 4,
                }}
              >
                <Box
                  sx={{
                    px: 7,
                    py: 1.5,
                    borderRadius: 2,
                    bgcolor: "grey.100",
                    border: "1px solid",
                    borderColor: "divider",
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

              {/* =================================
                                LEGEND
                            ================================= */}

              <Stack
                direction={{
                  xs: "column",
                  md: "row",
                }}
                spacing={2}
                mt={4}
                pt={3}
                borderTop="1px solid"
                borderColor="divider"
                flexWrap="wrap"
                useFlexGap
              >
                {/* AVAILABLE */}

                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: 1,
                      bgcolor: "success.light",
                      border: "2px solid",
                      borderColor: "success.main",
                    }}
                  />

                  <Typography variant="body2">Available</Typography>
                </Stack>

                {/* BOOKED */}

                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: 1,
                      bgcolor: "error.light",
                      border: "2px solid",
                      borderColor: "error.main",
                    }}
                  />

                  <Typography variant="body2">Booked</Typography>
                </Stack>

                {/* RESERVED */}

                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: 1,
                      bgcolor: "info.light",
                      border: "2px solid",
                      borderColor: "info.main",
                    }}
                  />

                  <Typography variant="body2">Reserved</Typography>
                </Stack>

                {/* GIRLS RESERVED */}

                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: 1,
                      bgcolor: "secondary.light",
                      border: "2px solid",
                      borderColor: "secondary.main",
                    }}
                  />

                  <Typography variant="body2">Reserved for Girls</Typography>
                </Stack>

                {/* MAINTENANCE */}

                <Stack direction="row" spacing={1} alignItems="center">
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: 1,
                      bgcolor: "grey.200",
                      border: "2px solid",
                      borderColor: "grey.500",
                    }}
                  />

                  <Typography variant="body2">Maintenance</Typography>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    ml: {
                      xs: 0,
                      md: "auto",
                    },
                    alignSelf: "center",
                  }}
                >
                  Availability is calculated from physical seat status and
                  active bookings for the selected date and slot.
                </Typography>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>

      {/* =================================================
                LAST UPDATED
            ================================================= */}

      {lastUpdated && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          textAlign="right"
          mt={1.5}
        >
          Last updated:{" "}
          {lastUpdated.toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          })}
        </Typography>
      )}

      {/* =================================================
                PHYSICALLY UNAVAILABLE INFORMATION
            ================================================= */}

      {unavailableSeats > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {unavailableSeats} {unavailableSeats === 1 ? "seat is" : "seats are"}{" "}
          currently unavailable because of seat configuration such as reserved
          or maintenance status.
        </Alert>
      )}
    </Box>
  );
}

export default SeatAvailability;
