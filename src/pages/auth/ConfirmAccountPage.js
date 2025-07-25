import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { auth, db } from "../../services/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import ReCAPTCHA from "react-google-recaptcha";

const ConfirmAccountPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = params.get("id");
  const [status, setStatus] = useState("idle");
  const [captchaPassed, setCaptchaPassed] = useState(false);
  const hasRunRef = useRef(false);
  const [userData, setUserData] = useState(null);

  // Ganti dengan site key reCAPTCHA milikmu
  const RECAPTCHA_SITE_KEY = "6LdzWI4rAAAAAIc7va9odbH7Op6gsJ2ZvGMYsEQf";

  useEffect(() => {
    const fetchPendingUser = async () => {
      try {
        if (!id) {
          setStatus("not_found");
          return;
        }

        const docRef = doc(db, "pending_users", id);
        const snapshot = await getDoc(docRef);

        if (!snapshot.exists()) {
          setStatus("not_found");
          return;
        }

        const data = snapshot.data();
        const now = new Date();
        const expiredAt = data.expiresAt?.toDate?.(); // pastikan ini Timestamp dari Firestore
        if (expiredAt && now > expiredAt) {
          setStatus("expired");
          return;
        }

        if (data.isActivated) {
          setStatus("already_activated");
          return;
        }

        setUserData({ ...data, docRef });
        setStatus("waiting_captcha");
      } catch (error) {
        console.error("Error:", error);
        setStatus("error");
      }
    };

    fetchPendingUser();
  }, [id]);

  const handleActivate = async () => {
    if (hasRunRef.current || !userData) return;
    hasRunRef.current = true;
    setStatus("loading");

    try {
      let user;
      try {
        const res = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        );
        user = res.user;
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          setStatus("already_activated");
          return;
        } else {
          throw error;
        }
      }

      await setDoc(doc(db, "users", user.uid), {
        nama: userData.nama,
        email: userData.email,
        role: userData.role,
        level: userData.level,
        createdAt: new Date(),
      });

      await updateDoc(userData.docRef, { isActivated: true });
      await deleteDoc(userData.docRef);

      setStatus("success");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error("Error during activation:", err);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-[#f0f4f8]">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg jusitfy-center">
      {status === "idle" && <p>Memuat data aktivasi...</p>}
      {status === "waiting_captcha" && (
        <>
          <p className="mb-4">
            Silakan verifikasi CAPTCHA untuk aktivasi akun:
          </p>
          <div className="w-full flex-col flex justify-center text-center items-center">
          <ReCAPTCHA
            sitekey={RECAPTCHA_SITE_KEY}
            onChange={(value) => {
              if (value) {
                setCaptchaPassed(true);
              }
            }}
          />
          <button
            onClick={handleActivate}
            disabled={!captchaPassed}
            className={`mt-4 px-6 py-2 rounded-lg justify-center text-white font-semibold ${
              captchaPassed
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            Aktivasi Akun
          </button>
          </div>
        </>
      )}
      {status === "loading" && <p>Memproses aktivasi akun...</p>}
      {status === "success" && (
        <p>Akun berhasil diaktivasi! Mengarahkan ke login...</p>
      )}
      {status === "error" && <p>Terjadi kesalahan saat aktivasi akun.</p>}
      {status === "expired" && (
        <p>
          Link aktivasi sudah kedaluwarsa. Silakan minta pendaftaran ulang dari
          admin.
        </p>
      )}

      {status === "not_found" && (
        <p>Data aktivasi tidak ditemukan atau sudah kedaluwarsa.</p>
      )}
      {status === "already_activated" && (
        <p>Akun sudah diaktivasi sebelumnya atau email sudah digunakan.</p>
      )}
    </div>
    </div>
  );
};

export default ConfirmAccountPage;
