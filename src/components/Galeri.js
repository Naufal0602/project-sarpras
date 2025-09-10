import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../services/firebase";
import { X, Fullscreen, ChevronDown } from "lucide-react"; // buat close modal
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
  const [availableYears, setAvailableYears] = useState([]); // daftar tahun
  const [selectedYear, setSelectedYear] = useState("all"); // tahun yang dipilih
  const [lastDoc, setLastDoc] = useState(null); // simpan dokumen terakhir
  const [hasMore, setHasMore] = useState(true); // apakah masih ada data

  const PAGE_SIZE = 12; // jumlah per batch

  // Ambil daftar tahun berdasarkan tanggal_pekerjaan
  const fetchYears = useCallback(async () => {
    console.log("📌 Mulai fetch daftar tahun...");
    try {
      const bagianUser = roleToBagian[role];
      console.log("Bagian user:", bagianUser.toLowerCase());
      const pekerjaanRef = collection(db, "pekerjaan_fisik");
      const q = query(
        pekerjaanRef,
        where("bagian", "==", bagianUser.toLowerCase())
      );
      const snapshotPekerjaan = await getDocs(q);

      const yearSet = new Set();

      snapshotPekerjaan.forEach((doc) => {
        const tanggalPekerjaan = doc.data().tanggal_pekerjaan;
        if (tanggalPekerjaan) {
          const parsedDate = new Date(tanggalPekerjaan);
          if (!isNaN(parsedDate)) {
            yearSet.add(parsedDate.getFullYear());
          }
        }
      });

      const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
      setAvailableYears(sortedYears);
      console.log("✅ Tahun tersedia:", sortedYears);
    } catch (err) {
      console.error("❌ Gagal fetch tahun:", err);
    }
  }, [role]);

  const fetchPhotos = useCallback(
    async (reset = true) => {
      try {
        setLoading(true);
        console.log(reset ? "📌 Fetch foto awal..." : "🔄 Load more foto...");

        const galeriRef = collection(db, "galeri");
        let galeriQuery = query(
          galeriRef,
          where("thumbnail", "==", true),
          orderBy("created_at", "desc"),
          limit(PAGE_SIZE * 5) // ambil lebih banyak, misalnya 60 dokumen
        );

        if (!reset && lastDoc) {
          galeriQuery = query(
            galeriRef,
            where("thumbnail", "==", true),
            orderBy("created_at", "desc"),
            startAfter(lastDoc),
            limit(PAGE_SIZE * 5)
          );
        }

        const galeriSnap = await getDocs(galeriQuery);

        if (galeriSnap.empty) {
          console.log("⚠️ Tidak ada data lagi.");
          setHasMore(false);
          setLoading(false);
          return;
        }

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

            // ambil tahun dari tanggal_pekerjaan
            const tanggalPekerjaan = pekerjaan.tanggal_pekerjaan;
            let pekerjaanYear = null;
            if (tanggalPekerjaan) {
              const parsedDate = new Date(tanggalPekerjaan);
              if (!isNaN(parsedDate)) {
                pekerjaanYear = parsedDate.getFullYear();
              }
            }

            // cek bagian + filter tahun
            if (
              pekerjaan.bagian.toLowerCase() === bagianUser.toLowerCase() &&
              (selectedYear === "all" || pekerjaanYear === Number(selectedYear))
            ) {
              filteredPhotos.push(g);
            }
          }

          // stop kalau sudah dapat 12 data valid
          if (filteredPhotos.length >= PAGE_SIZE) break;
        }

        console.log(`📂 Batch Firestore: ${galeriData.length} dokumen`);
        console.log("Data Galeri", galeriData);
        console.log(
          `📊 Foto valid sesuai bagian "${bagianUser}": ${filteredPhotos.length}`
        );

        if (reset) {
          setPhotos(filteredPhotos);
        } else {
          setPhotos((prev) => [...prev, ...filteredPhotos]);
        }

        // Simpan lastDoc (tetap dari snapshot asli, bukan yang terfilter)
        setLastDoc(galeriSnap.docs[galeriSnap.docs.length - 1]);
        setHasMore(galeriSnap.docs.length === PAGE_SIZE * 5);
      } catch (err) {
        console.error("❌ Gagal fetch galeri:", err);
      } finally {
        setLoading(false);
      }
    },
    [lastDoc, role, selectedYear]
  );

  // reset data kalau tahun berubah
  useEffect(() => {
    fetchPhotos(true);
  }, [fetchPhotos]);

  useEffect(() => {
    fetchYears();
  }, [fetchYears]);

  const placeholders = Array.from({ length: 10 }, (_, i) => i);
  const bagianUser = roleToBagian[role];

  return (
    <div>
      {/* Header + Select Tahun */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h2 className="text-3xl font-bold mb-4 md:mb-0 text-center">
          Galeri pekerjaan fisik bidang {bagianUser}
        </h2>
        <div className="relative w-40 flex border-b-2 border-orange-400 hover:border-2 px-2 transition duration-200">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="z-10 bg-transparent text-xl font-bold pr-12 text-orange-400 border-0 focus:outline-none focus:border-orange-500 transition-colors duration-200 pb-1 appearance-none"
          >
            <option value="all">Semua Tahun</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <ChevronDown
            size={18}
            className="absolute text-orange-400"
            style={{ right: "0px", marginTop: "11px" }}
          />
        </div>
      </div>

      {/* Grid Galeri */}
      <div className="gallery grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading && photos.length === 0
          ? placeholders.map((i) => (
              <figure
                key={`placeholder-${i}`}
                className="bg-gray-200 animate-pulse h-48 rounded-lg"
              />
            ))
          : photos.map((photo) => (
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

                {/* Overlay tombol fullscreen */}
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

      {/* Tombol Load More */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => fetchPhotos(false)}
            className="bg-orange-400 text-white px-6 py-2 rounded-lg shadow hover:bg-orange-500"
          >
            Load More
          </button>
        </div>
      )}

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
