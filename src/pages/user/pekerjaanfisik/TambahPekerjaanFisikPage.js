import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../../components/AdminNavBar";
import Sidebar from "../../../components/SideBar";

const TambahPekerjaanFisikPage = () => {
  const [perusahaanId, setPerusahaanId] = useState("");
  const [detailPekerjaan, setDetailPekerjaan] = useState("");
  const [bagian, setBagian] = useState("paud");
  const [loading, setLoading] = useState(false);
  const [perusahaanOptions, setPerusahaanOptions] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPerusahaan = async () => {
      try {
        const snapshot = await getDocs(collection(db, "perusahaan"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          nama: doc.data().nama_perusahaan,
        }));
        setPerusahaanOptions(data);
        if (data.length > 0) {
          setPerusahaanId(data[0].id);
        }
      } catch (err) {
        console.error("Gagal mengambil daftar perusahaan:", err);
      }
    };

    fetchPerusahaan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "pekerjaan_fisik"), {
        perusahaan_id: perusahaanId,
        detail_pekerjaan: detailPekerjaan,
        bagian,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      alert("Data pekerjaan fisik berhasil ditambahkan.");
      navigate("/user/pekerjaan-fisik");
    } catch (error) {
      console.error("Gagal menambahkan pekerjaan fisik:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed">
        <AdminNavbar />
        <Sidebar />
      </div>

      <div className="flex flex-col items-center justify-center md:ml-72 pt-20 p-8 w-full">
        <form onSubmit={handleSubmit} className="bg-white shadow-lg p-6 rounded-lg w-full justify-center max-w-xl">
          <h2 className="text-2xl text-center font-bold mb-6 text-orange-600">
            Tambah Pekerjaan Fisik
          </h2>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Perusahaan</label>
            <select
              value={perusahaanId}
              onChange={(e) => setPerusahaanId(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            >
              {perusahaanOptions.map((perusahaan) => (
                <option key={perusahaan.id} value={perusahaan.id}>
                  {perusahaan.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Detail Pekerjaan</label>
            <textarea
              value={detailPekerjaan}
              onChange={(e) => setDetailPekerjaan(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              rows="3"
              required
            />
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
              onClick={() => navigate("/user/pekerjaan-fisik")}
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

export default TambahPekerjaanFisikPage;
