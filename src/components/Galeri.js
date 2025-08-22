import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import "./styles/Galeri.css";


const roleToBagian = {
  "user-sd": "SD",
  "user-smp": "SMP",
  "user-paud": "PAUD",
};

const Galeri = ({ role }) => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  

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

  const placeholders = Array.from({ length: 12 }, (_, i) => i);
  const bagianUser = roleToBagian[role];

  return (
    <div>
      {/* Judul dengan role */}
      <h2 className="text-3xl font-bold mb-12 text-center">
        Galeri pekerjaan fisik bidang {bagianUser}
      </h2>

      {/* Grid galeri */}
      <div className="gallery">
        {loading
          ? placeholders.map((i) => (
              <figure
                key={`placeholder-${i}`}
                className="bg-gray-200 animate-pulse"
              />
            ))
          : photos.map((photo) => (
              <figure key={photo.id}>
                <img src={photo.url_gambar} alt={photo.keterangan} />
                <figcaption>
                  <h3>{photo.keterangan}</h3>
                </figcaption>
              </figure>
            ))}
      </div>
    </div>
  );
};

export default Galeri;
