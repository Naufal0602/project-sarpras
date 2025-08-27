import React, { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";
import SuccessFullScreen from "../../components/Success";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Pesan, setPesan] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [redirectRole, setRedirectRole] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else if (
        user.role === "user-sd" ||
        user.role === "user-paud" ||
        user.role === "user-smp"
      ) {
        navigate("/user/dashboard");
      } else {
        console.warn("Role tidak dikenali");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        localStorage.setItem("user", JSON.stringify(userData));

        // 🔥 simpan role buat redirect
        setRedirectRole(userData.role);
        setSuccessToast(true);
      } else {
        setPesan("User tidak ditemukan.");
      }
    } catch (error) {
      console.log(error);
      setPesan("Login gagal. Periksa email dan password Anda.");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 Fungsi untuk redirect setelah success
  const handleSuccessDone = () => {
    setSuccessToast(false);
    if (!redirectRole) return;

    switch (redirectRole) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "user-sd":
      case "user-paud":
      case "user-smp":
        navigate("/user/dashboard");
        break;
      default:
        console.warn("Role tidak dikenali:", redirectRole);
        navigate("/");
    }
  };
  return (
    <>
      {loading && <Loading text="Memproses..." />}
      {successToast && (
        <SuccessFullScreen
          show={successToast}
          message="Login berhasil!"
          onDone={handleSuccessDone} // 🔥 arahkan setelah sukses
        />
      )}
      <div className="min-h-screen bg-[url('/bg.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center relative overflow-hidden">
        {/* Login Card */}
        <div
          className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-sm z-10 text-center "
          style={{ margin: "25px" }}
        >
          <h1 className="text-3xl font-bold mb-2 text-orange-600">Login</h1>
          <p className="text-sm text-gray-500 mb-8">Selamat datang kembali!</p>
          <form onSubmit={handleLogin} className="space-y-5 text-left">
            <div>
              <label className="block text-sm font-semibold mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <span className="absolute right-3 top-3 text-gray-400 cursor-pointer"></span>
              </div>
              <div className="flex flex-col items-center mt-4 w-full">
                <Link
                  to="/lupa-password"
                  className="text-sm text-orange-600 hover:underline"
                >
                  Lupa Password?
                </Link>
                <Link
                  to="/register"
                  className="text-sm text-orange-600 hover:underline"
                >
                  Belum Punya Akun? Daftar sekarang
                </Link>
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-orange-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-300"
            >
              Login
            </button>
            {Pesan && <div className="text-red-500 text-sm mt-2">{Pesan}</div>}
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
