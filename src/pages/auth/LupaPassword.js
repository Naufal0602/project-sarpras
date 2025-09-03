import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    setLoading(true);
    setMessage(""); // reset pesan dulu

    if (!email) {
      setMessage("⚠️ Email wajib diisi!");
      console.warn("[WARN] Email kosong");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Link reset password telah dikirim. Cek email kamu.");
    } catch (err) {
      console.error(
        "[ERROR] Gagal kirim reset password:",
        err.code,
        err.message
      );
      if (err.code === "auth/user-not-found") {
        setMessage("❌ Email tidak terdaftar.");
      } else if (err.code === "auth/invalid-email") {
        setMessage("❌ Format email tidak valid.");
      } else {
        setMessage("❌ Terjadi kesalahan: " + err.message);
      }
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center relative overflow-hidden">
      <div className=" md:max-w-md md:mx-auto w-full mx-4 mt-20 p-6 bg-gray-50 rounded shadow-xl">
        <h2 className="text-xl font-bold mb-6 text-center text-orange-600">
          Lupa Password
        </h2>

        <input
          type="email"
          placeholder="Masukkan email kamu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 w-full rounded mb-3"
        />

        <div className="flex-col flex gap-4 justify-between mb-4">
      

          <button
            onClick={handleReset}
            disabled={loading}
            className={`w-full py-2 rounded font-semibold ${
              loading ? "bg-gray-400" : "bg-orange-600 hover:bg-orange-700"
            } text-white`}
          >
            {loading ? "Mengirim..." : "Kirim Link Reset"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Kembali ke halaman login
          </button>

        </div>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default ForgotPassword;
