import {
  AccountBalanceWalletOutlined,
  AdminPanelSettingsOutlined,
  AssessmentOutlined,
  DashboardOutlined,
  LocalLibraryOutlined,
  PaymentsOutlined,
  PeopleOutlineOutlined,
  WorkspacePremiumOutlined,
} from "@mui/icons-material";

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
