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
  MeetingRoomOutlined,
  Schedule,
} from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import seatApi from "../../../api/seatApi";
import slotApi from "../../../api/slotApi";

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatEnum(value, fallback = "-") {
  if (!value) return fallback;

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatTime(value) {
  if (!value) return "-";
  return String(value).slice(0, 5);
}

function formatMoney(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
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

function getSeatTypeBasePrice(plan, seatType) {
  const resolvedType = seatType || "NORMAL";

  const configured = Array.isArray(plan?.seatPrices)
    ? plan.seatPrices.find(
        (item) => item?.seatType === resolvedType && item?.active !== false,
      )
    : null;

  if (configured?.price != null) {
    return Number(configured.price);
  }

  // Migration fallback is intentionally NORMAL-only.
  if (resolvedType === "NORMAL" && plan?.price != null) {
    return Number(plan.price);
  }

  return null;
}

function getSeatFeaturePricing(plan, seat) {
  const seatFeatures = Array.isArray(seat?.features) ? seat.features : [];

  const configuredPrices = Array.isArray(plan?.featurePrices)
    ? plan.featurePrices
    : [];

  return seatFeatures
    .map((feature) => {
      const pricing = configuredPrices.find(
        (item) => item?.seatFeature === feature && item?.active !== false,
      );

      return {
        feature,
        additionalPrice:
          pricing?.additionalPrice != null
            ? Number(pricing.additionalPrice)
            : 0,
      };
    })
    .filter(
      (item) =>
        Number.isFinite(item.additionalPrice) && item.additionalPrice > 0,
    );
}

function calculateSeatPreview(plan, seat) {
  if (!seat) {
    return {
      basePrice: null,
      featurePrices: [],
      total: null,
    };
  }

  const basePrice = getSeatTypeBasePrice(plan, seat.seatType);

  const featurePrices = getSeatFeaturePricing(plan, seat);

  if (basePrice == null) {
    return {
      basePrice: null,
      featurePrices,
      total: null,
    };
  }

  const featureTotal = featurePrices.reduce(
    (sum, item) => sum + Number(item.additionalPrice || 0),
    0,
  );

  return {
    basePrice,
    featurePrices,
    total: basePrice + featureTotal,
  };
}

function isSeatSelectable(seat, selectedPlan) {
  if (seat?.availabilityStatus !== "AVAILABLE" || seat?.booked === true) {
    return false;
  }

  // Do not allow a seat whose commercial base price has not
  // been configured for the selected plan.
  return getSeatTypeBasePrice(selectedPlan, seat?.seatType) != null;
}

function LayoutMarker({ type }) {
  const isEntrance = type === "ENTRANCE";

  return (
    <Box
      sx={{
        minWidth: { xs: 135, sm: 165 },
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

function BookSeat() {
  const { libraryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedPlan = location.state?.selectedPlan || null;

  const library = location.state?.library || null;

  const [bookingDate, setBookingDate] = useState(getToday());

  const [floors, setFloors] = useState([]);
  const [floorId, setFloorId] = useState("");

  const [slots, setSlots] = useState([]);
  const [slotId, setSlotId] = useState("");

  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);

  const [floorLayout, setFloorLayout] = useState(null);

  const [loadingLayout, setLoadingLayout] = useState(false);

  const [loadingSetup, setLoadingSetup] = useState(true);

  const [loadingSeats, setLoadingSeats] = useState(false);

  const [error, setError] = useState("");

  const selectedFloor = useMemo(
    () => floors.find((floor) => String(floor.id) === String(floorId)) || null,
    [floors, floorId],
  );

  const selectedSlot = useMemo(
    () => slots.find((slot) => String(slot.id) === String(slotId)) || null,
    [slots, slotId],
  );

  const selectedSeatPricing = useMemo(
    () => calculateSeatPreview(selectedPlan, selectedSeat),
    [selectedPlan, selectedSeat],
  );

  useEffect(() => {
    let active = true;

    const loadSetup = async () => {
      if (!libraryId) return;

      try {
        setLoadingSetup(true);
        setError("");

        const [floorResponse, slotResponse] = await Promise.all([
          seatApi.getFloors(libraryId),
          slotApi.getActiveSlots(libraryId),
        ]);

        if (!active) return;

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

        if (!active) return;

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

        if (!active) return;

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

  const rowCount = Number(floorLayout?.rowCount ?? 0);

  const columnCount = Number(floorLayout?.columnCount ?? 0);

  const entrancePosition = floorLayout?.entrancePosition || "NONE";

  const receptionPosition = floorLayout?.receptionPosition || "NONE";

  const gaps = useMemo(
    () => (Array.isArray(floorLayout?.gaps) ? floorLayout.gaps : []),
    [floorLayout],
  );

  const seatByPosition = useMemo(() => {
    const map = new Map();

    seats.forEach((seat) => {
      map.set(positionKey(seat.rowLabel, seat.columnNumber), seat);
    });

    return map;
  }, [seats]);

  const gapKeys = useMemo(
    () =>
      new Set(gaps.map((gap) => positionKey(gap.rowLabel, gap.columnNumber))),
    [gaps],
  );

  const derivedSeatRowCount = useMemo(() => {
    if (seats.length === 0) return 0;

    const rowIndexes = seats
      .map((seat) => {
        const row = normalizeRow(seat.rowLabel);

        if (!/^[A-Z]$/.test(row)) {
          return 0;
        }

        return row.charCodeAt(0) - 64;
      })
      .filter((value) => value > 0);

    return rowIndexes.length ? Math.max(...rowIndexes) : 0;
  }, [seats]);

  const derivedSeatColumnCount = useMemo(() => {
    if (seats.length === 0) return 0;

    return Math.max(0, ...seats.map((seat) => Number(seat.columnNumber ?? 0)));
  }, [seats]);

  const derivedGapRowCount = useMemo(() => {
    if (gaps.length === 0) return 0;

    const rowIndexes = gaps
      .map((gap) => {
        const row = normalizeRow(gap.rowLabel);

        if (!/^[A-Z]$/.test(row)) {
          return 0;
        }

        return row.charCodeAt(0) - 64;
      })
      .filter((value) => value > 0);

    return rowIndexes.length ? Math.max(...rowIndexes) : 0;
  }, [gaps]);

  const derivedGapColumnCount = useMemo(() => {
    if (gaps.length === 0) return 0;

    return Math.max(0, ...gaps.map((gap) => Number(gap.columnNumber ?? 0)));
  }, [gaps]);

  const effectiveRowCount = Math.max(
    rowCount,
    derivedSeatRowCount,
    derivedGapRowCount,
  );

  const effectiveColumnCount = Math.max(
    columnCount,
    derivedSeatColumnCount,
    derivedGapColumnCount,
  );

  const availableCount = useMemo(
    () => seats.filter((seat) => isSeatSelectable(seat, selectedPlan)).length,
    [seats, selectedPlan],
  );

  const bookedCount = useMemo(
    () =>
      seats.filter(
        (seat) => seat.availabilityStatus === "BOOKED" || seat.booked === true,
      ).length,
    [seats],
  );

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

    if (selectedSeatPricing.basePrice == null) {
      setError(
        `Pricing is not configured for ${formatEnum(
          selectedSeat.seatType,
          "Normal",
        )} seats under this membership plan.`,
      );
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

        // Display-only standard pricing preview.
        // Backend recalculates from seatId during booking.
        standardPricingPreview: selectedSeatPricing,
      },
    });
  };

  const renderMarkers = (positionPrefix, marginKey) => {
    const left = [];
    const center = [];
    const right = [];

    const mapping = [
      ["LEFT", left],
      ["CENTER", center],
      ["RIGHT", right],
    ];

    mapping.forEach(([suffix, target]) => {
      const position = `${positionPrefix}_${suffix}`;

      if (entrancePosition === position) {
        target.push(<LayoutMarker key="entrance" type="ENTRANCE" />);
      }

      if (receptionPosition === position) {
        target.push(<LayoutMarker key="reception" type="RECEPTION" />);
      }
    });

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
          [marginKey]: 4,
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

  if (!selectedPlan) {
    return (
      <Box>
        <Alert severity="warning" sx={{ mb: 2 }}>
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

  return (
    <Box>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate(`/student/libraries/${libraryId}/plans`)}
        sx={{ mb: 2 }}
      >
        Back to Plans
      </Button>

      <Typography variant="h4" fontWeight={800}>
        Select Your Seat
      </Typography>

      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Choose a date, floor, booking slot and available seat.
      </Typography>

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

            <Box textAlign={{ sm: "right" }}>
              <Typography variant="caption" color="text.secondary">
                Normal seat from
              </Typography>

              <Typography variant="h5" fontWeight={800} color="primary.main">
                {formatMoney(
                  getSeatTypeBasePrice(selectedPlan, "NORMAL") ??
                    selectedPlan.price,
                )}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {loadingSetup ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 6 }}>
          <CircularProgress />

          <Typography color="text.secondary">
            Loading floors and booking slots...
          </Typography>
        </Stack>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
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

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

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
                    sm: "row",
                  }}
                  spacing={2}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      {selectedFloor.name ||
                        `Floor ${selectedFloor.floorNumber}`}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      {selectedSlot.name}
                      {" • "}
                      {formatTime(selectedSlot.startTime)}
                      {" - "}
                      {formatTime(selectedSlot.endTime)}
                    </Typography>
                  </Box>

                  <Stack direction="row" spacing={1}>
                    <Chip
                      label={`${availableCount} available`}
                      color="success"
                      variant="outlined"
                    />

                    <Chip
                      label={`${bookedCount} booked`}
                      color="error"
                      variant="outlined"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          )}

          {loadingSeats || loadingLayout ? (
            <Stack alignItems="center" spacing={2} sx={{ py: 7 }}>
              <CircularProgress />

              <Typography color="text.secondary">
                Loading seat map...
              </Typography>
            </Stack>
          ) : (
            <Card
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                overflow: "auto",
              }}
            >
              <CardContent
                sx={{
                  minWidth: Math.max(620, effectiveColumnCount * 84),
                }}
              >
                {renderMarkers("TOP", "mb")}

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 3 }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={800}>
                      Seat Map
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Green seats are available. Red seats are booked. Seats
                      without a configured plan price are disabled.
                    </Typography>
                  </Box>

                  <Schedule color="primary" />
                </Stack>

                <Divider sx={{ mb: 3 }} />

                <Stack spacing={1.5} alignItems="center">
                  {Array.from({
                    length: effectiveRowCount,
                  }).map((_, rowIndex) => {
                    const rowLabel = getRowLabel(rowIndex);

                    return (
                      <Stack
                        key={rowLabel}
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Typography
                          sx={{
                            width: 24,
                            flexShrink: 0,
                            fontWeight: 800,
                          }}
                        >
                          {rowLabel}
                        </Typography>

                        {Array.from({
                          length: effectiveColumnCount,
                        }).map((__, columnIndex) => {
                          const columnNumber = columnIndex + 1;

                          const key = positionKey(rowLabel, columnNumber);

                          if (gapKeys.has(key)) {
                            return (
                              <Box
                                key={key}
                                sx={{
                                  width: 76,
                                  minWidth: 76,
                                  height: 84,
                                }}
                              />
                            );
                          }

                          const seat = seatByPosition.get(key);

                          if (!seat) {
                            return (
                              <Box
                                key={key}
                                sx={{
                                  width: 76,
                                  minWidth: 76,
                                  height: 84,
                                }}
                              />
                            );
                          }

                          const selectable = isSeatSelectable(
                            seat,
                            selectedPlan,
                          );

                          const selected = selectedSeat?.seatId === seat.seatId;

                          const status = seat.availabilityStatus;

                          const seatPrice = calculateSeatPreview(
                            selectedPlan,
                            seat,
                          );

                          const restrictions = Array.isArray(seat.restrictions)
                            ? seat.restrictions
                            : [];

                          const features = Array.isArray(seat.features)
                            ? seat.features
                            : [];

                          const tooltipParts = [
                            seat.seatNumber,
                            formatEnum(seat.seatType, "Normal"),
                            status === "AVAILABLE"
                              ? seatPrice.total != null
                                ? formatMoney(seatPrice.total)
                                : "Price not configured"
                              : formatEnum(status),
                          ];

                          if (features.length > 0) {
                            tooltipParts.push(
                              `Features: ${features
                                .map((item) => formatEnum(item))
                                .join(", ")}`,
                            );
                          }

                          if (restrictions.length > 0) {
                            tooltipParts.push(
                              `Restricted: ${restrictions
                                .map((item) => formatEnum(item))
                                .join(", ")}`,
                            );
                          }

                          const seatColor = selected
                            ? "primary"
                            : selectable
                              ? "success"
                              : status === "BOOKED"
                                ? "error"
                                : "inherit";

                          return (
                            <Tooltip key={key} title={tooltipParts.join(" • ")}>
                              <span>
                                <Button
                                  variant={selected ? "contained" : "outlined"}
                                  color={seatColor}
                                  disabled={!selectable}
                                  onClick={() => setSelectedSeat(seat)}
                                  sx={{
                                    width: 76,
                                    minWidth: 76,
                                    height: 84,
                                    px: 0.5,
                                    flexDirection: "column",
                                    opacity: selectable || selected ? 1 : 0.55,
                                    borderRadius: 2,
                                  }}
                                >
                                  <EventSeat />

                                  <Typography
                                    component="span"
                                    fontWeight={800}
                                    fontSize={12}
                                    noWrap
                                    sx={{
                                      maxWidth: 68,
                                    }}
                                  >
                                    {seat.seatNumber}
                                  </Typography>

                                  <Typography
                                    component="span"
                                    variant="caption"
                                    sx={{
                                      lineHeight: 1.1,
                                    }}
                                  >
                                    {formatEnum(seat.seatType, "Normal")}
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

                {renderMarkers("BOTTOM", "mt")}
              </CardContent>
            </Card>
          )}

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
                        {formatEnum(selectedSeat.seatType, "Normal")}
                        {" • Row "}
                        {selectedSeat.rowLabel}
                        {" • Position "}
                        {selectedSeat.columnNumber}
                      </Typography>

                      {Array.isArray(selectedSeat.features) &&
                        selectedSeat.features.length > 0 && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            useFlexGap
                            flexWrap="wrap"
                            sx={{ mt: 1 }}
                          >
                            {selectedSeat.features.map((feature) => (
                              <Chip
                                key={feature}
                                size="small"
                                variant="outlined"
                                label={formatEnum(feature)}
                              />
                            ))}
                          </Stack>
                        )}

                      {Array.isArray(selectedSeat.restrictions) &&
                        selectedSeat.restrictions.length > 0 && (
                          <Stack
                            direction="row"
                            spacing={0.75}
                            useFlexGap
                            flexWrap="wrap"
                            sx={{ mt: 1 }}
                          >
                            {selectedSeat.restrictions.map((restriction) => (
                              <Chip
                                key={restriction}
                                size="small"
                                color="warning"
                                variant="outlined"
                                label={formatEnum(restriction)}
                              />
                            ))}
                          </Stack>
                        )}
                    </Box>
                  </Stack>

                  <Stack
                    alignItems={{
                      xs: "stretch",
                      sm: "flex-end",
                    }}
                    spacing={1}
                  >
                    <Box
                      textAlign={{
                        sm: "right",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Standard seat price
                      </Typography>

                      <Typography
                        variant="h5"
                        fontWeight={900}
                        color="primary.main"
                      >
                        {selectedSeatPricing.total != null
                          ? formatMoney(selectedSeatPricing.total)
                          : "Not configured"}
                      </Typography>
                    </Box>

                    <Button
                      size="large"
                      variant="contained"
                      endIcon={<ArrowForward />}
                      onClick={handleContinue}
                    >
                      Review Booking
                    </Button>
                  </Stack>
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
