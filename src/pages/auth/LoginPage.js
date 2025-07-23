import React, { useState } from "react";
import { auth, db } from "../../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
        const role = userData.role;

        // Simpan data user ke localStorage
        localStorage.setItem("user", JSON.stringify(userData));

        // Redirect ke halaman sesuai role
        switch (role) {
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
    <div style={{ padding: "40px", maxWidth: "500px", margin: "auto" }}>
      <h2>Login Akun</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
