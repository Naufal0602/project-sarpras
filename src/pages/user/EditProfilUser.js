import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import Navbar from "../../components/template/Navbar";
import Sidebar from "../../components/template/SideBar";

const EditProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchUserData = async () => {
      console.log("Memulai fetch data user...");
      console.log("id dari URL:", id);

      try {
        const userRef = doc(db, "users", id);
        console.log("Mencoba ambil dokumen user:", userRef.path);

        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          console.log("Data user ditemukan:", userSnap.data());
          setNama(userSnap.data().nama || "");
        } else {
          console.warn("Dokumen user tidak ditemukan untuk id:", id);
          setMessage("Data user tidak ditemukan.");
        }
      } catch (error) {
        console.error("Gagal memuat data user:", error);
        setMessage("Gagal memuat data user: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [id]);

  const handleSimpan = async (e) => {
    e.preventDefault();
    setMessage("");

    console.log("Menyimpan perubahan nama:", nama);
    try {
      await updateDoc(doc(db, "users", id), {
        nama: nama,
      });
      console.log("Nama berhasil diperbarui.");
      setMessage("Nama berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal memperbarui nama:", error);
      setMessage("Gagal memperbarui nama: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-lg">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed">
        <Navbar />
        <Sidebar />
      </div>
      <div className="flex-1 ml-5 pt-16">
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-10">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">
                Edit Nama
              </h2>
              <form onSubmit={handleSimpan} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nama
                  </label>
                  <input
                    type="text"
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-orange-300"
                    required
                  />
                </div>
                {message && (
                  <p className="text-sm text-center text-red-500">{message}</p>
                )}
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
