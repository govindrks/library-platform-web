import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

function App() {
    return (
        <Box sx={{ p: 4 }}>
            <Stack spacing={4}>

                <Box>
                    <Typography variant="h3">
                        Library Platform
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                    >
                        Modern SaaS design system preview
                    </Typography>
                </Box>

                <Grid container spacing={3}>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Total Members
                                </Typography>

                                <Typography
                                    variant="h4"
                                    sx={{ mt: 1 }}
                                >
                                    1,248
                                </Typography>

                                <Chip
                                    label="+8.2%"
                                    color="success"
                                    size="small"
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Occupancy
                                </Typography>

                                <Typography
                                    variant="h4"
                                    sx={{ mt: 1 }}
                                >
                                    78.4%
                                </Typography>

                                <Chip
                                    label="934 / 1200"
                                    color="info"
                                    size="small"
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Card>
                            <CardContent>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    Revenue
                                </Typography>

                                <Typography
                                    variant="h4"
                                    sx={{ mt: 1 }}
                                >
                                    ₹24,850
                                </Typography>

                                <Chip
                                    label="+12.5%"
                                    color="success"
                                    size="small"
                                    sx={{ mt: 2 }}
                                />
                            </CardContent>
                        </Card>
                    </Grid>

                </Grid>

                <Card>
                    <CardContent>
                        <Typography variant="h5" sx={{ mb: 3 }}>
                            Components
                        </Typography>

                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={2}
                        >
                            <Button variant="contained">
                                Add Member
                            </Button>

                            <Button variant="outlined">
                                Export
                            </Button>

                            <Button color="error">
                                Delete
                            </Button>

                            <TextField
                                label="Search members"
                                placeholder="Enter member name"
                            />
                        </Stack>
                    </CardContent>
                </Card>

            </Stack>
        </Box>
    );
}

export default App;