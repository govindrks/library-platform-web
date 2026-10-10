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
  Tooltip,
  Typography,
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
      return "Square PNG or transparent logo recommended.";

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

const isImagePublic = (image) => {
  const role = resolveImageRole(image);

  if (role === IMAGE_ROLES.PROFILE || role === IMAGE_ROLES.COVER) {
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
// COMPONENT
// ============================================================

function LibraryProfile() {
  // =========================================================
  // STATE
  // =========================================================

  const [library, setLibrary] = useState(EMPTY_LIBRARY);

  const [originalLibrary, setOriginalLibrary] = useState(EMPTY_LIBRARY);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =========================================================
  // MAP STATE
  // =========================================================

  const mapContainerRef = useRef(null);

  const autocompleteContainerRef = useRef(null);

  const mapRef = useRef(null);

  const markerRef = useRef(null);

  const geocoderRef = useRef(null);

  const [mapReady, setMapReady] = useState(false);

  const [locating, setLocating] = useState(false);

  const [geocoding, setGeocoding] = useState(false);

  // =========================================================
  // IMAGE STATE
  // =========================================================

  const fileInputRef = useRef(null);

  const [uploadType, setUploadType] = useState("READING_HALL");

  const [uploadRole, setUploadRole] = useState(IMAGE_ROLES.GALLERY);

  const [uploadPublic, setUploadPublic] = useState(true);

  const [selectedFiles, setSelectedFiles] = useState([]);

  const [uploading, setUploading] = useState(false);

  const [imageBusyId, setImageBusyId] = useState(null);

  const [imageMenuAnchor, setImageMenuAnchor] = useState(null);

  const [selectedMenuImage, setSelectedMenuImage] = useState(null);

  // =========================================================
  // DERIVED MEDIA
  // =========================================================

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

  const publicGalleryImages = useMemo(
    () =>
      library.images.filter(
        (image) =>
          resolveImageRole(image) === IMAGE_ROLES.GALLERY &&
          isImagePublic(image),
      ),
    [library.images],
  );

  const privateGalleryImages = useMemo(
    () =>
      library.images.filter(
        (image) =>
          resolveImageRole(image) === IMAGE_ROLES.GALLERY &&
          !isImagePublic(image),
      ),
    [library.images],
  );

  // =========================================================
  // MAP RESPONSE
  // =========================================================

  const mapDetails = useCallback((details, fallback = {}) => {
    return {
      id: details?.id ?? fallback?.id ?? null,

      libraryName: details?.name ?? fallback?.name ?? "",

      description: details?.description ?? "",

      address: details?.address ?? "",

      city: details?.city ?? fallback?.city ?? "",

      state: details?.state ?? fallback?.state ?? "",

      pincode: details?.pincode ?? fallback?.pincode ?? "",

      phone: details?.contactNumber ?? fallback?.contactNumber ?? "",

      email: details?.email ?? fallback?.email ?? "",

      openingTime: normalizeTime(details?.openingTime),

      closingTime: normalizeTime(details?.closingTime),

      open24Hours: Boolean(details?.open24Hours),

      totalSeats: Number(details?.totalSeats ?? fallback?.totalSeats ?? 0),

      availableSeats: Number(details?.availableSeats ?? 0),

      latitude: details?.latitude ?? null,

      longitude: details?.longitude ?? null,

      googlePlaceId: details?.googlePlaceId ?? "",

      status: details?.status ?? fallback?.status ?? "DRAFT",

      coverImageUrl: details?.coverImageUrl ?? "",

      profileImageUrl: details?.profileImageUrl ?? "",

      amenities: Array.isArray(details?.amenities) ? details.amenities : [],

      customAmenities: Array.isArray(details?.customAmenities)
        ? details.customAmenities
        : [],

      images: Array.isArray(details?.images) ? details.images : [],
    };
  }, []);

  // =========================================================
  // REFRESH
  // =========================================================

  const refreshLibrary = useCallback(
    async (libraryId, fallback = {}) => {
      const response = await libraryApi.getLibraryDetails(libraryId);

      const mapped = mapDetails(response, fallback);

      setLibrary(mapped);

      setOriginalLibrary(mapped);

      return mapped;
    },
    [mapDetails],
  );

  // =========================================================
  // LOAD
  // =========================================================

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

  // =========================================================
  // FORM
  // =========================================================

  const handleChange = (event) => {
    const { name, value, checked, type } = event.target;

    setLibrary((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));

    setError("");

    setSuccess("");
  };

  const handleSave = async () => {
    if (!library.libraryName?.trim()) {
      setError("Library name is required.");

      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: library.libraryName.trim(),

        description: library.description?.trim() || null,

        address: library.address?.trim() || null,

        city: library.city?.trim() || null,

        state: library.state?.trim() || null,

        pincode: library.pincode?.trim() || null,

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

  const handleCancel = () => {
    setLibrary(originalLibrary);

    setEditing(false);
  };

  // =========================================================
  // LOCATION
  // =========================================================

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

  // =========================================================
  // FILE SELECTION
  // =========================================================

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

    if (uploadType === "LOGO" && files.length > 1) {
      setError("Only one logo can be uploaded at a time.");

      return;
    }

    setSelectedFiles(files);

    setError("");
  };

  // =========================================================
  // UPLOAD
  // =========================================================

  const handleUploadImages = async () => {
    if (selectedFiles.length === 0) {
      setError("Please select an image.");

      return;
    }

    try {
      setUploading(true);

      setError("");

      for (const file of selectedFiles) {
        const uploaded = await libraryApi.uploadLibraryImage(
          library.id,
          file,
          uploadType,
          uploadRole,
        );

        /*
         * PROFILE and COVER are public automatically.
         *
         * For GALLERY images, owner controls
         * visitor visibility.
         */
        if (uploadRole === IMAGE_ROLES.GALLERY && uploaded?.id) {
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

  // =========================================================
  // IMAGE ROLE
  // =========================================================

  const handleImageRole = async (image, role) => {
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

  // =========================================================
  // PUBLIC VISIBILITY
  // =========================================================

  const handleVisibilityChange = async (image, publicVisible) => {
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

  // =========================================================
  // IMAGE CATEGORY
  // =========================================================

  const handleImageType = async (image, imageType) => {
    try {
      setImageBusyId(image.id);

      await libraryApi.updateLibraryImage(image.id, {
        imageUrl: image.imageUrl,

        imageType,

        imageRole: resolveImageRole(image),
      });

      await refreshLibrary(library.id, library);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to update image category."),
      );
    } finally {
      setImageBusyId(null);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteImage = async (image) => {
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

  // =========================================================
  // LOADING
  // =========================================================

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

  // =========================================================
  // UI
  // =========================================================

  return (
    <Box
      sx={{
        pb: 5,
      }}
    >
      {/* =====================================================
          HEADER
      ===================================================== */}

      <Stack
        direction={{
          xs: "column",

          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",

          md: "center",
        }}
        spacing={2}
        mb={2}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Library Profile
          </Typography>

          <Typography color="text.secondary">
            Manage your library information and public visitor profile.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1}>
          {editing ? (
            <>
              <Button variant="outlined" onClick={handleCancel}>
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
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          sx={{
            mb: 2,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* =====================================================
          HERO
      ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,

          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            height: 220,

            backgroundColor: "action.hover",

            backgroundImage: library.coverImageUrl
              ? `url(${getImageUrl(library.coverImageUrl)})`
              : "none",

            backgroundSize: "cover",

            backgroundPosition: "center",

            display: "flex",

            alignItems: "center",

            justifyContent: "center",
          }}
        >
          {!library.coverImageUrl && (
            <Stack alignItems="center" color="text.secondary">
              <ImageOutlined
                sx={{
                  fontSize: 48,
                }}
              />

              <Typography>No cover image selected</Typography>
            </Stack>
          )}
        </Box>

        <CardContent>
          <Stack
            direction={{
              xs: "column",

              sm: "row",
            }}
            spacing={2}
            alignItems={{
              sm: "center",
            }}
          >
            <Avatar
              src={
                library.profileImageUrl
                  ? getImageUrl(library.profileImageUrl)
                  : undefined
              }
              sx={{
                width: 96,

                height: 96,

                mt: {
                  sm: -7,
                },

                border: "4px solid",

                borderColor: "background.paper",

                bgcolor: "primary.light",

                fontSize: 32,
              }}
            >
              {library.libraryName?.charAt(0)?.toUpperCase() || "L"}
            </Avatar>

            <Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h5" fontWeight={800}>
                  {library.libraryName}
                </Typography>

                <Chip
                  size="small"
                  label={library.status}
                  color={library.status === "ACTIVE" ? "success" : "default"}
                />
              </Stack>

              <Stack direction="row" spacing={0.5} alignItems="center" mt={0.5}>
                <LocationOn fontSize="small" color="action" />

                <Typography variant="body2" color="text.secondary">
                  {[library.city, library.state, library.pincode]
                    .filter(Boolean)
                    .join(", ")}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* =====================================================
          BASIC INFORMATION
      ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Basic Information
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Library Name"
                name="libraryName"
                value={library.libraryName}
                disabled={!editing}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Library Email"
                name="email"
                value={library.email}
                disabled={!editing}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Contact Number"
                name="phone"
                value={library.phone}
                disabled={!editing}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
              }}
            >
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Description"
                name="description"
                value={library.description}
                disabled={!editing}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* =====================================================
          LOCATION
      ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: "column",

              md: "row",
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Library Location
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Search, use your current location, or fine-tune the marker.
              </Typography>
            </Box>

            {editing && (
              <Button
                variant="outlined"
                startIcon={<MyLocation />}
                disabled={locating}
                onClick={handleUseCurrentLocation}
              >
                Use Current Location
              </Button>
            )}
          </Stack>

          <Divider
            sx={{
              my: 2,
            }}
          />

          {GOOGLE_MAPS_API_KEY && (
            <>
              <Box
                ref={autocompleteContainerRef}
                sx={{
                  mb: 2,
                }}
              />

              <Box
                ref={mapContainerRef}
                sx={{
                  height: 360,

                  borderRadius: 2,

                  border: "1px solid",

                  borderColor: "divider",

                  overflow: "hidden",
                }}
              />
            </>
          )}

          {!GOOGLE_MAPS_API_KEY && (
            <Alert severity="warning">
              Google Maps API key is not configured.
            </Alert>
          )}

          <Grid container spacing={2} mt={1}>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <TextField
                fullWidth
                multiline
                label="Selected Address"
                name="address"
                value={library.address}
                disabled={!editing}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                fullWidth
                label="City"
                name="city"
                value={library.city}
                disabled={!editing}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                fullWidth
                label="State"
                name="state"
                value={library.state}
                disabled={!editing}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 4,
              }}
            >
              <TextField
                fullWidth
                label="Pincode"
                name="pincode"
                value={library.pincode}
                disabled={!editing}
                onChange={handleChange}
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Latitude"
                value={library.latitude ?? ""}
                disabled
              />
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <TextField
                fullWidth
                label="Longitude"
                value={library.longitude ?? ""}
                disabled
              />
            </Grid>
          </Grid>

          {geocoding && (
            <Alert
              severity="info"
              sx={{
                mt: 2,
              }}
            >
              Resolving address...
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          HOURS
      ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Operating Hours
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          <FormControlLabel
            label="Open 24 Hours"
            control={
              <Switch
                name="open24Hours"
                checked={Boolean(library.open24Hours)}
                disabled={!editing}
                onChange={handleChange}
              />
            }
          />

          {!library.open24Hours && (
            <Grid container spacing={2} mt={0.5}>
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  type="time"
                  label="Opening Time"
                  name="openingTime"
                  value={library.openingTime}
                  disabled={!editing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleChange}
                />
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <TextField
                  fullWidth
                  type="time"
                  label="Closing Time"
                  name="closingTime"
                  value={library.closingTime}
                  disabled={!editing}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          SEATS
      ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" fontWeight={700}>
            Seat Information
          </Typography>

          <Divider
            sx={{
              my: 2,
            }}
          />

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <EventSeat color="primary" />

                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Total Seats
                      </Typography>

                      <Typography variant="h5" fontWeight={800}>
                        {library.totalSeats}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <EventSeat color="success" />

                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        Available Seats
                      </Typography>

                      <Typography variant="h5" fontWeight={800}>
                        {library.availableSeats}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* =====================================================
          MEDIA
      ===================================================== */}

      <Card
        variant="outlined"
        sx={{
          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: "column",

              md: "row",
            }}
            justifyContent="space-between"
            spacing={1}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Public Media
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Control branding, cover images and visitor gallery visibility.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                icon={<PublicOutlined />}
                label={`${publicGalleryImages.length} Public`}
                color="success"
                variant="outlined"
              />

              <Chip
                icon={<LockOutlined />}
                label={`${privateGalleryImages.length} Private`}
                variant="outlined"
              />
            </Stack>
          </Stack>

          <Divider
            sx={{
              my: 2,
            }}
          />

          {/* =================================================
              BRANDING PREVIEW
          ================================================= */}

          <Grid container spacing={2}>
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <Typography fontWeight={600} mb={1}>
                Library Logo
              </Typography>

              <Card
                variant="outlined"
                sx={{
                  height: 240,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >
                {logoImage ? (
                  <Box
                    component="img"
                    src={getImageUrl(logoImage.imageUrl)}
                    alt="Library Logo"
                    sx={{
                      width: 145,

                      height: 145,

                      objectFit: "contain",
                    }}
                  />
                ) : (
                  <Stack alignItems="center" color="text.secondary">
                    <ImageOutlined
                      sx={{
                        fontSize: 48,
                      }}
                    />

                    <Typography variant="body2">No logo</Typography>
                  </Stack>
                )}
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <Typography fontWeight={600} mb={1}>
                Profile Image
              </Typography>

              <Card
                variant="outlined"
                sx={{
                  height: 240,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",
                }}
              >
                <Avatar
                  src={
                    profileImage?.imageUrl
                      ? getImageUrl(profileImage.imageUrl)
                      : library.profileImageUrl
                        ? getImageUrl(library.profileImageUrl)
                        : undefined
                  }
                  sx={{
                    width: 130,

                    height: 130,

                    fontSize: 42,
                  }}
                >
                  {library.libraryName?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Card>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 6,
              }}
            >
              <Typography fontWeight={600} mb={1}>
                Cover Image
              </Typography>

              <Card
                variant="outlined"
                sx={{
                  height: 240,

                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: "100%",

                    height: "100%",

                    backgroundColor: "action.hover",

                    backgroundImage: coverImage?.imageUrl
                      ? `url(${getImageUrl(coverImage.imageUrl)})`
                      : library.coverImageUrl
                        ? `url(${getImageUrl(library.coverImageUrl)})`
                        : "none",

                    backgroundSize: "cover",

                    backgroundPosition: "center",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center",
                  }}
                >
                  {!coverImage && !library.coverImageUrl && (
                    <Typography color="text.secondary">
                      No cover image
                    </Typography>
                  )}
                </Box>
              </Card>
            </Grid>
          </Grid>

          <Divider
            sx={{
              my: 3,
            }}
          />

          {/* =================================================
              UPLOAD
          ================================================= */}

          <Typography variant="subtitle1" fontWeight={700}>
            Upload Images
          </Typography>

          <Typography variant="body2" color="text.secondary" mb={2}>
            Choose the category, usage, and whether gallery images should be
            visible to visitors.
          </Typography>

          <Grid container spacing={2} alignItems="flex-start">
            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Image Category</InputLabel>

                <Select
                  label="Image Category"
                  value={uploadType}
                  onChange={(event) => {
                    setUploadType(event.target.value);

                    setSelectedFiles([]);
                  }}
                >
                  {IMAGE_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" color="text.secondary">
                {getImageTypeHint(uploadType)}
              </Typography>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Image Use</InputLabel>

                <Select
                  label="Image Use"
                  value={uploadRole}
                  onChange={(event) => setUploadRole(event.target.value)}
                >
                  <MenuItem value={IMAGE_ROLES.GALLERY}>Gallery Image</MenuItem>

                  <MenuItem value={IMAGE_ROLES.PROFILE}>Profile Image</MenuItem>

                  <MenuItem value={IMAGE_ROLES.COVER}>Cover Image</MenuItem>
                </Select>
              </FormControl>

              {uploadRole === IMAGE_ROLES.GALLERY && (
                <FormControlLabel
                  sx={{
                    mt: 0.5,
                  }}
                  control={
                    <Switch
                      checked={uploadPublic}
                      onChange={(event) =>
                        setUploadPublic(event.target.checked)
                      }
                    />
                  }
                  label="Visible to visitors"
                />
              )}
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
              <input
                hidden
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple={
                  uploadRole === IMAGE_ROLES.GALLERY && uploadType !== "LOGO"
                }
                onChange={handleFileSelection}
              />

              <Button
                fullWidth
                variant="outlined"
                startIcon={<AddPhotoAlternateOutlined />}
                onClick={() => fileInputRef.current?.click()}
              >
                Select Images
              </Button>
            </Grid>

            <Grid
              size={{
                xs: 12,
                md: 3,
              }}
            >
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
              >
                Upload
              </Button>
            </Grid>
          </Grid>

          {selectedFiles.length > 0 && (
            <Alert
              severity="info"
              sx={{
                mt: 2,
              }}
            >
              {selectedFiles.length} file(s) selected:{" "}
              {selectedFiles.map((file) => file.name).join(", ")}
            </Alert>
          )}

          <Divider
            sx={{
              my: 3,
            }}
          />

          {/* =================================================
              IMAGE MANAGEMENT
          ================================================= */}

          <Stack
            direction={{
              xs: "column",

              md: "row",
            }}
            justifyContent="space-between"
            spacing={1}
            mb={2}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Uploaded Images
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Control category, role and visitor visibility individually.
              </Typography>
            </Box>

            <Chip
              label={`${library.images.length} image(s)`}
              variant="outlined"
            />
          </Stack>

          {library.images.length === 0 ? (
            <Box
              sx={{
                py: 6,

                border: "1px dashed",

                borderColor: "divider",

                borderRadius: 2,

                textAlign: "center",
              }}
            >
              <PhotoCameraOutlined
                sx={{
                  fontSize: 50,

                  color: "text.disabled",
                }}
              />

              <Typography fontWeight={600}>No images uploaded</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {library.images.map((image) => {
                const role = resolveImageRole(image);

                const publicImage = isImagePublic(image);

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
                      variant="outlined"
                      sx={{
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: 185,

                          position: "relative",

                          bgcolor: "action.hover",
                        }}
                      >
                        <Box
                          component="img"
                          src={getImageUrl(image.imageUrl)}
                          alt={displayEnum(image.imageType)}
                          sx={{
                            width: "100%",

                            height: "100%",

                            objectFit:
                              image.imageType === "LOGO" ? "contain" : "cover",

                            p: image.imageType === "LOGO" ? 2 : 0,
                          }}
                        />

                        <Stack
                          direction="row"
                          spacing={0.5}
                          sx={{
                            position: "absolute",

                            left: 8,

                            top: 8,
                          }}
                        >
                          {role === IMAGE_ROLES.PROFILE && (
                            <Chip
                              size="small"
                              label="Profile"
                              color="primary"
                            />
                          )}

                          {role === IMAGE_ROLES.COVER && (
                            <Chip
                              size="small"
                              label="Cover"
                              icon={<Star />}
                              color="success"
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
                            />
                          )}
                        </Stack>

                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",

                            right: 8,

                            top: 8,

                            bgcolor: "background.paper",
                          }}
                          onClick={(event) => {
                            setImageMenuAnchor(event.currentTarget);

                            setSelectedMenuImage(image);
                          }}
                        >
                          <MoreVert />
                        </IconButton>

                        {imageBusyId === image.id && (
                          <Box
                            sx={{
                              position: "absolute",

                              inset: 0,

                              display: "flex",

                              alignItems: "center",

                              justifyContent: "center",

                              bgcolor: "rgba(0,0,0,.4)",
                            }}
                          >
                            <CircularProgress />
                          </Box>
                        )}
                      </Box>

                      <CardContent>
                        <Typography fontWeight={700}>
                          {displayEnum(image.imageType)}
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {displayEnum(role)}
                        </Typography>

                        <FormControl
                          fullWidth
                          size="small"
                          sx={{
                            mt: 1.5,
                          }}
                        >
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

                        {role === IMAGE_ROLES.GALLERY && (
                          <Box
                            sx={{
                              mt: 1.5,

                              px: 1,

                              borderRadius: 1,

                              bgcolor: "action.hover",
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
                                  <Typography variant="body2" fontWeight={600}>
                                    Visitor View
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Show on public profile
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
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* =====================================================
          IMAGE MENU
      ===================================================== */}

      <Menu
        anchorEl={imageMenuAnchor}
        open={Boolean(imageMenuAnchor)}
        onClose={() => setImageMenuAnchor(null)}
      >
        <MenuItem
          onClick={() =>
            handleImageRole(selectedMenuImage, IMAGE_ROLES.PROFILE)
          }
        >
          Set as Profile
        </MenuItem>

        <MenuItem
          onClick={() => handleImageRole(selectedMenuImage, IMAGE_ROLES.COVER)}
        >
          Set as Cover
        </MenuItem>

        <MenuItem
          onClick={() =>
            handleImageRole(selectedMenuImage, IMAGE_ROLES.GALLERY)
          }
        >
          Move to Gallery
        </MenuItem>

        <Divider />

        <MenuItem
          sx={{
            color: "error.main",
          }}
          onClick={() => handleDeleteImage(selectedMenuImage)}
        >
          <DeleteOutlineOutlined
            fontSize="small"
            sx={{
              mr: 1,
            }}
          />
          Delete Image
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default LibraryProfile;
