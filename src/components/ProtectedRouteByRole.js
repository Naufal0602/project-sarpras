import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRouteByRole = ({ allowedRole }) => {
  const userData = JSON.parse(localStorage.getItem('user'));

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  if (userData.role !== allowedRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRouteByRole;
