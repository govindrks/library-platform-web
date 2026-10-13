import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import {
  AccountCircle,
  Email,
  Person,
  VerifiedUser,
} from "@mui/icons-material";

import { useEffect, useState } from "react";

import studentProfileApi from "../../../api/studentProfileApi";

function StudentProfile() {
  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await studentProfileApi.getProfile();

        setProfile(response || null);
      } catch (requestError) {
        setError(
          requestError?.response?.data?.message ||
            requestError?.message ||
            "Unable to load profile.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <Stack alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!profile) {
    return <Alert severity="error">{error || "Profile unavailable."}</Alert>;
  }

  const initials =
    profile.fullName
      ?.split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <Box
      sx={{
        maxWidth: 760,
      }}
    >
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
        View your LibraryHub account information.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack alignItems="center" spacing={1.5} sx={{ py: 2 }}>
            <Avatar
              sx={{
                width: 84,
                height: 84,
                fontSize: 28,
              }}
            >
              {initials}
            </Avatar>

            <Typography variant="h5" fontWeight={800}>
              {profile.fullName}
            </Typography>

            <Typography color="text.secondary">Library Member</Typography>
          </Stack>

          <Divider
            sx={{
              my: 3,
            }}
          />

          <Stack spacing={2.5}>
            <ProfileRow
              icon={<Person />}
              label="Full Name"
              value={profile.fullName}
            />

            <ProfileRow
              icon={<Email />}
              label="Email Address"
              value={profile.email}
            />

            <ProfileRow
              icon={<VerifiedUser />}
              label="Role"
              value={profile.role}
            />

            <ProfileRow
              icon={<AccountCircle />}
              label="User ID"
              value={profile.id}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

function ProfileRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Box
        sx={{
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography fontWeight={600}>{value ?? "-"}</Typography>
      </Box>
    </Stack>
  );
}

export default StudentProfile;
