import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  query,
  where,
  limit,
  updateDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../services/firebase";
import Navbar from "../../../components/template/Navbar";
import Sidebar from "../../../components/template/SideBar";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import {
  PencilLine,
  Trash2,
  GalleryHorizontal,
  Fullscreen,
  GalleryThumbnails,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Loading from "../../../components/Loading";
import ConfirmModal from "../../../components/Modaldelete";
import SuccessFullScreen from "../../../components/Success";

const AdminPekerjaanFisikListPage = () => {
  const [pekerjaanList, setPekerjaanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [rangeType, setRangeType] = useState("date"); // 'all' atau 'date'
  const [selectedData, setSelectedData] = useState(null);
  const userData = JSON.parse(localStorage.getItem("user"));
  const isLevel2 = userData?.level === 2;
  const isLevel1 = userData?.level === 1;
  const role = userData?.role; // e.g. 'user-smp'
  const [showModal, setShowModal] = useState(false);
  const [gambarList, setGambarList] = useState([]);
  const [judulModal, setJudulModal] = useState("");
  const [zoomImageUrl, setZoomImageUrl] = useState(null);
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedPekerjaanId, setSelectedPekerjaanId] = useState(null);
  const [successToast, setSuccessToast] = useState(false);
  const [openDeleteGambarModal, setOpenDeleteGambarModal] = useState(false);
  const [selectedGambar, setSelectedGambar] = useState(null);
  const [selectedImages, setSelectedImages] = useState([]);
  const [openDeleteSelectedModal, setOpenDeleteSelectedModal] = useState(false);



  const bagianUser = role?.includes("user-")
    ? role.replace("user-", "")
    : "semua"; // admin lihat semua

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getFilteredExportData = () => {
    let data = [...filteredData];

    if (rangeType === "date") {
      const start = new Date(selectedYear, selectedMonth - 1, 1);
      const end = new Date(selectedYear, selectedMonth, 0, 23, 59, 59, 999); // akhir bulan

      data = data.filter((item) => {
        const createdAt = item.created_at?.toDate?.();
        return createdAt && createdAt >= start && createdAt <= end;
      });
    }

    return data;
  };

  const toggleSelectImage = (id) => {
    setSelectedImages((prev) =>
      prev.includes(id) ? prev.filter((imgId) => imgId !== id) : [...prev, id]
    );
  };

  const handleZoom = (url) => {
    setZoomImageUrl(url);
  };

  const closeZoom = () => {
    setZoomImageUrl(null);
  };

  const openGaleriModal = async (id, label) => {
    try {
      // Ambil data pekerjaan berdasarkan ID
      const pekerjaan = pekerjaanList.find((item) => item.id === id);
      setSelectedData(pekerjaan); // untuk detail di modal

      // Ambil data galeri dari Firestore
      const q = query(
        collection(db, "galeri"),
        where("id_pekerjaan", "==", id)
      );
      const snapshot = await getDocs(q);

      // Tambahkan doc.id ke setiap data
      const gambarData = snapshot.docs.map((doc) => ({
        id: doc.id, // ← penting: tambahkan ID dokumen Firestore
        ...doc.data(),
      }));

      // Set state
      setGambarList(gambarData);
      setJudulModal(label || "Galeri");
      setShowModal(true);
    } catch (e) {
      console.error("❌ Gagal ambil galeri:", e);
    }
  };

  // Fungsi untuk membuat kode waktu sekarang (ddmmyyyyHHMM)
  const getFormattedNow = () => {
    const now = new Date();
    const pad = (num) => String(num).padStart(2, "0");

    return (
      pad(now.getDate()) +
      pad(now.getMonth() + 1) +
      now.getFullYear() +
      pad(now.getHours()) +
      pad(now.getMinutes())
    );
  };

  const exportToPDF = () => {
    const exportData = getFilteredExportData();
    const doc = new jsPDF();

    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Judul dan tanggal cetak
    // Judul di tengah
    doc.setFontSize(16);
    doc.setTextColor(255, 87, 34); // orange-400
    const pageWidth = doc.internal.pageSize.getWidth();
    const title = "Laporan Pekerjaan Fisik";
    const textWidth = doc.getTextWidth(title);
    const x = (pageWidth - textWidth) / 2;
    doc.text(title, x, 15);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(`Tanggal Dicetak: ${formattedDate}`, 14, 22);

    const tableColumn = [
      "Perusahaan",
      "Jenis Pekerjaan",
      "Pekerjaan",
      "Deskripsi",
      "Tanggal",
    ];

    const tableRows = exportData.map((row) => [
      row.perusahaan_nama || "-",
      row.jenis_pekerjaan || "-",
      row.pekerjaan || "-",
      row.deskripsi || "-",
      row.tanggal_pekerjaan || "-",
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [255, 160, 0], // Tailwind orange-400 => RGB
        textColor: 255,
        halign: "center",
      },
      bodyStyles: {
        valign: "top",
      },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 35 },
        2: { cellWidth: 25 },
        3: { cellWidth: 40 },
        4: { cellWidth: 25 },
        5: { cellWidth: 25 },
      },
    });

    doc.save(`LaporanPekerjaanFisik_${getFormattedNow()}.pdf`);
    setShowExportModal(false);
  };

  const exportToExcel = () => {
    const exportData = getFilteredExportData().map((row) => ({
      Perusahaan: row.perusahaan_nama || "-",
      Jenis_Pekerjaan: row.jenis_pekerjaan || "-",
      pekerjaan: row.pekerjaan || "-",
      Deskripsi: row.deskripsi || "-",
      Tanggal: row.tanggal_pekerjaan || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Pekerjaan Fisik");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `DataPekerjaanFisik_${getFormattedNow()}.xlsx`);
    setShowExportModal(false);
  };

  const fetchPekerjaan = async () => {
    try {
      const q = query(
        collection(db, "pekerjaan_fisik"),
        orderBy("created_at", "desc") // urutkan berdasarkan waktu dibuat (terbaru di atas)
      );
      const snapshot = await getDocs(q);

      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const pekerjaan = docSnap.data();
          let perusahaanNama = "-";
          let gambarThumbnail = null;

          // Ambil nama perusahaan
          try {
            const perusahaanRef = doc(
              db,
              "perusahaan",
              pekerjaan.perusahaan_id
            );
            const perusahaanDoc = await getDoc(perusahaanRef);
            if (perusahaanDoc.exists()) {
              perusahaanNama = perusahaanDoc.data().nama_perusahaan;
            }
          } catch (e) {
            console.error("Gagal mengambil nama perusahaan:", e);
          }

          // Ambil gambar thumbnail dari koleksi galeri
          try {
            const galeriRef = collection(db, "galeri");
            const galeriQuery = query(
              galeriRef,
              where("id_pekerjaan", "==", docSnap.id),
              where("thumbnail", "==", true),
              limit(1)
            );
            const galeriSnapshot = await getDocs(galeriQuery);
            if (!galeriSnapshot.empty) {
              const galeriDocData = galeriSnapshot.docs[0].data();
              gambarThumbnail = galeriDocData.url_gambar;
            }
          } catch (e) {
            console.error("Gagal mengambil gambar galeri:", e);
          }

          return {
            id: docSnap.id,
            ...pekerjaan,
            perusahaan_nama: perusahaanNama,
            gambar: gambarThumbnail,
          };
        })
      );

      setPekerjaanList(data);
    } catch (err) {
      console.error("Gagal mengambil data pekerjaan fisik:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPekerjaan();
  }, []);

  const handleSetThumbnail = async (id_pekerjaan, idGambarDipilih) => {
    try {
      const galeriRef = collection(db, "galeri");
      const q = query(galeriRef, where("id_pekerjaan", "==", id_pekerjaan));
      const snapshot = await getDocs(q);

      const batchUpdate = snapshot.docs.map(async (docSnap) => {
        const isSelected = docSnap.id === idGambarDipilih;

        await updateDoc(doc(db, "galeri", docSnap.id), {
          thumbnail: isSelected,
        });
      });

      await Promise.all(batchUpdate);

      alert("Thumbnail berhasil diatur!");
    } catch (error) {
      console.error("❌ Gagal atur thumbnail:", error);
      alert("Gagal mengatur thumbnail.");
    }
  };

  const handleEditGambar = (idGambarDipilih) => {
    navigate(`/edit-gambar/${idGambarDipilih}`);
  };

  const handleDelete = async (id) => {
    try {
      const galeriRef = collection(db, "galeri");
      const q = query(galeriRef, where("id_pekerjaan", "==", id));
      const querySnapshot = await getDocs(q);
      setLoading(true);

      const publicIds = querySnapshot.docs.map((doc) => doc.data().public_id);
      console.log("Public IDs to delete:", publicIds);

      if (publicIds.length > 0) {
        await axios.post("https://be-sarpras.vercel.app/api/cloudinary/", {
          public_id: [publicIds],
        });
      }

      await deleteDoc(doc(db, "pekerjaan_fisik", id));
      setPekerjaanList((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Gagal menghapus pekerjaan:", error);
      alert("Terjadi kesalahan saat menghapus.");
    } finally {
      setLoading(false);
      setSuccessToast(true);
    }
  };

  console.log("SUCCSESTOAST", successToast);

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return timestamp.toDate?.().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleDeleteGambar = async (item) => {
    try {
      setLoading(true);
      const q = query(
        collection(db, "galeri"),
        where("url_gambar", "==", item.url_gambar)
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        alert("Gambar tidak ditemukan di database.");
        return;
      }

      await Promise.all(
        snapshot.docs.map(async (docu) => {
          await deleteDoc(doc(db, "galeri", docu.id));
        })
      );

      await axios.post("https://be-sarpras.vercel.app/api/cloudinary", {
        public_id: [item.public_id],
      });

      setGambarList((prev) =>
        prev.filter((g) => g.url_gambar !== item.url_gambar)
      );
    } catch (e) {
      console.error("Gagal hapus gambar:", e);
      alert("Terjadi kesalahan saat menghapus gambar.");
    } finally {
      setLoading(false);
      setSuccessToast(true);
    }
  };

  const columns = [
    {
      name: "Perusahaan",
      selector: (row) => row.perusahaan_nama || "-",
      sortable: true,
    },
    {
      name: "Jenis Pekerjaan",
      selector: (row) => row.jenis_pekerjaan || "-",
      wrap: true,
    },
    {
      name: "pekerjaan",
      selector: (row) => row.pekerjaan || "-",
      wrap: true,
    },
    {
      name: "Deskripsi",
      selector: (row) => row.deskripsi || "-",
      wrap: true,
      grow: 2,
    },
    {
      name: "Galeri",
      selector: (row) => row.gambar,
      cell: (row) => (
        <button className="hover:opacity-80 transition">
          {row.gambar ? (
            <img
              src={row.gambar}
              alt="Gambar"
              className="w-auto h-28 object-cover rounded"
            />
          ) : (
            <span className="text-gray-400 italic">Tidak ada gambar</span>
          )}
        </button>
      ),
      grow: 1,
      wrap: true,
    },

    {
      name: "Tanggal",
      selector: (row) => row.tanggal_pekerjaan,
      sortable: true,
    },
    ...(isLevel1
      ? [
          {
            name: "Aksi",
            cell: (row) => (
              <div className="flex  sm:flex-col gap-2">
                <div>
                  <button
                    onClick={() => openGaleriModal(row.id, row.jenis_pekerjaan)}
                    className="group bg-green-500 hover:bg-green-700 w-full text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                  >
                    <span className="lg:group-hover:hidden ">
                      <GalleryHorizontal className="w-4 h-4" />
                    </span>
                    <span className="hidden lg:group-hover:inline group-hover:hidden ">
                      Galeri
                    </span>
                  </button>
                </div>
              </div>
            ),
          },
        ]
      : []),
    ...(isLevel2
      ? [
          {
            name: "Aksi",
            cell: (row) => (
              <div className="flex  sm:flex-col gap-2">
                <div className="flex gap-2 ">
                  <Link
                    to={`/user/pekerjaan-fisik/edit/${row.id}`}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                  >
                    <span className="lg:group-hover:hidden">
                      <PencilLine className="w-4 h-4" />
                    </span>
                    <span className="hidden lg:group-hover:inline">Ubah</span>
                  </Link>
                  <button
                    onClick={() => {
                      setSelectedPekerjaanId(row.id);
                      setOpenModal(true);
                    }}
                    className="group bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                  >
                    <span className="lg:group-hover:hidden">
                      <Trash2 className="w-4 h-4" />
                    </span>
                    <span className="hidden lg:group-hover:inline">Hapus</span>
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => openGaleriModal(row.id, row.jenis_pekerjaan)}
                    className="group bg-green-500 hover:bg-green-700 w-full text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                  >
                    <span className="lg:group-hover:hidden ">
                      <GalleryHorizontal className="w-4 h-4" />
                    </span>
                    <span className="hidden lg:group-hover:inline group-hover:hidden ">
                      Galeri
                    </span>
                  </button>
                </div>
              </div>
            ),
          },
        ]
      : []),
  ];

  const filteredData = pekerjaanList
    .filter((item) =>
      bagianUser === "semua" ? true : item.bagian === bagianUser
    )
    .filter((item) =>
      item.perusahaan_nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  if (loading) {
    return <Loading text="Loading..." />;
  }

  return (
    <>
      <div className="flex min-h-screen">
        <div className="fixed z-50">
          <Navbar />
          <Sidebar />
        </div>

        <div className="flex-1 md:ml-72 pt-20 md:pt-20 xl:pt-20 p-4 sm:p-8 w-full">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold text-orange-600">
              Daftar Pekerjaan Fisik
            </h2>
            <div className="flex gap-2 w-auto">
              {isLevel2 && (
                <Link to="/user/pekerjaan-fisik/tambah">
                  <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded w-full sm:w-auto">
                    + Tambah Pekerjaan
                  </button>
                </Link>
              )}
              <button
                onClick={() => setShowExportModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
              >
                Export
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
            <div className="w-full md:w-auto">
              <label className="mr-2 font-medium text-gray-700">
                Cari Nama Perusahaan:
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Masukkan nama perusahaan"
                className="border border-gray-300 px-3 py-1 rounded w-full md:w-64"
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredData}
            progressPending={loading}
            progressComponent={<Loading />}
            pagination
            highlightOnHover
            responsive
            noDataComponent="Belum ada data pekerjaan fisik"
          />
        </div>

        <ConfirmModal
          title="Hapus Pekerjaan"
          message="Yakin ingin menghapus pekerjaan ini? Semua data terkait akan dihapus."
          open={openModal}
          onClose={() => setOpenModal(false)}
          onConfirm={() => {
            if (selectedPekerjaanId) {
              handleDelete(selectedPekerjaanId);
              setOpenModal(false);
            }
          }}
        />

        {showModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center px-4">
            <div className="bg-white rounded-lg shadow-lg max-w-5xl w-full relative p-6 overflow-hidden max-h-[90vh] relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl lg:text-3xl font-extrabold">
                  {judulModal}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-red-500 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col mt-8 md:flex-row gap-4 h-[75vh]">
                {/* Kolom Kiri: Detail Informasi */}
                <div className="md:w-1/2 md:h-full h-1/2 w-full overflow-y-auto pr-4 border-r">
                  <div className="space-y-2 lg:text-lg text-md">
                    <p>
                      <span className="font-semibold">Perusahaan:</span>{" "}
                      {selectedData?.perusahaan_nama || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Jenis Pekerjaan:</span>{" "}
                      {selectedData?.jenis_pekerjaan || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">pekerjaan:</span>{" "}
                      {selectedData?.pekerjaan || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Deskripsi:</span>{" "}
                      {selectedData?.deskripsi || "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Tanggal Dibuat:</span>{" "}
                      {formatDate(selectedData?.created_at)}
                    </p>
                    {/* Tambahkan informasi lain sesuai kebutuhan */}
                  </div>
                </div>

                {/* Kolom Kanan: Galeri */}
                <div className="md:w-1/2 md:h-full h-1/2 w-full relative">
                  {gambarList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto max-h-full pr-2 pb-14">
                      {gambarList.map((item, index) => (
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

                          <div
                            className="absolute top-2 left-2 z-20"
                            onClick={(e) => e.stopPropagation()} // supaya gak trigger overlay
                          >
                            <input
                              type="checkbox"
                              checked={selectedImages.includes(item.id)}
                              onClick={() => toggleSelectImage(item.id)}
                              readOnly // supaya React gak warning karena controlled input
                              className="w-4 h-4 accent-blue-600"
                            />
                          </div>
                          {/* Overlay saat hover */}
                          <div
                            className={`
      absolute top-0 left-0 w-full h-full
      bg-black bg-opacity-40 backdrop-blur-sm
      items-center justify-center gap-2
      hidden group-hover:flex
      transition-all duration-300 z-10
    `}
                          >
                            {/* Tombol Zoom */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleZoom(item.url_gambar);
                              }}
                              className="bg-white p-2 rounded shadow hover:bg-gray-100"
                              title="Perbesar Gambar"
                            >
                              <Fullscreen />
                            </button>

                            {/* Tombol lain */}
                            {isLevel2 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetThumbnail(
                                      item.id_pekerjaan,
                                      item.id
                                    );
                                  }}
                                  className="bg-green-500 text-white p-2 rounded shadow hover:bg-green-600"
                                  title="Jadikan Thumbnail"
                                >
                                  <GalleryThumbnails />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditGambar(item.id);
                                  }}
                                  className="bg-blue-500 text-white p-2 rounded shadow hover:bg-blue-600"
                                  title="Edit Keterangan"
                                >
                                  <PencilLine />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedGambar(item);
                                    setOpenDeleteGambarModal(true);
                                  }}
                                  className="bg-red-600 text-white p-2 rounded shadow hover:bg-red-700"
                                  title="Hapus Gambar"
                                >
                                  <Trash2 />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic">
                      Tidak ada gambar untuk pekerjaan ini.
                    </p>
                  )}
                </div>
                {/* Tombol Tambah Gambar */}
                <div className="absolute bottom-4 right-4 p-2">
                  {selectedImages.length > 0 ? (
                    <button
                      onClick={() => setOpenDeleteSelectedModal(true)}
                      className="bg-red-600 hover:bg-red-700 text-white text-sm px-4 py-2 rounded shadow flex items-center gap-2"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                      ) : (
                        "Hapus Semua"
                      )}
                    </button>
                  ) : (
                    <Link
                      to={`/user/pekerjaan-fisik/galeri/tambah/${selectedData?.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded shadow"
                    >
                      + Tambah Gambar
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {zoomImageUrl && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
            onClick={closeZoom}
          >
            <img
              src={zoomImageUrl}
              alt="Zoom Gambar"
              className="max-w-3xl max-h-[80vh] object-contain rounded shadow-lg"
            />
          </div>
        )}

        {openDeleteSelectedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg text-center">
              <h2 className="text-lg font-semibold mb-4">
                Hapus {selectedImages.length} gambar terpilih?
              </h2>
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setOpenDeleteSelectedModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                  disabled={loading}
                >
                  Batal
                </button>
                <button
                  onClick={async () => {
                    setLoading(true);
                    try {
                      for (const id of selectedImages) {
                        const docRef = doc(db, "galeri", id);
                        const docSnap = await getDoc(docRef);

                        if (docSnap.exists()) {
                          const data = docSnap.data();

                          // ✅ hapus dari Cloudinary jika ada public_id
                          if (data?.public_id) {
                            try {
                              const res = await axios.post(
                                "https://be-sarpras.vercel.app/api/cloudinary/",
                                {
                                  public_id: [data.public_id],
                                }
                              );
                              console.log(
                                "✅ Respons hapus Cloudinary:",
                                res.data
                              );
                            } catch (cloudErr) {
                              console.error(
                                "❌ Gagal hapus dari Cloudinary:",
                                cloudErr
                              );
                            }
                          } else {
                            console.warn(
                              `⚠️ Tidak ada public_id untuk gambar ${id}`
                            );
                          }
                        }

                        // ✅ hapus dokumen di Firestore
                        await deleteDoc(docRef);
                      }

                      // update state list gambar
                      setGambarList((prev) =>
                        prev.filter((g) => !selectedImages.includes(g.id))
                      );

                      setSelectedImages([]);
                      setOpenDeleteSelectedModal(false);

                      // ✅ tampilkan success
                      setSuccessToast(true);
                    } catch (err) {
                      console.error("Gagal hapus:", err);
                      alert("Terjadi kesalahan saat menghapus gambar.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
                  disabled={loading}
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h2 className="text-xl font-bold mb-4 text-orange-600">
                Export Pekerjaan Fisik
              </h2>

              {/* Pilihan Data */}
              <div className="mb-4">
                <label className="font-medium block mb-1">Pilih data:</label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="rangeType"
                    value="date"
                    checked={rangeType === "date"}
                    onChange={(e) => setRangeType(e.target.value)}
                  />
                  Sebagian
                </label>
                <label className="flex items-center gap-2 mb-2">
                  <input
                    type="radio"
                    name="rangeType"
                    value="all"
                    checked={rangeType === "all"}
                    onChange={(e) => setRangeType(e.target.value)}
                  />
                  Semua data
                </label>
              </div>

              {/* Filter tanggal */}
              {rangeType === "date" && (
                <div className="mb-4">
                  <label className="block font-medium mb-1">
                    Pilih Bulan & Tahun:
                  </label>
                  <div className="flex gap-2">
                    <select
                      className="border px-3 py-1 rounded w-1/2"
                      value={selectedMonth}
                      onChange={(e) =>
                        setSelectedMonth(parseInt(e.target.value))
                      }
                    >
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i} value={i + 1}>
                          {new Date(0, i).toLocaleString("id-ID", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                    <select
                      className="border px-3 py-1 rounded w-1/2"
                      value={selectedYear}
                      onChange={(e) =>
                        setSelectedYear(parseInt(e.target.value))
                      }
                    >
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={exportToExcel}
                  className="px-4 py-2 rounded bg-green-500 hover:bg-yellow-600 text-white"
                >
                  Export Excel
                </button>
                <button
                  onClick={exportToPDF}
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white"
                >
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        title="Hapus Gambar"
        message="Yakin ingin menghapus gambar ini?"
        open={openDeleteGambarModal}
        onClose={() => {
          setOpenDeleteGambarModal(false);
          setSelectedGambar(null);
        }}
        onConfirm={() => {
          if (selectedGambar) {
            handleDeleteGambar(selectedGambar); // tetap pakai fungsi lama
            setOpenDeleteGambarModal(false);
            setSelectedGambar(null);
          }
        }}
      />

      <SuccessFullScreen
        className="fixed inset-0 flex  z-50"
        show={successToast}
        message="Data Berhasil Dihapus"
        onDone={() => {
          setSuccessToast(false);
          window.location.reload(); // refresh halaman
        }}
      />
    </>
  );
};

export default AdminPekerjaanFisikListPage;
