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
  Wifi,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
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
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import libraryApi from "../../api/libraryApi";

// ============================================================
// AMENITY UI METADATA
// ============================================================
//
// Your backend AmenityResponse contains:
//
// {
//     id: Long,
//     name: String
// }
//
// Therefore description, icon and category remain frontend
// presentation metadata for now.
//
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
// COMPONENT
// ============================================================

function Amenities() {
  // ========================================================
  // LIBRARY
  // ========================================================

  const [library, setLibrary] = useState(null);

  // ========================================================
  // STANDARD AMENITIES
  // ========================================================

  const [amenities, setAmenities] = useState([]);

  // ========================================================
  // SELECTED STANDARD AMENITY IDS
  // ========================================================

  const [selectedAmenityIds, setSelectedAmenityIds] = useState([]);

  // ========================================================
  // CUSTOM AMENITIES
  // ========================================================

  const [customAmenities, setCustomAmenities] = useState([]);

  // ========================================================
  // PAGE STATE
  // ========================================================

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [saved, setSaved] = useState(false);

  // ========================================================
  // CATEGORY
  // ========================================================

  const [selectedCategory, setSelectedCategory] = useState("All Amenities");

  // ========================================================
  // CUSTOM AMENITY DIALOG
  // ========================================================

  const [dialogOpen, setDialogOpen] = useState(false);

  const [editingCustomAmenity, setEditingCustomAmenity] = useState(null);

  const [customAmenity, setCustomAmenity] = useState({
    name: "",
    description: "",
  });

  // ========================================================
  // CURRENT LIBRARY NAME
  // ========================================================

  const libraryName = library?.name || library?.libraryName || "your library";

  // ========================================================
  // LOAD EVERYTHING
  // ========================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSaved(false);

      // ------------------------------------------------
      // STEP 1
      // Get owner's libraries
      // ------------------------------------------------

      const libraries = await libraryApi.getMyLibraries();

      if (!Array.isArray(libraries) || libraries.length === 0) {
        setLibrary(null);
        setAmenities([]);
        setSelectedAmenityIds([]);
        setCustomAmenities([]);

        return;
      }

      // ------------------------------------------------
      // Current library
      // ------------------------------------------------

      const currentLibrary = libraries[0];

      setLibrary(currentLibrary);

      // ------------------------------------------------
      // STEP 2
      // Load:
      //
      // 1. Master amenities
      // 2. Library selected amenities
      // 3. Custom amenities
      // ------------------------------------------------

      const [masterAmenities, libraryAmenities, libraryCustomAmenities] =
        await Promise.all([
          libraryApi.getAllAmenities(),

          libraryApi.getLibraryAmenities(currentLibrary.id),

          libraryApi.getCustomAmenities(currentLibrary.id),
        ]);

      // ------------------------------------------------
      // MASTER AMENITIES
      // ------------------------------------------------

      const normalizedMasterAmenities = Array.isArray(masterAmenities)
        ? masterAmenities
        : [];

      setAmenities(normalizedMasterAmenities);

      // ------------------------------------------------
      // SELECTED AMENITIES
      //
      // Backend response:
      //
      // [
      //     {
      //         id: 1,
      //         name: "Wi-Fi"
      //     }
      // ]
      // ------------------------------------------------

      const normalizedLibraryAmenities = Array.isArray(libraryAmenities)
        ? libraryAmenities
        : [];

      const selectedIds = normalizedLibraryAmenities
        .map((amenity) => amenity.id)
        .filter((id) => id !== null && id !== undefined);

      setSelectedAmenityIds(selectedIds);

      // ------------------------------------------------
      // CUSTOM AMENITIES
      // ------------------------------------------------

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

  // ========================================================
  // INITIAL LOAD
  // ========================================================

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ========================================================
  // SELECTED COUNT
  // ========================================================

  const selectedCount = useMemo(() => {
    return selectedAmenityIds.length + customAmenities.length;
  }, [selectedAmenityIds, customAmenities]);

  // ========================================================
  // FILTER STANDARD AMENITIES BY CATEGORY
  // ========================================================

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

  // ========================================================
  // TOGGLE STANDARD AMENITY
  // ========================================================

  const handleToggle = (amenityId) => {
    setSelectedAmenityIds((previous) => {
      if (previous.includes(amenityId)) {
        return previous.filter((id) => id !== amenityId);
      }

      return [...previous, amenityId];
    });

    setSaved(false);
  };

  // ========================================================
  // SAVE STANDARD AMENITIES
  // ========================================================

  const handleSave = async () => {
    if (!library?.id) {
      setError("No library is associated with your account.");

      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      // ------------------------------------------------
      // Backend expects:
      //
      // {
      //     "amenityIds": [1, 2, 3]
      // }
      // ------------------------------------------------

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

  // ========================================================
  // RESET / RELOAD SAVED STATE
  // ========================================================

  const handleReset = async () => {
    await loadData();
  };

  // ========================================================
  // CANCEL
  // ========================================================

  const handleCancel = async () => {
    await loadData();
  };

  // ========================================================
  // OPEN ADD CUSTOM AMENITY
  // ========================================================

  const handleOpenAddDialog = () => {
    setEditingCustomAmenity(null);

    setCustomAmenity({
      name: "",
      description: "",
    });

    setDialogOpen(true);
  };

  // ========================================================
  // OPEN EDIT CUSTOM AMENITY
  // ========================================================

  const handleOpenEditDialog = (amenity) => {
    setEditingCustomAmenity(amenity);

    setCustomAmenity({
      name: amenity.name || "",
      description: amenity.description || "",
    });

    setDialogOpen(true);
  };

  // ========================================================
  // CLOSE CUSTOM AMENITY DIALOG
  // ========================================================

  const handleCloseDialog = () => {
    setDialogOpen(false);

    setEditingCustomAmenity(null);

    setCustomAmenity({
      name: "",
      description: "",
    });
  };

  // ========================================================
  // CREATE / UPDATE CUSTOM AMENITY
  // ========================================================

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

      // =============================================
      // UPDATE
      // =============================================

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
      }

      // =============================================
      // CREATE
      // =============================================
      else {
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

  // ========================================================
  // DELETE CUSTOM AMENITY
  // ========================================================

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

  // ========================================================
  // LOADING STATE
  // ========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 420,
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

  // ========================================================
  // NO LIBRARY
  // ========================================================

  if (!library) {
    return (
      <Alert severity="warning">
        No library is associated with your account.
      </Alert>
    );
  }

  // ========================================================
  // PAGE
  // ========================================================

  return (
    <Box>
      {/* =================================================
                BREADCRUMB
            ================================================= */}

      <Typography
        variant="body2"
        sx={{
          color: "#64748B",
          mb: 1.5,
        }}
      >
        Dashboard
        {"  >  "}
        Library Profile
        {"  >  "}
        <Box
          component="span"
          sx={{
            color: "#1D4ED8",
            fontWeight: 600,
          }}
        >
          Amenities
        </Box>
      </Typography>

      {/* =================================================
                HEADER
            ================================================= */}

      <Stack
        direction={{
          xs: "column",
          lg: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          lg: "center",
        }}
        spacing={3}
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{
              color: "#111B4B",
              letterSpacing: "-0.02em",
            }}
          >
            Library Amenities
          </Typography>

          <Typography variant="body1" color="text.secondary" mt={0.5}>
            Select the facilities available to members at{" "}
            <strong>{libraryName}</strong>.
          </Typography>
        </Box>

        {/* =================================================
                    SELECTED SUMMARY
                ================================================= */}

        <Card
          sx={{
            minWidth: {
              xs: "100%",
              sm: 300,
            },
            borderRadius: 2,
            background: "linear-gradient(135deg, #ECFDF5 0%, #F0FDF4 100%)",
            border: "1px solid #BBF7D0",
            boxShadow: "none",
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
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  backgroundColor: "#10B981",
                  flexShrink: 0,
                }}
              >
                <CheckCircle />
              </Box>

              <Box>
                <Typography
                  fontWeight={800}
                  sx={{
                    color: "#166534",
                  }}
                >
                  {selectedCount} Amenities Selected
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "#166534",
                    mt: 0.25,
                  }}
                >
                  These facilities will be shown to members on the public page.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* =================================================
                ERROR
            ================================================= */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* =================================================
                SUCCESS
            ================================================= */}

      {saved && (
        <Alert
          severity="success"
          sx={{
            mb: 2,
            borderRadius: 2,
          }}
          onClose={() => setSaved(false)}
        >
          Library amenities have been saved successfully.
        </Alert>
      )}

      {/* =================================================
                CATEGORY TABS + STANDARD AMENITIES
            ================================================= */}

      <Card
        sx={{
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
          border: "1px solid #E2E8F0",
        }}
      >
        {/* =================================================
                    TABS
                ================================================= */}

        <Tabs
          value={selectedCategory}
          onChange={(event, value) => setSelectedCategory(value)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 1.5,
            borderBottom: "1px solid #E2E8F0",

            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 500,
              minHeight: 56,
              color: "#334155",
            },

            "& .Mui-selected": {
              color: "#1565FF",
              fontWeight: 700,
            },

            "& .MuiTabs-indicator": {
              height: 3,
            },
          }}
        >
          {categories.map((category) => (
            <Tab key={category} value={category} label={category} />
          ))}
        </Tabs>

        {/* =================================================
                    AMENITY GRID
                ================================================= */}

        <Box
          sx={{
            p: {
              xs: 1.5,
              md: 2.5,
            },
          }}
        >
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
                    variant="outlined"
                    onClick={() => handleToggle(amenity.id)}
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      borderRadius: 2,

                      borderColor: selected ? "#60A5FA" : "#E2E8F0",

                      backgroundColor: selected ? "#F4F8FF" : "#FFFFFF",

                      transition: "all 0.2s ease",

                      "&:hover": {
                        borderColor: "#3B82F6",
                        boxShadow: "0 4px 14px rgba(37, 99, 235, 0.08)",
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
                        {/* ICON */}

                        <Box
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,

                            backgroundColor: selected ? "#E0EDFF" : "#F1F5F9",

                            color: selected ? "#1565FF" : "#475569",
                          }}
                        >
                          <Icon />
                        </Box>

                        {/* TEXT */}

                        <Box
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            pt: 0.25,
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            fontWeight={750}
                            sx={{
                              color: "#111B4B",
                            }}
                          >
                            {amenity.name}
                          </Typography>

                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.25,
                              lineHeight: 1.4,
                            }}
                          >
                            {metadata.description}
                          </Typography>
                        </Box>

                        {/* CHECKBOX */}

                        <Checkbox
                          checked={selected}
                          onChange={() => handleToggle(amenity.id)}
                          onClick={(event) => event.stopPropagation()}
                          sx={{
                            p: 0.5,
                            mt: 0.25,
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
                  variant="outlined"
                  sx={{
                    height: "100%",
                    borderRadius: 2,
                    borderColor: "#A78BFA",
                    backgroundColor: "#FAF5FF",
                    transition: "all 0.2s ease",

                    "&:hover": {
                      borderColor: "#8B5CF6",
                      boxShadow: "0 4px 14px rgba(124, 58, 237, 0.08)",
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
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          backgroundColor: "#EDE9FE",
                          color: "#7C3AED",
                        }}
                      >
                        <Apartment />
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          pt: 0.25,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography
                            variant="subtitle1"
                            fontWeight={750}
                            sx={{
                              color: "#111B4B",
                            }}
                          >
                            {amenity.name}
                          </Typography>

                          <Box
                            component="span"
                            sx={{
                              px: 0.8,
                              py: 0.2,
                              borderRadius: 1,
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              color: "#6D28D9",
                              backgroundColor: "#EDE9FE",
                            }}
                          >
                            CUSTOM
                          </Box>
                        </Stack>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                            lineHeight: 1.4,
                          }}
                        >
                          {amenity.description ||
                            "Custom facility available at the library"}
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={0}>
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
                  variant="outlined"
                  onClick={handleOpenAddDialog}
                  sx={{
                    height: "100%",
                    minHeight: 94,
                    borderRadius: 2,
                    borderStyle: "dashed",
                    borderWidth: 1.5,
                    borderColor: "#A5B4FC",
                    cursor: "pointer",
                    backgroundColor: "#FAFAFF",
                    transition: "all 0.2s ease",

                    "&:hover": {
                      borderColor: "primary.main",
                      backgroundColor: "#F5F3FF",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 14px rgba(79, 70, 229, 0.08)",
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",

                      "&:last-child": {
                        pb: 2,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#EEF2FF",
                          color: "primary.main",
                        }}
                      >
                        <Add />
                      </Box>

                      <Box>
                        <Typography fontWeight={700} color="primary.main">
                          Add Custom Amenity
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                          Create a facility for your library
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {/* =================================================
                        EMPTY CATEGORY
                    ================================================= */}

          {filteredAmenities.length === 0 &&
            filteredCustomAmenities.length === 0 && (
              <Box
                sx={{
                  py: 6,
                  textAlign: "center",
                }}
              >
                <Typography color="text.secondary">
                  No amenities found in this category.
                </Typography>
              </Box>
            )}
        </Box>
      </Card>

      {/* =================================================
                CUSTOM AMENITIES
            ================================================= */}

      <Card
        sx={{
          mt: 2,
          borderRadius: 2,
          border: "1px solid #E2E8F0",
          boxShadow: "0 2px 10px rgba(15, 23, 42, 0.04)",
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2,
              md: 2.5,
            },
          }}
        >
          {/* =================================================
                        HEADER
                    ================================================= */}

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
              {/* <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  color: "#111B4B",
                }}
              >
                Custom Amenities
              </Typography> */}

              <Typography variant="body2" color="text.secondary" mt={0.5}>
                Add any additional facilities specific to your library.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={handleOpenAddDialog}
              disabled={saving}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            >
              Add Custom Amenity
            </Button>
          </Stack>

          <Divider
            sx={{
              mb: 2,
            }}
          />

          {/* =================================================
                        EMPTY CUSTOM AMENITIES
                    ================================================= */}

          {customAmenities.length === 0 ? (
            <Box
              onClick={handleOpenAddDialog}
              sx={{
                minHeight: 100,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px dashed #CBD5E1",
                borderRadius: 2,
                cursor: "pointer",
                backgroundColor: "#FAFAFF",

                "&:hover": {
                  borderColor: "#8B5CF6",
                  backgroundColor: "#F8F5FF",
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Add
                  sx={{
                    color: "#7C3AED",
                  }}
                />

                <Typography
                  fontWeight={600}
                  sx={{
                    color: "#6D28D9",
                  }}
                >
                  Add Custom Amenity
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
                      minHeight: 82,
                      p: 1.75,
                      border: "1px solid #E2E8F0",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#FAFAFF",
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "#EDE9FE",
                          color: "#7C3AED",
                          flexShrink: 0,
                        }}
                      >
                        <Apartment />
                      </Box>

                      <Box
                        sx={{
                          minWidth: 0,
                        }}
                      >
                        <Typography fontWeight={700} noWrap>
                          {amenity.name}
                        </Typography>

                        {amenity.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {amenity.description}
                          </Typography>
                        )}
                      </Box>
                    </Stack>

                    <Stack
                      direction="row"
                      sx={{
                        ml: 1,
                      }}
                    >
                      {/* EDIT */}

                      <IconButton
                        size="small"
                        onClick={() => handleOpenEditDialog(amenity)}
                        disabled={saving}
                      >
                        <Edit fontSize="small" />
                      </IconButton>

                      {/* DELETE */}

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

      {/* =================================================
                BOTTOM ACTION BAR
            ================================================= */}

      <Card
        sx={{
          mt: 2,
          borderRadius: 2,
          border: "1px solid #E2E8F0",
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
            direction={{
              xs: "column",
              md: "row",
            }}
            justifyContent="space-between"
            alignItems={{
              xs: "stretch",
              md: "center",
            }}
            spacing={2}
          >
            {/* RESET */}

            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={handleReset}
              disabled={loading || saving}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Reset to Default
            </Button>

            {/* RIGHT ACTIONS */}

            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={1.5}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={saving}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  minWidth: 110,
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
                  fontWeight: 700,
                  minWidth: 170,
                }}
              >
                {saving ? "Saving..." : "Save Amenities"}
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* =================================================
                CUSTOM AMENITY DIALOG
            ================================================= */}

      <Dialog
        open={dialogOpen}
        onClose={saving ? undefined : handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
          }}
        >
          {editingCustomAmenity ? "Edit Custom Amenity" : "Add Custom Amenity"}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={1}>
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
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2.5,
          }}
        >
          <Button onClick={handleCloseDialog} disabled={saving}>
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
