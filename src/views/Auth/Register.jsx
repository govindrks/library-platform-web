import {
    ArrowBack,
    Email,
    Lock,
    Person,
    Visibility,
    VisibilityOff,
} from "@mui/icons-material";

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
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
import {
    Link as RouterLink,
    useLocation,
    useNavigate,
} from "react-router-dom";

import authApi from "../../api/authApi";
import { loginSuccess } from "../../redux/reducer/authReducer";

function Register() {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [fieldErrors, setFieldErrors] = useState({});

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setFieldErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setError("");
    };

    const validateForm = () => {
        const errors = {};

        if (!formData.fullName.trim()) {
            errors.fullName = "Full name is required";
        } else if (formData.fullName.trim().length < 2) {
            errors.fullName =
                "Full name must contain at least 2 characters";
        }

        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                formData.email.trim()
            )
        ) {
            errors.email = "Enter a valid email address";
        }

        if (!formData.password) {
            errors.password = "Password is required";
        } else if (formData.password.length < 6) {
            errors.password =
                "Password must contain at least 6 characters";
        }

        if (!formData.confirmPassword) {
            errors.confirmPassword =
                "Please confirm your password";
        } else if (
            formData.password !== formData.confirmPassword
        ) {
            errors.confirmPassword =
                "Passwords do not match";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password,
            };

            const response = await authApi.register(payload);

            /*
             * Depending on your Spring Boot response structure,
             * the token may be returned directly or inside data.
             */
            const token =
                response?.token ||
                response?.accessToken ||
                response?.data?.token ||
                response?.data?.accessToken;

            const user =
                response?.user ||
                response?.data?.user ||
                null;

            /*
             * If registration automatically logs the user in,
             * store the authentication information.
             */
            if (token) {
                dispatch(
                    loginSuccess({
                        token,
                        user,
                    })
                );

                const destination =
                    location.state?.from || "/dashboard";

                navigate(destination, {
                    replace: true,
                });

                return;
            }

            /*
             * If your backend only registers the account and
             * requires a separate login, send the user to login.
             */
            setSuccess(
                "Account created successfully. Please sign in."
            );

            setTimeout(() => {
                navigate("/login", {
                    replace: true,
                    state: {
                        from: location.state?.from,
                    },
                });
            }, 1200);
        } catch (err) {
            console.error("Registration failed:", err);

            const backendMessage =
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                err?.response?.data?.detail;

            setError(
                backendMessage ||
                    "Unable to create your account. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background:
                    "linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)",
                display: "flex",
                alignItems: "center",
                py: 6,
            }}
        >
            <Container maxWidth="sm">
                {/* Back */}
                <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate("/")}
                    sx={{
                        mb: 3,
                        color: "text.secondary",
                    }}
                >
                    Back to LibraryHub
                </Button>

                <Paper
                    elevation={0}
                    sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 3,
                        p: {
                            xs: 3,
                            sm: 5,
                        },
                    }}
                >
                    {/* Header */}
                    <Stack
                        spacing={1}
                        sx={{ mb: 4 }}
                    >
                        <Box
                            sx={{
                                width: 46,
                                height: 46,
                                borderRadius: 2,
                                backgroundColor:
                                    "primary.main",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                mb: 1,
                            }}
                        >
                            <Typography
                                sx={{
                                    color: "#FFFFFF",
                                    fontWeight: 800,
                                    fontSize: 22,
                                }}
                            >
                                L
                            </Typography>
                        </Box>

                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                letterSpacing: "-0.02em",
                            }}
                        >
                            Create your account
                        </Typography>

                        <Typography
                            color="text.secondary"
                        >
                            Join LibraryHub and start discovering
                            libraries and available study seats.
                        </Typography>
                    </Stack>

                    {/* Error */}
                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 3 }}
                            onClose={() => setError("")}
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Success */}
                    {success && (
                        <Alert
                            severity="success"
                            sx={{ mb: 3 }}
                        >
                            {success}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <Stack spacing={2.5}>
                            {/* Full name */}
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                error={Boolean(
                                    fieldErrors.fullName
                                )}
                                helperText={
                                    fieldErrors.fullName
                                }
                                disabled={loading}
                                placeholder="Enter your full name"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonOutline
                                                color="action"
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Email */}
                            <TextField
                                fullWidth
                                label="Email Address"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                error={Boolean(
                                    fieldErrors.email
                                )}
                                helperText={
                                    fieldErrors.email
                                }
                                disabled={loading}
                                placeholder="you@example.com"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailOutlined
                                                color="action"
                                            />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Password */}
                            <TextField
                                fullWidth
                                label="Password"
                                name="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={formData.password}
                                onChange={handleChange}
                                error={Boolean(
                                    fieldErrors.password
                                )}
                                helperText={
                                    fieldErrors.password ||
                                    "Minimum 6 characters"
                                }
                                disabled={loading}
                                placeholder="Create a password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined
                                                color="action"
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={() =>
                                                    setShowPassword(
                                                        (previous) =>
                                                            !previous
                                                    )
                                                }
                                                disabled={loading}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Confirm password */}
                            <TextField
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                value={
                                    formData.confirmPassword
                                }
                                onChange={handleChange}
                                error={Boolean(
                                    fieldErrors.confirmPassword
                                )}
                                helperText={
                                    fieldErrors.confirmPassword
                                }
                                disabled={loading}
                                placeholder="Confirm your password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockOutlined
                                                color="action"
                                            />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                edge="end"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        (previous) =>
                                                            !previous
                                                    )
                                                }
                                                disabled={loading}
                                            >
                                                {showConfirmPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {/* Register */}
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                fullWidth
                                disabled={loading}
                                sx={{
                                    minHeight: 48,
                                    mt: 1,
                                }}
                            >
                                {loading ? (
                                    <CircularProgress
                                        size={23}
                                        color="inherit"
                                    />
                                ) : (
                                    "Create Account"
                                )}
                            </Button>
                        </Stack>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Login */}
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                    >
                        Already have an account?{" "}
                        <Link
                            component={RouterLink}
                            to="/login"
                            state={{
                                from: location.state?.from,
                            }}
                            underline="hover"
                            sx={{
                                fontWeight: 700,
                            }}
                        >
                            Sign in
                        </Link>
                    </Typography>
                </Paper>

                {/* Footer */}
                <Typography
                    variant="caption"
                    color="text.secondary"
                    textAlign="center"
                    display="block"
                    sx={{ mt: 3 }}
                >
                    By creating an account, you agree to the
                    LibraryHub terms and policies.
                </Typography>
            </Container>
        </Box>
    );
}

export default Register;