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
  AccessTime,
  ArrowBack,
  ArrowForward,
  CalendarMonth,
  Payments,
  WorkspacePremium,
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

import studentLibraryApi
  from "../../../api/studentLibraryApi";

import studentMembershipApi
  from "../../../api/studentMembershipApi";


// ============================================================
// HELPERS
// ============================================================

const formatMoney = (
  value
) => {
  const amount =
    Number(
      value ?? 0
    );

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }
  ).format(
    amount
  );
};


const formatPlanType = (
  value
) => {
  if (!value) {
    return "";
  }

  return String(value)
    .replaceAll(
      "_",
      " "
    )
    .toLowerCase()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
};


const formatTime = (
  value
) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .slice(
      0,
      5
    );
};


// ============================================================
// COMPONENT
// ============================================================

function LibraryMembershipPlans() {
  const {
    libraryId,
  } = useParams();

  const navigate =
    useNavigate();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    library,
    setLibrary,
  ] = useState(null);


  const [
    plans,
    setPlans,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // LOAD LIBRARY + PLANS
  // ==========================================================

  const loadData =
    useCallback(
      async () => {
        try {
          setLoading(
            true
          );

          setError("");


          const [
            libraryResponse,
            plansResponse,
          ] =
            await Promise.all([
              studentLibraryApi
                .getById(
                  libraryId
                ),

              studentMembershipApi
                .getLibraryPlans(
                  libraryId
                ),
            ]);


          setLibrary(
            libraryResponse ||
            null
          );


          setPlans(
            Array.isArray(
              plansResponse
            )
              ? plansResponse
              : []
          );

        } catch (
          requestError
        ) {
          console.error(
            "Student membership plans load failed:",
            requestError
          );


          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            requestError
              ?.message ||
            "Unable to load membership plans."
          );

        } finally {
          setLoading(
            false
          );
        }
      },
      [
        libraryId,
      ]
    );


  useEffect(() => {
    loadData();
  }, [
    loadData,
  ]);


  // ==========================================================
  // SELECT PLAN
  // ==========================================================

  const handleSelectPlan =
    (
      selectedPlan
    ) => {

      if (
        !selectedPlan
          ?.id
      ) {
        setError(
          "Selected membership plan is invalid."
        );

        return;
      }


      navigate(
        `/student/libraries/${libraryId}/book-seat`,
        {
          state: {
            selectedPlan,
            library,
          },
        }
      );
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{
          minHeight: 360,
        }}
      >
        <CircularProgress />

        <Typography
          color=
            "text.secondary"
        >
          Loading membership plans...
        </Typography>
      </Stack>
    );
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box>

      {/* ======================================================
          BACK
      ====================================================== */}

      <Button
        startIcon={
          <ArrowBack />
        }
        onClick={() =>
          navigate(
            `/student/libraries/${libraryId}`
          )
        }
        sx={{
          mb: 2,
        }}
      >
        Back to Library
      </Button>


      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box
        sx={{
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          fontWeight={800}
        >
          Membership Plans
        </Typography>


        <Typography
          color="text.secondary"
          sx={{
            mt: 0.5,
          }}
        >
          {library?.name
            ? `Choose a membership plan offered by ${library.name}.`
            : "Choose a membership plan for this library."}
        </Typography>
      </Box>


      {/* ======================================================
          ERROR
      ====================================================== */}

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


      {/* ======================================================
          EMPTY STATE
      ====================================================== */}

      {!error &&
      plans.length ===
        0 ? (
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
            <Typography
              variant="h6"
              fontWeight={700}
            >
              No active membership plans
            </Typography>


            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              This library has not published an active membership plan yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (

        // ======================================================
        // PLAN CARDS
        // ======================================================

        <Grid
          container
          spacing={2.5}
        >
          {plans.map(
            (
              plan
            ) => (
              <Grid
                key={
                  plan.id
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

                      {/* ======================================
                          PLAN HEADER
                      ====================================== */}

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
                            variant="h6"
                            fontWeight={
                              800
                            }
                          >
                            {
                              plan.name
                            }
                          </Typography>


                          {plan
                            .shiftName && (
                            <Typography
                              variant=
                                "body2"
                              color=
                                "text.secondary"
                              sx={{
                                mt: 0.5,
                              }}
                            >
                              {
                                plan.shiftName
                              }
                            </Typography>
                          )}
                        </Box>


                        <Chip
                          size="small"
                          color="success"
                          variant=
                            "outlined"
                          label="Active"
                        />
                      </Stack>


                      {/* ======================================
                          PRICE
                      ====================================== */}

                      <Box>
                        <Typography
                          variant="h4"
                          fontWeight={
                            800
                          }
                          color=
                            "primary.main"
                        >
                          {formatMoney(
                            plan.price
                          )}
                        </Typography>


                        {plan
                          .planType && (
                          <Typography
                            variant=
                              "body2"
                            color=
                              "text.secondary"
                          >
                            {formatPlanType(
                              plan.planType
                            )}
                          </Typography>
                        )}
                      </Box>


                      {/* ======================================
                          DESCRIPTION
                      ====================================== */}

                      {plan
                        .description && (
                        <Typography
                          variant="body2"
                          color=
                            "text.secondary"
                        >
                          {
                            plan.description
                          }
                        </Typography>
                      )}


                      <Divider />


                      {/* ======================================
                          PLAN DETAILS
                      ====================================== */}

                      <Stack
                        spacing={1.25}
                      >

                        {/* DURATION */}

                        {plan
                          .durationDays !=
                          null && (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems=
                              "center"
                          >
                            <CalendarMonth
                              fontSize=
                                "small"
                            />

                            <Typography
                              variant=
                                "body2"
                            >
                              {
                                plan.durationDays
                              }{" "}
                              days
                            </Typography>
                          </Stack>
                        )}


                        {/* SHIFT */}

                        {plan
                          .shiftName && (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems=
                              "center"
                          >
                            <WorkspacePremium
                              fontSize=
                                "small"
                            />

                            <Typography
                              variant=
                                "body2"
                            >
                              {
                                plan.shiftName
                              }
                            </Typography>
                          </Stack>
                        )}


                        {/* PLAN TIME */}

                        {(plan
                          .startTime ||
                          plan
                            .endTime) && (
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems=
                              "center"
                          >
                            <AccessTime
                              fontSize=
                                "small"
                            />

                            <Typography
                              variant=
                                "body2"
                            >
                              {formatTime(
                                plan
                                  .startTime
                              )}
                              {" – "}
                              {formatTime(
                                plan
                                  .endTime
                              )}
                            </Typography>
                          </Stack>
                        )}


                        {/* PAYMENT */}

                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems=
                            "center"
                        >
                          <Payments
                            fontSize=
                              "small"
                          />

                          <Typography
                            variant=
                              "body2"
                          >
                            Payment is completed after seat selection
                          </Typography>
                        </Stack>
                      </Stack>


                      {/* ======================================
                          SELECT PLAN
                      ====================================== */}

                      <Button
                        fullWidth
                        variant=
                          "contained"
                        endIcon={
                          <ArrowForward />
                        }
                        onClick={() =>
                          handleSelectPlan(
                            plan
                          )
                        }
                      >
                        Select Plan
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

export default LibraryMembershipPlans;