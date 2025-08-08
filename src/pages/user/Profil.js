import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import LogoutButton from "../../components/LogoutButton";
import Sidebar from "../../components/template/SideBar";
import Navbar from "../../components/template/Navbar";
import { Link } from "react-router-dom";
import Loading from "../../components/Loading";

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
    return <Loading />;
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
      <div className="fixed">
        <Navbar />
        <Sidebar />
      </div>
      <div className="flex-1 ml-5 pt-16">
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-10">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Profil Pengguna
              </h1>
              <div className="space-y-4">
                <p>
                  <span className="font-semibold">Nama:</span> {userData.nama}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {authUser.email}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {userData.role}
                </p>
                <p>
                  <span className="font-semibold">Level:</span> {userData.level}
                </p>
              </div>
              <div className="mt-6 justify-end flex space-x-4">
                <button
                  onClick={() => navigate(-1)}
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
                >
                  Kembali
                </button>
                <Link
                  to={`/user/edit-profile/${authUser.uid}`}
                  className="ml-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Edit Profil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
