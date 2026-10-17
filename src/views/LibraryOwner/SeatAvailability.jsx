import {
  AccessTime,
  CalendarMonth,
  CheckCircle,
  DoorFrontOutlined,
  EventSeat,
  Lock,
  MeetingRoomOutlined,
  Refresh,
  StarRounded,
  WomanOutlined,
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
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import seatApi from "../../api/seatApi";
import slotApi from "../../api/slotApi";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const getToday = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (date) => {
  if (!date) return "";

  return new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time) => {
  if (!time) return "";
  return String(time).substring(0, 5);
};

const getErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data;

  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }

  return responseData?.message || responseData?.error || error?.message || fallback;
};

const normalizeRow = (value) =>
  String(value || "")
    .trim()
    .toUpperCase();

const positionKey = (rowLabel, columnNumber) =>
  `${normalizeRow(rowLabel)}:${Number(columnNumber)}`;

const getRowLabel = (index) => String.fromCharCode(65 + index);

const getStoredOwnerLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);
  if (!value) return null;

  const id = Number(value);
  return Number.isFinite(id) ? id : null;
};

const storeOwnerLibraryId = (libraryId) => {
  const id = Number(libraryId);
  if (!Number.isFinite(id)) return;
  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
};

const hasRestriction = (seat, restriction) =>
  Array.isArray(seat?.restrictions) && seat.restrictions.includes(restriction);

const featureLabel = (feature) =>
  String(feature || "")
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

function LayoutMarker({ type }) {
  const entrance = type === "ENTRANCE";

  return (
    <Box
      sx={{
        px: 2.25,
        py: 1,
        borderRadius: 999,
        border: "1px solid",
        borderColor: entrance ? "primary.light" : "divider",
        bgcolor: entrance ? "primary.50" : "grey.50",
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        boxShadow: "0 6px 18px rgba(15,23,42,0.05)",
      }}
    >
      {entrance ? (
        <DoorFrontOutlined sx={{ fontSize: 18, color: "primary.main" }} />
      ) : (
        <MeetingRoomOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
      )}

      <Typography variant="caption" fontWeight={800} letterSpacing={0.4}>
        {entrance ? "ENTRANCE" : "RECEPTION"}
      </Typography>
    </Box>
  );
}

