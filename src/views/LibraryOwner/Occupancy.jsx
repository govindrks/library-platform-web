import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  BlockRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  EventSeatRounded,
  GroupsRounded,
  RefreshRounded,
  TodayRounded,
  TrendingUpRounded,
  WarningAmberRounded,
  WomanRounded,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";
import libraryOccupancyApi from "../../api/libraryOccupancyApi";

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const formatPercentage = (value) => `${safeNumber(value).toFixed(1)}%`;

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.response?.data?.detail ||
  error?.message ||
  fallback;

const getToday = () => {
  const date = new Date();

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, "0");

  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDateLabel = (value) => {
  if (!value) {
    return "—";
  }

  const [year, month, day] = String(value).split("-").map(Number);

  if (!year || !month || !day) {
    return value;
  }

  const date = new Date(year, month - 1, day);

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) {
    return "—";
  }

  const parts = String(value).split(":");

  const hour = Number(parts[0]);

  const minute = Number(parts[1] || 0);

  if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
    return value;
  }

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStoredLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
};

const storeLibraryId = (libraryId) => {
  const id = Number(libraryId);

  if (!Number.isFinite(id)) {
    return;
  }

  localStorage.setItem(OWNER_SELECTED_LIBRARY_KEY, String(id));
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

function SummaryCard({ title, value, subtitle, icon, emphasis = false }) {
  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: emphasis ? "primary.main" : "divider",
        borderRadius: 3.2,
        background: emphasis
          ? "linear-gradient(145deg, rgba(79,70,229,0.08), rgba(255,255,255,0.98))"
          : "background.paper",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 28px rgba(15,23,42,0.08)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.4,
          "&:last-child": {
            pb: 2.4,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography variant="body2" color="text.secondary" fontWeight={700}>
              {title}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                mt: 0.55,
                letterSpacing: "-0.03em",
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

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: emphasis ? "primary.main" : "rgba(79,70,229,0.08)",
              color: emphasis ? "primary.contrastText" : "primary.main",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function FloorCard({ floor, selected, onClick }) {
  const occupancyPercentage = Math.min(
    safeNumber(floor.occupancyPercentage),
    100,
  );

  return (
    <Card
      elevation={0}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 3,
        cursor: "pointer",
        background: selected
          ? "linear-gradient(145deg, rgba(79,70,229,0.06), #fff)"
          : "background.paper",
        boxShadow: selected ? "0 12px 28px rgba(79,70,229,0.08)" : "none",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "primary.light",
          boxShadow: "0 10px 24px rgba(15,23,42,0.07)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.3,
          "&:last-child": {
            pb: 2.3,
          },
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1.5}
        >
          <Box>
            <Typography fontWeight={800}>
              {floor.floorName || `Floor ${floor.floorNumber}`}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              {floor.occupiedSeats} occupied of {floor.totalSeats}
            </Typography>
          </Box>

          <Chip
            size="small"
            color={selected ? "primary" : "default"}
            variant={selected ? "filled" : "outlined"}
            label={formatPercentage(floor.occupancyPercentage)}
          />
        </Stack>

        <LinearProgress
          variant="determinate"
          value={occupancyPercentage}
          sx={{
            mt: 2,
            height: 7,
            borderRadius: 999,
          }}
        />

        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={1}
          sx={{
            mt: 1.6,
          }}
        >
          <Typography variant="caption" color="success.main" fontWeight={700}>
            Available {floor.availableSeats}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Blocked {floor.blockedSeats}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SlotCard({ slot, selected, onClick }) {
  const occupancyPercentage = Math.min(
    safeNumber(slot.occupancyPercentage),
    100,
  );

  return (
    <Card
      elevation={0}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick?.();
        }
      }}
      sx={{
        height: "100%",
        border: "1px solid",
        borderColor: selected ? "primary.main" : "divider",
        borderRadius: 3,
        cursor: "pointer",
        background: selected
          ? "linear-gradient(145deg, rgba(79,70,229,0.06), #fff)"
          : "background.paper",
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: "primary.light",
          boxShadow: "0 10px 24px rgba(15,23,42,0.07)",
        },
      }}
    >
      <CardContent
        sx={{
          p: 2.3,
          "&:last-child": {
            pb: 2.3,
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Box>
            <Typography fontWeight={800}>{slot.slotName}</Typography>

            <Typography variant="caption" color="text.secondary">
              {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
            </Typography>
          </Box>

          {selected && <CheckCircleRounded color="primary" fontSize="small" />}
        </Stack>

        <LinearProgress
          variant="determinate"
          value={occupancyPercentage}
          sx={{
            mt: 2,
            height: 7,
            borderRadius: 999,
          }}
        />

        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={1}
          sx={{
            mt: 1.6,
          }}
        >
          <Typography variant="caption" fontWeight={700}>
            {slot.occupiedSeats} occupied
          </Typography>

          <Typography variant="caption" color="success.main" fontWeight={700}>
            {slot.availableSeats} available
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

function SeatBox({ seat }) {
  const occupied = seat.occupancyStatus === "OCCUPIED";

  const blocked = seat.occupancyStatus === "BLOCKED";

  const girlsReserved =
    seat.physicalStatus === "RESERVED_FOR_GIRLS" && !occupied;

  let background = "rgba(34,197,94,0.10)";

  let border = "success.main";

  let text = "success.dark";

  if (occupied) {
    background = "rgba(239,68,68,0.10)";

    border = "error.main";

    text = "error.dark";
  } else if (blocked) {
    background = "rgba(100,116,139,0.10)";

    border = "text.disabled";

    text = "text.secondary";
  } else if (girlsReserved) {
    background = "rgba(168,85,247,0.10)";

    border = "secondary.main";

    text = "secondary.dark";
  }

  return (
    <Tooltip
      arrow
      title={
        <Box
          sx={{
            minWidth: 160,
          }}
        >
          <Typography variant="body2" fontWeight={800}>
            Seat {seat.seatNumber}
          </Typography>

          <Typography variant="caption" display="block">
            Status: {getSeatStatusLabel(seat)}
          </Typography>

          <Typography variant="caption" display="block">
            Type: {seat.seatType || "—"}
          </Typography>

          {occupied && (
            <>
              <Divider
                sx={{
                  my: 1,
                  borderColor: "rgba(255,255,255,0.18)",
                }}
              />

              <Typography variant="caption" display="block">
                Member: {seat.memberName || "—"}
              </Typography>

              {seat.bookingId && (
                <Typography variant="caption" display="block">
                  Booking #{seat.bookingId}
                </Typography>
              )}
            </>
          )}
        </Box>
      }
    >
      <Box
        sx={{
          width: 58,
          height: 58,
          border: "1px solid",
          borderColor: border,
          bgcolor: background,
          color: text,
          borderRadius: 2.2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          userSelect: "none",
          transition: "all 0.15s ease",
          boxShadow: "0 4px 12px rgba(15,23,42,0.04)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 8px 18px rgba(15,23,42,0.10)",
          },
        }}
      >
        {girlsReserved ? (
          <WomanRounded
            sx={{
              fontSize: 18,
            }}
          />
        ) : (
          <EventSeatRounded
            sx={{
              fontSize: 18,
            }}
          />
        )}

        <Typography variant="caption" fontWeight={800}>
          {seat.seatNumber}
        </Typography>
      </Box>
    </Tooltip>
  );
}

function SeatMap({ seats }) {
  const rows = useMemo(() => {
    const map = new Map();

    seats.forEach((seat) => {
      const key = seat.rowLabel || "—";

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key).push(seat);
    });

    return Array.from(map.entries())
      .map(([rowLabel, rowSeats]) => ({
        rowLabel,
        seats: [...rowSeats].sort(
          (first, second) =>
            safeNumber(first.columnNumber) - safeNumber(second.columnNumber),
        ),
      }))
      .sort((first, second) =>
        String(first.rowLabel).localeCompare(
          String(second.rowLabel),
          undefined,
          {
            numeric: true,
          },
        ),
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
        <Box
          sx={{
            width: 66,
            height: 66,
            mx: "auto",
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "rgba(79,70,229,0.07)",
            color: "primary.main",
          }}
        >
          <EventSeatRounded
            sx={{
              fontSize: 34,
            }}
          />
        </Box>

        <Typography
          fontWeight={800}
          sx={{
            mt: 1.5,
          }}
        >
          No seats configured
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.4,
          }}
        >
          No seats are configured for this floor or selection.
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
        spacing={1.35}
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
              spacing={1.15}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "rgba(15,23,42,0.045)",
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2" fontWeight={800}>
                  {row.rowLabel}
                </Typography>
              </Box>

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
                        width: 58,
                        height: 58,
                      }}
                    />
                  );
                }

                return (
                  <SeatBox
                    key={seat.seatId || seat.id || `${row.rowLabel}-${column}`}
                    seat={seat}
                  />
                );
              })}
            </Stack>
          );
        })}
      </Stack>
    </Box>
  );
}

