import MyBookings from "../../views/Booking/MyBookings";
import BookingSummary from "../../views/Booking/BookingSummary";
import BookingSuccess from "../../views/Booking/BookingSuccess";

import MySeatChangeRequests from "../../views/SeatChangeRequest/MySeatChangeRequests";
import RequestSeatChange from "../../views/SeatChangeRequest/RequestSeatChange";
import CreateBooking from "../../views/LibraryOwner/CreateBooking";

const bookingRoutes = [
  {
    path: "/booking/summary",
    element: <BookingSummary />,
  },
  {
    path: "/owner/bookings/create",
    element: <CreateBooking />,
  },
  {
    path: "/booking/success",
    element: <BookingSuccess />,
  },
  {
    path: "/my-bookings",
    element: <MyBookings />,
  },
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
