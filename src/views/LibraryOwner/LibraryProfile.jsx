import {
  AddPhotoAlternateOutlined,
  CheckCircle,
  CloudUploadOutlined,
  DeleteOutlineOutlined,
  Edit,
  EventSeat,
  ImageOutlined,
  LocationOn,
  LockOutlined,
  MoreVert,
  MyLocation,
  PhotoCameraOutlined,
  PublicOutlined,
  Save,
  Star,
  VisibilityOffOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import libraryApi from "../../api/libraryApi";
import getImageUrl from "../../utility/imageUrl";

// ============================================================
// GOOGLE MAPS
// ============================================================

const GOOGLE_MAPS_SCRIPT_ID = "libraryhub-google-maps-script";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// ============================================================
// IMAGE TYPES
// ============================================================

const IMAGE_TYPES = [
  {
    value: "LOGO",
    label: "Logo",
  },
  {
    value: "COVER",
    label: "Cover / Banner",
  },
  {
    value: "FRONT",
    label: "Front View",
  },
  {
    value: "READING_HALL",
    label: "Reading Hall",
  },
  {
    value: "CABIN",
    label: "Cabin",
  },
  {
    value: "PARKING",
    label: "Parking",
  },
  {
    value: "CAFETERIA",
    label: "Cafeteria",
  },
];

// ============================================================
// IMAGE ROLES
// ============================================================

const IMAGE_ROLES = {
  PROFILE: "PROFILE",
  COVER: "COVER",
  GALLERY: "GALLERY",
};

// ============================================================
// EMPTY LIBRARY
// ============================================================

const EMPTY_LIBRARY = {
  id: null,

  libraryName: "",
  description: "",

  address: "",
  city: "",
  state: "",
  pincode: "",

  phone: "",
  email: "",

  openingTime: "",
  closingTime: "",
  open24Hours: false,

  totalSeats: 0,
  availableSeats: 0,

  latitude: null,
  longitude: null,
  googlePlaceId: "",

  status: "DRAFT",

  coverImageUrl: "",
  profileImageUrl: "",

  amenities: [],
  customAmenities: [],
  images: [],
};

// ============================================================
// HELPERS
// ============================================================

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

const normalizeTime = (value) => {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 5);
};

