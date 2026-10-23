import {
  ArrowBack,
  ArrowForward,
  Refresh,
  SecurityOutlined,
} from "@mui/icons-material";

import {
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useEffect, useRef, useState } from "react";

// ============================================================
// CONSTANTS
// ============================================================

const OTP_LENGTH = 6;

// ============================================================
// OTP VERIFICATION FORM
// ============================================================

function OtpVerificationForm({
  phone,

  loading = false,

  resendAfterSeconds = 60,

  title = "Verify your number",

  description = "Enter the 6-digit code sent to your WhatsApp number.",

  submitLabel = "Verify & Sign In",

  loadingLabel = "Verifying...",

  onVerify,

  onResend,

  onChangeNumber,
}) {
  // ==========================================================
  // OTP STATE
  // ==========================================================

  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(""));

  const [resendSeconds, setResendSeconds] = useState(resendAfterSeconds);

  const inputRefs = useRef([]);

  // ==========================================================
  // RESET COUNTDOWN
  // ==========================================================

  useEffect(() => {
    setResendSeconds(resendAfterSeconds);
  }, [resendAfterSeconds]);

  // ==========================================================
  // COUNTDOWN
  // ==========================================================

  useEffect(() => {
    if (resendSeconds <= 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setResendSeconds((previous) => Math.max(previous - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  // ==========================================================
  // MASK PHONE
  // ==========================================================

  const maskPhone = () => {
    const normalized = String(phone || "").replace(/\D/g, "");

    const localNumber = normalized.startsWith("91")
      ? normalized.slice(2)
      : normalized;

    if (localNumber.length < 4) {
      return "+91";
    }

    return "+91 ••••••" + localNumber.slice(-4);
  };

  // ==========================================================
  // OTP
  // ==========================================================

  const otp = digits.join("");

  const isComplete = otp.length === OTP_LENGTH && digits.every(Boolean);

  // ==========================================================
  // DIGIT CHANGE
  // ==========================================================

  const handleChange = (index, event) => {
    const value = String(event.target.value).replace(/\D/g, "").slice(-1);

    const nextDigits = [...digits];

    nextDigits[index] = value;

    setDigits(nextDigits);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ==========================================================
  // KEYBOARD
  // ==========================================================

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ==========================================================
  // PASTE OTP
  // ==========================================================

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const nextDigits = Array(OTP_LENGTH).fill("");

    pastedValue.split("").forEach((digit, index) => {
      nextDigits[index] = digit;
    });

    setDigits(nextDigits);

    const targetIndex = Math.min(pastedValue.length, OTP_LENGTH) - 1;

    window.setTimeout(() => {
      inputRefs.current[targetIndex]?.focus();
    }, 0);
  };

  // ==========================================================
  // VERIFY
  // ==========================================================

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!isComplete || loading) {
      return;
    }

    onVerify?.(otp);
  };

  // ==========================================================
  // RESEND
  // ==========================================================

  const handleResend = async () => {
    if (resendSeconds > 0 || loading) {
      return;
    }

    const result = await onResend?.();

    const nextCountdown =
      result?.resendAvailableInSeconds ??
      result?.resendAfterSeconds ??
      resendAfterSeconds;

    setResendSeconds(nextCountdown);

    setDigits(Array(OTP_LENGTH).fill(""));

    window.setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 0);
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {title}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 0.75,
            }}
          >
            {description}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              mt: 0.75,
            }}
          >
            Code sent to{" "}
            <Box
              component="span"
              sx={{
                fontWeight: 800,
              }}
            >
              {maskPhone()}
            </Box>
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={{
            xs: 0.6,
            sm: 1,
          }}
          justifyContent="center"
          onPaste={handlePaste}
        >
          {digits.map((digit, index) => (
            <TextField
              key={index}
              value={digit}
              autoFocus={index === 0}
              disabled={loading}
              inputRef={(element) => {
                inputRefs.current[index] = element;
              }}
              onChange={(event) => handleChange(index, event)}
              onKeyDown={(event) => handleKeyDown(index, event)}
              inputProps={{
                inputMode: "numeric",

                pattern: "[0-9]*",

                maxLength: 1,

                "aria-label": `OTP digit ${index + 1}`,
              }}
              sx={{
                width: {
                  xs: 42,
                  sm: 50,
                },

                "& input": {
                  p: {
                    xs: "12px 3px",
                    sm: "14px 5px",
                  },

                  textAlign: "center",

                  fontSize: "1.2rem",

                  fontWeight: 800,
                },

                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                },
              }}
            />
          ))}
        </Stack>

        <Button
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          disabled={loading || !isComplete}
          endIcon={loading ? null : <ArrowForward />}
          sx={{
            minHeight: 50,
            textTransform: "none",
            fontWeight: 800,
          }}
        >
          {loading ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} color="inherit" />

              <span>{loadingLabel}</span>
            </Stack>
          ) : (
            submitLabel
          )}
        </Button>

        <Box textAlign="center">
          {resendSeconds > 0 ? (
            <Typography variant="body2" color="text.secondary">
              Resend OTP in{" "}
              <Box component="span" fontWeight={800}>
                {resendSeconds}s
              </Box>
            </Typography>
          ) : (
            <Button
              type="button"
              variant="text"
              startIcon={<Refresh />}
              disabled={loading}
              onClick={handleResend}
              sx={{
                textTransform: "none",
              }}
            >
              Resend OTP
            </Button>
          )}
        </Box>

        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(25,118,210,0.05)",
          }}
        >
          <Stack direction="row" spacing={1.25}>
            <SecurityOutlined color="primary" fontSize="small" />

            <Typography variant="caption" color="text.secondary">
              The OTP expires after a few minutes and can only be used once.
            </Typography>
          </Stack>
        </Box>

        {onChangeNumber && (
          <Button
            type="button"
            variant="text"
            color="inherit"
            startIcon={<ArrowBack />}
            disabled={loading}
            onClick={onChangeNumber}
            sx={{
              textTransform: "none",
            }}
          >
            Change mobile number
          </Button>
        )}
      </Stack>
    </Box>
  );
}

export default OtpVerificationForm;
