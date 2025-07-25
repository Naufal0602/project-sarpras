// src/pages/EditUserPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AdminNavbar from '../../components/AdminNavBar';
import AdminSidebar from '../../components/AdminSideBar';

const EditUserPage = () => {
  const { id } = useParams(); // id = UID user
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmail(data.email);
        setRole(data.role);
        setLevel(data.level || 1);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        role,
        level: parseInt(level, 10),
      });
      alert("Data pengguna berhasil diperbarui");
      navigate("/admin/users");
    } catch (err) {
      alert("Gagal memperbarui pengguna: " + err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Navbar dan Sidebar */}
      <div className="fixed z-50">
        <AdminNavbar username="Admin" />
        <AdminSidebar />
      </div>

      {/* Konten Utama */}
      <div className="flex-1 md:ml-72 pt-16 px-4">
        <div className="max-w-md mx-auto mt-8 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Edit Pengguna</h2>

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                value={email}
                disabled
                className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="admin">Admin</option>
                <option value="user-sd">User SD</option>
                <option value="user-paud">User PAUD</option>
                <option value="user-smp">User SMP</option>
              </select>
            </div>

            {/* Level Akses */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level Akses</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
              >
                <option value="1">Level 1 - Lihat Saja</option>
                <option value="2">Level 2 - CRUD</option>
              </select>
            </div>

            {/* Tombol Simpan */}
            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-all duration-200 shadow"
            >
              Simpan Perubahan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


export default EditUserPage;
