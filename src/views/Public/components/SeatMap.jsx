import {
  ChairAltRounded,
  DoorFrontRounded,
  FemaleRounded,
  GridViewRounded,
  InfoOutlined,
  MeetingRoomRounded,
  StarRounded,
  VisibilityRounded,
  VolumeOffRounded,
} from "@mui/icons-material";

import {
  Box,
  Chip,
  Paper,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useMemo } from "react";

// ============================================================
// DEFAULT STATUS COLORS
// ============================================================

const DEFAULT_STATUS_COLORS = {
  AVAILABLE: "#16A34A",

  BOOKED: "#DC2626",

  OCCUPIED: "#DC2626",

  RESERVED: "#2563EB",

  RESERVED_FOR_GIRLS: "#DB2777",

  MAINTENANCE: "#64748B",

  UNAVAILABLE: "#94A3B8",
};

// ============================================================
// STATUS LABELS
// ============================================================

const STATUS_LABELS = {
  AVAILABLE: "Available",

  BOOKED: "Booked",

  OCCUPIED: "Occupied",

  RESERVED: "Reserved",

  RESERVED_FOR_GIRLS: "Reserved for Girls",

  MAINTENANCE: "Maintenance",

  UNAVAILABLE: "Unavailable",
};

// ============================================================
// SEAT TYPE LABELS
// ============================================================

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

const normalizeText = (value) => {
  return String(value || "").toUpperCase();
};

const getSeatId = (seat) => {
  return seat?.seatId ?? seat?.id ?? null;
};

const getSeatNumber = (seat) => {
  return seat?.seatNumber ?? seat?.number ?? getSeatId(seat) ?? "-";
};

const getSeatStatus = (seat) => {
  if (seat?.booked === true) {
    return "BOOKED";
  }

  const status = normalizeText(
    seat?.availabilityStatus || seat?.status || seat?.physicalStatus,
  );

  if (status === "OCCUPIED") {
    return "BOOKED";
  }

  return status || "UNAVAILABLE";
};

const getSeatType = (seat) => {
  return normalizeText(seat?.seatType || "NORMAL");
};

const getRowLabel = (seat) => {
  return seat?.rowLabel || "";
};

const getColumnNumber = (seat) => {
  const value = Number(seat?.columnNumber);

  return Number.isFinite(value) ? value : null;
};

const seatCanBeSelected = (seat) => {
  return getSeatStatus(seat) === "AVAILABLE";
};

const sameSeat = (first, second) => {
  if (!first || !second) {
    return false;
  }

  return String(getSeatId(first)) === String(getSeatId(second));
};

// ============================================================
// SEAT TYPE ICON
// ============================================================

function SeatTypeIcon({ seatType }) {
  switch (seatType) {
    case "PREMIUM":
      return (
        <StarRounded
          sx={{
            fontSize: 14,
          }}
        />
      );

    case "FEMALE_ONLY":
      return (
        <FemaleRounded
          sx={{
            fontSize: 14,
          }}
        />
      );

    case "WINDOW":
      return (
        <VisibilityRounded
          sx={{
            fontSize: 14,
          }}
        />
      );

    case "QUIET_ZONE":
      return (
        <VolumeOffRounded
          sx={{
            fontSize: 14,
          }}
        />
      );

    default:
      return null;
  }
}

// ============================================================
// FLOOR MARKER
// ============================================================

