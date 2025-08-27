import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import ModalProsesUser from "../../components/modal/ModalProsesUser";
import AdminNavbar from "../../components/template/AdminNavBar";
import AdminSidebar from "../../components/template/AdminSideBar";
import SuccesFullScreen from "../../components/Success.js";

const PendingUserListPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [succesToast, setSuccessToast] = useState(false);

  const fetchPendingUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "pending_users"));
      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPendingUsers(users);
    } catch (err) {
      console.error("Gagal memuat pending users:", err);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleProsesClick = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setShowModal(false);
    fetchPendingUsers(); // Refresh data setelah modal ditutup
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar dan Navbar */}
      <div className="fixed">
        <AdminNavbar />
        <AdminSidebar />
      </div>

      {/* Konten utama */}
      <div className="flex-1 md:ml-72 pt-20 p-8 w-full">
        <h2 className="text-2xl font-bold mb-6 text-orange-600">
          Daftar Pending Users
        </h2>

        <div className="overflow-x-auto shadow-lg rounded-lg bg-white">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="px-4 py-3 text-left">Nama</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Tanggal Daftar</th>
                <th className="px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-6">
                    Tidak ada pengguna pending.
                  </td>
                </tr>
              ) : (
                pendingUsers.map((user) => (
                  <tr key={user.id} className="border-b">
                    <td className="px-4 py-3">{user.nama}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      {user.createdAt?.toDate?.().toLocaleString?.() ?? "-"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleProsesClick(user)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold"
                      >
                        Proses
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && selectedUser && (
          <ModalProsesUser
            user={selectedUser}
            onClose={closeModal}
            onSuccess={() => setSuccessToast(true)}
          />
        )}

        {succesToast && (
          <SuccesFullScreen
            show={succesToast}
            message="Data berhasil diproses"
            onDone={() => setSuccessToast(false)} // reset biar bisa muncul lagi
          />
        )}
      </div>
    </div>
  );
};

export default PendingUserListPage;
