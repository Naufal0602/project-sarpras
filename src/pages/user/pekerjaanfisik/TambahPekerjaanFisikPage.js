import React, { useState, useEffect, useRef } from "react";
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

  // --- CAMERA STATE ---
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState("environment");
  const [photoTaken, setPhotoTaken] = useState(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // ambil role user
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

  // --- CAMERA FUNCTION ---
  const startCamera = async (mode = cameraMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Tidak bisa akses kamera:", err);
      alert("Gagal membuka kamera!");
    }
  };

  const toggleCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
    setCameraMode((prev) => {
      const newMode = prev === "user" ? "environment" : "user";
      setTimeout(() => startCamera(newMode), 200);
      return newMode;
    });
  };

  const takePhoto = async () => {
    try {
      const track = streamRef.current.getVideoTracks()[0];
      const imageCapture = new ImageCapture(track);
      const photoBlob = await imageCapture.takePhoto();
      const photoFile = new File([photoBlob], `camera-${Date.now()}.jpg`, {
        type: "image/jpeg",
      });
      const photoUrl = URL.createObjectURL(photoBlob);

      setFiles((prev) => [...prev, photoFile]);
      setPreviewUrls((prev) => [...prev, photoUrl]);

      setPhotoTaken(true);
      setTimeout(() => setPhotoTaken(false), 1200);
    } catch (err) {
      console.error("Gagal ambil foto:", err);
      alert("Tidak bisa ambil foto.");
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // --- SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

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

      const q = query(
        collection(db, "galeri"),
        where("id_pekerjaan", "==", pekerjaanId),
        where("thumbnail", "==", true)
      );
      const snapshot = await getDocs(q);
      let hasThumbnail = !snapshot.empty;

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
          bagian,
        });

        if (!hasThumbnail) hasThumbnail = true;
      }
    } catch (err) {
      console.error("Gagal menyimpan:", err);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setLoading(false);
      setSuccessToast(true);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    }
  };

  if (loading) return <Loading text="Menyimpan..." />;

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

            {/* FORM */}
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

            {/* UPLOAD GAMBAR */}
            <label className="block mb-3">
              <span className="font-medium">Pilih Gambar</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const selected = Array.from(e.target.files);
                  setFiles((prev) => [...prev, ...selected]);
                  setPreviewUrls((prev) => [
                    ...prev,
                    ...selected.map((f) => URL.createObjectURL(f)),
                  ]);
                }}
                className="mt-1 block w-full border rounded px-2 py-1"
              />
              <button
                type="button"
                onClick={() => {
                  setCameraOpen(true);
                  setTimeout(() => startCamera(), 300);
                }}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md mt-2"
              >
                Buka Kamera
              </button>
            </label>

            {previewUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                {previewUrls.map((url, idx) => (
                  <div key={idx} className="relative border rounded overflow-hidden">
                    <img
                      src={url}
                      alt={`Preview ${idx}`}
                      className="w-full h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                    <p className="text-xs text-center p-1 truncate">
                      {files[idx]?.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <label className="block mb-4">
              <span className="font-medium">Keterangan (untuk semua gambar)</span>
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

      {/* MODAL KAMERA */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">Ambil Foto</h2>
            <video
              ref={videoRef}
              className={`w-full aspect-[4/3] bg-black rounded-md mb-4 object-cover ${
                cameraMode === "user" ? "scale-x-[-1]" : ""
              }`}
              autoPlay
              muted
            />
            {photoTaken && (
              <div className="text-green-600 font-semibold mb-2 animate-pulse">
                ✅ Gambar berhasil diambil
              </div>
            )}
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={takePhoto}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md"
              >
                Ambil Foto
              </button>
              <button
                type="button"
                onClick={toggleCamera}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md"
              >
                Ganti Kamera
              </button>
              <button
                type="button"
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current.getTracks().forEach((t) => t.stop());
                  }
                  setCameraOpen(false);
                }}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-md"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export { TambahPekerjaanFisikDanUpload };