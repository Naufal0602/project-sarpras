import React, { useState } from "react";
import { auth, db } from "../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../components/AdminNavBar";
import AdminSidebar from "../../components/AdminSideBar";
import emailjs from "@emailjs/browser";

function RegisterPage() {
  const generatePassword = (length = 10) => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const [nama, setNama] = useState('');
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user-sd");
  const [level, setLevel] = useState(1); // 👈 Tambahkan level
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    const generatedPassword = generatePassword();
    const tempId = crypto.randomUUID(); // UID sementara

    try {
      // Simpan user ke Firestore pending_users dulu
      await setDoc(doc(db, "pending_users", tempId), {
        nama: nama, 
        email: email,
        password: generatedPassword,
        role: role,
        level: parseInt(level),
        createdAt: new Date(),
        isActivated: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      });

      // Kirim email aktivasi
      await emailjs.send(
        "service_7ub17uc",
        "template_cdbr3iq",
        {
          to_email: email,
          email: email,
          password: generatedPassword,
          confirmation_url: `http://localhost:3000/konfirmasi-akun?id=${tempId}`,
        },
        "TNa873KoLNwnqtnCa"
      );

      alert("Email aktivasi telah dikirim ke pengguna.");
      navigate("/admin/users");
    } catch (error) {
      console.error("Gagal mengirim email:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Sidebar dan Navbar */}
      <div className="fixed z-50">
        <AdminNavbar />
        <AdminSidebar />
      </div>

      {/* Konten utama */}
      <div className="flex-1 md:ml-72 pt-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg overflow-hidden mt-4">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white">
              Register Pengguna Baru
            </h2>
            <p className="text-orange-100 mt-2 text-sm">
              Tambahkan pengguna ke sistem
            </p>
          </div>

          {/* Form Content */}
          <div className="px-6 py-6">
            <form onSubmit={handleRegister} className="space-y-6">
              {/* Nama Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Pengguna
                </label>
                <input
                  type="text"
                  placeholder="Masukkan Nama"
                  required
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
                />
              </div>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Masukkan email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 placeholder-gray-400"
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Pengguna
                </label>
                <select
                  onChange={(e) => setRole(e.target.value)}
                  value={role}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="user-sd">User SD</option>
                  <option value="user-paud">User PAUD</option>
                  <option value="user-smp">User SMP</option>
                </select>
              </div>

              {/* Level Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Akses
                </label>
                <select
                  onChange={(e) => setLevel(e.target.value)}
                  value={level}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                >
                  <option value={1}>Level 1 (Lihat Saja)</option>
                  <option value={2}>Level 2 (CRUD)</option>
                </select>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transform hover:scale-[1.02] transition-all duration-200 shadow-lg"
              >
                Daftar Pengguna
              </button>
            </form>
          </div>
        </div>

        {/* Info Card */}
        <div className="max-w-md mx-auto mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Informasi Level Akses
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  <strong>Level 1:</strong> Hanya dapat melihat data
                </p>
                <p>
                  <strong>Level 2:</strong> Dapat mengelola data (Create, Read,
                  Update, Delete)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
