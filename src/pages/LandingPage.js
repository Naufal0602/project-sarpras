import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPekerjaanId, setSelectedPekerjaanId] = useState(null);
  const [galeriPekerjaan, setGaleriPekerjaan] = useState([]);
  const [galeri, setGaleri] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGaleriWithDetails = async () => {
      try {
        // 1. Ambil data galeri (thumbnail)
        const qGaleri = query(
          collection(db, "galeri"),
          where("thumbnail", "==", true)
        );
        const snapshotGaleri = await getDocs(qGaleri);

        const galeriData = [];

        for (const docGaleri of snapshotGaleri.docs) {
          const galeriItem = {
            id: docGaleri.id,
            image: docGaleri.data().url_gambar,
            text: docGaleri.data().keterangan,
            id_pekerjaan: docGaleri.data().id_pekerjaan,
          };

          // 2. Ambil data pekerjaan_fisik
          const pekerjaanRef = collection(db, "pekerjaan_fisik");
          const qPekerjaan = query(
            pekerjaanRef,
            where("__name__", "==", galeriItem.id_pekerjaan)
          );
          const snapshotPekerjaan = await getDocs(qPekerjaan);
          const pekerjaanData = snapshotPekerjaan.docs[0]?.data();

          if (pekerjaanData) {
            galeriItem.pekerjaan = {
              jenis_pekerjaan: pekerjaanData.jenis_pekerjaan,
              sekolah: pekerjaanData.sekolah,
              id_perusahaan: pekerjaanData.id_perusahaan,
            };

            // 3. Ambil data perusahaan
            const perusahaanRef = collection(db, "perusahaan");
            const qPerusahaan = query(
              perusahaanRef,
              where("__name__", "==", pekerjaanData.perusahaan_id)
            );
            const snapshotPerusahaan = await getDocs(qPerusahaan);
            const perusahaanData = snapshotPerusahaan.docs[0]?.data();

            if (perusahaanData) {
              galeriItem.perusahaan = {
                nama: perusahaanData.nama_perusahaan, // sesuaikan nama field
              };
            }
          }

          galeriData.push(galeriItem);
        }

        setGaleri(galeriData);
      } catch (err) {
        console.error("Gagal fetch galeri dengan detail:", err);
      }
    };

    fetchGaleriWithDetails();
  }, []);

  const settings = {
    conterMode: true,
    centerPadding: "60px",
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1028,
        settings: { slidesToShow: 3 },
      },
      {
        breakpoint: 990,
        settings: { slidesToShow: 1 },
      },
    ],
  };

  const handleImageClick = async (media) => {
    const matched = galeri.find((item) => item.image === media.image);
    const pekerjaanId = matched?.id_pekerjaan;
    
    if (!pekerjaanId) return;
    setShowModal(true);

    try {
      const q = query(
        collection(db, "galeri"),
        where("id_pekerjaan", "==", pekerjaanId)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        url_gambar: doc.data().url_gambar,
        keterangan: doc.data().keterangan,
      }));
      console.log("data", data);
      setGaleriPekerjaan(data);
    } catch (err) {
      console.error("Gagal fetch galeri pekerjaan:", err);
    }
  };


  return (
    <div className="bg-white bg-fixed text-black min-h-screen">
      <div className="container mx-auto p-8 overflow-hidden md:rounded-lg md:p-10 lg:p-12">
        <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
          <div className="flex items-center">
            <div>
              <div className="flex items-center justify-center p-2 bg-white rounded-full">
                <img
                  src="/logo_sarpras1.png"
                  className="w-12 h-12"
                  alt="Logo Sarpras"
                />
              </div>
            </div>
            <h1 className="font-serif text-black text-2xl sm:text-3xl font-medium hidden md:block ml-2">
              SARPRAS
            </h1>
          </div>
          <button
            className="border border-orange-500 text-black hover:bg-gray-50 px-4 py-2 rounded hover:bg-white hover:text-black transition duration-200"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>

        <div className="h-32 md:h-40"></div>

        <p className="font-sans text-4xl font-bold text-orange-400 max-w-5xl lg:text-7xl lg:pr-24 md:text-6xl">
          SISTEM MANAJEMEN PEKERJAAN FISIK
        </p>
        <div className="h-10"></div>
        <p className="max-w-2xl font-serif text-xl text-black text-black md:text-2xl">
          Kelola pekerjaan fisik sekolah dengan lebih efisien, transparan, dan
          terdokumentasi secara digital.
        </p>

        <div className="h-32 md:h-40"></div>

        <div className="flex lg:flex-row flex-col-reverse justify-between items-center gap-8">
          <div className="flex flex-col justify-center text-black">
            <p className="self-start inline text-black font-sans text-xl font-medium text-transparent bg-clip-text bg-gradient-to-br from-orange-300 to-orange-400">
              Tentang Sistem
            </p>
            <h2 className="text-4xl text-orange-400 font-bold">
              Dibuat untuk Instansi
            </h2>
            <div className="h-6"></div>
            <p className="font-serif text-xl md:pr-10 text-black">
              Sistem Manajemen Pekerjaan Fisik ini dirancang untuk mempermudah
              proses pengajuan, pencatatan, dan pelaporan sarana prasarana
              sekolah. Dibuat dengan teknologi modern, sistem ini dapat
              digunakan oleh sekolah, operator, hingga dinas terkait.
            </p>
            <div className="h-8"></div>
            <div className="grid grid-cols-2 gap-4 pt-8 border-t border-orange-400">
              <div>
                <p className="font-semibold text-orange-500">
                  Transparan & Efisien
                </p>
                <div className="h-4"></div>
                <p className="font-serif text-black">
                  Setiap proses terekam dan terdokumentasi dengan baik, sehingga
                  memudahkan evaluasi dan pertanggung jawaban.
                </p>
              </div>
              <div>
                <p className="font-semibold text-orange-500">Mudah Digunakan</p>
                <div className="h-4"></div>
                <p className="font-serif text-black">
                  Antarmuka yang sederhana dan ramah pengguna memudahkan semua
                  pihak untuk beradaptasi dengan cepat.
                </p>
              </div>
            </div>
          </div>
          <div className="aspect-square w-96 lg:w-[100rem] lg:ml-24 bg-[url('./gambar2.png')] bg-cover bg-center"></div>
        </div>

        <div className="h-32 md:h-40"></div>

        <p className="font-serif text-4xl">
          <span className="text-orange-400">
            {" "}
            "Membangun masa depan pendidikan Kota Bogor
          </span>
          <span className="text-black">
            {" "}
            dimulai dari penyediaan sarana dan prasarana yang aman, nyaman, dan
            berkualitas bagi setiap peserta didik."
          </span>
        </p>

        <div className="h-32 md:h-40"></div>

        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="flex-col p-8 py-16 rounded-lg shadow-2xl md:p-12 bg-orange-400 border border-white hover:bg-orange-600 transition duration-200"
            >
              <p
                className={`flex items-center justify-center text-4xl font-semibold text-orange-500 bg-white rounded-full shadow-lg w-14 h-14`}
              >
                {num}
              </p>
              <div className="h-6"></div>
              <p className="font-serif text-3xl text-white">
                {
                  [
                    "Pengajuan dan Verifikasi Mudah",
                    "Pantau Progres Pekerjaan Fisik Real-Time",
                    "Laporan Otomatis dan Siap Cetak",
                  ][num - 1]
                }
              </p>
            </div>
          ))}
        </div>

        <div className="h-40"></div>

        <div className="grid gap-8 md:grid-cols-3 text-black">
          <div className="flex flex-col justify-center md:col-span-2">
            <p className="self-start inline font-sans text-xl text-transparent bg-clip-text bg-gradient-to-br from-orange-300 to-orange-400">
              Ayo Mulai Dari Sekarang
            </p>
            <h2 className="text-4xl font-bold text-orange-400">
              Digitalisasi Pengelolaan Sarpras Sekolah Anda
            </h2>
            <div className="h-6"></div>
            <p className="font-serif text-xl text-black md:pr-10">
              Bergabunglah dengan sistem yang mempermudah pencatatan, pengajuan,
              dan pelaporan pekerjaan fisik sekolah secara efisien dan
              transparan.
            </p>
            <div className="h-8"></div>
            <div className="grid gap-6 pt-8 border-t border-orange-400 lg:grid-cols-3">
              <div>
                <p className="font-semibold text-orange-400">Akses Fleksibel</p>
                <div className="h-4"></div>
                <p className="font-serif text-black">
                  Bisa diakses dari mana saja, kapan saja oleh sekolah dan
                  instansi terkait.
                </p>
              </div>
              <div>
                <p className="font-semibold text-orange-400">Data Aman</p>
                <div className="h-4"></div>
                <p className="font-serif text-black">
                  Disimpan secara cloud dengan autentikasi pengguna berdasarkan
                  peran.
                </p>
              </div>
              <div>
                <p className="font-semibold text-orange-400">Siap Digunakan</p>
                <div className="h-4"></div>
                <p className="font-serif text-black">
                  Antarmuka sederhana, tanpa perlu pelatihan rumit.
                </p>
              </div>
            </div>
          </div>
          <div>
            <div className="mx-auto w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 md:rounded-l-full rounded-xl bg-[url('./gambar1.avif')] bg-cover bg-centershadow-lg">
              {" "}
            </div>
          </div>
        </div>

        <div className="w-full relative py-12">
          <div>
            <h2 className="text-4xl font-bold text-orange-400">
              Galeri Pekerjaan
            </h2>
            <Slider {...settings}>
              {galeri.map((media) => (
                <div
                  key={media.id}
                  onClick={() => handleImageClick(media)}
                  className="flex justify-center items-center"
                  title={`Pekerjaan ${
                    media.pekerjaan?.jenis_pekerjaan || ""
                  }, yang dilakukan di sekolah ${
                    media.pekerjaan?.sekolah || ""
                  } oleh ${media.perusahaan?.nama || ""}`}
                >
                  <div className="h-72 flex justify-center items-center flex-col">
                    <img
                      src={media.image}
                      alt={media.text}
                      style={{
                        maxHeight: "300px",
                        width: "auto",
                        cursor: "pointer",
                        borderRadius: "8px",
                      }}
                    />
                    <p style={{ textAlign: "center", marginTop: "8px" }}>
                      {media.text}
                    </p>
                  </div>
                </div>
              ))}
            </Slider>
          </div>

          {/* Modal untuk galeri pekerjaan */}
          {showModal && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
              <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full p-6 overflow-hidden max-h-[70vh] relative">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-extrabold">Galeri Pekerjaan</h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-500 hover:text-red-500 text-xl font-bold"
                  >
                    ×
                  </button>
                </div>

                <div className="flex flex-col mt-8 md:flex-row gap-4 h-96">
                  {/* Kolom Kanan: Galeri */}
                  <div className="w-full relative overflow-scroll">
                    {galeriPekerjaan.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-y-auto max-h-full pr-2 pb-14">
                        {galeriPekerjaan.map((item, index) => (
                          <div
                            key={index}
                            className="border rounded overflow-hidden relative group cursor-pointer"
                          >
                            {/* Gambar */}
                            <img
                              src={item.url_gambar}
                              alt={`Gambar ${index}`}
                              className="w-full h-32 object-cover"
                            />

                            {/* Keterangan */}
                            <p className="text-xs text-center p-1">
                              {item.keterangan || "-"}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        Tidak ada gambar untuk pekerjaan ini.
                      </p>
                    )}

           
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-4 mt-16 border-t border-orange-400 pt-10 text-sm">
          <ul className="space-y-1 text-black">
            <li className="pb-4 font-serif text-orange-400">Media Sosial</li>
            <li>
              <a
                href="https://www.instagram.com/disdikbogorkota?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                className="hover:underline"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/disdikkotabogor"
                className="hover:underline"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href="http://www.youtube.com/@disdikkotabogor2802"
                className="hover:underline"
              >
                YouTube
              </a>
            </li>
            <li>
              <a
                href="https://lynk.id/disdikkotabogor?fbclid=IwY2xjawL5FK5leHRuA2FlbQIxMABicmlkETFrV3ZxMmVQbnRiREJKZVliAR4RjWyVk1UoMOWHZQ1t55o_PCOoY0MeUWMoCoKUZ_t23R3ZSwMwlIBkm8oiOg_aem_Jijh0J7oQp4HtJolreMTJw"
                className="hover:underline"
              >
                LYNK
              </a>
            </li>
          </ul>

          <ul className="space-y-1 text-black">
            <li className="pb-4 font-serif text-orange-400">Kontak</li>
            <li>
              <a href="/login" className="hover:underline">
                Email: info@sarpras.id
              </a>
            </li>
            <li>
              <a href="/login" className="hover:underline">
                Telepon: +62 812 3456 7890
              </a>
            </li>
            <li>
              <a href="/login" className="hover:underline">
                Alamat: Jl.Pajajaran No.125 Kel.Bantarjati Kec.Bogor Utara Kota
                Bogor
              </a>
            </li>
          </ul>

          <ul className="space-y-1 text-black">
            <li className="pb-4 font-serif text-orange-400">Tentang Sistem</li>
            <li>
              <a href="/login" className="hover:underline">
                Tentang Kami
              </a>
            </li>
            <li>
              <a href="/login" className="hover:underline">
                Kebijakan Privasi
              </a>
            </li>
            <li>
              <a href="/login" className="hover:underline">
                Syarat & Ketentuan
              </a>
            </li>
          </ul>

          <ul className="space-y-1 text-orange-400">
            <li className="pb-4 font-serif text-orange-400">Akses Cepat</li>
            <li>
              <a
                href="/login"
                className="inline-block px-4 py-2 text-black hover:text-white border border-orange-400 rounded-md hover:bg-orange-400 transition"
              >
                Masuk ke Sistem
              </a>
            </li>
          </ul>
        </div>

        <div className="h-12"></div>
      </div>
    </div>
  );
};

export default LandingPage;
