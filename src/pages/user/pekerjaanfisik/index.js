import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../../services/firebase";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/SideBar";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { PencilLine, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminPekerjaanFisikListPage = () => {
  const [pekerjaanList, setPekerjaanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [rangeType, setRangeType] = useState("date"); // 'all' atau 'date'


  const userData = JSON.parse(localStorage.getItem("user"));
  const isLevel2 = userData?.level === 2;
  const role = userData?.role; // e.g. 'user-smp'

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
      "Sekolah",
      "Deskripsi",
      "Bagian",
      "Dibuat",
    ];

    const tableRows = exportData.map((row) => [
      row.perusahaan_nama || "-",
      row.jenis_pekerjaan || "-",
      row.sekolah || "-",
      row.deskripsi || "-",
      row.bagian || "-",
      formatDate(row.created_at),
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
      Sekolah: row.sekolah || "-",
      Deskripsi: row.deskripsi || "-",
      Bagian: row.bagian || "-",
      Dibuat: formatDate(row.created_at),
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
      const snapshot = await getDocs(collection(db, "pekerjaan_fisik"));
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const pekerjaan = docSnap.data();
          let perusahaanNama = "-";
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
          return {
            id: docSnap.id,
            ...pekerjaan,
            perusahaan_nama: perusahaanNama,
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

  const handleDelete = async (id) => {
    const confirm = window.confirm("Yakin ingin menghapus pekerjaan ini?");
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, "pekerjaan_fisik", id));
      setPekerjaanList((prev) => prev.filter((item) => item.id !== id));
      alert("Pekerjaan berhasil dihapus.");
    } catch (error) {
      console.error("Gagal menghapus pekerjaan:", error);
      alert("Terjadi kesalahan saat menghapus.");
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
      name: "Sekolah",
      selector: (row) => row.sekolah || "-",
      wrap: true,
    },
    {
      name: "Deskripsi",
      selector: (row) => row.deskripsi || "-",
      wrap: true,
      grow: 2,
    },
    {
      name: "Dibuat",
      selector: (row) => formatDate(row.created_at),
      sortable: true,
    },
    ...(isLevel2
      ? [
          {
            name: "Aksi",
            cell: (row) => (
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/user/pekerjaan-fisik/edit/${row.id}`}
                  className="group bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                >
                  <span className="group-hover:hidden">
                    <PencilLine className="w-4 h-4" />
                  </span>
                  <span className="hidden group-hover:inline">Ubah</span>
                </Link>

                <button
                  onClick={() => handleDelete(row.id)}
                  className="group bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                >
                  <span className="group-hover:hidden">
                    <Trash2 className="w-4 h-4" />
                  </span>
                  <span className="hidden group-hover:inline">Hapus</span>
                </button>
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

  return (
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
          className="bg-black"
          columns={columns}
          data={filteredData}
          progressPending={loading}
          pagination
          highlightOnHover
          responsive
          noDataComponent="Belum ada data pekerjaan fisik"
        />
      </div>
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
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
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
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
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
  );
};

export default AdminPekerjaanFisikListPage;
