import {
  AcUnit,
  Add,
  Apartment,
  CheckCircle,
  Coffee,
  DeleteOutlineOutlined,
  DirectionsCar,
  Edit,
  LocalDrink,
  Lock,
  MenuBook,
  Newspaper,
  Power,
  Refresh,
  Save,
  Security,
  Tune,
  Wifi,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";

// ============================================================
// AMENITY UI METADATA
// ============================================================
//
// Backend AmenityResponse:
// {
//   id: Long,
//   name: String
// }
//
// Description, icon and category are frontend presentation metadata.
// The actual amenity ID/name always comes from the backend.
// ============================================================

const amenityMetadata = {
  "wi-fi": {
    description: "High speed internet access",
    category: "Basic Facilities",
    icon: Wifi,
  },

  wifi: {
    description: "High speed internet access",
    category: "Basic Facilities",
    icon: Wifi,
  },

  "air conditioning": {
    description: "Comfortable study environment",
    category: "Comfort & Convenience",
    icon: AcUnit,
  },

  ac: {
    description: "Comfortable study environment",
    category: "Comfort & Convenience",
    icon: AcUnit,
  },

  "power backup": {
    description: "Uninterrupted power supply",
    category: "Basic Facilities",
    icon: Power,
  },

  cctv: {
    description: "24/7 security surveillance",
    category: "Safety & Security",
    icon: Security,
  },

  parking: {
    description: "Car and bike parking facility",
    category: "Comfort & Convenience",
    icon: DirectionsCar,
  },

  cafe: {
    description: "In-house cafe / cafeteria",
    category: "Food & Beverages",
    icon: Coffee,
  },

  "drinking water": {
    description: "Clean and safe drinking water",
    category: "Basic Facilities",
    icon: LocalDrink,
  },

  locker: {
    description: "Personal storage lockers",
    category: "Comfort & Convenience",
    icon: Lock,
  },

  "reading area": {
    description: "Dedicated reading space",
    category: "Study & Work",
    icon: MenuBook,
  },

  "quiet zone": {
    description: "Silent study environment",
    category: "Study & Work",
    icon: Security,
  },

  newspapers: {
    description: "Daily newspapers and magazines",
    category: "Other",
    icon: Newspaper,
  },

  "24/7 access": {
    description: "Round the clock access",
    category: "Other",
    icon: Apartment,
  },
};

// ============================================================
// CATEGORIES
// ============================================================

const categories = [
  "All Amenities",
  "Basic Facilities",
  "Comfort & Convenience",
  "Safety & Security",
  "Study & Work",
  "Food & Beverages",
  "Other",
];

// ============================================================
// HELPERS
// ============================================================

const normalizeName = (name = "") =>
  name.trim().toLowerCase().replace(/\s+/g, " ");

const getAmenityMetadata = (name) => {
  const normalized = normalizeName(name);

  return (
    amenityMetadata[normalized] || {
      description: "Facility available at the library",
      category: "Other",
      icon: Apartment,
    }
  );
};

// ============================================================
// PREMIUM SECTION HEADER
// ============================================================

function SectionHeading({ icon, title, description, action }) {
  const theme = useTheme();

  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={2}
      sx={{ mb: 2.25 }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.12),
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>

        <Box>
          <Typography
            variant="h6"
            fontWeight={800}
            sx={{ letterSpacing: "-0.01em" }}
          >
            {title}
          </Typography>

          {description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.25 }}
            >
              {description}
            </Typography>
          )}
        </Box>
      </Stack>

      {action}
    </Stack>
  );
}

// ============================================================
// COMPONENT
// ============================================================

