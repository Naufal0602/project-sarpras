import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function ModalGaleri({ idPekerjaan, onClose }) {
  const [galeri, setGaleri] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGaleri = async () => {
      setLoading(true);
      const q = query(collection(db, "galeri"), where("id_pekerjaan", "==", idPekerjaan));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setGaleri(data);
      setLoading(false);
    };

    fetchGaleri();
  }, [idPekerjaan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white w-full max-w-4xl p-4 rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded"
        >
          Tutup
        </button>

        <h2 className="text-xl font-semibold mb-4">Galeri Pekerjaan</h2>

        {loading ? (
          <p>Loading...</p>
        ) : galeri.length === 0 ? (
          <p className="text-gray-500">Tidak ada gambar.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {galeri.map((item) => (
              <img
                key={item.id}
                src={item.url_gambar}
                alt={item.keterangan || "Gambar"}
                className="w-full h-48 object-cover rounded"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
