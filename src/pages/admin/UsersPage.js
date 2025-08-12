// src/pages/AdminUserListPage.js
import React, { useEffect, useState } from "react";
import { db } from "../../services/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import AdminNavbar from "../../components/template/AdminNavBar";
import AdminSidebar from "../../components/template/AdminSideBar";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { PencilLine, Trash2 } from "lucide-react";

const roleOptions = ["admin", "user-sd", "user-paud", "user-smp"];
const levelOptions = [1, 2];

const AdminUserListPage = () => {
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentYear = String(now.getFullYear());

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportOption, setExportOption] = useState("filtered"); // "all" atau "filtered"
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(userList);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("semua");

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      await updateDoc(doc(db, "users", userId), { role: newRole });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      alert("Gagal update role");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLevelChange = async (userId, newLevel) => {
    try {
      setUpdatingId(userId);
      await updateDoc(doc(db, "users", userId), { level: parseInt(newLevel) });
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, level: parseInt(newLevel) } : user
        )
      );
    } catch (error) {
      alert("Gagal update level");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (userId) => {
    const confirmDelete = window.confirm("Yakin ingin menghapus user ini?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "users", userId));
      setUsers((prev) => prev.filter((user) => user.id !== userId));
    } catch (error) {
      alert("Gagal menghapus user");
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "-";

    let date;
    // Jika pakai Firestore Timestamp object
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else {
      // Jika timestamp dalam milidetik atau number
      date = new Date(Number(timestamp));
    }

    // Format: DD/MM/YYYY
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
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

  const formatRole = (role) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "user-sd":
        return "User SD";
      case "user-smp":
        return "User SMP";
      case "user-paud":
        return "User PAUD";
      default:
        return role;
    }
  };
  const handleExportPDF = () => {
    const doc = new jsPDF();

    // Judul laporan
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN DATA PENGGUNA", 105, 15, { align: "center" });

    // Tanggal cetak
    const tanggalCetak = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.setFontSize(10);
    doc.text(`Dicetak pada: ${tanggalCetak}`, 14, 22);

    // Filter dan urutkan data
    let filteredUsers =
      exportOption === "all"
        ? users
        : users.filter((user) => {
            const roleMatch =
              selectedRoles.length === 0 || selectedRoles.includes(user.role);
            const levelMatch =
              selectedLevels.length === 0 ||
              selectedLevels.includes(String(user.level ?? ""));
            const createdAt =
              user.createdAt?.toDate?.() || new Date(user.createdAt);
            const monthMatch =
              !selectedMonth ||
              createdAt.getMonth() + 1 === parseInt(selectedMonth);
            const yearMatch =
              !selectedYear ||
              createdAt.getFullYear() === parseInt(selectedYear);
            return roleMatch && levelMatch && monthMatch && yearMatch;
          });

    // Urutkan berdasarkan role > level
    const roleOrder = ["admin", "user-sd", "user-smp", "user-paud"];
    filteredUsers.sort((a, b) => {
      const roleCompare = roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
      if (roleCompare !== 0) return roleCompare;

      const levelA = parseInt(a.level) || 0;
      const levelB = parseInt(b.level) || 0;
      return levelB - levelA; // Level 2 dulu
    });

    // Tabel
    autoTable(doc, {
      head: [["No", "Nama", "Email", "Role", "Level", "Dibuat"]],
      body: filteredUsers.map((user, index) => [
        index + 1,
        user.nama || "-",
        user.email || "-",
        formatRole(user.role),
        user.level ? `Level ${user.level}` : "-",
        formatDate(user.createdAt),
      ]),
      startY: 28,
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [255, 165, 0],
        textColor: [0, 0, 0],
        halign: "center",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });

    const fileName = `LaporanPengguna_${getFormattedNow()}.pdf`;
    doc.save(fileName);
    setShowExportModal(false);
  };

  const handleExportExcel = () => {
    // Filter data sesuai pilihan
    const filteredUsers =
      exportOption === "all"
        ? users
        : users.filter(
            (user) =>
              (selectedRoles.length === 0 ||
                selectedRoles.includes(user.role)) &&
              (selectedLevels.length === 0 ||
                selectedLevels.includes(String(user.level)))
          );

    console.log("Data yang akan di-export ke Excel:", filteredUsers);

    // Format data ke array of arrays atau array of objects
    const dataToExport = filteredUsers.map((user, index) => ({
      No: index + 1,
      Nama: user.nama || "-",
      Email: user.email || "-",
      Role: user.role || "-",
      Level: user.level || "-",
      Dibuat: formatDate(user.createdAt),
    }));

    // Buat worksheet dan workbook
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pengguna");

    // Convert ke file dan download
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileName = `dataPengguna${getFormattedNow()}.xlsx`;
    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      fileName
    );

    setShowExportModal(false); // Tutup modal
  };

  const columns = [
    {
      name: "Nama",
      selector: (row) => row.nama,
      sortable: true,
    },

    {
      name: "Email",
      selector: (row) => row.email,
      sortable: true,
    },
    {
      name: "Role",
      cell: (row) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row.id, e.target.value)}
          disabled={updatingId === row.id}
          className="border px-2 py-1 rounded"
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      ),
      sortable: true,
    },
    {
      name: "Level",
      cell: (row) => (
        <select
          value={row.level || 1}
          onChange={(e) => handleLevelChange(row.id, e.target.value)}
          disabled={updatingId === row.id}
          className="border px-2 py-1 rounded"
        >
          {levelOptions.map((level) => (
            <option key={level} value={level}>
              Level {level}
            </option>
          ))}
        </select>
      ),
    },
    {
      name: "Dibuat",
      selector: (row) => row.createdAt?.toDate().toLocaleString("id-ID") || "-",
    },
    {
      name: "Aksi",
      cell: (row) => (
        <div className="flex gap-2 justify-center items-center">
          <button
            onClick={() => handleDelete(row.id)}
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
           <Trash2 className="w-4 h-4" />
          </button>
          <Link to={`/admin/edit-user/${row.id}`}>
            <button className="bg-blue-500 text-white px-2 py-1 rounded">
              <PencilLine className="w-4 h-4" />
            </button>
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      {/* Navbar dan Sidebar */}
      <div className="fixed z-50">
        <AdminNavbar />
        <AdminSidebar />
      </div>
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h2 className="text-lg font-bold mb-4">Export Data Pengguna</h2>

            {/* Pilihan semua atau sebagian */}
            <div className="mb-4">
              <label className="font-semibold">Pilih data:</label>
              <div className="flex gap-4 mt-2">
                <label>
                  <input
                    type="radio"
                    value="filtered"
                    checked={exportOption === "filtered"}
                    onChange={() => setExportOption("filtered")}
                  />
                  <span className="ml-1">Sebagian</span>
                </label>
                <label>
                  <input
                    type="radio"
                    value="all"
                    checked={exportOption === "all"}
                    onChange={() => setExportOption("all")}
                  />
                  <span className="ml-1">Semua</span>
                </label>
              </div>
            </div>

            {/* Filter hanya muncul kalau exportOption === "filtered" */}
            {exportOption === "filtered" && (
              <>
                {/* Filter Role */}
                <div className="mb-4">
                  <label className="font-semibold block mb-2">Role:</label>
                  {["admin", "user-paud", "user-sd", "user-smp"].map((role) => (
                    <label
                      key={role}
                      className="flex items-center space-x-2 mb-1"
                    >
                      <input
                        type="checkbox"
                        value={role}
                        checked={selectedRoles.includes(role)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRoles([...selectedRoles, role]);
                          } else {
                            setSelectedRoles(
                              selectedRoles.filter((r) => r !== role)
                            );
                          }
                        }}
                      />
                      <span>{role.replace("user-", "").toUpperCase()}</span>
                    </label>
                  ))}
                </div>

                {/* Filter Level */}
                <div className="mb-4">
                  <label className="font-semibold block mb-2">Level:</label>
                  {["1", "2"].map((level) => (
                    <label
                      key={level}
                      className="flex items-center space-x-2 mb-1"
                    >
                      <input
                        type="checkbox"
                        value={level}
                        checked={selectedLevels.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLevels([...selectedLevels, level]);
                          } else {
                            setSelectedLevels(
                              selectedLevels.filter((l) => l !== level)
                            );
                          }
                        }}
                      />
                      <span>Level {level}</span>
                    </label>
                  ))}
                </div>

                {/* Filter Bulan & Tahun */}
                <div className="mb-4 flex gap-4">
                  <div>
                    <label className="font-semibold block mb-1">Bulan:</label>
                    <select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      {[
                        "01",
                        "02",
                        "03",
                        "04",
                        "05",
                        "06",
                        "07",
                        "08",
                        "09",
                        "10",
                        "11",
                        "12",
                      ].map((month, i) => (
                        <option key={month} value={month}>
                          {new Date(0, i).toLocaleString("id-ID", {
                            month: "long",
                          })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold block mb-1">Tahun:</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      className="w-full border rounded px-2 py-1"
                    >
                      {Array.from({ length: 5 }).map((_, i) => {
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
              </>
            )}

            {/* Tombol Export */}
            <div className="flex justify-between gap-3">
              <button
                onClick={handleExportPDF}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
              >
                Export PDF
              </button>

              <button
                onClick={handleExportExcel}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
              >
                Export Excel
              </button>

              <button
                onClick={() => setShowExportModal(false)}
                className="bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Konten Utama */}
      <div className="md:ml-[250px] mt-[60px] p-4 md:p-6 w-full">
        <div className="flex flex-col md:flex-row justify-between mb-4 gap-2">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            Daftar User
          </h2>
          <div className="flex justify-between items-center gap-2">
            <button
              onClick={() => setShowExportModal(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-md"
            >
              Export
            </button>
          </div>
        </div>

        {/* Filter dan Search */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div>
            <label className="mr-2 font-medium text-gray-700">
              Filter Role:
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border border-gray-300 px-3 py-1 rounded w-full md:w-auto"
            >
              <option value="semua">Semua</option>
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mr-2 font-medium text-gray-700">
              Cari Email:
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Masukkan email"
              className="border border-gray-300 px-3 py-1 rounded w-full md:w-64"
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={users
            .filter((user) =>
              selectedRole === "semua" ? true : user.role === selectedRole
            )
            .filter((user) =>
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            )}
          progressPending={loading}
          pagination
          highlightOnHover
          responsive
          noDataComponent="Belum ada pengguna"
        />
      </div>
    </div>
  );
};

export default AdminUserListPage;
