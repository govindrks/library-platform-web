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
  Call,
  Description,
  EventSeat,
  ImageOutlined,
  LocationOn,
  Map,
  Place,
  Star,
  Wifi,
  WorkspacePremium,
} from "@mui/icons-material";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
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


const getAmenityName = (
  amenity
) => {
  if (
    amenity == null
  ) {
    return null;
  }

  if (
    typeof amenity ===
    "string"
  ) {
    return amenity;
  }

  return (
    amenity.name ||
    amenity.amenityName ||
    amenity.label ||
    null
  );
};


const formatTime = (
  value
) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .slice(0, 5);
};


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  icon,
  value,
  label,
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
          alignItems="center"
          justifyContent=
            "center"
          spacing={2}
        >
          <Box
            sx={{
              color:
                "primary.main",
              display: "flex",
            }}
          >
            {icon}
          </Box>

          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
            >
              {value}
            </Typography>

            <Typography
              color=
                "text.secondary"
            >
              {label}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}


// ============================================================
// COMPONENT
// ============================================================

function StudentLibraryDetails() {
  const {
    libraryId,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    library,
    setLibrary,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useState(0);


  // ==========================================================
  // LOAD LIBRARY
  // ==========================================================

  const loadLibrary =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await studentLibraryApi
              .getById(
                libraryId
              );

          setLibrary(
            data || null
          );
        } catch (requestError) {
          console.error(
            "Student library details failed:",
            requestError
          );

          setError(
            requestError
              ?.response
              ?.data
              ?.message ||
            requestError
              ?.message ||
            "Unable to load library details."
          );
        } finally {
          setLoading(false);
        }
      },
      [
        libraryId,
      ]
    );


  useEffect(() => {
    loadLibrary();
  }, [
    loadLibrary,
  ]);


  // ==========================================================
  // NORMALIZED DATA
  // ==========================================================

  const amenities =
    useMemo(
      () => {
        if (
          !Array.isArray(
            library?.amenities
          )
        ) {
          return [];
        }

        return library
          .amenities
          .map(
            getAmenityName
          )
          .filter(Boolean);
      },
      [
        library,
      ]
    );


  const galleryImages =
    useMemo(
      () => {
        if (!library) {
          return [];
        }

        const images =
          Array.isArray(
            library.images
          )
            ? library.images
            : [];

        const normalized =
          images
            .map(
              (image) => ({
                ...image,

                resolvedUrl:
                  resolveImageUrl(
                    image
                      ?.imageUrl
                  ),
              })
            )
            .filter(
              (image) =>
                image
                  .resolvedUrl
            );

        const coverUrl =
          resolveImageUrl(
            library
              .coverImageUrl
          );

        if (
          coverUrl &&
          !normalized.some(
            (image) =>
              image
                .resolvedUrl ===
              coverUrl
          )
        ) {
          normalized.unshift({
            id: "cover",
            imageUrl:
              library
                .coverImageUrl,
            resolvedUrl:
              coverUrl,
            imageType:
              "Cover",
          });
        }

        return normalized;
      },
      [
        library,
      ]
    );


  if (loading) {
    return (
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={2}
        sx={{
          minHeight: 400,
        }}
      >
        <CircularProgress />

        <Typography
          color=
            "text.secondary"
        >
          Loading library...
        </Typography>
      </Stack>
    );
  }


  if (
    error ||
    !library
  ) {
    return (
      <Box>
        <Button
          startIcon={
            <ArrowBack />
          }
          onClick={() =>
            navigate(
              "/student/libraries"
            )
          }
          sx={{
            mb: 2,
          }}
        >
          Back to Libraries
        </Button>

        <Alert
          severity="error"
        >
          {error ||
            "Library not found."}
        </Alert>
      </Box>
    );
  }


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

  const occupiedSeats =
    Math.max(
      0,
      totalSeats -
        availableSeats
    );

  const occupancy =
    totalSeats > 0
      ? Math.round(
          (
            occupiedSeats /
            totalSeats
          ) *
            100
        )
      : 0;


  const address = [
    library.address,
    library.city,
    library.state,
  ]
    .filter(Boolean)
    .join(", ");


  const latitude =
    library.latitude ??
    library.lat ??
    null;

  const longitude =
    library.longitude ??
    library.lng ??
    library.lon ??
    null;


  const selectedImage =
    galleryImages[
      selectedImageIndex
    ] ||
    galleryImages[0] ||
    null;


  const mapAvailable =
    latitude != null &&
    longitude != null;


  // ==========================================================
  // UI
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
            "/student/libraries"
          )
        }
        sx={{
          mb: 2,
        }}
      >
        Back to Libraries
      </Button>


      {/* ======================================================
          HERO
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid",
          borderColor:
            "divider",
          borderRadius: 3,
          overflow:
            "hidden",
          mb: 2.5,
        }}
      >
        <Grid
          container
        >

          {/* IMAGE */}

          <Grid
            size={{
              xs: 12,
              lg: 7,
            }}
          >
            <Box
              sx={{
                height: {
                  xs: 260,
                  md: 360,
                },
                bgcolor:
                  "action.hover",
                position:
                  "relative",
              }}
            >
              {selectedImage ? (
                <Box
                  component="img"
                  src={
                    selectedImage
                      .resolvedUrl
                  }
                  alt={
                    library.name
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
                        56,
                      color:
                        "text.disabled",
                    }}
                  />

                  <Typography
                    color=
                      "text.secondary"
                  >
                    No library
                    image available
                  </Typography>
                </Stack>
              )}


              {galleryImages.length >
                1 && (
                <Chip
                  size="small"
                  label={`${
                    selectedImageIndex +
                    1
                  } / ${
                    galleryImages.length
                  }`}
                  sx={{
                    position:
                      "absolute",
                    right: 16,
                    bottom: 16,
                    bgcolor:
                      "background.paper",
                  }}
                />
              )}
            </Box>
          </Grid>


          {/* DETAILS */}

          <Grid
            size={{
              xs: 12,
              lg: 5,
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 4,
                },
              }}
            >
              <Typography
                variant="h3"
                fontWeight={800}
                sx={{
                  fontSize: {
                    xs:
                      "2rem",
                    md:
                      "2.7rem",
                  },
                }}
              >
                {library.name}
              </Typography>


              {/* RATING */}

              {library
                .averageRating !=
                null && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems=
                    "center"
                  sx={{
                    mt: 1.5,
                  }}
                >
                  <Star
                    sx={{
                      color:
                        "warning.main",
                    }}
                  />

                  <Typography
                    fontWeight={
                      800
                    }
                  >
                    {
                      library
                        .averageRating
                    }
                  </Typography>

                  <Typography
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


              {/* LOCATION */}

              {address && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems=
                    "flex-start"
                  sx={{
                    mt: 2,
                  }}
                >
                  <LocationOn
                    color=
                      "primary"
                  />

                  <Typography>
                    {address}
                  </Typography>
                </Stack>
              )}


              {/* HOURS */}

              <Stack
                direction="row"
                spacing={1}
                alignItems=
                  "center"
                sx={{
                  mt: 2,
                }}
              >
                <AccessTime
                  color=
                    "primary"
                />

                <Typography>
                  {formatTime(
                    library
                      .openingTime
                  )}{" "}
                  -{" "}
                  {formatTime(
                    library
                      .closingTime
                  )}
                </Typography>
              </Stack>


              {/* ACTIONS */}

              <Stack
                spacing={1.5}
                sx={{
                  mt: 3,
                }}
              >
                <Button
                  variant=
                    "contained"
                  size="large"
                  startIcon={
                    <WorkspacePremium />
                  }
                  endIcon={
                    <ArrowForward />
                  }
                  onClick={() =>
                    navigate(
                      `/student/libraries/${libraryId}/plans`,
                      {
                        state: {
                          library,
                        },
                      }
                    )
                  }
                >
                  View Membership Plans
                </Button>

                <Button
                  variant=
                    "outlined"
                  size="large"
                  startIcon={
                    <EventSeat />
                  }
                  onClick={() =>
                    navigate(
                      `/student/libraries/${libraryId}/seats`,
                      {
                        state: {
                          library,
                        },
                      }
                    )
                  }
                >
                  Check Seat Availability
                </Button>
              </Stack>
            </CardContent>
          </Grid>
        </Grid>
      </Card>


      {/* ======================================================
          SEAT STATISTICS
      ====================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 2.5,
        }}
      >
        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <StatCard
            icon={
              <EventSeat
                sx={{
                  fontSize:
                    42,
                }}
              />
            }
            value={
              totalSeats
            }
            label=
              "Total Seats"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <StatCard
            icon={
              <EventSeat
                color=
                  "success"
                sx={{
                  fontSize:
                    42,
                }}
              />
            }
            value={
              availableSeats
            }
            label=
              "Available Seats"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <StatCard
            icon={
              <EventSeat
                color=
                  "disabled"
                sx={{
                  fontSize:
                    42,
                }}
              />
            }
            value={`${occupancy}%`}
            label={`${occupiedSeats} Occupied`}
          />
        </Grid>
      </Grid>


      {/* ======================================================
          ABOUT + OPERATING HOURS
      ====================================================== */}

      <Grid
        container
        spacing={2}
        sx={{
          mb: 2.5,
        }}
      >
        <Grid
          size={{
            xs: 12,
            lg: 7,
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
                direction="row"
                spacing={1.5}
                alignItems=
                  "center"
                sx={{
                  mb: 2,
                }}
              >
                <Description
                  color=
                    "primary"
                />

                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  About Library
                </Typography>
              </Stack>

              <Typography
                color=
                  "text.secondary"
                lineHeight={1.75}
              >
                {library
                  .description ||
                  "No description has been provided for this library yet."}
              </Typography>
            </CardContent>
          </Card>
        </Grid>


        <Grid
          size={{
            xs: 12,
            lg: 5,
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
                direction="row"
                spacing={1.5}
                alignItems=
                  "center"
                sx={{
                  mb: 2,
                }}
              >
                <AccessTime
                  color=
                    "primary"
                />

                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  Operating Hours
                </Typography>
              </Stack>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor:
                    "action.hover",
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={800}
                >
                  {formatTime(
                    library
                      .openingTime
                  )}{" "}
                  -{" "}
                  {formatTime(
                    library
                      .closingTime
                  )}
                </Typography>

                <Typography
                  variant="body2"
                  color=
                    "text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Library operating
                  hours
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* ======================================================
          AMENITIES
      ====================================================== */}

      <Card
        elevation={0}
        sx={{
          border:
            "1px solid",
          borderColor:
            "divider",
          borderRadius: 3,
          mb: 2.5,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mb: 2,
            }}
          >
            <Wifi
              color=
                "primary"
            />

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Amenities
            </Typography>
          </Stack>


          {amenities.length ===
          0 ? (
            <Typography
              color=
                "text.secondary"
            >
              No amenities are
              currently listed.
            </Typography>
          ) : (
            <Grid
              container
              spacing={1.5}
            >
              {amenities.map(
                (
                  amenity,
                  index
                ) => (
                  <Grid
                    key={`${amenity}-${index}`}
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 4,
                      lg: 3,
                    }}
                  >
                    <Box
                      sx={{
                        border:
                          "1px solid",
                        borderColor:
                          "divider",
                        borderRadius:
                          2,
                        p: 1.5,
                        textAlign:
                          "center",
                        bgcolor:
                          "background.paper",
                      }}
                    >
                      <Typography
                        fontWeight={
                          600
                        }
                      >
                        {amenity}
                      </Typography>
                    </Box>
                  </Grid>
                )
              )}
            </Grid>
          )}
        </CardContent>
      </Card>


      {/* ======================================================
          GALLERY
      ====================================================== */}

      {galleryImages.length >
        0 && (
        <Card
          elevation={0}
          sx={{
            border:
              "1px solid",
            borderColor:
              "divider",
            borderRadius: 3,
            mb: 2.5,
          }}
        >
          <CardContent>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems=
                "center"
              sx={{
                mb: 2,
              }}
            >
              <ImageOutlined
                color=
                  "primary"
              />

              <Typography
                variant="h6"
                fontWeight={800}
              >
                Library Gallery
              </Typography>
            </Stack>


            <Grid
              container
              spacing={1.5}
            >
              {galleryImages.map(
                (
                  image,
                  index
                ) => (
                  <Grid
                    key={
                      image.id ||
                      `${image.resolvedUrl}-${index}`
                    }
                    size={{
                      xs: 12,
                      sm: 6,
                      md: 3,
                    }}
                  >
                    <Box
                      onClick={() =>
                        setSelectedImageIndex(
                          index
                        )
                      }
                      sx={{
                        cursor:
                          "pointer",
                        border:
                          "2px solid",
                        borderColor:
                          selectedImageIndex ===
                          index
                            ? "primary.main"
                            : "transparent",
                        borderRadius:
                          2,
                        overflow:
                          "hidden",
                      }}
                    >
                      <Box
                        component="img"
                        src={
                          image
                            .resolvedUrl
                        }
                        alt={
                          image
                            .imageType ||
                          library.name
                        }
                        sx={{
                          width:
                            "100%",
                          height: 170,
                          objectFit:
                            "cover",
                          display:
                            "block",
                        }}
                      />
                    </Box>
                  </Grid>
                )
              )}
            </Grid>
          </CardContent>
        </Card>
      )}


      {/* ======================================================
          CONTACT & LOCATION
      ====================================================== */}

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
            spacing={1.5}
            alignItems="center"
            sx={{
              mb: 2,
            }}
          >
            <Place
              color=
                "primary"
            />

            <Typography
              variant="h6"
              fontWeight={800}
            >
              Contact & Location
            </Typography>
          </Stack>


          <Grid
            container
            spacing={2}
          >

            {/* CONTACT */}

            <Grid
              size={{
                xs: 12,
                lg: 5,
              }}
            >
              <Box
                sx={{
                  p: 2.5,
                  height:
                    "100%",
                  borderRadius: 2,
                  bgcolor:
                    "action.hover",
                }}
              >
                {address && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems=
                      "flex-start"
                    sx={{
                      mb: 2,
                    }}
                  >
                    <LocationOn
                      color=
                        "primary"
                    />

                    <Typography>
                      {address}
                    </Typography>
                  </Stack>
                )}


                {library
                  .contactNumber && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems=
                      "center"
                    sx={{
                      mb: 2,
                    }}
                  >
                    <Call
                      color=
                        "primary"
                    />

                    <Typography>
                      {
                        library
                          .contactNumber
                      }
                    </Typography>
                  </Stack>
                )}


                {mapAvailable && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems=
                      "center"
                  >
                    <Map
                      color=
                        "primary"
                    />

                    <Typography
                      variant=
                        "body2"
                      color=
                        "text.secondary"
                    >
                      {latitude},{" "}
                      {longitude}
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Grid>


            {/* MAP */}

            <Grid
              size={{
                xs: 12,
                lg: 7,
              }}
            >
              {mapAvailable ? (
                <Box
                  component="iframe"
                  title={`${library.name} location`}
                  src={`https://www.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
                  sx={{
                    border: 0,
                    width:
                      "100%",
                    height: 280,
                    borderRadius:
                      2,
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: 280,
                    borderRadius: 2,
                    bgcolor:
                      "action.hover",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <Stack
                    alignItems=
                      "center"
                    spacing={1}
                  >
                    <Map
                      sx={{
                        fontSize:
                          42,
                        color:
                          "text.disabled",
                      }}
                    />

                    <Typography
                      color=
                        "text.secondary"
                    >
                      Map coordinates
                      unavailable.
                    </Typography>
                  </Stack>
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

    </Box>
  );
}

export default StudentLibraryDetails;