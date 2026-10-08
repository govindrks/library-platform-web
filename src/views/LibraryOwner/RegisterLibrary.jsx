import React, { useEffect, useMemo, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  ArrowBack,
  ArrowForward,
  Check,
  CheckCircle,
  Chair,
  ChevronRight,
  CreditCard,
  Description,
  Edit,
  Email,
  EventSeat,
  HelpOutlineOutlined,
  LibraryBooks,
  LocationOn,
  Lock,
  Person,
  Phone,
  Save,
  Settings,
  Visibility,
  VisibilityOff,
  Wifi,
  WorkspacePremium,
} from "@mui/icons-material";

import { useLocation, useNavigate } from "react-router-dom";

import amenityApi from "../../api/amenityApi";
import libraryRegistrationApi from "../../api/libraryRegistrationApi";
import platformPlanApi from "../../api/platformPlanApi";
import ownerDashboardApi from "../../api/ownerDashboardApi";
import slotApi from "../../api/slotApi";
import storage from "../../utility/browserStorage";

// ============================================================
// STEPS
// ============================================================

const steps = [
  {
    label: "Owner",
    fullLabel: "Owner Details",
  },
  {
    label: "Library",
    fullLabel: "Library Details",
  },
  {
    label: "Amenities",
    fullLabel: "Amenities",
  },
  {
    label: "Seats & Slots",
    fullLabel: "Seats & Slots",
  },
  {
    label: "Plan",
    fullLabel: "LibraryHub Plan",
  },
  {
    label: "Review",
    fullLabel: "Review",
  },
];

const STEP_INDEX = {
  LIBRARY_DETAILS: 1,
  AMENITIES: 2,
  SEATS_AND_SLOTS: 3,
  PLATFORM_PLAN: 4,
  REVIEW: 5,
};

// ============================================================
// INITIAL STATE
// ============================================================

const createInitialFormData = (selectedPlanId = "") => ({
  // Owner
  ownerName: "",
  email: "",
  phone: "",
  password: "",

  // Library
  libraryName: "",
  description: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  openingTime: "",
  closingTime: "",

  // Amenities
  amenityIds: [],

  // Initial floor
  floorName: "Ground Floor",
  floorNumber: 0,

  // Seat layout
  rows: "",
  seatsPerRow: "",

  // Booking slot
  slotName: "Morning Slot",
  slotType: "FIXED",
  slotStartTime: "07:00",
  slotEndTime: "10:00",
  slotBreakMinutes: 0,

  // Platform plan
  platformPlanId:
    selectedPlanId !== "" &&
    selectedPlanId !== null &&
    selectedPlanId !== undefined
      ? Number(selectedPlanId)
      : "",

  // Terms
  termsAccepted: false,
});

// ============================================================
// HELPERS
// ============================================================

const getBillingCycleLabel = (cycle) => {
  switch (cycle) {
    case "MONTHLY":
      return "/ month";

    case "QUARTERLY":
      return "/ quarter";

    case "HALF_YEARLY":
      return "/ 6 months";

    case "YEARLY":
    case "ANNUAL":
      return "/ year";

    default:
      return cycle
        ? `/${String(cycle).replaceAll("_", " ").toLowerCase()}`
        : "";
  }
};

const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const extractSeatList = (matrixResponse) => {
  if (!matrixResponse) {
    return [];
  }

  // ==========================================================
  // CASE 1:
  // Backend SeatRowResponse[]
  //
  // [
  //   {
  //     rowLabel: "A",
  //     seats: [...]
  //   },
  //   {
  //     rowLabel: "B",
  //     seats: [...]
  //   }
  // ]
  // ==========================================================

  if (Array.isArray(matrixResponse)) {
    const containsGroupedRows = matrixResponse.some((item) =>
      Array.isArray(item?.seats),
    );

    if (containsGroupedRows) {
      return matrixResponse.flatMap((row) =>
        Array.isArray(row?.seats)
          ? row.seats.map((seat) => ({
              ...seat,
              rowLabel: seat?.rowLabel ?? row?.rowLabel,
            }))
          : [],
      );
    }

    // Already a flat Seat[] response
    return matrixResponse;
  }

  // ==========================================================
  // CASE 2:
  // { seats: [...] }
  // ==========================================================

  if (Array.isArray(matrixResponse?.seats)) {
    return matrixResponse.seats;
  }

  // ==========================================================
  // CASE 3:
  // { seatMatrix: [...] }
  // ==========================================================

  if (Array.isArray(matrixResponse?.seatMatrix)) {
    const matrix = matrixResponse.seatMatrix;

    const containsGroupedRows = matrix.some((item) =>
      Array.isArray(item?.seats),
    );

    if (containsGroupedRows) {
      return matrix.flatMap((row) =>
        Array.isArray(row?.seats)
          ? row.seats.map((seat) => ({
              ...seat,
              rowLabel: seat?.rowLabel ?? row?.rowLabel,
            }))
          : [],
      );
    }

    return matrix;
  }

  // ==========================================================
  // CASE 4:
  // { rows: [...] }
  // ==========================================================

  if (Array.isArray(matrixResponse?.rows)) {
    return matrixResponse.rows.flatMap((row) =>
      Array.isArray(row?.seats)
        ? row.seats.map((seat) => ({
            ...seat,
            rowLabel: seat?.rowLabel ?? row?.rowLabel,
          }))
        : [],
    );
  }

  // ==========================================================
  // CASE 5:
  // Spring Page response
  // ==========================================================

  if (Array.isArray(matrixResponse?.content)) {
    const content = matrixResponse.content;

    const containsGroupedRows = content.some((item) =>
      Array.isArray(item?.seats),
    );

    if (containsGroupedRows) {
      return content.flatMap((row) =>
        Array.isArray(row?.seats)
          ? row.seats.map((seat) => ({
              ...seat,
              rowLabel: seat?.rowLabel ?? row?.rowLabel,
            }))
          : [],
      );
    }

    return content;
  }

  return [];
};

const getSeatLayoutFromMatrix = (matrixResponse) => {
  const seats = extractSeatList(matrixResponse);

  if (seats.length === 0) {
    return null;
  }

  const grouped = new Map();

  seats.forEach((seat) => {
    const rowLabel = String(seat?.rowLabel ?? "").trim();

    if (!rowLabel) {
      return;
    }

    if (!grouped.has(rowLabel)) {
      grouped.set(rowLabel, []);
    }

    grouped.get(rowLabel).push({
      ...seat,
      id: seat?.id ?? seat?.seatId,
    });
  });

  const rows = [...grouped.entries()]
    .map(([rowLabel, rowSeats]) => ({
      rowLabel,

      seats: [...rowSeats].sort(
        (a, b) => Number(a?.columnNumber ?? 0) - Number(b?.columnNumber ?? 0),
      ),
    }))
    .sort((a, b) => String(a.rowLabel).localeCompare(String(b.rowLabel)));

  const maxSeatsPerRow = Math.max(
    0,
    ...rows.flatMap((row) =>
      row.seats.map((seat) => Number(seat?.columnNumber ?? 0) || 0),
    ),
  );

  return {
    rows,
    rowCount: rows.length,
    maxSeatsPerRow,
    totalSeats: seats.length,
    seats,
  };
};

// ============================================================
// MAIN COMPONENT
// ============================================================

