import { useEffect, useRef, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardMedia,
    Chip,
    CircularProgress,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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


function LibraryImageGallery({
    libraryId,
    onCoverChange,
}) {

    const fileInputRef = useRef(null);


    const [images, setImages] = useState([]);

    const [selectedFiles, setSelectedFiles] = useState([]);

    const [imageType, setImageType] =
        useState("READING_HALL");

    const [loading, setLoading] =
        useState(false);

    const [uploading, setUploading] =
        useState(false);

    const [coverUpdating, setCoverUpdating] =
        useState(null);

    const [deletingImage, setDeletingImage] =
        useState(null);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    // =========================================================
    // LOAD LIBRARY IMAGES
    // =========================================================

    const loadImages = async () => {

        if (!libraryId) {
            return;
        }

        try {

            setLoading(true);
            setError("");

            const data =
                await libraryImageApi.getLibraryImages(
                    libraryId
                );

            setImages(data || []);

        } catch (err) {

            console.error(
                "Failed to load library images:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to load library images."
            );

        } finally {

            setLoading(false);
        }
    };


    useEffect(() => {

        loadImages();

    }, [libraryId]);


    // =========================================================
    // SELECT FILES
    // =========================================================

    const handleFileChange = (event) => {

        const files =
            Array.from(
                event.target.files || []
            );

        setSelectedFiles(files);
        setError("");
        setSuccess("");
    };


    // =========================================================
    // UPLOAD IMAGES
    // =========================================================

    const handleUpload = async () => {

        if (!libraryId) {

            setError(
                "Library ID is not available."
            );

            return;
        }

        if (!selectedFiles.length) {

            setError(
                "Please select at least one image."
            );

            return;
        }

        try {

            setUploading(true);
            setError("");
            setSuccess("");

            for (const file of selectedFiles) {

                await libraryImageApi.uploadImage(
                    libraryId,
                    file,
                    imageType
                );
            }

            setSuccess(
                "Images uploaded successfully."
            );

            setSelectedFiles([]);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            await loadImages();

        } catch (err) {

            console.error(
                "Image upload failed:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to upload image."
            );

        } finally {

            setUploading(false);
        }
    };


    // =========================================================
    // DELETE IMAGE
    // =========================================================

    const handleDelete = async (imageId) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this image?"
            );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingImage(imageId);
            setError("");
            setSuccess("");

            await libraryImageApi.deleteImage(
                imageId
            );

            setSuccess(
                "Image deleted successfully."
            );

            /*
             * Reload the image list so that:
             *
             * - deleted image disappears
             * - cover status is recalculated
             */
            await loadImages();

            /*
             * Tell LibraryProfile to refresh its
             * coverImageUrl as well.
             */
            if (onCoverChange) {
                await onCoverChange();
            }

        } catch (err) {

            console.error(
                "Failed to delete image:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to delete image."
            );

        } finally {

            setDeletingImage(null);
        }
    };


    // =========================================================
    // SET COVER IMAGE
    // =========================================================

    const handleSetCover = async (imageId) => {

        try {

            setCoverUpdating(imageId);
            setError("");
            setSuccess("");

            await libraryImageApi.setCoverImage(
                libraryId,
                imageId
            );

            /*
             * Reload images.
             *
             * Backend now returns:
             *
             * cover: true
             *
             * for the selected image.
             */
            await loadImages();

            /*
             * Refresh LibraryProfile so its
             * coverImageUrl is immediately updated.
             */
            if (onCoverChange) {
                await onCoverChange();
            }

            setSuccess(
                "Cover image updated successfully."
            );

        } catch (err) {

            console.error(
                "Failed to set cover image:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Failed to set cover image."
            );

        } finally {

            setCoverUpdating(null);
        }
    };


    // =========================================================
    // UI
    // =========================================================

    return (
        <Card sx={{ mb: 3 }}>

            <Box sx={{ p: 3 }}>

                {/* =================================================
                    HEADER
                ================================================= */}

                <Typography
                    variant="h6"
                    fontWeight={700}
                    mb={0.5}
                >
                    Library Images
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                >
                    Upload and manage images that visitors
                    can view on your public library profile.
                </Typography>


                {/* =================================================
                    ALERTS
                ================================================= */}

                {error && (
                    <Alert
                        severity="error"
                        sx={{ mb: 2 }}
                        onClose={() => setError("")}
                    >
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert
                        severity="success"
                        sx={{ mb: 2 }}
                        onClose={() => setSuccess("")}
                    >
                        {success}
                    </Alert>
                )}


                {/* =================================================
                    UPLOAD SECTION
                ================================================= */}

                <Card
                    variant="outlined"
                    sx={{
                        p: 2,
                        mb: 3,
                        backgroundColor: "#fafafa",
                    }}
                >

                    <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        mb={2}
                    >
                        Upload Images
                    </Typography>


                    <Stack
                        direction={{
                            xs: "column",
                            md: "row",
                        }}
                        spacing={2}
                        alignItems={{
                            xs: "stretch",
                            md: "center",
                        }}
                    >

                        {/* IMAGE TYPE */}

                        <FormControl
                            size="small"
                            sx={{
                                minWidth: 220,
                            }}
                        >

                            <InputLabel>
                                Image Type
                            </InputLabel>

                            <Select
                                value={imageType}
                                label="Image Type"
                                onChange={(event) =>
                                    setImageType(
                                        event.target.value
                                    )
                                }
                            >

                                {IMAGE_TYPES.map(
                                    (type) => (
                                        <MenuItem
                                            key={type.value}
                                            value={type.value}
                                        >
                                            {type.label}
                                        </MenuItem>
                                    )
                                )}

                            </Select>

                        </FormControl>


                        {/* FILE SELECT */}

                        <Button
                            variant="outlined"
                            component="label"
                            startIcon={
                                <CloudUploadIcon />
                            }
                        >
                            Select Images

                            <input
                                ref={fileInputRef}
                                type="file"
                                hidden
                                multiple
                                accept="image/*"
                                onChange={
                                    handleFileChange
                                }
                            />
                        </Button>


                        {/* UPLOAD */}

                        <Button
                            variant="contained"
                            onClick={handleUpload}
                            disabled={
                                uploading ||
                                !selectedFiles.length
                            }
                            startIcon={
                                uploading ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                ) : (
                                    <CloudUploadIcon />
                                )
                            }
                        >
                            {uploading
                                ? "Uploading..."
                                : "Upload"}
                        </Button>

                    </Stack>


                    {/* SELECTED FILES */}

                    {selectedFiles.length > 0 && (

                        <Box sx={{ mt: 2 }}>

                            <Typography
                                variant="body2"
                                fontWeight={600}
                                mb={1}
                            >
                                Selected Images
                            </Typography>

                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                            >

                                {selectedFiles.map(
                                    (file, index) => (
                                        <Chip
                                            key={`${file.name}-${index}`}
                                            label={file.name}
                                            variant="outlined"
                                        />
                                    )
                                )}

                            </Stack>

                        </Box>
                    )}

                </Card>


                {/* =================================================
                    IMAGE LIST
                ================================================= */}

                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    mb={2}
                >
                    Uploaded Images
                </Typography>


                {loading ? (

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            py: 5,
                        }}
                    >
                        <CircularProgress />
                    </Box>

                ) : images.length === 0 ? (

                    <Box
                        sx={{
                            textAlign: "center",
                            py: 5,
                            border: "1px dashed",
                            borderColor: "divider",
                            borderRadius: 2,
                        }}
                    >

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            No library images uploaded yet.
                        </Typography>

                    </Box>

                ) : (

                    <Grid
                        container
                        spacing={2}
                    >

                        {images.map((image) => {

                            const isCover =
                                image.cover === true;

                            const isUpdatingCover =
                                coverUpdating === image.id;

                            const isDeleting =
                                deletingImage === image.id;

                            const imageTypeLabel =
                                IMAGE_TYPES.find(
                                    (type) =>
                                        type.value ===
                                        image.imageType
                                )?.label ||
                                image.imageType ||
                                "Library image";


                            return (

                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={image.id}
                                >

                                    <Card
                                        variant="outlined"
                                        sx={{
                                            overflow: "hidden",

                                            borderWidth:
                                                isCover
                                                    ? 2
                                                    : 1,

                                            borderColor:
                                                isCover
                                                    ? "primary.main"
                                                    : "divider",
                                        }}
                                    >

                                        {/* =================================================
                                            IMAGE
                                        ================================================= */}

                                        <Box
                                            sx={{
                                                position:
                                                    "relative",
                                            }}
                                        >

                                            <CardMedia
                                                component="img"
                                                height="210"
                                                image={getImageUrl(
                                                    image.imageUrl
                                                )}
                                                alt={
                                                    imageTypeLabel
                                                }
                                                sx={{
                                                    objectFit:
                                                        "cover",
                                                }}
                                            />


                                            {/* COVER BADGE */}

                                            {isCover && (

                                                <Chip
                                                    icon={
                                                        <StarIcon />
                                                    }
                                                    label="Current Cover"
                                                    color="primary"
                                                    size="small"
                                                    sx={{
                                                        position:
                                                            "absolute",
                                                        top: 12,
                                                        left: 12,
                                                        fontWeight:
                                                            700,
                                                    }}
                                                />

                                            )}

                                        </Box>


                                        {/* =================================================
                                            IMAGE INFORMATION
                                        ================================================= */}

                                        <Box sx={{ p: 2 }}>

                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                mb={1.5}
                                            >
                                                {imageTypeLabel}
                                            </Typography>


                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                alignItems="center"
                                            >

                                                {/* SET COVER */}

                                                <Button
                                                    size="small"
                                                    variant={
                                                        isCover
                                                            ? "contained"
                                                            : "outlined"
                                                    }
                                                    color="primary"
                                                    startIcon={
                                                        isUpdatingCover ? (
                                                            <CircularProgress
                                                                size={16}
                                                                color="inherit"
                                                            />
                                                        ) : (
                                                            <StarIcon />
                                                        )
                                                    }
                                                    disabled={
                                                        isCover ||
                                                        isUpdatingCover ||
                                                        isDeleting
                                                    }
                                                    onClick={() =>
                                                        handleSetCover(
                                                            image.id
                                                        )
                                                    }
                                                >
                                                    {isCover
                                                        ? "Current Cover"
                                                        : isUpdatingCover
                                                            ? "Updating..."
                                                            : "Set Cover"}
                                                </Button>


                                                {/* DELETE */}

                                                <IconButton
                                                    color="error"
                                                    disabled={
                                                        isDeleting ||
                                                        isUpdatingCover
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            image.id
                                                        )
                                                    }
                                                    aria-label={
                                                        isDeleting
                                                            ? "Deleting image"
                                                            : "Delete image"
                                                    }
                                                >

                                                    {isDeleting ? (
                                                        <CircularProgress
                                                            size={22}
                                                            color="inherit"
                                                        />
                                                    ) : (
                                                        <DeleteIcon />
                                                    )}

                                                </IconButton>

                                            </Stack>

                                        </Box>

                                    </Card>

                                </Grid>
                            );
                        })}

                    </Grid>

                )}

            </Box>

        </Card>
    );
}


export default LibraryImageGallery;