import { ConstructionOutlined, RefreshOutlined } from "@mui/icons-material";

import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Typography,
} from "@mui/material";

function Maintenance() {
  const handleRefresh = () => {
    window.location.href = "/login";
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",

        display: "flex",

        alignItems: "center",

        justifyContent: "center",

        px: 2,

        bgcolor: "background.default",
      }}
    >
      <Card
        variant="outlined"
        sx={{
          width: "100%",

          maxWidth: 540,

          borderRadius: 3,
        }}
      >
        <CardContent
          sx={{
            p: {
              xs: 3,

              sm: 5,
            },
          }}
        >
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 80,

                height: 80,

                borderRadius: "50%",

                display: "flex",

                alignItems: "center",

                justifyContent: "center",

                bgcolor: "warning.main",

                color: "warning.contrastText",
              }}
            >
              <ConstructionOutlined
                sx={{
                  fontSize: 42,
                }}
              />
            </Box>

            <Box>
              <Typography variant="h4" fontWeight={800}>
                LibraryHub is under maintenance
              </Typography>

              <Typography color="text.secondary" mt={1.5}>
                We are currently performing platform maintenance. Please try
                again shortly.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<RefreshOutlined />}
              onClick={handleRefresh}
            >
              Try Again
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Maintenance;
