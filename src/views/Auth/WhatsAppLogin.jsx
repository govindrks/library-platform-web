import {
  ArrowBack,
  PhoneAndroidOutlined,
  SecurityOutlined,
  WhatsApp,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useMemo, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import whatsappOtpApi from "../../api/whatsappOtpApi";

import OtpVerificationForm from "../../components/whatsapp/OtpVerificationForm";

import { useAuth } from "../../context/AuthContext";

import usePlatformConfig from "../../hooks/usePlatformConfig";

// ============================================================

// CONFIGURATION

// ============================================================

const WHATSAPP_AUTH_ENABLED =
  String(
    import.meta.env.VITE_WHATSAPP_AUTH_ENABLED ?? "false",
  ).toLowerCase() === "true";

// ============================================================

// WHATSAPP LOGIN PAGE

// ============================================================

function WhatsAppLogin() {
  const navigate = useNavigate();

  const location = useLocation();

  // ==========================================================

  // AUTH CONTEXT

  // ==========================================================

  const { login, refreshProfile } = useAuth();

  const { platformName, brandInitial } = usePlatformConfig();

  // ==========================================================

  // ORIGINAL DESTINATION

  // ==========================================================

  const destination = location.state?.from || null;

  // ==========================================================

  // PRESERVE COMPLETE RETURN STATE

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

  // STATE

  // ==========================================================

  const [phone, setPhone] = useState("");

  const [challengeId, setChallengeId] = useState(null);

  const [otpRequested, setOtpRequested] = useState(false);

  const [resendAfterSeconds, setResendAfterSeconds] = useState(60);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // ==========================================================

  // NORMALIZE MOBILE

  // ==========================================================

  const normalizePhone = (value) => {
    let digits = String(value || "").replace(/\D/g, "");

    if (digits.length === 12 && digits.startsWith("91")) {
      digits = digits.slice(2);
    }

    if (digits.length === 11 && digits.startsWith("0")) {
      digits = digits.slice(1);
    }

    return digits.slice(0, 10);
  };

  // ==========================================================

  // VALIDATE PHONE

  // ==========================================================

  const isValidPhone = (value) => {
    return /^[6-9]\d{9}$/.test(value);
  };

  // ==========================================================

  // ERROR EXTRACTION

  // ==========================================================

  const resolveError = (exception, fallback) => {
    return (
      exception?.response?.data?.message ||
      exception?.response?.data?.error ||
      exception?.response?.data?.detail ||
      exception?.message ||
      fallback
    );
  };

  // ==========================================================

  // PHONE CHANGE

  // ==========================================================

  const handlePhoneChange = (event) => {
    setPhone(normalizePhone(event.target.value));

    setError("");

    setSuccess("");
  };

  // ==========================================================

  // REQUEST OTP

  // ==========================================================

  const requestOtp = async () => {
    setError("");

    setSuccess("");

    if (!isValidPhone(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");

      return null;
    }

    // ======================================================

    // DEVELOPMENT MODE

    // ======================================================

    if (!WHATSAPP_AUTH_ENABLED) {
      setError(
        "WhatsApp login is currently unavailable because Meta WhatsApp integration has not yet been enabled.",
      );

      return null;
    }

    try {
      setLoading(true);

      const response = await whatsappOtpApi.requestOtp(phone);

      const nextChallengeId =
        response?.challengeId || response?.data?.challengeId;

      if (!nextChallengeId) {
        throw new Error("OTP challenge ID was not returned by the server.");
      }

      const backendResendSeconds =
        response?.resendAfterSeconds ??
        response?.data?.resendAfterSeconds ??
        60;

      const nextResendSeconds = Number(backendResendSeconds);

      setChallengeId(nextChallengeId);

      setResendAfterSeconds(
        Number.isFinite(nextResendSeconds) ? nextResendSeconds : 60,
      );

      setOtpRequested(true);

      setSuccess("OTP sent successfully to your registered WhatsApp number.");

      return {
        challengeId: nextChallengeId,

        resendAfterSeconds: Number.isFinite(nextResendSeconds)
          ? nextResendSeconds
          : 60,
      };
    } catch (exception) {
      setError(resolveError(exception, "Unable to send WhatsApp OTP."));

      return null;
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================

  // INITIAL OTP REQUEST

  // ==========================================================

  const handleRequestOtp = async (event) => {
    event.preventDefault();

    await requestOtp();
  };

  // ==========================================================

  // RESEND OTP

  // ==========================================================

  const handleResend = async () => {
    const result = await requestOtp();

    if (!result) {
      return {
        resendAfterSeconds: 0,
      };
    }

    return result;
  };

  // ==========================================================

  // VERIFY OTP

  // ==========================================================

  const handleVerifyOtp = async (otp) => {
    setError("");

    setSuccess("");

    if (!challengeId) {
      setError("OTP session was not found. Please request a new OTP.");

      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter the complete 6-digit OTP.");

      return;
    }

    if (!WHATSAPP_AUTH_ENABLED) {
      setError("WhatsApp login is currently disabled.");

      return;
    }

    try {
      setLoading(true);

      const response = await whatsappOtpApi.verifyOtp({
        challengeId,

        otp,
      });

      await completeLogin(response);
    } catch (exception) {
      setError(
        resolveError(
          exception,

          "OTP verification failed. Please check the code and try again.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================

  // COMPLETE LOGIN

  // ==========================================================

  const completeLogin = async (response) => {
    // ======================================================

    // NORMALIZE AUTH RESPONSE

    // ======================================================

    const token =
      response?.token ||
      response?.accessToken ||
      response?.data?.token ||
      response?.data?.accessToken;

    const loginUser = response?.user || response?.data?.user || null;

    if (!token) {
      throw new Error("Authentication token was not returned by the server.");
    }

    // ======================================================

    // STORE AUTHENTICATION

    // ======================================================

    //

    // Same AuthContext flow used by email/password login.

    //

    // WhatsApp login is treated as persistent login here.

    //

    // ======================================================

    login(token, loginUser, true);

    // ======================================================

    // LOAD CANONICAL PROFILE

    // ======================================================

    let authenticatedUser = loginUser;

    try {
      const profile = await refreshProfile();

      if (profile) {
        authenticatedUser = profile;
      }
    } catch (profileError) {
      console.warn(
        "Unable to refresh profile after WhatsApp login:",

        profileError,
      );
    }

    // ======================================================

    // RESOLVE ROLE

    // ======================================================

    const authenticatedRole = authenticatedUser?.role || loginUser?.role;

    // ======================================================

    // ADMIN PROTECTION

    // ======================================================

    //

    // ADMIN must continue using email/password authentication.

    //

    // Backend should enforce this too.

    //

    // ======================================================

    if (authenticatedRole === "ADMIN") {
      throw new Error(
        "Administrator accounts must use email and password login.",
      );
    }

    // ======================================================

    // RETURN TO ORIGINAL DESTINATION

    // ======================================================

    if (destination) {
      navigate(destination, {
        replace: true,

        state: returnState,
      });

      return;
    }

    // ======================================================

    // OWNER

    // ======================================================

    if (authenticatedRole === "LIBRARY_OWNER") {
      navigate("/owner/dashboard", {
        replace: true,
      });

      return;
    }

    // ======================================================

    // STUDENT

    // ======================================================

    if (authenticatedRole === "USER") {
      navigate("/student/dashboard", {
        replace: true,
      });

      return;
    }

    // ======================================================

    // FALLBACK

    // ======================================================

    navigate("/dashboard", {
      replace: true,
    });
  };

  // ==========================================================

  // CHANGE NUMBER

  // ==========================================================

  const handleChangeNumber = () => {
    setChallengeId(null);

    setOtpRequested(false);

    setResendAfterSeconds(60);

    setError("");

    setSuccess("");
  };

  // ==========================================================

  // EMAIL LOGIN

  // ==========================================================

  const goToEmailLogin = () => {
    navigate("/login", {
      state: {
        from: destination,

        ...returnState,
      },
    });
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

  // PAGE

  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        px: 2,

        py: 4,

        background:
          "linear-gradient(135deg, #f8fbff 0%, #eef7ff 55%, #f5fff8 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",

          maxWidth: 480,

          p: {
            xs: 3,

            sm: 5,
          },

          border: "1px solid",

          borderColor: "divider",

          borderRadius: 4,

          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Stack spacing={3}>
          {/* ================================================= */}

          {/* BRAND */}

          {/* ================================================= */}

          <Box textAlign="center">
            <Box
              sx={{
                width: 54,

                height: 54,

                mx: "auto",

                mb: 1.5,

                borderRadius: 2.5,

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                backgroundColor: "primary.main",

                color: "white",

                fontSize: 24,

                fontWeight: 800,
              }}
            >
              {brandInitial}
            </Box>

            <Typography variant="h5" fontWeight={800}>
              {platformName}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Find. Book. Study. Grow.
            </Typography>
          </Box>

          {/* ================================================= */}

          {/* BOOKING CONTEXT */}

          {/* ================================================= */}

          {destination && returnState.action === "BOOK_SEAT" && (
            <Alert severity="info">
              Sign in with WhatsApp to continue your seat booking. Your selected
              plan, floor, slot, date and seat will be restored automatically.
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

          {/* SUCCESS */}

          {/* ================================================= */}

          {success && (
            <Alert severity="success" onClose={() => setSuccess("")}>
              {success}
            </Alert>
          )}

          {/* ================================================= */}

          {/* DEVELOPMENT STATUS */}

          {/* ================================================= */}

          {!WHATSAPP_AUTH_ENABLED && (
            <Alert severity="info">
              WhatsApp login UI is ready. Live OTP sending will be enabled after
              {platformName} is deployed and Meta WhatsApp is configured.
            </Alert>
          )}

          {/* ================================================= */}

          {/* PHONE ENTRY */}

          {/* ================================================= */}

          {!otpRequested && (
            <Box component="form" onSubmit={handleRequestOtp}>
              <Stack spacing={2.5}>
                <Box>
                  <Typography variant="h5" fontWeight={700}>
                    WhatsApp Login
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 0.75,
                    }}
                  >
                    Enter your registered mobile number to receive a secure
                    login code on WhatsApp.
                  </Typography>
                </Box>

                {/* =========================================== */}

                {/* PHONE */}

                {/* =========================================== */}

                <TextField
                  fullWidth
                  required
                  autoFocus
                  label="Mobile number"
                  placeholder="9876543210"
                  value={phone}
                  disabled={loading}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",

                      maxLength: 10,
                    },

                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <PhoneAndroidOutlined fontSize="small" />

                            <Typography fontWeight={700}>+91</Typography>
                          </Stack>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {/* =========================================== */}

                {/* SEND OTP */}

                {/* =========================================== */}

                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? null : <WhatsApp />}
                  sx={{
                    minHeight: 50,

                    borderRadius: 2.25,

                    fontWeight: 800,

                    textTransform: "none",

                    backgroundColor: "#25D366",

                    "&:hover": {
                      backgroundColor: "#1ebe5d",
                    },
                  }}
                >
                  {loading ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CircularProgress size={20} color="inherit" />

                      <span>Sending OTP...</span>
                    </Stack>
                  ) : destination && returnState.action === "BOOK_SEAT" ? (
                    "Send OTP & Continue Booking"
                  ) : (
                    "Send OTP on WhatsApp"
                  )}
                </Button>

                {/* =========================================== */}

                {/* SECURITY */}

                {/* =========================================== */}

                <Box
                  sx={{
                    p: 2,

                    borderRadius: 2.5,

                    backgroundColor: "rgba(25, 118, 210, 0.06)",
                  }}
                >
                  <Stack direction="row" spacing={1.25} alignItems="flex-start">
                    <SecurityOutlined color="primary" />

                    <Box>
                      <Typography variant="body2" fontWeight={700}>
                        Secure OTP login
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        No password is required. WhatsApp login is available for
                        registered Student and Library Owner accounts.
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          )}

          {/* ================================================= */}

          {/* OTP VERIFICATION */}

          {/* ================================================= */}

          {otpRequested && (
            <OtpVerificationForm
              phone={phone}
              loading={loading}
              resendAfterSeconds={resendAfterSeconds}
              onVerify={handleVerifyOtp}
              onResend={handleResend}
              onChangeNumber={handleChangeNumber}
            />
          )}

          {/* ================================================= */}

          {/* EMAIL LOGIN */}

          {/* ================================================= */}

          <Button
            type="button"
            variant="text"
            startIcon={<ArrowBack />}
            disabled={loading}
            onClick={goToEmailLogin}
          >
            Sign in with email
          </Button>

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
              onClick={handleRegister}
            >
              Create account
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default WhatsAppLogin;
