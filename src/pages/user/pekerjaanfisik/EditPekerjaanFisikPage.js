import React, { useState, useEffect } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
  serverTimestamp,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/SideBar";

const EditPekerjaanFisikPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [perusahaanId, setPerusahaanId] = useState("");
  const [jenisPekerjaan, setJenisPekerjaan] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [perusahaanOptions, setPerusahaanOptions] = useState([]);

  useEffect(() => {
    const fetchPerusahaan = async () => {
  try {
    const perusahaanRef = collection(db, "perusahaan");
    const aktifQuery = query(perusahaanRef, where("status", "==", "aktif"));
    const snapshot = await getDocs(aktifQuery);

    if (snapshot.empty) {
      alert("Tidak ada perusahaan aktif yang ditemukan.");
      return;
    }

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      nama: doc.data().nama_perusahaan,
    }));

    setPerusahaanOptions(data);
  } catch (err) {
    console.error("Gagal mengambil daftar perusahaan:", err);
    alert("Terjadi kesalahan saat mengambil data perusahaan.");
  }
};

    const fetchPekerjaanFisik = async () => {
      try {
        const docRef = doc(db, "pekerjaan_fisik", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPerusahaanId(data.perusahaan_id || "");
          setJenisPekerjaan(data.jenis_pekerjaan || "");
          setSekolah(data.sekolah || "");
          setDeskripsi(data.deskripsi || "");
        } else {
          alert("Data tidak ditemukan.");
          navigate("/user/pekerjaan-fisik");
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
      }
    };

    fetchPerusahaan();
    fetchPekerjaanFisik();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const docRef = doc(db, "pekerjaan_fisik", id);
      await updateDoc(docRef, {
        perusahaan_id: perusahaanId,
        jenis_pekerjaan: jenisPekerjaan,
        sekolah,
        deskripsi,
        updated_at: serverTimestamp(),
      });

      alert("Data berhasil diperbarui.");
      navigate("/user/pekerjaan-fisik");
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed">
        <Navbar />
        <Sidebar />
      </div>

      <div className="flex flex-col items-center justify-center md:ml-72 pt-20 p-8 w-full">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg p-6 rounded-lg w-full justify-center max-w-xl"
        >
          <h2 className="text-2xl text-center font-bold mb-6 text-orange-600">
            Edit Pekerjaan Fisik
          </h2>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">
              Perusahaan
            </label>
            <select
              value={perusahaanId}
              onChange={(e) => setPerusahaanId(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            >
              {perusahaanOptions.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">
              Jenis Pekerjaan
            </label>
            <input
              type="text"
              value={jenisPekerjaan}
              onChange={(e) => setJenisPekerjaan(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">
              Sekolah
            </label>
            <input
              type="text"
              value={sekolah}
              onChange={(e) => setSekolah(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">
              Deskripsi
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              rows="3"
              required
            />
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >
              {loading ? "Menyimpan..." : "Update"}
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

export default EditPekerjaanFisikPage;
