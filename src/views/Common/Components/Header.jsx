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

import { useMemo, useState } from "react";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useNavigate } from "react-router-dom";

import { logout } from "../../../redux/reducer/authReducer";


const drawerWidth = 250;


// ============================================================
// HELPERS
// ============================================================

const getInitials = (name) => {

    if (!name) {
        return "U";
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            (part) =>
                part.charAt(0).toUpperCase()
        )
        .join("");
};


const formatRole = (role) => {

    if (!role) {
        return "User";
    }

    switch (role) {

        case "ADMIN":
            return "Admin";

        case "LIBRARY_OWNER":
            return "Library Owner";

        case "USER":
            return "Member";

        default:
            return role
                .toLowerCase()
                .replace(/_/g, " ")
                .replace(
                    /\b\w/g,
                    (char) =>
                        char.toUpperCase()
                );
    }
};


// ============================================================
// COMPONENT
// ============================================================

function Header({ onMenuClick }) {

    const [anchorEl, setAnchorEl] =
        useState(null);

    const dispatch = useDispatch();

    const navigate = useNavigate();


    // ========================================================
    // LOGGED-IN USER
    // ========================================================

    const user = useSelector(
        (state) =>
            state.auth?.user
    );


    // ========================================================
    // DERIVED USER DATA
    // ========================================================

    const userName =
        user?.fullName?.trim() ||
        "User";

    const userRole =
        user?.role ||
        "USER";

    const userInitials =
        useMemo(
            () =>
                getInitials(
                    userName
                ),
            [userName]
        );


    const userRoleLabel =
        useMemo(
            () =>
                formatRole(
                    userRole
                ),
            [userRole]
        );


    const userMenuOpen =
        Boolean(anchorEl);


    // ========================================================
    // USER MENU
    // ========================================================

    const handleUserMenuOpen = (
        event
    ) => {

        setAnchorEl(
            event.currentTarget
        );
    };


    const handleUserMenuClose = () => {

        setAnchorEl(null);
    };


    // ========================================================
    // LOGOUT
    // ========================================================

    const handleLogout = () => {

        dispatch(logout());

        handleUserMenuClose();

        navigate("/login", {
            replace: true,
        });
    };


    // ========================================================
    // RENDER
    // ========================================================

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

                backgroundColor:
                    "background.paper",

                color:
                    "text.primary",

                borderBottom:
                    "1px solid",

                borderColor:
                    "divider",

                zIndex:
                    (theme) =>
                        theme.zIndex.drawer + 1,
            }}
        >

            <Toolbar
                sx={{
                    minHeight:
                        "72px !important",

                    px: {
                        xs: 2,
                        md: 3,
                    },

                    gap: 2,
                }}
            >

                {/* =================================================
                    MOBILE MENU
                ================================================= */}

                <IconButton
                    onClick={
                        onMenuClick
                    }
                    sx={{
                        display: {
                            xs: "flex",
                            md: "none",
                        },
                    }}
                >
                    <Menu />
                </IconButton>


                {/* =================================================
                    LIBRARY SELECTOR
                    -------------------------------------------------
                    Still using the current mock library selector.
                    We will connect this to the owner's real
                    libraries separately.
                ================================================= */}

                <Select
                    value="main-library"
                    variant="standard"
                    disableUnderline
                    IconComponent={
                        ExpandMore
                    }
                    sx={{
                        minWidth: 180,

                        "& .MuiSelect-select":
                            {
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


                {/* =================================================
                    SEARCH
                ================================================= */}

                <Paper
                    component="form"
                    elevation={0}
                    sx={{
                        display: {
                            xs: "none",
                            sm: "flex",
                        },

                        alignItems:
                            "center",

                        width: {
                            sm: 240,
                            lg: 340,
                        },

                        height: 40,

                        px: 1.5,

                        backgroundColor:
                            "background.default",

                        border:
                            "1px solid",

                        borderColor:
                            "divider",

                        borderRadius: 2,
                    }}
                >

                    <Search
                        fontSize="small"
                        sx={{
                            color:
                                "text.secondary",

                            mr: 1,
                        }}
                    />

                    <InputBase
                        placeholder="Search..."
                        sx={{
                            flex: 1,
                            fontSize:
                                "0.875rem",
                        }}
                    />

                </Paper>


                {/* =================================================
                    SPACER
                ================================================= */}

                <Box
                    sx={{
                        flex: 1,
                    }}
                />


                {/* =================================================
                    HELP
                ================================================= */}

                <Tooltip
                    title="Help & Documentation"
                >
                    <IconButton>
                        <Help />
                    </IconButton>
                </Tooltip>


                {/* =================================================
                    NOTIFICATIONS
                ================================================= */}

                <Tooltip
                    title="Notifications"
                >
                    <IconButton>
                        <Badge
                            badgeContent={4}
                            color="error"
                        >
                            <NotificationsNone />
                        </Badge>
                    </IconButton>
                </Tooltip>


                {/* =================================================
                    USER PROFILE
                ================================================= */}

                <Box>

                    <Box
                        onClick={
                            handleUserMenuOpen
                        }
                        sx={{
                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap: 1,

                            ml: 1,

                            cursor:
                                "pointer",

                            borderRadius: 2,

                            px: 1,

                            py: 0.5,

                            "&:hover": {
                                backgroundColor:
                                    "background.default",
                            },
                        }}
                    >

                        {/* Avatar */}

                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,

                                backgroundColor:
                                    "primary.main",

                                fontSize: 14,

                                fontWeight: 600,
                            }}
                        >
                            {userInitials}
                        </Avatar>


                        {/* User Details */}

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
                                    fontWeight:
                                        600,

                                    lineHeight:
                                        1.2,
                                }}
                            >
                                {userName}
                            </Typography>


                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {userRoleLabel}
                            </Typography>

                        </Box>


                        <ExpandMore
                            fontSize="small"
                            sx={{
                                color:
                                    "text.secondary",

                                display: {
                                    xs: "none",
                                    sm: "block",
                                },
                            }}
                        />

                    </Box>


                    {/* =================================================
                        USER MENU
                    ================================================= */}

                    <MuiMenu
                        anchorEl={anchorEl}
                        open={userMenuOpen}
                        onClose={
                            handleUserMenuClose
                        }

                        anchorOrigin={{
                            vertical:
                                "bottom",
                            horizontal:
                                "right",
                        }}

                        transformOrigin={{
                            vertical:
                                "top",
                            horizontal:
                                "right",
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
                            onClick={
                                handleLogout
                            }
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