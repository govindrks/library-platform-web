import {
  ArrowBack,
  Close,
  EmailOutlined,
  LockOutlined,
  PersonOutlineOutlined,
  Visibility,
  VisibilityOff,
  WhatsApp,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Modal,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useMemo, useState } from "react";

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
  DETAILS: "DETAILS",

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

// REGISTER

// ============================================================

function Register() {
  const navigate = useNavigate();

  const location = useLocation();

  const { login, refreshProfile } = useAuth();

  const { platformName } = usePlatformConfig();

  // ==========================================================

  // ORIGINAL DESTINATION

  // ==========================================================

  const destination = location.state?.from || null;

  // ==========================================================

  // BOOKING CONTEXT

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

  const [screen, setScreen] = useState(SCREEN.DETAILS);

  // ==========================================================

  // ACCOUNT DETAILS

  // ==========================================================

  const [formData, setFormData] = useState({
    fullName: "",

    email: "",

    password: "",

    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ==========================================================

  // MOBILE VERIFICATION

  // ==========================================================

  const [phone, setPhone] = useState("");

  const [challengeId, setChallengeId] = useState("");

  const [phoneVerificationToken, setPhoneVerificationToken] = useState("");

  const [resendSeconds, setResendSeconds] = useState(60);

  // ==========================================================

  // UI STATE

  // ==========================================================

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  // ==========================================================

  // CLEAR MESSAGES

  // ==========================================================

  const clearMessages = () => {
    setError("");
  };

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

  // PHONE CHANGE

  // ==========================================================

  const handlePhoneChange = (event) => {
    const value = String(event.target.value).replace(/\D/g, "").slice(0, 10);

    setPhone(value);

    setPhoneVerificationToken("");

    setChallengeId("");

    setError("");
  };

  // ==========================================================

  // VALIDATE DETAILS

  // ==========================================================

  const validateAccountDetails = () => {
    const errors = {};

    const fullName = formData.fullName.trim();

    const email = formData.email.trim();

    if (!fullName) {
      errors.fullName = "Full name is required";
    } else if (fullName.length < 2) {
      errors.fullName = "Full name must contain at least 2 characters";
    }

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
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

  // CONTINUE TO MOBILE

  // ==========================================================

  const handleContinueToMobile = (event) => {
    event.preventDefault();

    clearMessages();

    if (!validateAccountDetails()) {
      return;
    }

    setScreen(SCREEN.MOBILE);
  };

  // ==========================================================

  // REQUEST REGISTRATION OTP

  // ==========================================================

  const requestRegistrationOtp = async () => {
    clearMessages();

    if (!WHATSAPP_AUTH_ENABLED) {
      setError("WhatsApp verification is currently unavailable.");

      return null;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");

      return null;
    }

    try {
      setLoading(true);

      const response = await whatsappOtpApi.requestRegistrationOtp(phone);

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
      console.error("Registration OTP request failed:", requestError);

      const backendMessage =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail;

      setError(
        backendMessage ||
          requestError?.message ||
          "Unable to send WhatsApp verification OTP.",
      );

      return null;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================

  // CREATE ACCOUNT

  // ==========================================================

  const createAccount = async (verificationToken) => {
    const payload = {
      fullName: formData.fullName.trim(),

      email: formData.email.trim().toLowerCase(),

      password: formData.password,

      phone,

      phoneVerificationToken: verificationToken,
    };

    const response = await authApi.register(payload);

    const token =
      response?.token ||
      response?.accessToken ||
      response?.data?.token ||
      response?.data?.accessToken;

    const registeredUser = response?.user || response?.data?.user || null;

    // ======================================================

    // FUTURE AUTO LOGIN SUPPORT

    // ======================================================

    if (token) {
      login(token, registeredUser, false);

      let authenticatedUser = registeredUser;

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

      if (destination) {
        navigate(destination, {
          replace: true,

          state: returnState,
        });

        return;
      }

      const role = authenticatedUser?.role || registeredUser?.role;

      if (role === "LIBRARY_OWNER") {
        navigate("/owner/dashboard", {
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

      return;
    }

    // ======================================================

    // CURRENT REGISTER ENDPOINT RETURNS STRING

    // ======================================================

    navigate("/login", {
      replace: true,

      state: {
        from: destination,

        ...returnState,

        message: "Account created successfully. Sign in to continue.",
      },
    });
  };

  // ==========================================================

  // VERIFY REGISTRATION OTP

  // ==========================================================

  const verifyRegistrationOtp = async (otp) => {
    clearMessages();

    try {
      setLoading(true);

      const response = await whatsappOtpApi.verifyRegistrationOtp({
        challengeId,

        otp,
      });

      const verificationToken =
        response?.verificationToken || response?.data?.verificationToken;

      if (!verificationToken) {
        throw new Error(
          "Phone verification token was not returned by the server.",
        );
      }

      setPhoneVerificationToken(verificationToken);

      await createAccount(verificationToken);
    } catch (requestError) {
      console.error("Registration failed:", requestError);

      const backendMessage =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.response?.data?.detail;

      setError(
        backendMessage ||
          requestError?.message ||
          "Unable to verify the number or create your account.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================

  // RESEND OTP

  // ==========================================================

  const handleResendOtp = async () => {
    return requestRegistrationOtp();
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

    if (screen === SCREEN.MOBILE) {
      setScreen(SCREEN.DETAILS);

      return;
    }

    navigate("/login", {
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

  // ACCOUNT DETAILS

  // ==========================================================

  const renderAccountDetails = () => (
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
          Create your account
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          Join {platformName} and discover verified study spaces near you.
        </Typography>
      </Box>

      {destination && returnState.action === "BOOK_SEAT" && (
        <Alert severity="info">
          Your selected membership plan, slot, date and seat will be restored
          after registration.
        </Alert>
      )}

      {error && (
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleContinueToMobile} noValidate>
        <Stack spacing={2.2}>
          <TextField
            fullWidth
            required
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            disabled={loading}
            error={Boolean(fieldErrors.fullName)}
            helperText={fieldErrors.fullName}
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

          <TextField
            fullWidth
            required
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
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

          <TextField
            fullWidth
            required
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
            error={Boolean(fieldErrors.password)}
            helperText={fieldErrors.password || "Minimum 6 characters"}
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

          <TextField
            fullWidth
            required
            label="Confirm Password"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
            error={Boolean(fieldErrors.confirmPassword)}
            helperText={fieldErrors.confirmPassword}
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
                      disabled={loading}
                      onClick={() =>
                        setShowConfirmPassword((previous) => !previous)
                      }
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Button
            fullWidth
            type="submit"
            size="large"
            variant="contained"
            disabled={loading}
            sx={{
              minHeight: 50,

              mt: 1,

              textTransform: "none",

              fontWeight: 800,
            }}
          >
            Continue
          </Button>
        </Stack>
      </Box>

      <Typography variant="body2" textAlign="center">
        Already have an account?{" "}
        <Link
          component="button"
          type="button"
          underline="hover"
          onClick={handleBack}
          sx={{
            fontWeight: 800,
          }}
        >
          Sign in
        </Link>
      </Typography>
    </Stack>
  );

  // ==========================================================

  // MOBILE

  // ==========================================================

  const renderMobileVerification = () => (
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
          Verify your mobile
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.75,
          }}
        >
          This verified number will be used for secure WhatsApp OTP login.
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
          placeholder="Enter mobile number"
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
        size="large"
        variant="contained"
        startIcon={<WhatsApp />}
        disabled={loading || phone.length !== 10 || !WHATSAPP_AUTH_ENABLED}
        onClick={requestRegistrationOtp}
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
          WhatsApp phone verification is currently disabled in this environment.
        </Alert>
      )}
    </Stack>
  );

  // ==========================================================

  // OTP

  // ==========================================================

  const renderOtpVerification = () => (
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
        title="Verify your number"
        description="Enter the 6-digit verification code sent to your WhatsApp number."
        submitLabel="Verify & Create Account"
        loadingLabel="Creating account..."
        onVerify={verifyRegistrationOtp}
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

            sm: screen === SCREEN.DETAILS ? 650 : 570,
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
          aria-label="Close registration"
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

        {screen === SCREEN.DETAILS && renderAccountDetails()}

        {screen === SCREEN.MOBILE && renderMobileVerification()}

        {screen === SCREEN.OTP && renderOtpVerification()}

        {screen === SCREEN.DETAILS && (
          <Typography
            variant="caption"
            color="text.secondary"
            textAlign="center"
            display="block"
            sx={{
              mt: 3,
            }}
          >
            By creating an account, you agree to our{" "}
            <Link href="/terms" underline="hover" color="inherit">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link href="/privacy" underline="hover" color="inherit">
              Privacy Policy
            </Link>
          </Typography>
        )}
      </Paper>
    </Modal>
  );
}

export default Register;
