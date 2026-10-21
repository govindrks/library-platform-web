import {
  Add,
  AddPhotoAlternateOutlined,
  AnalyticsOutlined,
  ArchiveOutlined,
  CheckCircle,
  CloudUploadOutlined,
  ContentCopyOutlined,
  DeleteOutlineOutlined,
  DownloadOutlined,
  Edit,
  EventSeat,
  ImageOutlined,
  LaunchOutlined,
  LinkOutlined,
  LocationOn,
  LockOutlined,
  MoreVert,
  MyLocation,
  PhotoCameraOutlined,
  PublicOutlined,
  QrCode2Outlined,
  Save,
  WhatsApp,
  Star,
  VisibilityOffOutlined,
  VisibilityOutlined,
  PauseCircleOutlineOutlined,
  PlayCircleOutlineOutlined,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import membershipPlanApi from "../../api/membershipPlanApi";
import qrCampaignApi from "../../api/qrCampaignApi";
import seatApi from "../../api/seatApi";
import slotApi from "../../api/slotApi";
import getImageUrl from "../../utility/imageUrl";

// ============================================================
// GOOGLE MAPS
// ============================================================

const GOOGLE_MAPS_SCRIPT_ID = "libraryhub-google-maps-script";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const OWNER_SELECTED_LIBRARY_KEY = "ownerSelectedLibraryId";

const getStoredOwnerLibraryId = () => {
  const value = localStorage.getItem(OWNER_SELECTED_LIBRARY_KEY);

  if (!value) {
    return null;
  }

  const id = Number(value);

  return Number.isFinite(id) ? id : null;
};

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
// ADVANCED QR CAMPAIGNS
// ============================================================

const QR_CAMPAIGN_TYPES = [
  {
    value: "PROFILE",
    label: "Profile",
    description: "Track visits to the public library profile.",
  },
  {
    value: "POSTER",
    label: "Poster",
    description: "Track scans from a printable poster or physical location.",
  },
  {
    value: "MEMBERSHIP_ENQUIRY",
    label: "Membership Enquiry",
    description: "Send visitors to a membership enquiry experience.",
  },
  {
    value: "DIRECT_BOOKING",
    label: "Direct Booking",
    description:
      "Open seat booking with optional plan, floor, slot or seat preselection.",
  },
];

const EMPTY_QR_CAMPAIGN_FORM = {
  name: "",
  description: "",
  type: "POSTER",
  status: "ACTIVE",
  source: "",
  headline: "",
  callToAction: "",
  membershipPlanId: "",
  floorId: "",
  slotId: "",
  seatId: "",
};

const EMPTY_QR_POSTER_FORM = {
  title: "",
  subtitle: "Your perfect study space is one scan away.",
  callToAction: "",
  showAddress: true,
  showPhone: true,
  showCampaignName: false,
  showTrackingUrl: false,
  showMembershipPlans: true,
  showSeatAvailability: true,
  showOnlineBooking: true,
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

const formatPercent = (value) => {
  const number = Number(value ?? 0);

  if (!Number.isFinite(number)) {
    return "0.00%";
  }

  return `${number.toFixed(2)}%`;
};

const formatQrScanDateTime = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const optionalNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
};

const normalizeArrayResponse = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const resolveSeatFloorId = (seat) =>
  seat?.floorId ?? seat?.floor?.id ?? seat?.floor?.floorId ?? null;

const formatSlotLabel = (slot) => {
  const name =
    slot?.name || slot?.slotName || slot?.shiftName || `Slot ${slot?.id}`;
  const start = slot?.startTime ? String(slot.startTime).slice(0, 5) : "";
  const end = slot?.endTime ? String(slot.endTime).slice(0, 5) : "";

  return start && end ? `${name} · ${start} - ${end}` : name;
};

const copyTextToClipboard = async (value) => {
  if (!value) {
    throw new Error("Nothing to copy.");
  }

  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  const copied = document.execCommand("copy");
  textarea.remove();

  if (!copied) {
    throw new Error("Browser clipboard copy failed.");
  }
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
  // QR STATE
  // ==========================================================

  const [qrInfo, setQrInfo] = useState(null);

  const [qrPreviewUrl, setQrPreviewUrl] = useState("");

  const [qrLoading, setQrLoading] = useState(false);

  const [qrDownloading, setQrDownloading] = useState(false);

  const [qrCopying, setQrCopying] = useState(false);

  // ==========================================================
  // ADVANCED QR CAMPAIGN STATE
  // ==========================================================

  const [qrCampaigns, setQrCampaigns] = useState([]);

  const [qrCampaignLoading, setQrCampaignLoading] = useState(false);

  const [qrCampaignSaving, setQrCampaignSaving] = useState(false);

  const [qrCampaignBusyId, setQrCampaignBusyId] = useState(null);

  const [qrCampaignDialogOpen, setQrCampaignDialogOpen] = useState(false);

  const [qrCampaignEditingId, setQrCampaignEditingId] = useState(null);

  const [qrCampaignForm, setQrCampaignForm] = useState(EMPTY_QR_CAMPAIGN_FORM);

  // ==========================================================
  // DIRECT BOOKING QR OPTIONS
  // ==========================================================

  const [qrDirectBookingOptionsLoading, setQrDirectBookingOptionsLoading] =
    useState(false);

  const [qrMembershipPlans, setQrMembershipPlans] = useState([]);

  const [qrFloors, setQrFloors] = useState([]);

  const [qrSlots, setQrSlots] = useState([]);

  const [qrSeats, setQrSeats] = useState([]);

  // ==========================================================
  // QR CAMPAIGN ANALYTICS STATE
  // ==========================================================

  const [qrAnalyticsDialogOpen, setQrAnalyticsDialogOpen] = useState(false);

  const [qrAnalyticsCampaign, setQrAnalyticsCampaign] = useState(null);

  const [qrAnalyticsData, setQrAnalyticsData] = useState(null);

  const [qrAnalyticsLoading, setQrAnalyticsLoading] = useState(false);

  // ==========================================================
  // PRINTABLE QR POSTER STATE
  // ==========================================================

  const [posterCampaign, setPosterCampaign] = useState(null);

  const [posterDialogOpen, setPosterDialogOpen] = useState(false);

  const [posterDownloading, setPosterDownloading] = useState(false);

  const [posterForm, setPosterForm] = useState(EMPTY_QR_POSTER_FORM);

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

  const qrCampaignTotals = useMemo(
    () =>
      qrCampaigns.reduce(
        (totals, campaign) => ({
          campaigns: totals.campaigns + 1,
          totalScans: totals.totalScans + Number(campaign?.totalScans || 0),
          enquiries: totals.enquiries + Number(campaign?.enquiries || 0),
          bookingStarts:
            totals.bookingStarts + Number(campaign?.bookingStarts || 0),
          completedBookings:
            totals.completedBookings + Number(campaign?.completedBookings || 0),
        }),
        {
          campaigns: 0,
          totalScans: 0,
          enquiries: 0,
          bookingStarts: 0,
          completedBookings: 0,
        },
      ),
    [qrCampaigns],
  );

  const qrFilteredSeats = useMemo(() => {
    if (!qrCampaignForm.floorId) {
      return qrSeats;
    }

    return qrSeats.filter(
      (seat) =>
        String(resolveSeatFloorId(seat)) === String(qrCampaignForm.floorId),
    );
  }, [qrCampaignForm.floorId, qrSeats]);

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

      const storedLibraryId = getStoredOwnerLibraryId();

      const currentLibrary =
        (storedLibraryId != null
          ? libraries.find(
              (item) => Number(item.id) === Number(storedLibraryId),
            )
          : null) || libraries[0];

      localStorage.setItem(
        OWNER_SELECTED_LIBRARY_KEY,
        String(currentLibrary.id),
      );

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

  useEffect(() => {
    const handleLibraryChanged = async (event) => {
      const libraryId = Number(event?.detail?.libraryId);

      if (!Number.isFinite(libraryId) || libraryId === Number(library.id)) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        setSuccess("");
        setQrInfo(null);
        setQrPreviewUrl("");

        await refreshLibrary(libraryId);
      } catch (requestError) {
        setError(
          getErrorMessage(requestError, "Unable to switch library profile."),
        );
      } finally {
        setLoading(false);
      }
    };

    window.addEventListener("owner-library-changed", handleLibraryChanged);

    return () => {
      window.removeEventListener("owner-library-changed", handleLibraryChanged);
    };
  }, [library.id, refreshLibrary]);

  // ==========================================================
  // HEADER PROFILE REFRESH EVENT
  // ==========================================================

  const notifyLibraryProfileUpdated = useCallback((libraryId) => {
    if (!libraryId) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent("owner-library-profile-updated", {
        detail: {
          libraryId: Number(libraryId),
        },
      }),
    );
  }, []);

  // ==========================================================
  // QR LOAD
  // ==========================================================

  const loadLibraryQr = useCallback(async () => {
    if (!library.id) {
      setQrInfo(null);

      setQrPreviewUrl((previous) => {
        if (previous) {
          window.URL.revokeObjectURL(previous);
        }

        return "";
      });

      return;
    }

    try {
      setQrLoading(true);
      setError("");

      // ========================================================
      // LOAD QR METADATA
      // ========================================================

      const info = await libraryApi.getLibraryQr(library.id);

      setQrInfo(info);

      // ========================================================
      // LOAD INLINE QR PREVIEW
      // ========================================================
      //
      // Backend:
      //
      // GET
      // /api/libraries/{libraryId}/qr/png?download=false
      //
      // The response is a Blob. The browser converts it into an
      // object URL used by the <img> preview below.
      //
      // ========================================================

      const blob = await libraryApi.getLibraryQrPreview(library.id);

      if (!blob) {
        throw new Error("QR preview image was not returned.");
      }

      const objectUrl = window.URL.createObjectURL(blob);

      setQrPreviewUrl((previous) => {
        if (previous) {
          window.URL.revokeObjectURL(previous);
        }

        return objectUrl;
      });
    } catch (requestError) {
      console.error("Unable to load library QR:", requestError);

      setQrInfo(null);

      setQrPreviewUrl((previous) => {
        if (previous) {
          window.URL.revokeObjectURL(previous);
        }

        return "";
      });

      setError(
        getErrorMessage(requestError, "Unable to load permanent library QR."),
      );
    } finally {
      setQrLoading(false);
    }
  }, [library.id]);

  // ==========================================================
  // QR OBJECT URL CLEANUP
  // ==========================================================

  useEffect(() => {
    loadLibraryQr();

    return () => {
      setQrPreviewUrl((current) => {
        if (current) {
          window.URL.revokeObjectURL(current);
        }

        return "";
      });
    };
  }, [loadLibraryQr]);

  // ==========================================================
  // COPY PUBLIC LINK
  // ==========================================================

  const handleCopyPublicLink = async () => {
    if (!qrInfo?.publicUrl) {
      return;
    }

    try {
      setQrCopying(true);
      setError("");
      setSuccess("");

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(qrInfo.publicUrl);
      } else {
        const textarea = document.createElement("textarea");

        textarea.value = qrInfo.publicUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        textarea.style.pointerEvents = "none";

        document.body.appendChild(textarea);

        textarea.focus();
        textarea.select();

        const copied = document.execCommand("copy");

        textarea.remove();

        if (!copied) {
          throw new Error("Browser clipboard copy failed.");
        }
      }

      setSuccess("Public library link copied.");
    } catch (requestError) {
      console.error("Unable to copy public library link:", requestError);

      setError("Unable to copy the public library link.");
    } finally {
      setQrCopying(false);
    }
  };

  // ==========================================================
  // OPEN PUBLIC PROFILE
  // ==========================================================

  const handleOpenPublicProfile = () => {
    if (!qrInfo?.publicUrl || qrInfo?.publicAvailable === false) {
      return;
    }

    window.open(qrInfo.publicUrl, "_blank", "noopener,noreferrer");
  };

  // ==========================================================
  // SHARE ON WHATSAPP
  // ==========================================================

  const handleShareWhatsApp = () => {
    if (!qrInfo?.publicUrl || qrInfo?.publicAvailable === false) {
      return;
    }

    const libraryName =
      library.libraryName || qrInfo.libraryName || "this library";

    const message = [
      `Explore ${libraryName} on LibraryHub.`,
      "",
      "View library details, membership plans and seat availability:",
      qrInfo.publicUrl,
    ].join("\n");

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  // ==========================================================
  // DOWNLOAD QR
  // ==========================================================

  const handleDownloadQr = async () => {
    if (!library.id) {
      return;
    }

    try {
      setQrDownloading(true);
      setError("");
      setSuccess("");

      await libraryApi.saveLibraryQrPng(
        library.id,
        library.libraryName || `library-${library.id}`,
      );

      setSuccess("QR code downloaded successfully.");
    } catch (requestError) {
      console.error("Unable to download library QR:", requestError);

      setError(getErrorMessage(requestError, "Unable to download QR code."));
    } finally {
      setQrDownloading(false);
    }
  };

  // ==========================================================
  // DIRECT BOOKING QR OPTIONS
  // ==========================================================

  const loadQrDirectBookingOptions = useCallback(async () => {
    if (!library.id) {
      setQrMembershipPlans([]);
      setQrFloors([]);
      setQrSlots([]);
      setQrSeats([]);
      return;
    }

    try {
      setQrDirectBookingOptionsLoading(true);

      const [planResponse, floorResponse, slotResponse, seatResponse] =
        await Promise.all([
          membershipPlanApi.getActivePlans(library.id),
          seatApi.getFloors(library.id),
          slotApi.getActiveSlots(library.id),
          seatApi.getLibrarySeats(library.id),
        ]);

      setQrMembershipPlans(normalizeArrayResponse(planResponse));
      setQrFloors(normalizeArrayResponse(floorResponse));
      setQrSlots(normalizeArrayResponse(slotResponse));
      setQrSeats(normalizeArrayResponse(seatResponse));
    } catch (requestError) {
      console.error("Unable to load direct-booking QR options:", requestError);

      setQrMembershipPlans([]);
      setQrFloors([]);
      setQrSlots([]);
      setQrSeats([]);

      setError(
        getErrorMessage(
          requestError,
          "Unable to load plans, floors, slots and seats for direct booking QR.",
        ),
      );
    } finally {
      setQrDirectBookingOptionsLoading(false);
    }
  }, [library.id]);

  useEffect(() => {
    loadQrDirectBookingOptions();
  }, [loadQrDirectBookingOptions]);

  // ==========================================================
  // ADVANCED QR CAMPAIGNS
  // ==========================================================

  const loadQrCampaigns = useCallback(async () => {
    if (!library.id) {
      setQrCampaigns([]);
      return;
    }

    try {
      setQrCampaignLoading(true);

      const response = await qrCampaignApi.getCampaigns(library.id);

      setQrCampaigns(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error("Unable to load QR campaigns:", requestError);

      setQrCampaigns([]);
      setError(
        getErrorMessage(requestError, "Unable to load advanced QR campaigns."),
      );
    } finally {
      setQrCampaignLoading(false);
    }
  }, [library.id]);

  useEffect(() => {
    loadQrCampaigns();
  }, [loadQrCampaigns]);

  // ==========================================================
  // QR CAMPAIGN ANALYTICS
  // ==========================================================

  const handleOpenQrAnalytics = async (campaign) => {
    if (!library.id || !campaign?.id) {
      return;
    }

    try {
      setQrAnalyticsCampaign(campaign);
      setQrAnalyticsData(null);
      setQrAnalyticsDialogOpen(true);
      setQrAnalyticsLoading(true);
      setError("");

      const analytics = await qrCampaignApi.getAnalytics(
        library.id,
        campaign.id,
      );

      setQrAnalyticsData(analytics || null);
    } catch (requestError) {
      console.error("Unable to load QR campaign analytics:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to load QR campaign analytics."),
      );
    } finally {
      setQrAnalyticsLoading(false);
    }
  };

  const handleCloseQrAnalytics = () => {
    if (qrAnalyticsLoading) {
      return;
    }

    setQrAnalyticsDialogOpen(false);
    setQrAnalyticsCampaign(null);
    setQrAnalyticsData(null);
  };

  const resetQrCampaignForm = () => {
    setQrCampaignForm(EMPTY_QR_CAMPAIGN_FORM);
    setQrCampaignEditingId(null);
  };

  const handleOpenCreateQrCampaign = () => {
    resetQrCampaignForm();
    setError("");
    setSuccess("");
    setQrCampaignDialogOpen(true);
  };

  const handleCloseQrCampaignDialog = () => {
    if (qrCampaignSaving) {
      return;
    }

    setQrCampaignDialogOpen(false);
    resetQrCampaignForm();
  };

  const handleQrCampaignFormChange = (event) => {
    const { name, value } = event.target;

    setQrCampaignForm((previous) => {
      const next = {
        ...previous,
        [name]: value,
      };

      if (name === "type") {
        if (value === "DIRECT_BOOKING") {
          // Keep any plan already selected when switching from an enquiry
          // campaign to direct booking, but reset booking-specific fields.
          next.floorId = "";
          next.slotId = "";
          next.seatId = "";
        } else if (value === "MEMBERSHIP_ENQUIRY") {
          // Membership enquiry campaigns may optionally target one plan.
          // Floor, slot and seat are booking-only selections.
          next.floorId = "";
          next.slotId = "";
          next.seatId = "";
        } else {
          next.membershipPlanId = "";
          next.floorId = "";
          next.slotId = "";
          next.seatId = "";
        }
      }

      if (name === "floorId") {
        next.seatId = "";
      }

      return next;
    });
  };

  const handleEditQrCampaign = async (campaign) => {
    if (!library.id || !campaign?.id) {
      return;
    }

    try {
      setQrCampaignBusyId(campaign.id);
      setError("");
      setSuccess("");

      const details = await qrCampaignApi.getCampaign(library.id, campaign.id);

      setQrCampaignEditingId(campaign.id);
      setQrCampaignForm({
        name: details?.name || "",
        description: details?.description || "",
        type: details?.type || "POSTER",
        status: details?.status || "ACTIVE",
        source: details?.source || "",
        headline: details?.headline || "",
        callToAction: details?.callToAction || "",
        membershipPlanId: details?.membershipPlanId ?? "",
        floorId: details?.floorId ?? "",
        slotId: details?.slotId ?? "",
        seatId: details?.seatId ?? "",
      });

      setQrCampaignDialogOpen(true);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to load QR campaign details."),
      );
    } finally {
      setQrCampaignBusyId(null);
    }
  };

  const handleSaveQrCampaign = async () => {
    if (!library.id) {
      return;
    }

    if (!qrCampaignForm.name.trim()) {
      setError("Campaign name is required.");
      return;
    }

    const directBooking = qrCampaignForm.type === "DIRECT_BOOKING";
    const membershipEnquiry = qrCampaignForm.type === "MEMBERSHIP_ENQUIRY";

    if (
      directBooking &&
      !qrCampaignForm.membershipPlanId &&
      !qrCampaignForm.floorId &&
      !qrCampaignForm.slotId &&
      !qrCampaignForm.seatId
    ) {
      setError(
        "Direct booking QR requires at least one plan, floor, slot or seat selection.",
      );
      return;
    }

    const payload = {
      name: qrCampaignForm.name.trim(),
      description: qrCampaignForm.description.trim() || null,
      type: qrCampaignForm.type,
      status: qrCampaignForm.status || "ACTIVE",
      source: qrCampaignForm.source.trim() || null,
      headline: qrCampaignForm.headline.trim() || null,
      callToAction: qrCampaignForm.callToAction.trim() || null,
      membershipPlanId:
        directBooking || membershipEnquiry
          ? optionalNumber(qrCampaignForm.membershipPlanId)
          : null,
      floorId: directBooking ? optionalNumber(qrCampaignForm.floorId) : null,
      slotId: directBooking ? optionalNumber(qrCampaignForm.slotId) : null,
      seatId: directBooking ? optionalNumber(qrCampaignForm.seatId) : null,
    };

    try {
      setQrCampaignSaving(true);
      setError("");
      setSuccess("");

      if (qrCampaignEditingId) {
        await qrCampaignApi.updateCampaign(
          library.id,
          qrCampaignEditingId,
          payload,
        );
      } else {
        await qrCampaignApi.createCampaign(library.id, payload);
      }

      await loadQrCampaigns();

      setQrCampaignDialogOpen(false);
      resetQrCampaignForm();

      setSuccess(
        qrCampaignEditingId
          ? "QR campaign updated successfully."
          : "QR campaign created successfully.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          qrCampaignEditingId
            ? "Unable to update QR campaign."
            : "Unable to create QR campaign.",
        ),
      );
    } finally {
      setQrCampaignSaving(false);
    }
  };

  const handleQrCampaignStatus = async (campaign, action) => {
    if (!library.id || !campaign?.id) {
      return;
    }

    if (
      action === "archive" &&
      !window.confirm(
        `Archive QR campaign "${campaign.name}"? The printed QR will stop resolving while archived.`,
      )
    ) {
      return;
    }

    try {
      setQrCampaignBusyId(campaign.id);
      setError("");
      setSuccess("");

      if (action === "activate") {
        await qrCampaignApi.activateCampaign(library.id, campaign.id);
      } else if (action === "deactivate") {
        await qrCampaignApi.deactivateCampaign(library.id, campaign.id);
      } else if (action === "archive") {
        await qrCampaignApi.archiveCampaign(library.id, campaign.id);
      } else {
        return;
      }

      await loadQrCampaigns();

      setSuccess(
        action === "activate"
          ? "QR campaign activated."
          : action === "deactivate"
            ? "QR campaign deactivated."
            : "QR campaign archived.",
      );
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to change QR campaign status."),
      );
    } finally {
      setQrCampaignBusyId(null);
    }
  };

  const handleCopyQrCampaignLink = async (campaign) => {
    if (!campaign?.trackingUrl) {
      return;
    }

    try {
      setQrCampaignBusyId(campaign.id);
      setError("");
      setSuccess("");

      await copyTextToClipboard(campaign.trackingUrl);

      setSuccess(`Tracking link copied for ${campaign.name}.`);
    } catch (requestError) {
      setError(
        getErrorMessage(requestError, "Unable to copy campaign tracking link."),
      );
    } finally {
      setQrCampaignBusyId(null);
    }
  };

  const handlePreviewQrCampaignDestination = async (campaign) => {
    if (!library.id || !campaign?.id) {
      return;
    }

    try {
      setQrCampaignBusyId(campaign.id);
      setError("");

      const details = await qrCampaignApi.getCampaign(library.id, campaign.id);

      if (!details?.destinationUrl) {
        throw new Error("Campaign destination is unavailable.");
      }

      // Open the resolved destination directly so the owner's preview does
      // not artificially increase campaign scan analytics.
      window.open(details.destinationUrl, "_blank", "noopener,noreferrer");
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to preview campaign destination.",
        ),
      );
    } finally {
      setQrCampaignBusyId(null);
    }
  };

  // ==========================================================
  // PREVIEW CAMPAIGN QR
  // ==========================================================

  const handlePreviewCampaignQr = async (campaign) => {
    if (!library.id || !campaign?.id) {
      return;
    }

    let previewWindow = null;

    try {
      setQrCampaignBusyId(campaign.id);
      setError("");
      setSuccess("");

      // Open immediately from the user gesture so popup blockers do not
      // block the preview after the async request completes.
      previewWindow = window.open("", "_blank");

      const blob = await qrCampaignApi.getCampaignQrPreview(
        library.id,
        campaign.id,
      );

      if (!blob) {
        throw new Error("Campaign QR image was not returned.");
      }

      const objectUrl = window.URL.createObjectURL(blob);

      if (previewWindow) {
        previewWindow.opener = null;
        previewWindow.location.href = objectUrl;
      } else {
        const anchor = document.createElement("a");
        anchor.href = objectUrl;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
      }

      // Keep the URL alive long enough for the new tab to load it.
      window.setTimeout(() => {
        window.URL.revokeObjectURL(objectUrl);
      }, 60000);
    } catch (requestError) {
      if (previewWindow && !previewWindow.closed) {
        previewWindow.close();
      }

      console.error("Unable to preview campaign QR:", requestError);

      setError(getErrorMessage(requestError, "Unable to preview campaign QR."));
    } finally {
      setQrCampaignBusyId(null);
    }
  };

  // ==========================================================
  // DOWNLOAD CAMPAIGN QR
  // ==========================================================

  const handleDownloadCampaignQr = async (campaign) => {
    if (!library.id || !campaign?.id) {
      return;
    }

    try {
      setQrCampaignBusyId(campaign.id);
      setError("");
      setSuccess("");

      await qrCampaignApi.saveCampaignQrPng(
        library.id,
        campaign.id,
        campaign.name || `campaign-${campaign.id}`,
      );

      setSuccess("Campaign QR downloaded successfully.");
    } catch (requestError) {
      console.error("Unable to download campaign QR:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to download campaign QR."),
      );
    } finally {
      setQrCampaignBusyId(null);
    }
  };

  // ==========================================================
  // PRINTABLE QR POSTER
  // ==========================================================

  const handleOpenPosterDialog = (campaign) => {
    if (!campaign?.id) {
      return;
    }

    setError("");
    setSuccess("");
    setPosterCampaign(campaign);
    setPosterForm({
      ...EMPTY_QR_POSTER_FORM,
      title: library.libraryName || "",
      subtitle:
        campaign?.headline || "Your perfect study space is one scan away.",
      callToAction: campaign?.callToAction || "",
    });
    setPosterDialogOpen(true);
  };

  const handleClosePosterDialog = () => {
    if (posterDownloading) {
      return;
    }

    setPosterDialogOpen(false);
    setPosterCampaign(null);
    setPosterForm(EMPTY_QR_POSTER_FORM);
  };

  const handlePosterFieldChange = (event) => {
    const { name, value, checked, type } = event.target;

    setPosterForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDownloadPoster = async () => {
    if (!library.id || !posterCampaign?.id) {
      return;
    }

    try {
      setPosterDownloading(true);
      setQrCampaignBusyId(posterCampaign.id);
      setError("");
      setSuccess("");

      await qrCampaignApi.saveCampaignPosterPdf(
        library.id,
        posterCampaign.id,
        posterCampaign.name || `campaign-${posterCampaign.id}`,
        {
          title: posterForm.title?.trim() || null,
          subtitle: posterForm.subtitle?.trim() || null,
          callToAction: posterForm.callToAction?.trim() || null,
          showAddress: Boolean(posterForm.showAddress),
          showPhone: Boolean(posterForm.showPhone),
          showCampaignName: Boolean(posterForm.showCampaignName),
          showTrackingUrl: Boolean(posterForm.showTrackingUrl),
          showMembershipPlans: Boolean(posterForm.showMembershipPlans),
          showSeatAvailability: Boolean(posterForm.showSeatAvailability),
          showOnlineBooking: Boolean(posterForm.showOnlineBooking),
        },
      );

      setSuccess("Printable QR poster downloaded successfully.");
      setPosterDialogOpen(false);
      setPosterCampaign(null);
      setPosterForm(EMPTY_QR_POSTER_FORM);
    } catch (requestError) {
      console.error("Unable to generate QR poster:", requestError);

      setError(
        getErrorMessage(
          requestError,
          "Unable to generate printable QR poster.",
        ),
      );
    } finally {
      setPosterDownloading(false);
      setQrCampaignBusyId(null);
    }
  };

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

      notifyLibraryProfileUpdated(library.id);

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

      notifyLibraryProfileUpdated(library.id);

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

      notifyLibraryProfileUpdated(library.id);

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

      notifyLibraryProfileUpdated(library.id);

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

      notifyLibraryProfileUpdated(library.id);

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
      {/* SHARE & QR CODE */}
      {/* ====================================================== */}

      <PremiumSection
        icon={<QrCode2Outlined />}
        title="Share & QR Code"
        description="Use one permanent QR code and public link for this library. Visitors can scan and browse without signing in."
        action={
          <Chip
            size="small"
            icon={
              qrInfo?.publicAvailable === false ? (
                <VisibilityOffOutlined />
              ) : (
                <CheckCircle />
              )
            }
            label={
              qrInfo?.publicAvailable === false
                ? "Public profile unavailable"
                : "Permanent QR"
            }
            color={qrInfo?.publicAvailable === false ? "warning" : "success"}
            variant="outlined"
            sx={{ fontWeight: 750 }}
          />
        }
      >
        {qrLoading ? (
          <Stack
            minHeight={250}
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
          >
            <CircularProgress size={30} />
            <Typography variant="body2" color="text.secondary">
              Loading permanent QR...
            </Typography>
          </Stack>
        ) : (
          <Grid container spacing={3} alignItems="stretch">
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  height: "100%",
                  minHeight: 330,
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 3.5,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.14),
                  bgcolor: alpha(theme.palette.primary.main, 0.035),
                }}
              >
                <Box
                  sx={{
                    width: { xs: 220, md: 245 },
                    maxWidth: "100%",
                    aspectRatio: "1 / 1",
                    p: 1.5,
                    borderRadius: 3,
                    bgcolor: "#fff",
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.9),
                    display: "grid",
                    placeItems: "center",
                    boxShadow: "0 16px 40px rgba(15,23,42,0.08)",
                  }}
                >
                  {qrPreviewUrl ? (
                    <Box
                      component="img"
                      src={qrPreviewUrl}
                      alt={`${library.libraryName || "Library"} QR code`}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : (
                    <QrCode2Outlined
                      sx={{
                        fontSize: 90,
                        color: "text.disabled",
                      }}
                    />
                  )}
                </Box>

                <Typography
                  variant="subtitle1"
                  fontWeight={850}
                  textAlign="center"
                  mt={2}
                >
                  {library.libraryName || "Library"}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  textAlign="center"
                  sx={{ mt: 0.35 }}
                >
                  Scan to open the public LibraryHub profile
                </Typography>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.25} sx={{ height: "100%" }}>
                <Box
                  sx={{
                    p: 2.2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <LinkOutlined color="primary" fontSize="small" />
                    <Typography fontWeight={800}>
                      Permanent public link
                    </Typography>
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.25 }}
                  >
                    This URL stays tied to library ID {library.id}. Downloading
                    the QR again does not create a new destination.
                  </Typography>

                  <Box
                    sx={{
                      px: 1.6,
                      py: 1.35,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.16),
                      bgcolor: alpha(theme.palette.primary.main, 0.045),
                      overflowWrap: "anywhere",
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="primary.main"
                      fontWeight={700}
                    >
                      {qrInfo?.publicUrl || "Public URL unavailable"}
                    </Typography>
                  </Box>
                </Box>

                {qrInfo?.publicAvailable === false && (
                  <Alert severity="warning" sx={{ borderRadius: 2.5 }}>
                    This permanent QR remains assigned to the library, but the
                    public profile is currently unavailable. Activate/publish
                    the library and enable public discovery before sharing it.
                  </Alert>
                )}

                <Grid container spacing={1.5}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={
                        qrDownloading ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <DownloadOutlined />
                        )
                      }
                      disabled={qrDownloading || !library.id}
                      onClick={handleDownloadQr}
                      sx={{ minHeight: 46, borderRadius: 2.5, fontWeight: 750 }}
                    >
                      {qrDownloading ? "Downloading..." : "Download PNG"}
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={
                        qrCopying ? (
                          <CircularProgress size={16} />
                        ) : (
                          <ContentCopyOutlined />
                        )
                      }
                      disabled={qrCopying || !qrInfo?.publicUrl}
                      onClick={handleCopyPublicLink}
                      sx={{ minHeight: 46, borderRadius: 2.5, fontWeight: 750 }}
                    >
                      {qrCopying ? "Copying..." : "Copy Link"}
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="success"
                      startIcon={<WhatsApp />}
                      disabled={
                        !qrInfo?.publicUrl || qrInfo?.publicAvailable === false
                      }
                      onClick={handleShareWhatsApp}
                      sx={{ minHeight: 46, borderRadius: 2.5, fontWeight: 750 }}
                    >
                      Share on WhatsApp
                    </Button>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<LaunchOutlined />}
                      disabled={
                        !qrInfo?.publicUrl || qrInfo?.publicAvailable === false
                      }
                      onClick={handleOpenPublicProfile}
                      sx={{ minHeight: 46, borderRadius: 2.5, fontWeight: 750 }}
                    >
                      Open Public Profile
                    </Button>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: "auto",
                    p: 2,
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.045),
                    border: "1px solid",
                    borderColor: alpha(theme.palette.success.main, 0.14),
                  }}
                >
                  <Grid container spacing={1}>
                    {[
                      "Permanent QR for this library",
                      "Visitors can scan without signing in",
                      "Booking remains protected by authentication",
                      "Different libraries receive different QR destinations",
                    ].map((item) => (
                      <Grid key={item} size={{ xs: 12, sm: 6 }}>
                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="center"
                        >
                          <CheckCircle
                            color="success"
                            sx={{ fontSize: 17, flexShrink: 0 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {item}
                          </Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </PremiumSection>

      {/* ====================================================== */}
      {/* ADVANCED QR CAMPAIGNS */}
      {/* ====================================================== */}

      <PremiumSection
        icon={<AnalyticsOutlined />}
        title="Advanced QR Campaigns"
        description="Create trackable QR links for posters, membership enquiries and direct booking campaigns."
        action={
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleOpenCreateQrCampaign}
            disabled={!library.id}
            sx={{
              borderRadius: 2.5,
              minHeight: 42,
              px: 2.25,
              fontWeight: 750,
              boxShadow: "none",
            }}
          >
            Create Campaign
          </Button>
        }
      >
        <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 6, md: 3 }}>
            <MetricTile
              icon={<QrCode2Outlined fontSize="small" />}
              label="Campaigns"
              value={qrCampaignTotals.campaigns}
              helper="All QR campaigns"
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <MetricTile
              icon={<AnalyticsOutlined fontSize="small" />}
              label="Total Scans"
              value={qrCampaignTotals.totalScans}
              helper="Across campaigns"
              tone="info"
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <MetricTile
              icon={<PublicOutlined fontSize="small" />}
              label="Enquiries"
              value={qrCampaignTotals.enquiries}
              helper="QR-attributed leads"
              tone="warning"
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <MetricTile
              icon={<CheckCircle fontSize="small" />}
              label="Bookings"
              value={qrCampaignTotals.completedBookings}
              helper={`${qrCampaignTotals.bookingStarts} booking starts`}
              tone="success"
            />
          </Grid>
        </Grid>

        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2.5 }}>
          Campaign QR links use <strong>/q/&lt;code&gt;</strong>. A visitor scan
          is recorded by the backend before the visitor is sent to the public
          profile, enquiry page or booking flow. Your own “Preview Destination”
          action bypasses tracking so test previews do not inflate analytics.
        </Alert>

        {qrCampaignLoading ? (
          <Stack
            minHeight={180}
            alignItems="center"
            justifyContent="center"
            spacing={1.25}
          >
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Loading QR campaigns...
            </Typography>
          </Stack>
        ) : qrCampaigns.length === 0 ? (
          <Box
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: 3,
              border: "1px dashed",
              borderColor: "divider",
              textAlign: "center",
              bgcolor: "background.default",
            }}
          >
            <QrCode2Outlined
              sx={{ fontSize: 48, color: "text.disabled", mb: 1 }}
            />

            <Typography variant="h6" fontWeight={800}>
              No advanced QR campaigns yet
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, mb: 2 }}
            >
              Create a poster, enquiry or direct-booking campaign to start
              tracking scans and conversions.
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreateQrCampaign}
              sx={{ borderRadius: 2.5, fontWeight: 750, boxShadow: "none" }}
            >
              Create First Campaign
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {qrCampaigns.map((campaign) => {
              const busy = qrCampaignBusyId === campaign.id;
              const active = campaign.status === "ACTIVE";
              const archived = campaign.status === "ARCHIVED";

              return (
                <Grid key={campaign.id} size={{ xs: 12 }}>
                  <Card
                    elevation={0}
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.divider, 0.9),
                      bgcolor: "background.paper",
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                      <Stack spacing={2}>
                        <Stack
                          direction={{ xs: "column", sm: "row" }}
                          justifyContent="space-between"
                          alignItems={{ xs: "flex-start", sm: "center" }}
                          gap={1}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography
                              variant="subtitle1"
                              fontWeight={850}
                              noWrap
                            >
                              {campaign.name}
                            </Typography>

                            <Stack
                              direction="row"
                              spacing={0.75}
                              flexWrap="wrap"
                              useFlexGap
                              sx={{ mt: 0.75 }}
                            >
                              <Chip
                                size="small"
                                label={displayEnum(campaign.type)}
                                variant="outlined"
                                color="primary"
                              />

                              <Chip
                                size="small"
                                label={displayEnum(campaign.status)}
                                color={
                                  active
                                    ? "success"
                                    : archived
                                      ? "default"
                                      : "warning"
                                }
                                variant={active ? "filled" : "outlined"}
                              />

                              {campaign.source && (
                                <Chip
                                  size="small"
                                  label={`Source: ${displayEnum(campaign.source)}`}
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </Box>

                          {busy && <CircularProgress size={20} />}
                        </Stack>

                        <Box
                          sx={{
                            px: 1.5,
                            py: 1.25,
                            borderRadius: 2.25,
                            bgcolor: alpha(theme.palette.primary.main, 0.045),
                            border: "1px solid",
                            borderColor: alpha(
                              theme.palette.primary.main,
                              0.12,
                            ),
                          }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                          >
                            Tracking code
                          </Typography>
                          <Typography
                            variant="body2"
                            color="primary.main"
                            fontWeight={800}
                            sx={{ mt: 0.2, overflowWrap: "anywhere" }}
                          >
                            {campaign.code} · {campaign.trackingUrl}
                          </Typography>
                        </Box>

                        <Grid container spacing={1}>
                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="h6" fontWeight={850}>
                              {Number(campaign.totalScans || 0)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Scans
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="h6" fontWeight={850}>
                              {Number(campaign.uniqueVisitors || 0)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Unique
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="h6" fontWeight={850}>
                              {Number(campaign.enquiries || 0)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Enquiries
                            </Typography>
                          </Grid>

                          <Grid size={{ xs: 6, sm: 3 }}>
                            <Typography variant="h6" fontWeight={850}>
                              {Number(campaign.completedBookings || 0)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Bookings
                            </Typography>
                          </Grid>
                        </Grid>

                        <Divider />

                        {/* ================================================== */}
                        {/* CAMPAIGN ACTIONS */}
                        {/* ================================================== */}

                        <Stack spacing={1.25} sx={{ width: "100%" }}>
                          {/* ================================================ */}
                          {/* PRIMARY ACTIONS */}
                          {/* ================================================ */}

                          <Grid container spacing={1}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Button
                                fullWidth
                                size="small"
                                variant="contained"
                                startIcon={<AnalyticsOutlined />}
                                disabled={busy}
                                onClick={() => handleOpenQrAnalytics(campaign)}
                                sx={{
                                  minHeight: 42,
                                  borderRadius: 2.25,
                                  fontWeight: 750,
                                  boxShadow: "none",
                                }}
                              >
                                View Analytics
                              </Button>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                              <Button
                                fullWidth
                                size="small"
                                variant="contained"
                                startIcon={<QrCode2Outlined />}
                                disabled={busy || archived}
                                onClick={() => handleOpenPosterDialog(campaign)}
                                sx={{
                                  minHeight: 42,
                                  borderRadius: 2.25,
                                  fontWeight: 750,
                                  boxShadow: "none",
                                }}
                              >
                                Printable Poster
                              </Button>
                            </Grid>
                          </Grid>

                          {/* ================================================ */}
                          {/* SECONDARY ACTIONS */}
                          {/* ================================================ */}

                          <Grid container spacing={1}>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<ContentCopyOutlined />}
                                disabled={busy || !campaign.trackingUrl}
                                onClick={() =>
                                  handleCopyQrCampaignLink(campaign)
                                }
                                sx={{
                                  minHeight: 40,
                                  borderRadius: 2,
                                  fontWeight: 700,
                                }}
                              >
                                Copy Link
                              </Button>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<QrCode2Outlined />}
                                disabled={busy}
                                onClick={() =>
                                  handlePreviewCampaignQr(campaign)
                                }
                                sx={{
                                  minHeight: 40,
                                  borderRadius: 2,
                                  fontWeight: 700,
                                }}
                              >
                                Preview QR
                              </Button>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<DownloadOutlined />}
                                disabled={busy}
                                onClick={() =>
                                  handleDownloadCampaignQr(campaign)
                                }
                                sx={{
                                  minHeight: 40,
                                  borderRadius: 2,
                                  fontWeight: 700,
                                }}
                              >
                                Download QR
                              </Button>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                              <Button
                                fullWidth
                                size="small"
                                variant="outlined"
                                startIcon={<LaunchOutlined />}
                                disabled={busy || archived}
                                onClick={() =>
                                  handlePreviewQrCampaignDestination(campaign)
                                }
                                sx={{
                                  minHeight: 40,
                                  borderRadius: 2,
                                  fontWeight: 700,
                                }}
                              >
                                Destination
                              </Button>
                            </Grid>
                          </Grid>

                          {/* ================================================ */}
                          {/* MANAGEMENT ACTIONS */}
                          {/* ================================================ */}

                          <Stack
                            direction="row"
                            spacing={0.75}
                            justifyContent="flex-end"
                            flexWrap="wrap"
                            useFlexGap
                            sx={{ pt: 0.25 }}
                          >
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<Edit />}
                              disabled={busy || archived}
                              onClick={() => handleEditQrCampaign(campaign)}
                              sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                              Edit
                            </Button>

                            {!archived && (
                              <Button
                                size="small"
                                variant="text"
                                color={active ? "warning" : "success"}
                                startIcon={
                                  active ? (
                                    <PauseCircleOutlineOutlined />
                                  ) : (
                                    <PlayCircleOutlineOutlined />
                                  )
                                }
                                disabled={busy}
                                onClick={() =>
                                  handleQrCampaignStatus(
                                    campaign,
                                    active ? "deactivate" : "activate",
                                  )
                                }
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                              >
                                {active ? "Deactivate" : "Activate"}
                              </Button>
                            )}

                            {!archived && (
                              <Button
                                size="small"
                                variant="text"
                                color="inherit"
                                startIcon={<ArchiveOutlined />}
                                disabled={busy}
                                onClick={() =>
                                  handleQrCampaignStatus(campaign, "archive")
                                }
                                sx={{ borderRadius: 2, fontWeight: 700 }}
                              >
                                Archive
                              </Button>
                            )}
                          </Stack>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </PremiumSection>

      {/* ====================================================== */}
      {/* QR CAMPAIGN ANALYTICS DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={qrAnalyticsDialogOpen}
        onClose={handleCloseQrAnalytics}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            borderRadius: 3.5,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1.5 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: 2.25,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: "primary.main",
                }}
              >
                <AnalyticsOutlined />
              </Box>

              <Box>
                <Typography variant="h6" fontWeight={850}>
                  QR Campaign Analytics
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {qrAnalyticsCampaign?.name || "Campaign performance"}
                </Typography>
              </Box>
            </Stack>

            {qrAnalyticsData && (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip
                  size="small"
                  label={displayEnum(qrAnalyticsData.campaignType)}
                  color="primary"
                  variant="outlined"
                />

                <Chip
                  size="small"
                  label={displayEnum(qrAnalyticsData.campaignStatus)}
                  color={
                    qrAnalyticsData.campaignStatus === "ACTIVE"
                      ? "success"
                      : qrAnalyticsData.campaignStatus === "INACTIVE"
                        ? "warning"
                        : "default"
                  }
                />

                {qrAnalyticsData.source && (
                  <Chip
                    size="small"
                    label={`Source: ${displayEnum(qrAnalyticsData.source)}`}
                    variant="outlined"
                  />
                )}
              </Stack>
            )}
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          {qrAnalyticsLoading ? (
            <Stack
              minHeight={360}
              alignItems="center"
              justifyContent="center"
              spacing={1.5}
            >
              <CircularProgress />

              <Typography color="text.secondary">
                Loading campaign analytics...
              </Typography>
            </Stack>
          ) : !qrAnalyticsData ? (
            <Alert severity="info" sx={{ borderRadius: 2.5 }}>
              Analytics data is not available for this campaign yet.
            </Alert>
          ) : (
            <Stack spacing={3}>
              {/* CORE KPI METRICS */}

              <Grid container spacing={1.5}>
                <Grid size={{ xs: 6, md: 2.4 }}>
                  <MetricTile
                    icon={<QrCode2Outlined fontSize="small" />}
                    label="Scans"
                    value={Number(qrAnalyticsData.totalScans || 0)}
                    helper="All QR opens"
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 2.4 }}>
                  <MetricTile
                    icon={<PublicOutlined fontSize="small" />}
                    label="Unique Visitors"
                    value={Number(qrAnalyticsData.uniqueVisitors || 0)}
                    helper="Distinct visitor hashes"
                    tone="info"
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 2.4 }}>
                  <MetricTile
                    icon={<PublicOutlined fontSize="small" />}
                    label="Enquiries"
                    value={Number(qrAnalyticsData.enquiries || 0)}
                    helper={formatPercent(
                      qrAnalyticsData.enquiryConversionRate,
                    )}
                    tone="warning"
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 2.4 }}>
                  <MetricTile
                    icon={<EventSeat fontSize="small" />}
                    label="Booking Starts"
                    value={Number(qrAnalyticsData.bookingStarts || 0)}
                    helper={formatPercent(qrAnalyticsData.bookingStartRate)}
                    tone="secondary"
                  />
                </Grid>

                <Grid size={{ xs: 6, md: 2.4 }}>
                  <MetricTile
                    icon={<CheckCircle fontSize="small" />}
                    label="Bookings"
                    value={Number(qrAnalyticsData.completedBookings || 0)}
                    helper={formatPercent(
                      qrAnalyticsData.bookingCompletionRate,
                    )}
                    tone="success"
                  />
                </Grid>
              </Grid>

              {/* CONVERSION FUNNEL */}

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Typography variant="subtitle1" fontWeight={850}>
                    Conversion Funnel
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.35, mb: 2 }}
                  >
                    See how scans progress into enquiries and completed
                    bookings.
                  </Typography>

                  <Grid container spacing={1.5}>
                    {[
                      {
                        label: "Enquiry Conversion",
                        value: qrAnalyticsData.enquiryConversionRate,
                        helper: `${Number(qrAnalyticsData.enquiries || 0)} enquiries`,
                      },
                      {
                        label: "Booking Start Rate",
                        value: qrAnalyticsData.bookingStartRate,
                        helper: `${Number(qrAnalyticsData.bookingStarts || 0)} booking starts`,
                      },
                      {
                        label: "Scan → Booking",
                        value: qrAnalyticsData.bookingCompletionRate,
                        helper: `${Number(qrAnalyticsData.completedBookings || 0)} bookings`,
                      },
                      {
                        label: "Start → Completion",
                        value: qrAnalyticsData.bookingCompletionFromStartRate,
                        helper: "Booking funnel efficiency",
                      },
                    ].map((item) => {
                      const width = Math.max(
                        0,
                        Math.min(100, Number(item.value || 0)),
                      );

                      return (
                        <Grid key={item.label} size={{ xs: 12, sm: 6, lg: 3 }}>
                          <Box
                            sx={{
                              p: 2,
                              height: "100%",
                              borderRadius: 2.5,
                              border: "1px solid",
                              borderColor: "divider",
                              bgcolor: "background.default",
                            }}
                          >
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="baseline"
                              spacing={1}
                            >
                              <Typography variant="body2" fontWeight={750}>
                                {item.label}
                              </Typography>

                              <Typography variant="h6" fontWeight={900}>
                                {formatPercent(item.value)}
                              </Typography>
                            </Stack>

                            <Box
                              sx={{
                                mt: 1.5,
                                height: 7,
                                overflow: "hidden",
                                borderRadius: 999,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${width}%`,
                                  height: "100%",
                                  borderRadius: 999,
                                  bgcolor: "primary.main",
                                }}
                              />
                            </Box>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", mt: 1 }}
                            >
                              {item.helper}
                            </Typography>
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                </CardContent>
              </Card>

              {/* DEVICE / BROWSER / OS BREAKDOWNS */}

              <Grid container spacing={2}>
                {[
                  {
                    title: "Devices",
                    rows: qrAnalyticsData.devices,
                  },
                  {
                    title: "Browsers",
                    rows: qrAnalyticsData.browsers,
                  },
                  {
                    title: "Operating Systems",
                    rows: qrAnalyticsData.operatingSystems,
                  },
                ].map((group) => (
                  <Grid key={group.title} size={{ xs: 12, md: 4 }}>
                    <Card
                      variant="outlined"
                      sx={{ height: "100%", borderRadius: 3 }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight={850}>
                          {group.title}
                        </Typography>

                        <Stack spacing={1.5} sx={{ mt: 2 }}>
                          {Array.isArray(group.rows) &&
                          group.rows.length > 0 ? (
                            group.rows.map((row) => {
                              const width = Math.max(
                                0,
                                Math.min(100, Number(row?.percentage || 0)),
                              );

                              return (
                                <Box key={`${group.title}-${row?.name}`}>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    spacing={1}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={700}
                                    >
                                      {row?.name || "Unknown"}
                                    </Typography>

                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {Number(row?.count || 0)} ·{" "}
                                      {formatPercent(row?.percentage)}
                                    </Typography>
                                  </Stack>

                                  <Box
                                    sx={{
                                      mt: 0.65,
                                      height: 6,
                                      overflow: "hidden",
                                      borderRadius: 999,
                                      bgcolor: alpha(
                                        theme.palette.primary.main,
                                        0.09,
                                      ),
                                    }}
                                  >
                                    <Box
                                      sx={{
                                        width: `${width}%`,
                                        height: "100%",
                                        borderRadius: 999,
                                        bgcolor: "primary.main",
                                      }}
                                    />
                                  </Box>
                                </Box>
                              );
                            })
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              No data yet.
                            </Typography>
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* RECENT SCANS */}

              <Card variant="outlined" sx={{ borderRadius: 3 }}>
                <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                  <Typography variant="subtitle1" fontWeight={850}>
                    Recent Scans
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.35, mb: 2 }}
                  >
                    Latest scan activity for this campaign.
                  </Typography>

                  {Array.isArray(qrAnalyticsData.recentScans) &&
                  qrAnalyticsData.recentScans.length > 0 ? (
                    <Stack spacing={1}>
                      {qrAnalyticsData.recentScans.slice(0, 20).map((scan) => (
                        <Box
                          key={scan.scanId}
                          sx={{
                            px: 1.75,
                            py: 1.4,
                            borderRadius: 2.25,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.default",
                          }}
                        >
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            spacing={1}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight={750}>
                                {displayEnum(scan.deviceType)} ·{" "}
                                {scan.browser || "Unknown browser"}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {scan.operatingSystem || "Unknown OS"} ·{" "}
                                {formatQrScanDateTime(scan.scannedAt)}
                              </Typography>
                            </Box>

                            <Stack
                              direction="row"
                              spacing={0.75}
                              flexWrap="wrap"
                              useFlexGap
                            >
                              {scan.enquiryCreated && (
                                <Chip
                                  size="small"
                                  label="Enquiry"
                                  color="warning"
                                  variant="outlined"
                                />
                              )}

                              {scan.bookingStarted && (
                                <Chip
                                  size="small"
                                  label="Booking Started"
                                  color="info"
                                  variant="outlined"
                                />
                              )}

                              {scan.bookingCompleted && (
                                <Chip
                                  size="small"
                                  label="Booking Completed"
                                  color="success"
                                />
                              )}
                            </Stack>
                          </Stack>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2.25 }}>
                      This campaign has not received any scans yet.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          {qrAnalyticsData && (
            <Button
              startIcon={<AnalyticsOutlined />}
              onClick={() => handleOpenQrAnalytics(qrAnalyticsCampaign)}
              disabled={qrAnalyticsLoading}
            >
              Refresh
            </Button>
          )}

          <Box sx={{ flex: 1 }} />

          <Button
            variant="contained"
            onClick={handleCloseQrAnalytics}
            disabled={qrAnalyticsLoading}
            sx={{ borderRadius: 2.25, boxShadow: "none", fontWeight: 750 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================================================== */}
      {/* CREATE / EDIT QR CAMPAIGN DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={qrCampaignDialogOpen}
        onClose={handleCloseQrCampaignDialog}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 3.5,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                display: "grid",
                placeItems: "center",
                borderRadius: 2.25,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <QrCode2Outlined />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={850}>
                {qrCampaignEditingId
                  ? "Edit QR Campaign"
                  : "Create QR Campaign"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The campaign code remains permanent after creation.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2} sx={{ pt: 0.5 }}>
            <Grid size={{ xs: 12, md: 7 }}>
              <TextField
                fullWidth
                required
                label="Campaign Name"
                name="name"
                value={qrCampaignForm.name}
                onChange={handleQrCampaignFormChange}
                inputProps={{ maxLength: 150 }}
                placeholder="Front Gate Poster"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
              <TextField
                select
                fullWidth
                required
                label="Campaign Type"
                name="type"
                value={qrCampaignForm.type}
                onChange={handleQrCampaignFormChange}
              >
                {QR_CAMPAIGN_TYPES.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Alert severity="info" sx={{ borderRadius: 2.25 }}>
                {QR_CAMPAIGN_TYPES.find(
                  (type) => type.value === qrCampaignForm.type,
                )?.description || "Configure this QR campaign."}
              </Alert>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Source"
                name="source"
                value={qrCampaignForm.source}
                onChange={handleQrCampaignFormChange}
                inputProps={{ maxLength: 100 }}
                placeholder="FRONT_GATE, RECEPTION, WHATSAPP..."
                helperText="Used to compare where scans originated."
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                select
                fullWidth
                label="Status"
                name="status"
                value={qrCampaignForm.status}
                onChange={handleQrCampaignFormChange}
              >
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                {qrCampaignEditingId && (
                  <MenuItem value="ARCHIVED">Archived</MenuItem>
                )}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Description"
                name="description"
                value={qrCampaignForm.description}
                onChange={handleQrCampaignFormChange}
                inputProps={{ maxLength: 1000 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Poster Headline"
                name="headline"
                value={qrCampaignForm.headline}
                onChange={handleQrCampaignFormChange}
                inputProps={{ maxLength: 250 }}
                placeholder="Find Your Perfect Study Seat"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Call To Action"
                name="callToAction"
                value={qrCampaignForm.callToAction}
                onChange={handleQrCampaignFormChange}
                inputProps={{ maxLength: 250 }}
                placeholder="Scan to view seats and memberships"
              />
            </Grid>

            {qrCampaignForm.type === "MEMBERSHIP_ENQUIRY" && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ borderRadius: 2.25 }}>
                    You can optionally link this enquiry campaign to a specific
                    membership plan. When the QR is scanned, that plan will be
                    preselected on the public membership enquiry page.
                  </Alert>
                </Grid>

                {qrDirectBookingOptionsLoading && (
                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2" color="text.secondary">
                        Loading membership plans...
                      </Typography>
                    </Stack>
                  </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Membership Plan"
                    name="membershipPlanId"
                    value={qrCampaignForm.membershipPlanId}
                    onChange={handleQrCampaignFormChange}
                    disabled={qrDirectBookingOptionsLoading}
                    helperText="Optional. Leave blank for a general membership enquiry."
                  >
                    <MenuItem value="">General membership enquiry</MenuItem>

                    {qrMembershipPlans.map((plan) => (
                      <MenuItem key={plan.id} value={String(plan.id)}>
                        {plan.name || `Plan ${plan.id}`}
                        {plan.durationDays
                          ? ` · ${plan.durationDays} days`
                          : ""}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}

            {qrCampaignForm.type === "DIRECT_BOOKING" && (
              <>
                <Grid size={{ xs: 12 }}>
                  <Alert severity="info" sx={{ borderRadius: 2.25 }}>
                    Choose one or more booking pre-selections. The visitor will
                    land on the public seat-booking page with these selections
                    already applied. At least one selection is required.
                  </Alert>
                </Grid>

                {qrDirectBookingOptionsLoading && (
                  <Grid size={{ xs: 12 }}>
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <CircularProgress size={18} />
                      <Typography variant="body2" color="text.secondary">
                        Loading plans, floors, slots and seats...
                      </Typography>
                    </Stack>
                  </Grid>
                )}

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Membership Plan"
                    name="membershipPlanId"
                    value={qrCampaignForm.membershipPlanId}
                    onChange={handleQrCampaignFormChange}
                    disabled={qrDirectBookingOptionsLoading}
                  >
                    <MenuItem value="">No plan preselection</MenuItem>

                    {qrMembershipPlans.map((plan) => (
                      <MenuItem key={plan.id} value={String(plan.id)}>
                        {plan.name || `Plan ${plan.id}`}
                        {plan.durationDays
                          ? ` · ${plan.durationDays} days`
                          : ""}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Floor"
                    name="floorId"
                    value={qrCampaignForm.floorId}
                    onChange={handleQrCampaignFormChange}
                    disabled={qrDirectBookingOptionsLoading}
                  >
                    <MenuItem value="">No floor preselection</MenuItem>

                    {qrFloors.map((floor) => (
                      <MenuItem key={floor.id} value={String(floor.id)}>
                        {floor.name || floor.floorName || `Floor ${floor.id}`}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Slot"
                    name="slotId"
                    value={qrCampaignForm.slotId}
                    onChange={handleQrCampaignFormChange}
                    disabled={qrDirectBookingOptionsLoading}
                  >
                    <MenuItem value="">No slot preselection</MenuItem>

                    {qrSlots.map((slot) => (
                      <MenuItem key={slot.id} value={String(slot.id)}>
                        {formatSlotLabel(slot)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    fullWidth
                    label="Seat"
                    name="seatId"
                    value={qrCampaignForm.seatId}
                    onChange={handleQrCampaignFormChange}
                    disabled={qrDirectBookingOptionsLoading}
                    helperText={
                      qrCampaignForm.floorId
                        ? "Only seats from the selected floor are shown."
                        : "Select a floor first to narrow the seat list."
                    }
                  >
                    <MenuItem value="">No seat preselection</MenuItem>

                    {qrFilteredSeats.map((seat) => (
                      <MenuItem key={seat.id} value={String(seat.id)}>
                        {seat.seatNumber || seat.name || `Seat ${seat.id}`}
                        {seat.seatType
                          ? ` · ${displayEnum(seat.seatType)}`
                          : ""}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleCloseQrCampaignDialog}
            disabled={qrCampaignSaving}
            sx={{ borderRadius: 2.25, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={
              qrCampaignSaving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <Save />
              )
            }
            onClick={handleSaveQrCampaign}
            disabled={qrCampaignSaving}
            sx={{
              borderRadius: 2.25,
              px: 2.5,
              fontWeight: 750,
              boxShadow: "none",
            }}
          >
            {qrCampaignSaving
              ? "Saving..."
              : qrCampaignEditingId
                ? "Update Campaign"
                : "Create Campaign"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================================================== */}
      {/* PRINTABLE QR POSTER DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={posterDialogOpen}
        onClose={handleClosePosterDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3.5,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                display: "grid",
                placeItems: "center",
                borderRadius: 2.25,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              <QrCode2Outlined />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={850}>
                Create Printable QR Poster
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Customize a branded A4 poster for{" "}
                {posterCampaign?.name || "this campaign"}.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.25}>
            <Alert severity="info" sx={{ borderRadius: 2.25 }}>
              The printed QR uses the campaign tracking link, so scans remain
              measurable and the destination can change later without reprinting
              the poster.
            </Alert>

            <TextField
              fullWidth
              label="Poster Title"
              name="title"
              value={posterForm.title}
              onChange={handlePosterFieldChange}
              inputProps={{ maxLength: 150 }}
              placeholder={library.libraryName || "Library Name"}
            />

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Subtitle"
              name="subtitle"
              value={posterForm.subtitle}
              onChange={handlePosterFieldChange}
              inputProps={{ maxLength: 250 }}
              placeholder="Your perfect study space is one scan away."
            />

            <TextField
              fullWidth
              label="Call to Action"
              name="callToAction"
              value={posterForm.callToAction}
              onChange={handlePosterFieldChange}
              inputProps={{ maxLength: 150 }}
              placeholder={
                posterCampaign?.type === "DIRECT_BOOKING"
                  ? "SCAN TO VIEW AVAILABLE SEATS"
                  : posterCampaign?.type === "MEMBERSHIP_ENQUIRY"
                    ? "SCAN TO ENQUIRE ABOUT MEMBERSHIP"
                    : "SCAN TO EXPLORE"
              }
            />

            <Divider />

            <Typography variant="subtitle2" fontWeight={800}>
              Poster Content
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={posterForm.showAddress}
                  onChange={handlePosterFieldChange}
                  name="showAddress"
                />
              }
              label="Show library address"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={posterForm.showPhone}
                  onChange={handlePosterFieldChange}
                  name="showPhone"
                />
              }
              label="Show contact number"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={posterForm.showCampaignName}
                  onChange={handlePosterFieldChange}
                  name="showCampaignName"
                />
              }
              label="Show campaign name"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={posterForm.showTrackingUrl}
                  onChange={handlePosterFieldChange}
                  name="showTrackingUrl"
                />
              }
              label="Print tracking URL below QR"
            />

            <Divider />

            <Typography variant="subtitle2" fontWeight={800}>
              Feature Highlights
            </Typography>

            <FormControlLabel
              control={
                <Switch
                  checked={posterForm.showMembershipPlans}
                  onChange={handlePosterFieldChange}
                  name="showMembershipPlans"
                />
              }
              label="Membership Plans"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={posterForm.showSeatAvailability}
                  onChange={handlePosterFieldChange}
                  name="showSeatAvailability"
                />
              }
              label="Live Seat Availability"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={posterForm.showOnlineBooking}
                  onChange={handlePosterFieldChange}
                  name="showOnlineBooking"
                />
              }
              label="Online Booking"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={handleClosePosterDialog}
            disabled={posterDownloading}
            sx={{ borderRadius: 2.25, fontWeight: 700 }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            startIcon={
              posterDownloading ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DownloadOutlined />
              )
            }
            onClick={handleDownloadPoster}
            disabled={posterDownloading || !posterCampaign?.id}
            sx={{
              borderRadius: 2.25,
              px: 2.5,
              fontWeight: 750,
              boxShadow: "none",
            }}
          >
            {posterDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </DialogActions>
      </Dialog>

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
                    uploadType === "LOGO" ? IMAGE_ROLES.GALLERY : uploadRole
                  }
                  onChange={handleUploadRoleChange}
                >
                  <MenuItem value={IMAGE_ROLES.GALLERY}>Gallery Image</MenuItem>

                  <MenuItem value={IMAGE_ROLES.PROFILE}>Profile Image</MenuItem>

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
                  uploadType !== "LOGO" && uploadRole === IMAGE_ROLES.GALLERY
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
                {uploadType !== "LOGO" && uploadRole === IMAGE_ROLES.GALLERY
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
              const visibilityEditable = role === IMAGE_ROLES.GALLERY && !logo;

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
                        borderColor: alpha(theme.palette.primary.main, 0.25),
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
