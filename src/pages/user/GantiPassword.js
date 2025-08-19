import React, { useState } from "react";
import { getAuth, updatePassword } from "firebase/auth";
import Sidebar from "../../components/template/SideBar";
import Navbar from "../../components/template/Navbar";
import Loading from "../../components/Loading";

export default function UbahPassword() {
  const [passwordBaru, setPasswordBaru] = useState("");
  const [pesan, setPesan] = useState("");
  const [loading, setLoading] = useState(false);
    
  const handleGantiPassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setPesan("User tidak terautentikasi!");
      return;
    }

    try {
        setLoading(true);
      await updatePassword(user, passwordBaru);
      setPesan("Password berhasil diubah!");
      setPasswordBaru("");
    } catch (error) {
      // Jika sesi login sudah lama, Firebase minta re-login
      if (error.code === "auth/requires-recent-login") {
        console.log(error);
        setPesan("Harap login ulang sebelum mengubah password.");
      } else {
        setPesan("Gagal mengubah password: " + error.message);
      } 
    } finally {
        setLoading(false);
    }
  };

  if (loading) {
    return <Loading text="Memuat..." />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed">
        <Navbar />
        <Sidebar />
      </div>
      <div className="flex-1 ml-5 pt-16">
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-10">
            <div  className="bg-white shadow-lg p-6 rounded-lg w-full justify-center max-w-xl">
              <h3>Ubah Password</h3>
              <input
                type="password"
                placeholder="Password baru"
                value={passwordBaru}
                onChange={(e) => setPasswordBaru(e.target.value)}
              />
              <button onClick={handleGantiPassword}>Simpan</button>
              {pesan && <p>{pesan}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
