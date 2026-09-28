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
  Autorenew,
  LocalOffer,
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
        label: "My Bookings",
        path: "/my-bookings",
        icon: EventSeat,
      },
      {
        label: "Members",
        path: "/owner/members",
        icon: Groups,
      },
      {
        label: "Seat Change Requests",
        path: "/owner/seat-change-requests",
        icon: EventSeat,
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
        label: "Subscription & Billing",
        path: "/owner/subscription",
        icon: WorkspacePremium,
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
      {
        label: "Coupons",
        path: "/owner/coupons",
        icon: LocalOffer,
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

  {
    section: "AUTOMATION",
    items: [
      {
        label: "Automation Center",
        path: "/owner/automation",
        icon: Replay,
      },
      {
        label: "Automation Center",
        path: "/owner/automation",
        icon: Autorenew,
      },
      {
        label: "Notifications",
        path: "/owner/notifications",
        icon: Notifications,
      },
    ],
  },
];

export default ownerMenu;
