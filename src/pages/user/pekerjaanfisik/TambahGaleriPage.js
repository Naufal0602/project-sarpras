import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../../services/cloudinaryService";
import { db } from "../../../services/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, where  } from "firebase/firestore";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/SideBar";

export default function UploadForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);

  const handleUpload = async () => {
    if (!files.length) {
      alert("Pilih minimal satu gambar.");
      return;
    }

    try {
      setLoading(true);

      // Cek apakah sudah ada thumbnail di pekerjaan ini
      const q = query(
        collection(db, "galeri"),
        where("id_pekerjaan", "==", id),
        where("thumbnail", "==", true)
      );
      const snapshot = await getDocs(q);
      let hasThumbnail = !snapshot.empty;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadToCloudinary(file);
        const { secure_url, public_id } = result;

        await addDoc(collection(db, "galeri"), {
          id_pekerjaan: id,
          url_gambar: secure_url,
          public_id: public_id,
          keterangan: keterangan,
          created_at: serverTimestamp(),
          thumbnail: hasThumbnail ? false : true, // hanya true jika belum ada thumbnail
        });

        // Setelah satu gambar dapat true, set flag jadi true agar sisanya false
        if (!hasThumbnail) hasThumbnail = true;
      }

      alert("Semua gambar berhasil diupload!");
      navigate("/user/pekerjaan-fisik");
    } catch (err) {
      console.error("Gagal upload:", err);
      alert("Gagal upload satu atau lebih gambar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="fixed z-50">
        <Navbar />
        <Sidebar />
      </div>
      <div className="flex justify-center items-start w-full min-h-[calc(100vh-80px)] pt-10 mt-10 px-4">
        <div className="w-full max-w-2xl md:max-w-xl bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Upload Gambar untuk Pekerjaan Fisik
          </h1>

          <label className="block mb-3">
            <span className="text-sm font-medium text-gray-600">
              Pilih Gambar
            </span>
            <input
              type="file"
              multiple
              onChange={(e) => {
                const selected = Array.from(e.target.files);
                setFiles(selected);
                setPreviewUrls(
                  selected.map((file) => URL.createObjectURL(file))
                );
              }}
              className="mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
            />
          </label>

          {/* PREVIEW */}
          {previewUrls?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {previewUrls.map((url, idx) => (
                <div key={idx} className="border rounded-md overflow-hidden">
                  <img
                    src={url}
                    alt={`Preview ${idx}`}
                    className="w-full h-28 object-cover"
                  />
                  <p className="text-xs text-center p-1 truncate">
                    {files[idx]?.name}
                  </p>
                </div>
              ))}
            </div>
          )}

          <label className="block mb-4">
            <span className="text-sm font-medium text-gray-600">
              Keterangan
            </span>
            <input
              type="text"
              placeholder="Keterangan (untuk semua gambar)"
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm p-2"
            />
          </label>

          <button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className={`w-full text-white py-2 px-4 rounded-md text-sm font-medium transition-all duration-300 ${
              loading || files.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-orange-500 hover:bg-orange-600"
            }`}
          >
            {loading ? "Mengupload..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
