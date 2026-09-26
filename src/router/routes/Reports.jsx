import RevenueReport from "../../views/Reports/RevenueReport";
import OccupancyReport from "../../views/Reports/OccupancyReport";
import BookingReport from "../../views/Reports/BookingReport";

const reportRoutes = [
    {
        path: "/owner/revenue",
        element: <RevenueReport />,
    },
    {
        path: "/owner/occupancy",
        element: <OccupancyReport />,
    },
    {
        path: "/owner/reports",
        element: <BookingReport />,
    },
];

export default reportRoutes;