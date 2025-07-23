import React, { useState } from 'react';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user-sd');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // 1. Buat user di Firebase Authentication
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // 2. Simpan data role user ke Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        role: role,
        createdAt: new Date()
      });

      alert("Registrasi berhasil!");
      navigate("/login");
    } catch (error) {
      console.error("Registrasi gagal:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Email"
          required
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <input
          type="password"
          placeholder="Password"
          required
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: '10px' }}
        />
        <select
          onChange={(e) => setRole(e.target.value)}
          value={role}
          style={{ display: 'block', width: '100%', marginBottom: '20px' }}
        >
          <option value="admin">Admin</option>
          <option value="user-sd">User SD</option>
          <option value="user-paud">User PAUD</option>
          <option value="user-smp">User SMP</option>
        </select>
        <button type="submit" style={{ width: '100%' }}>
          Daftar
        </button>
      </form>
    </div>
  );
}

export default RegisterPage;
