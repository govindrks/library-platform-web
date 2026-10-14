import {
  ArrowForward,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import authApi from "../../api/authApi";

import { useAuth } from "../../context/AuthContext";

// ============================================================
// LOGIN PAGE
// ============================================================

function Login() {
  const navigate = useNavigate();

  const location = useLocation();

  // ==========================================================
  // AUTH CONTEXT
  // ==========================================================

  const { login, refreshProfile } = useAuth();

  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================
  // NAVIGATION MESSAGE
  // ==========================================================

  useEffect(() => {
    const navigationMessage = location.state?.message;

    if (navigationMessage) {
      setSuccess(navigationMessage);
    }
  }, [location.state]);

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // ==========================================================
  // PASSWORD MOUSE HANDLERS
  // ==========================================================

  const handlePasswordMouseDown = (event) => {
    event.preventDefault();
  };

  const handlePasswordMouseUp = (event) => {
    event.preventDefault();
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    const normalizedEmail = form.email.trim();

    if (!normalizedEmail || !form.password) {
      setError("Please enter your email and password.");

      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(normalizedEmail)) {
      setError("Please enter a valid email address.");

      return false;
    }

    return true;
  };

  // ==========================================================
  // LOGIN SUBMIT
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
      // LOGIN REQUEST
      // ====================================================

      const response = await authApi.login({
        email: form.email.trim().toLowerCase(),

        password: form.password,
      });

      // ====================================================
      // NORMALIZE LOGIN RESPONSE
      // ====================================================

      const token =
        response?.token ||
        response?.accessToken ||
        response?.data?.token ||
        response?.data?.accessToken;

      const loginUser = response?.user || response?.data?.user || null;

      if (!token) {
        throw new Error("Authentication token was not returned by the server.");
      }

      // ====================================================
      // STORE AUTHENTICATION
      // ====================================================

      login(token, loginUser, rememberMe);

      // ====================================================
      // LOAD CANONICAL PROFILE
      // ====================================================

      /*
       * AuthContext owns profile synchronization.
       *
       * This loads:
       *
       * id
       * fullName
       * phone
       * email
       * gender
       * role
       * profileImageUrl
       */
      let authenticatedUser = loginUser;

      try {
        const profile = await refreshProfile();

        if (profile) {
          authenticatedUser = profile;
        }
      } catch (profileError) {
        /*
         * Authentication itself succeeded.
         *
         * A temporary profile hydration failure should not
         * prevent the user from entering the application.
         */
        console.warn("Unable to refresh profile after login:", profileError);
      }

      // ====================================================
      // RETURN TO ORIGINAL DESTINATION
      // ====================================================

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

      // ====================================================
      // RESOLVE ROLE
      // ====================================================

      const authenticatedRole = authenticatedUser?.role || loginUser?.role;

      // ====================================================
      // OWNER
      // ====================================================

      if (authenticatedRole === "LIBRARY_OWNER") {
        navigate("/owner/dashboard", {
          replace: true,
        });

        return;
      }

      // ====================================================
      // ADMIN
      // ====================================================

      if (authenticatedRole === "ADMIN") {
        navigate("/admin/dashboard", {
          replace: true,
        });

        return;
      }

      // ====================================================
      // STUDENT
      // ====================================================

      if (authenticatedRole === "USER") {
        navigate("/student/dashboard", {
          replace: true,
        });

        return;
      }

      // ====================================================
      // FALLBACK
      // ====================================================

      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      console.error("Login failed:", requestError);

      const backendMessage =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail;

      setError(
        backendMessage ||
          requestError?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        backgroundColor: "background.default",

        p: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",

          maxWidth: 460,

          border: "1px solid",

          borderColor: "divider",

          borderRadius: 3,

          p: {
            xs: 3,

            sm: 5,
          },
        }}
      >
        <Stack spacing={3}>
          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <Box>
            <Box
              sx={{
                width: 46,

                height: 46,

                borderRadius: 2,

                backgroundColor: "primary.main",

                color: "white",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                fontSize: 22,

                fontWeight: 700,

                mb: 3,
              }}
            >
              L
            </Box>

            <Typography variant="h4" fontWeight={700}>
              Welcome back
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 0.75,
              }}
            >
              Sign in to your LibraryHub account
            </Typography>
          </Box>

          {/* ================================================= */}
          {/* SUCCESS */}
          {/* ================================================= */}

          {success && (
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          )}

          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2.5}>
              {/* EMAIL */}

              <TextField
                fullWidth
                required
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
                disabled={loading}
              />

              {/* PASSWORD */}

              <TextField
                fullWidth
                required
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                disabled={loading}
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
                          disabled={loading}
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          aria-pressed={showPassword}
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          onMouseDown={handlePasswordMouseDown}
                          onMouseUp={handlePasswordMouseUp}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              {/* ================================================= */}
              {/* REMEMBER ME / FORGOT PASSWORD */}
              {/* ================================================= */}

              <Box
                sx={{
                  display: "flex",

                  alignItems: "center",

                  justifyContent: "space-between",

                  gap: 1,

                  flexWrap: "wrap",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      disabled={loading}
                    />
                  }
                  label="Remember me"
                />

                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  disabled={loading}
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot password?
                </Link>
              </Box>

              {/* ================================================= */}
              {/* SIGN IN */}
              {/* ================================================= */}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                endIcon={<ArrowForward />}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </Stack>
          </Box>

          {/* ================================================= */}
          {/* REGISTER */}
          {/* ================================================= */}

          <Typography variant="body2" textAlign="center" color="text.secondary">
            Don't have an account?{" "}
            <Link
              component="button"
              type="button"
              underline="hover"
              disabled={loading}
              onClick={() =>
                navigate("/register", {
                  state: {
                    from: location.state?.from,

                    action: location.state?.action,

                    seatId: location.state?.seatId,

                    libraryId: location.state?.libraryId,

                    date: location.state?.date,
                  },
                })
              }
            >
              Create account
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default Login;
