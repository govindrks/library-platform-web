import React, { useMemo } from "react";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  AutoAwesomeRounded,
  CheckCircleRounded,
  GroupsRounded,
  LocalOfferRounded,
  TrendingUpRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";

import platformPlans from "../../../utility/platformPlans";

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const normalizePlans = (plans) =>
  (Array.isArray(plans) ? plans : []).filter(Boolean).map((plan) => ({
    ...plan,
    id: plan.id ?? plan.planId,
    name: plan.name ?? plan.planName ?? "LibraryHub Plan",
    description:
      plan.description ?? "LibraryHub management plan for your library.",
    price: Number(plan.price ?? plan.monthlyPrice ?? 0),
    maxMembers:
      plan.maxMembers ?? plan.memberLimit ?? plan.maxActiveMembers ?? null,
    popular: Boolean(plan.popular ?? plan.recommended ?? false),
  }));

function PlanSelection({
  selectedPlanId,
  onSelect,
  plans = platformPlans,
  currentMembers = 0,
  currentPlanId = null,
  disabled = false,
}) {
  const normalizedPlans = useMemo(() => normalizePlans(plans), [plans]);

  const selectedPlan = useMemo(
    () =>
      normalizedPlans.find(
        (plan) => String(plan.id) === String(selectedPlanId),
      ) ?? null,
    [normalizedPlans, selectedPlanId],
  );

  const handleSelect = (plan) => {
    if (disabled || !plan?.id) {
      return;
    }

    onSelect?.(plan.id, plan);
  };

  return (
    <Stack spacing={3}>
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border: "1px solid rgba(79,70,229,0.12)",
          background:
            "linear-gradient(135deg, rgba(79,70,229,0.10), rgba(255,255,255,1) 58%, rgba(99,102,241,0.05))",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 2.5, md: 3.2 },
            "&:last-child": { pb: { xs: 2.5, md: 3.2 } },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2.5}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack direction="row" spacing={1.8} alignItems="center">
              <Box
                sx={{
                  width: 54,
                  height: 54,
                  minWidth: 54,
                  borderRadius: 2.8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  boxShadow: "0 10px 26px rgba(79,70,229,0.22)",
                }}
              >
                <WorkspacePremiumRounded />
              </Box>

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  useFlexGap
                  flexWrap="wrap"
                >
                  <Typography
                    variant="h5"
                    fontWeight={800}
                    sx={{ letterSpacing: "-0.02em" }}
                  >
                    Choose your LibraryHub Plan
                  </Typography>

                  <Chip
                    size="small"
                    icon={<AutoAwesomeRounded />}
                    label="Flexible SaaS plans"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.6, maxWidth: 680, lineHeight: 1.65 }}
                >
                  Select the plan that matches your active-member capacity and
                  the features your library needs.
                </Typography>
              </Box>
            </Stack>

            {selectedPlan && (
              <Chip
                icon={<CheckCircleRounded />}
                label={`${selectedPlan.name} selected`}
                color="success"
                variant="outlined"
                sx={{
                  alignSelf: { xs: "flex-start", md: "center" },
                  bgcolor: "background.paper",
                  fontWeight: 700,
                }}
              />
            )}
          </Stack>
        </CardContent>
      </Card>

      {normalizedPlans.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 4,
          }}
        >
          <CardContent sx={{ py: 6, textAlign: "center" }}>
            <LocalOfferRounded sx={{ fontSize: 46, color: "text.disabled" }} />
            <Typography fontWeight={800} sx={{ mt: 1 }}>
              No plans available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Active LibraryHub plans will appear here when they are available.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2.2}>
          {normalizedPlans.map((plan) => {
            const selected = String(selectedPlanId) === String(plan.id);

            const current =
              currentPlanId != null &&
              String(currentPlanId) === String(plan.id);

            const memberLimit = Number(plan.maxMembers || 0);
            const members = Number(currentMembers || 0);
            const hasFiniteCapacity = memberLimit > 0;
            const capacityPercent = hasFiniteCapacity
              ? Math.min((members / memberLimit) * 100, 100)
              : 0;
            const wouldExceedCapacity =
              hasFiniteCapacity && members > memberLimit;

            return (
              <Grid key={plan.id} size={{ xs: 12, sm: 6, lg: 4 }}>
                <Card
                  elevation={0}
                  onClick={() => handleSelect(plan)}
                  role="button"
                  tabIndex={disabled ? -1 : 0}
                  onKeyDown={(event) => {
                    if (
                      !disabled &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      handleSelect(plan);
                    }
                  }}
                  sx={{
                    height: "100%",
                    cursor: disabled ? "default" : "pointer",
                    position: "relative",
                    overflow: "hidden",
                    border: "1px solid",
                    borderWidth: selected ? 2 : 1,
                    borderColor: selected ? "primary.main" : "divider",
                    borderRadius: 4,
                    bgcolor: "background.paper",
                    background: selected
                      ? "linear-gradient(145deg, rgba(79,70,229,0.075), #ffffff 46%)"
                      : "linear-gradient(145deg, #ffffff, rgba(248,250,252,0.88))",
                    boxShadow: selected
                      ? "0 18px 42px rgba(79,70,229,0.12)"
                      : "none",
                    transition: "all 0.22s ease",
                    opacity: disabled ? 0.72 : 1,
                    "&:hover": disabled
                      ? undefined
                      : {
                          transform: "translateY(-4px)",
                          borderColor: "primary.light",
                          boxShadow: "0 16px 34px rgba(15,23,42,0.09)",
                        },
                    "&:focus-visible": {
                      outline: "3px solid",
                      outlineColor: "primary.light",
                      outlineOffset: 2,
                    },
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Recommended"
                      color="primary"
                      size="small"
                      icon={<AutoAwesomeRounded />}
                      sx={{
                        position: "absolute",
                        top: 14,
                        right: 14,
                        zIndex: 2,
                        fontWeight: 700,
                      }}
                    />
                  )}

                  <CardContent
                    sx={{
                      p: 2.7,
                      height: "100%",
                      "&:last-child": { pb: 2.7 },
                    }}
                  >
                    <Stack spacing={2.2} height="100%">
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        minHeight={42}
                      >
                        <Box
                          sx={{
                            width: 46,
                            height: 46,
                            borderRadius: 2.4,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: selected
                              ? "primary.main"
                              : "rgba(79,70,229,0.08)",
                            color: selected
                              ? "primary.contrastText"
                              : "primary.main",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <GroupsRounded />
                        </Box>

                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="center"
                        >
                          {current && (
                            <Chip
                              size="small"
                              label="Current plan"
                              color="success"
                              variant="outlined"
                            />
                          )}

                          {selected && <CheckCircleRounded color="primary" />}
                        </Stack>
                      </Stack>

                      <Box>
                        <Typography variant="h6" fontWeight={800}>
                          {plan.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.55, lineHeight: 1.6 }}
                        >
                          {plan.description}
                        </Typography>
                      </Box>

                      <Box>
                        <Stack
                          direction="row"
                          spacing={0.8}
                          alignItems="baseline"
                        >
                          <Typography
                            variant="h4"
                            fontWeight={800}
                            sx={{ letterSpacing: "-0.03em" }}
                          >
                            {plan.price > 0
                              ? formatMoney(plan.price)
                              : "Custom"}
                          </Typography>

                          {plan.price > 0 && (
                            <Typography variant="body2" color="text.secondary">
                              / month
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      <Divider />

                      <Box>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={1}
                        >
                          <Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Member Capacity
                            </Typography>
                            <Typography
                              fontWeight={800}
                              color={
                                wouldExceedCapacity
                                  ? "error.main"
                                  : "primary.main"
                              }
                            >
                              {hasFiniteCapacity
                                ? `Up to ${memberLimit.toLocaleString("en-IN")} active members`
                                : "1,000+ active members"}
                            </Typography>
                          </Box>

                          {members > 0 && (
                            <Tooltip title="Current active-member usage">
                              <Chip
                                size="small"
                                icon={<TrendingUpRounded />}
                                label={`${members.toLocaleString("en-IN")} active`}
                                variant="outlined"
                                color={
                                  wouldExceedCapacity ? "error" : "default"
                                }
                              />
                            </Tooltip>
                          )}
                        </Stack>

                        {hasFiniteCapacity && members > 0 && (
                          <Box sx={{ mt: 1.2 }}>
                            <LinearProgress
                              variant="determinate"
                              value={capacityPercent}
                              color={
                                wouldExceedCapacity
                                  ? "error"
                                  : capacityPercent >= 80
                                    ? "warning"
                                    : "primary"
                              }
                              sx={{
                                height: 6,
                                borderRadius: 999,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color={
                                wouldExceedCapacity
                                  ? "error.main"
                                  : "text.secondary"
                              }
                              sx={{ display: "block", mt: 0.65 }}
                            >
                              {wouldExceedCapacity
                                ? `This plan is below your current ${members.toLocaleString("en-IN")}-member usage.`
                                : `${Math.round(capacityPercent)}% of this plan's member capacity would be in use.`}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {Array.isArray(plan.features) &&
                        plan.features.length > 0 && (
                          <Stack spacing={1}>
                            {plan.features.slice(0, 4).map((feature) => (
                              <Stack
                                key={feature}
                                direction="row"
                                spacing={1}
                                alignItems="flex-start"
                              >
                                <CheckCircleRounded
                                  color="success"
                                  sx={{ fontSize: 18, mt: "2px" }}
                                />
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {feature}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        )}

                      <Box sx={{ flex: 1 }} />

                      <Button
                        fullWidth
                        variant={selected ? "contained" : "outlined"}
                        disabled={disabled || wouldExceedCapacity}
                        startIcon={
                          selected ? (
                            <CheckCircleRounded />
                          ) : (
                            <LocalOfferRounded />
                          )
                        }
                        onClick={(event) => {
                          event.stopPropagation();
                          handleSelect(plan);
                        }}
                        sx={{
                          minHeight: 44,
                          borderRadius: 2.5,
                          textTransform: "none",
                          fontWeight: 800,
                        }}
                      >
                        {wouldExceedCapacity
                          ? "Capacity Too Low"
                          : selected
                            ? "Selected"
                            : current
                              ? "Keep Current Plan"
                              : "Select Plan"}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Stack>
  );
}

export default PlanSelection;