function FloorMarker({ type, label }) {
  const theme = useTheme();

  const entrance = type === "ENTRANCE";

  return (
    <Paper
      elevation={0}
      sx={{
        px: 1.75,

        py: 0.85,

        minWidth: 120,

        textAlign: "center",

        borderRadius: 2.5,

        border: "1px dashed",

        borderColor: entrance
          ? alpha(theme.palette.success.main, 0.42)
          : alpha(theme.palette.primary.main, 0.4),

        bgcolor: entrance
          ? alpha(theme.palette.success.main, 0.055)
          : alpha(theme.palette.primary.main, 0.055),

        color: entrance ? "success.dark" : "primary.dark",
      }}
    >
      <Stack
        direction="row"
        spacing={0.7}
        justifyContent="center"
        alignItems="center"
      >
        {entrance ? (
          <DoorFrontRounded
            sx={{
              fontSize: 17,
            }}
          />
        ) : (
          <MeetingRoomRounded
            sx={{
              fontSize: 17,
            }}
          />
        )}

        <Typography variant="caption" fontWeight={800}>
          {label}
        </Typography>
      </Stack>
    </Paper>
  );
}

// ============================================================
// SEAT
// ============================================================

function SeatItem({ seat, selected, onSelect, statusColors }) {
  const theme = useTheme();

  const status = getSeatStatus(seat);

  const seatType = getSeatType(seat);

  const selectable = seatCanBeSelected(seat);

  const statusColor =
    statusColors?.[status] || DEFAULT_STATUS_COLORS[status] || "#64748B";

  const tooltipTitle = (
    <Box
      sx={{
        p: 0.4,
      }}
    >
      <Typography fontWeight={800} fontSize={13}>
        Seat {getSeatNumber(seat)}
      </Typography>

      <Typography
        fontSize={12}
        sx={{
          mt: 0.4,
        }}
      >
        Status: {STATUS_LABELS[status] || status}
      </Typography>

      <Typography fontSize={12}>
        Type: {SEAT_TYPE_LABELS[seatType] || seatType}
      </Typography>

      {getRowLabel(seat) && (
        <Typography fontSize={12}>
          Position: Row {getRowLabel(seat)}
          {getColumnNumber(seat) != null
            ? `, Column ${getColumnNumber(seat)}`
            : ""}
        </Typography>
      )}

      {!selectable && (
        <Typography
          fontSize={11}
          sx={{
            mt: 0.7,

            opacity: 0.8,
          }}
        >
          This seat cannot currently be selected.
        </Typography>
      )}
    </Box>
  );

  return (
    <Tooltip title={tooltipTitle} arrow placement="top">
      <Box
        role="button"
        tabIndex={selectable ? 0 : -1}
        aria-label={`Seat ${getSeatNumber(seat)}, ${
          STATUS_LABELS[status] || status
        }`}
        onClick={() => {
          if (selectable) {
            onSelect?.(seat);
          }
        }}
        onKeyDown={(event) => {
          if (!selectable) {
            return;
          }

          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();

            onSelect?.(seat);
          }
        }}
        sx={{
          position: "relative",

          minWidth: {
            xs: 56,
            sm: 66,
          },

          minHeight: {
            xs: 62,
            sm: 72,
          },

          borderRadius: 2.7,

          border: selected ? "2px solid" : "1.5px solid",

          borderColor: selected ? "primary.main" : alpha(statusColor, 0.45),

          bgcolor: selected
            ? alpha(theme.palette.primary.main, 0.11)
            : alpha(statusColor, status === "AVAILABLE" ? 0.075 : 0.065),

          display: "flex",

          flexDirection: "column",

          alignItems: "center",

          justifyContent: "center",

          gap: 0.15,

          cursor: selectable ? "pointer" : "not-allowed",

          opacity: selectable || selected ? 1 : 0.72,

          outline: "none",

          overflow: "hidden",

          transition:
            "transform .18s ease, box-shadow .18s ease, border-color .18s ease, background-color .18s ease",

          boxShadow: selected
            ? `0 9px 24px ${alpha(theme.palette.primary.main, 0.18)}`
            : "none",

          "&::before": selected
            ? {
                content: '""',

                position: "absolute",

                inset: 0,

                borderRadius: "inherit",

                boxShadow: `inset 0 0 0 1px ${alpha(
                  theme.palette.primary.main,
                  0.14,
                )}`,

                pointerEvents: "none",
              }
            : {},

          "&:hover": selectable
            ? {
                transform: "translateY(-4px) scale(1.02)",

                borderColor: selected ? "primary.main" : statusColor,

                boxShadow: `0 10px 24px ${alpha(statusColor, 0.17)}`,
              }
            : {},

          "&:focus-visible": selectable
            ? {
                boxShadow: `0 0 0 4px ${alpha(
                  theme.palette.primary.main,
                  0.18,
                )}`,
              }
            : {},
        }}
      >
        {/* ==================================================== */}
        {/* TYPE BADGE */}
        {/* ==================================================== */}

        {seatType !== "NORMAL" && (
          <Box
            sx={{
              position: "absolute",

              top: 5,

              right: 5,

              width: 20,

              height: 20,

              display: "grid",

              placeItems: "center",

              borderRadius: "50%",

              bgcolor: selected ? "primary.main" : alpha(statusColor, 0.14),

              color: selected ? "#fff" : statusColor,
            }}
          >
            <SeatTypeIcon seatType={seatType} />
          </Box>
        )}

        {/* ==================================================== */}
        {/* CHAIR */}
        {/* ==================================================== */}

        <ChairAltRounded
          sx={{
            fontSize: {
              xs: 23,
              sm: 28,
            },

            color: selected ? "primary.main" : statusColor,

            transition: "transform .18s ease",

            ".MuiBox-root:hover > &": selectable
              ? {
                  transform: "scale(1.08)",
                }
              : {},
          }}
        />

        {/* ==================================================== */}
        {/* NUMBER */}
        {/* ==================================================== */}

        <Typography
          sx={{
            fontSize: {
              xs: 10.5,
              sm: 11.5,
            },

            fontWeight: 850,

            lineHeight: 1.15,

            color: selected ? "primary.dark" : "text.primary",

            maxWidth: "90%",

            overflow: "hidden",

            textOverflow: "ellipsis",

            whiteSpace: "nowrap",
          }}
        >
          {getSeatNumber(seat)}
        </Typography>

        <Typography
          sx={{
            mt: 0.15,

            fontSize: 8.5,

            fontWeight: 750,

            color: selected ? "primary.main" : statusColor,

            textTransform: "uppercase",

            letterSpacing: "0.035em",
          }}
        >
          {selected ? "Selected" : STATUS_LABELS[status] || status}
        </Typography>
      </Box>
    </Tooltip>
  );
}

