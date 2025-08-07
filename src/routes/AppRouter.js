import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import ConfirmAccountPage from "../pages/auth/ConfirmAccountPage.js";
import LupaPasswordPage from "../pages/auth/LupaPassword.js";

import AdminDashboard from "../pages/admin/dashboard";
import UserPage from "../pages/admin/UsersPage";
import RegisterPage from "../pages/auth/RegisterPage.js";
import EditUserPage from "../pages/admin/EditUserPage";
import PendingUserPage from "../pages/admin/PendingUser";
import AdminProfil from "../pages/admin/ProfilAdmin.js";
import EditProfil from "../pages/admin/EditProfil.js";

import UserDashboard from "../pages/user/dashboard.js";
import UserProfil from "../pages/user/Profil.js";
import UserEditProfil from "../pages/user/EditProfilUser.js";

import UserPerusahaan from "../pages/user/perusahaan/index.js";
import UserTambahPerusahaan from "../pages/user/perusahaan/TambahPerusahaanPage.js";
import UserEditPerusahaan from "../pages/user/perusahaan/EditPerusahaanPage.js";

import UserPekerjaanFisik from "../pages/user/pekerjaanfisik/index.js";
import TambahPekerjaanFisikPage from "../pages/user/pekerjaanfisik/TambahPekerjaanFisikPage.js";
import EditPekerjaanFisikPage from "../pages/user/pekerjaanfisik/EditPekerjaanFisikPage.js";
import TambahGaleriPage from "../pages/user/pekerjaanfisik/TambahGaleriPage.js";
import EditGambarPage from "../pages/user/pekerjaanfisik/EditGambarPage.js";


import UnauthorizedPage from "../pages/errors/unauthorizedPage";
import ProtectedRouteByRole from "../components/ProtectedRouteByRole";


const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/konfirmasi-akun" element={<ConfirmAccountPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/lupa-password" element={<LupaPasswordPage />} />


        {/* Protected routes */}
        <Route element={<ProtectedRouteByRole allowedRole="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserPage />} />
          <Route path="/admin/edit-user/:id" element={<EditUserPage />} />
          <Route path="/admin/pending-users" element={<PendingUserPage />} />
          <Route path="/admin/ProfilAdmin" element={<AdminProfil />} />
          <Route path="/admin/ProfilAdmin/edit/:id" element={<EditProfil />} />
        </Route>

        <Route element={<ProtectedRouteByRole allowedRole={["user-sd", "user-paud", "user-smp"]}/>}>
          <Route path="/user/dashboard" element={<UserDashboard />} />
          <Route path="/user/profil" element={<UserProfil />} />
          <Route path="/user/edit-profile/:id" element={<UserEditProfil />} />
          <Route path="/user/perusahaan" element={<UserPerusahaan />} />
          <Route path="/user/perusahaan/tambah" element={<UserTambahPerusahaan />} />
          <Route path="/user/perusahaan/edit/:id" element={<UserEditPerusahaan />} />

          <Route path="/user/pekerjaan-fisik" element={<UserPekerjaanFisik />} />
          <Route path="/user/pekerjaan-fisik/tambah" element={<TambahPekerjaanFisikPage />} />
          <Route path="/user/pekerjaan-fisik/edit/:id" element={<EditPekerjaanFisikPage />} />
          <Route path="/user/pekerjaan-fisik/galeri/tambah/:id" element={<TambahGaleriPage />} />
          <Route path="/edit-gambar/:id" element={<EditGambarPage />} />

        </Route>

        {/* Optional: fallback route */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Routes>
    </Router>
  );
};

export default AppRouter;
