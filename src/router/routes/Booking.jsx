import MySeatChangeRequests
    from "../../views/SeatChangeRequest/MySeatChangeRequests";

import RequestSeatChange
    from "../../views/SeatChangeRequest/RequestSeatChange";

const bookingRoutes = [
    {
        path: "/my-seat-change-requests",
        element: <MySeatChangeRequests />,
    },
    {
        path: "/request-seat-change",
        element: <RequestSeatChange />,
    },
];

export default bookingRoutes;