function Occupancy() {
  const [libraries, setLibraries] = useState([]);

  const [selectedLibraryId, setSelectedLibraryId] = useState("");

  const [selectedDate, setSelectedDate] = useState(getToday());

  const [selectedSlotId, setSelectedSlotId] = useState("");

  const [selectedFloorId, setSelectedFloorId] = useState("ALL");

  const [occupancy, setOccupancy] = useState(null);

  const [librariesLoading, setLibrariesLoading] = useState(true);

  const [occupancyLoading, setOccupancyLoading] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const loadLibraries = useCallback(async () => {
    try {
      setLibrariesLoading(true);
      setError("");

      const data = await libraryApi.getMyLibraries();

      const list = Array.isArray(data) ? data : [];

      setLibraries(list);

      if (list.length > 0) {
        const storedLibraryId = getStoredLibraryId();

        const storedLibrary =
          storedLibraryId != null
            ? list.find(
                (library) => Number(library.id) === Number(storedLibraryId),
              )
            : null;

        const nextLibrary = storedLibrary || list[0];

        const nextId = String(nextLibrary.id);

        setSelectedLibraryId((current) => current || nextId);

        storeLibraryId(nextId);
      }
    } catch (err) {
      console.error("Failed to load libraries:", err);

      setLibraries([]);

      setError(getErrorMessage(err, "Failed to load libraries."));
    } finally {
      setLibrariesLoading(false);
    }
  }, []);

  const loadOccupancy = useCallback(
    async (libraryId, date, slotId, { showRefresh = false } = {}) => {
      if (!libraryId || !date) {
        return;
      }

      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setOccupancyLoading(true);
        }

        setError("");

        const data = await libraryOccupancyApi.getOccupancy(libraryId, {
          date,
          slotId: slotId ? Number(slotId) : undefined,
        });

        setOccupancy(data);

        if (data?.selectedSlotId) {
          setSelectedSlotId(String(data.selectedSlotId));
        }

        setSelectedFloorId("ALL");
      } catch (err) {
        console.error("Failed to load occupancy:", err);

        setOccupancy(null);

        setError(getErrorMessage(err, "Failed to load occupancy."));
      } finally {
        setOccupancyLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadLibraries();
  }, [loadLibraries]);

  useEffect(() => {
    if (selectedLibraryId && selectedDate) {
      setSelectedSlotId("");

      loadOccupancy(Number(selectedLibraryId), selectedDate, undefined);
    }
  }, [selectedLibraryId, selectedDate, loadOccupancy]);

  useEffect(() => {
    const handleLibraryChanged = (event) => {
      const nextLibraryId = Number(event?.detail?.libraryId);

      if (!Number.isFinite(nextLibraryId)) {
        return;
      }

      const exists = libraries.some(
        (library) => Number(library.id) === nextLibraryId,
      );

      if (!exists || String(nextLibraryId) === String(selectedLibraryId)) {
        return;
      }

      setSelectedSlotId("");
      setSelectedFloorId("ALL");
      setSelectedLibraryId(String(nextLibraryId));
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);

    return () =>
      window.removeEventListener("owner-library-changed", handleLibraryChanged);
  }, [libraries, selectedLibraryId]);

  const handleLibraryChange = (event) => {
    const nextId = String(event.target.value);

    setSelectedSlotId("");
    setSelectedFloorId("ALL");
    setSelectedLibraryId(nextId);

    storeLibraryId(nextId);

    window.dispatchEvent(
      new CustomEvent("owner-library-changed", {
        detail: {
          libraryId: Number(nextId),
        },
      }),
    );
  };

  const handleSlotChange = async (slotId) => {
    setSelectedSlotId(String(slotId));

    await loadOccupancy(Number(selectedLibraryId), selectedDate, slotId);
  };

  const handleRefresh = async () => {
    if (!selectedLibraryId || !selectedDate) {
      return;
    }

    await loadOccupancy(
      Number(selectedLibraryId),
      selectedDate,
      selectedSlotId || undefined,
      {
        showRefresh: true,
      },
    );
  };

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

  const selectedLibrary = useMemo(
    () =>
      libraries.find(
        (library) => String(library.id) === String(selectedLibraryId),
      ) || null,
    [libraries, selectedLibraryId],
  );

  const occupancyRate = safeNumber(summary.occupancyPercentage);

  if (librariesLoading && libraries.length === 0) {
    return (
      <Box
        sx={{
          width: "100%",
          pb: 5,
        }}
      >
        <Skeleton
          variant="rounded"
          height={190}
          sx={{
            borderRadius: 4,
            mb: 3,
          }}
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 2,
          }}
        >
          {[1, 2, 3, 4].map((item) => (
            <Skeleton
              key={item}
              variant="rounded"
              height={132}
              sx={{
                borderRadius: 3,
              }}
            />
          ))}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        pb: 5,
      }}
    >
      {/* ================================================= */}
      {/* PREMIUM HEADER */}
      {/* ================================================= */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          border: "1px solid",
          borderColor: "rgba(79,70,229,0.13)",
          borderRadius: 4,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(255,255,255,1) 58%, rgba(99,102,241,0.05))",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3.5,
            },
            "&:last-child": {
              pb: {
                xs: 2.5,
                md: 3.5,
              },
            },
          }}
        >
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
            spacing={2.5}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  minWidth: 58,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 10px 24px rgba(79,70,229,0.24)",
                }}
              >
                <EventSeatRounded />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Occupancy
                  </Typography>

                  {selectedLibrary && (
                    <Chip
                      size="small"
                      label={selectedLibrary.name}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Monitor seat usage by date, floor and booking slot in real
                  time.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.2}
              alignItems={{
                xs: "stretch",
                sm: "center",
              }}
            >
              <FormControl
                size="small"
                sx={{
                  minWidth: {
                    xs: "100%",
                    sm: 230,
                  },
                }}
              >
                <InputLabel>Working Library</InputLabel>

                <Select
                  value={selectedLibraryId}
                  label="Working Library"
                  onChange={handleLibraryChange}
                  sx={{
                    bgcolor: "background.paper",
                    borderRadius: 2.5,
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
                sx={{
                  minWidth: 165,
                  bgcolor: "background.paper",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2.5,
                  },
                }}
              />

              <Tooltip title="Today">
                <span>
                  <IconButton
                    onClick={() => {
                      setSelectedSlotId("");

                      setSelectedDate(getToday());
                    }}
                    disabled={selectedDate === getToday()}
                    sx={{
                      width: 42,
                      height: 42,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    <TodayRounded />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title="Refresh occupancy">
                <span>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={refreshing || !selectedLibraryId}
                    sx={{
                      width: 42,
                      height: 42,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    {refreshing ? (
                      <CircularProgress size={18} />
                    ) : (
                      <RefreshRounded />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {refreshing && (
        <LinearProgress
          sx={{
            mb: 2,
            borderRadius: 999,
          }}
        />
      )}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 3,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {/* ================================================= */}
      {/* CONTEXT */}
      {/* ================================================= */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1}
        useFlexGap
        flexWrap="wrap"
        sx={{
          mb: 2.5,
        }}
      >
        <Chip
          icon={<CalendarMonthRounded />}
          label={formatDateLabel(selectedDate)}
          variant="outlined"
        />

        <Chip
          label={occupancy?.selectedSlotName || "No active slot"}
          color="primary"
          variant="outlined"
        />

        {occupancyRate >= 85 && (
          <Chip
            icon={<WarningAmberRounded />}
            label="High occupancy"
            color="warning"
            variant="outlined"
          />
        )}
      </Stack>

      {/* ================================================= */}
      {/* SUMMARY */}
      {/* ================================================= */}

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
          icon={<EventSeatRounded />}
        />

        <SummaryCard
          title="Occupied"
          value={safeNumber(summary.occupiedSeats)}
          subtitle={`${formatPercentage(
            summary.occupancyPercentage,
          )} occupancy`}
          icon={<GroupsRounded />}
          emphasis={occupancyRate >= 85}
        />

        <SummaryCard
          title="Available"
          value={safeNumber(summary.availableSeats)}
          subtitle={`${formatPercentage(
            summary.availabilityPercentage,
          )} available`}
          icon={<CheckCircleRounded />}
        />

        <SummaryCard
          title="Blocked"
          value={safeNumber(summary.blockedSeats)}
          subtitle="Reserved / maintenance"
          icon={<BlockRounded />}
        />

        <SummaryCard
          title="Occupancy Rate"
          value={formatPercentage(summary.occupancyPercentage)}
          subtitle={occupancy?.selectedSlotName || "No active slot"}
          icon={<TrendingUpRounded />}
        />
      </Box>

      {/* ================================================= */}
      {/* SLOT OCCUPANCY */}
      {/* ================================================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3.5,
          mb: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.4,
              md: 3,
            },
            "&:last-child": {
              pb: {
                xs: 2.4,
                md: 3,
              },
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
            spacing={1.5}
            sx={{
              mb: 2.3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Slot Occupancy
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                }}
              >
                Select a booking slot to inspect its occupancy.
              </Typography>
            </Box>

            {selectedSlotId && (
              <Chip
                size="small"
                color="primary"
                label="Selected slot"
                variant="outlined"
              />
            )}
          </Stack>

          {occupancyLoading ? (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, 1fr)",
                },
                gap: 2,
              }}
            >
              {[1, 2, 3].map((item) => (
                <Skeleton
                  key={item}
                  variant="rounded"
                  height={148}
                  sx={{
                    borderRadius: 3,
                  }}
                />
              ))}
            </Box>
          ) : slots.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                borderRadius: 2.5,
              }}
            >
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

      {/* ================================================= */}
      {/* FLOOR OCCUPANCY */}
      {/* ================================================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3.5,
          mb: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.4,
              md: 3,
            },
            "&:last-child": {
              pb: {
                xs: 2.4,
                md: 3,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent="space-between"
            spacing={2}
            sx={{
              mb: 2.3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Floor Occupancy
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                }}
              >
                Compare occupancy distribution across library floors.
              </Typography>
            </Box>

            <FormControl
              size="small"
              sx={{
                minWidth: 200,
              }}
            >
              <InputLabel>Seat Map Floor</InputLabel>

              <Select
                value={selectedFloorId}
                label="Seat Map Floor"
                onChange={(event) => setSelectedFloorId(event.target.value)}
                sx={{
                  borderRadius: 2.5,
                }}
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

          {floors.length === 0 ? (
            <Alert
              severity="info"
              sx={{
                borderRadius: 2.5,
              }}
            >
              No floor occupancy data is available for this selection.
            </Alert>
          ) : (
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
          )}
        </CardContent>
      </Card>

      {/* ================================================= */}
      {/* SEAT MAP */}
      {/* ================================================= */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3.5,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.4,
              md: 3,
            },
            "&:last-child": {
              pb: {
                xs: 2.4,
                md: 3,
              },
            },
          }}
        >
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
              <Typography variant="h6" fontWeight={800}>
                Seat Occupancy Map
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.35,
                }}
              >
                {occupancy?.selectedSlotName
                  ? `${occupancy.selectedSlotName} · ${formatDateLabel(selectedDate)}`
                  : formatDateLabel(selectedDate)}
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
                icon={<WomanRounded />}
                label="Girls Reserved"
                color="secondary"
                variant="outlined"
              />

              <Chip size="small" label="Blocked" variant="outlined" />
            </Stack>
          </Stack>

          {occupancyLoading ? (
            <Box
              sx={{
                minHeight: 260,
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
