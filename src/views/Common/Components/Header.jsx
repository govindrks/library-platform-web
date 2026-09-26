import {
    ExpandMore,
    Help,
    Logout,
    Menu,
    NotificationsNone,
    Person,
    Search,
    Settings,
} from "@mui/icons-material";

import {
    AppBar,
    Avatar,
    Badge,
    Box,
    IconButton,
    InputBase,
    MenuItem,
    Paper,
    Select,
    Toolbar,
    Tooltip,
    Typography,
    Menu as MuiMenu,
} from "@mui/material";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logout } from "../../../redux/reducer/authReducer";

const drawerWidth = 250;

function Header({ onMenuClick }) {
    const [anchorEl, setAnchorEl] =
        useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const userMenuOpen = Boolean(anchorEl);

    const handleUserMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleUserMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());

        handleUserMenuClose();

        navigate("/login", {
            replace: true,
        });
    };

    return (
        <AppBar
            position="fixed"
            elevation={0}
            sx={{
                width: {
                    xs: "100%",
                    md: `calc(100% - ${drawerWidth}px)`,
                },

                ml: {
                    xs: 0,
                    md: `${drawerWidth}px`,
                },

                backgroundColor: "background.paper",
                color: "text.primary",
                borderBottom: "1px solid",
                borderColor: "divider",
            }}
        >
            <Toolbar
                sx={{
                    minHeight: "72px !important",
                    px: {
                        xs: 2,
                        md: 3,
                    },
                    gap: 2,
                }}
            >
                {/* Mobile Menu */}

                <IconButton
                    onClick={onMenuClick}
                    sx={{
                        display: {
                            xs: "flex",
                            md: "none",
                        },
                    }}
                >
                    <Menu />
                </IconButton>

                {/* Library Selector */}

                <Select
                    value="main-library"
                    variant="standard"
                    disableUnderline
                    IconComponent={ExpandMore}
                    sx={{
                        minWidth: 180,

                        "& .MuiSelect-select": {
                            py: 0.5,
                            fontWeight: 600,
                        },
                    }}
                >
                    <MenuItem value="main-library">
                        Main Library
                    </MenuItem>

                    <MenuItem value="city-library">
                        City Library
                    </MenuItem>
                </Select>

                {/* Search */}

                <Paper
                    component="form"
                    elevation={0}
                    sx={{
                        display: {
                            xs: "none",
                            sm: "flex",
                        },

                        alignItems: "center",

                        width: {
                            sm: 240,
                            lg: 340,
                        },

                        height: 40,
                        px: 1.5,

                        backgroundColor:
                            "background.default",

                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                    }}
                >
                    <Search
                        fontSize="small"
                        sx={{
                            color: "text.secondary",
                            mr: 1,
                        }}
                    />

                    <InputBase
                        placeholder="Search..."
                        sx={{
                            flex: 1,
                            fontSize: "0.875rem",
                        }}
                    />
                </Paper>

                <Box sx={{ flex: 1 }} />

                {/* Help */}

                <Tooltip title="Help & Documentation">
                    <IconButton>
                        <Help />
                    </IconButton>
                </Tooltip>

                {/* Notifications */}

                <Tooltip title="Notifications">
                    <IconButton>
                        <Badge
                            badgeContent={4}
                            color="error"
                        >
                            <NotificationsNone />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* User */}

                <Box>
                    <Box
                        onClick={handleUserMenuOpen}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            ml: 1,
                            cursor: "pointer",
                            borderRadius: 2,
                            px: 1,
                            py: 0.5,

                            "&:hover": {
                                backgroundColor:
                                    "background.default",
                            },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                backgroundColor:
                                    "primary.main",
                                fontSize: 14,
                            }}
                        >
                            GK
                        </Avatar>

                        <Box
                            sx={{
                                display: {
                                    xs: "none",
                                    sm: "block",
                                },
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    fontWeight: 600,
                                    lineHeight: 1.2,
                                }}
                            >
                                Govind Kumar
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                Library Owner
                            </Typography>
                        </Box>

                        <ExpandMore
                            fontSize="small"
                            sx={{
                                color: "text.secondary",

                                display: {
                                    xs: "none",
                                    sm: "block",
                                },
                            }}
                        />
                    </Box>

                    {/* User Menu */}

                    <MuiMenu
                        anchorEl={anchorEl}
                        open={userMenuOpen}
                        onClose={handleUserMenuClose}
                        anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "right",
                        }}
                        transformOrigin={{
                            vertical: "top",
                            horizontal: "right",
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                handleUserMenuClose();

                                navigate(
                                    "/profile"
                                );
                            }}
                        >
                            <Person
                                fontSize="small"
                                sx={{
                                    mr: 1.5,
                                }}
                            />

                            My Profile
                        </MenuItem>

                        <MenuItem
                            onClick={() => {
                                handleUserMenuClose();

                                navigate(
                                    "/settings"
                                );
                            }}
                        >
                            <Settings
                                fontSize="small"
                                sx={{
                                    mr: 1.5,
                                }}
                            />

                            Settings
                        </MenuItem>

                        <MenuItem
                            onClick={handleLogout}
                        >
                            <Logout
                                fontSize="small"
                                sx={{
                                    mr: 1.5,
                                }}
                            />

                            Logout
                        </MenuItem>
                    </MuiMenu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default Header;