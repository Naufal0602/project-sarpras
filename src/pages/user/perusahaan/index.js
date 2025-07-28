import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../services/firebase";
import Navbar from "../../../components/Navbar";
import Sidebar from "../../../components/SideBar";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import { deleteDoc, doc } from "firebase/firestore";

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
              <div className="flex gap-2">
                <Link
                  to={`/user/perusahaan/edit/${row.id}`}
                  className="text-white px-3 py-1 rounded-lg bg-blue-600 hover:underline text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDeletePerusahaan(row.id)}
                  className="text-white bg-red-600 px-3 py-1 rounded-lg hover:underline text-sm"
                >
                  Hapus
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
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar dan Navbar */}
      <div className="fixed">
        <Navbar />
        <Sidebar />
      </div>

      {/* Konten utama */}
      <div className="flex-1 md:ml-72 pt-20 p-8 w-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold mb-6 text-orange-600">
            Daftar Perusahaan
          </h2>
          {userData?.level === 2 && (
            <Link to="/user/perusahaan/tambah">
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded">
                + Tambah Perusahaan
              </button>
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
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

          <div>
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
          pagination
          highlightOnHover
          responsive
          noDataComponent="Belum ada data perusahaan"
        />
      </div>
    </div>
  );
};

export default AdminPerusahaanListPage;
