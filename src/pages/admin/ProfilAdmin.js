import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import LogoutButton from "../../components/LogoutButton";
import AdminSidebar from "../../components/template/AdminSideBar";
import AdminNavbar from "../../components/template/AdminNavBar";
import Loading from "../../components/Loading";
import { Link } from "react-router-dom";

const UserProfile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      if (!user) {
        setLoading(false);
        setError("User not authenticated");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const fetchUserData = async () => {
      try {
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data());
        } else {
          setError("User profile not found.");
        }
      } catch (err) {
        setError(`Failed to fetch user data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);

  if (loading) {
    return <Loading text="Loading..." />;
  }
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Terjadi Kesalahan
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Coba Lagi
            </button>
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed z-10 md:relative">
        <AdminNavbar />
        <AdminSidebar />
      </div>

      <div className="flex-1 lg:ml-[0px] md:ml-[250px] px-4 md:px-10 py-20">
        <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-xl p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Profil Pengguna
          </h1>

          <div className="grid gap-4 text-gray-700 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Nama</span>
              <span>{userData?.nama || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Email</span>
              <span>{authUser?.email || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Role</span>
              <span>{userData?.role || "-"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="font-medium">Level</span>
              <span>{userData?.level || "-"}</span>
            </div>
          </div>

          <div className="mt-8 flex md:flex-col flex-col justify-end gap-4">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Kembali
            </button>
            <button
              onClick={() => navigate(`/admin/ProfilAdmin/edit/${authUser.id}`)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
            >
              Edit Profil
            </button>
            <Link
              to="/admin/ganti-password"
              className="bg-red-500 hover:bg-red-600 text-white text-center px-4 py-2 rounded-lg"
            >
              Ganti Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
