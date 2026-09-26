import {
    AccessTime,
    Assessment,
    Dashboard,
    EventSeat,
    Groups,
    LibraryBooks,
    Notifications,
    Payments,
    Receipt,
    Replay,
    Settings,
    TrendingUp,
    WorkspacePremium,
} from "@mui/icons-material";

const ownerMenu = [
    {
        section: "OVERVIEW",
        items: [
            {
                label: "Dashboard",
                path: "/owner/dashboard",
                icon: Dashboard,
            },
        ],
    },

    {
        section: "LIBRARY",
        items: [
            {
                label: "Library Profile",
                path: "/owner/library",
                icon: LibraryBooks,
            },
            {
                label: "Amenities",
                path: "/owner/amenities",
                icon: WorkspacePremium,
            },
            {
                label: "Membership Plans",
                path: "/owner/membership-plans",
                icon: WorkspacePremium,
            },
        ],
    },

    {
        section: "SEAT MANAGEMENT",
        items: [
            {
                label: "Seat Mapping",
                path: "/owner/seat-mapping",
                icon: EventSeat,
            },
            {
                label: "Slot Management",
                path: "/owner/slots",
                icon: AccessTime,
            },
            {
                label: "Seat Availability",
                path: "/owner/seat-availability",
                icon: EventSeat,
            },
        ],
    },

    {
        section: "BOOKINGS",
        items: [
            {
                label: "Bookings",
                path: "/owner/bookings",
                icon: Receipt,
            },
            {
                label: "Members",
                path: "/owner/members",
                icon: Groups,
            },
        ],
    },

    {
        section: "FINANCE",
        items: [
            {
                label: "Payments",
                path: "/owner/payments",
                icon: Payments,
            },
            {
                label: "Refunds",
                path: "/owner/refunds",
                icon: Replay,
            },
            {
                label: "Invoices",
                path: "/owner/invoices",
                icon: Receipt,
            },
        ],
    },

    {
        section: "INSIGHTS",
        items: [
            {
                label: "Revenue",
                path: "/owner/revenue",
                icon: TrendingUp,
            },
            {
                label: "Occupancy",
                path: "/owner/occupancy",
                icon: Assessment,
            },
            {
                label: "Reports",
                path: "/owner/reports",
                icon: Assessment,
            },
        ],
    },

    {
        section: "SYSTEM",
        items: [
            {
                label: "Notifications",
                path: "/owner/notifications",
                icon: Notifications,
            },
            {
                label: "Settings",
                path: "/owner/settings",
                icon: Settings,
            },
        ],
    },
];

export default ownerMenu;