import React from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupsIcon from "@mui/icons-material/Groups";

import platformPlans from "../../../utility/platformPlans";

function PlanSelection({
    selectedPlanId,
    onSelect,
}) {
    return (
        <Stack spacing={3}>
            <Box>
                <Typography
                    variant="h5"
                    fontWeight={700}
                >
                    Choose your LibraryHub Plan
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                >
                    Select a plan based on the number of
                    active members your library expects to
                    manage.
                </Typography>
            </Box>

            <Grid container spacing={2}>
                {platformPlans.map((plan) => {
                    const selected =
                        selectedPlanId === plan.id;

                    return (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={plan.id}
                        >
                            <Card
                                onClick={() =>
                                    onSelect(plan.id)
                                }
                                sx={{
                                    height: "100%",
                                    cursor: "pointer",
                                    position: "relative",
                                    border: "2px solid",
                                    borderColor: selected
                                        ? "primary.main"
                                        : "divider",
                                    backgroundColor: selected
                                        ? "primary.light"
                                        : "background.paper",
                                    transition:
                                        "all 0.2s ease",
                                    "&:hover": {
                                        borderColor:
                                            "primary.main",
                                    },
                                }}
                            >
                                {plan.popular && (
                                    <Chip
                                        label="Recommended"
                                        color="primary"
                                        size="small"
                                        sx={{
                                            position:
                                                "absolute",
                                            top: 12,
                                            right: 12,
                                        }}
                                    />
                                )}

                                <CardContent>
                                    <Stack spacing={2}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    borderRadius: 2,
                                                    display:
                                                        "flex",
                                                    alignItems:
                                                        "center",
                                                    justifyContent:
                                                        "center",
                                                    backgroundColor:
                                                        "primary.light",
                                                    color:
                                                        "primary.main",
                                                }}
                                            >
                                                <GroupsIcon />
                                            </Box>

                                            {selected && (
                                                <CheckCircleIcon
                                                    color="primary"
                                                />
                                            )}
                                        </Stack>

                                        <Box>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                            >
                                                {plan.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {
                                                    plan.description
                                                }
                                            </Typography>
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="h5"
                                                fontWeight={800}
                                            >
                                                {plan.price
                                                    ? `₹${plan.price.toLocaleString(
                                                          "en-IN"
                                                      )}`
                                                    : "Custom"}
                                            </Typography>

                                            {plan.price && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    / month
                                                </Typography>
                                            )}
                                        </Box>

                                        <Divider />

                                        <Box>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                Member Capacity
                                            </Typography>

                                            <Typography
                                                fontWeight={700}
                                                color="primary.main"
                                            >
                                                {plan.maxMembers
                                                    ? `Up to ${plan.maxMembers} active members`
                                                    : "1,000+ active members"}
                                            </Typography>
                                        </Box>

                                        <Button
                                            fullWidth
                                            variant={
                                                selected
                                                    ? "contained"
                                                    : "outlined"
                                            }
                                        >
                                            {selected
                                                ? "Selected"
                                                : "Select Plan"}
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Stack>
    );
}

export default PlanSelection;