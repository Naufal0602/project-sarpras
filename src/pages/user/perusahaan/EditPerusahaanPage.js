import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../services/firebase";
import { useNavigate, useParams } from "react-router-dom";
import AdminNavbar from "../../../components/template/AdminNavBar.js";
import Sidebar from "../../../components/template/SideBar.js";
import Loading from "../../../components/Loading.js";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { uploadToCloudinary } from "../../../services/cloudinaryService";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const LocationMarker = ({ setLatitude, setLongitude }) => {
  useMapEvents({
    click(e) {
      setLatitude(e.latlng.lat);
      setLongitude(e.latlng.lng);
    },
  });
  return null;
};

const EditPerusahaanPage = () => {
  const [namaPerusahaan, setNamaPerusahaan] = useState("");
  const [direktur, setDirektur] = useState("");
  const [alamat, setAlamat] = useState("");
  const [status, setStatus] = useState("aktif");
  const [loading, setLoading] = useState(false);

  const [latitude, setLatitude] = useState(-6.2);
  const [longitude, setLongitude] = useState(106.8);
  const [fotoKantor, setFotoKantor] = useState(null); // untuk preview
  const [fotoFile, setFotoFile] = useState(null); // untuk upload

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, "perusahaan", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNamaPerusahaan(data.nama_perusahaan);
          setDirektur(data.direktur);
          setAlamat(data.alamat);
          setStatus(data.status);
          if (data.latitude) setLatitude(data.latitude);
          if (data.longitude) setLongitude(data.longitude);
          if (data.foto_kantor) setFotoKantor(data.foto_kantor.secure_url);
        } else {
          alert("Data tidak ditemukan.");
          navigate("/user/perusahaan");
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        alert("Terjadi kesalahan. Silakan coba lagi.");
      } finally {
        setLoading(false); // pastikan ini juga ada
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let fotoKantorBaru = fotoKantor; // default pakai yang lama

      if (fotoFile) {

        try {
          const docRef = doc(db, "perusahaan", id);
          const docSnap = await getDoc(docRef);
          const data = docSnap.data();
          console.log("Menghapus foto lama:", data.foto_kantor.public_id);
          await axios.post("http://localhost:3001/api/cloudinary/", {
            public_id: data.foto_kantor.public_id,
          });
        } catch (e) {
          console.error("Gagal hapus foto lama:", e);
        }

        const uploadRes = await uploadToCloudinary(fotoFile);
        fotoKantorBaru = uploadRes;
      }

      await updateDoc(doc(db, "perusahaan", id), {
        nama_perusahaan: namaPerusahaan,
        direktur,
        alamat,
        status,
        latitude,
        longitude,
        foto_kantor: fotoKantorBaru,
        updated_at: serverTimestamp(),
      });

      alert("Data perusahaan berhasil diperbarui.");
      navigate("/user/perusahaan"); // dimatikan dulu saat debugging
    } catch (error) {
      console.error("Gagal memperbarui perusahaan:", error);
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
        {loading ? (
          <Loading text="Menyimpan perubahan..." />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white shadow-lg p-6 rounded-lg w-full justify-center max-w-xl"
          >
            <h2 className="text-2xl text-center font-bold mb-6 text-orange-600">
              Edit Data Perusahaan
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
                    setFotoFile(file);
                    setFotoKantor(URL.createObjectURL(file)); // update preview dengan foto baru
                  }
                }}
                className="w-full border px-4 py-2 rounded"
              />

              {fotoKantor && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">Preview Foto Kantor:</p>
                  <img
                    src={fotoKantor}
                    alt="Preview"
                    className="w-48 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>

            {/* Map */}
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-1">
                Lokasi Kantor (Klik pada peta)
              </label>
              <div className="h-64 w-full mb-2">
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <LocationMarker
                    setLatitude={setLatitude}
                    setLongitude={setLongitude}
                  />
                  <Marker position={[latitude, longitude]} />
                </MapContainer>
              </div>
              <p className="text-sm text-gray-600">
                Lat: {latitude.toFixed(5)}, Lng: {longitude.toFixed(5)}
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
              >
                {loading ? <Loading /> : "Update"}
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
        )}
        ;
      </div>
    </div>
  );
};

export default EditPerusahaanPage;
