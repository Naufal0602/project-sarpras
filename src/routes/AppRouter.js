import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";

import AdminDashboard from "../pages/admin/dashboard";
import UserPage from "../pages/admin/UsersPage";
import RegisterPage from "../pages/admin/RegisterPage";
import EditUserPage from "../pages/admin/EditUserPage";

import SDDashboard from "../pages/sd/Dashboard";
import PAUDDashboard from "../pages/paud/Dashboard";
import SMPDashboard from "../pages/smp/Dashboard";

import UnauthorizedPage from "../pages/errors/unauthorizedPage";
import ProtectedRouteByRole from "../components/ProtectedRouteByRole";

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRouteByRole allowedRole="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserPage />} />
          <Route path="/admin/users/register" element={<RegisterPage />} />
          <Route path="/admin/edit-user/:id" element={<EditUserPage />} />
        </Route>

        <Route element={<ProtectedRouteByRole allowedRole="user-sd" />}>
          <Route path="/sd/dashboard" element={<SDDashboard />} />
        </Route>

        <Route element={<ProtectedRouteByRole allowedRole="user-paud" />}>
          <Route path="/paud/dashboard" element={<PAUDDashboard />} />
        </Route>

        <Route element={<ProtectedRouteByRole allowedRole="user-smp" />}>
          <Route path="/smp/dashboard" element={<SMPDashboard />} />
        </Route>

        {/* Optional: fallback route */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
