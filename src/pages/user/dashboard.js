import React, { useEffect, useState } from "react";
import { auth, db } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import LogoutButton from "../../components/LogoutButton";
import Sidebar from "../../components/SideBar";
import Navbar from "../../components/Navbar"; 
import Loading from "../../components/Loading";


const UserDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authUser, setAuthUser] = useState(null);

  // Monitor authentication state
  useEffect(() => {
    console.log("Setting up auth state listener...");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log(
        "Auth state changed:",
        user ? "User logged in" : "User logged out"
      );
      setAuthUser(user);

      if (!user) {
        setLoading(false);
        setError("User not authenticated");
      }
    });

    return () => {
      console.log("Cleaning up auth listener");
      unsubscribe();
    };
  }, []);

  // Fetch user data when auth user changes
  useEffect(() => {
    if (!authUser) {
      console.log("No authenticated user, skipping data fetch");
      return;
    }

    console.log("Fetching user data for:", authUser.uid);
    setLoading(true);
    setError(null);

    const fetchUserData = async () => {
      try {
        console.log("Creating document reference...");
        const userRef = doc(db, "users", authUser.uid);

        console.log("Fetching document...");
        const userSnap = await getDoc(userRef);

        console.log("Document exists:", userSnap.exists());

        if (userSnap.exists()) {
          const data = userSnap.data();
          console.log("User data received:", data);
          setUserData(data);
        } else {
          console.log("User document does not exist in Firestore");
          setError("User profile not found. Please contact administrator.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(`Failed to fetch user data: ${err.message}`);
      } finally {
        console.log("Setting loading to false");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [authUser]);
  // Loading state
  if (loading) {
    return (
      <Loading/>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                window.location.reload();
              }}
              className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Try Again
            </button>
            <LogoutButton />
          </div>
        </div>
      </div>
    );
  }

  // No user data state
  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-gray-400 text-6xl mb-4">👤</div>
          <p className="text-gray-600 text-xl mb-4">
            Data pengguna tidak ditemukan
          </p>
          <LogoutButton />
        </div>
      </div>
    );
  }

  // Main dashboard render
  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed">
        <Navbar />
        <Sidebar />
      </div>
      <div className="flex-1 ml-5 pt-16">
        {/* Main Content */}
        <div className="flex-1 lg:ml-64">
          <div className="p-6 lg:p-10">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
              <div className="flex justify-center items-center mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Selamat datang di SARPRAS, <span className="text-orange-500 text-3xl uppercase font-bold">{userData.nama || "Pengguna Tanpa Nama"}</span>
                  </h1>
                </div>
              </div>

              {/* User Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-orange-400 to-orange-500 p-6 rounded-lg text-white">
                  <h3 className="text-lg font-semibold mb-2">Role</h3>
                  <p className="text-2xl justify-center items-center text-center uppercase font-bold">{userData.role}</p>
                </div>

                {/* Level Card */}
                <div className="bg-gradient-to-r from-blue-400 to-blue-500 p-6 rounded-lg text-white">
                  <h3 className="text-lg font-semibold mb-2">Level</h3>
                  <p className="text-3xl justify-center items-center text-center font-bold">{userData.level}</p>
                </div>

                {/* Profile Page Card */}
                <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-6 rounded-lg text-white flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Profil Saya</h3>
                  </div>
                  <button
                    onClick={() => navigate("/user/profil")} // Pastikan rute '/profil' tersedia
                    className="bg-white text-gray-900 font-semibold py-2 px-4 rounded hover:bg-gray-200 transition"
                  >
                    Lihat Profil
                  </button>
                </div>
              </div>
            </div>

            {/* Data Management Section */}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
