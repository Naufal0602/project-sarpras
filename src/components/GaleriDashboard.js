import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import "./styles/Galeri.css";
import { X, Fullscreen } from "lucide-react";

// mapping role ke bagian
const roleToBagian = {
  "user-sd": "sd",
  "user-smp": "smp",
  "user-paud": "paud",
};

const GaleriDashboard = ({ role }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [zoomImageUrl, setZoomImageUrl] = useState(null);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const galeriSnap = await getDocs(collection(db, "galeri"));
        const galeriData = galeriSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const bagianUser = roleToBagian[role];

        const filteredPhotos = [];
        for (const g of galeriData) {
          if (!g.id_pekerjaan) continue;

          const pekerjaanRef = doc(db, "pekerjaan_fisik", g.id_pekerjaan);
          const pekerjaanSnap = await getDoc(pekerjaanRef);

          if (pekerjaanSnap.exists()) {
            const pekerjaan = pekerjaanSnap.data();
            if (pekerjaan.bagian === bagianUser) {
              filteredPhotos.push(g);
            }
          }
        }

        setPhotos(filteredPhotos);
      } catch (err) {
        console.error("❌ Gagal fetch galeri:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPhotos();
  }, [role]);

  const placeholders = Array.from({ length: 10 }, (_, i) => i);
  const bagianUser = roleToBagian[role];

  return (
    <div className="gallery-container">
      <div className="justify-between flex items-center mb-4 w-full">
        <h2 className="text-2xl font-bold mb-4 capitalize">
          Galeri pekerjaan fisik bidang {bagianUser}
        </h2>

        {!loading && photos.length > 10 && (
          <div className="flex justify-center mb-4 mr-4">
            <button
              onClick={() => navigate("/user/Galeri")}
              className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lihat Semua
            </button>
          </div>
        )}
      </div>
      <div className="gallery">
        {loading
          ? placeholders.map((i) => (
              <figure
                key={`placeholder-${i}`}
                className="bg-gray-200 animate-pulse"
              />
            ))
          : photos.slice(0, 10).map((photo) => (
              <figure key={photo.id} className="relative group">
                <img src={photo.url_gambar} alt={photo.keterangan} />
                <figcaption>
                  <h3>{photo.keterangan}</h3>
                  <p>{photo.desc}</p>
                </figcaption>

                {/* overlay tombol fullscreen */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 bg-black bg-opacity-40 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setZoomImageUrl(photo.url_gambar);
                    }}
                    className="bg-white px-3 py-1 rounded shadow hover:bg-gray-100"
                  >
                    <Fullscreen size={30} />
                  </button>
                </div>
              </figure>
            ))}
      </div>

      {/* Tombol Lihat Semua */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setZoomImageUrl(null)}
        >
          <div className="relative max-w-5xl w-full p-4" onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomImageUrl(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-80"
            >
              <X size={24} />
            </button>
            <img
              src={zoomImageUrl}
              alt="Zoomed"
              className="w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriDashboard;
