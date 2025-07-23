import React from 'react';
import LogoutButton from '../../components/LogoutButton';
import { Link } from 'react-router-dom';

const ADMINDashboard = () => {
  return (
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

      <LogoutButton />
    </div>
  );
};

export default ADMINDashboard;
