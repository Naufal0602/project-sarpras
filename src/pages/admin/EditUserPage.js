// src/pages/EditUserPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

const EditUserPage = () => {
  const { id } = useParams(); // id = UID user
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const fetchUser = async () => {
      const docRef = doc(db, "users", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmail(data.email);
        setRole(data.role);
        setLevel(data.level || 1);
      }
    };
    fetchUser();
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const userRef = doc(db, "users", id);
      await updateDoc(userRef, {
        role,
        level: parseInt(level, 10),
      });
      alert("Data pengguna berhasil diperbarui");
      navigate("/admin/users");
    } catch (err) {
      alert("Gagal memperbarui pengguna: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Edit Pengguna</h2>
      <form onSubmit={handleUpdate}>
        <div style={{ marginBottom: "10px" }}>
          <strong>Email:</strong><br />
          <input value={email} disabled style={{ width: '100%' }} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Role:</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} style={{ width: '100%' }}>
            <option value="admin">Admin</option>
            <option value="user-sd">User SD</option>
            <option value="user-paud">User PAUD</option>
            <option value="user-smp">User SMP</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Level Akses:</label>
          <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ width: '100%' }}>
            <option value="1">Level 1 - Lihat saja</option>
            <option value="2">Level 2 - CRUD</option>
          </select>
        </div>

        <button type="submit" style={{ width: '100%' }}>Simpan Perubahan</button>
      </form>
    </div>
  );
};

export default EditUserPage;
