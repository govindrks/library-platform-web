import React from "react";
import { Box, Stack, Typography } from "@mui/material";

function ReportHeader({ title, description, action }) {
    return (
        <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
            mb={3}
        >
            <Box>
                <Typography variant="h4" fontWeight={700}>
                    {title}
                </Typography>

                {description && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={0.5}
                    >
                        {description}
                    </Typography>
                )}
            </Box>

            {action && <Box>{action}</Box>}
        </Stack>
    );
}

export default ReportHeader;