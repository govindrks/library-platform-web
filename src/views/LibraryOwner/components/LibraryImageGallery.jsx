import { useEffect, useMemo, useRef, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AutoAwesomeRounded,
  CheckCircleRounded,
  CloseRounded,
  CloudUploadRounded,
  CollectionsRounded,
  DeleteOutlineRounded,
  ImageRounded,
  PhotoLibraryRounded,
  RefreshRounded,
  StarRounded,
} from "@mui/icons-material";

import libraryImageApi from "../../../api/libraryImageApi";
import getImageUrl from "../../../utility/imageUrl";

const IMAGE_TYPES = [
  {
    value: "FRONT",
    label: "Front / Exterior",
  },
  {
    value: "READING_HALL",
    label: "Reading Hall",
  },
  {
    value: "CABIN",
    label: "Cabin / Private Study",
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

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024;

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.response?.data?.detail ||
  error?.message ||
  fallback;

const formatFileSize = (bytes) => {
  const value = Number(bytes || 0);

  if (value <= 0) {
    return "0 KB";
  }

  if (value < 1024 * 1024) {
    return `${Math.max(1, Math.round(value / 1024))} KB`;
  }

  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
};

function LibraryImageGallery({ libraryId, onCoverChange }) {
  const fileInputRef = useRef(null);

  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [imageType, setImageType] = useState("READING_HALL");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [coverUpdating, setCoverUpdating] = useState(null);
  const [deletingImage, setDeletingImage] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteImage, setPendingDeleteImage] = useState(null);

  const coverImage = useMemo(
    () => images.find((image) => image?.cover === true) || null,
    [images],
  );

  const imageTypeCounts = useMemo(() => {
    const counts = {};

    IMAGE_TYPES.forEach((type) => {
      counts[type.value] = 0;
    });

    images.forEach((image) => {
      const type = image?.imageType;

      if (type) {
        counts[type] = (counts[type] || 0) + 1;
      }
    });

    return counts;
  }, [images]);

  useEffect(() => {
    const nextPreviewUrls = selectedFiles.map((file) =>
      URL.createObjectURL(file),
    );

    setPreviewUrls(nextPreviewUrls);

    return () => {
      nextPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [selectedFiles]);

  const loadImages = async () => {
    if (!libraryId) {
      setImages([]);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = await libraryImageApi.getLibraryImages(libraryId);

      setImages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load library images:", err);

      setError(getErrorMessage(err, "Failed to load library images."));

      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [libraryId]);

  const normalizeFiles = (fileList) => {
    const files = Array.from(fileList || []);

    if (!files.length) {
      return [];
    }

    if (files.length > MAX_FILES) {
      setError(`You can upload up to ${MAX_FILES} images at a time.`);
      return [];
    }

    const invalidType = files.find(
      (file) => !String(file?.type || "").startsWith("image/"),
    );

    if (invalidType) {
      setError(`${invalidType.name} is not a supported image file.`);
      return [];
    }

    const oversized = files.find(
      (file) => Number(file?.size || 0) > MAX_FILE_SIZE_BYTES,
    );

    if (oversized) {
      setError(`${oversized.name} is larger than 8 MB.`);
      return [];
    }

    return files;
  };

  const applySelectedFiles = (fileList) => {
    const files = normalizeFiles(fileList);

    if (!files.length) {
      return;
    }

    setSelectedFiles(files);
    setError("");
    setSuccess("");
  };

  const handleFileChange = (event) => {
    applySelectedFiles(event.target.files);
  };

  const clearSelectedFiles = () => {
    setSelectedFiles([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragActive(false);
    applySelectedFiles(event.dataTransfer?.files);
  };

  const handleUpload = async () => {
    if (!libraryId) {
      setError("Library ID is not available.");
      return;
    }

    if (!selectedFiles.length) {
      setError("Please select at least one image.");
      return;
    }

    try {
      setUploading(true);
      setError("");
      setSuccess("");

      for (const file of selectedFiles) {
        await libraryImageApi.uploadImage(libraryId, file, imageType);
      }

      setSuccess(
        selectedFiles.length === 1
          ? "Image uploaded successfully."
          : `${selectedFiles.length} images uploaded successfully.`,
      );

      clearSelectedFiles();
      await loadImages();
    } catch (err) {
      console.error("Image upload failed:", err);

      setError(getErrorMessage(err, "Failed to upload image."));
    } finally {
      setUploading(false);
    }
  };

  const requestDelete = (image) => {
    setPendingDeleteImage(image);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    const imageId = pendingDeleteImage?.id;

    if (!imageId) {
      return;
    }

    try {
      setDeletingImage(imageId);
      setError("");
      setSuccess("");

      await libraryImageApi.deleteImage(imageId);

      setSuccess("Image deleted successfully.");

      setDeleteDialogOpen(false);
      setPendingDeleteImage(null);

      await loadImages();

      if (onCoverChange) {
        await onCoverChange();
      }
    } catch (err) {
      console.error("Failed to delete image:", err);

      setError(getErrorMessage(err, "Failed to delete image."));
    } finally {
      setDeletingImage(null);
    }
  };

  const handleSetCover = async (imageId) => {
    if (!libraryId) {
      setError("Library ID is not available.");
      return;
    }

    try {
      setCoverUpdating(imageId);
      setError("");
      setSuccess("");

      await libraryImageApi.setCoverImage(libraryId, imageId);

      await loadImages();

      if (onCoverChange) {
        await onCoverChange();
      }

      setSuccess("Cover image updated successfully.");
    } catch (err) {
      console.error("Failed to set cover image:", err);

      setError(getErrorMessage(err, "Failed to set cover image."));
    } finally {
      setCoverUpdating(null);
    }
  };

  const selectedTypeLabel =
    IMAGE_TYPES.find((type) => type.value === imageType)?.label ||
    "Library image";

  return (
    <Box>
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "rgba(79,70,229,0.12)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            px: {
              xs: 2.5,
              md: 3.5,
            },
            py: {
              xs: 2.5,
              md: 3,
            },
            position: "relative",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, rgba(79,70,229,0.11), rgba(255,255,255,1) 58%, rgba(99,102,241,0.05))",
            "&::after": {
              content: '\"\"',
              position: "absolute",
              width: 230,
              height: 230,
              borderRadius: "50%",
              right: -80,
              top: -120,
              bgcolor: "rgba(79,70,229,0.06)",
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
            spacing={2.5}
            sx={{
              position: "relative",
              zIndex: 1,
            }}
          >
            <Stack direction="row" spacing={1.8} alignItems="center">
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  minWidth: 56,
                  borderRadius: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 10px 26px rgba(79,70,229,0.24)",
                }}
              >
                <PhotoLibraryRounded />
              </Box>

              <Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  sx={{
                    letterSpacing: "-0.02em",
                  }}
                >
                  Library Image Gallery
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  Build a polished public gallery and choose the image visitors
                  see first.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              useFlexGap
              flexWrap="wrap"
            >
              <Chip
                icon={<CollectionsRounded />}
                label={`${images.length} ${
                  images.length === 1 ? "image" : "images"
                }`}
                variant="outlined"
                sx={{
                  bgcolor: "background.paper",
                  fontWeight: 700,
                }}
              />

              <Chip
                icon={<StarRounded />}
                label={coverImage ? "Cover selected" : "No cover selected"}
                color={coverImage ? "primary" : "default"}
                variant="outlined"
                sx={{
                  bgcolor: "background.paper",
                  fontWeight: 700,
                }}
              />

              <Tooltip title="Refresh images">
                <span>
                  <IconButton
                    onClick={loadImages}
                    disabled={loading || !libraryId}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: "background.paper",
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <RefreshRounded />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>

        <CardContent
          sx={{
            p: {
              xs: 2.5,
              md: 3.5,
            },
            "&:last-child": {
              pb: {
                xs: 2.5,
                md: 3.5,
              },
            },
          }}
        >
          <Stack spacing={3}>
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ borderRadius: 2.5 }}
              >
                {error}
              </Alert>
            )}

            {success && (
              <Alert
                severity="success"
                icon={<CheckCircleRounded />}
                onClose={() => setSuccess("")}
                sx={{ borderRadius: 2.5 }}
              >
                {success}
              </Alert>
            )}

            <Paper
              elevation={0}
              sx={{
                p: {
                  xs: 2,
                  md: 2.5,
                },
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                bgcolor: "rgba(248,250,252,0.72)",
              }}
            >
              <Stack spacing={2.2}>
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  justifyContent="space-between"
                  spacing={1.5}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                      Add gallery images
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.3 }}
                    >
                      Upload JPG, PNG, WEBP or other browser-supported images.
                      Up to 8 MB each.
                    </Typography>
                  </Box>

                  <FormControl
                    size="small"
                    sx={{
                      minWidth: {
                        xs: "100%",
                        sm: 220,
                      },
                    }}
                  >
                    <InputLabel>Image Type</InputLabel>

                    <Select
                      value={imageType}
                      label="Image Type"
                      onChange={(event) => setImageType(event.target.value)}
                    >
                      {IMAGE_TYPES.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Box
                  onDragEnter={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(event) => {
                    event.preventDefault();

                    if (event.currentTarget === event.target) {
                      setDragActive(false);
                    }
                  }}
                  onDrop={handleDrop}
                  sx={{
                    border: "1.5px dashed",
                    borderColor: dragActive ? "primary.main" : "divider",
                    borderRadius: 3,
                    px: 2.5,
                    py: 3.5,
                    textAlign: "center",
                    bgcolor: dragActive
                      ? "rgba(79,70,229,0.055)"
                      : "background.paper",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      mx: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(79,70,229,0.08)",
                      color: "primary.main",
                    }}
                  >
                    <CloudUploadRounded />
                  </Box>

                  <Typography fontWeight={800} sx={{ mt: 1.5 }}>
                    Drop images here or browse from your device
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Selected category: {selectedTypeLabel}
                  </Typography>

                  <Button
                    component="label"
                    variant="outlined"
                    startIcon={<ImageRounded />}
                    disabled={uploading}
                    sx={{
                      mt: 2,
                      borderRadius: 2.5,
                      textTransform: "none",
                      fontWeight: 700,
                    }}
                  >
                    Choose Images
                    <input
                      ref={fileInputRef}
                      hidden
                      multiple
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                </Box>

                {selectedFiles.length > 0 && (
                  <Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={2}
                      sx={{ mb: 1.5 }}
                    >
                      <Box>
                        <Typography fontWeight={800}>
                          Ready to upload
                        </Typography>

                        <Typography variant="caption" color="text.secondary">
                          {selectedFiles.length} selected
                        </Typography>
                      </Box>

                      <Button
                        size="small"
                        color="inherit"
                        onClick={clearSelectedFiles}
                        disabled={uploading}
                        sx={{
                          textTransform: "none",
                          fontWeight: 700,
                        }}
                      >
                        Clear
                      </Button>
                    </Stack>

                    <Grid container spacing={1.5}>
                      {selectedFiles.map((file, index) => (
                        <Grid
                          key={`${file.name}-${file.lastModified}-${index}`}
                          size={{
                            xs: 6,
                            sm: 4,
                            md: 3,
                          }}
                        >
                          <Card
                            elevation={0}
                            sx={{
                              height: "100%",
                              border: "1px solid",
                              borderColor: "divider",
                              borderRadius: 2.5,
                              overflow: "hidden",
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="105"
                              image={previewUrls[index]}
                              alt={file.name}
                              sx={{
                                objectFit: "cover",
                              }}
                            />

                            <Box sx={{ p: 1.2 }}>
                              <Typography
                                variant="caption"
                                fontWeight={700}
                                noWrap
                                display="block"
                              >
                                {file.name}
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatFileSize(file.size)}
                              </Typography>
                            </Box>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>

                    <Button
                      fullWidth
                      variant="contained"
                      disableElevation
                      onClick={handleUpload}
                      disabled={uploading}
                      startIcon={
                        uploading ? (
                          <CircularProgress size={18} color="inherit" />
                        ) : (
                          <CloudUploadRounded />
                        )
                      }
                      sx={{
                        mt: 2,
                        minHeight: 46,
                        borderRadius: 2.5,
                        textTransform: "none",
                        fontWeight: 800,
                      }}
                    >
                      {uploading
                        ? `Uploading ${selectedFiles.length} ${
                            selectedFiles.length === 1 ? "image" : "images"
                          }...`
                        : `Upload ${selectedFiles.length} ${
                            selectedFiles.length === 1 ? "Image" : "Images"
                          }`}
                    </Button>

                    {uploading && (
                      <LinearProgress
                        sx={{
                          mt: 1.2,
                          borderRadius: 999,
                        }}
                      />
                    )}
                  </Box>
                )}
              </Stack>
            </Paper>

            <Box>
              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                justifyContent="space-between"
                alignItems={{
                  xs: "stretch",
                  sm: "center",
                }}
                spacing={1.5}
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Uploaded Images
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.3 }}
                  >
                    The cover image is used as the primary visual on the public
                    library profile.
                  </Typography>
                </Box>

                <Stack direction="row" spacing={0.8} useFlexGap flexWrap="wrap">
                  {IMAGE_TYPES.filter(
                    (type) => Number(imageTypeCounts[type.value] || 0) > 0,
                  ).map((type) => (
                    <Chip
                      key={type.value}
                      size="small"
                      label={`${type.label} · ${imageTypeCounts[type.value]}`}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </Stack>

              {loading ? (
                <Grid container spacing={2}>
                  {[1, 2, 3].map((item) => (
                    <Grid
                      key={item}
                      size={{
                        xs: 12,
                        sm: 6,
                        lg: 4,
                      }}
                    >
                      <Skeleton
                        variant="rounded"
                        height={310}
                        sx={{ borderRadius: 3 }}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : images.length === 0 ? (
                <Paper
                  elevation={0}
                  sx={{
                    py: 6,
                    px: 2,
                    textAlign: "center",
                    border: "1px dashed",
                    borderColor: "divider",
                    borderRadius: 3,
                  }}
                >
                  <Box
                    sx={{
                      width: 58,
                      height: 58,
                      borderRadius: 3,
                      mx: "auto",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "rgba(15,23,42,0.05)",
                      color: "text.disabled",
                    }}
                  >
                    <CollectionsRounded />
                  </Box>

                  <Typography variant="h6" fontWeight={800} sx={{ mt: 1.5 }}>
                    No library images yet
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.6,
                      maxWidth: 470,
                      mx: "auto",
                    }}
                  >
                    Upload photos of the exterior, reading hall, cabins and
                    amenities to make the public profile more trustworthy and
                    engaging.
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {images.map((image) => {
                    const isCover = image?.cover === true;

                    const isUpdatingCover = coverUpdating === image.id;

                    const isDeleting = deletingImage === image.id;

                    const imageTypeLabel =
                      IMAGE_TYPES.find((type) => type.value === image.imageType)
                        ?.label ||
                      image.imageType ||
                      "Library image";

                    return (
                      <Grid
                        key={image.id}
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
                            border: "1px solid",
                            borderWidth: isCover ? 2 : 1,
                            borderColor: isCover ? "primary.main" : "divider",
                            borderRadius: 3,
                            overflow: "hidden",
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateY(-3px)",
                              boxShadow: "0 14px 32px rgba(15,23,42,0.09)",
                            },
                          }}
                        >
                          <Box
                            sx={{
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            <CardMedia
                              component="img"
                              height="220"
                              image={getImageUrl(image.imageUrl)}
                              alt={imageTypeLabel}
                              sx={{
                                objectFit: "cover",
                                transition: "transform 0.3s ease",
                              }}
                            />

                            <Box
                              sx={{
                                position: "absolute",
                                inset: 0,
                                background:
                                  "linear-gradient(180deg, transparent 50%, rgba(15,23,42,0.46) 100%)",
                                pointerEvents: "none",
                              }}
                            />

                            <Stack
                              direction="row"
                              spacing={0.8}
                              sx={{
                                position: "absolute",
                                top: 12,
                                left: 12,
                                right: 12,
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <Chip
                                size="small"
                                label={imageTypeLabel}
                                sx={{
                                  bgcolor: "rgba(255,255,255,0.92)",
                                  backdropFilter: "blur(6px)",
                                  fontWeight: 700,
                                }}
                              />

                              {isCover && (
                                <Chip
                                  size="small"
                                  icon={<StarRounded />}
                                  label="Cover"
                                  color="primary"
                                  sx={{
                                    fontWeight: 800,
                                  }}
                                />
                              )}
                            </Stack>

                            {isCover && (
                              <Stack
                                direction="row"
                                spacing={0.8}
                                alignItems="center"
                                sx={{
                                  position: "absolute",
                                  left: 14,
                                  bottom: 12,
                                  color: "common.white",
                                }}
                              >
                                <AutoAwesomeRounded fontSize="small" />

                                <Typography variant="caption" fontWeight={800}>
                                  Primary public image
                                </Typography>
                              </Stack>
                            )}
                          </Box>

                          <CardContent
                            sx={{
                              p: 2,
                              "&:last-child": {
                                pb: 2,
                              },
                            }}
                          >
                            <Stack spacing={1.6}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={1}
                              >
                                <Box
                                  sx={{
                                    minWidth: 0,
                                  }}
                                >
                                  <Typography fontWeight={800}>
                                    {imageTypeLabel}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    Gallery image #{image.id}
                                  </Typography>
                                </Box>

                                <Tooltip title="Delete image">
                                  <span>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      disabled={isDeleting || isUpdatingCover}
                                      onClick={() => requestDelete(image)}
                                    >
                                      {isDeleting ? (
                                        <CircularProgress
                                          size={19}
                                          color="inherit"
                                        />
                                      ) : (
                                        <DeleteOutlineRounded />
                                      )}
                                    </IconButton>
                                  </span>
                                </Tooltip>
                              </Stack>

                              <Button
                                fullWidth
                                size="small"
                                variant={isCover ? "contained" : "outlined"}
                                disableElevation
                                startIcon={
                                  isUpdatingCover ? (
                                    <CircularProgress
                                      size={16}
                                      color="inherit"
                                    />
                                  ) : (
                                    <StarRounded />
                                  )
                                }
                                disabled={
                                  isCover || isUpdatingCover || isDeleting
                                }
                                onClick={() => handleSetCover(image.id)}
                                sx={{
                                  minHeight: 40,
                                  borderRadius: 2.2,
                                  textTransform: "none",
                                  fontWeight: 800,
                                }}
                              >
                                {isCover
                                  ? "Current Cover"
                                  : isUpdatingCover
                                    ? "Updating Cover..."
                                    : "Set as Cover"}
                              </Button>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              )}
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          if (!deletingImage) {
            setDeleteDialogOpen(false);
            setPendingDeleteImage(null);
          }
        }}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: 3.5,
          },
        }}
      >
        <DialogTitle>
          <Stack direction="row" spacing={1.3} alignItems="center">
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "rgba(239,68,68,0.10)",
                color: "error.main",
              }}
            >
              <DeleteOutlineRounded />
            </Box>

            <Box>
              <Typography fontWeight={800}>Delete image?</Typography>

              <Typography variant="body2" color="text.secondary">
                This action cannot be undone.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {pendingDeleteImage?.cover && (
            <Alert
              severity="warning"
              sx={{
                mb: 2,
                borderRadius: 2.5,
              }}
            >
              This is currently the public cover image. The gallery will refresh
              after deletion so the cover state stays synchronized.
            </Alert>
          )}

          <Typography color="text.secondary">
            Remove this image from the library gallery?
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            color="inherit"
            disabled={Boolean(deletingImage)}
            onClick={() => {
              setDeleteDialogOpen(false);
              setPendingDeleteImage(null);
            }}
            sx={{
              textTransform: "none",
              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color="error"
            disableElevation
            disabled={Boolean(deletingImage)}
            onClick={handleDelete}
            startIcon={
              deletingImage ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <DeleteOutlineRounded />
              )
            }
            sx={{
              borderRadius: 2.3,
              textTransform: "none",
              fontWeight: 800,
            }}
          >
            {deletingImage ? "Deleting..." : "Delete Image"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default LibraryImageGallery;
