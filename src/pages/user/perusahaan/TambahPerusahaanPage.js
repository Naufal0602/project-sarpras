import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "../../../components/template/Navbar";
import Sidebar from "../../../components/template/SideBar";
import { uploadToCloudinary } from "../../../services/cloudinaryService";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
import "leaflet/dist/leaflet.css";
import Loading from "../../../components/Loading";
import SuccessFullScreen from "../../../components/Success";

const TambahPerusahaanPage = () => {
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [direktur, setDirektur] = useState("");
  const [alamat, setAlamat] = useState("");
  const [status, setStatus] = useState("aktif");
  const [loading, setLoading] = useState(false);
  const [koordinat, setKoordinat] = useState({
    lat: -6.572344888759943,
    lng: 106.80879449857458,
  });
  const [fotoKantorFile, setFotoKantorFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [successToast, setSuccessToast] = useState(false);
  const [manualInput, setManualInput] = useState(
    `${-6.572344888759943}, ${106.80879449857458}`
  );
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload foto ke Cloudinary
      const result = await uploadToCloudinary(fotoKantorFile);

      if (!result?.public_id || !result?.secure_url) {
        throw new Error("Gagal mengupload foto ke Cloudinary");
      }

      // Simpan ke Firestore
      await addDoc(collection(db, "perusahaan"), {
        nama_perusahaan: namaPerusahaan,
        direktur,
        alamat,
        status,
        latitude: koordinat.lat,
        longitude: koordinat.lng,
        foto_kantor: {
          public_id: result.public_id,
          secure_url: result.secure_url,
        },
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Reset input
      setPreviewUrl(null);
      setFotoKantorFile(null);

      // Arahkan ke halaman list setelah delay
      setSuccessToast(true);
    } catch (error) {
      console.error("Gagal menambahkan perusahaan:", error);
      alert("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  function LocationMarker({ koordinat, onSelect }) {
    const map = useMapEvents({
      click(e) {
        onSelect(e.latlng);
      },
    });

    useEffect(() => {
      if (!map) return;
      map.whenReady(() => {
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      });
    }, [map]);

    return koordinat ? <Marker position={koordinat} /> : null;
  }

  const handleManualInput = (e) => {
    const value = e.target.value;
    setManualInput(value);

    // cek format lat, lng
    const parts = value.split(",").map((p) => p.trim());
    if (parts.length === 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setKoordinat({ lat, lng });
      }
    }
  };

  return (
    <>
      <SuccessFullScreen
        className="fixed inset-0 flex  z-50"
        show={successToast}
        message="Perusahaan berhasil ditambahkan!"
        onDone={() => navigate("/user/perusahaan")}
      />

      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <Loading text="Mengupload" />
        </div>
      )}

      <div className="flex min-h-screen bg-gray-50">
        {/* Sidebar dan Navbar */}
        <div className="fixed z-50">
          <AdminNavbar />
          <Sidebar />
        </div>

        {/* Konten utama */}
        <div className="flex flex-col items-center justify-center md:ml-72 pt-20 p-8 w-full">
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg p-6 rounded-lg w-full justify-center max-w-xl"
          >
            <h2 className="text-2xl text-center font-bold mb-6 text-orange-600">
              Tambah Data Perusahaan
            </h2>
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Nama Perusahaan
              </label>
              <input
                type="text"
                value={namaPerusahaan}
                onChange={(e) => setNamaPerusahaan(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Direktur
              </label>
              <input
                type="text"
                value={direktur}
                onChange={(e) => setDirektur(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <textarea
                value={alamat}
                onChange={(e) => setAlamat(e.target.value)}
                className="w-full border px-4 py-2 rounded"
                rows="3"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border px-4 py-2 rounded"
              >
                <option value="aktif">Aktif</option>
                <option value="tidak aktif">Tidak Aktif</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Foto Kantor
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setFotoKantorFile(file);
                    setPreviewUrl(URL.createObjectURL(file)); // buat preview
                  }
                }}
                className="w-full border px-4 py-2 rounded"
                required
              />
              {previewUrl && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Preview Foto Kantor:</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-48 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Titik Koordinat (Klik di Map)
              </label>

              <input
                type="text"
                value={manualInput}
                onChange={handleManualInput}
                placeholder="-6.803990570390972, 107.20227608428854"
                className="w-full border rounded p-2 mb-3"
              />

              {!loading && (
                <MapContainer
                  center={[koordinat.lat, koordinat.lng]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ height: "300px", width: "100%", zIndex: 0 }}
                  className="rounded"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMarker
                    koordinat={koordinat}
                    onSelect={setKoordinat}
                  />
                </MapContainer>
              )}

              <p className="text-sm mt-2">
                Lat: <strong>{koordinat.lat}</strong>, Lng:{" "}
                <strong>{koordinat.lng}</strong>
              </p>
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
    </>
  );
};

export default TambahPerusahaanPage;
