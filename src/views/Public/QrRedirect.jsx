import {
  CheckCircleOutlineOutlined,
  ErrorOutlineOutlined,
  QrCode2Outlined,
  RefreshOutlined,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import qrCampaignApi from "../../api/qrCampaignApi";

// ============================================================
// ERROR HELPER
// ============================================================

const getErrorMessage = (error, fallback) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
};

// ============================================================
// QR REDIRECT
// ============================================================

function QrRedirect() {
  const theme = useTheme();

  const navigate = useNavigate();

  const { code } = useParams();

  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [campaignType, setCampaignType] = useState("");

  const [destinationUrl, setDestinationUrl] = useState("");

  // ==========================================================
  // DUPLICATE REQUEST GUARD
  // ==========================================================
  //
  // React StrictMode may execute effects more than once while
  // developing.
  //
  // Without this guard, one QR scan could generate duplicate
  // analytics requests during development.
  //
  // ==========================================================

  const resolvingRef = useRef(false);

  // ==========================================================
  // NORMALIZED CODE
  // ==========================================================

  const normalizedCode = String(code || "")
    .trim()
    .toUpperCase();

  // ==========================================================
  // RESOLVE QR
  // ==========================================================

  const resolveQr = useCallback(
    async ({ force = false } = {}) => {
      if (!normalizedCode) {
        setLoading(false);

        setError("This QR code is invalid.");

        return;
      }

      if (resolvingRef.current && !force) {
        return;
      }

      try {
        resolvingRef.current = true;

        setLoading(true);

        setError("");

        setDestinationUrl("");

        const response = await qrCampaignApi.resolvePublicQr(normalizedCode);

        if (!response?.destinationUrl) {
          throw new Error("QR destination was not returned.");
        }

        if (response?.active === false) {
          throw new Error("This QR campaign is no longer active.");
        }

        setCampaignType(response?.type || "");

        setDestinationUrl(response.destinationUrl);

        // ====================================================
        // REDIRECT
        // ====================================================
        //
        // replace() is intentional.
        //
        // The QR resolver page should normally not remain in
        // browser history.
        //
        // ====================================================

        window.location.replace(response.destinationUrl);
      } catch (requestError) {
        console.error("Unable to resolve QR campaign:", requestError);

        setError(
          getErrorMessage(requestError, "This QR code could not be opened."),
        );

        resolvingRef.current = false;
      } finally {
        setLoading(false);
      }
    },
    [normalizedCode],
  );

  // ==========================================================
  // INITIAL RESOLUTION
  // ==========================================================

  useEffect(() => {
    resolveQr();
  }, [resolveQr]);

  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry = () => {
    resolvingRef.current = false;

    resolveQr({
      force: true,
    });
  };

  // ==========================================================
  // HOME
  // ==========================================================

  const handleGoHome = () => {
    navigate("/", {
      replace: true,
    });
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: {
          xs: "calc(100vh - 72px)",
          md: "calc(100vh - 72px)",
        },

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        px: 2,

        py: {
          xs: 5,
          md: 8,
        },

        background: `
          radial-gradient(
            circle at top left,
            ${alpha(theme.palette.primary.main, 0.11)},
            transparent 34%
          ),
          radial-gradient(
            circle at bottom right,
            ${alpha(theme.palette.secondary.main, 0.08)},
            transparent 32%
          )
        `,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",

          maxWidth: 520,

          borderRadius: 4,

          border: "1px solid",

          borderColor: alpha(theme.palette.divider, 0.85),

          p: {
            xs: 3,
            sm: 4.5,
          },

          textAlign: "center",

          boxShadow:
            theme.palette.mode === "dark"
              ? "0 24px 70px rgba(0,0,0,.25)"
              : "0 24px 70px rgba(15,23,42,.08)",
        }}
      >
        <Stack spacing={2.5} alignItems="center">
          {/* =============================================== */}
          {/* ICON */}
          {/* =============================================== */}

          <Box
            sx={{
              width: 76,

              height: 76,

              display: "grid",

              placeItems: "center",

              borderRadius: 3,

              bgcolor: error
                ? alpha(theme.palette.error.main, 0.08)
                : alpha(theme.palette.primary.main, 0.08),

              color: error ? "error.main" : "primary.main",
            }}
          >
            {error ? (
              <ErrorOutlineOutlined
                sx={{
                  fontSize: 42,
                }}
              />
            ) : (
              <QrCode2Outlined
                sx={{
                  fontSize: 42,
                }}
              />
            )}
          </Box>

          {/* =============================================== */}
          {/* LOADING */}
          {/* =============================================== */}

          {loading && !error && (
            <>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={850}
                  sx={{
                    letterSpacing: "-0.03em",
                  }}
                >
                  Opening LibraryHub
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.7,
                  }}
                >
                  We're checking this QR code and taking you to the right
                  library page.
                </Typography>
              </Box>

              <CircularProgress size={30} />

              {normalizedCode && (
                <Typography variant="caption" color="text.secondary">
                  QR code: {normalizedCode}
                </Typography>
              )}
            </>
          )}

          {/* =============================================== */}
          {/* DESTINATION RESOLVED */}
          {/* =============================================== */}

          {!loading && !error && destinationUrl && (
            <>
              <CheckCircleOutlineOutlined
                color="success"
                sx={{
                  fontSize: 42,
                }}
              />

              <Typography variant="h6" fontWeight={800}>
                QR verified
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Taking you to the requested LibraryHub page...
              </Typography>

              {campaignType && (
                <Typography variant="caption" color="text.secondary">
                  Campaign type:{" "}
                  {String(campaignType).replaceAll("_", " ").toLowerCase()}
                </Typography>
              )}
            </>
          )}

          {/* =============================================== */}
          {/* ERROR */}
          {/* =============================================== */}

          {error && (
            <>
              <Box>
                <Typography
                  variant="h5"
                  fontWeight={850}
                  sx={{
                    letterSpacing: "-0.03em",
                  }}
                >
                  QR unavailable
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.7,
                  }}
                >
                  The QR may be invalid, inactive, archived or no longer
                  available.
                </Typography>
              </Box>

              <Alert
                severity="error"
                sx={{
                  width: "100%",

                  borderRadius: 2.5,

                  textAlign: "left",
                }}
              >
                {error}
              </Alert>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1.25}
                width="100%"
              >
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RefreshOutlined />}
                  onClick={handleRetry}
                  sx={{
                    minHeight: 46,

                    borderRadius: 2.5,

                    fontWeight: 750,

                    boxShadow: "none",
                  }}
                >
                  Try Again
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleGoHome}
                  sx={{
                    minHeight: 46,

                    borderRadius: 2.5,

                    fontWeight: 750,
                  }}
                >
                  Go to LibraryHub
                </Button>
              </Stack>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default QrRedirect;
