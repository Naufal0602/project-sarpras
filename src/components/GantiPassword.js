import React, { useState } from "react";
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Loading from "../components/Loading";
import { useNavigate } from "react-router-dom";
import SuccessFullScreen from "../components/Success";

const GantiPassword = () => {
  const [passwordLama, setPasswordLama] = useState("");
  const [passwordBaru, setPasswordBaru] = useState("");
  const [konfirmasiPassword, setKonfirmasiPassword] = useState("");
  const [pesan, setPesan] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleGantiPassword = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setPesan("User tidak terautentikasi!");
      return;
    }

    if (passwordBaru !== konfirmasiPassword) {
      setPesan("Password baru dan konfirmasi tidak sama!");
      return;
    }

    try {
      setLoading(true);

      // Re-authenticate dulu dengan password lama
      const credential = EmailAuthProvider.credential(user.email, passwordLama);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, passwordBaru);
      setSuccessToast(true);
      setPasswordLama("");
      setPasswordBaru("");
      setKonfirmasiPassword("");
    } catch (error) {
      console.error(error);
      if (error.code === "auth/wrong-password") {
        setPesan("❌ Password lama salah.");
      } else if (error.code === "auth/requires-recent-login") {
        setPesan("⚠️ Harap login ulang sebelum mengubah password.");
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
      <>
           <SuccessFullScreen
              className="fixed inset-0 flex  z-50"
              show={successToast}
              message="Password berhasil di ubah!"
              onDone={() => navigate("/login")}
            />
     
        <div className="p-6 lg:p-10 w-full max-w-md">
          <div className="bg-white shadow-2xl p-8 rounded-xl w-full flex flex-col gap-5">
            <h3 className="font-bold text-2xl text-center text-gray-700 mb-4">Ubah Password</h3>

            {/* Input password lama */}
            <input
              type="password"
              placeholder="Password lama"
              value={passwordLama}
              onChange={(e) => setPasswordLama(e.target.value)}
              className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
            />

            {/* Input password baru */}
            <input
              type="password"
              placeholder="Password baru"
              value={passwordBaru}
              onChange={(e) => setPasswordBaru(e.target.value)}
              className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
            />

            {/* Konfirmasi password */}
            <input
              type="password"
              placeholder="Konfirmasi password baru"
              value={konfirmasiPassword}
              onChange={(e) => setKonfirmasiPassword(e.target.value)}
              className="border-2 border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
            />

            {pesan && <p className="text-center text-sm text-red-500 font-medium">{pesan}</p>}

            <div className="flex md:justify-between flex-col md:flex-row w-full gap-3 mt-4">
              <button
                className="border-2 border-orange-400 bg-white text-orange-500 hover:bg-orange-50 px-6 py-2 rounded-lg transition"
                onClick={() => navigate(-1)}
              >
                Kembali
              </button>
              <button
                className="border-2 border-orange-400 bg-orange-500 text-white hover:bg-orange-600 px-6 py-2 rounded-lg transition"
                onClick={handleGantiPassword}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
 </>
  );
}

export default GantiPassword;