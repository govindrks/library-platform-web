import {
    Assessment,
    Analytics,
    CalendarMonth,
    CardMembership,
    Dashboard,
    EventSeat,
    LibraryBooks,
    Notifications,
    Payments,
    People,
    ReceiptLong,
    Replay,
    Settings,
} from "@mui/icons-material";

import {
    Box,
    Divider,
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from "@mui/material";

import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import ownerMenu from "../../../navigation/ownerMenu";

const drawerWidth = 250;

/*
|--------------------------------------------------------------------------
| Default User Menu
|--------------------------------------------------------------------------
|
| This is the menu for normal library members/users.
| We can move this to userMenu.js later when we build
| the complete user module.
|
*/
const userMenu = [
    {
        title: "OVERVIEW",
        items: [
            {
                label: "Dashboard",
                path: "/dashboard",
                icon: Dashboard,
            },
        ],
    },

    {
        title: "LIBRARY",
        items: [
            {
                label: "Library Profile",
                path: "/library/profile",
                icon: LibraryBooks,
            },
            {
                label: "Members",
                path: "/members",
                icon: People,
            },
            {
                label: "Membership Plans",
                path: "/membership-plans",
                icon: CardMembership,
            },
            {
                label: "Seats",
                path: "/seats",
                icon: EventSeat,
            },
            {
                label: "Bookings",
                path: "/bookings",
                icon: CalendarMonth,
            },
        ],
    },

    {
        title: "FINANCE",
        items: [
            {
                label: "Payments",
                path: "/payments",
                icon: Payments,
            },
            {
                label: "Refunds",
                path: "/refunds",
                icon: Replay,
            },
            {
                label: "Invoices",
                path: "/invoices",
                icon: ReceiptLong,
            },
        ],
    },

    {
        title: "INSIGHTS",
        items: [
            {
                label: "Reports",
                path: "/reports",
                icon: Assessment,
            },
            {
                label: "Analytics",
                path: "/analytics",
                icon: Analytics,
            },
        ],
    },

    {
        title: "SYSTEM",
        items: [
            {
                label: "Notifications",
                path: "/notifications",
                icon: Notifications,
            },
            {
                label: "Settings",
                path: "/settings",
                icon: Settings,
            },
        ],
    },
];

/*
|--------------------------------------------------------------------------
| Convert ownerMenu format to Sidebar format
|--------------------------------------------------------------------------
|
| ownerMenu uses:
|
| section
| items
|
| Existing Sidebar uses:
|
| title
| items
|
*/
const normalizeOwnerMenu = ownerMenu.map((section) => ({
    title: section.section,
    items: section.items,
}));

function Sidebar({ mobileOpen, onMobileClose }) {
    const location = useLocation();
    const navigate = useNavigate();

    const user = useSelector((state) => state.auth.user);

    const role = user?.role;

    /*
    |--------------------------------------------------------------------------
    | Select menu according to logged-in role
    |--------------------------------------------------------------------------
    */

    let menuSections = userMenu;

    if (role === "LIBRARY_OWNER") {
        menuSections = normalizeOwnerMenu;
    }

    const handleNavigation = (path) => {
        navigate(path);
        onMobileClose?.();
    };

    const drawerContent = (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: "background.paper",
            }}
        >
            {/* Logo */}

            <Box
                sx={{
                    height: 72,
                    display: "flex",
                    alignItems: "center",
                    px: 2.5,
                }}
            >
                <Box
                    sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        backgroundColor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontWeight: 700,
                        fontSize: 18,
                    }}
                >
                    L
                </Box>

                <Box sx={{ ml: 1.5 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 700,
                            lineHeight: 1.1,
                        }}
                    >
                        LibraryHub
                    </Typography>

                    <Typography
                        variant="caption"
                        color="text.secondary"
                    >
                        Management Platform
                    </Typography>
                </Box>
            </Box>

            <Divider />

            {/* Navigation */}

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    px: 1.5,
                    py: 2,
                }}
            >
                {menuSections.map((section) => (
                    <Box
                        key={section.title}
                        sx={{ mb: 2.5 }}
                    >
                        <Typography
                            variant="caption"
                            sx={{
                                display: "block",
                                px: 1.5,
                                mb: 0.75,
                                fontWeight: 700,
                                color: "text.secondary",
                                letterSpacing: "0.08em",
                            }}
                        >
                            {section.title}
                        </Typography>

                        <List disablePadding>
                            {section.items.map((item) => {
                                const Icon = item.icon;

                                const active =
                                    location.pathname ===
                                        item.path ||
                                    location.pathname.startsWith(
                                        `${item.path}/`
                                    );

                                return (
                                    <ListItemButton
                                        key={item.path}
                                        selected={active}
                                        onClick={() =>
                                            handleNavigation(
                                                item.path
                                            )
                                        }
                                        sx={{
                                            minHeight: 42,
                                            mb: 0.5,
                                            borderRadius: 1.5,
                                            px: 1.5,

                                            "&.Mui-selected": {
                                                backgroundColor:
                                                    "primary.light",
                                                color: "primary.main",
                                            },

                                            "&.Mui-selected:hover": {
                                                backgroundColor:
                                                    "primary.light",
                                            },

                                            "&:hover": {
                                                backgroundColor:
                                                    "secondary.light",
                                            },
                                        }}
                                    >
                                        <ListItemIcon
                                            sx={{
                                                minWidth: 38,
                                                color: active
                                                    ? "primary.main"
                                                    : "text.secondary",
                                            }}
                                        >
                                            <Icon fontSize="small" />
                                        </ListItemIcon>

                                        <ListItemText
                                            primary={item.label}
                                            primaryTypographyProps={{
                                                fontSize:
                                                    "0.875rem",
                                                fontWeight: active
                                                    ? 600
                                                    : 500,
                                            }}
                                        />
                                    </ListItemButton>
                                );
                            })}
                        </List>
                    </Box>
                ))}
            </Box>

            {/* Footer */}

            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    borderTop: "1px solid",
                    borderColor: "divider",
                }}
            >
                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    LibraryHub v1.0.0
                </Typography>
            </Box>
        </Box>
    );

    return (
        <>
            {/* Desktop */}

            <Drawer
                variant="permanent"
                sx={{
                    display: {
                        xs: "none",
                        md: "block",
                    },

                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                        borderRight: "1px solid",
                        borderColor: "divider",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Mobile */}

            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: {
                        xs: "block",
                        md: "none",
                    },

                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        boxSizing: "border-box",
                    },
                }}
            >
                {drawerContent}
            </Drawer>
        </>
    );
}

export default Sidebar;