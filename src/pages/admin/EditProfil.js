import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import AdminSidebar from "../../components/AdminSideBar";
import AdminNavbar from "../../components/template/AdminNavBar";

const EditUserProfile = () => {
  const [nama, setNama] = useState("");
  const [role, setRole] = useState("");
  const [level, setLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setNama(data.nama || "");
          setRole(data.role || "");
          setLevel(data.level || "");
        }
      } catch (err) {
        alert("Gagal mengambil data user.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    setSaving(true);
    try {
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        nama,
        role,
        level,
        updated_at: new Date(),
      });
      alert("Data berhasil diperbarui!");
      navigate("/admin/ProfilAdmin"); // arahkan ke halaman profil
    } catch (err) {
      alert("Gagal menyimpan perubahan.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed">
        <AdminNavbar />
        <AdminSidebar />
      </div>
      <div className="flex-1 ml-5 pt-16 px-6 lg:ml-64">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-xl mx-auto mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profil</h2>

          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-1">Nama</label>
            <input
              type="text"
              className="w-full border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
            />
          </div>

          <div className="flex justify-between items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded font-medium"
            >
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="text-white bg-red-600 px-6 py-2 rounded hover:underline"
            >
              Batal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserProfile;
