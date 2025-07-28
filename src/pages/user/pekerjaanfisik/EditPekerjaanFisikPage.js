import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/SideBar";

const EditPekerjaanFisikPage = () => {
  const [detailPekerjaan, setDetailPekerjaan] = useState("");
  const [bagian, setBagian] = useState("paud");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "pekerjaan_fisik", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDetailPekerjaan(data.detail_pekerjaan);
          setBagian(data.bagian);
        } else {
          alert("Data tidak ditemukan.");
          navigate("/user/pekerjaan-fisik");
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        alert("Terjadi kesalahan. Silakan coba lagi.");
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateDoc(doc(db, "pekerjaan_fisik", id), {
        detail_pekerjaan: detailPekerjaan,
        bagian,
        updated_at: serverTimestamp(),
      });

      alert("Data pekerjaan fisik berhasil diperbarui.");
      navigate("/user/pekerjaan-fisik");
    } catch (error) {
      console.error("Gagal memperbarui pekerjaan fisik:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
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
        <form onSubmit={handleSubmit} className="bg-white shadow-lg p-6 rounded-lg w-full justify-center max-w-xl">
          <h2 className="text-2xl text-center font-bold mb-6 text-orange-600">
            Edit Pekerjaan Fisik
          </h2>

          <div className="mb-4">
            <label className="block font-medium text-gray-700 mb-1">Detail Pekerjaan</label>
            <textarea
              value={detailPekerjaan}
              onChange={(e) => setDetailPekerjaan(e.target.value)}
              className="w-full border px-4 py-2 rounded"
              rows="4"
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