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
  Stack,
  Typography,
} from "@mui/material";

import {
  CalendarMonth,
  EventSeat,
  Refresh,
  Schedule,
  Visibility,
} from "@mui/icons-material";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import studentBookingApi
  from "../../../api/studentBookingApi";


const formatMoney = (value) => {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value ?? 0)
  );
};


const formatStatus = (status) => {
  if (!status) {
    return "-";
  }

  return String(status)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
};


const getStatusColor = (status) => {
  switch (status) {
    case "ACTIVE":
      return "success";

    case "PENDING_PAYMENT":
      return "warning";

    case "CANCELLED":
      return "default";

    case "EXPIRED":
      return "default";

    default:
      return "default";
  }
};


function MyBookings() {
  const navigate =
    useNavigate();

  const [
    bookings,
    setBookings,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  const loadBookings =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await studentBookingApi
              .getMyBookings();

          setBookings(
            Array.isArray(
              response
            )
              ? response
              : []
          );
        } catch (requestError) {
          console.error(
            "Failed to load student bookings:",
            requestError
          );

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            requestError
              ?.message ||
            "Unable to load your bookings."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadBookings();
  }, [
    loadBookings,
  ]);


  const sortedBookings =
    useMemo(
      () =>
        [...bookings].sort(
          (a, b) => {
            const aDate =
              new Date(
                a.startDate ||
                0
              );

            const bDate =
              new Date(
                b.startDate ||
                0
              );

            return (
              bDate -
              aDate
            );
          }
        ),
      [
        bookings,
      ]
    );


  return (
    <Box>
      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent=
          "space-between"
        alignItems={{
          xs: "stretch",
          sm: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            My Bookings
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            View and manage your library seat bookings.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            <Refresh />
          }
          onClick={
            loadBookings
          }
        >
          Refresh
        </Button>
      </Stack>


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


      {loading ? (
        <Stack
          alignItems="center"
          spacing={2}
          sx={{
            py: 8,
          }}
        >
          <CircularProgress />

          <Typography
            color=
              "text.secondary"
          >
            Loading bookings...
          </Typography>
        </Stack>
      ) : sortedBookings.length ===
        0 ? (
        <Card
          elevation={0}
          sx={{
            border:
              "1px solid",
            borderColor:
              "divider",
          }}
        >
          <CardContent>
            <Typography
              variant="h6"
              fontWeight={700}
            >
              No bookings yet
            </Typography>

            <Typography
              color=
                "text.secondary"
              sx={{
                mt: 0.5,
                mb: 2,
              }}
            >
              You have not created any seat bookings yet.
            </Typography>

            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  "/student/libraries"
                )
              }
            >
              Browse Libraries
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid
          container
          spacing={2}
        >
          {sortedBookings.map(
            (booking) => (
              <Grid
                key={
                  booking.bookingId
                }
                size={{
                  xs: 12,
                  md: 6,
                  xl: 4,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height:
                      "100%",
                    border:
                      "1px solid",
                    borderColor:
                      "divider",
                    borderRadius: 3,
                  }}
                >
                  <CardContent>
                    <Stack
                      spacing={2}
                    >
                      <Stack
                        direction="row"
                        justifyContent=
                          "space-between"
                        alignItems=
                          "flex-start"
                        spacing={1}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            color=
                              "text.secondary"
                          >
                            Booking
                          </Typography>

                          <Typography
                            variant="h6"
                            fontWeight={
                              800
                            }
                          >
                            #
                            {
                              booking.bookingId
                            }
                          </Typography>
                        </Box>

                        <Chip
                          size="small"
                          label={
                            formatStatus(
                              booking.status
                            )
                          }
                          color={
                            getStatusColor(
                              booking.status
                            )
                          }
                          variant="outlined"
                        />
                      </Stack>

                      <Divider />

                      <Stack
                        spacing={1.25}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <EventSeat
                            fontSize="small"
                          />

                          <Typography
                            variant="body2"
                          >
                            Seat{" "}
                            {
                              booking.seatNumber
                            }
                          </Typography>
                        </Stack>

                        {booking
                          .slotName && (
                          <Stack
                            direction="row"
                            spacing={1}
                          >
                            <Schedule
                              fontSize="small"
                            />

                            <Typography
                              variant="body2"
                            >
                              {
                                booking.slotName
                              }
                            </Typography>
                          </Stack>
                        )}

                        <Stack
                          direction="row"
                          spacing={1}
                        >
                          <CalendarMonth
                            fontSize="small"
                          />

                          <Typography
                            variant="body2"
                          >
                            {
                              booking.startDate
                            }{" "}
                            to{" "}
                            {
                              booking.endDate
                            }
                          </Typography>
                        </Stack>

                        {(booking
                          .slotStartTime ||
                          booking
                            .slotEndTime) && (
                          <Typography
                            variant="body2"
                            color=
                              "text.secondary"
                          >
                            Slot:{" "}
                            {booking.slotStartTime ||
                              "-"}{" "}
                            -{" "}
                            {booking.slotEndTime ||
                              "-"}
                          </Typography>
                        )}

                        <Typography
                          variant="body2"
                          fontWeight={
                            700
                          }
                        >
                          {formatMoney(
                            booking.amount
                          )}
                        </Typography>
                      </Stack>

                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={
                          <Visibility />
                        }
                        onClick={() =>
                          navigate(
                            `/student/bookings/${booking.bookingId}`
                          )
                        }
                      >
                        View Details
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      )}
    </Box>
  );
}

export default MyBookings;