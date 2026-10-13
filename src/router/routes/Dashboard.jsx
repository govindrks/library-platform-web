import {
  Navigate,
} from "react-router-dom";

import {
  useSelector,
} from "react-redux";


function DashboardRedirect() {

  const user =
    useSelector(
      (state) =>
        state.auth?.user
    );


  const role =
    user?.role;


  if (
    role === "ADMIN"
  ) {

    return (
      <Navigate
        to="/admin/dashboard"
        replace
      />
    );
  }


  if (
    role ===
    "LIBRARY_OWNER"
  ) {

    return (
      <Navigate
        to="/owner/dashboard"
        replace
      />
    );
  }


  if (
    role === "USER"
  ) {

    return (
      <Navigate
        to="/student/dashboard"
        replace
      />
    );
  }


  return (
    <Navigate
      to="/"
      replace
    />
  );
}


export default DashboardRedirect;
