import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useNavigate } from "react-router-dom";
import "./styles/Galeri.css";

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
        <h2 className="text-2xl font-bold mb-4 capitalize">Galeri pekerjaan fisik bidang {bagianUser}</h2>

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
              <figure key={photo.id}>
                <img src={photo.url_gambar} alt={photo.keterangan} />
                <figcaption>
                  <h3>{photo.keterangan}</h3>
                  <p>{photo.desc}</p>
                </figcaption>
              </figure>
            ))}
      </div>

      {/* Tombol Lihat Semua */}
    
    </div>
  );
};

export default GaleriDashboard;
