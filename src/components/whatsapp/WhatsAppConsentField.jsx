import { InfoOutlined, WhatsApp } from "@mui/icons-material";

import {
  Alert,
  Box,
  Checkbox,
  FormControlLabel,
  Link,
  Stack,
  Typography,
} from "@mui/material";

// ============================================================
// WHATSAPP CONSENT FIELD
// ============================================================
//
// Reusable in:
//
// - Registration
// - Student profile
// - Notification preferences
// - Owner/member management
//
// IMPORTANT:
//
// Login OTP is an authentication flow and should NOT depend on
// marketing/message-preference consent.
//
// This consent is intended for eligible non-authentication
// WhatsApp notifications.
//
// ============================================================

function WhatsAppConsentField({
  checked = false,

  onChange,

  disabled = false,

  error = "",

  helperText = "",

  required = false,

  title = "WhatsApp notifications",

  description = "Receive important LibraryHub updates on WhatsApp.",

  showPolicyLink = true,

  policyHref = "/privacy",

  compact = false,
}) {
  // ==========================================================
  // CHANGE
  // ==========================================================

  const handleChange = (event) => {
    onChange?.(event.target.checked);
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        border: "1px solid",

        borderColor: error ? "error.main" : "divider",

        borderRadius: 2.5,

        p: compact ? 1.75 : 2.25,

        backgroundColor: checked
          ? "rgba(37, 211, 102, 0.045)"
          : "background.paper",

        transition: "background-color 0.2s ease, border-color 0.2s ease",
      }}
    >
      <Stack spacing={1.25}>
        {/* ================================================= */}
        {/* CONSENT */}
        {/* ================================================= */}

        <FormControlLabel
          disabled={disabled}
          control={
            <Checkbox
              checked={checked}
              onChange={handleChange}
              color="success"
              inputProps={{
                "aria-label": title,
              }}
            />
          }
          label={
            <Stack direction="row" spacing={1} alignItems="center">
              <WhatsApp
                sx={{
                  color: "#25D366",

                  fontSize: 21,
                }}
              />

              <Typography variant="body1" fontWeight={700}>
                {title}

                {required && (
                  <Box
                    component="span"
                    color="error.main"
                    sx={{
                      ml: 0.5,
                    }}
                  >
                    *
                  </Box>
                )}
              </Typography>
            </Stack>
          }
          sx={{
            m: 0,

            alignItems: "flex-start",

            "& .MuiCheckbox-root": {
              pt: 0.25,
            },
          }}
        />

        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            pl: {
              xs: 0,

              sm: 4.5,
            },
          }}
        >
          {description}
        </Typography>

        {/* ================================================= */}
        {/* WHAT USER AGREES TO */}
        {/* ================================================= */}

        {!compact && (
          <Box
            sx={{
              ml: {
                xs: 0,

                sm: 4.5,
              },

              px: 1.5,

              py: 1.25,

              borderRadius: 2,

              backgroundColor: "rgba(25, 118, 210, 0.045)",
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <InfoOutlined
                color="primary"
                sx={{
                  fontSize: 18,

                  mt: 0.15,
                }}
              />

              <Typography variant="caption" color="text.secondary">
                By enabling this, you agree to receive eligible service
                notifications such as payment confirmations, invoices and other
                LibraryHub account updates on your registered WhatsApp number.
              </Typography>
            </Stack>
          </Box>
        )}

        {/* ================================================= */}
        {/* POLICY */}
        {/* ================================================= */}

        {showPolicyLink && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              pl: {
                xs: 0,

                sm: 4.5,
              },
            }}
          >
            You can change this preference later.{" "}
            <Link href={policyHref} underline="hover">
              Privacy policy
            </Link>
          </Typography>
        )}

        {/* ================================================= */}
        {/* HELPER */}
        {/* ================================================= */}

        {helperText && !error && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              pl: {
                xs: 0,

                sm: 4.5,
              },
            }}
          >
            {helperText}
          </Typography>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mt: 0.5,
            }}
          >
            {error}
          </Alert>
        )}
      </Stack>
    </Box>
  );
}

export default WhatsAppConsentField;
