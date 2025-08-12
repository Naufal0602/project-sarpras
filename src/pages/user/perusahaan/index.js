import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  getDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../../services/firebase";
import Navbar from "../../../components/template/Navbar.js";
import Sidebar from "../../../components/template/SideBar.js";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { PencilLine, Trash2, MapPin } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Loading from "../../../components/Loading.js";
import axios from "axios";

const AdminPerusahaanListPage = () => {
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const userData = JSON.parse(localStorage.getItem("user"));
  const isLevel2 = userData?.level === 2;
  const [exportScope, setExportScope] = useState("sebagian"); // default: sebagian
  const [showModalPekerjaan, setShowModalPekerjaan] = useState(false);
  const [selectedPerusahaan, setSelectedPerusahaan] = useState(null);

  const handleShowPekerjaanModal = (perusahaan) => {
    setSelectedPerusahaan(perusahaan);
    setShowModalPekerjaan(true);
  };

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    String(currentDate.getMonth() + 1)
  );

  const [selectedYear, setSelectedYear] = useState(
    String(currentDate.getFullYear())
  );

  const fetchPerusahaan = async () => {
    try {
      const q = query(
        collection(db, "perusahaan"),
        orderBy("created_at", "desc")
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPerusahaanList(data);
    } catch (err) {
      console.error("Gagal mengambil data perusahaan:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerusahaan();
  }, []);

  const handleDeletePerusahaan = async (perusahaanId) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus perusahaan ini?"
    );
    if (!confirmDelete) return;

    try {
      try {
        const docRef = doc(db, "perusahaan", perusahaanId);
        const docSnap = await getDoc(docRef);
        const data = docSnap.data();
        await axios.post("http://localhost:3001/api/cloudinary/", {
          public_id: data.foto_kantor.public_id,
        });
      } catch (e) {
        console.error("Gagal:", e);
      }
      await deleteDoc(doc(db, "perusahaan", perusahaanId));
      setPerusahaanList((prev) =>
        prev.filter((perusahaan) => perusahaan.id !== perusahaanId)
      );
      alert("Perusahaan berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus perusahaan:", error);
      alert("Gagal menghapus perusahaan.");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";
    return timestamp.toDate?.().toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // State modal
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportStatus, setExportStatus] = useState("semua");

  // Format tanggal dan nama file
  const getFormattedNow = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(now.getDate())}${pad(
      now.getMonth() + 1
    )}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}`;
  };

  // Filter data berdasarkan status
  const getExportData = () => {
    const filtered = perusahaanList.filter((p) => {
      const statusMatch = exportStatus === "semua" || p.status === exportStatus;

      const createdAt = p.created_at?.toDate?.();
      const monthMatch =
        selectedMonth === "semua" ||
        (createdAt && createdAt.getMonth() + 1 === parseInt(selectedMonth));
      const yearMatch =
        selectedYear === "semua" ||
        (createdAt && createdAt.getFullYear() === parseInt(selectedYear));

      return statusMatch && monthMatch && yearMatch;
    });

    // Urutkan: Aktif dulu, lalu Tidak Aktif, lalu sisanya
    const statusOrder = { aktif: 1, "tidak aktif": 2 };
    return filtered.sort((a, b) => {
      return (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const tanggalCetak = new Date();
    const formattedTanggal = tanggalCetak.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    // Header laporan
    doc.setFontSize(16);
    doc.setTextColor(33, 33, 33);
    doc.text("LAPORAN DATA PERUSAHAAN", 105, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${formattedTanggal}`, 105, 27, { align: "center" });

    // Spasi sebelum tabel
    doc.setLineWidth(0.5);
    doc.setDrawColor(0);

    // Tabel data
    autoTable(doc, {
      startY: 35,
      head: [
        [
          "No",
          "Nama_perusahaan",
          "Direktur",
          "Alamat",
          "Status",
          "Dibuat",
          "Koordinat",
        ],
      ],
      body: getExportData().map((item, index) => [
        index + 1,
        item.nama_perusahaan,
        item.direktur,
        item.alamat,
        item.status,
        item.created_at?.toDate?.().toLocaleDateString("id-ID") ?? "-",
        item.latitude && item.longitude
          ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`
          : "-",
      ]),
      theme: "grid",
      headStyles: {
        fillColor: [249, 115, 22], // orange-500
        textColor: [255, 255, 255],
        halign: "center",
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      bodyStyles: {
        textColor: [33, 33, 33],
      },
    });

    doc.save(`DataPerusahaan_${new Date().getTime()}.pdf`);
  };

  const exportToExcel = () => {
    const data = getExportData().map((row) => ({
      "Nama Perusahaan": row.nama_perusahaan || "-",
      Direktur: row.direktur || "-",
      Alamat: row.alamat || "-",
      Status: row.status || "-",
      Dibuat: formatDate(row.created_at),
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Perusahaan");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `DataPerusahaan_${getFormattedNow()}.xlsx`);
  };

  const columns = [
    {
      name: "Nama Perusahaan",
      selector: (row) => row.nama_perusahaan || "-",
      sortable: true,
    },
    {
      name: "Direktur",
      selector: (row) => row.direktur || "-",
    },
    {
      name: "Alamat",
      selector: (row) => row.alamat || "-",
      grow: 2,
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          className={`inline-block px-2 py-1 rounded text-xs font-medium ${
            row.status === "aktif"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {row.status || "-"}
        </span>
      ),
    },
    {
      name: "Dibuat",
      selector: (row) => formatDate(row.created_at),
      sortable: true,
      sortFunction: (a, b) => {
        // Ubah Timestamp Firebase ke milidetik
        const dateA = a.created_at?.toDate?.().getTime?.() || 0;
        const dateB = b.created_at?.toDate?.().getTime?.() || 0;
        return dateB - dateA;
      },
    },
    {
      name: "Koordinat",
      cell: (row) =>
        row.latitude && row.longitude ? (
          <a
            href={`https://www.google.com/maps?q=${row.latitude},${row.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            {row.latitude.toFixed(5)}, {row.longitude.toFixed(5)}
          </a>
        ) : (
          "-"
        ),
    },
    ...(isLevel2
      ? [
          {
            name: "Aksi",
            cell: (row) => (
              <div className="flex flex-row sm:flex-col gap-1 py-2">
                <div className="flex gap-2">
                  <Link
                    to={`/user/perusahaan/edit/${row.id}`}
                    className="group bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                  >                  
                      <PencilLine className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDeletePerusahaan(row.id)}
                    className="group bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                  >
                      <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="w-full">
                  <button
                    onClick={() => handleShowPekerjaanModal(row)}
                    className="group w-full bg-green-400 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                  >
                    <span>📄</span>
                  </button>
                </div>
              </div>
            ),
          },
        ]
      : []),
  ];

  const filteredData = perusahaanList
    .filter((item) =>
      selectedStatus === "semua" ? true : item.status === selectedStatus
    )
    .filter((item) =>
      item.nama_perusahaan?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="flex min-h-screen">
      {/* Sidebar dan Navbar */}
      <div className="fixed z-50">
        <Navbar />
        <Sidebar />
      </div>

      {/* Konten utama */}
      <div className="flex-1 md:ml-72 pt-20 p-8 w-full">
        <div className="xl:flex sm:flex-row xl:justify-between mb-4">
          <h2 className="text-2xl font-bold mb-6 text-orange-600">
            Daftar Perusahaan
          </h2>

          <div className="flex items-center gap-2">
            {userData?.level === 2 && (
              <Link to="/user/perusahaan/tambah">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold lg:px-4 py-2 px-2 rounded">
                  + Tambah Perusahaan
                </button>
              </Link>
            )}
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold lg:px-4 px-2 py-2 rounded"
            >
              Export
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-2 justify-between w-full md:w-auto mb-4">
          <div className="flex items-center gap-2">
            <label className="mr-2 font-medium text-gray-700">
              Filter Status:
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 px-3 py-1 rounded w-full md:w-auto"
            >
              <option value="semua">Semua</option>
              <option value="aktif">Aktif</option>
              <option value="tidak aktif">Tidak Aktif</option>
            </select>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="mr-2 font-medium text-gray-700">Cari Nama:</label>
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
          noDataComponent="Belum ada data perusahaan"
        />

        {showModalPekerjaan && selectedPerusahaan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl relative">
              <div className="flex gap-5">
                {selectedPerusahaan.foto_kantor.secure_url && (
                  <div
                    className="h-[400px] w-1/2 rounded border bg-center bg-cover bg-no-repeat"
                    style={{
                      backgroundImage: `url(${selectedPerusahaan.foto_kantor.secure_url})`,
                    }}
                  />
                )}

                <div className="py-8 w-1/2 h-full mb-12 pr-8 flex items-start ">
                  <button
                    onClick={() => setShowModalPekerjaan(false)}
                    className="absolute top-2 right-2 text-gray-600 hover:text-black text-xl font-bold"
                  >
                    &times;
                  </button>

                  <div className="space-y-2 text-sm">
                    <h2 className="text-xl font-semibold mb-4">
                      Detail Perusahaan
                    </h2>
                    <p>
                      <strong>Nama Perusahaan:</strong>{" "}
                      {selectedPerusahaan.nama_perusahaan}
                    </p>
                    <p>
                      <strong>Direktur:</strong> {selectedPerusahaan.direktur}
                    </p>
                    <p>
                      <strong>Alamat:</strong> {selectedPerusahaan.alamat}
                    </p>
                    <p>
                      <strong>Status:</strong> {selectedPerusahaan.status}
                    </p>
                    <p>
                      <strong>Dibuat:</strong>{" "}
                      {new Date(
                        selectedPerusahaan.created_at?.seconds * 1000
                      ).toLocaleString()}
                    </p>
                    <p>
                      <strong>Diperbarui:</strong>{" "}
                      {new Date(
                        selectedPerusahaan.updated_at?.seconds * 1000
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="absolute right-4 bottom-4">
                  <a
                    href={`https://www.google.com/maps?q=${selectedPerusahaan.latitude},${selectedPerusahaan.longitude}`}
                    className="group w-40 h-8 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="group-hover:hidden">
                      <MapPin />
                    </span>
                    <span className="hidden group-hover:inline">
                      Buka Di Gmaps
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Export Data
              </h3>

              {/* Pilihan Semua atau Sebagian */}
              <div className="mb-4">
                <label className="font-medium text-gray-700 mb-1 block">
                  Pilih Data:
                </label>
                <div className="flex flex-col gap-2">
                  {["semua", "sebagian"].map((value) => (
                    <label key={value} className="flex items-center">
                      <input
                        type="radio"
                        name="exportScope"
                        value={value}
                        checked={exportScope === value}
                        onChange={() => setExportScope(value)}
                        className="mr-2"
                      />
                      {value.charAt(0).toUpperCase() + value.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Filter Status */}
              {exportScope === "sebagian" && (
                <>
                  <div className="mb-4">
                    <label className="font-medium text-gray-700 mb-1 block">
                      Status:
                    </label>
                    <div className="flex flex-col gap-2">
                      {["semua", "aktif", "tidak aktif"].map((status) => (
                        <label key={status} className="flex items-center">
                          <input
                            type="radio"
                            name="status"
                            value={status}
                            checked={exportStatus === status}
                            onChange={() => setExportStatus(status)}
                            className="mr-2"
                          />
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Filter Bulan */}
                  <div className="mb-4">
                    <label className="font-medium text-gray-700 mb-1 block">
                      Bulan:
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                    >
                      <option value="semua">Semua</option>
                      {Array.from({ length: 12 }, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(0, i).toLocaleString("id-ID", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Tahun */}
                  <div className="mb-6">
                    <label className="font-medium text-gray-700 mb-1 block">
                      Tahun:
                    </label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded"
                    >
                      <option value="semua">Semua</option>
                      {[
                        ...new Set(
                          perusahaanList.map((p) =>
                            p.created_at?.toDate?.()?.getFullYear()
                          )
                        ),
                      ]
                        .filter(Boolean)
                        .sort((a, b) => b - a)
                        .map((year) => (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}

              {/* Tombol Aksi */}
              <div className="flex justify-between">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Tutup
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={exportToPDF}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
                  >
                    Export PDF
                  </button>
                  <button
                    onClick={exportToExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    Export Excel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPerusahaanListPage;