function MetricCard({ label, value, helper, icon, tone = "primary" }) {
  const theme = useTheme();
  const palette = theme.palette[tone] || theme.palette.primary;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        borderRadius: 3.5,
        borderColor: alpha(palette.main, 0.16),
        boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
        background: `linear-gradient(135deg, ${alpha(palette.main, 0.045)}, #fff 54%)`,
      }}
    >
      <CardContent sx={{ p: 2.6 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.6,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(palette.main, 0.09),
              color: palette.main,
              flexShrink: 0,
            }}
          >
            {icon}
          </Box>

          <Box minWidth={0}>
            <Typography variant="body2" color="text.secondary" fontWeight={650}>
              {label}
            </Typography>

            <Typography variant="h5" fontWeight={850} sx={{ lineHeight: 1.2, mt: 0.2 }}>
              {value}
            </Typography>

            {helper && (
              <Typography variant="caption" color="text.secondary">
                {helper}
              </Typography>
            )}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SeatAvailability() {
  const theme = useTheme();
  const today = useMemo(() => getToday(), []);

  const [selectedDate, setSelectedDate] = useState(today);

  const [libraries, setLibraries] = useState([]);
  const [libraryId, setLibraryId] = useState("");

  const [floors, setFloors] = useState([]);
  const [floorId, setFloorId] = useState("");

  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState("");

  const [seats, setSeats] = useState([]);

  // Canonical physical layout from the updated Seat Mapping module.
  const [floorLayout, setFloorLayout] = useState(null);

  const [loadingLibraries, setLoadingLibraries] = useState(true);
  const [loadingConfiguration, setLoadingConfiguration] = useState(false);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [loadingLayout, setLoadingLayout] = useState(false);

  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const selectedLibrary = useMemo(
    () => libraries.find((library) => String(library.id) === String(libraryId)) || null,
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

  useEffect(() => {
    let active = true;

    const loadLibraries = async () => {
      try {
        setLoadingLibraries(true);
        setError("");

        const data = await libraryApi.getMyLibraries();
        if (!active) return;

        const normalizedLibraries = Array.isArray(data) ? data : [];
        setLibraries(normalizedLibraries);

        if (normalizedLibraries.length === 0) {
          setLibraryId("");
          setError("No library found for this account.");
          return;
        }

        const storedId = getStoredOwnerLibraryId();
        const storedExists = normalizedLibraries.some(
          (library) => Number(library.id) === Number(storedId),
        );

        const nextLibraryId = storedExists
          ? String(storedId)
          : String(normalizedLibraries[0].id);

        setLibraryId(nextLibraryId);
        storeOwnerLibraryId(nextLibraryId);
      } catch (err) {
        if (!active) return;
        console.error("Failed to load owner libraries:", err);
        setLibraries([]);
        setLibraryId("");
        setError(getErrorMessage(err, "Unable to load your libraries."));
      } finally {
        if (active) setLoadingLibraries(false);
      }
    };

    loadLibraries();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadConfiguration = async () => {
      if (!libraryId) {
        setFloors([]);
        setSlots([]);
        setFloorId("");
        setSlotId("");
        setSeats([]);
        setFloorLayout(null);
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
        setFloorLayout(null);

        const [floorData, slotData] = await Promise.all([
          seatApi.getFloors(libraryId),
          slotApi.getActiveSlots(libraryId),
        ]);

        if (!active) return;

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
          setError("No active booking slot has been configured for this library.");
        }
      } catch (err) {
        if (!active) return;
        console.error("Failed to load seat availability configuration:", err);
        setFloors([]);
        setSlots([]);
        setFloorId("");
        setSlotId("");
        setSeats([]);
        setFloorLayout(null);
        setError(getErrorMessage(err, "Unable to load floors and booking slots."));
      } finally {
        if (active) setLoadingConfiguration(false);
      }
    };

    loadConfiguration();

    return () => {
      active = false;
    };
  }, [libraryId]);

  const loadFloorLayout = useCallback(async () => {
    if (!libraryId || !floorId) {
      setFloorLayout(null);
      return;
    }

    try {
      setLoadingLayout(true);

      const data = await seatApi.getFloorLayout(libraryId, floorId);
      setFloorLayout(data || null);
    } catch (err) {
      console.error("Failed to load physical floor layout:", err);
      setFloorLayout(null);
      setError(
        getErrorMessage(
          err,
          "Unable to load the physical floor layout from Seat Mapping.",
        ),
      );
    } finally {
      setLoadingLayout(false);
    }
  }, [libraryId, floorId]);

  useEffect(() => {
    loadFloorLayout();
  }, [loadFloorLayout]);

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

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const handleRefresh = async () => {
    setError("");
    await Promise.all([loadFloorLayout(), loadAvailability()]);
  };

  const totalSeats = seats.length;

  const availableSeats = useMemo(
    () => seats.filter((seat) => seat.availabilityStatus === "AVAILABLE").length,
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

  const premiumSeats = useMemo(
    () => seats.filter((seat) => seat.seatType === "PREMIUM").length,
    [seats],
  );

  const femaleOnlySeats = useMemo(
    () => seats.filter((seat) => hasRestriction(seat, "FEMALE_ONLY")).length,
    [seats],
  );

  const occupancyPercentage =
    totalSeats > 0 ? Math.round((bookedSeats / totalSeats) * 100) : 0;

  const availabilityByPosition = useMemo(() => {
    const map = new Map();

    seats.forEach((seat) => {
      map.set(positionKey(seat.rowLabel, seat.columnNumber), seat);
    });

    return map;
  }, [seats]);

  const gapKeys = useMemo(() => {
    const set = new Set();

    (floorLayout?.gaps || []).forEach((gap) => {
      set.add(positionKey(gap.rowLabel, gap.columnNumber));
    });

    return set;
  }, [floorLayout]);

  const fallbackMaxRowIndex = useMemo(() => {
    return seats.reduce((max, seat) => {
      const row = normalizeRow(seat.rowLabel);
      if (!/^[A-Z]$/.test(row)) return max;
      return Math.max(max, row.charCodeAt(0) - 64);
    }, 0);
  }, [seats]);

  const fallbackMaxColumn = useMemo(
    () => seats.reduce((max, seat) => Math.max(max, Number(seat.columnNumber) || 0), 0),
    [seats],
  );

  const rowCount = Math.max(Number(floorLayout?.rowCount) || 0, fallbackMaxRowIndex);
  const columnCount = Math.max(
    Number(floorLayout?.columnCount) || 0,
    fallbackMaxColumn,
  );

  const entrancePosition = floorLayout?.entrancePosition || "NONE";
  const receptionPosition = floorLayout?.receptionPosition || "NONE";

  const getSeatStyles = (seat) => {
    const status = seat?.availabilityStatus || seat?.physicalStatus || "AVAILABLE";

    switch (status) {
      case "BOOKED":
        return {
          bg: alpha(theme.palette.error.main, 0.08),
          border: alpha(theme.palette.error.main, 0.32),
          color: theme.palette.error.main,
        };

      case "RESERVED":
        return {
          bg: alpha(theme.palette.info.main, 0.08),
          border: alpha(theme.palette.info.main, 0.28),
          color: theme.palette.info.main,
        };

      case "MAINTENANCE":
        return {
          bg: theme.palette.grey[100],
          border: theme.palette.grey[300],
          color: theme.palette.grey[600],
        };

      case "AVAILABLE":
      default:
        return {
          bg: alpha(theme.palette.success.main, 0.08),
          border: alpha(theme.palette.success.main, 0.28),
          color: theme.palette.success.main,
        };
    }
  };

  const renderSeatIcon = (seat) => {
    const status = seat?.availabilityStatus || seat?.physicalStatus || "AVAILABLE";

    if (status === "MAINTENANCE" || status === "RESERVED") {
      return <Lock sx={{ fontSize: 17 }} />;
    }

    return <EventSeat sx={{ fontSize: 18 }} />;
  };

  const renderTopMarkers = () => {
    const columns = ["LEFT", "CENTER", "RIGHT"];

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          alignItems: "center",
          mb: 3,
          minHeight: 38,
        }}
      >
        {columns.map((column) => {
          const align =
            column === "LEFT"
              ? "flex-start"
              : column === "CENTER"
                ? "center"
                : "flex-end";

          const items = [];

          if (entrancePosition === `TOP_${column}`) {
            items.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
          }

          if (receptionPosition === `TOP_${column}`) {
            items.push(<LayoutMarker key="reception" type="RECEPTION" />);
          }

          return (
            <Stack key={column} direction="row" spacing={1} justifyContent={align}>
              {items}
            </Stack>
          );
        })}
      </Box>
    );
  };

  const renderBottomMarkers = () => {
    const columns = ["LEFT", "CENTER", "RIGHT"];

    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          alignItems: "center",
          mt: 3,
          minHeight: 38,
        }}
      >
        {columns.map((column) => {
          const align =
            column === "LEFT"
              ? "flex-start"
              : column === "CENTER"
                ? "center"
                : "flex-end";

          const items = [];

          if (entrancePosition === `BOTTOM_${column}`) {
            items.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
          }

          if (receptionPosition === `BOTTOM_${column}`) {
            items.push(<LayoutMarker key="reception" type="RECEPTION" />);
          }

          return (
            <Stack key={column} direction="row" spacing={1} justifyContent={align}>
              {items}
            </Stack>
          );
        })}
      </Box>
    );
  };

  const renderSideMarker = (side, rowIndex) => {
    const verticalTarget = Math.max(1, Math.ceil(rowCount / 2));
    if (rowIndex + 1 !== verticalTarget) return null;

    const position = side === "LEFT" ? "LEFT_CENTER" : "RIGHT_CENTER";
    const items = [];

    if (entrancePosition === position) {
      items.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
    }

    if (receptionPosition === position) {
      items.push(<LayoutMarker key="reception" type="RECEPTION" />);
    }

    if (items.length === 0) return null;

    return (
      <Stack spacing={0.75} alignItems={side === "LEFT" ? "flex-start" : "flex-end"}>
        {items}
      </Stack>
    );
  };

  if (loadingLibraries) {
    return (
      <Box
        sx={{
          minHeight: 380,
          display: "grid",
          placeItems: "center",
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

  return (
    <Box sx={{ pb: 4 }}>
      {/* Premium light header aligned with Seat Mapping */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 4,
          overflow: "hidden",
          borderColor: alpha(theme.palette.primary.main, 0.13),
          background: `linear-gradient(120deg, ${alpha(
            theme.palette.primary.main,
            0.07,
          )} 0%, #ffffff 55%, ${alpha(theme.palette.info.main, 0.04)} 100%)`,
          boxShadow: "0 14px 42px rgba(15,23,42,0.055)",
          position: "relative",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            right: -50,
            top: -80,
            bgcolor: alpha(theme.palette.primary.main, 0.045),
          }}
        />

        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2.5}
          >
            <Stack direction="row" spacing={2.2} alignItems="center">
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: `0 12px 26px ${alpha(theme.palette.primary.main, 0.22)}`,
                  flexShrink: 0,
                }}
              >
                <EventSeat sx={{ fontSize: 30 }} />
              </Box>

              <Box>
                <Typography variant="h4" fontWeight={850} letterSpacing={-0.5}>
                  Seat Availability
                </Typography>

                <Typography color="text.secondary" sx={{ mt: 0.4, maxWidth: 780 }}>
                  Live seat occupancy over the exact physical floor layout configured in Seat Mapping.
                </Typography>

                {selectedLibrary && (
                  <Chip
                    size="small"
                    label={selectedLibrary.name}
                    variant="outlined"
                    sx={{ mt: 1.4, fontWeight: 700, bgcolor: "common.white" }}
                  />
                )}
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={
                loadingAvailability || loadingLayout ? (
                  <CircularProgress size={16} />
                ) : (
                  <Refresh />
                )
              }
              onClick={handleRefresh}
              disabled={
                loadingAvailability ||
                loadingLayout ||
                loadingConfiguration ||
                !libraryId ||
                !floorId ||
                !slotId
              }
              sx={{
                minWidth: 130,
                minHeight: 46,
                borderRadius: 2.5,
                fontWeight: 800,
                bgcolor: "common.white",
              }}
            >
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" onClose={() => setError("")} sx={{ mb: 3, borderRadius: 2.5 }}>
          {error}
        </Alert>
      )}

      {/* Filter / context bar */}
      <Card
        variant="outlined"
        sx={{
          mb: 3,
          borderRadius: 3.5,
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <FormControl fullWidth size="small" disabled={libraries.length === 0}>
                <InputLabel>Library</InputLabel>
                <Select
                  value={libraryId}
                  label="Library"
                  onChange={(event) => {
                    const nextLibraryId = event.target.value;
                    storeOwnerLibraryId(nextLibraryId);
                    setFloorId("");
                    setSlotId("");
                    setFloors([]);
                    setSlots([]);
                    setSeats([]);
                    setFloorLayout(null);
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

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <FormControl
                fullWidth
                size="small"
                disabled={loadingConfiguration || !libraryId || floors.length === 0}
              >
                <InputLabel>Floor</InputLabel>
                <Select
                  value={floorId}
                  label="Floor"
                  onChange={(event) => {
                    setSeats([]);
                    setFloorLayout(null);
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

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box
                sx={{
                  height: 40,
                  px: 1.4,
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1.5,
                  bgcolor: "common.white",
                }}
              >
                <CalendarMonth sx={{ mr: 1, fontSize: 19, color: "primary.main" }} />
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
                    border: 0,
                    outline: 0,
                    width: "100%",
                    background: "transparent",
                    font: "inherit",
                    color: "inherit",
                  }}
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <FormControl
                fullWidth
                size="small"
                disabled={loadingConfiguration || !libraryId || slots.length === 0}
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
                      {slot.name} ({formatTime(slot.startTime)} - {formatTime(slot.endTime)})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{ mt: 2 }}
          >
            <Chip size="small" label={selectedFloor?.name || "No floor selected"} variant="outlined" />
            <Chip size="small" icon={<CalendarMonth />} label={formatDate(selectedDate)} variant="outlined" />
            <Chip
              size="small"
              icon={<AccessTime />}
              label={
                selectedSlot
                  ? `${selectedSlot.name} · ${formatTime(selectedSlot.startTime)} - ${formatTime(
                      selectedSlot.endTime,
                    )}`
                  : "No slot selected"
              }
              variant="outlined"
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <MetricCard
            label="Total Seats"
            value={totalSeats}
            helper="Mapped on this floor"
            icon={<EventSeat />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <MetricCard
            label="Available"
            value={availableSeats}
            helper="Ready for booking"
            icon={<CheckCircle />}
            tone="success"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <MetricCard
            label="Booked"
            value={bookedSeats}
            helper={`${occupancyPercentage}% occupancy`}
            icon={<Lock />}
            tone="error"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <MetricCard
            label="Premium"
            value={premiumSeats}
            helper="Premium seat category"
            icon={<StarRounded />}
            tone="warning"
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
          <MetricCard
            label="Female Only"
            value={femaleOnlySeats}
            helper="Restriction, not seat type"
            icon={<WomanOutlined />}
            tone="secondary"
          />
        </Grid>
      </Grid>

      {/* Physical floor layout + dynamic availability */}
      <Card
        variant="outlined"
        sx={{
          borderRadius: 4,
          borderColor: alpha(theme.palette.primary.main, 0.12),
          boxShadow: "0 16px 45px rgba(15,23,42,0.05)",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            mb={3}
          >
            <Box>
              <Typography variant="h6" fontWeight={850}>
                Live Floor Map
              </Typography>

              <Typography variant="body2" color="text.secondary" mt={0.35}>
                Uses the exact rows, columns, aisles, entrance and reception saved in Seat Mapping.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                size="small"
                variant="outlined"
                label={`${rowCount} rows × ${columnCount} columns`}
              />

              <Chip
                size="small"
                variant="outlined"
                label={`${floorLayout?.gaps?.length || 0} spaces / aisles`}
              />

              {lastUpdated && (
                <Chip
                  size="small"
                  variant="outlined"
                  label={`Updated ${lastUpdated.toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}`}
                />
              )}
            </Stack>
          </Stack>

          {loadingAvailability || loadingLayout ? (
            <Box sx={{ minHeight: 340, display: "grid", placeItems: "center" }}>
              <Stack spacing={2} alignItems="center">
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  Loading live floor availability...
                </Typography>
              </Stack>
            </Box>
          ) : !libraryId ? (
            <Alert severity="info">Select a library to view seat availability.</Alert>
          ) : !floorId ? (
            <Alert severity="info">No floor is available for the selected library.</Alert>
          ) : !slotId ? (
            <Alert severity="info">No active booking slot is available for the selected library.</Alert>
          ) : rowCount <= 0 || columnCount <= 0 ? (
            <Alert severity="info">
              This floor does not have a configured Seat Mapping layout yet.
            </Alert>
          ) : (
            <Box
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3.2,
                bgcolor: alpha(theme.palette.primary.main, 0.012),
                p: { xs: 1.5, md: 2.5 },
                overflowX: "auto",
              }}
            >
              {renderTopMarkers()}

              <Stack spacing={1.5} sx={{ minWidth: "max-content" }}>
                {Array.from({ length: rowCount }).map((_, rowIndex) => {
                  const rowLabel = getRowLabel(rowIndex);

                  return (
                    <Box
                      key={rowLabel}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: `64px repeat(${columnCount}, 72px) 64px`,
                        gap: 1.15,
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 64,
                          borderRadius: 2.4,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(theme.palette.primary.main, 0.065),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.primary.main, 0.12),
                          color: "primary.main",
                          fontWeight: 900,
                          position: "relative",
                        }}
                      >
                        <Typography variant="subtitle2" fontWeight={900}>
                          {rowLabel}
                        </Typography>
                        {renderSideMarker("LEFT", rowIndex)}
                      </Box>

                      {Array.from({ length: columnCount }).map((__, columnIndex) => {
                        const columnNumber = columnIndex + 1;
                        const key = positionKey(rowLabel, columnNumber);
                        const seat = availabilityByPosition.get(key);
                        const isGap = gapKeys.has(key);

                        if (isGap) {
                          return (
                            <Tooltip key={key} title="Aisle / intentionally empty space">
                              <Box
                                sx={{
                                  width: 72,
                                  height: 64,
                                  flexShrink: 0,
                                }}
                              />
                            </Tooltip>
                          );
                        }

                        if (!seat) {
                          return (
                            <Box
                              key={key}
                              sx={{
                                width: 72,
                                height: 64,
                                flexShrink: 0,
                              }}
                            />
                          );
                        }

                        const style = getSeatStyles(seat);
                        const status =
                          seat.availabilityStatus || seat.physicalStatus || "AVAILABLE";
                        const femaleOnly = hasRestriction(seat, "FEMALE_ONLY");
                        const premium = seat.seatType === "PREMIUM";
                        const features = Array.isArray(seat.features) ? seat.features : [];

                        const tooltip = (
                          <Box sx={{ p: 0.5 }}>
                            <Typography variant="subtitle2" fontWeight={800}>
                              Seat {seat.seatNumber}
                            </Typography>
                            <Typography variant="caption" display="block">
                              {status.replaceAll("_", " ")} · {seat.seatType || "NORMAL"}
                            </Typography>
                            {features.length > 0 && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.4 }}>
                                {features.map(featureLabel).join(" · ")}
                              </Typography>
                            )}
                            {femaleOnly && (
                              <Typography variant="caption" display="block" sx={{ mt: 0.4 }}>
                                Female only
                              </Typography>
                            )}
                          </Box>
                        );

                        return (
                          <Tooltip key={seat.seatId ?? key} title={tooltip} arrow>
                            <Box
                              sx={{
                                width: 70,
                                height: 64,
                                borderRadius: 2.7,
                                border: "1.5px solid",
                                borderColor: style.border,
                                bgcolor: style.bg,
                                color: style.color,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                position: "relative",
                                transition: "transform 160ms ease, box-shadow 160ms ease",
                                boxShadow: "0 4px 12px rgba(15,23,42,0.025)",
                                "&:hover": {
                                  transform: "translateY(-2px)",
                                  boxShadow: "0 9px 20px rgba(15,23,42,0.09)",
                                },
                              }}
                            >
                              {premium && (
                                <StarRounded
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    fontSize: 13,
                                    color: "warning.main",
                                  }}
                                />
                              )}

                              {femaleOnly && (
                                <WomanOutlined
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    left: 4,
                                    fontSize: 13,
                                    color: "secondary.main",
                                  }}
                                />
                              )}

                              {renderSeatIcon(seat)}

                              <Typography variant="caption" fontWeight={850} sx={{ mt: 0.15 }}>
                                {seat.seatNumber}
                              </Typography>
                            </Box>
                          </Tooltip>
                        );
                      })}

                      <Box sx={{ pl: 0.5 }}>{renderSideMarker("RIGHT", rowIndex)}</Box>
                    </Box>
                  );
                })}
              </Stack>

              {renderBottomMarkers()}
            </Box>
          )}

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            useFlexGap
            flexWrap="wrap"
            mt={3}
            pt={2.5}
            borderTop="1px solid"
            borderColor="divider"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            {[
              ["Available", theme.palette.success.main, alpha(theme.palette.success.main, 0.08)],
              ["Booked", theme.palette.error.main, alpha(theme.palette.error.main, 0.08)],
              ["Reserved", theme.palette.info.main, alpha(theme.palette.info.main, 0.08)],
              ["Maintenance", theme.palette.grey[500], theme.palette.grey[100]],
            ].map(([label, border, bg]) => (
              <Stack key={label} direction="row" spacing={0.8} alignItems="center">
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: 1,
                    border: "1.5px solid",
                    borderColor: border,
                    bgcolor: bg,
                  }}
                />
                <Typography variant="body2">{label}</Typography>
              </Stack>
            ))}

            <Stack direction="row" spacing={0.8} alignItems="center">
              <StarRounded sx={{ fontSize: 17, color: "warning.main" }} />
              <Typography variant="body2">Premium</Typography>
            </Stack>

            <Stack direction="row" spacing={0.8} alignItems="center">
              <WomanOutlined sx={{ fontSize: 17, color: "secondary.main" }} />
              <Typography variant="body2">Female Only</Typography>
            </Stack>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: { xs: 0, md: "auto" }, maxWidth: 520 }}
            >
              Occupancy comes from active bookings for the selected date and slot. Physical
              placement, gaps and markers come from Seat Mapping.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      {unavailableSeats > 0 && (
        <Alert severity="info" sx={{ mt: 2, borderRadius: 2.5 }}>
          {unavailableSeats} {unavailableSeats === 1 ? "seat is" : "seats are"} currently
          unavailable because of physical seat configuration such as reserved or maintenance
          status.
        </Alert>
      )}
    </Box>
  );
}

export default SeatAvailability;
