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

const roleOptions = ["admin", "user-sd", "user-paud", "user-smp"];
const levelOptions = [1, 2];

const AdminUserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);

      const userList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userList);
      setLoading(false);
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { role: newRole });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      alert("Role berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal mengubah role:", error);
      alert("Terjadi kesalahan saat mengubah role.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleLevelChange = async (userId, newLevel) => {
    try {
      setUpdatingId(userId);
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { level: parseInt(newLevel) });

      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, level: parseInt(newLevel) } : user
        )
      );
      alert("Level berhasil diperbarui.");
    } catch (error) {
      console.error("Gagal mengubah level:", error);
      alert("Terjadi kesalahan saat mengubah level.");
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
      alert("User berhasil dihapus dari database.");
    } catch (error) {
      console.error("Gagal menghapus user:", error);
      alert("Terjadi kesalahan saat menghapus user.");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Daftar User</h2>
      
      <Link to="/admin/users/register">
      <button style={{ marginBottom: "20px" }}>+ Tambah Pengguna</button>
    </Link>

      {loading ? (
        <p>Memuat data...</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Level</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={updatingId === user.id}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <select
                    value={user.level || 1}
                    onChange={(e) => handleLevelChange(user.id, e.target.value)}
                    disabled={updatingId === user.id}
                  >
                    {levelOptions.map((level) => (
                      <option key={level} value={level}>
                        Level {level}
                      </option>
                    ))}
                  </select>
                </td>
                <td>{user.createdAt?.toDate().toLocaleString() || "-"}</td>
                <td>
                  <button
                    onClick={() => handleDelete(user.id)}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "4px 10px",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Hapus
                  </button>
                  <Link to={`/admin/edit-user/${user.id}`}>
                    <button>Edit</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserListPage;
