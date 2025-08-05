import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../services/firebase";
import CircularGallery from "../components/CircularGallery";
// import Masonry from '../components/Masonry.js';

const LandingPage = () => {
  const [galeri, setGaleri] = useState([]);
  const navigate = useNavigate();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const fetchGaleri = async () => {
      try {
        const snapshot = await getDocs(collection(db, "galeri"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          image: doc.data().url_gambar,
          text: doc.data().keterangan,
        }));
        setGaleri(data);
        setIsReady(true); // tandai bahwa data sudah siap
      } catch (error) {
        console.error("Gagal mengambil data galeri:", error);
      }
    };

    fetchGaleri();
  }, []);

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

        <div className="h-10 md:h-40"></div>

        {galeri.length > 0 && (
          <div style={{ height: "30rem", position: "relative" }}>
            <CircularGallery
              items={galeri}
              bend={0}
              textColor="#ffffff"
              borderRadius={0.05}
              scrollEase={0.02}
            />
          </div>
        )}

        <div className="h-10 md:h-40"></div>

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
