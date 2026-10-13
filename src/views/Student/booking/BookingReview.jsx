import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  EventSeat,
  Payments,
  Schedule,
} from "@mui/icons-material";

import {
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import studentBookingApi
  from "../../../api/studentBookingApi";


// ============================================================
// HELPERS
// ============================================================

const formatMoney = (
  value,
) =>
  new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    },
  ).format(
    Number(
      value ?? 0,
    ),
  );


// ============================================================
// SUMMARY ROW
// ============================================================

function SummaryRow({
  label,
  value,
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      spacing={2}
    >
      <Typography
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        fontWeight={600}
        textAlign="right"
      >
        {value || "-"}
      </Typography>
    </Stack>
  );
}


// ============================================================
// COMPONENT
// ============================================================

function BookingReview() {

  const {
    libraryId,
  } = useParams();

  const location =
    useLocation();

  const navigate =
    useNavigate();


  // ==========================================================
  // ROUTE STATE
  // ==========================================================

  const library =
    location.state
      ?.library ||
    null;

  const selectedPlan =
    location.state
      ?.selectedPlan ||
    null;

  const selectedSeat =
    location.state
      ?.selectedSeat ||
    null;

  const selectedSlot =
    location.state
      ?.selectedSlot ||
    null;

  const startDate =
    location.state
      ?.startDate ||
    null;

  const endDate =
    location.state
      ?.endDate ||
    null;


  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const valid =
    Boolean(
      library?.id &&
      selectedPlan?.id &&
      selectedSeat?.id &&
      selectedSlot?.id &&
      startDate &&
      endDate
    );


  // ==========================================================
  // CREATE BOOKING
  // ==========================================================

  const handleCreateBooking =
    async () => {

      if (!valid) {

        setError(
          "Booking information is incomplete.",
        );

        return;
      }


      try {

        setSubmitting(
          true,
        );

        setError(
          "",
        );


        // ======================================================
        // MEMBERSHIP PLAN
        // ======================================================

        if (!selectedPlan?.id) {

          throw new Error(
            "Membership plan ID is missing. Please select the membership plan again.",
          );
        }


        // ======================================================
        // SEAT
        // ======================================================

        if (!selectedSeat?.id) {

          throw new Error(
            "Seat ID is missing. Please select the seat again.",
          );
        }


        // ======================================================
        // SLOT
        // ======================================================

        if (!selectedSlot?.id) {

          throw new Error(
            "Booking slot ID is missing. Please select the slot again.",
          );
        }


        // ======================================================
        // DATES
        // ======================================================

        if (
          !startDate ||
          !endDate
        ) {

          throw new Error(
            "Booking dates are missing.",
          );
        }


        // ======================================================
        // CREATE BOOKING PAYLOAD
        // ======================================================
        //
        // IMPORTANT:
        //
        // We no longer send amount from React.
        //
        // Backend resolves trusted amount from:
        //
        // membershipPlanId
        //       ↓
        // MembershipPlan
        //       ↓
        // price
        //
        // ======================================================

        const payload = {

          seatId:
            Number(
              selectedSeat.id,
            ),

          slotId:
            Number(
              selectedSlot.id,
            ),

          membershipPlanId:
            Number(
              selectedPlan.id,
            ),

          startDate,

          endDate,
        };


        console.log(
          "Creating booking payload:",
          payload,
        );


        // ======================================================
        // CREATE BOOKING
        // ======================================================

        const booking =
          await studentBookingApi
            .createBooking(
              payload,
            );


        // ======================================================
        // RESOLVE BOOKING ID
        // ======================================================

        const bookingId =
          booking?.bookingId ??
          booking?.id ??
          null;


        if (!bookingId) {

          throw new Error(
            "Booking was created but booking ID was not returned.",
          );
        }


        // ======================================================
        // NAVIGATE TO PAYMENT
        // ======================================================

        navigate(
          "/student/membership/payment",
          {
            state: {

              // ================================================
              // PAYMENT TYPE
              // ================================================

              paymentType:
                "BOOKING",


              // ================================================
              // BOOKING
              // ================================================

              booking,

              bookingId,


              // ================================================
              // DISPLAY / CONTEXT
              // ================================================

              library,

              selectedPlan,

              selectedSeat,

              selectedSlot,

              startDate,

              endDate,
            },
          },
        );

      } catch (
        requestError
      ) {

        console.error(
          "Booking creation failed:",
          requestError,
        );


        setError(

          requestError
            ?.response
            ?.data
            ?.message ||

          requestError
            ?.response
            ?.data
            ?.error ||

          requestError
            ?.message ||

          "Unable to create booking.",
        );

      } finally {

        setSubmitting(
          false,
        );
      }
    };


  // ==========================================================
  // INVALID ROUTE STATE
  // ==========================================================

  if (!valid) {

    return (
      <Box>

        <Alert
          severity="warning"
          sx={{
            mb: 2,
          }}
        >
          Booking information is incomplete.
        </Alert>


        <Button
          variant="contained"
          onClick={() =>
            navigate(
              `/student/libraries/${libraryId}/plans`,
            )
          }
        >
          Start Again
        </Button>

      </Box>
    );
  }


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        maxWidth: 780,
      }}
    >

      {/* ======================================================
          BACK
      ====================================================== */}

      <Button
        startIcon={
          <ArrowBack />
        }
        onClick={() =>
          navigate(
            `/student/libraries/${libraryId}/book-seat`,
            {
              state: {
                library,
                selectedPlan,
              },
            },
          )
        }
        sx={{
          mb: 2,
        }}
      >
        Change Seat
      </Button>


      {/* ======================================================
          HEADER
      ====================================================== */}

      <Typography
        variant="h4"
        fontWeight={800}
      >
        Review Booking
      </Typography>


      <Typography
        color="text.secondary"
        sx={{
          mt: 0.5,
          mb: 3,
        }}
      >
        Confirm your selection before creating the booking.
      </Typography>


      {/* ======================================================
          ERROR
      ====================================================== */}

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


      {/* ======================================================
          MEMBERSHIP
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 2,
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
            Membership
          </Typography>


          <Divider
            sx={{
              my: 2,
            }}
          />


          <Stack
            spacing={1.5}
          >

            <SummaryRow
              label="Library"
              value={
                library?.name
              }
            />


            <SummaryRow
              label="Plan"
              value={
                selectedPlan?.name
              }
            />


            <SummaryRow
              label="Price"
              value={
                formatMoney(
                  selectedPlan?.price,
                )
              }
            />

          </Stack>

        </CardContent>

      </Card>


      {/* ======================================================
          SEAT
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 2,
          border:
            "1px solid",
          borderColor:
            "divider",
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
              Seat
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

            <SummaryRow
              label="Seat"
              value={
                selectedSeat
                  ?.seatNumber
              }
            />


            <SummaryRow
              label="Floor"
              value={
                selectedSeat
                  ?.floorNumber != null

                  ? `Floor ${selectedSeat.floorNumber}`

                  : selectedSeat
                      ?.floorName ||
                    "-"
              }
            />


            <SummaryRow
              label="Start Date"
              value={
                startDate
              }
            />


            <SummaryRow
              label="End Date"
              value={
                endDate
              }
            />

          </Stack>

        </CardContent>

      </Card>


      {/* ======================================================
          SLOT
      ====================================================== */}

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

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >

            <Schedule />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Slot
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

            <SummaryRow
              label="Slot"
              value={
                selectedSlot
                  ?.name
              }
            />


            <SummaryRow
              label="Time"
              value={
                `${
                  selectedSlot
                    ?.startTime ||
                  "-"
                } - ${
                  selectedSlot
                    ?.endTime ||
                  "-"
                }`
              }
            />

          </Stack>


          <Divider
            sx={{
              my: 2,
            }}
          />


          {/* ==================================================
              PAYMENT ACTION
          ================================================== */}

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >

            <Box>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Payable Amount
              </Typography>


              <Typography
                variant="h5"
                fontWeight={800}
                color="primary.main"
              >
                {formatMoney(
                  selectedPlan
                    ?.price,
                )}
              </Typography>

            </Box>


            <Button
              size="large"
              variant="contained"
              disabled={
                submitting
              }
              startIcon={
                submitting
                  ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  )
                  : (
                    <Payments />
                  )
              }
              onClick={
                handleCreateBooking
              }
            >

              {
                submitting
                  ? "Creating Booking..."
                  : "Continue to Payment"
              }

            </Button>

          </Stack>

        </CardContent>

      </Card>

    </Box>
  );
}

export default BookingReview;