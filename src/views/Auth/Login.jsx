import {
    ArrowForward,
    LockOutlined,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";
import {
    Alert,
    Box,
    Button,
    Checkbox,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Link,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import authApi from "../../api/authApi";
import { loginSuccess } from "../../redux/reducer/authReducer";

function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError("");

        if (!form.email || !form.password) {
            setError("Please enter your email and password.");
            return;
        }

        try {
            setLoading(true);

            const response = await authApi.login(form);

            const token =
                response?.token ||
                response?.accessToken ||
                response?.data?.token ||
                response?.data?.accessToken;

            const user =
                response?.user ||
                response?.data?.user ||
                null;

            if (!token) {
                throw new Error(
                    "Authentication token was not returned by the server."
                );
            }

            // Save authentication state
            dispatch(
                loginSuccess({
                    token,
                    user,
                })
            );

            /*
             * If the user came to login because they wanted
             * to perform a specific action, return them there.
             *
             * Example:
             * /libraries/10/seats
             */
            const destination = location.state?.from;

            if (destination) {
                navigate(destination, {
                    replace: true,
                    state: {
                        action: location.state?.action,
                        seatId: location.state?.seatId,
                        libraryId: location.state?.libraryId,
                    },
                });

                return;
            }

            /*
             * Normal login:
             * redirect according to user role.
             */
            const role = user?.role;

            if (role === "LIBRARY_OWNER") {
                navigate("/owner/dashboard", {
                    replace: true,
                });
            } else if (role === "ADMIN") {
                navigate("/admin/dashboard", {
                    replace: true,
                });
            } else {
                navigate("/dashboard", {
                    replace: true,
                });
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    err.message ||
                    "Login failed. Please check your credentials."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "background.default",
                p: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: "100%",
                    maxWidth: 460,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    p: {
                        xs: 3,
                        sm: 5,
                    },
                }}
            >
                <Stack spacing={3}>
                    {/* Logo */}
                    <Box>
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 2,
                                backgroundColor: "primary.main",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 22,
                                fontWeight: 700,
                                mb: 3,
                            }}
                        >
                            L
                        </Box>

                        <Typography variant="h4">
                            Welcome back
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.75 }}
                        >
                            Sign in to your LibraryHub account
                        </Typography>
                    </Box>

                    {/* Error */}
                    {error && (
                        <Alert severity="error">
                            {error}
                        </Alert>
                    )}

                    {/* Login Form */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <Stack spacing={2.5}>
                            <TextField
                                fullWidth
                                label="Email address"
                                name="email"
                                type="email"
                                value={form.email}
                                onChange={handleChange}
                                autoComplete="email"
                            />

                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={form.password}
                                onChange={handleChange}
                                autoComplete="current-password"
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LockOutlined fontSize="small" />
                                            </InputAdornment>
                                        ),

                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={() =>
                                                        setShowPassword(
                                                            (value) =>
                                                                !value
                                                        )
                                                    }
                                                    edge="end"
                                                >
                                                    {showPassword ? (
                                                        <VisibilityOff />
                                                    ) : (
                                                        <Visibility />
                                                    )}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent:
                                        "space-between",
                                }}
                            >
                                <FormControlLabel
                                    control={<Checkbox />}
                                    label="Remember me"
                                />

                                <Link
                                    component="button"
                                    type="button"
                                    underline="hover"
                                    onClick={() =>
                                        navigate(
                                            "/forgot-password"
                                        )
                                    }
                                >
                                    Forgot password?
                                </Link>
                            </Box>

                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                endIcon={<ArrowForward />}
                            >
                                {loading
                                    ? "Signing in..."
                                    : "Sign In"}
                            </Button>
                        </Stack>
                    </Box>

                    {/* Register */}
                    <Typography
                        variant="body2"
                        textAlign="center"
                        color="text.secondary"
                    >
                        Don't have an account?{" "}
                        <Link
                            component="button"
                            type="button"
                            underline="hover"
                            onClick={() =>
                                navigate("/register")
                            }
                        >
                            Create account
                        </Link>
                    </Typography>
                </Stack>
            </Paper>
        </Box>
    );
}

export default Login;