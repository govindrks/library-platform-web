import {
  AccountBalanceWalletOutlined,
  AdminPanelSettingsOutlined,
  AssessmentOutlined,
  DashboardOutlined,
  DescriptionOutlined,
  ErrorOutlineOutlined,
  ForumOutlined,
  LocalLibraryOutlined,
  PaymentsOutlined,
  PeopleOutlineOutlined,
  SupportAgentOutlined,
  WhatsApp,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";


// ============================================================
// ADMIN MENU
// ============================================================

const adminMenu = [

  // =========================================================
  // OVERVIEW
  // =========================================================

  {
    section: "OVERVIEW",

    items: [
      {
        label: "Dashboard",
        path: "/admin/dashboard",
        icon: DashboardOutlined,
      },
    ],
  },


  // =========================================================
  // PLATFORM MANAGEMENT
  // =========================================================

  {
    section: "PLATFORM MANAGEMENT",

    items: [
      {
        label: "Libraries",
        path: "/admin/libraries",
        icon: LocalLibraryOutlined,
      },

      {
        label: "Users",
        path: "/admin/users",
        icon: PeopleOutlineOutlined,
      },
    ],
  },


  // =========================================================
  // SUBSCRIPTIONS
  // =========================================================

  {
    section: "SUBSCRIPTIONS",

    items: [
      {
        label: "Platform Plans",
        path: "/admin/platform-plans",
        icon: WorkspacePremiumOutlined,
      },

      {
        label: "Subscriptions",
        path: "/admin/subscriptions",
        icon: AccountBalanceWalletOutlined,
      },
    ],
  },


  // =========================================================
  // FINANCE
  // =========================================================

  {
    section: "FINANCE",

    items: [
      {
        label: "Payments",
        path: "/admin/payments",
        icon: PaymentsOutlined,
      },
    ],
  },


  // =========================================================
  // WHATSAPP
  // =========================================================

  {
    section: "WHATSAPP",

    items: [
      {
        label: "WhatsApp Overview",
        path: "/admin/whatsapp/overview",
        icon: WhatsApp,
      },

      {
        label: "WhatsApp Templates",
        path: "/admin/whatsapp/templates",
        icon: DescriptionOutlined,
      },

      {
        label: "WhatsApp Failures",
        path: "/admin/whatsapp/failures",
        icon: ErrorOutlineOutlined,
      },
    ],
  },


  // =========================================================
  // SUPPORT
  // =========================================================

  {
    section: "SUPPORT",

    items: [
      {
        label: "Support Dashboard",
        path: "/admin/support",
        icon: SupportAgentOutlined,
      },

      {
        label: "Support Tickets",
        path: "/admin/support/tickets",
        icon: ForumOutlined,
      },
    ],
  },


  // =========================================================
  // INSIGHTS
  // =========================================================

  {
    section: "INSIGHTS",

    items: [
      {
        label: "Reports",
        path: "/admin/reports",
        icon: AssessmentOutlined,
      },
    ],
  },


  // =========================================================
  // SYSTEM
  // =========================================================

  {
    section: "SYSTEM",

    items: [
      {
        label: "Settings",
        path: "/admin/settings",
        icon: AdminPanelSettingsOutlined,
      },
    ],
  },
];


export default adminMenu;