const displayEnum = (value) => {
  if (!value) {
    return "-";
  }

  return String(value)
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const getImageTypeHint = (type) => {
  switch (type) {
    case "LOGO":
      return "Library branding logo. Square PNG or transparent logo recommended.";

    case "COVER":
      return "Wide landscape image suitable for the library banner.";

    case "FRONT":
      return "Exterior/front-side photograph recommended.";

    case "READING_HALL":
      return "Interior reading hall photograph recommended.";

    case "CABIN":
      return "Private cabin or study-room photograph recommended.";

    case "PARKING":
      return "Parking area photograph recommended.";

    case "CAFETERIA":
      return "Cafeteria or refreshment-area photograph recommended.";

    default:
      return "";
  }
};

// ============================================================
// IMAGE ROLE
// ============================================================

const resolveImageRole = (image) => {
  if (image?.imageRole) {
    return image.imageRole;
  }

  if (image?.profile) {
    return IMAGE_ROLES.PROFILE;
  }

  if (image?.cover) {
    return IMAGE_ROLES.COVER;
  }

  return IMAGE_ROLES.GALLERY;
};

// ============================================================
// IMAGE VISIBILITY
// ============================================================

const isAlwaysPublicImage = (image) => {
  const role = resolveImageRole(image);

  return (
    image?.imageType === "LOGO" ||
    role === IMAGE_ROLES.PROFILE ||
    role === IMAGE_ROLES.COVER
  );
};

const isImagePublic = (image) => {
  if (isAlwaysPublicImage(image)) {
    return true;
  }

  return image?.publicVisible === true;
};

// ============================================================
// GOOGLE MAP LOADER
// ============================================================

const loadGoogleMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve(window.google);

      return;
    }

    const existingScript = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.google), {
        once: true,
      });

      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Google Maps.")),
        {
          once: true,
        },
      );

      return;
    }

    if (!GOOGLE_MAPS_API_KEY) {
      reject(new Error("VITE_GOOGLE_MAPS_API_KEY is not configured."));

      return;
    }

    const script = document.createElement("script");

    script.id = GOOGLE_MAPS_SCRIPT_ID;

    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&loading=async&libraries=places&v=weekly`;

    script.async = true;
    script.defer = true;

    script.onload = () => resolve(window.google);

    script.onerror = () => reject(new Error("Unable to load Google Maps."));

    document.head.appendChild(script);
  });
};

// ============================================================
// ADDRESS PARSER
// ============================================================

const parseAddressComponents = (components = []) => {
  const find = (...types) => {
    const component = components.find((item) =>
      types.some((type) => item.types?.includes(type)),
    );

    return component?.long_name || component?.longText || "";
  };

  return {
    city:
      find("locality") ||
      find("administrative_area_level_3") ||
      find("administrative_area_level_2"),

    state: find("administrative_area_level_1"),

    pincode: find("postal_code"),
  };
};

// ============================================================
// PREMIUM UI COMPONENTS
// ============================================================

function PremiumSection({
  icon,
  title,
  description,
  action,
  children,
  sx = {},
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: alpha(theme.palette.divider, 0.82),
        bgcolor: "background.paper",
        overflow: "hidden",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 20px 54px rgba(0,0,0,0.18)"
            : "0 18px 50px rgba(15,23,42,0.055)",
        ...sx,
      }}
    >
      <Box
        sx={{
          px: { xs: 2.25, md: 3 },
          pt: { xs: 2.25, md: 2.75 },
          pb: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems={{ xs: "stretch", md: "center" }}
          justifyContent="space-between"
          gap={{ xs: 1.5, md: 2 }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.085),
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.12),
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>

            <Box
              sx={{
                flex: 1,
                minWidth: 0,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.25,
                }}
              >
                {title}
              </Typography>

              {description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.35 }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </Stack>

          {action && (
            <Box
              sx={{
                flexShrink: 0,
                width: { xs: "100%", md: "auto" },
                display: "flex",
                justifyContent: { xs: "flex-start", md: "flex-end" },
              }}
            >
              {action}
            </Box>
          )}
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ p: { xs: 2.25, md: 3 } }}>{children}</Box>
    </Card>
  );
}

function MetricTile({ icon, label, value, helper, tone = "primary" }) {
  const theme = useTheme();
  const palette = theme.palette[tone] || theme.palette.primary;

  return (
    <Box
      sx={{
        height: "100%",
        borderRadius: 3,
        p: 2.1,
        border: "1px solid",
        borderColor: alpha(palette.main, 0.14),
        bgcolor: alpha(palette.main, 0.045),
      }}
    >
      <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="body2" color="text.secondary" fontWeight={650}>
            {label}
          </Typography>

          <Typography
            variant="h4"
            sx={{
              mt: 0.45,
              fontWeight: 850,
              letterSpacing: "-0.04em",
            }}
          >
            {value}
          </Typography>

          {helper && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mt: 0.5 }}
            >
              {helper}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            width: 42,
            height: 42,
            display: "grid",
            placeItems: "center",
            borderRadius: 2.25,
            color: palette.main,
            bgcolor: alpha(palette.main, 0.1),
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function LibraryProfile() {
  const theme = useTheme();

  // ==========================================================
  // LIBRARY STATE
  // ==========================================================

  const [library, setLibrary] = useState(EMPTY_LIBRARY);

  const [originalLibrary, setOriginalLibrary] = useState(EMPTY_LIBRARY);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // MAP STATE
  // ==========================================================

  const mapContainerRef = useRef(null);

  const autocompleteContainerRef = useRef(null);

  const mapRef = useRef(null);

  const markerRef = useRef(null);

  const geocoderRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  const [locating, setLocating] = useState(false);

  const [geocoding, setGeocoding] = useState(false);

  // ==========================================================
  // IMAGE STATE
  // ==========================================================

  const fileInputRef = useRef(null);

  const [uploadType, setUploadType] = useState("READING_HALL");

  const [uploadRole, setUploadRole] = useState(IMAGE_ROLES.GALLERY);

  const [uploadPublic, setUploadPublic] = useState(true);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [imageBusyId, setImageBusyId] = useState(null);

  const [imageMenuAnchor, setImageMenuAnchor] = useState(null);

  const [selectedMenuImage, setSelectedMenuImage] = useState(null);

  // ==========================================================
  // DERIVED MEDIA
  // ==========================================================

  const logoImage = useMemo(
    () => library.images.find((image) => image.imageType === "LOGO") || null,
    [library.images],
  );

  const profileImage = useMemo(
    () =>
      library.images.find(
        (image) => resolveImageRole(image) === IMAGE_ROLES.PROFILE,
      ) || null,
    [library.images],
  );

  const coverImage = useMemo(
    () =>
      library.images.find(
        (image) => resolveImageRole(image) === IMAGE_ROLES.COVER,
      ) || null,
    [library.images],
  );

  /*
   * PROFILE/COVER role is authoritative.
   *
   * Library.profileImageUrl and coverImageUrl are synchronized
   * backend fields and are used only as fallback URLs.
   */

  const resolvedProfileImageUrl =
    profileImage?.imageUrl || library.profileImageUrl || "";

  const resolvedCoverImageUrl =
    coverImage?.imageUrl || library.coverImageUrl || "";

  /*
   * LOGO must not be counted as ordinary gallery content.
   */

  const publicGalleryImages = useMemo(
    () =>
      library.images.filter(
        (image) =>
          resolveImageRole(image) === IMAGE_ROLES.GALLERY &&
          image.imageType !== "LOGO" &&
          isImagePublic(image),
      ),
    [library.images],
  );

  const privateGalleryImages = useMemo(
    () =>
      library.images.filter(
        (image) =>
          resolveImageRole(image) === IMAGE_ROLES.GALLERY &&
          image.imageType !== "LOGO" &&
          !isImagePublic(image),
      ),
    [library.images],
  );

  // ==========================================================
  // MAP BACKEND RESPONSE
  // ==========================================================

  const mapDetails = useCallback((details, fallback = {}) => {
    const detailImages = Array.isArray(details?.images) ? details.images : [];

    return {
      id: details?.id ?? fallback?.id ?? null,

      libraryName: details?.name ?? fallback?.name ?? "",

      description: details?.description ?? fallback?.description ?? "",

      address: details?.address ?? fallback?.address ?? "",

      city: details?.city ?? fallback?.city ?? "",

      state: details?.state ?? fallback?.state ?? "",

      pincode: details?.pincode ?? fallback?.pincode ?? "",

      phone: details?.contactNumber ?? fallback?.contactNumber ?? "",

      email: details?.email ?? fallback?.email ?? "",

      open24Hours: Boolean(
        details?.open24Hours ?? fallback?.open24Hours ?? false,
      ),

      openingTime: normalizeTime(details?.openingTime ?? fallback?.openingTime),

      closingTime: normalizeTime(details?.closingTime ?? fallback?.closingTime),

      totalSeats: Number(details?.totalSeats ?? fallback?.totalSeats ?? 0),

      availableSeats: Number(details?.availableSeats ?? 0),

      latitude: details?.latitude ?? fallback?.latitude ?? null,

      longitude: details?.longitude ?? fallback?.longitude ?? null,

      googlePlaceId: details?.googlePlaceId ?? fallback?.googlePlaceId ?? "",

      status: details?.status ?? fallback?.status ?? "DRAFT",

      coverImageUrl: details?.coverImageUrl ?? fallback?.coverImageUrl ?? "",

      profileImageUrl:
        details?.profileImageUrl ?? fallback?.profileImageUrl ?? "",

      amenities: Array.isArray(details?.amenities) ? details.amenities : [],

      customAmenities: Array.isArray(details?.customAmenities)
        ? details.customAmenities
        : [],

      images: detailImages,
    };
  }, []);

  // ==========================================================
  // REFRESH LIBRARY
  // ==========================================================

  const refreshLibrary = useCallback(
    async (libraryId, fallback = {}) => {
      const response = await libraryApi.getOwnerLibraryDetails(libraryId);

      const mapped = mapDetails(response, fallback);

      setLibrary(mapped);

      setOriginalLibrary(mapped);

      return mapped;
    },
    [mapDetails],
  );

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const libraries = await libraryApi.getMyLibraries();

      if (!Array.isArray(libraries) || libraries.length === 0) {
        setError("No library is associated with your account.");

        return;
      }

      const currentLibrary = libraries[0];

      await refreshLibrary(currentLibrary.id, currentLibrary);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to load library profile."),
      );
    } finally {
      setLoading(false);
    }
  }, [refreshLibrary]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setLibrary((previous) => {
      const nextValue = type === "checkbox" ? checked : value;

      const next = {
        ...previous,
        [name]: nextValue,
      };

      /*
       * When enabling 24-hour operation, remove local
       * opening/closing times immediately so the frontend
       * accurately represents what will be persisted.
       */
      if (name === "open24Hours" && checked === true) {
        next.openingTime = "";

        next.closingTime = "";
      }

      return next;
    });

    setError("");
    setSuccess("");
  };

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSave = async () => {
    if (!library.libraryName?.trim()) {
      setError("Library name is required.");

      return;
    }

    if (!library.address?.trim()) {
      setError("Library address is required.");

      return;
    }

    if (!library.city?.trim()) {
      setError("Library city is required.");

      return;
    }

    if (!library.state?.trim()) {
      setError("Library state is required.");

      return;
    }

    if (!library.pincode?.trim()) {
      setError("Library pincode is required.");

      return;
    }

    if (!library.open24Hours && !library.openingTime) {
      setError(
        "Opening time is required when the library is not open 24 hours.",
      );

      return;
    }

    if (!library.open24Hours && !library.closingTime) {
      setError(
        "Closing time is required when the library is not open 24 hours.",
      );

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        name: library.libraryName.trim(),

        description: library.description?.trim() || null,

        address: library.address.trim(),

        city: library.city.trim(),

        state: library.state.trim(),

        pincode: library.pincode.trim(),

        contactNumber: library.phone?.trim() || null,

        email: library.email?.trim() || null,

        latitude:
          library.latitude === null || library.latitude === ""
            ? null
            : Number(library.latitude),

        longitude:
          library.longitude === null || library.longitude === ""
            ? null
            : Number(library.longitude),

        googlePlaceId: library.googlePlaceId || null,

        open24Hours: Boolean(library.open24Hours),

        openingTime: library.open24Hours ? null : library.openingTime || null,

        closingTime: library.open24Hours ? null : library.closingTime || null,
      };

      await libraryApi.updateLibrary(library.id, payload);

      await refreshLibrary(library.id, library);

      setEditing(false);

      setSuccess("Library profile updated successfully.");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to update library profile."),
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  const handleCancel = () => {
    setLibrary(originalLibrary);

    setEditing(false);

    setError("");
  };

  // ==========================================================
  // LOCATION
  // ==========================================================

  const applyLocation = useCallback(
    ({ latitude, longitude, formattedAddress, addressComponents, placeId }) => {
      const parsed = parseAddressComponents(addressComponents);

      setLibrary((previous) => ({
        ...previous,

        latitude,

        longitude,

        address: formattedAddress || previous.address,

        city: parsed.city || previous.city,

        state: parsed.state || previous.state,

        pincode: parsed.pincode || previous.pincode,

        googlePlaceId: placeId || "",
      }));

      setEditing(true);
    },
    [],
  );

  // ==========================================================
  // REVERSE GEOCODE
  // ==========================================================

  const reverseGeocode = useCallback(
    (latitude, longitude) => {
      if (!geocoderRef.current) {
        return;
      }

      setGeocoding(true);

      geocoderRef.current.geocode(
        {
          location: {
            lat: latitude,
            lng: longitude,
          },
        },
        (results, status) => {
          setGeocoding(false);

          if (status !== "OK" || !results?.[0]) {
            setError("Unable to determine the selected address.");

            return;
          }

          const result = results[0];

          applyLocation({
            latitude,

            longitude,

            formattedAddress: result.formatted_address,

            addressComponents: result.address_components,

            placeId: result.place_id || "",
          });
        },
      );
    },
    [applyLocation],
  );

  // ==========================================================
  // INITIALIZE MAP
  // ==========================================================

  useEffect(() => {
    if (!library.id || !mapContainerRef.current || !GOOGLE_MAPS_API_KEY) {
      return;
    }

    let disposed = false;

    const initialize = async () => {
      try {
        const google = await loadGoogleMaps();

        if (disposed) {
          return;
        }

        const hasCoordinates =
          library.latitude !== null && library.longitude !== null;

        const center = hasCoordinates
          ? {
              lat: Number(library.latitude),

              lng: Number(library.longitude),
            }
          : {
              lat: 20.5937,
              lng: 78.9629,
            };

        const map = new google.maps.Map(mapContainerRef.current, {
          center,

          zoom: hasCoordinates ? 16 : 5,

          mapTypeControl: false,

          streetViewControl: false,
        });

        mapRef.current = map;

        const marker = new google.maps.Marker({
          map,

          position: center,

          visible: hasCoordinates,

          draggable: editing,
        });

        markerRef.current = marker;

        geocoderRef.current = new google.maps.Geocoder();

        marker.addListener("dragend", () => {
          const position = marker.getPosition();

          if (position) {
            reverseGeocode(position.lat(), position.lng());
          }
        });

        map.addListener("click", (event) => {
          if (!editing || !event.latLng) {
            return;
          }

          const latitude = event.latLng.lat();

          const longitude = event.latLng.lng();

          marker.setVisible(true);

          marker.setPosition({
            lat: latitude,
            lng: longitude,
          });

          reverseGeocode(latitude, longitude);
        });

        if (autocompleteContainerRef.current) {
          autocompleteContainerRef.current.innerHTML = "";

          const { PlaceAutocompleteElement } =
            await google.maps.importLibrary("places");

          const element = new PlaceAutocompleteElement({
            includedRegionCodes: ["in"],
          });

          element.style.width = "100%";

          element.style.minHeight = "56px";

          element.setAttribute(
            "placeholder",
            "Search your library location...",
          );

          if (!editing) {
            element.setAttribute("disabled", "");
          }

          autocompleteContainerRef.current.appendChild(element);

          element.addEventListener("gmp-select", async (event) => {
            const prediction = event.placePrediction;

            if (!prediction) {
              return;
            }

            const place = prediction.toPlace();

            await place.fetchFields({
              fields: [
                "displayName",
                "formattedAddress",
                "location",
                "addressComponents",
                "id",
              ],
            });

            if (!place.location) {
              return;
            }

            const latitude = place.location.lat();

            const longitude = place.location.lng();

            const position = {
              lat: latitude,
              lng: longitude,
            };

            map.setCenter(position);

            map.setZoom(17);

            marker.setVisible(true);

            marker.setPosition(position);

            const addressComponents = Array.isArray(place.addressComponents)
              ? place.addressComponents.map((component) => ({
                  long_name: component.longText,

                  short_name: component.shortText,

                  types: component.types,
                }))
              : [];

            applyLocation({
              latitude,

              longitude,

              formattedAddress:
                place.formattedAddress || place.displayName || "",

              addressComponents,

              placeId: place.id || "",
            });
          });
        }

        setMapReady(true);
      } catch (mapError) {
        setError(
          getErrorMessage(mapError, "Unable to initialize Google Maps."),
        );
      }
    };

    initialize();

    return () => {
      disposed = true;
    };
  }, [library.id, editing, reverseGeocode, applyLocation]);

  // ==========================================================
  // SYNC MAP POSITION
  // ==========================================================

  useEffect(() => {
    if (!mapReady || library.latitude === null || library.longitude === null) {
      return;
    }

    const position = {
      lat: Number(library.latitude),

      lng: Number(library.longitude),
    };

    markerRef.current?.setPosition(position);

    markerRef.current?.setVisible(true);

    markerRef.current?.setDraggable(editing);

    mapRef.current?.setCenter(position);
  }, [mapReady, editing, library.latitude, library.longitude]);

  // ==========================================================
  // CURRENT LOCATION
  // ==========================================================

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");

      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;

        const longitude = position.coords.longitude;

        mapRef.current?.setCenter({
          lat: latitude,
          lng: longitude,
        });

        mapRef.current?.setZoom(17);

        markerRef.current?.setPosition({
          lat: latitude,
          lng: longitude,
        });

        markerRef.current?.setVisible(true);

        reverseGeocode(latitude, longitude);

        setLocating(false);
      },

      () => {
        setLocating(false);

        setError("Unable to access your current location.");
      },

      {
        enableHighAccuracy: true,

        timeout: 15000,
      },
    );
  };

  // ==========================================================
  // UPLOAD TYPE CHANGE
  // ==========================================================

  const handleUploadTypeChange = (event) => {
    const nextType = event.target.value;

    setUploadType(nextType);

    setSelectedFiles([]);

    /*
     * LOGO is a dedicated image TYPE.
     * It is not PROFILE or COVER.
     */
    if (nextType === "LOGO") {
      setUploadRole(IMAGE_ROLES.GALLERY);

      setUploadPublic(true);
    }
  };

  // ==========================================================
  // UPLOAD ROLE CHANGE
  // ==========================================================

  const handleUploadRoleChange = (event) => {
    const role = event.target.value;

    setUploadRole(role);

    /*
     * PROFILE/COVER are always public.
     */
    if (role === IMAGE_ROLES.PROFILE || role === IMAGE_ROLES.COVER) {
      setUploadPublic(true);
    }

    setSelectedFiles([]);
  };

  // ==========================================================
  // FILE SELECTION
  // ==========================================================

  const handleFileSelection = (event) => {
    const files = Array.from(event.target.files || []);

    const maxFileSize = 10 * 1024 * 1024;

    const oversized = files.find((file) => file.size > maxFileSize);

    if (oversized) {
      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      setError(`"${oversized.name}" exceeds the 10 MB limit.`);

      return;
    }

    /*
     * LOGO / PROFILE / COVER are singular assignments.
     */
    const singularUpload =
      uploadType === "LOGO" ||
      uploadRole === IMAGE_ROLES.PROFILE ||
      uploadRole === IMAGE_ROLES.COVER;

    if (singularUpload && files.length > 1) {
      setError("Only one image can be uploaded for this usage at a time.");

      return;
    }

    setSelectedFiles(files);

    setError("");
  };

  // ==========================================================
  // UPLOAD IMAGES
  // ==========================================================

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select an image.");

      return;
    }

    try {
      setUploading(true);

      setError("");
      setSuccess("");

      /*
       * LOGO always remains GALLERY role.
       */
      const effectiveRole =
        uploadType === "LOGO" ? IMAGE_ROLES.GALLERY : uploadRole;

      for (const file of selectedFiles) {
        const uploaded = await libraryApi.uploadLibraryImage(
          library.id,
          file,
          uploadType,
          effectiveRole,
        );

        /*
         * Only normal gallery images support owner-controlled
         * visibility.
         *
         * LOGO / PROFILE / COVER are always public.
         */
        const normalGallery =
          effectiveRole === IMAGE_ROLES.GALLERY && uploadType !== "LOGO";

        if (normalGallery && uploaded?.id) {
          await libraryApi.setLibraryImageVisibility(
            library.id,
            uploaded.id,
            uploadPublic,
          );
        }
      }

      setSelectedFiles([]);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await refreshLibrary(library.id, library);

      setSuccess("Image uploaded successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to upload image."));
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // IMAGE ROLE
  // ==========================================================

  const handleImageRole = async (image, role) => {
    if (!image?.id) {
      return;
    }

    if (image.imageType === "LOGO" && role !== IMAGE_ROLES.GALLERY) {
      setError(
        "Library logo cannot be assigned as Profile or Cover. Upload a regular library image for that role.",
      );

      setImageMenuAnchor(null);

      return;
    }

    try {
      setImageBusyId(image.id);

      setImageMenuAnchor(null);

      await libraryApi.setLibraryImageRole(library.id, image.id, role);

      await refreshLibrary(library.id, library);

      setSuccess("Image usage updated successfully.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to update image usage."));
    } finally {
      setImageBusyId(null);
    }
  };

  // ==========================================================
  // PUBLIC VISIBILITY
  // ==========================================================

  const handleVisibilityChange = async (image, publicVisible) => {
    if (!image?.id) {
      return;
    }

    /*
     * LOGO, PROFILE and COVER cannot be made private.
     */
    if (isAlwaysPublicImage(image)) {
      return;
    }

    if (resolveImageRole(image) !== IMAGE_ROLES.GALLERY) {
      return;
    }

    try {
      setImageBusyId(image.id);

      await libraryApi.setLibraryImageVisibility(
        library.id,
        image.id,
        publicVisible,
      );

      setLibrary((previous) => ({
        ...previous,

        images: previous.images.map((current) =>
          current.id === image.id
            ? {
                ...current,
                publicVisible,
              }
            : current,
        ),
      }));

      setSuccess(
        publicVisible
          ? "Image is now visible to visitors."
          : "Image is now private.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to update image visibility."),
      );
    } finally {
      setImageBusyId(null);
    }
  };

  // ==========================================================
  // IMAGE CATEGORY
  // ==========================================================

  const handleImageType = async (image, imageType) => {
    try {
      setImageBusyId(image.id);

      /*
       * Converting an image to LOGO means it cannot retain
       * PROFILE/COVER role.
       */
      const nextRole =
        imageType === "LOGO" ? IMAGE_ROLES.GALLERY : resolveImageRole(image);

      await libraryApi.updateLibraryImage(image.id, {
        imageUrl: image.imageUrl,

        imageType,

        imageRole: nextRole,
      });

      /*
       * Backend now guarantees LOGO public visibility.
       */

      await refreshLibrary(library.id, library);

      setSuccess("Image category updated successfully.");
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to update image category."),
      );
    } finally {
      setImageBusyId(null);
    }
  };

  // ==========================================================
  // DELETE IMAGE
  // ==========================================================

  const handleDeleteImage = async (image) => {
    if (!image?.id) {
      return;
    }

    if (!window.confirm("Delete this image?")) {
      return;
    }

    try {
      setImageBusyId(image.id);

      setImageMenuAnchor(null);

      await libraryApi.deleteLibraryImage(image.id);

      await refreshLibrary(library.id, library);

      setSuccess("Image deleted.");
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to delete image."));
    } finally {
      setImageBusyId(null);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Stack
        minHeight={400}
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <CircularProgress />

        <Typography color="text.secondary">
          Loading library profile...
        </Typography>
      </Stack>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        pb: 6,
        maxWidth: 1500,
        mx: "auto",
      }}
    >
      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.7}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 850,
                letterSpacing: "-0.045em",
              }}
            >
              Library Profile
            </Typography>

            {library.status && (
              <Chip
                size="small"
                label={displayEnum(library.status)}
                color={
                  library.status === "ACTIVE"
                    ? "success"
                    : library.status === "SUSPENDED"
                      ? "warning"
                      : "default"
                }
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 690 }}
          >
            Manage your library identity, location, operating hours and
            visitor-facing experience from one place.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.25}>
          {editing ? (
            <>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  borderRadius: 2.5,
                  px: 2.5,
                  minHeight: 44,
                  fontWeight: 700,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
                onClick={handleSave}
                disabled={saving}
                sx={{
                  borderRadius: 2.5,
                  px: 2.75,
                  minHeight: 44,
                  fontWeight: 700,
                  boxShadow: "none",
                }}
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
              sx={{
                borderRadius: 2.5,
                px: 2.75,
                minHeight: 44,
                fontWeight: 700,
                boxShadow: "none",
              }}
            >
              Edit Profile
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ====================================================== */}
      {/* ALERTS */}
      {/* ====================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 2.5,
            borderRadius: 3,
          }}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          onClose={() => setSuccess("")}
          sx={{
            mb: 2.5,
            borderRadius: 3,
          }}
        >
          {success}
        </Alert>
      )}

      {/* ====================================================== */}
      {/* HERO */}
      {/* ====================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: alpha(theme.palette.divider, 0.8),
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 22px 55px rgba(0,0,0,0.22)"
              : "0 24px 65px rgba(15,23,42,0.08)",
        }}
      >
        <Box
          sx={{
            height: { xs: 235, sm: 285, md: 330 },
            position: "relative",
            bgcolor: alpha(theme.palette.primary.main, 0.07),
            backgroundImage: resolvedCoverImageUrl
              ? `url(${getImageUrl(resolvedCoverImageUrl)})`
              : `linear-gradient(135deg,
                  ${alpha(theme.palette.primary.main, 0.18)},
                  ${alpha(theme.palette.secondary.main, 0.09)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.03) 20%, rgba(15,23,42,0.82) 100%)",
            }}
          />

          {!resolvedCoverImageUrl && (
            <Stack
              sx={{
                position: "absolute",
                inset: 0,
              }}
              alignItems="center"
              justifyContent="center"
              spacing={1}
            >
              <ImageOutlined
                sx={{
                  fontSize: 56,
                  color: "text.disabled",
                }}
              />

              <Typography color="text.secondary">
                Add a cover image to complete your library identity
              </Typography>
            </Stack>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "flex-end" }}
            spacing={2}
            sx={{
              position: "absolute",
              left: { xs: 20, md: 28 },
              right: { xs: 20, md: 28 },
              bottom: { xs: 18, md: 22 },
            }}
          >
            <Avatar
              src={
                resolvedProfileImageUrl
                  ? getImageUrl(resolvedProfileImageUrl)
                  : undefined
              }
              sx={{
                width: { xs: 78, md: 106 },
                height: { xs: 78, md: 106 },
                fontSize: { xs: 28, md: 38 },
                fontWeight: 800,
                border: "4px solid rgba(255,255,255,.96)",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 12px 35px rgba(0,0,0,.26)",
              }}
            >
              {library.libraryName?.charAt(0)?.toUpperCase() || "L"}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1, color: "#fff" }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
                useFlexGap
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 850,
                    letterSpacing: "-0.04em",
                    textShadow: "0 2px 12px rgba(0,0,0,.3)",
                  }}
                >
                  {library.libraryName || "Library"}
                </Typography>

                {library.open24Hours && (
                  <Chip
                    size="small"
                    label="Open 24 Hours"
                    sx={{
                      bgcolor: "rgba(255,255,255,.16)",
                      color: "#fff",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,.24)",
                      fontWeight: 700,
                    }}
                  />
                )}
              </Stack>

              <Stack
                direction="row"
                spacing={0.75}
                alignItems="center"
                mt={0.8}
              >
                <LocationOn sx={{ fontSize: 18, opacity: 0.9 }} />

                <Typography
                  variant="body2"
                  sx={{
                    opacity: 0.92,
                    fontWeight: 500,
                  }}
                >
                  {[library.city, library.state, library.pincode]
                    .filter(Boolean)
                    .join(", ") || "Location not configured"}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            px: { xs: 2, md: 3 },
            py: 2.25,
            bgcolor: "background.paper",
          }}
        >
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 6, md: 3 }}>
              <MetricTile
                icon={<EventSeat fontSize="small" />}
                label="Total Seats"
                value={library.totalSeats}
                helper="Configured capacity"
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <MetricTile
                icon={<EventSeat fontSize="small" />}
                label="Available Seats"
                value={library.availableSeats}
                helper="Current availability"
                tone="success"
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <MetricTile
                icon={<PublicOutlined fontSize="small" />}
                label="Public Photos"
                value={publicGalleryImages.length}
                helper="Visible to students"
                tone="info"
              />
            </Grid>

            <Grid size={{ xs: 6, md: 3 }}>
              <MetricTile
                icon={<LockOutlined fontSize="small" />}
                label="Private Photos"
                value={privateGalleryImages.length}
                helper="Owner only"
                tone="warning"
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {/* ====================================================== */}
      {/* BASIC INFORMATION */}
      {/* ====================================================== */}

      <PremiumSection
        icon={<Edit />}
        title="Basic Information"
        description="Core information students use to identify and contact your library."
      >
        <Grid container spacing={2.25}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              required
              label="Library Name"
              name="libraryName"
              value={library.libraryName}
              disabled={!editing}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Library Email"
              type="email"
              name="email"
              value={library.email}
              disabled={!editing}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Contact Number"
              name="phone"
              value={library.phone}
              disabled={!editing}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              multiline
              minRows={4}
              label="About your library"
              name="description"
              value={library.description}
              disabled={!editing}
              onChange={handleChange}
              inputProps={{ maxLength: 2000 }}
              helperText={
                editing
                  ? `${library.description?.length || 0}/2000 characters`
                  : undefined
              }
            />
          </Grid>
        </Grid>
      </PremiumSection>

      {/* ====================================================== */}
      {/* LOCATION */}
      {/* ====================================================== */}

      <PremiumSection
        icon={<LocationOn />}
        title="Library Location"
        description="Set the precise location students will use for discovery and directions."
        action={
          editing ? (
            <Button
              variant="outlined"
              startIcon={
                locating ? <CircularProgress size={16} /> : <MyLocation />
              }
              disabled={locating}
              onClick={handleUseCurrentLocation}
              sx={{
                borderRadius: 2.5,
                fontWeight: 700,
              }}
            >
              Use Current Location
            </Button>
          ) : null
        }
      >
        {GOOGLE_MAPS_API_KEY ? (
          <>
            <Box
              ref={autocompleteContainerRef}
              sx={{
                mb: 2,
                "& > *": {
                  borderRadius: "12px",
                },
              }}
            />

            <Box sx={{ position: "relative", mb: 2.5 }}>
              <Box
                ref={mapContainerRef}
                sx={{
                  height: { xs: 300, md: 390 },
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  overflow: "hidden",
                }}
              />

              {geocoding && (
                <Chip
                  icon={<CircularProgress size={14} />}
                  label="Resolving location..."
                  sx={{
                    position: "absolute",
                    top: 14,
                    right: 14,
                    bgcolor: "background.paper",
                    boxShadow: 2,
                  }}
                />
              )}
            </Box>
          </>
        ) : (
          <Alert
            severity="warning"
            sx={{
              mb: 2.5,
              borderRadius: 2.5,
            }}
          >
            Google Maps API key is not configured.
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              required
              multiline
              minRows={2}
              label="Selected Address"
              name="address"
              value={library.address}
              disabled={!editing}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              label="City"
              name="city"
              value={library.city}
              disabled={!editing}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              label="State"
              name="state"
              value={library.state}
              disabled={!editing}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              required
              label="Pincode"
              name="pincode"
              value={library.pincode}
              disabled={!editing}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Latitude"
              value={library.latitude ?? ""}
              disabled
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Longitude"
              value={library.longitude ?? ""}
              disabled
            />
          </Grid>
        </Grid>
      </PremiumSection>

      {/* ====================================================== */}
      {/* OPERATING HOURS */}
      {/* ====================================================== */}

      <PremiumSection
        icon={<CheckCircle />}
        title="Operating Hours"
        description="Configure how your opening hours appear to students."
        action={
          <Chip
            label={
              library.open24Hours
                ? "Open 24 Hours"
                : library.openingTime && library.closingTime
                  ? `${library.openingTime} – ${library.closingTime}`
                  : "Not configured"
            }
            color={library.open24Hours ? "success" : "default"}
            variant={library.open24Hours ? "filled" : "outlined"}
            sx={{ fontWeight: 700 }}
          />
        }
      >
        <Box
          sx={{
            p: { xs: 1.75, md: 2 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: library.open24Hours
              ? alpha(theme.palette.success.main, 0.2)
              : alpha(theme.palette.divider, 0.9),
            bgcolor: library.open24Hours
              ? alpha(theme.palette.success.main, 0.055)
              : "background.default",
            transition: "border-color .2s ease, background-color .2s ease",
          }}
        >
          <FormControlLabel
            sx={{
              m: 0,
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
              "& .MuiFormControlLabel-label": {
                flex: 1,
                minWidth: 0,
              },
            }}
            labelPlacement="start"
            label={
              <Box>
                <Typography fontWeight={750}>
                  Open continuously for 24 hours
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Enable this when your library does not have fixed opening and
                  closing times.
                </Typography>
              </Box>
            }
            control={
              <Switch
                name="open24Hours"
                checked={Boolean(library.open24Hours)}
                disabled={!editing}
                onChange={handleChange}
              />
            }
          />
        </Box>

        {!library.open24Hours && (
          <Grid container spacing={2} mt={0.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="time"
                label="Opening Time"
                name="openingTime"
                value={library.openingTime}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                type="time"
                label="Closing Time"
                name="closingTime"
                value={library.closingTime}
                disabled={!editing}
                InputLabelProps={{ shrink: true }}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        )}
      </PremiumSection>

      {/* ====================================================== */}
      {/* MEDIA */}
      {/* ====================================================== */}

      <PremiumSection
        icon={<PhotoCameraOutlined />}
        title="Library Media"
        description="Build the visual identity students see while discovering your library."
        action={
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            sx={{ maxWidth: "100%" }}
          >
            <Chip
              size="small"
              icon={<PublicOutlined />}
              label={`${publicGalleryImages.length} Public`}
              color="success"
              variant="outlined"
            />

            <Chip
              size="small"
              icon={<LockOutlined />}
              label={`${privateGalleryImages.length} Private`}
              variant="outlined"
            />
          </Stack>
        }
      >
        {/* ================================================== */}
        {/* BRAND ASSETS */}
        {/* ================================================== */}

        <Typography
          variant="subtitle2"
          sx={{
            mb: 1.5,
            fontWeight: 800,
            letterSpacing: ".04em",
            color: "text.secondary",
          }}
        >
          BRAND ASSETS
        </Typography>

        <Grid container spacing={2}>
          {/* LOGO */}

          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 1.75,
                  py: 1.4,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight={750}>Logo</Typography>

                  <Chip
                    size="small"
                    label="Public"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  height: 210,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: theme.palette.action.hover,
                  p: 3,
                }}
              >
                {logoImage ? (
                  <Box
                    component="img"
                    src={getImageUrl(logoImage.imageUrl)}
                    alt="Library Logo"
                    sx={{
                      maxWidth: "80%",
                      maxHeight: 150,
                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Stack alignItems="center" spacing={1} color="text.secondary">
                    <ImageOutlined
                      sx={{
                        fontSize: 44,
                        opacity: 0.5,
                      }}
                    />
                    <Typography variant="body2">No logo uploaded</Typography>
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>

          {/* PROFILE */}

          <Grid size={{ xs: 12, md: 3 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 1.75,
                  py: 1.4,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight={750}>Profile</Typography>

                  <Chip
                    size="small"
                    label="Public"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  height: 210,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha(theme.palette.primary.main, 0.025),
                }}
              >
                <Avatar
                  src={
                    resolvedProfileImageUrl
                      ? getImageUrl(resolvedProfileImageUrl)
                      : undefined
                  }
                  sx={{
                    width: 132,
                    height: 132,
                    fontSize: 42,
                    fontWeight: 800,
                    bgcolor: alpha(theme.palette.primary.main, 0.14),
                    color: "primary.main",
                    boxShadow: `0 14px 35px ${alpha(
                      theme.palette.primary.main,
                      0.16,
                    )}`,
                  }}
                >
                  {library.libraryName?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Box>
            </Card>
          </Grid>

          {/* COVER */}

          <Grid size={{ xs: 12, md: 6 }}>
            <Card
              elevation={0}
              sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 1.75,
                  py: 1.4,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography fontWeight={750}>Cover Image</Typography>

                  <Chip
                    size="small"
                    label="Public"
                    color="success"
                    variant="outlined"
                  />
                </Stack>
              </Box>

              <Box
                sx={{
                  height: 210,
                  bgcolor: "action.hover",
                  backgroundImage: resolvedCoverImageUrl
                    ? `url(${getImageUrl(resolvedCoverImageUrl)})`
                    : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                {!resolvedCoverImageUrl && (
                  <Stack alignItems="center" spacing={1} color="text.secondary">
                    <ImageOutlined
                      sx={{
                        fontSize: 44,
                        opacity: 0.5,
                      }}
                    />
                    <Typography variant="body2">
                      No cover image selected
                    </Typography>
                  </Stack>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* ================================================== */}
        {/* UPLOAD STUDIO */}
        {/* ================================================== */}

        <Box
          sx={{
            mt: 3,
            p: { xs: 2, md: 2.5 },
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.035),
            border: "1px dashed",
            borderColor: alpha(theme.palette.primary.main, 0.22),
          }}
        >
          <Box mb={2}>
            <Typography fontWeight={800}>Upload Studio</Typography>

            <Typography variant="body2" color="text.secondary">
              Add branding or gallery imagery and control exactly how it is
              displayed.
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth>
                <InputLabel>Image Category</InputLabel>

                <Select
                  label="Image Category"
                  value={uploadType}
                  onChange={handleUploadTypeChange}
                >
                  {IMAGE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.75, display: "block" }}
              >
                {getImageTypeHint(uploadType)}
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth disabled={uploadType === "LOGO"}>
                <InputLabel>Image Use</InputLabel>

                <Select
                  label="Image Use"
                  value={
                    uploadType === "LOGO"
                      ? IMAGE_ROLES.GALLERY
                      : uploadRole
                  }
                  onChange={handleUploadRoleChange}
                >
                  <MenuItem value={IMAGE_ROLES.GALLERY}>
                    Gallery Image
                  </MenuItem>

                  <MenuItem value={IMAGE_ROLES.PROFILE}>
                    Profile Image
                  </MenuItem>

                  <MenuItem value={IMAGE_ROLES.COVER}>Cover Image</MenuItem>
                </Select>
              </FormControl>

              {uploadType === "LOGO" ? (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.75, display: "block" }}
                >
                  Logo is always public.
                </Typography>
              ) : uploadRole === IMAGE_ROLES.GALLERY ? (
                <FormControlLabel
                  sx={{ mt: 0.4, ml: 0 }}
                  control={
                    <Switch
                      size="small"
                      checked={uploadPublic}
                      onChange={(event) =>
                        setUploadPublic(event.target.checked)
                      }
                    />
                  }
                  label={
                    <Typography variant="body2">Visible to students</Typography>
                  }
                />
              ) : (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 0.75, display: "block" }}
                >
                  Profile and Cover images are always public.
                </Typography>
              )}
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <input
                hidden
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={
                  uploadType !== "LOGO" &&
                  uploadRole === IMAGE_ROLES.GALLERY
                }
                onChange={handleFileSelection}
              />

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddPhotoAlternateOutlined />}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  height: 56,
                  borderRadius: 2.5,
                  fontWeight: 700,
                }}
              >
                Choose Image
                {uploadType !== "LOGO" &&
                uploadRole === IMAGE_ROLES.GALLERY
                  ? "s"
                  : ""}
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: 3 }}>
              <Button
                fullWidth
                variant="contained"
                disabled={uploading || selectedFiles.length === 0}
                startIcon={
                  uploading ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <CloudUploadOutlined />
                  )
                }
                onClick={handleUploadImages}
                sx={{
                  height: 56,
                  borderRadius: 2.5,
                  fontWeight: 750,
                  boxShadow: "none",
                }}
              >
                {uploading ? "Uploading..." : "Upload"}
              </Button>
            </Grid>
          </Grid>

          {selectedFiles.length > 0 && (
            <Alert
              severity="info"
              sx={{
                mt: 2,
                borderRadius: 2.5,
              }}
            >
              {selectedFiles.length} file(s) selected:{" "}
              {selectedFiles.map((file) => file.name).join(", ")}
            </Alert>
          )}
        </Box>

        {/* ================================================== */}
        {/* IMAGE LIBRARY */}
        {/* ================================================== */}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1}
          mt={4}
          mb={2}
        >
          <Box>
            <Typography fontWeight={800}>Image Library</Typography>

            <Typography variant="body2" color="text.secondary">
              Manage category, role and student visibility for every image.
            </Typography>
          </Box>

          <Chip
            size="small"
            label={`${library.images.length} uploaded`}
            variant="outlined"
          />
        </Stack>

        {library.images.length === 0 ? (
          <Box
            sx={{
              py: 7,
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 3,
              textAlign: "center",
              bgcolor: theme.palette.action.hover,
            }}
          >
            <PhotoCameraOutlined
              sx={{
                fontSize: 52,
                color: "text.disabled",
              }}
            />

            <Typography fontWeight={750} sx={{ mt: 1 }}>
              No images uploaded yet
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Upload your first library image using the studio above.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {library.images.map((image) => {
              const role = resolveImageRole(image);
              const publicImage = isImagePublic(image);
              const logo = image.imageType === "LOGO";
              const visibilityEditable =
                role === IMAGE_ROLES.GALLERY && !logo;

              return (
                <Grid
                  key={image.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                    xl: 3,
                  }}
                >
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                      transition:
                        "transform .2s ease, box-shadow .2s ease, border-color .2s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow:
                          theme.palette.mode === "dark"
                            ? "0 18px 38px rgba(0,0,0,.22)"
                            : "0 18px 38px rgba(15,23,42,.09)",
                        borderColor: alpha(
                          theme.palette.primary.main,
                          0.25,
                        ),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        height: 190,
                        position: "relative",
                        bgcolor: theme.palette.action.hover,
                      }}
                    >
                      <Box
                        component="img"
                        src={getImageUrl(image.imageUrl)}
                        alt={displayEnum(image.imageType)}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: logo ? "contain" : "cover",
                          p: logo ? 2.5 : 0,
                        }}
                      />

                      {!logo && (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            background:
                              "linear-gradient(180deg, rgba(0,0,0,.14), transparent 45%, rgba(0,0,0,.18))",
                            pointerEvents: "none",
                          }}
                        />
                      )}

                      <Stack
                        direction="row"
                        spacing={0.75}
                        flexWrap="wrap"
                        useFlexGap
                        sx={{
                          position: "absolute",
                          left: 10,
                          top: 10,
                          pr: 5,
                        }}
                      >
                        {logo && (
                          <Chip
                            size="small"
                            label="Logo"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        )}

                        {role === IMAGE_ROLES.PROFILE && (
                          <Chip
                            size="small"
                            label="Profile"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        )}

                        {role === IMAGE_ROLES.COVER && (
                          <Chip
                            size="small"
                            icon={<Star />}
                            label="Cover"
                            color="success"
                            sx={{ fontWeight: 700 }}
                          />
                        )}

                        {role === IMAGE_ROLES.GALLERY && (
                          <Chip
                            size="small"
                            icon={
                              publicImage ? (
                                <VisibilityOutlined />
                              ) : (
                                <VisibilityOffOutlined />
                              )
                            }
                            label={publicImage ? "Public" : "Private"}
                            color={publicImage ? "success" : "default"}
                            sx={{
                              bgcolor: publicImage
                                ? undefined
                                : "background.paper",
                              fontWeight: 700,
                            }}
                          />
                        )}
                      </Stack>

                      <IconButton
                        size="small"
                        onClick={(event) => {
                          setImageMenuAnchor(event.currentTarget);
                          setSelectedMenuImage(image);
                        }}
                        sx={{
                          position: "absolute",
                          right: 10,
                          top: 10,
                          bgcolor: "background.paper",
                          boxShadow: 2,
                          "&:hover": {
                            bgcolor: "background.paper",
                          },
                        }}
                      >
                        <MoreVert />
                      </IconButton>

                      {imageBusyId === image.id && (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "rgba(15,23,42,.5)",
                            backdropFilter: "blur(2px)",
                          }}
                        >
                          <CircularProgress color="inherit" />
                        </Box>
                      )}
                    </Box>

                    <CardContent sx={{ p: 2 }}>
                      <Typography fontWeight={800}>
                        {displayEnum(image.imageType)}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {logo ? "Branding asset" : displayEnum(role)}
                      </Typography>

                      <FormControl fullWidth size="small" sx={{ mt: 1.75 }}>
                        <InputLabel>Category</InputLabel>

                        <Select
                          label="Category"
                          value={image.imageType}
                          onChange={(event) =>
                            handleImageType(image, event.target.value)
                          }
                        >
                          {IMAGE_TYPES.map((type) => (
                            <MenuItem key={type.value} value={type.value}>
                              {type.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      {visibilityEditable ? (
                        <Box
                          sx={{
                            mt: 1.5,
                            p: 1.25,
                            borderRadius: 2.25,
                            bgcolor: publicImage
                              ? alpha(theme.palette.success.main, 0.045)
                              : theme.palette.action.hover,
                            border: "1px solid",
                            borderColor: publicImage
                              ? alpha(theme.palette.success.main, 0.12)
                              : "divider",
                          }}
                        >
                          <FormControlLabel
                            sx={{
                              width: "100%",
                              m: 0,
                              justifyContent: "space-between",
                            }}
                            labelPlacement="start"
                            label={
                              <Box>
                                <Typography variant="body2" fontWeight={700}>
                                  Student visibility
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {publicImage
                                    ? "Visible in student portal"
                                    : "Hidden from students"}
                                </Typography>
                              </Box>
                            }
                            control={
                              <Switch
                                size="small"
                                checked={publicImage}
                                onChange={(event) =>
                                  handleVisibilityChange(
                                    image,
                                    event.target.checked,
                                  )
                                }
                              />
                            }
                          />
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            mt: 1.5,
                            px: 1.25,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.info.main, 0.045),
                            border: "1px solid",
                            borderColor: alpha(theme.palette.info.main, 0.12),
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            {logo
                              ? "Logo is always visible publicly."
                              : `${displayEnum(role)} image is always public.`}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </PremiumSection>

      {/* ====================================================== */}
      {/* IMAGE MENU */}
      {/* ====================================================== */}

      <Menu
        anchorEl={imageMenuAnchor}
        open={Boolean(imageMenuAnchor)}
        onClose={() => {
          setImageMenuAnchor(null);
          setSelectedMenuImage(null);
        }}
        PaperProps={{
          sx: {
            minWidth: 190,
            borderRadius: 2.5,
            mt: 0.75,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 18px 40px rgba(0,0,0,.28)"
                : "0 18px 40px rgba(15,23,42,.15)",
          },
        }}
      >
        {selectedMenuImage?.imageType !== "LOGO" && (
          <MenuItem
            disabled={
              resolveImageRole(selectedMenuImage) === IMAGE_ROLES.PROFILE
            }
            onClick={() =>
              handleImageRole(selectedMenuImage, IMAGE_ROLES.PROFILE)
            }
          >
            Set as Profile
          </MenuItem>
        )}

        {selectedMenuImage?.imageType !== "LOGO" && (
          <MenuItem
            disabled={resolveImageRole(selectedMenuImage) === IMAGE_ROLES.COVER}
            onClick={() =>
              handleImageRole(selectedMenuImage, IMAGE_ROLES.COVER)
            }
          >
            Set as Cover
          </MenuItem>
        )}

        {selectedMenuImage &&
          resolveImageRole(selectedMenuImage) !== IMAGE_ROLES.GALLERY && (
            <MenuItem
              onClick={() =>
                handleImageRole(selectedMenuImage, IMAGE_ROLES.GALLERY)
              }
            >
              Move to Gallery
            </MenuItem>
          )}

        <Divider />

        <MenuItem
          sx={{ color: "error.main" }}
          onClick={() => handleDeleteImage(selectedMenuImage)}
        >
          <DeleteOutlineOutlined
            fontSize="small"
            sx={{
              mr: 1.25,
            }}
          />
          Delete Image
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default LibraryProfile;
