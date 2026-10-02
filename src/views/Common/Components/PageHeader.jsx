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
                mb: 2,
                width: "100%",
                minWidth: 0,
            }}
        >
            <Box
                sx={{
                    minWidth: 0,
                }}
            >
                <Typography
                    sx={{
                        fontSize: {
                            xs: 24,
                            md: 28,
                        },
                        lineHeight: 1.2,
                        fontWeight: 800,
                        color: "#111B63",
                    }}
                >
                    {title}
                </Typography>

                {subtitle && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt: 0.5,
                        }}
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
                        flexShrink: 0,
                    }}
                >
                    {actions}
                </Box>
            )}
        </Box>
    );
}

export default PageHeader;