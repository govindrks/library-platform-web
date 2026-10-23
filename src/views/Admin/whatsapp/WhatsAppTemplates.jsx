import {
    CheckCircleOutlineOutlined,
  DescriptionOutlined,
  Refresh,
  WhatsApp,
} from "@mui/icons-material";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from "@mui/material";

import { useCallback, useEffect, useState } from "react";

import whatsappAdminApi from "../../../api/whatsappAdminApi";

// ============================================================
// HELPERS
// ============================================================

function formatEnumLabel(value) {
  if (!value) {
    return "—";
  }

  return String(value)
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDateTime(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",

    timeStyle: "short",
  }).format(date);
}

// ============================================================
// STATUS CHIP
// ============================================================

function TemplateStatusChip({ status }) {
  const normalizedStatus = String(status || "UNKNOWN")
    .trim()
    .toUpperCase();

  const color =
    normalizedStatus === "APPROVED"
      ? "success"
      : normalizedStatus === "REJECTED"
        ? "error"
        : normalizedStatus === "PENDING"
          ? "warning"
          : "default";

  return (
    <Chip
      size="small"
      color={color}
      variant="outlined"
      label={formatEnumLabel(normalizedStatus)}
      icon={
        normalizedStatus === "APPROVED" ? <CheckCircleOutlineOutlined /> : undefined
      }
      sx={{
        fontWeight: 700,
      }}
    />
  );
}

// ============================================================
// WHATSAPP TEMPLATES
// ============================================================

function WhatsAppTemplates() {
  // ==========================================================
  // STATE
  // ==========================================================

  const [templates, setTemplates] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ==========================================================
  // LOAD
  // ==========================================================

  const loadTemplates = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response = await whatsappAdminApi.getTemplates();

      const data = response?.data ?? response ?? [];

      const list = Array.isArray(data)
        ? data
        : (data.content ?? data.templates ?? []);

      setTemplates(list);
    } catch (exception) {
      setTemplates([]);

      setError(
        exception?.response?.data?.message ||
          exception?.response?.data?.error ||
          exception?.message ||
          "Unable to load WhatsApp templates.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        width: "100%",

        p: {
          xs: 2,

          md: 3,
        },
      }}
    >
      <Stack spacing={3}>
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <Stack
          direction={{
            xs: "column",

            sm: "row",
          }}
          spacing={2}
          alignItems={{
            xs: "flex-start",

            sm: "center",
          }}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1.25} alignItems="center">
            <WhatsApp
              sx={{
                color: "#25D366",

                fontSize: 32,
              }}
            />

            <Box>
              <Typography variant="h4" fontWeight={800}>
                WhatsApp Templates
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Review LibraryHub WhatsApp message template configuration and
                approval status.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<Refresh />}
            disabled={loading}
            onClick={loadTemplates}
          >
            Refresh
          </Button>
        </Stack>

        {/* ================================================= */}
        {/* INFO */}
        {/* ================================================= */}

        <Alert severity="info">
          Templates are centrally managed by LibraryHub. Library owners should
          not enter Meta template names, access tokens or WhatsApp Business
          credentials.
        </Alert>

        {/* ================================================= */}
        {/* ROLLOUT */}
        {/* ================================================= */}

        <Alert severity="warning">
          Meta production template setup will be completed after LibraryHub
          hosting is ready. Local template definitions do not mean that a
          template has been approved by Meta.
        </Alert>

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <Box
            sx={{
              display: "flex",

              justifyContent: "center",

              py: 5,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading && !error && templates.length === 0 && (
          <Card
            elevation={0}
            sx={{
              border: "1px solid",

              borderColor: "divider",

              borderRadius: 3,
            }}
          >
            <CardContent
              sx={{
                py: 6,

                textAlign: "center",
              }}
            >
              <DescriptionOutlined
                sx={{
                  fontSize: 48,

                  color: "text.disabled",
                }}
              />

              <Typography
                variant="h6"
                fontWeight={800}
                sx={{
                  mt: 1,
                }}
              >
                No templates available
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mt: 0.5,
                }}
              >
                WhatsApp template definitions will appear here once the backend
                template registry is connected.
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* ================================================= */}
        {/* TEMPLATE LIST */}
        {/* ================================================= */}

        {!loading &&
          templates.map((template, index) => {
            const templateId = template.id ?? template.name ?? index;

            const name =
              template.name || template.templateName || "Unnamed template";

            const category = template.category || template.templateCategory;

            const language = template.language || template.languageCode || "—";

            const status =
              template.status || template.approvalStatus || "UNKNOWN";

            const notificationType = template.notificationType || template.type;

            const description = template.description || template.purpose;

            const updatedAt = template.updatedAt || template.lastUpdatedAt;

            return (
              <Card
                key={templateId}
                elevation={0}
                sx={{
                  border: "1px solid",

                  borderColor: "divider",

                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* ===================================== */}
                    {/* TOP */}
                    {/* ===================================== */}

                    <Stack
                      direction={{
                        xs: "column",

                        sm: "row",
                      }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{
                        xs: "flex-start",

                        sm: "center",
                      }}
                    >
                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          {name}
                        </Typography>

                        {description && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mt: 0.4,

                              maxWidth: 720,
                            }}
                          >
                            {description}
                          </Typography>
                        )}
                      </Box>

                      <TemplateStatusChip status={status} />
                    </Stack>

                    <Divider />

                    {/* ===================================== */}
                    {/* META */}
                    {/* ===================================== */}

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      sx={{
                        gap: 1,
                      }}
                    >
                      <Chip
                        size="small"
                        label={`Category: ${formatEnumLabel(category)}`}
                      />

                      <Chip size="small" label={`Language: ${language}`} />

                      {notificationType && (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={formatEnumLabel(notificationType)}
                        />
                      )}
                    </Stack>

                    {/* ===================================== */}
                    {/* UPDATE */}
                    {/* ===================================== */}

                    <Typography variant="caption" color="text.secondary">
                      Last updated: {formatDateTime(updatedAt)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
      </Stack>
    </Box>
  );
}

export default WhatsAppTemplates;