function Amenities() {
  const theme = useTheme();

  // ==========================================================
  // LIBRARY
  // ==========================================================

  const [library, setLibrary] = useState(null);

  // ==========================================================
  // STANDARD AMENITIES
  // ==========================================================

  const [amenities, setAmenities] = useState([]);

  // ==========================================================
  // SELECTED STANDARD AMENITY IDS
  // ==========================================================

  const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);

  // ==========================================================
  // CUSTOM AMENITIES
  // ==========================================================

  const [customAmenities, setCustomAmenities] = useState([]);

  // ==========================================================
  // PAGE STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  // ==========================================================
  // CATEGORY
  // ==========================================================

  const [selectedCategory, setSelectedCategory] = useState("All Amenities");

  // ==========================================================
  // CUSTOM AMENITY DIALOG
  // ==========================================================

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomAmenity, setEditingCustomAmenity] = useState(null);

  const [customAmenity, setCustomAmenity] = useState({
    name: "",
    description: "",
  });

  // ==========================================================
  // CURRENT LIBRARY NAME
  // ==========================================================

  const libraryName = library?.name || library?.libraryName || "your library";

  // ==========================================================
  // LOAD EVERYTHING
  // ==========================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSaved(false);

      const libraries = await libraryApi.getMyLibraries();

      if (!Array.isArray(libraries) || libraries.length === 0) {
        setLibrary(null);
        setAmenities([]);
        setSelectedAmenityIds([]);
        setCustomAmenities([]);
        return;
      }

      const currentLibrary = libraries[0];

      setLibrary(currentLibrary);

      const [masterAmenities, libraryAmenities, libraryCustomAmenities] =
        await Promise.all([
          libraryApi.getAllAmenities(),
          libraryApi.getLibraryAmenities(currentLibrary.id),
          libraryApi.getCustomAmenities(currentLibrary.id),
        ]);

      const normalizedMasterAmenities = Array.isArray(masterAmenities)
        ? masterAmenities
        : [];

      setAmenities(normalizedMasterAmenities);

      const normalizedLibraryAmenities = Array.isArray(libraryAmenities)
        ? libraryAmenities
        : [];

      const selectedIds = normalizedLibraryAmenities
        .map((amenity) => amenity.id)
        .filter((id) => id !== null && id !== undefined);

      setSelectedAmenityIds(selectedIds);

      setCustomAmenities(
        Array.isArray(libraryCustomAmenities) ? libraryCustomAmenities : [],
      );
    } catch (err) {
      console.error("Failed to load library amenities:", err);

      setError(
        err?.response?.data?.message || "Failed to load library amenities.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // DERIVED COUNTS
  // ==========================================================

  const selectedCount = useMemo(() => {
    return selectedAmenityIds.length + customAmenities.length;
  }, [selectedAmenityIds, customAmenities]);

  const standardSelectedCount = selectedAmenityIds.length;
  const customCount = customAmenities.length;

  // ==========================================================
  // FILTER STANDARD AMENITIES BY CATEGORY
  // ==========================================================

  const filteredAmenities = useMemo(() => {
    if (selectedCategory === "All Amenities") {
      return amenities;
    }

    return amenities.filter((amenity) => {
      const metadata = getAmenityMetadata(amenity.name);
      return metadata.category === selectedCategory;
    });
  }, [amenities, selectedCategory]);

  const filteredCustomAmenities = useMemo(() => {
    if (selectedCategory === "All Amenities" || selectedCategory === "Other") {
      return customAmenities;
    }

    return [];
  }, [customAmenities, selectedCategory]);

  // ==========================================================
  // TOGGLE STANDARD AMENITY
  // ==========================================================

  const handleToggle = (amenityId) => {
    setSelectedAmenityIds((previous) => {
      if (previous.includes(amenityId)) {
        return previous.filter((id) => id !== amenityId);
      }

      return [...previous, amenityId];
    });

    setSaved(false);
  };

  // ==========================================================
  // SAVE STANDARD AMENITIES
  // ==========================================================

  const handleSave = async () => {
    if (!library?.id) {
      setError("No library is associated with your account.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      await libraryApi.assignLibraryAmenities(library.id, selectedAmenityIds);

      setSaved(true);
    } catch (err) {
      console.error("Failed to save library amenities:", err);

      setError(
        err?.response?.data?.message || "Failed to save library amenities.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // RESET / RELOAD SAVED STATE
  // ==========================================================

  const handleReset = async () => {
    await loadData();
  };

  // ==========================================================
  // CANCEL
  // ==========================================================

  const handleCancel = async () => {
    await loadData();
  };

  // ==========================================================
  // OPEN ADD CUSTOM AMENITY
  // ==========================================================

  const handleOpenAddDialog = () => {
    setEditingCustomAmenity(null);

    setCustomAmenity({
      name: "",
      description: "",
    });

    setDialogOpen(true);
  };

  // ==========================================================
  // OPEN EDIT CUSTOM AMENITY
  // ==========================================================

  const handleOpenEditDialog = (amenity) => {
    setEditingCustomAmenity(amenity);

    setCustomAmenity({
      name: amenity.name || "",
      description: amenity.description || "",
    });

    setDialogOpen(true);
  };

  // ==========================================================
  // CLOSE CUSTOM AMENITY DIALOG
  // ==========================================================

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCustomAmenity(null);

    setCustomAmenity({
      name: "",
      description: "",
    });
  };

  // ==========================================================
  // CREATE / UPDATE CUSTOM AMENITY
  // ==========================================================

  const handleSaveCustomAmenity = async () => {
    if (!library?.id) {
      setError("No library is associated with your account.");
      return;
    }

    const name = customAmenity.name.trim();

    if (!name) {
      return;
    }

    const description = customAmenity.description.trim();

    try {
      setSaving(true);
      setError("");

      if (editingCustomAmenity) {
        const updated = await libraryApi.updateCustomAmenity(
          library.id,
          editingCustomAmenity.id,
          {
            name,
            description,
          },
        );

        setCustomAmenities((previous) =>
          previous.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await libraryApi.createCustomAmenity(library.id, {
          name,
          description,
        });

        setCustomAmenities((previous) => [...previous, created]);
      }

      setSaved(false);
      handleCloseDialog();
    } catch (err) {
      console.error("Failed to save custom amenity:", err);

      setError(
        err?.response?.data?.message || "Failed to save custom amenity.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE CUSTOM AMENITY
  // ==========================================================

  const handleDeleteCustomAmenity = async (id) => {
    if (!library?.id) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await libraryApi.deleteCustomAmenity(library.id, id);

      setCustomAmenities((previous) =>
        previous.filter((amenity) => amenity.id !== id),
      );
    } catch (err) {
      console.error("Failed to delete custom amenity:", err);

      setError(
        err?.response?.data?.message || "Failed to delete custom amenity.",
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // LOADING STATE
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 460,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography color="text.secondary">
            Loading library amenities...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // NO LIBRARY
  // ==========================================================

  if (!library) {
    return (
      <Alert severity="warning" sx={{ borderRadius: 3 }}>
        No library is associated with your account.
      </Alert>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        pb: 5,
        maxWidth: 1480,
        mx: "auto",
      }}
    >
      {/* ===================================================== */}
      {/* BREADCRUMB */}
      {/* ===================================================== */}

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          mb: 1.5,
          fontWeight: 500,
        }}
      >
        Dashboard
        {"  ›  "}
        Library Profile
        {"  ›  "}
        <Box
          component="span"
          sx={{
            color: "primary.main",
            fontWeight: 700,
          }}
        >
          Amenities
        </Box>
      </Typography>

      {/* ===================================================== */}
      {/* PREMIUM HERO */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,
          position: "relative",
          overflow: "hidden",
          borderRadius: 4,
          border: "1px solid",
          borderColor: alpha(theme.palette.primary.main, 0.12),
          background: `linear-gradient(
            135deg,
            ${alpha(theme.palette.primary.main, 0.1)} 0%,
            ${theme.palette.background.paper} 52%,
            ${alpha(theme.palette.secondary.main, 0.06)} 100%
          )`,
          boxShadow: "0 18px 50px rgba(15,23,42,0.06)",
          "&::before": {
            content: '""',
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            right: -100,
            top: -145,
            background: alpha(theme.palette.primary.main, 0.07),
          },
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3.5 },
            position: "relative",
            zIndex: 1,
            "&:last-child": {
              pb: { xs: 2.5, md: 3.5 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            spacing={3}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 62,
                  height: 62,
                  borderRadius: 3.2,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: `0 12px 28px ${alpha(
                    theme.palette.primary.main,
                    0.28,
                  )}`,
                  flexShrink: 0,
                }}
              >
                <Tune sx={{ fontSize: 31 }} />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  variant="h4"
                  fontWeight={850}
                  sx={{
                    letterSpacing: "-0.025em",
                    lineHeight: 1.12,
                  }}
                >
                  Library Amenities
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mt: 0.75, maxWidth: 720 }}
                >
                  Curate the facilities available at{" "}
                  <Box
                    component="span"
                    sx={{ color: "text.primary", fontWeight: 700 }}
                  >
                    {libraryName}
                  </Box>{" "}
                  so students can quickly understand what your library offers.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.25}
              sx={{ flexShrink: 0 }}
            >
              <Box
                sx={{
                  minWidth: 130,
                  px: 2,
                  py: 1.4,
                  borderRadius: 2.8,
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.success.main, 0.16),
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  Selected
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={850}
                  sx={{ mt: 0.1, color: "success.dark" }}
                >
                  {selectedCount}
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: 130,
                  px: 2,
                  py: 1.4,
                  borderRadius: 2.8,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.12),
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  Custom
                </Typography>

                <Typography
                  variant="h5"
                  fontWeight={850}
                  sx={{ mt: 0.1, color: "primary.main" }}
                >
                  {customCount}
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* FEEDBACK */}
      {/* ===================================================== */}

      {error && (
        <Alert
          severity="error"
          onClose={() => setError("")}
          sx={{
            mb: 2,
            borderRadius: 2.5,
          }}
        >
          {error}
        </Alert>
      )}

      {saved && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          onClose={() => setSaved(false)}
          sx={{
            mb: 2,
            borderRadius: 2.5,
          }}
        >
          Library amenities have been saved successfully.
        </Alert>
      )}

      {/* ===================================================== */}
      {/* STANDARD AMENITIES */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
          mb: 3,
        }}
      >
        <Box sx={{ p: { xs: 2, md: 2.75 }, pb: 0 }}>
          <SectionHeading
            icon={<Apartment />}
            title="Available Facilities"
            description={`${standardSelectedCount} standard amenities selected for this library.`}
          />
        </Box>

        <Tabs
          value={selectedCategory}
          onChange={(_event, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: { xs: 1, md: 2 },
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, 0.018),

            "& .MuiTab-root": {
              minHeight: 58,
              textTransform: "none",
              fontWeight: 650,
              color: "text.secondary",
              px: 2,
            },

            "& .Mui-selected": {
              color: "primary.main",
              fontWeight: 800,
            },

            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          {categories.map((category) => (
            <Tab key={category} value={category} label={category} />
          ))}
        </Tabs>

        <Box sx={{ p: { xs: 1.5, md: 2.75 } }}>
          <Grid container spacing={2}>
            {filteredAmenities.map((amenity) => {
              const metadata = getAmenityMetadata(amenity.name);
              const Icon = metadata.icon;
              const selected = selectedAmenityIds.includes(amenity.id);

              return (
                <Grid
                  key={amenity.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    lg: 4,
                  }}
                >
                  <Card
                    elevation={0}
                    onClick={() => handleToggle(amenity.id)}
                    sx={{
                      height: "100%",
                      minHeight: 112,
                      cursor: "pointer",
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: selected
                        ? alpha(theme.palette.primary.main, 0.55)
                        : "divider",
                      background: selected
                        ? `linear-gradient(145deg, ${alpha(
                            theme.palette.primary.main,
                            0.07,
                          )}, ${alpha(theme.palette.primary.main, 0.025)})`
                        : "background.paper",
                      boxShadow: selected
                        ? `0 10px 24px ${alpha(
                            theme.palette.primary.main,
                            0.08,
                          )}`
                        : "none",
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: alpha(theme.palette.primary.main, 0.5),
                        boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
                      },
                    }}
                  >
                    <CardContent
                      sx={{
                        p: 2,
                        "&:last-child": {
                          pb: 2,
                        },
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 2.2,
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0,
                            bgcolor: selected
                              ? alpha(theme.palette.primary.main, 0.12)
                              : alpha(theme.palette.text.primary, 0.045),
                            color: selected ? "primary.main" : "text.secondary",
                          }}
                        >
                          <Icon />
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 0, pt: 0.1 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                            useFlexGap
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={800}
                              sx={{ lineHeight: 1.3 }}
                            >
                              {amenity.name}
                            </Typography>

                            {selected && (
                              <Chip
                                size="small"
                                label="Selected"
                                color="primary"
                                sx={{
                                  height: 22,
                                  fontWeight: 750,
                                  "& .MuiChip-label": {
                                    px: 0.9,
                                  },
                                }}
                              />
                            )}
                          </Stack>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.45,
                              lineHeight: 1.45,
                            }}
                          >
                            {metadata.description}
                          </Typography>
                        </Box>

                        <Checkbox
                          checked={selected}
                          onChange={() => handleToggle(amenity.id)}
                          onClick={(event) => event.stopPropagation()}
                          sx={{
                            p: 0.25,
                            mt: 0.15,
                          }}
                        />
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}

            {filteredCustomAmenities.map((amenity) => (
              <Grid
                key={`custom-${amenity.id}`}
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                }}
              >
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    minHeight: 112,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.secondary.main, 0.28),
                    background: `linear-gradient(145deg, ${alpha(
                      theme.palette.secondary.main,
                      0.07,
                    )}, ${alpha(theme.palette.secondary.main, 0.025)})`,
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: alpha(theme.palette.secondary.main, 0.46),
                      boxShadow: "0 12px 28px rgba(15,23,42,0.07)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      p: 2,
                      "&:last-child": {
                        pb: 2,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="flex-start"
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2.2,
                          display: "grid",
                          placeItems: "center",
                          flexShrink: 0,
                          bgcolor: alpha(theme.palette.secondary.main, 0.12),
                          color: "secondary.main",
                        }}
                      >
                        <Apartment />
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0, pt: 0.1 }}>
                        <Stack
                          direction="row"
                          spacing={0.75}
                          alignItems="center"
                          flexWrap="wrap"
                          useFlexGap
                        >
                          <Typography variant="subtitle1" fontWeight={800}>
                            {amenity.name}
                          </Typography>

                          <Chip
                            size="small"
                            label="Custom"
                            color="secondary"
                            variant="outlined"
                            sx={{
                              height: 22,
                              fontWeight: 750,
                              "& .MuiChip-label": {
                                px: 0.8,
                              },
                            }}
                          />
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.45,
                            lineHeight: 1.45,
                          }}
                        >
                          {amenity.description ||
                            "Custom facility available at the library"}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0.25}>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEditDialog(amenity)}
                          disabled={saving}
                          sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>

                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteCustomAmenity(amenity.id)}
                          disabled={saving}
                          sx={{
                            border: "1px solid",
                            borderColor: alpha(theme.palette.error.main, 0.16),
                            bgcolor: alpha(theme.palette.error.main, 0.03),
                          }}
                        >
                          <DeleteOutlineOutlined fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {(selectedCategory === "All Amenities" ||
              selectedCategory === "Other") && (
              <Grid
                key="add-custom-amenity"
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4,
                }}
              >
                <Card
                  elevation={0}
                  onClick={handleOpenAddDialog}
                  sx={{
                    height: "100%",
                    minHeight: 112,
                    borderRadius: 3,
                    border: "1.5px dashed",
                    borderColor: alpha(theme.palette.primary.main, 0.35),
                    cursor: "pointer",
                    bgcolor: alpha(theme.palette.primary.main, 0.018),
                    transition:
                      "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      borderColor: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      boxShadow: "0 12px 28px rgba(15,23,42,0.06)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 2,
                      "&:last-child": {
                        pb: 2,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(theme.palette.primary.main, 0.09),
                          color: "primary.main",
                        }}
                      >
                        <Add />
                      </Box>

                      <Box>
                        <Typography fontWeight={800} color="primary.main">
                          Add Custom Amenity
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Create a facility specific to your library
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {filteredAmenities.length === 0 &&
            filteredCustomAmenities.length === 0 && (
              <Box
                sx={{
                  py: 7,
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: "50%",
                    mx: "auto",
                    mb: 1.5,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    color: "text.disabled",
                  }}
                >
                  <Apartment />
                </Box>

                <Typography fontWeight={750}>No amenities found</Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  There are no amenities in this category yet.
                </Typography>
              </Box>
            )}
        </Box>
      </Card>

      {/* ===================================================== */}
      {/* CUSTOM AMENITIES MANAGEMENT */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 10px 30px rgba(15,23,42,0.045)",
          mb: 3,
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2, md: 2.75 },
            "&:last-child": {
              pb: { xs: 2, md: 2.75 },
            },
          }}
        >
          <SectionHeading
            icon={<Add />}
            title="Custom Amenities"
            description="Add facilities that are unique to this specific library."
            action={
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={handleOpenAddDialog}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 750,
                  borderRadius: 2.4,
                  px: 2,
                }}
              >
                Add Custom Amenity
              </Button>
            }
          />

          <Divider sx={{ mb: 2.25 }} />

          {customAmenities.length === 0 ? (
            <Box
              onClick={handleOpenAddDialog}
              sx={{
                minHeight: 130,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1.5px dashed",
                borderColor: alpha(theme.palette.primary.main, 0.25),
                borderRadius: 3,
                cursor: "pointer",
                bgcolor: alpha(theme.palette.primary.main, 0.018),
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              <Stack alignItems="center" spacing={1}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2.2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  }}
                >
                  <Add />
                </Box>

                <Typography fontWeight={800} color="primary.main">
                  Add your first custom amenity
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Create a facility that is not included in the standard list.
                </Typography>
              </Stack>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {customAmenities.map((amenity) => (
                <Grid
                  key={amenity.id}
                  size={{
                    xs: 12,
                    sm: 6,
                    md: 4,
                  }}
                >
                  <Box
                    sx={{
                      minHeight: 94,
                      p: 1.75,
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      bgcolor: "background.paper",
                      transition:
                        "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 24px rgba(15,23,42,0.06)",
                        borderColor: alpha(theme.palette.primary.main, 0.25),
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ minWidth: 0 }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2.2,
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(theme.palette.secondary.main, 0.1),
                          color: "secondary.main",
                          flexShrink: 0,
                        }}
                      >
                        <Apartment />
                      </Box>

                      <Box sx={{ minWidth: 0 }}>
                        <Typography fontWeight={800} noWrap>
                          {amenity.name}
                        </Typography>

                        {amenity.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: "block", mt: 0.25 }}
                          >
                            {amenity.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack direction="row" sx={{ ml: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(amenity)}
                        disabled={saving}
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteCustomAmenity(amenity.id)}
                        disabled={saving}
                      >
                        <DeleteOutlineOutlined fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* PREMIUM ACTION BAR */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          position: { md: "sticky" },
          bottom: { md: 16 },
          zIndex: 5,
          borderRadius: 3.5,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: alpha(theme.palette.background.paper, 0.96),
          backdropFilter: "blur(14px)",
          boxShadow: "0 14px 40px rgba(15,23,42,0.10)",
        }}
      >
        <CardContent
          sx={{
            p: 1.5,
            "&:last-child": {
              pb: 1.5,
            },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                variant="text"
                startIcon={<Refresh />}
                onClick={handleReset}
                disabled={loading || saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              >
                Reset changes
              </Button>

              <Chip
                size="small"
                label={`${selectedCount} selected`}
                sx={{ fontWeight: 700 }}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}>
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  minWidth: 110,
                  borderRadius: 2.3,
                }}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                startIcon={
                  saving ? (
                    <CircularProgress size={18} color="inherit" />
                  ) : (
                    <Save />
                  )
                }
                onClick={handleSave}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 800,
                  minWidth: 180,
                  borderRadius: 2.3,
                  boxShadow: `0 8px 20px ${alpha(
                    theme.palette.primary.main,
                    0.22,
                  )}`,
                }}
              >
                {saving ? "Saving..." : "Save Amenities"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* CUSTOM AMENITY DIALOG */}
      {/* ===================================================== */}

      <Dialog
        open={dialogOpen}
        onClose={saving ? undefined : handleCloseDialog}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              boxShadow: "0 24px 70px rgba(15,23,42,0.18)",
            },
          },
        }}
      >
        <DialogTitle sx={{ px: 3, pt: 3, pb: 1.25 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2.2,
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                color: "primary.main",
              }}
            >
              {editingCustomAmenity ? <Edit /> : <Add />}
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={800}>
                {editingCustomAmenity
                  ? "Edit Custom Amenity"
                  : "Add Custom Amenity"}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {editingCustomAmenity
                  ? "Update the facility information shown to students."
                  : "Add a facility that is unique to your library."}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ px: 3 }}>
          <Stack spacing={2} mt={1.5}>
            <TextField
              fullWidth
              label="Amenity Name"
              placeholder="e.g. Study Lamp"
              value={customAmenity.name}
              onChange={(event) =>
                setCustomAmenity((previous) => ({
                  ...previous,
                  name: event.target.value,
                }))
              }
              inputProps={{
                maxLength: 100,
              }}
              autoFocus
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              placeholder="Describe this facility"
              value={customAmenity.description}
              onChange={(event) =>
                setCustomAmenity((previous) => ({
                  ...previous,
                  description: event.target.value,
                }))
              }
              inputProps={{
                maxLength: 500,
              }}
              helperText={`${customAmenity.description.length}/500`}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5 }}>
          <Button
            onClick={handleCloseDialog}
            disabled={saving}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2.2,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSaveCustomAmenity}
            disabled={saving || !customAmenity.name.trim()}
            startIcon={
              saving ? (
                <CircularProgress size={17} color="inherit" />
              ) : undefined
            }
            sx={{
              textTransform: "none",
              fontWeight: 800,
              borderRadius: 2.2,
              minWidth: 150,
            }}
          >
            {saving
              ? "Saving..."
              : editingCustomAmenity
                ? "Update Amenity"
                : "Add Amenity"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Amenities;
