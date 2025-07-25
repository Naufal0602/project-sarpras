import React, { useState, useEffect } from "react";
import { auth, db } from "../../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      switch (user.role) {
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "user-sd":
          navigate("/sd/dashboard");
          break;
        case "user-paud":
          navigate("/paud/dashboard");
          break;
        case "user-smp":
          navigate("/smp/dashboard");
          break;
        default:
          console.warn("Role tidak dikenali");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        localStorage.setItem("user", JSON.stringify(userData));

        switch (userData.role) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "user-sd":
            navigate("/sd/dashboard");
            break;
          case "user-paud":
            navigate("/paud/dashboard");
            break;
          case "user-smp":
            navigate("/smp/dashboard");
            break;
          default:
            alert("Role tidak dikenali");
        }
      } else {
        alert("Data user tidak ditemukan di Firestore.");
      }
    } catch (error) {
      alert("Login gagal: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute w-[500px] h-[500px] bg-blue-300 rounded-[60%] top-[-100px] left-[-100px] opacity-30"></div>
      <div className="absolute w-[400px] h-[400px] bg-blue-400 rounded-[50%] bottom-[-100px] right-[-100px] opacity-40"></div>

      {/* Login Card */}
      <div className="bg-white shadow-2xl rounded-3xl p-10 w-full max-w-sm z-10 text-center " style={{ margin: '25px' }}>
        <h1 className="text-3xl font-bold mb-2">Login</h1>
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
            <label className="block text-sm font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <span className="absolute right-3 top-3 text-gray-400 cursor-pointer">
                👁️
              </span>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition duration-300"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
