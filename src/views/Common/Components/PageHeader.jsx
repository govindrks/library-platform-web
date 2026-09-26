import { Box, Typography } from "@mui/material";

function PageHeader({
    title,
    subtitle,
    actions,
}) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: {
                    xs: "flex-start",
                    sm: "center",
                },
                justifyContent: "space-between",
                flexDirection: {
                    xs: "column",
                    sm: "row",
                },
                gap: 2,
                mb: 3,
            }}
        >
            <Box>
                <Typography variant="h4">
                    {title}
                </Typography>

                {subtitle && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>

            {actions && (
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                    }}
                >
                    {actions}
                </Box>
            )}
        </Box>
    );
}

export default PageHeader;