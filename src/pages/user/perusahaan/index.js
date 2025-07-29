import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/SideBar";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { deleteDoc, doc } from "firebase/firestore";
import { PencilLine, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const AdminPerusahaanListPage = () => {
  const [perusahaanList, setPerusahaanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("semua");
  const userData = JSON.parse(localStorage.getItem("user"));
  const isLevel2 = userData?.level === 2;

  const fetchPerusahaan = async () => {
    try {
      const snapshot = await getDocs(collection(db, "perusahaan"));
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
  const [exportFormat, setExportFormat] = useState("pdf");
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
    if (exportStatus === "semua") return perusahaanList;
    return perusahaanList.filter((p) => p.status === exportStatus);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const data = getExportData();

    const tableData = data.map((row, i) => [
      i + 1,
      row.nama_perusahaan || "-",
      row.direktur || "-",
      row.alamat || "-",
      row.status || "-",
      formatDate(row.created_at),
    ]);

    autoTable(doc, {
      head: [["No", "Nama", "Direktur", "Alamat", "Status", "Dibuat"]],
      body: tableData,
    });

    doc.save(`DataPerusahaan_${getFormattedNow()}.pdf`);
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

  const handleExport = () => {
    if (exportFormat === "pdf") {
      exportToPDF();
    } else {
      exportToExcel();
    }
    setShowExportModal(false);
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
    },
    ...(isLevel2
      ? [
          {
            name: "Aksi",
            cell: (row) => (
              <div className="flex flex-col sm:flex-row gap-2">
                <Link
                  to={`/user/perusahaan/edit/${row.id}`}
                  className="group bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center justify-center transition-all duration-300"
                >
                  <span className="group-hover:hidden">
                    <PencilLine className="w-4 h-4" />
                  </span>
                  <span className="hidden group-hover:inline">Ubah</span>
                </Link>

                <button
                  onClick={() => handleDeletePerusahaan(row.id)}
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
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold mb-6 text-orange-600">
            Daftar Perusahaan
          </h2>

          <div className="flex items-center gap-2">
            {userData?.level === 2 && (
              <Link to="/user/perusahaan/tambah">
                <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded">
                  + Tambah Perusahaan
                </button>
              </Link>
            )}
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded"
            >Export
            </button>
          </div>
        </div>

          <div className="flex flex-row gap-2 justify-between w-full md:w-auto mb-4">
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
                <option value="tidak aktif">Nonaktif</option>
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <label className="mr-2 font-medium text-gray-700">
                Cari Nama:
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
          pagination
          highlightOnHover
          responsive
          noDataComponent="Belum ada data perusahaan"
        />

        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Export Data
              </h3>

              {/* Pilih Format */}
              <div className="mb-4">
                <label className="font-medium text-gray-700 mb-1 block">
                  Format:
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="pdf"
                      checked={exportFormat === "pdf"}
                      onChange={() => setExportFormat("pdf")}
                      className="mr-2"
                    />
                    PDF
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="excel"
                      checked={exportFormat === "excel"}
                      onChange={() => setExportFormat("excel")}
                      className="mr-2"
                    />
                    Excel
                  </label>
                </div>
              </div>

              {/* Pilih Status */}
              <div className="mb-4">
                <label className="font-medium text-gray-700 mb-1 block">
                  Data yang ingin diexport:
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

              {/* Aksi */}
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
                >
                  Tutup
                </button>
                <button
                  onClick={handleExport}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  Export
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPerusahaanListPage;
