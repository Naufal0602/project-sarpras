// src/pages/UserDashboard.jsx
import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, getDoc } from "firebase/firestore";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }

      setLoading(false);
    };

    fetchUserData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>Data tidak ditemukan.</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Selamat datang, {userData.email}</h2>
      <p>Role: {userData.role}</p>
      <p>Level: {userData.level}</p>

      <div style={{ marginTop: "30px" }}>
        <h3>Data Barang:</h3>
        <ul>
          <li>Barang 1</li>
          <li>Barang 2</li>
        </ul>

        {userData.level === 2 && (
          <>
            <button>Tambah Barang</button>
            <button>Edit Barang</button>
            <button>Hapus Barang</button>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
