import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../services/firebase";
import Navbar from "../../../components/template/Navbar";
import Sidebar from "../../../components/template/SideBar";
import Loading from "../../../components/Loading";

const EditGambarPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [gambar, setGambar] = useState(null);
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, "galeri", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setGambar(data);
          setKeterangan(data.keterangan || "");
        } else {
          alert("Gambar tidak ditemukan.");
          navigate(-1);
        }
      } catch (error) {
        console.error("Gagal mengambil data gambar:", error);
        alert("Terjadi kesalahan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const docRef = doc(db, "galeri", id);
      await updateDoc(docRef, { keterangan });
      alert("✅ Keterangan berhasil diperbarui.");
      navigate(-1);
    } catch (error) {
      console.error("Gagal menyimpan keterangan:", error);
      alert("Terjadi kesalahan saat menyimpan.");
    }
  };

  if (loading) {
    return <Loading text="Loading..." />;
  }

  return (
    <div className="flex min-h-screen">
      <div className="fixed z-50">
        <Navbar />
        <Sidebar />
      </div>
      <div className="w-full mt-20 px-4 sm:px-6 md:px-8 lg:px-10 lg:ml-[16rem]">
        <div className="max-w-2xl mx-auto bg-gray-50 hover:bg-gray-100 transition-colors duration-200 rounded-lg shadow-md p-4 sm:p-6 md:p-8">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">
            Edit Keterangan Gambar
          </h1>

          {gambar?.url_gambar && (
            <img
              src={gambar.url_gambar}
              alt="Gambar"
              className="w-full h-48 sm:h-60 object-cover rounded mb-4"
            />
          )}

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 font-semibold">Keterangan:</label>
            <textarea
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded mb-4"
              rows={4}
              placeholder="Masukkan keterangan..."
            />

            <div className="flex flex-col sm:flex-row justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded w-full sm:w-auto"
              >
                Batal
              </button>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditGambarPage;
