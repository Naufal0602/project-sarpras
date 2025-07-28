import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../services/firebase";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    setMessage(""); // reset pesan dulu

    console.log("[INFO] Memulai proses reset password untuk:", email);

    if (!email) {
      setMessage("⚠️ Email wajib diisi!");
      console.warn("[WARN] Email kosong");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      console.log("[SUCCESS] Email reset terkirim ke:", email);
      setMessage("✅ Link reset password telah dikirim. Cek email kamu.");
    } catch (err) {
      console.error("[ERROR] Gagal kirim reset password:", err.code, err.message);
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
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Lupa Password</h2>

      <input
        type="email"
        placeholder="Masukkan email kamu"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 w-full rounded mb-3"
      />

      <button
        onClick={handleReset}
        disabled={loading}
        className={`w-full py-2 rounded font-semibold ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {loading ? "Mengirim..." : "Kirim Link Reset"}
      </button>

      {message && <p className="mt-4 text-center text-sm">{message}</p>}
    </div>
  );
};

export default ForgotPassword;
