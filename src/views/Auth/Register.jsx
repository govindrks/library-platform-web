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

import { useMemo, useState } from "react";

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
  // ORIGINAL DESTINATION
  // ==========================================================

  const destination = location.state?.from || null;

  // ==========================================================
  // PRESERVE COMPLETE BOOKING CONTEXT
  // ==========================================================
  //
  // Example:
  //
  // Public Library
  // -> Membership Plan
  // -> Floor
  // -> Slot
  // -> Date
  // -> Seat
  // -> Login
  // -> Register
  // -> Auto login / Login
  // -> Return to SeatAvailability
  //
  // ==========================================================

  const returnState = useMemo(
    () => ({
      action: location.state?.action,

      libraryId: location.state?.libraryId,

      membershipPlanId: location.state?.membershipPlanId,

      membershipPlanName: location.state?.membershipPlanName,

      floorId: location.state?.floorId,

      slotId: location.state?.slotId,

      seatId: location.state?.seatId,

      /*
       * Keep old date for compatibility
       * with any older flow still using it.
       */
      date: location.state?.date,

      startDate: location.state?.startDate,

      endDate: location.state?.endDate,
    }),
    [location.state],
  );

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
          /*
           * Registration/authentication succeeded.
           *
           * Do not block navigation because profile hydration
           * temporarily failed.
           */

          console.warn(
            "Unable to refresh profile after registration:",
            profileError,
          );
        }

        // ==================================================
        // RETURN TO ORIGINAL DESTINATION
        // ==================================================
        //
        // This is the important booking fix.
        //
        // The complete seat booking selection now survives
        // registration.
        //
        // ==================================================

        if (destination) {
          navigate(destination, {
            replace: true,

            state: returnState,
          });

          return;
        }

        // ==================================================
        // ROLE REDIRECT
        // ==================================================

        const authenticatedRole =
          authenticatedUser?.role || registeredUser?.role;

        // ==================================================
        // ADMIN
        // ==================================================

        if (authenticatedRole === "ADMIN") {
          navigate("/admin/dashboard", {
            replace: true,
          });

          return;
        }

        // ==================================================
        // LIBRARY OWNER
        // ==================================================

        if (authenticatedRole === "LIBRARY_OWNER") {
          navigate("/owner/dashboard", {
            replace: true,
          });

          return;
        }

        // ==================================================
        // STUDENT
        // ==================================================

        if (authenticatedRole === "USER") {
          navigate("/student/dashboard", {
            replace: true,
          });

          return;
        }

        // ==================================================
        // FALLBACK
        // ==================================================

        navigate("/dashboard", {
          replace: true,
        });

        return;
      }

      // ====================================================
      // SEPARATE LOGIN REQUIRED
      // ====================================================
      //
      // Some registration backends create the account but
      // intentionally do not return a token.
      //
      // In that case send the user to Login while preserving
      // the same complete booking state.
      //
      // ====================================================

      setSuccess("Account created successfully. Please sign in.");

      setTimeout(() => {
        navigate("/login", {
          replace: true,

          state: {
            from: destination,

            ...returnState,

            message: "Account created successfully. Sign in to continue.",
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
  // BACK
  // ==========================================================

  const handleBack = () => {
    /*
     * If this registration page belongs to an in-progress
     * booking, go back to Login and preserve the booking.
     *
     * Otherwise return to public LibraryHub.
     */

    if (destination) {
      navigate("/login", {
        state: {
          from: destination,

          ...returnState,
        },
      });

      return;
    }

    navigate("/");
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
          onClick={handleBack}
          sx={{
            mb: 3,

            color: "text.secondary",
          }}
        >
          {destination ? "Back to Sign In" : "Back to LibraryHub"}
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
          {/* BOOKING CONTEXT */}
          {/* ================================================= */}

          {destination && returnState.action === "BOOK_SEAT" && (
            <Alert
              severity="info"
              sx={{
                mb: 3,

                borderRadius: 2.5,
              }}
            >
              Create your account to continue booking. Your selected membership
              plan, floor, slot, date and seat will be restored automatically.
            </Alert>
          )}

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
              {/* ============================================= */}
              {/* FULL NAME */}
              {/* ============================================= */}

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

              {/* ============================================= */}
              {/* EMAIL */}
              {/* ============================================= */}

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

              {/* ============================================= */}
              {/* PASSWORD */}
              {/* ============================================= */}

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

              {/* ============================================= */}
              {/* CONFIRM PASSWORD */}
              {/* ============================================= */}

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

              {/* ============================================= */}
              {/* REGISTER */}
              {/* ============================================= */}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                sx={{
                  minHeight: 48,

                  mt: 1,

                  fontWeight: 800,

                  borderRadius: 2.25,
                }}
              >
                {loading ? (
                  <CircularProgress size={23} color="inherit" />
                ) : destination && returnState.action === "BOOK_SEAT" ? (
                  "Create Account & Continue Booking"
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
                from: destination,

                ...returnState,
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
