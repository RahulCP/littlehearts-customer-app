import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const PrivateRoute = ({ user, children }) => {
  const location = useLocation();
  if (!user) {
    // Redirect to login and store the current location
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;
