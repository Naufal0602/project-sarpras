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
import Select from "react-select";
import { db } from "../../../services/firebase";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/template/Navbar";
import Sidebar from "../../../components/template/SideBar";
import Loading from "../../../components/Loading";
import SuccessFullScreen from "../../../components/Success";
const EditPekerjaanFisikPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [perusahaanId, setPerusahaanId] = useState("");
  const [jenisPekerjaan, setJenisPekerjaan] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [loading, setLoading] = useState(false);
  const [tanggalPekerjaan, setTanggalPekerjaan] = useState("");
  const [perusahaanOptions, setPerusahaanOptions] = useState([]);
  const [successToast, setSuccessToast] = useState(false);

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
          setTanggalPekerjaan(data.tanggal_pekerjaan || "");
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
        tanggal_pekerjaan: tanggalPekerjaan,
        updated_at: serverTimestamp(),
      });

      setSuccessToast(true);
    } catch (error) {
      console.error("Gagal memperbarui data:", error);
      alert("Terjadi kesalahan saat menyimpan data.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Mengupdate..." />;
  }

  return (
    <>
      <SuccessFullScreen
        className="fixed inset-0 flex  z-50"
        show={successToast}
        message="Pekerjaan fisik berhasil diedit!"
        onDone={() => navigate("/user/pekerjaan-fisik")}
      />

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
              <Select
                value={
                  perusahaanOptions
                    .map((p) => ({ value: p.id, label: p.nama }))
                    .find((opt) => opt.value === perusahaanId) || null
                }
                onChange={(selected) => setPerusahaanId(selected.value)}
                options={perusahaanOptions.map((p) => ({
                  value: p.id,
                  label: p.nama,
                }))}
                className="w-full"
                placeholder="Pilih perusahaan..."
                isSearchable
                required
              />
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

            <label className="block mb-3">
              <span className="font-medium">Tanggal Pekerjaan</span>
              <input
                type="date"
                value={tanggalPekerjaan}
                onChange={(e) => setTanggalPekerjaan(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </label>

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
    </>
  );
};

export default EditPekerjaanFisikPage;
