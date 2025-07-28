import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../../components/AdminNavBar";
import Sidebar from "../../../components/SideBar";

const TambahPerusahaanPage = () => {
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [direktur, setDirektur] = useState("");
  const [alamat, setAlamat] = useState("");
  const [status, setStatus] = useState("aktif");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "perusahaan"), {
        nama_perusahaan: namaPerusahaan,
        direktur,
        alamat,
        status,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      alert("Data perusahaan berhasil ditambahkan.");
      navigate("/user/perusahaan");
    } catch (error) {
      console.error("Gagal menambahkan perusahaan:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar dan Navbar */}
      <div className="fixed">
        <AdminNavbar />
        <Sidebar />
      </div>

      {/* Konten utama */}
      <div className="flex flex-col items-center justify-center md:ml-72 pt-20 p-8 w-full">

        <form onSubmit={handleSubmit} className="bg-white shadow-lg p-6 rounded-lg w-full justify-center max-w-xl">
        <h2 className="text-2xl text-center font-bold mb-6 text-orange-600">
          Tambah Data Perusahaan
        </h2>
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Nama Perusahaan</label>
            <input
              type="text"
              value={namaPerusahaan}
              onChange={(e) => setNamaPerusahaan(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Direktur</label>
            <input
              type="text"
              value={direktur}
              onChange={(e) => setDirektur(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Alamat</label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              rows="3"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border px-4 py-2 rounded"
            >
              <option value="aktif">Aktif</option>
              <option value="tidak aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded"
            >
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/user/perusahaan")}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TambahPerusahaanPage;
