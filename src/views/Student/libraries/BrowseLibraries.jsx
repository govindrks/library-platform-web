import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowForward,
  EventSeat,
  ImageOutlined,
  LocationOn,
  Search,
  Star,
} from "@mui/icons-material";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import studentLibraryApi
  from "../../../api/studentLibraryApi";


// ============================================================
// HELPERS
// ============================================================

const resolveImageUrl = (url) => {
  if (!url) {
    return null;
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  const backendUrl =
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:8080";

  return `${backendUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};


// ============================================================
// COMPONENT
// ============================================================

function BrowseLibraries() {
  const navigate =
    useNavigate();

  const [
    libraries,
    setLibraries,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");


  // ==========================================================
  // LOAD LIBRARIES
  // ==========================================================

  const loadLibraries =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await studentLibraryApi
              .getAll();

          setLibraries(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (requestError) {
          console.error(
            "Student library discovery failed:",
            requestError
          );

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            requestError
              ?.message ||
            "Unable to load libraries."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(() => {
    loadLibraries();
  }, [
    loadLibraries,
  ]);


  // ==========================================================
  // SEARCH
  // ==========================================================

  const handleSearch =
    async (event) => {
      event.preventDefault();

      const value =
        search.trim();

      if (!value) {
        await loadLibraries();

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await studentLibraryApi
            .searchByName(
              value
            );

        setLibraries(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (requestError) {
        console.error(
          "Library search failed:",
          requestError
        );

        setError(
          requestError
            ?.response
            ?.data
            ?.message ||
          requestError
            ?.message ||
          "Unable to search libraries."
        );
      } finally {
        setLoading(false);
      }
    };


  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          lg: "row",
        }}
        justifyContent=
          "space-between"
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
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Browse Libraries
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Discover active libraries,
            available study seats and
            library facilities.
          </Typography>
        </Box>


        <Box
          component="form"
          onSubmit={
            handleSearch
          }
          sx={{
            width: {
              xs: "100%",
              lg: 400,
            },
          }}
        >
          <TextField
            fullWidth
            size="small"
            value={
              search
            }
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder=
              "Search library by name"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment
                    position="start"
                  >
                    <Search />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
      </Stack>


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
          LOADING
      ====================================================== */}

      {loading ? (
        <Stack
          alignItems="center"
          justifyContent="center"
          spacing={2}
          sx={{
            minHeight: 320,
          }}
        >
          <CircularProgress />

          <Typography
            color="text.secondary"
          >
            Loading libraries...
          </Typography>
        </Stack>
      ) : libraries.length ===
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
              No libraries found
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 0.5,
              }}
            >
              Try searching with another
              library name.
            </Typography>
          </CardContent>
        </Card>
      ) : (

        // ======================================================
        // LIBRARY CARDS
        // ======================================================

        <Grid
          container
          spacing={2.5}
        >
          {libraries.map(
            (library) => {
              const coverImage =
                resolveImageUrl(
                  library
                    .coverImageUrl
                );

              const totalSeats =
                Number(
                  library
                    .totalSeats ??
                  0
                );

              const availableSeats =
                Number(
                  library
                    .availableSeats ??
                  0
                );

              return (
                <Grid
                  key={
                    library.id
                  }
                  size={{
                    xs: 12,
                    sm: 6,
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
                      overflow:
                        "hidden",
                      transition:
                        "0.2s ease",

                      "&:hover": {
                        transform:
                          "translateY(-3px)",
                        boxShadow: 3,
                      },
                    }}
                  >

                    {/* IMAGE */}

                    <Box
                      sx={{
                        position:
                          "relative",
                        height: 200,
                        bgcolor:
                          "action.hover",
                        overflow:
                          "hidden",
                      }}
                    >
                      {coverImage ? (
                        <Box
                          component="img"
                          src={
                            coverImage
                          }
                          alt={
                            library
                              .name
                          }
                          sx={{
                            width:
                              "100%",
                            height:
                              "100%",
                            objectFit:
                              "cover",
                          }}
                        />
                      ) : (
                        <Stack
                          sx={{
                            height:
                              "100%",
                          }}
                          alignItems=
                            "center"
                          justifyContent=
                            "center"
                          spacing={1}
                        >
                          <ImageOutlined
                            sx={{
                              fontSize:
                                42,
                              color:
                                "text.disabled",
                            }}
                          />

                          <Typography
                            variant=
                              "body2"
                            color=
                              "text.secondary"
                          >
                            No cover image
                          </Typography>
                        </Stack>
                      )}

                      <Chip
                        size="small"
                        label={`${availableSeats} seats available`}
                        color={
                          availableSeats >
                          0
                            ? "success"
                            : "default"
                        }
                        sx={{
                          position:
                            "absolute",
                          top: 12,
                          right: 12,
                          bgcolor:
                            "background.paper",
                        }}
                      />
                    </Box>


                    {/* CONTENT */}

                    <CardContent>
                      <Stack
                        spacing={1.75}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            fontWeight={
                              800
                            }
                          >
                            {
                              library
                                .name
                            }
                          </Typography>

                          <Stack
                            direction=
                              "row"
                            spacing={
                              0.75
                            }
                            alignItems=
                              "center"
                            sx={{
                              mt: 0.5,
                            }}
                          >
                            <LocationOn
                              fontSize=
                                "small"
                              color=
                                "action"
                            />

                            <Typography
                              variant=
                                "body2"
                              color=
                                "text.secondary"
                            >
                              {library
                                .city ||
                                "Location unavailable"}
                            </Typography>
                          </Stack>
                        </Box>


                        {/* RATING */}

                        {library
                          .averageRating !=
                          null && (
                          <Stack
                            direction=
                              "row"
                            spacing={1}
                            alignItems=
                              "center"
                          >
                            <Star
                              fontSize=
                                "small"
                              sx={{
                                color:
                                  "warning.main",
                              }}
                            />

                            <Typography
                              variant=
                                "body2"
                              fontWeight={
                                700
                              }
                            >
                              {
                                library
                                  .averageRating
                              }
                            </Typography>

                            <Typography
                              variant=
                                "body2"
                              color=
                                "text.secondary"
                            >
                              (
                              {library
                                .reviewCount ??
                                0}{" "}
                              reviews)
                            </Typography>
                          </Stack>
                        )}


                        {/* SEATS */}

                        <Stack
                          direction=
                            "row"
                          spacing={1}
                          flexWrap=
                            "wrap"
                          useFlexGap
                        >
                          <Chip
                            size=
                              "small"
                            icon={
                              <EventSeat />
                            }
                            label={`${availableSeats} Available`}
                          />

                          <Chip
                            size=
                              "small"
                            variant=
                              "outlined"
                            label={`${totalSeats} Total`}
                          />
                        </Stack>


                        {/* ACTION */}

                        <Button
                          variant=
                            "contained"
                          fullWidth
                          endIcon={
                            <ArrowForward />
                          }
                          onClick={() =>
                            navigate(
                              `/student/libraries/${library.id}`
                            )
                          }
                        >
                          View Library
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            }
          )}
        </Grid>
      )}
    </Box>
  );
}

export default BrowseLibraries;