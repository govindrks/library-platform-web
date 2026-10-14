import {
  ArrowBack,
  EmailOutlined,
  LockOutlined,
  PersonOutlineOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useState } from "react";

import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import authApi from "../../api/authApi";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// REGISTER
// ============================================================

function Register() {
  const navigate = useNavigate();

  const location = useLocation();

  // ==========================================================
  // AUTH
  // ==========================================================

  const { login, refreshProfile } = useAuth();

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [formData, setFormData] = useState({
    fullName: "",

    email: "",

    password: "",

    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,

      [name]: value,
    }));

    setFieldErrors((previous) => ({
      ...previous,

      [name]: "",
    }));

    setError("");
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = "Full name must contain at least 2 characters";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must contain at least 6 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ==========================================================
  // REGISTER SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccess("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // ====================================================
      // REGISTER REQUEST
      // ====================================================

      const payload = {
        fullName: formData.fullName.trim(),

        email: formData.email.trim().toLowerCase(),

        password: formData.password,
      };

      const response = await authApi.register(payload);

      // ====================================================
      // NORMALIZE RESPONSE
      // ====================================================

      const token =
        response?.token ||
        response?.accessToken ||
        response?.data?.token ||
        response?.data?.accessToken;

      const registeredUser = response?.user || response?.data?.user || null;

      // ====================================================
      // AUTO LOGIN
      // ====================================================

      if (token) {
        login(token, registeredUser, false);

        let authenticatedUser = registeredUser;

        // ==================================================
        // CENTRALIZED PROFILE HYDRATION
        // ==================================================

        try {
          const profile = await refreshProfile();

          if (profile) {
            authenticatedUser = profile;
          }
        } catch (profileError) {
          console.warn(
            "Unable to refresh profile after registration:",
            profileError,
          );
        }

        // ==================================================
        // RETURN TO ORIGINAL DESTINATION
        // ==================================================

        const destination = location.state?.from;

        if (destination) {
          navigate(destination, {
            replace: true,

            state: {
              action: location.state?.action,

              seatId: location.state?.seatId,

              libraryId: location.state?.libraryId,

              date: location.state?.date,
            },
          });

          return;
        }

        // ==================================================
        // ROLE REDIRECT
        // ==================================================

        const authenticatedRole =
          authenticatedUser?.role || registeredUser?.role;

        if (authenticatedRole === "ADMIN") {
          navigate("/admin/dashboard", {
            replace: true,
          });

          return;
        }

        if (authenticatedRole === "LIBRARY_OWNER") {
          navigate("/owner/dashboard", {
            replace: true,
          });

          return;
        }

        if (authenticatedRole === "USER") {
          navigate("/student/dashboard", {
            replace: true,
          });

          return;
        }

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      // ====================================================
      // SEPARATE LOGIN REQUIRED
      // ====================================================

      setSuccess("Account created successfully. Please sign in.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,

          state: {
            from: location.state?.from,

            action: location.state?.action,

            seatId: location.state?.seatId,

            libraryId: location.state?.libraryId,

            date: location.state?.date,
          },
        });
      }, 1200);
    } catch (err) {
      console.error("Registration failed:", err);

      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.response?.data?.detail;

      setError(
        backendMessage || "Unable to create your account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",

        background: "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",

        display: "flex",

        alignItems: "center",

        py: 6,
      }}
    >
      <Container maxWidth="sm">
        {/* =================================================== */}
        {/* BACK */}
        {/* =================================================== */}

        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          sx={{
            mb: 3,

            color: "text.secondary",
          }}
        >
          Back to LibraryHub
        </Button>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",

            borderColor: "divider",

            borderRadius: 3,

            p: {
              xs: 3,

              sm: 5,
            },
          }}
        >
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <Stack
            spacing={1}
            sx={{
              mb: 4,
            }}
          >
            <Box
              sx={{
                width: 46,

                height: 46,

                borderRadius: 2,

                backgroundColor: "primary.main",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                mb: 1,
              }}
            >
              <Typography
                sx={{
                  color: "#FFFFFF",

                  fontWeight: 800,

                  fontSize: 22,
                }}
              >
                L
              </Typography>
            </Box>

            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,

                letterSpacing: "-0.02em",
              }}
            >
              Create your account
            </Typography>

            <Typography color="text.secondary">
              Join LibraryHub and start discovering libraries and available
              study seats.
            </Typography>
          </Stack>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

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

          {/* ================================================= */}
          {/* SUCCESS */}
          {/* ================================================= */}

          {success && (
            <Alert
              severity="success"
              sx={{
                mb: 3,
              }}
            >
              {success}
            </Alert>
          )}

          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {/* FULL NAME */}

              <TextField
                fullWidth
                required
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                error={Boolean(fieldErrors.fullName)}
                helperText={fieldErrors.fullName}
                disabled={loading}
                placeholder="Enter your full name"
                autoComplete="name"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonOutlineOutlined color="action" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* EMAIL */}

              <TextField
                fullWidth
                required
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email}
                disabled={loading}
                placeholder="you@example.com"
                autoComplete="email"
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

              {/* PASSWORD */}

              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password || "Minimum 6 characters"}
                disabled={loading}
                placeholder="Create a password"
                autoComplete="new-password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          edge="end"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          disabled={loading}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* CONFIRM PASSWORD */}

              <TextField
                fullWidth
                required
                label="Confirm Password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                error={Boolean(fieldErrors.confirmPassword)}
                helperText={fieldErrors.confirmPassword}
                disabled={loading}
                placeholder="Confirm your password"
                autoComplete="new-password"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlined color="action" />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          edge="end"
                          onClick={() =>
                            setShowConfirmPassword((previous) => !previous)
                          }
                          disabled={loading}
                          aria-label={
                            showConfirmPassword
                              ? "Hide password confirmation"
                              : "Show password confirmation"
                          }
                        >
                          {showConfirmPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* REGISTER */}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  minHeight: 48,

                  mt: 1,
                }}
              >
                {loading ? (
                  <CircularProgress size={23} color="inherit" />
                ) : (
                  "Create Account"
                )}
              </Button>
            </Stack>
          </Box>

          <Divider
            sx={{
              my: 3,
            }}
          />

          {/* ================================================= */}
          {/* LOGIN */}
          {/* ================================================= */}

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{" "}
            <Link
              component={RouterLink}
              to="/login"
              state={{
                from: location.state?.from,

                action: location.state?.action,

                seatId: location.state?.seatId,

                libraryId: location.state?.libraryId,

                date: location.state?.date,
              }}
              underline="hover"
              sx={{
                fontWeight: 700,
              }}
            >
              Sign in
            </Link>
          </Typography>
        </Paper>

        {/* =================================================== */}
        {/* FOOTER */}
        {/* =================================================== */}

        <Typography
          variant="caption"
          color="text.secondary"
          textAlign="center"
          display="block"
          sx={{
            mt: 3,
          }}
        >
          By creating an account, you agree to the LibraryHub terms and
          policies.
        </Typography>
      </Container>
    </Box>
  );
}

export default Register;
