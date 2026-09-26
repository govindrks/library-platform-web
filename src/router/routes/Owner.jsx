import OwnerDashboard from "../../views/LibraryOwner/OwnerDashboard";
import LibraryProfile from "../../views/LibraryOwner/LibraryProfile";
import Amenities from "../../views/LibraryOwner/Amenities";
import MembershipPlans from "../../views/LibraryOwner/MembershipPlans";
import SlotManagement from "../../views/LibraryOwner/SlotManagement";
import SeatMapping from "../../views/LibraryOwner/SeatMapping";
import SeatAvailability from "../../views/LibraryOwner/SeatAvailability";
import Bookings from "../../views/LibraryOwner/Bookings";
import Members from "../../views/LibraryOwner/Members";

const ownerRoutes = [
    {
        path: "/owner/dashboard",
        element: <OwnerDashboard />,
    },
    {
        path: "/owner/library",
        element: <LibraryProfile />,
    },
    {
        path: "/owner/amenities",
        element: <Amenities />,
    },
    {
        path: "/owner/membership-plans",
        element: <MembershipPlans />,
    },
    {
        path: "/owner/slots",
        element: <SlotManagement />,
    },
    {
        path: "/owner/seat-mapping",
        element: <SeatMapping />,
    },
    {
        path: "/owner/seat-availability",
        element: <SeatAvailability />,
    },
    {
        path: "/owner/bookings",
        element: <Bookings />,
    },
    {
    path: "/owner/members",
    element: <Members />,
},
];

export default ownerRoutes;