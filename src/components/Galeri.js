import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, query, where} from "firebase/firestore";
import { db } from "../services/firebase";
import { X, Fullscreen } from "lucide-react"; // buat close modal
import "./styles/Galeri.css";

const roleToBagian = {
  "user-sd": "SD",
  "user-smp": "SMP",
  "user-paud": "PAUD",
};

const Galeri = ({ role }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoomImageUrl, setZoomImageUrl] = useState(null); // modal zoom

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        // ✅ hanya ambil galeri dengan thumbnail = true
        const galeriRef = collection(db, "galeri");
        const galeriQuery = query(galeriRef, where("thumbnail", "==", true));
        const galeriSnap = await getDocs(galeriQuery);

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
            if (pekerjaan.bagian.toLowerCase() === bagianUser.toLowerCase()) {
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
    <div>
      {/* Judul */}
      <h2 className="text-3xl font-bold mb-12 text-center">
        Galeri pekerjaan fisik bidang {bagianUser}
      </h2>

      {/* Grid Galeri */}
      <div className="gallery grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? placeholders.map((i) => (
              <figure
                key={`placeholder-${i}`}
                className="bg-gray-200 animate-pulse h-48 rounded-lg"
              />
            ))
          : photos.slice(0, 10).map((photo) => (
              <figure
                key={photo.id}
                className="relative group rounded-lg overflow-hidden shadow"
              >
                <img
                  src={photo.url_gambar}
                  alt={photo.keterangan}
                  className="w-full h-48 object-cover"
                />
                <figcaption className="text-center mt-2 text-sm">
                  {photo.keterangan}
                </figcaption>

                {/* ✅ Overlay tombol tetap */}
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

      {/* Modal Zoom */}
      {zoomImageUrl && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setZoomImageUrl(null)}
        >
          <div
            className="relative max-w-5xl w-full p-4"
            onClick={(e) => e.stopPropagation()}
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

export default Galeri;
