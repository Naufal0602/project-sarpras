import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';

const LogoutModal = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Logout gagal:', error);
      alert('Terjadi kesalahan saat logout.');
    }
  };

  return (
    <>
      {/* Tombol Logout */}
      <button
        className="bg-white w-full py-5 text-xl rounded-lg text-orange-500 hover:bg-gray-200 transition duration-300 ease-in-out transform hover:scale-105"
        onClick={() => setShowModal(true)}
      >
        Logout
      </button>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="fixed inset-0  w-screen bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Konfirmasi Logout</h2>
            <p className="mb-6 text-gray-600">Apakah kamu yakin ingin logout?</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                onClick={() => setShowModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-orange-500 text-white hover:bg-orange-600 transition"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogoutModal;
