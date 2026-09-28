import React from "react";
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
} from "@mui/material";

import {
    ArrowDownward,
    ArrowUpward,
} from "@mui/icons-material";

function ReportStatCard({
    title,
    value,
    change,
    icon: Icon,
    positive = true,
}) {
    return (
        <Card sx={{ height: "100%" }}>
            <CardContent>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                >
                    <Box>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h4"
                            fontWeight={700}
                        >
                            {value}
                        </Typography>

                        {change && (
                            <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                                mt={1}
                            >
                                {positive ? (
                                    <ArrowUpward
                                        sx={{
                                            fontSize: 16,
                                            color: "success.main",
                                        }}
                                    />
                                ) : (
                                    <ArrowDownward
                                        sx={{
                                            fontSize: 16,
                                            color: "error.main",
                                        }}
                                    />
                                )}

                                <Typography
                                    variant="caption"
                                    color={
                                        positive
                                            ? "success.main"
                                            : "error.main"
                                    }
                                    fontWeight={600}
                                >
                                    {change}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    vs previous period
                                </Typography>
                            </Stack>
                        )}
                    </Box>

                    {Icon && (
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: 2,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backgroundColor:
                                    "primary.light",
                                color: "primary.main",
                            }}
                        >
                            <Icon />
                        </Box>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}

export default ReportStatCard;