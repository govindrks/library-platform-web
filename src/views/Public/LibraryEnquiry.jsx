import {
  ArrowBackRounded,
  CheckCircleRounded,
  EmailRounded,
  LocalPhoneRounded,
  LocationOnRounded,
  SendRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

import { useCallback, useEffect, useMemo, useState } from "react";

import { useLocation, useNavigate, useParams } from "react-router-dom";

import libraryApi from "../../api/libraryApi";
import libraryEnquiryApi from "../../api/libraryEnquiryApi";
import membershipPlanApi from "../../api/membershipPlanApi";
import qrCampaignApi from "../../api/qrCampaignApi";

// ============================================================
// HELPERS
// ============================================================

const normalizeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

const formatMoney = (value) => {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) {
    return "";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const getPlanStartingPrice = (plan) => {
  const values = [];

  const legacyPrice = Number(plan?.price);

  if (Number.isFinite(legacyPrice) && legacyPrice > 0) {
    values.push(legacyPrice);
  }

  if (Array.isArray(plan?.seatPrices)) {
    plan.seatPrices
      .filter((item) => item?.active !== false)
      .forEach((item) => {
        const amount = Number(item?.price);

        if (Number.isFinite(amount) && amount > 0) {
          values.push(amount);
        }
      });
  }

  return values.length > 0 ? Math.min(...values) : null;
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return (
    data?.message || data?.error || data?.detail || error?.message || fallback
  );
};

const buildAddress = (library) => {
  if (!library) {
    return "";
  }

  return [library.address, library.city, library.state, library.pincode]
    .filter(Boolean)
    .join(", ");
};

// ============================================================
// PAGE
// ============================================================

function LibraryEnquiry() {
  const theme = useTheme();

  const navigate = useNavigate();

  const location = useLocation();

  const { libraryId } = useParams();

  // ==========================================================
  // QR ATTRIBUTION
  // ==========================================================

  const qrAttribution = useMemo(
    () => qrCampaignApi.getQrAttributionFromUrl(location.search),
    [location.search],
  );

  const searchParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const queryPlanId = searchParams.get("membershipPlanId") || "";

  // ==========================================================
  // STATE
  // ==========================================================

  const [library, setLibrary] = useState(null);

  const [plans, setPlans] = useState([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    membershipPlanId: queryPlanId,
    message: "",
  });

  // ==========================================================
  // LOAD LIBRARY + PLANS
  // ==========================================================

  const loadData = useCallback(async () => {
    if (!libraryId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [libraryResponse, planResponse] = await Promise.all([
        libraryApi.getLibraryDetails(libraryId),
        membershipPlanApi.getActivePlans(libraryId),
      ]);

      setLibrary(libraryResponse || null);

      const planList = normalizeList(planResponse).filter(
        (plan) => plan?.active !== false,
      );

      setPlans(planList);

      if (queryPlanId) {
        const exists = planList.some(
          (plan) => String(plan.id) === String(queryPlanId),
        );

        if (!exists) {
          setForm((current) => ({
            ...current,
            membershipPlanId: "",
          }));
        }
      }
    } catch (requestError) {
      console.error("Unable to load membership enquiry page:", requestError);

      setError(
        getErrorMessage(requestError, "Unable to load library information."),
      );
    } finally {
      setLoading(false);
    }
  }, [libraryId, queryPlanId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ==========================================================
  // SELECTED PLAN
  // ==========================================================

  const selectedPlan = useMemo(
    () =>
      plans.find((plan) => String(plan.id) === String(form.membershipPlanId)) ||
      null,
    [plans, form.membershipPlanId],
  );

  // ==========================================================
  // FORM
  // ==========================================================

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;

    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.phone.trim()) {
      setError("Please enter your mobile number.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        message: form.message.trim() || null,

        membershipPlanId: form.membershipPlanId
          ? Number(form.membershipPlanId)
          : null,

        qrCampaignCode: qrAttribution.campaignCode || null,

        qrScanToken: qrAttribution.scanToken || null,
      };

      const response = await libraryEnquiryApi.createPublicEnquiry(
        libraryId,
        payload,
      );

      setSuccess(response || {});

      setForm((current) => ({
        ...current,
        fullName: "",
        phone: "",
        email: "",
        message: "",
      }));
    } catch (requestError) {
      console.error("Unable to submit membership enquiry:", requestError);

      setError(
        getErrorMessage(
          requestError,
          "Unable to submit your enquiry. Please try again.",
        ),
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "70vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#F7F9FC",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />

          <Typography color="text.secondary" fontWeight={650}>
            Loading membership information...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================================
  // SUCCESS
  // ==========================================================

  if (success) {
    return (
      <Box
        sx={{
          minHeight: "72vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#F7F9FC",
          px: 2,
          py: 5,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            maxWidth: 620,
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            textAlign: "center",
            border: "1px solid",
            borderColor: alpha(theme.palette.success.main, 0.2),
          }}
        >
          <Avatar
            sx={{
              width: 72,
              height: 72,
              mx: "auto",
              mb: 2,
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: "success.main",
            }}
          >
            <CheckCircleRounded sx={{ fontSize: 42 }} />
          </Avatar>

          <Typography variant="h4" fontWeight={900}>
            Enquiry Sent
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1.2 }}>
            Your membership enquiry has been sent to{" "}
            <strong>{library?.name || "the library"}</strong>. The library team
            can now contact you using the details you provided.
          </Typography>

          {success?.id && (
            <Chip
              sx={{ mt: 2 }}
              label={`Enquiry #${success.id}`}
              color="success"
              variant="outlined"
            />
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
            sx={{ mt: 3 }}
          >
            <Button
              variant="contained"
              onClick={() => navigate(`/libraries/${libraryId}`)}
            >
              View Library
            </Button>

            <Button
              variant="outlined"
              onClick={() => navigate(`/libraries/${libraryId}/seats`)}
            >
              View Available Seats
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <Box
      sx={{
        bgcolor: "#F7F9FC",
        minHeight: "calc(100vh - 72px)",
        py: { xs: 3, md: 5 },
      }}
    >
      <Container maxWidth="lg">
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate(`/libraries/${libraryId}`)}
          sx={{ mb: 2 }}
        >
          Back to Library
        </Button>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError("")}
            sx={{
              mb: 3,
              borderRadius: 2.5,
            }}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3} alignItems="flex-start">
          {/* ================================================= */}
          {/* LIBRARY INFORMATION */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 5 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  background:
                    "linear-gradient(135deg,#071A37 0%,#0B4A9F 65%,#146EF5 140%)",
                  color: "#fff",
                }}
              >
                <Avatar
                  sx={{
                    width: 58,
                    height: 58,
                    mb: 2,
                    bgcolor: "rgba(255,255,255,.14)",
                    color: "#fff",
                  }}
                >
                  <WorkspacePremiumRounded />
                </Avatar>

                <Typography variant="h4" fontWeight={900}>
                  {library?.name || "Library"}
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    color: "rgba(255,255,255,.82)",
                  }}
                >
                  Interested in joining? Send your details and the library team
                  can contact you.
                </Typography>
              </Box>

              <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
                <Stack spacing={2}>
                  {buildAddress(library) && (
                    <Stack
                      direction="row"
                      spacing={1.3}
                      alignItems="flex-start"
                    >
                      <LocationOnRounded color="primary" fontSize="small" />

                      <Typography variant="body2" color="text.secondary">
                        {buildAddress(library)}
                      </Typography>
                    </Stack>
                  )}

                  {library?.contactNumber && (
                    <Stack direction="row" spacing={1.3} alignItems="center">
                      <LocalPhoneRounded color="primary" fontSize="small" />

                      <Typography variant="body2">
                        {library.contactNumber}
                      </Typography>
                    </Stack>
                  )}

                  {library?.email && (
                    <Stack direction="row" spacing={1.3} alignItems="center">
                      <EmailRounded color="primary" fontSize="small" />

                      <Typography variant="body2">{library.email}</Typography>
                    </Stack>
                  )}
                </Stack>

                {qrAttribution.campaignCode && (
                  <>
                    <Divider sx={{ my: 2.5 }} />

                    <Chip
                      size="small"
                      color="primary"
                      variant="outlined"
                      label="QR Membership Enquiry"
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* ================================================= */}
          {/* ENQUIRY FORM */}
          {/* ================================================= */}

          <Grid size={{ xs: 12, md: 7 }}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Avatar
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.09),
                      color: "primary.main",
                    }}
                  >
                    <WorkspacePremiumRounded />
                  </Avatar>

                  <Box>
                    <Typography variant="h5" fontWeight={900}>
                      Membership Enquiry
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      No account is required to send an enquiry.
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={2.2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Full Name"
                        value={form.fullName}
                        onChange={handleFieldChange("fullName")}
                        inputProps={{ maxLength: 150 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextField
                        fullWidth
                        required
                        label="Mobile Number"
                        value={form.phone}
                        onChange={handleFieldChange("phone")}
                        inputProps={{ maxLength: 25 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        type="email"
                        label="Email Address"
                        value={form.email}
                        onChange={handleFieldChange("email")}
                        inputProps={{ maxLength: 180 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <FormControl fullWidth>
                        <InputLabel>Interested Membership Plan</InputLabel>

                        <Select
                          value={form.membershipPlanId}
                          label="Interested Membership Plan"
                          onChange={handleFieldChange("membershipPlanId")}
                        >
                          <MenuItem value="">Not sure yet</MenuItem>

                          {plans.map((plan) => {
                            const startingPrice = getPlanStartingPrice(plan);

                            return (
                              <MenuItem key={plan.id} value={String(plan.id)}>
                                {plan.name}
                                {startingPrice != null
                                  ? ` · From ${formatMoney(startingPrice)}`
                                  : ""}
                              </MenuItem>
                            );
                          })}
                        </Select>
                      </FormControl>
                    </Grid>

                    {selectedPlan && (
                      <Grid size={{ xs: 12 }}>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.primary.main, 0.035),
                            border: "1px solid",
                            borderColor: alpha(
                              theme.palette.primary.main,
                              0.13,
                            ),
                          }}
                        >
                          <Typography fontWeight={850}>
                            {selectedPlan.name}
                          </Typography>

                          {selectedPlan.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ mt: 0.5 }}
                            >
                              {selectedPlan.description}
                            </Typography>
                          )}
                        </Paper>
                      </Grid>
                    )}

                    <Grid size={{ xs: 12 }}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Message"
                        placeholder="Ask about membership, timings, facilities or seat availability..."
                        value={form.message}
                        onChange={handleFieldChange("message")}
                        inputProps={{ maxLength: 1000 }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Alert severity="info" sx={{ borderRadius: 2.5 }}>
                        Your details will be shared with this library so they
                        can respond to your membership enquiry.
                      </Alert>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Button
                        fullWidth
                        type="submit"
                        size="large"
                        variant="contained"
                        disabled={submitting}
                        startIcon={
                          submitting ? (
                            <CircularProgress size={18} color="inherit" />
                          ) : (
                            <SendRounded />
                          )
                        }
                        sx={{
                          minHeight: 54,
                          borderRadius: 2.7,
                          fontWeight: 850,
                        }}
                      >
                        {submitting ? "Sending Enquiry..." : "Send Enquiry"}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default LibraryEnquiry;
