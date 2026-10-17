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
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AccountCircle,
  BadgeOutlined,
  CameraAltOutlined,
  CloudUploadOutlined,
  DeleteOutlineOutlined,
  EditOutlined,
  EmailOutlined,
  LockOutlined,
  PersonOutlineOutlined,
  PhoneOutlined,
  ShieldOutlined,
  VerifiedUserOutlined,
  Visibility,
  VisibilityOff,
  WcOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

import { alpha, useTheme } from "@mui/material/styles";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import userProfileApi from "../../../api/userProfileApi";

import { useAuth } from "../../../context/AuthContext";

// ============================================================
// GENDER OPTIONS
// ============================================================

const GENDER_OPTIONS = [
  {
    value: "MALE",
    label: "Male",
  },
  {
    value: "FEMALE",
    label: "Female",
  },
  {
    value: "OTHERS",
    label: "Others",
  },
  {
    value: "PREFER_NOT_TO_SAY",
    label: "Prefer not to say",
  },
];

// ============================================================
// PROFILE IMAGE
// ============================================================

const PROFILE_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const PROFILE_IMAGE_MAX_SIZE = 5 * 1024 * 1024;

// ============================================================
// HELPERS
// ============================================================

const getRoleLabel = (role) => {
  switch (role) {
    case "USER":
      return "Library Member";

    case "LIBRARY_OWNER":
      return "Library Owner";

    case "ADMIN":
      return "Platform Administrator";

    default:
      return "LibraryHub User";
  }
};

const getGenderLabel = (gender) => {
  const option = GENDER_OPTIONS.find((item) => item.value === gender);

  return option?.label || "Not provided";
};

