import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../services/firebase";
const LandingPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedPekerjaanId, setSelectedPekerjaanId] = useState(null);
  const [galeriPekerjaan, setGaleriPekerjaan] = useState([]);
  const [galeri, setGaleri] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (window.Swiper) {
      new window.Swiper(".centered-slide-carousel", {
        centeredSlides: true,
        paginationClickable: true,
        loop: true,
        spaceBetween: 30,
        slideToClickedSlide: true,
        pagination: {
          el: ".centered-slide-carousel .swiper-pagination",
          clickable: true,
        },
        breakpoints: {
          1920: {
            slidesPerView: 4,
            spaceBetween: 30,
          },
          1028: {
            slidesPerView: 3,
            spaceBetween: 10,
          },
          990: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
        },
      });
    }
    const fetchGaleri = async () => {
      try {
        const q = query(
          collection(db, "galeri"),
          where("thumbnail", "==", true) // hanya ambil yang thumbnail === true
        );
        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          image: doc.data().url_gambar,
          text: doc.data().keterangan,
          id_pekerjaan: doc.data().id_pekerjaan,
        }));

        setGaleri(data); // Simpan full data
      } catch (err) {
        console.error("Gagal fetch galeri:", err);
      }
    };

    fetchGaleri();
  }, []);

  const handleImageClick = async (media) => {
    const matched = galeri.find((item) => item.image === media.image);
    const pekerjaanId = matched?.id_pekerjaan;

    console.log("Gambar diklik, id_pekerjaan:", pekerjaanId);
    if (!pekerjaanId) return;
    console.log(selectedPekerjaanId);
    setSelectedPekerjaanId(pekerjaanId);
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
      setGaleriPekerjaan(data);
    } catch (err) {
      console.error("Gagal fetch galeri pekerjaan:", err);
    }
  };
  console.log(handleImageClick);

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

        <div className="w-full relative">
          <div className="swiper centered-slide-carousel swiper-container relative ">
            <div className="swiper-wrapper">
              {galeri.map((item) => (
                <div className="swiper-slide" key={item.id}>
                  <div
                    className="rounded-2xl h-96 flex justify-center items-center bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  >
                    <span className="text-3xl font-semibold text-white bg-black/50 px-4 py-2 rounded">
                      {item.text}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="swiper-pagination "></div>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg w-11/12 max-w-3xl p-4 relative max-h-[90vh] overflow-y-auto">
              <button
                className="absolute top-2 right-2 text-gray-600 hover:text-black"
                onClick={() => setShowModal(false)}
              >
                ❌
              </button>

              <h2 className="text-xl font-semibold mb-4">Galeri Pekerjaan</h2>

              {galeriPekerjaan.length === 0 ? (
                <p>Tidak ada gambar untuk pekerjaan ini.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {galeriPekerjaan.map((img) => (
                    <div key={img.id}>
                      <img
                        src={img.url_gambar}
                        alt={img.keterangan || "Gambar"}
                        className="w-full h-40 object-cover rounded"
                      />
                      {img.keterangan && (
                        <p className="text-sm text-gray-700 mt-1">
                          {img.keterangan}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

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
