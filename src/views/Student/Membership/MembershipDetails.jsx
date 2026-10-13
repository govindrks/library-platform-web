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
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";

import {
  CalendarMonth,
  EventSeat,
  LibraryBooks,
  Refresh,
  WorkspacePremium,
} from "@mui/icons-material";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import studentSubscriptionApi
  from "../../../api/studentSubscriptionApi";


const formatDate = (value) => {

  if (!value) {
    return "-";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};


const formatStatus = (value) => {

  if (!value) {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
};


function calculateProgress(
  startDate,
  endDate,
  daysRemaining
) {

  if (
    !startDate ||
    !endDate
  ) {
    return 0;
  }

  const start =
    new Date(
      `${startDate}T00:00:00`
    );

  const end =
    new Date(
      `${endDate}T00:00:00`
    );

  const totalDays =
    Math.max(
      1,
      Math.ceil(
        (
          end -
          start
        ) /
        (
          1000 *
          60 *
          60 *
          24
        )
      )
    );

  const remaining =
    Math.max(
      0,
      Number(
        daysRemaining ??
        0
      )
    );

  const used =
    totalDays -
    remaining;

  return Math.min(
    100,
    Math.max(
      0,
      (
        used /
        totalDays
      ) *
      100
    )
  );
}


function DetailCard({
  icon,
  title,
  value,
}) {

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
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
          spacing={1.5}
          alignItems="center"
        >
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor:
                "action.hover",
              display: "flex",
              alignItems:
                "center",
              justifyContent:
                "center",
              color:
                "primary.main",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="body2"
              color=
                "text.secondary"
            >
              {title}
            </Typography>

            <Typography
              variant="h6"
              fontWeight={800}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}


function MembershipDetails() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const [
    subscription,
    setSubscription,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const paymentSuccess =
    Boolean(
      location.state
        ?.paymentSuccess
    );


  const loadSubscription =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await studentSubscriptionApi
              .getMySubscription();

          setSubscription(
            response ||
            null
          );

        } catch (requestError) {

          console.error(
            "Failed to load membership:",
            requestError
          );

          setSubscription(
            null
          );

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            requestError
              ?.message ||
            "No active membership was found."
          );

        } finally {

          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {

    loadSubscription();

  }, [
    loadSubscription,
  ]);


  const progress =
    useMemo(
      () =>
        calculateProgress(
          subscription
            ?.startDate,

          subscription
            ?.endDate,

          subscription
            ?.daysRemaining
        ),
      [
        subscription,
      ]
    );


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
          Loading membership...
        </Typography>
      </Stack>
    );
  }


  if (!subscription) {

    return (
      <Box>

        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            mb: 1,
          }}
        >
          My Membership
        </Typography>


        <Alert
          severity="info"
          sx={{
            mt: 2,
            mb: 2,
          }}
        >
          {error ||
            "You do not currently have an active membership."}
        </Alert>


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

      </Box>
    );
  }


  return (
    <Box>

      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent=
          "space-between"
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

          <Typography
            variant="h4"
            fontWeight={800}
          >
            My Membership
          </Typography>


          <Typography
            color=
              "text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            View your current library membership and assigned seat.
          </Typography>

        </Box>


        <Button
          variant="outlined"
          startIcon={
            <Refresh />
          }
          onClick={
            loadSubscription
          }
        >
          Refresh
        </Button>

      </Stack>


      {paymentSuccess && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
          }}
        >
          Payment completed successfully. Your membership is active.
        </Alert>
      )}


      <Card
        elevation={0}
        sx={{
          mb: 3,
          border:
            "1px solid",
          borderColor:
            "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>

          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            justifyContent=
              "space-between"
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            spacing={2}
          >

            <Box>

              <Typography
                variant="body2"
                color=
                  "text.secondary"
              >
                Current Membership
              </Typography>


              <Typography
                variant="h5"
                fontWeight={800}
                sx={{
                  mt: 0.5,
                }}
              >
                {
                  subscription
                    .planName
                }
              </Typography>


              <Typography
                color=
                  "text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                {
                  subscription
                    .libraryName
                }
              </Typography>

            </Box>


            <Chip
              label={
                formatStatus(
                  subscription
                    .status
                )
              }
              color={
                subscription
                  .status ===
                "ACTIVE"
                  ? "success"
                  : "default"
              }
              variant="outlined"
            />

          </Stack>


          <Divider
            sx={{
              my: 3,
            }}
          />


          <Typography
            variant="body2"
            color=
              "text.secondary"
            sx={{
              mb: 1,
            }}
          >
            Membership usage
          </Typography>


          <LinearProgress
            variant="determinate"
            value={
              progress
            }
            sx={{
              height: 8,
              borderRadius: 5,
            }}
          />


          <Stack
            direction="row"
            justifyContent=
              "space-between"
            sx={{
              mt: 1,
            }}
          >

            <Typography
              variant="caption"
              color=
                "text.secondary"
            >
              {
                formatDate(
                  subscription
                    .startDate
                )
              }
            </Typography>


            <Typography
              variant="caption"
              color=
                "text.secondary"
            >
              {
                subscription
                  .daysRemaining
              }{" "}
              days remaining
            </Typography>


            <Typography
              variant="caption"
              color=
                "text.secondary"
            >
              {
                formatDate(
                  subscription
                    .endDate
                )
              }
            </Typography>

          </Stack>

        </CardContent>
      </Card>


      <Grid
        container
        spacing={2}
      >

        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <DetailCard
            icon={
              <LibraryBooks />
            }
            title="Library"
            value={
              subscription
                .libraryName
            }
          />
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <DetailCard
            icon={
              <WorkspacePremium />
            }
            title="Plan"
            value={
              subscription
                .planName
            }
          />
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <DetailCard
            icon={
              <EventSeat />
            }
            title="Assigned Seat"
            value={
              subscription
                .seatNumber
            }
          />
        </Grid>


        <Grid
          size={{
            xs: 12,
            sm: 6,
            lg: 3,
          }}
        >
          <DetailCard
            icon={
              <CalendarMonth />
            }
            title="Valid Until"
            value={
              formatDate(
                subscription
                  .endDate
              )
            }
          />
        </Grid>

      </Grid>


      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        spacing={1.5}
        sx={{
          mt: 3,
        }}
      >

        <Button
          variant="contained"
          onClick={() =>
            navigate(
              "/student/bookings"
            )
          }
        >
          My Bookings
        </Button>


        <Button
          variant="outlined"
          onClick={() =>
            navigate(
              "/student/seat-change"
            )
          }
        >
          Request Seat Change
        </Button>

      </Stack>

    </Box>
  );
}


export default MembershipDetails;