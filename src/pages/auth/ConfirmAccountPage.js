import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
// ... (kode import tetap sama)

const ConfirmAccountPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");

  const [status, setStatus] = useState("idle");
  const [userData, setUserData] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);

  useEffect(() => {
    const fetchUser = async () => {
      if (!id) return setStatus("not_found");

      try {
        const ref = doc(db, "pending_users", id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) return setStatus("not_found");

        const data = snapshot.data();
        const expiredAt = data.expiresAt?.toDate?.();
        const now = new Date();

        if (expiredAt && now > expiredAt) {
          return setStatus("expired");
        }

        if (data.isActivated) {
          return setStatus("already_activated");
        }

        setUserData({ ...data, docRef: ref });
        setSelectedLevel(data.level || 1);
        setStatus("ready");
      } catch (err) {
        console.error("Gagal memuat data:", err);
        setStatus("error");
      }
    };

    fetchUser();
  }, [id]);

  const handleApprove = async () => {
    if (!userData) return;
    setStatus("loading");

    try {
      const res = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      const user = res.user;

      await setDoc(doc(db, "users", user.uid), {
        nama: userData.nama,
        email: userData.email,
        role: userData.role,
        level: selectedLevel,
        createdAt: new Date(),
      });

      await updateDoc(userData.docRef, { isActivated: true });
      await deleteDoc(userData.docRef);

      setStatus("success");
    } catch (err) {
      console.error("Aktivasi gagal:", err);
      if (err.code === "auth/email-already-in-use") {
        setStatus("already_activated");
      } else {
        setStatus("error");
      }
    }
  };

  const handleReject = async () => {
    if (!userData) return;
    setStatus("loading");

    try {
      await deleteDoc(userData.docRef);
      setStatus("rejected");
    } catch (err) {
      console.error("Penolakan gagal:", err);
      setStatus("error");
    }
  };

  const redirectToDashboard = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Konfirmasi Akun</h2>

        {status === "idle" && <p>Memuat data akun...</p>}

        {status === "ready" && (
          <>
            <div className="text-left mb-4">
              <p><strong>Nama:</strong> {userData.nama}</p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Role:</strong> {userData.role}</p>
            </div>

            <label className="block text-sm font-medium text-left mb-1 text-gray-700">
              Level Akses:
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value))}
              className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value={1}>Level 1 - Lihat Saja</option>
              <option value={2}>Level 2 - CRUD</option>
            </select>

            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                ✅ Aktifkan Akun
              </button>
              <button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold"
              >
                ❌ Tolak Akun
              </button>
            </div>
          </>
        )}

        {status === "loading" && <p>Memproses data...</p>}

        {(status === "success" || status === "rejected") && (
          <>
            <p
              className={`font-semibold ${
                status === "success" ? "text-green-600" : "text-red-600"
              }`}
            >
              {status === "success"
                ? "Akun berhasil diaktifkan!"
                : "Akun telah ditolak dan dihapus."}
            </p>
            <button
              onClick={redirectToDashboard}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              🔁 Pergi ke Dashboard
            </button>
          </>
        )}

        {status === "already_activated" && (
          <p className="text-blue-600">
            Akun sudah diaktivasi sebelumnya atau email sudah digunakan.
          </p>
        )}
        {status === "expired" && (
          <p className="text-yellow-600">
            Link aktivasi sudah kadaluarsa. Silakan minta pengguna daftar ulang.
          </p>
        )}
        {status === "not_found" && (
          <p className="text-red-500">
            Data tidak ditemukan. Link mungkin salah atau sudah tidak berlaku.
          </p>
        )}
        {status === "error" && (
          <p className="text-red-500">
            Terjadi kesalahan. Silakan coba lagi atau hubungi developer.
          </p>
        )}
      </div>
    </div>
  );
};

export default ConfirmAccountPage;
