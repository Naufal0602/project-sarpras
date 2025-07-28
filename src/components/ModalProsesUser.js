import React, { useState } from "react";
import { auth, db } from "../services/firebase";
import {
  createUserWithEmailAndPassword,
  deleteUser,
} from "firebase/auth";
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import emailjs from "@emailjs/browser";

const ModalProsesUser = ({ user, onClose }) => {
  const [level, setLevel] = useState(1); // default level 1

  const sendEmail = async (status) => {
    const templateParams = {
      to_email: user.email,
      to_name: user.nama,
      status,
    };

    try {
      await emailjs.send(
        "service_7ub17uc",
        "template_zu6ilko",
        templateParams,
        "TNa873KoLNwnqtnCa"
      );
      console.log("Email terkirim");
    } catch (error) {
      console.error("Gagal kirim email:", error);
    }
  };

  const handleTerima = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        user.email,
        user.password
      );

      const uid = userCredential.user.uid;

      await setDoc(doc(db, "users", uid), {
        nama: user.nama,
        email: user.email,
        role: user.role || "user-sd",
        level: level,
        createdAt: serverTimestamp(),
      });

      await deleteDoc(doc(db, "pending_users", user.id));

      await sendEmail("diterima");

      onClose();
    } catch (error) {
      console.error("Gagal memproses user:", error);
    }
  };

  const handleTolak = async () => {
    try {
      await deleteDoc(doc(db, "pending_users", user.id));
      await sendEmail("ditolak");
      onClose();
    } catch (error) {
      console.error("Gagal menolak user:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Konfirmasi Akun</h2>

        <p className="mb-1"><strong>Nama:</strong> {user.nama}</p>
        <p className="mb-1"><strong>Email:</strong> {user.email}</p>
        <p className="mb-4"><strong>Role:</strong> {user.role || "-"}</p>

        {/* Pilih Akses Level */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-1 text-gray-700">Pilih Level Akses:</label>
          <select
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring focus:ring-orange-400"
          >
            <option value={1}>Level 1 - Hanya Lihat</option>
            <option value={2}>Level 2 - CRUD (Tambah/Edit/Hapus)</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={handleTolak}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
          >
            Tolak
          </button>
          <button
            onClick={handleTerima}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            Terima
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md"
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalProsesUser;
