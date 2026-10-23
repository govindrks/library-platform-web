import {
  AccessTime,
  Assessment,
  AssessmentOutlined,
  Autorenew,
  ContactPhoneRounded,
  Dashboard,
  EventSeat,
  ForumOutlined,
  Groups,
  HelpOutlineOutlined,
  LibraryBooks,
  LocalOffer,
  MessageOutlined,
  Notifications,
  Payments,
  Receipt,
  Replay,
  Settings,
  SupportAgentOutlined,
  TrendingDown,
  TrendingUp,
  WhatsApp,
  WorkspacePremium,
} from "@mui/icons-material";


// ============================================================
// LIBRARY OWNER MENU
// ============================================================

const ownerMenu = [

  // ==========================================================
  // OVERVIEW
  // ==========================================================

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


  // ==========================================================
  // LIBRARY
  // ==========================================================

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


  // ==========================================================
  // SEAT MANAGEMENT
  // ==========================================================

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


  // ==========================================================
  // BOOKINGS
  // ==========================================================

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

      {
        label: "Membership Enquiries",
        path: "/owner/enquiries",
        icon: ContactPhoneRounded,
      },

      {
        label: "Seat Change Requests",
        path: "/owner/seat-change-requests",
        icon: EventSeat,
      },
    ],
  },


  // ==========================================================
  // FINANCE
  // ==========================================================

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
        label: "Expenses",
        path: "/owner/expenses",
        icon: TrendingDown,
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


  // ==========================================================
  // INSIGHTS
  // ==========================================================

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


  // ==========================================================
  // WHATSAPP
  // ==========================================================

  {
    section: "WHATSAPP",

    items: [
      {
        label: "WhatsApp Settings",
        path: "/owner/whatsapp/settings",
        icon: WhatsApp,
      },

      {
        label: "WhatsApp Messages",
        path: "/owner/whatsapp/messages",
        icon: MessageOutlined,
      },

      {
        label: "WhatsApp Usage",
        path: "/owner/whatsapp/usage",
        icon: AssessmentOutlined,
      },
    ],
  },


  // ==========================================================
  // AUTOMATION
  // ==========================================================

  {
    section: "AUTOMATION",

    items: [
      {
        label: "Automation Center",
        path: "/owner/automation",
        icon: Autorenew,
      },
    ],
  },


  // ==========================================================
  // SUPPORT
  // ==========================================================

  {
    section: "SUPPORT",

    items: [
      {
        label: "Help & Support",
        path: "/owner/help-support",
        icon: HelpOutlineOutlined,
      },

      {
        label: "My Support Tickets",
        path: "/owner/support/tickets",
        icon: ForumOutlined,
      },

      {
        label: "Student Support",
        path: "/owner/student-support",
        icon: SupportAgentOutlined,
      },
    ],
  },


  // ==========================================================
  // SYSTEM
  // ==========================================================

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