const getInitials = (fullName) => {
  if (!fullName) {
    return "U";
  }

  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const getErrorMessage = (requestError, fallback) => {
  return (
    requestError?.response?.data?.message ||
    requestError?.response?.data?.error ||
    requestError?.response?.data?.detail ||
    requestError?.message ||
    fallback
  );
};

// ============================================================
// COMPONENT
// ============================================================

function StudentProfile() {
  const theme = useTheme();

  const navigate = useNavigate();

  // ==========================================================
  // AUTH
  // ==========================================================

  const { refreshProfile, logout } = useAuth();

  // ==========================================================
  // PROFILE
  // ==========================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // PROFILE IMAGE
  // ==========================================================

  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);

  const [imagePreview, setImagePreview] = useState("");

  const [imageUploading, setImageUploading] = useState(false);

  const [imageRemoving, setImageRemoving] = useState(false);

  const [imageError, setImageError] = useState("");

  const imageInputRef = useRef(null);

  // ==========================================================
  // EDIT PROFILE
  // ==========================================================

  const [editOpen, setEditOpen] = useState(false);

  const [fullName, setFullName] = useState("");

  const [phone, setPhone] = useState("");

  const [gender, setGender] = useState("");

  const [fullNameError, setFullNameError] = useState("");

  const [phoneError, setPhoneError] = useState("");

  // ==========================================================
  // PASSWORD
  // ==========================================================

  const [passwordOpen, setPasswordOpen] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [passwordErrors, setPasswordErrors] = useState({});

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================================
  // DERIVED VALUES
  // ==========================================================

  const initials = useMemo(
    () => getInitials(profile?.fullName),
    [profile?.fullName],
  );

  const roleLabel = getRoleLabel(profile?.role);

  const genderLabel = getGenderLabel(profile?.gender);

  // ==========================================================
  // LOAD PROFILE
  // ==========================================================

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await refreshProfile();

      setProfile(response || null);

      if (!response) {
        setError("Unable to load profile.");
      }
    } catch (requestError) {
      console.error("Failed to load profile:", requestError);

      setError(getErrorMessage(requestError, "Unable to load profile."));
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ==========================================================
  // IMAGE PREVIEW CLEANUP
  // ==========================================================

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  // ==========================================================
  // PROFILE IMAGE DIALOG
  // ==========================================================

  const handleOpenImageDialog = () => {
    setSelectedImage(null);

    setImagePreview(profile?.profileImageUrl || "");

    setImageError("");

    setError("");

    setSuccess("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    if (imageUploading || imageRemoving) {
      return;
    }

    setImageDialogOpen(false);

    setSelectedImage(null);

    setImagePreview("");

    setImageError("");

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleChooseImage = () => {
    imageInputRef.current?.click();
  };

  // ==========================================================
  // IMAGE SELECTION
  // ==========================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageError("");

    if (!PROFILE_IMAGE_TYPES.includes(file.type)) {
      setSelectedImage(null);

      setImageError("Only JPG, PNG and WEBP images are allowed.");

      event.target.value = "";

      return;
    }

    if (file.size > PROFILE_IMAGE_MAX_SIZE) {
      setSelectedImage(null);

      setImageError("Profile image must not exceed 5 MB.");

      event.target.value = "";

      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setSelectedImage(file);

    setImagePreview(previewUrl);
  };

  // ==========================================================
  // SAVE PROFILE IMAGE
  // ==========================================================

  const handleSaveProfileImage = async () => {
    if (!selectedImage) {
      setImageError("Please select a new profile image.");

      return;
    }

    try {
      setImageUploading(true);

      setImageError("");

      setError("");

      setSuccess("");

      const updatedProfile =
        await userProfileApi.uploadProfileImage(selectedImage);

      const refreshedProfile = await refreshProfile();

      setProfile(refreshedProfile || updatedProfile);

      setImageDialogOpen(false);

      setSelectedImage(null);

      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview("");

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      setSuccess("Profile picture updated successfully.");
    } catch (requestError) {
      console.error("Failed to upload profile picture:", requestError);

      setImageError(
        getErrorMessage(requestError, "Unable to upload profile picture."),
      );
    } finally {
      setImageUploading(false);
    }
  };

  // ==========================================================
  // REMOVE PROFILE IMAGE
  // ==========================================================

  const handleRemoveProfileImage = async () => {
    if (!profile?.profileImageUrl) {
      return;
    }

    try {
      setImageRemoving(true);

      setImageError("");

      setError("");

      setSuccess("");

      const updatedProfile = await userProfileApi.deleteProfileImage();

      const refreshedProfile = await refreshProfile();

      setProfile(refreshedProfile || updatedProfile);

      setImageDialogOpen(false);

      setSelectedImage(null);

      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      setImagePreview("");

      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }

      setSuccess("Profile picture removed successfully.");
    } catch (requestError) {
      console.error("Failed to remove profile picture:", requestError);

      setImageError(
        getErrorMessage(requestError, "Unable to remove profile picture."),
      );
    } finally {
      setImageRemoving(false);
    }
  };

  // ==========================================================
  // OPEN EDIT PROFILE
  // ==========================================================

  const handleOpenEdit = () => {
    setFullName(profile?.fullName || "");

    setPhone(profile?.phone || "");

    setGender(profile?.gender || "");

    setFullNameError("");

    setPhoneError("");

    setError("");

    setSuccess("");

    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    if (saving) {
      return;
    }

    setEditOpen(false);

    setFullNameError("");

    setPhoneError("");
  };

  // ==========================================================
  // PROFILE INPUTS
  // ==========================================================

  const handleFullNameChange = (event) => {
    setFullName(event.target.value);

    setFullNameError("");
  };

  const handlePhoneChange = (event) => {
    const value = event.target.value.replace(/\D/g, "").slice(0, 10);

    setPhone(value);

    setPhoneError("");
  };

  // ==========================================================
  // PROFILE VALIDATION
  // ==========================================================

  const validateProfileForm = () => {
    let valid = true;

    const normalizedName = fullName.trim().replace(/\s+/g, " ");

    const normalizedPhone = phone.trim();

    if (normalizedName.length < 2) {
      setFullNameError("Full name must contain at least 2 characters.");

      valid = false;
    }

    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
      setPhoneError("Phone number must contain exactly 10 digits.");

      valid = false;
    }

    return valid;
  };

  // ==========================================================
  // SAVE PROFILE
  // ==========================================================

  const handleSave = async () => {
    if (!validateProfileForm()) {
      return;
    }

    try {
      setSaving(true);

      setError("");

      setSuccess("");

      const updatedProfile = await userProfileApi.updateProfile({
        fullName: fullName.trim().replace(/\s+/g, " "),

        phone: phone.trim(),

        gender: gender || null,
      });

      const refreshedProfile = await refreshProfile();

      setProfile(refreshedProfile || updatedProfile);

      setEditOpen(false);

      setSuccess("Profile updated successfully.");
    } catch (requestError) {
      console.error("Failed to update profile:", requestError);

      setError(getErrorMessage(requestError, "Unable to update profile."));
    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // PASSWORD DIALOG
  // ==========================================================

  const handleOpenPassword = () => {
    setCurrentPassword("");

    setNewPassword("");

    setConfirmPassword("");

    setPasswordErrors({});

    setShowCurrentPassword(false);

    setShowNewPassword(false);

    setShowConfirmPassword(false);

    setError("");

    setSuccess("");

    setPasswordOpen(true);
  };

  const handleClosePassword = () => {
    if (changingPassword) {
      return;
    }

    setPasswordOpen(false);

    setCurrentPassword("");

    setNewPassword("");

    setConfirmPassword("");

    setPasswordErrors({});

    setShowCurrentPassword(false);

    setShowNewPassword(false);

    setShowConfirmPassword(false);
  };

  // ==========================================================
  // PASSWORD VALIDATION
  // ==========================================================

  const validatePasswordForm = () => {
    const errors = {};

    if (!currentPassword) {
      errors.currentPassword = "Current password is required.";
    }

    if (!newPassword) {
      errors.newPassword = "New password is required.";
    } else if (newPassword.length < 6) {
      errors.newPassword = "New password must contain at least 6 characters.";
    } else if (newPassword === currentPassword) {
      errors.newPassword =
        "New password must be different from the current password.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your new password.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match.";
    }

    setPasswordErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ==========================================================
  // CHANGE PASSWORD
  // ==========================================================

  const handleChangePassword = async () => {
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setChangingPassword(true);

      setError("");

      setSuccess("");

      await userProfileApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordOpen(false);

      setCurrentPassword("");

      setNewPassword("");

      setConfirmPassword("");

      setPasswordErrors({});

      setShowCurrentPassword(false);

      setShowNewPassword(false);

      setShowConfirmPassword(false);

      logout();

      navigate("/login", {
        replace: true,

        state: {
          message: "Password changed successfully. Please sign in again.",
        },
      });
    } catch (requestError) {
      console.error("Failed to change password:", requestError);

      const message = getErrorMessage(
        requestError,
        "Unable to change password.",
      );

      setError(message);

      if (message.toLowerCase().includes("current password")) {
        setPasswordErrors((previous) => ({
          ...previous,

          currentPassword: message,
        }));
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handlePasswordMouseDown = (event) => {
    event.preventDefault();
  };

  // ==========================================================
  // DIALOG PAPER STYLE
  // ==========================================================

  const dialogPaperSx = {
    borderRadius: 4,

    border: "1px solid",

    borderColor: alpha(theme.palette.divider, 0.9),

    overflow: "hidden",

    boxShadow: `0 28px 80px ${alpha(
      theme.palette.common.black,
      theme.palette.mode === "dark" ? 0.4 : 0.18,
    )}`,
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 420,

          display: "grid",

          placeItems: "center",
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 68,
              height: 68,

              borderRadius: "50%",

              display: "grid",

              placeItems: "center",

              bgcolor: alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <CircularProgress size={32} />
          </Box>

          <Box textAlign="center">
            <Typography fontWeight={800}>Loading your profile</Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.4,
              }}
            >
              Preparing your LibraryHub account.
            </Typography>
          </Box>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // PROFILE UNAVAILABLE
  // ==========================================================

  if (!profile) {
    return (
      <Alert
        severity="error"
        sx={{
          borderRadius: 3,
        }}
      >
        {error || "Profile unavailable."}
      </Alert>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

        maxWidth: 1180,

        mx: "auto",

        pb: 5,
      }}
    >
      {/* ====================================================== */}
      {/* PAGE HEADER */}
      {/* ====================================================== */}

      <Stack
        direction={{
          xs: "column",
          sm: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "flex-start",
          sm: "center",
        }}
        spacing={2}
        sx={{
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            sx={{
              letterSpacing: "-0.035em",
            }}
          >
            My Profile
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              mt: 0.6,

              maxWidth: 620,

              lineHeight: 1.65,
            }}
          >
            Manage your identity, personal details and LibraryHub account
            security from one place.
          </Typography>
        </Box>

        <Chip
          icon={<VerifiedUserOutlined />}
          label="Verified LibraryHub Member"
          variant="outlined"
          sx={{
            height: 38,

            px: 0.5,

            borderRadius: 2.5,

            fontWeight: 700,

            borderColor: alpha(theme.palette.primary.main, 0.24),

            bgcolor: alpha(theme.palette.primary.main, 0.045),

            color: "primary.main",

            "& .MuiChip-icon": {
              color: "primary.main",
            },
          }}
        />
      </Stack>

      {/* ====================================================== */}
      {/* SUCCESS */}
      {/* ====================================================== */}

      {success && (
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          sx={{
            mb: 2.5,

            borderRadius: 3,

            border: "1px solid",

            borderColor: alpha(theme.palette.success.main, 0.2),

            boxShadow: `0 8px 24px ${alpha(theme.palette.success.main, 0.06)}`,
          }}
        >
          {success}
        </Alert>
      )}

      {/* ====================================================== */}
      {/* ERROR */}
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

      {/* ====================================================== */}
      {/* PREMIUM PROFILE HERO */}
      {/* ====================================================== */}

      <Card
        elevation={0}
        sx={{
          position: "relative",

          overflow: "hidden",

          mb: 3,

          borderRadius: 4,

          border: "1px solid",

          borderColor: alpha(theme.palette.primary.main, 0.13),

          background: `
            linear-gradient(
              135deg,
              ${alpha(
                theme.palette.primary.main,
                theme.palette.mode === "dark" ? 0.19 : 0.095,
              )} 0%,
              ${alpha(theme.palette.background.paper, 0.98)} 48%,
              ${alpha(theme.palette.primary.main, 0.025)} 100%
            )
          `,

          boxShadow: `0 18px 50px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === "dark" ? 0.2 : 0.055,
          )}`,

          "&::before": {
            content: '""',

            position: "absolute",

            width: 300,

            height: 300,

            borderRadius: "50%",

            top: -190,

            right: -80,

            background: alpha(theme.palette.primary.main, 0.075),
          },

          "&::after": {
            content: '""',

            position: "absolute",

            width: 180,

            height: 180,

            borderRadius: "50%",

            right: 180,

            bottom: -135,

            background: alpha(theme.palette.primary.main, 0.035),
          },
        }}
      >
        <CardContent
          sx={{
            position: "relative",

            zIndex: 1,

            p: {
              xs: 2.5,
              sm: 3,
              md: 4,
            },

            "&:last-child": {
              pb: {
                xs: 2.5,
                sm: 3,
                md: 4,
              },
            },
          }}
        >
          <Stack
            direction={{
              xs: "column",
              md: "row",
            }}
            alignItems={{
              xs: "flex-start",
              md: "center",
            }}
            justifyContent="space-between"
            spacing={3}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={3}
              alignItems={{
                xs: "flex-start",
                sm: "center",
              }}
            >
              {/* ============================================== */}
              {/* AVATAR */}
              {/* ============================================== */}

              <Box
                sx={{
                  position: "relative",

                  flexShrink: 0,
                }}
              >
                <Box
                  sx={{
                    p: "5px",

                    borderRadius: "50%",

                    background: `linear-gradient(
                        135deg,
                        ${theme.palette.primary.main},
                        ${alpha(theme.palette.primary.main, 0.38)}
                      )`,

                    boxShadow: `0 14px 34px ${alpha(
                      theme.palette.primary.main,
                      0.22,
                    )}`,
                  }}
                >
                  <Avatar
                    src={profile?.profileImageUrl || undefined}
                    alt={profile?.fullName || "Profile picture"}
                    sx={{
                      width: {
                        xs: 92,
                        sm: 110,
                      },

                      height: {
                        xs: 92,
                        sm: 110,
                      },

                      fontSize: 34,

                      bgcolor: "primary.main",

                      color: "primary.contrastText",

                      fontWeight: 900,

                      border: "4px solid",

                      borderColor: "background.paper",
                    }}
                  >
                    {!profile?.profileImageUrl ? initials : null}
                  </Avatar>
                </Box>

                <Tooltip title="Change profile picture" arrow>
                  <IconButton
                    size="small"
                    aria-label="Change profile picture"
                    onClick={handleOpenImageDialog}
                    sx={{
                      position: "absolute",

                      right: -2,
                      bottom: 4,

                      width: 38,
                      height: 38,

                      bgcolor: "primary.main",

                      color: "primary.contrastText",

                      border: "3px solid",

                      borderColor: "background.paper",

                      boxShadow: `0 7px 18px ${alpha(
                        theme.palette.common.black,
                        0.15,
                      )}`,

                      "&:hover": {
                        bgcolor: "primary.dark",

                        transform: "scale(1.04)",
                      },

                      transition: "all 0.2s ease",
                    }}
                  >
                    <CameraAltOutlined
                      sx={{
                        fontSize: 18,
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* ============================================== */}
              {/* IDENTITY */}
              {/* ============================================== */}

              <Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography
                    variant="h4"
                    fontWeight={900}
                    sx={{
                      letterSpacing: "-0.035em",

                      lineHeight: 1.15,
                    }}
                  >
                    {profile.fullName}
                  </Typography>

                  <Tooltip title="Verified account" arrow>
                    <VerifiedUserOutlined
                      color="primary"
                      sx={{
                        fontSize: 23,
                      }}
                    />
                  </Tooltip>
                </Stack>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.8,

                    fontWeight: 500,
                  }}
                >
                  {profile.email}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{
                    mt: 2,
                  }}
                >
                  <Chip
                    size="small"
                    icon={<WorkspacePremiumOutlined />}
                    label={roleLabel}
                    sx={{
                      fontWeight: 700,

                      borderRadius: 2,

                      bgcolor: alpha(theme.palette.primary.main, 0.09),

                      color: "primary.main",

                      "& .MuiChip-icon": {
                        color: "primary.main",
                      },
                    }}
                  />

                  <Chip
                    size="small"
                    icon={<BadgeOutlined />}
                    label={`Member #${profile.id}`}
                    variant="outlined"
                    sx={{
                      fontWeight: 700,

                      borderRadius: 2,
                    }}
                  />

                  {profile.phone && (
                    <Chip
                      size="small"
                      icon={<PhoneOutlined />}
                      label={profile.phone}
                      variant="outlined"
                      sx={{
                        fontWeight: 600,

                        borderRadius: 2,
                      }}
                    />
                  )}
                </Stack>
              </Box>
            </Stack>

            {/* ================================================ */}
            {/* EDIT PROFILE */}
            {/* ================================================ */}

            <Button
              variant="contained"
              startIcon={<EditOutlined />}
              onClick={handleOpenEdit}
              sx={{
                minHeight: 46,

                px: 2.5,

                borderRadius: 2.5,

                textTransform: "none",

                fontWeight: 800,

                boxShadow: `0 10px 25px ${alpha(
                  theme.palette.primary.main,
                  0.23,
                )}`,

                "&:hover": {
                  boxShadow: `0 12px 32px ${alpha(
                    theme.palette.primary.main,
                    0.3,
                  )}`,
                },
              }}
            >
              Edit Profile
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ====================================================== */}
      {/* INFORMATION + SECURITY */}
      {/* ====================================================== */}

      <Grid container spacing={3}>
        {/* ==================================================== */}
        {/* PERSONAL INFORMATION */}
        {/* ==================================================== */}

        <Grid
          size={{
            xs: 12,
            lg: 8,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",

              border: "1px solid",

              borderColor: "divider",

              borderRadius: 4,

              boxShadow: `0 10px 36px ${alpha(
                theme.palette.common.black,
                theme.palette.mode === "dark" ? 0.12 : 0.035,
              )}`,
            }}
          >
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
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,

                    borderRadius: 2.7,

                    display: "grid",

                    placeItems: "center",

                    bgcolor: alpha(theme.palette.primary.main, 0.085),

                    color: "primary.main",
                  }}
                >
                  <PersonOutlineOutlined />
                </Box>

                <Box>
                  <Typography variant="h6" fontWeight={900}>
                    Personal Information
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.2,
                    }}
                  >
                    Your identity and contact information.
                  </Typography>
                </Box>
              </Stack>

              <Divider
                sx={{
                  my: 3,
                }}
              />

              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <ProfileInfo
                    icon={<PersonOutlineOutlined />}
                    label="Full Name"
                    value={profile.fullName}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <ProfileInfo
                    icon={<EmailOutlined />}
                    label="Email Address"
                    value={profile.email}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <ProfileInfo
                    icon={<PhoneOutlined />}
                    label="Phone Number"
                    value={profile.phone || "Not provided"}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <ProfileInfo
                    icon={<WcOutlined />}
                    label="Gender"
                    value={genderLabel}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <ProfileInfo
                    icon={<BadgeOutlined />}
                    label="Member ID"
                    value={`#${profile.id}`}
                  />
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <ProfileInfo
                    icon={<VerifiedUserOutlined />}
                    label="Account Type"
                    value={roleLabel}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* ==================================================== */}
        {/* ACCOUNT SECURITY */}
        {/* ==================================================== */}

        <Grid
          size={{
            xs: 12,
            lg: 4,
          }}
        >
          <Card
            elevation={0}
            sx={{
              height: "100%",

              border: "1px solid",

              borderColor: alpha(theme.palette.primary.main, 0.14),

              borderRadius: 4,

              background: `linear-gradient(
                  160deg,
                  ${alpha(theme.palette.primary.main, 0.08)},
                  ${alpha(theme.palette.background.paper, 0.98)} 48%
                )`,

              boxShadow: `0 10px 36px ${alpha(
                theme.palette.common.black,
                theme.palette.mode === "dark" ? 0.12 : 0.035,
              )}`,
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3.5,
                },

                height: "100%",

                "&:last-child": {
                  pb: {
                    xs: 2.5,
                    md: 3.5,
                  },
                },
              }}
            >
              <Stack
                sx={{
                  height: "100%",
                }}
              >
                <Box
                  sx={{
                    width: 56,
                    height: 56,

                    borderRadius: 3,

                    display: "grid",

                    placeItems: "center",

                    bgcolor: alpha(theme.palette.primary.main, 0.1),

                    color: "primary.main",

                    mb: 2,
                  }}
                >
                  <ShieldOutlined
                    sx={{
                      fontSize: 29,
                    }}
                  />
                </Box>

                <Typography variant="h6" fontWeight={900}>
                  Account Security
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.7,

                    lineHeight: 1.75,
                  }}
                >
                  Keep your LibraryHub account protected by maintaining secure
                  sign-in credentials.
                </Typography>

                <Box
                  sx={{
                    mt: 3,

                    p: 2,

                    borderRadius: 3,

                    border: "1px solid",

                    borderColor: "divider",

                    bgcolor: alpha(theme.palette.background.paper, 0.72),
                  }}
                >
                  <Stack direction="row" spacing={1.4} alignItems="center">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,

                        borderRadius: 2.3,

                        display: "grid",

                        placeItems: "center",

                        bgcolor: alpha(theme.palette.success.main, 0.09),

                        color: "success.main",
                      }}
                    >
                      <LockOutlined />
                    </Box>

                    <Box>
                      <Typography fontWeight={800}>Password</Typography>

                      <Typography variant="caption" color="text.secondary">
                        Protected sign-in credentials
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    flexGrow: 1,
                  }}
                />

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LockOutlined />}
                  onClick={handleOpenPassword}
                  sx={{
                    mt: 3,

                    minHeight: 46,

                    borderRadius: 2.5,

                    textTransform: "none",

                    fontWeight: 800,

                    borderWidth: "1.5px",

                    "&:hover": {
                      borderWidth: "1.5px",

                      bgcolor: alpha(theme.palette.primary.main, 0.045),
                    },
                  }}
                >
                  Change Password
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ====================================================== */}
      {/* PROFILE IMAGE DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseImageDialog}
        fullWidth
        maxWidth="xs"
        slotProps={{
          paper: {
            sx: dialogPaperSx,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Typography variant="h6" fontWeight={900}>
            Profile Picture
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Personalize your LibraryHub account with a clear profile photo.
          </Typography>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            pt: "20px !important",
          }}
        >
          <Stack spacing={2.5} alignItems="center">
            <Box
              sx={{
                p: "5px",

                borderRadius: "50%",

                background: `linear-gradient(
                    135deg,
                    ${theme.palette.primary.main},
                    ${alpha(theme.palette.primary.main, 0.35)}
                  )`,
              }}
            >
              <Avatar
                src={imagePreview || profile?.profileImageUrl || undefined}
                alt={profile?.fullName || "Profile picture"}
                sx={{
                  width: 132,
                  height: 132,

                  fontSize: 42,

                  fontWeight: 900,

                  bgcolor: "primary.main",

                  color: "primary.contrastText",

                  border: "4px solid",

                  borderColor: "background.paper",
                }}
              >
                {!imagePreview && !profile?.profileImageUrl ? initials : null}
              </Avatar>
            </Box>

            {imageError && (
              <Alert
                severity="error"
                sx={{
                  width: "100%",

                  borderRadius: 2.5,
                }}
              >
                {imageError}
              </Alert>
            )}

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={handleImageChange}
            />

            <Button
              variant="outlined"
              startIcon={<CloudUploadOutlined />}
              onClick={handleChooseImage}
              disabled={imageUploading || imageRemoving}
              sx={{
                minHeight: 44,

                px: 2.5,

                borderRadius: 2.5,

                textTransform: "none",

                fontWeight: 700,
              }}
            >
              Choose New Photo
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                JPG, PNG or WEBP
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Maximum file size: 5 MB
              </Typography>
            </Box>

            {selectedImage && (
              <Box
                sx={{
                  width: "100%",

                  p: 1.5,

                  borderRadius: 2.5,

                  bgcolor: alpha(theme.palette.primary.main, 0.045),

                  border: "1px solid",

                  borderColor: alpha(theme.palette.primary.main, 0.12),

                  textAlign: "center",
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",

                    overflow: "hidden",

                    whiteSpace: "nowrap",

                    textOverflow: "ellipsis",
                  }}
                >
                  Selected: {selectedImage.name}
                </Typography>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,

            justifyContent: "space-between",

            flexWrap: "wrap",

            gap: 1,
          }}
        >
          <Button
            color="error"
            startIcon={
              imageRemoving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <DeleteOutlineOutlined />
              )
            }
            onClick={handleRemoveProfileImage}
            disabled={
              !profile?.profileImageUrl || imageUploading || imageRemoving
            }
            sx={{
              borderRadius: 2,

              textTransform: "none",

              fontWeight: 700,
            }}
          >
            {imageRemoving ? "Removing..." : "Remove Photo"}
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleCloseImageDialog}
              disabled={imageUploading || imageRemoving}
              sx={{
                textTransform: "none",

                fontWeight: 700,
              }}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveProfileImage}
              disabled={!selectedImage || imageUploading || imageRemoving}
              startIcon={
                imageUploading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CameraAltOutlined />
                )
              }
              sx={{
                minHeight: 42,

                px: 2.3,

                borderRadius: 2.3,

                textTransform: "none",

                fontWeight: 800,
              }}
            >
              {imageUploading ? "Saving..." : "Save Photo"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* ====================================================== */}
      {/* EDIT PROFILE DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={editOpen}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: dialogPaperSx,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,

                display: "grid",

                placeItems: "center",

                borderRadius: 2.4,

                bgcolor: alpha(theme.palette.primary.main, 0.08),

                color: "primary.main",
              }}
            >
              <EditOutlined />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={900}>
                Edit Profile
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Keep your personal information up to date.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            pt: "22px !important",
          }}
        >
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              autoFocus
              label="Full Name"
              value={fullName}
              onChange={handleFullNameChange}
              error={Boolean(fullNameError)}
              helperText={fullNameError}
              disabled={saving}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineOutlined color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Phone Number"
              value={phone}
              onChange={handlePhoneChange}
              error={Boolean(phoneError)}
              helperText={phoneError || "Enter a 10-digit phone number."}
              disabled={saving}
              slotProps={{
                htmlInput: {
                  maxLength: 10,

                  inputMode: "numeric",
                },

                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlined color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              select
              fullWidth
              label="Gender"
              value={gender}
              onChange={(event) => setGender(event.target.value)}
              disabled={saving}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <WcOutlined color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="">Not provided</MenuItem>

              {GENDER_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Email Address"
              value={profile.email || ""}
              disabled
              helperText="Email is used for authentication and cannot be changed here."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
          }}
        >
          <Button
            onClick={handleCloseEdit}
            disabled={saving}
            sx={{
              textTransform: "none",

              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
            startIcon={
              saving ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <AccountCircle />
              )
            }
            sx={{
              minHeight: 42,

              px: 2.4,

              borderRadius: 2.3,

              textTransform: "none",

              fontWeight: 800,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ====================================================== */}
      {/* CHANGE PASSWORD DIALOG */}
      {/* ====================================================== */}

      <Dialog
        open={passwordOpen}
        onClose={handleClosePassword}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: dialogPaperSx,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Stack direction="row" spacing={1.4} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,

                display: "grid",

                placeItems: "center",

                borderRadius: 2.4,

                bgcolor: alpha(theme.palette.primary.main, 0.08),

                color: "primary.main",
              }}
            >
              <ShieldOutlined />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={900}>
                Change Password
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Update your password to keep your account secure.
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            px: 3,
            pt: "22px !important",
          }}
        >
          <Alert
            severity="info"
            sx={{
              mb: 2.5,

              borderRadius: 2.5,
            }}
          >
            You will be signed out after changing your password and will need to
            sign in again.
          </Alert>

          <Stack spacing={2.5}>
            <PasswordField
              label="Current Password"
              value={currentPassword}
              onChange={(event) => {
                setCurrentPassword(event.target.value);

                setPasswordErrors((previous) => ({
                  ...previous,

                  currentPassword: "",
                }));
              }}
              visible={showCurrentPassword}
              toggleVisible={() =>
                setShowCurrentPassword((previous) => !previous)
              }
              error={passwordErrors.currentPassword}
              disabled={changingPassword}
              autoComplete="current-password"
              mouseDown={handlePasswordMouseDown}
            />

            <PasswordField
              label="New Password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);

                setPasswordErrors((previous) => ({
                  ...previous,

                  newPassword: "",

                  confirmPassword: "",
                }));
              }}
              visible={showNewPassword}
              toggleVisible={() => setShowNewPassword((previous) => !previous)}
              error={passwordErrors.newPassword}
              helperText="Use at least 6 characters."
              disabled={changingPassword}
              autoComplete="new-password"
              mouseDown={handlePasswordMouseDown}
            />

            <PasswordField
              label="Confirm New Password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);

                setPasswordErrors((previous) => ({
                  ...previous,

                  confirmPassword: "",
                }));
              }}
              visible={showConfirmPassword}
              toggleVisible={() =>
                setShowConfirmPassword((previous) => !previous)
              }
              error={passwordErrors.confirmPassword}
              disabled={changingPassword}
              autoComplete="new-password"
              mouseDown={handlePasswordMouseDown}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 2,
          }}
        >
          <Button
            onClick={handleClosePassword}
            disabled={changingPassword}
            sx={{
              textTransform: "none",

              fontWeight: 700,
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleChangePassword}
            disabled={changingPassword}
            startIcon={
              changingPassword ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <LockOutlined />
              )
            }
            sx={{
              minHeight: 42,

              px: 2.4,

              borderRadius: 2.3,

              textTransform: "none",

              fontWeight: 800,

              boxShadow: `0 8px 22px ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            {changingPassword ? "Changing..." : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// ============================================================
// PROFILE INFORMATION ITEM
// ============================================================

function ProfileInfo({ icon, label, value }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 2,

        minHeight: 94,

        borderRadius: 3,

        border: "1px solid",

        borderColor: "divider",

        bgcolor: alpha(
          theme.palette.background.default,
          theme.palette.mode === "dark" ? 0.16 : 0.38,
        ),

        transition: "all 0.2s ease",

        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.2),

          bgcolor: alpha(theme.palette.primary.main, 0.028),

          transform: "translateY(-2px)",

          boxShadow: `0 8px 22px ${alpha(
            theme.palette.common.black,
            theme.palette.mode === "dark" ? 0.12 : 0.035,
          )}`,
        },
      }}
    >
      <Stack direction="row" spacing={1.6} alignItems="center">
        <Box
          sx={{
            width: 44,
            height: 44,

            flexShrink: 0,

            display: "grid",

            placeItems: "center",

            borderRadius: 2.3,

            bgcolor: alpha(theme.palette.primary.main, 0.075),

            color: "primary.main",

            "& svg": {
              fontSize: 21,
            },
          }}
        >
          {icon}
        </Box>

        <Box
          sx={{
            minWidth: 0,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{
              letterSpacing: "0.01em",
            }}
          >
            {label}
          </Typography>

          <Typography
            fontWeight={800}
            sx={{
              mt: 0.25,

              overflowWrap: "anywhere",

              lineHeight: 1.4,
            }}
          >
            {value ?? "-"}
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

// ============================================================
// PASSWORD FIELD
// ============================================================

function PasswordField({
  label,
  value,
  onChange,
  visible,
  toggleVisible,
  error,
  helperText,
  disabled,
  autoComplete,
  mouseDown,
}) {
  return (
    <TextField
      fullWidth
      label={label}
      type={visible ? "text" : "password"}
      value={value}
      onChange={onChange}
      error={Boolean(error)}
      helperText={error || helperText}
      disabled={disabled}
      autoComplete={autoComplete}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <LockOutlined fontSize="small" />
            </InputAdornment>
          ),

          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                edge="end"
                aria-label={visible ? "Hide password" : "Show password"}
                onClick={toggleVisible}
                onMouseDown={mouseDown}
                disabled={disabled}
              >
                {visible ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default StudentProfile;