const RegisterLibrary = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const incomingPlanId = location.state?.selectedPlanId ?? "";

  // ==========================================================
  // REGISTRATION STATE
  // ==========================================================

  const [currentStep, setCurrentStep] = useState(0);

  const [initializingOnboarding, setInitializingOnboarding] = useState(true);

  const [formData, setFormData] = useState(() =>
    createInitialFormData(incomingPlanId),
  );

  const [error, setError] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [registrationResult, setRegistrationResult] = useState(null);

  const [showPassword, setShowPassword] = useState(false);

  // ==========================================================
  // AMENITY STATE
  // ==========================================================

  const [amenities, setAmenities] = useState([]);

  const [amenitiesLoading, setAmenitiesLoading] = useState(true);

  const [amenitiesError, setAmenitiesError] = useState("");

  // ==========================================================
  // PLATFORM PLAN STATE
  // ==========================================================

  const [platformPlans, setPlatformPlans] = useState([]);

  const [plansLoading, setPlansLoading] = useState(true);

  const [plansError, setPlansError] = useState("");

  const [libraryId, setLibraryId] = useState(() => {
    const saved = localStorage.getItem("libraryOnboardingLibraryId");

    return saved ? Number(saved) : null;
  });

  const [restoringPersistedSetup, setRestoringPersistedSetup] = useState(false);

  const [authenticatedOwner, setAuthenticatedOwner] = useState(null);

  const [paymentResult, setPaymentResult] = useState(null);

  const [floorId, setFloorId] = useState(null);

  const [createdSlots, setCreatedSlots] = useState([]);

  const [persistedSeatCount, setPersistedSeatCount] = useState(0);

  const [persistedSeatLayout, setPersistedSeatLayout] = useState(null);

  const [seatLayoutLoading, setSeatLayoutLoading] = useState(false);

  // ==========================================================
  // RESTORE STEP 4 — EXISTING FLOOR / SEATS / SLOTS
  // ==========================================================
  //
  // Step 4 can partially succeed before a later request fails.
  // On refresh/retry we therefore restore the existing database
  // configuration instead of blindly creating another floor/slot.
  //
  // ==========================================================

  useEffect(() => {
    if (!libraryId || currentStep !== 3) {
      return undefined;
    }

    let active = true;

    const restoreSeatsAndSlots = async () => {
      try {
        setError("");
        setSeatLayoutLoading(true);

        // ========================================================
        // 1. LOAD FLOORS + SLOTS
        // ========================================================

        const [floorsResponse, slotsResponse] = await Promise.all([
          libraryRegistrationApi.getFloors(libraryId),
          slotApi.getSlots(libraryId),
        ]);

        if (!active) {
          return;
        }

        const floors = Array.isArray(floorsResponse)
          ? floorsResponse
          : Array.isArray(floorsResponse?.content)
            ? floorsResponse.content
            : [];

        const slots = Array.isArray(slotsResponse)
          ? slotsResponse
          : Array.isArray(slotsResponse?.content)
            ? slotsResponse.content
            : [];

        // ========================================================
        // 2. RESTORE SLOTS
        // ========================================================

        setCreatedSlots(
          slots.map((slot) => {
            const persistedSlotId = slot?.id ?? slot?.slotId;

            return {
              id: persistedSlotId,

              tempId: `persisted-${persistedSlotId}`,

              name: slot?.name ?? "",

              type: slot?.type ?? "FIXED",

              startTime: slot?.startTime ?? "",

              endTime: slot?.endTime ?? "",

              breakMinutes: Number(slot?.breakMinutes) || 0,

              active: slot?.active !== false,

              persisted: true,
            };
          }),
        );

        // ========================================================
        // 3. NO EXISTING FLOOR
        // ========================================================

        if (floors.length === 0) {
          setFloorId(null);
          setPersistedSeatLayout(null);

          setFormData((previous) => ({
            ...previous,
            rows: "",
            seatsPerRow: "",
          }));

          return;
        }

        // ========================================================
        // 4. FIND FLOOR
        //
        // Prefer:
        //   current floor number
        //
        // Otherwise:
        //   first floor having an actual seat layout
        //
        // Otherwise:
        //   first floor
        // ========================================================

        let selectedFloor =
          floors.find(
            (floor) =>
              Number(floor?.floorNumber) === Number(formData.floorNumber),
          ) ?? null;

        let selectedMatrix = null;
        let selectedLayout = null;

        // --------------------------------------------------------
        // If current floor exists, check its matrix
        // --------------------------------------------------------

        if (selectedFloor) {
          const selectedFloorId = selectedFloor?.id ?? selectedFloor?.floorId;

          if (selectedFloorId) {
            try {
              selectedMatrix = await libraryRegistrationApi.getSeatMatrix(
                libraryId,
                selectedFloorId,
              );

              selectedLayout = getSeatLayoutFromMatrix(selectedMatrix);
            } catch (matrixError) {
              console.warn(
                "Unable to load selected floor seat matrix:",
                matrixError,
              );
            }
          }
        }

        // --------------------------------------------------------
        // Current/default floor has no seats.
        //
        // Search existing floors for one that already has seats.
        //
        // This is important for resumed onboarding where React
        // initially contains Ground Floor / 0 but the persisted
        // onboarding floor is First Floor / 1.
        // --------------------------------------------------------

        if (!selectedLayout) {
          for (const floor of floors) {
            const candidateFloorId = floor?.id ?? floor?.floorId;

            if (!candidateFloorId) {
              continue;
            }

            try {
              const candidateMatrix =
                await libraryRegistrationApi.getSeatMatrix(
                  libraryId,
                  candidateFloorId,
                );

              const candidateLayout = getSeatLayoutFromMatrix(candidateMatrix);

              if (candidateLayout?.totalSeats > 0) {
                selectedFloor = floor;
                selectedMatrix = candidateMatrix;
                selectedLayout = candidateLayout;

                break;
              }
            } catch (matrixError) {
              console.warn(
                `Unable to load seat matrix for floor ${candidateFloorId}:`,
                matrixError,
              );
            }
          }
        }

        if (!active) {
          return;
        }

        // ========================================================
        // 5. FALLBACK TO FIRST FLOOR
        // ========================================================

        if (!selectedFloor) {
          selectedFloor = floors[0];
        }

        const existingFloorId = selectedFloor?.id ?? selectedFloor?.floorId;

        if (!existingFloorId) {
          setFloorId(null);
          setPersistedSeatLayout(null);

          return;
        }

        setFloorId(Number(existingFloorId));

        // ========================================================
        // 6. LOAD MATRIX IF NOT LOADED ABOVE
        // ========================================================

        if (!selectedMatrix) {
          try {
            selectedMatrix = await libraryRegistrationApi.getSeatMatrix(
              libraryId,
              existingFloorId,
            );

            selectedLayout = getSeatLayoutFromMatrix(selectedMatrix);
          } catch (matrixError) {
            console.warn("Unable to restore seat matrix:", matrixError);

            selectedLayout = null;
          }
        }

        if (!active) {
          return;
        }

        // ========================================================
        // 7. RESTORE FLOOR + LAYOUT
        // ========================================================

        setPersistedSeatLayout(selectedLayout);

        setPersistedSeatCount(selectedLayout?.totalSeats ?? 0);

        setFormData((previous) => ({
          ...previous,

          floorName: selectedFloor?.name ?? previous.floorName,

          floorNumber: selectedFloor?.floorNumber ?? previous.floorNumber,

          rows: selectedLayout ? String(selectedLayout.rowCount) : "",

          seatsPerRow: selectedLayout
            ? String(selectedLayout.maxSeatsPerRow)
            : "",
        }));
      } catch (restoreError) {
        console.error("Failed to restore Seats & Slots:", restoreError);

        if (active) {
          setError(
            getErrorMessage(
              restoreError,
              "Unable to load the existing seat and slot setup.",
            ),
          );
        }
      } finally {
        if (active) {
          setSeatLayoutLoading(false);
        }
      }
    };

    restoreSeatsAndSlots();

    return () => {
      active = false;
    };
  }, [libraryId, currentStep]);

  // ==========================================================
  // RESTORE TOTAL PERSISTED SEAT COUNT FOR ALL LATER STEPS
  // ==========================================================
  //
  // Step 5 (Plan), Step 6 (Review), refresh/resume and the setup
  // sidebar must not depend on the Step 4-only restoration effect.
  // Load the persisted seat total whenever a library is available.
  //
  // ==========================================================

  useEffect(() => {
    if (!libraryId) {
      setPersistedSeatCount(0);
      return undefined;
    }

    let active = true;

    const restorePersistedSeatCount = async () => {
      try {
        const floorsResponse =
          await libraryRegistrationApi.getFloors(libraryId);

        const floors = Array.isArray(floorsResponse)
          ? floorsResponse
          : Array.isArray(floorsResponse?.content)
            ? floorsResponse.content
            : [];

        let totalSeats = 0;

        for (const floor of floors) {
          const persistedFloorId = floor?.id ?? floor?.floorId;

          if (!persistedFloorId) {
            continue;
          }

          try {
            const matrix = await libraryRegistrationApi.getSeatMatrix(
              libraryId,
              persistedFloorId,
            );

            totalSeats += extractSeatList(matrix).length;
          } catch (matrixError) {
            console.warn(
              `Unable to load seats for floor ${persistedFloorId}:`,
              matrixError,
            );
          }
        }

        if (active) {
          setPersistedSeatCount(totalSeats);
        }
      } catch (seatCountError) {
        console.error(
          "Unable to restore persisted seat count:",
          seatCountError,
        );
      }
    };

    restorePersistedSeatCount();

    return () => {
      active = false;
    };
  }, [libraryId, currentStep]);

  const [showOwnerLogin, setShowOwnerLogin] = useState(false);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ==========================================================
  // LOAD AMENITIES
  // ==========================================================

  useEffect(() => {
    const loadAmenities = async () => {
      try {
        setAmenitiesLoading(true);
        setAmenitiesError("");

        const response = await amenityApi.getAllAmenities();

        setAmenities(Array.isArray(response) ? response : []);
      } catch (requestError) {
        console.error("Failed to load amenities:", requestError);

        setAmenities([]);

        setAmenitiesError(
          getErrorMessage(requestError, "Unable to load amenities."),
        );
      } finally {
        setAmenitiesLoading(false);
      }
    };

    loadAmenities();
  }, []);

  // ==========================================================
  // RESTORE AUTHENTICATED OWNER ONBOARDING
  // ==========================================================
  //
  // New visitor:
  //   no token -> remain on Step 1
  //
  // Existing LIBRARY_OWNER:
  //   LIBRARY_DETAILS  -> Step 2
  //   AMENITIES        -> Step 3
  //   SEATS_AND_SLOTS  -> Step 4
  //   PLATFORM_PLAN    -> Step 5
  //   REVIEW           -> Step 6
  //
  // Completed owner:
  //   return to Owner Dashboard
  //
  // ==========================================================

  useEffect(() => {
    let active = true;

    const restoreOwnerOnboarding = async () => {
      const token = storage.getToken();

      // No authentication means this is a new registration.
      if (!token) {
        if (active) {
          setInitializingOnboarding(false);
        }

        return;
      }

      try {
        const context = await ownerDashboardApi.getContext();

        if (!active) {
          return;
        }

        // ------------------------------------------------------
        // Completed onboarding
        // ------------------------------------------------------

        if (
          context?.onboardingCompleted ||
          context?.onboardingStep === "COMPLETED"
        ) {
          navigate("/owner/dashboard", {
            replace: true,
          });

          return;
        }

        // ------------------------------------------------------
        // Restore authenticated owner
        // ------------------------------------------------------

        setAuthenticatedOwner({
          id: context?.ownerId,
          fullName: context?.ownerName,
          email: context?.email,
          role: "LIBRARY_OWNER",
          onboardingStep: context?.onboardingStep,
          onboardingCompleted: Boolean(context?.onboardingCompleted),
          libraryId: context?.libraryId ?? null,
        });

        // ------------------------------------------------------
        // Restore owner fields we already know
        // ------------------------------------------------------

        setFormData((previous) => ({
          ...previous,

          ownerName: context?.ownerName ?? previous.ownerName,

          email: context?.email ?? previous.email,
        }));

        // ------------------------------------------------------
        // Restore draft library ID
        // ------------------------------------------------------

        if (context?.libraryId) {
          const id = Number(context.libraryId);

          setLibraryId(id);

          localStorage.setItem("libraryOnboardingLibraryId", String(id));
        } else {
          setLibraryId(null);

          localStorage.removeItem("libraryOnboardingLibraryId");
        }

        // ------------------------------------------------------
        // Restore current onboarding step
        // ------------------------------------------------------

        const resumeStep = STEP_INDEX[context?.onboardingStep];

        if (resumeStep !== undefined) {
          setCurrentStep(resumeStep);
        } else {
          // Authenticated LIBRARY_OWNER has already completed
          // Owner Account, therefore never send them back to
          // Step 1 merely because the step value is missing.
          setCurrentStep(1);
        }
      } catch (requestError) {
        console.error("Failed to restore library onboarding:", requestError);

        /*
         * If the stored token is invalid/expired, axios.js will
         * handle authentication failure.
         *
         * Do not destroy onboarding data here for ordinary
         * server/network failures.
         */
      } finally {
        if (active) {
          setInitializingOnboarding(false);
        }
      }
    };

    restoreOwnerOnboarding();

    return () => {
      active = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!libraryId) {
      return undefined;
    }

    let active = true;

    const restorePersistedLibrarySetup = async () => {
      try {
        setRestoringPersistedSetup(true);

        // ------------------------------------------------------
        // Load owner's libraries + this library's amenities
        // ------------------------------------------------------

        const [librariesResponse, amenitiesResponse] = await Promise.all([
          libraryRegistrationApi.getMyLibraries(),

          libraryRegistrationApi.getLibraryAmenities(libraryId),
        ]);

        if (!active) {
          return;
        }

        // ------------------------------------------------------
        // Normalize libraries response
        // ------------------------------------------------------

        const ownerLibraries = Array.isArray(librariesResponse)
          ? librariesResponse
          : Array.isArray(librariesResponse?.content)
            ? librariesResponse.content
            : [];

        const persistedLibrary =
          ownerLibraries.find(
            (library) =>
              Number(library?.id ?? library?.libraryId) === Number(libraryId),
          ) ?? null;

        // ------------------------------------------------------
        // Normalize amenities response
        // ------------------------------------------------------

        const persistedAmenities = Array.isArray(amenitiesResponse)
          ? amenitiesResponse
          : Array.isArray(amenitiesResponse?.content)
            ? amenitiesResponse.content
            : Array.isArray(amenitiesResponse?.amenities)
              ? amenitiesResponse.amenities
              : [];

        const persistedAmenityIds = persistedAmenities
          .map((amenity) => amenity?.id ?? amenity?.amenityId ?? amenity)
          .map(Number)
          .filter(Number.isFinite);

        // ------------------------------------------------------
        // Restore persisted backend values
        // ------------------------------------------------------

        setFormData((previous) => ({
          ...previous,

          // LIBRARY DETAILS

          libraryName:
            persistedLibrary?.name ??
            persistedLibrary?.libraryName ??
            previous.libraryName,

          description: persistedLibrary?.description ?? previous.description,

          address: persistedLibrary?.address ?? previous.address,

          city: persistedLibrary?.city ?? previous.city,

          state: persistedLibrary?.state ?? previous.state,

          pincode:
            persistedLibrary?.pincode != null
              ? String(persistedLibrary.pincode)
              : previous.pincode,

          /*
           * LibraryRequest uses the authenticated owner's phone
           * as contactNumber when the library is created.
           *
           * Do not overwrite an already restored owner phone
           * unless backend actually provides one.
           */
          phone: persistedLibrary?.contactNumber ?? previous.phone,

          openingTime: persistedLibrary?.openingTime ?? previous.openingTime,

          closingTime: persistedLibrary?.closingTime ?? previous.closingTime,

          open24Hours:
            persistedLibrary?.open24Hours ?? previous.open24Hours ?? false,

          // AMENITIES

          amenityIds:
            persistedAmenityIds.length > 0
              ? persistedAmenityIds
              : previous.amenityIds,
        }));
      } catch (restoreError) {
        console.error(
          "Failed to restore persisted library setup:",
          restoreError,
        );

        /*
         * Do not destroy already-restored Seats & Slots state
         * because one optional restore request failed.
         */
      } finally {
        if (active) {
          setRestoringPersistedSetup(false);
        }
      }
    };

    restorePersistedLibrarySetup();

    return () => {
      active = false;
    };
  }, [libraryId]);

  // ==========================================================
  // LOAD PLATFORM PLANS
  // ==========================================================

  useEffect(() => {
    const loadPlans = async () => {
      try {
        setPlansLoading(true);
        setPlansError("");

        const response = await platformPlanApi.getActivePlans();

        const plans = Array.isArray(response) ? response : [];

        setPlatformPlans(plans);

        if (formData.platformPlanId) {
          const valid = plans.some(
            (plan) => Number(plan.id) === Number(formData.platformPlanId),
          );

          if (!valid) {
            setFormData((previous) => ({
              ...previous,
              platformPlanId: "",
            }));
          }
        }
      } catch (requestError) {
        console.error("Failed to load plans:", requestError);

        setPlansError(
          getErrorMessage(requestError, "Unable to load LibraryHub plans."),
        );
      } finally {
        setPlansLoading(false);
      }
    };

    loadPlans();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveOwnerStep = async () => {
    const payload = {
      fullName: formData.ownerName.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    const response = await libraryRegistrationApi.registerOwner(payload);

    if (!response?.token) {
      throw new Error("Authentication token was not returned.");
    }

    if (response?.user?.role !== "LIBRARY_OWNER") {
      throw new Error("Invalid library owner registration response.");
    }

    /*
     * Keep authentication storage centralized.
     * axiosInterceptor reads the JWT through browserStorage,
     * so registration must write to the same storage helper.
     */
    storage.setToken(response.token);
    storage.setUser(response.user);

    setAuthenticatedOwner(response.user);

    if (response.user?.libraryId) {
      const id = Number(response.user.libraryId);

      setLibraryId(id);

      localStorage.setItem("libraryOnboardingLibraryId", String(id));
    }

    /*
     * Never keep the raw password in React state
     * after account creation.
     */
    setFormData((previous) => ({
      ...previous,
      password: "",
    }));

    return response;
  };

  const saveLibraryStep = async () => {
    const payload = {
      name: formData.libraryName.trim(),

      description: formData.description.trim(),

      address: formData.address.trim(),

      city: formData.city.trim(),

      state: formData.state.trim(),

      pincode: formData.pincode.trim(),

      contactNumber: formData.phone.trim(),

      email: formData.email.trim().toLowerCase(),

      open24Hours: Boolean(formData.open24Hours),

      openingTime: formData.open24Hours ? null : formData.openingTime,

      closingTime: formData.open24Hours ? null : formData.closingTime,
    };

    const response = await libraryRegistrationApi.saveLibraryDetails(payload);

    const createdLibraryId = response?.id ?? response?.libraryId;

    if (!createdLibraryId) {
      throw new Error("Library ID was not returned by the server.");
    }

    const id = Number(createdLibraryId);

    setLibraryId(id);

    localStorage.setItem("libraryOnboardingLibraryId", String(id));

    return response;
  };

  const requireLibraryId = () => {
    if (!libraryId) {
      throw new Error(
        "Library setup has not been created yet. Please complete Library Details first.",
      );
    }

    return libraryId;
  };

  // ==========================================================
  // COMPUTED VALUES
  // ==========================================================

  const generatedSeatCount = useMemo(() => {
    // Persisted backend seats are the source of truth.
    if (persistedSeatCount > 0) {
      return persistedSeatCount;
    }

    // Before the initial layout has been persisted,
    // use the current draft form as a preview.
    const rows = Number(formData.rows) || 0;
    const seatsPerRow = Number(formData.seatsPerRow) || 0;

    return rows * seatsPerRow;
  }, [persistedSeatCount, formData.rows, formData.seatsPerRow]);

  const selectedPlan = useMemo(
    () =>
      platformPlans.find(
        (plan) => Number(plan.id) === Number(formData.platformPlanId),
      ) || null,
    [platformPlans, formData.platformPlanId],
  );

  const selectedAmenities = useMemo(
    () =>
      amenities.filter((amenity) =>
        formData.amenityIds.some((id) => Number(id) === Number(amenity.id)),
      ),
    [amenities, formData.amenityIds],
  );

  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  // ==========================================================
  // UPDATE FIELD
  // ==========================================================

  const updateField = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  };

  // ==========================================================
  // AMENITY TOGGLE
  // ==========================================================

  const handleAmenityToggle = (amenityId) => {
    setFormData((previous) => {
      const exists = previous.amenityIds.some(
        (id) => Number(id) === Number(amenityId),
      );

      return {
        ...previous,

        amenityIds: exists
          ? previous.amenityIds.filter((id) => Number(id) !== Number(amenityId))
          : [...previous.amenityIds, Number(amenityId)],
      };
    });

    setError("");
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateStep = () => {
    setError("");

    // OWNER
    if (currentStep === 0) {
      if (!formData.ownerName.trim()) {
        setError("Owner name is required.");
        return false;
      }

      if (!formData.email.trim()) {
        setError("Email is required.");
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(formData.email.trim())) {
        setError("Please enter a valid email address.");
        return false;
      }

      if (!formData.phone.trim()) {
        setError("Phone number is required.");
        return false;
      }

      const phone = formData.phone.replace(/\D/g, "");

      if (phone.length < 10) {
        setError("Please enter a valid phone number.");
        return false;
      }

      if (!formData.password || formData.password.length < 8) {
        setError("Password must contain at least 8 characters.");
        return false;
      }
    }

    // LIBRARY
    if (currentStep === 1) {
      if (!formData.libraryName.trim()) {
        setError("Library name is required.");
        return false;
      }

      if (!formData.address.trim()) {
        setError("Library address is required.");
        return false;
      }

      if (!formData.city.trim()) {
        setError("City is required.");
        return false;
      }

      if (!formData.state.trim()) {
        setError("State is required.");
        return false;
      }

      if (!/^\d{6}$/.test(formData.pincode.trim())) {
        setError("Please enter a valid 6-digit pincode.");
        return false;
      }

      if (!formData.open24Hours) {
        if (!formData.openingTime) {
          setError("Opening time is required.");
          return false;
        }

        if (!formData.closingTime) {
          setError("Closing time is required.");
          return false;
        }

        if (formData.openingTime === formData.closingTime) {
          setError("Opening time and closing time cannot be the same.");
          return false;
        }
      }
    }

    // AMENITIES
    if (currentStep === 2) {
      if (formData.amenityIds.length === 0) {
        setError("Please select at least one amenity.");
        return false;
      }
    }

    // SEATS & SLOTS
    if (currentStep === 3) {
      const floorName = formData.floorName.trim();
      const floorNumber = Number(formData.floorNumber);
      const rows = Number(formData.rows);
      const seatsPerRow = Number(formData.seatsPerRow);

      if (!floorName) {
        setError("Floor name is required.");
        return false;
      }

      if (!Number.isInteger(floorNumber) || floorNumber < 0) {
        setError("Floor number must be zero or greater.");
        return false;
      }

      if (!Number.isInteger(rows) || rows < 1 || rows > 26) {
        setError("Please enter a valid number of rows between 1 and 26.");
        return false;
      }

      if (!Number.isInteger(seatsPerRow) || seatsPerRow < 1) {
        setError("Please enter a valid number of seats per row.");
        return false;
      }

      if (createdSlots.length === 0) {
        setError("Please add at least one booking slot.");
        return false;
      }
    }

    // PLAN
    if (currentStep === 4) {
      if (!formData.platformPlanId) {
        setError("Please select a LibraryHub plan.");
        return false;
      }

      if (!selectedPlan) {
        setError("The selected plan is no longer available.");
        return false;
      }

      if (
        selectedPlan.maxSeats != null &&
        generatedSeatCount > Number(selectedPlan.maxSeats)
      ) {
        setError(
          `${selectedPlan.name} supports a maximum of ${selectedPlan.maxSeats} seats. Please select another plan.`,
        );

        return false;
      }
    }

    // REVIEW
    if (currentStep === 5) {
      if (!formData.termsAccepted) {
        setError("Please accept the terms and conditions.");
        return false;
      }

      if (!selectedPlan) {
        setError("Please select a valid LibraryHub plan.");
        return false;
      }
    }

    return true;
  };

  const saveAmenitiesStep = async () => {
    const id = requireLibraryId();

    const amenityIds = formData.amenityIds.map((amenityId) =>
      Number(amenityId),
    );

    await libraryRegistrationApi.saveAmenities(id, amenityIds);
  };

  const validateSlotForm = () => {
    if (!formData.slotName.trim()) {
      setError("Slot name is required.");
      return false;
    }
    if (!formData.slotType) {
      setError("Slot type is required.");
      return false;
    }
    if (!formData.slotStartTime || !formData.slotEndTime) {
      setError("Slot start time and end time are required.");
      return false;
    }
    if (formData.slotStartTime >= formData.slotEndTime) {
      setError("Slot end time must be after start time.");
      return false;
    }
    const breakMinutes = Number(formData.slotBreakMinutes);
    if (!Number.isInteger(breakMinutes) || breakMinutes < 0) {
      setError("Break minutes must be zero or greater.");
      return false;
    }
    return true;
  };

  const handleAddSlot = () => {
    setError("");

    if (!validateSlotForm()) {
      return;
    }

    const name = formData.slotName.trim();

    if (
      createdSlots.some(
        (slot) => slot.name?.trim().toLowerCase() === name.toLowerCase(),
      )
    ) {
      setError("A slot with this name has already been added.");
      return;
    }

    if (
      createdSlots.some(
        (slot) =>
          formData.slotStartTime < slot.endTime &&
          formData.slotEndTime > slot.startTime,
      )
    ) {
      setError("This booking slot overlaps with another configured slot.");
      return;
    }

    setCreatedSlots((previous) => [
      ...previous,
      {
        tempId: `${Date.now()}-${Math.random()}`,
        name,
        type: formData.slotType,
        startTime: formData.slotStartTime,
        endTime: formData.slotEndTime,
        breakMinutes: Number(formData.slotBreakMinutes) || 0,
        active: true,
        persisted: false,
      },
    ]);
  };

  const handleRemoveSlot = async (slot) => {
    setError("");

    try {
      /*
       * Draft slots only exist in React state.
       * Persisted slots must also be deleted from the backend.
       */
      if (slot?.id && libraryId) {
        await slotApi.deleteSlot(libraryId, slot.id);
      }

      setCreatedSlots((previous) =>
        previous.filter((item) => item.tempId !== slot?.tempId),
      );
    } catch (removeError) {
      console.error("Unable to remove booking slot:", removeError);

      setError(
        getErrorMessage(removeError, "Unable to remove the booking slot."),
      );
    }
  };

  const saveSeatsStep = async () => {
    const id = requireLibraryId();
    const requestedFloorNumber = Number(formData.floorNumber);

    // ==========================================================
    // 1. LOAD FLOORS AND REUSE AN EXISTING FLOOR
    // ==========================================================

    const floorsResponse = await libraryRegistrationApi.getFloors(id);

    const existingFloors = Array.isArray(floorsResponse)
      ? floorsResponse
      : Array.isArray(floorsResponse?.content)
        ? floorsResponse.content
        : [];

    const existingFloor = existingFloors.find(
      (floor) => Number(floor?.floorNumber) === requestedFloorNumber,
    );

    let currentFloorId = existingFloor?.id ?? existingFloor?.floorId ?? null;

    // Only reuse the component floorId when it still belongs to the
    // floor number currently being configured. This prevents a stale
    // floor ID from being used after the restored floor changes.
    if (!currentFloorId && floorId) {
      const floorForCurrentId = existingFloors.find(
        (floor) => Number(floor?.id ?? floor?.floorId) === Number(floorId),
      );

      if (
        floorForCurrentId &&
        Number(floorForCurrentId?.floorNumber) === requestedFloorNumber
      ) {
        currentFloorId = Number(floorId);
      }
    }

    // ==========================================================
    // 2. CREATE FLOOR ONLY IF IT DOES NOT ALREADY EXIST
    // ==========================================================

    if (!currentFloorId) {
      const createdFloor = await libraryRegistrationApi.createFloor(id, {
        name: formData.floorName.trim(),
        floorNumber: requestedFloorNumber,
      });

      currentFloorId = createdFloor?.id ?? createdFloor?.floorId;
    }

    if (!currentFloorId) {
      throw new Error("Floor ID was not returned by the server.");
    }

    currentFloorId = Number(currentFloorId);
    setFloorId(currentFloorId);

    // ==========================================================
    // 3. CHECK WHETHER THIS FLOOR ALREADY HAS A SEAT LAYOUT
    // ==========================================================

    let finalLayout = null;

    try {
      const existingMatrix = await libraryRegistrationApi.getSeatMatrix(
        id,
        currentFloorId,
      );

      finalLayout = getSeatLayoutFromMatrix(existingMatrix);
    } catch (matrixError) {
      console.warn("Unable to check existing seat layout:", matrixError);
    }

    // ==========================================================
    // 4. CREATE INITIAL LAYOUT ONLY WHEN FLOOR HAS NO SEATS
    // ==========================================================

    if (!finalLayout?.totalSeats) {
      const seats = generateSeatLayout(formData.rows, formData.seatsPerRow);

      if (seats.length === 0) {
        throw new Error("At least one seat must be configured.");
      }

      await libraryRegistrationApi.saveSeatLayout(id, currentFloorId, {
        seats,
      });

      const savedMatrix = await libraryRegistrationApi.getSeatMatrix(
        id,
        currentFloorId,
      );

      finalLayout = getSeatLayoutFromMatrix(savedMatrix);
    }

    if (!finalLayout?.totalSeats) {
      throw new Error("The seat layout was not returned after saving.");
    }

    setPersistedSeatLayout(finalLayout);

    // Count every persisted seat in the library so Step 5 and Review use
    // backend data rather than rows × seatsPerRow from the current floor.
    let totalPersistedSeats = 0;

    const refreshedFloorsResponse = await libraryRegistrationApi.getFloors(id);

    const refreshedFloors = Array.isArray(refreshedFloorsResponse)
      ? refreshedFloorsResponse
      : Array.isArray(refreshedFloorsResponse?.content)
        ? refreshedFloorsResponse.content
        : [];

    for (const floor of refreshedFloors) {
      const persistedFloorId = floor?.id ?? floor?.floorId;

      if (!persistedFloorId) {
        continue;
      }

      try {
        const matrix = await libraryRegistrationApi.getSeatMatrix(
          id,
          persistedFloorId,
        );

        totalPersistedSeats += extractSeatList(matrix).length;
      } catch (matrixError) {
        console.warn(
          `Unable to count seats for floor ${persistedFloorId}:`,
          matrixError,
        );
      }
    }

    setPersistedSeatCount(totalPersistedSeats || finalLayout.totalSeats);

    // ==========================================================
    // 5. REQUIRE AT LEAST ONE SLOT IN THE UI
    // ==========================================================

    if (createdSlots.length === 0) {
      throw new Error("At least one booking slot must be configured.");
    }

    // ==========================================================
    // 6. LOAD EXISTING SLOTS
    // ==========================================================

    const slotsResponse = await slotApi.getSlots(id);

    const persistedSlots = Array.isArray(slotsResponse)
      ? slotsResponse
      : (slotsResponse?.content ?? []);

    const finalSlots = [];

    // ==========================================================
    // 7. CREATE ONLY SLOTS THAT DO NOT ALREADY EXIST
    // ==========================================================

    for (const slot of createdSlots) {
      const existingSlot = persistedSlots.find(
        (persisted) =>
          persisted?.name?.trim().toLowerCase() ===
          slot?.name?.trim().toLowerCase(),
      );

      if (existingSlot) {
        const existingSlotId = existingSlot?.id ?? existingSlot?.slotId;

        finalSlots.push({
          ...slot,
          id: existingSlotId,
          tempId: slot?.tempId ?? `persisted-${existingSlotId}`,
          active: existingSlot?.active !== false,
          persisted: true,
        });

        continue;
      }

      const createdSlot = await slotApi.createSlot(id, {
        name: slot.name.trim(),
        type: slot.type,
        startTime: slot.startTime,
        endTime: slot.endTime,
        breakMinutes: Number(slot.breakMinutes) || 0,
        active: true,
      });

      const createdSlotId = createdSlot?.id ?? createdSlot?.slotId;

      finalSlots.push({
        ...slot,
        id: createdSlotId,
        tempId: slot?.tempId ?? `persisted-${createdSlotId}`,
        active: true,
        persisted: true,
      });
    }

    setCreatedSlots(finalSlots);

    // ==========================================================
    // 8. VERIFY AT LEAST ONE ACTIVE SLOT EXISTS IN DATABASE
    // ==========================================================

    const slotsAfterSaveResponse = await slotApi.getSlots(id);

    const slotsAfterSave = Array.isArray(slotsAfterSaveResponse)
      ? slotsAfterSaveResponse
      : (slotsAfterSaveResponse?.content ?? []);

    const hasActiveSlot = slotsAfterSave.some((slot) => slot?.active !== false);

    if (!hasActiveSlot) {
      throw new Error(
        "Create at least one active booking slot before continuing.",
      );
    }

    // ==========================================================
    // 9. COMPLETE STEP 4
    // ==========================================================

    await libraryRegistrationApi.completeSeatSetup(id);
  };

  const savePlatformPlanStep = async () => {
    const id = requireLibraryId();

    if (!formData.platformPlanId) {
      throw new Error("Please select a LibraryHub plan.");
    }

    const response = await libraryRegistrationApi.selectPlatformPlan(
      id,
      Number(formData.platformPlanId),
      false,
    );

    setPaymentResult(response);

    return response;
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const handleNext = async () => {
    if (!validateStep() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      switch (currentStep) {
        // =========================================
        // STEP 1 — OWNER
        // =========================================

        case 0:
          await saveOwnerStep();
          break;

        // =========================================
        // STEP 2 — LIBRARY
        // =========================================

        case 1:
          await saveLibraryStep();
          break;

        // =========================================
        // STEP 3 — AMENITIES
        // =========================================

        case 2:
          await saveAmenitiesStep();
          break;

        // =========================================
        // STEP 4 — SEATS & SLOTS
        // =========================================

        case 3:
          await saveSeatsStep();
          break;

        // =========================================
        // STEP 5 — PLATFORM PLAN
        // =========================================

        case 4:
          await savePlatformPlanStep();
          break;

        default:
          return;
      }

      setCurrentStep((previous) => Math.min(previous + 1, steps.length - 1));

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (requestError) {
      console.error(
        `Failed to save onboarding step ${currentStep}:`,
        requestError,
      );

      setError(
        getErrorMessage(
          requestError,
          "Unable to save this step. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    setError("");

    setCurrentStep((previous) => Math.max(previous - 1, 0));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goToStep = (step) => {
    if (step < currentStep) {
      setError("");
      setCurrentStep(step);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async () => {
    if (!validateStep() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const id = requireLibraryId();

      const result = await libraryRegistrationApi.completeOnboarding(
        id,
        Boolean(formData.termsAccepted),
      );

      setRegistrationResult(result);

      /*
       * Onboarding has finished.
       * We no longer need the temporary draft ID.
       */
      localStorage.removeItem("libraryOnboardingLibraryId");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (submissionError) {
      console.error("Unable to complete library onboarding:", submissionError);

      setError(
        getErrorMessage(
          submissionError,
          "Unable to complete library setup. Please try again.",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (initializingOnboarding) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography color="text.secondary">
            Loading your library setup...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // SUCCESS SCREEN
  // ==========================================================

  if (registrationResult) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f5f9ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 3,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            maxWidth: 650,
            width: "100%",
            borderRadius: 5,
            p: {
              xs: 3,
              md: 6,
            },
            textAlign: "center",
            borderColor: "#d7e6fb",
          }}
        >
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              bgcolor: "#dcfce7",
              color: "#16a34a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
            }}
          >
            <CheckCircle
              sx={{
                fontSize: 55,
              }}
            />
          </Box>

          <Typography variant="h4" fontWeight={800} color="#0b1b5c">
            Your library is ready!
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 1,
              mb: 4,
            }}
          >
            {formData.libraryName} has been successfully registered with
            LibraryHub.
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={4}>
              <SummaryStat value={generatedSeatCount} label="Seats" />
            </Grid>

            <Grid item xs={4}>
              <SummaryStat
                value={formData.amenityIds.length}
                label="Amenities"
              />
            </Grid>

            <Grid item xs={4}>
              <SummaryStat value={selectedPlan?.name || "—"} label="Plan" />
            </Grid>
          </Grid>

          <Button
            fullWidth
            size="large"
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={() => navigate("/owner/dashboard")}
            sx={{
              minHeight: 52,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            Go to Dashboard
          </Button>
        </Paper>
      </Box>
    );
  }

  // ==========================================================
  // OWNER STEP
  // ==========================================================

  const renderOwnerStep = () => (
    <>
      <StepHeading
        icon={<Person />}
        title="OWNER DETAILS"
        subtitle="Who will manage this library?"
      />

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        These details will be used for the owner account.
      </Typography>

      <Stack spacing={2.5}>
        <TextField
          fullWidth
          required
          label="Full Name"
          placeholder="Enter owner's full name"
          value={formData.ownerName}
          onChange={(event) => updateField("ownerName", event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Person color="disabled" />
              </InputAdornment>
            ),
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Email"
              type="email"
              placeholder="owner@email.com"
              value={formData.email}
              onChange={(event) => updateField("email", event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Phone"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone color="disabled" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          required
          label="Create Password"
          type={showPassword ? "text" : "password"}
          placeholder="Create a secure password"
          value={formData.password}
          onChange={(event) => updateField("password", event.target.value)}
          helperText="Use at least 8 characters with a mix of letters, numbers and symbols."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock color="disabled" />
              </InputAdornment>
            ),

            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((previous) => !previous)}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Divider sx={{ my: 2.5 }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?
          </Typography>
        </Divider>

        <Button
          fullWidth
          variant="outlined"
          onClick={() => setShowOwnerLogin(true)}
        >
          Sign In & Continue Setup
        </Button>
      </Stack>
    </>
  );

  // ==========================================================
  // LIBRARY STEP
  // ==========================================================

  const renderLibraryStep = () => (
    <>
      <StepHeading
        icon={<LibraryBooks />}
        title="LIBRARY DETAILS"
        subtitle="Tell us about your library"
      />

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Add the basic information customers will see on LibraryHub.
      </Typography>

      <Stack spacing={2.5}>
        <TextField
          fullWidth
          required
          label="Library Name"
          placeholder="Example: GNC Study Library"
          value={formData.libraryName}
          onChange={(event) => updateField("libraryName", event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LibraryBooks color="disabled" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          multiline
          minRows={3}
          label="Description"
          placeholder="Tell students about your library..."
          value={formData.description}
          onChange={(event) => updateField("description", event.target.value)}
        />

        <TextField
          fullWidth
          required
          label="Address"
          placeholder="Enter complete library address"
          value={formData.address}
          onChange={(event) => updateField("address", event.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn color="disabled" />
              </InputAdornment>
            ),
          }}
        />

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="City"
              value={formData.city}
              onChange={(event) => updateField("city", event.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="State"
              value={formData.state}
              onChange={(event) => updateField("state", event.target.value)}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              required
              label="Pincode"
              inputProps={{
                maxLength: 6,
              }}
              value={formData.pincode}
              onChange={(event) =>
                updateField("pincode", event.target.value.replace(/\D/g, ""))
              }
            />
          </Grid>
        </Grid>
        <Box>
          <Stack
            direction={{
              xs: "column",
              sm: "row",
            }}
            alignItems={{
              xs: "flex-start",
              sm: "center",
            }}
            justifyContent="space-between"
            spacing={1}
            sx={{ mb: 1.5 }}
          >
            <Box>
              <Typography fontWeight={700} color="#0b1b5c">
                Library Timings
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Set when members can access your library.
              </Typography>
            </Box>

            <FormControlLabel
              sx={{
                m: 0,
                px: 1.5,
                py: 0.3,
                border: "1px solid",
                borderColor: formData.open24Hours ? "primary.main" : "#dbe4ef",
                borderRadius: 2,
                bgcolor: formData.open24Hours ? "#eff6ff" : "#fff",
              }}
              control={
                <Checkbox
                  checked={formData.open24Hours}
                  onChange={(event) => {
                    const checked = event.target.checked;

                    setFormData((previous) => ({
                      ...previous,

                      open24Hours: checked,

                      // Timings are not required for 24-hour operation.
                      openingTime: checked ? "" : previous.openingTime,

                      closingTime: checked ? "" : previous.closingTime,
                    }));

                    setError("");
                  }}
                />
              }
              label={
                <Typography
                  fontWeight={700}
                  color={formData.open24Hours ? "primary.main" : "#334155"}
                >
                  Open 24 Hours
                </Typography>
              }
            />
          </Stack>

          {!formData.open24Hours ? (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="time"
                    label="Opening Time"
                    value={formData.openingTime}
                    onChange={(event) =>
                      updateField("openingTime", event.target.value)
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 56,
                        borderRadius: 2,
                        bgcolor: "#fff",
                      },

                      "& input[type='time']": {
                        minWidth: 0,
                      },

                      "& input[type='time']::-webkit-calendar-picker-indicator":
                        {
                          cursor: "pointer",
                          opacity: 0.7,
                        },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    required
                    type="time"
                    label="Closing Time"
                    value={formData.closingTime}
                    onChange={(event) =>
                      updateField("closingTime", event.target.value)
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        minHeight: 56,
                        borderRadius: 2,
                        bgcolor: "#fff",
                      },

                      "& input[type='time']": {
                        minWidth: 0,
                      },

                      "& input[type='time']::-webkit-calendar-picker-indicator":
                        {
                          cursor: "pointer",
                          opacity: 0.7,
                        },
                    }}
                  />
                </Grid>
              </Grid>

              {formData.openingTime && formData.closingTime && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 1,
                  }}
                >
                  Members can access the library from{" "}
                  {formatTime(formData.openingTime)} to{" "}
                  {formatTime(formData.closingTime)}.
                </Typography>
              )}
            </>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 2,
                borderColor: "#bfdbfe",
                bgcolor: "#eff6ff",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "50%",
                    bgcolor: "#dbeafe",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  🕐
                </Box>

                <Box>
                  <Typography fontWeight={700} color="#0b1b5c">
                    Open 24 Hours
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Your library will be available to members throughout the
                    day.
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          )}
        </Box>
      </Stack>
    </>
  );

  // ==========================================================
  // AMENITY STEP
  // ==========================================================

  const renderAmenitiesStep = () => (
    <>
      <StepHeading
        icon={<Wifi />}
        title="AMENITIES"
        subtitle="What facilities does your library provide?"
      />

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Select all facilities available to your members.
      </Typography>

      {amenitiesLoading ? (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
          }}
        >
          <CircularProgress />

          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Loading amenities...
          </Typography>
        </Box>
      ) : amenitiesError ? (
        <Alert severity="error">{amenitiesError}</Alert>
      ) : amenities.length === 0 ? (
        <Alert severity="info">No amenities are currently configured.</Alert>
      ) : (
        <Grid container spacing={2}>
          {amenities.map((amenity) => {
            const selected = formData.amenityIds.some(
              (id) => Number(id) === Number(amenity.id),
            );

            return (
              <Grid item xs={12} sm={6} md={4} key={amenity.id}>
                <Card
                  onClick={() => handleAmenityToggle(amenity.id)}
                  variant="outlined"
                  sx={{
                    height: "100%",
                    cursor: "pointer",
                    borderRadius: 3,
                    borderWidth: 2,

                    borderColor: selected ? "#0d6efd" : "#e1e8f3",

                    bgcolor: selected ? "#f3f8ff" : "#fff",

                    transition: "all .2s",

                    "&:hover": {
                      borderColor: "#0d6efd",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(13,110,253,.08)",
                    },
                  }}
                >
                  <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: selected ? "#dbeafe" : "#f1f5f9",
                          color: selected ? "#0d6efd" : "#64748b",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Settings />
                      </Box>

                      <Box
                        sx={{
                          flexGrow: 1,
                        }}
                      >
                        <Typography fontWeight={700}>{amenity.name}</Typography>

                        {amenity.description && (
                          <Typography variant="caption" color="text.secondary">
                            {amenity.description}
                          </Typography>
                        )}
                      </Box>

                      <Checkbox checked={selected} tabIndex={-1} />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );

  // ==========================================================
  // SEATS STEP
  // ==========================================================

  const renderSeatsStep = () => (
    <>
      <StepHeading
        icon={<EventSeat />}
        title="SEATS & SLOTS"
        subtitle="Configure your initial library layout and booking schedule"
      />

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Create your first floor, generate its seat layout and configure at least
        one booking slot. You can customize these later from Seat Mapping and
        Slot Management.
      </Typography>

      <Stack spacing={3}>
        <Paper
          variant="outlined"
          sx={{ p: 3, borderRadius: 3, borderColor: "#dce7f5" }}
        >
          <Typography fontWeight={800} color="#0b1b5c" sx={{ mb: 2.5 }}>
            Initial Floor & Seat Layout
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={5}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  required
                  label="Floor Name"
                  value={formData.floorName}
                  onChange={(event) =>
                    updateField("floorName", event.target.value)
                  }
                />
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Floor Number"
                  value={formData.floorNumber}
                  inputProps={{ min: 0 }}
                  onChange={(event) =>
                    updateField("floorNumber", event.target.value)
                  }
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Rows"
                      inputProps={{ min: 1, max: 26 }}
                      value={formData.rows}
                      onChange={(event) =>
                        updateField("rows", event.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Seats / Row"
                      inputProps={{ min: 1 }}
                      value={formData.seatsPerRow}
                      onChange={(event) =>
                        updateField("seatsPerRow", event.target.value)
                      }
                    />
                  </Grid>
                </Grid>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    bgcolor: "#f8fbff",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="h4" color="primary" fontWeight={800}>
                    {generatedSeatCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Seats
                  </Typography>
                </Paper>
              </Stack>
            </Grid>
            <Grid item xs={12} lg={7}>
              {seatLayoutLoading ? (
                <Paper
                  variant="outlined"
                  sx={{
                    minHeight: 330,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack spacing={1.5} alignItems="center">
                    <CircularProgress size={32} />

                    <Typography variant="body2" color="text.secondary">
                      Loading saved seat layout...
                    </Typography>
                  </Stack>
                </Paper>
              ) : persistedSeatLayout?.totalSeats > 0 ? (
                <PersistedSeatPreview layout={persistedSeatLayout} />
              ) : (
                <SeatPreview
                  rows={Number(formData.rows) || 0}
                  seatsPerRow={Number(formData.seatsPerRow) || 0}
                />
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper
          variant="outlined"
          sx={{ p: 3, borderRadius: 3, borderColor: "#dce7f5" }}
        >
          <Typography fontWeight={800} color="#0b1b5c">
            Booking Slots
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, mb: 2.5 }}
          >
            Define the schedules in which students can book seats.
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Slot Name"
                placeholder="Example: Morning Slot"
                value={formData.slotName}
                onChange={(event) =>
                  updateField("slotName", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Slot Type</InputLabel>
                <Select
                  label="Slot Type"
                  value={formData.slotType}
                  onChange={(event) =>
                    updateField("slotType", event.target.value)
                  }
                >
                  <MenuItem value="FIXED">Fixed</MenuItem>
                  <MenuItem value="FULL_DAY">Full Day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="time"
                label="Start Time"
                value={formData.slotStartTime}
                InputLabelProps={{ shrink: true }}
                onChange={(event) =>
                  updateField("slotStartTime", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="time"
                label="End Time"
                value={formData.slotEndTime}
                InputLabelProps={{ shrink: true }}
                onChange={(event) =>
                  updateField("slotEndTime", event.target.value)
                }
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                type="number"
                label="Break Minutes"
                value={formData.slotBreakMinutes}
                inputProps={{ min: 0 }}
                onChange={(event) =>
                  updateField("slotBreakMinutes", event.target.value)
                }
              />
            </Grid>
          </Grid>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              onClick={handleAddSlot}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              + Add Slot
            </Button>
          </Stack>

          <Divider sx={{ my: 2.5 }} />
          <Typography fontWeight={700} color="#0b1b5c" sx={{ mb: 1.5 }}>
            Configured Slots
          </Typography>
          {createdSlots.length === 0 ? (
            <Alert severity="info">
              Add at least one booking slot before continuing.
            </Alert>
          ) : (
            <Stack spacing={1.5}>
              {createdSlots.map((slot) => (
                <Paper
                  key={slot.tempId ?? slot.id}
                  variant="outlined"
                  sx={{ p: 2, borderRadius: 2.5, bgcolor: "#fbfdff" }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: "flex-start", sm: "center" }}
                  >
                    <Box>
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                      >
                        <Typography fontWeight={700}>{slot.name}</Typography>
                        <Chip
                          size="small"
                          label={
                            slot.type === "FULL_DAY" ? "Full Day" : "Fixed"
                          }
                          color="primary"
                          variant="outlined"
                        />
                        <Chip size="small" label="Active" color="success" />
                      </Stack>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.7 }}
                      >
                        {formatTime(slot.startTime)} -{" "}
                        {formatTime(slot.endTime)} · Break:{" "}
                        {slot.breakMinutes || 0} min
                      </Typography>
                    </Box>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleRemoveSlot(slot)}
                      sx={{ textTransform: "none" }}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Stack>
    </>
  );

  // ==========================================================
  // PLAN STEP
  // ==========================================================

  const renderPlanStep = () => (
    <>
      <StepHeading
        icon={<WorkspacePremium />}
        title="LIBRARYHUB PLAN"
        subtitle="Choose the right plan for your library"
      />

      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your current setup contains <strong>{generatedSeatCount} seats</strong>.
      </Typography>

      {plansLoading ? (
        <Box
          sx={{
            py: 8,
            textAlign: "center",
          }}
        >
          <CircularProgress />
        </Box>
      ) : plansError ? (
        <Alert severity="error">{plansError}</Alert>
      ) : (
        <Grid container spacing={2}>
          {platformPlans.map((plan, index) => {
            const selected =
              Number(formData.platformPlanId) === Number(plan.id);

            const seatLimitExceeded =
              plan.maxSeats != null &&
              generatedSeatCount > Number(plan.maxSeats);

            return (
              <Grid item xs={12} md={4} key={plan.id}>
                <Card
                  variant="outlined"
                  onClick={() => {
                    if (!seatLimitExceeded) {
                      updateField("platformPlanId", Number(plan.id));
                    }
                  }}
                  sx={{
                    height: "100%",
                    cursor: seatLimitExceeded ? "not-allowed" : "pointer",

                    borderRadius: 3,
                    borderWidth: 2,

                    borderColor: selected ? "primary.main" : "#e1e8f3",

                    bgcolor: selected ? "#f3f8ff" : "#fff",

                    opacity: seatLimitExceeded ? 0.55 : 1,

                    position: "relative",
                  }}
                >
                  {index === 1 && (
                    <Chip
                      label="POPULAR"
                      size="small"
                      color="primary"
                      sx={{
                        position: "absolute",
                        top: 12,
                        right: 12,
                        fontWeight: 700,
                      }}
                    />
                  )}

                  <CardContent
                    sx={{
                      p: 3,
                    }}
                  >
                    <Typography variant="h6" fontWeight={800} color="#0b1b5c">
                      {plan.name}
                    </Typography>

                    <Stack
                      direction="row"
                      alignItems="baseline"
                      spacing={0.5}
                      mt={2}
                    >
                      <Typography variant="h4" fontWeight={800}>
                        ₹{plan.price ?? plan.amount ?? 0}
                      </Typography>

                      <Typography color="text.secondary">
                        {getBillingCycleLabel(plan.billingCycle)}
                      </Typography>
                    </Stack>

                    <Divider
                      sx={{
                        my: 2,
                      }}
                    />

                    {plan.maxSeats != null && (
                      <Typography
                        variant="body2"
                        sx={{
                          mb: 1,
                        }}
                      >
                        ✓ Up to {plan.maxSeats} seats
                      </Typography>
                    )}

                    {plan.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                        }}
                      >
                        {plan.description}
                      </Typography>
                    )}

                    {seatLimitExceeded && (
                      <Alert
                        severity="warning"
                        sx={{
                          mt: 2,
                        }}
                      >
                        Your {generatedSeatCount} seats exceed this plan.
                      </Alert>
                    )}

                    {selected && (
                      <Chip
                        icon={<CheckCircle />}
                        label="Selected"
                        color="primary"
                        sx={{
                          mt: 2,
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </>
  );

  // ==========================================================
  // REVIEW STEP
  // ==========================================================

  const renderReviewStep = () => (
    <>
      <StepHeading
        icon={<Description />}
        title="REVIEW YOUR SETUP"
        subtitle="Almost done! Check everything before creating your library."
      />

      <Stack spacing={2.5}>
        <ReviewSection
          title="Owner Details"
          icon={<Person />}
          onEdit={() => setCurrentStep(0)}
        >
          <ReviewValue label="Owner" value={formData.ownerName} />

          <ReviewValue label="Email" value={formData.email} />

          <ReviewValue label="Phone" value={formData.phone} />
        </ReviewSection>

        <ReviewSection
          title="Library Details"
          icon={<LibraryBooks />}
          onEdit={() => setCurrentStep(1)}
        >
          <ReviewValue label="Library" value={formData.libraryName} />

          <ReviewValue
            label="Location"
            value={`${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}`}
          />

          <ReviewValue
            label="Timing"
            value={`${formData.openingTime} - ${formData.closingTime}`}
          />
        </ReviewSection>

        <ReviewSection
          title="Amenities"
          icon={<Settings />}
          onEdit={() => setCurrentStep(2)}
        >
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {selectedAmenities.map((amenity) => (
              <Chip key={amenity.id} label={amenity.name} variant="outlined" />
            ))}
          </Stack>
        </ReviewSection>

        <ReviewSection
          title="Seats & Slots"
          icon={<EventSeat />}
          onEdit={() => setCurrentStep(3)}
        >
          <ReviewValue
            label="Floor"
            value={`${formData.floorName} (Floor ${formData.floorNumber})`}
          />

          <ReviewValue
            label="Layout"
            value={`${formData.rows} rows × ${formData.seatsPerRow} seats`}
          />

          <ReviewValue label="Total Seats" value={generatedSeatCount} />

          <ReviewValue
            label="Booking Slots"
            value={
              createdSlots.length > 0
                ? `${createdSlots.length} configured`
                : "No slots configured"
            }
          />

          {createdSlots.map((slot) => (
            <ReviewValue
              key={slot.tempId ?? slot.id}
              label={slot.name}
              value={`${formatTime(slot.startTime)} - ${formatTime(slot.endTime)} · ${slot.type === "FULL_DAY" ? "Full Day" : "Fixed"}`}
            />
          ))}
        </ReviewSection>

        <ReviewSection
          title="LibraryHub Plan"
          icon={<WorkspacePremium />}
          onEdit={() => setCurrentStep(4)}
        >
          <ReviewValue label="Plan" value={selectedPlan?.name} />

          <ReviewValue
            label="Price"
            value={
              selectedPlan
                ? `₹${
                    selectedPlan.price ?? selectedPlan.amount ?? 0
                  } ${getBillingCycleLabel(selectedPlan.billingCycle)}`
                : "-"
            }
          />
        </ReviewSection>

        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 3,
            bgcolor: "#f8fbff",
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.termsAccepted}
                onChange={(event) =>
                  updateField("termsAccepted", event.target.checked)
                }
              />
            }
            label={
              <Typography variant="body2">
                I agree to the LibraryHub Terms & Conditions and Privacy Policy.
              </Typography>
            }
          />
        </Paper>
      </Stack>
    </>
  );

  // ==========================================================
  // STEP CONTENT
  // ==========================================================

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderOwnerStep();

      case 1:
        return renderLibraryStep();

      case 2:
        return renderAmenitiesStep();

      case 3:
        return renderSeatsStep();

      case 4:
        return renderPlanStep();

      case 5:
        return renderReviewStep();

      default:
        return null;
    }
  };

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f6faff",
        pb: 6,
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid #e4edf8",
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 1.8,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "primary.main",
                  borderRadius: 2.5,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <LibraryBooks />
              </Box>

              <Typography variant="h5" fontWeight={800} color="#0b1b5c">
                LibraryHub
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                startIcon={<HelpOutlineOutlined />}
                sx={{
                  display: {
                    xs: "none",
                    sm: "flex",
                  },
                  textTransform: "none",
                  color: "text.secondary",
                }}
              >
                Need help?
              </Button>

              <Button
                variant="outlined"
                startIcon={<Save />}
                onClick={() => navigate("/")}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              >
                Save & Exit
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="xl"
        sx={{
          pt: {
            xs: 3,
            md: 4,
          },
        }}
      >
        {/* TITLE */}

        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h3"
            fontWeight={800}
            color="#0b1b5c"
            sx={{
              fontSize: {
                xs: 32,
                md: 42,
              },
            }}
          >
            Register your library
          </Typography>

          <Typography
            color="#52658f"
            sx={{
              mt: 0.5,
              fontSize: 18,
            }}
          >
            Complete the setup and start managing your library
          </Typography>
        </Box>

        {/* CUSTOM STEPPER */}

        <RegistrationStepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={goToStep}
        />

        {/* ERROR */}

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mt: 3,
              borderRadius: 2,
            }}
          >
            {error}
          </Alert>
        )}

        {/* CONTENT */}

        <Grid
          container
          spacing={3}
          sx={{
            mt: 0.5,
            alignItems: "flex-start",
          }}
        >
          {/* LEFT */}

          <Grid item xs={12} lg={8.4}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 4,
                p: {
                  xs: 2.5,
                  md: 4,
                },
                borderColor: "#d7e6fb",
                bgcolor: "#fff",
                minHeight: 500,
              }}
            >
              {renderStepContent()}

              <Divider
                sx={{
                  mt: 4,
                  mb: 3,
                }}
              />

              {/* NAVIGATION */}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                {currentStep === 0 ? (
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/")}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Cancel
                  </Button>
                ) : (
                  <Button
                    startIcon={<ArrowBack />}
                    onClick={handleBack}
                    disabled={isSubmitting}
                    sx={{
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Back
                  </Button>
                )}

                {currentStep < steps.length - 1 ? (
                  <Button
                    variant="contained"
                    endIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <ArrowForward />
                      )
                    }
                    onClick={handleNext}
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : currentStep === 4
                        ? "Continue to Payment"
                        : "Save & Continue"}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <CheckCircle />
                      )
                    }
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Completing Setup..." : "Complete Setup"}
                  </Button>
                )}
              </Stack>
            </Paper>
          </Grid>

          {/* RIGHT */}

          <Grid item xs={12} lg={3.6}>
            <SetupSummary
              formData={formData}
              selectedPlan={selectedPlan}
              selectedAmenities={selectedAmenities}
              generatedSeatCount={generatedSeatCount}
              currentStep={currentStep}
              progress={progress}
              onNavigate={goToStep}
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

// ============================================================
// CUSTOM STEPPER
// ============================================================

const RegistrationStepper = ({ steps, currentStep, onStepClick }) => (
  <Paper
    variant="outlined"
    sx={{
      p: {
        xs: 2,
        md: 3,
      },
      borderRadius: 4,
      borderColor: "#d7e6fb",
      overflowX: "auto",
    }}
  >
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        minWidth: 900,
      }}
    >
      {steps.map((step, index) => {
        const completed = index < currentStep;

        const active = index === currentStep;

        return (
          <React.Fragment key={step.label}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.2}
              onClick={() => {
                if (completed) {
                  onStepClick(index);
                }
              }}
              sx={{
                cursor: completed ? "pointer" : "default",
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,

                  bgcolor: completed
                    ? "#18b76a"
                    : active
                      ? "#0d6efd"
                      : "#e7eef8",

                  color: completed || active ? "#fff" : "#183269",

                  fontWeight: 800,
                }}
              >
                {completed ? <Check /> : index + 1}
              </Box>

              <Typography
                fontWeight={active || completed ? 700 : 500}
                color={completed ? "#18a85f" : active ? "#0d6efd" : "#324b7d"}
                whiteSpace="nowrap"
              >
                {step.label}
              </Typography>
            </Stack>

            {index < steps.length - 1 && (
              <Box
                sx={{
                  flexGrow: 1,
                  minWidth: 55,
                  height: 4,
                  borderRadius: 4,
                  mx: 2,

                  bgcolor: index < currentStep ? "#18b76a" : "#dbe5f2",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </Stack>
  </Paper>
);

// ============================================================
// STEP HEADING
// ============================================================

const StepHeading = ({ icon, title, subtitle }) => (
  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
    <Box
      sx={{
        width: 58,
        height: 58,
        borderRadius: 2.5,
        bgcolor: "#e6f2ff",
        color: "#0d6efd",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",

        "& svg": {
          fontSize: 32,
        },
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography variant="h5" fontWeight={800} color="#0b1b5c">
        {title}
      </Typography>

      <Typography color="#52658f">{subtitle}</Typography>
    </Box>
  </Stack>
);

// ============================================================
// YOUR SETUP
// ============================================================

const SetupSummary = ({
  formData,
  selectedPlan,
  selectedAmenities,
  generatedSeatCount,
  currentStep,
  progress,
  onNavigate,
}) => {
  const items = [
    {
      title: "Library",
      value: formData.libraryName || "Not added yet",
      icon: <LibraryBooks />,
      background: "#e6f2ff",
      color: "#0d6efd",
      step: 1,
    },

    {
      title: "Amenities",
      value:
        selectedAmenities.length > 0
          ? `${selectedAmenities.length} selected`
          : "—",
      icon: <Settings />,
      background: "#e6f9ef",
      color: "#13a963",
      step: 2,
    },

    {
      title: "Seats",
      value: generatedSeatCount > 0 ? `${generatedSeatCount} seats` : "—",
      icon: <Chair />,
      background: "#fff3da",
      color: "#ef9200",
      step: 3,
    },

    {
      title: "Plan",
      value: selectedPlan?.name || "Not selected",
      icon: <CreditCard />,
      background: "#f1e8ff",
      color: "#7c3aed",
      step: 4,
    },
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        borderRadius: 4,
        borderColor: "#cfe3fb",
        bgcolor: "#fafdff",

        position: {
          lg: "sticky",
        },

        top: {
          lg: 20,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{
          px: 1,
          pb: 2,
        }}
      >
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: 2.5,
            bgcolor: "#e6f2ff",
            color: "#0d6efd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Description />
        </Box>

        <Box>
          <Typography variant="h6" fontWeight={800} color="#0b1b5c">
            YOUR SETUP
          </Typography>

          <Typography color="text.secondary" variant="body2">
            Track your progress
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1}>
        {items.map((item) => (
          <Paper
            key={item.title}
            variant="outlined"
            onClick={() => {
              if (item.step <= currentStep) {
                onNavigate(item.step);
              }
            }}
            sx={{
              p: 1.5,
              borderRadius: 2.5,
              borderColor: "#e2ebf5",
              cursor: item.step <= currentStep ? "pointer" : "default",
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  bgcolor: item.background,
                  color: item.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {item.icon}
              </Box>

              <Box
                sx={{
                  flexGrow: 1,
                  minWidth: 0,
                }}
              >
                <Typography fontWeight={700} color="#0b1b5c">
                  {item.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" noWrap>
                  {item.value}
                </Typography>
              </Box>

              <ChevronRight
                sx={{
                  color: "#5d739c",
                }}
              />
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Divider
        sx={{
          my: 3,
        }}
      />

      <Box sx={{ mt: 3 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            mb: 1.2,
            width: "100%",
          }}
        >
          <Typography variant="body2" fontWeight={700} color="#0b1b5c">
            Step {currentStep + 1} of {steps.length}
          </Typography>

          <Typography
            variant="body2"
            fontWeight={800}
            color="primary.main"
            sx={{
              ml: 2,
              flexShrink: 0,
            }}
          >
            {progress}%
          </Typography>
        </Stack>

        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            width: "100%",
            height: 9,
            borderRadius: 10,
            bgcolor: "#dce8f6",

            "& .MuiLinearProgress-bar": {
              borderRadius: 10,
            },
          }}
        />
      </Box>
    </Paper>
  );
};

const PersistedSeatPreview = ({ layout }) => {
  const rows = layout?.rows ?? [];

  /*
   * Physical column position and visible seat number are intentionally
   * different concepts.
   *
   * Example:
   *
   * Row B can contain seats at physical columns:
   *   1, 2, 3, 4, 5, 6, 9
   *
   * while visible seat labels can be:
   *   B1, B2, B3, B4, B5, B6, B7
   *
   * Columns 7 and 8 therefore remain visible as empty physical gaps.
   */
  const maxColumnNumber = useMemo(() => {
    if (!rows.length) {
      return 0;
    }

    const allColumns = rows.flatMap((row) =>
      Array.isArray(row?.seats)
        ? row.seats.map((seat) => Number(seat?.columnNumber) || 0)
        : [],
    );

    return allColumns.length ? Math.max(...allColumns) : 0;
  }, [rows]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: "#f8fbff",
        minHeight: 330,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography fontWeight={800} color="#0b1b5c">
            Seat Layout Preview
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Saved seat layout
          </Typography>
        </Box>

        <Chip
          icon={<EventSeat />}
          label={`${layout?.totalSeats ?? 0} seats`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      <Box
        sx={{
          bgcolor: "#edf4ff",
          borderRadius: 3,
          py: 1.2,
          textAlign: "center",
          mb: 3,
        }}
      >
        <Typography fontWeight={800} letterSpacing={1} color="#50648d">
          READING AREA
        </Typography>
      </Box>

      <Box
        sx={{
          overflowX: "auto",
          pb: 1,
        }}
      >
        <Stack
          spacing={2}
          sx={{
            minWidth: maxColumnNumber > 0 ? maxColumnNumber * 64 + 45 : "auto",
          }}
        >
          {rows.map((row) => (
            <Stack
              key={row.rowLabel}
              direction="row"
              spacing={1.2}
              alignItems="center"
            >
              <Typography
                fontWeight={800}
                sx={{
                  width: 28,
                  flexShrink: 0,
                  color: "#0b1b5c",
                }}
              >
                {row.rowLabel}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="nowrap">
                {Array.from({
                  length: maxColumnNumber,
                }).map((_, columnIndex) => {
                  const columnNumber = columnIndex + 1;

                  const seat = row.seats.find(
                    (item) => Number(item?.columnNumber) === columnNumber,
                  );

                  /*
                   * No persisted Seat entity at this physical coordinate.
                   * Render an invisible fixed-width cell so the gap remains
                   * visible instead of pulling the following seat to the left.
                   */
                  if (!seat) {
                    return (
                      <Box
                        key={`${row.rowLabel}-gap-${columnNumber}`}
                        aria-label={`Empty space at row ${row.rowLabel}, column ${columnNumber}`}
                        sx={{
                          width: 54,
                          minWidth: 54,
                          height: 54,
                          flexShrink: 0,
                        }}
                      />
                    );
                  }

                  const isAvailable = seat.status === "AVAILABLE";

                  return (
                    <Box
                      key={
                        seat.id ??
                        seat.seatId ??
                        `${row.rowLabel}-${columnNumber}-${seat.seatNumber}`
                      }
                      sx={{
                        width: 54,
                        minWidth: 54,
                        height: 54,
                        flexShrink: 0,
                        borderRadius: 2,
                        border: "1.5px solid",
                        borderColor: isAvailable ? "#22c55e" : "#94a3b8",
                        bgcolor: isAvailable ? "#ecfdf3" : "#f1f5f9",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <EventSeat
                        sx={{
                          fontSize: 20,
                          color: isAvailable ? "#15803d" : "#64748b",
                        }}
                      />

                      <Typography variant="caption" fontWeight={700}>
                        {seat.seatNumber}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Divider sx={{ my: 2.5 }} />

      <Stack
        direction="row"
        spacing={3}
        alignItems="center"
        flexWrap="wrap"
        useFlexGap
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              bgcolor: "#ecfdf3",
              border: "1px solid #22c55e",
            }}
          />

          <Typography variant="caption" color="text.secondary">
            Saved seats
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 24,
              height: 18,
            }}
          />

          <Typography variant="caption" color="text.secondary">
            Empty space / gap
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

// ============================================================
// SEAT PREVIEW
// ============================================================

const SeatPreview = ({ rows, seatsPerRow }) => {
  const visibleRows = Math.min(rows, 12);

  const visibleSeats = Math.min(seatsPerRow, 16);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
        borderRadius: 3,
        bgcolor: "#fafdff",
        minHeight: 390,
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography fontWeight={800} color="#0b1b5c">
            Seat Layout Preview
          </Typography>

          <Typography variant="caption" color="text.secondary">
            Preview of your initial floor
          </Typography>
        </Box>

        <Chip
          icon={<EventSeat />}
          label={`${rows * seatsPerRow} seats`}
          color="primary"
          variant="outlined"
        />
      </Stack>

      <Box
        sx={{
          bgcolor: "#edf5ff",
          borderRadius: 2,
          textAlign: "center",
          py: 1,
          mb: 3,
          color: "#52658f",
          fontWeight: 700,
          letterSpacing: 1,
        }}
      >
        READING AREA
      </Box>

      {rows === 0 || seatsPerRow === 0 ? (
        <Box
          sx={{
            minHeight: 250,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
          }}
        >
          <EventSeat
            sx={{
              fontSize: 55,
              opacity: 0.3,
            }}
          />

          <Typography sx={{ mt: 1 }}>
            Enter rows and seats per row to preview your layout.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            overflowX: "auto",
          }}
        >
          <Stack
            spacing={1.3}
            sx={{
              minWidth: visibleSeats * 39 + 45,
            }}
          >
            {Array.from({
              length: visibleRows,
            }).map((_, rowIndex) => {
              const rowLabel = String.fromCharCode(65 + rowIndex);

              return (
                <Stack
                  key={rowLabel}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Typography
                    sx={{
                      width: 30,
                      fontWeight: 700,
                      color: "#52658f",
                    }}
                  >
                    {rowLabel}
                  </Typography>

                  {Array.from({
                    length: visibleSeats,
                  }).map((__, seatIndex) => (
                    <TooltipSeat
                      key={seatIndex}
                      label={`${rowLabel}${seatIndex + 1}`}
                    />
                  ))}
                </Stack>
              );
            })}
          </Stack>

          {(rows > visibleRows || seatsPerRow > visibleSeats) && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                display: "block",
                mt: 2,
                textAlign: "center",
              }}
            >
              Preview is limited for large layouts. All {rows * seatsPerRow}{" "}
              seats will be created.
            </Typography>
          )}
        </Box>
      )}

      <Divider
        sx={{
          my: 3,
        }}
      />

      <Stack direction="row" spacing={2} justifyContent="center">
        <Stack direction="row" spacing={0.7} alignItems="center">
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: 1,
              bgcolor: "#dcfce7",
              border: "1px solid #22c55e",
            }}
          />

          <Typography variant="caption">Available</Typography>
        </Stack>
      </Stack>
    </Paper>
  );
};

const TooltipSeat = ({ label }) => (
  <Box
    title={label}
    sx={{
      width: 31,
      height: 31,
      borderRadius: 1,
      bgcolor: "#dcfce7",
      border: "1.5px solid #22c55e",
      color: "#15803d",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: 10,
      fontWeight: 700,
    }}
  >
    {label}
  </Box>
);

// ============================================================
// REVIEW COMPONENTS
// ============================================================

const ReviewSection = ({ title, icon, onEdit, children }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2.5,
      borderRadius: 3,
      borderColor: "#e0e9f4",
    }}
  >
    <Stack
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={{
        mb: 2,
      }}
    >
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            color: "primary.main",
            display: "flex",
          }}
        >
          {icon}
        </Box>

        <Typography fontWeight={800} color="#0b1b5c">
          {title}
        </Typography>
      </Stack>

      <Button
        size="small"
        startIcon={<Edit />}
        onClick={onEdit}
        sx={{
          textTransform: "none",
        }}
      >
        Edit
      </Button>
    </Stack>

    {children}
  </Paper>
);

const ReviewValue = ({ label, value }) => (
  <Stack
    direction={{
      xs: "column",
      sm: "row",
    }}
    spacing={0.5}
    sx={{
      py: 0.6,
    }}
  >
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{
        width: {
          sm: 150,
        },
        flexShrink: 0,
      }}
    >
      {label}
    </Typography>

    <Typography
      variant="body2"
      fontWeight={600}
      sx={{
        wordBreak: "break-word",
      }}
    >
      {value || "—"}
    </Typography>
  </Stack>
);

const SummaryStat = ({ value, label }) => (
  <Box>
    <Typography
      variant="h5"
      fontWeight={800}
      color="#0d6efd"
      sx={{
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {value}
    </Typography>

    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export default RegisterLibrary;

const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  const date = new Date();

  date.setHours(Number(hours), Number(minutes), 0, 0);

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const generateSeatLayout = (rows, seatsPerRow) => {
  const generatedSeats = [];

  for (let rowIndex = 0; rowIndex < Number(rows); rowIndex++) {
    const rowLabel = String.fromCharCode(65 + rowIndex);

    for (let column = 1; column <= Number(seatsPerRow); column++) {
      generatedSeats.push({
        id: null,

        seatNumber: `${rowLabel}${column}`,

        rowLabel,

        columnNumber: column,

        seatType: "NORMAL",

        status: "AVAILABLE",
      });
    }
  }

  return generatedSeats;
};
