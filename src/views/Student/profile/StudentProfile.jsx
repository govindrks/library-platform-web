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
  SecurityOutlined,
  VerifiedUserOutlined,
  Visibility,
  VisibilityOff,
  WcOutlined,
} from "@mui/icons-material";

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
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Stack
        alignItems="center"
        spacing={2}
        sx={{
          py: 8,
        }}
      >
        <CircularProgress />

        <Typography color="text.secondary">Loading profile...</Typography>
      </Stack>
    );
  }

  // ==========================================================
  // PROFILE UNAVAILABLE
  // ==========================================================

  if (!profile) {
    return <Alert severity="error">{error || "Profile unavailable."}</Alert>;
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        maxWidth: 1050,
      }}
    >
      {/* ===================================================== */}
      {/* PAGE HEADER */}
      {/* ===================================================== */}

      <Typography variant="h4" fontWeight={800}>
        My Profile
      </Typography>

      <Typography
        color="text.secondary"
        sx={{
          mt: 0.5,

          mb: 3,
        }}
      >
        Manage your personal information and LibraryHub account.
      </Typography>

      {/* ===================================================== */}
      {/* SUCCESS */}
      {/* ===================================================== */}

      {success && (
        <Alert
          severity="success"
          sx={{
            mb: 3,
          }}
          onClose={() => setSuccess("")}
        >
          {success}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* ERROR */}
      {/* ===================================================== */}

      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
          }}
          onClose={() => setError("")}
        >
          {error}
        </Alert>
      )}

      {/* ===================================================== */}
      {/* PROFILE HEADER */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,

              md: 3.5,
            },
          }}
        >
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
            spacing={3}
          >
            <Stack direction="row" spacing={2.5} alignItems="center">
              {/* PROFILE IMAGE */}

              <Box
                sx={{
                  position: "relative",

                  flexShrink: 0,
                }}
              >
                <Avatar
                  src={profile?.profileImageUrl || undefined}
                  alt={profile?.fullName || "Profile picture"}
                  sx={{
                    width: {
                      xs: 72,

                      sm: 88,
                    },

                    height: {
                      xs: 72,

                      sm: 88,
                    },

                    fontSize: 30,

                    bgcolor: "primary.main",

                    color: "primary.contrastText",

                    border: "2px solid",

                    borderColor: "background.paper",

                    boxShadow: 1,
                  }}
                >
                  {!profile?.profileImageUrl ? initials : null}
                </Avatar>

                <IconButton
                  size="small"
                  aria-label="Change profile picture"
                  onClick={handleOpenImageDialog}
                  sx={{
                    position: "absolute",

                    right: -4,

                    bottom: -4,

                    width: 32,

                    height: 32,

                    bgcolor: "primary.main",

                    color: "primary.contrastText",

                    border: "3px solid",

                    borderColor: "background.paper",

                    "&:hover": {
                      bgcolor: "primary.dark",
                    },
                  }}
                >
                  <CameraAltOutlined
                    sx={{
                      fontSize: 17,
                    }}
                  />
                </IconButton>
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography variant="h5" fontWeight={800}>
                    {profile.fullName}
                  </Typography>

                  <Chip
                    label={roleLabel}
                    color="primary"
                    size="small"
                    variant="outlined"
                  />
                </Stack>

                <Typography
                  color="text.secondary"
                  sx={{
                    mt: 0.75,
                  }}
                >
                  {profile.email}
                </Typography>

                {profile.phone && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.5,
                    }}
                  >
                    {profile.phone}
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.5,
                  }}
                >
                  Member ID: #{profile.id}
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<EditOutlined />}
              onClick={handleOpenEdit}
            >
              Edit Profile
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* PERSONAL INFORMATION */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          mb: 3,

          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,

              md: 3.5,
            },
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            Personal Information
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.5,
            }}
          >
            Your basic LibraryHub account details.
          </Typography>

          <Divider
            sx={{
              my: 3,
            }}
          />

          <Grid container spacing={3}>
            <Grid
              size={{
                xs: 12,

                md: 6,
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

                md: 6,
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

                md: 6,
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

                md: 6,
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

                md: 6,
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

                md: 6,
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

      {/* ===================================================== */}
      {/* ACCOUNT & SECURITY */}
      {/* ===================================================== */}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 2.5,

              md: 3.5,
            },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SecurityOutlined color="primary" />

            <Box>
              <Typography variant="h6" fontWeight={800}>
                Account & Security
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Manage your account security and sign-in information.
              </Typography>
            </Box>
          </Stack>

          <Divider
            sx={{
              my: 3,
            }}
          />

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
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 42,

                  height: 42,

                  display: "flex",

                  alignItems: "center",

                  justifyContent: "center",

                  borderRadius: 2,

                  bgcolor: "action.hover",

                  color: "primary.main",
                }}
              >
                <LockOutlined />
              </Box>

              <Box>
                <Typography fontWeight={700}>Password</Typography>

                <Typography variant="body2" color="text.secondary">
                  Update your account password securely.
                </Typography>
              </Box>
            </Stack>

            <Button
              variant="outlined"
              startIcon={<LockOutlined />}
              onClick={handleOpenPassword}
            >
              Change Password
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ===================================================== */}
      {/* PROFILE IMAGE DIALOG */}
      {/* ===================================================== */}

      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseImageDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle fontWeight={800}>Change profile picture</DialogTitle>

        <DialogContent>
          <Stack
            spacing={3}
            alignItems="center"
            sx={{
              pt: 1,
            }}
          >
            <Avatar
              src={imagePreview || profile?.profileImageUrl || undefined}
              alt={profile?.fullName || "Profile picture"}
              sx={{
                width: 128,

                height: 128,

                fontSize: 42,

                bgcolor: "primary.main",

                color: "primary.contrastText",

                border: "1px solid",

                borderColor: "divider",
              }}
            >
              {!imagePreview && !profile?.profileImageUrl ? initials : null}
            </Avatar>

            {imageError && (
              <Alert
                severity="error"
                sx={{
                  width: "100%",
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
            >
              Upload new photo
            </Button>

            <Box textAlign="center">
              <Typography variant="body2" color="text.secondary">
                PNG, JPG or WEBP
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Maximum 5 MB
              </Typography>
            </Box>

            {selectedImage && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  width: "100%",

                  textAlign: "center",

                  overflow: "hidden",

                  whiteSpace: "nowrap",

                  textOverflow: "ellipsis",
                }}
              >
                Selected: {selectedImage.name}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,

            pb: 3,

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
          >
            {imageRemoving ? "Removing..." : "Remove Photo"}
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              onClick={handleCloseImageDialog}
              disabled={imageUploading || imageRemoving}
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
            >
              {imageUploading ? "Saving..." : "Save"}
            </Button>
          </Stack>
        </DialogActions>
      </Dialog>

      {/* ===================================================== */}
      {/* EDIT PROFILE DIALOG */}
      {/* ===================================================== */}

      <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={800}>Edit Profile</DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
            }}
          >
            Update your LibraryHub profile information.
          </Typography>

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
                      <PhoneOutlined color="action" />
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
                      <EmailOutlined color="action" />
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
          }}
        >
          <Button onClick={handleCloseEdit} disabled={saving}>
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
          >
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ===================================================== */}
      {/* CHANGE PASSWORD DIALOG */}
      {/* ===================================================== */}

      <Dialog
        open={passwordOpen}
        onClose={handleClosePassword}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={800}>Change Password</DialogTitle>

        <DialogContent>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 3,
            }}
          >
            Enter your current password and choose a new password.
          </Typography>

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
          }}
        >
          <Button onClick={handleClosePassword} disabled={changingPassword}>
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
  return (
    <Stack direction="row" spacing={2} alignItems="flex-start">
      <Box
        sx={{
          width: 42,

          height: 42,

          display: "flex",

          alignItems: "center",

          justifyContent: "center",

          borderRadius: 2,

          bgcolor: "action.hover",

          color: "primary.main",

          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography
          fontWeight={700}
          sx={{
            mt: 0.25,

            overflowWrap: "anywhere",
          }}
        >
          {value ?? "-"}
        </Typography>
      </Box>
    </Stack>
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