// ============================================================
// SEAT MAP
// ============================================================

function SeatMap({
  seats = [],

  selectedSeat,

  /*
   * Support both names so existing screens
   * do not break while we migrate.
   */
  onSelect,

  onSeatSelect,

  statusColors = DEFAULT_STATUS_COLORS,

  /*
   * Optional physical layout returned by:
   *
   * GET
   * /api/libraries/{libraryId}/floors/{floorId}/layout
   */
  layout = null,
}) {
  const theme = useTheme();

  const handleSelect = onSeatSelect || onSelect;

  // ==========================================================
  // NORMALIZED SEATS
  // ==========================================================

  const normalizedSeats = useMemo(
    () =>
      (Array.isArray(seats) ? seats : []).map((seat) => ({
        ...seat,

        id: getSeatId(seat),

        seatId: getSeatId(seat),

        seatNumber: getSeatNumber(seat),

        status: getSeatStatus(seat),
      })),
    [seats],
  );

  // ==========================================================
  // DETERMINE ROWS
  // ==========================================================

  const rowLabels = useMemo(() => {
    const labels = normalizedSeats
      .map((seat) => getRowLabel(seat))
      .filter(Boolean);

    return [...new Set(labels)].sort((first, second) =>
      String(first).localeCompare(String(second), undefined, {
        numeric: true,
      }),
    );
  }, [normalizedSeats]);

  // ==========================================================
  // COLUMNS
  // ==========================================================

  const maxColumn = useMemo(() => {
    const fromSeats = normalizedSeats.reduce(
      (maximum, seat) => Math.max(maximum, Number(getColumnNumber(seat) || 0)),
      0,
    );

    return Math.max(Number(layout?.columnCount || 0), fromSeats, 1);
  }, [normalizedSeats, layout]);

  // ==========================================================
  // GAP LOOKUP
  // ==========================================================

  const gaps = useMemo(() => {
    const map = new Set();

    const layoutGaps = Array.isArray(layout?.gaps) ? layout.gaps : [];

    layoutGaps.forEach((gap) => {
      map.add(`${gap?.rowLabel}-${gap?.columnNumber}`);
    });

    return map;
  }, [layout]);

  // ==========================================================
  // SEAT LOOKUP
  // ==========================================================

  const seatLookup = useMemo(() => {
    const map = new Map();

    normalizedSeats.forEach((seat) => {
      const row = getRowLabel(seat);

      const column = getColumnNumber(seat);

      if (row && column != null) {
        map.set(`${row}-${column}`, seat);
      }
    });

    return map;
  }, [normalizedSeats]);

  // ==========================================================
  // COUNTS
  // ==========================================================

  const counts = useMemo(() => {
    return normalizedSeats.reduce(
      (current, seat) => {
        const status = getSeatStatus(seat);

        current.total += 1;

        if (status === "AVAILABLE") {
          current.available += 1;
        } else {
          current.unavailable += 1;
        }

        return current;
      },
      {
        total: 0,
        available: 0,
        unavailable: 0,
      },
    );
  }, [normalizedSeats]);

  // ==========================================================
  // FALLBACK GRID
  // ==========================================================

  const shouldUsePhysicalGrid =
    rowLabels.length > 0 &&
    normalizedSeats.some((seat) => getColumnNumber(seat) != null);

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Stack spacing={2.5}>
      {/* ====================================================== */}
      {/* MAP HEADER */}
      {/* ====================================================== */}

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
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,

              display: "grid",

              placeItems: "center",

              borderRadius: 2.3,

              bgcolor: alpha(theme.palette.primary.main, 0.08),

              color: "primary.main",
            }}
          >
            <GridViewRounded />
          </Box>

          <Box>
            <Typography fontWeight={850}>Interactive Seat Map</Typography>

            <Typography variant="caption" color="text.secondary">
              Select a green available seat
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
          <Chip
            size="small"
            label={`${counts.available} available`}
            color="success"
            variant="outlined"
          />

          <Chip
            size="small"
            label={`${counts.total} total`}
            variant="outlined"
          />
        </Stack>
      </Stack>

      {/* ====================================================== */}
      {/* ENTRANCE */}
      {/* ====================================================== */}

      {layout?.entrancePosition && (
        <Box
          sx={{
            display: "flex",

            justifyContent: layout.entrancePosition.includes("LEFT")
              ? "flex-start"
              : layout.entrancePosition.includes("RIGHT")
                ? "flex-end"
                : "center",
          }}
        >
          <FloorMarker type="ENTRANCE" label="Entrance" />
        </Box>
      )}

      {/* ====================================================== */}
      {/* MAP SURFACE */}
      {/* ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          width: "100%",

          overflowX: "auto",

          p: {
            xs: 1.4,
            sm: 2,
            md: 2.5,
          },

          borderRadius: 4,

          border: "1px solid",

          borderColor: alpha(theme.palette.divider, 0.9),

          bgcolor: alpha(theme.palette.background.default, 0.7),

          backgroundImage: `linear-gradient(
              ${alpha(theme.palette.divider, 0.18)} 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              ${alpha(theme.palette.divider, 0.18)} 1px,
              transparent 1px
            )`,

          backgroundSize: "24px 24px",
        }}
      >
        {shouldUsePhysicalGrid ? (
          <Stack
            spacing={1.25}
            sx={{
              minWidth: maxColumn * 76 + 60,
            }}
          >
            {rowLabels.map((rowLabel) => (
              <Stack
                key={rowLabel}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                {/* ========================================== */}
                {/* ROW LABEL */}
                {/* ========================================== */}

                <Box
                  sx={{
                    width: 38,

                    flexShrink: 0,

                    display: "grid",

                    placeItems: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={900}
                    color="text.secondary"
                  >
                    {rowLabel}
                  </Typography>
                </Box>

                {/* ========================================== */}
                {/* ROW CELLS */}
                {/* ========================================== */}

                <Box
                  sx={{
                    flex: 1,

                    display: "grid",

                    gridTemplateColumns: `repeat(${maxColumn}, minmax(62px, 1fr))`,

                    gap: {
                      xs: 0.8,
                      sm: 1,
                    },
                  }}
                >
                  {Array.from(
                    {
                      length: maxColumn,
                    },
                    (_, index) => {
                      const column = index + 1;

                      const key = `${rowLabel}-${column}`;

                      const seat = seatLookup.get(key);

                      const isGap = gaps.has(key);

                      if (isGap) {
                        return (
                          <Box
                            key={key}
                            sx={{
                              minHeight: {
                                xs: 62,
                                sm: 72,
                              },

                              borderRadius: 2.5,

                              border: "1px dashed",

                              borderColor: alpha(theme.palette.divider, 0.45),

                              bgcolor: "rgba(255,255,255,.32)",
                            }}
                          />
                        );
                      }

                      if (!seat) {
                        return (
                          <Box
                            key={key}
                            sx={{
                              minHeight: {
                                xs: 62,
                                sm: 72,
                              },
                            }}
                          />
                        );
                      }

                      return (
                        <SeatItem
                          key={key}
                          seat={seat}
                          selected={sameSeat(selectedSeat, seat)}
                          onSelect={handleSelect}
                          statusColors={statusColors}
                        />
                      );
                    },
                  )}
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : (
          /* ================================================== */
          /* FALLBACK RESPONSIVE GRID */
          /* ================================================== */

          <Box
            sx={{
              display: "grid",

              gridTemplateColumns: {
                xs: "repeat(4, minmax(55px, 1fr))",

                sm: "repeat(6, minmax(62px, 1fr))",

                md: "repeat(8, minmax(65px, 1fr))",

                lg: "repeat(10, minmax(68px, 1fr))",
              },

              gap: {
                xs: 0.8,
                sm: 1,
              },
            }}
          >
            {normalizedSeats.map((seat) => (
              <SeatItem
                key={getSeatId(seat)}
                seat={seat}
                selected={sameSeat(selectedSeat, seat)}
                onSelect={handleSelect}
                statusColors={statusColors}
              />
            ))}
          </Box>
        )}
      </Paper>

      {/* ====================================================== */}
      {/* RECEPTION */}
      {/* ====================================================== */}

      {layout?.receptionPosition && (
        <Box
          sx={{
            display: "flex",

            justifyContent: layout.receptionPosition.includes("LEFT")
              ? "flex-start"
              : layout.receptionPosition.includes("RIGHT")
                ? "flex-end"
                : "center",
          }}
        >
          <FloorMarker type="RECEPTION" label="Reception" />
        </Box>
      )}

      {/* ====================================================== */}
      {/* LEGEND */}
      {/* ====================================================== */}

      <Paper
        elevation={0}
        sx={{
          p: 1.8,

          borderRadius: 3,

          border: "1px solid",

          borderColor: "divider",
        }}
      >
        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
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
                spacing={0.65}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 11,

                    height: 11,

                    borderRadius: "50%",

                    bgcolor:
                      statusColors[status] || DEFAULT_STATUS_COLORS[status],
                  }}
                />

                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={650}
                >
                  {STATUS_LABELS[status]}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Stack direction="row" spacing={0.6} alignItems="center">
            <InfoOutlined
              sx={{
                fontSize: 16,

                color: "text.secondary",
              }}
            />

            <Typography variant="caption" color="text.secondary">
              Hover or tap a seat for details.
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}

export default SeatMap;
