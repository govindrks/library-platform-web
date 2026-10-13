import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  CancelOutlined,
  EventSeat,
  Schedule,
} from "@mui/icons-material";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
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


function DetailRow({
  label,
  value,
}) {
  return (
    <Stack
      direction="row"
      justifyContent=
        "space-between"
      spacing={2}
    >
      <Typography
        color=
          "text.secondary"
      >
        {label}
      </Typography>

      <Typography
        fontWeight={600}
        textAlign="right"
      >
        {value ?? "-"}
      </Typography>
    </Stack>
  );
}


function BookingDetails() {
  const {
    bookingId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    booking,
    setBooking,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    cancelling,
    setCancelling,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    cancelOpen,
    setCancelOpen,
  ] = useState(false);


  const loadBooking =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await studentBookingApi
              .getBookingById(
                bookingId
              );

          setBooking(
            response ||
            null
          );
        } catch (requestError) {
          console.error(
            "Failed to load booking:",
            requestError
          );

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            requestError
              ?.message ||
            "Unable to load booking details."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        bookingId,
      ]
    );


  useEffect(() => {
    loadBooking();
  }, [
    loadBooking,
  ]);


  const handleCancel =
    async () => {
      try {
        setCancelling(true);
        setError("");

        const response =
          await studentBookingApi
            .cancelBooking(
              bookingId
            );

        setBooking(
          response
        );

        setCancelOpen(
          false
        );
      } catch (requestError) {
        console.error(
          "Booking cancellation failed:",
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
          requestError
            ?.message ||
          "Unable to cancel booking."
        );
      } finally {
        setCancelling(
          false
        );
      }
    };


  if (loading) {
    return (
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
          Loading booking...
        </Typography>
      </Stack>
    );
  }


  if (
    error &&
    !booking
  ) {
    return (
      <Box>
        <Button
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              "/student/bookings"
            )
          }
          sx={{
            mb: 2,
          }}
        >
          My Bookings
        </Button>

        <Alert
          severity="error"
        >
          {error}
        </Alert>
      </Box>
    );
  }


  const status =
    booking
      ?.bookingStatus ||
    booking
      ?.status;


  const cancellable =
    status !==
      "CANCELLED" &&
    status !==
      "EXPIRED";


  return (
    <Box
      sx={{
        maxWidth: 780,
      }}
    >
      <Button
        startIcon={
          <ArrowBack />
        }
        onClick={() =>
          navigate(
            "/student/bookings"
          )
        }
        sx={{
          mb: 2,
        }}
      >
        My Bookings
      </Button>


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
            Booking Details
          </Typography>

          <Typography
            color=
              "text.secondary"
          >
            Booking #
            {
              booking
                ?.bookingId
            }
          </Typography>
        </Box>

        <Chip
          label={
            formatStatus(
              status
            )
          }
          color={
            status ===
            "ACTIVE"
              ? "success"
              : status ===
                  "PENDING_PAYMENT"
                ? "warning"
                : "default"
          }
          variant="outlined"
        />
      </Stack>


      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
        >
          {error}
        </Alert>
      )}


      <Card
        elevation={0}
        sx={{
          border:
            "1px solid",
          borderColor:
            "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <EventSeat />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Seat Booking
            </Typography>
          </Stack>

          <Divider
            sx={{
              my: 2,
            }}
          />

          <Stack
            spacing={1.5}
          >
            <DetailRow
              label=
                "Seat Number"
              value={
                booking
                  ?.seatNumber
              }
            />

            <DetailRow
              label=
                "Start Date"
              value={
                booking
                  ?.startDate
              }
            />

            <DetailRow
              label=
                "End Date"
              value={
                booking
                  ?.endDate
              }
            />

            <DetailRow
              label="Amount"
              value={
                formatMoney(
                  booking
                    ?.amount
                )
              }
            />
          </Stack>


          {(booking
            ?.slotName ||
            booking
              ?.slotId) && (
            <>
              <Divider
                sx={{
                  my: 2,
                }}
              />

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mb: 2,
                }}
              >
                <Schedule />

                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Booking Slot
                </Typography>
              </Stack>

              <Stack
                spacing={1.5}
              >
                <DetailRow
                  label=
                    "Slot"
                  value={
                    booking
                      ?.slotName
                  }
                />

                <DetailRow
                  label=
                    "Time"
                  value={
                    `${
                      booking
                        ?.slotStartTime ||
                      "-"
                    } - ${
                      booking
                        ?.slotEndTime ||
                      "-"
                    }`
                  }
                />
              </Stack>
            </>
          )}


          <Divider
            sx={{
              my: 2,
            }}
          />

          <DetailRow
            label="Student"
            value={
              booking
                ?.userName
            }
          />


          {cancellable && (
            <Button
              variant="outlined"
              color="error"
              startIcon={
                <CancelOutlined />
              }
              sx={{
                mt: 3,
              }}
              onClick={() =>
                setCancelOpen(
                  true
                )
              }
            >
              Cancel Booking
            </Button>
          )}
        </CardContent>
      </Card>


      <Dialog
        open={cancelOpen}
        onClose={() =>
          !cancelling &&
          setCancelOpen(
            false
          )
        }
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Cancel Booking?
        </DialogTitle>

        <DialogContent>
          <Typography
            color=
              "text.secondary"
          >
            Are you sure you want to cancel booking #
            {
              booking
                ?.bookingId
            }
            ?
          </Typography>
        </DialogContent>

        <DialogActions>
          <Button
            disabled={
              cancelling
            }
            onClick={() =>
              setCancelOpen(
                false
              )
            }
          >
            Keep Booking
          </Button>

          <Button
            color="error"
            variant="contained"
            disabled={
              cancelling
            }
            onClick={
              handleCancel
            }
          >
            {cancelling
              ? "Cancelling..."
              : "Cancel Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BookingDetails;