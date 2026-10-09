import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import EventSeatIcon from "@mui/icons-material/EventSeat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BlockIcon from "@mui/icons-material/Block";
import GroupsIcon from "@mui/icons-material/Groups";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

import { useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import libraryOccupancyApi from "../../api/libraryOccupancyApi";

// =============================================================
// HELPERS
// =============================================================

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatPercentage = (value) => {
  return `${safeNumber(value).toFixed(1)}%`;
};

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatTime = (value) => {
  if (!value) {
    return "-";
  }

  const parts = String(value).split(":");

  const hour = Number(parts[0]);

  const minute = Number(parts[1] || 0);

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getSeatStatusLabel = (seat) => {
  if (seat?.occupancyStatus === "OCCUPIED") {
    return "Occupied";
  }

  if (seat?.occupancyStatus === "BLOCKED") {
    if (seat?.physicalStatus === "MAINTENANCE") {
      return "Maintenance";
    }

    if (seat?.physicalStatus === "RESERVED") {
      return "Reserved";
    }

    if (seat?.physicalStatus === "BOOKED") {
      return "Legacy Booked";
    }

    return "Blocked";
  }

  if (seat?.physicalStatus === "RESERVED_FOR_GIRLS") {
    return "Girls Reserved";
  }

  return "Available";
};

// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({ title, value, subtitle, icon }) {
  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid #E2E8F0",

        borderRadius: 3,

        height: "100%",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={700}
              sx={{
                mt: 0.5,
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {icon}
        </Stack>
      </CardContent>
    </Card>
  );
}

// =============================================================
// FLOOR CARD
// =============================================================

function FloorCard({ floor, selected, onClick }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        border: selected ? "2px solid" : "1px solid",

        borderColor: selected ? "primary.main" : "#E2E8F0",

        borderRadius: 3,

        cursor: "pointer",

        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
        >
          <Box>
            <Typography fontWeight={700}>
              {floor.floorName || `Floor ${floor.floorNumber}`}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {floor.occupiedSeats} occupied of {floor.totalSeats}
            </Typography>
          </Box>

          <Typography
            variant="h6"
            fontWeight={700}
            color={selected ? "primary" : "text.primary"}
          >
            {formatPercentage(floor.occupancyPercentage)}
          </Typography>
        </Stack>

        <Box
          sx={{
            mt: 2,

            height: 8,

            bgcolor: "action.hover",

            borderRadius: 99,

            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${Math.min(safeNumber(floor.occupancyPercentage), 100)}%`,

              height: "100%",

              bgcolor: "primary.main",

              borderRadius: 99,
            }}
          />
        </Box>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            mt: 1.5,
          }}
        >
          <Typography variant="caption" color="success.main">
            Available: {floor.availableSeats}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Blocked: {floor.blockedSeats}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =============================================================
// SLOT CARD
// =============================================================

function SlotCard({ slot, selected, onClick }) {
  return (
    <Card
      elevation={0}
      onClick={onClick}
      sx={{
        border: selected ? "2px solid" : "1px solid",

        borderColor: selected ? "primary.main" : "#E2E8F0",

        borderRadius: 3,

        cursor: "pointer",

        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: "primary.main",
        },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={1}>
          <Box>
            <Typography fontWeight={700}>{slot.slotName}</Typography>

            <Typography variant="caption" color="text.secondary">
              {formatTime(slot.startTime)}
              {" - "}
              {formatTime(slot.endTime)}
            </Typography>
          </Box>

          <Chip
            size="small"
            variant="outlined"
            color={selected ? "primary" : "default"}
            label={formatPercentage(slot.occupancyPercentage)}
          />
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          sx={{
            mt: 2,
          }}
        >
          <Typography variant="caption">
            {slot.occupiedSeats} occupied
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {slot.availableSeats} available
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

// =============================================================
// SEAT
// =============================================================

function SeatBox({ seat }) {
  const occupied = seat.occupancyStatus === "OCCUPIED";

  const blocked = seat.occupancyStatus === "BLOCKED";

  const girlsReserved =
    seat.physicalStatus === "RESERVED_FOR_GIRLS" && !occupied;

  let background = "success.light";

  let border = "success.main";

  let text = "success.dark";

  if (occupied) {
    background = "error.light";

    border = "error.main";

    text = "error.dark";
  } else if (blocked) {
    background = "action.disabledBackground";

    border = "text.disabled";

    text = "text.secondary";
  } else if (girlsReserved) {
    background = "secondary.light";

    border = "secondary.main";

    text = "secondary.dark";
  }

  return (
    <Tooltip
      arrow
      title={
        <Box>
          <Typography variant="body2" fontWeight={700}>
            Seat {seat.seatNumber}
          </Typography>

          <Typography variant="caption" display="block">
            Status: {getSeatStatusLabel(seat)}
          </Typography>

          <Typography variant="caption" display="block">
            Type: {seat.seatType || "-"}
          </Typography>

          {occupied && (
            <>
              <Typography variant="caption" display="block">
                Member: {seat.memberName || "-"}
              </Typography>

              <Typography variant="caption" display="block">
                Booking #{seat.bookingId}
              </Typography>
            </>
          )}
        </Box>
      }
    >
      <Box
        sx={{
          width: 54,

          height: 54,

          border: "1px solid",

          borderColor: border,

          bgcolor: background,

          color: text,

          borderRadius: 2,

          display: "flex",

          flexDirection: "column",

          alignItems: "center",

          justifyContent: "center",

          cursor: "default",

          userSelect: "none",

          transition: "transform 0.15s ease",

          "&:hover": {
            transform: "translateY(-2px)",
          },
        }}
      >
        <EventSeatIcon
          sx={{
            fontSize: 18,
          }}
        />

        <Typography variant="caption" fontWeight={700}>
          {seat.seatNumber}
        </Typography>
      </Box>
    </Tooltip>
  );
}

// =============================================================
// SEAT MAP
// =============================================================

function SeatMap({ seats }) {
  const rows = useMemo(() => {
    const map = new Map();

    seats.forEach((seat) => {
      const key = seat.rowLabel || "-";

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(seat);
    });

    return Array.from(map.entries())
      .map(([rowLabel, rowSeats]) => {
        const sorted = [...rowSeats].sort(
          (first, second) =>
            safeNumber(first.columnNumber) - safeNumber(second.columnNumber),
        );

        return {
          rowLabel,
          seats: sorted,
        };
      })
      .sort((first, second) =>
        first.rowLabel.localeCompare(second.rowLabel, undefined, {
          numeric: true,
        }),
      );
  }, [seats]);

  if (seats.length === 0) {
    return (
      <Box
        sx={{
          py: 7,

          textAlign: "center",
        }}
      >
        <EventSeatIcon
          sx={{
            fontSize: 50,

            color: "text.disabled",

            mb: 1,
          }}
        />

        <Typography fontWeight={700}>No seats configured</Typography>

        <Typography variant="body2" color="text.secondary">
          No seats are configured for this floor.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        overflowX: "auto",

        pb: 1,
      }}
    >
      <Stack
        spacing={1.5}
        sx={{
          minWidth: "fit-content",
        }}
      >
        {rows.map((row) => {
          const maxColumn = Math.max(
            ...row.seats.map((seat) => safeNumber(seat.columnNumber)),
            0,
          );

          const seatMap = new Map(
            row.seats.map((seat) => [safeNumber(seat.columnNumber), seat]),
          );

          return (
            <Stack
              key={row.rowLabel}
              direction="row"
              spacing={1.25}
              alignItems="center"
            >
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{
                  width: 26,

                  textAlign: "center",
                }}
              >
                {row.rowLabel}
              </Typography>

              {Array.from(
                {
                  length: maxColumn,
                },

                (_, index) => index + 1,
              ).map((column) => {
                const seat = seatMap.get(column);

                if (!seat) {
                  return (
                    <Box
                      key={column}
                      sx={{
                        width: 54,

                        height: 54,
                      }}
                    />
                  );
                }

                return <SeatBox key={seat.seatId} seat={seat} />;
              })}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

// =============================================================
// MAIN PAGE
// =============================================================

function Occupancy() {
  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [selectedDate, setSelectedDate] = useState(getToday());

  const [selectedSlotId, setSelectedSlotId] = useState("");

  const [selectedFloorId, setSelectedFloorId] = useState("ALL");

  const [occupancy, setOccupancy] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD LIBRARIES
  // =========================================================

  useEffect(() => {
    const loadLibraries = async () => {
      try {
        setLoading(true);

        setError("");

        const data = await libraryApi.getMyLibraries();

        const list = Array.isArray(data) ? data : [];

        setLibraries(list);

        if (list.length > 0) {
          setSelectedLibraryId(String(list[0].id));
        }
      } catch (err) {
        console.error("Failed to load libraries:", err);

        setError(getErrorMessage(err, "Failed to load libraries."));
      } finally {
        setLoading(false);
      }
    };

    loadLibraries();
  }, []);

  // =========================================================
  // LOAD OCCUPANCY
  // =========================================================

  const loadOccupancy = async (libraryId, date, slotId) => {
    if (!libraryId || !date) {
      return;
    }

    try {
      setLoading(true);

      setError("");

      const data = await libraryOccupancyApi.getOccupancy(libraryId, {
        date,

        slotId: slotId ? Number(slotId) : undefined,
      });

      setOccupancy(data);

      /*
       * Backend automatically selects the first
       * active slot when slotId is omitted.
       */
      if (data?.selectedSlotId) {
        setSelectedSlotId(String(data.selectedSlotId));
      }

      setSelectedFloorId("ALL");
    } catch (err) {
      console.error("Failed to load occupancy:", err);

      setOccupancy(null);

      setError(getErrorMessage(err, "Failed to load occupancy."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLibraryId && selectedDate) {
      /*
       * Reset slot when switching library.
       * Backend will select first active slot.
       */
      loadOccupancy(Number(selectedLibraryId), selectedDate, undefined);
    }
  }, [selectedLibraryId, selectedDate]);

  // =========================================================
  // CHANGE SLOT
  // =========================================================

  const handleSlotChange = async (slotId) => {
    setSelectedSlotId(String(slotId));

    await loadOccupancy(Number(selectedLibraryId), selectedDate, slotId);
  };

  // =========================================================
  // DATA
  // =========================================================

  const summary = occupancy?.summary || {};

  const floors = occupancy?.floors || [];

  const slots = occupancy?.slots || [];

  const seats = occupancy?.seats || [];

  const displayedSeats = useMemo(() => {
    if (selectedFloorId === "ALL") {
      return seats;
    }

    return seats.filter(
      (seat) => String(seat.floorId) === String(selectedFloorId),
    );
  }, [seats, selectedFloorId]);

  // =========================================================
  // LOADING
  // =========================================================

  if (loading && libraries.length === 0) {
    return (
      <Box
        sx={{
          minHeight: 400,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <Box>
      {/* HEADER */}

      <Stack
        direction={{
          xs: "column",

          lg: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",

          lg: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Occupancy
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Monitor seat occupancy by date, floor and booking slot.
          </Typography>
        </Box>

        <Stack
          direction={{
            xs: "column",

            sm: "row",
          }}
          spacing={1.5}
        >
          <FormControl
            size="small"
            sx={{
              minWidth: 220,
            }}
          >
            <InputLabel>Library</InputLabel>

            <Select
              value={selectedLibraryId}
              label="Library"
              onChange={(event) => {
                setSelectedSlotId("");

                setSelectedFloorId("ALL");

                setSelectedLibraryId(event.target.value);
              }}
            >
              {libraries.map((library) => (
                <MenuItem key={library.id} value={String(library.id)}>
                  {library.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            type="date"
            label="Date"
            value={selectedDate}
            onChange={(event) => {
              setSelectedSlotId("");

              setSelectedDate(event.target.value);
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* SUMMARY */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns: {
            xs: "1fr",

            sm: "repeat(2, 1fr)",

            xl: "repeat(5, 1fr)",
          },

          gap: 2,

          mb: 3,
        }}
      >
        <SummaryCard
          title="Total Seats"
          value={safeNumber(summary.totalSeats)}
          subtitle="Configured seats"
          icon={<EventSeatIcon color="primary" />}
        />

        <SummaryCard
          title="Occupied"
          value={safeNumber(summary.occupiedSeats)}
          subtitle={`${formatPercentage(
            summary.occupancyPercentage,
          )} occupancy`}
          icon={<GroupsIcon color="error" />}
        />

        <SummaryCard
          title="Available"
          value={safeNumber(summary.availableSeats)}
          subtitle={`${formatPercentage(
            summary.availabilityPercentage,
          )} available`}
          icon={<CheckCircleIcon color="success" />}
        />

        <SummaryCard
          title="Blocked"
          value={safeNumber(summary.blockedSeats)}
          subtitle="Reserved / maintenance"
          icon={<BlockIcon color="warning" />}
        />

        <SummaryCard
          title="Occupancy Rate"
          value={formatPercentage(summary.occupancyPercentage)}
          subtitle={occupancy?.selectedSlotName || "No active slot"}
          icon={<TrendingUpIcon color="info" />}
        />
      </Box>

      {/* SLOT OCCUPANCY */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",

          borderRadius: 3,

          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Slot Occupancy
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 2,
            }}
          >
            Select a booking slot to inspect its occupancy.
          </Typography>

          {slots.length === 0 ? (
            <Alert severity="info">
              No active booking slots are configured for this library.
            </Alert>
          ) : (
            <Box
              sx={{
                display: "grid",

                gridTemplateColumns: {
                  xs: "1fr",

                  sm: "repeat(2, 1fr)",

                  lg: "repeat(3, 1fr)",

                  xl: "repeat(4, 1fr)",
                },

                gap: 2,
              }}
            >
              {slots.map((slot) => (
                <SlotCard
                  key={slot.slotId}
                  slot={slot}
                  selected={String(slot.slotId) === String(selectedSlotId)}
                  onClick={() => handleSlotChange(slot.slotId)}
                />
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* FLOOR OCCUPANCY */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",

          borderRadius: 3,

          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: "column",

              sm: "row",
            }}
            justifyContent="space-between"
            spacing={2}
            sx={{
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Floor Occupancy
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Occupancy distribution across library floors.
              </Typography>
            </Box>

            <FormControl
              size="small"
              sx={{
                minWidth: 180,
              }}
            >
              <InputLabel>Seat Map Floor</InputLabel>

              <Select
                value={selectedFloorId}
                label="Seat Map Floor"
                onChange={(event) => setSelectedFloorId(event.target.value)}
              >
                <MenuItem value="ALL">All Floors</MenuItem>

                {floors.map((floor) => (
                  <MenuItem key={floor.floorId} value={String(floor.floorId)}>
                    {floor.floorName || `Floor ${floor.floorNumber}`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "1fr",

                md: "repeat(2, 1fr)",

                xl: "repeat(3, 1fr)",
              },

              gap: 2,
            }}
          >
            {floors.map((floor) => (
              <FloorCard
                key={floor.floorId}
                floor={floor}
                selected={String(selectedFloorId) === String(floor.floorId)}
                onClick={() => setSelectedFloorId(String(floor.floorId))}
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* SEAT MAP */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid #E2E8F0",

          borderRadius: 3,
        }}
      >
        <CardContent>
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
              <Typography variant="h6" fontWeight={700}>
                Seat Occupancy Map
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {occupancy?.selectedSlotName
                  ? `${occupancy.selectedSlotName} · ${selectedDate}`
                  : selectedDate}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                size="small"
                label="Available"
                color="success"
                variant="outlined"
              />

              <Chip
                size="small"
                label="Occupied"
                color="error"
                variant="outlined"
              />

              <Chip
                size="small"
                label="Girls Reserved"
                color="secondary"
                variant="outlined"
              />

              <Chip size="small" label="Blocked" variant="outlined" />
            </Stack>
          </Stack>

          {loading ? (
            <Box
              sx={{
                minHeight: 250,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <SeatMap seats={displayedSeats} />
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Occupancy;
