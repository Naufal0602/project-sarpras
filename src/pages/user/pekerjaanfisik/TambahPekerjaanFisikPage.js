import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../../services/cloudinaryService";
import { db } from "../../../services/firebase";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  serverTimestamp,
  doc,
} from "firebase/firestore";
import Select from "react-select";
import Navbar from "../../../components/template/Navbar";
import Sidebar from "../../../components/template/SideBar";
import Loading from "../../../components/Loading";
import { getAuth } from "firebase/auth";
import SuccessFullScreen from "../../../components/Success";

export default function TambahPekerjaanFisikDanUpload() {
  const [perusahaanId, setPerusahaanId] = useState("");
  const [jenisPekerjaan, setJenisPekerjaan] = useState("");
  const [pekerjaan, setPekerjaan] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [bagian, setBagian] = useState("");
  const [tanggalPekerjaan, setTanggalPekerjaan] = useState("");
  const [perusahaanOptions, setPerusahaanOptions] = useState([]);
  const [successToast, setSuccessToast] = useState(false);

  const [files, setFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [keterangan, setKeterangan] = useState("");

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserBagian = async () => {
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          if (userData.role && userData.role.startsWith("user-")) {
            setBagian(userData.role.replace("user-", ""));
          }
        }
      }
    };

    const fetchPerusahaan = async () => {
      const snapshot = await getDocs(collection(db, "perusahaan"));
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          nama: doc.data().nama_perusahaan,
          status: doc.data().status,
        }))
        .filter((item) => item.status === "aktif");
      setPerusahaanOptions(data);
      if (data.length > 0) {
        setPerusahaanId(data[0].id);
      }
    };

    fetchUserBagian();
    fetchPerusahaan();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // 1. Simpan pekerjaan fisik dulu
      const pekerjaanRef = await addDoc(collection(db, "pekerjaan_fisik"), {
        perusahaan_id: perusahaanId,
        jenis_pekerjaan: jenisPekerjaan,
        pekerjaan,
        deskripsi,
        bagian,
        tanggal_pekerjaan: tanggalPekerjaan,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      const pekerjaanId = pekerjaanRef.id;

      // 2. Cek apakah pekerjaan ini sudah punya thumbnail
      const q = query(
        collection(db, "galeri"),
        where("id_pekerjaan", "==", pekerjaanId),
        where("thumbnail", "==", true)
      );
      const snapshot = await getDocs(q);
      let hasThumbnail = !snapshot.empty;

      // 3. Upload gambar ke Cloudinary + simpan ke koleksi galeri
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadToCloudinary(file);
        const { secure_url, public_id } = result;

        await addDoc(collection(db, "galeri"), {
          id_pekerjaan: pekerjaanId,
          url_gambar: secure_url,
          public_id,
          keterangan,
          created_at: serverTimestamp(),
          thumbnail: hasThumbnail ? false : true,
        });

        if (!hasThumbnail) hasThumbnail = true;
      }
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
      setSuccessToast(true);
    }
  };
  if (loading) {
    return <Loading text="Menyimpan..." />;
  }

  return (
    <>
      <SuccessFullScreen
        className="fixed inset-0 flex  z-50"
        show={successToast}
        message="Pekerjaan fisik berhasil ditambahkan!"
        onDone={() => navigate("/user/pekerjaan-fisik")}
      />

      <div className="flex min-h-screen bg-gray-50">
        <div className="fixed">
          <Navbar />
          <Sidebar />
        </div>

        <div className="flex flex-col items-center justify-start md:ml-72 pt-20 p-8 w-full">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg p-6 rounded-lg w-full max-w-2xl"
          >
            <h2 className="text-2xl text-center font-bold mb-6 text-orange-600">
              Tambah Pekerjaan Fisik & Upload Gambar
            </h2>

            {/* --- FORM PEKERJAAN --- */}
            <label className="block mb-3">
              <span className="font-medium">Perusahaan</span>
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
            </label>

            <label className="block mb-3">
              <span className="font-medium">Jenis Pekerjaan</span>
              <input
                type="text"
                value={jenisPekerjaan}
                onChange={(e) => setJenisPekerjaan(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </label>

            <label className="block mb-3">
              <span className="font-medium">Pekerjaan</span>
              <input
                type="text"
                value={pekerjaan}
                onChange={(e) => setPekerjaan(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </label>

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

            <label className="block mb-3">
              <span className="font-medium">Deskripsi</span>
              <textarea
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                rows="3"
                required
              />
            </label>

            {/* --- UPLOAD GAMBAR --- */}
            <label className="block mb-3">
              <span className="font-medium">Pilih Gambar</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files);
                  setFiles(selected);
                  setPreviewUrls(selected.map((f) => URL.createObjectURL(f)));
                }}
                className="mt-1 block w-full border rounded px-2 py-1"
              />
            </label>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="border rounded overflow-hidden">
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
              <span className="font-medium">
                Keterangan (untuk semua gambar)
              </span>
              <input
                type="text"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </label>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/user/pekerjaan-fisik")}
                className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
