import {
  AccountCircle,
  CalendarMonth,
  CardMembership,
  Dashboard,
  EventSeat,
  HelpOutlineOutlined,
  LibraryBooks,
  Notifications,
  Payments,
  ReceiptLong,
  SwapHoriz,
} from "@mui/icons-material";

const studentMenu = [
  {
    title: "OVERVIEW",

    items: [
      {
        label: "Dashboard",
        path: "/student/dashboard",
        icon: Dashboard,
      },
    ],
  },

  {
    title: "DISCOVER",

    items: [
      {
        label: "Browse Libraries",
        path: "/student/libraries",
        icon: LibraryBooks,
      },

      {
        label: "Find Seats",
        path: "/student/libraries",
        icon: EventSeat,
      },
    ],
  },

  {
    title: "MY LIBRARY",

    items: [
      {
        label: "My Membership",
        path: "/student/membership",
        icon: CardMembership,
      },

      {
        label: "My Bookings",
        path: "/student/bookings",
        icon: CalendarMonth,
      },

      {
        label: "Seat Change Requests",
        path: "/student/seat-change",
        icon: SwapHoriz,
      },
    ],
  },

  {
    title: "FINANCE",

    items: [
      {
        label: "Payments",
        path: "/student/payments",
        icon: Payments,
      },

      {
        label: "Invoices",
        path: "/student/invoices",
        icon: ReceiptLong,
      },
    ],
  },

  {
    title: "ACCOUNT",

    items: [
      {
        label: "Notifications",
        path: "/student/notifications",
        icon: Notifications,
      },

      {
        label: "My Profile",
        path: "/student/profile",
        icon: AccountCircle,
      },

      {
        label: "Help & Support",
        path: "/student/help-support",
        icon: HelpOutlineOutlined,
      },
    ],
  },
];

export default studentMenu;
