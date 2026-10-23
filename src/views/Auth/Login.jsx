import {
  ArrowBack,
  Close,
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  WhatsApp,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Divider,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import authApi from "../../api/authApi";

import whatsappOtpApi from "../../api/whatsappOtpApi";

import OtpVerificationForm from "../../components/whatsapp/OtpVerificationForm";

import { useAuth } from "../../context/AuthContext";
import usePlatformConfig from "../../api/usePlatformConfig";


// ============================================================

// SCREENS

// ============================================================

const SCREEN = {
  METHOD: "METHOD",

  EMAIL: "EMAIL",

  MOBILE: "MOBILE",

  OTP: "OTP",
};

// ============================================================

// WHATSAPP FEATURE FLAG

// ============================================================

const WHATSAPP_AUTH_ENABLED =
  String(
    import.meta.env.VITE_WHATSAPP_AUTH_ENABLED ?? "false",
  ).toLowerCase() === "true";

// ============================================================

// LOGIN

// ============================================================

function Login() {
  const navigate = useNavigate();

  const location = useLocation();

  const { login, refreshProfile } = useAuth();

  const { platformName } = usePlatformConfig();

  // ==========================================================

  // ORIGINAL DESTINATION

  // ==========================================================

  const destination = location.state?.from || null;

  // ==========================================================

  // PRESERVE COMPLETE BOOKING CONTEXT

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

      date: location.state?.date,

      startDate: location.state?.startDate,

      endDate: location.state?.endDate,
    }),

    [location.state],
  );

  // ==========================================================

  // SCREEN

  // ==========================================================

  const [screen, setScreen] = useState(SCREEN.METHOD);

  // ==========================================================

  // EMAIL LOGIN STATE

  // ==========================================================

  const [form, setForm] = useState({
    email: "",

    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [rememberMe, setRememberMe] = useState(false);

  // ==========================================================

  // MOBILE LOGIN STATE

  // ==========================================================

  const [phone, setPhone] = useState("");

  const [challengeId, setChallengeId] = useState("");

  const [resendSeconds, setResendSeconds] = useState(60);

  // ==========================================================

  // UI STATE

  // ==========================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================

  // NAVIGATION MESSAGE

  // ==========================================================

  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
    }
  }, [location.state]);

  // ==========================================================

  // CLEAR MESSAGES

  // ==========================================================

  const clearMessages = () => {
    setError("");

    setSuccess("");
  };

  // ==========================================================

  // EMAIL FORM CHANGE

  // ==========================================================

  const handleEmailChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,

      [name]: value,
    }));

    setError("");
  };

  // ==========================================================

  // PHONE CHANGE

  // ==========================================================

  const handlePhoneChange = (event) => {
    const value = String(event.target.value).replace(/\D/g, "").slice(0, 10);

    setPhone(value);

    setChallengeId("");

    setError("");
  };

  // ==========================================================

  // COMPLETE LOGIN

  // ==========================================================

  const completeLogin = async ({ token, user, remember = false }) => {
    if (!token) {
      throw new Error("Authentication token was not returned by the server.");
    }

    login(token, user, remember);

    let authenticatedUser = user;

    try {
      const profile = await refreshProfile();

      if (profile) {
        authenticatedUser = profile;
      }
    } catch (profileError) {
      console.warn("Unable to refresh profile after login:", profileError);
    }

    // ======================================================

    // RETURN TO BOOKING

    // ======================================================

    if (destination) {
      navigate(destination, {
        replace: true,

        state: returnState,
      });

      return;
    }

    // ======================================================

    // ROLE REDIRECT

    // ======================================================

    const role = authenticatedUser?.role || user?.role;

    if (role === "LIBRARY_OWNER") {
      navigate("/owner/dashboard", {
        replace: true,
      });

      return;
    }

    if (role === "ADMIN") {
      navigate("/admin/dashboard", {
        replace: true,
      });

      return;
    }

    if (role === "USER") {
      navigate("/student/dashboard", {
        replace: true,
      });

      return;
    }

    navigate("/dashboard", {
      replace: true,
    });
  };

  // ==========================================================

  // EMAIL VALIDATION

  // ==========================================================

  const validateEmailLogin = () => {
    const email = form.email.trim();

    if (!email || !form.password) {
      setError("Please enter your email and password.");

      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");

      return false;
    }

    return true;
  };

  // ==========================================================

  // EMAIL LOGIN

  // ==========================================================

  const handleEmailLogin = async (event) => {
    event.preventDefault();

    clearMessages();

    if (!validateEmailLogin()) {
      return;
    }

    try {
      setLoading(true);

      const response = await authApi.login({
        email: form.email.trim().toLowerCase(),

        password: form.password,
      });

      const token =
        response?.token ||
        response?.accessToken ||
        response?.data?.token ||
        response?.data?.accessToken;

      const loginUser = response?.user || response?.data?.user || null;

      await completeLogin({
        token,

        user: loginUser,

        remember: rememberMe,
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

  // REQUEST WHATSAPP LOGIN OTP

  // ==========================================================

  const requestWhatsAppOtp = async () => {
    clearMessages();

    if (!WHATSAPP_AUTH_ENABLED) {
      setError("WhatsApp login is currently unavailable.");

      return null;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");

      return null;
    }

    try {
      setLoading(true);

      const response = await whatsappOtpApi.requestOtp(phone);

      if (!response?.challengeId) {
        throw new Error("OTP challenge was not returned by the server.");
      }

      setChallengeId(response.challengeId);

      setResendSeconds(
        Number(
          response?.resendAvailableInSeconds ??
            response?.resendAfterSeconds ??
            60,
        ),
      );

      setScreen(SCREEN.OTP);

      return response;
    } catch (requestError) {
      console.error("WhatsApp OTP request failed:", requestError);

      const backendMessage =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail;

      setError(
        backendMessage ||
          requestError?.message ||
          "Unable to send WhatsApp OTP.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================

  // VERIFY WHATSAPP LOGIN OTP

  // ==========================================================

  const verifyWhatsAppOtp = async (otp) => {
    clearMessages();

    try {
      setLoading(true);

      const response = await whatsappOtpApi.verifyOtp({
        challengeId,

        otp,
      });

      const token =
        response?.token ||
        response?.accessToken ||
        response?.data?.token ||
        response?.data?.accessToken;

      const loginUser =
        response?.user ||
        response?.data?.user ||
        (response?.userId
          ? {
              id: response.userId,

              fullName: response.fullName,

              email: response.email,

              phone: response.phone,

              role: response.role,
            }
          : null);

      await completeLogin({
        token,

        user: loginUser,

        remember: true,
      });
    } catch (requestError) {
      console.error("WhatsApp OTP verification failed:", requestError);

      const backendMessage =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail;

      setError(
        backendMessage || requestError?.message || "OTP verification failed.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================

  // RESEND OTP

  // ==========================================================

  const handleResendOtp = async () => {
    return requestWhatsAppOtp();
  };

  // ==========================================================

  // REGISTER

  // ==========================================================

  const handleRegister = () => {
    navigate("/register", {
      state: {
        from: destination,

        ...returnState,
      },
    });
  };

  // ==========================================================

  // CLOSE

  // ==========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    if (destination) {
      navigate(destination, {
        replace: true,

        state: returnState,
      });

      return;
    }

    navigate("/", {
      replace: true,
    });
  };

  // ==========================================================

  // BACK

  // ==========================================================

  const handleBack = () => {
    clearMessages();

    if (screen === SCREEN.OTP) {
      setChallengeId("");

      setScreen(SCREEN.MOBILE);

      return;
    }

    setScreen(SCREEN.METHOD);
  };

  // ==========================================================

  // METHOD SCREEN

  // ==========================================================

  const renderMethodChooser = () => (
    <Stack spacing={3}>
      <Typography variant="h5" fontWeight={800}>
        Get Started
      </Typography>

      {destination && returnState.action === "BOOK_SEAT" && (
        <Alert
          severity="info"
          sx={{
            borderRadius: 2,
          }}
        >
          Sign in to continue your booking. Your selected plan, slot, date and
          seat will be restored automatically.
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Button
        fullWidth
        size="large"
        variant="outlined"
        startIcon={<EmailOutlined />}
        disabled={loading}
        onClick={() => {
          clearMessages();

          setScreen(SCREEN.EMAIL);
        }}
        sx={{
          minHeight: 56,

          borderRadius: 2,

          borderColor: "#CBD5E1",

          color: "#111827",

          textTransform: "none",

          fontWeight: 800,

          fontSize: 16,

          "&:hover": {
            borderColor: "primary.main",

            bgcolor: "rgba(79, 70, 229, 0.03)",
          },
        }}
      >
        Continue with Email & Password
      </Button>

      <Divider>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>

      <Box
        component="button"
        type="button"
        disabled={loading}
        onClick={() => {
          clearMessages();

          setScreen(SCREEN.MOBILE);
        }}
        sx={{
          appearance: "none",

          width: "100%",

          border: "none",

          bgcolor: "transparent",

          p: 0,

          cursor: "pointer",

          textAlign: "left",

          "&:disabled": {
            cursor: "default",

            opacity: 0.6,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",

            alignItems: "center",

            px: 0.5,

            py: 1.7,

            borderBottom: "1px solid",

            borderColor: "divider",
          }}
        >
          <Typography
            sx={{
              fontSize: 20,

              mr: 1.2,
            }}
          >
            🇮🇳
          </Typography>

          <Typography
            fontWeight={700}
            sx={{
              mr: 1.2,
            }}
          >
            +91
          </Typography>

          <Typography>Continue with mobile number</Typography>
        </Box>
      </Box>

      {!WHATSAPP_AUTH_ENABLED && (
        <Typography variant="caption" color="text.secondary">
          Mobile sign-in will become available when WhatsApp authentication is
          enabled.
        </Typography>
      )}

      <Typography variant="body2">
        New to {platformName}?{" "}
        <Link
          component="button"
          type="button"
          underline="hover"
          disabled={loading}
          onClick={handleRegister}
          sx={{
            fontWeight: 800,
          }}
        >
          Create account
        </Link>
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          pt: 3,
        }}
      >
        By continuing, you agree to our{" "}
        <Link href="/terms" underline="hover" color="inherit">
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link href="/privacy" underline="hover" color="inherit">
          Privacy Policy
        </Link>
      </Typography>
    </Stack>
  );

  // ==========================================================

  // EMAIL SCREEN

  // ==========================================================

  const renderEmailLogin = () => (
    <Stack spacing={3}>
      <IconButton
        onClick={handleBack}
        disabled={loading}
        sx={{
          alignSelf: "flex-start",

          ml: -1,
        }}
      >
        <ArrowBack />
      </IconButton>

      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            letterSpacing: "-0.03em",
          }}
        >
          Login with Email
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          Enter your {platformName} account credentials.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleEmailLogin}>
        <Stack spacing={2.3}>
          <TextField
            fullWidth
            required
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleEmailChange}
            autoComplete="email"
            disabled={loading}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            fullWidth
            required
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleEmailChange}
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
                      onClick={() => setShowPassword((previous) => !previous)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Box
            sx={{
              display: "flex",

              justifyContent: "space-between",

              alignItems: "center",

              gap: 1,

              flexWrap: "wrap",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  disabled={loading}
                  onChange={(event) => setRememberMe(event.target.checked)}
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

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              minHeight: 50,

              mt: 1,

              textTransform: "none",

              fontWeight: 800,
            }}
          >
            {loading ? (
              <CircularProgress size={22} color="inherit" />
            ) : (
              "Continue"
            )}
          </Button>
        </Stack>
      </Box>
    </Stack>
  );

  // ==========================================================

  // MOBILE SCREEN

  // ==========================================================

  const renderMobileLogin = () => (
    <Stack spacing={3}>
      <IconButton
        onClick={handleBack}
        disabled={loading}
        sx={{
          alignSelf: "flex-start",

          ml: -1,
        }}
      >
        <ArrowBack />
      </IconButton>

      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            letterSpacing: "-0.03em",
          }}
        >
          Continue with mobile
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          We'll send a secure OTP to your WhatsApp number.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "flex",

          alignItems: "center",

          borderBottom: "1px solid",

          borderColor: "divider",

          py: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 20,

            mr: 1,
          }}
        >
          🇮🇳
        </Typography>

        <Typography
          fontWeight={700}
          sx={{
            mr: 1.5,
          }}
        >
          +91
        </Typography>

        <Box
          component="input"
          autoFocus
          inputMode="numeric"
          value={phone}
          onChange={handlePhoneChange}
          disabled={loading}
          placeholder="Continue with mobile number"
          sx={{
            flex: 1,

            border: "none",

            outline: "none",

            bgcolor: "transparent",

            color: "text.primary",

            fontSize: 16,

            py: 1,

            "&::placeholder": {
              color: "text.disabled",
            },
          }}
        />
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        startIcon={<WhatsApp />}
        disabled={loading || phone.length !== 10 || !WHATSAPP_AUTH_ENABLED}
        onClick={requestWhatsAppOtp}
        sx={{
          minHeight: 50,

          textTransform: "none",

          fontWeight: 800,
        }}
      >
        {loading ? <CircularProgress size={22} color="inherit" /> : "Continue"}
      </Button>

      {!WHATSAPP_AUTH_ENABLED && (
        <Alert severity="info">
          WhatsApp authentication is currently disabled in this environment.
        </Alert>
      )}
    </Stack>
  );

  // ==========================================================

  // OTP SCREEN

  // ==========================================================

  const renderOtp = () => (
    <Stack spacing={2}>
      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <OtpVerificationForm
        phone={phone}
        loading={loading}
        resendAfterSeconds={resendSeconds}
        title="Verify your mobile"
        description="Enter the 6-digit OTP sent to your WhatsApp number."
        submitLabel="Verify & Sign In"
        loadingLabel="Verifying..."
        onVerify={verifyWhatsAppOtp}
        onResend={handleResendOtp}
        onChangeNumber={handleBack}
      />
    </Stack>
  );

  // ==========================================================

  // UI

  // ==========================================================

  return (
    <Modal
      open
      onClose={loading ? undefined : handleClose}
      disableAutoFocus
      sx={{
        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        p: {
          xs: 1.5,

          sm: 3,
        },

        overflowY: "auto",

        "& .MuiBackdrop-root": {
          backgroundColor: "rgba(15, 23, 42, 0.66)",

          backdropFilter: "blur(1.5px)",
        },
      }}
    >
      <Paper
        elevation={24}
        sx={{
          position: "relative",

          width: "100%",

          maxWidth: 510,

          maxHeight: "calc(100vh - 40px)",

          minHeight: {
            xs: "auto",

            sm: screen === SCREEN.METHOD ? 560 : 580,
          },

          overflowY: "auto",

          borderRadius: 3,

          p: {
            xs: 3,

            sm: 4.5,
          },

          bgcolor: "#FFFFFF",

          color: "#111827",

          outline: "none",

          boxShadow: "0 24px 80px rgba(0,0,0,0.32)",
        }}
      >
        <IconButton
          type="button"
          onClick={handleClose}
          disabled={loading}
          aria-label="Close login"
          sx={{
            position: "absolute",

            top: 14,

            right: 14,

            color: "text.secondary",

            zIndex: 2,
          }}
        >
          <Close />
        </IconButton>

        {screen === SCREEN.METHOD && renderMethodChooser()}

        {screen === SCREEN.EMAIL && renderEmailLogin()}

        {screen === SCREEN.MOBILE && renderMobileLogin()}

        {screen === SCREEN.OTP && renderOtp()}
      </Paper>
    </Modal>
  );
}

export default Login;
