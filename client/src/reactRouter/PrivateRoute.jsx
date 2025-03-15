import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

export const PrivateRoute = () => {
  // for routes where user must be logged in

  const user = useSelector((state) => state.user.user);
  return user ? <Outlet /> : <Navigate to="/" />;
};
