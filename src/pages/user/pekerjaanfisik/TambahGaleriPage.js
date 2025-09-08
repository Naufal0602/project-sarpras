import React, { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../../../services/cloudinaryService";
import { db } from "../../../services/firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import Navbar from "../../../components/template/Navbar";
import Sidebar from "../../../components/template/SideBar";
import Loading from "../../../components/Loading";
import SuccessFullScreen from "../../../components/Success";

export default function UploadForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false); // ✅ status notif ambil foto

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraMode, setCameraMode] = useState("environment");

  // 🎥 buka kamera
  const startCamera = async (mode = cameraMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 640 }, // resolusi lebih kecil
          height: { ideal: 480 }, // resolusi lebih kecil
        },
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Tidak bisa akses kamera:", err);
      alert("Gagal membuka kamera, cek izin browser!");
    }
  };

  const toggleCamera = async () => {
    try {
      // stop stream lama dulu
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      // ubah mode kamera
      setCameraMode((prev) => {
        const newMode = prev === "user" ? "environment" : "user";

        // tunggu state update lalu buka ulang kamera
        setTimeout(() => {
          startCamera(newMode);
        }, 200);

        return newMode;
      });
    } catch (err) {
      console.error("Gagal ganti kamera:", err);
      alert("Tidak bisa ganti kamera.");
    }
  };

  // 📸 ambil foto dari video -> canvas
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

      // tampilkan notifikasi sebentar
      setPhotoTaken(true);
      setTimeout(() => setPhotoTaken(false), 1200);
    } catch (err) {
      console.error("Gagal ambil foto:", err);
      alert("Tidak bisa ambil foto.");
    }
  };

  // ❌ hapus gambar dari preview
  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // 📂 pilih file manual
  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selected]);
    setPreviewUrls((prev) => [
      ...prev,
      ...selected.map((file) => URL.createObjectURL(file)),
    ]);
  };

  // 🚀 Upload ke Cloudinary + Firestore
  const handleUpload = async () => {
    if (!files.length) {
      alert("Pilih minimal satu gambar.");
      return;
    }

    try {
      setLoading(true);

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
          thumbnail: hasThumbnail ? false : true,
        });

        if (!hasThumbnail) hasThumbnail = true;
      }
    } catch (err) {
      alert("Gagal upload satu atau lebih gambar.");
    } finally {
      setSuccessToast(true);
      setLoading(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
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
        <SuccessFullScreen
          className="fixed inset-0 flex z-50"
          show={successToast}
          message="Gambar berhasil diupload!"
          onDone={() => navigate("/user/pekerjaan-fisik")}
        />
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
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="mt-1 block w-full text-sm text-gray-700 border border-gray-300 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
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

          {/* PREVIEW */}
          {previewUrls?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              {previewUrls.map((url, idx) => (
                <div
                  key={idx}
                  className="relative border rounded-md overflow-hidden"
                >
                  <img
                    src={url}
                    alt={`Preview ${idx}`}
                    className="w-full h-28 object-cover"
                  />
                  <button
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

      {/* MODAL KAMERA */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 text-center">
            <h2 className="text-lg font-semibold mb-4">Ambil Foto</h2>

            {/* PREVIEW VIDEO */}
            <video
              ref={videoRef}
              className={`w-full aspect-[4/3] bg-black rounded-md mb-4 object-cover ${
                cameraMode === "user" ? "scale-x-[-1]" : ""
              }`}
              autoPlay
              muted
            />

            {/* NOTIFIKASI BERHASIL */}
            {photoTaken && (
              <div className="text-green-600 font-semibold mb-2 animate-pulse">
                ✅ Gambar berhasil diambil
              </div>
            )}

            <div className="flex gap-2 justify-center">
              <button
                onClick={takePhoto}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md"
              >
                Ambil Foto
              </button>
              <button
                onClick={toggleCamera}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded-md"
              >
                Ganti Kamera
              </button>
              <button
                onClick={() => {
                  if (streamRef.current) {
                    streamRef.current
                      .getTracks()
                      .forEach((track) => track.stop());
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
    </div>
  );
}
