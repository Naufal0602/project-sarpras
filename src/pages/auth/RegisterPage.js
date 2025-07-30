import React, { useState } from "react";
import { auth, db } from "../../services/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import emailjs from "@emailjs/browser";
import ReCAPTCHA from "react-google-recaptcha";

function RegisterPage() {
  const [nama, setNama] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user-sd");
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Password dan konfirmasi password tidak sama.");
      return;
    }

    if (!captchaVerified) {
      alert("Silakan centang captcha terlebih dahulu.");
      return;
    }

    const tempId = crypto.randomUUID();

    try {
      await setDoc(doc(db, "pending_users", tempId), {
        nama,
        email,
        password,
        role,
        status: "pending",
        createdAt: new Date(),
        isActivated: false,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
      });

      await emailjs.send(
        "service_7ub17uc",
        "template_cdbr3iq",
        {
          to_email: email,
          email: email,
          nama: nama,
          role: role,
          confirmation_url: `http://localhost:3000/konfirmasi-akun?id=${tempId}`,
        },
        "TNa873KoLNwnqtnCa"
      );

      alert("Email konfirmasi telah dikirim ke admin.");
      navigate("/login");
    } catch (error) {
      console.error("Gagal mengirim email:", error);
      alert("Error: " + error.message);
    }
  };

  return (
      <div className="bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat p-20 w-full h-full items-center justify-center">
        <div className="bg-gray-50 max-w-md mx-auto bg-white rounded-xl p-4 shadow-lg overflow-hidden mt-4">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-center rounded-lg">
            <h2 className="text-xl md:text-2xl font-bold text-white">Register Pengguna Baru</h2>
            <p className="text-orange-100 mt-2 text-sm">Tambahkan pengguna ke sistem</p>
          </div>

          <div className="px-6 py-6">
            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pengguna</label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan Nama"
                  onChange={(e) => setNama(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Masukkan email"
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan Password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password</label>
                <input
                  type="password"
                  required
                  placeholder="Ulangi Password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Role Pengguna</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-orange-500"
                >
                  <option value="user-sd">User SD</option>
                  <option value="user-paud">User PAUD</option>
                  <option value="user-smp">User SMP</option>
                </select>
              </div>

              {/* CAPTCHA */}
              <div className="flex justify-center">
                <ReCAPTCHA
                  sitekey="6LfCK5QrAAAAAEuZQkpaGUZoVp8veG5g3mf7amDF" // Ganti dengan key milikmu
                  onChange={() => setCaptchaVerified(true)}
                  onExpired={() => setCaptchaVerified(false)}
                />
              </div>

              <button
                type="submit"
                disabled={!captchaVerified}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 shadow-lg ${
                  captchaVerified
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
              >
                Daftar
              </button>
            </form>
          </div>
        </div>
       </div> 
  );
}

export default RegisterPage;
