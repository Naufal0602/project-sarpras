import React from 'react';
import LogoutButton from '../../components/LogoutButton';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSideBar';
import AdminNavbar from '../../components/AdminNavBar';

const ADMINDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed">
        <AdminNavbar />
        <AdminSidebar />
    </div>
    <div style={{ padding: '40px' }}>
      <h1>Dashboard Admin</h1>

      <nav style={{ margin: '20px 0' }}>
        <ul>
          <li>
            <Link to="/admin/users">Kelola Pengguna</Link>
          </li>
          {/* Tambahkan link lain jika ada */}
        </ul>
      </nav>
    </div>
    </div>
  );
};

export default ADMINDashboard;
