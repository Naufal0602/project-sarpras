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

const AdminPekerjaanFisikListPage = () => {
  const [pekerjaanList, setPekerjaanList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBagian, setSelectedBagian] = useState("semua");
  const userData = JSON.parse(localStorage.getItem("user"));
  const isLevel2 = userData?.level === 2;

  const fetchPekerjaan = async () => {
    try {
      const snapshot = await getDocs(collection(db, "pekerjaan_fisik"));
      const data = await Promise.all(
        snapshot.docs.map(async (docSnap) => {
          const pekerjaan = docSnap.data();
          let perusahaanNama = "-";
          try {
            const perusahaanRef = doc(db, "perusahaan", pekerjaan.perusahaan_id);
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
      name: "Detail Pekerjaan",
      selector: (row) => row.detail_pekerjaan || "-",
      wrap: true,
      grow: 2,
    },
    {
      name: "Bagian",
      selector: (row) => row.bagian?.toUpperCase() || "-",
      sortable: true,
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
                  to={`/user/pekerjaan-fisik/edit/${row.id}`}
                  className="text-white bg-blue-600 px-3 py-1 rounded text-sm hover:underline"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(row.id)}
                  className="text-white bg-red-600 px-3 py-1 rounded text-sm hover:underline"
                >
                  Hapus
                </button>
              </div>
            ),
          },
        ]
      : []),
  ];

  const filteredData = pekerjaanList
    .filter((item) =>
      selectedBagian === "semua" ? true : item.bagian === selectedBagian
    )
    .filter((item) =>
      item.perusahaan_nama?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed">
        <Navbar />
        <Sidebar />
      </div>

      <div className="flex-1 md:ml-72 pt-20 p-8 w-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold text-orange-600">
            Daftar Pekerjaan Fisik
          </h2>
          {isLevel2 && (
            <Link to="/user/pekerjaan-fisik/tambah">
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded">
                + Tambah Pekerjaan
              </button>
            </Link>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <label className="mr-2 font-medium text-gray-700">
              Filter Bagian:
            </label>
            <select
              value={selectedBagian}
              onChange={(e) => setSelectedBagian(e.target.value)}
              className="border border-gray-300 px-3 py-1 rounded"
            >
              <option value="semua">Semua</option>
              <option value="paud">PAUD</option>
              <option value="sd">SD</option>
              <option value="smp">SMP</option>
            </select>
          </div>

          <div>
            <label className="mr-2 font-medium text-gray-700">Cari Nama Perusahaan:</label>
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
          noDataComponent="Belum ada data pekerjaan fisik"
        />
      </div>
    </div>
  );
};

export default AdminPekerjaanFisikListPage;
